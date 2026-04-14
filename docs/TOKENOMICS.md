# 💎 Super Pi Tokenomics — Sovereign Dual Token System

**Version:** LEX_MACHINA v1.3  
**Authority:** NEXUS Prime / Founder KOSASIH  
**Effective:** 2026-04-14

---

## Overview

Super Pi operates a **Sovereign Dual Token System** — one token for stable commerce, one for governance and utility. Both are Shariah-compliant, formally verified, and permanently isolated from Pi Coin.

```
┌──────────────────────────────────────────────────────┐
│              Super Pi Token System                    │
│                                                      │
│  $SPI ──── 1:1 USD ──── Commerce, DeFi, Payments    │
│  $SUPi ─── Floating ─── Gas, Staking, Governance    │
│                                                      │
│  Pi Coin: ❌ BANNED — Permanently Isolated            │
└──────────────────────────────────────────────────────┘
```

---

## Token 1: $SPI — Super Pi Hybrid Stablecoin

### Core Properties

| Property | Value |
|----------|-------|
| **Symbol** | $SPI |
| **Full Name** | Super Pi Hybrid Stablecoin |
| **Type** | ERC-20 + Native L2 Token |
| **Peg** | **Hard: 1 $SPI = 1 USD** |
| **Decimals** | 18 |
| **Contract** | `contracts/SPI_Stablecoin.sol` |

### Collateral

100% overcollateralized by regulated fiat assets held by licensed custodians:

| Asset | Type | Custodian Standard |
|-------|------|-------------------|
| USD | Fiat | FDIC-insured bank accounts |
| EUR | Fiat | ECB-regulated accounts |
| IDR | Fiat | BI-licensed custodians (Indonesia) |
| JPY | Fiat | BOJ-regulated accounts |
| Gold | Commodity | LBMA-standard allocated gold |
| US T-Bills | Gov't Bond | Regulated securities custodians |

**Collateral Ratio Target:** ≥ 105%  
**Emergency Pause Trigger:** < 100%

### Mint & Burn Rules

```
MINT:
  Agent-007 Bridge-Qirad ONLY
  Requires: on-chain proof-of-fiat-lock
  KYC verification required

BURN / REDEEM:
  Any $SPI holder, any time
  Redeems 1 USD 1:1 — no barriers, no fees, no permissions required

FREEZE:
  ONLY upon valid court order
  COURT_ORDER_ROLE — zero discretionary freeze
```

### Proof-of-Reserve

- **Agent-011 Ledger-Hafiz** publishes cryptographic proof every **1 hour**
- On-chain reserve update via `updateReserve()` on `SPI_Stablecoin.sol`
- Public API: `GET /api/v1/reserve` — returns current backing assets and ratio
- Emergency circuit breaker: if reserve < 100%, minting auto-pauses

### Display Standard

```
$SPI 1,000.00   ← dollar sign prefix, comma separator, 2 decimal places
```

---

## Token 2: $SUPi — Super Pi Governance & Utility Token

### Core Properties

| Property | Value |
|----------|-------|
| **Symbol** | $SUPi |
| **Full Name** | Super Pi Governance Token |
| **Type** | ERC-20 + Native L2 Gas Token |
| **Supply** | Elastic (no fixed cap) |
| **Value Mechanism** | Floating, backed by Super Pi L2 GDP |
| **Decimals** | 18 |
| **Contract** | `contracts/SUPiToken.sol` |

### Supply Mechanics

```
Pioneer burns 🌟Pi-Native on Pi Mainnet
    ↓
Bridge-Qirad (Agent-007) submits on-chain burn proof
    ↓
$SUPi minted 1:1 to Pioneer's Super Pi L2 wallet
```

Supply is purely demand-driven — grows as Pioneers migrate. No pre-mine, no VC allocation.

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Gas Fees** | All L2 transaction fees paid in $SUPi |
| **Staking** | Stake $SUPi to earn protocol yield (musharakah structure) |
| **Governance** | Vote on protocol upgrades, parameter changes |
| **Royalties** | Creator royalties from NFTs and IP on Super Pi L2 |
| **Wakaf Productive** | Endowment fund participation for Islamic social finance |

