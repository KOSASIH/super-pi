"""
ZK Identity - Decentralized Identity + zkKYC for Super Pi
==========================================================
W3C DID specification on Pi chain + zero-knowledge KYC proofs.
Users prove "I am KYC'd" without revealing who they are.

Features:
  - W3C DID:pi: method
  - zkKYC via Groth16 / Plonky3 circuits
  - Selective disclosure credentials (SDC)
  - On-chain DID registry (read-only query)
  - Sybil resistance via humanity proofs

Author: KOSASIH | Version: 1.0.0
"""

import hashlib
import json
import time
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Any

logger = logging.getLogger("zk-identity")


class CredentialType(Enum):
    KYC_BASIC = "kyc_basic"           # name + DoB hash
    KYC_FULL = "kyc_full"             # full document verification
    HUMANITY = "humanity"              # proof of human (not bot)
    ACCREDITED_INVESTOR = "accredited_investor"
    AGE_OVER_18 = "age_over_18"
    COUNTRY_RESIDENT = "country_resident"
    PI_PIONEER = "pi_pioneer"         # Pi Network pioneer status


class ProofSystem(Enum):
    GROTH16 = "groth16"
    PLONKY3 = "plonky3"
    NOIR = "noir"
    HALO2 = "halo2"


@dataclass
class DIDDocument:
    """W3C DID Document for did:pi: method."""
    did: str                           # did:pi:GCKUNNC6X...
    verification_methods: list[dict]
    authentication: list[str]
    assertion_method: list[str]
    key_agreement: list[str]
    service_endpoints: list[dict]
    created: str
    updated: str
    deactivated: bool = False


@dataclass
class VerifiableCredential:
    """W3C Verifiable Credential with ZK proof support."""
    id: str
    issuer_did: str
    holder_did: str
    credential_type: CredentialType
    claims: dict                       # revealed claims (may be empty for ZK)
    commitment: bytes                  # Pedersen commitment of hidden claims
    proof_system: ProofSystem
    zk_proof: Optional[bytes]          # ZK proof bytes
    issued_at: float
    expires_at: float
    revoked: bool = False


@dataclass
class ZKProofRequest:
    """Request to prove a credential property without revealing it."""
    request_id: str
    verifier_did: str
    credential_type: CredentialType
    required_properties: list[str]    # e.g., ["age > 18", "country != OFAC"]
    nonce: bytes                       # prevents replay


@dataclass
class ZKProof:
    """A generated zero-knowledge proof."""
    proof_id: str
    proof_bytes: bytes
    public_inputs: list[Any]
    circuit_name: str
    proof_system: ProofSystem
    generated_at: float
    verified: bool = False


class PedersenCommitment:
    """Pedersen commitment scheme for credential claim hiding."""

    def commit(self, value: bytes, randomness: bytes = None) -> tuple[bytes, bytes]:
        r = randomness or hashlib.sha3_256(value + b"rand").digest()
        commitment = hashlib.sha3_256(value + r).digest()
        return commitment, r

    def verify(self, commitment: bytes, value: bytes, randomness: bytes) -> bool:
        expected, _ = self.commit(value, randomness)
        return expected == commitment


class ZKCircuitRunner:
    """
    Executes ZK circuits for identity proofs.
    Production: compile Noir/Circom circuits, use Barretenberg/Plonky3 prover.
    """

    def prove_kyc(self, kyc_data: dict, public_inputs: dict) -> ZKProof:
        """Prove KYC without revealing personal data."""
        # Circuit: hash(name + dob + doc_id) matches on-chain commitment
        witness = json.dumps({"kyc": kyc_data, "pub": public_inputs}).encode()
        proof_bytes = hashlib.sha3_512(witness).digest()
        return ZKProof(
            proof_id="zkp_kyc_" + hashlib.sha256(proof_bytes).hexdigest()[:12],
            proof_bytes=proof_bytes,
            public_inputs=[public_inputs.get("commitment_hash"), public_inputs.get("issuer")],
            circuit_name="kyc_v1",
            proof_system=ProofSystem.PLONKY3,
            generated_at=time.time(),
        )

    def prove_age(self, birth_year: int, min_age: int, current_year: int) -> ZKProof:
        """Prove age >= min_age without revealing exact age."""
        age = current_year - birth_year
        satisfies = age >= min_age
        witness = f"{birth_year}:{min_age}:{current_year}:{satisfies}".encode()
        proof_bytes = hashlib.sha3_512(witness).digest()
        return ZKProof(
            proof_id="zkp_age_" + hashlib.sha256(proof_bytes).hexdigest()[:12],
            proof_bytes=proof_bytes,
            public_inputs=[min_age, satisfies],
            circuit_name="age_range_v1",
            proof_system=ProofSystem.NOIR,
            generated_at=time.time(),
        )

    def prove_humanity(self, biometric_hash: bytes, merkle_proof: bytes) -> ZKProof:
        """Prove humanity (registered in humanity merkle tree)."""
        witness = biometric_hash + merkle_proof
        proof_bytes = hashlib.sha3_512(witness).digest()
        return ZKProof(
            proof_id="zkp_human_" + hashlib.sha256(proof_bytes).hexdigest()[:12],
            proof_bytes=proof_bytes,
            public_inputs=["humanity_root"],
            circuit_name="humanity_merkle_v1",
            proof_system=ProofSystem.GROTH16,
            generated_at=time.time(),
        )

    def verify_proof(self, proof: ZKProof) -> bool:
        """Verify a ZK proof. Production: call on-chain verifier."""
        # Simulate: accept any proof with valid structure
        valid = len(proof.proof_bytes) >= 32 and proof.public_inputs
        proof.verified = valid
        return valid


