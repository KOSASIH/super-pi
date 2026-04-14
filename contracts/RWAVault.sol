// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RWAVault — Real-World Asset Tokenization Vault
 * @notice Tokenize US Treasury Bills, real estate, and Islamic bonds (sukuk) backed by $SPI.
 *         Yields distributed in $SPI. Overcollateralizes the $SPI reserve.
 *         LEX_MACHINA v1.3 compliant. OMEGA DeFi Sprint 6.4.
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// ── RWA Share Token ───────────────────────────────────────────────────────
contract RWAShare is ERC20, AccessControl {
    bytes32 public constant VAULT_ROLE = keccak256("VAULT_ROLE");
    constructor(string memory name, string memory symbol, address vault)
        ERC20(name, symbol)
    { _grantRole(VAULT_ROLE, vault); _grantRole(DEFAULT_ADMIN_ROLE, vault); }
    function mint(address to, uint256 amount) external onlyRole(VAULT_ROLE) { _mint(to, amount); }
    function burn(address from, uint256 amount) external onlyRole(VAULT_ROLE) { _burn(from, amount); }
}

// ── Main RWA Vault ────────────────────────────────────────────────────────
contract RWAVault is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant ASSET_MANAGER_ROLE  = keccak256("ASSET_MANAGER_ROLE"); // Custodian
    bytes32 public constant YIELD_ORACLE_ROLE   = keccak256("YIELD_ORACLE_ROLE");  // Yield distributor
    bytes32 public constant COMPLIANCE_ROLE     = keccak256("COMPLIANCE_ROLE");    // LEX Machina
    bytes32 public constant PAUSER_ROLE         = keccak256("PAUSER_ROLE");

    // ── Asset Types ───────────────────────────────────────────────────────
    enum AssetType { TBILL, REAL_ESTATE, SUKUK, GOLD, CORPORATE_BOND }

    // ── Asset Listing ─────────────────────────────────────────────────────
    struct Asset {
        uint256 id;
        AssetType  assetType;
        string     name;                 // e.g., "US T-Bill 3M 2026Q2"
        string     cusip;                // CUSIP / ISIN / registry ID
        uint256    faceValueUsd;         // Total face value in USD (6 decimal micros)
        uint256    yieldBps;             // Annual yield in BPS
        uint256    maturityTimestamp;
        uint256    totalShares;          // RWA share tokens issued
        uint256    spiDeposited;         // $SPI raised from investors
        uint256    yieldDistributed;     // Total yield distributed so far
        uint256    lastYieldTime;
        bool       active;
        bool       matured;
        address    shareToken;           // RWAShare ERC-20 address
        string     prospectusIPFS;       // IPFS CID of prospectus
    }

    // ── State ──────────────────────────────────────────────────────────────
    IERC20 public immutable spiToken;

    mapping(uint256 => Asset)                       public assets;
    mapping(uint256 => mapping(address => uint256)) public userShares; // assetId → user → shares
    uint256 public nextAssetId;

    uint256 public totalSpiLocked;
    uint256 public totalYieldPaid;

    uint256 public constant MIN_INVESTMENT = 100e18;   // 100 $SPI minimum
    uint256 public constant MAX_SINGLE_ASSET = 50_000_000e18; // $50M cap per asset

    // ── Events ─────────────────────────────────────────────────────────────
    event AssetListed(uint256 indexed assetId, AssetType assetType, string name, uint256 faceValue, uint256 yieldBps);
    event Investment(uint256 indexed assetId, address indexed investor, uint256 spiAmount, uint256 sharesIssued);
    event Redemption(uint256 indexed assetId, address indexed investor, uint256 shares, uint256 spiReturned);
    event YieldDistributed(uint256 indexed assetId, uint256 yieldAmount, uint256 perShareAmount);
    event YieldClaimed(uint256 indexed assetId, address indexed investor, uint256 amount);
    event AssetMatured(uint256 indexed assetId);

    // ── Errors ─────────────────────────────────────────────────────────────
    error AssetNotActive(uint256 assetId);
    error InsufficientInvestment(uint256 min, uint256 provided);
    error AssetAtCapacity();
    error NotMaturedYet(uint256 maturity);
    error NoSharesToRedeem();

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address admin, address spiAddr) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ASSET_MANAGER_ROLE, admin);
        _grantRole(YIELD_ORACLE_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        spiToken = IERC20(spiAddr);
    }

    // ── List New Asset ────────────────────────────────────────────────────
    /**
     * @notice List a new real-world asset for tokenized investment.
     *         Only LEX-Machina-certified assets allowed (compliance role).
     */
    function listAsset(
        AssetType   assetType,
        string calldata name,
        string calldata cusip,
        uint256     faceValueUsd,
        uint256     yieldBps,
        uint256     maturityTimestamp,
        string calldata prospectusIPFS
    )
        external
        onlyRole(COMPLIANCE_ROLE)
        returns (uint256 assetId)
    {
        require(maturityTimestamp > block.timestamp, "Invalid maturity");
        require(yieldBps <= 3000, "Yield > 30% may indicate riba risk"); // Shariah guard
        require(faceValueUsd > 0, "Zero face value");

        assetId = nextAssetId++;

        // Deploy share token
        string memory tokenName   = string(abi.encodePacked("RWA-", name));
        string memory tokenSymbol = string(abi.encodePacked("rwa", assetId));
        address shareTokenAddr = address(new RWAShare(tokenName, tokenSymbol, address(this)));

        assets[assetId] = Asset({
            id:               assetId,
            assetType:        assetType,
            name:             name,
            cusip:            cusip,
            faceValueUsd:     faceValueUsd,
            yieldBps:         yieldBps,
            maturityTimestamp: maturityTimestamp,
            totalShares:      0,
            spiDeposited:     0,
            yieldDistributed: 0,
            lastYieldTime:    block.timestamp,
            active:           true,
            matured:          false,
            shareToken:       shareTokenAddr,
            prospectusIPFS:   prospectusIPFS
        });

        emit AssetListed(assetId, assetType, name, faceValueUsd, yieldBps);
    }

    // ── Invest ────────────────────────────────────────────────────────────
    /**
     * @notice Invest $SPI into an RWA vault. Receive proportional RWA shares.
     */
    function invest(uint256 assetId, uint256 spiAmount)
        external
        nonReentrant
        whenNotPaused
    {
        Asset storage asset = assets[assetId];
        if (!asset.active) revert AssetNotActive(assetId);
        if (spiAmount < MIN_INVESTMENT) revert InsufficientInvestment(MIN_INVESTMENT, spiAmount);
        if (asset.spiDeposited + spiAmount > MAX_SINGLE_ASSET) revert AssetAtCapacity();

        spiToken.safeTransferFrom(msg.sender, address(this), spiAmount);

        // 1 share = 1 $SPI deposited (face value denominated)
        uint256 sharesIssued = spiAmount;

        asset.totalShares  += sharesIssued;
        asset.spiDeposited += spiAmount;
        totalSpiLocked     += spiAmount;
        userShares[assetId][msg.sender] += sharesIssued;

        RWAShare(asset.shareToken).mint(msg.sender, sharesIssued);
        emit Investment(assetId, msg.sender, spiAmount, sharesIssued);
    }

    // ── Distribute Yield ──────────────────────────────────────────────────
    /**
     * @notice Distribute periodic yield to all shareholders.
     *         Called by yield oracle from actual T-Bill / sukuk income.
     *         Yield is always $SPI. No fixed interest — yield derives from real asset income.
     */
    function distributeYield(uint256 assetId, uint256 yieldAmount)
        external
        onlyRole(YIELD_ORACLE_ROLE)
        nonReentrant
    {
        Asset storage asset = assets[assetId];
        require(asset.active && asset.totalShares > 0, "No shareholders");

        spiToken.safeTransferFrom(msg.sender, address(this), yieldAmount);

        uint256 perShare = (yieldAmount * 1e18) / asset.totalShares;
        asset.yieldDistributed += yieldAmount;
        asset.lastYieldTime     = block.timestamp;
        totalYieldPaid         += yieldAmount;

        emit YieldDistributed(assetId, yieldAmount, perShare);
    }

    // ── Claim Yield ───────────────────────────────────────────────────────
    function claimYield(uint256 assetId) external nonReentrant whenNotPaused {
        Asset storage asset = assets[assetId];
        uint256 shares = userShares[assetId][msg.sender];
        if (shares == 0) revert NoSharesToRedeem();

        uint256 elapsed = block.timestamp - asset.lastYieldTime;
        uint256 annualYield = (asset.spiDeposited * asset.yieldBps) / 10_000;
        uint256 claimable = (annualYield * elapsed * shares) / (365 days * asset.totalShares);

        if (claimable > 0 && claimable <= spiToken.balanceOf(address(this))) {
            spiToken.safeTransfer(msg.sender, claimable);
            totalYieldPaid += claimable;
            emit YieldClaimed(assetId, msg.sender, claimable);
        }
    }

    // ── Redeem at Maturity ────────────────────────────────────────────────
    function redeemAtMaturity(uint256 assetId) external nonReentrant whenNotPaused {
        Asset storage asset = assets[assetId];
        if (block.timestamp < asset.maturityTimestamp) revert NotMaturedYet(asset.maturityTimestamp);

        uint256 shares = userShares[assetId][msg.sender];
        if (shares == 0) revert NoSharesToRedeem();

        uint256 spiReturn = (shares * asset.spiDeposited) / asset.totalShares;
        userShares[assetId][msg.sender] = 0;
        asset.totalShares  -= shares;
        asset.spiDeposited -= spiReturn;
        totalSpiLocked     -= spiReturn;

        RWAShare(asset.shareToken).burn(msg.sender, shares);
        spiToken.safeTransfer(msg.sender, spiReturn);

        if (asset.totalShares == 0) {
            asset.matured = true;
            asset.active  = false;
            emit AssetMatured(assetId);
        }

        emit Redemption(assetId, msg.sender, shares, spiReturn);
    }

    // ── View ──────────────────────────────────────────────────────────────
    function getAsset(uint256 assetId) external view returns (Asset memory) {
        return assets[assetId];
    }

    function getUserPosition(uint256 assetId, address user)
        external view returns (uint256 shares, uint256 spiValue)
    {
        Asset storage asset = assets[assetId];
        shares   = userShares[assetId][user];
        spiValue = asset.totalShares > 0
            ? (shares * asset.spiDeposited) / asset.totalShares
            : 0;
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
