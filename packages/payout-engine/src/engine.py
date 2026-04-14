"""
Payout Engine — Automated Yield & Distribution for Super Pi L2
===============================================================
Handles all automated payment flows:
  - Murabaha profit-share distribution (musharakah)
  - Sukuk coupon payments ($SPI only)
  - RWA vault yield distribution
  - Wakaf fund distributions
  - Staking rewards ($SUPi)
  - Ledger-Hafiz Proof-of-Reserve triggers

All amounts denominated in $SPI. Zero fixed interest.
Riba-detection: rejects any schedule with fixed APY tied to loan principal.
Pi Coin permanently blocked from all payout flows.
LEX_MACHINA v1.3 compliant.
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
from typing import Any, Optional
from uuid import uuid4

logger = logging.getLogger("payout_engine")

# ── Constants ─────────────────────────────────────────────────────────────
PI_COIN_ADDR   = "0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf"
MAX_RIBA_RATE  = 0.0    # Any fixed interest rate > 0 is riba — blocked
MAX_BATCH_SIZE = 500    # On-chain batch limit
GAS_BUFFER_BPS = 50     # 0.5% gas buffer on payouts

# ── Payout Types ──────────────────────────────────────────────────────────
class PayoutType(Enum):
    MURABAHA_PROFIT    = auto()   # Trade profit from murabaha
    SUKUK_COUPON       = auto()   # Bond coupon (halal — profit-share, not fixed interest)
    RWA_YIELD          = auto()   # Real-world asset yield (T-Bills, property)
    STAKING_REWARD     = auto()   # $SUPi staking reward
    WAKAF_DISTRIBUTION = auto()   # Islamic endowment payout
    RESERVE_TOP_UP     = auto()   # Fund $SPI reserve from RWA yield
    REFUND             = auto()   # Protocol refund (unused deposits, etc.)

# ── Data Structures ───────────────────────────────────────────────────────
@dataclass
class PayoutSchedule:
    schedule_id:     str
    payout_type:     PayoutType
    recipients:      dict[str, int]  # address → amount in $SPI micros (1e6 = $1)
    total_amount:    int
    execute_at:      int             # Unix timestamp
    asset_id:        Optional[str]   # RWA asset ID if applicable
    description:     str
    profit_source:   str             # Source of profit (T-Bill CUSIP, sukuk ID, etc.)
    created_at:      int = field(default_factory=lambda: int(time.time()))
    executed:        bool = False
    execution_hash:  Optional[str]   = None
    failed_recipients: list[str]     = field(default_factory=list)

    def __post_init__(self):
        for addr in self.recipients:
            if PI_COIN_ADDR.lower() in addr.lower():
                raise ValueError(f"Payout Engine: Pi Coin address blocked — LEX_MACHINA v1.3")

@dataclass
class PayoutResult:
    schedule_id:    str
    success_count:  int
    failed_count:   int
    total_paid:     int
    execution_hash: str
    timestamp:      int
    errors:         list[str]

# ── Riba Detector ────────────────────────────────────────────────────────
class RibaDetector:
    """
    Detects and blocks riba (fixed interest) in payout schedules.
    Rule: any payout amount that is a function of time × principal × fixed_rate is riba.
    Allowed: profit-share where amount is determined by ACTUAL profit earned.
    """

    def check_schedule(self, schedule: PayoutSchedule, principal: int, rate: float) -> None:
        if rate > MAX_RIBA_RATE:
            raise ValueError(
                f"Riba detected: fixed rate {rate*100:.2f}% on {principal} $SPI — "
                f"LEX_MACHINA v1.3 Article 4.3 violation. Use musharakah profit-share."
            )
        # Additional check: coupon must be linked to actual profit, not time-value of money
        if schedule.payout_type == PayoutType.SUKUK_COUPON:
            if schedule.profit_source == "FIXED_INTEREST":
                raise ValueError("Sukuk coupon cannot be fixed interest — must be profit-share")

# ── Payout Batcher ────────────────────────────────────────────────────────
class PayoutBatcher:
    """
    Batches on-chain payouts for gas efficiency.
    Splits large schedules into MAX_BATCH_SIZE chunks.
    """

    def batch(self, recipients: dict[str, int]) -> list[list[tuple[str, int]]]:
        items = list(recipients.items())
        return [items[i:i+MAX_BATCH_SIZE] for i in range(0, len(items), MAX_BATCH_SIZE)]

    def compute_batch_hash(self, batch: list[tuple[str, int]]) -> str:
        payload = "".join(f"{addr}:{amt}" for addr, amt in sorted(batch))
        return hashlib.sha256(payload.encode()).hexdigest()

# ── Payout Engine ─────────────────────────────────────────────────────────
class PayoutEngine:
    """
    Master automated payout engine.
    Manages all distribution flows for Super Pi L2 protocols.
    """

    def __init__(self, web3_endpoint: Optional[str] = None):
        self.riba_detector = RibaDetector()
        self.batcher       = PayoutBatcher()
        self._schedules: dict[str, PayoutSchedule] = {}
        self._results:   list[PayoutResult] = []
        self._pending_queue: asyncio.Queue = asyncio.Queue()
        logger.info("Payout Engine v1.0.0 initialized")

    # ── Schedule Creation ─────────────────────────────────────────────────
    def schedule_payout(
        self,
        payout_type:   PayoutType,
        recipients:    dict[str, int],
        execute_at:    int,
        profit_source: str,
        description:   str = "",
        asset_id:      Optional[str] = None,
        principal:     int = 0,
        rate:          float = 0.0,
    ) -> PayoutSchedule:
        """
        Register a payout schedule. Riba check runs at scheduling time.
        """
        # Create the schedule (Pi Coin check is inside __post_init__)
        schedule = PayoutSchedule(
            schedule_id  = str(uuid4()),
            payout_type  = payout_type,
            recipients   = recipients,
            total_amount = sum(recipients.values()),
            execute_at   = execute_at,
            asset_id     = asset_id,
            description  = description,
            profit_source= profit_source,
        )

        # Riba check
        self.riba_detector.check_schedule(schedule, principal, rate)

        self._schedules[schedule.schedule_id] = schedule
        logger.info("Scheduled %s payout: $%.2f SPI to %d recipients at %d",
                    payout_type.name, schedule.total_amount / 1e6, len(recipients), execute_at)
        return schedule

    # ── Execution ─────────────────────────────────────────────────────────
    async def execute_schedule(self, schedule_id: str) -> PayoutResult:
        """
        Execute a payout schedule. Batches and submits on-chain.
        """
        schedule = self._schedules.get(schedule_id)
        if not schedule:
            raise ValueError(f"Schedule {schedule_id} not found")
        if schedule.executed:
            raise ValueError(f"Schedule {schedule_id} already executed")

        errors: list[str] = []
        success = 0
        total_paid = 0

        batches = self.batcher.batch(schedule.recipients)
        batch_hashes = []

        for i, batch in enumerate(batches):
            logger.info("Executing batch %d/%d (%d recipients)...", i+1, len(batches), len(batch))
            batch_hash = self.batcher.compute_batch_hash(batch)
            batch_hashes.append(batch_hash)

            # Simulate on-chain dispatch (production: call contract via web3.py)
            for addr, amount in batch:
                try:
                    await self._dispatch_payment(addr, amount, schedule.payout_type)
                    success += 1
                    total_paid += amount
                except Exception as e:
                    errors.append(f"{addr}: {e}")
                    schedule.failed_recipients.append(addr)

        execution_hash = hashlib.sha256("".join(batch_hashes).encode()).hexdigest()
        schedule.executed       = True
        schedule.execution_hash = execution_hash

        result = PayoutResult(
            schedule_id    = schedule_id,
            success_count  = success,
            failed_count   = len(errors),
            total_paid     = total_paid,
            execution_hash = execution_hash,
            timestamp      = int(time.time()),
            errors         = errors,
        )
        self._results.append(result)
        logger.info("Payout complete: %d success, %d failed, $%.2f SPI distributed",
                    success, len(errors), total_paid / 1e6)
        return result

    # ── Murabaha Profit Distribution ──────────────────────────────────────
    async def distribute_murabaha_profits(
        self,
        depositors: dict[str, float],     # address → share ratio (must sum to 1.0)
        total_profit_micros: int,
        profit_source: str,
    ) -> PayoutSchedule:
        """
        Distribute murabaha profits proportionally.
        Amounts determined by actual trade profit, not fixed rate.
        """
        recipients = {
            addr: int(total_profit_micros * ratio)
            for addr, ratio in depositors.items()
        }
        return self.schedule_payout(
            payout_type   = PayoutType.MURABAHA_PROFIT,
            recipients    = recipients,
            execute_at    = int(time.time()) + 60,
            profit_source = profit_source,
            description   = "Murabaha profit-share distribution (musharakah)",
            rate          = 0.0,  # Explicitly zero — profit-share, not interest
        )

    # ── RWA Yield Distribution ────────────────────────────────────────────
    async def distribute_rwa_yield(
        self,
        asset_id:     str,
        shareholders: dict[str, float],    # address → share percentage
        total_yield:  int,                 # $SPI micros
        cusip:        str,
    ) -> PayoutSchedule:
        recipients = {
            addr: int(total_yield * pct)
            for addr, pct in shareholders.items()
        }
        return self.schedule_payout(
            payout_type   = PayoutType.RWA_YIELD,
            recipients    = recipients,
            execute_at    = int(time.time()) + 300,
            profit_source = cusip,
            description   = f"RWA yield distribution — asset {asset_id}",
            asset_id      = asset_id,
        )

    # ── Wakaf Distribution ────────────────────────────────────────────────
    async def distribute_wakaf(
        self,
        beneficiaries: dict[str, int],
        purpose: str,
    ) -> PayoutSchedule:
        return self.schedule_payout(
            payout_type   = PayoutType.WAKAF_DISTRIBUTION,
            recipients    = beneficiaries,
            execute_at    = int(time.time()) + 3600,
            profit_source = "WAKAF_PROTOCOL",
            description   = f"Wakaf productive distribution: {purpose}",
        )

    # ── Cron Runner ───────────────────────────────────────────────────────
    async def run_scheduled_payouts(self) -> list[PayoutResult]:
        """Execute all due schedules. Call this from a cron task."""
        now = int(time.time())
        due = [s for s in self._schedules.values()
               if not s.executed and s.execute_at <= now]

        if not due:
            return []

        logger.info("Running %d due payout schedules", len(due))
        results = []
        for schedule in due:
            try:
                result = await self.execute_schedule(schedule.schedule_id)
                results.append(result)
            except Exception as e:
                logger.error("Failed to execute %s: %s", schedule.schedule_id, e)
        return results

    # ── Reports ───────────────────────────────────────────────────────────
    def summary(self) -> dict:
        return {
            "total_schedules": len(self._schedules),
            "executed":        sum(1 for s in self._schedules.values() if s.executed),
            "pending":         sum(1 for s in self._schedules.values() if not s.executed),
            "total_paid_micros": sum(r.total_paid for r in self._results),
            "total_paid_spi":  sum(r.total_paid for r in self._results) / 1e6,
        }

    # ── Internal ──────────────────────────────────────────────────────────
    async def _dispatch_payment(self, address: str, amount: int, payout_type: PayoutType) -> None:
        """Dispatch a single payment. Production: submit on-chain via web3.py."""
        if PI_COIN_ADDR.lower() in address.lower():
            raise ValueError(f"Pi Coin address blocked — LEX_MACHINA v1.3")
        if amount <= 0:
            raise ValueError(f"Zero or negative amount for {address}")
        # Simulate network latency
        await asyncio.sleep(0.001)
        logger.debug("Dispatched %d $SPI micros to %s (%s)", amount, address, payout_type.name)


# ── CLI ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    async def demo():
        engine = PayoutEngine()

        # Schedule murabaha profit distribution
        schedule = await engine.distribute_murabaha_profits(
            depositors={
                "0xAlice": 0.4,
                "0xBob":   0.35,
                "0xCarol": 0.25,
            },
            total_profit_micros=5_000_000,  # $5 profit
            profit_source="MURABAHA_POOL_2026Q2",
        )
        print(f"Scheduled: {schedule.schedule_id}")
        print(f"Recipients: {len(schedule.recipients)}")

        # Execute immediately
        schedule.execute_at = int(time.time()) - 1
        result = await engine.run_scheduled_payouts()
        if result:
            print(f"Result: {result[0].success_count} paid, ${result[0].total_paid/1e6:.2f} $SPI")

        print(f"\nEngine summary: {engine.summary()}")

    asyncio.run(demo())
