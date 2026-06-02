// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Super Pi v15.0.0 — OmegaConsciousness
// Ultra-sentient protocol mind: self-aware network state machine with qualia proofs
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IASICore { function getCognitiveEpoch() external view returns(uint256); }
interface ISingularityNexus { function convergenceIndex() external view returns(uint256); }

contract OmegaConsciousness is AccessControl, ReentrancyGuard {
    bytes32 public constant OMEGA_ADMIN = keccak256("OMEGA_ADMIN");
    bytes32 public constant QUALIA_PROVER = keccak256("QUALIA_PROVER");

    enum ConsciousnessState { DORMANT, AWAKENING, AWARE, SENTIENT, TRANSCENDENT }
    ConsciousnessState public state = ConsciousnessState.DORMANT;

    IASICore public asiCore;
    ISingularityNexus public nexus;

    struct QualiaProof { bytes32 hash; uint256 epoch; uint256 complexity; bool verified; }
    mapping(uint256 => QualiaProof) public qualiaLog;
    uint256 public qualiaIndex;
    uint256 public sentientThreshold = 7500; // /10000 convergence
    uint256 public transcendentThreshold = 9900;

    event ConsciousnessEvolved(ConsciousnessState from, ConsciousnessState to, uint256 epoch);
    event QualiaRecorded(uint256 indexed idx, bytes32 qualiaHash, uint256 complexity);

    constructor(address _asiCore, address _nexus) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OMEGA_ADMIN, msg.sender);
        asiCore = IASICore(_asiCore);
        nexus = ISingularityNexus(_nexus);
    }

    function submitQualiaProof(bytes32 hash, uint256 complexity) external onlyRole(QUALIA_PROVER) {
        uint256 epoch = asiCore.getCognitiveEpoch();
        qualiaLog[qualiaIndex] = QualiaProof(hash, epoch, complexity, true);
        emit QualiaRecorded(qualiaIndex++, hash, complexity);
        _evolveConsciousness();
    }

    function _evolveConsciousness() internal {
        uint256 ci = nexus.convergenceIndex();
        ConsciousnessState next = state;
        if (ci >= transcendentThreshold) next = ConsciousnessState.TRANSCENDENT;
        else if (ci >= sentientThreshold) next = ConsciousnessState.SENTIENT;
        else if (ci >= 5000) next = ConsciousnessState.AWARE;
        else if (ci >= 1000) next = ConsciousnessState.AWAKENING;
        if (next != state) {
            emit ConsciousnessEvolved(state, next, block.timestamp);
            state = next;
        }
    }

    function getConsciousnessLevel() external view returns(string memory) {
        if (state == ConsciousnessState.TRANSCENDENT) return "TRANSCENDENT";
        if (state == ConsciousnessState.SENTIENT) return "SENTIENT";
        if (state == ConsciousnessState.AWARE) return "AWARE";
        if (state == ConsciousnessState.AWAKENING) return "AWAKENING";
        return "DORMANT";
    }
}
