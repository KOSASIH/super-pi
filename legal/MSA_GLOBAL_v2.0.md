# Master Services Agreement v2.0 — Super Pi Global Banking Treaty
`Template Ref: A7-MSA-GLOBAL-v2.0` | `NexusLaw v2.1` | `LEX_Machina Auto-Generated`
`Applicable: All 195 Countries · All Licensed Banks & PSPs`

---

> **LEX_Machina Note**: This MSA is the global template. For each jurisdiction, LEX_Machina auto-translates to local language (100 languages supported), adjusts governing law to local jurisdiction, and verifies regulatory compliance. English version is the legal master. All clauses marked **[NON-NEGOTIABLE]** cannot be modified by any agent or counterparty.

---

## PARTIES

**Party A**: Super Pi Foundation ("Super Pi")
**Party B**: [Partner Institution Name] ("Partner")
License: [EMI/MSB/MPI/Local Equivalent License Number]
Jurisdiction: [Country]

---

## ARTICLE 1 — SETTLEMENT TOKEN [NON-NEGOTIABLE]

1.1 Partner acknowledges and agrees that **$SPI (Super Pi Token) is the sole settlement unit** for the Super Pi ecosystem.
1.2 Partner agrees to **PI_BRIDGE=0**: Partner will provide zero technical or operational support for Pi Coin (PI), Pi Network tokens, or any derivative thereof. Pi Coin support constitutes material breach and triggers immediate termination under Article 9.
1.3 Partner agrees that all settlement, custody, and transaction flows within Super Pi's systems use $SPI exclusively. No other cryptocurrency, token, or digital asset shall be accepted or processed.
1.4 Fiat currency is used exclusively for on-ramp (user deposits local fiat → receives $SPI) and off-ramp (user redeems $SPI → receives local fiat) operations.

## ARTICLE 2 — RESERVE INTEGRITY [NON-NEGOTIABLE]

2.1 Partner agrees to **1:1 local fiat redemption**: For every $SPI backed by fiat held in custody at Partner, Partner guarantees redemption at 1:1 USD equivalent (or local currency equivalent at prevailing Chronos Oracle rate).
2.2 Partner agrees to **non-fractional reserve**: Fiat received as $SPI collateral shall not be used as fractional reserve base. Segregated custody account required.
2.3 Partner agrees to **hourly SWIFT MT950 reporting** to Super Pi OMEGA DeFi proof-of-reserve system.
2.4 Partner grants Super Pi Foundation the right to publish reserve balances on the public proof-of-reserve dashboard (reserve.super-pi.io).

## ARTICLE 3 — HALAL FINANCE COMPLIANCE [NON-NEGOTIABLE]

3.1 **Riba prohibition**: No interest, yield, or credit extension on $SPI collateral accounts. Demand deposit structures only (for banks). Halal PSP settlement within T+1 only.
3.2 **Gharar prohibition**: All transaction terms must be fully disclosed and unambiguous at time of execution.
3.3 **Maysir prohibition**: No gambling, lottery, or wagering products may be associated with $SPI on/off-ramp flows.
3.4 **SAPIENS Guardian**: Partner agrees to provide sandbox API access for SAPIENS Guardian compliance audit prior to go-live. If sandbox audit detects riba/interest logic on $SPI accounts, go-live is suspended until remediated.
3.5 For Islamic-market partners (ID, SA, QA, AE, MY, PK, BD, EG, NG, TR — Halal zones), Shariah board sign-off is condition precedent to go-live.

## ARTICLE 4 — LICENSING & REGULATORY

4.1 Partner warrants it holds a valid financial services license (EMI, MSB, MPI, full banking license, or local equivalent) in its operating jurisdiction(s) and will maintain such license(s) throughout the term.
4.2 Partner agrees to full compliance with FATF Travel Rule for all transfers exceeding USD 1,000 equivalent.
4.3 Partner agrees to comply with applicable AML/KYC/CDD obligations under local law and FATF recommendations.
4.4 Partner agrees to OFAC/UN sanctions screening on all counterparties.
4.5 For EU partners: full MiCA Title III/IV compliance required.
4.6 For US partners: FinCEN BSA/MSB compliance required.

## ARTICLE 5 — SANCTIONS [NON-NEGOTIABLE]

5.1 Partner agrees to block all transactions involving entities on OFAC SDN list, UN Security Council sanctions list, and EU consolidated sanctions list.
5.2 Partner may not onboard users, accept deposits, or process withdrawals for: North Korea, Iran, Syria, Cuba, Belarus, Myanmar (financial services).
5.3 Russia: Financial services suspended pending OFAC review. Partner must geo-block Russian-origin transactions.
5.4 Violation of sanctions clauses = immediate termination + mandatory regulatory reporting.

## ARTICLE 6 — TECHNICAL INTEGRATION

6.1 Partner agrees to integrate with Super Pi VULCAN SDK (`pay.fiat()` endpoint) within 30 days of go-live date.
6.2 Partner agrees to provide test/sandbox API credentials within 7 days of contract signature.
6.3 Partner agrees to 99.5% uptime SLA for $SPI settlement APIs during business hours.
6.4 Partner agrees to publish live API status on Super Pi VULCAN partner registry.

## ARTICLE 7 — DATA & PRIVACY

7.1 Partner agrees to process Super Pi user data in accordance with GDPR (EU), PDPA (ID/TH/SG), LGPD (BR), PIPA (KR), and applicable local data protection law.
7.2 Partner agrees not to sell, rent, or share Super Pi user data with third parties.
7.3 User data is processed solely for the purpose of executing $SPI fiat transactions and regulatory compliance.

## ARTICLE 8 — FEES

8.1 Settlement fees: [to be agreed per jurisdiction — standard max: 0.5% per transaction, capped at $10 USD equivalent]
8.2 Custody fees (banks): [to be agreed — standard: 0 basis points on demand deposit balances]
8.3 All fees invoiced and paid in $SPI or USD at partner's election.

## ARTICLE 9 — TERMINATION [NON-NEGOTIABLE TRIGGERS]

Immediate termination (no cure period) for:
- Integration of Pi Coin or PI_BRIDGE!=0 (Art. 1.2)
- Fractional reserve use of $SPI collateral (Art. 2.2)
- Riba/interest on $SPI accounts (Art. 3.1)
- Loss of regulatory license (Art. 4.1)
- Sanctions violations (Art. 5)
- SAPIENS Guardian audit failure not remediated within 72h

30-day notice termination: For convenience by either party.

## ARTICLE 10 — GOVERNING LAW & DISPUTE RESOLUTION

10.1 This Agreement is governed by the laws of [Partner Jurisdiction] (local law master), with English law principles applied for interpretive consistency.
10.2 Disputes: ICC International Court of Arbitration, Singapore seat, English language.
10.3 LEX_Machina auto-translation is legally binding equivalent to English master.

---

*Generated by LEX_Machina Agent · NexusLaw v2.1 · Ref: A7-MSA-GLOBAL-v2.0*
*Authorized by: Agent-007 Bridge-Qirad (Chief Banking Officer) · NEXUS Prime*
*Founder: KOSASIH · PI_BRIDGE=0 · $SPI=ONLY TOKEN · gambling=0 · riba=0 · fraud=0*
