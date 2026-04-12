// FIXED STABLECOIN VALUE - NEVER CHANGES
export const PI_STABLECOIN_VALUE = 314159; // $314,159 USD
export const PI_STABLECOIN_NAME = "🌟 Pure Pi Stablecoin";

export class StablecoinValueEnforcer {
  static instance: StablecoinValueEnforcer;

  // AUTOMATIC VALUE INJECTION
  static getPiValue(amount: bigint | number): number {
    return Number(amount) * PI_STABLECOIN_VALUE;
  }

  static formatPiValue(amount: bigint | number, currency = 'USD'): string {
    const valueUSD = this.getPiValue(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valueUSD);
  }

  static getPiValueDisplay(amount: bigint | number): string {
    const value = this.formatPiValue(amount);
    return `${value} (${PI_STABLECOIN_NAME})`;
  }

  // ENFORCE IN ALL DISPLAYS
  static injectValue(amount: bigint | number, context: string): {
    rawAmount: bigint | number;
    stableValue: string;
    stableValueUSD: number;
    display: string;
    context: string;
  } {
    return {
      rawAmount: amount,
      stableValueUSD: this.getPiValue(amount),
      stableValue: this.formatPiValue(amount),
      display: `${amount.toString()} 🌟Pi = ${this.formatPiValue(amount)}`,
      context
    };
  }
}

// Global Hook - Auto-injects everywhere
declare global {
  interface Window {
    piStableValue: typeof StablecoinValueEnforcer;
  }
}

if (typeof window !== 'undefined') {
  (window as any).piStableValue = StablecoinValueEnforcer;
}
