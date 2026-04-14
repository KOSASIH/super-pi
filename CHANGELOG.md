# CHANGELOG

All notable changes to Super Pi are documented here.  
Format: [Semantic Versioning](https://semver.org). Governed by [LEX_MACHINA](lex/LEX_MACHINA_v1.3.md).

---

## [4.0.0] — 2026-04-14 — LEX_MACHINA v1.3 Full Implementation

### 🆕 New Contracts
- `SuperPiBank.sol` — Shariah-compliant savings + murabaha financing in $SPI. Musharakah profit-share, zero riba, wakaf integration. Sprint 6.1.
- `SuperPiDEX.sol` — MEV-0 AMM with $SPI mandatory base pair, commit-reveal ordering (3-block window), TWAP oracle, Pi Coin ban at factory level. Sprint 6.2.
- `PiPay.sol` — ERC-4337 gasless $SPI payments, QRIS↔IDR bridge via Bridge-Qirad, ECDSA signature verification, on-chain order tracking. Sprint 6.3.
- `RWAVault.sol` — T-Bill + real estate + sukuk tokenization, $SPI-denominated yield, per-share RWA tokens, maturity redemption. Sprint 6.4.
- `BridgeQirad.sol` — Agent-007 fiat bridge, 5-fiat support (USD/EUR/IDR/JPY/SGD), Pi Coin + all variants permanently hard-blocked, fiat-lock proof verification, Pi-Native burn → $SUPi migration.
- `LedgerHafiz.sol` — Agent-011 hourly Proof-of-Reserve, 6-asset breakdown, BPS collateral tracking, emergency circuit breaker at < 100%.
- `SUPiToken.sol` — Elastic governance token, 1:1 Pi-Native burn-to-mint, ERC20Votes for DAO, wakaf minting, replay-proof burn proofs.

### 🆕 New Packages
- `packages/zk-prover/` — STARK proof engine: reserve attestation, balance proofs, state transition proofs. Poseidon hash + FRI commitment.
- `packages/chronos-oracle/` — TWAP oracle, multi-source aggregation (Chainlink/Pyth/Band/DEX), $SPI peg circuit breaker, Pi Coin price rejection.
- `packages/payout-engine/` — Automated halal yield distribution: murabaha profit-share, sukuk coupons, RWA yield, wakaf, staking. Riba detector.
- `packages/l2-bridge/` — Cross-chain bridge: ZK (instant), Optimistic (7-day), Fast (LP pool) modes. Fraud proof, watchtower, rate limiting.

### 🆕 New Docs
- `lex/LEX_MACHINA_v1.3.md` — Sovereign monetary constitution (7 articles)
- `agents/config/nexus_prime_directives.json` — Machine-readable agent config
- `docs/TOKENOMICS.md` — Dual-token system documentation
- `docs/ARCHITECTURE.md` — Full system architecture
- `docs/API_REFERENCE.md` — API documentation

### 🔄 Updated
- `SPI_Stablecoin.sol` v4 — **PEG CHANGED: $314,159 → 1 USD (1,000,000 micros)**. Bridge-Qirad-only minting. Ledger-Hafiz reserve hook. Court-order-only freeze. `onlySuperPiTender` modifier. Hardened Pi Coin block.
- `README.md` — v4.0.0: full ecosystem overview, all new contracts, performance table, architecture diagram.
- `.github/workflows/ci.yml` — Added `lex-machina-pi-isolation` job (4 checks per CI run).

### ⚠️ Breaking Changes
- `$SPI peg` changed from `$314,159` to `$1.00 USD`. All price calculations, collateral ratios, and display formats updated.
- `SPI_Stablecoin.mint()` now requires `BRIDGE_QIRAD_ROLE` (was `MINTER_ROLE`) — update all minting callers.
- `interestRate > 0` now fails at contract deployment (ARCHON Forge compile-time check).

---

## [3.0.0] — 2026-04-14

### 🆕 Added
- `PiTaintRegistry.sol` — Permanent on-chain taint ledger, 10-type classification, exchange registry
- `SuperPiGovernance.sol` — OZ Governor DAO: 4% quorum, 7-day voting, 2-day timelock, guardian veto
- `NEXUSOrchestrator.sol` — On-chain NEXUS Prime: 8 canonical agents, DAG pipeline, conflict resolution
- `SECURITY.md` — Vulnerability disclosure policy, bug bounty up to $50k SPI
- `docs/NEXUS_PRIME.md` — Orchestrator deep-dive
- `docs/AGENT_ECOSYSTEM.md` — All 8 agents with domains and veto rules
- `.github/workflows/ci.yml` — Multi-language CI (Rust/Solidity/Python/TypeScript/Docker)
- `.github/workflows/security-audit.yml` — CodeQL, Gitleaks, Slither, Trivy, cargo-deny

### 🔄 Updated
- `SPI_Stablecoin.sol` v3 — Fixed div-by-zero in `getCollateralRatio()`, added ReentrancyGuard, Pausable, ERC20Permit, 5-role RBAC, KYC enforcement, daily mint limits
- `README.md` v3.0.0 — NEXUS Prime section, 8-agent table, 100k TPS, contract matrix
- `packages/neural-consensus/` — AI reputation scoring, adaptive BFT, SCP phases, Sybil resistance
- `packages/mev-shield/` — Commit-reveal, sandwich detection, FIFO fair ordering

### 🐛 Fixed
- `SPI_Stablecoin.sol`: division-by-zero when `totalSupply() == 0` in `getCollateralRatio()`
- `Cargo.toml`: invalid edition `"2025"` → `"2021"`
- `soroban-sdk`: severely outdated `"0.9"` → `"21.0"`
- Missing `ReentrancyGuard` on all state-mutating contract functions
- Missing access control on `burn()` — was callable by anyone

---

## [2.x.x] — Prior Versions

Prior versions are preserved in git history. Core functionality included basic $SPI token, Pi taint tracking, and initial agent infrastructure.

---

*Governed by LEX_MACHINA v1.3 · Maintained by NEXUS Prime / KOSASIH*
