# Super Pi L2 Network

> **Network ID:** `super-pi-l2` | **Version:** 2.0.0 | **Author:** KOSASIH

## Overview

Super Pi L2 is a high-throughput Layer 2 network built on top of Pi Mainnet, providing:
- **10,000 TPS** capacity vs ~7 TPS on L1
- **500ms block times** (vs minutes on L1)
- **Cross-chain bridges** to Arbitrum and Ethereum
- **ZK proof finality** as fraud-proof fallback
- **$0.0001 per transaction** average gas cost

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Super Pi L2 Network                  │
│                                                       │
│  ┌─────────────┐  ┌────────────────┐                  │
│  │  Sequencer  │  │  Neural        │                  │
│  │  (2s batch) │  │  Consensus     │                  │
│  └──────┬──────┘  └────────────────┘                  │
│         │                                             │
│  ┌──────▼──────────────────────────────────────────┐  │
│  │              L2 State Machine                   │  │
│  │  10,000 TPS | 500ms blocks | ZK-provable        │  │
│  └──────┬──────────────────────────────────────────┘  │
│         │                                             │
│  ┌──────▼──────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  L2 Bridge  │  │ ZK Rollup   │  │ MEV Shield   │  │
│  │  (Arbitrum/ │  │ Engine      │  │ (commit-     │  │
│  │   Ethereum) │  │ (Plonky3)   │  │  reveal)     │  │
│  └─────────────┘  └─────────────┘  └──────────────┘  │
└────────────────────────┬─────────────────────────────┘
                         │ Fraud Proof / ZK Rollup
                    ┌────▼────┐
                    │Pi Mainnet│
                    └─────────┘
```

## Rollup Mechanism

### Optimistic Rollup (Default)
1. Sequencer batches transactions every 2 seconds
2. Batch commitment posted to Pi Mainnet
3. 7-day fraud proof window
4. Anyone can challenge with fraud proof
5. Challenger rewarded from sequencer bond

### ZK Fallback (Instant Finality)
1. Activated on: fraud challenge OR user request (`force_zk=true`)
2. Plonky3-based STARK proof generated off-chain
3. Proof verified on Pi Mainnet smart contract
4. Instant finality — no waiting period
5. Higher gas cost than optimistic mode

## Cross-Chain Bridges

### PI → Arbitrum (USDT)
```
Lock PI on Pi Mainnet
  → Sequencer includes bridge tx in L2 batch
  → ZK proof or optimistic window
  → Release USDT on Arbitrum to: 0x373Ec75e4e99CA59e367bA667EC38B2e14Af390B
```

### Arbitrum → PI
```
Lock USDT on Arbitrum
  → Arbitrum relay submits proof to L2
  → Release PI on Pi Mainnet
```

## Network Parameters

| Parameter | Value |
|-----------|-------|
| Network ID | `super-pi-l2` |
| Block Time | 500ms |
| Max TPS | 10,000 |
| Batch Interval | 2,000ms |
| Fraud Proof Window | 168 hours (7 days) |
| Gas Token | PI |
| Min Supernodes | 7 |
| Max Supernodes | 100 |
| ZK Backend | Plonky3 v1 |
| Compression | zstd |

## RPC Endpoints

```
Primary:   https://rpc.super-pi-l2.io
Secondary: https://rpc2.super-pi-l2.io
Explorer:  https://explorer.super-pi-l2.io
```

## MEV Protection

All transactions on Super Pi L2 benefit from the MEV Shield:
- **Commit-Reveal Scheme**: prevents front-running
- **Sandwich Detection**: blocks sandwich attacks in real-time
- **Fair Ordering**: 60% time-weight + 40% gas-price ordering

## Gas Estimation

```python
# Python example
from packages.l2_bridge.src.bridge import L2Bridge

bridge = L2Bridge("config/network.json")
tx = bridge.initiate(
    from_chain="pi-mainnet",
    to_chain="arbitrum",
    asset="USDT",
    amount=1000.0,
    sender="GCKUNNC6X...",
    recipient="0x373Ec75...",
)
```
