export class ExchangeOracle {
  private exchanges = [
    'https://api.binance.com/api/v3/ticker/price?symbol=PIUSDT',
    'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd'
  ];

  async getMarketPrice(): Promise<number> {
    try {
      // Aggregate from multiple exchanges
      const prices = await Promise.all(
        this.exchanges.map(url => this.fetchPrice(url))
      );
      
      // Weighted average (Binance 60%, Others 40%)
      return prices.reduce((sum, price, i) => sum + price * (i === 0 ? 0.6 : 0.2), 0);
    } catch {
      // Fallback price
      return 0.0001; // Minimal value for tainted coins
    }
  }

  private async fetchPrice(url: string): Promise<number> {
    const response = await fetch(url);
    const data = await response.json();
    return parseFloat(data.price || data.usd);
  }
}
