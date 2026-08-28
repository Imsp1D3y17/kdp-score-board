import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw,
  Zap,
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
      content: `Hello! I'm your AI KDP Publishing Strategist. I've analyzed your scorecard (Overall: **${overallScore}/100**). Ask me anything about fixing your conversion rate, trimming ad spend, rewriting your blurb hook, or optimizing your series read-through.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Auto-run diagnosis on mount
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
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookData: { ...metrics, ...computed },
          scores,
          overallScore,
        }),
      });
      const data = await res.json();
      if (data?.analysis) {
        setDiagnosis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to run AI diagnosis:', err);
    } finally {
      setLoadingDiagnosis(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuestion.trim();
    if (!query || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
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
          question: query,
          bookData: { ...metrics, ...computed },
          scores,
          overallScore,
        }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I am evaluating your metrics. Check your score breakdown above.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: 'Based on your score, the fastest win is to focus on the lowest-scored pillar in Red above.',
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
      
      {/* Top AI Diagnosis Panel */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 rounded-2xl border border-indigo-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Gemini AI Deep Diagnostic Audit
              </h2>
              <p className="text-xs text-slate-300">
                Personalized publishing audit for <span className="font-semibold text-white">"{metrics.title || 'Your Book'}"</span>
              </p>
            </div>
          </div>

          <button
            id="btn-rerun-ai-diagnosis"
            onClick={runAIDiagnosis}
            disabled={loadingDiagnosis}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loadingDiagnosis ? 'animate-spin' : ''}`} />
            <span>{loadingDiagnosis ? 'Analyzing Funnel...' : 'Refresh AI Audit'}</span>
          </button>
        </div>

        {/* Diagnosis Results */}
        {loadingDiagnosis ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-300">
              Auditing Amazon KDP funnel, search CTR, conversion benchmarks, and ACoS efficiency...
            </p>
          </div>
        ) : diagnosis ? (
          <div className="space-y-4">
            
            {/* Verdict Headline Banner */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-indigo-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Primary Executive Verdict:</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {diagnosis.verdictTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {diagnosis.bottleneckSummary}
              </p>
            </div>

            {/* Top Missing Element Callout */}
            <div className="bg-amber-950/30 rounded-xl p-3.5 border border-amber-500/30">
              <span className="text-xs font-bold text-amber-300 block mb-1">
                🚨 The #1 Missing Element Costing You Royalties:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                {diagnosis.topMissingElement}
              </p>
            </div>

            {/* Strategy Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Ad Tactics */}
              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Amazon Ads & Negative Keyword Strategy:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.adTactics}
                </p>
              </div>

              {/* Blurb / Cover Prescription */}
              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Cover & Blurb Optimization Advice:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.blurbOrCoverPrescription}
                </p>
              </div>
            </div>

            {/* Priority Action Roadmap */}
            {diagnosis.priorityActions && diagnosis.priorityActions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  AI Action Roadmap
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {diagnosis.priorityActions.map((action, idx) => (
                    <div key={idx} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                          idx === 0 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : idx === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {action.priority}
                        </span>
                        <div className="text-xs font-bold text-white mb-1">
                          {action.area}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {action.action}
                        </p>
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-2 font-medium">
                        Expected: {action.expectedImpact}
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
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Ask Your KDP Publishing Strategist
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Powered by Gemini 3.7
          </span>
        </div>

        {/* Quick Question Chips */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Instant Diagnostic Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickPrompt("How do I fix my low conversion rate on this book?")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              🎯 Fix Conversion Rate
            </button>
            <button
              onClick={() => handleQuickPrompt("How do I lower my ACoS without losing my Amazon search ranking?")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              📉 Lower Ad ACoS
            </button>
            <button
              onClick={() => handleQuickPrompt("Give me a 3-sentence hook formula for my book's Amazon description.")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              ✍️ Blurb Hook Formula
            </button>
            <button
              onClick={() => handleQuickPrompt("Is my $4.99 price point right for my genre or should I test $3.99 / Kindle Unlimited?")}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              💲 Pricing vs KU Strategy
            </button>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-400 ml-1">Strategist is formulating action steps...</span>
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
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || chatLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
