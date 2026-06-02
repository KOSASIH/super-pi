// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.0 — ExistentialRiskEngine
// Protocol-level existential risk detection: black swans, systemic collapse, AI misalignment
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ExistentialRiskEngine is AccessControl, Pausable {
    bytes32 public constant RISK_ORACLE = keccak256("RISK_ORACLE");
    bytes32 public constant CIRCUIT_BREAKER = keccak256("CIRCUIT_BREAKER");

    enum RiskLevel { NOMINAL, ELEVATED, HIGH, CRITICAL, EXISTENTIAL }
    RiskLevel public currentRisk = RiskLevel.NOMINAL;

    struct RiskSignal {
        string category;     // "MARKET_CRASH","AI_MISALIGNMENT","SYSTEMIC","POLITICAL","QUANTUM_THREAT"
        uint256 severity;    // /10000
        uint256 timestamp;
        bytes32 evidenceHash;
    }

    RiskSignal[] public riskHistory;
    mapping(string => uint256) public categoryMaxSeverity;
    uint256 public protocolCircuitBreakerThreshold = 9000;
    bool public protocolHalted = false;

    event RiskLevelChanged(RiskLevel from, RiskLevel to, string trigger);
    event ExistentialThreatDetected(string category, uint256 severity, bytes32 evidence);
    event ProtocolCircuitBreakerTripped(uint256 severity, string reason);

    constructor() { _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); }

    function reportRisk(string calldata category, uint256 severity, bytes32 evidenceHash)
        external onlyRole(RISK_ORACLE) {
        riskHistory.push(RiskSignal(category, severity, block.timestamp, evidenceHash));
        if (severity > categoryMaxSeverity[category]) categoryMaxSeverity[category] = severity;
        _updateRiskLevel(category, severity);
        if (severity >= protocolCircuitBreakerThreshold && !protocolHalted) {
            protocolHalted = true;
            emit ProtocolCircuitBreakerTripped(severity, category);
        }
    }

    function _updateRiskLevel(string memory category, uint256 severity) internal {
        RiskLevel prev = currentRisk;
        if (severity >= 9500) currentRisk = RiskLevel.EXISTENTIAL;
        else if (severity >= 8000) currentRisk = RiskLevel.CRITICAL;
        else if (severity >= 6000) currentRisk = RiskLevel.HIGH;
        else if (severity >= 4000) currentRisk = RiskLevel.ELEVATED;
        else currentRisk = RiskLevel.NOMINAL;
        if (currentRisk != prev) emit RiskLevelChanged(prev, currentRisk, category);
        if (currentRisk == RiskLevel.EXISTENTIAL) emit ExistentialThreatDetected(category, severity, bytes32(0));
    }

    function clearRisk(string calldata category) external onlyRole(CIRCUIT_BREAKER) {
        categoryMaxSeverity[category] = 0;
        protocolHalted = false;
        currentRisk = RiskLevel.NOMINAL;
    }
}
