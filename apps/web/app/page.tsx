'use client';

import { useState, useTransition } from 'react';
import { SuperPiCalculator } from '@super-pi/pi-lib';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [pi, setPi] = useState('');
  const [digits, setDigits] = useState(1000);
  const [isCalculating, startTransition] = useTransition();

  const calculatePi = () => {
    startTransition(async () => {
      const result = await SuperPiCalculator.calculate(digits);
      setPi(result);
    });
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Super π Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <input
              type="number"
              value={digits}
              onChange={(e) => setDigits(Number(e.target.value))}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter digits (1-1M)"
              min={1}
              max={1000000}
            />
            <Button 
              onClick={calculatePi}
              disabled={isCalculating}
              className="px-8"
            >
              {isCalculating ? 'Calculating...' : `Calculate π to ${digits} digits`}
            </Button>
          </div>
          
          {pi && (
            <div className="bg-gray-900 text-white p-6 rounded-xl font-mono text-sm overflow-auto max-h-96">
              <pre>{pi}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
