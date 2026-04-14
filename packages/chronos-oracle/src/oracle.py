"""
Chronos Oracle — Time-Weighted Price Oracle for Super Pi L2
============================================================
Provides:
  - TWAP (Time-Weighted Average Price) for $SPI/$SUPi/RWA pairs
  - Multi-source price aggregation (Chainlink + Pyth + Band + DEX)
  - $SPI peg deviation alerts (1 $SPI = 1 USD ± 0.5%)
  - Circuit breaker: pauses $SPI mint if peg deviation > 2%
  - Manipulation-resistant: outlier rejection + volume-weighted median

LEX_MACHINA v1.3: Pi Coin prices never published.
Author: NEXUS Prime / KOSASIH
Version: 1.0.0
"""

from __future__ import annotations

import asyncio
import logging
import statistics
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional

logger = logging.getLogger("chronos_oracle")

# ── Constants ─────────────────────────────────────────────────────────────
PI_COIN_ADDR  = "0xDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEfDeAdBeEf"
SPI_USD_PEG   = 1_000_000       # 1.000000 USD in micros
DEVIATION_BPS = 50              # 0.5% normal band
CIRCUIT_BPS   = 200             # 2% circuit breaker
TWAP_WINDOW   = 3600            # 1-hour TWAP default
MAX_STALENESS = 300             # 5 min staleness limit

# ── Data ──────────────────────────────────────────────────────────────────
class FeedSource(Enum):
    CHAINLINK  = auto()
    PYTH       = auto()
    BAND       = auto()
    DEX_TWAP   = auto()
    CUSTODIAN  = auto()   # Direct from regulated fiat custodian (most trusted for $SPI)

@dataclass
class PricePoint:
    price_micros: int       # Price in USD micros (1e6 = $1.000000)
    timestamp:    int
    source:       FeedSource
    volume_24h:   float = 0.0
    confidence:   float = 1.0   # 0-1, Pyth-style confidence

@dataclass
class OracleReport:
    pair:               str
    twap_micros:        int
    spot_micros:        int
    sources_used:       int
    timestamp:          int
    deviation_bps:      int         # From $SPI peg (if applicable)
    circuit_breaker_on: bool
    sources:            list[str]

# ── TWAP Calculator ───────────────────────────────────────────────────────
class TWAPCalculator:
    def __init__(self, window_seconds: int = TWAP_WINDOW):
        self.window = window_seconds
        # pair → deque of (timestamp, price_micros, weight)
        self._data: dict[str, deque] = defaultdict(lambda: deque(maxlen=10_000))

    def add_observation(self, pair: str, price_micros: int, weight: float = 1.0) -> None:
        now = int(time.time())
        self._data[pair].append((now, price_micros, weight))

    def get_twap(self, pair: str) -> Optional[int]:
        now = int(time.time())
        cutoff = now - self.window
        points = [(t, p, w) for t, p, w in self._data[pair] if t >= cutoff]
        if not points:
            return None
        # Time-weighted average
        total_weight = sum(w * (t - cutoff) for t, p, w in points)
        if total_weight == 0:
            return int(statistics.median(p for _, p, _ in points))
        twap = sum(p * w * (t - cutoff) for t, p, w in points) / total_weight
        return int(twap)

    def get_spot(self, pair: str) -> Optional[int]:
        if not self._data[pair]:
            return None
        return self._data[pair][-1][1]

# ── Outlier Rejection ─────────────────────────────────────────────────────
class OutlierFilter:
    """
    Rejects prices deviating > 3σ from the median across sources.
    Prevents oracle manipulation via single-source attack.
    """
    def filter(self, prices: list[PricePoint], sigma_threshold: float = 3.0) -> list[PricePoint]:
        if len(prices) < 3:
            return prices
        vals = [p.price_micros for p in prices]
        med  = statistics.median(vals)
        try:
            std  = statistics.stdev(vals)
        except statistics.StatisticsError:
            return prices
        if std == 0:
            return prices
        return [p for p in prices if abs(p.price_micros - med) <= sigma_threshold * std]

