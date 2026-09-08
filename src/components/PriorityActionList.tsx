import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  ListOrdered
} from 'lucide-react';
import { ScoreItem, BookMetrics, ComputedMetrics } from '../types';

interface PriorityActionListProps {
  sections: ScoreItem[];
  metrics: BookMetrics;
  computed: ComputedMetrics;
  onOpenAdvisor: () => void;
}

export const PriorityActionList: React.FC<PriorityActionListProps> = ({
  sections,
  metrics,
  computed,
  onOpenAdvisor,
}) => {
  const [copied, setCopied] = useState(false);

  // Group sections by status
  const criticalSections = sections.filter((s) => s.status === 'critical');
  const warningSections = sections.filter((s) => s.status === 'warning');
  const greatSections = sections.filter((s) => s.status === 'great');

  const handleCopyPlan = () => {
    let text = `KDP DIAGNOSTIC AUDIT REPORT: "${metrics.title || 'Active Title'}"\n\n`;
    
    if (criticalSections.length > 0) {
      text += `CRITICAL BOTTLENECKS (Score < 50):\n`;
      criticalSections.forEach((s) => {
        text += `• ${s.title} (Score: ${s.score}/100)\n  Issue: ${s.whatYouAreMissing}\n  Fix: ${s.prescription}\n\n`;
      });
    }

    if (warningSections.length > 0) {
      text += `OPTIMIZATION OPPORTUNITIES (Score 50-74):\n`;
      warningSections.forEach((s) => {
        text += `• ${s.title} (Score: ${s.score}/100)\n  Issue: ${s.whatYouAreMissing}\n  Fix: ${s.prescription}\n\n`;
      });
    }

    if (greatSections.length > 0) {
      text += `PERFORMING WITHIN BENCHMARK (Score 75-100):\n`;
      greatSections.forEach((s) => {
        text += `• ${s.title} (Score: ${s.score}/100)\n  Action: ${s.prescription}\n\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListOrdered className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Prioritized Action Matrix
            </h3>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Checklist ordered from critical conversion leaks to weekly scaling tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-action-plan"
            onClick={handleCopyPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/90 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            id="btn-ai-generate-plan"
            onClick={onOpenAdvisor}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Action Plan</span>
          </button>
        </div>
      </div>

      {/* Group 1: Critical */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Critical Bottlenecks (Score &lt; 50)
          </h4>
          <span className="text-xs text-neutral-400 font-mono">
            ({criticalSections.length})
          </span>
        </div>

        {criticalSections.length === 0 ? (
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 text-center shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
            <h5 className="text-xs font-semibold text-neutral-800">No Critical Bottlenecks Identified</h5>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              All major transition points are performing above critical thresholds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {criticalSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-neutral-200/90 border-t-4 border-t-rose-500 p-6 shadow-2xs relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-rose-600">
                        Score {sec.score}/100
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-neutral-900 mt-1">
                      {sec.title}
                    </h5>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {sec.valueDisplay}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                      Identified Problem
                    </span>
                    <p className="text-neutral-600 leading-relaxed">
                      {sec.whatYouAreMissing}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                      Recommended Action
                    </span>
                    <p className="text-neutral-600 leading-relaxed">
                      {sec.prescription}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group 2: Warning */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Optimization Tasks (Score 50-74)
          </h4>
          <span className="text-xs text-neutral-400 font-mono">
            ({warningSections.length})
          </span>
        </div>

        {warningSections.length === 0 ? (
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 text-center text-xs text-neutral-400 shadow-2xs">
            No secondary optimization items currently flagged.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {warningSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-neutral-200/90 border-t-4 border-t-amber-500 p-6 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-600">
                      Score {sec.score}/100
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {sec.valueDisplay}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-neutral-900 mb-2">
                    {sec.title}
                  </h5>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                    {sec.whatYouAreMissing}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">
                    Fix:
                  </span>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {sec.prescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group 3: Optimized */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Performing Within Benchmarks (Score 75-100)
          </h4>
          <span className="text-xs text-neutral-400 font-mono">
            ({greatSections.length})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {greatSections.map((sec) => (
            <div
              key={sec.id}
              className="bg-white rounded-2xl border border-neutral-200/90 border-t-4 border-t-emerald-500 p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-600">
                    Score: {sec.score}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <h5 className="text-xs font-bold text-neutral-900 mb-1">
                  {sec.title}
                </h5>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {sec.prescription}
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-neutral-400 pt-2 border-t border-neutral-100">
                {sec.valueDisplay}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
