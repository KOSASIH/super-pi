// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title NEXUSOrchestrator - On-Chain Multi-Agent DAG Execution Engine v3.0
/// @notice NEXUS Prime master orchestrator for the Super Pi Agent ecosystem
/// @dev Manages agent registrations, DAG pipelines, conflict resolution, and 72h sprint queues
/// @custom:security-contact security@super-pi.io
contract NEXUSOrchestrator is AccessControl, ReentrancyGuard, Pausable {

    bytes32 public constant ORCHESTRATOR_ROLE = keccak256("ORCHESTRATOR_ROLE");
    bytes32 public constant AGENT_ADMIN_ROLE  = keccak256("AGENT_ADMIN_ROLE");
    bytes32 public constant PIPELINE_ROLE     = keccak256("PIPELINE_ROLE");

    enum AgentStatus { INACTIVE, ACTIVE, SUSPENDED, DECOMMISSIONED }
    enum TaskStatus  { PENDING, IN_PROGRESS, COMPLETED, FAILED, VETOED }
    enum Priority    { LOW, MEDIUM, HIGH, CRITICAL, EMERGENCY }

    struct Agent {
        string      name;
        AgentStatus status;
        bytes32     domain;
        address     executor;
        uint256     completedTasks;
        uint256     failedTasks;
        uint64      registeredAt;
        bool        vetoAuthority;
    }

    struct PipelineTask {
        bytes32    agentId;
        string     action;
        bytes      params;
        TaskStatus status;
        uint64     createdAt;
        uint64     completedAt;
        bytes      result;
    }

    struct Pipeline {
        string     name;
        bytes32[]  taskIds;
        bytes32[]  dependencies;
        Priority   priority;
        TaskStatus status;
        address    initiator;
        uint64     createdAt;
        uint64     deadline;
        bool       sprintMode;
    }

    mapping(bytes32 => Agent)        public agents;
    mapping(bytes32 => PipelineTask) public tasks;
    mapping(bytes32 => Pipeline)     public pipelines;
    mapping(bytes32 => uint256)      public agentPriority;

    bytes32[] public registeredAgents;
    bytes32[] public activePipelines;

    uint256 public totalPipelinesExecuted;
    uint256 public totalTasksCompleted;
    uint256 public totalConflictsResolved;

    event AgentRegistered(bytes32 indexed agentId, string name, bytes32 domain);
    event AgentStatusChanged(bytes32 indexed agentId, AgentStatus newStatus);
    event PipelineCreated(bytes32 indexed pipelineId, string name, Priority priority);
    event TaskCreated(bytes32 indexed taskId, bytes32 indexed agentId);
    event TaskCompleted(bytes32 indexed taskId, bytes32 indexed pipelineId);
    event TaskFailed(bytes32 indexed taskId, string reason);
    event ConflictResolved(bytes32 indexed pipelineId, string conflictType, bytes32 winnerAgent);
    event VetoApplied(bytes32 indexed pipelineId, bytes32 indexed agentId, string reason);
    event SprintQueued(bytes32 indexed pipelineId, uint64 deadline);

    error AgentNotFound(bytes32 agentId);
    error PipelineNotFound(bytes32 pipelineId);
    error TaskNotFound(bytes32 taskId);
    error UnauthorizedAgent();
    error PipelineVetoed(bytes32 pipelineId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORCHESTRATOR_ROLE,  msg.sender);
        _grantRole(AGENT_ADMIN_ROLE,   msg.sender);
        _grantRole(PIPELINE_ROLE,      msg.sender);
        _registerCanonicalAgents();
    }

    function registerAgent(
        bytes32         agentId,
        string calldata name,
        bytes32         domain,
        address         executor,
        uint256         priority,
        bool            vetoAuthority
    ) external onlyRole(AGENT_ADMIN_ROLE) {
        agents[agentId] = Agent({
            name:           name,
            status:         AgentStatus.ACTIVE,
            domain:         domain,
            executor:       executor,
            completedTasks: 0,
            failedTasks:    0,
            registeredAt:   uint64(block.timestamp),
            vetoAuthority:  vetoAuthority
        });
        agentPriority[agentId] = priority;
        registeredAgents.push(agentId);
        emit AgentRegistered(agentId, name, domain);
    }

    function createPipeline(
        bytes32            pipelineId,
        string calldata    name,
        bytes32[] calldata taskIds,
        bytes32[] calldata dependencies,
        Priority           priority,
        uint64             deadline,
        bool               sprintMode
    ) external onlyRole(PIPELINE_ROLE) whenNotPaused returns (bytes32) {
        pipelines[pipelineId] = Pipeline({
            name:         name,
            taskIds:      taskIds,
            dependencies: dependencies,
            priority:     priority,
            status:       TaskStatus.PENDING,
            initiator:    msg.sender,
            createdAt:    uint64(block.timestamp),
            deadline:     deadline,
            sprintMode:   sprintMode
        });
        activePipelines.push(pipelineId);
        emit PipelineCreated(pipelineId, name, priority);
        if (sprintMode) emit SprintQueued(pipelineId, deadline);
        return pipelineId;
    }

    function completeTask(
        bytes32        taskId,
        bytes32        pipelineId,
        bytes calldata result
    ) external nonReentrant whenNotPaused {
        PipelineTask storage task = tasks[taskId];
        if (task.createdAt == 0) revert TaskNotFound(taskId);
        Agent storage agent = agents[task.agentId];
        if (agent.executor != msg.sender && !hasRole(ORCHESTRATOR_ROLE, msg.sender))
            revert UnauthorizedAgent();
        task.status      = TaskStatus.COMPLETED;
        task.completedAt = uint64(block.timestamp);
        task.result      = result;
        agent.completedTasks++;
        totalTasksCompleted++;
        emit TaskCompleted(taskId, pipelineId);
    }

    function failTask(bytes32 taskId, string calldata reason)
        external onlyRole(ORCHESTRATOR_ROLE)
    {
        if (tasks[taskId].createdAt == 0) revert TaskNotFound(taskId);
        tasks[taskId].status = TaskStatus.FAILED;
        agents[tasks[taskId].agentId].failedTasks++;
        emit TaskFailed(taskId, reason);
    }

    function resolveConflict(
        bytes32         pipelineId,
        bytes32         agentA,
        bytes32         agentB,
        string calldata conflictType
    ) external onlyRole(ORCHESTRATOR_ROLE) returns (bytes32 winner) {
        winner = agentPriority[agentA] <= agentPriority[agentB] ? agentA : agentB;
        totalConflictsResolved++;
        emit ConflictResolved(pipelineId, conflictType, winner);
    }

    function vetoPipeline(bytes32 pipelineId, bytes32 agentId, string calldata reason)
        external whenNotPaused
    {
        Agent storage agent = agents[agentId];
        if (!agent.vetoAuthority) revert UnauthorizedAgent();
        if (agent.executor != msg.sender && !hasRole(ORCHESTRATOR_ROLE, msg.sender))
            revert UnauthorizedAgent();
        Pipeline storage pipeline = pipelines[pipelineId];
        if (pipeline.createdAt == 0) revert PipelineNotFound(pipelineId);
        pipeline.status = TaskStatus.VETOED;
        emit VetoApplied(pipelineId, agentId, reason);
    }

    function getActiveAgentCount() external view returns (uint256 count) {
        for (uint256 i; i < registeredAgents.length; ++i) {
            if (agents[registeredAgents[i]].status == AgentStatus.ACTIVE) count++;
        }
    }

    function _registerCanonicalAgents() internal {
        // Priority hierarchy: SAPIENS(1) > LEX(2) > ARCHON(3) > ops agents(4-8)
        _quickReg(keccak256("SAPIENS"),     "SAPIENS Guardian",  keccak256("INSURANCE"),  1, true);
        _quickReg(keccak256("LEX"),         "LEX Machina",       keccak256("COMPLIANCE"), 2, true);
        _quickReg(keccak256("ARCHON"),      "ARCHON Forge",      keccak256("CONTRACTS"),  3, true);
        _quickReg(keccak256("OMEGA"),       "OMEGA DeFi",        keccak256("DEFI"),       4, false);
        _quickReg(keccak256("SINGULARITY"), "SINGULARITY Swap",  keccak256("TRADING"),    5, false);
        _quickReg(keccak256("VULCAN"),      "VULCAN Deploy",     keccak256("INFRA"),      6, false);
        _quickReg(keccak256("AESTHETE"),    "AESTHETE Nexus",    keccak256("UX"),         7, false);
        _quickReg(keccak256("NEXUS"),       "NEXUS Prime",       keccak256("ORCHESTRATE"),0, true);
    }

    function _quickReg(
        bytes32     id,
        string memory name,
        bytes32     domain,
        uint256     priority,
        bool        veto
    ) internal {
        agents[id] = Agent({
            name:           name,
            status:         AgentStatus.ACTIVE,
            domain:         domain,
            executor:       address(0),
            completedTasks: 0,
            failedTasks:    0,
            registeredAt:   uint64(block.timestamp),
            vetoAuthority:  veto
        });
        agentPriority[id] = priority;
        registeredAgents.push(id);
        emit AgentRegistered(id, name, domain);
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
