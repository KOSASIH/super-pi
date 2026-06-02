// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v14.0.0 — SwarmIntelligenceV2
// 100,000-node bio-inspired consensus: pheromone trails, stigmergic routing, emergent decisions
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SwarmIntelligenceV2 is AccessControl, ReentrancyGuard {
    bytes32 public constant SWARM_MASTER = keccak256("SWARM_MASTER");
    bytes32 public constant SWARM_AGENT  = keccak256("SWARM_AGENT");
    uint256 public constant MAX_SWARM    = 100_000;
    uint256 public constant DECAY        = 9900;
    struct Trail { bytes32 pathId; uint256 strength; uint256 epoch; uint256 votes; }
    struct Decision { bytes32 id; bytes32 winner; uint256 strength; uint256 epoch; uint256 ts; }
    uint256 public epoch = 1;
    uint256 public swarmSize;
    mapping(bytes32 => Trail)   public trails;
    mapping(uint256 => Decision) public decisions;
    event PheromoneDeposited(bytes32 indexed path, address indexed agent, uint256 strength);
    event SwarmDecisionMade(uint256 indexed epoch, bytes32 winner, uint256 strength);
    constructor() { _grantRole(DEFAULT_ADMIN_ROLE,msg.sender); _grantRole(SWARM_MASTER,msg.sender); }
    function joinSwarm() external { require(swarmSize<MAX_SWARM,"cap"); _grantRole(SWARM_AGENT,msg.sender); swarmSize++; }
    function depositPheromone(bytes32 pid,uint256 str) external onlyRole(SWARM_AGENT) {
        require(str<=10000,"str"); Trail storage t=trails[pid];
        t.pathId=pid; t.strength=(t.strength*DECAY/10000)+str; if(t.strength>10000)t.strength=10000;
        t.epoch=epoch; t.votes++; emit PheromoneDeposited(pid,msg.sender,str); }
    function commitDecision(bytes32 did,bytes32[] calldata cands) external onlyRole(SWARM_MASTER) nonReentrant returns(bytes32 winner) {
        uint256 best;
        for(uint i=0;i<cands.length;i++){ uint256 s=trails[cands[i]].strength; if(s>best){best=s;winner=cands[i];} }
        decisions[epoch]=Decision(did,winner,best,epoch,block.timestamp);
        emit SwarmDecisionMade(epoch,winner,best); epoch++; }
}
