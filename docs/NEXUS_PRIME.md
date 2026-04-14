# 🧠 NEXUS Prime — Master Orchestrator

## Overview

NEXUS Prime is the top-level AI orchestration layer for the Super Pi ecosystem. It operates as a Directed Acyclic Graph (DAG) execution engine, managing all 8 autonomous AI agents as nodes in a dependency graph.

## Architecture

```
User Goal / Protocol Event
         ↓
  NEXUS Prime Engine
         ↓
  DAG Decomposition
  ┌──────┴────────────────────────────────┐
  │  Parse goal into atomic sub-tasks      │
  │  Assign each task to appropriate agent │
  │  Map dependencies (edges)              │
  │  Identify parallel-safe clusters       │
  └──────────────────────────────────────┘
         ↓
  Parallel Dispatch (parallel-safe tasks)
  Sequential Chain  (dependency-ordered tasks)
         ↓
  Result Aggregation + Conflict Detection
         ↓
  Conflict Arbitration (if needed)
         ↓
  Final Result → Verified → Delivered
```

## Agent Priority Hierarchy

When two agents produce conflicting outputs, NEXUS Prime resolves via priority:

| Priority | Agent | Domain | Veto |
|----------|-------|--------|------|
| 0 (highest) | NEXUS Prime | Orchestration | ✅ |
| 1 | SAPIENS Guardian | Safety/Insurance | ✅ |
| 2 | LEX Machina | Compliance | ✅ |
| 3 | ARCHON Forge | Contracts | ✅ |
| 4 | OMEGA DeFi | Finance | ❌ |
| 5 | SINGULARITY Swap | Trading | ❌ |
| 6 | VULCAN Deploy | Infrastructure | ❌ |
| 7 | AESTHETE Nexus | UX | ❌ |

## Hard Veto Rules

NEXUS Prime **immediately halts** the entire pipeline when:

```
❌ SAPIENS Guardian raises: fraud / riba / gambling / Pi Coin flag
❌ LEX Machina returns: compliance FAIL in active jurisdiction
❌ ARCHON Forge: formal verification not passed
❌ VULCAN Deploy: self-heal fails 3 consecutive cycles
```

## 72-Hour Sprint Queue

Sprint mode allows multi-day complex goals:

```yaml
sprint:
  max_duration: 72h
  checkpoint_interval: 6h
  auto_rebalance: true
  priority_escalation:
    - threshold: 48h
      action: escalate_priority
    - threshold: 60h
      action: page_guardian
    - threshold: 71h
      action: emergency_veto_gate
```

## On-Chain Component: NEXUSOrchestrator.sol

The `NEXUSOrchestrator` contract at `contracts/NEXUSOrchestrator.sol` provides:

- **Agent Registry** — 8 canonical agents registered at deploy time
- **Pipeline Management** — Create DAGs with task ordering and dependencies
- **Veto Authority** — SAPIENS, LEX, ARCHON, NEXUS can veto pipelines
- **Conflict Resolution** — `resolveConflict()` uses priority hierarchy
- **Sprint Mode** — `sprintMode: true` + `deadline` for 72h queues
- **Task Lifecycle** — `PENDING → IN_PROGRESS → COMPLETED/FAILED/VETOED`

## Conflict Types

| Type | Description | Resolution |
|------|-------------|------------|
| `data_conflict` | Two agents produce contradictory data | Lower priority agent's output discarded |
| `resource_conflict` | Two agents competing for same L2 slot | Higher priority agent gets slot |
| `policy_conflict` | Agent violates another agent's policy | Veto authority agent wins |
| `timing_conflict` | Sequential dependency broken | NEXUS reorders DAG |

## Conflict Resolution Protocol

```
1. Classify conflict type
2. Apply priority hierarchy (lower number = higher priority)
3. Pause lower-priority agent
4. Resume from last clean checkpoint
5. Emit ConflictResolved event on-chain
6. Log evidence hash to PiTaintRegistry if fraud-related
```

## API Reference (Off-Chain)

```python
from packages.chronos_oracle import NEXUSPrime

nexus = NEXUSPrime()

# Create and execute a pipeline
pipeline = nexus.create_pipeline(
    name="Deploy SPI v3.1",
    tasks=[
        {"agent": "LEX",    "action": "compliance_scan",    "deps": []},
        {"agent": "ARCHON", "action": "generate_contract",  "deps": ["LEX"]},
        {"agent": "SAPIENS","action": "security_audit",     "deps": ["ARCHON"]},
        {"agent": "VULCAN", "action": "deploy",             "deps": ["SAPIENS"]},
        {"agent": "AESTHETE","action": "update_ui",         "deps": ["VULCAN"]},
    ],
    priority="HIGH",
    sprint_mode=False
)

result = nexus.execute(pipeline)
```
