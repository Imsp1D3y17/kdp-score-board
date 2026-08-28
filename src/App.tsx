import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { OverallScoreBanner } from './components/OverallScoreBanner';
import { ScorecardGrid } from './components/ScorecardGrid';
import { MetricControls } from './components/MetricControls';
import { PriorityActionList } from './components/PriorityActionList';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AIAuthorAdvisor } from './components/AIAuthorAdvisor';
import { PasteReportModal } from './components/PasteReportModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { PRESET_PROFILES } from './data/presets';
import { BookMetrics, ScorecardPreset } from './types';
import { calculateComputedMetrics, evaluateScorecard } from './utils/calculator';
import { Sliders, X, Sparkles, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';

export default function App() {
  // Default to the first preset (Bleeding Amazon Ads - common author problem)
  const [currentPresetId, setCurrentPresetId] = useState<string>(PRESET_PROFILES[0].id);
  const [metrics, setMetrics] = useState<BookMetrics>(PRESET_PROFILES[0].metrics);
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState<'scorecard' | 'simulator' | 'actions' | 'ai-advisor'>('scorecard');
  
  // Drawer / Modals
  const [isMetricDrawerOpen, setIsMetricDrawerOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [advisorPrefilledTopic, setAdvisorPrefilledTopic] = useState<string | undefined>();

  // Derived calculations
  const computed = useMemo(() => calculateComputedMetrics(metrics), [metrics]);
  const scorecard = useMemo(() => evaluateScorecard(metrics, computed), [metrics, computed]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: ScorecardPreset) => {
    setCurrentPresetId(preset.id);
    setMetrics(preset.metrics);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetToDefault={handleResetToDefault}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overallScore={scorecard.overallScore}
        overallStatus={scorecard.overallStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Overall Health Score Banner */}
        <OverallScoreBanner
          metrics={metrics}
          computed={computed}
          overallScore={scorecard.overallScore}
          overallStatus={scorecard.overallStatus}
          onNavigateToActions={() => setActiveTab('actions')}
        />

        {/* Tab Content */}
        {activeTab === 'scorecard' && (
          <div className="space-y-6">
            <ScorecardGrid
              sections={scorecard.sections}
              onOpenAdvisorForSection={handleOpenAdvisorForSection}
              onOpenMetricDrawer={() => setIsMetricDrawerOpen(true)}
            />

            {/* Quick Inline Adjustments Panel */}
            <div className="pt-2">
              <MetricControls
                metrics={metrics}
                onChangeMetrics={handleUpdateMetrics}
              />
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <PriorityActionList
            sections={scorecard.sections}
            metrics={metrics}
            computed={computed}
            onOpenAdvisor={() => setActiveTab('ai-advisor')}
          />
        )}

        {activeTab === 'simulator' && (
          <WhatIfSimulator
            baseMetrics={metrics}
            baseComputed={computed}
            baseOverallScore={scorecard.overallScore}
          />
        )}

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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>KDP Author Scorecard & Funnel Diagnostic Studio</span>
          </div>
          <div className="text-slate-400">
            Red (0-49: Critical) • Yellow (50-74: Warning) • Green (75-100: Great)
          </div>
        </div>
      </footer>

      {/* Slide-over Drawer for Adjusting Numbers */}
      {isMetricDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl p-4 sm:p-6 overflow-y-auto">
            <MetricControls
              metrics={metrics}
              onChangeMetrics={handleUpdateMetrics}
              onClose={() => setIsMetricDrawerOpen(false)}
              isDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Paste Report Modal */}
      <PasteReportModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onApplyExtractedMetrics={(extracted) => {
          handleUpdateMetrics(extracted);
        }}
      />

      {/* Export Summary Modal */}
      <ExportSummaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metrics={metrics}
        computed={computed}
        overallScore={scorecard.overallScore}
        overallStatus={scorecard.overallStatus}
        sections={scorecard.sections}
      />

    </div>
  );
}
