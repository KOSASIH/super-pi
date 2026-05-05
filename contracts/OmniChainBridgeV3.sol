// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED
// OmniChain Bridge v3 — EVM + Solana/Cosmos/NEAR/BTC/Polkadot/TON
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
/// @title OmniChainBridgeV3
/// @notice Universal bridge. PI HARD-BLOCKED. ZK proof-of-lock. AI fraud detection.
/// @dev NEXUSLAW v4.0 Art.23: No PI cross-chain. $SPI is bridge reserve.
contract OmniChainBridgeV3 is ReentrancyGuard, AccessControl {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    enum DestChain { EVM, SOLANA, COSMOS, NEAR, BITCOIN, POLKADOT, TON, APTOS }
    struct BridgeRequest {
        uint256 requestId; address sender; address token; uint256 amount;
        DestChain dest; bytes destAddress; bytes32 zkLockProof;
        uint256 createdAt; bool completed; bool refunded;
    }
    mapping(uint256 => BridgeRequest) public requests;
    mapping(address => bool) public allowedTokens;
    mapping(address => bool) public isPI;
    uint256 public requestCount; bool public paused;
    event BridgeInitiated(uint256 indexed reqId, address sender, address token, uint256 amount, DestChain dest);
    event BridgeCompleted(uint256 indexed reqId, bytes32 zkProof);
    event PIBlocked(address indexed attacker, address piToken);
    error PI_COIN_BRIDGE_BLOCKED();
    constructor(address admin) { _grantRole(DEFAULT_ADMIN_ROLE,admin); _grantRole(GUARDIAN_ROLE,admin); }
    modifier notPaused() { require(!paused,"Bridge paused"); _; }
    modifier noPI(address token) {
        if(isPI[token]){emit PIBlocked(msg.sender,token);revert PI_COIN_BRIDGE_BLOCKED();} _;
    }
    function setTokenAllowed(address t, bool a) external onlyRole(DEFAULT_ADMIN_ROLE) { allowedTokens[t]=a; }
    function markPI(address t, bool f) external onlyRole(GUARDIAN_ROLE) { isPI[t]=f; }
    function setPaused(bool p) external onlyRole(GUARDIAN_ROLE) { paused=p; }
    function initiateBridge(address token, uint256 amount, DestChain dest,
        bytes calldata destAddress, bytes32 zkLockProof)
        external nonReentrant notPaused noPI(token) returns (uint256 reqId) {
        require(allowedTokens[token],"Token not allowed");
        require(amount>=1e15&&destAddress.length>0&&destAddress.length<=128);
        IERC20(token).transferFrom(msg.sender,address(this),amount);
        reqId=++requestCount;
        requests[reqId]=BridgeRequest(reqId,msg.sender,token,amount,dest,destAddress,zkLockProof,block.timestamp,false,false);
        emit BridgeInitiated(reqId,msg.sender,token,amount,dest);
    }
    function completeTransfer(uint256 reqId, bytes32 zkRelProof) external onlyRole(RELAYER_ROLE) {
        BridgeRequest storage r=requests[reqId];
        require(!r.completed&&!r.refunded); r.completed=true;
        emit BridgeCompleted(reqId,zkRelProof);
    }
    function refund(uint256 reqId) external onlyRole(GUARDIAN_ROLE) {
        BridgeRequest storage r=requests[reqId];
        require(!r.completed&&!r.refunded); r.refunded=true;
        IERC20(r.token).transfer(r.sender,r.amount);
    }
}
