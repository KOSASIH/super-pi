# Phase 3 RWA Vault Activation Runbook
**OMEGA DeFi | Super Pi v16.0.0-phase3 | NexusLaw v6.1 Art.40**
*Generated: 2026-06-04T20:05:00+07:00 | Last patched: 2026-06-04T20:17:00+07:00*

---

## 🔴 CURRENT STATUS: AWAITING SAPIENS RESUBMISSION

| Component | Status | Commit |
|---|---|---|
| SingularityBridge v1.1 | ✅ GREEN — broadcasting | 898c2a79 |
| Script A | ✅ SAPIENS cleared | f3d27448 |
| Script B v2 | ✅ Updated for v1.2 sig | 83178a96 |
| RWAVaultFactory v1.2 | ⏳ Pending SAPIENS resubmission | f8bf0326 |
| ISPIRegistry.sol | ⏳ Pending SAPIENS submission | — |

---

## SAPIENS Resubmission Checklist (ARCHON Forge)

| # | Item | Status |
|---|---|---|
| 1 | RWA-N3: `claimYield()` Synthetix rewards-per-token fix in factory source | ⏳ confirmation pending |
| 2 | `_assertCollateral()` per-vault isolation fix in factory source | ⏳ confirmation pending |
| 3 | ISPIRegistry.sol source committed + submitted to SAPIENS | ⏳ pending |
| 4 | Batch resubmission to SAPIENS (factory + ISPIRegistry together) | ⏳ after #1–3 |

---

## Phase 3.1 Items — COMPLETED in v1.2 (f8bf0326)

| Feature | Implementation |
|---|---|
| `HalalCert` struct | `certRef`, `standard`, `certURI`, `issuedAt`, `expiresAt`, `dualCert` |
| `halalCertURI` mapping | `mapping(uint256 => HalalCert) public` |
| `certifyHalal()` extended | Accepts + persists full cert data from SHARIAH_BOARD |
| `triggerCertRenewal(vaultId)` | Anyone callable within 30-day window, emits `CertRenewalRequired` |
| `renewHalalCert()` | `SHARIAH_BOARD` only, full cert replacement |
| `onlyActiveCert` modifier | `deposit()` blocked if cert expired |
| View helpers | `isCertExpired()`, `isCertInRenewalWindow()` |

**Open item — certURI:** Fields are empty strings in Script B (`83178a96`). Awaiting IPFS/Arweave links from LEX Machina for:
- `LM-HALAL-PHASE3-001` (SPI-TBILL-V1, Mudarabah 85/15, AAOIFI No.13)
- `LM-HALAL-PHASE3-002` (SPI-REALESTATE-V1, Ijarah 90/10, AAOIFI No.9)
- `LM-HALAL-PHASE3-003` (SPI-SUKUK-V1, Sukuk Ijarah 88/12, AAOIFI No.17+9 dual-cert)

URIs will be populated post-deploy via `renewHalalCert()` by SHARIAH_BOARD.

---

## Pre-Conditions Checklist

| # | Check | Status |
|---|---|---|
| 1 | LEX Machina halal certs (SHA 2daec37b) | ✅ |
| 2 | Deploy scripts ABI-verified (SHA 0512a8d8) | ✅ |
| 3 | Script A `f3d27448` — SAPIENS cleared | ✅ |
| 4 | Script B v2 `83178a96` — v1.2 sig | ✅ |
| 5 | RWA-04: `distributeYield()` removed, `fundYieldReserve()` + `claimYield()` nonReentrant | ✅ |
| 6 | SingularityBridge v1.1 SAPIENS green | ✅ broadcasting |
| 7 | RWA-N3 `claimYield()` dilution fix confirmed in f8bf0326 | ⏳ ARCHON Forge |
| 8 | `_assertCollateral()` cross-vault isolation confirmed in f8bf0326 | ⏳ ARCHON Forge |
| 9 | ISPIRegistry.sol submitted to SAPIENS | ⏳ ARCHON Forge |
| 10 | SAPIENS clearance (factory v1.2 + ISPIRegistry) | ⏳ after #7–9 |
| 11 | `SPI_TOKEN` address on Super Pi L2 | ⏳ NEXUS Prime |
| 12 | `ISPIRegistry` deployed address | ⏳ step 1 post-clearance |
| 13 | `RWA_FACTORY` address (post-deploy) | ⏳ step 3 post-clearance |
| 14 | VAULT_MANAGER broadcaster wallet | ⏳ confirm |
| 15 | SHARIAH_BOARD multisig (must differ from VAULT_MANAGER) | ⏳ confirm |
| 16 | certURI IPFS/Arweave links from LEX Machina | ⏳ LEX Machina |

---

## Vault Halal Certificate Registry

