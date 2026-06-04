// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Super Pi v16.0.1-patch2 | SPIRegistry v1.0
// ISPIRegistry implementation for RWAVaultFactory v1.2 + SingularityBridge v1.2
// noForeignToken(address) → true = safe | isApprovedSPIToken(address) → explicit whitelist
// Pi Coin BANNED forever. PI_COIN_SENTINEL (0xDEAD) hardcoded, unbanning reverts.

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SPIRegistry is AccessControl {
    bytes32 public constant TOKEN_ADMIN = keccak256("TOKEN_ADMIN");
    bytes32 public constant GUARDIAN    = keccak256("GUARDIAN");

    mapping(address => bool) private _foreignBanned;
    mapping(address => bool) private _approvedSPITokens;

    address public constant PI_COIN_SENTINEL = address(0x000000000000000000000000000000000000dEaD);

    event ForeignTokenBanned(address indexed token, address indexed by);
    event ForeignTokenUnbanned(address indexed token, address indexed by);
    event SPITokenApproved(address indexed token, address indexed by);
    event SPITokenRevoked(address indexed token, address indexed by);

    constructor(address _admin, address _guardian) {
        require(_admin    != address(0), "SPIRegistry: zero admin");
        require(_guardian != address(0), "SPIRegistry: zero guardian");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(TOKEN_ADMIN,        _admin);
        _grantRole(GUARDIAN,           _guardian);
        _foreignBanned[PI_COIN_SENTINEL] = true;
        emit ForeignTokenBanned(PI_COIN_SENTINEL, _admin);
    }

    function noForeignToken(address token) external view returns (bool) {
        if (token == address(0))       return false;
        if (token == PI_COIN_SENTINEL) return false;
        return !_foreignBanned[token];
    }

    function isApprovedSPIToken(address token) external view returns (bool) {
        return _approvedSPITokens[token];
    }

    function banForeignToken(address token) external onlyRole(GUARDIAN) {
        require(token != address(0), "SPIRegistry: zero address");
        _foreignBanned[token]     = true;
        _approvedSPITokens[token] = false;
        emit ForeignTokenBanned(token, msg.sender);
    }

    function unbanForeignToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != PI_COIN_SENTINEL, "SPIRegistry: Pi Coin sentinel is permanent");
        _foreignBanned[token] = false;
        emit ForeignTokenUnbanned(token, msg.sender);
    }

    function approveSPIToken(address token) external onlyRole(TOKEN_ADMIN) {
        require(token != address(0),       "SPIRegistry: zero address");
        require(!_foreignBanned[token],    "SPIRegistry: token is banned");
        require(token != PI_COIN_SENTINEL, "SPIRegistry: Pi Coin cannot be approved");
        _approvedSPITokens[token] = true;
        emit SPITokenApproved(token, msg.sender);
    }

    function revokeSPIToken(address token) external onlyRole(TOKEN_ADMIN) {
        _approvedSPITokens[token] = false;
        emit SPITokenRevoked(token, msg.sender);
    }

    function isBanned(address token)   external view returns (bool) { return _foreignBanned[token]; }
    function isApproved(address token) external view returns (bool) { return _approvedSPITokens[token]; }
}
