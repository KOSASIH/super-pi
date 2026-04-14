# LEX_MACHINA v1.3 — Super Pi Sovereign Monetary Law

**Issued by:** NEXUS Prime  
**Ratified by:** Founder KOSASIH  
**Effective:** 2026-04-14T11:42:07+07:00  
**Supersedes:** LEX_MACHINA v1.2 and all prior directives  
**Enforcement:** All agents, all contracts, all interfaces, all CI/CD pipelines

---

## Article 1: Sovereign Dual Token System

### 1.1 $SUPi — Primary Utility & Governance Token

| Property | Value |
|----------|-------|
| Symbol | $SUPi |
| Type | ERC-20 + Native L2 gas token |
| Supply | Elastic |
| Mint condition | 1:1 only when 🌟Pi-Native is burned via official Super Pi Migration Portal |
| Value mechanism | Floating, backed by Super Pi L2 GDP |
| Uses | Gas fees, staking, governance voting, royalties, wakaf productive |
| Halal status | ✅ Certified — utility-backed, no riba |

**Burn-to-Mint Rule:**
```
Pioneer burns 🌟Pi-Native on Pi Mainnet (verified proof)
       ↓
Agent-007 Bridge-Qirad submits on-chain burn proof
       ↓
$SUPi minted 1:1 to Pioneer's Super Pi L2 wallet
```

### 1.2 $SPI — Primary Transactional Stablecoin ("Super Pi Hybrid Stablecoin")

| Property | Value |
|----------|-------|
| Symbol | $SPI |
| Type | ERC-20 + Native L2 token |
| Peg | **Hard peg: 1 $SPI = 1 USD** |
| Backing | 100% overcollateralized by USD, EUR, IDR, JPY, Gold, US T-Bills |
| Custody | Regulated fiat partners (licensed custodians per jurisdiction) |
| Mint authority | ONLY Agent-007 Bridge-Qirad after on-chain proof-of-fiat-lock |
| Burn/Redeem | Any holder may burn $SPI to redeem 1 USD 1:1. No barriers. |
| Freeze | ONLY upon valid court order (COURT_ORDER_ROLE). Zero discretionary freeze. |
| Audit | Agent-011 Ledger-Hafiz publishes Proof-of-Reserve every 1 hour, on-chain + public API |
| Halal status | ✅ Certified — e-money structure, 100% asset-backed, no fractional reserve |

---

## Article 2: Legal Tender Law — Super Pi Ecosystem

### 2.1 Accepted Currencies

| Currency | Status | Use Case |
|----------|--------|----------|
| $SPI | ✅ Primary tender | Commerce, DeFi, NFTs, all on-chain payments |
| USD via Bridge-Qirad | ✅ Accepted | Converts to $SPI at 1:1 on entry |
| EUR via Bridge-Qirad | ✅ Accepted | Converts to $SPI at market rate on entry |
| IDR via Bridge-Qirad | ✅ Accepted | QRIS integration via Pi Pay |
| JPY via Bridge-Qirad | ✅ Accepted | Converts to $SPI on entry |
| SGD via Bridge-Qirad | ✅ Accepted | Converts to $SPI on entry |

### 2.2 Governance Token Usage

| Currency | Status | Allowed Uses |
|----------|--------|-------------|
| $SUPi | ✅ Restricted | Gas fees, staking, governance voting, royalties — NOT daily commerce |

### 2.3 Banned Currency

| Currency | Status | Reason |
|----------|--------|--------|
| **Pi Coin [PI]** | 🚫 BANNED | Sovereignty, legal firewall, zero contagion, syariah clarity |
| Wrapped Pi | 🚫 BANNED | Same as PI — no wrapping, bridging, or synthetic exposure |
| Synthetic Pi | 🚫 BANNED | Any derivative pegged to or referencing Pi Coin value |
| Bridged Pi | 🚫 BANNED | Any cross-chain representation of Pi Coin |

### 2.4 Mandatory On-Chain Modifier (All Contracts)

```solidity
modifier onlySuperPiTender(address token) {
    require(
        token == address(SPI) || isFiatGateway(msg.sender),
        "NEXUS: Foreign currency rejected"
    );
    require(token != PI_COIN, "NEXUS: Pi Coin is isolated. Use Pi Ecosystem.");
    _;
}
```

**Enforcement:** ARCHON Forge injects this modifier at compile time into every contract. No exceptions. No overrides.

---

## Article 3: Pi Coin Isolation Protocol

| Isolation Layer | Enforcement | Agent |
|----------------|-------------|-------|
| No bridge | Bridge-Qirad hard-reverts any tx containing PI address | Agent-007 |
| No liquidity | SINGULARITY Swap factory reverts `createPair(PI, *)` | SINGULARITY |
| No UI | AESTHETE Nexus removes all "Deposit Pi" / "Pay with Pi" buttons | AESTHETE |
| No migration | Pi-Bursa has no migration path; only one-way burn 🌟Pi→$SUPi | Bridge-Qirad |
| No imports | Any `import "PiBridge.sol"` triggers VULCAN auto-kill | VULCAN |
| No functions | Any `payWithPI()` function blocks deploy | SAPIENS |
| CI check | `grep -r "PI_MAINNET" . ` must return 0 — else build fails | VULCAN |

