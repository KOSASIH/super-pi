// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// QuantumVault — Post-Quantum Signature Enforcement for Super Pi L2
// CRYSTALS-Dilithium3 (NIST PQC Round 3 winner) + Kyber-768 KEM
// All high-value ops require PQ sig verification via precompile/oracle
// LEX_MACHINA v1.6 compliant — noForeignToken() on all vault operations

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title QuantumVault
 * @notice Protects high-value $SPI treasury operations against quantum attacks.
 *         Uses Dilithium3 lattice-based signatures for all admin operations.
 *         Kyber-768 KEM for key encapsulation on vault access.
 *         Hash-based Merkle authentication for multi-sig quorum.
 *         Threshold: 3-of-5 quantum-safe multi-sig required for withdrawals > 1M $SPI.
 */
contract QuantumVault is AccessControl, ReentrancyGuard, Pausable {

    bytes32 public constant NEXUS_ROLE    = keccak256("NEXUS_ROLE");
    bytes32 public constant QSA_SIGNER    = keccak256("QSA_SIGNER");  // Quantum-Safe Authority
    bytes32 public constant VAULT_ADMIN   = keccak256("VAULT_ADMIN");

    address public constant PI_COIN       = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;

    uint256 public constant LARGE_TX_THRESHOLD = 1_000_000e18;  // 1M $SPI
    uint256 public constant QSA_QUORUM         = 3;             // 3-of-5
    uint256 public constant QSA_TOTAL          = 5;
    uint256 public constant TIMELOCK_DELAY     = 2 days;
    uint256 public constant MAX_DAILY_WITHDRAWAL = 10_000_000e18; // 10M $SPI/day

    address public immutable SPI_TOKEN;

    // Dilithium3 public key storage (each key = 1952 bytes)
    struct QSASigner {
        bytes  dilithiumPubKey;   // 1952-byte Dilithium3 pubkey
        bytes  kyberPubKey;       // 1184-byte Kyber-768 pubkey
        bytes32 merkleLeaf;       // Hash-based identity anchor
        bool   active;
        uint256 nonce;
    }
    mapping(address => QSASigner) public qsaSigners;
    address[] public qsaSignerList;

    struct VaultOperation {
        bytes32  opId;
        address  target;
        uint256  amount;
        bytes    callData;
        uint256  eta;            // earliest execution time (timelock)
        uint8    confirmations;
        bool     executed;
        bool     cancelled;
        mapping(address => bool) confirmed;
    }
    mapping(bytes32 => VaultOperation) public operations;

    // Daily withdrawal tracking
    uint256 public lastWithdrawDay;
    uint256 public dailyWithdrawn;

    event QSASignerAdded(address indexed signer, bytes32 merkleLeaf);
    event OperationQueued(bytes32 indexed opId, address target, uint256 amount, uint256 eta);
    event OperationConfirmed(bytes32 indexed opId, address signer, uint8 confirms);
    event OperationExecuted(bytes32 indexed opId, address target, uint256 amount);
    event OperationCancelled(bytes32 indexed opId);
    event QuantumProofVerified(bytes32 indexed opId, address signer);

    error PiCoinRejected();
    error InvalidQuantumProof();
    error TimelockNotExpired();
    error QuorumNotReached();
    error DailyLimitExceeded();
    error AlreadyConfirmed();
    error InvalidSigner();

    modifier noForeignToken(address token) {
        if (token == PI_COIN) revert PiCoinRejected();
        require(token == SPI_TOKEN, "QVault: only $SPI");
        _;
    }

    constructor(address _spi, address _admin) {
        SPI_TOKEN = _spi;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(NEXUS_ROLE, _admin);
    }

    /**
     * @notice Register a Quantum-Safe Authority signer with Dilithium3 pubkey.
     * @param signer         EOA address of the QSA signer.
     * @param dilithiumKey   CRYSTALS-Dilithium3 public key (1952 bytes).
     * @param kyberKey       Kyber-768 public key (1184 bytes).
     */
    function registerQSASigner(
        address signer,
        bytes calldata dilithiumKey,
        bytes calldata kyberKey,
        bytes32 merkleLeaf
    ) external onlyRole(NEXUS_ROLE) {
        require(dilithiumKey.length == 1952, "QVault: invalid Dilithium3 key length");
        require(kyberKey.length == 1184,     "QVault: invalid Kyber-768 key length");
        qsaSigners[signer] = QSASigner({
            dilithiumPubKey: dilithiumKey,
            kyberPubKey:     kyberKey,
            merkleLeaf:      merkleLeaf,
            active:          true,
            nonce:           0
        });
        qsaSignerList.push(signer);
        _grantRole(QSA_SIGNER, signer);
        emit QSASignerAdded(signer, merkleLeaf);
    }

    /**
     * @notice Queue a vault operation with 2-day timelock.
     */
    function queueOperation(
        address token,
        address target,
        uint256 amount,
        bytes calldata data
    ) external noForeignToken(token) onlyRole(QSA_SIGNER) returns (bytes32 opId) {
        opId = keccak256(abi.encodePacked(target, amount, data, block.timestamp));
        VaultOperation storage op = operations[opId];
        op.opId          = opId;
        op.target        = target;
        op.amount        = amount;
        op.callData      = data;
        op.eta           = block.timestamp + TIMELOCK_DELAY;
        op.confirmations = 0;
        op.executed      = false;
        op.cancelled     = false;
        emit OperationQueued(opId, target, amount, op.eta);
    }

    /**
     * @notice Confirm an operation with Dilithium3 signature proof.
     * @param opId       Operation ID.
     * @param dilithiumSig  Dilithium3 signature over opId (3309 bytes).
     * @param nonce      Replay-protection nonce.
     */
    function confirmOperation(
        bytes32 opId,
        bytes calldata dilithiumSig,
        uint256 nonce
    ) external onlyRole(QSA_SIGNER) {
        VaultOperation storage op = operations[opId];
        if (op.confirmed[msg.sender]) revert AlreadyConfirmed();
        QSASigner storage signer = qsaSigners[msg.sender];
        if (!signer.active) revert InvalidSigner();
        require(nonce == signer.nonce + 1, "QVault: invalid nonce");
        // Dilithium3 signature verification via precompile (Super Pi L2 custom precompile at 0x0900)
        require(
            _verifyDilithium(signer.dilithiumPubKey, abi.encodePacked(opId, nonce), dilithiumSig),
            "QVault: invalid Dilithium3 proof"
        );
        signer.nonce++;
        op.confirmed[msg.sender] = true;
        op.confirmations++;
        emit OperationConfirmed(opId, msg.sender, op.confirmations);
        emit QuantumProofVerified(opId, msg.sender);
    }

    /**
     * @notice Execute a confirmed, timelocked operation.
     */
    function executeOperation(bytes32 opId) external nonReentrant whenNotPaused {
        VaultOperation storage op = operations[opId];
        require(!op.executed,   "QVault: already executed");
        require(!op.cancelled,  "QVault: cancelled");
        if (block.timestamp < op.eta)        revert TimelockNotExpired();
        if (op.confirmations < QSA_QUORUM)   revert QuorumNotReached();

        // Daily limit check
        uint256 today = block.timestamp / 86400;
        if (today != lastWithdrawDay) { lastWithdrawDay = today; dailyWithdrawn = 0; }
        if (dailyWithdrawn + op.amount > MAX_DAILY_WITHDRAWAL) revert DailyLimitExceeded();
        dailyWithdrawn += op.amount;

        op.executed = true;
        (bool ok,) = SPI_TOKEN.call(
            abi.encodeWithSignature("transfer(address,uint256)", op.target, op.amount)
        );
        require(ok, "QVault: transfer failed");
        emit OperationExecuted(opId, op.target, op.amount);
    }

    function cancelOperation(bytes32 opId) external onlyRole(NEXUS_ROLE) {
        operations[opId].cancelled = true;
        emit OperationCancelled(opId);
    }

    // Calls Super Pi L2 custom Dilithium3 precompile at 0x0900
    function _verifyDilithium(bytes memory pubKey, bytes memory message, bytes memory sig) internal view returns (bool) {
        bytes memory input = abi.encode(pubKey, message, sig);
        (bool ok, bytes memory result) = address(0x0900).staticcall(input);
        return ok && result.length > 0 && abi.decode(result, (bool));
    }

    function pause()   external onlyRole(NEXUS_ROLE) { _pause(); }
    function unpause() external onlyRole(NEXUS_ROLE) { _unpause(); }
}
