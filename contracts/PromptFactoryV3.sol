// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// ██████╗ ███████╗    ███████╗██╗   ██╗██████╗ ███████╗██████╗
// ██╔══██╗██╔════╝    ██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗
// ██████╔╝█████╗      ███████╗██║   ██║██████╔╝█████╗  ██████╔╝
// ██╔═══╝ ██╔══╝      ╚════██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗
// ██║     ██║         ███████║╚██████╔╝██║     ███████╗██║  ██║
// ╚═╝     ╚═╝         ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝
//
// PromptFactory v3.0 — 100,000 Super Apps Double Singularity Registry
// NexusLaw v2.1 | $SPI Only | 100 Languages | 195 Countries
// 20 Life Domains | 1,000 Categories | ARCHON × 1,000 | 10,000+ apps/day
// Authorized: NEXUS Prime · Agent-007 · Founder KOSASIH

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SuperAppBase.sol";
import "./NexusLawV21.sol";

contract PromptFactoryV3 is Ownable, ReentrancyGuard, NexusLawV21 {

    // ── Constants ──────────────────────────────────────────────────────────
    uint256 public constant SINGULARITY_TARGET   = 100_000;
    uint256 public constant MAX_CATEGORIES       = 1_000;
    uint256 public constant APPS_PER_CATEGORY    = 100;
    uint256 public constant MIN_LANGUAGES        = 100;
    uint256 public constant TOTAL_COUNTRIES      = 195;
    uint32  public constant AGENT_INSTANCES      = 1_000; // 1,000 ARCHON instances
    uint256 public constant LIFE_DOMAINS         = 20;
    uint256 public constant DAILY_QUOTA          = 10_000; // apps/day

    // ── Milestones ─────────────────────────────────────────────────────────
    uint256[15] public MILESTONES = [
        1_000, 5_000, 10_000, 20_000, 25_000,
        30_000, 40_000, 50_000, 60_000, 70_000,
        75_000, 80_000, 90_000, 95_000, 100_000
    ];

    // ── State ──────────────────────────────────────────────────────────────
    struct SuperApp {
        uint256 id;
        string  name;
        string  category;
        string  lifeDomain;
        uint256 languageCount;
        uint256 countryCount;
        address deployer;
        uint256 deployedAt;
        bool    nexusLawVerified;
        bool    piBridgeBlocked;
        bool    ribaFree;
    }

    mapping(uint256 => SuperApp)      public apps;
    mapping(string  => uint256[])     public appsByCategory;
    mapping(string  => uint256[])     public appsByDomain;
    mapping(address => uint256[])     public appsByDeployer;
    mapping(uint256 => bool)          private _milestoneReached;

    uint256 public totalApps;
    uint256 public totalCategories;

    // ── Events ─────────────────────────────────────────────────────────────
    event AppGenerated(uint256 indexed appId, string name, string category, string domain, address deployer);
    event MilestoneReached(uint256 milestone, uint256 timestamp);
    event DoubleSingularityComplete(uint256 totalApps, uint256 timestamp);
    event DomainComplete(string domain, uint256 appCount, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    // ── Core: Register App ─────────────────────────────────────────────────
    function registerApp(
        string memory _name,
        string memory _category,
        string memory _lifeDomain,
        uint256 _languageCount,
        uint256 _countryCount,
        address _deployer
    ) external onlyOwner nonReentrant returns (uint256 appId) {
        require(totalApps < SINGULARITY_TARGET, "Double Singularity complete: 100,000 reached");
        require(_languageCount >= MIN_LANGUAGES, "Must support 100+ languages");
        require(_countryCount == TOTAL_COUNTRIES, "Must cover all 195 countries");

        appId = ++totalApps;
        apps[appId] = SuperApp({
            id:               appId,
            name:             _name,
            category:         _category,
            lifeDomain:       _lifeDomain,
            languageCount:    _languageCount,
            countryCount:     _countryCount,
            deployer:         _deployer,
            deployedAt:       block.timestamp,
            nexusLawVerified: true,
            piBridgeBlocked:  true,
            ribaFree:         true
        });

        appsByCategory[_category].push(appId);
        appsByDomain[_lifeDomain].push(appId);
        appsByDeployer[_deployer].push(appId);

        emit AppGenerated(appId, _name, _category, _lifeDomain, _deployer);
        _checkMilestones(appId);

        if (appId == SINGULARITY_TARGET) {
            emit DoubleSingularityComplete(appId, block.timestamp);
        }
    }

    // ── Batch Register (1,000 ARCHON × 10-batch = 10,000/day) ─────────────
    function batchRegisterApps(
        string[] memory _names,
        string[] memory _categories,
        string[] memory _domains,
        address _deployer
    ) external onlyOwner nonReentrant {
        require(_names.length == _categories.length && _names.length == _domains.length, "Array mismatch");
        require(_names.length <= 1000, "Max 1000 per batch");
        for (uint256 i = 0; i < _names.length; i++) {
            uint256 appId = ++totalApps;
            apps[appId] = SuperApp({
                id:               appId,
                name:             _names[i],
                category:         _categories[i],
                lifeDomain:       _domains[i],
                languageCount:    100,
                countryCount:     195,
                deployer:         _deployer,
                deployedAt:       block.timestamp,
                nexusLawVerified: true,
                piBridgeBlocked:  true,
                ribaFree:         true
            });
            appsByCategory[_categories[i]].push(appId);
            appsByDomain[_domains[i]].push(appId);
            appsByDeployer[_deployer].push(appId);
            emit AppGenerated(appId, _names[i], _categories[i], _domains[i], _deployer);
            _checkMilestones(appId);
        }
    }

    // ── Progress ────────────────────────────────────────────────────────────
    function progress() external view returns (
        uint256 deployed, uint256 target, uint256 pct, uint256 remaining, uint256 daysLeft
    ) {
        deployed  = totalApps;
        target    = SINGULARITY_TARGET;
        pct       = (totalApps * 100) / SINGULARITY_TARGET;
        remaining = SINGULARITY_TARGET - totalApps;
        daysLeft  = remaining / DAILY_QUOTA;
    }

    // ── Domain stats ────────────────────────────────────────────────────────
    function domainAppCount(string memory _domain) external view returns (uint256) {
        return appsByDomain[_domain].length;
    }

    // ── Internal ────────────────────────────────────────────────────────────
    function _checkMilestones(uint256 appId) internal {
        for (uint256 i = 0; i < MILESTONES.length; i++) {
            if (appId == MILESTONES[i] && !_milestoneReached[MILESTONES[i]]) {
                _milestoneReached[MILESTONES[i]] = true;
                emit MilestoneReached(MILESTONES[i], block.timestamp);
            }
        }
    }
}
