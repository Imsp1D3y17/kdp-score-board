import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Search, 
  Barcode, 
  Sliders, 
  FileText, 
  Sparkles, 
  Check, 
  Camera, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Eye,
  ShoppingCart,
  Notebook,
  Palette,
  Layers,
  Printer
} from 'lucide-react';
import { BookMetrics } from '../types';
import { calculateComputedMetrics, evaluateScorecard, calculateKdpPrintCost } from '../utils/calculator';
import { trackEvent } from '../utils/analytics';

interface BookScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBookMetrics: (metrics: Partial<BookMetrics>) => void;
  currentMetrics?: BookMetrics;
}

export const BookScannerModal: React.FC<BookScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyBookMetrics,
  currentMetrics,
}) => {
  const [activeMode, setActiveMode] = useState<'scan' | 'low-content' | 'manual' | 'paste'>('scan');
  
  // Search / Scan tab state
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [scanError, setScanError] = useState('');

  // Camera Barcode Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Low-Content Form State
  const [lowContentData, setLowContentData] = useState<BookMetrics>(() => {
    if (currentMetrics && currentMetrics.isLowContent) {
      return { ...currentMetrics };
    }
    const defaultPages = 120;
    const defaultCost = calculateKdpPrintCost(defaultPages, 'black_white');
    return {
      title: '5-Minute Daily Gratitude & Mindfulness Journal',
      genre: 'Low Content / Guided Journal',
      price: 7.99,
      paperbackPrice: 7.99,
      royaltyRate: 0.60,
      impressions: 42000,
      clicks: 160,
      orders: 16,
      adSpend: 48.0,
      adSales: 127.84,
      kenpReads: 0,
      pageCount: defaultPages,
      starRating: 4.5,
      reviewCount: 22,
      seriesReadThrough: 0,
      seriesBookCount: 1,
      bsrRank: 58000,
      isLowContent: true,
      lowContentType: 'journal',
      interiorColor: 'black_white',
      printCost: defaultCost,
      hasAplusContent: true,
    };
  });

  // Manual Form State (pre-populated with existing metrics or sensible defaults)
  const [manualData, setManualData] = useState<BookMetrics>(() => {
    return currentMetrics || {
      title: 'My Active Book',
      genre: 'General Fiction / Non-Fiction',
      price: 4.99,
      paperbackPrice: 14.99,
      royaltyRate: 0.70,
      impressions: 45000,
      clicks: 180,
      orders: 14,
      adSpend: 95.0,
      adSales: 60.0,
      kenpReads: 15000,
      pageCount: 320,
      starRating: 4.5,
      reviewCount: 35,
      seriesReadThrough: 60,
      seriesBookCount: 1,
      bsrRank: 42000,
    };
  });

  // Paste Tab State
  const [rawPasteText, setRawPasteText] = useState('');
  const [pasteLoading, setPasteLoading] = useState(false);
  const [pasteError, setPasteError] = useState('');

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen && currentMetrics) {
      if (currentMetrics.isLowContent) {
        setLowContentData({ ...currentMetrics });
        setActiveMode('low-content');
      } else {
        setManualData({ ...currentMetrics });
      }
    }
  }, [isOpen, currentMetrics]);

  // Clean up camera stream when modal closes or unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access denied or unavailable. You can type your book title or ISBN manually.');
      setIsCameraActive(false);
    }
  };

  // Trigger Mock or Real Barcode Detection
  const handleSimulateBarcodeScan = (mockIsbn: string, titleName: string) => {
    stopCamera();
    setQuery(mockIsbn);
    handleLookup(mockIsbn, titleName);
  };

  if (!isOpen) return null;

  // Real-time live score calculation for manual form
  const liveComputed = calculateComputedMetrics(manualData);
  const liveScorecard = evaluateScorecard(manualData, liveComputed);

  // Real-time live score calculation for low content form
  const liveLowContentComputed = calculateComputedMetrics(lowContentData);
  const liveLowContentScorecard = evaluateScorecard(lowContentData, liveLowContentComputed);

  // Search / Scan API Call
  const handleLookup = async (lookupQuery?: string, overrideTitle?: string) => {
    const q = (lookupQuery || query).trim();
    if (!q) return;

    setIsScanning(true);
    setScanError('');
    setScannedResult(null);

    try {
      const res = await fetch('/api/lookup-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        throw new Error('Failed to lookup book data');
      }

      const json = await res.json();
      if (json && json.data) {
        const item = json.data;
        if (overrideTitle) item.title = overrideTitle;
        setScannedResult(item);
        trackEvent('book_scanned', { query: q, title: item.title, genre: item.genre });
      } else {
        throw new Error('No book match found');
      }
    } catch (err: any) {
      console.warn('Lookup error:', err);
      // Fallback local heuristic match
      const fallbackItem = {
        title: overrideTitle || q.replace(/^(http|asin|isbn)[:\s]*/i, ''),
        genre: 'Commercial Fiction',
        price: 4.99,
        paperbackPrice: 14.99,
        royaltyRate: 0.70,
        impressions: 48000,
        clicks: 175,
        orders: 12,
        adSpend: 92.0,
        adSales: 54.0,
        kenpReads: 18000,
        pageCount: 310,
        starRating: 4.4,
        reviewCount: 42,
        seriesBookCount: 1,
        seriesReadThrough: 60,
        bsrRank: 41000,
        detectedBottleneck: 'Estimated baseline for this title. You can fine-tune your actual KDP numbers.',
      };
      setScannedResult(fallbackItem);
    } finally {
      setIsScanning(false);
    }
  };

  // Apply Scanned Result
  const handleApplyScannedResult = () => {
    if (!scannedResult) return;
    onApplyBookMetrics(scannedResult);
    trackEvent('scanned_book_applied', { title: scannedResult.title });
    onClose();
  };

  // Apply Manual Data
  const handleApplyManual = () => {
    onApplyBookMetrics(manualData);
    trackEvent('manual_book_applied', { title: manualData.title });
    onClose();
  };

  // Apply Low Content Data
  const handleApplyLowContent = () => {
    onApplyBookMetrics(lowContentData);
    trackEvent('low_content_applied', { title: lowContentData.title });
    onClose();
  };

  // Parse Paste Data
  const handleParsePaste = async () => {
    if (!rawPasteText.trim()) return;
    setPasteLoading(true);
    setPasteError('');

    try {
      const res = await fetch('/api/parse-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawPasteText }),
      });

      if (!res.ok) throw new Error('Parsing failed');

      const data = await res.json();
      if (data && (data.data || data.metrics)) {
        const metrics = data.data || data.metrics;
        onApplyBookMetrics(metrics);
        trackEvent('report_pasted', { source: 'scanner_modal' });
        onClose();
      } else {
        throw new Error('No metric tokens detected');
      }
    } catch (err: any) {
      console.warn('Regex fallback for paste:', err);
      const extracted: Partial<BookMetrics> = {};
      const impMatch = rawPasteText.match(/(?:impressions?|imp)[:\s]+([\d,]+)/i);
      if (impMatch) extracted.impressions = parseInt(impMatch[1].replace(/,/g, ''), 10);
      const clickMatch = rawPasteText.match(/(?:clicks?)[:\s]+([\d,]+)/i);
      if (clickMatch) extracted.clicks = parseInt(clickMatch[1].replace(/,/g, ''), 10);
      const spendMatch = rawPasteText.match(/(?:spend|cost)[:\s]+\$?([\d,.]+)/i);
      if (spendMatch) extracted.adSpend = parseFloat(spendMatch[1].replace(/,/g, ''));
      const ordersMatch = rawPasteText.match(/(?:orders?|units?)[:\s]+([\d,]+)/i);
      if (ordersMatch) extracted.orders = parseInt(ordersMatch[1].replace(/,/g, ''), 10);
      const kenpMatch = rawPasteText.match(/(?:kenp|pages read)[:\s]+([\d,]+)/i);
      if (kenpMatch) extracted.kenpReads = parseInt(kenpMatch[1].replace(/,/g, ''), 10);
      const priceMatch = rawPasteText.match(/(?:price)[:\s]+\$?([\d,.]+)/i);
      if (priceMatch) extracted.price = parseFloat(priceMatch[1]);
      const titleMatch = rawPasteText.match(/(?:book|title)[:\s]+"([^"]+)"/i) || rawPasteText.match(/(?:book title)[:\s]+([^\n\r]+)/i);
      if (titleMatch) extracted.title = titleMatch[1].trim();

      if (Object.keys(extracted).length > 0) {
        onApplyBookMetrics(extracted);
        onClose();
      } else {
        setPasteError('Could not find numbers. Please check your text or switch to Manual Entry.');
      }
    } finally {
      setPasteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200/90 shadow-2xl p-5 sm:p-7 text-neutral-900 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-900 text-white shadow-2xs">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight">
                Score Your Book: Scan or Enter Details
              </h3>
              <p className="text-xs text-neutral-400">
                Instantly generate a color-coded health scorecard by title, ASIN, ISBN, or manual numbers.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl my-4 text-xs font-semibold">
          <button
            onClick={() => {
              stopCamera();
              setActiveMode('scan');
            }}
            className={`py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'scan'
                ? 'bg-white text-neutral-950 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="truncate">Scan / Title</span>
          </button>

          <button
            id="tab-low-content-fillin"
            onClick={() => {
              stopCamera();
              setActiveMode('low-content');
            }}
            className={`py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'low-content'
                ? 'bg-white text-neutral-950 shadow-xs font-bold'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            <Notebook className="w-3.5 h-3.5 text-amber-600" />
            <span className="truncate">Low Content</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveMode('manual');
            }}
            className={`py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'manual'
                ? 'bg-white text-neutral-950 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="truncate">Standard Book</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveMode('paste');
            }}
            className={`py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'paste'
                ? 'bg-white text-neutral-950 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate">Paste KDP</span>
          </button>
        </div>

        {/* MODE 1: SCAN BY TITLE / ASIN / ISBN */}
        {activeMode === 'scan' && (
          <div className="space-y-4">
            
            {/* Search Input Bar */}
            <div className="relative">
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Book Title, Amazon ASIN (B0...), ISBN-10/13, or Amazon Link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLookup();
                    }}
                    placeholder="e.g. Atomic Habits, The Silent Patient, or B08XYZ1234..."
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                  />
                </div>

                <button
                  onClick={() => handleLookup()}
                  disabled={!query.trim() || isScanning}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Scan & Score'}</span>
                </button>
              </div>
            </div>

            {/* Quick Test Chips & Barcode Camera Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">Quick tests:</span>
                <button
                  onClick={() => {
                    setQuery('The Silent Patient');
                    handleLookup('The Silent Patient');
                  }}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                >
                  The Silent Patient
                </button>
                <button
                  onClick={() => {
                    setQuery('Fourth Wing');
                    handleLookup('Fourth Wing');
                  }}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                >
                  Fourth Wing (Fantasy)
                </button>
                <button
                  onClick={() => {
                    setQuery('Atomic Habits');
                    handleLookup('Atomic Habits');
                  }}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                >
                  Atomic Habits
                </button>
              </div>

              <button
                onClick={() => {
                  if (isCameraActive) stopCamera();
                  else startCamera();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-neutral-600" />
                <span>{isCameraActive ? 'Close Camera' : 'Scan Physical Barcode'}</span>
              </button>
            </div>

            {/* Camera Viewfinder (if active) */}
            {isCameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 p-4 text-center">
                <div className="relative max-w-sm mx-auto h-48 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Aiming Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-28 border-2 border-emerald-400 border-dashed rounded-lg bg-emerald-400/10 flex flex-col items-center justify-center">
                      <Barcode className="w-8 h-8 text-emerald-300 opacity-80" />
                      <span className="text-[10px] font-mono text-emerald-200 mt-1 uppercase tracking-wider">
                        Point at ISBN Barcode
                      </span>
                    </div>
                  </div>
                </div>

                {cameraError ? (
                  <p className="text-xs text-rose-400 mt-2">{cameraError}</p>
                ) : (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleSimulateBarcodeScan('9781250178602', 'The Silent Patient (Scanned ISBN)')}
                      className="text-xs px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full cursor-pointer transition border border-neutral-700"
                    >
                      Simulate ISBN Barcode Read
                    </button>
                    <button
                      onClick={stopCamera}
                      className="text-xs px-3 py-1 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Scanned Result Card */}
            {scannedResult && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      <BookOpen className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Scan Verified
                      </span>
                      <h4 className="text-base font-extrabold text-neutral-950 mt-1">
                        {scannedResult.title}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {scannedResult.genre} · List Price: ${scannedResult.price}
                      </p>
                    </div>
                  </div>

                  {/* Calculated Health Badge */}
                  {(() => {
                    const comp = calculateComputedMetrics(scannedResult);
                    const sc = evaluateScorecard(scannedResult, comp);
                    return (
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-neutral-900">
                          {sc.overallScore}/100
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          sc.overallStatus === 'great' ? 'text-emerald-600' :
                          sc.overallStatus === 'warning' ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {sc.overallStatus === 'great' ? 'Healthy Funnel' : sc.overallStatus === 'warning' ? 'Moderate Leaks' : 'Critical Bottleneck'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Key Metrics Quick Pill Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Impressions</span>
                    <div className="font-mono font-bold text-neutral-900 mt-0.5">
                      {scannedResult.impressions?.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Clicks (CTR)</span>
                    <div className="font-mono font-bold text-neutral-900 mt-0.5">
                      {scannedResult.clicks} ({scannedResult.impressions > 0 ? ((scannedResult.clicks / scannedResult.impressions) * 100).toFixed(2) : 0}%)
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Orders (CVR)</span>
                    <div className="font-mono font-bold text-neutral-900 mt-0.5">
                      {scannedResult.orders} ({scannedResult.clicks > 0 ? ((scannedResult.orders / scannedResult.clicks) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Ad Spend</span>
                    <div className="font-mono font-bold text-neutral-900 mt-0.5">
                      ${scannedResult.adSpend}
                    </div>
                  </div>
                </div>

                {scannedResult.detectedBottleneck && (
                  <div className="text-xs text-neutral-700 bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-neutral-900 font-semibold">Primary Diagnosis: </strong>
                      <span>{scannedResult.detectedBottleneck}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setManualData({ ...scannedResult });
                      setActiveMode('manual');
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-white border border-neutral-200 transition cursor-pointer"
                  >
                    Fine-tune Numbers Manually
                  </button>

                  <button
                    onClick={handleApplyScannedResult}
                    className="px-5 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Score & Load into Dashboard</span>
                  </button>
                </div>
              </div>
            )}

            {scanError && (
              <p className="text-xs text-rose-600 font-medium">{scanError}</p>
            )}

          </div>
        )}

        {/* MODE: LOW-CONTENT FILL-IN SECTION */}
        {activeMode === 'low-content' && (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            
            {/* Quick Fill-in Presets */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Popular Low-Content Presets
                </span>
                <span className="text-[10px] text-amber-800 font-medium">
                  Click to pre-fill standard unit economics
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    name: 'Gratitude Journal',
                    title: '5-Minute Daily Gratitude Journal',
                    type: 'journal' as const,
                    price: 7.99,
                    pages: 120,
                    ink: 'black_white' as const,
                    aplus: true,
                    orders: 16,
                    clicks: 160,
                    spend: 48.0,
                    sales: 127.84,
                    imp: 42000,
                  },
                  {
                    name: 'Daily Planner',
                    title: 'Ultimate 90-Day Productivity Planner',
                    type: 'planner' as const,
                    price: 9.99,
                    pages: 140,
                    ink: 'black_white' as const,
                    aplus: true,
                    orders: 22,
                    clicks: 190,
                    spend: 66.0,
                    sales: 219.78,
                    imp: 51000,
                  },
                  {
                    name: 'Coloring Book',
                    title: 'Mindful Floral Coloring Book for Adults',
                    type: 'coloring_book' as const,
                    price: 8.99,
                    pages: 84,
                    ink: 'black_white' as const,
                    aplus: true,
                    orders: 34,
                    clicks: 240,
                    spend: 85.0,
                    sales: 305.66,
                    imp: 68000,
                  },
                  {
                    name: 'Fitness Logbook',
                    title: 'Daily Gym & Workout Training Logbook',
                    type: 'logbook' as const,
                    price: 6.99,
                    pages: 100,
                    ink: 'black_white' as const,
                    aplus: false,
                    orders: 8,
                    clicks: 120,
                    spend: 45.0,
                    sales: 55.92,
                    imp: 28000,
                  },
                  {
                    name: 'Sudoku & Puzzle',
                    title: '1,000 Sudoku Puzzles for Adults Medium to Hard',
                    type: 'puzzle_book' as const,
                    price: 8.99,
                    pages: 120,
                    ink: 'black_white' as const,
                    aplus: true,
                    orders: 25,
                    clicks: 180,
                    spend: 52.0,
                    sales: 224.75,
                    imp: 49000,
                  }
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      const printCost = calculateKdpPrintCost(p.pages, p.ink);
                      setLowContentData((prev) => ({
                        ...prev,
                        title: p.title,
                        lowContentType: p.type,
                        price: p.price,
                        paperbackPrice: p.price,
                        pageCount: p.pages,
                        interiorColor: p.ink,
                        hasAplusContent: p.aplus,
                        orders: p.orders,
                        clicks: p.clicks,
                        adSpend: p.spend,
                        adSales: p.sales,
                        impressions: p.imp,
                        printCost,
                        kenpReads: 0,
                        royaltyRate: 0.60
                      }));
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/80 border border-amber-200 text-neutral-800 font-medium transition cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Scorecard Preview Bar */}
            <div className="bg-neutral-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-mono font-bold text-lg text-amber-300">
                  {liveLowContentScorecard.overallScore}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Low-Content Health Score
                  </div>
                  <div className="text-sm font-bold text-white">
                    {lowContentData.title || 'Untitled Low Content Book'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  liveLowContentScorecard.overallStatus === 'great' ? 'text-emerald-400' :
                  liveLowContentScorecard.overallStatus === 'warning' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {liveLowContentScorecard.overallStatus.toUpperCase()}
                </span>
                <div className="text-[11px] text-neutral-400">
                  Est. Net: <span className="text-emerald-400 font-mono font-bold">${liveLowContentComputed.netProfit.toFixed(0)}/mo</span>
                </div>
              </div>
            </div>

            {/* Field Group 1: Book Identity & Low Content Type */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Notebook className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Low-Content Book Classification</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={lowContentData.title}
                    onChange={(e) => setLowContentData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    placeholder="e.g. 5-Minute Morning Gratitude Journal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Category Type
                  </label>
                  <select
                    value={lowContentData.lowContentType || 'journal'}
                    onChange={(e) => setLowContentData((prev) => ({ ...prev, lowContentType: e.target.value as any }))}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                  >
                    <option value="journal">Guided Journal / Gratitude</option>
                    <option value="planner">Daily / Weekly Planner</option>
                    <option value="coloring_book">Adult / Kids Coloring Book</option>
                    <option value="logbook">Fitness / Habit Logbook</option>
                    <option value="puzzle_book">Puzzle / Activity Book</option>
                    <option value="notebook">Lined / Dot Grid Notebook</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Field Group 2: KDP Manufacturing & Print Cost Engine */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-neutral-700" />
                  <span>2. KDP Print Cost & Unit Profit Economics</span>
                </h4>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Standard 60% Paperback Cut
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Retail Price ($)
                    </label>
                    <div className="flex gap-1">
                      {[6.99, 7.99, 8.99, 9.99].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setLowContentData((prev) => ({ ...prev, price: p, paperbackPrice: p }))}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 px-1 py-0.5 bg-neutral-200/60 rounded cursor-pointer"
                        >
                          ${p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-neutral-400">$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="3.50"
                      max="40.00"
                      value={lowContentData.price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 7.99;
                        setLowContentData((prev) => ({ ...prev, price: val, paperbackPrice: val }));
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-lg pl-7 pr-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Page Count
                    </label>
                    <div className="flex gap-1">
                      {[80, 100, 120, 150].map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => {
                            const newCost = calculateKdpPrintCost(pg, lowContentData.interiorColor || 'black_white');
                            setLowContentData((prev) => ({ ...prev, pageCount: pg, printCost: newCost }));
                          }}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 px-1 py-0.5 bg-neutral-200/60 rounded cursor-pointer"
                        >
                          {pg}p
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    step="4"
                    min="24"
                    max="300"
                    value={lowContentData.pageCount || 120}
                    onChange={(e) => {
                      const pages = parseInt(e.target.value, 10) || 120;
                      const newCost = calculateKdpPrintCost(pages, lowContentData.interiorColor || 'black_white');
                      setLowContentData((prev) => ({ ...prev, pageCount: pages, printCost: newCost }));
                    }}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Interior Ink & Paper
                  </label>
                  <select
                    value={lowContentData.interiorColor || 'black_white'}
                    onChange={(e) => {
                      const ink = e.target.value as any;
                      const newCost = calculateKdpPrintCost(lowContentData.pageCount || 120, ink);
                      setLowContentData((prev) => ({ ...prev, interiorColor: ink, printCost: newCost }));
                    }}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                  >
                    <option value="black_white">Black & White (Recommended)</option>
                    <option value="standard_color">Standard Color</option>
                    <option value="premium_color">Premium Color</option>
                  </select>
                </div>
              </div>

              {/* Dynamic KDP Unit Economics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">KDP Print Cost</span>
                  <span className="font-bold text-rose-600 font-mono text-sm">${liveLowContentComputed.printCost}</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">Deducted per sale</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Net Royalty / Copy</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">${liveLowContentComputed.royaltyPerUnit}</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">
                    {lowContentData.price > 0 ? `${((liveLowContentComputed.royaltyPerUnit / lowContentData.price) * 100).toFixed(1)}% margin` : ''}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Breakeven ACoS</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">{liveLowContentComputed.breakevenAcos}%</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">Target &lt; {liveLowContentComputed.breakevenAcos}%</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Max Breakeven CPC</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">${liveLowContentComputed.maxBreakevenCpc}</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">At 10% conv. rate</span>
                </div>
              </div>
            </div>

            {/* Field Group 3: Amazon A+ Content Strategy (Critical for Low Content) */}
            <div className={`p-4 rounded-xl border transition ${
              lowContentData.hasAplusContent 
                ? 'bg-emerald-50/60 border-emerald-200/90' 
                : 'bg-rose-50/60 border-rose-200/90'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {lowContentData.hasAplusContent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="text-xs font-bold text-neutral-900">
                      Amazon A+ Content Published (Interior Mockups)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    {lowContentData.hasAplusContent ? (
                      <span>Interior previews & prompt layouts are visible on Amazon. Buyers can see page quality.</span>
                    ) : (
                      <span className="text-rose-700 font-medium">
                        Amazon disables "Look Inside" on low-content books! Without A+ Content, buyers cannot see interior pages, causing low conversions.
                      </span>
                    )}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={lowContentData.hasAplusContent ?? false}
                    onChange={(e) => setLowContentData((prev) => ({ ...prev, hasAplusContent: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Field Group 4: Traffic & Advertising (Last 30 Days) */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                <span>3. Traffic, Sales & Advertising Performance (30 Days)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">Impressions</label>
                    <span className="text-xs font-mono text-neutral-500">{lowContentData.impressions.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    step="1000"
                    min="100"
                    max="1000000"
                    value={lowContentData.impressions}
                    onChange={(e) => setLowContentData((prev) => ({ ...prev, impressions: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">Total Clicks</label>
                    <span className="text-xs font-mono text-neutral-500">
                      {lowContentData.impressions > 0 ? ((lowContentData.clicks / lowContentData.impressions) * 100).toFixed(2) : 0}% CTR
                    </span>
                  </div>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    max="10000"
                    value={lowContentData.clicks}
                    onChange={(e) => setLowContentData((prev) => ({ ...prev, clicks: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">Paperback Orders</label>
                    <span className="text-xs font-mono text-neutral-500">
                      {lowContentData.clicks > 0 ? ((lowContentData.orders / lowContentData.clicks) * 100).toFixed(1) : 0}% Conv
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="1000"
                    value={lowContentData.orders}
                    onChange={(e) => setLowContentData((prev) => ({ ...prev, orders: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">Amazon Ad Spend ($)</label>
                    <span className="text-xs font-mono text-neutral-500">CPC: ${liveLowContentComputed.cpc}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-neutral-400">$</span>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="5000"
                      value={lowContentData.adSpend}
                      onChange={(e) => setLowContentData((prev) => ({ ...prev, adSpend: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-neutral-200 rounded-lg pl-7 pr-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">Amazon Ad Sales ($)</label>
                    <span className={`text-xs font-mono font-semibold ${liveLowContentComputed.acos <= liveLowContentComputed.breakevenAcos ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {liveLowContentComputed.acos}% ACoS
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-neutral-400">$</span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      max="10000"
                      value={lowContentData.adSales}
                      onChange={(e) => setLowContentData((prev) => ({ ...prev, adSales: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-neutral-200 rounded-lg pl-7 pr-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-700">Reviews & Rating</label>
                    <span className="text-xs font-mono text-neutral-500">★ {lowContentData.starRating}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={lowContentData.starRating}
                      onChange={(e) => setLowContentData((prev) => ({ ...prev, starRating: parseFloat(e.target.value) || 4.5 }))}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      placeholder="Stars"
                    />
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="10000"
                      value={lowContentData.reviewCount}
                      onChange={(e) => setLowContentData((prev) => ({ ...prev, reviewCount: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      placeholder="Count"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Low Content */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="btn-apply-low-content"
                type="button"
                onClick={handleApplyLowContent}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Score & Load Low Content Book ({liveLowContentScorecard.overallScore}/100)</span>
              </button>
            </div>

          </div>
        )}

        {/* MODE 2: MANUAL DATA ENTRY */}
        {activeMode === 'manual' && (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            
            {/* Live Scorecard Preview Bar */}
            <div className="bg-neutral-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-mono font-bold text-lg text-amber-300">
                  {liveScorecard.overallScore}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Live Funnel Health Score
                  </div>
                  <div className="text-sm font-bold text-white">
                    {manualData.title || 'Untitled Book'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  liveScorecard.overallStatus === 'great' ? 'text-emerald-400' :
                  liveScorecard.overallStatus === 'warning' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {liveScorecard.overallStatus.toUpperCase()}
                </span>
                <div className="text-[11px] text-neutral-400">
                  Est. Net: ${liveComputed.netProfit.toFixed(0)} / mo
                </div>
              </div>
            </div>

            {/* Section 1: Book Info */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Book Identity & Pricing</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={manualData.title}
                    onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                    placeholder="e.g. My Next Best-Seller"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Genre / Sub-Genre
                  </label>
                  <input
                    type="text"
                    value={manualData.genre}
                    onChange={(e) => setManualData({ ...manualData, genre: e.target.value })}
                    placeholder="e.g. Dark Romance, Sci-Fi"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    eBook Price ($) & Tier
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="0.50"
                      min="0.99"
                      max="49.99"
                      value={manualData.price}
                      onChange={(e) => {
                        const pr = parseFloat(e.target.value) || 0.99;
                        setManualData({
                          ...manualData,
                          price: pr,
                          royaltyRate: pr >= 2.99 && pr <= 9.99 ? 0.70 : 0.35,
                        });
                      }}
                      className="w-24 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                    <div className="flex-1 bg-neutral-100 rounded-lg px-2 py-1.5 text-[11px] text-neutral-600 font-medium flex items-center justify-center">
                      {(manualData.royaltyRate * 100).toFixed(0)}% Royalty
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Traffic & Conversion Funnel */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>Discovery & Conversion Ratios</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-neutral-700 mb-1">
                    <span>Search Impressions</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={manualData.impressions}
                    onChange={(e) => setManualData({ ...manualData, impressions: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-400">Target: ≥25,000 / mo</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-neutral-700 mb-1">
                    <span>Total Clicks</span>
                    <span className="font-mono text-emerald-600 font-bold">{liveComputed.ctr}% CTR</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={manualData.clicks}
                    onChange={(e) => setManualData({ ...manualData, clicks: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-400">Target: ≥0.35% CTR</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-neutral-700 mb-1">
                    <span>Units Ordered</span>
                    <span className="font-mono text-emerald-600 font-bold">{liveComputed.conversionRate}% CVR</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={manualData.orders}
                    onChange={(e) => setManualData({ ...manualData, orders: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-400">Target: ≥8.0% CVR</span>
                </div>
              </div>
            </div>

            {/* Section 3: Advertising & Social Proof */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                <span>Amazon Ads & Social Proof</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Ad Spend ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={manualData.adSpend}
                    onChange={(e) => setManualData({ ...manualData, adSpend: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-neutral-700 mb-1">
                    <span>Ad Sales ($)</span>
                    <span className="font-mono text-neutral-500 font-semibold">{liveComputed.acos}% ACoS</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={manualData.adSales}
                    onChange={(e) => setManualData({ ...manualData, adSales: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    KENP Pages Read
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={manualData.kenpReads}
                    onChange={(e) => setManualData({ ...manualData, kenpReads: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Reviews & Rating
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={manualData.starRating}
                      onChange={(e) => setManualData({ ...manualData, starRating: parseFloat(e.target.value) || 5.0 })}
                      className="w-16 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-amber-500 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Count"
                      value={manualData.reviewCount}
                      onChange={(e) => setManualData({ ...manualData, reviewCount: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleApplyManual}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Score This Book Now ({liveScorecard.overallScore}/100)</span>
              </button>
            </div>

          </div>
        )}

        {/* MODE 3: PASTE KDP TEXT */}
        {activeMode === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Paste Report Text, Amazon Ads row, or KDP Royalties snippet
              </label>
              <textarea
                value={rawPasteText}
                onChange={(e) => setRawPasteText(e.target.value)}
                rows={6}
                placeholder="Example:
Campaign: Dark Fantasy Sponsored
Impressions: 52,400
Clicks: 184
Spend: $118.50
Orders: 8
Sales: $39.92
Book: The Cursed Grimoire
Price: $4.99
Rating: 4.1 (18 reviews)"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {pasteError && (
              <p className="text-xs text-rose-600 font-medium">{pasteError}</p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div className="flex gap-2">
                <button
                  onClick={() => setRawPasteText(`Book: Rogue Hacker\nImpressions: 89000\nClicks: 380\nOrders: 42\nSpend: $142\nPrice: $3.99\nKENP: 38900\nRating: 4.6 (85 reviews)`)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                >
                  Load Sample
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParsePaste}
                  disabled={!rawPasteText.trim() || pasteLoading}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${pasteLoading ? 'animate-spin' : ''}`} />
                  <span>{pasteLoading ? 'Extracting...' : 'Extract & Score Book'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
