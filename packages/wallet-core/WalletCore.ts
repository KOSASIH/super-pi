import { PurityTracker } from '../purity-tracker';
import { PiCoin, PurityStatus } from '../dual-value';

export class WalletCore {
  private balance: Map<string, PiCoin[]> = new Map();

  async receiveCoin(coin: PiCoin): Promise<boolean> {
    // MANDATORY PURITY CHECK
    const purity = await PurityTracker.getInstance().analyzeCoin(coin);
    
    if (purity !== PurityStatus.PURE_STAR) {
      console.log(`🚫 Wallet REJECTS: ${purity}`);
      return false; // HARD REJECTION
    }

    // ✅ Only Pure Pi accepted
    const address = 'user_wallet_address';
    const userCoins = this.balance.get(address) || [];
    userCoins.push(coin);
    this.balance.set(address, userCoins);
    
    return true;
  }

  getPurePiBalance(address: string): bigint {
    const coins = this.balance.get(address) || [];
    return coins
      .filter(coin => coin.purity === PurityStatus.PURE_STAR)
      .reduce((sum, coin) => sum + coin.amount, 0n);
  }

  getValueInUSD(): number {
    const pureBalance = this.getPurePiBalance('user_wallet_address');
    return Number(pureBalance) * 314159; // $314,159 per Pi
  }
}
