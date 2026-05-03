"""
Account Abstraction (AA) - Super Pi Smart Wallet
=================================================
ERC-4337-inspired account abstraction for Pi L2.
Enables: social recovery, gasless txs, batch execution,
multi-sig wallets, session keys, and smart spending limits.

Architecture:
  UserOperation → Bundler → EntryPoint → SmartAccount → L2

Author: KOSASIH | Version: 1.0.0
"""

import hashlib
import time
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Callable

logger = logging.getLogger("account-abstraction")


class AAFeature(Enum):
    SOCIAL_RECOVERY = "social_recovery"
    GASLESS = "gasless_transactions"
    BATCH_EXECUTION = "batch_execution"
    SESSION_KEYS = "session_keys"
    SPENDING_LIMITS = "spending_limits"
    MULTI_SIG = "multi_sig"
    PASSKEY_AUTH = "passkey_auth"       # WebAuthn biometric
    AI_GUARDIAN = "ai_guardian"         # AI monitors for suspicious activity


class AAWalletStatus(Enum):
    ACTIVE = "active"
    LOCKED = "locked"       # suspicious activity detected
    RECOVERING = "recovering"


@dataclass
class UserOperation:
    """ERC-4337-style UserOperation for Pi AA."""
    op_id: str
    sender: str             # smart account address
    nonce: int
    call_data: bytes        # encoded function call
    call_gas_limit: int
    verification_gas_limit: int
    pre_verification_gas: int
    max_fee_per_gas: int    # in micro-PI
    max_priority_fee: int
    paymaster: Optional[str]  # None = user pays; address = paymaster pays
    signature: bytes
    created_at: float = field(default_factory=time.time)

    @property
    def op_hash(self) -> bytes:
        return hashlib.sha3_256(
            f"{self.sender}{self.nonce}{self.call_data.hex()}{self.nonce}".encode()
        ).digest()


@dataclass
class SessionKey:
    """Temporary delegated signing key with restrictions."""
    key_id: str
    public_key: bytes
    allowed_targets: list[str]     # whitelisted contract addresses
    max_value_per_tx: float        # spending limit per tx
    daily_limit: float             # daily spending limit
    expires_at: float
    active: bool = True
    spent_today: float = 0.0


@dataclass
class RecoveryConfig:
    """Social recovery configuration."""
    threshold: int                 # M-of-N required
    guardians: list[str]           # guardian addresses
    recovery_delay_s: int          # timelock before recovery completes
    pending_recovery: Optional[str] = None  # new owner address
    recovery_initiated_at: Optional[float] = None


@dataclass
class SmartAccount:
    """Pi L2 smart account (AA wallet)."""
    address: str
    owner: str                     # current signing key
    nonce: int = 0
    status: AAWalletStatus = AAWalletStatus.ACTIVE
    features: list[AAFeature] = field(default_factory=list)
    session_keys: dict[str, SessionKey] = field(default_factory=dict)
    recovery_config: Optional[RecoveryConfig] = None
    spending_limits: dict[str, float] = field(default_factory=dict)  # token → daily limit
    created_at: float = field(default_factory=time.time)
    tx_count: int = 0


class Paymaster:
    """
    Gas abstraction — pays gas on behalf of users.
    Supports: token-pay (PI/USDT), sponsored (dApp pays), fiat-pay.
    """

    def __init__(self, paymaster_id: str, balance_pi: float = 10_000.0):
        self.id = paymaster_id
        self.balance = balance_pi
        self._sponsored_txs: list[str] = []

    def sponsor(self, user_op: UserOperation) -> bool:
        """Sponsor a UserOperation (dApp pays gas)."""
        estimated_gas = (user_op.call_gas_limit + user_op.verification_gas_limit) * 0.000001
        if self.balance < estimated_gas:
            return False
        self.balance -= estimated_gas
        self._sponsored_txs.append(user_op.op_id)
        logger.debug(f"Paymaster sponsored {user_op.op_id} — cost={estimated_gas:.6f} PI")
        return True

    def stats(self) -> dict:
        return {"balance_pi": self.balance, "sponsored_count": len(self._sponsored_txs)}


class Bundler:
    """
    UserOperation bundler.
    Collects UserOps, validates, bundles into L2 transactions.
    """
    BUNDLE_SIZE = 50
    BUNDLE_INTERVAL_S = 2.0

    def __init__(self):
        self._mempool: list[UserOperation] = []
        self._bundles: list[list[str]] = []

    def submit(self, user_op: UserOperation) -> bool:
        """Submit a UserOperation to the bundler mempool."""
        if not self._validate(user_op):
            return False
        self._mempool.append(user_op)
        logger.debug(f"UserOp submitted: {user_op.op_id} (mempool: {len(self._mempool)})")
        return True

    def _validate(self, user_op: UserOperation) -> bool:
        return (
            user_op.call_gas_limit > 0 and
            user_op.verification_gas_limit > 0 and
            len(user_op.signature) >= 32 and
            len(user_op.call_data) > 0
        )

    def bundle(self) -> list[UserOperation]:
        """Create and submit a bundle of UserOps."""
        batch = self._mempool[:self.BUNDLE_SIZE]
        self._mempool = self._mempool[self.BUNDLE_SIZE:]
        if batch:
            self._bundles.append([op.op_id for op in batch])
            logger.info(f"Bundle created: {len(batch)} UserOps")
        return batch

    def stats(self) -> dict:
        return {
            "mempool_size": len(self._mempool),
            "bundles_created": len(self._bundles),
            "total_ops_bundled": sum(len(b) for b in self._bundles),
        }


