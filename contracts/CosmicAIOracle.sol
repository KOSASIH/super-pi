// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.0 — CosmicAIOracle
// Cosmic-scale data integration: solar cycles, geomagnetic, cosmic ray, gravitational wave inputs
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CosmicAIOracle is AccessControl {
    bytes32 public constant COSMIC_FEEDER = keccak256("COSMIC_FEEDER");

    struct CosmicReading {
        int256 solarFluxIndex;      // scaled 1e6
        int256 geomagneticKp;       // scaled 1e6 (Kp index)
        uint256 cosmicRayFlux;      // particles/cm2/s scaled 1e6
        int256 gravitationalStrain; // h scaled 1e21
        bytes32 consensusHash;
        uint256 timestamp;
        bool protocolInfluence;     // AI determined: affects $SPI risk model
    }

    CosmicReading public latest;
    uint256 public readingCount;
    int256 public constant SOLAR_STORM_THRESHOLD = 150 * 1e6;
    int256 public constant GEO_STORM_THRESHOLD = 7 * 1e6;  // Kp >= 7

    event CosmicReadingUpdated(uint256 indexed idx, bytes32 consensusHash, bool protocolInfluence);
    event CosmicStormAlert(string stormType, int256 value, uint256 timestamp);

    constructor() { _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); }

    function updateReading(
        int256 solarFlux, int256 geoKp, uint256 crFlux,
        int256 gravStrain, bytes32 hash
    ) external onlyRole(COSMIC_FEEDER) {
        bool influence = (solarFlux > SOLAR_STORM_THRESHOLD || geoKp > GEO_STORM_THRESHOLD);
        latest = CosmicReading(solarFlux, geoKp, crFlux, gravStrain, hash, block.timestamp, influence);
        readingCount++;
        emit CosmicReadingUpdated(readingCount, hash, influence);
        if (solarFlux > SOLAR_STORM_THRESHOLD) emit CosmicStormAlert("SOLAR", solarFlux, block.timestamp);
        if (geoKp > GEO_STORM_THRESHOLD) emit CosmicStormAlert("GEOMAGNETIC", geoKp, block.timestamp);
    }

    function hasActiveCosmicRisk() external view returns(bool) {
        return block.timestamp - latest.timestamp < 6 hours && latest.protocolInfluence;
    }
}
