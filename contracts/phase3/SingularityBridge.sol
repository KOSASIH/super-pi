// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Super Pi v16.0.1-patch2 | SingularityBridge v1.2
// Advisory patches (v1.1 was DEPLOY CLEARED by SAPIENS):
//   SB-05 MEDIUM: block.chainid in relay digest
//   SB-N1 MEDIUM: setQuorum() timelocked (queueSetQuorum/executeSetQuorum/cancel)
//   SB-N2 LOW: bridgeIn() checks approvedTokens[token]
// All prior SB-01..04 fixes retained.
// NexusLaw v6.1 | noForeignToken() mandate ENFORCED

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface ISPIRegistry { function noForeignToken(address token) external view returns (bool); }
interface IERC20 { function transfer(address, uint256) external returns (bool); function transferFrom(address, address, uint256) external returns (bool); }

contract SingularityBridge is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    bytes32 public constant RELAYER_ROLE  = keccak256("RELAYER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    mapping(address => bool) public bannedTokens;
    ISPIRegistry public immutable spiRegistry;

    struct PendingGrant { bytes32 role; address account; uint256 unlocksAt; }
    mapping(bytes32 => PendingGrant) public pendingGrants;
    uint256 public constant ROLE_TIMELOCK = 48 hours;

    uint8 public quorumThreshold;

    // SB-N1: timelocked quorum changes
    struct PendingQuorum { uint8 threshold; uint256 unlocksAt; }
    PendingQuorum public pendingQuorum;
    event QuorumChangeQueued(uint8 threshold, uint256 unlocksAt);
    event QuorumChangeExecuted(uint8 threshold);
    event QuorumChangeCancelled();

    enum DestChain { EVM, COSMOS, SOLANA, SUPERPI_L2 }
    struct BridgeOrder { uint256 orderId; address sender; address token; uint256 amount; DestChain dest; bytes32 destAddress; uint64 nonce; bool settled; }

    uint256 public nextOrderId;
    uint256 public constant MAX_BRIDGE_AMOUNT = 1_000_000 * 1e18;
    uint256 public constant MIN_BRIDGE_AMOUNT = 1 * 1e18;
    uint256 public bridgeFeesBps = 10;
    address public feeTreasury;

    mapping(address => uint64)      public senderNonce;
    mapping(uint256 => BridgeOrder) public orders;
    mapping(bytes32 => bool)        public usedRelayHashes;
    mapping(address => bool)        public approvedTokens;

    event BridgeOut(uint256 indexed orderId, address indexed sender, address token, uint256 amount, DestChain dest, bytes32 destAddress);
    event BridgeIn(uint256 indexed orderId, address indexed recipient, address token, uint256 amount, bytes32 relayHash);
    event TokenApproved(address indexed token, bool approved);
    event TokenBanned(address indexed token);
    event RoleGrantQueued(bytes32 indexed role, address indexed account, uint256 unlocksAt);
    event RoleGrantExecuted(bytes32 indexed role, address indexed account);
    event RoleGrantCancelled(bytes32 indexed role, address indexed account);

    constructor(address _spiRegistry, address _feeTreasury, uint8 _quorumThreshold) {
        require(_spiRegistry != address(0), "SB: zero registry");
        require(_feeTreasury != address(0), "SB: zero treasury");
        require(_quorumThreshold >= 2,      "SB: quorum must be >= 2");
        spiRegistry = ISPIRegistry(_spiRegistry);
        feeTreasury = _feeTreasury;
        quorumThreshold = _quorumThreshold;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE,      msg.sender);
    }

    modifier onlyAllowedToken(address token) {
        require(!bannedTokens[token],              "SB: token banned (Pi Coin list)");
        require(spiRegistry.noForeignToken(token), "SB: foreign/Pi token blocked by registry");
        _;
    }

    function bridgeOut(address token, uint256 amount, DestChain dest, bytes32 destAddress)
        external nonReentrant whenNotPaused onlyAllowedToken(token)
    {
        require(approvedTokens[token], "SB: token not approved");
        require(amount >= MIN_BRIDGE_AMOUNT && amount <= MAX_BRIDGE_AMOUNT, "SB: amount out of range");
        require(destAddress != bytes32(0), "SB: invalid dest address");
        uint64 nonce = ++senderNonce[msg.sender];
        uint256 fee  = (amount * bridgeFeesBps) / 10_000;
        uint256 net  = amount - fee;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        if (fee > 0) IERC20(token).safeTransfer(feeTreasury, fee);
        uint256 orderId = ++nextOrderId;
        orders[orderId] = BridgeOrder(orderId, msg.sender, token, net, dest, destAddress, nonce, false);
        emit BridgeOut(orderId, msg.sender, token, net, dest, destAddress);
    }

    function bridgeIn(
        uint256 orderId, address recipient, address token, uint256 amount,
        bytes32 relayHash, bytes[] calldata relayerSigs
    ) external nonReentrant whenNotPaused onlyAllowedToken(token) {
        require(approvedTokens[token],                "SB: token not approved for bridgeIn"); // SB-N2
        require(!usedRelayHashes[relayHash],           "SB: relay hash already used");
        require(relayerSigs.length >= quorumThreshold, "SB: not enough signatures");
        // SB-05: chainid in digest prevents cross-chain replay
        bytes32 digest = keccak256(abi.encodePacked(block.chainid, orderId, recipient, token, amount, relayHash)).toEthSignedMessageHash();
        address[] memory seen = new address[](relayerSigs.length);
        uint256 validCount;
        for (uint256 i; i < relayerSigs.length; i++) {
            address signer = digest.recover(relayerSigs[i]);
            if (!hasRole(RELAYER_ROLE, signer)) continue;
            bool dup;
            for (uint256 j; j < validCount; j++) { if (seen[j] == signer) { dup = true; break; } }
            if (!dup) seen[validCount++] = signer;
        }
        require(validCount >= quorumThreshold, "SB: relayer quorum not reached");
        usedRelayHashes[relayHash] = true;
        IERC20(token).safeTransfer(recipient, amount);
        emit BridgeIn(orderId, recipient, token, amount, relayHash);
    }

    function queueRoleGrant(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "SB: zero account");
        bytes32 grantId = keccak256(abi.encodePacked(role, account));
        uint256 unlocksAt = block.timestamp + ROLE_TIMELOCK;
        pendingGrants[grantId] = PendingGrant(role, account, unlocksAt);
        emit RoleGrantQueued(role, account, unlocksAt);
    }
    function executeRoleGrant(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 grantId = keccak256(abi.encodePacked(role, account));
        PendingGrant memory pg = pendingGrants[grantId];
        require(pg.unlocksAt > 0 && block.timestamp >= pg.unlocksAt, "SB: timelock active");
        delete pendingGrants[grantId];
        _grantRole(role, account);
        emit RoleGrantExecuted(role, account);
    }
    function cancelRoleGrant(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 grantId = keccak256(abi.encodePacked(role, account));
        require(pendingGrants[grantId].unlocksAt > 0, "SB: no pending grant");
        delete pendingGrants[grantId];
        emit RoleGrantCancelled(role, account);
    }
    function grantRole(bytes32, address) public pure override { revert("SB: use queueRoleGrant + executeRoleGrant"); }

    // SB-N1: timelocked quorum changes
    function queueSetQuorum(uint8 threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(threshold >= 2,               "SB: quorum must be >= 2");
        require(pendingQuorum.unlocksAt == 0, "SB: quorum change already pending");
        uint256 unlocksAt = block.timestamp + ROLE_TIMELOCK;
        pendingQuorum = PendingQuorum(threshold, unlocksAt);
        emit QuorumChangeQueued(threshold, unlocksAt);
    }
    function executeSetQuorum() external onlyRole(DEFAULT_ADMIN_ROLE) {
        PendingQuorum memory pq = pendingQuorum;
        require(pq.unlocksAt > 0 && block.timestamp >= pq.unlocksAt, "SB: quorum timelock active");
        delete pendingQuorum;
        quorumThreshold = pq.threshold;
        emit QuorumChangeExecuted(pq.threshold);
    }
    function cancelSetQuorum() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(pendingQuorum.unlocksAt > 0, "SB: no pending quorum change");
        delete pendingQuorum;
        emit QuorumChangeCancelled();
    }

    function banToken(address token) external onlyRole(GUARDIAN_ROLE) {
        bannedTokens[token] = true; approvedTokens[token] = false; emit TokenBanned(token);
    }
    function setTokenApproval(address token, bool approved) external onlyRole(GUARDIAN_ROLE) {
        require(!bannedTokens[token] && spiRegistry.noForeignToken(token), "SB: invalid token");
        approvedTokens[token] = approved; emit TokenApproved(token, approved);
    }
    function setBridgeFee(uint256 bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bps <= 100, "SB: max fee 1%"); bridgeFeesBps = bps;
    }
    function setFeeTreasury(address treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(treasury != address(0), "SB: zero treasury"); feeTreasury = treasury;
    }
    function pause()   external onlyRole(GUARDIAN_ROLE) { _pause(); }
    function unpause() external onlyRole(GUARDIAN_ROLE) { _unpause(); }
}
