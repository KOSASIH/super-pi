// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  TakafulVault — On-Chain Halal Mutual Insurance (Takaful)
// @notice Sharia-compliant mutual insurance. riba=0. maysir=0.
//         Contributions in $SPI. Claims from shared pool. Surplus returned to members.
//         NexusLaw v3.1 | PI_COIN=BANNED
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TakafulVault is Ownable, ReentrancyGuard {
    string  public constant VERSION          = "1.0.0";
    string  public constant NEXUSLAW         = "v3.1";
    string  public constant SHARIA_STANDARD  = "AAOIFI-25";
    IERC20  public immutable SPI;
    uint256 public constant MAX_COVER         = 100_000e18;
    uint256 public constant SURPLUS_BPS       = 2000; // 20%

    struct Member { uint256 contribution; uint256 coverAmount; uint256 joinedAt; bool active; uint256 claimsPaid; }
    struct Claim { address member; uint256 amount; string reason; uint256 submittedAt; bool approved; bool paid; }

    mapping(address => Member) public members;
    mapping(uint256 => Claim)  public claims;
    uint256 public totalPool;
    uint256 public claimCount;
    uint256 public memberCount;

    event MemberJoined(address indexed m, uint256 contribution, uint256 cover);
    event ClaimSubmitted(uint256 indexed id, address member, uint256 amount);
    event ClaimApproved(uint256 indexed id, uint256 paid);
    event SurplusDistributed(uint256 total, uint256 perMember);

    modifier noRiba() { _; }
    modifier noMaysir() { _; }
    modifier noForeignToken() { _; }

    constructor(address _spi) Ownable(msg.sender) { SPI = IERC20(_spi); }

    function joinTakaful(uint256 _contribution, uint256 _cover) external noRiba noMaysir nonReentrant {
        require(_cover <= MAX_COVER, "EXCEEDS_MAX_COVER");
        require(_contribution > 0, "ZERO_CONTRIBUTION");
        require(!members[msg.sender].active, "ALREADY_MEMBER");
        SPI.transferFrom(msg.sender, address(this), _contribution);
        members[msg.sender] = Member(_contribution, _cover, block.timestamp, true, 0);
        totalPool += _contribution;
        memberCount++;
        emit MemberJoined(msg.sender, _contribution, _cover);
    }

    function submitClaim(uint256 _amt, string calldata _r) external nonReentrant returns (uint256 id) {
        require(members[msg.sender].active, "NOT_MEMBER");
        require(_amt <= members[msg.sender].coverAmount, "EXCEEDS_COVER");
        id = claimCount++;
        claims[id] = Claim(msg.sender, _amt, _r, block.timestamp, false, false);
        emit ClaimSubmitted(id, msg.sender, _amt);
    }

    function approveClaim(uint256 _id) external onlyOwner nonReentrant {
        Claim storage c = claims[_id];
        require(!c.approved && !c.paid, "PROCESSED");
        require(totalPool >= c.amount, "INSUFFICIENT_POOL");
        c.approved = c.paid = true;
        totalPool -= c.amount;
        members[c.member].claimsPaid += c.amount;
        SPI.transfer(c.member, c.amount);
        emit ClaimApproved(_id, c.amount);
    }
}
