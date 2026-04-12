'use client';

import { useState } from 'react';
import { PurityTracker } from '@super-pi/purity-tracker';
import { PiCoin } from '@super-pi/dual-value';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReceiveProps {
  onReceive: (coin: PiCoin) => void;
}

export function PiWalletReceive({ onReceive }: ReceiveProps) {
  const [incomingCoin, setIncomingCoin] = useState<PiCoin | null>(null);
  const [scanResult, setScanResult] = useState<string>('');

  const handleReceive = async (coinData: any) => {
    const coin: PiCoin = { ...coinData };
    
    // 🚫 INSTANT PURITY SCAN
    const purityStatus = await PurityTracker.getInstance().analyzeCoin(coin);
    
    setIncomingCoin(coin);
    setScanResult(purityStatus);

    // AUTO-REJECT EXTERNAL COINS
    if (purityStatus !== '🌟PURE') {
      alert(`🚫 REJECTED: ${purityStatus}\nOnly 🌟 Pure Pi ($314,159) accepted!`);
      return;
    }

    // ✅ ACCEPT PURE PI ONLY
    const certifiedCoin = PurityTracker.getInstance().certifyPureCoin(coin, 'P2P_PURE');
    onReceive(certifiedCoin);
    
    alert('✅ 🌟 Pure Pi received! Value: $314,159');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Receive Pi Coin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-center">
          <div className="text-2xl font-bold mb-2">🌟 PURE PI ONLY</div>
          <div className="text-sm opacity-90">$314,159 Stablecoin</div>
        </div>

        {incomingCoin && (
          <div className={`p-4 rounded-lg ${
            scanResult === '🌟PURE' 
              ? 'bg-emerald-100 border-emerald-400' 
              : 'bg-red-100 border-red-400'
          }`}>
            <Badge variant={scanResult === '🌟PURE' ? 'default' : 'destructive'}>
              {scanResult}
            </Badge>
            <div className="mt-2 font-mono text-sm">
              Amount: {incomingCoin.amount.toString()} 🌟Pi
            </div>
            {scanResult !== '🌟PURE' && (
              <Alert className="mt-2">
                <AlertDescription>
                  🚫 External coin detected and REJECTED automatically!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Button 
          onClick={() => handleReceive({ /* mock incoming coin */ })}
          className="w-full"
          size="lg"
        >
          📱 Scan QR / Receive Pi
        </Button>
      </CardContent>
    </Card>
  );
}
