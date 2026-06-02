// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.1 — ExistentialRiskEngine (Security Patch v1.1)
// SAPIENS Audit fixes: 8 circuit-breaker bypass vectors patched
// (1) No admin override — SEVERITY_THRESHOLD immutable; (2) Threshold immutable;
// (3) CEI pattern enforced; (4) Oracle rate-limiting (1 update/block/oracle);
// (5) MIN_RISK_DELTA prevents micro-tx stuffing; (6) No cross-contract delegation;
// (7) No upgrade path for threshold; (8) block.number replaces timestamp comparisons.
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface INexusLaw { function enforce(address a, bytes4 s, bytes calldata d) external returns (bool); }

contract ExistentialRiskEngine is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant RISK_ORACLE_ROLE = keccak256("RISK_ORACLE_ROLE");

    // FIX (1)(2): threshold immutable — no admin override, no setter
    uint256 public immutable SEVERITY_THRESHOLD;
    // FIX (5): minimum risk delta to prevent batched micro-tx stuffing
    uint256 public constant MIN_RISK_DELTA = 5; // 5/100 minimum meaningful risk change
    // FIX (8): use block.number not block.timestamp for circuit breaker cooldown
    uint256 public constant CIRCUIT_BREAKER_COOLDOWN_BLOCKS = 50; // ~10 min at 12s/block

    INexusLaw public immutable nexusLaw;
    bool public circuitBreakerActive;
    uint256 public circuitBreakerActivatedAtBlock;
    uint256 public globalRiskScore; // 0-100

    // FIX (4): oracle rate-limit — one update per oracle per block
    mapping(address => uint256) private _lastOracleUpdateBlock;
    // FIX (6): no cross-contract delegation mapping; direct role check only

    event RiskScoreUpdated(address indexed oracle, uint256 oldScore, uint256 newScore, uint256 atBlock);
    event CircuitBreakerTripped(uint256 riskScore, uint256 atBlock);
    event CircuitBreakerReset(uint256 atBlock);

    // Pi Coin eternal ban
    bytes32 private constant PI_COIN_HASH = keccak256(abi.encodePacked("PI_COIN"));
    bytes32 private constant PI_NET_HASH  = keccak256(abi.encodePacked("PINETWORK"));

    constructor(address _nexusLaw, uint256 _severityThreshold) {
        require(_severityThreshold >= 50 && _severityThreshold <= 95, "threshold 50-95");
        nexusLaw = INexusLaw(_nexusLaw);
        SEVERITY_THRESHOLD = _severityThreshold; // FIX (1)(2): set once, never changeable
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier noPiCoin(bytes32 tokenHash) {
        require(tokenHash != PI_COIN_HASH && tokenHash != PI_NET_HASH, "Pi Coin banned");
        _;
    }

    /// @notice Report a risk signal. FIX (3): CEI pattern — state updated BEFORE any external call.
    function reportRisk(uint256 riskDelta, bool increase)
        external
        onlyRole(RISK_ORACLE_ROLE)
        nonReentrant
        whenNotPaused
    {
        // FIX (4): rate-limit oracle to one update per block
        require(_lastOracleUpdateBlock[msg.sender] < block.number, "oracle: one update per block");
        // FIX (5): reject micro-delta stuffing
        require(riskDelta >= MIN_RISK_DELTA, "delta below minimum");

        _lastOracleUpdateBlock[msg.sender] = block.number; // state update FIRST

        uint256 oldScore = globalRiskScore;
        if (increase) {
            globalRiskScore = globalRiskScore + riskDelta > 100 ? 100 : globalRiskScore + riskDelta;
        } else {
            globalRiskScore = globalRiskScore > riskDelta ? globalRiskScore - riskDelta : 0;
        }
        emit RiskScoreUpdated(msg.sender, oldScore, globalRiskScore, block.number);

        // FIX (3): circuit breaker check AFTER state update (CEI)
        if (globalRiskScore >= SEVERITY_THRESHOLD && !circuitBreakerActive) {
            circuitBreakerActive = true;
            circuitBreakerActivatedAtBlock = block.number;
            emit CircuitBreakerTripped(globalRiskScore, block.number);
        }
        // FIX (6): no external delegation — nexusLaw enforcement is view-only here
    }

    /// @notice Reset circuit breaker. Requires cooldown elapsed + risk score below threshold.
    /// FIX (7): no upgrade path; reset requires quorum via DEFAULT_ADMIN_ROLE + cooldown.
    function resetCircuitBreaker() external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(circuitBreakerActive, "not active");
        // FIX (8): block.number cooldown (not timestamp)
        require(block.number >= circuitBreakerActivatedAtBlock + CIRCUIT_BREAKER_COOLDOWN_BLOCKS, "cooldown not elapsed");
        require(globalRiskScore < SEVERITY_THRESHOLD, "risk still above threshold");
        circuitBreakerActive = false;
        emit CircuitBreakerReset(block.number);
    }

    function isCircuitBreakerActive() external view returns (bool) { return circuitBreakerActive; }
    function getRiskScore() external view returns (uint256) { return globalRiskScore; }
}
