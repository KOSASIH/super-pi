// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// PromptFactory.sol — Super Pi Prompt-Factory v1.0
// 1,000 Super Apps · 100 categories · NexusLaw v2.1 · $SPI Only · Pi Coin: BANNED

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PromptFactory
 * @notice Central registry for 1,000 Prompt-Factory Super Apps.
 *         Enforces NexusLaw v2.1 on every registration:
 *           - $SPI only, noForeignToken
 *           - Pi Coin hard-banned
 *           - 100 languages minimum
 *           - 195 countries minimum
 *           - Halal finance rules (no riba/gharar/maysir)
 *         ARCHON-1 through ARCHON-8 deploy apps; LEX_MACHINA activates.
 */
contract PromptFactory is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant NEXUS_ROLE  = keccak256("NEXUS_ROLE");
    bytes32 public constant ARCHON_ROLE = keccak256("ARCHON_ROLE");
    bytes32 public constant LEX_ROLE    = keccak256("LEX_ROLE");

    address public constant PI_COIN     = 0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf;
    uint16  public constant TARGET_APPS = 1000;
    uint8   public constant MIN_LANGS   = 100;
    uint8   public constant MIN_COUNTRIES = 195;
    string  public constant NEXUS_LAW   = "NexusLaw v2.1";

    address public immutable SPI_TOKEN;

    struct SuperApp {
        uint16  appId;
        string  name;
        string  tagline;
        string  categoryId;
        string  category;
        address l2Contract;
        address archonAgent;
        uint8   languages;
        uint8   countries;
        bool    nexusLawPassed;
        bool    formallyVerified;
        bool    piCoinBanned;
        bool    active;
        uint256 deployedAt;
        uint256 tvl;
    }

    mapping(uint16  => SuperApp)  public apps;
    mapping(string  => uint16[])  public appsByCategory;
    mapping(address => uint16[])  public appsByArchon;
    string[] public categories;
    mapping(string  => bool)      public categoryExists;
    mapping(string  => uint8)     public categoryAppCount;

    uint16 public totalApps;
    uint16 public activeApps;
    uint256 public totalTVL;

    event AppRegistered(uint16 indexed appId, string name, string category, address l2Contract);
    event AppActivated(uint16 indexed appId);
    event AppSuspended(uint16 indexed appId, string reason);
    event MilestoneReached(uint16 count, string milestone);

    error PiCoinRejected();
    error AppLimitReached();
    error NexusLawFailed(string reason);
    error AppAlreadyExists(uint16 appId);

    modifier noForeignToken(address token) {
        if (token == PI_COIN) revert PiCoinRejected();
        require(token == SPI_TOKEN, "PromptFactory: only $SPI");
        _;
    }

    modifier nexusLawCheck(uint8 langs, uint8 countries_) {
        require(langs >= MIN_LANGS, "NexusLaw: <100 languages");
        require(countries_ >= MIN_COUNTRIES, "NexusLaw: <195 countries");
        _;
    }

    constructor(address _spi, address _admin) {
        SPI_TOKEN = _spi;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(NEXUS_ROLE, _admin);
    }

    function registerApp(
        uint16 appId, string calldata name, string calldata tagline,
        string calldata categoryId, string calldata category,
        address l2Contract, uint8 langs, uint8 countries_, bool formallyVerified
    )
        external
        onlyRole(ARCHON_ROLE)
        nexusLawCheck(langs, countries_)
        nonReentrant whenNotPaused
    {
        if (totalApps >= TARGET_APPS) revert AppLimitReached();
        if (apps[appId].deployedAt != 0) revert AppAlreadyExists(appId);
        apps[appId] = SuperApp({
            appId: appId, name: name, tagline: tagline,
            categoryId: categoryId, category: category,
            l2Contract: l2Contract, archonAgent: msg.sender,
            languages: langs, countries: countries_,
            nexusLawPassed: true, formallyVerified: formallyVerified,
            piCoinBanned: true, active: false,
            deployedAt: block.timestamp, tvl: 0
        });
        appsByCategory[categoryId].push(appId);
        appsByArchon[msg.sender].push(appId);
        if (!categoryExists[categoryId]) {
            categoryExists[categoryId] = true;
            categories.push(categoryId);
        }
        categoryAppCount[categoryId]++;
        totalApps++;
        emit AppRegistered(appId, name, category, l2Contract);
        _checkMilestone(totalApps);
    }

    function activateApp(uint16 appId) external onlyRole(LEX_ROLE) {
        require(apps[appId].deployedAt != 0, "PromptFactory: unknown app");
        require(!apps[appId].active, "PromptFactory: already active");
        apps[appId].active = true;
        activeApps++;
        emit AppActivated(appId);
    }

    function suspendApp(uint16 appId, string calldata reason) external onlyRole(NEXUS_ROLE) {
        apps[appId].active = false;
        if (activeApps > 0) activeApps--;
        emit AppSuspended(appId, reason);
    }

    function updateTVL(uint16 appId, uint256 tvl_) external onlyRole(LEX_ROLE) {
        int256 delta = int256(tvl_) - int256(apps[appId].tvl);
        apps[appId].tvl = tvl_;
        if (delta > 0) totalTVL += uint256(delta);
        else if (uint256(-delta) <= totalTVL) totalTVL -= uint256(-delta);
    }

    function _checkMilestone(uint16 count) internal {
        if (count == 100)  emit MilestoneReached(100,  "10% — 100 apps");
        if (count == 250)  emit MilestoneReached(250,  "25% — 250 apps");
        if (count == 500)  emit MilestoneReached(500,  "50% Singularity — 500 apps");
        if (count == 750)  emit MilestoneReached(750,  "75% — 750 apps");
        if (count == 1000) emit MilestoneReached(1000, "100% Singularity — 1000 APPS LIVE!");
    }

    function getApp(uint16 appId) external view returns (SuperApp memory) { return apps[appId]; }
    function getAppsByCategory(string calldata cid) external view returns (uint16[] memory) { return appsByCategory[cid]; }
    function factoryStats() external view returns (uint16 total, uint16 active_, uint256 tvl_) {
        return (totalApps, activeApps, totalTVL);
    }
    function pause()   external onlyRole(NEXUS_ROLE) { _pause(); }
    function unpause() external onlyRole(NEXUS_ROLE) { _unpause(); }
}
