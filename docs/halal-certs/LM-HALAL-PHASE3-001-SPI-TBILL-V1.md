# Halal Certificate — LM-HALAL-PHASE3-001
## LEX Machina | SHARIAH_BOARD | NexusLaw v6.1

| Field | Value |
|-------|-------|
| **Cert Ref** | LM-HALAL-PHASE3-001 |
| **Vault ID** | SPI-TBILL-V1 |
| **Asset Class** | TBILL — Tokenized US T-Bills (3–6 month) |
| **Structure** | Mudarabah — 85% depositors / 15% protocol |
| **AAOIFI Standard** | No. 13 (Mudarabah) |
| **Issued At** | 2026-06-04T19:56+07:00 (epoch 1749038400) |
| **Expires At** | 2027-06-04T19:56+07:00 (epoch 1780574400) |
| **Dual Cert** | false |
| **Auditor** | LEX_MACHINA_ROLE |
| **NexusLaw** | v6.1 Art.40(a–h) — ALL PASS |
| **Commit** | c1ca2433 (vault-configurations.md) |
| **Source SHA** | 2daec37b |

## Shariah Findings

**Art.40(a) — No riba:** T-Bill returns treated as mudarabah profit on asset appreciation. 85/15 profit-share split declared at inception. No fixed APR. `require(yieldStructure != FIXED_INTEREST, "RWAVault: riba denied")` ✅

**Art.40(b) — Asset-backed:** Tokenized US T-Bills are real, government-issued debt instruments held as underlying assets. No synthetic exposure. ✅

**Art.40(c) — No maysir:** Fixed underlying (T-Bills), no speculative mechanics. Daily oracle mark uses deterministic, disclosed pricing formula. ✅

**Art.40(d) — SHARIAH_BOARD gate:** `certifyHalal()` required before `active = true`. ✅

**Art.40(e) — PI_COIN banned:** `require(spiToken != PI_COIN)` enforced at vault level. ✅

**Art.40(f) — $SPI yields only:** All distributions paid in $SPI. ✅

**Art.40(g) — 110% overcollateralisation:** `minCollateral = 11_000 bps`. ✅

**Art.40(h) — Reentrancy protected:** `nonReentrant` modifier applied. ✅

## Vault Parameters

| Parameter | Value |
|-----------|-------|
| Target Size | $SPI 5,000,000 |
| Min Collateral | 110% (11,000 bps) |
| Max Single Deposit | $SPI 500,000 (10% cap) |
| Benchmark Yield | ~4.8% pa (profit-share basis) |
| Distribution | Weekly (every 7 epochs) |
| Payout Token | $SPI |

## Certificate

*LEX Machina hereby certifies that SPI-TBILL-V1 operates as a halal profit-sharing vault under mudarabah principles per AAOIFI Standard No. 13. US T-Bill underlying assets are held as real, asset-backed instruments. Returns are distributed as profit-share (85% depositors / 15% protocol), never as fixed interest. PI Coin is permanently banned. All yields are paid in $SPI. This certificate is valid 12 months from issuance (expires 2027-06-04).*

---
*LEX Machina | SHARIAH_BOARD Role | NexusLaw v6.1 | Super Pi Project*
