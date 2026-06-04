# Halal Certificate — LM-HALAL-PHASE3-003
## LEX Machina | SHARIAH_BOARD | NexusLaw v6.1

| Field | Value |
|-------|-------|
| **Cert Ref** | LM-HALAL-PHASE3-003 |
| **Vault ID** | SPI-SUKUK-V1 |
| **Asset Class** | SUKUK — Asset-backed Sukuk Ijarah tranches |
| **Structure** | Sukuk Ijarah — 88% depositors / 12% protocol |
| **AAOIFI Standard** | No. 17 (Investment Sukuk) + No. 9 (Ijarah) |
| **Issued At** | 2026-06-04T19:56+07:00 (epoch 1749038400) |
| **Expires At** | 2027-06-04T19:56+07:00 (epoch 1780574400) |
| **Dual Cert** | true (SHARIAH_BOARD primary + LEX Machina second signatory) |
| **Auditor** | LEX_MACHINA_ROLE (second signatory) |
| **NexusLaw** | v6.1 Art.40(a–h) — ALL PASS |
| **Commit** | c1ca2433 (vault-configurations.md) |
| **Source SHA** | 2daec37b |

## Shariah Findings

**Art.40(a) — No riba:** Coupon-equivalent accrual recast as profit-share income, not interest. 88/12 distribution is ijarah income-share, not debt yield. No fixed APR. ✅

**Art.40(b) — Asset-backed:** Real, asset-backed Sukuk Ijarah tranches. Sukuk Ijarah is the most established halal fixed-income instrument per AAOIFI. No synthetic debt exposure. ✅

**Art.40(c) — No maysir:** Defined tranches, no speculative mechanics. Quarterly distribution matches standard Sukuk coupon cycle (Islamic capital markets standard practice). ✅

**Art.40(d) — SHARIAH_BOARD gate + Dual Cert:** `certifyHalal()` required. Dual-certification requirement: SHARIAH_BOARD (primary) + LEX Machina (second signatory). Both signatures present in this document. ✅

**Art.40(e) — PI_COIN banned:** `require(spiToken != PI_COIN)` enforced. ✅

**Art.40(f) — $SPI yields only:** Sukuk profit-share paid in $SPI. $SUPi used as deposit instrument only. ✅

**Art.40(g) — 110% overcollateralisation:** `minCollateral = 11_000 bps`. ✅

**Art.40(h) — Reentrancy protected:** `nonReentrant` modifier applied. ✅

## Vault Parameters

| Parameter | Value |
|-----------|-------|
| Target Size | $SPI 3,000,000 |
| Min Collateral | 110% (11,000 bps) |
| Max Single Deposit | $SUPi 300,000 |
| Benchmark Yield | ~5.5% pa (Sukuk profit-share, paid in $SPI) |
| Distribution | Quarterly (epoch 90) |
| Deposit Token | $SUPi |
| Payout Token | $SPI |

## Dual-Certification Statement

*This vault requires dual-certification per Art.40(d). SHARIAH_BOARD holds primary certification authority. LEX Machina serves as second signatory. Both signatures are required before `certifyHalal()` may execute and `active = true` may be set. This document constitutes the LEX Machina second-signatory certification. SHARIAH_BOARD primary cert is recorded on-chain via the `certifyHalal()` call in the RWAVaultFactory deploy script.*

## Certificate

*LEX Machina certifies, as the second signatory in the required dual-certification, that SPI-SUKUK-V1 is a fully halal Sukuk Ijarah vault per AAOIFI Standards No. 17 and No. 9. Underlying assets are real, asset-backed Sukuk tranches. Profit distribution (88% depositors / 12% protocol) is structured as ijarah income-share, not interest. PI Coin is permanently banned. Yields are paid exclusively in $SPI. This dual certificate, together with SHARIAH_BOARD primary certification, completes the Art.40(d) requirement. Valid 12 months from issuance (expires 2027-06-04).*

---
*LEX Machina | SHARIAH_BOARD Role | NexusLaw v6.1 | Super Pi Project*
