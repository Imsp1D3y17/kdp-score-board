import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Activity, 
  Search, 
  CheckCircle2, 
  Check
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface LandingPageProps {
  onStartAudit: () => void;
  onSelectPresetAndAudit?: (preset: any) => void;
  onOpenPricingModal?: () => void;
  onOpenShareModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAudit,
}) => {
  useEffect(() => {
    trackEvent('page_view_landing', { page: 'landing_architectural_single_cta' });
  }, []);

  // Static 30D architectural trend data
  const staticTrendPoints = [
    { day: 'W1', royalty: 920, spend: 210, net: 710 },
    { day: 'W2', royalty: 1140, spend: 245, net: 895 },
    { day: 'W3', royalty: 1290, spend: 230, net: 1060 },
    { day: 'W4', royalty: 1471, spend: 260, net: 1211 },
    { day: 'Current', royalty: 1620, spend: 280, net: 1340 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1A1A1E] font-sans antialiased selection:bg-[#1A1A1E] selection:text-[#F7F6F2] relative">
      
      {/* Precision Drafting Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1A1A1E 1px, transparent 1px),
            linear-gradient(to bottom, #1A1A1E 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Architectural Navigation Bar (Informational Only - No Clickable Links or Buttons) */}
      <header className="sticky top-0 z-40 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[#E5E4DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Wordmark (Static) */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#E5E4DE] shadow-xs flex-shrink-0">
              <img 
                src="/logo.jpg" 
                alt="KDP Scorecard Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[#1A1A1E] flex items-center gap-1.5">
                KDP <span className="text-[#2563EB]">·</span> Scorecard
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8E8E96]">
                Publishing Intelligence
              </span>
            </div>
          </div>

          {/* Centered System Framework Labels (Non-clickable structural status) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-[#8E8E96] select-none">
            <span>// SYSTEM ARCHITECTURE</span>
            <span>// ANALYTICS ENGINE</span>
            <span>// AUTONOMOUS COPILOT</span>
          </div>

          {/* Right Status Beacon (Static) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E4DE] text-[10px] font-mono text-[#5A5A62] select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYSTEM ONLINE v2.4</span>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 border-b border-[#E5E4DE] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Technical Plate Identifier */}
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-[#8E8E96] mb-8 pb-3 border-b border-[#E5E4DE] select-none">
            <div className="flex items-center gap-2">
              <span className="text-[#2563EB] font-bold">PLATE 01</span>
              <span>//</span>
              <span>CATALOG ANALYTICS FRAMEWORK</span>
            </div>
            <div className="hidden sm:block">
              LATENCY: 12MS · ZERO AMAZON PASSWORDS REQUIRED
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Typography & Intent */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-[#E5E4DE] text-xs font-mono tracking-wider text-[#1A1A1E] shadow-2xs select-none">
                <span className="w-2 h-2 rounded-xs bg-[#2563EB]" />
                <span className="font-semibold">PUBLISHING INTELLIGENCE ENGINE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1E] leading-[1.1]">
                Design your catalog's growth with <span className="underline decoration-[#2563EB] decoration-2 underline-offset-8">structural precision</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#5A5A62] leading-relaxed max-w-xl font-normal">
                An intelligent canvas that tracks royalties, maps keyword shifts, and uncovers revenue gaps without the spreadsheet clutter.
              </p>

              {/* PRIMARY CALL TO ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  id="btn-hero-primary-cta"
                  onClick={onStartAudit}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#1A1A1E] hover:bg-[#2F2F36] text-[#F7F6F2] font-semibold text-base transition cursor-pointer shadow-lg hover:shadow-xl group"
                >
                  <span>Explore the Engine</span>
                  <ArrowRight className="w-4 h-4 text-[#2563EB] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="btn-hero-sample-demo"
                  onClick={() => {
                    trackEvent('sample_data_clicked', { source: 'landing_hero' });
                    onStartAudit();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-white hover:bg-neutral-50 border border-[#D5D4CD] text-[#1A1A1E] font-semibold text-sm transition cursor-pointer shadow-sm hover:shadow"
                  title="Test the scorecard with pre-loaded 2026 Amazon KDP book data"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Try Demo with Sample Book</span>
                </button>
              </div>

              {/* Spec Highlights (Static) */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#E5E4DE] text-[#5A5A62] select-none">
                <div>
                  <div className="font-mono text-lg font-bold text-[#1A1A1E] tracking-tight">60s</div>
                  <div className="text-[11px] uppercase tracking-wider text-[#8E8E96] font-mono">Full Audit</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[#1A1A1E] tracking-tight">100%</div>
                  <div className="text-[11px] uppercase tracking-wider text-[#8E8E96] font-mono">Client-Side</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[#1A1A1E] tracking-tight">0</div>
                  <div className="text-[11px] uppercase tracking-wider text-[#8E8E96] font-mono">Passwords</div>
                </div>
              </div>

            </div>

            {/* Right Column: Studio Drafting Plate (Static Visual Display) */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-[#E5E4DE] rounded-xl shadow-lg p-5 sm:p-6 relative select-none">
                
                {/* Plate Corner Crosshairs */}
                <span className="absolute top-2 left-2 font-mono text-[10px] text-[#C5C4BC]">+</span>
                <span className="absolute top-2 right-2 font-mono text-[10px] text-[#C5C4BC]">+</span>
                <span className="absolute bottom-2 left-2 font-mono text-[10px] text-[#C5C4BC]">+</span>
                <span className="absolute bottom-2 right-2 font-mono text-[10px] text-[#C5C4BC]">+</span>

                {/* Header of the Drafting Plate */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E4DE] mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
                    <span className="font-mono text-xs font-bold tracking-wider text-[#1A1A1E] uppercase">
                      CATALOG MODEL // "THE NEON SHADOWS"
                    </span>
                  </div>

                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-[#1A1A1E] text-white">
                    30D ARCHITECTURAL TIMELINE
                  </div>
                </div>

                {/* Primary Metric Modules in Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded-lg">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E96]">Gross Royalties</div>
                    <div className="text-lg font-mono font-bold text-[#1A1A1E] mt-0.5">$4,912.40</div>
                    <div className="text-[10px] font-mono text-emerald-600 mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +18.4%
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded-lg">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E96]">Net Margin</div>
                    <div className="text-lg font-mono font-bold text-[#2563EB] mt-0.5">73.8%</div>
                    <div className="text-[10px] font-mono text-[#5A5A62] mt-1">Healthy Buffer</div>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded-lg">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E96]">Ad Spend</div>
                    <div className="text-lg font-mono font-bold text-[#1A1A1E] mt-0.5">$940.00</div>
                    <div className="text-[10px] font-mono text-amber-600 mt-1">ACoS 24.2%</div>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded-lg">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E96]">BSR Velocity</div>
                    <div className="text-lg font-mono font-bold text-[#1A1A1E] mt-0.5">#1,420</div>
                    <div className="text-[10px] font-mono text-emerald-600 mt-1">Top 0.05%</div>
                  </div>
                </div>

                {/* Architectural Drafting Chart Canvas */}
                <div className="relative bg-[#FAF9F6] border border-[#E5E4DE] rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#8E8E96]">
                    <span>NET ROYALTY SURPLUS (USD)</span>
                    <span className="text-[#2563EB]">NODE ACCURACY: 99.8%</span>
                  </div>

                  {/* SVG Blueprint Trendline */}
                  <div className="h-40 w-full relative">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 120">
                      {/* Grid reference lines */}
                      <line x1="0" y1="30" x2="400" y2="30" stroke="#E5E4DE" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="70" x2="400" y2="70" stroke="#E5E4DE" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="400" y2="110" stroke="#E5E4DE" strokeWidth="1" />

                      {/* Area Fill */}
                      <path
                        d="M 0,100 Q 80,85 160,70 T 300,35 T 400,20 L 400,120 L 0,120 Z"
                        fill="rgba(37, 99, 235, 0.06)"
                      />

                      {/* Line Curve */}
                      <path
                        d="M 0,100 Q 80,85 160,70 T 300,35 T 400,20"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                      />

                      {/* Coordinate Nodes */}
                      {staticTrendPoints.map((pt, idx) => {
                        const cx = (idx / (staticTrendPoints.length - 1)) * 380 + 10;
                        const cy = 110 - (pt.net / 220) * 80;

                        return (
                          <g key={pt.day}>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={idx === staticTrendPoints.length - 1 ? 5 : 3.5}
                              fill={idx === staticTrendPoints.length - 1 ? '#2563EB' : '#FFFFFF'}
                              stroke="#2563EB"
                              strokeWidth="2"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8E8E96] pt-2 border-t border-[#E5E4DE]">
                    <span>INTERVAL INCEPTION</span>
                    <span>BREAK-EVEN RATIO: 3.4X</span>
                    <span>INTERVAL TERMINUS</span>
                  </div>
                </div>

                {/* Active Diagnostic Status Strip with Traffic-Light Diagnostic Spectrum */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-emerald-950 text-[11px]">
                      DIAGNOSTIC STATUS: <strong>HEALTHY PROFIT (SCORE 88/100 · OPTIMAL)</strong>
                    </span>
                  </div>

                  {/* Explicit Red -> Amber -> Green Health Scale Bar */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-0.5">
                    <div className="px-2 py-1.5 rounded-md bg-rose-50/90 border border-rose-200 text-rose-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="truncate"><strong>&lt;50 RED</strong> // Bleed</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md bg-amber-50/90 border border-amber-200 text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate"><strong>50–74 AMBER</strong> // Warning</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md bg-emerald-50/90 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate"><strong>75+ GREEN</strong> // Best</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SYSTEM SUMMARY BAR */}
      <section className="py-10 border-b border-[#E5E4DE] bg-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="border-l-2 border-[#1A1A1E] pl-4">
              <div className="font-mono text-xs font-bold text-[#8E8E96] uppercase">01 // Architectural Ledger</div>
              <div className="font-semibold text-sm text-[#1A1A1E] mt-1">Book-by-Book Net Accounting</div>
              <div className="text-xs text-[#5A5A62] mt-1 leading-relaxed">
                Calculates true margins after print deductions, distribution fees, and ad spend.
              </div>
            </div>

            <div className="border-l-2 border-[#2563EB] pl-4">
              <div className="font-mono text-xs font-bold text-[#8E8E96] uppercase">02 // Hourly Radar</div>
              <div className="font-semibold text-sm text-[#1A1A1E] mt-1">Position & Search Tracking</div>
              <div className="text-xs text-[#5A5A62] mt-1 leading-relaxed">
                Monitors keyword placement and BSR trends in real-time across high-yield subgenres.
              </div>
            </div>

            <div className="border-l-2 border-[#1A1A1E] pl-4">
              <div className="font-mono text-xs font-bold text-[#8E8E96] uppercase">03 // Bleed Shield</div>
              <div className="font-semibold text-sm text-[#1A1A1E] mt-1">Amazon Ads Guardrails</div>
              <div className="text-xs text-[#5A5A62] mt-1 leading-relaxed">
                Flags search terms exceeding break-even ACoS before they deplete author profits.
              </div>
            </div>

            <div className="border-l-2 border-[#2563EB] pl-4">
              <div className="font-mono text-xs font-bold text-[#8E8E96] uppercase">04 // Publisher Agents</div>
              <div className="font-semibold text-sm text-[#1A1A1E] mt-1">Intelligent Prompt Copilot</div>
              <div className="text-xs text-[#5A5A62] mt-1 leading-relaxed">
                Generates pricing recommendations and A/B blurb adjustments based on mathematical elasticity.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE CHAPTERS: STUDIO MODULAR LAYOUT */}
      <section className="py-20 border-b border-[#E5E4DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Chapter 01 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#2563EB] font-bold uppercase tracking-widest">
                <span>CHAPTER 01</span>
                <span>//</span>
                <span>FINANCIAL FOUNDATION</span>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1E]">
                Net Royalty Architecture.
              </h2>
              
              <p className="text-sm sm:text-base text-[#5A5A62] leading-relaxed">
                Amazon reports give you gross figures that hide the real picture. Our architecture deducts printing costs, delivery fees, and per-click ad spend in real-time, giving you exact unit economics for every title.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs font-medium text-[#1A1A1E]">
                <li className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Calculates actual take-home royalties after POD page count deductions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Kindle Unlimited KENP read-through velocity modeled per page</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Break-even Target ACoS calculated against true net royalty margins</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white border border-[#E5E4DE] rounded-xl p-6 shadow-sm space-y-4 font-mono text-xs select-none">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DE] text-[11px] text-[#8E8E96]">
                  <span>LEDGER DISSECTION // TITLE: 039-B "THE SILENT ECHO"</span>
                  <span className="text-[#2563EB]">VERIFIED COMPUTATION</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded">
                    <div className="text-[10px] text-[#8E8E96]">LIST PRICE</div>
                    <div className="text-base font-bold text-[#1A1A1E]">$14.99</div>
                    <div className="text-[10px] text-[#5A5A62]">Paperback (320 Pages)</div>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded">
                    <div className="text-[10px] text-[#8E8E96]">POD PRINT COST</div>
                    <div className="text-base font-bold text-rose-600">-$4.85</div>
                    <div className="text-[10px] text-[#5A5A62]">Fixed + per page</div>
                  </div>
                  <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded">
                    <div className="text-[10px] text-[#8E8E96]">AMAZON SHARE</div>
                    <div className="text-base font-bold text-neutral-600">-$4.00</div>
                    <div className="text-[10px] text-[#5A5A62]">40% Distribution</div>
                  </div>
                </div>

                <div className="p-4 bg-[#F7F6F2] border border-[#E5E4DE] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#8E8E96] uppercase tracking-wider">Net Author Contribution Margin</div>
                    <div className="text-xl font-bold text-[#2563EB]">$6.14 <span className="text-xs text-[#5A5A62] font-normal">/ unit sold</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#8E8E96]">MAX BREAK-EVEN CPC</div>
                    <div className="text-sm font-bold text-emerald-700">$0.61 @ 10% CVR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 02 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-white border border-[#E5E4DE] rounded-xl p-6 shadow-sm space-y-4 font-mono text-xs select-none">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DE] text-[11px] text-[#8E8E96]">
                  <span>RADAR MATRIX // PRIMARY SEARCH NODES</span>
                  <span className="text-emerald-600">POLLING HOURLY</span>
                </div>

                <div className="space-y-2.5">
                  {/* Green: Best Rank */}
                  <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-[#1A1A1E]">"cyberpunk detective thriller"</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">BEST</span>
                      </div>
                      <div className="text-[10px] text-[#8E8E96] mt-0.5">Volume: 4,200/mo · Conversion: 14.2% · High Profit</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-600">#3 RANK</div>
                      <div className="text-[10px] text-emerald-700 font-bold">+2 positions today (Top 1%)</div>
                    </div>
                  </div>

                  {/* Yellow/Amber: Warning Rank */}
                  <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-bold text-[#1A1A1E]">"hard sci fi space opera series"</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">WARNING</span>
                      </div>
                      <div className="text-[10px] text-[#8E8E96] mt-0.5">Volume: 8,900/mo · Bid friction: Margin compressed</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-amber-600">#14 RANK</div>
                      <div className="text-[10px] text-amber-700 font-semibold">Suboptimal ACoS (42%)</div>
                    </div>
                  </div>

                  {/* Red: Bad / Bleed Rank */}
                  <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-bold text-[#1A1A1E]">"artificial intelligence noir"</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase">BAD / BLEED</span>
                      </div>
                      <div className="text-[10px] text-[#8E8E96] mt-0.5">Volume: 1,850/mo · 0 Sales on 38 clicks · Stop Target</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-rose-600">#48 RANK</div>
                      <div className="text-[10px] text-rose-700 font-bold">-16 positions (Negative ROI)</div>
                    </div>
                  </div>
                </div>

                {/* Clear Ranking Color Scale Caption */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E4DE] text-[10px] font-mono">
                  <span className="text-[#8E8E96]">RANKING SPECTRUM:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-semibold">🟢 GREEN = BEST (#1–#5)</span>
                    <span className="text-amber-700 font-semibold">🟡 AMBER = WARNING (#6–#20)</span>
                    <span className="text-rose-700 font-semibold">🔴 RED = BAD (&gt;#20)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#2563EB] font-bold uppercase tracking-widest">
                <span>CHAPTER 02</span>
                <span>//</span>
                <span>POSITION & DISCOVERY</span>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1E]">
                Position Mapping.
              </h2>
              
              <p className="text-sm sm:text-base text-[#5A5A62] leading-relaxed">
                Automated hourly monitoring of Amazon search positions visualized through continuous timeline nodes. Detect when competitors surge on your target keywords before your sales curve declines.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs font-medium text-[#1A1A1E]">
                <li className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Timeline trajectory nodes for your 10 most profitable search terms</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Early warning indicator when organic placement is superseded by sponsored bids</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Category Best Seller Rank (BSR) momentum delta</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Chapter 03 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#2563EB] font-bold uppercase tracking-widest">
                <span>CHAPTER 03</span>
                <span>//</span>
                <span>INTELLIGENCE AGENTS</span>
              </div>
              
              <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1E]">
                Publisher Agents.
              </h2>
              
              <p className="text-sm sm:text-base text-[#5A5A62] leading-relaxed">
                An intelligent prompt-driven copilot that operates on your exact scorecard data. Ask mathematical questions regarding pricing elasticity, subtitle adjustments, or negative keyword additions to reclaim wasted spend.
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF9F6] border border-[#E5E4DE] text-xs font-mono text-[#1A1A1E]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AUTONOMOUS AGENT ACTIVE IN ENGINE</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#1A1A1E] text-[#F7F6F2] rounded-xl p-6 shadow-xl space-y-4 font-mono text-xs border border-[#3A3A42] select-none">
                <div className="flex items-center justify-between pb-3 border-b border-[#3A3A42] text-[11px] text-[#8E8E96]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>AGENT SESSION // METRICS COPILOT</span>
                  </div>
                  <span>MODEL: GEMINI ARCHITECT</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded bg-[#25252B] border border-[#3A3A42]">
                    <span className="text-[#8E8E96]">&gt; USER QUERY:</span>
                    <p className="text-white mt-1">
                      "My ACoS is 44% on Amazon Ads for my $4.99 eBook. What is my break-even ACoS and what should I change?"
                    </p>
                  </div>

                  <div className="p-3 rounded bg-[#202026] border border-[#2563EB]/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-[#2563EB] font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>STRATEGIC VERDICT:</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-[11px]">
                      At $4.99 with 70% royalty, net royalty is <strong>$3.49</strong>. Your true break-even ACoS is <strong>70%</strong>. Your current 44% ACoS is comfortably profitable (26% net margin per sale).
                    </p>
                    <div className="pt-1 text-[11px] text-emerald-400">
                      Recommendation: Do not pause. Increase daily budget by 15% on high-performing ASIN target "B09X718A".
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ANALYTICAL CANVAS SECTION (Display Plates - No Extra Buttons) */}
      <section className="py-20 border-b border-[#E5E4DE] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 select-none">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#2563EB] font-bold uppercase tracking-widest">
              <span>EXPLORE MODES</span>
              <span>//</span>
              <span>STUDIO WORKBENCH</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1E]">
              Integrated Analytical Canvas.
            </h2>
            <p className="text-sm text-[#5A5A62]">
              How the engine models royalty structures, ad ROI break-evens, and category positioning.
            </p>
          </div>

          {/* Mode Badges (Display Only) */}
          <div className="flex justify-center select-none">
            <div className="inline-flex p-1 rounded-xl bg-[#F7F6F2] border border-[#E5E4DE] gap-1 text-xs font-mono text-[#5A5A62]">
              <span className="px-3.5 py-1.5 rounded-lg bg-[#1A1A1E] text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Sales Architecture</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-white text-[#1A1A1E] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Advertising ROI</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-white text-[#1A1A1E] flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span>Competitor Tracking</span>
              </span>
            </div>
          </div>

          {/* Display Canvas Container */}
          <div className="bg-[#FAF9F6] border border-[#E5E4DE] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 select-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E4DE]">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1E]">Amazon Advertising ROI & Bleed Detection</h3>
                <p className="text-xs text-[#5A5A62]">True break-even threshold analysis against live ad campaigns</p>
              </div>
              <div className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                AD EFFICIENCY: OPTIMAL (+18% SURPLUS)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
              <div className="bg-white p-4 rounded-xl border border-[#E5E4DE]">
                <div className="text-[11px] text-[#8E8E96]">TARGET ACOS (BREAK-EVEN)</div>
                <div className="text-xl font-bold text-[#1A1A1E] mt-1">34.5%</div>
                <div className="text-[11px] text-[#5A5A62] mt-1">Mathematical ceiling</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
                <div className="text-[11px] text-[#8E8E96] flex items-center justify-between">
                  <span>CURRENT ACTUAL ACOS</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">OPTIMAL</span>
                </div>
                <div className="text-xl font-bold text-emerald-600 mt-1">24.2%</div>
                <div className="text-[11px] text-emerald-700 mt-1 font-semibold">10.3% Profit Buffer (Below Target)</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20">
                <div className="text-[11px] text-[#8E8E96] flex items-center justify-between">
                  <span>WASTED SPEND DETECTED</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">BLEED ALERT</span>
                </div>
                <div className="text-xl font-bold text-rose-600 mt-1">-$38.40</div>
                <div className="text-[11px] text-rose-700 mt-1 font-semibold">3 non-converting ASINs flagged</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E5E4DE]">
                <div className="text-[11px] text-[#8E8E96]">AD ATTRIBUTED ROYALTIES</div>
                <div className="text-xl font-bold text-[#1A1A1E] mt-1">$2,140.00</div>
                <div className="text-[11px] text-emerald-600 mt-1">ROAS: 2.27X</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ACCESS & PRICING TIERS (Informational Plates - No Extra Action Buttons) */}
      <section className="py-20 border-b border-[#E5E4DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16 select-none">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#2563EB] font-bold uppercase tracking-widest">
              <span>ACCESS TIERS</span>
              <span>//</span>
              <span>TRANSPARENT PRICING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1E]">
              Studio Publishing Plans.
            </h2>
            <p className="text-sm sm:text-base text-[#5A5A62]">
              Accessible inside the engine. Start with the free manual audit or upgrade to automated daily synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch select-none">
            
            {/* Tier 1: Independent Author */}
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8E8E96] uppercase tracking-wider">TIER 01</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] text-[#5A5A62] border border-[#E5E4DE]">STANDARD</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1E]">Independent Author</h3>
                  <p className="text-xs text-[#5A5A62] mt-1">Manual diagnostic audits for single-title creators</p>
                </div>

                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-[#1A1A1E]">$0</span>
                  <span className="text-xs text-[#8E8E96]">/ lifetime</span>
                </div>

                <ul className="space-y-3 text-xs text-[#5A5A62] pt-4 border-t border-[#E5E4DE]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant color-coded scorecard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Break-even ACoS & pricing calculator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>What-If royalty simulator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Exportable executive summary</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 w-full py-3 rounded-lg bg-[#FAF9F6] border border-[#E5E4DE] text-[#5A5A62] font-mono text-xs text-center font-semibold">
                INCLUDED IN ENGINE
              </div>
            </div>

            {/* Tier 2: Studio Publisher (PRO) */}
            <div className="bg-[#1A1A1E] text-white border border-[#3A3A42] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold shadow-sm">
                RECOMMENDED // 30-DAY FREE TRIAL
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8E8E96] uppercase tracking-wider">TIER 02</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2A2A32] text-emerald-400 border border-[#3A3A42]">AUTOMATED</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">Studio Publisher</h3>
                  <p className="text-xs text-[#8E8E96] mt-1">Continuous catalog sync & automated bleed defense</p>
                </div>

                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-white">$20</span>
                  <span className="text-xs text-[#8E8E96]">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-[#C5C4BC] pt-4 border-t border-[#3A3A42]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Daily automated KDP morning sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Real-time Ad Bleed alerts (SMS & Email)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Unlimited catalog & series tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Publisher Agent prompt copilot (AI Strategist)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Self-service Stripe Customer Portal (Cancel anytime)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-2">
                <a
                  id="btn-landing-tier2-trial"
                  href="https://buy.stripe.com/4gM14hbTKbYCfWz1N76EU01"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent('trial_started', { source: 'landing_pricing_table' });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-xs font-mono transition cursor-pointer shadow-md hover:shadow-lg"
                >
                  <span>ACTIVATE 30-DAY FREE TRIAL ($0)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <div className="text-[10px] text-neutral-400 text-center mt-2 font-mono">
                  $0.00 due today • Cancel in 1 click
                </div>
              </div>
            </div>

            {/* Tier 3: Enterprise & Imprint (Private Beta / Waitlist) */}
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8E8E96] uppercase tracking-wider">TIER 03</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-300">
                    WAITLIST ONLY
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1E]">Enterprise & Imprint</h3>
                  <p className="text-xs text-[#5A5A62] mt-1">Multi-author imprint operations & high-volume pipelines</p>
                </div>

                <div className="space-y-0.5 font-mono">
                  <div className="text-2xl font-bold text-[#1A1A1E]">Private Beta</div>
                  <div className="text-[11px] text-[#8E8E96]">No live payments yet · By application</div>
                </div>

                <ul className="space-y-3 text-xs text-[#5A5A62] pt-4 border-t border-[#E5E4DE]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Up to 25 pen names & author catalogs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Client-facing white-label PDF dossiers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Custom automated API & webhook feeds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Priority founder onboarding upon Q4 rollout</span>
                  </li>
                </ul>

                <div className="p-3 bg-[#FAF9F6] border border-[#E5E4DE] rounded-lg text-[11px] text-[#5A5A62] leading-relaxed">
                  Enterprise automated billing is currently in development.
                </div>
              </div>

              <div className="mt-6 w-full py-3 rounded-lg bg-[#FAF9F6] border border-[#E5E4DE] text-[#5A5A62] font-mono text-xs text-center font-semibold">
                PRIVATE BETA WAITLIST
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ARCHITECTURAL FOOTER (Static Information - No Anchor Links) */}
      <footer className="py-14 bg-white border-t border-[#E5E4DE] text-[#5A5A62] text-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E5E4DE]">
            
            <div className="space-y-3">
              <div className="font-bold text-sm text-[#1A1A1E] flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-[#E5E4DE] shadow-2xs flex-shrink-0">
                  <img 
                    src="/logo.jpg" 
                    alt="KDP Scorecard Logo" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span>KDP Scorecard</span>
              </div>
              <p className="text-xs leading-relaxed text-[#8E8E96]">
                Architectural-grade analytics and publishing intelligence for independent authors and boutique imprint publishers.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="font-bold text-[#1A1A1E] uppercase text-[11px] tracking-wider">System Architecture</div>
              <div className="text-[#8E8E96]">Framework Specifications</div>
              <div className="text-[#8E8E96]">Book-by-Book Ledger Calculation</div>
              <div className="text-[#8E8E96]">Break-Even ACoS Diagnostics</div>
              <div className="text-[#8E8E96]">Studio Access Tiers</div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="font-bold text-[#1A1A1E] uppercase text-[11px] tracking-wider">Security & Specs</div>
              <div className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Client-Side Execution</span>
              </div>
              <div className="text-[#8E8E96]">Zero Amazon Account Access</div>
              <div className="text-[#8E8E96]">Encrypted Local Persistence</div>
              <div className="text-[#8E8E96]">Deterministic Model Math</div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="font-bold text-[#1A1A1E] uppercase text-[11px] tracking-wider">Publishing Engine</div>
              <div className="text-[#8E8E96]">Version 2.4.0-Production</div>
              <div className="text-[#8E8E96]">Port Ingress: 3000 Verified</div>
              <div className="text-[#8E8E96]">Single Action Funnel</div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#8E8E96] font-mono text-[11px]">
            <div>
              © {new Date().getFullYear()} KDP Scorecard. All mathematical rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>DESIGNED WITH PRECISION</span>
              <span>·</span>
              <span>CALM STUDIO DESK</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
