// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.0 — NeuralDNARegistry
// Biometric + neural pattern sovereignty: privacy-preserving identity anchored to neural DNA hash
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NeuralDNARegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant BIOMETRIC_ORACLE = keccak256("BIOMETRIC_ORACLE");

    struct NeuralIdentity {
        bytes32 neuralDNAHash;   // ZK commitment to biometric+neural fingerprint
        bytes32 zkProof;
        uint256 registeredAt;
        uint256 lastVerified;
        uint256 trustScore;      // /10000
        bool revoked;
        uint256 associatedWallets;
    }

    mapping(address => NeuralIdentity) public identities;
    mapping(bytes32 => address) public dnaHashToWallet; // prevent duplicate registration
    uint256 public totalRegistered;
    uint256 public minTrustScore = 7000;

    event IdentityRegistered(address indexed wallet, bytes32 neuralDNAHash, uint256 trustScore);
    event IdentityVerified(address indexed wallet, uint256 trustScore, uint256 timestamp);
    event IdentityRevoked(address indexed wallet, string reason);

    constructor() { _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); }

    function register(address wallet, bytes32 dnaHash, bytes32 zkProof, uint256 trustScore)
        external onlyRole(BIOMETRIC_ORACLE) {
        require(dnaHashToWallet[dnaHash] == address(0), "Neural DNA already registered");
        require(trustScore >= minTrustScore, "Trust score below minimum");
        identities[wallet] = NeuralIdentity(dnaHash, zkProof, block.timestamp, block.timestamp, trustScore, false, 1);
        dnaHashToWallet[dnaHash] = wallet;
        totalRegistered++;
        emit IdentityRegistered(wallet, dnaHash, trustScore);
    }

    function verify(address wallet, bytes32 dnaHash) external onlyRole(BIOMETRIC_ORACLE) returns(bool) {
        NeuralIdentity storage id = identities[wallet];
        require(!id.revoked, "Identity revoked");
        bool valid = (id.neuralDNAHash == dnaHash && id.trustScore >= minTrustScore);
        if (valid) { id.lastVerified = block.timestamp; emit IdentityVerified(wallet, id.trustScore, block.timestamp); }
        return valid;
    }

    function revoke(address wallet, string calldata reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        identities[wallet].revoked = true;
        emit IdentityRevoked(wallet, reason);
    }
}
