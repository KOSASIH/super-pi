'use client';

import { useState, useTransition } from 'react';
import { SuperPiCalculator } from '@/lib/pi-calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [pi, setPi]         = useState('');
  const [digits, setDigits] = useState(10);
  const [isCalculating, startTransition] = useTransition();

  const calculatePi = () => {
    startTransition(async () => {
      const result = await SuperPiCalculator.calculate(digits);
      setPi(result);
    });
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-spi-gold mb-2">Super π</h1>
        <p className="text-gray-400 text-lg mt-2">
          $SPI Hard Stablecoin · NexusLaw v6.1 · Pi Coin Banned ∀t
        </p>
      </div>

      <Card className="max-w-2xl mx-auto bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-spi-gold">
            π Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-gray-300 w-24">Digits:</label>
            <input
              type="number"
              min={1}
              max={15}
              value={digits}
              onChange={(e) => setDigits(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white w-24"
            />
          </div>
          <Button
            onClick={calculatePi}
            disabled={isCalculating}
            className="w-full bg-spi-gold text-black font-bold hover:bg-yellow-400"
          >
            {isCalculating ? 'Calculating…' : 'Calculate π'}
          </Button>
          {pi && (
            <div className="bg-gray-800 rounded p-4 font-mono text-spi-green break-all">
              π = {pi}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
        {[
          { label: '$SPI Peg',    value: '1.0000 USD', sub: 'Overcollateralized · RWA-backed' },
          { label: 'NexusLaw',    value: 'v6.1',       sub: 'Art.27-40 · Shariah-compliant' },
          { label: 'Pi Coin',     value: 'BANNED ∀t',  sub: 'NexusLaw Art.40 · Hard-blocked' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-700 rounded-lg p-5 text-center">
            <div className="text-gray-400 text-sm">{stat.label}</div>
            <div className="text-spi-gold text-2xl font-bold mt-1">{stat.value}</div>
            <div className="text-gray-500 text-xs mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <footer className="text-center mt-16 text-gray-600 text-sm">
        Governed by{' '}
        <a href="https://github.com/KOSASIH/super-pi" className="underline hover:text-spi-gold">
          NexusLaw v6.1
        </a>{' '}
        · 1 $SPI = 1 USD · Pi Coin banned ∀t ·{' '}
        <span className="text-green-600">Halal DeFi</span>
      </footer>
    </main>
  );
}
