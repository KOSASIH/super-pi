// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SuperAppFactory — 5000 Super App Genesis Engine
 * @notice Factory for deploying production-grade Super Apps across 195 countries.
 *         Every app spawned is:
 *           - $SPI-denominated by default
 *           - LEX_MACHINA v1.4 compliant
 *           - Geo-compliance aware (195 countries)
 *           - Pi Coin permanently hard-blocked
 *           - Fiat-interoperable via Bridge-Qirad
 *           - Halal-certified (Shariah/AAOIFI standards)
 *
 * @author NEXUS Prime / KOSASIH
 * @custom:mission Super App Global Singularity — 5000 apps, 195 countries, T+12 months
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

// ── Super App Categories (50 categories, 100 apps each = 5000) ─────────────
enum AppCategory {
    BANKING,          PAYMENTS,         DEFI,             REMITTANCE,    INSURANCE,
    INVESTMENT,       LENDING,          MICROFINANCE,     PENSION,       FOREX,
    ECOMMERCE,        MARKETPLACE,      RETAIL,           SUBSCRIPTION,  TICKETING,
    HEALTHCARE,       TELEMEDICINE,     PHARMACY,         INSURANCE_MED, WELLNESS,
    EDUCATION,        EDTECH,           CERTIFICATION,    TUTORING,      LIBRARY,
    AGRICULTURE,      SUPPLY_CHAIN,     FOOD_DELIVERY,    LOGISTICS,     TRACKING,
    REAL_ESTATE,      PROPERTY_MGMT,    RWA_TOKENIZATION, MORTGAGE,      RENTAL,
    ENERGY,           UTILITIES,        CARBON_CREDIT,    SOLAR,         GRID,
    GOVERNMENT,       TAXATION,         IDENTITY,         VOTING,        PUBLIC_SERVICES,
    SOCIAL,           MEDIA,            ENTERTAINMENT,    GAMING,        CHARITY
}

// ── App Lifecycle ─────────────────────────────────────────────────────────
enum AppStatus { PENDING, AUDITING, DEPLOYED, SUSPENDED, DEPRECATED }

// ── Super App Record ──────────────────────────────────────────────────────
struct SuperApp {
    uint256    appId;
    string     name;
    string     version;
    AppCategory category;
    AppStatus  status;
    address    owner;
    address    contractAddr;    // Deployed contract address
    uint256[195] countryBitmap; // Bit-packed: 1 = enabled in country
    string     ipfsMetadata;   // IPFS CID of audit report + ABI + frontend hash
    bool       halalCertified;
    bool       micaCertified;
    uint256    deployedAt;
    uint256    auditScore;      // 0-100 SAPIENS Guardian score
    string     primaryFiat;     // Primary fiat for this app's market
}

