// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/// @title SPIStablecoin — $314,159 Pure Pi Stablecoin v3.0
/// @notice Production-grade stablecoin pegged at $314,159 per SPI token with full DeFi guard rails
/// @dev RBAC + reentrancy guard + pause + taint rejection + KYC + daily limits
/// @custom:security-contact security@super-pi.io
contract SPIStablecoin is ERC20, ERC20Permit, ERC20Burnable, AccessControl, ReentrancyGuard, Pausable {

    // ===== ROLES =====
    bytes32 public constant MINTER_ROLE        = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE        = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE        = keccak256("ORACLE_ROLE");
    bytes32 public constant TAINT_MANAGER_ROLE = keccak256("TAINT_MANAGER_ROLE");
    bytes32 public constant KYC_MANAGER_ROLE   = keccak256("KYC_MANAGER_ROLE");

    // ===== CONSTANTS =====
    /// @notice SPI pegged at exactly $314,159 USD (Chainlink 8-decimal format)
    uint256 public constant SPI_PEG_USD         = 314_159 * 1e8;
    uint256 public constant MIN_COLLATERAL_RATIO = 110; // 110%
    uint256 public constant MAX_SUPPLY          = 1_000_000_000 * 1e18; // 1B SPI
    uint256 public constant ORACLE_STALENESS    = 3600; // 1 hour max staleness
    uint256 public constant DEFAULT_DAILY_LIMIT = 1_000_000 * 1e18; // 1M SPI/day/address

    // ===== STATE =====
    AggregatorV3Interface public immutable usdPriceFeed;
    uint256 public totalFiatCollateral;
    uint256 public lastCollateralUpdate;
    uint256 public dailyMintLimit;

    mapping(address => bool)    public taintedAddresses;
    mapping(address => bool)    public kycVerified;
    mapping(address => uint256) public dailyMinted;
    mapping(address => uint256) public lastMintDay;

    // ===== EVENTS =====
    event FiatDeposit(address indexed reporter, uint256 usdAmount, string currency);
    event FiatWithdrawal(address indexed reporter, uint256 usdAmount, string currency);
    event CollateralUpdated(uint256 newTotal);
    event AddressTainted(address indexed addr, string reason);
    event AddressBatchTainted(uint256 count, string reason);
    event KYCGranted(address indexed user);
    event KYCRevoked(address indexed user);
    event EmergencyPaused(address indexed by, string reason);
    event DailyLimitUpdated(uint256 newLimit);
    event MintExecuted(address indexed to, uint256 amount, uint256 newSupply);

    // ===== CUSTOM ERRORS =====
    error TaintedAddress(address addr);
    error InsufficientCollateral(uint256 required, uint256 actual);
    error KYCRequired(address addr);
    error DailyMintLimitExceeded(uint256 attempted, uint256 remaining);
    error StaleOracle(uint256 updatedAt, uint256 maxAge);
    error MaxSupplyExceeded(uint256 requested, uint256 available);
    error ZeroAmount();
    error InvalidPriceFeed();
    error PiCoinIntegrationBlocked();

    // ===== CONSTRUCTOR =====
    constructor(address _usdPriceFeed)
        ERC20("Super Pi USD Stablecoin", "SPI")
        ERC20Permit("Super Pi USD Stablecoin")
    {
        if (_usdPriceFeed == address(0)) revert InvalidPriceFeed();
        usdPriceFeed = AggregatorV3Interface(_usdPriceFeed);
        dailyMintLimit = DEFAULT_DAILY_LIMIT;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE,        msg.sender);
        _grantRole(PAUSER_ROLE,        msg.sender);
        _grantRole(ORACLE_ROLE,        msg.sender);
        _grantRole(TAINT_MANAGER_ROLE, msg.sender);
        _grantRole(KYC_MANAGER_ROLE,   msg.sender);
    }

    // ===== MODIFIERS =====
    modifier notTainted(address addr) {
        if (taintedAddresses[addr]) revert TaintedAddress(addr);
        _;
    }

    modifier requireKYC(address addr) {
        if (!kycVerified[addr]) revert KYCRequired(addr);
        _;
    }

    // ===== MINT / BURN =====

    /// @notice Mint SPI to a KYC-verified, non-tainted address
    function mint(address to, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
        whenNotPaused
        nonReentrant
        notTainted(to)
        requireKYC(to)
    {
        if (amount == 0) revert ZeroAmount();

        uint256 available = MAX_SUPPLY - totalSupply();
        if (amount > available) revert MaxSupplyExceeded(amount, available);

        // Daily limit enforcement
        uint256 today = block.timestamp / 1 days;
        if (lastMintDay[to] < today) {
            dailyMinted[to] = 0;
            lastMintDay[to] = today;
        }
        uint256 remaining = dailyMintLimit - dailyMinted[to];
        if (amount > remaining) revert DailyMintLimitExceeded(amount, remaining);

        // Collateral check (only when supply > 0)
        if (totalSupply() > 0) {
            uint256 ratio = getCollateralRatio();
            if (ratio < MIN_COLLATERAL_RATIO) {
                revert InsufficientCollateral(MIN_COLLATERAL_RATIO, ratio);
            }
        }

        dailyMinted[to] += amount;
        _mint(to, amount);

        emit MintExecuted(to, amount, totalSupply());
    }

    /// @notice Burn SPI from caller's balance
    function burn(uint256 amount) public override whenNotPaused nonReentrant {
        if (amount == 0) revert ZeroAmount();
        super.burn(amount);
    }

    // ===== PEG =====

    /// @notice Returns SPI peg value: always $314,159 (Chainlink 8-decimal format)
    function getSPIUSDValue() external pure returns (uint256) {
        return SPI_PEG_USD;
    }

    /// @notice Compute collateral ratio; returns type(uint256).max when supply is 0
    function getCollateralRatio() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return type(uint256).max;

        (, int256 price, , uint256 updatedAt, ) = usdPriceFeed.latestRoundData();
        if (block.timestamp - updatedAt > ORACLE_STALENESS)
            revert StaleOracle(updatedAt, ORACLE_STALENESS);
        if (price <= 0) revert InvalidPriceFeed();

        return (totalFiatCollateral * uint256(price) * 100) / supply;
    }

    // ===== TAINT MANAGEMENT =====

    /// @notice Taint a single address — PERMANENT for exchange/Pi contacts
    function taintAddress(address addr, string calldata reason)
        external
        onlyRole(TAINT_MANAGER_ROLE)
    {
        taintedAddresses[addr] = true;
        emit AddressTainted(addr, reason);
    }

    /// @notice Batch-taint multiple addresses — gas-efficient for AI oracle bulk submissions
    function batchTaint(address[] calldata addrs, string calldata reason)
        external
        onlyRole(TAINT_MANAGER_ROLE)
    {
        for (uint256 i; i < addrs.length; ++i) {
            taintedAddresses[addrs[i]] = true;
        }
        emit AddressBatchTainted(addrs.length, reason);
    }

    // ===== PI COIN GUARD =====

    /// @notice Pi Coin integration is PERMANENTLY blocked at contract level
    /// @dev Any call to integrate Pi Coin will always revert
    function integratePiCoin(address) external pure {
        revert PiCoinIntegrationBlocked();
    }

    // ===== KYC =====

    function grantKYC(address user) external onlyRole(KYC_MANAGER_ROLE) {
        kycVerified[user] = true;
        emit KYCGranted(user);
    }

    function revokeKYC(address user) external onlyRole(KYC_MANAGER_ROLE) {
        kycVerified[user] = false;
        emit KYCRevoked(user);
    }

    // ===== COLLATERAL REPORTING =====

    function depositFiatReported(uint256 usdAmount, string calldata currency)
        external
        onlyRole(ORACLE_ROLE)
    {
        if (usdAmount == 0) revert ZeroAmount();
        totalFiatCollateral += usdAmount;
        lastCollateralUpdate = block.timestamp;
        emit FiatDeposit(msg.sender, usdAmount, currency);
        emit CollateralUpdated(totalFiatCollateral);
    }

    function withdrawFiatReported(uint256 usdAmount, string calldata currency)
        external
        onlyRole(ORACLE_ROLE)
    {
        if (usdAmount == 0) revert ZeroAmount();
        require(totalFiatCollateral >= usdAmount, "SPI: collateral underflow");
        totalFiatCollateral -= usdAmount;
        emit FiatWithdrawal(msg.sender, usdAmount, currency);
        emit CollateralUpdated(totalFiatCollateral);
    }

    // ===== ADMIN =====

    function setDailyMintLimit(uint256 newLimit) external onlyRole(DEFAULT_ADMIN_ROLE) {
        dailyMintLimit = newLimit;
        emit DailyLimitUpdated(newLimit);
    }

    // ===== EMERGENCY =====

    function pause(string calldata reason) external onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ===== TRANSFER HOOKS =====

    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        if (from != address(0) && taintedAddresses[from]) revert TaintedAddress(from);
        if (to   != address(0) && taintedAddresses[to])   revert TaintedAddress(to);
        super._update(from, to, value);
    }

    // ===== INTERFACE SUPPORT =====

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC20, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