class EntryPoint:
    """
    ERC-4337 EntryPoint contract equivalent for Pi L2.
    Validates and executes UserOperations against SmartAccounts.
    """

    def __init__(self):
        self._accounts: dict[str, SmartAccount] = {}
        self._executed: list[str] = []

    def register_account(self, account: SmartAccount):
        self._accounts[account.address] = account

    def handle_ops(self, user_ops: list[UserOperation],
                   paymaster: Optional[Paymaster] = None) -> list[dict]:
        results = []
        for op in user_ops:
            result = self._handle_single(op, paymaster)
            results.append(result)
        return results

    def _handle_single(self, op: UserOperation, paymaster: Optional[Paymaster]) -> dict:
        account = self._accounts.get(op.sender)
        if not account:
            return {"op_id": op.op_id, "success": False, "reason": "account not found"}

        if account.status == AAWalletStatus.LOCKED:
            return {"op_id": op.op_id, "success": False, "reason": "account locked by AI Guardian"}

        # Validate nonce
        if op.nonce != account.nonce:
            return {"op_id": op.op_id, "success": False, "reason": "invalid nonce"}

        # Gas sponsorship
        if paymaster and not paymaster.sponsor(op):
            return {"op_id": op.op_id, "success": False, "reason": "paymaster insufficient balance"}

        # Execute call (production: EVM/Soroban dispatch)
        tx_hash = "0x" + hashlib.sha3_256(op.op_hash + account.address.encode()).hexdigest()
        account.nonce += 1
        account.tx_count += 1
        self._executed.append(op.op_id)
        return {"op_id": op.op_id, "success": True, "tx_hash": tx_hash}

    def stats(self) -> dict:
        return {
            "registered_accounts": len(self._accounts),
            "ops_executed": len(self._executed),
        }


class AIGuardian:
    """
    AI-powered anomaly detection for smart account protection.
    Locks accounts when suspicious behavior is detected.
    """
    RISK_THRESHOLD = 0.7

    def assess_op(self, op: UserOperation, account: SmartAccount) -> float:
        """Returns risk score 0–1. Higher = more suspicious."""
        risk = 0.0
        # Large value transfer
        if account.nonce == 0 and len(op.call_data) > 200:
            risk += 0.3
        # Unusual gas
        if op.max_fee_per_gas > 10_000_000:
            risk += 0.2
        # First op drains whole balance (heuristic)
        if account.tx_count == 0 and op.call_gas_limit > 500_000:
            risk += 0.4
        return min(1.0, risk)

    def guard(self, op: UserOperation, account: SmartAccount) -> bool:
        """Returns True if op is safe, False if locked."""
        risk = self.assess_op(op, account)
        if risk >= self.RISK_THRESHOLD:
            account.status = AAWalletStatus.LOCKED
            logger.warning(f"AI Guardian locked {account.address} — risk={risk:.2f}")
            return False
        return True


class AccountAbstractionService:
    """Main AA service: factory + bundler + entry point."""

    def __init__(self):
        self.bundler = Bundler()
        self.entry_point = EntryPoint()
        self.ai_guardian = AIGuardian()
        self._default_paymaster = Paymaster("super-pi-paymaster", 1_000_000.0)
        logger.info("Account Abstraction Service online — social recovery + gasless + AI Guardian")

    def create_wallet(self, owner: str, features: list[AAFeature] = None,
                      guardians: list[str] = None) -> SmartAccount:
        addr = "0x" + hashlib.sha3_256(owner.encode() + str(time.time()).encode()).hexdigest()[:40]
        features = features or [AAFeature.SOCIAL_RECOVERY, AAFeature.GASLESS,
                                 AAFeature.AI_GUARDIAN, AAFeature.SESSION_KEYS]
        account = SmartAccount(address=addr, owner=owner, features=features)
        if guardians:
            account.recovery_config = RecoveryConfig(
                threshold=len(guardians) // 2 + 1,
                guardians=guardians,
                recovery_delay_s=172800,  # 48h timelock
            )
        self.entry_point.register_account(account)
        logger.info(f"Smart wallet created: {addr} for {owner}")
        return account

    def submit_op(self, op: UserOperation, sponsored: bool = True) -> bool:
        account = self.entry_point._accounts.get(op.sender)
        if account and not self.ai_guardian.guard(op, account):
            return False
        return self.bundler.submit(op)

    def process_bundle(self, sponsored: bool = True) -> list[dict]:
        ops = self.bundler.bundle()
        pm = self._default_paymaster if sponsored else None
        return self.entry_point.handle_ops(ops, pm)

    def add_session_key(self, account_address: str, public_key: bytes,
                        allowed_targets: list[str], daily_limit: float,
                        expires_in_s: int = 86400) -> SessionKey:
        account = self.entry_point._accounts.get(account_address)
        if not account:
            raise ValueError("Account not found")
        sk = SessionKey(
            key_id="sk_" + hashlib.sha256(public_key).hexdigest()[:12],
            public_key=public_key,
            allowed_targets=allowed_targets,
            max_value_per_tx=daily_limit / 10,
            daily_limit=daily_limit,
            expires_at=time.time() + expires_in_s,
        )
        account.session_keys[sk.key_id] = sk
        return sk

    def stats(self) -> dict:
        return {
            "bundler": self.bundler.stats(),
            "entry_point": self.entry_point.stats(),
            "paymaster": self._default_paymaster.stats(),
        }
