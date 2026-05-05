// SPDX-License-Identifier: MIT
// NEXUSLAW v4.0 | SUPER PI v13.0.0 | PI_COIN=BANNED | mudarabah profit-split
// Quantum Compute Market — decentralised QC jobs: VQE, QAOA, Shor, Grover, QML
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// @title QuantumComputeMarket
/// @notice On-chain QC marketplace. $SPI/qubit-sec. $SUPi stake. ZK result proofs.
/// @dev NEXUSLAW v4.0 Art.22: QC in $SPI only. PI=BANNED.
contract QuantumComputeMarket is ReentrancyGuard {
    IERC20 public immutable SPI; IERC20 public immutable SUPI;
    enum JobType { VQE, QAOA, SHORS, GROVERS, QML, SIMULATION, CUSTOM }
    enum JobState { PENDING, ASSIGNED, RUNNING, COMPLETED, FAILED, DISPUTED }
    struct QuantumProvider {
        address addr; uint256 qubits; uint256 spiPerQubitSec;
        uint256 supiStake; uint256 jobsCompleted; uint256 reliability; bool active;
    }
    struct ComputeJob {
        uint256 jobId; address requester; address provider;
        JobType jobType; uint256 qubitsRequired; uint256 estimatedSecs;
        uint256 spiEscrow; JobState state;
        bytes32 inputHash; bytes32 outputHash; bytes32 zkProofId;
        uint256 createdAt; uint256 completedAt;
    }
    mapping(address => QuantumProvider) public providers;
    mapping(uint256 => ComputeJob) public jobs;
    address[] public providerList;
    uint256 public jobCount;
    uint256 public constant MIN_STAKE = 50_000e18;
    uint256 public constant PLATFORM_FEE = 50;
    event ProviderRegistered(address indexed p, uint256 qubits, uint256 price);
    event JobCreated(uint256 indexed jobId, address requester, JobType jt, uint256 qubits);
    event JobCompleted(uint256 indexed jobId, bytes32 outputHash, bytes32 zkProofId);
    constructor(address spi, address supi) { SPI=IERC20(spi); SUPI=IERC20(supi); }
    function registerProvider(uint256 qubits, uint256 price, uint256 stake) external nonReentrant {
        require(stake>=MIN_STAKE,"Insufficient stake");
        SUPI.transferFrom(msg.sender,address(this),stake);
        providers[msg.sender]=QuantumProvider(msg.sender,qubits,price,stake,0,10000,true);
        providerList.push(msg.sender); emit ProviderRegistered(msg.sender,qubits,price);
    }
    function createJob(JobType jt, uint256 qubits, uint256 secs, bytes32 inputHash)
        external nonReentrant returns (uint256 jobId) {
        address best=_findProvider(qubits); require(best!=address(0),"No provider");
        uint256 price=providers[best].spiPerQubitSec*qubits*secs;
        SPI.transferFrom(msg.sender,address(this),price);
        jobId=++jobCount;
        jobs[jobId]=ComputeJob(jobId,msg.sender,best,jt,qubits,secs,
            price,JobState.ASSIGNED,inputHash,bytes32(0),bytes32(0),block.timestamp,0);
        emit JobCreated(jobId,msg.sender,jt,qubits);
    }
    function submitResult(uint256 jobId, bytes32 outputHash, bytes32 zkProofId) external nonReentrant {
        ComputeJob storage j=jobs[jobId];
        require(msg.sender==j.provider);
        require(j.state==JobState.ASSIGNED||j.state==JobState.RUNNING);
        j.outputHash=outputHash; j.zkProofId=zkProofId;
        j.state=JobState.COMPLETED; j.completedAt=block.timestamp;
        uint256 fee=j.spiEscrow*PLATFORM_FEE/10_000;
        SPI.transfer(j.provider,j.spiEscrow-fee);
        providers[j.provider].jobsCompleted++;
        emit JobCompleted(jobId,outputHash,zkProofId);
    }
    function _findProvider(uint256 qubits) internal view returns (address best) {
        uint256 low=type(uint256).max;
        for(uint256 i=0;i<providerList.length;i++){
            QuantumProvider storage p=providers[providerList[i]];
            if(p.active&&p.qubits>=qubits&&p.spiPerQubitSec<low){low=p.spiPerQubitSec;best=providerList[i];}
        }
    }
}
