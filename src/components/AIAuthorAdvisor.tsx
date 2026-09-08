import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Target,
  FileEdit,
  TrendingDown
} from 'lucide-react';
import { BookMetrics, ComputedMetrics, ScoreItem, AIDiagnosisResult, ChatMessage } from '../types';

interface AIAuthorAdvisorProps {
  metrics: BookMetrics;
  computed: ComputedMetrics;
  scores: any;
  overallScore: number;
  sections: ScoreItem[];
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
}

export const AIAuthorAdvisor: React.FC<AIAuthorAdvisorProps> = ({
  metrics,
  computed,
  scores,
  overallScore,
  sections,
  prefilledPrompt,
  onClearPrefilledPrompt,
}) => {
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosisResult | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your AI Publishing Strategist. I have reviewed your scorecard (Overall: ${overallScore}/100). Ask me any question regarding your Amazon Ads, product page conversion, blurb copy, or series read-through.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Auto-run diagnosis on mount or title change
  useEffect(() => {
    runAIDiagnosis();
  }, [metrics.title]);

  useEffect(() => {
    if (prefilledPrompt) {
      handleQuickPrompt(`How can I fix the bottleneck in ${prefilledPrompt}?`);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt]);

  const runAIDiagnosis = async () => {
    setLoadingDiagnosis(true);
    try {
      const res = await fetch('/api/ai-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, computed, scores }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data);
      } else {
        throw new Error('Server response failed');
      }
    } catch (err) {
      console.warn('AI Diagnosis fallback to local heuristic:', err);
      // Fallback deterministic strategic summary
      setDiagnosis({
        verdictTitle: computed.netProfit < 0 ? 'High Advertising Leak with Low Conversion' : 'Profitable Baseline Ready for Scaling',
        bottleneckSummary: `Your book is converting ${computed.conversionRate}% of clicks into buyers with an ad spend of $${metrics.adSpend}/month. The biggest conversion dampener is click-through rate (${computed.ctr}%) and blurb drop-off.`,
        topMissingElement: computed.ctr < 0.35 
          ? 'Cover thumbnail lacks high-contrast typography in mobile search.' 
          : '3-second hook in Amazon blurb lacks emotional stakes.',
        adTactics: `Lower max bids on broad match by 20%. Isolate the top 5 converting search terms into exact match campaigns with dedicated $5/day budgets.`,
        blurbOrCoverPrescription: `Test a 3-line italicized high-drama hook above the blurb fold. Include clear genre trope badges in A+ Content.`,
        quickWins: [
          { priority: 'Immediate', action: 'Negate search terms with >10 clicks and 0 orders', expectedImpact: 'Cuts 15% ad waste', timeframe: 'Day 1' },
          { priority: 'High', action: 'Rewrite first 2 sentences of blurb hook', expectedImpact: '+1.5% conversion rate', timeframe: 'Day 3' },
          { priority: 'Medium', action: 'Add Look Inside preview link in back matter', expectedImpact: '+12% series read-through', timeframe: 'Week 1' },
        ],
      });
    } finally {
      setLoadingDiagnosis(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuestion;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6),
          metrics,
          computed,
          overallScore,
        }),
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.reply;
      } else {
        throw new Error('Chat API returned error');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `Based on your book's metrics (CTR: ${computed.ctr}%, Conversion: ${computed.conversionRate}%, ACoS: ${computed.acos}%), the most immediate fix is to rewrite the first 3 lines of your Amazon blurb and test exact match negative keywords on your ad campaigns.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputQuestion(promptText);
    handleSendMessage(promptText);
  };

  return (
    <div className="space-y-6">
      
      {/* Top AI Strategic Audit Panel */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 sm:p-7 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                AI Strategic Funnel Audit
              </h3>
              <p className="text-xs text-neutral-400">
                Automated advisory for <span className="font-semibold text-neutral-800">"{metrics.title || 'Your Book'}"</span>
              </p>
            </div>
          </div>

          <button
            id="btn-rerun-ai-diagnosis"
            onClick={runAIDiagnosis}
            disabled={loadingDiagnosis}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white transition cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loadingDiagnosis ? 'animate-spin' : ''}`} />
            <span>{loadingDiagnosis ? 'Auditing Funnel...' : 'Refresh AI Audit'}</span>
          </button>
        </div>

        {/* Diagnosis Results */}
        {loadingDiagnosis ? (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium text-neutral-500">
              Auditing Amazon KDP funnel, search CTR, conversion benchmarks, and ACoS efficiency...
            </p>
          </div>
        ) : diagnosis ? (
          <div className="space-y-4">
            
            {/* Verdict Headline Banner */}
            <div className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 mb-1 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Executive Verdict</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-neutral-900">
                {diagnosis.verdictTitle}
              </h4>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {diagnosis.bottleneckSummary}
              </p>
            </div>

            {/* Top Missing Element Callout */}
            <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-100">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                Primary Bottleneck Impacting Royalties
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {diagnosis.topMissingElement}
              </p>
            </div>

            {/* Strategy Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Ad Tactics */}
              <div className="bg-neutral-50/60 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Amazon Advertising Tactics</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {diagnosis.adTactics}
                </p>
              </div>

              {/* Blurb / Cover Prescription */}
              <div className="bg-neutral-50/60 rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Product Page & Conversion Tactics</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {diagnosis.blurbOrCoverPrescription || (diagnosis as any).blurbPrescription || 'Review cover typography contrast and blurb opening hook.'}
                </p>
              </div>
            </div>

            {/* Recommended 3-Step Action Plan */}
            {((diagnosis.priorityActions && diagnosis.priorityActions.length > 0) || ((diagnosis as any).quickWins && (diagnosis as any).quickWins.length > 0)) && (
              <div className="mt-4">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Immediate Optimization Steps
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(diagnosis.priorityActions || (diagnosis as any).quickWins || []).map((action: any, i: number) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-900 mb-1">
                          <span>{action.priority || `Step ${i + 1}`}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">{action.area || action.timeframe || ''}</span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {action.action}
                        </p>
                      </div>
                      <div className="text-[10px] text-emerald-600 mt-2 font-mono font-medium">
                        Impact: {action.expectedImpact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : null}
      </div>

      {/* Interactive KDP Publishing Strategist Chat */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-neutral-900 tracking-tight">
              Publishing Advisor Assistant
            </h4>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            Direct Model Diagnostic
          </span>
        </div>

        {/* Quick Question Chips */}
        <div className="mb-4">
          <span className="text-[11px] font-medium text-neutral-400 block mb-2">
            Suggested queries:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickPrompt("How do I fix my low conversion rate on this book?")}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              Fix Low Conversion Rate
            </button>
            <button
              onClick={() => handleQuickPrompt("How do I lower my ACoS without losing my Amazon search ranking?")}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              Lower Advertising ACoS
            </button>
            <button
              onClick={() => handleQuickPrompt("Give me a 3-sentence hook formula for my book's Amazon description.")}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              Blurb Hook Formula
            </button>
            <button
              onClick={() => handleQuickPrompt("Is my $4.99 price point right for my genre or should I test $3.99 / Kindle Unlimited?")}
              className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
            >
              Pricing & Royalties
            </button>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-50/90 border border-neutral-200/80 text-neutral-800'
                }`}
              >
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-2.5 items-center text-xs text-neutral-400">
              <div className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-200">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl px-4 py-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-bounce [animation-delay:0.4s]" />
                <span className="text-neutral-500 ml-1 text-xs">Formulating analysis...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question about your KDP numbers (e.g. 'How do I test my cover with PickFu?')"
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || chatLoading}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>

    </div>
  );
};
