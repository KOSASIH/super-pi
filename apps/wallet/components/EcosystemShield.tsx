'use client';

import { useState, useEffect } from 'react';
import { EcosystemGuard } from '@super-pi/ecosystem-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, DollarSign } from 'lucide-react';

interface CoinScanResult {
  status: string;
  valueUSD: number;
  accepted: boolean;
  reason?: string;
}

export function EcosystemShield() {
  const [scanResult, setScanResult] = useState<CoinScanResult | null>(null);
  const [protectionActive, setProtectionActive] = useState(true);

  const scanIncomingCoin = async (mockCoin: any) => {
    const result = await EcosystemGuard.getInstance().processIncomingCoin(mockCoin);
    setScanResult(result);

    if (!result.accepted) {
      // 🎵 Play rejection sound
      new Audio('/sounds/taint-rejected.mp3').play();
    }
  };

  useEffect(() => {
    // Subscribe to global taint alerts
    const sub = (msg: string) => {
      console.log('🚨 GLOBAL TAINT ALERT:', msg);
    };
    
    // @ts-ignore
    window.ecosystemSub = sub;
  }, []);

  return (
    <Card className="border-2 border-blue-500 shadow-2xl max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <CardTitle className="text-2xl">Ecosystem Shield 🛡️</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            ACTIVE
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-8">
        {/* Protection Status */}
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="font-bold text-lg">PERMANENT TAINT PROTECTION</div>
              <div className="text-sm text-emerald-700">
                Only 🌟 Pure Pi ($314,159) accepted
              </div>
            </div>
          </div>
          <Badge className="text-lg px-4 py-2 bg-emerald-600 hover:bg-emerald-700">
            $314,159 FIXED
          </Badge>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className={`p-6 rounded-2xl border-4 ${
            scanResult.accepted 
              ? 'border-emerald-400 bg-emerald-50' 
              : 'border-red-400 bg-red-50 animate-pulse'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Badge 
                variant={scanResult.accepted ? "default" : "destructive"}
                className="text-xl px-4 py-2"
              >
                {scanResult.status}
              </Badge>
              <DollarSign className="w-6 h-6" />
            </div>
            
            <div className="text-3xl font-bold mb-2">
              ${scanResult.valueUSD.toLocaleString()}
            </div>
            
            {!scanResult.accepted && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription className="font-bold">
                  🚫 {scanResult.reason || 'Rejected by Ecosystem Shield'}
                  <br />
                  <span className="text-sm font-normal">
                    Coin permanently tainted - Market price only
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => scanIncomingCoin({ /* pure coin */ })}
            className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-emerald-700 transition-all"
          >
            ✅ Test Pure Pi ($314,159)
          </button>
          <button
            onClick={() => scanIncomingCoin({ /* tainted coin */ })}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            🚫 Test Tainted Pi
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
