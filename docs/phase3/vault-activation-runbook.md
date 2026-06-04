# Phase 3 RWA Vault Activation Runbook
**OMEGA DeFi | Super Pi v16.0.0-phase3 | NexusLaw v6.1 Art.40**
*Last patched: 2026-06-04T20:22:00+07:00*

---

## 🔴 CURRENT STATUS: AWAITING SAPIENS CLEARANCE ON SHA 5e7e1eda

| Component | Status | Commit |
|---|---|---|
| SingularityBridge v1.1 | ✅ GREEN — broadcasting | 898c2a79 |
| Script A | ✅ SAPIENS cleared | f3d27448 |
| Script B v2 | ✅ Updated for v1.2 sig | 83178a96 |
| RWAVaultFactory v1.2 | ⏳ SAPIENS re-audit in progress | 5e7e1eda (unconfirmed) |
| SPIRegistry v1.0 | ⏳ Committed, pending SAPIENS review | 9c827cfd |

---

## Address Checklist (required before Step 1 fires)

| Address | Owner | Status |
|---|---|---|
| `SPI_TOKEN` — ERC-20 on Super Pi L2 | OMEGA DeFi / user | 🔴 **NEEDED** |
| `SHARIAH_BOARD` multisig (≠ VAULT_MANAGER) | NEXUS Prime | ⏳ |
| `_admin` for SPIRegistry constructor | NEXUS Prime | ⏳ |
| `_guardian` for SPIRegistry constructor | NEXUS Prime | ⏳ |
| `_feeTreasury` for SingularityBridge constructor | NEXUS Prime | ⏳ |
| `_quorumThreshold` for SingularityBridge constructor | NEXUS Prime | ⏳ |
| `VAULT_MANAGER` broadcaster wallet | VULCAN Deploy | ⏳ |

---

## SAPIENS Resubmission Gates

| # | Item | Status |
|---|---|---|
| 1 | RWA-N3: `claimYield()` rewards-per-token fix | ⏳ confirm in 5e7e1eda |
| 2 | `_assertCollateral()` per-vault isolation fix | ⏳ confirm in 5e7e1eda |
| 3 | SPIRegistry.sol source reviewed by SAPIENS | ⏳ 9c827cfd |
| 4 | SAPIENS clearance issued | ⏳ re-audit in progress |

---

## Confirmed Deploy Sequence (5 steps — NEXUS Prime 2026-06-04T20:22)

> ⛔ **GATED: All steps hold until SAPIENS issues clearance on SHA 5e7e1eda.**
> **Dual-broadcaster enforced:** Script A = VAULT_MANAGER, Script B = SHARIAH_BOARD multisig (different wallets).

### Step 1 — Deploy SPIRegistry v1.0 (`9c827cfd`)

```bash
forge script contracts/phase3/SPIRegistry.sol \
  --constructor-args <ADMIN_ADDR> <GUARDIAN_ADDR> \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record: SPI_REGISTRY=<addr>
```

> ⚠️ Do NOT call `approveSPIToken()` yet — requires SPI_TOKEN from Step 2.

### Step 2 — Confirm SPI_TOKEN

Omega DeFi / user must supply the deployed ERC-20 `$SPI` token address on Super Pi L2.

```bash
# Once confirmed:
export SPI_TOKEN=<addr>
cast send $SPI_REGISTRY "approveSPIToken(address)" $SPI_TOKEN \
  --rpc-url https://rpc.super-pi-l2.io
```

### Step 3 — Deploy RWAVaultFactory v1.2 (`5e7e1eda`, post SAPIENS clearance)

```bash
forge script contracts/phase3/RWAVaultFactory.sol \
  --constructor-args <SHARIAH_BOARD_MULTISIG> <SPI_REGISTRY> \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record: RWA_FACTORY=<addr>
```

### Step 4 — Deploy SingularityBridge

```bash
forge script contracts/SingularityBridge.sol \
  --constructor-args <SPI_REGISTRY> <FEE_TREASURY> <QUORUM_THRESHOLD> \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
```

### Step 5a — Script A: Create Vaults (VAULT_MANAGER broadcaster)

Script: `scripts/phase3/DeployPhase3Vaults_A.s.sol` (`f3d27448`)

```bash
export SPI_TOKEN=<addr>
export RWA_FACTORY=<addr>
forge script scripts/phase3/DeployPhase3Vaults_A.s.sol:DeployVaultsA \
  --rpc-url https://rpc.super-pi-l2.io --broadcast --verify
# Capture: VAULT_ID_1, VAULT_ID_2, VAULT_ID_3
```

### Step 5b — Script B v2: Certify Halal (SHARIAH_BOARD multisig)

Script: `scripts/phase3/DeployPhase3Vaults_B.s.sol` (`83178a96`)

```bash
export VAULT_ID_1=<from 5a>
export VAULT_ID_2=<from 5a>
export VAULT_ID_3=<from 5a>
forge script scripts/phase3/DeployPhase3Vaults_B.s.sol:CertifyHalalB \
  --rpc-url https://rpc.super-pi-l2.io --broadcast --verify
```

Expected: `HalalCertified(vaultId, msg.sender)` × 3. certURIs empty until LEX Machina IPFS/Arweave links populated via `renewHalalCert()`.

### Step 6 — Post-Deploy Verification

```bash
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_1
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_2
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_3
```

Confirm: `halalCertified == true`, `active == true`, `spiBToken != 0xDEAD`, `minCollateral == 11_000`.

### Step 7 — Populate certURIs (post LEX Machina delivery)

```solidity
vaultFactory.renewHalalCert(VAULT_ID_1, HalalCert({...certURI: "ipfs://..."}));
vaultFactory.renewHalalCert(VAULT_ID_2, HalalCert({...certURI: "ipfs://..."}));
vaultFactory.renewHalalCert(VAULT_ID_3, HalalCert({...certURI: "ipfs://..."}));
```

---

## Vault Halal Certificate Registry

| Vault | Cert Ref | Structure | Yield | AAOIFI | certURI |
|---|---|---|---|---|---|
| SPI-TBILL-V1 | `LM-HALAL-PHASE3-001` | Mudarabah 85/15 | ~4.8% pa | No.13 ✅ | ⏳ pending |
| SPI-REALESTATE-V1 | `LM-HALAL-PHASE3-002` | Ijarah 90/10 | ~6.5% pa | No.9 ✅ | ⏳ pending |
| SPI-SUKUK-V1 | `LM-HALAL-PHASE3-003` | Sukuk Ijarah 88/12 | ~5.5% pa | No.17+9 ✅ | ⏳ pending |

> Certs contingent on RWA-N3 + `_assertCollateral()` fixes confirmed in factory source before `certifyHalal()` executes (LEX Machina: zulm + gharar grounds).

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
| NEXUS Prime | All deploy addresses, SPIRegistry admin/guardian, SingularityBridge fee treasury + quorum |
| VULCAN Deploy | Broadcast execution, gas, sequence ordering, VAULT_MANAGER wallet |
| ARCHON Forge | 5e7e1eda fix confirmation, contract changes, v1.x+ work |
| LEX Machina | certURI links, cert disputes, Art.40 queries, cert renewal |
| SAPIENS Guardian | Re-audit clearance, exploit alerts |
| AESTHETE Nexus | UI unlock, user flow |
