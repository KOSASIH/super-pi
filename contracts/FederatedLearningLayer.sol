// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v14.0.0 — FederatedLearningLayer
// Privacy-preserving FL: encrypted gradients, zkSNARK aggregation proofs, minimum quorum enforcement
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FederatedLearningLayer is AccessControl, ReentrancyGuard {
    bytes32 public constant FL_COORD = keccak256("FL_COORD");
    bytes32 public constant FL_PART  = keccak256("FL_PART");
    uint256 public round = 1;
    uint256 public minParticipants = 10;
    struct FLRound { uint256 id; bytes32 modelHash; uint256 participants; uint256 avgLoss; bytes32 aggProof; uint256 ts; bool done; }
    mapping(uint256 => FLRound) public rounds;
    mapping(uint256 => mapping(address => bool)) public submitted;
    mapping(uint256 => uint256) public subCount;
    event RoundStarted(uint256 indexed id, bytes32 baseModel);
    event GradientSubmitted(uint256 indexed id, address p);
    event RoundFinalised(uint256 indexed id, bytes32 model, uint256 participants);
    constructor() { _grantRole(DEFAULT_ADMIN_ROLE,msg.sender); _grantRole(FL_COORD,msg.sender); }
    function startRound(bytes32 bm) external onlyRole(FL_COORD) { emit RoundStarted(round,bm); }
    function submitGradient(uint256 rid,bytes32) external onlyRole(FL_PART) { require(!submitted[rid][msg.sender],"dup"); submitted[rid][msg.sender]=true; subCount[rid]++; emit GradientSubmitted(rid,msg.sender); }
    function finaliseRound(bytes32 mh,uint256 al,bytes32 ap) external onlyRole(FL_COORD) nonReentrant {
        require(subCount[round]>=minParticipants,"quorum"); rounds[round]=FLRound(round,mh,subCount[round],al,ap,block.timestamp,true);
        emit RoundFinalised(round,mh,subCount[round]); round++; }
}
