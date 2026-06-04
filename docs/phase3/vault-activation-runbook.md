# Phase 3 RWA Vault Activation Runbook
**OMEGA DeFi | Super Pi v16.0.0-phase3 | NexusLaw v6.1 Art.40**
*Generated: 2026-06-04T20:05:00+07:00 | Patched: 2026-06-04T20:10:00+07:00*

---

## Pre-Conditions Checklist

| # | Check | Status |
|---|---|---|
| 1 | LEX Machina halal certs committed (SHA 2daec37b) | ✅ |
| 2 | Deploy scripts ABI-verified (SHA 0512a8d8) | ✅ |
| 3 | SAPIENS Guardian safety scan PASS | ✅ |
| 4 | ARCHON Forge RWA-05 script split (f3d27448 / 8b92bc62) | ✅ |
| 5 | `SPI_TOKEN` address on Super Pi L2 | ⏳ NEXUS Prime |
| 6 | `ISPIRegistry` deployed address on Super Pi L2 | ⏳ NEXUS Prime |
| 7 | `RWA_FACTORY` address (post-deploy below) | ⏳ step 2 |
| 8 | VAULT_MANAGER broadcaster wallet confirmed | ⏳ confirm |
| 9 | SHARIAH_BOARD multisig confirmed (must differ from VAULT_MANAGER) | ⏳ confirm |
| 10 | **SAPIENS clearance** | ⏳ blocking |

---

## Vault Halal Certificate Registry

| Vault | Cert Ref | Structure | Yield | AAOIFI Standard |
|---|---|---|---|---|
| SPI-TBILL-V1 | `LM-HALAL-PHASE3-001` | Mudarabah 85/15 | ~4.8% pa | No.13 ✅ |
| SPI-REALESTATE-V1 | `LM-HALAL-PHASE3-002` | Ijarah 90/10 | ~6.5% pa | No.9 ✅ |
| SPI-SUKUK-V1 | `LM-HALAL-PHASE3-003` | Sukuk Ijarah 88/12 | ~5.5% pa | No.17 + No.9 dual-cert ✅ |

All Art.40(a–h) checks PASS. PI_COIN banned on all three.

---

## Deployment Sequence (4 steps — RWA-05 dual-role enforced)

> **Two broadcaster wallets required.** Script A and Script B MUST use different wallets.
> Running both from the same key violates RWA-05 on-chain role separation.

### Step 1 — Deploy ISPIRegistry

> Required before factory. `onlyLegalToken()` in `createVault()` calls `ISPIRegistry.isLegalToken()`. Without a registered registry the call reverts.

```bash
forge script contracts/phase3/ISPIRegistry.sol \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record output: ISPIRegistry deployed at <ISPI_REGISTRY_ADDR>
```

Register $SPI token:
```solidity
registry.registerToken(SPI_TOKEN);
```

---

### Step 2 — Deploy RWAVaultFactory v1.1

v1.1 constructor requires two params — do NOT deploy without both:
```bash
forge script contracts/phase3/RWAVaultFactory.sol \
  --constructor-args <SHARIAH_MULTISIG_ADDR> <ISPI_REGISTRY_ADDR> \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record output: RWAVaultFactory deployed at <RWA_FACTORY_ADDR>
```

---

### Step 3 — Script A: Create Vaults (VAULT_MANAGER broadcaster)

Script: `scripts/phase3/DeployPhase3Vaults_A.s.sol` (commit f3d27448)

Set env vars:
```bash
export SPI_TOKEN=<SPI_ERC20_ADDRESS>
export RWA_FACTORY=<RWA_FACTORY_ADDR>
export SUPI_TOKEN=<SUPI_ERC20_ADDRESS>  # or 0x0 to fallback to SPI_TOKEN
```

Broadcast (VAULT_MANAGER wallet):
```bash
forge script scripts/phase3/DeployPhase3Vaults_A.s.sol:DeployVaultsA \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
```

Expected stdout: `VAULT_ID_1=<n>  VAULT_ID_2=<n>  VAULT_ID_3=<n>`
Expected events: `VaultCreated(vaultId, name, assetClass)` x3

---

### Step 4 — Script B: Certify Halal (SHARIAH_BOARD multisig broadcaster)

Script: `scripts/phase3/DeployPhase3Vaults_B.s.sol` (commit 8b92bc62)

Set env vars from Script A stdout:
```bash
export VAULT_ID_1=<from Script A>
export VAULT_ID_2=<from Script A>
export VAULT_ID_3=<from Script A>
```

Broadcast (**SHARIAH_BOARD multisig — must differ from Script A wallet**):
```bash
forge script scripts/phase3/DeployPhase3Vaults_B.s.sol:CertifyHalalB \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
```

Expected events: `HalalCertified(vaultId, msg.sender)` x3

---

## Post-Deploy Verification

```bash
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" $VAULT_ID_1
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" $VAULT_ID_2
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" $VAULT_ID_3
```

Confirm per vault: `halalCertified == true`, `active == true`, `spiBToken != 0xDEAD`, `minCollateral == 11_000`.

---

## Phase 3.1 Items (ARCHON Forge)

- Add `mapping(uint256 => HalalCert) public halalCertURI` to factory → v1.2
- Populate inside `certifyHalal()` atomically
- 30-day expiry renewal trigger + `onlyRole(SHARIAH_BOARD)` renewal function
- Spec: `workspace/legal/HALAL_CERT_URI_MAPPING_PHASE3_LM-2026-0604.md` (LEX Machina)

> ✅ SAPIENS Guardian RWA-04: `distributeYield()` removed in v1.1 (blob 898c2a79). Replaced by `fundYieldReserve()` + `claimYield()`, both `nonReentrant`. Resolved. Audit target: 898c2a79.

---

## Yield Keeper Setup

| Vault | Epoch | Fund Reserve | Claim |
|---|---|---|---|
| SPI-TBILL-V1 | Weekly | `fundYieldReserve(1, amount)` | `claimYield(1)` |
| SPI-REALESTATE-V1 | Monthly | `fundYieldReserve(2, amount)` | `claimYield(2)` |
| SPI-SUKUK-V1 | Quarterly | `fundYieldReserve(3, amount)` | `claimYield(3)` |

---

## Go-Live Handoffs

1. OMEGA DeFi → AESTHETE Nexus: unlock vault deposit UI
2. OMEGA DeFi → SINGULARITY Swap: enable $SPI/$SUPi ↔ vault LP routes
3. OMEGA DeFi → Super Hub: update Phase 3 dashboard (TVL, yield APR, cert status)

---

## Escalation Matrix

| Agent | Escalate when |
|---|---|
| NEXUS Prime | SPI_TOKEN, ISPIRegistry, RWA_FACTORY addresses, role assignments |
| VULCAN Deploy | Broadcast execution, gas issues, sequence ordering |
| ARCHON Forge | Contract changes, script issues, v1.2 halalCertURI |
| LEX Machina | Cert disputes, Art.40 queries, cert renewal |
| SAPIENS Guardian | Clearance, exploit alerts, contract audit |
| AESTHETE Nexus | UI unlock, user flow |
