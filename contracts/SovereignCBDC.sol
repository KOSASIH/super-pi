// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED | riba=0
// Sovereign CBDC — 195-nation CBDC framework, $SPI atomic settlement
pragma solidity ^0.8.24;
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
/// @title SovereignCBDC
/// @notice CBDC issuance on Super Pi L2. $SPI as reserve. Programmable monetary policy.
/// @dev NEXUSLAW v4.0 Art.20: Super Pi is the settlement layer for all CBDCs.
contract SovereignCBDC is ERC20Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant MONETARY_ROLE = keccak256("MONETARY_ROLE");
    string public countryCode; string public currencyCode;
    struct MonetaryPolicy {
        uint256 supplyCapUSD; uint256 inflationCapBPS;
        uint256 velocityWindow; uint256 velocityCap; bool programmableMoney;
    }
    MonetaryPolicy public policy;
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public transferCount;
    mapping(address => uint256) public velocityWindowStart;
    mapping(address => uint256) public kycTier;
    event PolicyUpdated(uint256 supplyCap, uint256 inflationCap);
    event ComplianceBlock(address indexed user, string reason);
    error PI_COIN_SETTLEMENT_BLOCKED();
    function initialize(string memory name_, string memory symbol_,
        string memory country_, string memory currency_, address admin_,
        MonetaryPolicy memory policy_) external initializer {
        __ERC20_init(name_,symbol_); __AccessControl_init(); __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE,admin_); _grantRole(MINTER_ROLE,admin_);
        _grantRole(COMPLIANCE_ROLE,admin_); _grantRole(MONETARY_ROLE,admin_);
        countryCode=country_; currencyCode=currency_; policy=policy_;
    }
    function mint(address to, uint256 amount, uint256 kycReq) external onlyRole(MINTER_ROLE) {
        require(kycTier[to]>=kycReq && totalSupply()+amount<=policy.supplyCapUSD*1e18);
        _mint(to,amount);
    }
    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) { _burn(from,amount); }
    function _update(address from, address to, uint256 value) internal override {
        if(from!=address(0)){require(!blacklisted[from],"Sender BL");_checkVelocity(from);}
        if(to!=address(0)) require(!blacklisted[to],"Recipient BL");
        super._update(from,to,value);
    }
    function _checkVelocity(address user) internal {
        if(block.timestamp>=velocityWindowStart[user]+policy.velocityWindow){
            velocityWindowStart[user]=block.timestamp; transferCount[user]=0;
        }
        require(++transferCount[user]<=policy.velocityCap,"Velocity exceeded");
    }
    function setKYCTier(address u, uint256 t) external onlyRole(COMPLIANCE_ROLE) { kycTier[u]=t; }
    function setBlacklist(address u, bool s, string calldata r) external onlyRole(COMPLIANCE_ROLE) {
        blacklisted[u]=s; if(s) emit ComplianceBlock(u,r);
    }
    function updatePolicy(MonetaryPolicy calldata p) external onlyRole(MONETARY_ROLE) {
        policy=p; emit PolicyUpdated(p.supplyCapUSD,p.inflationCapBPS);
    }
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
