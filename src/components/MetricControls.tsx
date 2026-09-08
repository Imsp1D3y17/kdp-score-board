import React from 'react';
import { 
  Sliders, 
  X, 
  Eye, 
  ShoppingCart, 
  BookOpen, 
  Star, 
  BookMarked,
  Notebook,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { BookMetrics } from '../types';
import { calculateKdpPrintCost } from '../utils/calculator';

interface MetricControlsProps {
  metrics: BookMetrics;
  onChangeMetrics: (updated: Partial<BookMetrics>) => void;
  onClose?: () => void;
  isDrawer?: boolean;
}

export const MetricControls: React.FC<MetricControlsProps> = ({
  metrics,
  onChangeMetrics,
  onClose,
  isDrawer = false,
}) => {
  const currentPrintCost = metrics.printCost ?? calculateKdpPrintCost(
    metrics.pageCount || 120, 
    metrics.interiorColor || 'black_white'
  );
  const retailPrice = metrics.price || metrics.paperbackPrice || 7.99;
  const calculatedRoyalty = Math.max(0, Number(((retailPrice * 0.60) - currentPrintCost).toFixed(2)));

  return (
    <div className={`${isDrawer ? 'bg-transparent border-0 p-0' : 'bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-6'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-neutral-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Adjust Your Book's Analytics
            </h3>
            <p className="text-xs text-neutral-400">
              Change any number below to test your scorecard in real time.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            id="btn-close-metric-drawer"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Publishing Format Switcher (Standard vs Low Content) */}
      <div className="mb-5 p-1 bg-neutral-100 rounded-xl flex gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onChangeMetrics({ isLowContent: false, royaltyRate: 0.70 })}
          className={`flex-1 py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            !metrics.isLowContent 
              ? 'bg-white text-neutral-950 shadow-xs' 
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>Standard eBook / Fiction</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const defaultPages = metrics.pageCount || 120;
            const cost = calculateKdpPrintCost(defaultPages, 'black_white');
            onChangeMetrics({ 
              isLowContent: true, 
              royaltyRate: 0.60,
              price: metrics.price && metrics.price > 5 ? metrics.price : 7.99,
              paperbackPrice: metrics.price && metrics.price > 5 ? metrics.price : 7.99,
              pageCount: defaultPages,
              lowContentType: metrics.lowContentType || 'journal',
              interiorColor: metrics.interiorColor || 'black_white',
              printCost: cost,
              hasAplusContent: metrics.hasAplusContent ?? true,
              kenpReads: 0
            });
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            metrics.isLowContent 
              ? 'bg-white text-neutral-950 shadow-xs font-bold' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Notebook className="w-3.5 h-3.5 text-amber-600" />
          <span>Low Content (Journals & Planners)</span>
        </button>
      </div>

      {/* Low-Content Specific Manufacturing Banner */}
      {metrics.isLowContent && (
        <div className="mb-6 p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              Low-Content KDP Print Economics
            </span>
            <span className="text-[11px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              Standard 60% Paperback Cut
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] text-neutral-500 block">List Price</span>
              <span className="font-bold text-neutral-900">${retailPrice}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] text-neutral-500 block">KDP Print Cost</span>
              <span className="font-bold text-rose-600">${currentPrintCost}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] text-neutral-500 block">Net Royalty/Copy</span>
              <span className="font-bold text-emerald-600">${calculatedRoyalty}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] text-neutral-500 block">Breakeven ACoS</span>
              <span className="font-bold text-neutral-900">
                {retailPrice > 0 ? ((calculatedRoyalty / retailPrice) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          {/* A+ Content Interior Preview Toggle */}
          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-800 block">
                Amazon A+ Content (Interior Preview)
              </span>
              <span className="text-[10px] text-neutral-500">
                {metrics.hasAplusContent 
                  ? 'Interior mockups active (protects conversion)' 
                  : 'Look Inside is disabled by Amazon for low content!'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={metrics.hasAplusContent ?? false}
                onChange={(e) => onChangeMetrics({ hasAplusContent: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        
        {/* Section 1: Book Info & Pricing */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
            <span>Book Details & Pricing</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Book Title
              </label>
              <input
                id="input-book-title"
                type="text"
                value={metrics.title}
                onChange={(e) => onChangeMetrics({ title: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                placeholder={metrics.isLowContent ? 'e.g. 5-Minute Gratitude Journal' : 'e.g. My Book Title'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                {metrics.isLowContent ? 'Paperback Retail Price ($)' : 'eBook Price ($)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-neutral-400">$</span>
                <input
                  id="input-ebook-price"
                  type="number"
                  step="0.50"
                  min="0.99"
                  max="49.99"
                  value={metrics.price}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0.99;
                    onChangeMetrics({ 
                      price: val,
                      paperbackPrice: val
                    });
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-7 pr-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            {metrics.isLowContent ? (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Low Content Type
                </label>
                <select
                  id="select-low-content-type"
                  value={metrics.lowContentType || 'journal'}
                  onChange={(e) => onChangeMetrics({ lowContentType: e.target.value as any })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                >
                  <option value="journal">Guided Journal / Gratitude</option>
                  <option value="planner">Daily / Weekly Planner</option>
                  <option value="coloring_book">Coloring Book (Kids/Adult)</option>
                  <option value="logbook">Habit / Workout Logbook</option>
                  <option value="puzzle_book">Puzzle / Activity Book</option>
                  <option value="notebook">Lined / Dot Grid Notebook</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Royalty Tier
                </label>
                <select
                  id="select-royalty-rate"
                  value={metrics.royaltyRate}
                  onChange={(e) => onChangeMetrics({ royaltyRate: parseFloat(e.target.value) })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                >
                  <option value={0.70}>70% Tier ($2.99 - $9.99)</option>
                  <option value={0.35}>35% Tier ($0.99 or &gt;$9.99)</option>
                </select>
              </div>
            )}
          </div>

          {/* Low Content Page Count & Ink Options */}
          {metrics.isLowContent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Page Count (Physical Pages)
                  </label>
                  <span className="text-xs font-mono text-neutral-500">
                    {metrics.pageCount || 120} pages
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="300"
                  step="4"
                  value={metrics.pageCount || 120}
                  onChange={(e) => {
                    const pages = parseInt(e.target.value, 10);
                    const newCost = calculateKdpPrintCost(pages, metrics.interiorColor || 'black_white');
                    onChangeMetrics({ pageCount: pages, printCost: newCost });
                  }}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Interior Ink & Paper
                </label>
                <select
                  value={metrics.interiorColor || 'black_white'}
                  onChange={(e) => {
                    const ink = e.target.value as any;
                    const newCost = calculateKdpPrintCost(metrics.pageCount || 120, ink);
                    onChangeMetrics({ interiorColor: ink, printCost: newCost });
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                >
                  <option value="black_white">Black & White Interior (Recommended for low-cost)</option>
                  <option value="standard_color">Standard Color Interior</option>
                  <option value="premium_color">Premium Color Interior</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Traffic & Search Performance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>Discovery & Traffic (Last 30 Days)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Search & Ad Impressions
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  {metrics.impressions.toLocaleString()}
                </span>
              </div>
              <input
                id="slider-impressions"
                type="range"
                min="500"
                max="250000"
                step="500"
                value={metrics.impressions}
                onChange={(e) => onChangeMetrics({ impressions: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>500 (Low)</span>
                <span>250,000+ (High)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Total Clicks ({metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : 0}% CTR)
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  {metrics.clicks.toLocaleString()}
                </span>
              </div>
              <input
                id="slider-clicks"
                type="range"
                min="0"
                max="2000"
                step="5"
                value={metrics.clicks}
                onChange={(e) => onChangeMetrics({ clicks: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>0</span>
                <span>2,000 clicks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Orders & Advertising */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Orders & Amazon Ads</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Direct Orders ({metrics.clicks > 0 ? ((metrics.orders / metrics.clicks) * 100).toFixed(1) : 0}% Conv)
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  {metrics.orders}
                </span>
              </div>
              <input
                id="slider-orders"
                type="range"
                min="0"
                max="200"
                step="1"
                value={metrics.orders}
                onChange={(e) => onChangeMetrics({ orders: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Ad Spend ($)
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  ${metrics.adSpend}
                </span>
              </div>
              <input
                id="slider-ad-spend"
                type="range"
                min="0"
                max="600"
                step="5"
                value={metrics.adSpend}
                onChange={(e) => onChangeMetrics({ adSpend: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Ad Sales ($)
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  ${metrics.adSales}
                </span>
              </div>
              <input
                id="slider-ad-sales"
                type="range"
                min="0"
                max="1000"
                step="10"
                value={metrics.adSales}
                onChange={(e) => onChangeMetrics({ adSales: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Section 4: KENP & Reviews */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>{metrics.isLowContent ? 'Interior Layout & Social Proof' : 'Kindle Unlimited & Social Proof'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {metrics.isLowContent ? (
              <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400">
                    A+ Content Status
                  </div>
                  <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${metrics.hasAplusContent ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {metrics.hasAplusContent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Interior Mockups Active</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Missing A+ Content</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onChangeMetrics({ hasAplusContent: !metrics.hasAplusContent })}
                  className="mt-2 text-[11px] font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-md py-1 px-2 cursor-pointer transition text-center"
                >
                  Toggle A+ Content
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-neutral-700">
                    KENP Pages Read
                  </label>
                  <span className="text-xs font-mono text-neutral-500">
                    {metrics.kenpReads.toLocaleString()}
                  </span>
                </div>
                <input
                  id="slider-kenp"
                  type="range"
                  min="0"
                  max="150000"
                  step="1000"
                  value={metrics.kenpReads}
                  onChange={(e) => onChangeMetrics({ kenpReads: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Star Rating (1-5★)
                </label>
                <span className="text-xs font-mono text-amber-500 font-bold">
                  {metrics.starRating} ★
                </span>
              </div>
              <input
                id="slider-star-rating"
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={metrics.starRating}
                onChange={(e) => onChangeMetrics({ starRating: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Review Count
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  {metrics.reviewCount}
                </span>
              </div>
              <input
                id="slider-reviews"
                type="range"
                min="0"
                max="500"
                step="1"
                value={metrics.reviewCount}
                onChange={(e) => onChangeMetrics({ reviewCount: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Series Read-Through */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-teal-600" />
            <span>Series & Read-Through</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Series Books Count
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  {metrics.seriesBookCount} book{metrics.seriesBookCount > 1 ? 's' : ''}
                </span>
              </div>
              <input
                id="slider-series-count"
                type="range"
                min="1"
                max="10"
                step="1"
                value={metrics.seriesBookCount}
                onChange={(e) => onChangeMetrics({ seriesBookCount: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Book 1 → Book 2 Read-Through %
                </label>
                <span className="text-xs font-mono text-neutral-500">
                  {metrics.seriesReadThrough}%
                </span>
              </div>
              <input
                id="slider-read-through"
                type="range"
                min="0"
                max="100"
                step="1"
                value={metrics.seriesReadThrough}
                onChange={(e) => onChangeMetrics({ seriesReadThrough: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
