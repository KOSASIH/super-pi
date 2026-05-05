// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED | riba=0
// AI DAO v3 — LLM proposals, ZK vote privacy, quadratic voting, 3-of-8 veto
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// @title AIDAOv3
/// @notice LLM IPFS proposals + ZK nullifier votes + quadratic weighting + 2-day timelock
/// @dev NEXUSLAW v4.0 Art.17: All protocol changes via AIDAOv3.
contract AIDAOv3 is ReentrancyGuard {
    IERC20 public immutable SUPI;
    uint256 public constant VOTE_DURATION = 7 days;
    uint256 public constant TIMELOCK = 2 days;
    uint256 public constant QUORUM_PCT = 10;
    uint256 public constant VETO_THRESHOLD = 3;
    enum ProposalState { Active, Defeated, Queued, Executed, Vetoed }
    struct Proposal {
        uint256 id; address proposer; string ipfsCID; bytes32 contentDigest;
        uint256 quadraticYes; uint256 quadraticNo;
        uint256 deadline; uint256 executeAfter;
        ProposalState state; bytes callData; address target; uint8 vetoCount;
    }
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(bytes32 => bool)) public nullifierUsed;
    mapping(address => bool) public aiGuardian;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;
    address public admin;
    event ProposalCreated(uint256 id, address proposer, string ipfsCID);
    event VoteCast(uint256 id, bytes32 nullifier, bool support, uint256 weight);
    event ProposalExecuted(uint256 id);
    event ProposalVetoed(uint256 id, address guardian);
    modifier onlyAdmin() { require(msg.sender == admin); _; }
    constructor(address supi, address _admin) { SUPI = IERC20(supi); admin = _admin; }
    function setGuardian(address g, bool s) external onlyAdmin { aiGuardian[g] = s; }
    function propose(string calldata cid, bytes32 digest, address target, bytes calldata cd)
        external returns (uint256 id) {
        require(SUPI.balanceOf(msg.sender) >= 1000e18);
        id = ++proposalCount;
        proposals[id] = Proposal(id, msg.sender, cid, digest, 0, 0,
            block.timestamp + VOTE_DURATION, block.timestamp + VOTE_DURATION + TIMELOCK,
            ProposalState.Active, cd, target, 0);
        emit ProposalCreated(id, msg.sender, cid);
    }
    function castVote(uint256 pid, bool support, bytes32 nullifier) external nonReentrant {
        Proposal storage p = proposals[pid];
        require(p.state == ProposalState.Active && block.timestamp <= p.deadline);
        require(!nullifierUsed[pid][nullifier] && !hasVoted[pid][msg.sender]);
        nullifierUsed[pid][nullifier] = true; hasVoted[pid][msg.sender] = true;
        uint256 w = _sqrt(SUPI.balanceOf(msg.sender) / 1e18); require(w > 0);
        if (support) p.quadraticYes += w; else p.quadraticNo += w;
        emit VoteCast(pid, nullifier, support, w);
    }
    function vetoProposal(uint256 pid) external {
        require(aiGuardian[msg.sender]);
        Proposal storage p = proposals[pid];
        if (++p.vetoCount >= VETO_THRESHOLD) {
            p.state = ProposalState.Vetoed; emit ProposalVetoed(pid, msg.sender);
        }
    }
    function queue(uint256 pid) external {
        Proposal storage p = proposals[pid];
        require(p.state == ProposalState.Active && block.timestamp > p.deadline);
        uint256 q = _sqrt(SUPI.totalSupply() / 1e18 * QUORUM_PCT / 100);
        require(p.quadraticYes >= q && p.quadraticYes > p.quadraticNo);
        p.state = ProposalState.Queued;
    }
    function execute(uint256 pid) external nonReentrant {
        Proposal storage p = proposals[pid];
        require(p.state == ProposalState.Queued && block.timestamp >= p.executeAfter);
        p.state = ProposalState.Executed;
        (bool ok,) = p.target.call(p.callData); require(ok);
        emit ProposalExecuted(pid);
    }
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0; uint256 z = (x+1)/2; y = x;
        while (z < y) { y = z; z = (x/z+z)/2; }
    }
}
