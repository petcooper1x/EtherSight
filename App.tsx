import React, { useState } from 'react';
import { Wallet, Search, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { WalletData, Transaction, AppState, AiAnalysis } from './types';
import { fetchWalletBalance, fetchTransactions, formatEther } from './services/etherscanService';
import { analyzeWalletActivity } from './services/geminiService';
import { TransactionRow } from './components/TransactionRow';
import { AnalysisCard } from './components/AnalysisCard';

// Default Etherscan API Key for demo purposes if user doesn't have one.
// In a real app, do not commit this or rely on a public shared key as it hits rate limits.
// We encourage the user to provide their own.
const DEMO_KEY = ''; // Intentionally left blank to force user input or use public limit if possible, but for UX we will require input if this is empty.

export default function App() {
  const [address, setAddress] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address) return;

    const keyToUse = apiKey || DEMO_KEY;
    if (!keyToUse) {
      setError("Please provide an Etherscan API Key to fetch data.");
      return;
    }

    setState(AppState.LOADING);
    setError(null);
    setAnalysis(null);
    setWalletData(null);

    try {
      const balance = await fetchWalletBalance(address, keyToUse);
      const transactions = await fetchTransactions(address, keyToUse);
      
      setWalletData({
        address,
        balance,
        transactions
      });
      setState(AppState.LOADED);

      // Trigger AI Analysis
      setAnalyzing(true);
      const aiResult = await analyzeWalletActivity(address, transactions);
      setAnalysis(aiResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setState(AppState.ERROR);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-4xl mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Wallet size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">EtherSight AI</h1>
            <p className="text-sm text-slate-400 hidden md:block">Blockchain Intelligence & Analytics</p>
          </div>
        </div>
        
        <a 
          href="https://etherscan.io/apis" 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          Get API Key <ExternalLink size={12} />
        </a>
      </header>

      <main className="w-full max-w-4xl space-y-6">
        
        {/* Search Bar */}
        <form onSubmit={handleFetch} className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 font-mono text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Etherscan API Key</label>
              <input
                type="password"
                placeholder="Your API Key"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 font-mono text-sm"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={state === AppState.LOADING || !address}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {state === AppState.LOADING ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Search size={20} />
                )}
                <span className="md:hidden">Track</span>
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </form>

        {/* Dashboard */}
        {state === AppState.LOADED && walletData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            
            {/* Balance Card */}
            <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full min-h-[200px]">
              <div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Total Balance</h3>
                <div className="text-3xl font-bold text-white tracking-tight break-all">
                  {formatEther(walletData.balance)} <span className="text-indigo-400 text-lg">ETH</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Address</span>
                  <span className="text-indigo-400 cursor-pointer hover:underline">Copy</span>
                </div>
                <div className="font-mono text-xs text-slate-400 break-all bg-slate-950/50 p-2 rounded border border-slate-800">
                  {walletData.address}
                </div>
              </div>
            </div>

            {/* AI Analysis Card */}
            <div className="md:col-span-2">
              <AnalysisCard analysis={analysis} loading={analyzing} />
            </div>

            {/* Transaction List */}
            <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
                <h3 className="font-semibold text-slate-200">Recent Activity</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700">
                  Last 20 Tx
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {walletData.transactions.length > 0 ? (
                  walletData.transactions.map((tx) => (
                    <TransactionRow key={tx.hash} tx={tx} walletAddress={walletData.address} />
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    No recent transactions found.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
        
        {state === AppState.IDLE && (
          <div className="text-center py-20 opacity-50">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Search className="text-slate-500" size={32} />
            </div>
            <p className="text-slate-400 text-lg">Enter a wallet address and API key to begin tracking.</p>
          </div>
        )}
      </main>
    </div>
  );
}
