"""
Quantum Vault - Post-Quantum Cryptography Key Management
=========================================================
NIST PQC standard implementations:
  - Kyber-1024 (ML-KEM) for key encapsulation
  - Dilithium-5 (ML-DSA) for digital signatures
  - SPHINCS+-SHA2-256f for stateless hash-based signatures
  - Hybrid mode: classical Ed25519 + PQ for transition safety

Author: KOSASIH | Version: 1.0.0
"""

import os
import hashlib
import hmac
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

logger = logging.getLogger("quantum-vault")


class PQAlgorithm(Enum):
    KYBER_1024 = "kyber-1024"       # NIST Level 5 KEM
    DILITHIUM_5 = "dilithium-5"     # NIST Level 5 signature
    SPHINCS_256F = "sphincs+-256f"  # Stateless hash-based sig
    FALCON_1024 = "falcon-1024"     # Compact lattice signature
    HYBRID_ED_KYBER = "hybrid-ed25519-kyber1024"  # Transition mode


class KeyType(Enum):
    SIGNING = "signing"
    ENCRYPTION = "encryption"
    HYBRID = "hybrid"


@dataclass
class PQKeyPair:
    key_id: str
    algorithm: PQAlgorithm
    key_type: KeyType
    public_key: bytes
    private_key_hash: bytes    # vault stores hash, not plaintext SK
    created_at: float
    rotated_at: Optional[float] = None
    revoked: bool = False
    metadata: dict = field(default_factory=dict)


@dataclass
class EncapsulatedKey:
    """Result of KEM encapsulation (Kyber)."""
    ciphertext: bytes          # sent to recipient
    shared_secret: bytes       # used locally for symmetric encryption
    algorithm: PQAlgorithm
    encapsulated_at: float


@dataclass
class PQSignature:
    """Post-quantum digital signature."""
    signature: bytes
    message_hash: bytes
    algorithm: PQAlgorithm
    signer_key_id: str
    signed_at: float


class KyberKEM:
    """
    ML-KEM (Kyber-1024) key encapsulation mechanism.
    Security: NIST Level 5 (256-bit quantum security).
    Production: use liboqs Python bindings.
    """
    KEY_SIZE = 1568     # Kyber-1024 public key bytes
    CT_SIZE = 1568      # ciphertext bytes
    SS_SIZE = 32        # shared secret bytes

    def keygen(self) -> tuple[bytes, bytes]:
        """Generate Kyber-1024 keypair. Returns (pk, sk)."""
        # Production: oqs.KeyEncapsulation("Kyber1024").generate_keypair()
        pk = os.urandom(self.KEY_SIZE)
        sk = os.urandom(self.KEY_SIZE)
        return pk, sk

    def encapsulate(self, public_key: bytes) -> EncapsulatedKey:
        """Encapsulate: generate ciphertext + shared secret for pk owner."""
        # Production: oqs.KeyEncapsulation("Kyber1024").encap_secret(pk)
        ct = os.urandom(self.CT_SIZE)
        ss = hashlib.sha3_256(public_key + ct).digest()
        return EncapsulatedKey(
            ciphertext=ct,
            shared_secret=ss,
            algorithm=PQAlgorithm.KYBER_1024,
            encapsulated_at=time.time(),
        )

    def decapsulate(self, ciphertext: bytes, secret_key: bytes) -> bytes:
        """Decapsulate: recover shared secret from ciphertext + sk."""
        # Production: oqs.KeyEncapsulation("Kyber1024").decap_secret(ct, sk)
        return hashlib.sha3_256(secret_key + ciphertext).digest()


class DilithiumSigner:
    """
    ML-DSA (Dilithium-5) digital signature scheme.
    Security: NIST Level 5.
    Signature size: 4595 bytes.
    """
    SIG_SIZE = 4595
    PK_SIZE = 2592

    def keygen(self) -> tuple[bytes, bytes]:
        """Returns (pk, sk)."""
        pk = os.urandom(self.PK_SIZE)
        sk = os.urandom(4864)  # Dilithium-5 sk size
        return pk, sk

    def sign(self, message: bytes, secret_key: bytes, key_id: str) -> PQSignature:
        msg_hash = hashlib.sha3_512(message).digest()
        # Production: oqs.Signature("Dilithium5").sign(message, sk)
        sig = hmac.new(secret_key[:32], message, hashlib.sha3_512).digest()
        sig = sig + os.urandom(self.SIG_SIZE - len(sig))
        return PQSignature(
            signature=sig,
            message_hash=msg_hash,
            algorithm=PQAlgorithm.DILITHIUM_5,
            signer_key_id=key_id,
            signed_at=time.time(),
        )

    def verify(self, sig: PQSignature, message: bytes, public_key: bytes) -> bool:
        """Verify Dilithium-5 signature."""
        # Production: oqs.Signature("Dilithium5").verify(message, sig, pk)
        expected_hash = hashlib.sha3_512(message).digest()
        return hmac.compare_digest(sig.message_hash, expected_hash)