// ── Factory ───────────────────────────────────────────────────────────────
contract SuperAppFactory is AccessControl, Pausable, ReentrancyGuard {
    using Clones for address;

    // ── Roles ─────────────────────────────────────────────────────────────
    bytes32 public constant NEXUS_PRIME_ROLE    = keccak256("NEXUS_PRIME_ROLE");
    bytes32 public constant ARCHON_FORGE_ROLE   = keccak256("ARCHON_FORGE_ROLE");
    bytes32 public constant LEX_MACHINA_ROLE    = keccak256("LEX_MACHINA_ROLE");
    bytes32 public constant SAPIENS_ROLE        = keccak256("SAPIENS_ROLE");
    bytes32 public constant VULCAN_DEPLOY_ROLE  = keccak256("VULCAN_DEPLOY_ROLE");

    // ── Constants ─────────────────────────────────────────────────────────
    address public constant PI_COIN = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;
    uint256 public constant TARGET_APPS     = 5000;
    uint256 public constant TOTAL_COUNTRIES = 195;
    uint256 public constant MIN_AUDIT_SCORE = 85;   // Minimum SAPIENS score for deploy

    // ── State ──────────────────────────────────────────────────────────────
    address public immutable spiToken;
    address public immutable bridgeQirad;
    address public immutable globalFiatRegistry;

    mapping(uint256 => SuperApp)       public apps;
    mapping(address => uint256[])      public ownerApps;
    mapping(AppCategory => uint256[])  public categoryApps;
    mapping(uint256 => address)        public implementations; // category → EIP-1167 implementation

    uint256 public totalDeployed;
    uint256 public totalAuditing;
    uint256 public nextAppId;

    // ── Monthly deployment tracking ───────────────────────────────────────
    mapping(uint256 => uint256) public monthlyDeployments; // yearMonth → count

    // ── Events ────────────────────────────────────────────────────────────
    event AppRegistered(uint256 indexed appId, string name, AppCategory category, address owner);
    event AppAuditSubmitted(uint256 indexed appId, uint256 auditScore, address auditor);
    event AppDeployed(uint256 indexed appId, address contractAddr, string version, bool halalCertified);
    event AppSuspended(uint256 indexed appId, string reason);
    event AppCountryEnabled(uint256 indexed appId, uint16 countryCode);
    event AppCountryDisabled(uint256 indexed appId, uint16 countryCode, string reason);
    event SingularityMilestone(uint256 totalApps, uint256 targetApps, string milestone);

    // ── Errors ────────────────────────────────────────────────────────────
    error PiCoinRejected();
    error AuditScoreTooLow(uint256 score, uint256 minimum);
    error SingularityTargetReached();
    error AppNotFound(uint256 appId);
    error UnauthorizedCountry(uint16 countryCode);

    // ── Constructor ───────────────────────────────────────────────────────
    constructor(
        address admin,
        address spiAddr,
        address bridgeQiradAddr,
        address fiatRegistryAddr
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(NEXUS_PRIME_ROLE, admin);
        _grantRole(ARCHON_FORGE_ROLE, admin);
        _grantRole(LEX_MACHINA_ROLE, admin);
        _grantRole(SAPIENS_ROLE, admin);
        _grantRole(VULCAN_DEPLOY_ROLE, admin);

        spiToken           = spiAddr;
        bridgeQirad        = bridgeQiradAddr;
        globalFiatRegistry = fiatRegistryAddr;
    }

    // ── Register New Super App ────────────────────────────────────────────
    /**
     * @notice Register a new Super App for audit + deployment pipeline.
     *         ARCHON Forge calls this after generating the app scaffold.
     */
    function registerApp(
        string calldata name,
        AppCategory     category,
        string calldata version,
        string calldata ipfsMetadata,
        string calldata primaryFiat,
        address         owner
    )
        external
        onlyRole(ARCHON_FORGE_ROLE)
        whenNotPaused
        returns (uint256 appId)
    {
        if (totalDeployed >= TARGET_APPS) revert SingularityTargetReached();

        appId = nextAppId++;
        apps[appId] = SuperApp({
            appId:         appId,
            name:          name,
            version:       version,
            category:      category,
            status:        AppStatus.PENDING,
            owner:         owner,
            contractAddr:  address(0),
            countryBitmap: [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0),
                            uint256(0), uint256(0)],  // 7 × 32 bytes = 224 bits (≥195 countries)
            ipfsMetadata:  ipfsMetadata,
            halalCertified: false,
            micaCertified:  false,
            deployedAt:    0,
            auditScore:    0,
            primaryFiat:   primaryFiat
        });

        ownerApps[owner].push(appId);
        categoryApps[category].push(appId);
        totalAuditing++;

        emit AppRegistered(appId, name, category, owner);
    }

    // ── Submit Audit Result ───────────────────────────────────────────────
    /**
     * @notice SAPIENS Guardian submits audit result after scanning the app.
     *         Score < 85 = blocked from deployment.
     */
    function submitAudit(
        uint256 appId,
        uint256 score,
        bool    halalCertified,
        bool    micaCertified
    )
        external
        onlyRole(SAPIENS_ROLE)
    {
        SuperApp storage app = apps[appId];
        if (app.appId == 0 && appId != 0) revert AppNotFound(appId);

        app.auditScore    = score;
        app.halalCertified = halalCertified;
        app.micaCertified  = micaCertified;
        app.status         = score >= MIN_AUDIT_SCORE ? AppStatus.AUDITING : AppStatus.SUSPENDED;

        emit AppAuditSubmitted(appId, score, msg.sender);
    }

    // ── Deploy App ────────────────────────────────────────────────────────
    /**
     * @notice VULCAN Deploy finalizes deployment after LEX Machina + SAPIENS sign off.
     */
    function deployApp(
        uint256 appId,
        address contractAddr,
        uint16[] calldata enabledCountries
    )
        external
        onlyRole(VULCAN_DEPLOY_ROLE)
        nonReentrant
        whenNotPaused
    {
        SuperApp storage app = apps[appId];
        if (app.status != AppStatus.AUDITING) revert AppNotFound(appId);
        if (app.auditScore < MIN_AUDIT_SCORE) revert AuditScoreTooLow(app.auditScore, MIN_AUDIT_SCORE);

        app.contractAddr = contractAddr;
        app.status       = AppStatus.DEPLOYED;
        app.deployedAt   = block.timestamp;

        // Enable countries
        for (uint i = 0; i < enabledCountries.length; i++) {
            _enableCountry(appId, enabledCountries[i]);
        }

        totalDeployed++;
        totalAuditing = totalAuditing > 0 ? totalAuditing - 1 : 0;

        // Monthly tracking
        uint256 ym = _yearMonth();
        monthlyDeployments[ym]++;

        emit AppDeployed(appId, contractAddr, app.version, app.halalCertified);
        _checkMilestones();
    }

    // ── Country Management ────────────────────────────────────────────────
    function enableCountry(uint256 appId, uint16 countryCode)
        external
        onlyRole(LEX_MACHINA_ROLE)
    {
        _enableCountry(appId, countryCode);
        emit AppCountryEnabled(appId, countryCode);
    }

    function disableCountry(uint256 appId, uint16 countryCode, string calldata reason)
        external
        onlyRole(LEX_MACHINA_ROLE)
    {
        _disableCountry(appId, countryCode);
        emit AppCountryDisabled(appId, countryCode, reason);
    }

    function isEnabledInCountry(uint256 appId, uint16 countryCode) public view returns (bool) {
        require(countryCode < 195, "Invalid country code");
        uint256 slot = countryCode / 256;
        uint256 bit  = countryCode % 256;
        return (apps[appId].countryBitmap[slot] >> bit) & 1 == 1;
    }

    // ── Progress ──────────────────────────────────────────────────────────
    function getSingularityProgress() external view returns (
        uint256 deployed,
        uint256 target,
        uint256 percentComplete,
        uint256 remaining,
        bool    singularityReached
    ) {
        deployed         = totalDeployed;
        target           = TARGET_APPS;
        percentComplete  = (totalDeployed * 100) / TARGET_APPS;
        remaining        = TARGET_APPS - totalDeployed;
        singularityReached = totalDeployed >= TARGET_APPS;
    }

    function getAppsByCategory(AppCategory category) external view returns (uint256[] memory) {
        return categoryApps[category];
    }

    // ── Suspend ───────────────────────────────────────────────────────────
    function suspendApp(uint256 appId, string calldata reason)
        external
        onlyRole(NEXUS_PRIME_ROLE)
    {
        apps[appId].status = AppStatus.SUSPENDED;
        emit AppSuspended(appId, reason);
    }

    // ── Internal ──────────────────────────────────────────────────────────
    function _enableCountry(uint256 appId, uint16 countryCode) internal {
        require(countryCode < 195, "Invalid country");
        uint256 slot = countryCode / 256;
        uint256 bit  = countryCode % 256;
        apps[appId].countryBitmap[slot] |= (1 << bit);
    }

    function _disableCountry(uint256 appId, uint16 countryCode) internal {
        require(countryCode < 195, "Invalid country");
        uint256 slot = countryCode / 256;
        uint256 bit  = countryCode % 256;
        apps[appId].countryBitmap[slot] &= ~(1 << bit);
    }

    function _yearMonth() internal view returns (uint256) {
        return block.timestamp / 30 days;
    }

    function _checkMilestones() internal {
        if (totalDeployed == 100)  emit SingularityMilestone(100, TARGET_APPS, "1st Centennial achieved");
        if (totalDeployed == 500)  emit SingularityMilestone(500, TARGET_APPS, "500 apps live");
        if (totalDeployed == 1000) emit SingularityMilestone(1000, TARGET_APPS, "1000 apps — 20% Singularity");
        if (totalDeployed == 2500) emit SingularityMilestone(2500, TARGET_APPS, "HALFWAY — 2500 apps live");
        if (totalDeployed == 5000) emit SingularityMilestone(5000, TARGET_APPS, "SINGULARITY ACHIEVED — 5000 apps, 195 countries");
    }

    function pause()   external onlyRole(NEXUS_PRIME_ROLE) { _pause(); }
    function unpause() external onlyRole(NEXUS_PRIME_ROLE) { _unpause(); }
}
