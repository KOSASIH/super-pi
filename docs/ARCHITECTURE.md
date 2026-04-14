# Super Pi — System Architecture

**Version:** 4.0.0  
**Govening Law:** LEX_MACHINA v1.3  
**Author:** NEXUS Prime / KOSASIH

---

## 1. System Overview

Super Pi is a sovereign Layer 2 blockchain ecosystem. It is designed as a **complete digital economy** — not just a protocol, but a full financial stack including its own legal tender, banking, trading, payments, real-world assets, and governance.

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SUPER PI SYSTEM LAYERS                            │
│                                                                      │
│  L6: User Applications                                               │
│    Pi Pay  |  Super Pi Bank  |  Super Pi DEX  |  RWA Market          │
│                                                                      │
│  L5: Protocol Layer                                                  │
│    PiPay.sol  SuperPiBank.sol  SuperPiDEX.sol  RWAVault.sol          │
│                                                                      │
│  L4: Token Layer                                                     │
│    SPI_Stablecoin.sol  |  SUPiToken.sol                              │
│                                                                      │
│  L3: Infrastructure Layer                                            │
│    BridgeQirad.sol  |  LedgerHafiz.sol  |  L2 Bridge                 │
│    ZK-Prover  |  Chronos Oracle  |  Payout Engine                   │
│                                                                      │
│  L2: Consensus & Security                                            │
│    Neural-Consensus (BFT+SCP)  |  MEV-Shield  |  SAPIENS Guardian   │
│                                                                      │
│  L1: Orchestration                                                   │
│    NEXUSOrchestrator.sol  |  SuperPiGovernance.sol (DAO)             │
│    nexus_prime_directives.json  |  LEX_MACHINA v1.3                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Token Architecture

### $SPI — Stablecoin Flow

```
Fiat Deposit (USD/EUR/IDR/JPY/SGD)
         │
         ▼
  BridgeQirad.sol (Agent-007)
  ├── Pi Coin hard-block check
  ├── Fiat-lock proof verification
  ├── KYC check
  └── On-chain proof hash submission
         │
         ▼
  SPI_Stablecoin.mint()
  ├── BRIDGE_QIRAD_ROLE only
  ├── Reserve freshness check (< 2h)
  ├── Daily mint limit check (< $100M)
  ├── Collateral ratio check (reserve >= supply)
  └── $SPI credited to user wallet
         │
  [Every 60 minutes]
         │
  LedgerHafiz.submitReserveProof()
  ├── 6-asset breakdown (USD/EUR/IDR/JPY/Gold/T-Bills)
  ├── Collateral ratio in BPS
  ├── Emergency pause if < 100%
  └── IPFS attestation hash on-chain

Redeem Path:
  User calls redeem() → $SPI burned → BridgeQirad event → Fiat returned 1:1
```

### $SUPi — Governance Token Flow

```
Pioneer on Pi Mainnet
         │
         ▼ (burns 🌟Pi-Native)
  BridgeQirad.migratePiNativeToSUPi()
  ├── On-chain burn proof from Pi Mainnet
  ├── Replay protection (proof hash used once)
  └── SUPiToken.mintFromBurn() 1:1
         │
         ▼
  $SUPi in Pioneer's L2 wallet
  ├── Stake → musharakah yield ($SUPi)
  ├── Vote → SuperPiGovernance.sol (DAO)
  ├── Gas  → L2 transaction fees
  └── Wakaf → endowment fund
```

---

## 3. NEXUS Prime Orchestration

NEXUS Prime operates as a DAG (Directed Acyclic Graph) pipeline manager, routing tasks to specialized agents based on type, priority, and dependency.

