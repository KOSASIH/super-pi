# Super Pi Packages

This directory contains the core service packages for the Super Pi ecosystem.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| `chronos-oracle` | 24/7 autonomous monitoring, anomaly AI, auto-scaling, 48h prediction | 1.0.0 |
| `payout-engine` | Automated weekly payout (80% USDT + 20% PI) | 1.0.0 |
| `l2-bridge` | Cross-chain bridge: PI ↔ Arbitrum (USDT), PI ↔ Ethereum (WETH) | 1.0.0 |
| `zk-prover` | Plonky3-based ZK proof generation for state transitions & bridges | 1.0.0 |
| `mev-shield` | MEV protection: commit-reveal, sandwich detection, fair ordering | 1.0.0 |
| `neural-consensus` | AI-augmented BFT+SCP consensus with adaptive quorum | 1.0.0 |
| `wallet-core` | Pi wallet core functionality | existing |
| `stablecoin-value` | $314,159 stablecoin enforcement | existing |
| `purity-tracker` | Pi taint tracking (10-hop tracing) | existing |
| `ecosystem-guard` | Ecosystem protection API | existing |
| `pi-lib` | Partner SDK | existing |
| `dual-value` | Dual-value (tainted/pure) display | existing |
| `ui` | UI component library | existing |

## New Package Installation

```bash
# Install all new package dependencies
for pkg in chronos-oracle payout-engine l2-bridge zk-prover mev-shield neural-consensus; do
  echo "Installing $pkg..."
  pip install -r packages/$pkg/requirements.txt
done
```

## Config Dependencies

All new packages read from the `config/` directory:
- `config/chronos-oracle.json` — Chronos Oracle Agent
- `config/payout.json` — Payout Engine  
- `config/network.json` — L2 Network / Bridge
