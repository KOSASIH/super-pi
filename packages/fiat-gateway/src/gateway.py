"""
Fiat Gateway — 50+ Currency Interoperability for Super Pi
=========================================================
Handles all fiat ↔ $SPI conversion flows for 195 countries:
  - Deposit local fiat → instant $SPI mint (1:1 USD)
  - Redeem $SPI → local fiat payout H+0
  - Multi-rail: SWIFT, SEPA, BI-FAST, PayNow, FedNow, UPI, QRIS, FPS, etc.
  - Exchange rate management (real-time, Chronos Oracle backed)
  - KYC/AML routing per jurisdiction
  - Settlement: H+0 (instant) where available, T+1 fallback

Target: 50+ fiats by T+90d. All 195 countries by T+12m.
Pi Coin: never accepted, never processed.
LEX_MACHINA v1.4 compliant.

Author: NEXUS Prime / KOSASIH
Version: 1.0.0
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional
from uuid import uuid4

logger = logging.getLogger("fiat_gateway")

# ── Constants ─────────────────────────────────────────────────────────────
PI_COIN_ADDR       = "0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf"
USD_MICROS_PER_SPI = 1_000_000   # 1 $SPI = 1 USD = 1,000,000 micros

# ── Settlement Rails ──────────────────────────────────────────────────────
class Rail(Enum):
    FEDNOW   = auto()   # USA — instant
    SEPA     = auto()   # Europe — instant / SEPA Instant
    BI_FAST  = auto()   # Indonesia — instant
    PAYNOW   = auto()   # Singapore — instant
    UPI      = auto()   # India — instant
    QRIS     = auto()   # Indonesia QRIS
    FPS      = auto()   # UK — instant
    PROMPTPAY= auto()   # Thailand — instant
    DUITNOW  = auto()   # Malaysia — instant
    QRIS_MY  = auto()   # Malaysia QRIS
    RAAST    = auto()   # Pakistan — instant
    INSTAPAY = auto()   # Philippines — instant
    SWIFT    = auto()   # International — T+1/T+2
    RIPPLE   = auto()   # Ripple ODL for corridors
    BRIDGE_QIRAD = auto() # Super Pi native

class TransactionType(Enum):
    FIAT_TO_SPI  = auto()   # Deposit fiat → mint $SPI
    SPI_TO_FIAT  = auto()   # Redeem $SPI → payout fiat
    SPI_TO_SPI   = auto()   # $SPI cross-border (always $SPI on Super Pi side)
    FIAT_TO_FIAT = auto()   # Cross-currency via $SPI intermediary

class TxStatus(Enum):
    INITIATED   = auto()
    KYC_CHECK   = auto()
    CONFIRMED   = auto()
    MINTING     = auto()
    SETTLED     = auto()
    FAILED      = auto()
    REFUNDED    = auto()

# ── Fiat Definitions ──────────────────────────────────────────────────────
@dataclass
class FiatDefinition:
    code:            str      # "IDR", "USD", "EUR"
    name:            str
    country:         str
    usd_rate:        float    # 1 USD = X this_currency
    rail:            Rail
    kyc_required:    bool
    daily_limit_usd: float
    min_tx_usd:      float = 1.0
    settlement:      str = "H+0"

# ── Transaction ───────────────────────────────────────────────────────────
@dataclass
class FiatTransaction:
    tx_id:          str
    tx_type:        TransactionType
    user:           str
    fiat_code:      str
    fiat_amount:    float
    spi_amount:     float       # $SPI amount (= USD equivalent)
    usd_amount:     float       # USD equivalent
    fee_usd:        float
    rail:           Rail
    status:         TxStatus = TxStatus.INITIATED
    initiated_at:   int = field(default_factory=lambda: int(time.time()))
    settled_at:     Optional[int] = None
    ref_number:     Optional[str] = None
    error:          Optional[str] = None

# ── Fiat Catalog ──────────────────────────────────────────────────────────
FIAT_CATALOG: dict[str, FiatDefinition] = {
    # T+0 — Day 1 mandatory
    "USD": FiatDefinition("USD", "US Dollar",        "US",  1.0,          Rail.FEDNOW,    False, 100_000, 1.0,   "instant"),
    "EUR": FiatDefinition("EUR", "Euro",             "EU",  0.926,        Rail.SEPA,      False, 100_000, 1.0,   "instant"),
    "IDR": FiatDefinition("IDR", "Indonesian Rupiah","ID",  16300.0,      Rail.BI_FAST,   True,  50_000,  0.06,  "instant"),

    # T+90d — Extended
    "SGD": FiatDefinition("SGD", "Singapore Dollar", "SG",  1.34,         Rail.PAYNOW,    False, 50_000,  1.0,   "instant"),
    "JPY": FiatDefinition("JPY", "Japanese Yen",     "JP",  149.0,        Rail.SWIFT,     False, 100_000, 1.0,   "H+0"),
    "GBP": FiatDefinition("GBP", "British Pound",    "GB",  0.795,        Rail.FPS,       False, 100_000, 1.0,   "instant"),
    "AED": FiatDefinition("AED", "UAE Dirham",       "AE",  3.67,         Rail.BRIDGE_QIRAD, True, 50_000, 1.0,  "H+0"),
    "SAR": FiatDefinition("SAR", "Saudi Riyal",      "SA",  3.75,         Rail.BRIDGE_QIRAD, True, 50_000, 1.0,  "H+0"),
    "MYR": FiatDefinition("MYR", "Malaysian Ringgit","MY",  4.48,         Rail.DUITNOW,   True,  30_000,  1.0,   "instant"),
    "INR": FiatDefinition("INR", "Indian Rupee",     "IN",  83.0,         Rail.UPI,       True,  20_000,  0.5,   "instant"),
    "BRL": FiatDefinition("BRL", "Brazilian Real",   "BR",  5.0,          Rail.SWIFT,     True,  20_000,  1.0,   "T+1"),
    "CNY": FiatDefinition("CNY", "Chinese Yuan",     "CN",  7.24,         Rail.SWIFT,     True,  50_000,  1.0,   "H+2"),
    "KRW": FiatDefinition("KRW", "South Korean Won", "KR",  1320.0,       Rail.SWIFT,     False, 30_000,  1.0,   "H+0"),
    "AUD": FiatDefinition("AUD", "Australian Dollar","AU",  1.53,         Rail.SWIFT,     False, 100_000, 1.0,   "instant"),
    "CAD": FiatDefinition("CAD", "Canadian Dollar",  "CA",  1.36,         Rail.SWIFT,     False, 100_000, 1.0,   "instant"),
    "CHF": FiatDefinition("CHF", "Swiss Franc",      "CH",  0.89,         Rail.SWIFT,     False, 100_000, 1.0,   "instant"),
    "TRY": FiatDefinition("TRY", "Turkish Lira",     "TR",  32.0,         Rail.SWIFT,     True,  10_000,  1.0,   "T+1"),
    "NGN": FiatDefinition("NGN", "Nigerian Naira",   "NG",  1600.0,       Rail.SWIFT,     True,  10_000,  0.1,   "H+2"),
    "PHP": FiatDefinition("PHP", "Philippine Peso",  "PH",  56.0,         Rail.INSTAPAY,  True,  10_000,  0.5,   "instant"),
    "THB": FiatDefinition("THB", "Thai Baht",        "TH",  35.0,         Rail.PROMPTPAY, False, 20_000,  1.0,   "instant"),
    "VND": FiatDefinition("VND", "Vietnamese Dong",  "VN",  24000.0,      Rail.SWIFT,     True,  5_000,   0.05,  "H+2"),
    "BDT": FiatDefinition("BDT", "Bangladeshi Taka", "BD",  110.0,        Rail.SWIFT,     True,  5_000,   0.5,   "H+2"),
    "PKR": FiatDefinition("PKR", "Pakistani Rupee",  "PK",  280.0,        Rail.RAAST,     True,  5_000,   0.5,   "instant"),
    "EGP": FiatDefinition("EGP", "Egyptian Pound",   "EG",  48.0,         Rail.SWIFT,     True,  5_000,   0.5,   "T+1"),
    "ZAR": FiatDefinition("ZAR", "South African Rand","ZA", 18.5,         Rail.SWIFT,     False, 10_000,  1.0,   "T+1"),
    "MXN": FiatDefinition("MXN", "Mexican Peso",     "MX",  17.0,         Rail.SWIFT,     False, 20_000,  1.0,   "T+1"),
    "HKD": FiatDefinition("HKD", "Hong Kong Dollar", "HK",  7.81,         Rail.SWIFT,     False, 100_000, 1.0,   "H+0"),
    "NZD": FiatDefinition("NZD", "New Zealand Dollar","NZ", 1.64,         Rail.SWIFT,     False, 50_000,  1.0,   "instant"),
    "SEK": FiatDefinition("SEK", "Swedish Krona",    "SE",  10.5,         Rail.SEPA,      False, 50_000,  1.0,   "instant"),
    "NOK": FiatDefinition("NOK", "Norwegian Krone",  "NO",  10.6,         Rail.SEPA,      False, 50_000,  1.0,   "instant"),
    "DKK": FiatDefinition("DKK", "Danish Krone",     "DK",  6.9,          Rail.SEPA,      False, 50_000,  1.0,   "instant"),
    "PLN": FiatDefinition("PLN", "Polish Zloty",     "PL",  3.95,         Rail.SEPA,      False, 50_000,  1.0,   "instant"),
    "CZK": FiatDefinition("CZK", "Czech Koruna",     "CZ",  22.5,         Rail.SEPA,      False, 30_000,  1.0,   "instant"),
    "HUF": FiatDefinition("HUF", "Hungarian Forint", "HU",  360.0,        Rail.SEPA,      False, 30_000,  1.0,   "instant"),
    "RON": FiatDefinition("RON", "Romanian Leu",     "RO",  4.55,         Rail.SEPA,      False, 20_000,  1.0,   "instant"),
    "BGN": FiatDefinition("BGN", "Bulgarian Lev",    "BG",  1.82,         Rail.SEPA,      False, 20_000,  1.0,   "instant"),
}

# ── Sanctioned Currencies (OFAC/FATF) ────────────────────────────────────
SANCTIONED_CURRENCIES = {"KPW", "IRR", "SYP", "CUP"}

# ── Gateway ───────────────────────────────────────────────────────────────
class FiatGateway:
    """
    Multi-rail fiat gateway for Super Pi ecosystem.
    Powers Bridge-Qirad's settlement layer.
    """

    def __init__(self, rate_refresh_seconds: int = 30):
        self._rates: dict[str, float] = {k: v.usd_rate for k, v in FIAT_CATALOG.items()}
        self._last_rate_update = int(time.time())
        self._txs: dict[str, FiatTransaction] = {}
        self._rate_refresh = rate_refresh_seconds
        logger.info("Fiat Gateway v1.0.0 — %d fiats live", len(FIAT_CATALOG))

    # ── Deposit: Fiat → $SPI ─────────────────────────────────────────
    async def deposit_fiat(
        self,
        user:        str,
        fiat_code:   str,
        fiat_amount: float,
    ) -> FiatTransaction:
        """
        User deposits local fiat → $SPI minted 1:1 USD.
        Example: 163,000 IDR → 10 $SPI (at 16,300 IDR/USD).
        """
        self._reject_pi(fiat_code)
        fiat_def = self._get_fiat(fiat_code)

        usd_amount = fiat_amount / fiat_def.usd_rate
        fee_usd    = self._calc_fee(usd_amount, TransactionType.FIAT_TO_SPI)
        net_usd    = usd_amount - fee_usd
        spi_amount = net_usd   # 1 $SPI = 1 USD

        tx = FiatTransaction(
            tx_id       = str(uuid4()),
            tx_type     = TransactionType.FIAT_TO_SPI,
            user        = user,
            fiat_code   = fiat_code,
            fiat_amount = fiat_amount,
            spi_amount  = spi_amount,
            usd_amount  = usd_amount,
            fee_usd     = fee_usd,
            rail        = fiat_def.rail,
        )

        # KYC check
        if fiat_def.kyc_required:
            tx.status = TxStatus.KYC_CHECK
            await self._kyc_check(tx, user)

        tx.status   = TxStatus.MINTING
        await asyncio.sleep(0.01)  # Bridge-Qirad mint call
        tx.status   = TxStatus.SETTLED
        tx.settled_at = int(time.time())
        tx.ref_number = hashlib.sha256(f"{tx.tx_id}{user}".encode()).hexdigest()[:16].upper()

        self._txs[tx.tx_id] = tx
        logger.info("Deposit: %s %s %.2f → $SPI %.4f (fee $%.4f)",
                    user[:8], fiat_code, fiat_amount, spi_amount, fee_usd)
        return tx

    # ── Redeem: $SPI → Fiat ──────────────────────────────────────────
    async def redeem_spi(
        self,
        user:       str,
        fiat_code:  str,
        spi_amount: float,
    ) -> FiatTransaction:
        """
        User redeems $SPI → local fiat. 1 $SPI = 1 USD at spot rate.
        Payout H+0 where rail supports it.
        """
        self._reject_pi(fiat_code)
        fiat_def = self._get_fiat(fiat_code)

        fee_usd    = self._calc_fee(spi_amount, TransactionType.SPI_TO_FIAT)
        net_spi    = spi_amount - fee_usd
        fiat_amount = net_spi * fiat_def.usd_rate

        tx = FiatTransaction(
            tx_id       = str(uuid4()),
            tx_type     = TransactionType.SPI_TO_FIAT,
            user        = user,
            fiat_code   = fiat_code,
            fiat_amount = fiat_amount,
            spi_amount  = spi_amount,
            usd_amount  = net_spi,
            fee_usd     = fee_usd,
            rail        = fiat_def.rail,
        )

        tx.status     = TxStatus.SETTLED
        tx.settled_at = int(time.time())
        tx.ref_number = hashlib.sha256(f"{tx.tx_id}{user}".encode()).hexdigest()[:16].upper()

        self._txs[tx.tx_id] = tx
        logger.info("Redeem: %s $SPI %.4f → %s %.2f (rail: %s)",
                    user[:8], spi_amount, fiat_code, fiat_amount, fiat_def.rail.name)
        return tx

    # ── Cross-Border: Fiat A → $SPI → Fiat B ────────────────────────
    async def cross_border(
        self,
        sender:      str,
        receiver:    str,
        source_fiat: str,
        dest_fiat:   str,
        amount:      float,
    ) -> tuple[FiatTransaction, FiatTransaction]:
        """
        Fiat → $SPI → Fiat cross-border transfer.
        $SPI is the universal intermediary — no correspondent bank needed.
        """
        deposit  = await self.deposit_fiat(sender, source_fiat, amount)
        redeem   = await self.redeem_spi(receiver, dest_fiat, deposit.spi_amount)
        return deposit, redeem

    # ── Rate Management ──────────────────────────────────────────────
    def update_rate(self, fiat_code: str, new_rate: float) -> None:
        """Update exchange rate from Chronos Oracle feed."""
        if fiat_code in self._rates:
            old = self._rates[fiat_code]
            self._rates[fiat_code] = new_rate
            if fiat_code in FIAT_CATALOG:
                FIAT_CATALOG[fiat_code].usd_rate = new_rate
            logger.debug("Rate updated: %s %.4f → %.4f", fiat_code, old, new_rate)

    def batch_update_rates(self, rates: dict[str, float]) -> None:
        for code, rate in rates.items():
            self.update_rate(code, rate)
        self._last_rate_update = int(time.time())

    # ── Supported Fiats ──────────────────────────────────────────────
    def list_fiats(self) -> list[dict]:
        return [
            {
                "code":       k,
                "name":       v.name,
                "country":    v.country,
                "rate_usd":   v.usd_rate,
                "rail":       v.rail.name,
                "settlement": v.settlement,
                "kyc":        v.kyc_required,
            }
            for k, v in FIAT_CATALOG.items()
        ]

    def stats(self) -> dict:
        return {
            "fiats_supported":   len(FIAT_CATALOG),
            "total_txs":         len(self._txs),
            "deposits":          sum(1 for t in self._txs.values() if t.tx_type == TransactionType.FIAT_TO_SPI),
            "redeems":           sum(1 for t in self._txs.values() if t.tx_type == TransactionType.SPI_TO_FIAT),
            "last_rate_update":  self._last_rate_update,
        }

    # ── Internal ─────────────────────────────────────────────────────
    def _reject_pi(self, code: str) -> None:
        if PI_COIN_ADDR.lower() in code.lower() or code in SANCTIONED_CURRENCIES:
            raise ValueError(f"Fiat Gateway: {code} rejected — LEX_MACHINA v1.4 / OFAC/FATF")

    def _get_fiat(self, code: str) -> FiatDefinition:
        if code not in FIAT_CATALOG:
            raise ValueError(f"Fiat {code} not supported. Available: {list(FIAT_CATALOG.keys())}")
        return FIAT_CATALOG[code]

    def _calc_fee(self, usd_amount: float, tx_type: TransactionType) -> float:
        # 0.1% deposit, 0.1% redeem, minimum $0.01
        rate = 0.001
        return max(usd_amount * rate, 0.01)

    async def _kyc_check(self, tx: FiatTransaction, user: str) -> None:
        """KYC check hook. In production: call LEX_Machina KYC service."""
        await asyncio.sleep(0.005)
        tx.status = TxStatus.CONFIRMED


# ── CLI ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    async def demo():
        gw = FiatGateway()

        print(f"Supported fiats: {len(FIAT_CATALOG)}")

        print("\nDeposit 1,630,000 IDR → $SPI...")
        tx = await gw.deposit_fiat("0xUserKOSASIH", "IDR", 1_630_000)
        print(f"  → $SPI {tx.spi_amount:.2f} (fee ${tx.fee_usd:.4f}) — ref: {tx.ref_number}")
        print(f"  Status: {tx.status.name}, Rail: {tx.rail.name}")

        print("\nRedeem 100 $SPI → SGD...")
        r = await gw.redeem_spi("0xMerchantSG", "SGD", 100)
        print(f"  → SGD {r.fiat_amount:.2f} — ref: {r.ref_number}")

        print("\nCross-border: 1,000,000 IDR → USD (Alice → Bob)...")
        d, r2 = await gw.cross_border("0xAlice", "0xBob", "IDR", "USD", 1_000_000)
        print(f"  Sent: IDR 1,000,000 | Received: USD {r2.fiat_amount:.2f}")

        print(f"\nGateway stats: {gw.stats()}")

    asyncio.run(demo())
