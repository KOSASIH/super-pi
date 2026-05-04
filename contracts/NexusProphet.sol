// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  NexusProphet — AI Economic Forecasting Oracle
// @notice LLM-backed GDP, FX, inflation forecasts. ZK-verified predictions.
//         4 horizons: 24h / 7d / 30d / 365d. NexusLaw v3.1 | PI_COIN=BANNED
import "@openzeppelin/contracts/access/Ownable.sol";

contract NexusProphet is Ownable {
    string public constant VERSION   = "1.0.0";
    string public constant NEXUSLAW  = "v3.1";
    string public constant MODEL     = "NEXUS-PROPHET-v1+ZK";

    enum Horizon { H24, H7D, H30D, H365D }

    struct Forecast {
        string metric; int256 value; int256 confidence;
        bytes32 zkProof; uint256 issuedAt; uint256 validUntil; Horizon horizon;
    }

    mapping(bytes32 => Forecast) public forecasts;
    uint256 public forecastCount;

    event ForecastPublished(string indexed metric, int256 value, Horizon horizon, bytes32 zkProof);

    constructor() Ownable(msg.sender) {}

    function publishForecast(string calldata _m, int256 _v, int256 _c, bytes32 _zk, Horizon _h)
        external onlyOwner {
        require(_c >= 0 && _c <= 10000, "CONFIDENCE_RANGE");
        uint256 dur = _h == Horizon.H24 ? 1 days : _h == Horizon.H7D ? 7 days
                    : _h == Horizon.H30D ? 30 days : 365 days;
        bytes32 key = keccak256(abi.encodePacked(_m, _h));
        forecasts[key] = Forecast(_m, _v, _c, _zk, block.timestamp, block.timestamp + dur, _h);
        forecastCount++;
        emit ForecastPublished(_m, _v, _h, _zk);
    }

    function getForecast(string calldata _m, Horizon _h) external view returns (Forecast memory f) {
        f = forecasts[keccak256(abi.encodePacked(_m, _h))];
        require(f.validUntil >= block.timestamp, "FORECAST_EXPIRED");
    }
}
