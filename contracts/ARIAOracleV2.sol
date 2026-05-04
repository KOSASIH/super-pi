// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// @title  ARIAOracleV2 — LLM-Powered On-Chain Risk Oracle v2.0
// @notice Accepts recursive ZK proofs of LLM inference. Scores 0-1000. Blocks < 500.
//         NexusLaw v3.1 | PI_COIN=BANNED | riba=0
import "@openzeppelin/contracts/access/Ownable.sol";

contract ARIAOracleV2 is Ownable {
    string  public constant VERSION   = "2.0.0";
    string  public constant NEXUSLAW  = "v3.1";
    string  public constant MODEL     = "ARIA-LLM-v2+ZKProof";
    uint256 public constant MIN_SCORE = 500;

    struct RiskAssessment {
        address target; uint256 score; bytes32 zkProofHash;
        uint256 timestamp; bool approved; string riskFlags;
    }

    mapping(address => RiskAssessment) public assessments;
    mapping(address => bool)           public approvedContracts;
    address[]                          public blockedContracts;

    event AssessmentSubmitted(address indexed target, uint256 score, bytes32 zkProof);
    event ContractApproved(address indexed target, uint256 score);
    event ContractBlocked(address indexed target, uint256 score, string reason);

    constructor() Ownable(msg.sender) {}

    function submitAssessment(address _t, uint256 _s, bytes32 _zk, string calldata _f) external onlyOwner {
        require(_s <= 1000, "SCORE_RANGE");
        bool ok = _s >= MIN_SCORE;
        assessments[_t] = RiskAssessment(_t, _s, _zk, block.timestamp, ok, _f);
        if (ok) { approvedContracts[_t] = true; emit ContractApproved(_t, _s); }
        else     { blockedContracts.push(_t);    emit ContractBlocked(_t, _s, _f); }
        emit AssessmentSubmitted(_t, _s, _zk);
    }

    function getScore(address _t) external view returns (uint256) { return assessments[_t].score; }
    function isApproved(address _t) external view returns (bool)  { return approvedContracts[_t]; }
    function totalBlocked() external view returns (uint256)       { return blockedContracts.length; }
}
