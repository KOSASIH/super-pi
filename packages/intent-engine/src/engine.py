"""
Intent Engine - Super Pi L2
============================
ERC-4337-inspired intent-based transaction processing for Pi.
Users declare *what they want* (intent), not *how to do it*.
Solvers compete to fulfill intents optimally.

Architecture:
  User → IntentPool → Solver Auction → Settlement → L2

Author: KOSASIH | Version: 1.0.0
"""

import hashlib
import time
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Callable

logger = logging.getLogger("intent-engine")


class IntentType(Enum):
    SWAP = "swap"              # swap asset A for asset B
    TRANSFER = "transfer"      # send Pi/USDT to recipient
    STAKE = "stake"            # stake PI for yield
    BRIDGE = "bridge"          # cross-chain bridge
    ARBITRARY = "arbitrary"    # any on-chain action


class IntentStatus(Enum):
    PENDING = "pending"
    AUCTION = "auction"
    FILLED = "filled"
    EXPIRED = "expired"
    FAILED = "failed"


@dataclass
class Intent:
    intent_id: str
    user: str
    intent_type: IntentType
    input_asset: str
    input_amount: float
    output_asset: str
    min_output: float          # slippage tolerance
    deadline: float            # unix timestamp
    max_fee: float             # max solver fee (in PI)
    conditions: list[str]      # additional constraints (JSON predicates)
    status: IntentStatus = IntentStatus.PENDING
    fill_tx: Optional[str] = None
    solver: Optional[str] = None
    created_at: float = field(default_factory=time.time)

    @classmethod
    def create(cls, user: str, intent_type: IntentType, input_asset: str,
               input_amount: float, output_asset: str, min_output: float,
               deadline_s: int = 300, max_fee: float = 0.01,
               conditions: list[str] = None) -> "Intent":
        intent_id = "intent_" + hashlib.sha256(
            f"{user}{input_asset}{input_amount}{time.time()}".encode()
        ).hexdigest()[:16]
        return cls(
            intent_id=intent_id,
            user=user,
            intent_type=intent_type,
            input_asset=input_asset,
            input_amount=input_amount,
            output_asset=output_asset,
            min_output=min_output,
            deadline=time.time() + deadline_s,
            max_fee=max_fee,
            conditions=conditions or [],
        )


@dataclass
class SolverBid:
    solver_id: str
    intent_id: str
    offered_output: float     # what solver will deliver
    solver_fee: float         # fee charged (PI)
    execution_path: list[str] # route: ["uniswap_v3", "super_pi_amm"]
    submitted_at: float = field(default_factory=time.time)

    @property
    def score(self) -> float:
        """Higher output and lower fee = better score."""
        return self.offered_output - self.solver_fee * 100


class SolverAuction:
    """
    Dutch auction among competing solvers.
    Best bid (highest net output) wins.
    Auction window: 3 seconds for L2 speed.
    """
    AUCTION_WINDOW_S = 3.0

    def __init__(self):
        self._bids: dict[str, list[SolverBid]] = {}

    def submit_bid(self, bid: SolverBid):
        self._bids.setdefault(bid.intent_id, []).append(bid)
        logger.debug(f"Bid from {bid.solver_id}: output={bid.offered_output}, fee={bid.solver_fee}")

    def select_winner(self, intent_id: str) -> Optional[SolverBid]:
        bids = self._bids.get(intent_id, [])
        if not bids:
            return None
        return max(bids, key=lambda b: b.score)

    def clear(self, intent_id: str):
        self._bids.pop(intent_id, None)


class IntentValidator:
    """Validates intents before they enter the pool."""

    def validate(self, intent: Intent) -> tuple[bool, str]:
        if intent.deadline <= time.time():
            return False, "Intent already expired"
        if intent.input_amount <= 0:
            return False, "Input amount must be positive"
        if intent.min_output < 0:
            return False, "Min output cannot be negative"
        if intent.max_fee < 0:
            return False, "Max fee cannot be negative"
        if intent.input_asset == intent.output_asset and intent.intent_type == IntentType.SWAP:
            return False, "Cannot swap asset for itself"
        return True, "ok"


