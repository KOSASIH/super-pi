// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// ZKPrivacyPool — Shielded $SPI transfers via Groth16 ZK proofs
// LEX_MACHINA v1.6 — noForeignToken() on all deposit/withdraw

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IGroth16Verifier {
    function verify(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256[] calldata input) external view returns (bool);
}

interface IMerkleTree {
    function insert(bytes32 leaf) external returns (uint256 index);
    function root() external view returns (bytes32);
    function isKnownRoot(bytes32 root) external view returns (bool);
}

/**
 * @title ZKPrivacyPool
 * @notice Shielded $SPI transfers. Deposit public → receive private note.
 *         Withdraw with zero-knowledge proof — no on-chain link between deposit and withdrawal.
 *         Pi Coin: BANNED. noForeignToken() on all entry points.
 * @dev Groth16 proof via IGroth16Verifier. Nullifier double-spend prevention.
 */
contract ZKPrivacyPool is AccessControl, ReentrancyGuard, Pausable {

    bytes32 public constant NEXUS_ROLE    = keccak256("NEXUS_ROLE");
    bytes32 public constant RELAYER_ROLE  = keccak256("RELAYER_ROLE");

    address public constant PI_COIN       = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;
    uint256 public constant DENOMINATION  = 100e18;  // 100 $SPI per note
    uint256 public constant MAX_FEE_BPS   = 30;      // 0.3% max relayer fee

    IGroth16Verifier public immutable verifier;
    IMerkleTree      public immutable commitmentTree;
    address          public immutable SPI_TOKEN;

    mapping(bytes32 => bool) public nullifiers;
    mapping(bytes32 => bool) public commitments;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;

    event Deposit(bytes32 indexed commitment, uint256 leafIndex, uint256 timestamp);
    event Withdrawal(address indexed recipient, bytes32 nullifierHash, address relayer, uint256 fee);

    error PiCoinRejected();
    error InvalidProof();
    error NullifierUsed();
    error UnknownRoot();
    error CommitmentExists();
    error FeeTooHigh();

    modifier noForeignToken(address token) {
        if (token == PI_COIN) revert PiCoinRejected();
        require(token == SPI_TOKEN, "ZKPool: only $SPI");
        _;
    }

    constructor(address _verifier, address _tree, address _spi, address _admin) {
        verifier         = IGroth16Verifier(_verifier);
        commitmentTree   = IMerkleTree(_tree);
        SPI_TOKEN        = _spi;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(NEXUS_ROLE, _admin);
    }

    /**
     * @notice Deposit DENOMINATION $SPI. Receive private note (commitment).
     * @param token Must be $SPI. noForeignToken enforced.
     * @param commitment Pedersen hash of (secret, nullifier).
     */
    function deposit(address token, bytes32 commitment)
        external
        noForeignToken(token)
        nonReentrant
        whenNotPaused
    {
        if (commitments[commitment]) revert CommitmentExists();
        commitments[commitment] = true;
        uint256 leafIndex = commitmentTree.insert(commitment);
        // Transfer DENOMINATION $SPI from caller
        (bool ok,) = SPI_TOKEN.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), DENOMINATION)
        );
        require(ok, "ZKPool: transfer failed");
        totalDeposits++;
        emit Deposit(commitment, leafIndex, block.timestamp);
    }

    /**
     * @notice Withdraw $SPI using zero-knowledge proof.
     * @param proof     Groth16 proof (a, b, c).
     * @param root      Merkle root at time of deposit.
     * @param nullifierHash Unique hash preventing double-spend.
     * @param recipient Withdrawal address (can differ from depositor — full privacy).
     * @param relayer   Optional relayer address for gas sponsorship.
     * @param fee       Relayer fee in $SPI (max MAX_FEE_BPS of DENOMINATION).
     */
    function withdraw(
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC,
        bytes32 root,
        bytes32 nullifierHash,
        address recipient,
        address relayer,
        uint256 fee
    )
        external
        nonReentrant
        whenNotPaused
    {
        if (nullifiers[nullifierHash]) revert NullifierUsed();
        if (!commitmentTree.isKnownRoot(root))  revert UnknownRoot();
        if (fee > (DENOMINATION * MAX_FEE_BPS) / 10000) revert FeeTooHigh();

        uint256[] memory publicSignals = new uint256[](4);
        publicSignals[0] = uint256(root);
        publicSignals[1] = uint256(nullifierHash);
        publicSignals[2] = uint256(uint160(recipient));
        publicSignals[3] = fee;

        if (!verifier.verify(proofA, proofB, proofC, publicSignals)) revert InvalidProof();

        nullifiers[nullifierHash] = true;
        totalWithdrawals++;

        uint256 payout = DENOMINATION - fee;
        _spiTransfer(recipient, payout);
        if (fee > 0 && relayer != address(0)) _spiTransfer(relayer, fee);

        emit Withdrawal(recipient, nullifierHash, relayer, fee);
    }

    function _spiTransfer(address to, uint256 amount) internal {
        (bool ok,) = SPI_TOKEN.call(abi.encodeWithSignature("transfer(address,uint256)", to, amount));
        require(ok, "ZKPool: payout failed");
    }

    function pause()   external onlyRole(NEXUS_ROLE) { _pause(); }
    function unpause() external onlyRole(NEXUS_ROLE) { _unpause(); }

    function stats() external view returns (uint256 deposits, uint256 withdrawals, uint256 balance, bytes32 treeRoot) {
        deposits    = totalDeposits;
        withdrawals = totalWithdrawals;
        treeRoot    = commitmentTree.root();
        balance     = totalDeposits - totalWithdrawals;
    }
}
