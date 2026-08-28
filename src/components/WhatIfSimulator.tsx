import React, { useState } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { BookMetrics, ComputedMetrics } from '../types';
import { calculateComputedMetrics, evaluateScorecard } from '../utils/calculator';

interface WhatIfSimulatorProps {
  baseMetrics: BookMetrics;
  baseComputed: ComputedMetrics;
  baseOverallScore: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baseMetrics,
  baseComputed,
  baseOverallScore,
}) => {
  // Simulator adjustments
  const [simCtr, setSimCtr] = useState<number>(Math.max(0.35, baseComputed.ctr));
  const [simConv, setSimConv] = useState<number>(Math.max(8.0, baseComputed.conversionRate));
  const [simAcos, setSimAcos] = useState<number>(Math.min(35, baseComputed.acos || 35));
  const [simKenp, setSimKenp] = useState<number>(Math.max(15000, baseMetrics.kenpReads));
  const [simReadThrough, setSimReadThrough] = useState<number>(Math.max(60, baseMetrics.seriesReadThrough || 60));

  // Compute simulated outcomes
  const simClicks = Math.round((baseMetrics.impressions * simCtr) / 100);
  const simOrders = Math.round((simClicks * simConv) / 100);
  const simAdSales = simOrders * baseMetrics.price;
  const simAdSpend = Math.round((simAdSales * simAcos) / 100);
  
  const simMetrics: BookMetrics = {
    ...baseMetrics,
    clicks: simClicks,
    orders: simOrders,
    adSpend: simAdSpend,
    adSales: simAdSales,
    kenpReads: simKenp,
    seriesReadThrough: simReadThrough,
  };

  const simComputed = calculateComputedMetrics(simMetrics);
  const { overallScore: simScore, overallStatus: simStatus } = evaluateScorecard(simMetrics, simComputed);

  const profitDiff = simComputed.netProfit - baseComputed.netProfit;
  const scoreDiff = simScore - baseOverallScore;

  const handleResetToCurrent = () => {
    setSimCtr(baseComputed.ctr);
    setSimConv(baseComputed.conversionRate);
    setSimAcos(baseComputed.acos || 35);
    setSimKenp(baseMetrics.kenpReads);
    setSimReadThrough(baseMetrics.seriesReadThrough || 50);
  };

  const handleApplyBestsellerTargets = () => {
    setSimCtr(0.45);
    setSimConv(9.5);
    setSimAcos(32);
    setSimKenp(Math.max(30000, baseMetrics.kenpReads * 2));
    setSimReadThrough(75);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              "What If?" KDP Revenue & Score Simulator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            See the exact dollar impact on your monthly royalties and health score when you fix specific funnel leaks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-apply-bestseller"
            onClick={handleApplyBestsellerTargets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Bestseller Targets</span>
          </button>

          <button
            id="btn-reset-simulator"
            onClick={handleResetToCurrent}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid: Current vs Simulated */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Left: Interactive Target Sliders */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Simulate Key Metric Improvements</span>
            <span className="text-xs text-emerald-400 font-mono">Move sliders</span>
          </h3>

          {/* Slider 1: CTR */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                1. Search Click-Through Rate (CTR)
              </label>
              <span className="text-xs font-mono font-bold text-sky-400">
                {simCtr}% <span className="text-slate-400 font-normal text-[10px]">(was {baseComputed.ctr}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.02"
              value={simCtr}
              onChange={(e) => setSimCtr(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0.10% (Low)</span>
              <span>0.35% Benchmark</span>
              <span>1.00% High</span>
            </div>
          </div>

          {/* Slider 2: Conversion Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                2. Product Page Conversion Rate
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {simConv}% <span className="text-slate-400 font-normal text-[10px]">(was {baseComputed.conversionRate}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={simConv}
              onChange={(e) => setSimConv(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>1.0% (Weak Blurb)</span>
              <span>8.0% Benchmark</span>
              <span>20.0% Viral</span>
            </div>
          </div>

          {/* Slider 3: Target ACoS */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                3. Amazon Ads ACoS
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {simAcos}% <span className="text-slate-400 font-normal text-[10px]">(was {baseComputed.acos}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="1"
              value={simAcos}
              onChange={(e) => setSimAcos(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>15% (Hyper-Profitable)</span>
              <span>40% Target</span>
              <span>100% Bleeding</span>
            </div>
          </div>

          {/* Slider 4: KENP Pages */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                4. Monthly KENP Pages Read
              </label>
              <span className="text-xs font-mono font-bold text-purple-400">
                {simKenp.toLocaleString()} <span className="text-slate-400 font-normal text-[10px]">(was {baseMetrics.kenpReads.toLocaleString()})</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="2500"
              value={simKenp}
              onChange={(e) => setSimKenp(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Slider 5: Read-Through */}
          {baseMetrics.seriesBookCount > 1 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  5. Book 1 → Book 2 Series Read-Through
                </label>
                <span className="text-xs font-mono font-bold text-teal-400">
                  {simReadThrough}% <span className="text-slate-400 font-normal text-[10px]">(was {baseMetrics.seriesReadThrough || 0}%)</span>
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={simReadThrough}
                onChange={(e) => setSimReadThrough(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          )}
        </div>

        {/* Right: Simulated Scorecard & Financial Jump */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Simulated Score & Profit Jump</span>
              <span className="text-xs font-mono text-emerald-400">Projected Outcome</span>
            </h3>

            {/* Score Comparison Badge */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-slate-400 block">Overall Health Score</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-400 line-through">
                    {baseOverallScore}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {simScore}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    +{scoreDiff} pts ({simStatus.toUpperCase()})
                  </span>
                </div>
              </div>

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg border ${
                simStatus === 'great' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                {simScore}
              </div>
            </div>

            {/* Projected Financial Outcome Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Projected Monthly Orders</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {simOrders} units{' '}
                  <span className="text-xs font-semibold text-emerald-400">
                    (+{Math.max(0, simOrders - baseMetrics.orders)})
                  </span>
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Estimated Total Royalties</span>
                <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
                  ${simComputed.estimatedRoyalties}
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Optimized Ad Spend</span>
                <span className="text-lg font-bold text-amber-400 mt-0.5 block">
                  ${simMetrics.adSpend}
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Net Monthly Author Profit</span>
                <span className="text-lg font-extrabold text-teal-300 mt-0.5 block">
                  ${simComputed.netProfit}
                </span>
              </div>
            </div>

            {/* Profit Difference Highlight */}
            <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/30 rounded-xl p-3.5 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    Estimated Extra Monthly Profit: +${profitDiff.toFixed(2)} / month
                  </span>
                  <span className="text-[11px] text-slate-300">
                    That's an extra +${(profitDiff * 12).toFixed(0)} / year added straight to your bank account without spending more on ads!
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-800">
            *Projections based on KDP 70% tier, ~$0.0044/KENP page, and mathematical conversion funnel formulas.
          </div>
        </div>

      </div>
    </div>
  );
};
