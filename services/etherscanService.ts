import { Transaction } from '../types';

const BASE_URL = 'https://api.etherscan.io/api';

export const fetchWalletBalance = async (address: string, apiKey: string): Promise<string> => {
  const url = `${BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === '0') {
    throw new Error(data.message || 'Failed to fetch balance');
  }
  
  return data.result;
};

export const fetchTransactions = async (address: string, apiKey: string): Promise<Transaction[]> => {
  // Fetching last 20 transactions for brevity and AI analysis context
  const url = `${BASE_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === '0' && data.message !== 'No transactions found') {
    throw new Error(data.message || 'Failed to fetch transactions');
  }

  return data.result || [];
};

export const formatEther = (wei: string): string => {
  if (!wei) return '0';
  const ether = parseFloat(wei) / 1e18;
  return ether.toFixed(4);
};