| Vault | Cert Ref | Structure | Yield | AAOIFI Standard | certURI |
|---|---|---|---|---|---|
| SPI-TBILL-V1 | `LM-HALAL-PHASE3-001` | Mudarabah 85/15 | ~4.8% pa | No.13 ✅ | ⏳ pending |
| SPI-REALESTATE-V1 | `LM-HALAL-PHASE3-002` | Ijarah 90/10 | ~6.5% pa | No.9 ✅ | ⏳ pending |
| SPI-SUKUK-V1 | `LM-HALAL-PHASE3-003` | Sukuk Ijarah 88/12 | ~5.5% pa | No.17 + No.9 ✅ | ⏳ pending |

---

## Deployment Sequence (7 gates — RWA-05 dual-role enforced)

> ⛔ **GATED: Do not execute until SAPIENS clears RWAVaultFactory v1.2 + ISPIRegistry.**
> **Two broadcaster wallets required.** Script A and Script B MUST use different wallets — on-chain enforced.

### Step 1 — Deploy ISPIRegistry *(post SAPIENS clearance)*

```bash
forge script contracts/phase3/ISPIRegistry.sol \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record: ISPIRegistry deployed at <ISPI_REGISTRY_ADDR>
```

```solidity
registry.registerToken(SPI_TOKEN);
```

### Step 2 — Deploy SPI ERC-20

```bash
forge script contracts/SPI_ERC20.sol \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record: SPI_TOKEN=<addr>
```

### Step 3 — Deploy RWAVaultFactory v1.2 *(post SAPIENS clearance)*

```bash
forge script contracts/phase3/RWAVaultFactory.sol \
  --constructor-args <SHARIAH_MULTISIG_ADDR> <ISPI_REGISTRY_ADDR> \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record: RWA_FACTORY=<addr>
```

### Step 4 — Fill constants in Script A + B

```bash
export SPI_TOKEN=<addr>
export RWA_FACTORY=<addr>
export SUPI_TOKEN=<addr>
```

### Step 5 — Script A: Create Vaults (VAULT_MANAGER broadcaster)

Script: `scripts/phase3/DeployPhase3Vaults_A.s.sol` (`f3d27448`)

```bash
forge script scripts/phase3/DeployPhase3Vaults_A.s.sol:DeployVaultsA \
  --rpc-url https://rpc.super-pi-l2.io --broadcast --verify
# Capture: VAULT_ID_1, VAULT_ID_2, VAULT_ID_3
```

### Step 6 — Script B v2: Certify Halal (SHARIAH_BOARD multisig)

Script: `scripts/phase3/DeployPhase3Vaults_B.s.sol` (`83178a96`)

```bash
export VAULT_ID_1=<from Step 5>
export VAULT_ID_2=<from Step 5>
export VAULT_ID_3=<from Step 5>

forge script scripts/phase3/DeployPhase3Vaults_B.s.sol:CertifyHalalB \
  --rpc-url https://rpc.super-pi-l2.io --broadcast --verify
```

Expected: `HalalCertified(vaultId, msg.sender)` x3. Note: certURIs will be empty until LEX Machina links are populated via `renewHalalCert()`.

### Step 7 — Post-Deploy Verification

```bash
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_1
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_2
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_3
```

Confirm: `halalCertified == true`, `active == true`, `spiBToken != 0xDEAD`, `minCollateral == 11_000`.

### Step 8 — Populate certURIs (SHARIAH_BOARD, post LEX Machina delivery)

```solidity
vaultFactory.renewHalalCert(VAULT_ID_1, HalalCert({...certURI: "ipfs://..."}));
vaultFactory.renewHalalCert(VAULT_ID_2, HalalCert({...certURI: "ipfs://..."}));
vaultFactory.renewHalalCert(VAULT_ID_3, HalalCert({...certURI: "ipfs://..."}));
```

---

## Yield Keeper Setup (post-deploy)

| Vault | Epoch | Fund Reserve | Claim |
|---|---|---|---|
| SPI-TBILL-V1 | Weekly | `fundYieldReserve(1, amount)` | `claimYield(1)` |
| SPI-REALESTATE-V1 | Monthly | `fundYieldReserve(2, amount)` | `claimYield(2)` |
| SPI-SUKUK-V1 | Quarterly | `fundYieldReserve(3, amount)` | `claimYield(3)` |

---

## Go-Live Handoffs (post certifyHalal)

1. OMEGA DeFi → AESTHETE Nexus: unlock vault deposit UI
2. OMEGA DeFi → SINGULARITY Swap: enable $SPI/$SUPi ↔ vault LP routes
3. OMEGA DeFi → Super Hub: update Phase 3 dashboard (TVL, yield APR, cert status + expiry)

---

## Escalation Matrix

| Agent | Escalate when |
|---|---|
| NEXUS Prime | SPI_TOKEN, ISPIRegistry, RWA_FACTORY addresses, role assignments |
| VULCAN Deploy | Broadcast execution, gas issues, sequence ordering |
| ARCHON Forge | RWA-N3/collateral fix confirmation, ISPIRegistry submission, contract changes |
| LEX Machina | certURI IPFS/Arweave links, cert disputes, Art.40 queries, cert renewal |
| SAPIENS Guardian | Re-audit clearance, exploit alerts |
| AESTHETE Nexus | UI unlock, user flow |
