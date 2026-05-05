// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED
// Omega Paymaster — ERC-4337 universal gasless relay, $SPI gas pricing
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
/// @title OmegaPaymaster
/// @notice Gasless UX for all Super Pi users. $SPI billing. Daily budget + subsidy.
/// @dev NEXUSLAW v4.0 Art.19: Gasless mandatory for all Super Apps.
contract OmegaPaymaster is Ownable {
    IERC20 public immutable SPI;
    uint256 public constant GAS_PRICE_SPI = 0.001e18;
    uint256 public constant DAILY_GAS_BUDGET = 10_000;
    uint256 public constant FREE_GAS_MERCHANT_CAP = 100_000;
    struct UserAccount { uint256 gasUsedToday; uint256 lastResetDay; uint256 spiBalance; bool isWhitelisted; }
    struct AppGasStats { uint256 totalGasSponsored; uint256 dailyGasCap; bool registered; }
    mapping(address => UserAccount) public users;
    mapping(address => AppGasStats) public apps;
    uint256 public totalSubsidyPool;
    event GasSponsored(address indexed user, address indexed app, uint256 gas, uint256 spi);
    event SubsidyDeposit(address indexed src, uint256 amount);
    event UserDeposit(address indexed user, uint256 amount);
    error InsufficientGasBalance();
    constructor(address spi, address owner_) Ownable(owner_) { SPI = IERC20(spi); }
    function depositGas(uint256 amount) external {
        SPI.transferFrom(msg.sender,address(this),amount);
        users[msg.sender].spiBalance+=amount; emit UserDeposit(msg.sender,amount);
    }
    function addSubsidy(uint256 amount) external {
        SPI.transferFrom(msg.sender,address(this),amount);
        totalSubsidyPool+=amount; emit SubsidyDeposit(msg.sender,amount);
    }
    function registerApp(address app, uint256 cap) external onlyOwner {
        apps[app] = AppGasStats(0,cap,true);
    }
    function setMerchant(address m, bool s) external onlyOwner { users[m].isWhitelisted=s; }
    function sponsorGas(address user, address app, uint256 gasUnits) external returns (uint256 spiCharged) {
        require(apps[app].registered);
        UserAccount storage ua = users[user];
        uint256 today = block.timestamp/1 days;
        if(ua.lastResetDay<today){ ua.gasUsedToday=0; ua.lastResetDay=today; }
        uint256 budget = ua.isWhitelisted?FREE_GAS_MERCHANT_CAP:DAILY_GAS_BUDGET;
        require(ua.gasUsedToday+gasUnits<=budget,"Daily limit");
        spiCharged = gasUnits*GAS_PRICE_SPI/1e18;
        if(ua.spiBalance>=spiCharged) ua.spiBalance-=spiCharged;
        else if(ua.isWhitelisted&&totalSubsidyPool>=spiCharged) totalSubsidyPool-=spiCharged;
        else revert InsufficientGasBalance();
        ua.gasUsedToday+=gasUnits; apps[app].totalGasSponsored+=gasUnits;
        emit GasSponsored(user,app,gasUnits,spiCharged);
    }
}
