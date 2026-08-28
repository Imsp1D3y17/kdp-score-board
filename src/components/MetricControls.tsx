import React from 'react';
import { 
  Sliders, 
  X, 
  RotateCcw, 
  Sparkles, 
  Info, 
  DollarSign, 
  Eye, 
  MousePointerClick, 
  ShoppingCart, 
  BookOpen, 
  Star, 
  BookMarked 
} from 'lucide-react';
import { BookMetrics } from '../types';

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
  return (
    <div className={`bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 ${isDrawer ? 'h-full overflow-y-auto' : ''}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Adjust Your Book's Analytics
            </h3>
            <p className="text-xs text-slate-400">
              Change any number below to test your scorecard in real time.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            id="btn-close-metric-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Form Fields Organized by Funnel Phase */}
      <div className="space-y-6">
        
        {/* Section 1: Book Info & Pricing */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-emerald-400" />
            Book Details & Pricing
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Book Title
              </label>
              <input
                id="input-book-title"
                type="text"
                value={metrics.title}
                onChange={(e) => onChangeMetrics({ title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. My Book Title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                eBook Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500">$</span>
                <input
                  id="input-ebook-price"
                  type="number"
                  step="0.50"
                  min="0.99"
                  max="49.99"
                  value={metrics.price}
                  onChange={(e) => onChangeMetrics({ price: parseFloat(e.target.value) || 0.99 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Royalty Tier
              </label>
              <select
                id="select-royalty-rate"
                value={metrics.royaltyRate}
                onChange={(e) => onChangeMetrics({ royaltyRate: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={0.70}>70% Tier ($2.99 - $9.99)</option>
                <option value={0.35}>35% Tier ($0.99 or {'>'}$9.99)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Traffic & Search Performance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            Discovery & Traffic (Last 30 Days)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Search & Ad Impressions
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>500 (Low)</span>
                <span>250,000+ (High)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Total Clicks ({metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : 0}% CTR)
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0</span>
                <span>2,000 clicks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Orders & Advertising */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
            Orders & Amazon Ads
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Direct Orders ({metrics.clicks > 0 ? ((metrics.orders / metrics.clicks) * 100).toFixed(1) : 0}% Conv)
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Ad Spend ($)
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Ad Sales ($)
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: KENP & Reviews */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            Kindle Unlimited & Social Proof
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  KENP Pages Read
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Star Rating (1-5★)
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Review Count
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Series Read-Through */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-teal-400" />
            Series & Read-Through
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Series Books Count
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Book 1 → Book 2 Read-Through %
                </label>
                <span className="text-xs font-mono text-slate-400">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
