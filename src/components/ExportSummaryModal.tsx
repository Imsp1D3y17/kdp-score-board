import React, { useState } from 'react';
import { X, Download, Copy, Check, Printer, BookOpen, CheckCircle2, Share2 } from 'lucide-react';
import { BookMetrics, ComputedMetrics, ScoreItem, ScoreStatus } from '../types';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: BookMetrics;
  computed: ComputedMetrics;
  overallScore: number;
  overallStatus: ScoreStatus;
  sections: ScoreItem[];
  onOpenShareModal?: () => void;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  metrics,
  computed,
  overallScore,
  overallStatus,
  sections,
  onOpenShareModal,
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200/90 rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative my-8 text-neutral-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Export Scorecard Audit Summary
            </h3>
            <p className="text-xs text-neutral-400">
              Formatted overview of your book's conversion diagnostics and financial outcomes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Scorecard Preview Box */}
        <div id="printable-scorecard" className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-5 mb-5 space-y-4">
          
          <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
            <div>
              <div className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                KDP SCORE CARD REPORT
              </div>
              <h4 className="text-lg font-bold text-neutral-900">
                {metrics.title || 'Untitled Book'}
              </h4>
              <span className="text-xs text-neutral-500">
                {metrics.genre || 'General'} · Price: ${metrics.price}
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold font-mono text-neutral-900">
                {overallScore}/100
              </span>
              <div className="text-[11px] font-semibold text-emerald-600 uppercase">
                {overallStatus}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-b border-neutral-200">
            <div>
              <span className="text-[10px] text-neutral-400">Estimated Royalties</span>
              <div className="font-mono font-bold text-neutral-900">${computed.estimatedRoyalties.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400">Ad Spend</span>
              <div className="font-mono font-bold text-neutral-900">${metrics.adSpend}</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400">Net Profit</span>
              <div className="font-mono font-bold text-neutral-900">${computed.netProfit.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400">Ad ACoS</span>
              <div className="font-mono font-bold text-neutral-900">{computed.acos}%</div>
            </div>
          </div>

          {/* Section Summary */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-neutral-900 text-xs">
              Diagnostics & Actions:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sections.map((sec) => (
                <div key={sec.id} className="bg-white p-2.5 rounded-lg border border-neutral-200/80">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-neutral-900 text-[11px]">{sec.title}</span>
                    <span className="font-mono font-bold text-[11px] text-neutral-700">{sec.score}/100</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 line-clamp-2">
                    {sec.prescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-500" />
            <span>Print Report</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenShareModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShareModal();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-300 transition cursor-pointer shadow-2xs"
                title="Share this book scorecard link"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Share Link</span>
              </button>
            )}

            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Markdown</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
