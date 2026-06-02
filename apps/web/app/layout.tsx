import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Super Pi — $SPI Sovereign Protocol',
  description:
    'Super Pi: production-grade sovereign L2 blockchain. $SPI Hard Stablecoin (1 $SPI = 1 USD). ' +
    'Shariah-compliant. Pi Coin banned forever. Governed by NexusLaw v6.1.',
  keywords: ['SPI', 'stablecoin', 'halal', 'DeFi', 'Super Pi', 'blockchain'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
