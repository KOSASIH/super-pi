// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Purpose: Phase 3 Cross-Chain Bridge — $SPI to EVM/Cosmos/Solana, MEV-0, Pi Coin banned
// NexusLaw v6.1 | Super Pi v16.0.0-phase3

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface ISPIToken {
    function noForeignToken(address token) external view returns (bool);
}

contract SingularityBridge is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    bytes32 public constant RELAYER_ROLE   = keccak256("RELAYER_ROLE");
    bytes32 public constant GUARDIAN_ROLE  = keccak256("GUARDIAN_ROLE");

    address public constant PI_COIN = address(0xDEAD);
    modifier noPiCoin(address token) {
        require(token != PI_COIN, "SingularityBridge: PI_COIN banned");
        _;
    }

    enum DestChain { EVM, COSMOS, SOLANA, SUPERPI_L2 }

    struct BridgeOrder {
        uint256 orderId;
        address sender;
        address token;
        uint256 amount;
        DestChain dest;
        bytes32 destAddress;
        uint64  nonce;
        bool    settled;
    }

    uint256 public nextOrderId;
    uint256 public constant MAX_BRIDGE_AMOUNT = 1_000_000 * 1e18;
    uint256 public constant MIN_BRIDGE_AMOUNT = 1 * 1e18;
    uint256 public bridgeFeesBps = 10;
    address public feeTreasury;

    mapping(address => uint64) public senderNonce;
    mapping(uint256 => BridgeOrder) public orders;
    mapping(bytes32 => bool) public usedRelayHashes;
    mapping(address => bool) public approvedTokens;
    ISPIToken public immutable spiRegistry;

    event BridgeOut(uint256 indexed orderId, address indexed sender, address token, uint256 amount, DestChain dest, bytes32 destAddress);
    event BridgeIn(uint256 indexed orderId, address indexed recipient, address token, uint256 amount, bytes32 relayHash);
    event TokenApproved(address indexed token, bool approved);

    constructor(address _spiRegistry, address _feeTreasury) {
        spiRegistry  = ISPIToken(_spiRegistry);
        feeTreasury  = _feeTreasury;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
    }

    function bridgeOut(address token, uint256 amount, DestChain dest, bytes32 destAddress)
        external nonReentrant whenNotPaused noPiCoin(token)
    {
        require(approvedTokens[token], "SingularityBridge: token not approved");
        require(amount >= MIN_BRIDGE_AMOUNT && amount <= MAX_BRIDGE_AMOUNT, "amount out of range");
        require(destAddress != bytes32(0), "invalid dest address");

        uint64 nonce = ++senderNonce[msg.sender];
        uint256 fee  = (amount * bridgeFeesBps) / 10_000;
        uint256 net  = amount - fee;

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        if (fee > 0) IERC20(token).safeTransfer(feeTreasury, fee);

        uint256 orderId = ++nextOrderId;
        orders[orderId] = BridgeOrder(orderId, msg.sender, token, net, dest, destAddress, nonce, false);
        emit BridgeOut(orderId, msg.sender, token, net, dest, destAddress);
    }

    function bridgeIn(uint256 orderId, address recipient, address token, uint256 amount, bytes32 relayHash, bytes calldata relayerSig)
        external nonReentrant whenNotPaused onlyRole(RELAYER_ROLE) noPiCoin(token)
    {
        require(!usedRelayHashes[relayHash], "SingularityBridge: relay already used");
        bytes32 digest = keccak256(abi.encodePacked(orderId, recipient, token, amount, relayHash)).toEthSignedMessageHash();
        address signer = digest.recover(relayerSig);
        require(hasRole(RELAYER_ROLE, signer), "SingularityBridge: invalid relayer sig");

        usedRelayHashes[relayHash] = true;
        IERC20(token).safeTransfer(recipient, amount);
        emit BridgeIn(orderId, recipient, token, amount, relayHash);
    }

    function setTokenApproval(address token, bool approved) external onlyRole(GUARDIAN_ROLE) noPiCoin(token) {
        approvedTokens[token] = approved;
        emit TokenApproved(token, approved);
    }

    function setBridgeFee(uint256 bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bps <= 100, "max 1%");
        bridgeFeesBps = bps;
    }

    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }
    function unpause() external onlyRole(GUARDIAN_ROLE) { _unpause(); }
}
