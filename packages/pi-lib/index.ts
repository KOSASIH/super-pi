// High-performance PI calculation using Chudnovsky algorithm
export class SuperPiCalculator {
  static async calculate(digits: number): Promise<string> {
    // Compile to WASM for max performance
    const { calculatePi } = await import('./pi.wasm');
    return calculatePi(digits);
  }
}
