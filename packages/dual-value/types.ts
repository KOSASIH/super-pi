export interface PiCoin {
  amount: bigint;
  purity: PurityStatus;
  origin: OriginType;
  taintScore: number; // 0.0 (Pure) - 1.0 (Fully Tainted)
  history: CoinHistory[];
  metadata: CoinMetadata;
}

export enum PurityStatus {
  PURE_STAR = '🌟PURE',      // $314,159 Stablecoin
  EXTERNAL_CLEAN = 'EXTERNAL_CLEAN',
  TAINTED_EXCHANGE = 'TAINTED_EXCHANGE',
  FULLY_TAINTED = 'FULLY_TAINTED'
}

export enum OriginType {
  MINING = 'MINING',
  CONTRIBUTION = 'CONTRIBUTION',
  P2P_PURE = 'P2P_PURE',
  EXCHANGE = 'EXCHANGE',
  UNKNOWN = 'UNKNOWN'
}

export interface CoinHistory {
  txHash: string;
  from: string;
  to: string;
  amount: bigint;
  timestamp: number;
  purityAtTx: PurityStatus;
  exchangeDetected: boolean;
}

export interface CoinMetadata {
  createdAt: number;
  minerAddress?: string;
  contributionId?: string;
  starCertified: boolean;
}
