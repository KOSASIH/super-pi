// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Super Pi v16.0.1-patch2 | RWAVaultFactory v1.2
// Fixes (this version):
//   RWA-N3 HIGH (BLOCKER): yield dilution — Synthetix rewards-per-token-accumulated model
//   RWA-N1 HIGH (advisory): per-vault token balance (safe for multi-vault same-token)
// Prior fixes retained: RWA-01..06
// NexusLaw v6.1 Art.40 (halal) | noForeignToken() mandate ENFORCED

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISPIRegistry {
    function noForeignToken(address token) external view returns (bool);
    function isApprovedSPIToken(address token) external view returns (bool);
}

contract RWAVaultFactory is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant VAULT_MANAGER = keccak256("VAULT_MANAGER");
    bytes32 public constant SHARIAH_BOARD = keccak256("SHARIAH_BOARD");

    ISPIRegistry public immutable spiRegistry;
    mapping(address => bool) public bannedTokens;

    enum AssetClass { TBILL, REAL_ESTATE, SUKUK, MURABAHA }

    struct VaultSpec {
        uint256  vaultId;
        string   name;
        AssetClass assetClass;
        uint256  targetSize;
        uint256  collateralBps;
        address  spiToken;
        bool     halalCertified;
        uint256  totalDeposited;
        bool     active;
        uint256  vaultTokenBalance; // RWA-N1: per-vault balance
    }

    uint256 public nextVaultId;
    mapping(uint256 => VaultSpec) public vaults;
    mapping(uint256 => mapping(address => uint256)) public userDeposits;

    // RWA-N3: Synthetix rewards-per-token
    mapping(uint256 => uint256) public rewardPerTokenStored;
    mapping(uint256 => mapping(address => uint256)) public userRewardPerTokenPaid;
    mapping(uint256 => mapping(address => uint256)) public pendingRewards;

    event VaultCreated(uint256 indexed vaultId, string name, AssetClass assetClass);
    event Deposited(uint256 indexed vaultId, address indexed user, uint256 amount);
    event Withdrawn(uint256 indexed vaultId, address indexed user, uint256 amount);
    event YieldReserveFunded(uint256 indexed vaultId, uint256 amount, uint256 rewardPerTokenDelta);
    event YieldClaimed(uint256 indexed vaultId, address indexed user, uint256 amount);
    event HalalCertified(uint256 indexed vaultId, address certifier);
    event VaultDeactivated(uint256 indexed vaultId);
    event TokenBanned(address indexed token);

    constructor(address _shariahBoard, address _spiRegistry) {
        require(_shariahBoard != address(0), "RWA: SHARIAH_BOARD is zero address");
        require(_shariahBoard != msg.sender, "RWA: SHARIAH_BOARD must be independent multisig");
        require(_spiRegistry  != address(0), "RWA: zero registry");
        spiRegistry = ISPIRegistry(_spiRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VAULT_MANAGER,      msg.sender);
        _grantRole(SHARIAH_BOARD,      _shariahBoard);
    }

    modifier onlyLegalToken(address token) {
        require(!bannedTokens[token],                  "RWA: token banned (Pi Coin list)");
        require(spiRegistry.noForeignToken(token),     "RWA: Pi/foreign token blocked");
        require(spiRegistry.isApprovedSPIToken(token), "RWA: not an approved SPI token");
        _;
    }

    modifier updateReward(uint256 vaultId, address user) {
        if (user != address(0)) {
            pendingRewards[vaultId][user]         = earned(vaultId, user);
            userRewardPerTokenPaid[vaultId][user] = rewardPerTokenStored[vaultId];
        }
        _;
    }

    function banToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bannedTokens[token] = true; emit TokenBanned(token);
    }

    function createVault(string calldata name, AssetClass assetClass, uint256 targetSize, address spiToken)
        external onlyRole(VAULT_MANAGER) onlyLegalToken(spiToken) returns (uint256 vaultId)
    {
        require(targetSize > 0, "RWA: zero target size");
        vaultId = ++nextVaultId;
        vaults[vaultId] = VaultSpec({
            vaultId: vaultId, name: name, assetClass: assetClass,
            targetSize: targetSize, collateralBps: 11_000, spiToken: spiToken,
            halalCertified: false, totalDeposited: 0, active: false, vaultTokenBalance: 0
        });
        emit VaultCreated(vaultId, name, assetClass);
    }

    function certifyHalal(uint256 vaultId) external onlyRole(SHARIAH_BOARD) {
        require(vaults[vaultId].vaultId != 0, "RWA: vault not found");
        vaults[vaultId].halalCertified = true;
        vaults[vaultId].active = true;
        emit HalalCertified(vaultId, msg.sender);
    }

    function deactivateVault(uint256 vaultId) external onlyRole(VAULT_MANAGER) {
        vaults[vaultId].active = false; emit VaultDeactivated(vaultId);
    }

    function deposit(uint256 vaultId, uint256 amount)
        external nonReentrant updateReward(vaultId, msg.sender)
    {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified, "RWA: not halal-certified");
        require(v.active,         "RWA: vault not active");
        require(amount > 0,       "RWA: zero amount");
        require(v.totalDeposited + amount <= v.targetSize, "RWA: vault capacity reached");
        IERC20(v.spiToken).safeTransferFrom(msg.sender, address(this), amount);
        v.totalDeposited       += amount;
        v.vaultTokenBalance    += amount;
        userDeposits[vaultId][msg.sender] += amount;
        _assertCollateral(v);
        emit Deposited(vaultId, msg.sender, amount);
    }

    function withdraw(uint256 vaultId, uint256 amount)
        external nonReentrant updateReward(vaultId, msg.sender)
    {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified, "RWA: not halal-certified");
        require(amount > 0,       "RWA: zero amount");
        require(userDeposits[vaultId][msg.sender] >= amount, "RWA: insufficient balance");
        userDeposits[vaultId][msg.sender] -= amount;
        v.totalDeposited    -= amount;
        v.vaultTokenBalance -= amount;
        IERC20(v.spiToken).safeTransfer(msg.sender, amount);
        emit Withdrawn(vaultId, msg.sender, amount);
    }

    function fundYieldReserve(uint256 vaultId, uint256 amount)
        external nonReentrant onlyRole(VAULT_MANAGER)
    {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified,     "RWA: not halal-certified");
        require(amount > 0,           "RWA: zero yield amount");
        require(v.totalDeposited > 0, "RWA: no depositors");
        IERC20(v.spiToken).safeTransferFrom(msg.sender, address(this), amount);
        uint256 delta = (amount * 1e18) / v.totalDeposited;
        rewardPerTokenStored[vaultId] += delta;
        v.vaultTokenBalance += amount;
        emit YieldReserveFunded(vaultId, amount, delta);
    }

    function claimYield(uint256 vaultId)
        external nonReentrant updateReward(vaultId, msg.sender)
    {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified, "RWA: not halal-certified");
        uint256 reward = pendingRewards[vaultId][msg.sender];
        require(reward > 0, "RWA: no unclaimed yield");
        pendingRewards[vaultId][msg.sender] = 0;
        v.vaultTokenBalance -= reward;
        IERC20(v.spiToken).safeTransfer(msg.sender, reward);
        emit YieldClaimed(vaultId, msg.sender, reward);
    }

    function earned(uint256 vaultId, address user) public view returns (uint256) {
        uint256 delta = rewardPerTokenStored[vaultId] - userRewardPerTokenPaid[vaultId][user];
        return (userDeposits[vaultId][user] * delta) / 1e18 + pendingRewards[vaultId][user];
    }

    function getPendingYield(uint256 vaultId, address user) external view returns (uint256) {
        return earned(vaultId, user);
    }

    function _assertCollateral(VaultSpec storage v) internal view {
        if (v.totalDeposited == 0) return;
        uint256 required = (v.totalDeposited * v.collateralBps) / 10_000;
        require(v.vaultTokenBalance >= required, "RWA: undercollateralised — 110% requirement not met");
    }

    function isCollateralHealthy(uint256 vaultId) external view returns (bool) {
        VaultSpec storage v = vaults[vaultId];
        if (v.totalDeposited == 0) return true;
        return v.vaultTokenBalance >= (v.totalDeposited * v.collateralBps) / 10_000;
    }
}