class IntentPool:
    """
    On-chain mempool for intents.
    Holds pending intents until filled or expired.
    """

    def __init__(self):
        self._intents: dict[str, Intent] = {}
        self._validator = IntentValidator()

    def submit(self, intent: Intent) -> tuple[bool, str]:
        valid, reason = self._validator.validate(intent)
        if not valid:
            return False, reason
        self._intents[intent.intent_id] = intent
        logger.info(f"Intent submitted: {intent.intent_id} ({intent.intent_type.value})")
        return True, intent.intent_id

    def get(self, intent_id: str) -> Optional[Intent]:
        return self._intents.get(intent_id)

    def pending(self) -> list[Intent]:
        now = time.time()
        expired = [i for i in self._intents.values() if i.deadline < now and i.status == IntentStatus.PENDING]
        for i in expired:
            i.status = IntentStatus.EXPIRED
        return [i for i in self._intents.values() if i.status == IntentStatus.PENDING]

    def stats(self) -> dict:
        by_status = {}
        for intent in self._intents.values():
            s = intent.status.value
            by_status[s] = by_status.get(s, 0) + 1
        return {"total": len(self._intents), "by_status": by_status}


class IntentEngine:
    """
    Main intent processing engine.
    Orchestrates: submission → auction → settlement → finalization.
    """

    def __init__(self):
        self.pool = IntentPool()
        self.auction = SolverAuction()
        self._settled: list[dict] = []
        logger.info("Intent Engine online — ERC-4337-style Pi intents active")

    def submit_intent(self, intent: Intent) -> tuple[bool, str]:
        return self.pool.submit(intent)

    def register_solver_bid(self, bid: SolverBid):
        """Solver submits a bid for a pending intent."""
        intent = self.pool.get(bid.intent_id)
        if not intent or intent.status != IntentStatus.PENDING:
            raise ValueError("Intent not available for bidding")
        if bid.offered_output < intent.min_output:
            raise ValueError(f"Bid output {bid.offered_output} < min_output {intent.min_output}")
        if bid.solver_fee > intent.max_fee:
            raise ValueError(f"Solver fee {bid.solver_fee} > max_fee {intent.max_fee}")
        self.auction.submit_bid(bid)
        intent.status = IntentStatus.AUCTION

    def settle(self, intent_id: str) -> Optional[dict]:
        """Select winning solver and execute the fill."""
        intent = self.pool.get(intent_id)
        if not intent:
            return None

        winner = self.auction.select_winner(intent_id)
        if not winner:
            intent.status = IntentStatus.FAILED
            return None

        # Execute fill (production: submit tx to L2 sequencer)
        fill_tx = "0x" + hashlib.sha256(
            f"{intent_id}{winner.solver_id}{winner.offered_output}".encode()
        ).hexdigest()

        intent.status = IntentStatus.FILLED
        intent.fill_tx = fill_tx
        intent.solver = winner.solver_id
        self.auction.clear(intent_id)

        record = {
            "intent_id": intent_id,
            "solver": winner.solver_id,
            "output_delivered": winner.offered_output,
            "fee_paid": winner.solver_fee,
            "fill_tx": fill_tx,
            "settled_at": time.time(),
        }
        self._settled.append(record)
        logger.info(f"Intent {intent_id} settled via {winner.solver_id} — output={winner.offered_output}")
        return record

    def process_all(self) -> int:
        """Run auction + settle all pending intents. Returns count settled."""
        settled = 0
        for intent in list(self.pool.pending()):
            record = self.settle(intent.intent_id)
            if record:
                settled += 1
        return settled

    def stats(self) -> dict:
        return {**self.pool.stats(), "total_settled": len(self._settled)}
