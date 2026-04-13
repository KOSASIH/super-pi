"""
Super Pi L2 Cross-Chain Bridge
================================
Optimistic rollup bridge with ZK fallback.
Supports PI ↔ Arbitrum (USDT), PI ↔ Ethereum (WETH), and future chains.

Security: fraud proof window 7 days | ZK fallback instant finality
Author: KOSASIH
Version: 1.0.0
"""

import json
import time
import hashlib
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Optional

logger = logging.getLogger("l2-bridge")


class BridgeMode(Enum):
    OPTIMISTIC = "optimistic"
    ZK_FALLBACK = "zk_fallback"


class TxStatus(Enum):
    INITIATED = "initiated"
    LOCKED = "locked"
    PROOF_SUBMITTED = "proof_submitted"
    FINALIZED = "finalized"
    CHALLENGED = "challenged"
    FAILED = "failed"


@dataclass
class BridgeTx:
    tx_id: str
    mode: BridgeMode
    from_chain: str
    to_chain: str
    asset: str
    amount: float
    sender: str
    recipient: str
    initiated_at: float
    finalized_at: Optional[float]
    status: TxStatus
    proof_hash: Optional[str] = None
    fraud_window_end: Optional[float] = None


class ZKProofEngine:
    """
    Lightweight ZK proof generator for bridge attestations.
    Production: integrate with Plonky3 / Halo2 / RISC Zero.
    """
    VERSION = "plonky3-v1"

    def generate_state_proof(self, state_root: str, tx_data: dict) -> str:
        """Returns a deterministic proof hash (simulate ZK proof)."""
        payload = json.dumps({"root": state_root, "tx": tx_data}, sort_keys=True)
        return "zk_" + hashlib.sha256(payload.encode()).hexdigest()

    def verify(self, proof_hash: str, expected_root: str) -> bool:
        return proof_hash.startswith("zk_") and len(proof_hash) == 67


class FraudProofMonitor:
    """
    Watches for fraud-proof challenges during optimistic rollup window.
    Auto-switches to ZK mode on challenge detection.
    """
    WINDOW_HOURS = 168  # 7 days

    def __init__(self):
        self._challenged_txs: set[str] = set()

    def is_challenged(self, tx_id: str) -> bool:
        return tx_id in self._challenged_txs

    def mark_challenged(self, tx_id: str):
        self._challenged_txs.add(tx_id)
        logger.warning(f"Fraud challenge detected for tx: {tx_id}")

    def fraud_window_end(self) -> float:
        return time.time() + self.WINDOW_HOURS * 3600


class L2Bridge:
    """
    Cross-chain bridge for Super Pi L2 ↔ external chains.
    Optimistic by default, ZK fallback on challenge.
    Never writes to Pi mainnet chain directly.
    """

    def __init__(self, config_path: str = "config/network.json"):
        with open(config_path) as f:
            cfg = json.load(f)
        self.bridges = cfg["bridges"]
        self.zk = ZKProofEngine()
        self.fraud_monitor = FraudProofMonitor()
        self._transactions: dict[str, BridgeTx] = {}
        logger.info(f"L2 Bridge initialized: {list(self.bridges.keys())}")

    def initiate(
        self,
        from_chain: str,
        to_chain: str,
        asset: str,
        amount: float,
        sender: str,
        recipient: str,
        force_zk: bool = False,
    ) -> BridgeTx:
        tx_id = f"bridge-{int(time.time() * 1000)}"
        mode = BridgeMode.ZK_FALLBACK if force_zk else BridgeMode.OPTIMISTIC

        tx = BridgeTx(
            tx_id=tx_id,
            mode=mode,
            from_chain=from_chain,
            to_chain=to_chain,
            asset=asset,
            amount=amount,
            sender=sender,
            recipient=recipient,
            initiated_at=time.time(),
            finalized_at=None,
            status=TxStatus.INITIATED,
            fraud_window_end=(
                self.fraud_monitor.fraud_window_end()
                if mode == BridgeMode.OPTIMISTIC else None
            ),
        )
        self._transactions[tx_id] = tx
        logger.info(f"Bridge tx initiated [{mode.value}]: {tx_id} — {amount} {asset} {from_chain}→{to_chain}")
        return tx

    def submit_proof(self, tx_id: str, state_root: str) -> BridgeTx:
        tx = self._transactions[tx_id]
        proof = self.zk.generate_state_proof(state_root, {
            "id": tx_id, "amount": tx.amount, "asset": tx.asset
        })
        tx.proof_hash = proof
        tx.status = TxStatus.PROOF_SUBMITTED

        # Check for fraud challenges
        if self.fraud_monitor.is_challenged(tx_id):
            tx.mode = BridgeMode.ZK_FALLBACK
            logger.info(f"Switched {tx_id} to ZK fallback due to fraud challenge")

        return tx

    def finalize(self, tx_id: str) -> BridgeTx:
        tx = self._transactions[tx_id]
        if tx.mode == BridgeMode.OPTIMISTIC:
            if time.time() < (tx.fraud_window_end or 0):
                logger.warning(f"Tx {tx_id} still in fraud window — cannot finalize yet")
                return tx
        # ZK finalize is instant
        tx.status = TxStatus.FINALIZED
        tx.finalized_at = time.time()
        logger.info(f"Bridge tx finalized: {tx_id} ✔")
        return tx

    def get_status(self, tx_id: str) -> dict:
        tx = self._transactions.get(tx_id)
        if not tx:
            return {"error": "not_found"}
        return {
            "tx_id": tx.tx_id,
            "mode": tx.mode.value,
            "status": tx.status.value,
            "asset": tx.asset,
            "amount": tx.amount,
            "from": tx.from_chain,
            "to": tx.to_chain,
            "proof_hash": tx.proof_hash,
            "finalized_at": tx.finalized_at,
        }
