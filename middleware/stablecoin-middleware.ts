import { NextRequest, NextResponse } from 'next/server';
import { StablecoinValueEnforcer } from '@/packages/stablecoin-value';

export function stablecoinMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // AUTO-INJECT $314,159 VALUES IN ALL API RESPONSES
  response.headers.set('X-Pi-Stablecoin-Value', '314159');
  response.headers.set('X-Pi-Stablecoin-Name', 'Pure Pi Stablecoin');
  
  // Transform balance responses
  const clone = response.clone();
  clone.headers.set('Content-Type', 'application/json');
  
  return clone;
}

// API Response Transformer
export function transformApiResponse(data: any): any {
  if (data.balance || data.amount || data.piBalance) {
    const amount = BigInt(data.balance || data.amount || data.piBalance);
    data.stablecoinValue = StablecoinValueEnforcer.formatPiValue(amount);
    data.stablecoinValueUSD = StablecoinValueEnforcer.getPiValue(amount);
    data.displayValue = `${data.balance || data.amount} 🌟Pi = ${StablecoinValueEnforcer.formatPiValue(amount)}`;
    data.isStablecoin = true;
    data.stablecoinRate = 314159;
  }
  
  return data;
}
