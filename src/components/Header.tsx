import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  Download, 
  RotateCcw,
  BarChart2,
  ListOrdered,
  Calculator,
  Compass,
  LayoutDashboard,
  Barcode,
  Search,
  Share2
} from 'lucide-react';
import { PRESET_PROFILES } from '../data/presets';
import { ScorecardPreset, ScoreStatus } from '../types';
import { trackEvent } from '../utils/analytics';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (preset: ScorecardPreset) => void;
  onOpenPasteModal: () => void;
  onOpenBookScanner: () => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
  onOpenAnalyticsModal: () => void;
  onResetToDefault: () => void;
  onOpenSaaSPaywall: () => void;
  activeTab: 'landing' | 'dashboard' | 'scorecard' | 'simulator' | 'actions' | 'ai-advisor';
  setActiveTab: (tab: 'landing' | 'dashboard' | 'scorecard' | 'simulator' | 'actions' | 'ai-advisor') => void;
  overallScore: number;
  overallStatus: ScoreStatus;
  isProUser?: boolean;
  onOpenPurchaseSuccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenPasteModal,
  onOpenBookScanner,
  onOpenExportModal,
  onOpenShareModal,
  onOpenAnalyticsModal,
  onResetToDefault,
  onOpenSaaSPaywall,
  activeTab,
  setActiveTab,
  overallScore,
  overallStatus,
  isProUser,
  onOpenPurchaseSuccess,
}) => {
  const statusColor = 
    overallStatus === 'great' ? 'text-emerald-600' :
    overallStatus === 'warning' ? 'text-amber-600' : 'text-rose-600';

  return (
    <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="py-3 flex items-center justify-between gap-3">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
              title="Return to Dashboard"
            >
              <div className="h-9 w-9 rounded-xl overflow-hidden ring-1 ring-neutral-200/80 shadow-xs flex-shrink-0 group-hover:ring-neutral-400 transition">
                <img 
                  src="/logo.jpg" 
                  alt="KDP Score Card Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition">
                    KDP Score Card
                  </h1>
                </div>
              </div>
            </button>
          </div>

          {/* Action Tools & Preset Selector */}
          <div className="flex items-center gap-2">
            
            {/* Preset Profile Dropdown */}
            <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 border border-neutral-200/80 rounded-full px-3 py-1 text-xs">
              <span className="text-neutral-400 text-[11px]">
                Preset:
              </span>
              <select
                id="preset-selector"
                value={currentPresetId}
                onChange={(e) => {
                  const p = PRESET_PROFILES.find((x) => x.id === e.target.value);
                  if (p) onSelectPreset(p);
                }}
                className="bg-transparent text-xs font-semibold text-neutral-800 focus:outline-none cursor-pointer pr-1"
              >
                {PRESET_PROFILES.map((preset) => (
                  <option key={preset.id} value={preset.id} className="bg-white text-neutral-800">
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scan or Score Book Title Button */}
            <button
              id="btn-scan-score-book-header"
              onClick={onOpenBookScanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-900 bg-[#EAE8E3] hover:bg-[#DFDDD7] border border-neutral-300 transition cursor-pointer shadow-2xs"
              title="Scan book title, ASIN, ISBN, or manually score numbers"
            >
              <Barcode className="w-3.5 h-3.5 text-neutral-800" />
              <span>Scan / Score Book</span>
            </button>

            {/* Paste Report Button */}
            <button
              id="btn-paste-report"
              onClick={onOpenPasteModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/90 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Import</span>
            </button>

            {/* Export Summary Button */}
            <button
              id="btn-export-scorecard"
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 p-2 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/90 transition cursor-pointer"
              title="Export report summary"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Share Scorecard Link Button - Highly visible */}
            <button
              id="btn-share-scorecard-header"
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-300 transition cursor-pointer shadow-2xs"
              title="Share this book scorecard link"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Share Link</span>
            </button>

            {/* App Performance & Telemetry Button */}
            <button
              id="btn-app-analytics"
              onClick={onOpenAnalyticsModal}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/90 transition cursor-pointer"
              title="View live analytics & metrics"
            >
              <BarChart2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>Telemetry</span>
            </button>

            {/* Pro Upgrade or Active Status Indicator */}
            {isProUser ? (
              <button
                id="btn-header-pro-active"
                onClick={onOpenPurchaseSuccess}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer shadow-2xs ml-1"
                title="Pro Subscription Active - View perks & alert preferences"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" />
                <span>PRO ACTIVE</span>
              </button>
            ) : (
              <a
                id="btn-header-start-trial"
                href="https://buy.stripe.com/4gM14hbTKbYCfWz1N76EU01"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackEvent('trial_started', { source: 'header_badge' });
                  trackEvent('pro_upgrade_clicked', { source: 'header_badge', price: 20 });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition cursor-pointer shadow-2xs ml-1"
                title="Start 30-Day Free Trial - $0 Due Today"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" />
                <span>30-Day Free Trial ($0)</span>
              </a>
            )}
          </div>
        </div>

        {/* Primary Tab Navigation - Clean underline/active indicator style */}
        <div className="border-t border-neutral-200/80 flex items-center justify-between overflow-x-auto no-scrollbar gap-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            
            <button
              id="tab-landing"
              onClick={() => setActiveTab('landing')}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'landing'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Landing Page</span>
            </button>

            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Daily Dashboard</span>
            </button>

            <button
              id="tab-scorecard"
              onClick={() => setActiveTab('scorecard')}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'scorecard'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Funnel Diagnostics</span>
              <span className={`text-[11px] font-mono font-bold ${statusColor}`}>
                ({overallScore})
              </span>
            </button>

            <button
              id="tab-actions"
              onClick={() => setActiveTab('actions')}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'actions'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Action Matrix</span>
            </button>

            <button
              id="tab-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'simulator'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>What-If Simulator</span>
            </button>

            <button
              id="tab-ai-advisor"
              onClick={() => setActiveTab('ai-advisor')}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'ai-advisor'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
              <span>AI Strategist</span>
            </button>
          </div>

          <button
            id="btn-reset-metrics"
            onClick={onResetToDefault}
            className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 transition px-2 py-1 cursor-pointer"
            title="Reset to scenario defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
};
