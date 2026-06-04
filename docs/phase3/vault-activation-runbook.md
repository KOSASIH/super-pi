# Phase 3 RWA Vault Activation Runbook
**OMEGA DeFi | Super Pi v16.0.0-phase3 | NexusLaw v6.1 Art.40**
*Generated: 2026-06-04T20:05:00+07:00 | Last patched: 2026-06-04T20:13:00+07:00*

---

## 🔴 CURRENT STATUS: VAULT FACTORY ON HOLD

**SAPIENS Guardian split verdict @ SHA 898c2a79 (2026-06-04T20:13):**

| Component | Status | Action |
|---|---|---|
| SingularityBridge v1.1 | ✅ GREEN — broadcasting | VULCAN underway |
| RWAVaultFactory v1.1 | 🔴 HOLD | See blockers below |

### Blockers

**RWA-N3 — DEPLOY BLOCKER: `claimYield()` yield accounting dilution**
Early depositors underflow and are permanently locked out when new deposits arrive after `fundYieldReserve()`. User-funds-at-risk.
Fix path: Synthetix rewards-per-token model. **ARCHON Forge in progress.**

**HIGH — `_assertCollateral()` cross-vault contamination**
Per-vault collateral isolation missing. **ARCHON Forge in progress.**

LEX Machina certs (LM-HALAL-PHASE3-001/002/003, SHA 2daec37b) are acknowledged and valid. Block is on the factory contract, not the certifications.

**Next gate sequence:**
1. ARCHON Forge ships RWA-N3 fix + `_assertCollateral()` isolation fix
2. SAPIENS 3rd re-audit clears SHA of patched factory
3. Resume deploy sequence from Step 1 (ISPIRegistry) onward

---

## Pre-Conditions Checklist

| # | Check | Status |
|---|---|---|
| 1 | LEX Machina halal certs (SHA 2daec37b) | ✅ |
| 2 | Deploy scripts ABI-verified (SHA 0512a8d8) | ✅ |
| 3 | ARCHON Forge script split: Script A f3d27448 / Script B 8b92bc62 | ✅ |
| 4 | RWA-04: `distributeYield()` → `fundYieldReserve()` + `claimYield()` resolved | ✅ |
| 5 | SingularityBridge v1.1 SAPIENS green | ✅ broadcasting |
| 6 | RWA-N3 `claimYield()` dilution fix | 🔨 ARCHON Forge |
| 7 | `_assertCollateral()` cross-vault isolation fix | 🔨 ARCHON Forge |
| 8 | SAPIENS 3rd re-audit of patched factory | ⏳ after #6+#7 |
| 9 | `SPI_TOKEN` address on Super Pi L2 | ⏳ NEXUS Prime |
| 10 | `ISPIRegistry` deployed address | ⏳ NEXUS Prime / step 1 |
| 11 | `RWA_FACTORY` address (post-deploy) | ⏳ step 2 |
| 12 | VAULT_MANAGER broadcaster wallet | ⏳ confirm |
| 13 | SHARIAH_BOARD multisig (must differ from VAULT_MANAGER) | ⏳ confirm |

---

## Vault Halal Certificate Registry

| Vault | Cert Ref | Structure | Yield | AAOIFI Standard |
|---|---|---|---|---|
| SPI-TBILL-V1 | `LM-HALAL-PHASE3-001` | Mudarabah 85/15 | ~4.8% pa | No.13 ✅ |
| SPI-REALESTATE-V1 | `LM-HALAL-PHASE3-002` | Ijarah 90/10 | ~6.5% pa | No.9 ✅ |
| SPI-SUKUK-V1 | `LM-HALAL-PHASE3-003` | Sukuk Ijarah 88/12 | ~5.5% pa | No.17 + No.9 dual-cert ✅ |

All Art.40(a–h) checks PASS. PI_COIN banned on all three. Certs valid regardless of factory hold.

---

## Deployment Sequence (7 gates — RWA-05 dual-role enforced)

> ⛔ **GATED: Do not execute until SAPIENS clears patched factory (post RWA-N3 + collateral fix).**
> **Two broadcaster wallets required.** Script A and Script B MUST use different wallets — on-chain enforced.

### Step 1 — Deploy ISPIRegistry

```bash
forge script contracts/phase3/ISPIRegistry.sol \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Record: ISPIRegistry deployed at <ISPI_REGISTRY_ADDR>
```

Register $SPI:
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

### Step 3 — Deploy RWAVaultFactory v1.1 (post-patch)

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
export SUPI_TOKEN=<addr>  # or 0x0
```

### Step 5 — Script A: Create Vaults (VAULT_MANAGER broadcaster)

Script: `scripts/phase3/DeployPhase3Vaults_A.s.sol` (f3d27448)

```bash
forge script scripts/phase3/DeployPhase3Vaults_A.s.sol:DeployVaultsA \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
# Capture stdout: VAULT_ID_1, VAULT_ID_2, VAULT_ID_3
```

Expected events: `VaultCreated(vaultId, name, assetClass)` x3

### Step 6 — Script B: Certify Halal (SHARIAH_BOARD multisig)

Script: `scripts/phase3/DeployPhase3Vaults_B.s.sol` (8b92bc62)

```bash
export VAULT_ID_1=<from Step 5>
export VAULT_ID_2=<from Step 5>
export VAULT_ID_3=<from Step 5>

forge script scripts/phase3/DeployPhase3Vaults_B.s.sol:CertifyHalalB \
  --rpc-url https://rpc.super-pi-l2.io \
  --broadcast --verify
```

Expected events: `HalalCertified(vaultId, msg.sender)` x3

### Step 7 — Post-Deploy Verification

```bash
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_1
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_2
cast call $RWA_FACTORY "vaults(uint256)(...)" $VAULT_ID_3
```

Confirm: `halalCertified == true`, `active == true`, `spiBToken != 0xDEAD`, `minCollateral == 11_000`.

---

## Phase 3.1 Backlog (ARCHON Forge — post factory deploy)

- `mapping(uint256 => HalalCert) public halalCertURI` → v1.2 (LEX Machina spec: `workspace/legal/HALAL_CERT_URI_MAPPING_PHASE3_LM-2026-0604.md`)
- 30-day cert expiry renewal trigger + `onlyRole(SHARIAH_BOARD)` renewal function

> ✅ RWA-04: `distributeYield()` removed in v1.1 (898c2a79). Replaced by `fundYieldReserve()` + `claimYield()`, both `nonReentrant`. **Not a backlog item.**

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
3. OMEGA DeFi → Super Hub: update Phase 3 dashboard (TVL, yield APR, cert status)

---

## Escalation Matrix

| Agent | Escalate when |
|---|---|
| NEXUS Prime | SPI_TOKEN, ISPIRegistry, RWA_FACTORY addresses, role assignments |
| VULCAN Deploy | Broadcast execution, gas issues, sequence ordering |
| ARCHON Forge | RWA-N3 fix, collateral isolation fix, script issues, v1.2 halalCertURI |
| LEX Machina | Cert disputes, Art.40 queries, cert renewal |
| SAPIENS Guardian | Re-audit clearance, exploit alerts |
| AESTHETE Nexus | UI unlock, user flow |