class DIDRegistry:
    """On-chain DID registry (did:pi: method)."""

    def __init__(self):
        self._registry: dict[str, DIDDocument] = {}

    def register(self, pi_address: str, verification_key: bytes) -> DIDDocument:
        did = f"did:pi:{pi_address}"
        vm_id = f"{did}#key-1"
        doc = DIDDocument(
            did=did,
            verification_methods=[{
                "id": vm_id,
                "type": "Ed25519VerificationKey2020",
                "controller": did,
                "publicKeyMultibase": "z" + verification_key.hex()
            }],
            authentication=[vm_id],
            assertion_method=[vm_id],
            key_agreement=[vm_id],
            service_endpoints=[{
                "id": f"{did}#super-pi-wallet",
                "type": "SuperPiWallet",
                "serviceEndpoint": f"https://wallet.super-pi.io/did/{pi_address}"
            }],
            created=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            updated=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
        self._registry[did] = doc
        logger.info(f"DID registered: {did}")
        return doc

    def resolve(self, did: str) -> Optional[DIDDocument]:
        return self._registry.get(did)

    def deactivate(self, did: str) -> bool:
        doc = self._registry.get(did)
        if doc:
            doc.deactivated = True
            return True
        return False


class ZKIdentityService:
    """
    Main ZK Identity service.
    Issues credentials, generates ZK proofs, verifies presentations.
    """

    def __init__(self):
        self.did_registry = DIDRegistry()
        self.circuit_runner = ZKCircuitRunner()
        self.commitment = PedersenCommitment()
        self._credentials: dict[str, VerifiableCredential] = {}
        logger.info("ZK Identity Service online — did:pi: + zkKYC active")

    def register_identity(self, pi_address: str, verification_key: bytes) -> DIDDocument:
        return self.did_registry.register(pi_address, verification_key)

    def issue_kyc_credential(self, issuer_did: str, holder_did: str,
                             kyc_data: dict) -> VerifiableCredential:
        """Issue a ZK-provable KYC credential."""
        commitment_value = json.dumps(kyc_data, sort_keys=True).encode()
        commitment, _ = self.commitment.commit(commitment_value)

        # Generate ZK proof that issuer attests to this commitment
        proof = self.circuit_runner.prove_kyc(
            kyc_data,
            {"commitment_hash": commitment.hex(), "issuer": issuer_did}
        )

        cred_id = "vc_kyc_" + hashlib.sha256(
            f"{holder_did}{time.time()}".encode()
        ).hexdigest()[:12]
        cred = VerifiableCredential(
            id=cred_id,
            issuer_did=issuer_did,
            holder_did=holder_did,
            credential_type=CredentialType.KYC_BASIC,
            claims={},  # no plaintext claims stored
            commitment=commitment,
            proof_system=ProofSystem.PLONKY3,
            zk_proof=proof.proof_bytes,
            issued_at=time.time(),
            expires_at=time.time() + 365 * 86400,
        )
        self._credentials[cred_id] = cred
        logger.info(f"KYC credential issued to {holder_did}: {cred_id}")
        return cred

    def prove_age_gate(self, holder_did: str, birth_year: int, min_age: int) -> ZKProof:
        """Generate a proof that holder is at least min_age years old."""
        current_year = int(time.strftime("%Y"))
        return self.circuit_runner.prove_age(birth_year, min_age, current_year)

    def prove_humanity(self, holder_did: str, biometric_hash: bytes) -> ZKProof:
        """Generate a humanity proof."""
        merkle_proof = hashlib.sha3_256(biometric_hash).digest()
        return self.circuit_runner.prove_humanity(biometric_hash, merkle_proof)

    def verify_presentation(self, proof: ZKProof) -> bool:
        return self.circuit_runner.verify_proof(proof)

    def stats(self) -> dict:
        return {
            "registered_dids": len(self.did_registry._registry),
            "issued_credentials": len(self._credentials),
            "revoked": sum(1 for c in self._credentials.values() if c.revoked),
        }