```
               NEXUS Prime (Master Orchestrator)
                    │
    ┌───────────────┼───────────────────────────┐
    │               │                           │
    ▼               ▼                           ▼
 [Veto Gate]  [DAG Router]             [Conflict Resolver]
    │               │
    │    ┌──────────┼──────────────────────┐
    │    ▼          ▼                      ▼
    │  Agent-1    Agent-4              Agent-7
    │  ARCHON     OMEGA                SAPIENS
    │  Forge      DeFi                 Guardian
    │    │          │                      │
    │    ▼          ▼                      ▼
    │  Contract   Yield               Security
    │  Genesis    Engine              Audit
    │
    ├── Sprint Mode (72h) → all 7 agents run in parallel
    └── Governance Mode → routes proposals through DAO + timelock
```

### Agent Dependency Map

| Task Type | Entry Agent | Dependency Chain |
|-----------|-------------|-----------------|
| New Dapp | ARCHON Forge | ARCHON → LEX → SAPIENS → VULCAN → Deploy |
| DeFi product | OMEGA DeFi | OMEGA → LEX → ARCHON → VULCAN → Deploy |
| Compliance update | LEX Machina | LEX → NEXUS veto → broadcast to all |
| Security alert | SAPIENS Guardian | SAPIENS → NEXUS Prime → KOSASIH notification |
| DEX listing | SINGULARITY | SINGULARITY → SAPIENS → LEX → VULCAN |

---

## 4. $SPI Peg Stability Mechanism

```
$SPI PARITY ENGINE
──────────────────
                        $SPI = $1.000000 USD
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  Price < $1.00          Peg OK                Price > $1.00
  (< 0.5% deviation)  (±0.5% band)           (> 0.5% deviation)
        │                                           │
        ▼                                           ▼
  Arbitrageurs buy      No action         Arbitrageurs redeem
  $SPI cheap                              $SPI → 1 USD 1:1
        │                                           │
        ▼                                           ▼
  Demand increases                      Supply contracts
  Reserve grows                         Reserve shrinks
        └──────────────► Peg restores ◄─────────────┘

Circuit Breaker (LedgerHafiz + Chronos Oracle):
  Deviation > 2% → SAPIENS alert → mint auto-paused → KOSASIH notified
```

---

## 5. Cross-Chain Bridge Architecture

```
SOURCE CHAIN                     SUPER PI L2                  DEST CHAIN
────────────                     ──────────                   ──────────
User wallet ──[lock $SPI]──▶  L2Bridge.initiate()  ──[mint $SPI]──▶ User wallet

Modes:
  ZK Mode (default):
    lock → ZK proof generation (~500ms) → verify → mint → FINALIZED

  Optimistic Mode:
    lock → state root submitted → 7-day challenge window → FINALIZED
    (fraud proof can be submitted during window)

  Fast Mode (LP pool):
    lock → LP pool provides instant liquidity → mint → FINALIZED
    (LP rebalanced asynchronously, 0.3% fee)

Security:
  Watchtower monitors every TX for anomalies
  Rate limiter: $10M/day, $1M/single TX
  Emergency pause: NEXUS Prime can halt all operations
  Pi Coin: hard-blocked at initiate() entry
```

---

## 6. Consensus Layer (Neural-Consensus)

```
NEURAL-CONSENSUS BFT + SCP PROTOCOL
─────────────────────────────────────
                   NOMINATE Phase
    Validators submit candidate values
    (Sybil-resistant: reputation score × stake weight)
              │
              ▼
             PREPARE Phase
    Ballots prepared with BFT signatures
    Adaptive quorum: f(network_size, reputation_distribution)
              │
              ▼
             COMMIT Phase
    2/3+ weighted votes required
    Outlier validators penalized (reputation decay)
              │
              ▼
            EXTERNALIZE
    Block finalized → state root published
    → ZK-Prover generates state transition proof
```

---

## 7. ZK Proof Pipeline

```
STATE TRANSITION PROOF (100k TPS)
───────────────────────────────────
Tx Batch (N txns)
    │
    ▼
ZK-Prover.prove_state_transition()
├── Poseidon hash of tx batch
├── FRI polynomial commitment
├── STARK proof generation
└── Proof: batch root is valid
    │
    ▼
On-chain Verifier
    │
    ├── ZK verify: ~500ms → FINALIZED
    └── Post to L1 (Ethereum) every 1h via L2 Bridge

RESERVE ATTESTATION PROOF (hourly)
────────────────────────────────────
LedgerHafiz collects custodian attestations
    │
    ▼
ZK-Prover.prove_reserve_attestation()
├── Private: asset breakdown (not revealed to public)
├── Public: total reserve ≥ total supply
└── Proof hash published on-chain
```

