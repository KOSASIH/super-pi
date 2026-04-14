// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PiTaintRegistry — Permanent Taint Protection Database v3.0
/// @notice Immutable on-chain ledger of tainted addresses (exchange-touched Pi Coin)
/// @dev Taint is PERMANENT for EXCHANGE_CONTACT and PI_COIN_BRIDGE types
/// @custom:security-contact security@super-pi.io
contract PiTaintRegistry is AccessControl, Pausable, ReentrancyGuard {

    bytes32 public constant TAINT_OPERATOR_ROLE = keccak256("TAINT_OPERATOR_ROLE");
    bytes32 public constant ORACLE_ROLE          = keccak256("ORACLE_ROLE");
    bytes32 public constant EXCHANGE_ADMIN_ROLE  = keccak256("EXCHANGE_ADMIN_ROLE");

    enum TaintType {
        CLEAN,              // 0 — Pure Pi
        EXCHANGE_CONTACT,   // 1 — Touched a CEX/DEX
        PI_COIN_BRIDGE,     // 2 — Attempted bridge with Pi Coin
        MIXING_SERVICE,     // 3 — Privacy/mixing protocol used
        FRAUD_DETECTED,     // 4 — AI fraud flag
        MANUAL_BLACKLIST    // 5 — Manual admin action
    }

    struct TaintRecord {
        TaintType  taintType;
        uint64     timestamp;
        uint64     blockNumber;
        bytes32    evidenceHash; // keccak256 of IPFS CID or tx hash
        string     reason;
        bool       permanent;
    }

    struct ExchangeEntry {
        string  name;
        bool    active;
        uint64  registeredAt;
    }

    // ===== STATE =====
    mapping(address => TaintRecord[]) public taintHistory;
    mapping(address => bool)          public isTainted;
    mapping(address => TaintType)     public primaryTaint;
    mapping(address => ExchangeEntry) public knownExchanges;

    uint256 public totalTaintedAddresses;
    uint256 public totalExchangesTracked;
    uint256 public totalTaintOperations;

    // ===== EVENTS =====
    event AddressTainted(
        address indexed addr,
        TaintType       taintType,
        string          reason,
        bytes32         evidenceHash
    );
    event BatchTaintProcessed(
        uint256 count,
        TaintType taintType,
        string reason
    );
    event ExchangeRegistered(address indexed exchange, string name);
    event ExchangeDeactivated(address indexed exchange);
    event PurityVerified(address indexed addr, bool isPure);

    // ===== ERRORS =====
    error ZeroAddress();
    error EmptyBatch();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE,  msg.sender);
        _grantRole(TAINT_OPERATOR_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE,         msg.sender);
        _grantRole(EXCHANGE_ADMIN_ROLE, msg.sender);
    }

    // ===== TAINT OPS =====

    /// @notice Record a single taint event
    function recordTaint(
        address      addr,
        TaintType    taintType,
        string calldata reason,
        bytes32      evidenceHash
    ) external onlyRole(TAINT_OPERATOR_ROLE) whenNotPaused {
        if (addr == address(0)) revert ZeroAddress();

        bool permanent = (
            taintType == TaintType.EXCHANGE_CONTACT ||
            taintType == TaintType.PI_COIN_BRIDGE
        );

        taintHistory[addr].push(TaintRecord({
            taintType:    taintType,
            timestamp:    uint64(block.timestamp),
            blockNumber:  uint64(block.number),
            evidenceHash: evidenceHash,
            reason:       reason,
            permanent:    permanent
        }));

        if (!isTainted[addr]) {
            isTainted[addr]    = true;
            primaryTaint[addr] = taintType;
            totalTaintedAddresses++;
        }

        totalTaintOperations++;
        emit AddressTainted(addr, taintType, reason, evidenceHash);
    }

    /// @notice Batch taint — gas-optimized for AI oracle bulk submissions (10,000+ addresses)
    function batchRecordTaint(
        address[] calldata addrs,
        TaintType          taintType,
        string calldata    reason
    ) external onlyRole(ORACLE_ROLE) whenNotPaused nonReentrant {
        if (addrs.length == 0) revert EmptyBatch();

        bool permanent = (
            taintType == TaintType.EXCHANGE_CONTACT ||
            taintType == TaintType.PI_COIN_BRIDGE
        );

        uint256 newTaints;
        for (uint256 i; i < addrs.length; ++i) {
            address addr = addrs[i];
            if (addr == address(0)) continue;

            taintHistory[addr].push(TaintRecord({
                taintType:    taintType,
                timestamp:    uint64(block.timestamp),
                blockNumber:  uint64(block.number),
                evidenceHash: bytes32(0),
                reason:       reason,
                permanent:    permanent
            }));

            if (!isTainted[addr]) {
                isTainted[addr]    = true;
                primaryTaint[addr] = taintType;
                newTaints++;
            }
        }

        totalTaintedAddresses += newTaints;
        totalTaintOperations  += addrs.length;
        emit BatchTaintProcessed(addrs.length, taintType, reason);
    }

    // ===== EXCHANGE REGISTRY =====

    /// @notice Register a known exchange (CEX/DEX) address
    function registerExchange(address exchange, string calldata name)
        external
        onlyRole(EXCHANGE_ADMIN_ROLE)
    {
        if (exchange == address(0)) revert ZeroAddress();
        knownExchanges[exchange] = ExchangeEntry({
            name:         name,
            active:       true,
            registeredAt: uint64(block.timestamp)
        });
        totalExchangesTracked++;
        emit ExchangeRegistered(exchange, name);
    }

    function deactivateExchange(address exchange)
        external
        onlyRole(EXCHANGE_ADMIN_ROLE)
    {
        knownExchanges[exchange].active = false;
        emit ExchangeDeactivated(exchange);
    }

    // ===== READ =====

    /// @notice Returns true if address is Pure Pi (never touched exchange or Pi Coin)
    function isPure(address addr) external view returns (bool) {
        return !isTainted[addr] && !knownExchanges[addr].active;
    }

    /// @notice Get full taint history for an address
    function getTaintHistory(address addr)
        external
        view
        returns (TaintRecord[] memory)
    {
        return taintHistory[addr];
    }

    function getTaintHistoryLength(address addr) external view returns (uint256) {
        return taintHistory[addr].length;
    }

    /// @notice Bulk purity check — returns bool array
    function batchIsPure(address[] calldata addrs)
        external
        view
        returns (bool[] memory results)
    {
        results = new bool[](addrs.length);
        for (uint256 i; i < addrs.length; ++i) {
            results[i] = !isTainted[addrs[i]] && !knownExchanges[addrs[i]].active;
        }
    }

    // ===== EMERGENCY =====
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
