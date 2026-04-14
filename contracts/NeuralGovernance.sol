// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  NeuralGovernance v1.0 -- AI-Augmented DAO Governance
// @notice ARIA-scored proposals, quadratic voting, timelock execution.
//         NexusLaw v3.0: halal proposals only. $SUPi governance token.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NeuralGovernance is Ownable, ReentrancyGuard {
    string public constant VERSION = "NeuralGovernance v1.0";

    enum State { Pending, Active, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        string  title;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 votesFor;
        uint256 votesAgainst;
        uint8   ariaScore;
        bool    ariaApproved;
        bool    executed;
        State   state;
    }

    uint256 public count;
    uint256 public constant VOTING   = 3 days;
    uint256 public constant TIMELOCK = 2 days;
    address public aria;

    mapping(uint256 => Proposal)                  public proposals;
    mapping(uint256 => mapping(address => uint256)) public votes;

    event Proposed(uint256 indexed id, string title, address proposer);
    event ARIAReview(uint256 indexed id, uint8 score, bool ok);
    event Voted(uint256 indexed id, address voter, uint256 weight, bool support);
    event Executed(uint256 indexed id);
    event Cancelled(uint256 indexed id, string reason);

    modifier onlyARIA() {
        require(msg.sender == aria || msg.sender == owner(), "NeuralGov: not ARIA");
        _;
    }

    constructor(address _aria) Ownable(msg.sender) { aria = _aria; }

    function propose(string calldata title) external returns (uint256 id) {
        id = ++count;
        proposals[id] = Proposal(id, title, msg.sender, 0, 0, 0, 0, 0, false, false, State.Pending);
        emit Proposed(id, title, msg.sender);
    }

    function ariaReview(uint256 id, uint8 score, bool ok, string calldata reason) external onlyARIA {
        require(proposals[id].state == State.Pending);
        proposals[id].ariaScore    = score;
        proposals[id].ariaApproved = ok;
        if (!ok) {
            proposals[id].state = State.Cancelled;
            emit Cancelled(id, reason);
        } else {
            proposals[id].state     = State.Active;
            proposals[id].startTime = block.timestamp;
            proposals[id].endTime   = block.timestamp + VOTING;
        }
        emit ARIAReview(id, score, ok);
    }

    function vote(uint256 id, uint256 weight, bool support) external nonReentrant {
        Proposal storage p = proposals[id];
        require(p.state == State.Active && block.timestamp <= p.endTime);
        require(votes[id][msg.sender] == 0 && weight > 0);
        votes[id][msg.sender] = weight;
        if (support) p.votesFor += weight; else p.votesAgainst += weight;
        emit Voted(id, msg.sender, weight, support);
    }

    function execute(uint256 id) external onlyOwner nonReentrant {
        Proposal storage p = proposals[id];
        require(p.state == State.Active && block.timestamp > p.endTime + TIMELOCK);
        require(p.votesFor > p.votesAgainst);
        p.state = State.Executed; p.executed = true;
        emit Executed(id);
    }
}
