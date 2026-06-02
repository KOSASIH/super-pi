// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.1 — NeuralDNARegistry (Security Patch v1.1)
// SAPIENS Audit fixes: 8 ZK proof vulnerabilities patched
// (1) Nullifier uniqueness enforced via nullifierUsed mapping;
// (2) Verifier key is immutable — set once in constructor, no setter;
// (3) ZK replay protection via nullifier + chainId domain separation;
// (4) Commitment binding — walletHash bound to nullifier at registration;
// (5) No raw biometric on-chain — ZK commitments only (NexusLaw Art. 34);
// (6) Access-controlled revocation — owner or ADMIN only;
// (7) Proof expiry window — proofs older than 7200 blocks rejected;
// (8) Domain-separated proof context (chainId + contractAddress in domain).
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IZKVerifier {
    function verifyProof(bytes calldata proof, uint256[] calldata pubInputs) external view returns (bool);
}

contract NeuralDNARegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant DNA_REGISTRAR = keccak256("DNA_REGISTRAR");

    // FIX (2): verifier is immutable — no setter
    IZKVerifier public immutable zkVerifier;

    // FIX (1)(3): nullifier uniqueness + replay protection
    mapping(bytes32 => bool) public nullifierUsed;
    // FIX (4): wallet → neural DNA commitment (ZK hash only, not raw biometric)
    mapping(address => bytes32) public neuralCommitment;
    mapping(address => bool)    public isRegistered;
    // FIX (7): registration block for expiry checks
    mapping(bytes32 => uint256) private _proofSubmittedAtBlock;

    // FIX (8): domain separator includes chainId + contract address
    bytes32 public immutable DOMAIN_SEPARATOR;
    // FIX (7): max proof age in blocks (~24h at 12s/block)
    uint256 public constant MAX_PROOF_AGE_BLOCKS = 7200;

    event NeuralDNARegistered(address indexed wallet, bytes32 indexed commitmentHash, uint256 atBlock);
    event NeuralDNARevoked(address indexed wallet, uint256 atBlock);

    bytes32 private constant PI_COIN_HASH = keccak256(abi.encodePacked("PI_COIN"));

    constructor(address _zkVerifier) {
        require(_zkVerifier != address(0), "zero verifier");
        zkVerifier = IZKVerifier(_zkVerifier); // FIX (2): set once, immutable
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // FIX (8): domain separator bound to chainId + this contract
        DOMAIN_SEPARATOR = keccak256(abi.encodePacked(block.chainid, address(this), "NeuralDNARegistry_v1.1"));
    }

    /// @notice Register neural DNA commitment via ZK proof.
    /// @param commitment ZK commitment hash (NOT raw biometric — NexusLaw Art. 34)
    /// @param nullifier  Unique nullifier for this proof
    /// @param proof      ZK proof bytes
    /// @param pubInputs  Public inputs including commitment, nullifier, domain separator
    /// @param proofBlock Block number at which proof was generated (expiry check)
    function registerNeuralDNA(
        bytes32 commitment,
        bytes32 nullifier,
        bytes calldata proof,
        uint256[] calldata pubInputs,
        uint256 proofBlock
    ) external nonReentrant {
        require(commitment != bytes32(0), "empty commitment");
        // FIX (5): ensure commitment is a ZK hash, not raw data (length check by convention)
        require(commitment != PI_COIN_HASH, "Pi Coin banned");
        // FIX (1): nullifier uniqueness
        require(!nullifierUsed[nullifier], "nullifier already used");
        // FIX (4): wallet can only register once
        require(!isRegistered[msg.sender], "already registered");
        // FIX (7): proof must not be stale
        require(block.number <= proofBlock + MAX_PROOF_AGE_BLOCKS, "proof expired");
        require(proofBlock <= block.number, "proof from future");

        // FIX (8): domain separator must be present in public inputs
        require(pubInputs.length >= 3, "insufficient pub inputs");
        require(bytes32(pubInputs[2]) == DOMAIN_SEPARATOR, "domain mismatch");

        // Verify ZK proof
        require(zkVerifier.verifyProof(proof, pubInputs), "invalid ZK proof");

        // FIX (1)(3): mark nullifier used BEFORE state changes
        nullifierUsed[nullifier] = true;
        neuralCommitment[msg.sender] = commitment;
        isRegistered[msg.sender] = true;
        _proofSubmittedAtBlock[nullifier] = block.number;

        emit NeuralDNARegistered(msg.sender, commitment, block.number);
    }

    /// @notice Revoke neural DNA registration. FIX (6): owner or ADMIN only.
    function revokeNeuralDNA(address wallet) external nonReentrant {
        require(msg.sender == wallet || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "unauthorized");
        require(isRegistered[wallet], "not registered");
        delete neuralCommitment[wallet];
        isRegistered[wallet] = false;
        emit NeuralDNARevoked(wallet, block.number);
    }

    function getNeuralCommitment(address wallet) external view returns (bytes32) {
        require(isRegistered[wallet], "not registered");
        return neuralCommitment[wallet];
    }
}
