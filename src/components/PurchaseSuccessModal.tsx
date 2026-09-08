import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  X, 
  ArrowRight, 
  BellRing, 
  ShieldCheck, 
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard: () => void;
  onOpenAdvisor?: (topic?: string) => void;
}

export const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDashboard,
  onOpenAdvisor,
}) => {
  const [alertEmail, setAlertEmail] = useState('');
  const [targetAcos, setTargetAcos] = useState('35');
  const [isAlertSaved, setIsAlertSaved] = useState(false);
  const [copiedReceiptLink, setCopiedReceiptLink] = useState(false);

  if (!isOpen) return null;

  const handleSaveAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail) return;
    setIsAlertSaved(true);
    trackEvent('pro_alerts_configured', { alertEmail, targetAcos });
    try {
      localStorage.setItem('kdp_pro_alert_email', alertEmail);
      localStorage.setItem('kdp_pro_alert_acos', targetAcos);
    } catch {}
    setTimeout(() => {
      setIsAlertSaved(false);
    }, 4000);
  };

  const handleCopyCustomerPortalLink = () => {
    navigator.clipboard.writeText('https://billing.stripe.com/p/login/test');
    setCopiedReceiptLink(true);
    setTimeout(() => setCopiedReceiptLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-neutral-900 my-8">
        
        {/* Close Button */}
        <button
          id="btn-close-purchase-success"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          title="Close confirmation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-3.5 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>SUBSCRIPTION ACTIVE</span>
            </span>
            <span className="text-xs text-neutral-400">• 30-Day Free Trial</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-950">
            Welcome to KDP Scorecard Pro!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-md mx-auto">
            Your payment was processed securely by Stripe. An email receipt and customer portal login have been sent to your billing address.
          </p>
        </div>

        {/* Pro Benefits Grid */}
        <div className="mb-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Active Pro Privileges
          </div>

          <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl divide-y divide-neutral-200/70 text-xs">
            <div className="p-3.5 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900">Automated Daily KDP Sync</div>
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  Eliminates manual CSV downloads. Your royalties, orders, and KENP pages sync automatically every morning.
                </div>
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 shrink-0 mt-0.5">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900">Amazon Ads Bleed Emergency Alerts</div>
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  Instant email & SMS notifications if your ad spend exceeds target ACoS or conversion rate drops below 5%.
                </div>
              </div>
            </div>

            <div className="p-3.5 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900">Full Catalog & Multi-Book Audits</div>
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  Audit and score unlimited books across your entire publisher bookshelf with persistent diagnostics.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Setup: Configure Bleed Alert Email */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-indigo-950">
              Quick Setup: Where should we send Ad Bleed alerts?
            </h4>
          </div>

          <form onSubmit={handleSaveAlerts} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  id="input-pro-alert-email"
                  type="email"
                  required
                  placeholder="author@example.com"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-indigo-300 bg-white text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <div className="flex items-center rounded-lg border border-indigo-300 bg-white px-2 py-1.5">
                  <span className="text-[11px] text-neutral-500 mr-1">ACoS &gt;</span>
                  <input
                    id="input-pro-alert-acos"
                    type="number"
                    min="10"
                    max="100"
                    value={targetAcos}
                    onChange={(e) => setTargetAcos(e.target.value)}
                    className="w-full text-xs font-bold text-neutral-900 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500">%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-indigo-800/80">
                {isAlertSaved ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Saved! You're protected against ad bleed.
                  </span>
                ) : (
                  'Alert triggers if ad spend overtakes royalties'
                )}
              </span>
              <button
                id="btn-save-pro-alerts"
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shrink-0"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Primary Actions */}
        <div className="space-y-3">
          <button
            id="btn-pro-enter-dashboard"
            onClick={() => {
              onClose();
              onNavigateToDashboard();
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs sm:text-sm font-bold bg-neutral-950 hover:bg-neutral-800 text-white transition cursor-pointer shadow-sm"
          >
            <span>Launch Pro Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 px-1 border-t border-neutral-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>30-Day trial active • Cancel anytime</span>
            </div>

            <button
              id="btn-copy-billing-portal"
              onClick={handleCopyCustomerPortalLink}
              className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
              title="Manage Stripe Billing Portal"
            >
              {copiedReceiptLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3 h-3" />
                  <span>Stripe Billing Portal</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
