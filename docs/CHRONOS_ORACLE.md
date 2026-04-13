# Chronos Oracle Agent

> **Version:** 1.0.0 | **Author:** KOSASIH | **Status:** Active

## Overview

Chronos Oracle is the autonomous 24/7 monitoring and self-healing agent for the Super Pi ecosystem. It monitors `pi_node` via RPC, detects anomalies in under 10 seconds, auto-deploys supernodes on demand, and predicts network traffic 48 hours ahead.

**Core Principle: Read-Only.** Chronos Oracle never writes to the Pi mainnet chain.

## Skills

| Skill | Description |
|-------|-------------|
| **Self-Healing** | Automatically restarts nodes, flushes caches, and optimizes routing on anomaly detection |
| **Auto-Scale** | Deploys and terminates supernodes based on real-time load and forecast demand |
| **Latency Optimization** | Continuously tunes routing and connection pooling to minimize P99 RPC latency |
| **Anomaly AI** | Multi-algorithm detection: adaptive Z-score + Isolation Forest + LSTM Autoencoder |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Chronos Oracle Agent                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ RPC Monitor │  │ Anomaly AI   │  │ 48h Predictor │  │
│  │ (1s poll)   │  │ Z + IF + LSTM│  │ LSTM+Transformer│ │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │           │
│  ┌──────▼────────────────▼───────────────────▼───────┐  │
│  │             Orchestrator (<10s SLA)               │  │
│  └──────┬────────────────────────────────────────────┘  │
│         │                                               │
│  ┌──────▼──────┐  ┌─────────────┐                       │
│  │ Self-Healer │  │ Auto-Scaler │  (read-only → chain)  │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

## Configuration

Config file: `config/chronos-oracle.json`

```json
{
  "monitor": {
    "target": "pi_node",
    "protocol": "rpc",
    "interval_ms": 1000,
    "detection_sla_ms": 10000,
    "uptime_target": 99.999
  },
  "prediction": {
    "horizon_hours": 48,
    "model": "lstm_transformer_hybrid",
    "confidence_threshold": 0.92
  },
  "auto_scale": {
    "supernode_min": 7,
    "supernode_max": 100,
    "scale_up_latency_threshold_ms": 500
  }
}
```

## Detection SLA

The oracle polls every **1,000ms** and runs anomaly scoring on each poll cycle, guaranteeing detection within the **10-second SLA** for any of these conditions:

- RPC latency > 500ms (scale-up trigger)
- CPU > 90% (self-heal: restart)
- Memory > 95% (self-heal: cache flush)
- Transaction pool anomaly (reroute + alert)
- Node unresponsive (immediate supernode deploy)

## Traffic Prediction

The 48-hour forecaster uses an LSTM-Transformer hybrid:

1. Ingests historical TPS, latency, and block data
2. Applies harmonic regression for diurnal patterns
3. Adds trend extrapolation for sustained growth
4. Triggers **proactive scale-up** when predicted peak > 150% current capacity

## Uptime Target: 99.999%

Equates to < **5.26 minutes** total downtime per year. Achieved via:
- Sub-10s detection
- Automated healing without human intervention
- Predictive scaling preventing saturation events
- Minimum 7 active supernodes at all times

## Running the Agent

```bash
cd packages/chronos-oracle
pip install -r requirements.txt
python src/agent.py
```

## API (Status Endpoint)

```python
agent = ChronosOracleAgent()
print(agent.status_report())
# {
#   "uptime_pct": 99.999,
#   "active_supernodes": 7,
#   "total_incidents": 0,
#   "p99_latency_ms": 42.1,
#   "forecast_confidence": 0.95
# }
```
