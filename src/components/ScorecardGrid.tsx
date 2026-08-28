import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Sliders, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { ScoreItem, ScoreStatus } from '../types';

interface ScorecardGridProps {
  sections: ScoreItem[];
  onOpenAdvisorForSection: (sectionTitle: string) => void;
  onOpenMetricDrawer: () => void;
}

export const ScorecardGrid: React.FC<ScorecardGridProps> = ({
  sections,
  onOpenAdvisorForSection,
  onOpenMetricDrawer,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusClasses = (status: ScoreStatus) => {
    switch (status) {
      case 'great':
        return {
          cardBorder: 'border-emerald-500/30 hover:border-emerald-500/50 bg-slate-900/90',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          scoreText: 'text-emerald-400',
          statusText: 'GREEN: GREAT (OPTIMIZED)',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          accentBar: 'bg-emerald-500',
          subBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        };
      case 'warning':
        return {
          cardBorder: 'border-amber-500/30 hover:border-amber-500/50 bg-slate-900/90',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          scoreText: 'text-amber-400',
          statusText: 'YELLOW: WARNING (AVERAGE)',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          accentBar: 'bg-amber-500',
          subBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        };
      case 'critical':
      default:
        return {
          cardBorder: 'border-red-500/40 hover:border-red-500/60 bg-slate-900/90 shadow-lg shadow-red-950/20',
          badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
          scoreText: 'text-red-400',
          statusText: 'RED: CRITICAL (BAD LEAK)',
          icon: <AlertCircle className="w-4 h-4 text-red-400" />,
          accentBar: 'bg-red-500',
          subBadge: 'bg-red-500/10 text-red-300 border-red-500/20',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Grid Header & Quick Helper */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            6-Pillar KDP Diagnostic Scorecards
            <span className="text-xs font-normal text-slate-400">
              (Color & Number Coded)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Each section diagnoses a specific transition point in your Amazon KDP sales funnel.
          </p>
        </div>

        <button
          id="btn-edit-metrics-top"
          onClick={onOpenMetricDrawer}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Adjust Your Numbers</span>
        </button>
      </div>

      {/* 6 Diagnostic Section Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {sections.map((section) => {
          const style = getStatusClasses(section.status);
          const isExpanded = expandedId === section.id;

          return (
            <div
              key={section.id}
              id={`scorecard-card-${section.id}`}
              className={`rounded-2xl border ${style.cardBorder} p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden`}
            >
              {/* Top Colored Accent Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.accentBar}`} />

              <div>
                {/* Header: Title & Score Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      {style.statusText}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                      {section.title}
                    </h3>
                  </div>

                  {/* Big Number & Color Score Badge */}
                  <div className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border ${style.badgeBg} shrink-0`}>
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-xl font-extrabold ${style.scoreText}`}>
                        {section.score}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        /100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Headline Diagnosis Verdict */}
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-3.5">
                  <div className="flex items-center gap-2">
                    {style.icon}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                      {section.headline}
                    </h4>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 pl-6">
                    {section.benchmark}
                  </div>
                </div>

                {/* Sub-Metrics Breakdown (3 Pills) */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {section.subMetrics.map((sub, i) => {
                    const subStyle = getStatusClasses(sub.status);
                    return (
                      <div
                        key={i}
                        className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/60 flex flex-col justify-between"
                      >
                        <span className="text-[10px] font-medium text-slate-400 truncate" title={sub.label}>
                          {sub.label}
                        </span>
                        <div className="mt-1">
                          <span className={`text-xs font-bold ${subStyle.scoreText}`}>
                            {sub.value}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5">
                          Tgt: {sub.target}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* "What You're Missing" Diagnostic Block */}
                <div className="rounded-xl p-3.5 bg-slate-950/80 border border-slate-800 mb-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
                    <span>🚨 What You're Missing:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {section.whatYouAreMissing}
                  </p>
                </div>

                {/* Prescriptive Action Plan */}
                <div className="rounded-xl p-3 bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                    <span>🛠️ Exact Fix To Turn This Green:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {section.prescription}
                  </p>
                </div>
              </div>

              {/* Card Footer: AI Consult for this Section */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {section.valueDisplay}
                </span>

                <button
                  id={`btn-ask-ai-${section.id}`}
                  onClick={() => onOpenAdvisorForSection(section.title)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Strategy</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
