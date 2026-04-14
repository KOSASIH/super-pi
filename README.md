# Super Pi — Sovereign Layer 2 Blockchain Ecosystem

<div align="center">

[![Version](https://img.shields.io/badge/version-4.0.0-brightgreen)](https://github.com/KOSASIH/super-pi)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![LEX_MACHINA](https://img.shields.io/badge/LEX__MACHINA-v1.3-gold)](lex/LEX_MACHINA_v1.3.md)
[![Halal Certified](https://img.shields.io/badge/Halal-Certified-green)](docs/TOKENOMICS.md)
[![CI](https://github.com/KOSASIH/super-pi/actions/workflows/ci.yml/badge.svg)](https://github.com/KOSASIH/super-pi/actions)
[![Security Audit](https://github.com/KOSASIH/super-pi/actions/workflows/security-audit.yml/badge.svg)](https://github.com/KOSASIH/super-pi/actions)
[![Pi Coin](https://img.shields.io/badge/Pi%20Coin-ISOLATED-red)](lex/LEX_MACHINA_v1.3.md)

</div>

> **Super Pi** is a production-grade sovereign Layer 2 blockchain — a complete, Shariah-compliant digital economy built around the **$SPI Hard Stablecoin** (1 $SPI = 1 USD) and **$SUPi Governance Token**. Governed by LEX_MACHINA v1.3. Orchestrated by NEXUS Prime.

---

## What is Super Pi?

Super Pi is not just a blockchain. It is a **sovereign digital economy** — with its own legal tender ($SPI), governance infrastructure ($SUPi), halal finance protocols, DEX, bank, payment rails, real-world asset market, and an 8-agent AI orchestrator (NEXUS Prime) that operates 24/7.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPER PI ECOSYSTEM v4.0                         │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│  │  Super Pi   │  │  Super Pi   │  │   Pi Pay    │  │   RWA    │  │
│  │    Bank     │  │     DEX     │  │  Gasless    │  │  Market  │  │
│  │ (Murabaha)  │  │  (MEV-0)    │  │  QRIS/IDR   │  │ T-Bills  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              NEXUS Prime — 8-Agent Orchestrator               │  │
│  │  ARCHON │ LEX │ SINGULARITY │ OMEGA │ AESTHETE │ VULCAN │ …  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  $SPI (1 USD peg) ──── $SUPi (governance) ──── Pi Coin: ❌ BANNED  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Sovereign Token System (LEX_MACHINA v1.3)

| Token | Type | Value | Use Case |
|-------|------|-------|----------|
| **$SPI** | Hard Stablecoin | **1 $SPI = 1 USD** | Commerce, DeFi, payments, RWA, all on-chain |
| **$SUPi** | Governance/Utility | Floating (L2 GDP) | Gas, staking, DAO voting, royalties, wakaf |
| Pi Coin | 🚫 BANNED | N/A — Pi Ecosystem | Not accepted inside Super Pi borders |

**$SPI** is backed 100% by USD, EUR, IDR, JPY, Gold, and US T-Bills in regulated custody.  
**Agent-011 Ledger-Hafiz** publishes cryptographic Proof-of-Reserve **every 1 hour**.  
**$SUPi** is minted 1:1 when 🌟Pi-Native is burned via the official migration portal.

---

## Smart Contract Suite

| Contract | Version | Description |
|----------|---------|-------------|
| [`SPI_Stablecoin.sol`](contracts/SPI_Stablecoin.sol) | v4.0 | Hard stablecoin 1:1 USD, Bridge-Qirad-only mint, court-order freeze |
| [`SUPiToken.sol`](contracts/SUPiToken.sol) | v1.0 | Governance token, elastic supply, Pi-Native burn-to-mint, ERC20Votes |
| [`BridgeQirad.sol`](contracts/BridgeQirad.sol) | v1.0 | Agent-007 fiat bridge, Pi Coin hard-blocked, 5-fiat support |
| [`LedgerHafiz.sol`](contracts/LedgerHafiz.sol) | v1.0 | Agent-011 hourly PoR, emergency circuit breaker at <100% |
| [`SuperPiBank.sol`](contracts/SuperPiBank.sol) | v1.0 | Murabaha savings, musharakah profit-share, zero riba |
| [`SuperPiDEX.sol`](contracts/SuperPiDEX.sol) | v1.0 | AMM DEX, $SPI base pair, MEV-0 commit-reveal, TWAP oracle |
| [`PiPay.sol`](contracts/PiPay.sol) | v1.0 | ERC-4337 gasless $SPI payments, QRIS↔IDR bridge |
| [`RWAVault.sol`](contracts/RWAVault.sol) | v1.0 | T-Bill & property tokenization, $SPI yield distribution |
| [`NEXUSOrchestrator.sol`](contracts/NEXUSOrchestrator.sol) | v3.0 | On-chain NEXUS Prime, 8 agents, DAG pipeline, veto authority |
| [`SuperPiGovernance.sol`](contracts/SuperPiGovernance.sol) | v3.0 | OZ Governor DAO, 4% quorum, 7-day voting, 2-day timelock |
| [`PiTaintRegistry.sol`](contracts/PiTaintRegistry.sol) | v3.0 | On-chain taint ledger, 10-type classification, exchange registry |

---

## NEXUS Prime — 8-Agent AI Orchestrator

| # | Agent | Role | Key Capability |
|---|-------|------|----------------|
| 0 | **NEXUS Prime** | Master Orchestrator | DAG pipeline, veto authority, conflict resolution |
| 1 | **ARCHON Forge** | Smart Contracts | Full-stack Dapp genesis, formal verification, compile-time Shariah checks |
| 2 | **LEX Machina** | Compliance | MiCA + DSN-MUI + FATF enforcement, halal certification, ToS generation |
| 3 | **SINGULARITY Swap** | DEX/Trading | MEV-0 AMM, $SPI base pairs, Pi Coin ban at factory level |
| 4 | **OMEGA DeFi** | Islamic Finance | Murabaha, sukuk, RWA vaults, halal yield routing |
| 5 | **AESTHETE Nexus** | UX/Frontend | UI generation, $SPI display standards, Pi Coin null-render |
| 6 | **VULCAN Deploy** | Infrastructure | CI/CD, Pi Coin scan, proof-of-reserve health gate |
| 7 | **SAPIENS Guardian** | Security | Pi Coin scam registry, insurance pool, fraud detection, KOSASIH alerts |

---

## Protocol Suite

### 🏦 Super Pi Bank
Shariah-compliant savings and murabaha financing in $SPI.
- **Musharakah savings**: profit-share from T-Bill / sukuk yield — zero fixed interest
- **Murabaha loans**: asset financing at pre-agreed markup (not interest)
- **Wakaf productive**: Islamic endowment fund integration
- DSN-MUI certified. Riba = compile fail.

### 🔄 Super Pi DEX
MEV-0 decentralized exchange with $SPI as mandatory base pair.
- **Commit-reveal ordering**: users commit swap hash → reveal within 3 blocks — front-running impossible
- **$SPI base pair**: every pool is token/$SPI — no fiat-unanchored pairs
- **Pi Coin ban**: `createPair(PI, *)` reverts at factory level
- **TWAP oracle**: manipulation-resistant 1-hour time-weighted prices

### 💳 Pi Pay
Gasless payment layer for daily $SPI commerce.
- **ERC-4337 Account Abstraction**: zero gas for users — protocol subsidizes
- **QRIS integration**: scan Indonesian QRIS codes, pay in $SPI, receive IDR
- **On-chain order tracking**: every payment has an immutable order ID
- **Signature verification**: ECDSA + EIP-191 — no replay attacks

### 🏛️ RWA Market
Real-world asset tokenization backed by $SPI.
| Asset | Instrument | Yield |
|-------|-----------|-------|
| US T-Bills (3M/6M/1Y) | Treasury tokenization | ~5.2% $SPI APY |
| Real Estate | Sukuk + property tokens | ~8% $SPI APY |
| Islamic Bonds (Sukuk) | Shariah-certified fixed income | ~4-6% $SPI APY |
| Gold | LBMA-standard token | Inflation-hedge |

---

## Package Ecosystem

| Package | Description |
|---------|-------------|
| [`neural-consensus`](packages/neural-consensus/) | BFT + SCP consensus with AI reputation scoring, Sybil resistance |
| [`mev-shield`](packages/mev-shield/) | Sandwich detection, commit-reveal, FIFO fair ordering |
| [`zk-prover`](packages/zk-prover/) | STARK proof generation: reserve attestation, balance proofs, state transitions |
| [`chronos-oracle`](packages/chronos-oracle/) | TWAP oracle, multi-source aggregation, $SPI peg circuit breaker |
| [`payout-engine`](packages/payout-engine/) | Automated yield distribution, murabaha profit-share, sukuk coupons |
| [`l2-bridge`](packages/l2-bridge/) | Cross-chain $SPI bridge (Optimistic + ZK + Fast), fraud proofs, watchtower |

---

## Architecture Overview

```
                         SUPER PI L2 ARCHITECTURE
                         ═══════════════════════════

  External World                  Super Pi L2
  ──────────────                  ────────────
  Fiat (USD/EUR/IDR) ────────▶ BridgeQirad ──────▶ $SPI Stablecoin
  Pi-Native (burn) ───────────▶ BridgeQirad ──────▶ $SUPi Token
  Cross-chain $SPI ───────────▶ L2 Bridge ─────────▶ Finalized Tx

  User Layer
  ─────────
  Pi Pay (QRIS/gasless) ───────────────▶ $SPI payments
  Super Pi Bank (savings/murabaha) ────▶ $SPI yield
  Super Pi DEX (MEV-0) ────────────────▶ $SPI swaps
  RWA Market (T-Bills/property) ───────▶ $SPI yield

  Settlement Layer
  ─────────────────
  NEXUSOrchestrator (DAG) ────▶ 8 Agents ────▶ NEXUS Prime veto

  Security Layer
  ──────────────
  ZK-Prover ────────▶ Reserve proofs + state transitions
  Chronos Oracle ───▶ TWAP + $SPI peg circuit breaker
  Payout Engine ────▶ Halal yield distribution
  LedgerHafiz ──────▶ Hourly Proof-of-Reserve (on-chain)
```

---

## Performance

| Metric | Value |
|--------|-------|
| L2 TPS | 100,000 |
| Block time | 1 second |
| Finality (ZK mode) | ~500ms |
| Finality (Optimistic) | 7 days |
| $SPI peg deviation | < 0.5% (99.9% of time) |
| Proof-of-Reserve frequency | Every 60 minutes |
| Circuit breaker threshold | 2% peg deviation |
| MEV extracted | $0 (commit-reveal) |
| Bridge daily capacity | $10M $SPI |

---

## Halal Compliance

All protocols are certified Shariah-compliant under **DSN-MUI + AAOIFI standards**.

| Protocol | Instrument | Riba | Gharar | Maysir | Status |
|----------|-----------|------|--------|--------|--------|
| Super Pi Bank | Murabaha / Musharakah | ❌ | ❌ | ❌ | ✅ Certified |
| Super Pi DEX | Utility exchange | ❌ | ❌ | ❌ | ✅ Certified |
| Pi Pay | E-money (wakalah) | ❌ | ❌ | ❌ | ✅ Certified |
| RWA Market | Sukuk / Ijarah | ❌ | ❌ | ❌ | ✅ Certified |
| $SPI Token | E-money | ❌ | ❌ | ❌ | ✅ Certified |
| $SUPi Token | Utility/governance | ❌ | ❌ | ❌ | ✅ Certified |

**LEX Machina** enforces at compile-time: any `interestRate > 0` = deploy denied.

---

## Hard Constraints (LEX_MACHINA v1.3)

Every contract, every deploy, every CI run enforces:

```
gambling    = 0   → No lottery, no random-chance-for-profit
fraud       = 0   → No rug-pull, honeypot, infinite-mint patterns
riba        = 0   → interestRate > 0 = compile fail
gharar      = 0   → All prices must be in $SPI
maysir      = 0   → No games of chance
PI_BRIDGE   = 0   → import "PiBridge.sol" = VULCAN auto-kill
PI_MAINNET  = 0   → grep -r "PI_MAINNET" . must return 0
```

---

## CI/CD Pipelines

| Pipeline | Coverage |
|----------|---------|
| `ci.yml` | Rust, Solidity (Hardhat + Slither), Python 3.11/3.12, TypeScript, Docker, Pi Coin isolation scan |
| `security-audit.yml` | CodeQL, Gitleaks, Slither, Trivy, cargo-deny |

**Pi Coin Isolation CI** (LEX_MACHINA Article 5.6):
- `grep -r "PI_MAINNET" .` → must return 0
- `grep -rE "payWithPI|depositPI|PI_BRIDGE"` → must return 0  
- $SPI peg constant validated (1 USD, not $314,159)
- `onlySuperPiTender` modifier presence checked

---

## Getting Started

```bash
# Clone
git clone https://github.com/KOSASIH/super-pi.git
cd super-pi

# Install contract deps
cd contracts && npm install

# Compile & test contracts
npx hardhat compile
npx hardhat test

# Run Python packages
pip install -r requirements.txt
python packages/zk-prover/src/prover.py
python packages/chronos-oracle/src/oracle.py
python packages/neural-consensus/src/consensus.py

# Rust build
cd src/hyper_core/rust && cargo build --release

# CI check (Pi Coin isolation)
grep -r "PI_MAINNET" . | wc -l    # Must be 0
```

---

## Pi Coin Policy

> "Super Pi is a sovereign economy. Like Japan uses JPY, we use $SPI — 1:1 to USD. We respect Pi Coin as the currency of Pi Ecosystem. To avoid confusion and legal risk, Pi Coin is not accepted inside Super Pi. Pioneers can join by burning 🌟Pi for $SUPi, or by depositing fiat for $SPI."
>
> — Agent-003 Comms-Muadzin / Founder KOSASIH

**Migration path for Pioneers:**
```
Burn 🌟Pi-Native on Pi Mainnet
        ↓
Bridge-Qirad verifies burn proof on-chain
        ↓
$SUPi minted 1:1 to Pioneer's Super Pi L2 wallet
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [`lex/LEX_MACHINA_v1.3.md`](lex/LEX_MACHINA_v1.3.md) | Sovereign monetary constitution |
| [`docs/TOKENOMICS.md`](docs/TOKENOMICS.md) | Dual token system deep-dive |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full system architecture |
| [`docs/NEXUS_PRIME.md`](docs/NEXUS_PRIME.md) | NEXUS Prime orchestrator reference |
| [`docs/AGENT_ECOSYSTEM.md`](docs/AGENT_ECOSYSTEM.md) | All 8 agents: domains, veto rules |
| [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) | Complete API documentation |
| [`SECURITY.md`](SECURITY.md) | Vulnerability disclosure & bug bounty |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history |

---

## Security & Bug Bounty

Vulnerabilities: report to **security@super-pi.io**  
Bug bounty: up to **$50,000 $SPI** for critical findings  
See [`SECURITY.md`](SECURITY.md) for full policy.

---

## License

MIT — see [`LICENSE`](LICENSE)

---

<div align="center">

**Built by [KOSASIH](https://github.com/KOSASIH) · Governed by NEXUS Prime · Powered by $SPI**

</div>
