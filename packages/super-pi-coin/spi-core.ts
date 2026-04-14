import { ethers } from 'ethers';
import { FiatCollateralManager } from './fiat-collateral';
import { FiatBridge } from './fiat-bridge';

export class SuperPiCoin {
  static readonly SYMBOL = 'SPI';
  static readonly NAME = 'Super Pi USD Stablecoin';
  static readonly PEG_USD = 1.00; // Pure 1:1 USD
  static readonly DECIMALS = 18;

  private fiatCollateral: FiatCollateralManager;
  private fiatBridge: FiatBridge;
  private contract: ethers.Contract;

  constructor(provider: ethers.providers.JsonRpcProvider) {
    this.fiatCollateral = new FiatCollateralManager();
    this.fiatBridge = new FiatBridge();
    this.contract = new ethers.Contract(
      process.env.SPI_CONTRACT_ADDRESS!,
      SPI_ABI,
      provider
    );
  }

  // Mint $SPI with Fiat Collateral (USD, EUR, etc.)
  async mintWithFiat(fiatAmount: number, fiatCurrency: 'USD' | 'EUR' | 'GBP'): Promise<string> {
    // 1. Verify fiat deposit (Off-chain oracle/bank API)
    const usdEquivalent = await this.fiatCollateral.convertToUSD(fiatAmount, fiatCurrency);
    const spiAmount = ethers.utils.parseUnits(usdEquivalent.toFixed(18), 18);
    
    // 2. Mint $SPI
    const tx = await this.contract.mint(spiAmount);
    await tx.wait();
    
    // 3. Record collateral
    await this.fiatCollateral.recordDeposit(msg.sender, usdEquivalent, fiatCurrency);
    
    return tx.hash;
  }

  // Burn $SPI → Fiat Withdrawal
  async burnToFiat(spiAmount: bigint, fiatCurrency: 'USD' | 'EUR' | 'GBP'): Promise<string> {
    const usdValue = Number(ethers.utils.formatUnits(spiAmount, 18));
    
    // 1. Burn $SPI
    const burnTx = await this.contract.burn(spiAmount);
    await burnTx.wait();
    
    // 2. Initiate fiat withdrawal
    const fiatAmount = await this.fiatCollateral.convertFromUSD(usdValue, fiatCurrency);
    const withdrawalTx = await this.fiatBridge.requestFiatWithdrawal(
      msg.sender, 
      fiatAmount, 
      fiatCurrency
    );
    
    return withdrawalTx;
  }

  // Get Real-time Peg Status
  async getPegStatus(): Promise<{
    pegPrice: number;
    collateralRatio: number;
    fiatBacking: number;
  }> {
    const price = await this.getOraclePrice();
    const collateral = await this.fiatCollateral.getTotalCollateralUSD();
    const supply = await this.contract.totalSupply();
    
    return {
      pegPrice: Number(ethers.utils.formatUnits(price, 8)),
      collateralRatio: (Number(collateral) / Number(ethers.utils.formatUnits(supply, 18))) * 100,
      fiatBacking: Number(collateral)
    };
  }

  private async getOraclePrice(): Promise<bigint> {
    // Chainlink USD price feed
    const priceFeed = new ethers.Contract(
      process.env.CHAINLINK_USD_FEED!,
      CHAINLINK_ABI,
      this.contract.provider
    );
    const [, price,,,] = await priceFeed.latestRoundData();
    return price;
  }
}
