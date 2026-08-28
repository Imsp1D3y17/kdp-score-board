import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Flame,
  Zap,
  Target
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
    let text = `=== KDP AUTHOR ACTION PLAN for "${metrics.title || 'My Book'}" ===\n\n`;
    
    if (criticalSections.length > 0) {
      text += `🚨 URGENT FIXES (RED SECTIONS - STOP THE BLEED):\n`;
      criticalSections.forEach((s) => {
        text += `• [${s.title}] (Score: ${s.score}/100)\n  Missing: ${s.whatYouAreMissing}\n  Action: ${s.prescription}\n\n`;
      });
    }

    if (warningSections.length > 0) {
      text += `⚠️ OPTIMIZATION ITEMS (YELLOW SECTIONS - IMPROVE THIS WEEK):\n`;
      warningSections.forEach((s) => {
        text += `• [${s.title}] (Score: ${s.score}/100)\n  Missing: ${s.whatYouAreMissing}\n  Action: ${s.prescription}\n\n`;
      });
    }

    if (greatSections.length > 0) {
      text += `✅ HEALTHY STRENGTHS (GREEN SECTIONS - SCALE & PROTECT):\n`;
      greatSections.forEach((s) => {
        text += `• [${s.title}] (Score: ${s.score}/100)\n  Action: ${s.prescription}\n\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              "What You're Missing" Prescription Matrix
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Prioritized step-by-step checklist ordered from most critical money leaks (Red) to weekly optimizations (Yellow).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-action-plan"
            onClick={handleCopyPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Action Plan</span>
              </>
            )}
          </button>

          <button
            id="btn-ai-generate-plan"
            onClick={onOpenAdvisor}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Custom Roadmap</span>
          </button>
        </div>
      </div>

      {/* Group 1: Critical (RED) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">
            Tier 1: Urgent Bottlenecks (Score &lt; 50 — Fix Today)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({criticalSections.length} {criticalSections.length === 1 ? 'leak' : 'leaks'} detected)
          </span>
        </div>

        {criticalSections.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">No Critical Bottlenecks Found!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Your book has eliminated all major money-losing leaks. Focus on the optimization tier below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {criticalSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-slate-900 rounded-2xl border border-red-500/40 p-5 shadow-lg shadow-red-950/20 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                      RED • SCORE: {sec.score}/100
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      {sec.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-red-400 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-900/50 self-start">
                    {sec.valueDisplay}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                  <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800">
                    <span className="text-xs font-bold text-amber-400 block mb-1">
                      🚨 What You're Missing:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sec.whatYouAreMissing}
                    </p>
                  </div>

                  <div className="bg-red-950/30 rounded-xl p-3.5 border border-red-900/40">
                    <span className="text-xs font-bold text-emerald-400 block mb-1">
                      🛠️ Immediate Fix Checklist:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {sec.prescription}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group 2: Warning (YELLOW) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Tier 2: Optimization Items (Score 50-74 — Improve This Week)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({warningSections.length} items)
          </span>
        </div>

        {warningSections.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center text-xs text-slate-400">
            No moderate warning items currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {warningSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-slate-900 rounded-2xl border border-amber-500/30 p-4.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      YELLOW • SCORE: {sec.score}/100
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {sec.valueDisplay}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {sec.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-2">
                    {sec.whatYouAreMissing}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 bg-slate-950/50 rounded-lg p-2.5">
                  <span className="text-[11px] font-bold text-amber-300 block mb-0.5">
                    Recommended Polish:
                  </span>
                  <span className="text-xs text-slate-300">
                    {sec.prescription}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group 3: Great (GREEN) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Tier 3: Optimized Pillars (Score 75-100 — Scale & Maintain)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({greatSections.length} {greatSections.length === 1 ? 'pillar' : 'pillars'} healthy)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {greatSections.map((sec) => (
            <div
              key={sec.id}
              className="bg-slate-900/80 rounded-xl border border-emerald-500/20 p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  GREEN • {sec.score}/100
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">
                {sec.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {sec.headline}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
