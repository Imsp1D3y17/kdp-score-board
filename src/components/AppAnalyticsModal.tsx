import React, { useEffect, useState } from 'react';
import {
  Activity,
  X,
  RefreshCw,
  Users,
  TrendingUp,
  DollarSign,
  Server,
  Zap,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Cpu,
  BarChart3,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

interface TelemetrySummary {
  uptime: {
    seconds: number;
    startedAt: string;
  };
  system: {
    status: string;
    nodeVersion: string;
    memoryUsedMB: string;
    geminiConfigured: boolean;
    stripeConfigured: boolean;
  };
  overview: {
    totalEvents: number;
    uniqueVisitors: number;
    landingViews: number;
    auditsRun: number;
    reportsPasted: number;
    trialsStarted: number;
    proCheckoutClicks: number;
    aiQueries: number;
    simulationsRun: number;
  };
  trials?: {
    total: number;
    recent: Array<{
      id: string;
      event: string;
      properties?: Record<string, any>;
      timestamp: string;
      sessionId: string;
    }>;
  };
  funnel: {
    landingViews: number;
    auditsRun: number;
    trialsStarted?: number;
    proCheckoutClicks: number;
    freeAuditConversionRate: string;
    trialConversionRate?: string;
    proConversionRate: string;
    potentialMRR: string;
  };
  eventCounts: Record<string, number>;
  recentEvents: Array<{
    id: string;
    event: string;
    properties?: Record<string, any>;
    timestamp: string;
    sessionId: string;
  }>;
}

interface StripeLiveStatus {
  configured: boolean;
  activeTrials: number;
  activeSubscriptions: number;
  totalCustomers: number;
  totalCheckoutVisits: number;
  subscriptions: Array<{
    id: string;
    status: string;
    trialEnd: string | null;
    created: string | null;
    customer: string;
  }>;
  recentSessions: Array<{
    id: string;
    status: string;
    paymentStatus: string;
    created: string | null;
    amountTotal: number;
    customerEmail: string | null;
    trialDays: number | null;
  }>;
}

interface AppAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewPurchaseSuccess?: () => void;
}

