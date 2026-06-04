# Phase 3 RWA Vault Activation Runbook
**OMEGA DeFi | Super Pi v16.0.0-phase3 | NexusLaw v6.1 Art.40**
*Generated: 2026-06-04T20:05:00+07:00*

---

## Pre-Conditions Checklist

| # | Check | Status |
|---|---|---|
| 1 | LEX Machina halal certs committed (SHA 2daec37b) | ✅ |
| 2 | Deploy scripts ABI-verified (SHA 0512a8d8) | ✅ |
| 3 | SAPIENS Guardian safety scan PASS | ✅ |
| 4 | `SPI_TOKEN` address confirmed on Super Pi L2 | ⏳ NEXUS Prime |
| 5 | `RWA_FACTORY` address confirmed (or deploy first) | ⏳ NEXUS Prime |
| 6 | Broadcaster wallet holds `VAULT_MANAGER` role | ⏳ confirm |
| 7 | Broadcaster wallet holds `SHARIAH_BOARD` role | ⏳ confirm |

---

## Vault Halal Certificate Registry

| Vault | Cert Ref | Structure | Yield | AAOIFI Standard |
|---|---|---|---|---|
| SPI-TBILL-V1 | `LM-HALAL-PHASE3-001` | Mudarabah 85/15 | ~4.8% pa | No.13 ✅ |
| SPI-REALESTATE-V1 | `LM-HALAL-PHASE3-002` | Ijarah 90/10 | ~6.5% pa | No.9 ✅ |
| SPI-SUKUK-V1 | `LM-HALAL-PHASE3-003` | Sukuk Ijarah 88/12 | ~5.5% pa | No.17 + No.9 dual-cert ✅ |

All Art.40(a–h) checks PASS. PI_COIN banned on all three.

---

## Step 1 — Deploy RWAVaultFactory (if not yet deployed)

> Skip if `RWA_FACTORY` address already confirmed.

```bash
forge script contracts/phase3/RWAVaultFactory.sol \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
```

Post-deploy — grant roles:
```solidity
factory.grantRole(factory.VAULT_MANAGER(), BROADCASTER_ADDR);
factory.grantRole(factory.SHARIAH_BOARD(), SHARIAH_MULTISIG_ADDR);
```

---

## Step 2 — Fill Address Constants

Edit `scripts/phase3/DeployPhase3Vaults.s.sol`:
```solidity
address constant SPI_TOKEN   = <SPI_ERC20_ADDRESS>;
address constant RWA_FACTORY = <RWA_FACTORY_ADDRESS>;
// Sukuk only (optional):
address constant SUPI_TOKEN  = <SUPI_ERC20_ADDRESS>; // or 0 to default to SPI_TOKEN
```

---

## Step 3 — VULCAN Deploy: Broadcast Vault Creation

```bash
forge script scripts/phase3/DeployPhase3Vaults.s.sol:DeployAllPhase3Vaults \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
```

For each vault, atomically executes:
1. `createVault(name, assetClass, targetSize, spiBToken)` → `vaultId`
2. `certifyHalal(vaultId)` → `halalCertified = true`, `active = true`

Expected events: `VaultCreated` + `HalalCertified` per vault.

---

## Step 4 — Post-Deploy Verification

```bash
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" 1
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" 2
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" 3
```

Confirm per vault: `halalCertified == true`, `active == true`, `spiBToken != 0xDEAD`, `minCollateral == 11_000`.

---

## Step 5 — Cert URIs On-Chain (Phase 3.1)

Cert refs `LM-HALAL-PHASE3-001/002/003` are off-chain (repo SHA 2daec37b).
Phase 3.1: add `mapping(uint256 => string) public halalCertURI` to factory, set during `certifyHalal`.

---

## Step 6 — Yield Keeper Setup

| Vault | Epoch | Call |
|---|---|---|
| SPI-TBILL-V1 | Weekly | `distributeYield(1, amount)` |
| SPI-REALESTATE-V1 | Monthly | `distributeYield(2, amount)` |
| SPI-SUKUK-V1 | Quarterly | `distributeYield(3, amount)` |

> ⚠ Phase 3.1: add `nonReentrant` to `distributeYield()` before keeper goes live with large yield amounts.

---

## Step 7 — Go-Live Handoffs

1. OMEGA DeFi → AESTHETE Nexus: unlock vault deposit UI
2. OMEGA DeFi → SINGULARITY Swap: enable $SPI/$SUPi ↔ vault LP routes
3. OMEGA DeFi → Super Hub: update Phase 3 dashboard (TVL, yield APR, cert status)

---

## Escalation Matrix

| Agent | Escalate when |
|---|---|
| NEXUS Prime | Address constants, role assignments |
| VULCAN Deploy | Broadcast execution, gas issues |
| LEX Machina | Cert disputes, Art.40 queries |
| SAPIENS Guardian | Exploit alerts, contract audit |
| AESTHETE Nexus | UI unlock, user flow |
