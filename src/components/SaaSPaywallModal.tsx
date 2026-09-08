import React from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Bell, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface SaaSPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle?: string;
  onOpenPurchaseSuccess?: () => void;
}

// Direct Stripe Payment Link (Verified 30-Day Free Trial - $0 Due Today)
const STRIPE_PAYMENT_URL = 'https://buy.stripe.com/4gM14hbTKbYCfWz1N76EU01';

export const SaaSPaywallModal: React.FC<SaaSPaywallModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  onOpenPurchaseSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200/90 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-neutral-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 mb-3 border border-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>KDP SCORE CARD PRO</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-neutral-950">
            Automated Daily KDP Tracking
          </h3>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-sm mx-auto">
            Eliminate manual CSV downloads. Sync daily diagnostics and profit telemetry for {bookTitle ? <strong>"{bookTitle}"</strong> : 'your author catalog'}.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="space-y-3 mb-6 bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-4">
          <div className="flex items-start gap-2.5 text-xs text-neutral-700">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-neutral-900 font-semibold">Automated Amazon Ads & KDP Sync:</strong> Pulls yesterday’s and today’s orders, KENP reads, and ad spend without manual exports.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-neutral-700">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-neutral-900 font-semibold">Ad Spend Bleed Alerts:</strong> Real-time SMS & email notifications if ACoS spikes over your customized threshold.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-neutral-700">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-neutral-900 font-semibold">Listing Audit & Leak Scanner:</strong> Daily discoverability checks on keywords, categories, cover contrast, and blurb hooks.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-neutral-700">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-neutral-900 font-semibold">Unlimited Catalog Books:</strong> Score your entire series with individual book-by-book leak diagnostics.
            </div>
          </div>
        </div>

        {/* Pricing Card & CTA */}
        <div className="text-center space-y-3">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-3xl font-extrabold text-neutral-950 font-mono">$0</span>
            <span className="text-xs text-neutral-500 font-medium">due today</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 ml-2">
              30-Day Free Trial
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Then $20/month after 30 days • Cancel anytime in 1 click
          </div>

          <a
            id="btn-subscribe-stripe-modal"
            href={STRIPE_PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('pro_upgrade_clicked', { source: 'paywall_modal', price: 20 });
              trackEvent('trial_started', { source: 'paywall_modal' });
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-neutral-950 hover:bg-neutral-850 text-white transition cursor-pointer shadow-md hover:shadow-lg"
          >
            <span>Activate 30-Day Free Trial ($0 Due)</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
          </a>

          <div className="pt-1 space-y-1">
            <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Stripe alerts you 3 days before trial ends. Zero surprise charges.</span>
            </p>
          </div>

          {onOpenPurchaseSuccess && (
            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                id="btn-already-upgraded-preview"
                onClick={() => {
                  onClose();
                  onOpenPurchaseSuccess();
                }}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
              >
                Already subscribed? View Pro perks & confirmation screen
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
