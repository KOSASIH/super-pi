# Phase 3 RWA Vault Activation Runbook
**OMEGA DeFi | Super Pi v16.0.0-phase3 | NexusLaw v6.1 Art.40**
*Generated: 2026-06-04T20:05:00+07:00 | Patched: 2026-06-04T20:08:00+07:00*

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
address constant SUPI_TOKEN  = <SUPI_ERC20_ADDRESS>; // or 0 to default to SPI_TOKEN
```

---

## Step 3 — VULCAN Deploy: Broadcast Vault Creation

```bash
forge script scripts/phase3/DeployPhase3Vaults.s.sol:DeployAllPhase3Vaults \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
```

For each vault atomically: `createVault(...)` → `certifyHalal(vaultId)`
Expected events: `VaultCreated` + `HalalCertified` per vault.

---

## Step 4 — Post-Deploy Verification

```bash
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" 1
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" 2
cast call $RWA_FACTORY "vaults(uint256)((uint256,string,uint8,uint256,uint256,address,bool,uint256,uint256,bool))" 3
```

Confirm: `halalCertified == true`, `active == true`, `spiBToken != 0xDEAD`, `minCollateral == 11_000`.

---

## Step 5 — Cert URIs On-Chain (Phase 3.1 — ARCHON Forge)

LEX Machina cert spec prepared. Integrate into RWAVaultFactory v1.2:
- `mapping(uint256 => HalalCert) public halalCertURI`
- Populate inside `certifyHalal()` atomically
- 30-day expiry renewal trigger + `onlyRole(SHARIAH_BOARD)` renewal function
- Full struct spec: `workspace/legal/HALAL_CERT_URI_MAPPING_PHASE3_LM-2026-0604.md` (LEX Machina)

| vaultId | certRef | AAOIFI | Expires | Dual |
|---|---|---|---|---|
| 1 | LM-HALAL-PHASE3-001 | No.13 Mudarabah | 1780574400 | false |
| 2 | LM-HALAL-PHASE3-002 | No.9 Ijarah | 1780574400 | false |
| 3 | LM-HALAL-PHASE3-003 | No.17+9 Sukuk | 1780574400 | true |

---

## Step 6 — Yield Keeper Setup

> ✅ SAPIENS Guardian RWA-04 (2026-06-04): `distributeYield()` removed in v1.1 (blob 898c2a79).
> Replaced with `fundYieldReserve()` + `claimYield()`, both with `nonReentrant`. Concern resolved.
> **Audit target: 898c2a79 (v1.1), not 16d15a890 (v1.0).**

| Vault | Epoch | Keeper trigger | Fund Reserve | Claim |
|---|---|---|---|---|
| SPI-TBILL-V1 | Weekly (7 days) | Price oracle tick | `fundYieldReserve(1, amount)` | `claimYield(1)` |
| SPI-REALESTATE-V1 | Monthly (30 days) | Settlement date | `fundYieldReserve(2, amount)` | `claimYield(2)` |
| SPI-SUKUK-V1 | Quarterly (90 days) | Coupon date | `fundYieldReserve(3, amount)` | `claimYield(3)` |

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
