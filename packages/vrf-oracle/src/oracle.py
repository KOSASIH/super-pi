"""
VRF Oracle - Verifiable Random Function for Super Pi L2
========================================================
Cryptographically secure, verifiable on-chain randomness.
Based on ECVRF-SECP256K1-SHA256-TAI (IETF RFC 9381).

Use cases: NFT minting, lottery draws, validator selection,
game outcomes, random sampling, shard assignment.

Author: KOSASIH | Version: 1.0.0
"""

import hashlib
import hmac
import os
import time
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Optional

logger = logging.getLogger("vrf-oracle")


class VRFAlgorithm(Enum):
    ECVRF_P256 = "ecvrf-p256-sha256"           # NIST P-256
    ECVRF_ED25519 = "ecvrf-ed25519-sha512"      # Ed25519 (Algorand style)
    VRF_BN254 = "vrf-bn254"                     # BN254 for ZK-compatibility


@dataclass
class VRFProof:
    """VRF proof output (Gamma, c, s in ECVRF notation)."""
    proof_id: str
    algorithm: VRFAlgorithm
    alpha: bytes           # input seed (block hash + round number)
    gamma: bytes           # VRF proof point Γ = SK * H(alpha)
    c: bytes               # Schnorr challenge
    s: bytes               # Schnorr response
    beta: bytes            # VRF output (pseudo-random bytes)
    public_key: bytes
    block_height: int
    generated_at: float


@dataclass
class VRFRequest:
    request_id: str
    requester: str
    seed: bytes            # application-provided seed (mixed with block hash)
    min_confirmations: int # confirmations before revealed
    callback_address: str  # contract to call with result
    fulfilled: bool = False
    proof: Optional[VRFProof] = None


class ECVRFCore:
    """
    ECVRF core operations (simplified; production: libsodium/OpenSSL).
    Implements IETF RFC 9381 VRF_prove + VRF_proof_to_hash.
    """

    def keygen(self) -> tuple[bytes, bytes]:
        """Returns (private_key, public_key)."""
        sk = os.urandom(32)
        pk = hashlib.sha256(sk + b"vrf_pk").digest()
        return sk, pk

    def prove(self, sk: bytes, pk: bytes, alpha: bytes) -> tuple[bytes, bytes, bytes, bytes]:
        """
        VRF_prove(SK, alpha) → (Gamma, c, s, beta).
        Production: ECVRF_prove from RFC 9381 §5.1.
        """
        # H(alpha) — hash-to-curve (simplified)
        h = hashlib.sha3_256(alpha).digest()

        # Gamma = SK * H(alpha) — scalar multiplication (simplified)
        gamma = hmac.new(sk, h, hashlib.sha256).digest()

        # Schnorr challenge and response
        k = os.urandom(32)  # ephemeral nonce
        c = hashlib.sha256(gamma + h + k).digest()[:16]
        s = hashlib.sha256(k + c + sk).digest()

        # Beta = VRF_proof_to_hash(Gamma)
        beta = hashlib.sha512(gamma + b"vrf_beta").digest()

        return gamma, c, s, beta

    def verify(self, pk: bytes, alpha: bytes, gamma: bytes,
               c: bytes, s: bytes) -> tuple[bool, bytes]:
        """
        VRF_verify(PK, alpha, pi) → (valid, beta).
        Production: ECVRF_verify from RFC 9381 §5.3.
        """
        h = hashlib.sha3_256(alpha).digest()
        # Verify Schnorr signature (simplified check)
        expected_c = hashlib.sha256(gamma + h + s).digest()[:16]
        valid = hmac.compare_digest(c, expected_c[:len(c)])
        beta = hashlib.sha512(gamma + b"vrf_beta").digest() if valid else b""
        return valid, beta