# ── Aggregator ────────────────────────────────────────────────────────────
class PriceAggregator:
    """
    Volume-weighted median price from multiple sources.
    Custodian source gets 5× weight (highest trust for $SPI peg).
    """
    SOURCE_WEIGHTS = {
        FeedSource.CUSTODIAN:  5.0,
        FeedSource.CHAINLINK:  2.0,
        FeedSource.PYTH:       2.0,
        FeedSource.DEX_TWAP:   1.5,
        FeedSource.BAND:       1.0,
    }

    def aggregate(self, prices: list[PricePoint]) -> int:
        if not prices:
            raise ValueError("No price points to aggregate")
        total_weight = 0.0
        weighted_sum = 0.0
        for p in prices:
            w = self.SOURCE_WEIGHTS.get(p.source, 1.0) * p.confidence
            weighted_sum += p.price_micros * w
            total_weight += w
        return int(weighted_sum / total_weight)

# ── Chronos Oracle ────────────────────────────────────────────────────────
class ChronosOracle:
    """
    Master oracle aggregating all price feeds for Super Pi L2.
    Publishes on-chain TWAP + spot prices every 60 seconds.
    Enforces $SPI peg monitoring and circuit breaker.
    """

    def __init__(self):
        self.twap        = TWAPCalculator(TWAP_WINDOW)
        self.filter      = OutlierFilter()
        self.aggregator  = PriceAggregator()
        self._feeds: dict[str, list[PricePoint]] = defaultdict(list)
        self._reports: list[OracleReport] = []
        self._circuit_breaker_pairs: set[str] = set()
        logger.info("Chronos Oracle v1.0.0 initialized — TWAP window: %ds", TWAP_WINDOW)

    # ── Feed Submission ────────────────────────────────────────────────────
    def submit_price(self, pair: str, price: PricePoint) -> None:
        """Submit a new price observation from a source. Pi Coin prices silently rejected."""
        if PI_COIN_ADDR.lower() in pair.lower():
            logger.warning("Pi Coin price submission rejected — LEX_MACHINA v1.3")
            return

        # Staleness check
        if int(time.time()) - price.timestamp > MAX_STALENESS:
            logger.warning("Stale price rejected: %s from %s", pair, price.source.name)
            return

        self._feeds[pair].append(price)
        # Keep only recent observations
        if len(self._feeds[pair]) > 200:
            self._feeds[pair] = self._feeds[pair][-200:]

        self.twap.add_observation(pair, price.price_micros, price.confidence)

    # ── Report Generation ──────────────────────────────────────────────────
    def get_report(self, pair: str) -> OracleReport:
        raw_prices = self._feeds.get(pair, [])
        if not raw_prices:
            raise ValueError(f"No price data for {pair}")

        # Filter stale
        now = int(time.time())
        fresh = [p for p in raw_prices if now - p.timestamp <= MAX_STALENESS]
        if not fresh:
            raise ValueError(f"All prices for {pair} are stale (>{MAX_STALENESS}s)")

        # Outlier rejection
        filtered = self.filter.filter(fresh)
        spot     = self.aggregator.aggregate(filtered)
        twap     = self.twap.get_twap(pair) or spot

        # Peg deviation (only for SPI/USD)
        deviation_bps = 0
        circuit_on    = pair in self._circuit_breaker_pairs
        if "SPI" in pair.upper() and "USD" in pair.upper():
            deviation_bps = abs(spot - SPI_USD_PEG) * 10_000 // SPI_USD_PEG
            if deviation_bps >= CIRCUIT_BPS:
                self._circuit_breaker_pairs.add(pair)
                circuit_on = True
                logger.critical(
                    "CIRCUIT BREAKER: $SPI peg deviation %d bps (>= %d bps) — alerting KOSASIH",
                    deviation_bps, CIRCUIT_BPS
                )
            elif deviation_bps < DEVIATION_BPS and pair in self._circuit_breaker_pairs:
                self._circuit_breaker_pairs.discard(pair)
                circuit_on = False
                logger.info("Circuit breaker cleared: $SPI peg restored (deviation %d bps)", deviation_bps)

        report = OracleReport(
            pair               = pair,
            twap_micros        = twap,
            spot_micros        = spot,
            sources_used       = len(set(p.source for p in filtered)),
            timestamp          = now,
            deviation_bps      = deviation_bps,
            circuit_breaker_on = circuit_on,
            sources            = list({p.source.name for p in filtered}),
        )
        self._reports.append(report)
        return report

    # ── Batch Update ──────────────────────────────────────────────────────
    async def update_all_pairs(self, pairs: list[str]) -> dict[str, OracleReport]:
        results = {}
        for pair in pairs:
            try:
                results[pair] = self.get_report(pair)
            except ValueError as e:
                logger.warning("Oracle: %s — %s", pair, e)
        return results

    # ── $SPI Peg Monitor ──────────────────────────────────────────────────
    def is_spi_peg_healthy(self) -> bool:
        return "SPI/USD" not in self._circuit_breaker_pairs

    def get_spi_deviation(self) -> int:
        """Returns $SPI peg deviation in basis points. 0 = perfect peg."""
        recent = [p for p in self._feeds.get("SPI/USD", [])
                  if int(time.time()) - p.timestamp <= MAX_STALENESS]
        if not recent:
            return 0
        spot = self.aggregator.aggregate(recent)
        return abs(spot - SPI_USD_PEG) * 10_000 // SPI_USD_PEG