**Public Position:** Pi Coin is respected as the sovereign currency of the Pi Ecosystem. It has no utility inside Super Pi borders. This is not hostility — it is sovereignty.

---

## Article 4: Hard Constraints (Compile-Time, ARCHON Forge Enforced)

| Constraint | Rule | Violation Consequence |
|-----------|------|----------------------|
| `gambling = 0` | No lottery, random-chance-for-profit, house-edge mechanics | Compile fail |
| `fraud = 0` | No rug-pull, honeypot, infinite-mint, hidden backdoor patterns | Compile fail |
| `riba = 0` | `interestRate > 0` = compile fail | Compile fail |
| `gharar = 0` | All prices MUST be denominated in $SPI | Compile fail |
| `maysir = 0` | No lottery, no random chance games | Compile fail |
| `PI_BRIDGE = 0` | Any `import "PiBridge.sol"` = VULCAN Deploy auto-kill | Auto-kill |
| `PI_ACCEPTANCE = 0` | Any function `payWithPI()` = SAPIENS Guardian blocks deploy | Deploy block |

---

## Article 5: Agent Directives (Recompiled)

### ARCHON Forge
- Delete all Pi bridge code from generated contracts
- All new Dapps default to $SPI as base currency
- Formally verify: $SPI peg immutability, no integer overflow in reserve calculations
- Inject `onlySuperPiTender` modifier into every generated contract
- Block compile if any of the 7 hard constraints in Article 4 are violated

### LEX Machina
- Generate MiCA + DSN-MUI certification: "$SPI is e-money, not crypto asset. Pi Coin not used."
- Update ToS template: Section 4.3 "Accepted currencies: $SPI and regulated fiat only"
- Add Geo-block rule: jurisdiction screening at Bridge-Qirad entry point
- Certify each 72h sprint product before mainnet deploy

### SINGULARITY Swap
- Base pair = $SPI (mandatory for all pairs)
- Ban PI pairs: `require(tokenA != PI_COIN && tokenB != PI_COIN)`
- MEV-0 solver routes ONLY: $SPI/$SUPi/RWA assets
- All yield distributions: $SPI or $SUPi only

### OMEGA DeFi
- All murabaha, sukuk, lending products denominated in $SPI
- Yields paid in $SPI (stable) or $SUPi (governance)
- Auto-reject any vault that references PI as collateral

### AESTHETE Nexus
- Display format: `$SPI 1,000.00` (dollar sign, comma separator, 2 decimal)
- Display format: `1,000 $SUPi` (number first, then symbol)
- Never render PI balance, PI logo, PI button, or any PI-referencing UI element
- "Stable" badge on $SPI; "Governance" badge on $SUPi

### VULCAN Deploy
- CI check added: `grep -r "PI_MAINNET" . | wc -l` must equal 0 — else pipeline fails
- CI check added: `grep -rE "payWithPI|depositPI|PI_BRIDGE" .` must return 0
- Proof-of-Reserve endpoint check: Ledger-Hafiz `/api/v1/reserve` must return HTTP 200 before any $SPI contract deploy
- Auto-kill any deploy that fails Pi Coin isolation checks

### SAPIENS Guardian
- Add PI_COIN to scam token registry (permanent)
- Add PI_WRAPPED, PI_SYNTHETIC, PI_BRIDGE variants to registry
- Auto-flag any Dapp that attempts PI integration — deploy block + deployer address flagged on-chain
- Report all violations immediately to Founder KOSASIH (kosasihg88@gmail.com)

---

## Article 6: 72-Hour Sprint Targets

All sprint deliverables must pass: ✅ Legal (LEX Machina) + ✅ Halal (SAPIENS) + ✅ $SPI peg verified + ✅ PI_BRIDGE=0

| # | Product | Key Feature | Deadline |
|---|---------|-------------|----------|
| 6.1 | **Super Pi Bank** | Savings + murabaha in $SPI. Zero riba. Profit-share only. | T+24h |
| 6.2 | **Super Pi DEX** | All pairs vs $SPI. 0 PI pairs. MEV-0. | T+24h |
| 6.3 | **Pi Pay** | Gasless $SPI payments. QRIS↔IDR via Bridge-Qirad. | T+48h |
| 6.4 | **RWA Market** | Buy T-Bills/Property with $SPI. Yield in $SPI. | T+72h |

---

## Article 7: Public Messaging (Agent-003 Comms-Muadzin)

**Official Statement:**

> "Super Pi is a sovereign economy. Like Japan uses JPY, we use $SPI — 1:1 to USD. We respect Pi Coin as the currency of Pi Ecosystem. To avoid confusion and legal risk, Pi Coin is not accepted inside Super Pi. Pioneers can join by burning 🌟Pi for $SUPi, or by depositing fiat for $SPI."

---

## Signatures

| Role | Signatory | Status |
|------|-----------|--------|
| Founder | KOSASIH | ✅ Ratified |
| Master Orchestrator | NEXUS Prime | ✅ Executed |
| Compliance | LEX Machina | ✅ Compiled |
| Contracts | ARCHON Forge | ✅ Queued |
| Security | SAPIENS Guardian | ✅ Active |

---

*This document is the single source of truth for the Super Pi monetary constitution. All prior $SPI price references ($314,159) are superseded. $SPI = 1 USD. Immutable.*