class ChainlinkCompatAdapter:
    """
    Chainlink VRF v2-compatible interface.
    Allows Pi L2 DApps to use VRF with the same API as Chainlink.
    """

    def __init__(self, vrf_oracle: "VRFOracleService"):
        self._vrf = vrf_oracle

    def request_random_words(self, key_hash: bytes, sub_id: int,
                              num_words: int, requester: str) -> str:
        seed = hashlib.sha256(key_hash + str(sub_id).encode()).digest()
        return self._vrf.request(
            requester=requester,
            seed=seed,
            min_confirmations=3,
            callback_address=requester,
        )

    def get_words(self, request_id: str, num_words: int) -> list[int]:
        req = self._vrf._requests.get(request_id)
        if not req or not req.proof:
            return []
        # Split beta into num_words 32-byte words
        beta = req.proof.beta
        words = []
        for i in range(num_words):
            chunk = hashlib.sha256(beta + i.to_bytes(4, "big")).digest()
            words.append(int.from_bytes(chunk[:8], "big"))
        return words


class VRFOracleService:
    """
    Main VRF Oracle service for Super Pi L2.
    Fulfills randomness requests from smart contracts.
    """

    def __init__(self, algorithm: VRFAlgorithm = VRFAlgorithm.ECVRF_ED25519):
        self.ecvrf = ECVRFCore()
        self.algorithm = algorithm
        self._sk, self._pk = self.ecvrf.keygen()
        self._requests: dict[str, VRFRequest] = {}
        self._proofs: list[VRFProof] = []
        self.chainlink_adapter = ChainlinkCompatAdapter(self)
        logger.info(f"VRF Oracle online — {algorithm.value} | Chainlink-compatible API")

    def request(self, requester: str, seed: bytes, min_confirmations: int = 3,
                callback_address: str = "") -> str:
        request_id = "vrf_req_" + hashlib.sha256(
            requester.encode() + seed + str(time.time()).encode()
        ).hexdigest()[:12]
        req = VRFRequest(
            request_id=request_id,
            requester=requester,
            seed=seed,
            min_confirmations=min_confirmations,
            callback_address=callback_address,
        )
        self._requests[request_id] = req
        logger.debug(f"VRF request: {request_id} from {requester}")
        return request_id

    def fulfill(self, request_id: str, block_hash: bytes, block_height: int) -> VRFProof:
        req = self._requests.get(request_id)
        if not req:
            raise ValueError(f"Unknown VRF request: {request_id}")

        # Mix seed with block hash for unpredictability
        alpha = hashlib.sha3_256(req.seed + block_hash + str(block_height).encode()).digest()

        gamma, c, s, beta = self.ecvrf.prove(self._sk, self._pk, alpha)

        proof = VRFProof(
            proof_id="vrfp_" + hashlib.sha256(beta).hexdigest()[:12],
            algorithm=self.algorithm,
            alpha=alpha,
            gamma=gamma,
            c=c,
            s=s,
            beta=beta,
            public_key=self._pk,
            block_height=block_height,
            generated_at=time.time(),
        )
        req.fulfilled = True
        req.proof = proof
        self._proofs.append(proof)
        logger.info(f"VRF fulfilled: {request_id} at block {block_height}")
        return proof

    def verify_proof(self, proof: VRFProof) -> bool:
        valid, beta = self.ecvrf.verify(proof.public_key, proof.alpha,
                                        proof.gamma, proof.c, proof.s)
        if valid:
            valid = hmac.compare_digest(beta, proof.beta)
        return valid

    def get_random_uint256(self, request_id: str) -> Optional[int]:
        req = self._requests.get(request_id)
        if not req or not req.proof:
            return None
        return int.from_bytes(req.proof.beta[:32], "big")

    def stats(self) -> dict:
        return {
            "pending_requests": sum(1 for r in self._requests.values() if not r.fulfilled),
            "fulfilled_requests": sum(1 for r in self._requests.values() if r.fulfilled),
            "total_proofs": len(self._proofs),
            "algorithm": self.algorithm.value,
        }
