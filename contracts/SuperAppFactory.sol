// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SuperAppFactory — 10,000 Super App Global Singularity Factory
 * @notice On-chain registry and deployment pipeline for the 10,000 Super App mission.
 *         100 categories × 100 apps = 10,000 apps across 195 countries.
 *         Upgraded from v1.0.0 (5,000 target) to v2.0.0 (10,000 target).
 *         All apps: $SPI denominated, LEX_MACHINA v1.5 compliant, Pi Coin banned.
 *
 * @author NEXUS Prime / KOSASIH
 * @custom:version 2.0.0
 * @custom:singularity-target 10000
 * @custom:daily-quota 28
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SuperAppFactory is AccessControl, Pausable, ReentrancyGuard {

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant NEXUS_PRIME_ROLE  = keccak256("NEXUS_PRIME_ROLE");
    bytes32 public constant ARCHON_ROLE       = keccak256("ARCHON_ROLE");
    bytes32 public constant LEX_MACHINA_ROLE  = keccak256("LEX_MACHINA_ROLE");
    bytes32 public constant SAPIENS_ROLE      = keccak256("SAPIENS_ROLE");
    bytes32 public constant VULCAN_ROLE       = keccak256("VULCAN_ROLE");
    bytes32 public constant PAUSER_ROLE       = keccak256("PAUSER_ROLE");

    // ── Singularity Constants ──────────────────────────────────────────────
    uint256 public constant SINGULARITY_TARGET = 10_000;
    uint256 public constant DAILY_QUOTA        = 28;
    uint256 public constant APPS_PER_CATEGORY  = 100;
    uint256 public constant TOTAL_CATEGORIES   = 100;
    uint256 public constant SAPIENS_THRESHOLD  = 85;

    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;

    // ── 100 App Categories ─────────────────────────────────────────────────
    enum AppCategory {
        // Finance (1–15)
        BANKING, PAYMENTS, REMITTANCE, LENDING, MICROFINANCE,
        INVESTMENT, INSURANCE, DEFI, FOREX, CRYPTO_CUSTODY,
        PENSION, BONDS_SUKUK, CROWDFUNDING, FACTORING, TRADE_FINANCE,
        // Commerce (16–25)
        ECOMMERCE, MARKETPLACE, WHOLESALE, DROPSHIPPING, SUBSCRIPTION,
        AUCTION, CLASSIFIED_ADS, LOYALTY_REWARDS, GROUP_BUYING, SECOND_HAND,
        // Food & Life (26–35)
        FOOD_DELIVERY, GROCERY, CATERING, NUTRITION, FITNESS,
        BEAUTY_WELLNESS, PET_CARE, HOME_SERVICES, CLEANING, LAUNDRY,
        // Mobility & Logistics (36–45)
        RIDE_HAILING, CAR_RENTAL, FREIGHT, LOGISTICS, LAST_MILE_DELIVERY,
        FLEET_MANAGEMENT, PARKING, ELECTRIC_VEHICLE, MARINE, AVIATION,
        // Healthcare (46–55)
        TELEMEDICINE, PHARMACY, HEALTH_RECORDS, MENTAL_HEALTH, DENTAL,
        HEALTH_INSURANCE, MEDICAL_DEVICES, LAB_TESTING, REHABILITATION, ELDERCARE,
        // Education (56–65)
        EDTECH, CERTIFICATION, TUTORING, VOCATIONAL, LANGUAGE_LEARNING,
        KIDS_EDUCATION, UNIVERSITY, CORPORATE_TRAINING, LIBRARY, RESEARCH,
        // Real Economy (66–75)
        REAL_ESTATE, AGRICULTURE, ENERGY, UTILITIES, MINING,
        MANUFACTURING, CONSTRUCTION, WASTE_MANAGEMENT, WATER, FORESTRY,
        // Digital Assets & RWA (76–85)
        RWA_TOKENIZATION, NFT_MARKET, CARBON_CREDITS, GOLD, COMMODITIES,
        SUPPLY_CHAIN, TRADE_DOCS, CUSTOMS, HALAL_CERTIFICATION, IP_RIGHTS,
        // Government & Civic (86–93)
        GOVTECH, IDENTITY, VOTING, TAX, LEGAL,
        IMMIGRATION, SMART_CITY, SOCIAL_WELFARE,
        // Media, Social & Entertainment (94–100)
        SOCIAL_MEDIA, MEDIA_PUBLISHING, STREAMING, GAMING, CHARITY,
        TRAVEL, SPORTS
    }

    // ── App Status ─────────────────────────────────────────────────────────
    enum AppStatus { PENDING, AUDITING, APPROVED, DEPLOYED, SUSPENDED, REJECTED }

    // ── App Record ─────────────────────────────────────────────────────────
    struct SuperApp {
        uint32       appId;
        AppCategory  category;
        string       name;
        address      owner;
        uint8        sapiensScore;
        AppStatus    status;
        uint16       countryCount;
        uint256      deployedAt;
        bytes32      contractHash;
        bool         halalCertified;
        bool         micaCompliant;
        string       lexCertId;
        string       primaryFiat;
    }

    // ── State ──────────────────────────────────────────────────────────────
    mapping(uint32 => SuperApp) public apps;
    mapping(AppCategory => uint32[]) public appsByCategory;
    uint32  public totalRegistered;
    uint32  public totalDeployed;
    uint32  public totalAudited;
    uint256 public singularityStartedAt;

    // ── Events ─────────────────────────────────────────────────────────────
    event AppRegistered(uint32 indexed appId, AppCategory category, string name, address owner);
    event AppAuditSubmitted(uint32 indexed appId, uint8 score, bool passed);
    event AppDeployed(uint32 indexed appId, string name, uint16 countryCount);
    event AppSuspended(uint32 indexed appId, string reason);
    event MilestoneReached(uint32 milestone, uint256 timestamp);
    event SingularityAchieved(uint256 timestamp, uint32 totalApps);

    error PiCoinRejected();
    error SapiensScoreTooLow(uint8 score, uint8 required);
    error AppNotApproved(uint32 appId);
    error NotRegistered(uint32 appId);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(NEXUS_PRIME_ROLE, admin);
        _grantRole(ARCHON_ROLE, admin);
        _grantRole(LEX_MACHINA_ROLE, admin);
        _grantRole(SAPIENS_ROLE, admin);
        _grantRole(VULCAN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        singularityStartedAt = block.timestamp;
    }

    // ── Pi Coin Guard ─────────────────────────────────────────────────────
    modifier noPiCoin(address token) {
        if (token == PI_COIN) revert PiCoinRejected();
        _;
    }

    // ── Register App ──────────────────────────────────────────────────────
    function registerApp(
        AppCategory  category,
        string calldata name,
        string calldata primaryFiat,
        bool    halalCertified,
        bool    micaCompliant
    )
        external
        onlyRole(ARCHON_ROLE)
        whenNotPaused
        returns (uint32 appId)
    {
        appId = ++totalRegistered;
        apps[appId] = SuperApp({
            appId:          appId,
            category:       category,
            name:           name,
            owner:          msg.sender,
            sapiensScore:   0,
            status:         AppStatus.PENDING,
            countryCount:   0,
            deployedAt:     0,
            contractHash:   bytes32(0),
            halalCertified: halalCertified,
            micaCompliant:  micaCompliant,
            lexCertId:      "",
            primaryFiat:    primaryFiat
        });
        appsByCategory[category].push(appId);
        emit AppRegistered(appId, category, name, msg.sender);
    }

    // ── Submit Audit ──────────────────────────────────────────────────────
    function submitAudit(
        uint32  appId,
        uint8   sapiensScore,
        string calldata lexCertId
    )
        external
        onlyRole(SAPIENS_ROLE)
    {
        SuperApp storage app = apps[appId];
        if (app.appId == 0) revert NotRegistered(appId);

        app.sapiensScore = sapiensScore;
        app.lexCertId    = lexCertId;
        app.status       = sapiensScore >= SAPIENS_THRESHOLD
                            ? AppStatus.APPROVED
                            : AppStatus.REJECTED;
        totalAudited++;
        emit AppAuditSubmitted(appId, sapiensScore, sapiensScore >= SAPIENS_THRESHOLD);
    }

    // ── Deploy App ────────────────────────────────────────────────────────
    function deployApp(
        uint32  appId,
        uint16  countryCount,
        bytes32 contractHash
    )
        external
        onlyRole(VULCAN_ROLE)
        nonReentrant
        whenNotPaused
    {
        SuperApp storage app = apps[appId];
        if (app.status != AppStatus.APPROVED) revert AppNotApproved(appId);

        app.status       = AppStatus.DEPLOYED;
        app.countryCount = countryCount;
        app.contractHash = contractHash;
        app.deployedAt   = block.timestamp;
        totalDeployed++;

        // Milestone events
        if (totalDeployed == 100)    emit MilestoneReached(100, block.timestamp);
        if (totalDeployed == 500)    emit MilestoneReached(500, block.timestamp);
        if (totalDeployed == 1000)   emit MilestoneReached(1000, block.timestamp);
        if (totalDeployed == 2500)   emit MilestoneReached(2500, block.timestamp);
        if (totalDeployed == 5000)   emit MilestoneReached(5000, block.timestamp);
        if (totalDeployed == 7500)   emit MilestoneReached(7500, block.timestamp);
        if (totalDeployed == 10_000) {
            emit MilestoneReached(10_000, block.timestamp);
            emit SingularityAchieved(block.timestamp, totalDeployed);
        }

        emit AppDeployed(appId, app.name, countryCount);
    }

    // ── Views ─────────────────────────────────────────────────────────────
    function getSingularityProgress() external view returns (
        uint32 deployed,
        uint32 target,
        uint256 percentMicro,
        uint256 daysElapsed,
        uint256 dailyRateNeeded
    ) {
        deployed     = totalDeployed;
        target       = uint32(SINGULARITY_TARGET);
        percentMicro = (uint256(totalDeployed) * 1_000_000) / SINGULARITY_TARGET;
        daysElapsed  = (block.timestamp - singularityStartedAt) / 86400;
        uint256 remaining = SINGULARITY_TARGET > totalDeployed
                            ? SINGULARITY_TARGET - totalDeployed : 0;
        uint256 daysLeft  = daysElapsed >= 365 ? 1 : 365 - daysElapsed;
        dailyRateNeeded   = remaining / daysLeft;
    }

    function getCategoryCount(AppCategory cat) external view returns (uint32) {
        return uint32(appsByCategory[cat].length);
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
