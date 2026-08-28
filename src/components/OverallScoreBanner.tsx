import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointerClick, 
  ShoppingCart, 
  BookOpen
} from 'lucide-react';
import { BookMetrics, ComputedMetrics, ScoreStatus } from '../types';

interface OverallScoreBannerProps {
  metrics: BookMetrics;
  computed: ComputedMetrics;
  overallScore: number;
  overallStatus: ScoreStatus;
  verdictTitle?: string;
  onNavigateToActions: () => void;
}

export const OverallScoreBanner: React.FC<OverallScoreBannerProps> = ({
  metrics,
  computed,
  overallScore,
  overallStatus,
  verdictTitle,
  onNavigateToActions,
}) => {
  const getStatusDetails = () => {
    switch (overallStatus) {
      case 'great':
        return {
          label: 'GREAT / OPTIMIZED',
          subLabel: 'Bestseller Trajectory - Ready to Scale Ads & Releases',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          gaugeColor: 'text-emerald-400',
          ringColor: 'stroke-emerald-500',
          bgGradient: 'from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-800/40',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        };
      case 'warning':
        return {
          label: 'AVERAGE / WARNING',
          subLabel: 'Friction in Funnel - Moderate Sales Leakage',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gaugeColor: 'text-amber-400',
          ringColor: 'stroke-amber-500',
          bgGradient: 'from-amber-950/30 via-slate-900 to-slate-900 border-amber-800/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case 'critical':
      default:
        return {
          label: 'CRITICAL / NEEDS ATTENTION',
          subLabel: 'Major Funnel Leak - Wasting Ad Spend & Losing Organic Sales',
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
          gaugeColor: 'text-red-400',
          ringColor: 'stroke-red-500',
          bgGradient: 'from-red-950/40 via-slate-900 to-slate-900 border-red-800/40',
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
        };
    }
  };

  const details = getStatusDetails();
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-br ${details.bgGradient} shadow-xl relative overflow-hidden transition-all duration-300`}>
      
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left: Score Gauge & Health Verdict */}
        <div className="flex items-center gap-5">
          {/* Radial Circular Score Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 sm:w-28 sm:h-28 -rotate-90 transform">
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className={`${details.ringColor} transition-all duration-700 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${details.gaugeColor}`}>
                {overallScore}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                / 100
              </span>
            </div>
          </div>

          {/* Verdict Text & Description */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${details.badgeBg}`}>
                {details.icon}
                {details.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {metrics.title ? `"${metrics.title}"` : 'Your Book'} ({metrics.genre || 'KDP'})
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {verdictTitle || (overallStatus === 'great' ? 'High-Performance Publishing Engine' : overallStatus === 'warning' ? 'Moderate Optimization Opportunities' : 'Immediate Funnel Fix Required')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {details.subLabel}
            </p>
          </div>
        </div>

        {/* Right: Color Legend & Quick Diagnostic CTA */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 border-slate-800/80 pt-4 lg:pt-0">
          {/* Color Meaning Guide */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-300">
            <span className="text-slate-400 font-semibold mr-1">Score Scale:</span>
            <span className="inline-flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              0-49 Red (Bad)
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              50-74 Yellow
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              75-100 Green (Great)
            </span>
          </div>

          <button
            id="btn-view-missing-leaks"
            onClick={onNavigateToActions}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition shadow-sm cursor-pointer"
          >
            <span>See What You're Missing</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Bottom Funnel Strip */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {/* Metric 1: Impressions */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Eye className="w-3 h-3 text-sky-400" />
            <span>Impressions</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {metrics.impressions.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Search Views</div>
        </div>

        {/* Metric 2: Clicks & CTR */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <MousePointerClick className="w-3 h-3 text-indigo-400" />
            <span>Clicks (CTR)</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {metrics.clicks.toLocaleString()}{' '}
            <span className={`text-xs font-semibold ${computed.ctr >= 0.35 ? 'text-emerald-400' : computed.ctr >= 0.20 ? 'text-amber-400' : 'text-red-400'}`}>
              ({computed.ctr}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-400">Target ≥ 0.35%</div>
        </div>

        {/* Metric 3: Orders & Conversion */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShoppingCart className="w-3 h-3 text-emerald-400" />
            <span>Sales (Conv. %)</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {metrics.orders}{' '}
            <span className={`text-xs font-semibold ${computed.conversionRate >= 7.5 ? 'text-emerald-400' : computed.conversionRate >= 4.0 ? 'text-amber-400' : 'text-red-400'}`}>
              ({computed.conversionRate}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-400">Target ≥ 8.0%</div>
        </div>

        {/* Metric 4: KENP Reads */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <BookOpen className="w-3 h-3 text-purple-400" />
            <span>KENP Reads</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {metrics.kenpReads.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">~${computed.kenpRoyalties} KU Pay</div>
        </div>

        {/* Metric 5: Total Royalties */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Est. Royalties</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-1">
            ${computed.estimatedRoyalties}
          </div>
          <div className="text-[10px] text-slate-400">Direct + KU</div>
        </div>

        {/* Metric 6: Ad Spend & ACoS */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>Ad Spend (ACoS)</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            ${metrics.adSpend}{' '}
            <span className={`text-xs font-semibold ${computed.acos <= 40 ? 'text-emerald-400' : computed.acos <= 65 ? 'text-amber-400' : 'text-red-400'}`}>
              ({computed.acos}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-400">Breakeven ~{computed.breakevenAcos}%</div>
        </div>

        {/* Metric 7: Net Profit */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <DollarSign className="w-3 h-3 text-teal-400" />
            <span>Net Royalty Profit</span>
          </div>
          <div className={`text-sm font-bold mt-1 ${computed.netProfit >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
            ${computed.netProfit}
          </div>
          <div className="text-[10px] text-slate-400">Royalties - Ads</div>
        </div>
      </div>
    </div>
  );
};
