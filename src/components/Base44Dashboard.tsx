import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  Maximize2, 
  ChevronDown, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  Sliders, 
  Plus, 
  X, 
  ArrowUpRight,
  HelpCircle,
  BookOpen,
  Info,
  Barcode,
  Search,
  Share2
} from 'lucide-react';
import { BookMetrics, ComputedMetrics, ScorecardPreset } from '../types';
import { PRESET_PROFILES } from '../data/presets';
import { trackEvent } from '../utils/analytics';

interface Base44DashboardProps {
  metrics: BookMetrics;
  computed: ComputedMetrics;
  currentPresetId: string;
  onSelectPreset: (preset: ScorecardPreset) => void;
  onOpenSaaSPaywall: () => void;
  onOpenPasteModal: () => void;
  onOpenBookScanner: () => void;
  onOpenAdvisor: (prefilledTopic?: string) => void;
  onOpenMetricDrawer: () => void;
  onNavigateToTab: (tab: 'dashboard' | 'scorecard' | 'actions' | 'simulator' | 'ai-advisor') => void;
  onOpenShareModal?: () => void;
}

export const Base44Dashboard: React.FC<Base44DashboardProps> = ({
  metrics,
  computed,
  currentPresetId,
  onSelectPreset,
  onOpenSaaSPaywall,
  onOpenPasteModal,
  onOpenBookScanner,
  onOpenAdvisor,
  onOpenMetricDrawer,
  onNavigateToTab,
  onOpenShareModal,
}) => {
  // Pill filters from screenshots
  const [listingAuditFilter, setListingAuditFilter] = useState<'all' | 'issues'>('all');
  const [scorecardFilter, setScorecardFilter] = useState<'all' | 'leaks'>('all');
  const [topMode, setTopMode] = useState<'dashboard' | 'preview'>('dashboard');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Selected Leak Pill for Inspection
  const [inspectedLeak, setInspectedLeak] = useState<{
    bookTitle: string;
    metricLabel: string;
    value: string;
    status: 'great' | 'warning' | 'critical';
    issue: string;
    fix: string;
  } | null>(null);

  // Daily approximations based on monthly numbers
  const dailyMetrics = useMemo(() => {
    // Today
    const todayRevenue = metrics.orders > 0 
      ? Math.max(0, (computed.estimatedRoyalties / 30) * 1.05) 
      : 0;
    const todaySpend = metrics.adSpend > 0 
      ? Math.max(0, (metrics.adSpend / 30) * 1.02) 
      : 0;
    const todayNet = todayRevenue - todaySpend;
    const todayAcos = todayRevenue > 0 && todaySpend > 0 ? (todaySpend / todayRevenue) * 100 : 0;
    const todayRoi = todaySpend > 0 ? ((todayRevenue - todaySpend) / todaySpend) * 100 : 0;

    // Yesterday
    const yestRevenue = metrics.orders > 0 
      ? Math.max(0, (computed.estimatedRoyalties / 30) * 0.94) 
      : 0;
    const yestSpend = metrics.adSpend > 0 
      ? Math.max(0, (metrics.adSpend / 30) * 0.98) 
      : 0;
    const yestNet = yestRevenue - yestSpend;
    const yestAcos = yestRevenue > 0 && yestSpend > 0 ? (yestSpend / yestRevenue) * 100 : 0;
    const yestRoi = yestSpend > 0 ? ((yestRevenue - yestSpend) / yestSpend) * 100 : 0;

    // Month To Date
    const mtdRevenue = computed.estimatedRoyalties;
    const mtdSpend = metrics.adSpend;
    const mtdNet = computed.netProfit;
    const mtdAcos = computed.acos;
    const mtdRoi = metrics.adSpend > 0 ? ((computed.estimatedRoyalties - metrics.adSpend) / metrics.adSpend) * 100 : 0;

    return {
      today: {
        net: todayNet,
        gross: todayRevenue,
        spend: todaySpend,
        acos: todayAcos > 0 ? `${todayAcos.toFixed(0)}%` : '—',
        roi: todayRoi !== 0 ? `${todayRoi > 0 ? '+' : ''}${todayRoi.toFixed(0)}%` : '—',
      },
      yesterday: {
        net: yestNet,
        gross: yestRevenue,
        spend: yestSpend,
        acos: yestAcos > 0 ? `${yestAcos.toFixed(0)}%` : '—',
        roi: yestRoi !== 0 ? `${yestRoi > 0 ? '+' : ''}${yestRoi.toFixed(0)}%` : '—',
      },
      mtd: {
        net: mtdNet,
        gross: mtdRevenue,
        spend: mtdSpend,
        acos: mtdAcos > 0 ? `${mtdAcos.toFixed(0)}%` : '—',
        roi: mtdRoi !== 0 ? `${mtdRoi > 0 ? '+' : ''}${mtdRoi.toFixed(0)}%` : '—',
      },
    };
  }, [metrics, computed]);

  // 14-day history sketch for the SVG chart
  const chartData = useMemo(() => {
    const days = [
      { label: 'Aug 24', rev: 0.15, spend: 0.35 },
      { label: 'Aug 25', rev: 0.20, spend: 0.40 },
      { label: 'Aug 26', rev: 0.25, spend: 0.38 },
      { label: 'Aug 27', rev: 0.40, spend: 0.55 },
      { label: 'Aug 28', rev: 0.60, spend: 0.50 },
      { label: 'Aug 29', rev: 0.85, spend: 0.65 },
      { label: 'Aug 30', rev: 1.10, spend: 0.80 },
      { label: 'Aug 31', rev: 1.40, spend: 0.90 },
      { label: 'Sep 1', rev: 1.80, spend: 1.10 },
      { label: 'Sep 2', rev: 2.20, spend: 1.25 },
      { label: 'Sep 3', rev: 2.60, spend: 1.40 },
      { label: 'Sep 4', rev: 3.10, spend: 1.30 },
      { label: 'Sep 5', rev: 3.50, spend: 1.35 },
    ];

    // Scale dynamically to author numbers
    const multiplier = Math.max(1, (computed.estimatedRoyalties / 30) / 3.5);
    return days.map(d => ({
      ...d,
      revScaled: Number((d.rev * multiplier).toFixed(2)),
      spendScaled: Number((d.spend * multiplier).toFixed(2)),
    }));
  }, [computed.estimatedRoyalties]);

  // Listing audit checks
  const auditChecks = useMemo(() => {
    return [
      {
        id: 'keywords',
        name: 'Keywords & 7 Backend Slots',
        status: metrics.impressions > 20000 ? 'good' : 'warning',
        badge: metrics.impressions > 20000 ? 'Indexed' : 'Low Visibility',
        desc: metrics.impressions > 20000 
          ? 'Indexed across primary category search strings' 
          : 'Low impression velocity. Search terms missing buyer keywords.',
      },
      {
        id: 'cover',
        name: 'Cover Contrast & Thumbnail',
        status: computed.ctr >= 0.35 ? 'good' : computed.ctr >= 0.20 ? 'warning' : 'issue',
        badge: computed.ctr >= 0.35 ? 'Strong CTR' : computed.ctr >= 0.20 ? 'Average' : 'Low CTR',
        desc: computed.ctr >= 0.35 
          ? `High thumbnail click rate (${computed.ctr}%) in search results` 
          : `Below-benchmark CTR (${computed.ctr}%). Title typography or art style blends into search grid.`,
      },
      {
        id: 'blurb',
        name: 'Product Page & 3-Line Hook',
        status: computed.conversionRate >= 7.5 ? 'good' : computed.conversionRate >= 4.0 ? 'warning' : 'issue',
        badge: computed.conversionRate >= 7.5 ? 'Converting' : 'Leak',
        desc: computed.conversionRate >= 7.5 
          ? `Converting ${computed.conversionRate}% of clicks into buyers` 
          : `Conversion rate is ${computed.conversionRate}% (target ≥8%). Blurb hook or preview sample drops shoppers.`,
      },
      {
        id: 'reviews',
        name: 'Social Proof & Rating',
        status: metrics.starRating >= 4.3 && metrics.reviewCount >= 15 ? 'good' : 'warning',
        badge: `${metrics.starRating}★ (${metrics.reviewCount} reviews)`,
        desc: metrics.starRating >= 4.3 
          ? 'Strong reader sentiment reinforces conversions' 
          : 'Rating deficit creates buyer hesitation at checkout',
      },
    ];
  }, [metrics, computed]);

  // Current books in catalog / presets
  const catalogBooks = useMemo(() => {
    return PRESET_PROFILES.map((p) => {
      const isSelected = p.id === currentPresetId;
      const m = isSelected ? metrics : p.metrics;
      const imp = Math.max(1, m.impressions);
      const ctr = ((m.clicks / imp) * 100);
      const cvr = m.clicks > 0 ? ((m.orders / m.clicks) * 100) : 0;
      const roy = (m.orders * m.price * (m.royaltyRate || 0.7)) + (m.kenpReads * 0.0044);
      const acos = m.adSales > 0 ? ((m.adSpend / m.adSales) * 100) : (m.adSpend > 0 ? 120 : 0);
      const hasLeak = ctr < 0.25 || cvr < 5.0 || acos > 60;

      return {
        id: p.id,
        title: m.title,
        genre: m.genre,
        isSelected,
        rawPreset: p,
        ctr: {
          val: `${ctr.toFixed(2)}%`,
          status: ctr >= 0.35 ? ('great' as const) : ctr >= 0.22 ? ('warning' as const) : ('critical' as const),
          issue: ctr < 0.22 ? 'Shoppers scroll past cover thumbnail in Amazon search.' : 'CTR is mediocre.',
          fix: 'Test higher-contrast typography and clear genre color tropes.',
        },
        cvr: {
          val: `${cvr.toFixed(1)}%`,
          status: cvr >= 8.0 ? ('great' as const) : cvr >= 4.5 ? ('warning' as const) : ('critical' as const),
          issue: cvr < 4.5 ? 'Shoppers click into the book but abandon before buying.' : 'Conversion can improve.',
          fix: 'Revise the top 3-line hook and punch up Look Inside opening.',
        },
        acos: {
          val: `${acos.toFixed(0)}%`,
          status: acos <= 35 && acos > 0 ? ('great' as const) : acos <= 60 ? ('warning' as const) : ('critical' as const),
          issue: acos > 60 ? 'Ad spend is eating royalties without lifting rank.' : 'ACoS is healthy.',
          fix: 'Lower max bids by 25% and negate high-spend non-converting keywords.',
        },
        royalties: {
          val: `$${roy.toFixed(0)}/mo`,
          status: roy >= 200 ? ('great' as const) : ('warning' as const),
        },
        hasLeak,
      };
    });
  }, [currentPresetId, metrics]);

  const filteredBooks = useMemo(() => {
    if (scorecardFilter === 'leaks') {
      return catalogBooks.filter(b => b.hasLeak);
    }
    return catalogBooks;
  }, [catalogBooks, scorecardFilter]);

  const filteredAudit = useMemo(() => {
    if (listingAuditFilter === 'issues') {
      return auditChecks.filter(c => c.status !== 'good');
    }
    return auditChecks;
  }, [auditChecks, listingAuditFilter]);

  const getPillColor = (status: 'great' | 'warning' | 'critical') => {
    switch (status) {
      case 'great':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'critical':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Top App Bar - Replicating Screenshots: Back, [Dashboard|Preview], ... , Diamond, Rocket */}
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateToTab('dashboard')}
            className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 shadow-2xs hover:bg-neutral-50 transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Segmented Pill [ Dashboard | Preview ] */}
          <div className="bg-[#EAE8E3] p-1 rounded-full flex items-center text-xs font-medium">
            <button
              onClick={() => setTopMode('dashboard')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                topMode === 'dashboard' 
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTopMode('preview')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                topMode === 'preview' 
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-2">
          {/* Preset Selector Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-3 py-1.5 text-xs text-neutral-700 shadow-2xs">
            <span className="text-neutral-400">Book:</span>
            <select
              value={currentPresetId}
              onChange={(e) => {
                const p = PRESET_PROFILES.find((x) => x.id === e.target.value);
                if (p) onSelectPreset(p);
              }}
              className="bg-transparent font-medium text-neutral-900 focus:outline-none cursor-pointer pr-1"
            >
              {PRESET_PROFILES.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Share Scorecard Link Button */}
          {onOpenShareModal && (
            <button
              id="btn-share-scorecard-base44"
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-300 transition cursor-pointer shadow-2xs"
              title="Share this book scorecard link"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Share Link</span>
            </button>
          )}

          {/* SaaS Pro Diamond Upgrade Icon (Stripe checkout) */}
          <a
            href="https://buy.stripe.com/4gM14hbTKbYCfWz1N76EU01"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('trial_started', { source: 'base44_diamond' });
            }}
            className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
            title="30-Day Free Trial ($0 Due Today)"
          >
            <span className="text-sm">💎</span>
          </a>

          {/* Rocket Action Icon */}
          <button
            onClick={onOpenSaaSPaywall}
            className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer shadow-2xs"
            title="Automate Daily Telemetry Sync"
          >
            <span className="text-xs">🚀</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Header: Address Bar Style [ ⟳  Dashboard  v   ⛶ ] */}
      <div className="relative">
        <div className="bg-white border border-neutral-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const p = PRESET_PROFILES.find((x) => x.id === currentPresetId) || PRESET_PROFILES[0];
                onSelectPreset(p);
              }}
              className="text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
              title="Refresh Telemetry"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-neutral-200" />
            
            {/* View Selector Dropdown */}
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-700 cursor-pointer"
            >
              <span>Dashboard</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMetricDrawer}
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              title="Adjust metrics"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Numbers</span>
            </button>
            <div className="h-4 w-px bg-neutral-200 hidden sm:block" />
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isViewDropdownOpen && (
          <div className="absolute top-12 left-0 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-30 space-y-1">
            <button
              onClick={() => {
                onNavigateToTab('dashboard');
                setIsViewDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-900 bg-neutral-100 flex items-center justify-between"
            >
              <span>Daily Profit Dashboard</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              onClick={() => {
                onNavigateToTab('scorecard');
                setIsViewDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 flex items-center justify-between"
            >
              <span>6-Pillar Funnel Diagnostics</span>
            </button>
            <button
              onClick={() => {
                onNavigateToTab('actions');
                setIsViewDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 flex items-center justify-between"
            >
              <span>Prioritized Action Matrix</span>
            </button>
            <button
              onClick={() => {
                onNavigateToTab('simulator');
                setIsViewDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 flex items-center justify-between"
            >
              <span>What-If Revenue Simulator</span>
            </button>
            <button
              onClick={() => {
                onNavigateToTab('ai-advisor');
                setIsViewDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 flex items-center justify-between"
            >
              <span>AI Strategist Assistant</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Eyebrow, Title & Subtitle from Screenshot 3 */}
      <div className="pt-2">
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold tracking-wider text-[#A3702C] uppercase mb-1">
          <Sparkles className="w-3 h-3 text-[#A3702C]" />
          <span>DAILY PROFIT DASHBOARD</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
          KDP Score Card
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Saturday, September 5, 2026 · the true bottom line on your KDP day
        </p>

        {/* Buttons Row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            id="btn-hero-scan-book"
            onClick={onOpenBookScanner}
            className="px-4 py-1.5 rounded-full border border-neutral-900 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Barcode className="w-3.5 h-3.5 text-amber-300" />
            <span>Scan or Score Book Title</span>
          </button>

          <button
            onClick={onOpenPasteModal}
            className="px-4 py-1.5 rounded-full border border-neutral-300 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 shadow-2xs transition cursor-pointer"
          >
            Paste KDP Report
          </button>

          <button
            onClick={onOpenMetricDrawer}
            className="px-4 py-1.5 rounded-full border border-neutral-300 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 shadow-2xs transition flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-neutral-500" />
            <span>Manual Adjustments</span>
          </button>

          <button
            onClick={onOpenSaaSPaywall}
            className="px-4 py-1.5 rounded-full border border-neutral-300 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 shadow-2xs transition cursor-pointer"
          >
            Access requests
          </button>

          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="px-3 py-1.5 rounded-full text-xs text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
            title="Toggle empty state view"
          >
            {showEmptyState ? 'Show Active Data' : 'Preview Empty State'}
          </button>
        </div>

        {/* Quick Book Scanner & Scoring Bar */}
        <div className="mt-4 bg-white border border-neutral-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">
                  Book Title & ISBN Scanner
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active: {metrics.title}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Scan by Amazon title, ASIN (B0...), or ISBN to instantly calculate your Green / Yellow / Red scorecard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              id="btn-quick-scan-trigger"
              onClick={onOpenBookScanner}
              className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-amber-300" />
              <span>Scan or Enter Book Title</span>
            </button>
            <button
              onClick={onOpenMetricDrawer}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="Manually adjust metric sliders"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-600" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Profit Summary Cards: TODAY, YESTERDAY, MONTH TO DATE (Screenshots 2 & 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* TODAY Card - Green Top Border */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden relative border-t-4 border-t-emerald-500 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                TODAY
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Net Profit</span>
              </span>
            </div>

            {/* Big bold number */}
            <div className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-6">
              ${dailyMetrics.today.net >= 0 ? dailyMetrics.today.net.toFixed(2) : `0.00`}
            </div>

            {/* 2x2 Clean Sub-Metrics */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 border-t border-neutral-100">
              <div>
                <div className="text-[11px] text-neutral-400">Gross Revenue</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  ${dailyMetrics.today.gross.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Ad Spend</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  ${dailyMetrics.today.spend.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">ACOS</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {dailyMetrics.today.acos}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">ROI</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {dailyMetrics.today.roi}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* YESTERDAY Card - Neutral Top Border */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden relative border-t-4 border-t-neutral-300 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                YESTERDAY
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Net Profit</span>
              </span>
            </div>

            <div className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-6">
              ${dailyMetrics.yesterday.net >= 0 ? dailyMetrics.yesterday.net.toFixed(2) : `0.00`}
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 border-t border-neutral-100">
              <div>
                <div className="text-[11px] text-neutral-400">Gross Revenue</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  ${dailyMetrics.yesterday.gross.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Ad Spend</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  ${dailyMetrics.yesterday.spend.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">ACOS</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {dailyMetrics.yesterday.acos}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">ROI</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {dailyMetrics.yesterday.roi}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MONTH TO DATE Card - Gold / Amber Top Border (Screenshot 2) */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden relative border-t-4 border-t-amber-500 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                MONTH TO DATE
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Net Profit</span>
              </span>
            </div>

            <div className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-6">
              ${dailyMetrics.mtd.net.toFixed(2)}
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 border-t border-neutral-100">
              <div>
                <div className="text-[11px] text-neutral-400">Gross Revenue</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  ${dailyMetrics.mtd.gross.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Ad Spend</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  ${dailyMetrics.mtd.spend.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">ACOS</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {dailyMetrics.mtd.acos}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">ROI</div>
                <div className="text-xs font-bold text-neutral-900 mt-0.5">
                  {dailyMetrics.mtd.roi}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Revenue vs Ad Spend Chart Card (Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              Revenue vs Ad Spend
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Last 14 days · sketched daily view
            </p>
          </div>

          {/* Chart Legend from Screenshot 2 */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-neutral-600 font-medium">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-neutral-600 font-medium">Ad Spend</span>
            </div>
          </div>
        </div>

        {/* Clean Line Chart View with Dashed Grid */}
        <div className="mt-4 pt-2">
          <div className="relative h-44 w-full">
            
            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">$4</span>
                <div className="flex-1 border-b border-dashed border-neutral-200" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">$3</span>
                <div className="flex-1 border-b border-dashed border-neutral-200" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">$2</span>
                <div className="flex-1 border-b border-dashed border-neutral-200" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">$1</span>
                <div className="flex-1 border-b border-dashed border-neutral-200" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">$0</span>
                <div className="flex-1 border-b border-neutral-300" />
              </div>
            </div>

            {/* SVG Wave lines */}
            <svg 
              className="absolute inset-0 h-full w-full pl-8 pr-2 overflow-visible" 
              viewBox="0 0 500 150" 
              preserveAspectRatio="none"
            >
              {/* Revenue Curve (Emerald) */}
              <path
                d="M 0,145 Q 70,142 120,138 T 200,125 T 280,95 T 360,60 T 430,35 T 500,18"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              
              {/* Ad Spend Curve (Rose) */}
              <path
                d="M 0,147 Q 60,145 130,140 T 210,130 T 290,115 T 370,102 T 440,92 T 500,85"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
            </svg>
          </div>

          {/* Date Labels below chart matching Screenshot 2 */}
          <div className="pl-8 pr-2 pt-3 flex justify-between text-[11px] text-neutral-400">
            <span>Aug 24</span>
            <span>Aug 27</span>
            <span>Aug 30</span>
            <span>Sep 2</span>
            <span>Sep 5</span>
          </div>
        </div>
      </div>

      {/* 6. Listing Audit Card (Screenshot 1) */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              Listing Audit
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Discoverability & conversion checks — keywords, categories, cover, title, blurb, reviews
            </p>
          </div>

          {/* Toggle pill: [ All books | Issues only ] */}
          <div className="bg-[#EAE8E3] p-1 rounded-full flex items-center text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setListingAuditFilter('all')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                listingAuditFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All checks
            </button>
            <button
              onClick={() => setListingAuditFilter('issues')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                listingAuditFilter === 'issues'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Issues only
            </button>
          </div>
        </div>

        {/* Audit Check Items */}
        <div className="divide-y divide-neutral-100">
          {filteredAudit.map((check) => (
            <div key={check.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {check.status === 'good' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : check.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    {check.name}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {check.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  check.status === 'good'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : check.status === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {check.badge}
                </span>

                <button
                  onClick={() => onOpenAdvisor(`How do I optimize ${check.name} for my book "${metrics.title}"?`)}
                  className="text-xs text-neutral-400 hover:text-neutral-900 transition flex items-center gap-0.5 cursor-pointer"
                  title="Ask AI Fix"
                >
                  <span>Fix</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Book-by-book Score Card (Screenshot 1) */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              Book-by-book Score Card
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Click any colored pill to see the leak and how to fix it
            </p>
          </div>

          {/* Controls: Scan/Add Book + Toggle pill [ All books | Leaks only ] */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenBookScanner}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Scan or add a new book title"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Scan / Add Book</span>
            </button>

            <div className="bg-[#EAE8E3] p-1 rounded-full flex items-center text-xs font-medium">
              <button
                onClick={() => setScorecardFilter('all')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  scorecardFilter === 'all'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All books
              </button>
              <button
                onClick={() => setScorecardFilter('leaks')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  scorecardFilter === 'leaks'
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Leaks only
              </button>
            </div>
          </div>
        </div>

        {/* Empty state or Book Items */}
        {showEmptyState ? (
          /* Empty state exactly matching Screenshot 1 */
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-8 sm:p-12 text-center my-2 bg-neutral-50/50">
            <p className="text-sm text-neutral-600 max-w-sm mx-auto">
              No books yet. Add a book and daily metrics to see your Score Card.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={onOpenBookScanner}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition cursor-pointer shadow-xs"
              >
                <Barcode className="w-3.5 h-3.5 text-amber-300" />
                <span>Scan or Manually Score Your Book</span>
              </button>
              <button
                onClick={() => setShowEmptyState(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Load Preset Titles</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => (
              <div 
                key={book.id}
                className={`rounded-xl border p-4 sm:p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  book.isSelected 
                    ? 'border-neutral-900 bg-neutral-50/40 shadow-xs' 
                    : 'border-neutral-200/80 hover:border-neutral-300 bg-white'
                }`}
              >
                {/* Book Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                    book.isSelected ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">
                        {book.title}
                      </h4>
                      {book.isSelected && (
                        <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                      <span>{book.genre}</span>
                      <span>•</span>
                      <span className="font-medium text-neutral-700">{book.royalties.val}</span>
                    </div>
                  </div>
                </div>

                {/* Colored Diagnostic Pills (Interactive) */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* CTR Pill */}
                  <button
                    onClick={() => setInspectedLeak({
                      bookTitle: book.title,
                      metricLabel: 'Click-Through Rate (CTR)',
                      value: book.ctr.val,
                      status: book.ctr.status,
                      issue: book.ctr.issue,
                      fix: book.ctr.fix,
                    })}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${getPillColor(book.ctr.status)}`}
                    title="Click to see leak & fix"
                  >
                    CTR: {book.ctr.val}
                  </button>

                  {/* Conversion Pill */}
                  <button
                    onClick={() => setInspectedLeak({
                      bookTitle: book.title,
                      metricLabel: 'Sales Conversion Rate',
                      value: book.cvr.val,
                      status: book.cvr.status,
                      issue: book.cvr.issue,
                      fix: book.cvr.fix,
                    })}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${getPillColor(book.cvr.status)}`}
                    title="Click to see leak & fix"
                  >
                    Conv: {book.cvr.val}
                  </button>

                  {/* ACoS Pill */}
                  <button
                    onClick={() => setInspectedLeak({
                      bookTitle: book.title,
                      metricLabel: 'Amazon Ads ACoS',
                      value: book.acos.val,
                      status: book.acos.status,
                      issue: book.acos.issue,
                      fix: book.acos.fix,
                    })}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${getPillColor(book.acos.status)}`}
                    title="Click to see leak & fix"
                  >
                    ACoS: {book.acos.val}
                  </button>

                  {/* Switch to this book button */}
                  {!book.isSelected && (
                    <button
                      onClick={() => onSelectPreset(book.rawPreset)}
                      className="text-xs text-neutral-500 hover:text-neutral-900 underline ml-2 cursor-pointer"
                    >
                      Audit This Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. Interactive Leak Inspection Modal when a colored pill is clicked */}
      {inspectedLeak && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  inspectedLeak.status === 'great' 
                    ? 'bg-emerald-500' 
                    : inspectedLeak.status === 'warning' 
                    ? 'bg-amber-500' 
                    : 'bg-rose-500'
                }`} />
                <h4 className="text-sm font-bold text-neutral-900">
                  {inspectedLeak.metricLabel}
                </h4>
              </div>
              <button
                onClick={() => setInspectedLeak(null)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Book:</span>
                <span className="font-semibold text-neutral-900">{inspectedLeak.bookTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Current Value:</span>
                <span className={`font-mono font-bold text-sm ${
                  inspectedLeak.status === 'great' 
                    ? 'text-emerald-600' 
                    : inspectedLeak.status === 'warning' 
                    ? 'text-amber-600' 
                    : 'text-rose-600'
                }`}>
                  {inspectedLeak.value}
                </span>
              </div>

              <div className="pt-2">
                <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-1">
                  Why It's Leaking
                </div>
                <p className="text-xs text-neutral-700 bg-rose-50/60 p-3 rounded-lg border border-rose-100">
                  {inspectedLeak.issue}
                </p>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                  How To Fix It
                </div>
                <p className="text-xs text-neutral-700 bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                  {inspectedLeak.fix}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectedLeak(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const topic = `How to fix ${inspectedLeak.metricLabel} (${inspectedLeak.value}) on "${inspectedLeak.bookTitle}"`;
                  setInspectedLeak(null);
                  onOpenAdvisor(topic);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI to Fix</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Sleek Black Floating Button: [ Chat to Edit ] from Screenshots 1, 2, 3 */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => onOpenAdvisor()}
          className="bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-neutral-800 hover:scale-105 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Chat to Edit</span>
        </button>
      </div>

    </div>
  );
};
