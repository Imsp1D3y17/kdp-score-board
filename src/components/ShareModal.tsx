import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Link2, 
  Twitter, 
  Mail, 
  Send, 
  X, 
  Globe, 
  Sparkles, 
  ExternalLink,
  MessageCircle,
  FileText
} from 'lucide-react';
import { BookMetrics, ComputedMetrics, ScoreStatus } from '../types';
import { trackEvent } from '../utils/analytics';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: BookMetrics;
  computed: ComputedMetrics;
  overallScore: number;
  overallStatus: ScoreStatus;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  metrics,
  computed,
  overallScore,
  overallStatus,
}) => {
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Generate share URL
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    
    if (!includeNumbers) {
      return base + '#scorecard';
    }

    try {
      const payload = {
        title: metrics.title,
        genre: metrics.genre,
        price: metrics.price,
        orders: metrics.orders,
        clicks: metrics.clicks,
        spend: metrics.adSpend,
        sales: metrics.adSales,
        imp: metrics.impressions,
        kenp: metrics.kenpReads,
        pages: metrics.pageCount,
        rating: metrics.starRating,
        reviews: metrics.reviewCount,
        isLow: metrics.isLowContent,
        lowType: metrics.lowContentType,
        aplus: metrics.hasAplusContent,
        ink: metrics.interiorColor,
      };
      
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      return `${base}?share=${encoded}#scorecard`;
    } catch {
      return `${base}?title=${encodeURIComponent(metrics.title)}#scorecard`;
    }
  }, [metrics, includeNumbers]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      trackEvent('share_link_copied', { title: metrics.title, overallScore });
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const formattedSummary = `📊 KDP Book Health Scorecard: ${metrics.title || 'Untitled Book'}
• Overall Health Score: ${overallScore}/100 (${overallStatus.toUpperCase()})
• Click-Through Rate (CTR): ${computed.ctr}%
• Conversion Rate: ${computed.conversionRate}%
• Amazon Ads ACoS: ${computed.acos}% (Breakeven: ${computed.breakevenAcos}%)
• Est. Monthly Net Profit: $${computed.netProfit.toFixed(0)}/mo
Inspect complete audit breakdown: ${shareUrl}`;

  const handleCopySummary = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formattedSummary);
      setCopiedSummary(true);
      trackEvent('share_summary_copied', { title: metrics.title });
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const tweetText = encodeURIComponent(
    `I just audited my Amazon KDP book "${metrics.title}" on the KDP Scorecard! Overall score: ${overallScore}/100. Check out the diagnostic report:`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;

  const emailSubject = encodeURIComponent(`KDP Book Health Scorecard: ${metrics.title}`);
  const emailBody = encodeURIComponent(
    `Hey,\n\nTake a look at the KDP Book Health Audit for "${metrics.title}":\n\nOverall Score: ${overallScore}/100 (${overallStatus.toUpperCase()})\nEst. Net Royalties: $${computed.netProfit.toFixed(0)}/mo\n\nYou can review the full breakdown here:\n${shareUrl}\n\nGenerated via KDP Scorecard.`
  );
  const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `KDP Book Scorecard for "${metrics.title}": ${overallScore}/100\n${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                Share Scorecard Link
              </h3>
              <p className="text-xs text-neutral-500">
                Share this interactive book health audit with clients, co-authors, or author groups.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Active Book Card Preview */}
          <div className="p-3.5 bg-neutral-900 text-white rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center font-mono font-bold text-lg text-emerald-400 shrink-0">
                {overallScore}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 truncate">
                  {metrics.genre || 'Book Audit'}
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {metrics.title || 'Untitled Book'}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                overallStatus === 'great' ? 'text-emerald-400' :
                overallStatus === 'warning' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {overallStatus.toUpperCase()}
              </span>
              <div className="text-[11px] text-neutral-400 font-mono">
                ${computed.netProfit.toFixed(0)}/mo net
              </div>
            </div>
          </div>

          {/* Primary Share Link Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-neutral-600" />
                <span>Direct Shareable Link</span>
              </label>
              <span className="text-[11px] text-neutral-500 font-medium">
                Instant access • No login required
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs text-neutral-800 font-mono truncate focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <button
                id="btn-copy-share-url"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Numbers Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 select-none">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <span>Include my book's custom numbers in the link</span>
              </label>
              <span className="text-[10px] text-neutral-400">
                {includeNumbers ? 'Loads this exact scorecard' : 'Loads blank audit'}
              </span>
            </div>
          </div>

          {/* 1-Click Social & Message Sharing */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-700 block">
              Share to Communities & Masterminds
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('share_twitter_clicked', { title: metrics.title })}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-800 transition"
              >
                <Twitter className="w-3.5 h-3.5 text-sky-500" />
                <span>X / Twitter</span>
              </a>

              <a
                href={emailUrl}
                onClick={() => trackEvent('share_email_clicked', { title: metrics.title })}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-800 transition"
              >
                <Mail className="w-3.5 h-3.5 text-rose-500" />
                <span>Email</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('share_whatsapp_clicked', { title: metrics.title })}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-800 transition"
              >
                <Send className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopySummary}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  copiedSummary
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                }`}
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-neutral-500" />}
                <span>{copiedSummary ? 'Copied Text!' : 'Copy Summary'}</span>
              </button>
            </div>
          </div>

          {/* Social Proof & Virality Note */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">
                Great for Coaching, Book Launches & Mastermind Feedback
              </p>
              <p>
                Anyone with this link can view the complete diagnostic scorecard, evaluate CTR and conversion leaks, and run simulations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Powered by KDP Scorecard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
