// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 SINGULARITY PRIME | PI_COIN=BANNED | riba=0
pragma solidity ^0.8.24;
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
/// @title QuantumKeyRegistry
/// @notice On-chain PQ key registry: Kyber-1024, Dilithium-4, SPHINCS+-SHA2-256, Falcon-1024
/// @dev 90-day mandatory rotation. NEXUSLAW v4.0 Art.16: PQ mandatory by v14.
contract QuantumKeyRegistry is AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    enum KeyAlgo { KYBER_1024, DILITHIUM_4, SPHINCS_SHA2_256, FALCON_1024 }
    struct QuantumKey {
        bytes publicKey; KeyAlgo algorithm;
        uint256 registeredAt; uint256 expiresAt;
        uint256 rotationCount; bool revoked; bytes32 keyHash;
    }
    mapping(address => mapping(KeyAlgo => QuantumKey)) public keys;
    mapping(bytes32 => address) public keyOwner;
    mapping(address => uint256) public keyHistory;
    uint256 public constant ROTATION_INTERVAL = 90 days;
    uint256 public constant MAX_KEY_SIZE = 2048;
    event KeyRegistered(address indexed owner, KeyAlgo algo, bytes32 keyHash, uint256 exp);
    event KeyRotated(address indexed owner, KeyAlgo algo, bytes32 oldHash, bytes32 newHash);
    event KeyRevoked(address indexed owner, KeyAlgo algo, bytes32 keyHash);
    error RotationOverdue(address owner, KeyAlgo algo);
    function initialize(address admin) external initializer {
        __AccessControl_init(); __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin); _grantRole(REGISTRAR_ROLE, admin);
    }
    function registerKey(KeyAlgo algo, bytes calldata pubKey) external {
        require(pubKey.length > 0 && pubKey.length <= MAX_KEY_SIZE);
        QuantumKey storage k = keys[msg.sender][algo];
        if (k.registeredAt > 0 && !k.revoked && block.timestamp >= k.expiresAt)
            revert RotationOverdue(msg.sender, algo);
        bytes32 kh = keccak256(pubKey);
        require(keyOwner[kh] == address(0), "Key exists");
        uint256 exp = block.timestamp + ROTATION_INTERVAL;
        keys[msg.sender][algo] = QuantumKey(pubKey, algo, block.timestamp, exp, 0, false, kh);
        keyOwner[kh] = msg.sender; keyHistory[msg.sender]++;
        emit KeyRegistered(msg.sender, algo, kh, exp);
    }
    function rotateKey(KeyAlgo algo, bytes calldata newKey) external {
        QuantumKey storage old = keys[msg.sender][algo];
        require(!old.revoked && old.registeredAt > 0);
        bytes32 oldH = old.keyHash; bytes32 newH = keccak256(newKey);
        require(keyOwner[newH] == address(0));
        uint256 exp = block.timestamp + ROTATION_INTERVAL;
        old.publicKey = newKey; old.keyHash = newH;
        old.registeredAt = block.timestamp; old.expiresAt = exp; old.rotationCount++;
        keyOwner[oldH] = address(0); keyOwner[newH] = msg.sender; keyHistory[msg.sender]++;
        emit KeyRotated(msg.sender, algo, oldH, newH);
    }
    function revokeKey(address owner, KeyAlgo algo) external onlyRole(REGISTRAR_ROLE) {
        QuantumKey storage k = keys[owner][algo];
        require(!k.revoked); k.revoked = true; keyOwner[k.keyHash] = address(0);
        emit KeyRevoked(owner, algo, k.keyHash);
    }
    function isKeyValid(address owner, KeyAlgo algo) external view returns (bool) {
        QuantumKey storage k = keys[owner][algo];
        return k.registeredAt > 0 && !k.revoked && block.timestamp < k.expiresAt;
    }
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
