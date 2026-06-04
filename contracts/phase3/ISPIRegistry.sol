// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Super Pi v16.0.2-phase3.1 | SPIRegistry v1.0
// Implements ISPIRegistry interface consumed by RWAVaultFactory v1.3
// NexusLaw v6.1 Art.40 — Pi Coin hard-block enforced at registry level
// noForeignToken() + isApprovedSPIToken() together form the dual-gate
// that every vault token must pass before any deposit/vault creation.

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SPIRegistry is AccessControl {

    bytes32 public constant REGISTRY_MANAGER = keccak256("REGISTRY_MANAGER");

    /// @dev Immutable Pi Coin address — permanently banned at construction.
    ///      Hard-coded so no admin action can ever un-ban it.
    address public immutable PI_COIN_ADDRESS;

    /// @notice Tokens that are permanently or administratively banned.
    ///         noForeignToken() returns false for any banned address.
    mapping(address => bool) public bannedTokens;

    /// @notice Tokens explicitly approved for use in SPI vaults.
    ///         isApprovedSPIToken() returns true only for these.
    mapping(address => bool) public approvedSpiTokens;

    // ── Events ────────────────────────────────────────────────────────────
    event TokenBanned(address indexed token, address indexed bannedBy);
    event TokenApproved(address indexed token, address indexed approvedBy);
    event TokenApprovalRevoked(address indexed token, address indexed revokedBy);

    // ── Constructor ──────────────────────────────────────────────────────────
    /// @param _piCoinAddress  Pi Network coin address to hard-ban permanently.
    /// @param _registryManager  Initial REGISTRY_MANAGER (may be a multisig).
    constructor(address _piCoinAddress, address _registryManager) {
        require(_piCoinAddress   != address(0), "SPIRegistry: Pi Coin address is zero");
        require(_registryManager != address(0), "SPIRegistry: manager is zero address");
        PI_COIN_ADDRESS = _piCoinAddress;
        bannedTokens[_piCoinAddress] = true;
        emit TokenBanned(_piCoinAddress, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRY_MANAGER,   _registryManager);
    }

    // ── ISPIRegistry interface ────────────────────────────────────────────────

    /// @notice Returns true when `token` is NOT a banned or foreign token.
    ///         A return value of true is a necessary-but-not-sufficient
    ///         condition for vault use — isApprovedSPIToken must also pass.
    /// @dev    Pi Coin is permanently banned via bannedTokens[PI_COIN_ADDRESS]
    ///         set at construction; no admin action can reverse it.
    function noForeignToken(address token) external view returns (bool) {
        require(token != address(0), "SPIRegistry: zero address");
        return !bannedTokens[token];
    }

    /// @notice Returns true when `token` has been explicitly approved as an
    ///         SPI token by REGISTRY_MANAGER or DEFAULT_ADMIN_ROLE.
    function isApprovedSPIToken(address token) external view returns (bool) {
        require(token != address(0), "SPIRegistry: zero address");
        return approvedSpiTokens[token];
    }

    // ── Admin ──────────────────────────────────────────────────────────────────

    /// @notice Permanently ban a token from all SPI vaults.
    ///         Also removes it from the approved set if present.
    ///         Cannot un-ban — ban is final.
    function banToken(address token)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(token != address(0), "SPIRegistry: zero address");
        require(!bannedTokens[token], "SPIRegistry: already banned");
        bannedTokens[token]      = true;
        approvedSpiTokens[token] = false;
        emit TokenBanned(token, msg.sender);
    }

    /// @notice Add a token to the approved SPI token set.
    ///         Token must not be banned.
    function addApprovedToken(address token)
        external onlyRole(REGISTRY_MANAGER)
    {
        require(token != address(0),       "SPIRegistry: zero address");
        require(!bannedTokens[token],      "SPIRegistry: token is banned");
        require(!approvedSpiTokens[token], "SPIRegistry: already approved");
        approvedSpiTokens[token] = true;
        emit TokenApproved(token, msg.sender);
    }

    /// @notice Remove a token from the approved SPI token set.
    ///         Does NOT ban the token — use banToken() for permanent exclusion.
    function removeApprovedToken(address token)
        external onlyRole(REGISTRY_MANAGER)
    {
        require(token != address(0),      "SPIRegistry: zero address");
        require(approvedSpiTokens[token], "SPIRegistry: not approved");
        approvedSpiTokens[token] = false;
        emit TokenApprovalRevoked(token, msg.sender);
    }

    // ── View helpers ────────────────────────────────────────────────────────────

    /// @notice Convenience: both gates in one call.
    ///         Returns true only when token passes both noForeignToken
    ///         AND isApprovedSPIToken — equivalent to what RWAVaultFactory
    ///         checks via onlyLegalToken().
    function isEligibleVaultToken(address token) external view returns (bool) {
        if (token == address(0)) return false;
        return !bannedTokens[token] && approvedSpiTokens[token];
    }

    /// @notice Returns true if `token` is the hard-banned Pi Coin address.
    function isPiCoin(address token) external view returns (bool) {
        return token == PI_COIN_ADDRESS;
    }
}