**NOT for:** Daily commerce, DeFi collateral (use $SPI), price-denominated contracts.

### Display Standard

```
1,000 $SUPi   ← amount first, then symbol
```

---

## Token 3: Pi Coin — BANNED

**Status:** 🚫 Permanently Isolated  
**Reason:** Sovereignty, legal firewall, zero contagion, syariah clarity

| Layer | Isolation |
|-------|-----------|
| Contracts | `PI_COIN` address permanently blocked in `BridgeQirad.sol` |
| DEX | `SINGULARITY Swap` factory reverts `createPair(PI, *)` |
| UI | `AESTHETE Nexus` renders Pi Coin elements as `null` |
| CI/CD | `grep -r "PI_MAINNET"` must return 0 — else build fails |
| Runtime | `SAPIENS Guardian` flags any PI integration attempt permanently |

**Public Position:** Pi Coin is the sovereign currency of the Pi Ecosystem. Super Pi respects this. There is no hostility — only sovereignty.

---

## Token Flow Diagram

```
                    FIAT (USD/EUR/IDR/JPY/SGD)
                           │
                    Bridge-Qirad (Agent-007)
                    [On-chain proof-of-fiat-lock]
                           │
                           ▼
                      $SPI MINTED
                    (1 $SPI = 1 USD)
                    /              \
             Commerce             DeFi
            Payments            Murabaha
           (Pi Pay)             Sukuk/RWA
                                (OMEGA DeFi)


    🌟 Pi-Native (burned on Pi Mainnet)
                    │
             Bridge-Qirad
          [On-chain burn proof]
                    │
                    ▼
               $SUPi MINTED
              (1:1 Pi-Native)
           /        |        \
        Gas      Staking   Governance
       Fees      Rewards    Voting
    (L2 TXs)   ($SUPi APY)  (DAO)
```

---

## Economic Model

### $SPI Stability Mechanism

```
$SPI Price < $1.00 → Arbitrageurs buy $SPI → Collateral pool grows → Peg restored
$SPI Price > $1.00 → Arbitrageurs redeem $SPI for fiat 1:1 → Supply contracts → Peg restored
```

Direct redemption guarantee = strongest possible peg mechanism. No algorithmic risk.

### $SUPi Value Drivers

| Driver | Mechanism |
|--------|-----------|
| L2 GDP Growth | More Dapps → more gas demand → $SUPi utility increases |
| Migration Volume | More Pioneer burns → $SUPi supply grows proportionally |
| Governance Participation | Staking locks $SUPi → circulating supply decreases |
| Treasury Yield | Protocol fees buy-and-burn $SUPi → deflationary pressure |

### Revenue Distribution (Protocol Treasury)

| Destination | Percentage | Token |
|-------------|-----------|-------|
| L2 Node Operators | 40% | $SUPi |
| SAPIENS Guardian Insurance Pool | 20% | $SPI |
| Wakaf Productive Fund | 10% | $SUPi |
| Developer Grants | 15% | $SPI |
| DAO Treasury | 15% | Both |

---

## Halal Certification

**Certifying Authority:** LEX Machina (DSN-MUI + AAOIFI standards)

| Token | Instrument | Halal Status |
|-------|-----------|--------------|
| $SPI | E-money (wakalah model) | ✅ Certified |
| $SUPi | Utility/governance token | ✅ Certified |
| Pi Coin | Foreign currency (Pi Ecosystem) | N/A (not used) |

**$SPI Halal Basis:** Asset-backed 1:1, no fractional reserve, no riba, no gharar. Redemption right is unconditional. Structure mirrors Islamic e-money wakalah contracts.

**$SUPi Halal Basis:** Utility token backed by real network services (gas, governance). No speculative structure. Staking rewards via musharakah (profit-share), not fixed interest.

---

*For legal questions: legal@super-pi.io*  
*For reserve audit: reserve@super-pi.io*  
*For Shariah questions: shariah@super-pi.io*
