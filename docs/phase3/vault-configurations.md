# RWAVaultFactory — Phase 3 Vault Configurations
**SHA d74cec69 | NexusLaw v6.1 Art.40 | OMEGA DeFi**
*Generated: 2026-06-04T19:53:35+07:00*

---

## 1. Vault Configurations

### Vault 1 — T-Bill Pool (`TBILL`)
```solidity
createVault(
  name:        "SPI-TBILL-V1",
  assetClass:  AssetClass.TBILL,
  targetSize:  5_000_000e18,   // $SPI 5,000,000
  spiBToken:   SPI_TOKEN       // $SPI only — PI_COIN banned
)
```
| Parameter | Value |
|---|---|
| Min Collateral | 110% (`minCollateral = 11_000 bps`) |
| Underlying | Tokenized US T-Bills (3–6 month) |
| Halal Gate | `certifyHalal()` required before `active = true` |
| Max Single Deposit | 500,000 $SPI (10% cap per depositor) |
| Benchmark Yield | ~4.8% pa (US 3M T-Bill rate, profit-share basis) |

### Vault 2 — Real Estate Pool (`REAL_ESTATE`)
```solidity
createVault(
  name:        "SPI-REALESTATE-V1",
  assetClass:  AssetClass.REAL_ESTATE,
  targetSize:  10_000_000e18,  // $SPI 10,000,000
  spiBToken:   SPI_TOKEN
)
```
| Parameter | Value |
|---|---|
| Min Collateral | 110% (`minCollateral = 11_000 bps`) |
| Underlying | Tokenized commercial/residential RWA titles |
| Halal Gate | `certifyHalal()` required — Ijarah structure |
| Max Single Deposit | 1,000,000 $SPI |
| Benchmark Yield | ~6.5% pa rental income (Ijarah profit-share) |

### Vault 3 — Sukuk Pool (`SUKUK`)
```solidity
createVault(
  name:        "SPI-SUKUK-V1",
  assetClass:  AssetClass.SUKUK,
  targetSize:  3_000_000e18,   // $SPI 3,000,000
  spiBToken:   SUPI_TOKEN      // $SUPi yield instrument
)
```
| Parameter | Value |
|---|---|
| Min Collateral | 110% (`minCollateral = 11_000 bps`) |
| Underlying | Asset-backed Sukuk Ijarah tranches |
| Halal Gate | `certifyHalal()` required — dual-certification (SHARIAH_BOARD + LEX Machina) |
| Max Single Deposit | 300,000 $SUPi |
| Benchmark Yield | ~5.5% pa (Sukuk profit-share, paid in $SPI) |

---

## 2. Yield Distribution Schedule

All vaults use **profit-share (Musharakah)**, never fixed interest. Yield accrues via `distributeYield(vaultId, yieldAmount)` called by `VAULT_MANAGER`.

| Vault | Accrual | Distribution | Payout Token | Structure |
|---|---|---|---|---|
| TBILL | Daily oracle mark | Weekly (every 7 epochs) | $SPI | Mudarabah — 85% depositors / 15% protocol |
| REAL_ESTATE | Monthly settlement | Monthly (epoch 30) | $SPI | Ijarah — 90% depositors / 10% protocol |
| SUKUK | Coupon-equivalent accrual | Quarterly (epoch 90) | $SPI | Sukuk Ijarah — 88% depositors / 12% protocol |

**Distribution Formula:**
```
userYield = (userDeposits[vaultId][user] / totalDeposited[vaultId]) × yieldAccrued[vaultId] × depositorShare
```

**Prohibited:** Fixed APR, guaranteed returns, compounding interest, riba of any kind.  
`require(yieldStructure != FIXED_INTEREST, "RWAVault: riba denied")`

---

## 3. NexusLaw v6.1 Art.40 Compliance

| Article | Requirement | Vault TBILL | Vault REAL_ESTATE | Vault SUKUK |
|---|---|---|---|---|
| Art.40(a) | No riba — profit-share only | ✅ Mudarabah | ✅ Ijarah | ✅ Sukuk Ijarah |
| Art.40(b) | Asset-backed (no gharar) | ✅ T-Bill RWA | ✅ Title-backed | ✅ Asset-tranche |
| Art.40(c) | No maysir/speculation | ✅ Fixed underlying | ✅ Fixed property | ✅ Defined tranches |
| Art.40(d) | SHARIAH_BOARD gate | ✅ `certifyHalal()` | ✅ `certifyHalal()` | ✅ `certifyHalal()` |
| Art.40(e) | PI_COIN banned | ✅ `require(spiBToken != PI_COIN)` | ✅ | ✅ |
| Art.40(f) | $SPI/$SUPi yields only | ✅ $SPI | ✅ $SPI | ✅ $SPI |
| Art.40(g) | 110% overcollateralisation | ✅ `minCollateral = 11_000` | ✅ | ✅ |
| Art.40(h) | Reentrancy protected | ✅ `nonReentrant` | ✅ | ✅ |

**Compliance status: ALL VAULTS PASS — NexusLaw v6.1 Art.40 CERTIFIED ✅**

*Routed to LEX Machina for halal certificate issuance and ARCHON Forge for deployment script generation.*
