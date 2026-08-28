import React, { useState } from 'react';
import { X, FileText, Sparkles, Check, ArrowRight, UploadCloud } from 'lucide-react';
import { BookMetrics } from '../types';

interface PasteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtractedMetrics: (metrics: Partial<BookMetrics>) => void;
}

export const PasteReportModal: React.FC<PasteReportModalProps> = ({
  isOpen,
  onClose,
  onApplyExtractedMetrics,
}) => {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const sample1 = `Amazon Advertising Campaign Report - Last 30 Days
Campaign: Dark Fantasy Sponsored Products
Impressions: 52,400
Clicks: 184
Spend: $118.50
Orders: 8
Sales: $39.92
ACoS: 296.8%
CPC: $0.64
KENP Read: 2,450 pages
Book: "The Cursed Grimoire"
Price: $4.99
Customer Rating: 4.1 out of 5 stars (18 reviews)`;

  const sample2 = `KDP Monthly Royalties Summary
Book Title: Rogue Hacker
eBook Orders: 42 units
eBook Price: $3.99
KENP Pages Read: 38,900
Impressions: 89,000
Clicks: 380
Ad Spend: $142.00
Star Rating: 4.6 (85 ratings)`;

  const sample3 = `Raw Stats:
45000 impressions, 95 clicks, 2 orders, $65 spent, 1200 kenp reads, 4.0 stars with 11 reviews, price $4.99`;

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/parse-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (data?.data) {
        onApplyExtractedMetrics(data.data);
        onClose();
      } else {
        setErrorMsg('Could not detect metrics in the pasted text. Try typing numbers directly in the Adjust Numbers tab.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to process text. Check format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Paste KDP / Amazon Ads Text
              </h3>
              <p className="text-xs text-slate-400">
                Paste raw text from your KDP dashboard or ads export to auto-populate your scorecard.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Buttons */}
        <div className="mb-3">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Or test with sample data:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRawText(sample1)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              Sample 1: Bleeding Ads Report
            </button>
            <button
              onClick={() => setRawText(sample2)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              Sample 2: KDP Royalties + KU Reads
            </button>
            <button
              onClick={() => setRawText(sample3)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              Sample 3: Quick Raw Numbers
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="mb-4">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={7}
            placeholder="Paste text from KDP Reports, Amazon Advertising Campaign manager, or copy-paste rows here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errorMsg && (
            <p className="text-xs text-red-400 mt-1.5">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleParse}
            disabled={!rawText.trim() || loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Extracting Numbers...' : 'Auto-Fill Scorecard'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
