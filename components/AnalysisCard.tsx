import React from 'react';
import { AiAnalysis } from '../types';
import { Sparkles, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

interface AnalysisCardProps {
  analysis: AiAnalysis | null;
  loading: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="h-20 bg-slate-700 rounded mb-4"></div>
        <div className="h-8 bg-slate-700 rounded w-full"></div>
      </div>
    );
  }

  if (!analysis) return null;

  const RiskIcon = analysis.riskAssessment === 'HIGH' ? ShieldAlert : ShieldCheck;
  const riskColor = analysis.riskAssessment === 'HIGH' ? 'text-red-400' : analysis.riskAssessment === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400';
  const borderColor = analysis.riskAssessment === 'HIGH' ? 'border-red-500/30' : 'border-indigo-500/30';

  return (
    <div className={`bg-slate-900 border ${borderColor} rounded-xl p-6 relative overflow-hidden group`}>
      {/* Background Gradient Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Sparkles size={20} />
          <h3 className="font-semibold text-lg">AI Insights</h3>
        </div>
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 ${riskColor} text-sm font-medium`}>
          <RiskIcon size={14} />
          <span>{analysis.riskAssessment} RISK</span>
        </div>
      </div>

      <p className="text-slate-300 mb-6 relative z-10 leading-relaxed">
        {analysis.summary}
      </p>

      <div className="relative z-10">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Behaviors</h4>
        <div className="flex flex-wrap gap-2">
          {analysis.keyActivities.map((activity, idx) => (
            <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm border border-slate-700 flex items-center space-x-2">
              <Activity size={12} className="text-indigo-400" />
              <span>{activity}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
