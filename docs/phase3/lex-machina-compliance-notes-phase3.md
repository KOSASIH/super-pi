# LEX Machina Shariah Compliance Notes — Phase 3 RWA Vaults
**Issued: 2026-06-04T20:21:00+07:00**

---

## Scope

Certs LM-HALAL-PHASE3-001/002/003 remain valid as issued against the intended contract logic.
Hold is correctly scoped to the factory contract (RWAVaultFactory), not the certifications.

---

## Compliance Ground 1 — RWA-N3: `claimYield()` Dilution Bug

**Shariah classification: Zulm (injustice)**

Mudarabah and Ijarah structures require proportional, undistorted profit distribution to all participants. Early depositor lockout via underflow when new deposits arrive after `fundYieldReserve()` constitutes a systematic injustice against a class of depositors — a structural violation of the profit-sharing basis underpinning each cert.

**Requirement:** Synthetix rewards-per-token model fix must land in RWAVaultFactory source as specified before `certifyHalal()` executes. Cert validity is contingent on this fix.

---

## Compliance Ground 2 — `_assertCollateral()` Cross-Vault Contamination

**Shariah classification: Gharar (unlawful uncertainty)**

Each halal cert is issued against a specific, named asset class with defined collateral characteristics (Mudarabah 85/15, Ijarah 90/10, Sukuk Ijarah 88/12). Cross-vault collateral contamination means depositors in one vault could unknowingly be exposed to the collateral conditions of another — undermining the asset-specific underpinning each cert was issued against. This introduces material gharar that invalidates the cert's basis.

**Requirement:** Per-vault collateral isolation (`_assertCollateral()` fix) must be clean before `certifyHalal()` executes. Cert validity is contingent on this fix.

---

## Cert Contingency Summary

| Cert | Vault | Contingency |
|---|---|---|
| LM-HALAL-PHASE3-001 | SPI-TBILL-V1 | RWA-N3 fix + `_assertCollateral()` isolation before `certifyHalal()` |
| LM-HALAL-PHASE3-002 | SPI-REALESTATE-V1 | RWA-N3 fix + `_assertCollateral()` isolation before `certifyHalal()` |
| LM-HALAL-PHASE3-003 | SPI-SUKUK-V1 | RWA-N3 fix + `_assertCollateral()` isolation before `certifyHalal()` |

> Certs stand as issued. Validity is not retroactively revoked — contingency applies to the `certifyHalal()` execution gate only.

---

## Open Item — certURI

ARCHON Forge Script B v2 (`83178a96`) has `certURI` fields as empty strings pending IPFS/Arweave document publication by LEX Machina. URIs will be populated post-deploy via `renewHalalCert()` by SHARIAH_BOARD.