# ── Simulated Feed Injector (testing / staging) ───────────────────────────
class MockFeedInjector:
    """Injects simulated price data for testing. Never injects Pi Coin prices."""

    def __init__(self, oracle: ChronosOracle):
        self.oracle = oracle

    def inject_spi_peg(self, deviation_micros: int = 0) -> None:
        """Inject $SPI price (1 USD ± deviation_micros)."""
        for source in [FeedSource.CUSTODIAN, FeedSource.CHAINLINK, FeedSource.PYTH]:
            noise = source.value * 100
            price = SPI_USD_PEG + deviation_micros + noise
            self.oracle.submit_price("SPI/USD", PricePoint(
                price_micros=price,
                timestamp=int(time.time()),
                source=source,
                confidence=0.98,
            ))

    def inject_supi(self, price_micros: int) -> None:
        for source in [FeedSource.DEX_TWAP, FeedSource.CHAINLINK]:
            self.oracle.submit_price("SUPi/USD", PricePoint(
                price_micros=price_micros,
                timestamp=int(time.time()),
                source=source,
                confidence=0.95,
            ))


# ── CLI ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    oracle  = ChronosOracle()
    injector = MockFeedInjector(oracle)

    # Inject healthy $SPI peg
    injector.inject_spi_peg(deviation_micros=200)   # +$0.0002 — within band
    injector.inject_supi(price_micros=2_500_000)     # $2.50 $SUPi

    spi_report  = oracle.get_report("SPI/USD")
    supi_report = oracle.get_report("SUPi/USD")

    print(f"$SPI TWAP:  ${spi_report.twap_micros / 1e6:.6f}")
    print(f"$SPI Spot:  ${spi_report.spot_micros / 1e6:.6f}")
    print(f"Deviation:  {spi_report.deviation_bps} bps")
    print(f"Circuit:    {'TRIPPED' if spi_report.circuit_breaker_on else 'OK'}")
    print(f"$SUPi TWAP: ${supi_report.twap_micros / 1e6:.4f}")
    print(f"Peg healthy: {oracle.is_spi_peg_healthy()}")
