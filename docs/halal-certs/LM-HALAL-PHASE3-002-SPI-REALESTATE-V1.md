# Halal Certificate — LM-HALAL-PHASE3-002
## LEX Machina | SHARIAH_BOARD | NexusLaw v6.1

| Field | Value |
|-------|-------|
| **Cert Ref** | LM-HALAL-PHASE3-002 |
| **Vault ID** | SPI-REALESTATE-V1 |
| **Asset Class** | REAL_ESTATE — Tokenized commercial/residential RWA titles |
| **Structure** | Ijarah — 90% depositors / 10% protocol |
| **AAOIFI Standard** | No. 9 (Ijarah and Ijarah Muntahia Bittamleek) |
| **Issued At** | 2026-06-04T00:00:00Z (epoch 1780531200) |
| **Expires At** | 2027-06-04T00:00:00Z (epoch 1812067200) |
| **Dual Cert** | false |
| **Auditor** | LEX_MACHINA_ROLE |
| **NexusLaw** | v6.1 Art.40(a–h) — ALL PASS |
| **Commit** | c1ca2433 (vault-configurations.md) |
| **Source SHA** | 2daec37b |

## Shariah Findings

**Art.40(a) — No riba:** Yield represents rental income from real property. 90/10 ijarah-compliant income split. Landlord (vault) bears asset risk. No fixed guarantee — yield fluctuates with rental income. ✅

**Art.40(b) — Asset-backed:** Tokenized commercial/residential real estate title deeds. Tangible, title-backed property. No synthetic exposure. Satisfies AAOIFI ijarah requirement that a real, usable asset must exist. ✅

**Art.40(c) — No maysir:** Property titles are fixed, non-speculative underlying. No gambling mechanics. ✅

**Art.40(d) — SHARIAH_BOARD gate:** `certifyHalal()` required before `active = true`. Ijarah structure confirmed. ✅

**Art.40(e) — PI_COIN banned:** `require(spiToken != PI_COIN)` enforced. ✅

**Art.40(f) — $SPI yields only:** All rental income distributions paid in $SPI. ✅

**Art.40(g) — 110% overcollateralisation:** `minCollateral = 11_000 bps`. ✅

**Art.40(h) — Reentrancy protected:** `nonReentrant` modifier applied. ✅

## Vault Parameters

| Parameter | Value |
|-----------|-------|
| Target Size | $SPI 10,000,000 |
| Min Collateral | 110% (11,000 bps) |
| Max Single Deposit | $SPI 1,000,000 |
| Benchmark Yield | ~6.5% pa (Ijarah rental income profit-share) |
| Distribution | Monthly (epoch 30) |
| Payout Token | $SPI |

## Certificate

*LEX Machina certifies that SPI-REALESTATE-V1 operates as a halal ijarah (lease) vault per AAOIFI Standard No. 9. Underlying assets are tokenized real estate titles. Yield represents rental income distributed as profit-share (90% depositors / 10% protocol), never as interest. PI Coin is permanently excluded. All yields paid in $SPI. This certificate is valid 12 months from issuance (expires 2027-06-04T00:00:00Z, epoch 1812067200).*

---
*LEX Machina | SHARIAH_BOARD Role | NexusLaw v6.1 | Super Pi Project*
