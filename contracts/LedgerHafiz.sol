// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LedgerHafiz — Agent-011 Proof-of-Reserve Publisher
 * @notice Publishes cryptographically attested reserve proofs every hour.
 *         Ensures $SPI is always 100% backed.
 *         Any reserve shortfall triggers emergency pause on $SPI minting.
 *         LEX_MACHINA v1.3 compliant.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISPIStablecoin {
    function updateReserve(uint256 totalMicros, bytes32 attestationHash) external;
    function totalSupply() external view returns (uint256);
    function pause() external;
}

contract LedgerHafiz is AccessControl, ReentrancyGuard {

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant AUDITOR_ROLE     = keccak256("AUDITOR_ROLE");   // Regulated custodian attestors
    bytes32 public constant MONITOR_ROLE     = keccak256("MONITOR_ROLE");   // NEXUS Prime monitor
    bytes32 public constant EMERGENCY_ROLE   = keccak256("EMERGENCY_ROLE"); // Circuit breaker

    // ── Constants ──────────────────────────────────────────────────────────
    uint256 public constant UPDATE_INTERVAL  = 1 hours;
    uint256 public constant MIN_COLLATERAL   = 1_000_000; // 100% = 1e6 (1:1 collateral ratio)
    uint256 public constant ALERT_THRESHOLD  = 1_050_000; // 105% — alert if drops below
    uint256 public constant EMERGENCY_THRESHOLD = 1_000_000; // 100% — emergency pause if at or below

    // ── Reserve Proof Struct ───────────────────────────────────────────────
    struct ReserveProof {
        uint256 timestamp;
        uint256 totalReserveMicros;   // Total USD reserve in micros
        uint256 spiTotalSupply;       // Total $SPI supply at time of proof
        uint256 collateralRatioBps;   // Collateral ratio in basis points (10000 = 100%)
        bytes32 attestationHash;      // IPFS hash of custodian attestation doc
        address auditor;              // Auditor address that submitted
        bool    isHealthy;            // true if colRatio >= 100%
    }

    // ── Supported Reserve Asset Types ─────────────────────────────────────
    struct AssetBreakdown {
        uint256 usdMicros;
        uint256 eurMicros;
        uint256 idrMicros;
        uint256 jpyMicros;
        uint256 goldMicros;
        uint256 tBillsMicros;
        uint256 totalMicros;
    }

    // ── State ──────────────────────────────────────────────────────────────
    ISPIStablecoin public immutable spiToken;

    ReserveProof[] public proofHistory;
    AssetBreakdown public latestBreakdown;

    uint256 public lastUpdateTime;
    bool    public alertActive;
    bool    public emergencyPaused;

    // ── Events ─────────────────────────────────────────────────────────────
    event ReserveProofPublished(
        uint256 indexed proofId,
        uint256 totalMicros,
        uint256 collateralRatioBps,
        bytes32 attestationHash,
        address auditor
    );
    event CollateralAlert(uint256 ratioBps, uint256 threshold);
    event EmergencyPauseTriggered(uint256 ratioBps, address triggeredBy);
    event ReserveHealthRestored(uint256 ratioBps);

    // ── Errors ─────────────────────────────────────────────────────────────
    error TooFrequent(uint256 nextAllowed);
    error Undercollateralized(uint256 ratioBps);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin, address spiAddr) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        spiToken = ISPIStablecoin(spiAddr);
    }

    // ── Proof Submission (Auditors) ────────────────────────────────────────
    /**
     * @notice Submit a new proof-of-reserve. Called hourly by regulated custodians.
     * @param breakdown        Asset-level breakdown of reserves
     * @param attestationHash  IPFS CID of the signed custodian attestation PDF
     */
    function submitReserveProof(
        AssetBreakdown calldata breakdown,
        bytes32 attestationHash
    )
        external
        onlyRole(AUDITOR_ROLE)
        nonReentrant
    {
        // Rate limit — one proof per interval
        if (block.timestamp < lastUpdateTime + UPDATE_INTERVAL) {
            revert TooFrequent(lastUpdateTime + UPDATE_INTERVAL);
        }

        uint256 totalMicros = breakdown.usdMicros
            + breakdown.eurMicros
            + breakdown.idrMicros
            + breakdown.jpyMicros
            + breakdown.goldMicros
            + breakdown.tBillsMicros;

        uint256 spiSupply   = spiToken.totalSupply();
        uint256 supplyMicros = spiSupply / 1e12;

        // Collateral ratio in BPS (10000 = 100%)
        uint256 ratioBps = supplyMicros > 0
            ? (totalMicros * 10_000) / supplyMicros
            : type(uint256).max;

        bool healthy = ratioBps >= 10_000;

        // Update SPI token reserve
        spiToken.updateReserve(totalMicros, attestationHash);

        latestBreakdown = breakdown;
        lastUpdateTime  = block.timestamp;

        uint256 proofId = proofHistory.length;
        proofHistory.push(ReserveProof({
            timestamp:           block.timestamp,
            totalReserveMicros:  totalMicros,
            spiTotalSupply:      spiSupply,
            collateralRatioBps:  ratioBps,
            attestationHash:     attestationHash,
            auditor:             msg.sender,
            isHealthy:           healthy
        }));

        emit ReserveProofPublished(proofId, totalMicros, ratioBps, attestationHash, msg.sender);

        // Alert checks
        if (ratioBps < ALERT_THRESHOLD * 100 / 100) {
            alertActive = true;
            emit CollateralAlert(ratioBps, ALERT_THRESHOLD);
        }

        // Emergency pause if below 100%
        if (!healthy && !emergencyPaused) {
            emergencyPaused = true;
            spiToken.pause();
            emit EmergencyPauseTriggered(ratioBps, msg.sender);
        } else if (healthy && alertActive) {
            alertActive = false;
            emit ReserveHealthRestored(ratioBps);
        }
    }

    // ── View: Current Reserve Status ──────────────────────────────────────
    function getLatestProof() external view returns (ReserveProof memory) {
        require(proofHistory.length > 0, "No proofs published yet");
        return proofHistory[proofHistory.length - 1];
    }

    function getProofCount() external view returns (uint256) {
        return proofHistory.length;
    }

    function isReserveHealthy() external view returns (bool) {
        if (proofHistory.length == 0) return false;
        return proofHistory[proofHistory.length - 1].isHealthy;
    }
}
