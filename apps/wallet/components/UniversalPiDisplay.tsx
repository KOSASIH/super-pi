'use client';

import { PiValueDisplay, PartnerPiValue, usePiStableValue } from '@/packages/stablecoin-value';

export default function WalletDashboard() {
  const balance = 1000000n; // 1M Pi
  const { usdValue, display } = usePiStableValue(balance);

  return (
    <div className="space-y-8">
      {/* Main Balance */}
      <div className="text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 mb-4">
          Your Pure Pi Balance
        </h1>
        <PiValueDisplay amount={balance} className="text-6xl" />
      </div>

      {/* Partner Ecosystem */}
      <div className="grid md:grid-cols-3 gap-6">
        <PartnerPiValue amount={50000n} partnerName="Pi Mall" />
        <PartnerPiValue amount={250000n} partnerName="Pi DeFi" />
        <PartnerPiValue amount={100000n} partnerName="Pi Games" />
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        {[1000n, 5000n, 25000n].map((amt, i) => (
          <div key={i} className="flex justify-between p-4 bg-white border rounded-xl shadow-sm">
            <span>Received Pi Reward</span>
            <PiValueDisplay amount={amt} showStablecoinLabel={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
