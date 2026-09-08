import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Base44Dashboard } from './components/Base44Dashboard';
import { FitnessVitalsHero } from './components/FitnessVitalsHero';
import { ScorecardGrid } from './components/ScorecardGrid';
import { MetricControls } from './components/MetricControls';
import { PriorityActionList } from './components/PriorityActionList';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AIAuthorAdvisor } from './components/AIAuthorAdvisor';
import { PasteReportModal } from './components/PasteReportModal';
import { BookScannerModal } from './components/BookScannerModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { ShareModal } from './components/ShareModal';
import { SaaSPaywallModal } from './components/SaaSPaywallModal';
import { LandingPage } from './components/LandingPage';
import { AppAnalyticsModal } from './components/AppAnalyticsModal';
import { PurchaseSuccessModal } from './components/PurchaseSuccessModal';
import { PRESET_PROFILES } from './data/presets';
import { BookMetrics, ScorecardPreset } from './types';
import { calculateComputedMetrics, evaluateScorecard } from './utils/calculator';
import { trackEvent } from './utils/analytics';
import { Sliders, Activity, Share2, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Default to the first preset (Bleeding Amazon Ads - common author problem)
  const [currentPresetId, setCurrentPresetId] = useState<string>(PRESET_PROFILES[0].id);
  const [metrics, setMetrics] = useState<BookMetrics>(PRESET_PROFILES[0].metrics);
  const [sharedBookNotice, setSharedBookNotice] = useState<string | null>(null);
  
  // Tab navigation with URL hash deep-link support - defaults to 'landing'
  const getInitialTab = (): 'landing' | 'dashboard' | 'scorecard' | 'simulator' | 'actions' | 'ai-advisor' => {
    if (typeof window === 'undefined') return 'landing';
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'dashboard') return 'dashboard';
    if (hash === 'scorecard' || hash === 'app') return 'scorecard';
    if (hash === 'simulator') return 'simulator';
    if (hash === 'actions') return 'actions';
    if (hash === 'ai-advisor') return 'ai-advisor';
    if (hash === 'landing') return 'landing';
    return 'landing';
  };

  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'scorecard' | 'simulator' | 'actions' | 'ai-advisor'>(getInitialTab);

  // Synchronize browser history / URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'dashboard') setActiveTab('dashboard');
      else if (hash === 'scorecard' || hash === 'app') setActiveTab('scorecard');
      else if (hash === 'simulator') setActiveTab('simulator');
      else if (hash === 'actions') setActiveTab('actions');
      else if (hash === 'ai-advisor') setActiveTab('ai-advisor');
      else if (hash === 'landing') setActiveTab('landing');
      else setActiveTab('landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Drawer / Modals
  const [isMetricDrawerOpen, setIsMetricDrawerOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isBookScannerOpen, setIsBookScannerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isPurchaseSuccessOpen, setIsPurchaseSuccessOpen] = useState(false);
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kdp_pro_member') === 'true';
    } catch {
      return false;
    }
  });
  const [advisorPrefilledTopic, setAdvisorPrefilledTopic] = useState<string | undefined>();

  // Check for shared book or completed Stripe checkout in URL parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      
      // 1. Check if user just completed Stripe Checkout (?checkout=success or session_id=...)
      const checkoutParam = params.get('checkout');
      const sessionIdParam = params.get('session_id');
      const proParam = params.get('pro');
      
      if (checkoutParam === 'success' || Boolean(sessionIdParam) || proParam === 'success' || proParam === 'preview') {
        setIsProUser(true);
        setIsPurchaseSuccessOpen(true);
        try {
          localStorage.setItem('kdp_pro_member', 'true');
        } catch {}
        trackEvent('pro_checkout_completed', { 
          sessionId: sessionIdParam || 'stripe_direct',
          timestamp: new Date().toISOString()
        });
        trackEvent('trial_started', { source: 'stripe_checkout_success' });

        // Clean query parameters gracefully without reload
        const newUrl = window.location.pathname + (window.location.hash || '');
        window.history.replaceState({}, '', newUrl);
      }

      // 2. Check for shared book link (?share=...)
      const shareParam = params.get('share');
      if (shareParam) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(shareParam))));
        if (decoded && decoded.title) {
          setMetrics((prev) => ({
            ...prev,
            title: decoded.title || prev.title,
            genre: decoded.genre || prev.genre,
            price: Number(decoded.price) || prev.price,
            paperbackPrice: Number(decoded.price) || prev.paperbackPrice,
            orders: Number(decoded.orders) ?? prev.orders,
            clicks: Number(decoded.clicks) ?? prev.clicks,
            adSpend: Number(decoded.spend) ?? prev.adSpend,
            adSales: Number(decoded.sales) ?? prev.adSales,
            impressions: Number(decoded.imp) ?? prev.impressions,
            kenpReads: Number(decoded.kenp) ?? prev.kenpReads,
            pageCount: Number(decoded.pages) ?? prev.pageCount,
            starRating: Number(decoded.rating) ?? prev.starRating,
            reviewCount: Number(decoded.reviews) ?? prev.reviewCount,
            isLowContent: Boolean(decoded.isLow),
            lowContentType: decoded.lowType || prev.lowContentType,
            hasAplusContent: Boolean(decoded.aplus),
            interiorColor: decoded.ink || prev.interiorColor,
          }));
          setSharedBookNotice(decoded.title);
          setActiveTab('dashboard');
        }
      }
    } catch (e) {
      console.warn('Unable to parse URL parameters', e);
    }
  }, []);

  // Derived calculations
  const computed = useMemo(() => calculateComputedMetrics(metrics), [metrics]);
  const scorecard = useMemo(() => evaluateScorecard(metrics, computed), [metrics, computed]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: ScorecardPreset) => {
    setCurrentPresetId(preset.id);
    setMetrics(preset.metrics);
    trackEvent('audit_run', { preset: preset.name, genre: preset.metrics.genre, price: preset.metrics.price });
  };

  const handleTabChange = (tab: 'dashboard' | 'scorecard' | 'simulator' | 'actions' | 'ai-advisor' | 'landing') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab === 'dashboard' ? '' : tab;
    }
    trackEvent('page_view_' + tab, { tab });
  };

  // Reset to current preset defaults
  const handleResetToDefault = () => {
    const p = PRESET_PROFILES.find((x) => x.id === currentPresetId) || PRESET_PROFILES[0];
    setMetrics(p.metrics);
  };

  // Update metrics partially
  const handleUpdateMetrics = (updated: Partial<BookMetrics>) => {
    setMetrics((prev) => ({ ...prev, ...updated }));
  };

  // Trigger Advisor for a specific section
  const handleOpenAdvisorForSection = (sectionTitle: string) => {
    setAdvisorPrefilledTopic(sectionTitle);
    setActiveTab('ai-advisor');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      
      {/* Top Navigation Header */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenBookScanner={() => setIsBookScannerOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenAnalyticsModal={() => setIsAnalyticsModalOpen(true)}
        onResetToDefault={handleResetToDefault}
        onOpenSaaSPaywall={() => setIsPaywallOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        overallScore={scorecard.overallScore}
        overallStatus={scorecard.overallStatus}
        isProUser={isProUser}
        onOpenPurchaseSuccess={() => setIsPurchaseSuccessOpen(true)}
      />

      {/* Shared Book Notice Banner */}
      {sharedBookNotice && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm text-indigo-950">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Viewing shared scorecard for <strong className="font-semibold">"{sharedBookNotice}"</strong> (Overall Score: <strong className="text-indigo-700">{scorecard.overallScore}/100</strong>).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSharedBookNotice(null);
                  handleResetToDefault();
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="font-medium text-xs text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => setSharedBookNotice(null)}
                className="p-1 text-indigo-500 hover:text-indigo-800 rounded transition cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'landing' ? (
        <LandingPage
          onStartAudit={() => {
            handleTabChange('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectPresetAndAudit={(preset) => {
            handleSelectPreset(preset);
            handleTabChange('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPricingModal={() => setIsPaywallOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* 1. Base44 Dashboard View (Exact match to Screenshots) */}
          {activeTab === 'dashboard' && (
            <Base44Dashboard
              metrics={metrics}
              computed={computed}
              currentPresetId={currentPresetId}
              onSelectPreset={handleSelectPreset}
              onOpenSaaSPaywall={() => setIsPaywallOpen(true)}
              onOpenPasteModal={() => setIsPasteModalOpen(true)}
              onOpenBookScanner={() => setIsBookScannerOpen(true)}
              onOpenAdvisor={(prefilled) => {
                if (prefilled) setAdvisorPrefilledTopic(prefilled);
                setActiveTab('ai-advisor');
              }}
              onOpenMetricDrawer={() => setIsMetricDrawerOpen(true)}
              onNavigateToTab={(tab) => handleTabChange(tab)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
          )}

          {/* 2. Deep Dive Funnel Diagnostics */}
          {activeTab === 'scorecard' && (
            <div className="space-y-6">
              <FitnessVitalsHero
                metrics={metrics}
                computed={computed}
                overallScore={scorecard.overallScore}
                overallStatus={scorecard.overallStatus}
                onNavigateToActions={() => setActiveTab('actions')}
                onOpenSaaSPaywall={() => setIsPaywallOpen(true)}
                onOpenPasteModal={() => setIsPasteModalOpen(true)}
                onOpenBookScanner={() => setIsBookScannerOpen(true)}
                onOpenMetricDrawer={() => setIsMetricDrawerOpen(true)}
                onOpenShareModal={() => setIsShareModalOpen(true)}
              />

              <ScorecardGrid
                sections={scorecard.sections}
                onOpenAdvisorForSection={handleOpenAdvisorForSection}
                onOpenMetricDrawer={() => setIsMetricDrawerOpen(true)}
              />

              {/* Discreet Input Drawer Trigger */}
              <div className="pt-2 pb-4 flex justify-center">
                <button
                  id="btn-toggle-inline-metrics"
                  onClick={() => setIsMetricDrawerOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200/90 shadow-2xs transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Adjust Custom Numbers in Drawer</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Action Matrix */}
          {activeTab === 'actions' && (
            <PriorityActionList
              sections={scorecard.sections}
              metrics={metrics}
              computed={computed}
              onOpenAdvisor={() => setActiveTab('ai-advisor')}
            />
          )}

          {/* 4. What-If Simulator */}
          {activeTab === 'simulator' && (
            <WhatIfSimulator
              baseMetrics={metrics}
              baseComputed={computed}
              baseOverallScore={scorecard.overallScore}
            />
          )}

          {/* 5. AI Strategist */}
          {activeTab === 'ai-advisor' && (
            <AIAuthorAdvisor
              metrics={metrics}
              computed={computed}
              scores={scorecard.scores}
              overallScore={scorecard.overallScore}
              sections={scorecard.sections}
              prefilledPrompt={advisorPrefilledTopic}
              onClearPrefilledPrompt={() => setAdvisorPrefilledTopic(undefined)}
            />
          )}
        </main>
      )}

      {/* Clean Light Footer */}
      <footer className="border-t border-neutral-200/90 bg-white py-6 text-center text-xs text-neutral-500 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-neutral-700">KDP Score Card • The true bottom line on your KDP day</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <button
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-neutral-500" />
              <span>Telemetry</span>
            </button>
            <span className="text-neutral-300">|</span>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <span className="text-rose-600 font-semibold">Critical Leak</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">Warning</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">Great</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Slide-over Drawer for Adjusting Numbers */}
      {isMetricDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white border-l border-neutral-200 shadow-2xl p-4 sm:p-6 overflow-y-auto">
            <MetricControls
              metrics={metrics}
              onChangeMetrics={handleUpdateMetrics}
              onClose={() => setIsMetricDrawerOpen(false)}
              isDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Modal: Paste / Import KDP Text */}
      <PasteReportModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onApplyExtractedMetrics={handleUpdateMetrics}
      />

      {/* Modal: Scan Book Title or ASIN / ISBN / Manual Scoring */}
      <BookScannerModal
        isOpen={isBookScannerOpen}
        onClose={() => setIsBookScannerOpen(false)}
        onApplyBookMetrics={handleUpdateMetrics}
        currentMetrics={metrics}
      />

      {/* Modal: Export / Print Summary */}
      <ExportSummaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metrics={metrics}
        computed={computed}
        overallScore={scorecard.overallScore}
        overallStatus={scorecard.overallStatus}
        sections={scorecard.sections}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Modal: Share Scorecard Link */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        metrics={metrics}
        computed={computed}
        overallScore={scorecard.overallScore}
        overallStatus={scorecard.overallStatus}
      />

      {/* Modal: SaaS Pro Paywall / Daily Sync Hook */}
      <SaaSPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        bookTitle={metrics.title}
        onOpenPurchaseSuccess={() => setIsPurchaseSuccessOpen(true)}
      />

      {/* Modal: Purchase Confirmation / Welcome to Pro */}
      <PurchaseSuccessModal
        isOpen={isPurchaseSuccessOpen}
        onClose={() => setIsPurchaseSuccessOpen(false)}
        onNavigateToDashboard={() => setActiveTab('dashboard')}
        onOpenAdvisor={(topic) => handleOpenAdvisorForSection(topic || 'Amazon Ads & Discoverability')}
      />

      {/* Modal: SaaS App Performance & Telemetry */}
      <AppAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        onPreviewPurchaseSuccess={() => setIsPurchaseSuccessOpen(true)}
      />
    </div>
  );
}
