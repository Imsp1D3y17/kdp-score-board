import { BookMetrics, ComputedMetrics, ScoreItem, ScoreStatus } from '../types';

export function calculateComputedMetrics(metrics: BookMetrics): ComputedMetrics {
  const impressions = Math.max(1, metrics.impressions);
  const clicks = Math.max(0, metrics.clicks);
  const orders = Math.max(0, metrics.orders);
  const adSpend = Math.max(0, metrics.adSpend);
  const adSales = Math.max(0, metrics.adSales);
  const price = Math.max(0.99, metrics.price);
  const kenp = Math.max(0, metrics.kenpReads);
  const pageCount = Math.max(50, metrics.pageCount || 300);

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRate = clicks > 0 ? (orders / clicks) * 100 : 0;
  const cpc = clicks > 0 ? adSpend / clicks : 0;
  const acos = adSales > 0 ? (adSpend / adSales) * 100 : (adSpend > 0 ? 150 : 0);
  const roas = adSpend > 0 ? adSales / adSpend : 0;

  // Average Amazon KDP Global Fund KENP rate ~$0.0044 per page read
  const kenpRate = 0.0044;
  const kenpRoyalties = kenp * kenpRate;
  const directSalesRoyalties = orders * price * (metrics.royaltyRate || 0.7);
  const estimatedRoyalties = directSalesRoyalties + kenpRoyalties;
  const netProfit = estimatedRoyalties - adSpend;
  const tacos = estimatedRoyalties > 0 ? (adSpend / estimatedRoyalties) * 100 : (adSpend > 0 ? 120 : 0);
  const estimatedKenpBorrows = Math.round(kenp / pageCount);
  const breakevenAcos = (metrics.royaltyRate || 0.7) * 100;

  return {
    ctr: Number(ctr.toFixed(2)),
    conversionRate: Number(conversionRate.toFixed(2)),
    cpc: Number(cpc.toFixed(2)),
    acos: Number(acos.toFixed(1)),
    roas: Number(roas.toFixed(2)),
    estimatedRoyalties: Number(estimatedRoyalties.toFixed(2)),
    tacos: Number(tacos.toFixed(1)),
    estimatedKenpBorrows,
    kenpRoyalties: Number(kenpRoyalties.toFixed(2)),
    directSalesRoyalties: Number(directSalesRoyalties.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    breakevenAcos: Math.round(breakevenAcos),
  };
}

export function getScoreStatus(score: number): ScoreStatus {
  if (score >= 75) return 'great';
  if (score >= 50) return 'warning';
  return 'critical';
}

export function evaluateScorecard(metrics: BookMetrics, computed: ComputedMetrics): {
  overallScore: number;
  overallStatus: ScoreStatus;
  scores: {
    traffic: number;
    conversion: number;
    ads: number;
    engagement: number;
    socialProof: number;
    series: number;
  };
  sections: ScoreItem[];
} {
  // 1. Discovery & Traffic Score (CTR + Impressions volume + CPC efficiency)
  // Benchmark: CTR >= 0.35% is great (100), 0.20-0.34% warning, < 0.20% critical
  let trafficScore = 0;
  if (computed.ctr >= 0.45) trafficScore += 60;
  else if (computed.ctr >= 0.35) trafficScore += 50;
  else if (computed.ctr >= 0.25) trafficScore += 35;
  else if (computed.ctr >= 0.15) trafficScore += 20;
  else trafficScore += 8;

  if (metrics.impressions >= 25000) trafficScore += 25;
  else if (metrics.impressions >= 10000) trafficScore += 18;
  else if (metrics.impressions >= 3000) trafficScore += 12;
  else trafficScore += 5;

  if (computed.cpc <= 0.35) trafficScore += 15;
  else if (computed.cpc <= 0.65) trafficScore += 10;
  else if (computed.cpc <= 0.95) trafficScore += 5;

  trafficScore = Math.min(100, Math.max(10, trafficScore));

  // 2. Listing Conversion Score (Orders / Clicks + Price resonance)
  // Benchmark: >= 8.5% is great, 4.5% - 8.4% is warning, < 4.5% is critical
  let convScore = 0;
  if (computed.conversionRate >= 10.0) convScore = 95;
  else if (computed.conversionRate >= 7.5) convScore = 80;
  else if (computed.conversionRate >= 5.0) convScore = 65;
  else if (computed.conversionRate >= 3.5) convScore = 48;
  else if (computed.conversionRate >= 2.0) convScore = 32;
  else convScore = 18;

  // 3. Amazon Ads & Profitability Score (ACoS & TACoS)
  // Benchmark: ACoS < 40% is great, 40-65% warning, > 65% critical
  let adsScore = 0;
  if (metrics.adSpend === 0 && computed.estimatedRoyalties > 0) {
    adsScore = 88; // Organic momentum
  } else {
    if (computed.acos <= 30) adsScore += 55;
    else if (computed.acos <= 45) adsScore += 45;
    else if (computed.acos <= 65) adsScore += 30;
    else if (computed.acos <= 85) adsScore += 15;
    else adsScore += 5;

    if (computed.tacos <= 20) adsScore += 45;
    else if (computed.tacos <= 35) adsScore += 35;
    else if (computed.tacos <= 50) adsScore += 20;
    else if (computed.tacos <= 75) adsScore += 10;
    else adsScore += 3;
  }
  adsScore = Math.min(100, Math.max(10, adsScore));

  // 4. Reader Engagement & KENP Reads
  let kenpScore = 0;
  const borrows = computed.estimatedKenpBorrows;
  if (metrics.kenpReads >= 30000 || borrows >= 100) kenpScore = 92;
  else if (metrics.kenpReads >= 12000 || borrows >= 40) kenpScore = 78;
  else if (metrics.kenpReads >= 4000 || borrows >= 15) kenpScore = 62;
  else if (metrics.kenpReads >= 1000 || borrows >= 4) kenpScore = 44;
  else if (metrics.kenpReads > 0) kenpScore = 28;
  else kenpScore = 20;

  // 5. Social Proof & Reviews Score
  let socialScore = 0;
  const rating = metrics.starRating;
  const count = metrics.reviewCount;
  if (rating >= 4.5) socialScore += 50;
  else if (rating >= 4.2) socialScore += 40;
  else if (rating >= 3.9) socialScore += 25;
  else if (rating >= 3.5) socialScore += 12;
  else socialScore += 5;

  if (count >= 100) socialScore += 50;
  else if (count >= 40) socialScore += 40;
  else if (count >= 15) socialScore += 25;
  else if (count >= 5) socialScore += 15;
  else socialScore += 5;

  socialScore = Math.min(100, Math.max(10, socialScore));

  // 6. Series & Backlist Multiplier
  let seriesScore = 0;
  if (metrics.seriesBookCount > 1) {
    const rt = metrics.seriesReadThrough || 0;
    if (rt >= 65) seriesScore = 95;
    else if (rt >= 50) seriesScore = 80;
    else if (rt >= 35) seriesScore = 60;
    else if (rt >= 20) seriesScore = 42;
    else seriesScore = 25;
  } else {
    // Single standalone book baseline
    seriesScore = 55;
  }

  // Weighted Overall Score calculation
  const weightedOverall = Math.round(
    trafficScore * 0.20 +
    convScore * 0.25 +
    adsScore * 0.25 +
    socialScore * 0.15 +
    kenpScore * 0.10 +
    seriesScore * 0.05
  );

  const overallScore = Math.min(100, Math.max(10, weightedOverall));
  const overallStatus = getScoreStatus(overallScore);

  // Diagnostic texts
  const sections: ScoreItem[] = [
    {
      id: 'traffic',
      title: '1. Discovery & Search Visibility',
      score: trafficScore,
      status: getScoreStatus(trafficScore),
      headline: computed.ctr < 0.20 
        ? 'Low Click-Through Rate (<0.20%)' 
        : computed.ctr < 0.35 
        ? 'Average Search Click-Through (0.20-0.34%)' 
        : 'High-Performing Click-Through (≥0.35%)',
      benchmark: 'Target: ≥ 0.35% CTR (1 click per 285 impressions)',
      valueDisplay: `${computed.ctr}% CTR (${metrics.clicks.toLocaleString()} Clicks)`,
      whatYouAreMissing: computed.ctr < 0.25
        ? 'Shoppers see your book in search or ads, but scroll past. Your thumbnail cover typography is unreadable at small phone scale, or your subtitle lacks instant genre hooks.'
        : computed.ctr < 0.35
        ? 'Decent traffic, but comp titles are stealing reader attention. Test an updated typography hierarchy and sharper comp keywords.'
        : 'Your cover, title, and positioning are doing their job well! Searchers are eager to click into your product page.',
      prescription: computed.ctr < 0.25
        ? '1. Verify your title & author name contrast at 80px thumbnail size. 2. Remove low-relevance broad ad keywords with high impressions but zero clicks.'
        : 'Scale up exact-match keyword bids on search terms generating ≥0.40% CTR.',
      subMetrics: [
        {
          label: 'Click-Through Rate (CTR)',
          value: `${computed.ctr}%`,
          status: computed.ctr >= 0.35 ? 'great' : computed.ctr >= 0.20 ? 'warning' : 'critical',
          target: '≥ 0.35%',
          hint: 'Clicks ÷ Impressions'
        },
        {
          label: 'Total Impressions',
          value: metrics.impressions.toLocaleString(),
          status: metrics.impressions >= 15000 ? 'great' : metrics.impressions >= 5000 ? 'warning' : 'critical',
          target: '15,000+ / mo',
          hint: 'Eyeballs on your book'
        },
        {
          label: 'Avg Cost Per Click (CPC)',
          value: `$${computed.cpc}`,
          status: computed.cpc <= 0.45 ? 'great' : computed.cpc <= 0.75 ? 'warning' : 'critical',
          target: '< $0.45',
          hint: 'Ad spend per click'
        }
      ]
    },
    {
      id: 'conversion',
      title: '2. Product Page & Blurb Conversion',
      score: convScore,
      status: getScoreStatus(convScore),
      headline: computed.conversionRate < 4.0
        ? 'Severe Conversion Leak (<4.0%)'
        : computed.conversionRate < 7.5
        ? 'Moderate Conversion Friction (4.0% - 7.4%)'
        : 'High-Converting Sales Page (≥7.5%)',
      benchmark: 'Target: 8.0% - 12.0% (1 order per 8-12 clicks)',
      valueDisplay: `${computed.conversionRate}% Conversion (${metrics.orders} Orders)`,
      whatYouAreMissing: computed.conversionRate < 4.0
        ? 'Readers click your cover, but leave immediately after reading the first 3 lines of your description or sampling the first page of "Look Inside".'
        : computed.conversionRate < 7.5
        ? 'You have reader interest, but lukewarm social proof or wall-of-text blurb formatting causes hesitant buyers to bounce.'
        : 'Your blurb hook, sample pages, and pricing are in great harmony. Readers who click are actively purchasing.',
      prescription: computed.conversionRate < 4.0
        ? '1. Rewrite the first 2 sentences of your blurb into an urgent emotional dilemma. 2. Trim backstory from Chapter 1 sample. 3. Add 3 formatted bullet points.'
        : 'Add rich A+ Content featuring character quotes, comparison chart, or editorial reviews.',
      subMetrics: [
        {
          label: 'Sales Conversion Rate',
          value: `${computed.conversionRate}%`,
          status: computed.conversionRate >= 7.5 ? 'great' : computed.conversionRate >= 4.0 ? 'warning' : 'critical',
          target: '≥ 8.0%',
          hint: 'Orders ÷ Clicks'
        },
        {
          label: 'Clicks Per 1 Order',
          value: computed.conversionRate > 0 ? `${Math.round(100 / computed.conversionRate)} clicks` : 'N/A',
          status: computed.conversionRate >= 7.5 ? 'great' : computed.conversionRate >= 4.0 ? 'warning' : 'critical',
          target: '< 12 clicks',
          hint: 'Lower is better'
        },
        {
          label: 'eBook List Price',
          value: `$${metrics.price}`,
          status: 'great',
          target: '$2.99 - $5.99',
          hint: '70% royalty tier'
        }
      ]
    },
    {
      id: 'ads',
      title: '3. Amazon Ads Profitability & ACoS',
      score: adsScore,
      status: getScoreStatus(adsScore),
      headline: computed.acos > 65
        ? 'Bleeding Ad Spend (ACoS > 65%)'
        : computed.acos > 45
        ? 'Marginal Ad Efficiency (ACoS 45-65%)'
        : 'Profitable / Efficient Advertising (ACoS ≤ 45%)',
      benchmark: `Breakeven ACoS: ~${computed.breakevenAcos}% (eBook 70% tier)`,
      valueDisplay: `${computed.acos}% ACoS ($${metrics.adSpend} Spend)`,
      whatYouAreMissing: computed.acos > 65
        ? `You are losing money on paid ads. Amazon takes 30% royalty cut, meaning your breakeven is ${computed.breakevenAcos}%. An ACoS of ${computed.acos}% drains your royalties.`
        : computed.acos > 45
        ? 'Ads are barely breaking even. You need to trim non-converting search terms and negotiate lower bids on competitive comp author targets.'
        : 'Healthy ad margins! You can confidently increase daily ad budget by 15-20% to gain higher Amazon BSR organic ranking.',
      prescription: computed.acos > 65
        ? '1. Filter Search Term Report for keywords with >15 clicks and 0 orders -> Add to Negative Exact. 2. Drop default bids by 25%.'
        : 'Harvest high-converting search terms (>10% conv) into dedicated single-keyword manual campaigns.',
      subMetrics: [
        {
          label: 'Ad Cost of Sales (ACoS)',
          value: `${computed.acos}%`,
          status: computed.acos <= 40 ? 'great' : computed.acos <= 65 ? 'warning' : 'critical',
          target: '< 40%',
          hint: 'Ad Spend ÷ Ad Sales'
        },
        {
          label: 'Total ACoS (TACoS)',
          value: `${computed.tacos}%`,
          status: computed.tacos <= 25 ? 'great' : computed.tacos <= 45 ? 'warning' : 'critical',
          target: '< 25%',
          hint: 'Spend ÷ Total Royalties'
        },
        {
          label: 'Net Royalty Profit',
          value: `$${computed.netProfit}`,
          status: computed.netProfit > 0 ? 'great' : 'critical',
          target: '> $0.00',
          hint: 'Royalties minus Ad Spend'
        }
      ]
    },
    {
      id: 'engagement',
      title: '4. Reader Engagement & KENP Reads',
      score: kenpScore,
      status: getScoreStatus(kenpScore),
      headline: kenpScore < 50
        ? 'Weak Kindle Unlimited Page Reads'
        : kenpScore < 75
        ? 'Moderate KU Reader Stickiness'
        : 'High-Volume KU Page-Turner',
      benchmark: 'Target: ≥ 15,000 KENP reads/mo (or ~50 full book borrows)',
      valueDisplay: `${metrics.kenpReads.toLocaleString()} Pages Read (~$${computed.kenpRoyalties})`,
      whatYouAreMissing: kenpScore < 50
        ? 'KU subscribers either aren\'t discovering your book in KDP Select, or they are dropping off after the first chapter due to slow early pacing.'
        : 'Decent reads, but you are leaving money on the table by not optimizing chapter cliffhangers and fast-paced opening sequences.',
      prescription: kenpScore < 50
        ? '1. Review your page 20-40 narrative momentum. 2. Check if your genre has a high KU audience (Romance, Thriller, Fantasy, Sci-Fi).'
        : 'Promote Kindle Unlimited prominently in your A+ Content and subtitle.',
      subMetrics: [
        {
          label: 'KENP Pages Read',
          value: metrics.kenpReads.toLocaleString(),
          status: metrics.kenpReads >= 12000 ? 'great' : metrics.kenpReads >= 3000 ? 'warning' : 'critical',
          target: '12,000+ / mo',
          hint: 'Pages read in Kindle Unlimited'
        },
        {
          label: 'Est. Full Borrows',
          value: `${computed.estimatedKenpBorrows} books`,
          status: computed.estimatedKenpBorrows >= 35 ? 'great' : computed.estimatedKenpBorrows >= 10 ? 'warning' : 'critical',
          target: '35+ borrows',
          hint: 'KENP ÷ Page Count'
        },
        {
          label: 'KU Royalties Payout',
          value: `$${computed.kenpRoyalties}`,
          status: computed.kenpRoyalties >= 50 ? 'great' : computed.kenpRoyalties >= 15 ? 'warning' : 'critical',
          target: '$50.00+ / mo',
          hint: 'Based on ~$0.0044/page'
        }
      ]
    },
    {
      id: 'socialProof',
      title: '5. Social Proof & Star Rating Health',
      score: socialScore,
      status: getScoreStatus(socialScore),
      headline: socialScore < 50
        ? 'Dangerous Social Proof Deficit'
        : socialScore < 75
        ? 'Acceptable Rating with Low Volume'
        : 'Strong, Trust-Building Social Proof',
      benchmark: 'Target: ≥ 4.4★ Rating with 25+ verified reviews',
      valueDisplay: `${metrics.starRating}★ (${metrics.reviewCount} Reviews)`,
      whatYouAreMissing: socialScore < 50
        ? 'Having under 15 reviews or a rating below 4.1★ creates immense friction. Browsing readers won\'t risk their time or money without reliable peer validation.'
        : 'Your rating is solid, but having under 30 reviews means one or two negative reviews can easily crater your conversion overnight.',
      prescription: socialScore < 50
        ? '1. Run an ARC (Advance Review Copy) campaign on BookSirens/HiddenGems. 2. Add an author note at the back of the book asking for an honest 1-sentence review.'
        : 'Keep backmatter review links updated and engage active ARC team for new releases.',
      subMetrics: [
        {
          label: 'Average Star Rating',
          value: `${metrics.starRating} ★`,
          status: metrics.starRating >= 4.4 ? 'great' : metrics.starRating >= 4.0 ? 'warning' : 'critical',
          target: '≥ 4.4 ★',
          hint: 'Amazon customer average'
        },
        {
          label: 'Review / Rating Count',
          value: `${metrics.reviewCount} reviews`,
          status: metrics.reviewCount >= 35 ? 'great' : metrics.reviewCount >= 15 ? 'warning' : 'critical',
          target: '25+ reviews',
          hint: 'Total verified social proof'
        },
        {
          label: 'Review Buffer Safety',
          value: metrics.reviewCount < 10 ? 'Vulnerable' : metrics.reviewCount < 30 ? 'Moderate' : 'Resilient',
          status: metrics.reviewCount >= 30 ? 'great' : metrics.reviewCount >= 10 ? 'warning' : 'critical',
          target: 'Resilient',
          hint: 'Resistance to 1-star attacks'
        }
      ]
    },
    {
      id: 'series',
      title: '6. Series Momentum & Read-Through Yield',
      score: seriesScore,
      status: getScoreStatus(seriesScore),
      headline: metrics.seriesBookCount <= 1
        ? 'Standalone Title (Limited LTV)'
        : (metrics.seriesReadThrough || 0) < 35
        ? 'Severe Book 1 to 2 Cliff Drop'
        : (metrics.seriesReadThrough || 0) < 60
        ? 'Moderate Series Read-Through'
        : 'High-Profit Series Engine (≥60% Read-Through)',
      benchmark: 'Target: ≥ 60% Read-Through from Book 1 to Book 2',
      valueDisplay: metrics.seriesBookCount > 1 ? `${metrics.seriesReadThrough}% Read-Through (${metrics.seriesBookCount} Books)` : 'Standalone Book',
      whatYouAreMissing: metrics.seriesBookCount <= 1
        ? 'Standalone books must make all profit on a single sale. Building a 3+ book series doubles your reader lifetime value and allows higher ad bids.'
        : (metrics.seriesReadThrough || 0) < 35
        ? 'Readers finish Book 1 but don\'t buy Book 2. You are missing a cliffhanger chapter preview and 1-click link directly to Book 2 at the back of Book 1.'
        : 'Good read-through! You can afford to bid higher on Book 1 ads because Book 2 & 3 sales make the ad spend highly profitable.',
      prescription: metrics.seriesBookCount > 1 && (metrics.seriesReadThrough || 0) < 45
        ? '1. Put the first chapter of Book 2 immediately after "The End" of Book 1. 2. Include a direct universal Amazon link to Book 2.'
        : metrics.seriesBookCount <= 1
        ? 'Plan your next release as part of a 3-book interconnected series or box set to increase customer lifetime value.'
        : 'Package Books 1-3 into a discount Box Set after Book 4 launch.',
      subMetrics: [
        {
          label: 'Book 1 → 2 Read-Through',
          value: metrics.seriesBookCount > 1 ? `${metrics.seriesReadThrough}%` : 'N/A',
          status: metrics.seriesBookCount > 1 ? (metrics.seriesReadThrough >= 60 ? 'great' : metrics.seriesReadThrough >= 35 ? 'warning' : 'critical') : 'warning',
          target: '≥ 60%',
          hint: 'Borrowers/Buyers of Book 2'
        },
        {
          label: 'Books in Series',
          value: `${metrics.seriesBookCount} book${metrics.seriesBookCount > 1 ? 's' : ''}`,
          status: metrics.seriesBookCount >= 3 ? 'great' : metrics.seriesBookCount >= 2 ? 'warning' : 'critical',
          target: '3+ books',
          hint: 'Catalog backlist depth'
        },
        {
          label: 'Lifetime Value (LTV) Multiplier',
          value: metrics.seriesBookCount > 1 ? `${(1 + ((metrics.seriesReadThrough || 0) / 100) * (metrics.seriesBookCount - 1)).toFixed(1)}x` : '1.0x',
          status: metrics.seriesBookCount > 2 && (metrics.seriesReadThrough || 0) >= 50 ? 'great' : 'warning',
          target: '1.8x+',
          hint: 'Revenue generated per Book 1 buyer'
        }
      ]
    }
  ];

  return {
    overallScore,
    overallStatus,
    scores: {
      traffic: trafficScore,
      conversion: convScore,
      ads: adsScore,
      engagement: kenpScore,
      socialProof: socialScore,
      series: seriesScore
    },
    sections
  };
}
