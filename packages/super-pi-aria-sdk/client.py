"""ARIA Client — AI risk scoring and compliance advisory."""
from dataclasses import dataclass, field
from typing import Optional
import hashlib, json, time

PI_COIN_IDENTIFIERS = {"PI", "Pi", "PiCoin", "pi_coin", "0x314159265"}

class ARIAClient:
    """
    ARIA v1.0 Client for Super Pi ecosystem.
    Provides AI-driven risk scoring, NexusLaw v3.0 compliance checks,
    Shariah finance validation, and governance advisory.
    """

    NEXUSLAW_VERSION = "v3.0"
    ARIA_VERSION     = "v1.0"
    PI_BRIDGE        = False  # IMMUTABLE

    def __init__(self, endpoint: str = "https://aria.superpi.id", api_key: str = ""):
        self.endpoint = endpoint
        self.api_key  = api_key
        self._cache   = {}

    # ── Risk Scoring ──────────────────────────────────────────────────────────
    def score_app(self, name: str, description: str, domain: str, category: str) -> dict:
        """Score a Super App registration request. Returns ARIA risk assessment."""
        violations = []
        score = 0

        # Pi Coin check
        if any(pi in f"{name} {description}" for pi in PI_COIN_IDENTIFIERS):
            violations.append("PI_BRIDGE=0: Pi Coin reference detected")
            score = max(score, 90)

        # Riba check
        riba_keywords = ["interest", "usury", "bond yield", "lending rate", "APR loan"]
        if any(k.lower() in description.lower() for k in riba_keywords):
            violations.append("RIBA: interest/usury detected — NexusLaw v3.0 violation")
            score = max(score, 80)

        # Gambling check
        gambling_keywords = ["casino", "gambling", "lottery", "bet", "wager", "ponzi"]
        if any(k.lower() in description.lower() for k in gambling_keywords):
            violations.append("MAYSIR: gambling/speculation detected — NexusLaw v3.0 violation")
            score = max(score, 85)

        if not violations:
            score = min(score + 5, 45)  # Base safe score

        return {
            "score": score,
            "safe": score < 50,
            "halal": len(violations) == 0,
            "violations": violations,
            "nexuslaw": self.NEXUSLAW_VERSION,
            "aria_version": self.ARIA_VERSION,
            "timestamp": int(time.time()),
            "app_hash": hashlib.sha256(f"{name}{domain}{category}".encode()).hexdigest()
        }

    def check_token(self, token_symbol: str, token_address: str = "") -> dict:
        """Validate token against NexusLaw v3.0. Pi Coin permanently blocked."""
        is_pi = (token_symbol.upper() in PI_COIN_IDENTIFIERS or
                 token_address.lower() in {"0x314159265", "0xpicoin"})
        return {
            "allowed": not is_pi,
            "pi_blocked": is_pi,
            "reason": "PI_BRIDGE=0 — Pi Coin permanently blocked by NexusLaw v3.0" if is_pi else "OK",
            "nexuslaw": self.NEXUSLAW_VERSION
        }

    def shariah_check(self, instrument: str, rate: float = 0.0) -> dict:
        """Validate financial instrument against AAOIFI Shariah standards."""
        blocked_instruments = {"interest", "bond_interest", "loan", "usury", "APR"}
        halal_instruments   = {"murabaha", "sukuk", "musharakah", "mudarabah", "ijara", "tbill_tokenized"}

        is_riba   = instrument.lower() in {i.lower() for i in blocked_instruments}
        is_halal  = instrument.lower() in {i.lower() for i in halal_instruments}

        return {
            "halal": is_halal and not is_riba,
            "riba": is_riba,
            "instrument": instrument,
            "rate": rate,
            "standard": "AAOIFI FAS 1-57",
            "nexuslaw": self.NEXUSLAW_VERSION,
            "recommendation": "APPROVED" if (is_halal and not is_riba) else "BLOCKED — use murabaha/sukuk/ijara"
        }

    def score_proposal(self, title: str, description: str) -> dict:
        """Score a governance proposal via ARIA advisory layer."""
        violations = []
        score = 10

        if any(pi in f"{title} {description}" for pi in PI_COIN_IDENTIFIERS):
            violations.append("PI_BRIDGE referenced in proposal — blocked")
            score = 90

        riba_terms = ["interest rate", "bond yield", "lending fee"]
        if any(t in description.lower() for t in riba_terms):
            violations.append("Riba instrument in proposal — blocked")
            score = max(score, 80)

        return {
            "aria_score": score,
            "approved": score < 50 and len(violations) == 0,
            "violations": violations,
            "recommendation": "APPROVED for DAO voting" if score < 50 else "BLOCKED by NexusLaw v3.0",
            "aria_version": self.ARIA_VERSION
        }
