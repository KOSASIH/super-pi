// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  SuperPiUBI v1.0 -- Universal Basic Income Protocol
// @notice Monthly $SPI distribution to ZK-verified citizens.
//         Funded by protocol revenue + treasury yield + marketplace fees.
//         SovereignIDV2 gated. ARIA fraud prevention. NexusLaw v3.0.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ISovID  { function isVerified(address h) external view returns (bool); }
interface ISPI    { function transfer(address to, uint256 amt) external returns (bool);
                    function balanceOf(address a) external view returns (uint256); }

contract SuperPiUBI is Ownable, ReentrancyGuard {
    string public constant VERSION = "SuperPiUBI v1.0";

    struct Citizen { bool enrolled; bool active; uint256 lastClaim; uint256 total; }

    ISPI   public spi;
    ISovID public sovID;
    uint256 public monthly   = 10 ether;
    uint256 public interval  = 30 days;
    uint256 public citizens;
    uint256 public distributed;

    mapping(address => Citizen) public cits;

    event Enrolled(address indexed c);
    event Claimed(address indexed c, uint256 amt);
    event Deactivated(address indexed c, string reason);

    constructor(address _spi, address _sovID) Ownable(msg.sender) {
        spi = ISPI(_spi); sovID = ISovID(_sovID);
    }

    function enroll() external {
        require(!cits[msg.sender].enrolled && sovID.isVerified(msg.sender));
        cits[msg.sender] = Citizen(true, true, 0, 0);
        citizens++;
        emit Enrolled(msg.sender);
    }

    function claim() external nonReentrant {
        Citizen storage c = cits[msg.sender];
        require(c.enrolled && c.active && sovID.isVerified(msg.sender));
        require(block.timestamp >= c.lastClaim + interval, "UBI: too soon");
        require(spi.balanceOf(address(this)) >= monthly, "UBI: low treasury");
        c.lastClaim = block.timestamp;
        c.total    += monthly;
        distributed += monthly;
        require(spi.transfer(msg.sender, monthly));
        emit Claimed(msg.sender, monthly);
    }

    function deactivate(address c, string calldata r) external onlyOwner {
        cits[c].active = false; if (citizens > 0) citizens--;
        emit Deactivated(c, r);
    }
    function setMonthly(uint256 a) external onlyOwner { require(a > 0); monthly = a; }
}
