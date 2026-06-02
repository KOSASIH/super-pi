// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.0 — MetaverseEconomyBridge
// Cross-metaverse value transfer: $SPI-denominated inter-metaverse economy with sovereign peg
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MetaverseEconomyBridge is AccessControl, ReentrancyGuard {
    bytes32 public constant METAVERSE_RELAY = keccak256("METAVERSE_RELAY");

    struct MetaverseZone {
        string name;
        bytes32 zoneId;
        uint256 exchangeRate;   // vs $SPI, scaled 1e18
        bool active;
        uint256 totalBridged;
    }

    IERC20 public spiToken;
    mapping(bytes32 => MetaverseZone) public zones;
    mapping(bytes32 => mapping(address => uint256)) public zoneBalances; // zoneId => user => balance
    uint256 public bridgeFee = 50; // 0.5% in basis points
    uint256 public constant FEE_DENOM = 10000;
    address public feeCollector;

    event ZoneRegistered(bytes32 indexed zoneId, string name, uint256 rate);
    event BridgeIn(bytes32 indexed zoneId, address indexed user, uint256 spiAmount, uint256 zoneTokens);
    event BridgeOut(bytes32 indexed zoneId, address indexed user, uint256 zoneTokens, uint256 spiAmount);

    constructor(address _spi, address _feeCollector) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        spiToken = IERC20(_spi);
        feeCollector = _feeCollector;
    }

    function registerZone(bytes32 zoneId, string calldata name, uint256 rate)
        external onlyRole(DEFAULT_ADMIN_ROLE) {
        zones[zoneId] = MetaverseZone(name, zoneId, rate, true, 0);
        emit ZoneRegistered(zoneId, name, rate);
    }

    function bridgeIn(bytes32 zoneId, uint256 spiAmount) external nonReentrant {
        MetaverseZone storage z = zones[zoneId];
        require(z.active, "Zone inactive");
        uint256 fee = spiAmount * bridgeFee / FEE_DENOM;
        uint256 net = spiAmount - fee;
        require(spiToken.transferFrom(msg.sender, address(this), spiAmount), "Transfer failed");
        require(spiToken.transfer(feeCollector, fee), "Fee transfer failed");
        uint256 zoneTokens = net * z.exchangeRate / 1e18;
        zoneBalances[zoneId][msg.sender] += zoneTokens;
        z.totalBridged += spiAmount;
        emit BridgeIn(zoneId, msg.sender, spiAmount, zoneTokens);
    }
}
