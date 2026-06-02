// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v14.0.0 — OmniSentientOracle
// Multi-modal sensory oracle: fuses price, macro, sentiment, satellite, IoT, biometric & quantum feeds
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract OmniSentientOracle is AccessControl, Pausable {
    bytes32 public constant DATA_FEEDER = keccak256("DATA_FEEDER");
    enum DataType { PRICE, MACRO, SENTIMENT, SATELLITE, IOT, BIOMETRIC, QUANTUM }
    struct SentientReading { DataType dataType; bytes32 symbol; int256 value; uint256 confidence; bytes32 sourceHash; bytes fusionProof; uint256 timestamp; }
    mapping(bytes32 => SentientReading) public latest;
    event SentientReadingUpdated(bytes32 indexed symbol, DataType dataType, int256 value, uint256 confidence);
    event AnomalyDetected(bytes32 indexed symbol, int256 deviationBps);
    constructor() { _grantRole(DEFAULT_ADMIN_ROLE,msg.sender); _grantRole(DATA_FEEDER,msg.sender); }
    function submitReading(DataType dt,bytes32 sym,int256 val,uint256 conf,bytes32 sh,bytes calldata fp) external onlyRole(DATA_FEEDER) whenNotPaused {
        require(conf<=10000,"conf");
        if(latest[sym].timestamp>0 && latest[sym].value!=0) {
            int256 d=((val-latest[sym].value)*10000)/latest[sym].value; if(d<0)d=-d; if(d>2000) emit AnomalyDetected(sym,d); }
        latest[sym]=SentientReading(dt,sym,val,conf,sh,fp,block.timestamp);
        emit SentientReadingUpdated(sym,dt,val,conf); }
}
