import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  Download, 
  Sliders, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { PRESET_PROFILES } from '../data/presets';
import { ScorecardPreset, ScoreStatus } from '../types';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (preset: ScorecardPreset) => void;
  onOpenPasteModal: () => void;
  onOpenExportModal: () => void;
  onResetToDefault: () => void;
  activeTab: 'scorecard' | 'simulator' | 'actions' | 'ai-advisor';
  setActiveTab: (tab: 'scorecard' | 'simulator' | 'actions' | 'ai-advisor') => void;
  overallScore: number;
  overallStatus: ScoreStatus;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenPasteModal,
  onOpenExportModal,
  onResetToDefault,
  activeTab,
  setActiveTab,
  overallScore,
  overallStatus,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & App Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-slate-950 font-bold">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  KDP Author Scorecard
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    KDP Diagnostics
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Simplifying Amazon KDP analytics into clear, scored color sections (Red = Bad, Green = Great)
              </p>
            </div>
          </div>

          {/* Preset Selector & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Preset Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <span className="text-xs font-medium text-slate-400 px-2 hidden sm:inline">
                Preset Book:
              </span>
              <select
                id="preset-selector"
                value={currentPresetId}
                onChange={(e) => {
                  const p = PRESET_PROFILES.find((x) => x.id === e.target.value);
                  if (p) onSelectPreset(p);
                }}
                className="bg-slate-800 text-xs font-medium text-slate-200 rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {PRESET_PROFILES.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Paste Report Button */}
            <button
              id="btn-paste-report"
              onClick={onOpenPasteModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition shadow-sm cursor-pointer"
              title="Paste raw KDP report text or ads data"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paste Report</span>
            </button>

            {/* Export Summary Button */}
            <button
              id="btn-export-scorecard"
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition shadow-sm cursor-pointer"
              title="Export or print scorecard summary"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            <button
              id="tab-scorecard"
              onClick={() => setActiveTab('scorecard')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'scorecard'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                overallStatus === 'great' ? 'bg-emerald-400 animate-pulse' : overallStatus === 'warning' ? 'bg-amber-400' : 'bg-red-400 animate-ping'
              }`} />
              Scorecard Sections ({overallScore}/100)
            </button>

            <button
              id="tab-actions"
              onClick={() => setActiveTab('actions')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'actions'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              What You're Missing (Action Matrix)
            </button>

            <button
              id="tab-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              "What If?" ROI Simulator
            </button>

            <button
              id="tab-ai-advisor"
              onClick={() => setActiveTab('ai-advisor')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'ai-advisor'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI KDP Strategist
            </button>
          </div>

          <button
            id="btn-reset-metrics"
            onClick={onResetToDefault}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition px-2 py-1 cursor-pointer"
            title="Reset metrics to preset default"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Values</span>
          </button>
        </div>
      </div>
    </header>
  );
};
