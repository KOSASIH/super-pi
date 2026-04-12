import { PiCoin, PurityStatus, OriginType, CoinHistory } from '../dual-value/types';
import { MerkleTree } from './merkle-tree';
import { ZKProofGenerator } from './zk-proofs';
import { ExchangeDetector } from './exchange-detector';

export class PurityTracker {
  private static instance: PurityTracker;
  private merkleTree = new MerkleTree();
  private exchangeDetector = new ExchangeDetector();
  private zkProver = new ZKProofGenerator();

  static getInstance(): PurityTracker {
    if (!PurityTracker.instance) {
      PurityTracker.instance = new PurityTracker();
    }
    return PurityTracker.instance;
  }

  async analyzeCoin(coin: PiCoin): Promise<PurityStatus> {
    // 1. Check if coin has valid 🌟 certification
    if (coin.metadata.starCertified) {
      return PurityStatus.PURE_STAR;
    }

    // 2. AI-Powered Exchange Detection
    const exchangeScore = await this.exchangeDetector.analyze(coin);
    if (exchangeScore > 0.7) {
      return PurityStatus.TAINTED_EXCHANGE;
    }

    // 3. Trace transaction history (10 hops deep)
    const taintScore = await this.calculateTaintScore(coin.history);
    
    if (taintScore === 0) {
      return PurityStatus.PURE_STAR;
    } else if (taintScore < 0.3) {
      return PurityStatus.EXTERNAL_CLEAN;
    } else if (taintScore < 0.8) {
      return PurityStatus.TAINTED_EXCHANGE;
    } else {
      return PurityStatus.FULLY_TAINTED;
    }
  }

  private async calculateTaintScore(history: CoinHistory[]): Promise<number> {
    let totalTaint = 0;
    let hopCount = 0;

    for (const hop of history.slice(0, 10)) { // Max 10 hops
      const hopTaint = await this.getHopTaint(hop);
      totalTaint += hopTaint * Math.pow(0.8, hopCount); // Exponential decay
      hopCount++;
    }

    return Math.min(1.0, totalTaint);
  }

  private async getHopTaint(hop: CoinHistory): Promise<number> {
    // Check known exchange addresses
    if (this.exchangeDetector.isExchangeAddress(hop.from) || 
        this.exchangeDetector.isExchangeAddress(hop.to)) {
      return 0.9;
    }

    // Check for mixer patterns
    if (this.detectMixerPattern(hop)) {
      return 0.95;
    }

    // ZK Proof validation
    return await this.zkProver.verifyProof(hop.txHash) ? 0 : 0.1;
  }

  certifyPureCoin(coin: PiCoin, origin: OriginType): PiCoin {
    const certifiedCoin = {
      ...coin,
      purity: PurityStatus.PURE_STAR,
      origin,
      metadata: {
        ...coin.metadata,
        starCertified: true,
        createdAt: Date.now()
      },
      taintScore: 0.0
    };

    // Add to Merkle Tree for fast verification
    this.merkleTree.addLeaf(certifiedCoin);
    
    return certifiedCoin;
  }

  async verifyPurePi(coinId: string): Promise<boolean> {
    return this.merkleTree.verifyLeaf(coinId);
  }
}