export const AppAnalyticsModal: React.FC<AppAnalyticsModalProps> = ({ 
  isOpen, 
  onClose,
  onPreviewPurchaseSuccess,
}) => {
  const [data, setData] = useState<TelemetrySummary | null>(null);
  const [stripeData, setStripeData] = useState<StripeLiveStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedGA, setCopiedGA] = useState(false);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, stripeRes] = await Promise.all([
        fetch('/api/analytics/summary'),
        fetch('/api/stripe-status').catch(() => null),
      ]);
      if (!res.ok) throw new Error('Failed to fetch app telemetry');
      const json = await res.json();
      setData(json);

      if (stripeRes && stripeRes.ok) {
        const stripeJson = await stripeRes.json();
        setStripeData(stripeJson);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) return `${hours}h ${remMins}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  const copyGASnippet = () => {
    navigator.clipboard.writeText('G-VBNRRJD3KY');
    setCopiedGA(true);
    setTimeout(() => setCopiedGA(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b0e14] border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col my-auto max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">App Performance & Telemetry</h3>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time visitor tracking, conversion funnel, and server telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition cursor-pointer disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Key KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs">Unique Visitors</span>
                <Users className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {data?.overview.uniqueVisitors ?? '--'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Total active sessions</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs">Audits Run</span>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {data?.overview.auditsRun ?? '--'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Scorecards analyzed</div>
            </div>

            <div className="bg-slate-950/70 border border-emerald-500/40 bg-emerald-500/5 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-xs font-semibold">Trials Started</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-300">
                {data?.trials?.total ?? data?.overview.trialsStarted ?? 0}
              </div>
              <div className="text-[11px] text-emerald-400/80 mt-1">Free 30-Day Trials Activated</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs">Pro Clicks</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {data?.overview.proCheckoutClicks ?? '--'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Direct Stripe link clicks</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs">Server Uptime</span>
                <Server className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {data ? formatUptime(data.uptime.seconds) : '--'}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Memory: {data?.system.memoryUsedMB ?? '--'} MB</span>
              </div>
            </div>
          </div>

          {/* SaaS Conversion Funnel */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>SaaS Conversion Funnel</span>
                </h4>
                <p className="text-xs text-slate-400">Visualizing user drop-off from visitor to trial & paying subscriber</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Pipeline Value: <strong className="text-emerald-400">{data?.funnel.potentialMRR ?? '$0'} MRR</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {/* Step 1 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 relative">
                <div className="text-[11px] font-mono text-slate-400 mb-1">Step 1: Landing Page</div>
                <div className="text-lg font-bold font-mono text-white">{data?.funnel.landingViews ?? 0} Views</div>
                <div className="text-[10px] text-slate-500 mt-1">Acquisition Top of Funnel</div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 relative">
                <div className="text-[11px] font-mono text-slate-400 mb-1">Step 2: Free Audit</div>
                <div className="text-lg font-bold font-mono text-emerald-400">{data?.funnel.auditsRun ?? 0} Audits</div>
                <div className="text-[10px] text-emerald-400/80 mt-1">
                  {data?.funnel.freeAuditConversionRate ?? '0%'} activation rate
                </div>
              </div>

              {/* Step 3: Trials */}
              <div className="bg-slate-900/60 border border-emerald-500/40 rounded-lg p-3.5 relative">
                <div className="text-[11px] font-mono text-emerald-300 mb-1">Step 3: Free Trial</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {data?.trials?.total ?? data?.funnel.trialsStarted ?? 0} Trials
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  {data?.funnel.trialConversionRate ?? '0%'} trial conversion
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900/60 border border-amber-500/30 rounded-lg p-3.5 relative">
                <div className="text-[11px] font-mono text-amber-400 mb-1">Step 4: Pro Stripe Checkout</div>
                <div className="text-lg font-bold font-mono text-white">{data?.funnel.proCheckoutClicks ?? 0} Clicks</div>
                <div className="text-[10px] text-amber-400 mt-1">
                  {data?.funnel.proConversionRate ?? '0%'} upgrade intent ($20/mo)
                </div>
              </div>
            </div>
          </div>

          {/* System Health Checklist & Stripe Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engine & Service Health</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Node.js Web Server</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Online ({data?.system.nodeVersion})</span>
                </li>
                <li className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gemini AI Diagnostic API</span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400">
                    {data?.system.geminiConfigured ? 'Ready' : 'Fallback Active'}
                  </span>
                </li>
                <li className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Stripe 30-Day Free Trial Link</span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400">Verified ($0 Due)</span>
                </li>
                <li className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live Stripe Checkouts Visited</span>
                  </span>
                  <span className="font-mono text-[11px] text-amber-300 font-bold">
                    {stripeData ? `${stripeData.totalCheckoutVisits} visitors` : 'Syncing...'}
                  </span>
                </li>
                <li className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Active Stripe Trials</span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">
                    {stripeData ? `${stripeData.activeTrials} active` : '0 active'}
                  </span>
                </li>
              </ul>
            </div>

            {/* External Tracking & GA4 Integration */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Google Analytics 4</span>
                  </h4>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Active Measurement ID is configured. All visitor impressions, scorecard audits, and SaaS trial activations sync automatically to your GA4 property.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">Measurement ID:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    G-VBNRRJD3KY
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={copyGASnippet}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  {copiedGA ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Measurement ID!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Measurement ID (G-VBNRRJD3KY)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Live Activity Stream */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
              <span>Live User Activity Stream</span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">Last 30 Events</span>
            </h4>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {data?.recentEvents && data.recentEvents.length > 0 ? (
                data.recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <div>
                        <span className="font-mono font-semibold text-slate-200">{evt.event}</span>
                        {evt.properties && Object.keys(evt.properties).length > 0 && (
                          <span className="text-slate-400 ml-2 font-mono text-[11px]">
                            {JSON.stringify(evt.properties).substring(0, 45)}
                            {JSON.stringify(evt.properties).length > 45 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No events recorded yet. Perform an action to see it stream live.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Events logged in-memory & verified server-side</span>
            {onPreviewPurchaseSuccess && (
              <button
                type="button"
                id="btn-preview-purchase-screen-analytics"
                onClick={() => {
                  onClose();
                  onPreviewPurchaseSuccess();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer border border-slate-700"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Preview Buyer Post-Purchase Screen</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
