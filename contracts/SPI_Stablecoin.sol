// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SuperPiCoin is ERC20, Ownable {
    AggregatorV3Interface public immutable usdPriceFeed;
    uint256 public totalFiatCollateral;
    uint256 public constant MIN_COLLATERAL_RATIO = 110; // 110%

    event FiatDeposit(address indexed user, uint256 usdAmount, string currency);
    event FiatWithdrawal(address indexed user, uint256 usdAmount, string currency);

    constructor(address _usdPriceFeed) ERC20("Super Pi USD Stablecoin", "SPI") {
        usdPriceFeed = AggregatorV3Interface(_usdPriceFeed);
    }

    function mint(uint256 amount) external onlyOwner {
        require(getCollateralRatio() >= MIN_COLLATERAL_RATIO, "Insufficient collateral");
        _mint(msg.sender, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function getCollateralRatio() public view returns (uint256) {
        (,int256 price,,,) = usdPriceFeed.latestRoundData();
        uint256 supply = totalSupply();
        uint256 ratio = (totalFiatCollateral * uint256(price) * 100) / supply;
        return ratio;
    }

    function depositFiatReported(uint256 usdAmount) external onlyOwner {
        totalFiatCollateral += usdAmount;
        emit FiatDeposit(msg.sender, usdAmount, "USD");
    }
}
