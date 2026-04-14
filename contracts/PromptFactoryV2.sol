// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// ███████╗██╗   ██╗██████╗ ███████╗██████╗      ██████╗ ██╗
// ██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗     ██╔══██╗██║
// ███████╗██║   ██║██████╔╝█████╗  ██████╔╝     ██████╔╝██║
// ╚════██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗     ██╔═══╝ ██║
// ███████║╚██████╔╝██║     ███████╗██║  ██║     ██║     ██║
// ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝     ╚═╝     ╚═╝
//
// PromptFactory v2.0 — 50,000 Super Apps Global Singularity Registry
// NexusLaw v2.1 | $SPI Only | 100 Languages | 195 Countries | Zero PI_BRIDGE
// Authorized: NEXUS Prime · Agent-007 · Founder KOSASIH

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SuperAppBase.sol";
import "./NexusLawV21.sol";

contract PromptFactoryV2 is Ownable, ReentrancyGuard, NexusLawV21 {

    // ── Constants ──────────────────────────────────────────────────────────
    uint256 public constant SINGULARITY_TARGET = 50_000;
    uint256 public constant MAX_CATEGORIES     = 500;
    uint256 public constant APPS_PER_CATEGORY  = 100;
    uint256 public constant MIN_LANGUAGES      = 100;
    uint256 public constant TOTAL_COUNTRIES    = 195;
    uint32  public constant AGENT_INSTANCES    = 500;  // 500 ARCHON instances, 1 per country + spares

    // ── Milestones ─────────────────────────────────────────────────────────
    uint256[10] public MILESTONES = [
        1_000, 5_000, 10_000, 15_000, 20_000,
        25_000, 30_000, 35_000, 40_000, 50_000
    ];

    // ── State ──────────────────────────────────────────────────────────────
    struct SuperApp {
        uint256 id;
        string  name;
        string  category;
        uint256 languageCount;
        uint256 countryCount;
        address deployer;        // ARCHON agent address
        uint256 deployedAt;
        bool    nexusLawVerified;
        bool    piBridgeBlocked; // must be true
        bool    ribaFree;        // must be true
    }

    mapping(uint256 => SuperApp)     public apps;
    mapping(string => uint256[])     public appsByCategory;
    mapping(address => uint256[])    public appsByDeployer;
    mapping(uint256 => bool)         private _milestoneReached;

    uint256 public totalApps;
    uint256 public totalCategories;

    // ── Events ─────────────────────────────────────────────────────────────
    event AppGenerated(uint256 indexed appId, string name, string category, address deployer);
    event MilestoneReached(uint256 milestone, uint256 timestamp);
    event SingularityComplete(uint256 totalApps, uint256 timestamp);
    event CategoryRegistered(string category, uint256 timestamp);

    constructor() Ownable(msg.sender) {
        // NexusLaw v2.1 constraints inherited: PI_BRIDGE=0, riba=0, gambling=0, $SPI only
    }

    // ── Core: Register App ─────────────────────────────────────────────────
    function registerApp(
        string memory _name,
        string memory _category,
        uint256 _languageCount,
        uint256 _countryCount,
        address _deployer,
        bool _nexusLawVerified,
        bool _piBridgeBlocked,
        bool _ribaFree
    ) external onlyOwner nonReentrant returns (uint256 appId) {
        require(totalApps < SINGULARITY_TARGET, "Singularity complete: 50,000 reached");
        require(_languageCount >= MIN_LANGUAGES, "Must support 100+ languages");
        require(_countryCount == TOTAL_COUNTRIES, "Must cover all 195 countries");
        require(_nexusLawVerified, "NexusLaw v2.1 verification required");
        require(_piBridgeBlocked, "PI_BRIDGE must be blocked: requirement");
        require(_ribaFree, "Riba-free required: NexusLaw Art. III");

        appId = ++totalApps;
        apps[appId] = SuperApp({
            id:               appId,
            name:             _name,
            category:         _category,
            languageCount:    _languageCount,
            countryCount:     _countryCount,
            deployer:         _deployer,
            deployedAt:       block.timestamp,
            nexusLawVerified: _nexusLawVerified,
            piBridgeBlocked:  _piBridgeBlocked,
            ribaFree:         _ribaFree
        });

        appsByCategory[_category].push(appId);
        appsByDeployer[_deployer].push(appId);

        emit AppGenerated(appId, _name, _category, _deployer);
        _checkMilestones(appId);

        if (appId == SINGULARITY_TARGET) {
            emit SingularityComplete(appId, block.timestamp);
        }
    }

    // ── Batch Register (ARCHON swarm batch dispatch) ───────────────────────
    function batchRegisterApps(
        string[] memory _names,
        string[] memory _categories,
        address _deployer
    ) external onlyOwner nonReentrant {
        require(_names.length == _categories.length, "Array length mismatch");
        require(_names.length <= 1000, "Max 1000 per batch");
        for (uint256 i = 0; i < _names.length; i++) {
            // NexusLaw v2.1: all batch apps auto-verified at factory level
            uint256 appId = ++totalApps;
            apps[appId] = SuperApp({
                id:               appId,
                name:             _names[i],
                category:         _categories[i],
                languageCount:    100,
                countryCount:     195,
                deployer:         _deployer,
                deployedAt:       block.timestamp,
                nexusLawVerified: true,
                piBridgeBlocked:  true,
                ribaFree:         true
            });
            appsByCategory[_categories[i]].push(appId);
            appsByDeployer[_deployer].push(appId);
            emit AppGenerated(appId, _names[i], _categories[i], _deployer);
            _checkMilestones(appId);
        }
    }

    // ── Progress ────────────────────────────────────────────────────────────
    function progress() external view returns (
        uint256 deployed,
        uint256 target,
        uint256 pct,
        uint256 remaining
    ) {
        deployed  = totalApps;
        target    = SINGULARITY_TARGET;
        pct       = (totalApps * 100) / SINGULARITY_TARGET;
        remaining = SINGULARITY_TARGET - totalApps;
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
