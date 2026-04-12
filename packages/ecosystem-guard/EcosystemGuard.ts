import { PurityTracker } from '../purity-tracker';
import { PiCoin, PurityStatus, OriginType } from '../dual-value';
import { ExchangeOracle } from './exchange-oracle';
import { TaintDatabase } from './taint-database';
import { MerkleTaintTree } from './merkle-taint-tree';

export class EcosystemGuard {
  private static instance: EcosystemGuard;
  private taintDB = new TaintDatabase();
  private exchangeOracle = new ExchangeOracle();
  private merkleTaint = new MerkleTaintTree();
  private purityTracker = PurityTracker.getInstance();

  static getInstance(): EcosystemGuard {
    if (!EcosystemGuard.instance) {
      EcosystemGuard.instance = new EcosystemGuard();
    }
    return EcosystemGuard.instance;
  }

  /**
   * PERMANENT TAINT SYSTEM
   * Once coin leaves ecosystem → FOREVER TAINTED
   */
  async processIncomingCoin(coin: PiCoin): Promise<{
    status: PurityStatus;
    valueUSD: number;
    accepted: boolean;
    reason?: string;
  }> {
    const coinId = this.generateCoinId(coin);

    // 1. CHECK PERMANENT TAINT STATUS (INSTANT REJECT)
    if (await this.taintDB.isPermanentlyTainted(coinId)) {
      const marketPrice = await this.exchangeOracle.getMarketPrice();
      return {
        status: PurityStatus.FULLY_TAINTED,
        valueUSD: marketPrice,
        accepted: false,
        reason: 'PERMANENT TAINT: Coin pernah keluar ecosystem'
      };
    }

    // 2. REAL-TIME ECOSYSTEM EXIT DETECTION
    const exitHistory = await this.detectEcosystemExit(coin);
    if (exitHistory.length > 0) {
      // MARK AS PERMANENTLY TAINTED
      await this.taintDB.markPermanentlyTainted(coinId, exitHistory);
      await this.merkleTaint.addTaintedLeaf(coinId);
      
      const marketPrice = await this.exchangeOracle.getMarketPrice();
      return {
        status: PurityStatus.FULLY_TAINTED,
        valueUSD: marketPrice,
        accepted: false,
        reason: 'DETECTED ECOSYSTEM EXIT - PERMANENTLY TAINTED'
      };
    }

    // 3. FULL PURITY VERIFICATION
    const purityStatus = await this.purityTracker.analyzeCoin(coin);
    
    if (purityStatus === PurityStatus.PURE_STAR) {
      return {
        status: PurityStatus.PURE_STAR,
        valueUSD: 314159, // FIXED $314,159
        accepted: true
      };
    }

    // 4. MARKET PRICE FOR TAINTED COINS
    const marketPrice = await this.exchangeOracle.getMarketPrice();
    return {
      status: purityStatus,
      valueUSD: marketPrice,
      accepted: false,
      reason: 'Non-pure coin detected'
    };
  }

  private async detectEcosystemExit(coin: PiCoin): Promise<string[]> {
    const exitEvents: string[] = [];

    // Check if coin ever touched external addresses
    for (const hop of coin.history) {
      if (this.isExternalAddress(hop.from) || this.isExternalAddress(hop.to)) {
        exitEvents.push(hop.txHash);
      }
    }

    // Check exchange deposit patterns
    const exchangeScore = await this.purityTracker.analyzeCoin(coin);
    if (exchangeScore > 0.1) {
      exitEvents.push('EXCHANGE_PATTERN');
    }

    return exitEvents;
  }

  private isExternalAddress(address: string): boolean {
    // Ecosystem whitelist vs external blacklist
    const ecosystemAddresses = new Set([
      // Only Pi Pioneer wallets, mining pools, etc.
    ]);
    
    const externalIndicators = [
      /exchange|binance|coinbase|kucoin|okx/i,
      /^1[A-Za-z0-9]{26,34}$/, // Legacy Bitcoin
    ];

    return !ecosystemAddresses.has(address) || 
           externalIndicators.some(pattern => pattern.test(address));
  }

  private generateCoinId(coin: PiCoin): string {
    return `${coin.txHash}-${coin.amount}-${coin.timestamp}`;
  }

  // Broadcast taint status to all nodes
  async broadcastTaint(coinId: string): Promise<void> {
    // Pub/sub to all Pi nodes
    await this.taintDB.broadcastTaint(coinId);
  }
}
