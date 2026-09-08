import React from 'react';
import { 
  ArrowRight, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  Sparkles,
  Barcode,
  Share2
} from 'lucide-react';
import { BookMetrics, ComputedMetrics, ScoreStatus } from '../types';

interface FitnessVitalsHeroProps {
  metrics: BookMetrics;
  computed: ComputedMetrics;
  overallScore: number;
  overallStatus: ScoreStatus;
  onNavigateToActions: () => void;
  onOpenSaaSPaywall: () => void;
  onOpenPasteModal: () => void;
  onOpenMetricDrawer?: () => void;
  onOpenBookScanner?: () => void;
  onOpenShareModal?: () => void;
}

export const FitnessVitalsHero: React.FC<FitnessVitalsHeroProps> = ({
  metrics,
  computed,
  overallScore,
  overallStatus,
  onNavigateToActions,
  onOpenSaaSPaywall,
  onOpenPasteModal,
  onOpenMetricDrawer,
  onOpenBookScanner,
  onOpenShareModal,
}) => {
  // Clamped radial progress
  const scoreProgress = Math.min(100, Math.max(0, overallScore));
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreProgress / 100) * circumference;

  // Primary status colors
  const statusTheme = 
    overallStatus === 'great' 
      ? { text: 'text-emerald-600', stroke: 'stroke-emerald-500', dot: 'bg-emerald-500', label: 'Optimal Performance' }
      : overallStatus === 'warning'
      ? { text: 'text-amber-600', stroke: 'stroke-amber-500', dot: 'bg-amber-500', label: 'Moderate Bottleneck' }
      : { text: 'text-rose-600', stroke: 'stroke-rose-500', dot: 'bg-rose-500', label: 'Critical Action Required' };

  // Identify highest priority bottleneck in clear language
  const getTopLeakInsight = () => {
    if (metrics.isLowContent && !metrics.hasAplusContent) {
      return {
        title: "Missing A+ Content on Low-Content Book",
        desc: "Amazon suppresses the 'Look Inside' feature for low-content paperbacks. Without A+ Content showing interior layout, prompts, and line grids, buyers bounce immediately.",
        fix: "Publish an A+ Content comparison module with 3 sample interior layout mockups.",
        severity: "critical" as const
      };
    }
    if (metrics.isLowContent && computed.cpc > (computed.maxBreakevenCpc || 0.25) && metrics.clicks > 10) {
      return {
        title: "Ad CPC Exceeds Low-Content Breakeven",
        desc: `Paying $${computed.cpc}/click on a $${computed.royaltyPerUnit || 1.99} net royalty book causes negative cash flow. Max breakeven CPC is $${computed.maxBreakevenCpc || 0.25}.`,
        fix: `Lower Amazon Ads default keyword bids to ≤ $${computed.maxBreakevenCpc || 0.25}.`,
        severity: "critical" as const
      };
    }
    if (computed.conversionRate < 4.0 && computed.ctr >= 0.25) {
      return {
        title: "High Click-Through, Low Sales Conversion",
        desc: `Cover is generating interest (${computed.ctr}% CTR), but product page drops shoppers (${computed.conversionRate}% conversion vs 8%+ target).`,
        fix: "Optimize the blurb's 3-line hook and Look Inside preview sample.",
        severity: "critical" as const
      };
    }
    if (computed.acos > 65) {
      return {
        title: "High ACoS on Amazon Advertising",
        desc: `Ad campaigns consume $${metrics.adSpend} with an ACoS of ${computed.acos}% (${metrics.adSales > 0 ? `$${metrics.adSales} ad sales` : 'no recorded ad sales'}).`,
        fix: "Reduce default keyword bids by 25% and negate non-converting search terms.",
        severity: "critical" as const
      };
    }
    if (computed.ctr < 0.20 && metrics.impressions > 1500) {
      return {
        title: "Low Thumbnail Click-Through Rate",
        desc: `With ${metrics.impressions.toLocaleString()} impressions and only ${metrics.clicks} clicks (${computed.ctr}% CTR), search visibility is wasted.`,
        fix: "Test higher-contrast typography on book cover and verify sub-genre typography tropes.",
        severity: "warning" as const
      };
    }
    return {
      title: "Profitable Publishing Funnel",
      desc: `Your book is generating an estimated $${computed.estimatedRoyalties.toFixed(0)} gross royalties ($${computed.netProfit.toFixed(0)} net profit) with sound conversion ratios.`,
      fix: "Scale ad budget on high-performing keywords and consider launching a box set.",
      severity: "great" as const
    };
  };

  const topLeak = getTopLeakInsight();

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 sm:p-7 space-y-6">
      
      {/* Top Identity & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${statusTheme.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${statusTheme.text}`}>
              {statusTheme.label}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {metrics.title || 'Your Active Book'}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {metrics.genre || 'General Fiction / Non-Fiction'} · Last 30 Days Telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenBookScanner && (
            <button
              onClick={onOpenBookScanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-900 bg-[#EAE8E3] hover:bg-[#DFDDD7] border border-neutral-300 transition cursor-pointer shadow-2xs"
            >
              <Barcode className="w-3.5 h-3.5 text-neutral-800" />
              <span>Scan Book Title</span>
            </button>
          )}

          {onOpenMetricDrawer && (
            <button
              onClick={onOpenMetricDrawer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              <span>Adjust Numbers</span>
            </button>
          )}

          <button
            onClick={onOpenPasteModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>Import Data</span>
          </button>

          {onOpenShareModal && (
            <button
              id="btn-share-scorecard-hero"
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-300 transition cursor-pointer shadow-2xs"
              title="Share this book scorecard link"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Share Score</span>
            </button>
          )}

          <button
            onClick={onOpenSaaSPaywall}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Automate Daily Sync</span>
          </button>
        </div>
      </div>

      {/* Hero Visual: Radial Progress + Key Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Overall Radial Score */}
        <div className="lg:col-span-4 flex items-center justify-center p-2">
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-neutral-100"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className={`${statusTheme.stroke} transition-all duration-700 ease-out`}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${statusTheme.text}`}>
                {overallScore}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mt-0.5">
                Funnel Score
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Primary Funnel Health Insights */}
        <div className="lg:col-span-8 space-y-4">
          <div className={`p-4 rounded-xl border ${
            topLeak.severity === 'critical'
              ? 'bg-rose-50/60 border-rose-100 text-neutral-800'
              : topLeak.severity === 'warning'
              ? 'bg-amber-50/60 border-amber-100 text-neutral-800'
              : 'bg-emerald-50/60 border-emerald-100 text-neutral-800'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {topLeak.severity === 'critical' ? (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              ) : topLeak.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                {topLeak.title}
              </h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-2">
              {topLeak.desc}
            </p>
            <div className="text-xs font-medium text-neutral-900 flex items-center justify-between gap-2 pt-2 border-t border-neutral-200/60">
              <span className="text-neutral-500">Immediate Prescription:</span>
              <span className="font-semibold">{topLeak.fix}</span>
            </div>
          </div>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                Click Rate
              </span>
              <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                {computed.ctr}%
              </div>
              <span className="text-[10px] text-neutral-400">Target ≥ 0.35%</span>
            </div>

            <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                Conversion
              </span>
              <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                {computed.conversionRate}%
              </div>
              <span className="text-[10px] text-neutral-400">Target ≥ 8.0%</span>
            </div>

            <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                Ad ACoS
              </span>
              <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                {computed.acos > 0 ? `${computed.acos}%` : '—'}
              </div>
              <span className="text-[10px] text-neutral-400">Target &lt; 35%</span>
            </div>

            <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                Monthly Net
              </span>
              <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                ${computed.netProfit.toFixed(0)}
              </div>
              <span className="text-[10px] text-neutral-400">${computed.estimatedRoyalties.toFixed(0)} gross</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
