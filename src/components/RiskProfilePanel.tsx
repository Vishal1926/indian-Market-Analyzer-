import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { StockResearchRecord } from '../types/stock';

interface RiskProfilePanelProps {
  stock: StockResearchRecord;
}

export const RiskProfilePanel: React.FC<RiskProfilePanelProps> = ({ stock }) => {
  const getRiskTextStyle = (rating: StockResearchRecord['riskRating']) => {
    switch (rating) {
      case 'Low Risk':
        return 'text-emerald-700';
      case 'Moderate Risk':
        return 'text-amber-700';
      case 'Elevated Risk':
      case 'High Risk':
        return 'text-rose-700';
      default:
        return 'text-slate-700';
    }
  };

  const getBarColor = (score: number) => {
    if (score < 35) return 'bg-emerald-600';
    if (score < 60) return 'bg-amber-500';
    return 'bg-rose-600';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="text-xs font-medium text-slate-500">
            <span>Multi-Factor Risk Engine</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>NSE Volatility, Beta &amp; Balance Sheet Stress</span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Quantitative Stock Risk Profile
          </h3>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            {stock.overallRiskScore < 38 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : stock.overallRiskScore < 62 ? (
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span className={`text-sm font-semibold ${getRiskTextStyle(stock.riskRating)}`}>
              {stock.riskRating}
            </span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
              {stock.overallRiskScore}/100
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lower score indicates stronger margin of safety
          </p>
        </div>
      </div>

      {/* 4 Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100">
        <div>
          <div className="text-xs text-slate-500">Beta (vs NIFTY 50)</div>
          <div className="mt-1 text-base font-semibold font-mono tabular-nums text-slate-900">
            {stock.beta.toFixed(2)}x
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {stock.beta < 1.0 ? 'Defensive sensitivity' : 'High-beta cyclical'}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Annualized Volatility</div>
          <div className="mt-1 text-base font-semibold font-mono tabular-nums text-slate-900">
            {stock.annualizedVolatility.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            252-day standard deviation
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">1Y Max Drawdown</div>
          <div className="mt-1 text-base font-semibold font-mono tabular-nums text-rose-700">
            {stock.maxDrawdown1Y > 0 ? `-${stock.maxDrawdown1Y.toFixed(1)}%` : `${stock.maxDrawdown1Y.toFixed(1)}%`}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Peak-to-trough decline
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Debt / Equity</div>
          <div className="mt-1 text-base font-semibold font-mono tabular-nums text-slate-900">
            {stock.debtToEquity.toFixed(2)}x
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {stock.debtToEquity === 0
              ? 'Zero net debt status'
              : stock.debtToEquity < 0.6
              ? 'Conservative leverage'
              : 'Leveraged / Financial book'}
          </div>
        </div>
      </div>

      {/* 4 Risk Factors Breakdown */}
      <div className="mt-5 space-y-4">
        {stock.riskFactors.map((rf) => (
          <div key={rf.dimension} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-800">{rf.dimension}</span>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span
                  className={
                    rf.level === 'Low'
                      ? 'text-emerald-700 font-medium'
                      : rf.level === 'Moderate'
                      ? 'text-amber-700 font-medium'
                      : 'text-rose-700 font-medium'
                  }
                >
                  {rf.level} Risk
                </span>
                <span className="text-slate-300" aria-hidden="true">/</span>
                <span className="text-slate-700 font-semibold">{rf.score}/100</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(rf.score)}`}
                style={{ width: `${Math.min(100, Math.max(6, rf.score))}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{rf.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
