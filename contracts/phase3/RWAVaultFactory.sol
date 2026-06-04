// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Super Pi v16.0.2-phase3.1 | RWAVaultFactory v1.3
// Changes from v1.2:
//   [RWA-N3] FIX: Yield accounting — replaced proportional division with
//            Synthetix rewards-per-token-accumulated model.
//            Prevents retroactive dilution of early depositors on late fundYieldReserve() calls.
//            State added: rewardPerTokenStored[vaultId], userRewardPerTokenPaid[vaultId][user],
//                         rewards[vaultId][user]
//            Removed: userYieldClaimed (replaced entirely)
//   [RWA-N4] FIX: _assertCollateral() cross-vault contamination — replaced balanceOf(address(this))
//            with per-vault vaultCollateral[vaultId] tracked on deposit/withdraw/fundYieldReserve/claimYield.
//   [LM-2026-0604] Retained: HalalCert struct + halalCertURI, certifyHalal(), triggerCertRenewal(),
//                  renewHalalCert(), onlyActiveCert, cert view helpers
//   [SAPIENS-PHASE3.1] nonReentrant already present on all mutating user functions; no distributeYield()
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

    uint256 public constant CERT_RENEWAL_WINDOW = 30 days;
    uint256 private constant PRECISION = 1e18;

    ISPIRegistry public immutable spiRegistry;
    mapping(address => bool) public bannedTokens;

    enum AssetClass { TBILL, REAL_ESTATE, SUKUK, MURABAHA }

    struct VaultSpec {
        uint256 vaultId;
        string  name;
        AssetClass assetClass;
        uint256 targetSize;
        uint256 collateralBps;
        address spiToken;
        bool    halalCertified;
        uint256 totalDeposited;
        uint256 yieldReserve;
        bool    active;
    }

    struct HalalCert {
        string  certRef;
        string  standard;
        string  certURI;
        uint256 issuedAt;
        uint256 expiresAt;
        bool    dualCert;
    }

    uint256 public nextVaultId;
    mapping(uint256 => VaultSpec)  public vaults;
    mapping(uint256 => HalalCert)  public halalCertURI;
    mapping(uint256 => mapping(address => uint256)) public userDeposits;

    // [RWA-N3] Synthetix rewards-per-token state
    mapping(uint256 => uint256) public rewardPerTokenStored;
    mapping(uint256 => mapping(address => uint256)) public userRewardPerTokenPaid;
    mapping(uint256 => mapping(address => uint256)) public rewards;

    // [RWA-N4] Per-vault token balance (deposit+fundYield credited; withdraw+claimYield debited)
    mapping(uint256 => uint256) public vaultCollateral;

    // ── Events ──────────────────────────────────────────────────────────────────
    event VaultCreated(uint256 indexed vaultId, string name, AssetClass assetClass);
    event Deposited(uint256 indexed vaultId, address indexed user, uint256 amount);
    event Withdrawn(uint256 indexed vaultId, address indexed user, uint256 amount);
    event YieldReserveFunded(uint256 indexed vaultId, uint256 amount, uint256 newRewardPerToken);
    event YieldClaimed(uint256 indexed vaultId, address indexed user, uint256 amount);
    event HalalCertified(uint256 indexed vaultId, address certifier, string certRef);
    event VaultDeactivated(uint256 indexed vaultId);
    event TokenBanned(address indexed token);
    event CertRenewalRequired(uint256 indexed vaultId, uint256 expiresAt, uint256 renewalDeadline);
    event HalalCertRenewed(uint256 indexed vaultId, string newCertRef, uint256 newExpiresAt, address renewedBy);

    // ── Constructor ────────────────────────────────────────────────────────────────
    constructor(address _shariahBoard, address _spiRegistry) {
        require(_shariahBoard != address(0),  "RWA: SHARIAH_BOARD is zero address");
        require(_shariahBoard != msg.sender,  "RWA: SHARIAH_BOARD must be independent multisig");
        require(_spiRegistry  != address(0),  "RWA: zero registry");
        spiRegistry = ISPIRegistry(_spiRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VAULT_MANAGER,      msg.sender);
        _grantRole(SHARIAH_BOARD,      _shariahBoard);
    }

    // ── Modifiers ───────────────────────────────────────────────────────────────
    modifier onlyLegalToken(address token) {
        require(!bannedTokens[token],                  "RWA: token banned");
        require(spiRegistry.noForeignToken(token),     "RWA: Pi/foreign token blocked");
        require(spiRegistry.isApprovedSPIToken(token), "RWA: not an approved SPI token");
        _;
    }

    modifier onlyActiveCert(uint256 vaultId) {
        require(vaults[vaultId].halalCertified,                      "RWA: not halal-certified");
        require(block.timestamp <= halalCertURI[vaultId].expiresAt,  "RWA: halal cert expired");
        _;
    }

    modifier updateReward(uint256 vaultId, address user) {
        rewards[vaultId][user] = earned(vaultId, user);
        userRewardPerTokenPaid[vaultId][user] = rewardPerTokenStored[vaultId];
        _;
    }

    // ── Admin ────────────────────────────────────────────────────────────────────
    function banToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bannedTokens[token] = true; emit TokenBanned(token);
    }

    // ── Vault management ───────────────────────────────────────────────────────────
    function createVault(string calldata name, AssetClass assetClass, uint256 targetSize, address spiToken)
        external onlyRole(VAULT_MANAGER) onlyLegalToken(spiToken) returns (uint256 vaultId)
    {
        require(targetSize > 0, "RWA: zero target size");
        vaultId = ++nextVaultId;
        vaults[vaultId] = VaultSpec({ vaultId: vaultId, name: name, assetClass: assetClass,
            targetSize: targetSize, collateralBps: 11_000, spiToken: spiToken,
            halalCertified: false, totalDeposited: 0, yieldReserve: 0, active: false });
        emit VaultCreated(vaultId, name, assetClass);
    }

    function certifyHalal(
        uint256 vaultId, string calldata certRef, string calldata standard,
        string calldata certURI, uint256 issuedAt, uint256 expiresAt, bool dualCert
    ) external onlyRole(SHARIAH_BOARD) {
        require(vaults[vaultId].vaultId != 0, "RWA: vault not found");
        require(expiresAt > block.timestamp,   "RWA: cert already expired");
        require(bytes(certRef).length > 0,     "RWA: certRef empty");
        vaults[vaultId].halalCertified = true;
        vaults[vaultId].active         = true;
        halalCertURI[vaultId] = HalalCert({ certRef: certRef, standard: standard, certURI: certURI,
            issuedAt: issuedAt, expiresAt: expiresAt, dualCert: dualCert });
        emit HalalCertified(vaultId, msg.sender, certRef);
    }

    function triggerCertRenewal(uint256 vaultId) external {
        require(vaults[vaultId].vaultId != 0, "RWA: vault not found");
        HalalCert storage cert = halalCertURI[vaultId];
        require(cert.expiresAt > 0, "RWA: vault not certified");
        uint256 renewalDeadline = cert.expiresAt - CERT_RENEWAL_WINDOW;
        require(block.timestamp >= renewalDeadline, "RWA: not yet in renewal window");
        emit CertRenewalRequired(vaultId, cert.expiresAt, renewalDeadline);
    }

    function renewHalalCert(
        uint256 vaultId, string calldata newCertRef, string calldata newStandard,
        string calldata newCertURI, uint256 newIssuedAt, uint256 newExpiresAt, bool newDualCert
    ) external onlyRole(SHARIAH_BOARD) {
        require(vaults[vaultId].vaultId != 0, "RWA: vault not found");
        require(newExpiresAt > block.timestamp, "RWA: expiry in the past");
        require(bytes(newCertRef).length > 0,   "RWA: certRef empty");
        halalCertURI[vaultId] = HalalCert({ certRef: newCertRef, standard: newStandard, certURI: newCertURI,
            issuedAt: newIssuedAt, expiresAt: newExpiresAt, dualCert: newDualCert });
        emit HalalCertRenewed(vaultId, newCertRef, newExpiresAt, msg.sender);
    }

    function deactivateVault(uint256 vaultId) external onlyRole(VAULT_MANAGER) {
        vaults[vaultId].active = false; emit VaultDeactivated(vaultId);
    }

    // ── User operations ───────────────────────────────────────────────────────────
    function deposit(uint256 vaultId, uint256 amount)
        external nonReentrant onlyActiveCert(vaultId) updateReward(vaultId, msg.sender)
    {
        VaultSpec storage v = vaults[vaultId];
        require(v.active,  "RWA: vault not active");
        require(amount > 0, "RWA: zero amount");
        require(v.totalDeposited + amount <= v.targetSize, "RWA: capacity reached");
        IERC20(v.spiToken).safeTransferFrom(msg.sender, address(this), amount);
        v.totalDeposited                  += amount;
        userDeposits[vaultId][msg.sender] += amount;
        vaultCollateral[vaultId]          += amount;
        _assertCollateral(v, vaultId);
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
        v.totalDeposited                  -= amount;
        vaultCollateral[vaultId]          -= amount;
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
        v.yieldReserve           += amount;
        vaultCollateral[vaultId] += amount;
        uint256 newRPT = rewardPerTokenStored[vaultId] + (amount * PRECISION) / v.totalDeposited;
        rewardPerTokenStored[vaultId] = newRPT;
        emit YieldReserveFunded(vaultId, amount, newRPT);
    }

    function claimYield(uint256 vaultId)
        external nonReentrant updateReward(vaultId, msg.sender)
    {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified, "RWA: not halal-certified");
        uint256 reward = rewards[vaultId][msg.sender];
        require(reward > 0, "RWA: no unclaimed yield");
        rewards[vaultId][msg.sender]  = 0;
        vaultCollateral[vaultId]     -= reward;
        IERC20(v.spiToken).safeTransfer(msg.sender, reward);
        emit YieldClaimed(vaultId, msg.sender, reward);
    }

    // ── Internal + view helpers ─────────────────────────────────────────────────────────
    function earned(uint256 vaultId, address user) public view returns (uint256) {
        return (
            userDeposits[vaultId][user]
            * (rewardPerTokenStored[vaultId] - userRewardPerTokenPaid[vaultId][user])
            / PRECISION
        ) + rewards[vaultId][user];
    }

    function _assertCollateral(VaultSpec storage v, uint256 vaultId) internal view {
        if (v.totalDeposited == 0) return;
        uint256 required = (v.totalDeposited * v.collateralBps) / 10_000;
        require(vaultCollateral[vaultId] >= required, "RWA: undercollateralised");
    }

    function isCollateralHealthy(uint256 vaultId) external view returns (bool) {
        VaultSpec storage v = vaults[vaultId];
        if (v.totalDeposited == 0) return true;
        uint256 required = (v.totalDeposited * v.collateralBps) / 10_000;
        return vaultCollateral[vaultId] >= required;
    }

    function getPendingYield(uint256 vaultId, address user) external view returns (uint256) {
        return earned(vaultId, user);
    }

    function isCertExpired(uint256 vaultId) external view returns (bool) {
        return block.timestamp > halalCertURI[vaultId].expiresAt;
    }

    function isCertInRenewalWindow(uint256 vaultId) external view returns (bool) {
        uint256 exp = halalCertURI[vaultId].expiresAt;
        if (exp == 0) return false;
        return block.timestamp >= exp - CERT_RENEWAL_WINDOW && block.timestamp <= exp;
    }
}
