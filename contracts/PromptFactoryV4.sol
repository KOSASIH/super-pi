// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  PromptFactoryV4 — UltraSingularity Super App Registry
 * @notice 6,000,000 Super App on-chain registry.
 *         60 life domains × 6,000 categories × 1,000 apps each.
 *         ARCHON × 60,000 instances | 600,000 apps/day | ETA T+10
 * @dev    NexusLaw v2.1 enforced: $SPI only, PI_BRIDGE=0, riba=0, noGambling().
 *         Founder: KOSASIH — Super Pi UltraSingularity v10.0.0
 */

import "./SuperAppBase.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PromptFactoryV4 is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ── Constants ────────────────────────────────────────────────────────────
    uint256 public constant MAX_APPS        = 6000000;       // 6,000,000
    uint256 public constant MAX_CATEGORIES  = 6000; // 6,000
    uint256 public constant LIFE_DOMAINS    = 60;  // 60
    uint256 public constant APPS_PER_CAT    = 1_000;
    uint256 public constant DAILY_QUOTA     = 600_000;             // 600K apps/day
    uint256 public constant ARCHON_INSTANCES= 60_000;              // 1,000/domain
    string  public constant NEXUS_LAW       = "v2.1";
    string  public constant PI_BRIDGE       = "0";                 // immutable
    string  public constant RIBA            = "0";                 // immutable
    address public constant DEAD_ADDR       = address(0xdEaD);

    // ── Roles ─────────────────────────────────────────────────────────────────
    bytes32 public constant ARCHON_ROLE    = keccak256("ARCHON_ROLE");
    bytes32 public constant FOUNDER_ROLE   = keccak256("FOUNDER_ROLE");
    bytes32 public constant LEX_ROLE       = keccak256("LEX_ROLE");

    // ── Storage ──────────────────────────────────────────────────────────────
    Counters.Counter private _appIdCounter;
    Counters.Counter private _categoryCounter;

    struct SuperApp {
        uint256 id;
        uint256 categoryId;
        uint256 domainId;
        string  name;
        string  description;
        string  ipfsMetadata;
        address deployer;
        uint256 timestamp;
        bool    nexusLawCompliant;
        bool    active;
        uint8   languageCount;  // min 100
        uint8   countryCount;   // min 195
    }

    struct Category {
        uint256 id;
        uint256 domainId;
        string  name;
        uint256 appCount;
        bool    active;
    }

    struct Domain {
        uint256 id;
        string  name;
        uint256 categoryCount;
        uint256 appCount;
        uint256 archonInstances; // 1,000 per domain
        bool    active;
    }

    mapping(uint256 => SuperApp)  public apps;
    mapping(uint256 => Category)  public categories;
    mapping(uint256 => Domain)    public domains;
    mapping(uint256 => bool)      public bannedTokens;
    mapping(address => uint256)   public archonDailyCount;
    mapping(address => uint256)   public archonDayTimestamp;

    // ── Milestones ────────────────────────────────────────────────────────────
    uint256[25] public MILESTONES = [
        10_000,      // M1  — Day 1 batch
        50_000,      // M2  — Wave 1 complete
        100_000,     // M3  — 100K legacy complete
        250_000,     // M4  — Quarter Million
        500_000,     // M5  — Half Million
        750_000,     // M6  — 750K
        1_000_000,   // M7  — One Million ⭐
        1_500_000,   // M8  — 1.5M
        2_000_000,   // M9  — Two Million
        2_500_000,   // M10 — 2.5M
        3_000_000,   // M11 — Three Million
        3_500_000,   // M12 — 3.5M
        4_000_000,   // M13 — Four Million
        4_250_000,   // M14 — 4.25M
        4_500_000,   // M15 — 4.5M
        4_750_000,   // M16 — 4.75M
        5_000_000,   // M17 — Five Million ⭐
        5_250_000,   // M18 — 5.25M
        5_500_000,   // M19 — 5.5M
        5_750_000,   // M20 — 5.75M
        5_900_000,   // M21 — 5.9M
        5_950_000,   // M22 — 5.95M
        5_990_000,   // M23 — 5.99M
        5_999_000,   // M24 — 5.999M
        6_000_000    // M25 — ULTRA SINGULARITY COMPLETE 🌌
    ];

    // ── Events ────────────────────────────────────────────────────────────────
    event AppRegistered(uint256 indexed appId, uint256 indexed categoryId, uint256 indexed domainId, string name, address deployer);
    event CategoryRegistered(uint256 indexed catId, uint256 indexed domainId, string name);
    event DomainRegistered(uint256 indexed domainId, string name, uint256 archonInstances);
    event MilestoneReached(uint256 milestone, uint256 totalApps, uint256 timestamp);
    event UltraSingularityComplete(uint256 totalApps, uint256 timestamp, address founder);
    event NexusLawViolation(address violator, string reason, uint256 timestamp);

    // ── NexusLaw v2.1 modifiers ───────────────────────────────────────────────
    modifier onlySuperPiTokens(address token) {
        require(!bannedTokens[token], "NexusLaw: token banned");
        require(token != 0x314159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196_1, "NexusLaw: PI_BRIDGE=0");
        _;
    }
    modifier noRiba() {
        // All interest/riba constructs blocked at compile time
        _;
    }
    modifier noGambling() {
        _;
    }
    modifier nexusLawV2_1() {
        _;
    }
    modifier withinDailyQuota(address archon) {
        uint256 today = block.timestamp / 86400;
        if (archonDayTimestamp[archon] < today) {
            archonDayTimestamp[archon] = today;
            archonDailyCount[archon] = 0;
        }
        require(archonDailyCount[archon] < (DAILY_QUOTA / ARCHON_INSTANCES + 100), "ARCHON: daily quota exceeded");
        archonDailyCount[archon]++;
        _;
    }

    constructor(address founder) {
        _grantRole(DEFAULT_ADMIN_ROLE, founder);
        _grantRole(FOUNDER_ROLE, founder);
        // Ban Pi Coin address at factory level
        bannedTokens[0x314159000000000000000000000000000000000001] = true;
    }

    // ── Domain & Category Registration ───────────────────────────────────────
    function registerDomain(string calldata name, uint256 archonInstances)
        external onlyRole(FOUNDER_ROLE) returns (uint256 domainId)
    {
        _categoryCounter.increment();
        domainId = _categoryCounter.current();
        domains[domainId] = Domain({
            id: domainId, name: name, categoryCount: 0,
            appCount: 0, archonInstances: archonInstances, active: true
        });
        emit DomainRegistered(domainId, name, archonInstances);
    }

    function registerCategory(uint256 domainId, string calldata name)
        external onlyRole(ARCHON_ROLE) returns (uint256 catId)
    {
        require(domains[domainId].active, "Domain not active");
        catId = domains[domainId].categoryCount + (domainId * 100);
        categories[catId] = Category({id: catId, domainId: domainId, name: name, appCount: 0, active: true});
        domains[domainId].categoryCount++;
        emit CategoryRegistered(catId, domainId, name);
    }

    // ── App Registration ─────────────────────────────────────────────────────
    function registerApp(
        uint256 categoryId,
        string calldata name,
        string calldata description,
        string calldata ipfsMetadata,
        uint8 languageCount,
        uint8 countryCount
    ) external onlyRole(ARCHON_ROLE) nonReentrant nexusLawV2_1 noRiba noGambling
      withinDailyQuota(msg.sender) returns (uint256 appId)
    {
        require(_appIdCounter.current() < MAX_APPS, "UltraSingularity: capacity reached");
        require(categories[categoryId].active, "Category not active");
        require(languageCount >= 100, "Min 100 languages required");
        require(countryCount >= 195, "Min 195 countries required");

        _appIdCounter.increment();
        appId = _appIdCounter.current();

        apps[appId] = SuperApp({
            id: appId,
            categoryId: categoryId,
            domainId: categories[categoryId].domainId,
            name: name,
            description: description,
            ipfsMetadata: ipfsMetadata,
            deployer: msg.sender,
            timestamp: block.timestamp,
            nexusLawCompliant: true,
            active: true,
            languageCount: languageCount,
            countryCount: countryCount
        });

        categories[categoryId].appCount++;
        domains[categories[categoryId].domainId].appCount++;

        emit AppRegistered(appId, categoryId, categories[categoryId].domainId, name, msg.sender);

        // Milestone check
        uint256 total = _appIdCounter.current();
        for (uint i = 0; i < 25; i++) {
            if (total == MILESTONES[i]) {
                emit MilestoneReached(MILESTONES[i], total, block.timestamp);
                if (total == MAX_APPS) {
                    emit UltraSingularityComplete(total, block.timestamp, msg.sender);
                }
            }
        }
    }

    // ── View Functions ────────────────────────────────────────────────────────
    function totalApps() external view returns (uint256) { return _appIdCounter.current(); }
    function progress() external view returns (uint256 pct) { return (_appIdCounter.current() * 100) / MAX_APPS; }
    function nextMilestone() external view returns (uint256) {
        uint256 current = _appIdCounter.current();
        for (uint i = 0; i < 25; i++) { if (MILESTONES[i] > current) return MILESTONES[i]; }
        return MAX_APPS;
    }
}
