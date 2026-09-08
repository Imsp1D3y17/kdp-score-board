import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw,
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Calculator,
  TrendingUp
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
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Scenario Modeling & Impact Simulator
            </h3>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Model the financial impact on monthly royalties and score by fixing funnel bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-apply-bestseller"
            onClick={handleApplyBestsellerTargets}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Apply Benchmark Targets</span>
          </button>

          <button
            id="btn-reset-simulator"
            onClick={handleResetToCurrent}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Target Sliders */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Conversion Sliders
            </h4>
            <span className="text-[11px] text-neutral-400 font-mono">Interactive</span>
          </div>

          {/* Slider 1: CTR */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-neutral-700">
                1. Search Click-Through Rate (CTR)
              </label>
              <span className="text-xs font-mono font-bold text-neutral-900">
                {simCtr}% <span className="text-neutral-400 font-normal text-[10px]">(baseline: {baseComputed.ctr}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.02"
              value={simCtr}
              onChange={(e) => setSimCtr(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>0.10% (Blends in)</span>
              <span className="text-emerald-600 font-medium">0.35%+ (Target)</span>
              <span>1.00%</span>
            </div>
          </div>

          {/* Slider 2: Conversion Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-neutral-700">
                2. Sales Conversion Rate (CVR)
              </label>
              <span className="text-xs font-mono font-bold text-neutral-900">
                {simConv}% <span className="text-neutral-400 font-normal text-[10px]">(baseline: {baseComputed.conversionRate}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="18.0"
              step="0.5"
              value={simConv}
              onChange={(e) => setSimConv(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>2.0%</span>
              <span className="text-emerald-600 font-medium">8.0%+ (Target)</span>
              <span>18.0%</span>
            </div>
          </div>

          {/* Slider 3: Target ACOS */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-neutral-700">
                3. Amazon Ads Target ACOS
              </label>
              <span className="text-xs font-mono font-bold text-neutral-900">
                {simAcos}% <span className="text-neutral-400 font-normal text-[10px]">(baseline: {baseComputed.acos || 0}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="95"
              step="1"
              value={simAcos}
              onChange={(e) => setSimAcos(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span className="text-emerald-600 font-medium">&lt;35% (Profitable)</span>
              <span>55% (Break-even)</span>
              <span>95%</span>
            </div>
          </div>

          {/* Slider 4: KENP Reads */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-neutral-700">
                4. Monthly KENP Page Reads
              </label>
              <span className="text-xs font-mono font-bold text-neutral-900">
                {simKenp.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="2500"
              value={simKenp}
              onChange={(e) => setSimKenp(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>0</span>
              <span>25,000</span>
              <span>100,000+</span>
            </div>
          </div>
        </div>

        {/* Right: Simulated Outcomes */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Simulated Financial Outcome
              </h4>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Impact Model</span>
              </span>
            </div>

            {/* Projected Net Profit Hero */}
            <div className="my-6">
              <span className="text-xs text-neutral-400">Projected Monthly Net Profit</span>
              <div className="text-4xl font-extrabold text-neutral-900 font-mono tracking-tight mt-1">
                ${simComputed.netProfit.toFixed(2)}
              </div>
              <div className="text-xs mt-1.5 flex items-center gap-1.5">
                <span className={`font-bold font-mono ${profitDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {profitDiff >= 0 ? `+$${profitDiff.toFixed(2)}` : `-$${Math.abs(profitDiff).toFixed(2)}`}
                </span>
                <span className="text-neutral-400">vs. current baseline (${baseComputed.netProfit.toFixed(2)})</span>
              </div>
            </div>

            {/* Score Comparison */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-neutral-100">
              <div>
                <span className="text-[11px] text-neutral-400">Diagnostic Score</span>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                  {simScore} <span className="text-xs text-neutral-400 font-normal">/100</span>
                </div>
                <div className={`text-[11px] font-semibold ${scoreDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {scoreDiff >= 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400">Projected Orders</span>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                  {simOrders} <span className="text-xs text-neutral-400 font-normal">units</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  from {simClicks} clicks
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 text-xs text-neutral-400">
            Fixing click-through and sales conversion rates compounds ad efficiency and organic BSR rankings.
          </div>
        </div>

      </div>

    </div>
  );
};
