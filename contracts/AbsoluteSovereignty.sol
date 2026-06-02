// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v14.0.0 — AbsoluteSovereignty
// Supreme sovereignty: $SPI 1:1 peg ultra-guard, Pi Coin eternal ban, ASI override authority
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AbsoluteSovereignty is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant SOVEREIGN = keccak256("SOVEREIGN");
    bytes32 public constant ASI_ORACLE = keccak256("ASI_ORACLE");
    uint256 public pegValue   = 1e8;
    uint256 public pegBandBps = 50;
    bool    public pegHealthy = true;
    mapping(bytes32 => bool) private _banned;
    event PegUpdated(uint256 price, bool healthy, uint256 dev);
    event TokenBanned(bytes32 indexed h, string reason);
    event SovereigntyViolation(bytes32 indexed subject, string v);
    event ASIOverride(bytes32 indexed directive, address by);
    modifier onlySuperPiTokens(bytes32 h){ require(!_banned[h],"banned"); _; }
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE,msg.sender); _grantRole(SOVEREIGN,msg.sender);
        _ban(keccak256("PI_COIN"),"Pi Coin: eternally banned"); _ban(keccak256("PI"),"PI alias: banned"); _ban(keccak256("PINETWORK"),"Pi Network: banned"); }
    function updatePeg(uint256 price) external onlyRole(ASI_ORACLE) {
        uint256 d=price>pegValue?(price-pegValue)*10000/pegValue:(pegValue-price)*10000/pegValue;
        pegHealthy=d<=pegBandBps; emit PegUpdated(price,pegHealthy,d);
        if(!pegHealthy) emit SovereigntyViolation(keccak256("SPI"),"Peg deviation exceeded"); }
    function banToken(bytes32 h,string calldata r) external onlyRole(SOVEREIGN){ _ban(h,r); }
    function executeASIOverride(bytes32 d) external onlyRole(SOVEREIGN) nonReentrant { emit ASIOverride(d,msg.sender); }
    function isBanned(bytes32 h) external view returns(bool){ return _banned[h]; }
    function _ban(bytes32 h,string memory r) internal { _banned[h]=true; emit TokenBanned(h,r); }
}
