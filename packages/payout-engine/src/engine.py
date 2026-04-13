"""
Payout Automation Engine - Super Pi L2 Network
===============================================
Automated weekly payout: 80% USDT (Arbitrum) + 20% PI (Pi Mainnet).
Deducts gas from PI allocation. Enforces $50 USD minimum threshold.

Author: KOSASIH
Version: 1.0.0
"""

import json
import time
import logging
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass
from typing import Optional
from enum import Enum

logger = logging.getLogger("payout-engine")


class PayoutStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    SKIPPED_THRESHOLD = "skipped_threshold"
    FAILED = "failed"


@dataclass
class PayoutRecord:
    payout_id: str
    scheduled_at: float
    executed_at: Optional[float]
    usdt_amount: float
    pi_amount: float
    gas_deducted_pi: float
    status: PayoutStatus
    tx_hashes: dict  # {"usdt": "0x...", "pi": "..."}


class PayoutEngine:
    """
    Manages weekly payout execution per config/payout.json rules.
    - 80% USDT → Arbitrum: 0x373Ec75e4e99CA59e367bA667EC38B2e14Af390B
    - 20% PI → Pi Mainnet: GCKUNNC6X6LKYJXKTQEJAQQ2J6NTIHMRNJFM2KY6KIBB46BOPMKVXDQN
    - Gas: deducted from PI allocation
    - Minimum: $50 USD
    """

    def __init__(self, config_path: str = "config/payout.json"):
        with open(config_path) as f:
            self.config = json.load(f)
        self.payout_rules = {r["asset"]: r for r in self.config["payout_rules"]}
        self.schedule = self.config["withdraw_schedule"]
        self.gas_policy = self.config["gas_policy"]
        self.history: list[PayoutRecord] = []
        logger.info("Payout Engine initialized. Schedule: %s %s %s UTC",
                    self.schedule["frequency"], self.schedule["day"], self.schedule["time"])

    def next_payout_time(self) -> datetime:
        """Returns next Friday 00:00 UTC."""
        now = datetime.now(tz=timezone.utc)
        days_ahead = 4 - now.weekday()  # Friday = 4
        if days_ahead <= 0:
            days_ahead += 7
        next_friday = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=days_ahead)
        return next_friday

    def calculate_payout(self, total_usd: float, pi_price_usd: float = 314159.0) -> dict:
        """
        Splits total_usd into USDT (80%) and PI (20%), deducts gas from PI.
        Returns breakdown dict.
        """
        usdt_rule = self.payout_rules["USDT"]
        pi_rule = self.payout_rules["PI"]

        usdt_amount = total_usd * (usdt_rule["percentage"] / 100)
        pi_usd_amount = total_usd * (pi_rule["percentage"] / 100)

        # Estimate gas (0.1% of PI allocation, minimum 0.000001 PI)
        estimated_gas_usd = max(0.001, pi_usd_amount * 0.001)
        if self.gas_policy == "deduct_from_pi_allocation":
            net_pi_usd = pi_usd_amount - estimated_gas_usd
        else:
            net_pi_usd = pi_usd_amount

        pi_amount = net_pi_usd / pi_price_usd
        gas_pi = estimated_gas_usd / pi_price_usd

        return {
            "total_usd": total_usd,
            "usdt": {
                "amount": round(usdt_amount, 6),
                "chain": usdt_rule["chain"],
                "address": usdt_rule["address"],
                "percentage": usdt_rule["percentage"],
            },
            "pi": {
                "amount_pi": round(pi_amount, 10),
                "net_usd": round(net_pi_usd, 6),
                "gas_deducted_pi": round(gas_pi, 10),
                "chain": pi_rule["chain"],
                "address": pi_rule["address"],
                "percentage": pi_rule["percentage"],
            },
        }

    async def execute_payout(self, total_usd: float) -> PayoutRecord:
        """Execute a payout run."""
        min_threshold = self.schedule["min_threshold_usd"]
        payout_id = f"payout-{int(time.time())}"

        if total_usd < min_threshold:
            logger.info(f"Payout skipped: ${total_usd:.2f} < ${min_threshold} threshold")
            return PayoutRecord(
                payout_id=payout_id,
                scheduled_at=time.time(),
                executed_at=None,
                usdt_amount=0,
                pi_amount=0,
                gas_deducted_pi=0,
                status=PayoutStatus.SKIPPED_THRESHOLD,
                tx_hashes={},
            )

        breakdown = self.calculate_payout(total_usd)
        logger.info(f"Executing payout {payout_id}: "
                    f"${total_usd:.2f} → {breakdown['usdt']['amount']} USDT + "
                    f"{breakdown['pi']['amount_pi']} PI")

        # In production: sign & broadcast via Arbitrum/Pi RPC
        record = PayoutRecord(
            payout_id=payout_id,
            scheduled_at=time.time(),
            executed_at=time.time(),
            usdt_amount=breakdown["usdt"]["amount"],
            pi_amount=breakdown["pi"]["amount_pi"],
            gas_deducted_pi=breakdown["pi"]["gas_deducted_pi"],
            status=PayoutStatus.COMPLETED,
            tx_hashes={
                "usdt": "0x" + "0" * 64,   # filled by real broadcaster
                "pi": "PENDING",
            },
        )
        self.history.append(record)
        logger.info(f"Payout {payout_id} completed ✔")
        return record

    def summary(self) -> dict:
        completed = [r for r in self.history if r.status == PayoutStatus.COMPLETED]
        return {
            "total_payouts": len(self.history),
            "completed": len(completed),
            "total_usdt_paid": round(sum(r.usdt_amount for r in completed), 4),
            "total_pi_paid": round(sum(r.pi_amount for r in completed), 8),
            "next_payout_utc": self.next_payout_time().isoformat(),
        }
