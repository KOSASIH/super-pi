# NexusLaw v4.0 — Super Pi Constitutional Law

Issued: 2026-05-05 | Supersedes: NexusLaw v3.1 | Authority: NEXUS Prime + AIDAOv3

## Preamble
NexusLaw v4.0 governs the Super Pi sovereign L2 blockchain and all L3 appchains,
195-nation CBDC settlements, and the 10,000+ Super App ecosystem.
All smart contracts, agents, and infrastructure must comply.

## Articles (v4.0 new: 16–25)

- Article 1–15: [Inherited from NexusLaw v3.1]
- **Article 16**: Post-quantum keys (Kyber-1024/Dilithium-4/SPHINCS+/Falcon-1024) mandatory
  for all validators by v14.0.0. QuantumKeyRegistry.sol is the canonical registry.
- **Article 17**: All Super Pi protocol changes MUST be enacted via AIDAOv3.
  LLM-generated proposals, ZK vote privacy, 7-day vote + 2-day timelock, 3-of-8 guardian veto.
- **Article 18**: L3 appchains deployed via SovereignL3Factory inherit full NexusLaw compliance
  at genesis. Gas tokens restricted to $SPI/$SUPi. Pi Coin bridge = HARD-BLOCKED.
- **Article 19**: Gasless UX mandatory for all Super Apps. OmegaPaymaster.sol is the
  canonical ERC-4337 paymaster. $SPI daily budget enforced per user/app.
- **Article 20**: Super Pi L2 is the settlement layer for all sovereign CBDCs.
  $SPI is the atomic settlement reserve. Pi Coin: HARD-BLOCKED from all CBDC paths.
- **Article 21**: All oracle outputs (ARIA, NexusProphet, regulatory) must carry ZK proof
  verified via ZKProofAggregator. Unproven oracle outputs are invalid.
- **Article 22**: Quantum computing resources on-chain priced in $SPI only.
  QuantumComputeMarket.sol governs. Providers stake $SUPi minimum 50,000.
- **Article 23**: No Pi Coin cross-chain. OmniChainBridgeV3 enforces isPI[] blacklist.
  Fraud-suspicious bridges auto-paused by GUARDIAN_ROLE.
- **Article 24**: Liquid staking yield distributed in $SPI only (mudarabah, no riba).
  HyperionStakingV2.sol governs stSUPi issuance and AVS restaking.
- **Article 25**: NFT royalties paid in $SPI. No lottery/gambling NFT mechanics (maysir=0).
  NeuroNFTv3.sol: 5% creator royalty + 5% DAO treasury.

## Constants
- PI_COIN = BANNED_FOREVER
- riba = 0
- maysir = 0
- gharar = 0
- ARIA_SCORE_MIN = 500
- KYC_REQUIRED_ABOVE = 1000 $SPI
- CARBON_OFFSET = 100%
- AGENTS = 8 (AIDAOv3 guardian quorum)
