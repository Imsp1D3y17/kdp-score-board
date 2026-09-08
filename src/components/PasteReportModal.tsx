import React, { useState } from 'react';
import { X, FileText, Sparkles, UploadCloud } from 'lucide-react';
import { BookMetrics } from '../types';
import { trackEvent } from '../utils/analytics';

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

      if (!res.ok) {
        throw new Error('AI extraction service failed');
      }

      const data = await res.json();
      if (data && data.metrics) {
        onApplyExtractedMetrics(data.metrics);
        trackEvent('report_pasted', { source: 'paste_modal' });
        onClose();
      } else {
        throw new Error('No metric tokens detected');
      }
    } catch (err: any) {
      console.warn('Extraction fallback to local regex:', err);
      // Fallback local regex parser
      const extracted: Partial<BookMetrics> = {};

      const impMatch = rawText.match(/(?:impressions?|imp)[:\s]+([\d,]+)/i);
      if (impMatch) extracted.impressions = parseInt(impMatch[1].replace(/,/g, ''), 10);

      const clickMatch = rawText.match(/(?:clicks?)[:\s]+([\d,]+)/i);
      if (clickMatch) extracted.clicks = parseInt(clickMatch[1].replace(/,/g, ''), 10);

      const spendMatch = rawText.match(/(?:spend|cost)[:\s]+\$?([\d,.]+)/i);
      if (spendMatch) extracted.adSpend = parseFloat(spendMatch[1].replace(/,/g, ''));

      const ordersMatch = rawText.match(/(?:orders?|units?)[:\s]+([\d,]+)/i);
      if (ordersMatch) extracted.orders = parseInt(ordersMatch[1].replace(/,/g, ''), 10);

      const kenpMatch = rawText.match(/(?:kenp|pages read)[:\s]+([\d,]+)/i);
      if (kenpMatch) extracted.kenpReads = parseInt(kenpMatch[1].replace(/,/g, ''), 10);

      const priceMatch = rawText.match(/(?:price)[:\s]+\$?([\d,.]+)/i);
      if (priceMatch) extracted.price = parseFloat(priceMatch[1]);

      const titleMatch = rawText.match(/(?:book|title)[:\s]+"([^"]+)"/i) || rawText.match(/(?:book title)[:\s]+([^\n\r]+)/i);
      if (titleMatch) extracted.title = titleMatch[1].trim();

      if (Object.keys(extracted).length > 0) {
        onApplyExtractedMetrics(extracted);
        trackEvent('report_pasted', { source: 'paste_modal_regex' });
        onClose();
      } else {
        setErrorMsg('Could not detect numerical KDP metrics. Try clicking one of the sample scenarios above.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-200/90 shadow-2xl p-6 sm:p-7">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Import KDP / Amazon Ads Data
              </h3>
              <p className="text-xs text-neutral-400">
                Paste raw report text to automatically populate your scorecard.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Buttons */}
        <div className="mb-3">
          <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
            Or load a test scenario:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRawText(sample1)}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              High ACoS Ads Report
            </button>
            <button
              onClick={() => setRawText(sample2)}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              KDP Royalties + KU
            </button>
            <button
              onClick={() => setRawText(sample3)}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              Quick Raw String
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
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          {errorMsg && (
            <p className="text-xs text-rose-600 mt-1.5 font-medium">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleParse}
            disabled={!rawText.trim() || loading}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Extracting...' : 'Extract & Apply Metrics'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
