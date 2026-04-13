# Configuration Reference

This directory contains all runtime configuration for the Super Pi ecosystem.

## Files

| File | Purpose |
|------|---------|
| `payout.json` | Payout rules: asset split, addresses, schedule, gas policy |
| `network.json` | Super Pi L2 network parameters, bridge endpoints, rollup config |
| `chronos-oracle.json` | Chronos Oracle Agent monitoring, scaling, and prediction config |

## payout.json

Controls the automated weekly payout engine:
- **80% USDT** to Arbitrum recipient
- **20% PI** to Pi Mainnet recipient
- Gas deducted from PI allocation
- Weekly on Friday 00:00 UTC, minimum $50 USD

## network.json

Defines the `super-pi-l2` Layer 2 network:
- Sequencer configuration (2s batch interval, zstd compression)
- Bridge endpoints (Arbitrum USDT, Ethereum WETH)
- Fraud proof window (168h), ZK fallback, supernode limits
- RPC and explorer endpoints

## chronos-oracle.json

Configures the Chronos Oracle Agent:
- RPC polling (1000ms interval, 10000ms detection SLA)
- 48h traffic prediction (LSTM-Transformer, 0.92 confidence threshold)
- Auto-scaling (7–100 supernodes, 500ms latency trigger)
- Anomaly detection algorithms and alert channels
- **Chain write disabled** (`chain_write_enabled: false`)

## Security Notes

- **Never commit secrets** to config files. Use `.env` for credentials.
- Payout addresses are immutable after deployment and verified on each run.
- Config changes to payout addresses require 2-of-3 multi-sig approval.
