import React from 'react';
import { Transaction } from '../types';
import { formatEther } from '../services/etherscanService';
import { ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransactionRowProps {
  tx: Transaction;
  walletAddress: string;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ tx, walletAddress }) => {
  const isOutgoing = tx.from.toLowerCase() === walletAddress.toLowerCase();
  const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString();
  const time = new Date(parseInt(tx.timeStamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isError = tx.isError === '1';

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${isError ? 'bg-red-500/20 text-red-500' : isOutgoing ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
          {isError ? <AlertCircle size={20} /> : isOutgoing ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-200">{isOutgoing ? 'Sent' : 'Received'}</span>
            {isError && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20">Failed</span>}
          </div>
          <div className="text-sm text-slate-500">{date} at {time}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={`font-mono font-medium ${isOutgoing ? 'text-slate-200' : 'text-green-400'}`}>
          {isOutgoing ? '-' : '+'}{formatEther(tx.value)} ETH
        </div>
        <div className="text-xs text-slate-500 font-mono truncate w-32 md:w-48" title={isOutgoing ? tx.to : tx.from}>
          {isOutgoing ? `To: ${tx.to}` : `From: ${tx.from}`}
        </div>
      </div>
    </div>
  );
};