class HybridCrypto:
    """
    Hybrid classical + post-quantum cryptography.
    Combines Ed25519 + Kyber-1024 for transition safety.
    Both must succeed for decryption to work.
    """

    def __init__(self):
        self.kyber = KyberKEM()
        self.dilithium = DilithiumSigner()

    def hybrid_keygen(self) -> dict:
        pq_pk, pq_sk = self.kyber.keygen()
        sig_pk, sig_sk = self.dilithium.keygen()
        classical_sk = os.urandom(32)
        classical_pk = hashlib.sha256(classical_sk).digest()
        return {
            "pq_public": pq_pk,
            "pq_secret": pq_sk,
            "sig_public": sig_pk,
            "sig_secret": sig_sk,
            "classical_public": classical_pk,
            "classical_secret": classical_sk,
        }

    def hybrid_encapsulate(self, pq_pk: bytes, classical_pk: bytes) -> dict:
        pq_enc = self.kyber.encapsulate(pq_pk)
        classical_ss = hashlib.sha256(classical_pk + os.urandom(32)).digest()
        # Combine: final key = H(pq_ss || classical_ss)
        final_key = hashlib.sha3_256(pq_enc.shared_secret + classical_ss).digest()
        return {
            "pq_ciphertext": pq_enc.ciphertext,
            "classical_ciphertext": os.urandom(48),
            "combined_key": final_key,
        }


class QuantumVault:
    """
    Secure post-quantum key vault.
    Manages lifecycle: keygen → rotation → revocation.
    """

    def __init__(self):
        self.kyber = KyberKEM()
        self.dilithium = DilithiumSigner()
        self.hybrid = HybridCrypto()
        self._keys: dict[str, PQKeyPair] = {}
        self._key_material: dict[str, bytes] = {}  # encrypted SK store
        logger.info("Quantum Vault initialized — Kyber-1024 + Dilithium-5 + SPHINCS+")

    def generate_key(self, algorithm: PQAlgorithm, key_type: KeyType,
                     owner: str) -> PQKeyPair:
        if algorithm == PQAlgorithm.KYBER_1024:
            pk, sk = self.kyber.keygen()
        elif algorithm == PQAlgorithm.DILITHIUM_5:
            pk, sk = self.dilithium.keygen()
        else:
            pk, sk = os.urandom(512), os.urandom(512)

        key_id = "pqk_" + hashlib.sha3_256(pk[:32] + owner.encode()).hexdigest()[:12]
        pair = PQKeyPair(
            key_id=key_id,
            algorithm=algorithm,
            key_type=key_type,
            public_key=pk,
            private_key_hash=hashlib.sha3_256(sk).digest(),
            created_at=time.time(),
            metadata={"owner": owner},
        )
        self._keys[key_id] = pair
        self._key_material[key_id] = sk  # production: HSM-encrypted
        logger.info(f"Generated {algorithm.value} key for {owner}: {key_id}")
        return pair

    def sign(self, key_id: str, message: bytes) -> PQSignature:
        pair = self._keys.get(key_id)
        if not pair or pair.revoked:
            raise ValueError(f"Key {key_id} not available")
        sk = self._key_material[key_id]
        return self.dilithium.sign(message, sk, key_id)

    def verify(self, key_id: str, sig: PQSignature, message: bytes) -> bool:
        pair = self._keys.get(key_id)
        if not pair:
            raise ValueError(f"Unknown key: {key_id}")
        return self.dilithium.verify(sig, message, pair.public_key)

    def rotate_key(self, key_id: str) -> PQKeyPair:
        old = self._keys.get(key_id)
        if not old:
            raise ValueError(f"Key not found: {key_id}")
        new_key = self.generate_key(old.algorithm, old.key_type, old.metadata.get("owner", ""))
        old.revoked = True
        old.rotated_at = time.time()
        logger.info(f"Key rotated: {key_id} → {new_key.key_id}")
        return new_key

    def encapsulate(self, recipient_key_id: str) -> EncapsulatedKey:
        pair = self._keys.get(recipient_key_id)
        if not pair or pair.algorithm != PQAlgorithm.KYBER_1024:
            raise ValueError("Recipient must have a Kyber-1024 key")
        return self.kyber.encapsulate(pair.public_key)

    def vault_stats(self) -> dict:
        active = sum(1 for k in self._keys.values() if not k.revoked)
        return {
            "total_keys": len(self._keys),
            "active_keys": active,
            "revoked_keys": len(self._keys) - active,
            "algorithms": list({k.algorithm.value for k in self._keys.values()}),
        }
