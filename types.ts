export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

export interface WalletData {
  address: string;
  balance: string; // In Wei
  transactions: Transaction[];
}

export interface AiAnalysis {
  summary: string;
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  keyActivities: string[];
}

export enum AppState {
  IDLE,
  LOADING,
  LOADED,
  ERROR
}
