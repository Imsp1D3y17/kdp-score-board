export type ScoreStatus = 'critical' | 'warning' | 'great';

export interface BookMetrics {
  title: string;
  genre: string;
  price: number;
  paperbackPrice: number;
  royaltyRate: number; // 0.7 or 0.35
  impressions: number;
  clicks: number;
  orders: number;
  adSpend: number;
  adSales: number;
  kenpReads: number;
  pageCount: number;
  starRating: number;
  reviewCount: number;
  seriesReadThrough: number; // % of readers who buy Book 2
  seriesBookCount: number;
  bsrRank: number;
  // Low-Content specific fields
  isLowContent?: boolean;
  lowContentType?: 'journal' | 'planner' | 'coloring_book' | 'logbook' | 'puzzle_book' | 'notebook' | 'tracker' | 'other';
  interiorColor?: 'black_white' | 'standard_color' | 'premium_color';
  printCost?: number;
  hasAplusContent?: boolean;
}

export interface ComputedMetrics {
  ctr: number; // %
  conversionRate: number; // %
  cpc: number; // $
  acos: number; // %
  roas: number; // ratio
  estimatedRoyalties: number; // $
  tacos: number; // %
  estimatedKenpBorrows: number;
  kenpRoyalties: number;
  directSalesRoyalties: number;
  netProfit: number;
  breakevenAcos: number;
  // Low-content unit economics
  royaltyPerUnit?: number;
  maxBreakevenCpc?: number;
  printCost?: number;
}

export interface ScoreItem {
  id: string;
  title: string;
  score: number; // 0-100
  status: ScoreStatus;
  headline: string;
  benchmark: string;
  valueDisplay: string;
  whatYouAreMissing: string;
  prescription: string;
  subMetrics: Array<{
    label: string;
    value: string;
    status: ScoreStatus;
    target: string;
    hint: string;
  }>;
}

export interface ScorecardPreset {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  metrics: BookMetrics;
  story: string;
}

export interface PriorityAction {
  priority: 'URGENT (Fix Today)' | 'HIGH (This Week)' | 'STRATEGIC (Next 30 Days)';
  area: string;
  action: string;
  expectedImpact: string;
}

export interface AIDiagnosisResult {
  verdictTitle: string;
  bottleneckSummary: string;
  topMissingElement: string;
  priorityActions: PriorityAction[];
  adTactics: string;
  blurbOrCoverPrescription: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