---

## 8. Halal Finance Architecture

```
OMEGA DEFI HALAL STACK
───────────────────────
$SPI deposit
    │
    ├── Murabaha (trade finance)
    │   Bank buys asset → sells to customer at cost + markup
    │   Markup: fixed at inception, NOT time-based interest
    │
    ├── Musharakah (profit-share savings)
    │   Customer deposits $SPI
    │   Profit from real assets (T-Bills, sukuk)
    │   Distribution: pro-rata to deposit × profitShareBps (from oracle)
    │   riba = 0: profitShareBps set by oracle from ACTUAL yield
    │
    ├── Sukuk (Islamic bonds)
    │   Asset-backed certificates, coupon = asset income
    │   Not fixed interest — profit from underlying asset
    │
    └── RWA Vault
        Investors buy tokenized T-Bill / property / sukuk shares
        Yield distributed in $SPI from real asset income
        Redemption at maturity: 1:1 principal return

COMPILE-TIME SHARIAH GUARD (ARCHON Forge):
  interestRate > 0           → COMPILE FAIL
  import "PiBridge.sol"      → VULCAN KILL
  payWithPI()                → SAPIENS BLOCK
  randomChanceMechanic()     → ARCHON REJECT
```

---

## 9. File Structure

```
super-pi/
├── contracts/               Smart contracts (Solidity)
│   ├── SPI_Stablecoin.sol   $SPI token (1:1 USD)
│   ├── SUPiToken.sol        $SUPi governance token
│   ├── BridgeQirad.sol      Agent-007 fiat bridge
│   ├── LedgerHafiz.sol      Agent-011 hourly PoR
│   ├── SuperPiBank.sol      Murabaha/musharakah bank
│   ├── SuperPiDEX.sol       MEV-0 AMM DEX
│   ├── PiPay.sol            ERC-4337 gasless payments
│   ├── RWAVault.sol         T-Bill/property tokenization
│   ├── NEXUSOrchestrator.sol On-chain orchestrator
│   ├── SuperPiGovernance.sol DAO governance
│   └── PiTaintRegistry.sol  On-chain taint ledger
│
├── packages/                Python packages
│   ├── neural-consensus/    BFT+SCP consensus AI
│   ├── mev-shield/          MEV protection
│   ├── zk-prover/           STARK proof engine
│   ├── chronos-oracle/      TWAP + peg oracle
│   ├── payout-engine/       Halal yield distribution
│   └── l2-bridge/           Cross-chain bridge
│
├── src/hyper_core/rust/     Rust core (L2 node)
├── agents/config/           NEXUS Prime directives JSON
├── lex/                     LEX_MACHINA legal docs
├── docs/                    Documentation
└── .github/workflows/       CI/CD pipelines
```

---

## 10. Security Model

| Threat | Mitigation |
|--------|-----------|
| Front-running / MEV | Commit-reveal on DEX, MEV-Shield FIFO ordering |
| Oracle manipulation | Outlier rejection, 5-source aggregation, TWAP |
| Reentrancy | ReentrancyGuard on all state-mutating functions |
| Reserve undercollateralization | Hourly PoR, auto-pause at <100%, ZK attestation |
| Pi Coin infiltration | Hard-coded address block, CI scan, SAPIENS registry |
| Governance attack | 4% quorum, 7-day voting, 2-day timelock, guardian veto |
| Cross-chain fraud | 7-day fraud window, Watchtower, ZK finality |
| Riba / Shariah violation | Compile-time checks, LEX Machina enforcement |
| Smart contract bugs | Slither analysis, formal verification (ARCHON), CodeQL |
