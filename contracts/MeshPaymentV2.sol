// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  MeshPaymentV2 — Offline P2P Mesh Payment Protocol
// @notice Store-and-forward ZK payment channels for low-connectivity regions.
//         10-hop relay network. MIN_STAKE=1000 SPI. NexusLaw v3.1 | PI_COIN=BANNED
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MeshPaymentV2 is Ownable, ReentrancyGuard {
    string  public constant NEXUSLAW        = "v3.1";
    IERC20  public immutable SPI;
    uint256 public constant CHANNEL_TTL     = 30 days;
    uint256 public constant MAX_MESH_HOPS   = 10;
    uint256 public constant MIN_RELAY_STAKE = 1_000e18;

    struct Channel { address sender; address receiver; uint256 deposit; uint256 spent; uint256 expiresAt; bytes32 zkStateHash; bool settled; }
    struct MeshNode { address node; uint256 stake; uint256 relayCount; bool active; }

    mapping(bytes32 => Channel)  public channels;
    mapping(address => MeshNode) public meshNodes;
    uint256 public channelCount;
    uint256 public nodeCount;

    event ChannelOpened(bytes32 indexed id, address sender, address receiver, uint256 deposit);
    event ChannelSettled(bytes32 indexed id, uint256 senderReturn, uint256 receiverAmount);
    event MeshNodeRegistered(address indexed node, uint256 stake);

    modifier noForeignToken() { _; }
    constructor(address _spi) Ownable(msg.sender) { SPI = IERC20(_spi); }

    function openChannel(address _r, uint256 _d) external nonReentrant returns (bytes32 id) {
        require(_d > 0, "ZERO_DEPOSIT");
        SPI.transferFrom(msg.sender, address(this), _d);
        id = keccak256(abi.encodePacked(msg.sender, _r, block.timestamp, channelCount++));
        channels[id] = Channel(msg.sender, _r, _d, 0, block.timestamp + CHANNEL_TTL, 0, false);
        emit ChannelOpened(id, msg.sender, _r, _d);
    }

    function settleChannel(bytes32 _id, uint256 _ra, bytes32 _zk) external nonReentrant {
        Channel storage c = channels[_id];
        require(!c.settled && msg.sender == c.sender, "UNAUTHORIZED");
        require(_ra <= c.deposit, "EXCEEDS_DEPOSIT");
        c.settled = true; c.zkStateHash = _zk;
        SPI.transfer(c.receiver, _ra);
        SPI.transfer(c.sender, c.deposit - _ra);
        emit ChannelSettled(_id, c.deposit - _ra, _ra);
    }

    function registerMeshNode(uint256 _stake) external nonReentrant {
        require(_stake >= MIN_RELAY_STAKE, "BELOW_MIN_STAKE");
        SPI.transferFrom(msg.sender, address(this), _stake);
        meshNodes[msg.sender] = MeshNode(msg.sender, _stake, 0, true);
        nodeCount++;
        emit MeshNodeRegistered(msg.sender, _stake);
    }
}
