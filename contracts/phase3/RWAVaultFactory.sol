// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Super Pi v16.0.2-phase3.1 | RWAVaultFactory v1.2
// Changes from v1.1 (898c2a79):
//   [LM-2026-0604] Add HalalCert struct + halalCertURI mapping
//   [LM-2026-0604] certifyHalal() extended to accept + persist LEX Machina cert data
//   [LM-2026-0604] 30-day cert expiry: CertRenewalRequired event + triggerCertRenewal()
//   [LM-2026-0604] renewHalalCert() — SHARIAH_BOARD only
//   [LM-2026-0604] deposit() blocks on expired cert
//   [SAPIENS-PHASE3.1] nonReentrant note: fundYieldReserve + claimYield already guarded;
//                       distributeYield() does not exist in v1.1+ (replaced by fundYieldReserve)
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

    ISPIRegistry public immutable spiRegistry;
    mapping(address => bool) public bannedTokens;

    enum AssetClass { TBILL, REAL_ESTATE, SUKUK, MURABAHA }

    struct VaultSpec {
        uint256 vaultId; string name; AssetClass assetClass;
        uint256 targetSize; uint256 collateralBps; address spiToken;
        bool halalCertified; uint256 totalDeposited; uint256 yieldReserve; bool active;
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
    mapping(uint256 => mapping(address => uint256)) public userYieldClaimed;

    event VaultCreated(uint256 indexed vaultId, string name, AssetClass assetClass);
    event Deposited(uint256 indexed vaultId, address indexed user, uint256 amount);
    event Withdrawn(uint256 indexed vaultId, address indexed user, uint256 amount);
    event YieldReserveFunded(uint256 indexed vaultId, uint256 amount);
    event YieldClaimed(uint256 indexed vaultId, address indexed user, uint256 amount);
    event HalalCertified(uint256 indexed vaultId, address certifier, string certRef);
    event VaultDeactivated(uint256 indexed vaultId);
    event TokenBanned(address indexed token);
    event CertRenewalRequired(uint256 indexed vaultId, uint256 expiresAt, uint256 renewalDeadline);
    event HalalCertRenewed(uint256 indexed vaultId, string newCertRef, uint256 newExpiresAt, address renewedBy);

    constructor(address _shariahBoard, address _spiRegistry) {
        require(_shariahBoard != address(0),  "RWA: SHARIAH_BOARD is zero address");
        require(_shariahBoard != msg.sender,  "RWA: SHARIAH_BOARD must be independent multisig");
        require(_spiRegistry  != address(0),  "RWA: zero registry");
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

    modifier onlyActiveCert(uint256 vaultId) {
        require(vaults[vaultId].halalCertified,                        "RWA: not halal-certified");
        require(block.timestamp <= halalCertURI[vaultId].expiresAt,   "RWA: halal cert expired — renewal required");
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
            halalCertified: false, totalDeposited: 0, yieldReserve: 0, active: false
        });
        emit VaultCreated(vaultId, name, assetClass);
    }

    function certifyHalal(
        uint256 vaultId,
        string calldata certRef,
        string calldata standard,
        string calldata certURI,
        uint256 issuedAt,
        uint256 expiresAt,
        bool    dualCert
    ) external onlyRole(SHARIAH_BOARD) {
        require(vaults[vaultId].vaultId != 0, "RWA: vault not found");
        require(expiresAt > block.timestamp,   "RWA: cert already expired");
        require(bytes(certRef).length > 0,     "RWA: certRef empty");
        vaults[vaultId].halalCertified = true;
        vaults[vaultId].active = true;
        halalCertURI[vaultId] = HalalCert({ certRef: certRef, standard: standard, certURI: certURI, issuedAt: issuedAt, expiresAt: expiresAt, dualCert: dualCert });
        emit HalalCertified(vaultId, msg.sender, certRef);
    }

    function triggerCertRenewal(uint256 vaultId) external {
        require(vaults[vaultId].vaultId != 0, "RWA: vault not found");
        HalalCert storage cert = halalCertURI[vaultId];
        require(cert.expiresAt > 0, "RWA: vault not certified");
        uint256 renewalDeadline = cert.expiresAt - CERT_RENEWAL_WINDOW;
        require(block.timestamp >= renewalDeadline, "RWA: cert not yet in renewal window");
        emit CertRenewalRequired(vaultId, cert.expiresAt, renewalDeadline);
    }

    function renewHalalCert(
        uint256 vaultId,
        string calldata newCertRef,
        string calldata newStandard,
        string calldata newCertURI,
        uint256 newIssuedAt,
        uint256 newExpiresAt,
        bool    newDualCert
    ) external onlyRole(SHARIAH_BOARD) {
        require(vaults[vaultId].vaultId != 0, "RWA: vault not found");
        require(newExpiresAt > block.timestamp, "RWA: new expiry in the past");
        require(bytes(newCertRef).length > 0,   "RWA: certRef empty");
        halalCertURI[vaultId] = HalalCert({ certRef: newCertRef, standard: newStandard, certURI: newCertURI, issuedAt: newIssuedAt, expiresAt: newExpiresAt, dualCert: newDualCert });
        emit HalalCertRenewed(vaultId, newCertRef, newExpiresAt, msg.sender);
    }

    function deactivateVault(uint256 vaultId) external onlyRole(VAULT_MANAGER) {
        vaults[vaultId].active = false; emit VaultDeactivated(vaultId);
    }

    function deposit(uint256 vaultId, uint256 amount) external nonReentrant onlyActiveCert(vaultId) {
        VaultSpec storage v = vaults[vaultId];
        require(v.active,  "RWA: vault not active");
        require(amount > 0, "RWA: zero amount");
        require(v.totalDeposited + amount <= v.targetSize, "RWA: vault capacity reached");
        IERC20(v.spiToken).safeTransferFrom(msg.sender, address(this), amount);
        v.totalDeposited += amount;
        userDeposits[vaultId][msg.sender] += amount;
        _assertCollateral(v);
        emit Deposited(vaultId, msg.sender, amount);
    }

    function withdraw(uint256 vaultId, uint256 amount) external nonReentrant {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified, "RWA: not halal-certified");
        require(amount > 0,       "RWA: zero amount");
        require(userDeposits[vaultId][msg.sender] >= amount, "RWA: insufficient balance");
        userDeposits[vaultId][msg.sender] -= amount;
        v.totalDeposited -= amount;
        IERC20(v.spiToken).safeTransfer(msg.sender, amount);
        emit Withdrawn(vaultId, msg.sender, amount);
    }

    function fundYieldReserve(uint256 vaultId, uint256 amount)
        external nonReentrant onlyRole(VAULT_MANAGER)
    {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified, "RWA: not halal-certified");
        require(amount > 0,       "RWA: zero yield amount");
        IERC20(v.spiToken).safeTransferFrom(msg.sender, address(this), amount);
        v.yieldReserve += amount;
        emit YieldReserveFunded(vaultId, amount);
    }

    function claimYield(uint256 vaultId) external nonReentrant {
        VaultSpec storage v = vaults[vaultId];
        require(v.halalCertified,     "RWA: not halal-certified");
        require(v.totalDeposited > 0, "RWA: no deposits in vault");
        uint256 userShare = userDeposits[vaultId][msg.sender];
        require(userShare > 0, "RWA: no deposit");
        uint256 entitled  = (v.yieldReserve * userShare) / v.totalDeposited;
        uint256 claimed   = userYieldClaimed[vaultId][msg.sender];
        require(entitled > claimed, "RWA: no unclaimed yield");
        uint256 claimable = entitled - claimed;
        userYieldClaimed[vaultId][msg.sender] += claimable;
        IERC20(v.spiToken).safeTransfer(msg.sender, claimable);
        emit YieldClaimed(vaultId, msg.sender, claimable);
    }

    function _assertCollateral(VaultSpec storage v) internal view {
        if (v.totalDeposited == 0) return;
        uint256 required = (v.totalDeposited * v.collateralBps) / 10_000;
        uint256 held     = IERC20(v.spiToken).balanceOf(address(this));
        require(held >= required, "RWA: undercollateralised — 110% requirement not met");
    }

    function isCollateralHealthy(uint256 vaultId) external view returns (bool) {
        VaultSpec storage v = vaults[vaultId];
        if (v.totalDeposited == 0) return true;
        uint256 required = (v.totalDeposited * v.collateralBps) / 10_000;
        return IERC20(v.spiToken).balanceOf(address(this)) >= required;
    }

    function getPendingYield(uint256 vaultId, address user) external view returns (uint256) {
        VaultSpec storage v = vaults[vaultId];
        if (v.totalDeposited == 0) return 0;
        uint256 userShare = userDeposits[vaultId][user];
        if (userShare == 0) return 0;
        uint256 entitled = (v.yieldReserve * userShare) / v.totalDeposited;
        uint256 claimed  = userYieldClaimed[vaultId][user];
        return entitled > claimed ? entitled - claimed : 0;
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
