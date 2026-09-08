import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Sliders, 
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
  const getStatusStyles = (status: ScoreStatus) => {
    switch (status) {
      case 'great':
        return {
          scoreColor: 'text-emerald-600',
          badgeText: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500',
          topBar: 'border-t-emerald-500',
          progressBar: 'bg-emerald-500',
          statusLabel: 'Optimized',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
        };
      case 'warning':
        return {
          scoreColor: 'text-amber-600',
          badgeText: 'text-amber-700',
          badgeBg: 'bg-amber-50 border-amber-200',
          dot: 'bg-amber-500',
          topBar: 'border-t-amber-500',
          progressBar: 'bg-amber-500',
          statusLabel: 'Needs Optimization',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
        };
      case 'critical':
      default:
        return {
          scoreColor: 'text-rose-600',
          badgeText: 'text-rose-700',
          badgeBg: 'bg-rose-50 border-rose-200',
          dot: 'bg-rose-500',
          topBar: 'border-t-rose-500',
          progressBar: 'bg-rose-500',
          statusLabel: 'Critical Leak',
          icon: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            6-Pillar Funnel Diagnostics
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Key benchmark comparisons across each transition in your publishing funnel.
          </p>
        </div>

        <button
          id="btn-edit-metrics-top"
          onClick={onOpenMetricDrawer}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200/90 shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-neutral-500" />
          <span>Adjust Input Numbers</span>
        </button>
      </div>

      {/* 6 Diagnostic Section Cards - Base44 Style: White rounded cards with subtle top accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const styles = getStatusStyles(section.status);

          return (
            <div
              key={section.id}
              id={`scorecard-card-${section.id}`}
              className={`rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between transition hover:shadow-xs border-t-4 ${styles.topBar}`}
            >
              <div>
                {/* Header: Title, Status Badge, Score */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                      <span className={`text-[11px] font-bold tracking-wide uppercase ${styles.badgeText}`}>
                        {styles.statusLabel}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                      {section.title}
                    </h4>
                  </div>

                  {/* Clean Score */}
                  <div className="text-right shrink-0">
                    <span className={`text-2xl font-extrabold font-mono tracking-tight ${styles.scoreColor}`}>
                      {section.score}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">/100</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${styles.progressBar}`}
                    style={{ width: `${Math.min(100, Math.max(8, section.score))}%` }}
                  />
                </div>

                {/* Headline Diagnosis Verdict */}
                <div className="flex items-start gap-2.5 mb-4 bg-neutral-50/60 p-3 rounded-xl border border-neutral-100">
                  {styles.icon}
                  <div>
                    <p className="text-xs font-medium text-neutral-800 leading-snug">
                      {section.headline}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {section.benchmark}
                    </p>
                  </div>
                </div>

                {/* Sub-Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-3 mb-4 border-y border-neutral-100">
                  {section.subMetrics.map((sub, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[10px] text-neutral-400 truncate" title={sub.label}>
                        {sub.label}
                      </span>
                      <span className="text-xs font-bold font-mono text-neutral-900 my-0.5">
                        {sub.value}
                      </span>
                      <span className="text-[10px] text-neutral-400 truncate">
                        Target: {sub.target}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Findings & Prescriptions */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 block mb-0.5">
                      Identified Bottleneck
                    </span>
                    <p className="text-neutral-600">
                      {section.whatYouAreMissing}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block mb-0.5">
                      Recommended Fix
                    </span>
                    <p className="text-neutral-600">
                      {section.prescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-500 font-mono">
                  {section.valueDisplay}
                </span>

                <button
                  id={`btn-ask-ai-${section.id}`}
                  onClick={() => onOpenAdvisorForSection(section.title)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>AI Recommendations</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
