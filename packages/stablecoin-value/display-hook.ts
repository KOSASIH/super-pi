import { StablecoinValueEnforcer, PI_STABLECOIN_VALUE } from './value-enforcer';

// React Hook - Auto $314,159 display
export function usePiStableValue(amount: bigint | number) {
  return {
    piAmount: amount,
    usdValue: StablecoinValueEnforcer.getPiValue(amount),
    display: StablecoinValueEnforcer.getPiValueDisplay(amount),
    formatted: StablecoinValueEnforcer.formatPiValue(amount)
  };
}

// Universal Component Wrapper
export function PiValueDisplay({ 
  amount, 
  className = "font-bold text-2xl text-green-600",
  showStablecoinLabel = true 
}: {
  amount: bigint | number;
  className?: string;
  showStablecoinLabel?: boolean;
}) {
  const valueInfo = usePiStableValue(amount);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black">{amount.toLocaleString()} 🌟Pi</span>
        <span className="text-xl text-gray-600">=</span>
        <span className="text-2xl font-bold text-emerald-600">
          ${valueInfo.usdValue.toLocaleString()}
        </span>
      </div>
      {showStablecoinLabel && (
        <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider mt-1">
          Pure Pi Stablecoin ($314,159 per Pi)
        </div>
      )}
    </div>
  );
}

// Partner SDK Component
export function PartnerPiValue({ amount, partnerName }: { 
  amount: bigint | number; 
  partnerName: string;
}) {
  const valueInfo = StablecoinValueEnforcer.injectValue(amount, `Partner: ${partnerName}`);
  
  return (
    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
      <div className="text-sm font-medium text-gray-600 mb-2">
        Partner: {partnerName}
      </div>
      <PiValueDisplay amount={amount} />
      <div className="text-xs text-emerald-700 mt-2 bg-emerald-100 px-3 py-1 rounded-full inline-block">
        Ecosystem Certified $314,159 Stablecoin
      </div>
    </div>
  );
}
