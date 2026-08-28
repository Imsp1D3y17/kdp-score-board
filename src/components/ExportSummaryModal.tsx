import React, { useState } from 'react';
import { X, Download, Copy, Check, Printer, BookOpen, CheckCircle2 } from 'lucide-react';
import { BookMetrics, ComputedMetrics, ScoreItem, ScoreStatus } from '../types';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: BookMetrics;
  computed: ComputedMetrics;
  overallScore: number;
  overallStatus: ScoreStatus;
  sections: ScoreItem[];
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  metrics,
  computed,
  overallScore,
  overallStatus,
  sections,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    let md = `# KDP Author Diagnostic Scorecard: ${metrics.title || 'Untitled Book'}\n`;
    md += `**Overall Health Score**: ${overallScore}/100 (${overallStatus.toUpperCase()})\n`;
    md += `**Date**: ${new Date().toLocaleDateString()}\n\n`;

    md += `## Key Funnel Metrics\n`;
    md += `- Impressions: ${metrics.impressions.toLocaleString()}\n`;
    md += `- Clicks: ${metrics.clicks.toLocaleString()} (CTR: ${computed.ctr}%)\n`;
    md += `- Orders: ${metrics.orders} (Conversion: ${computed.conversionRate}%)\n`;
    md += `- Ad Spend: $${metrics.adSpend} | ACoS: ${computed.acos}%\n`;
    md += `- KENP Reads: ${metrics.kenpReads.toLocaleString()} (~$${computed.kenpRoyalties})\n`;
    md += `- Est. Total Royalties: $${computed.estimatedRoyalties} | Net Profit: $${computed.netProfit}\n\n`;

    md += `## 6 Section Diagnostic Scores\n`;
    sections.forEach((sec) => {
      md += `### ${sec.title} - Score: ${sec.score}/100 [${sec.status.toUpperCase()}]\n`;
      md += `- **Headline**: ${sec.headline}\n`;
      md += `- **What's Missing**: ${sec.whatYouAreMissing}\n`;
      md += `- **Prescription**: ${sec.prescription}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Export Scorecard Diagnostic Summary
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Scorecard Content */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4 max-h-[70vh] overflow-y-auto">
          
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                {metrics.title || 'Untitled Book'}
              </h2>
              <span className="text-xs text-slate-400">
                Genre: {metrics.genre || 'General KDP'} | Price: ${metrics.price} | {metrics.reviewCount} reviews ({metrics.starRating}★)
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold uppercase text-slate-400">
                Overall Score
              </div>
              <div className={`text-2xl font-extrabold ${
                overallStatus === 'great' ? 'text-emerald-400' : overallStatus === 'warning' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {overallScore} / 100
              </div>
            </div>
          </div>

          {/* Key Metrics Quick Row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CTR</span>
              <span className="font-bold text-white">{computed.ctr}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Conversion</span>
              <span className="font-bold text-white">{computed.conversionRate}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ACoS</span>
              <span className="font-bold text-white">{computed.acos}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">KENP</span>
              <span className="font-bold text-white">{metrics.kenpReads.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Royalties</span>
              <span className="font-bold text-emerald-400">${computed.estimatedRoyalties}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Net Profit</span>
              <span className="font-bold text-teal-400">${computed.netProfit}</span>
            </div>
          </div>

          {/* Section Summaries */}
          <div className="space-y-3 pt-2">
            {sections.map((sec) => (
              <div key={sec.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">
                    {sec.title}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    sec.status === 'great' ? 'bg-emerald-500/20 text-emerald-300' : sec.status === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {sec.score}/100 ({sec.status.toUpperCase()})
                  </span>
                </div>
                <div className="text-[11px] text-amber-300 mb-1">
                  <strong>Missing:</strong> {sec.whatYouAreMissing}
                </div>
                <div className="text-[11px] text-emerald-400">
                  <strong>Action:</strong> {sec.prescription}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
