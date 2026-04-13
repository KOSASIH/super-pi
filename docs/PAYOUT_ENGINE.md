# Payout Engine

> **Version:** 1.0.0 | **Author:** KOSASIH | **Schedule:** Weekly, Friday 00:00 UTC

## Overview

The Payout Engine automates weekly revenue distribution across the Super Pi L2 network, enforcing the configured payout rules with gas deduction from the PI allocation.

## Payout Rules

| Asset | Chain | Percentage | Address |
|-------|-------|-----------|---------|
| USDT | Arbitrum | **80%** | `0x373Ec75e4e99CA59e367bA667EC38B2e14Af390B` |
| PI | Pi Mainnet | **20%** | `GCKUNNC6X6LKYJXKTQEJAQQ2J6NTIHMRNJFM2KY6KIBB46BOPMKVXDQN` |

## Schedule

```
Frequency : Weekly
Day       : Friday
Time      : 00:00 UTC
Minimum   : $50.00 USD
Gas Policy: Deducted from PI allocation (0.1% of PI share)
```

## Payout Calculation Example

Given **$1,000 total revenue**:

```
Total:          $1,000.00
─────────────────────────────────────────
USDT (80%):     $800.00  → Arbitrum
PI (20%):       $200.00
  Gas (0.1%):   -$0.20
  Net PI USD:   $199.80
  Net PI Amount: 0.000000636 PI @ $314,159/PI
─────────────────────────────────────────
```

## Gas Policy

Gas is deducted from the PI allocation to keep USDT payouts intact.

- Gas rate: 0.1% of PI allocation (minimum $0.001)
- Policy: `deduct_from_pi_allocation`
- At PI price $314,159: gas per payout ≈ negligible

## Threshold Enforcement

Payouts below **$50 USD** are skipped and accumulate until the next week's cycle reaches the threshold.

## Configuration

File: `config/payout.json`

```json
{
  "version": "1.0",
  "owner": "KOSASIH",
  "network": "super-pi-l2",
  "payout_rules": [...],
  "withdraw_schedule": {
    "frequency": "weekly",
    "day": "Friday",
    "time": "00:00 UTC",
    "min_threshold_usd": 50
  },
  "gas_policy": "deduct_from_pi_allocation"
}
```

## Usage

```python
from packages.payout_engine.src.engine import PayoutEngine
import asyncio

engine = PayoutEngine("config/payout.json")
breakdown = engine.calculate_payout(total_usd=1000.00)
record = asyncio.run(engine.execute_payout(total_usd=1000.00))
print(engine.summary())
```

## Security

- Payout addresses are hardcoded in `config/payout.json` and verified on each run
- Signed transactions via hardware HSM in production
- Multi-sig required for config changes (2-of-3)
- All payouts logged on-chain for auditability
