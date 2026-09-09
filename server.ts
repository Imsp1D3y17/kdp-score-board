import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
const PORT = 3000;

// Trust proxy for accurate client IP identification on Vercel / Cloud Run
app.set("trust proxy", 1);

app.use(express.json({ limit: "5mb" }));

// In-memory sliding window rate limiter to protect serverless functions and AI quota
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const ipRateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimitMap.entries()) {
    if (now > record.resetTime) {
      ipRateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function apiRateLimiter(maxRequests: number = 60, windowMs: number = 60 * 1000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Exclude health checks
    if (req.path === "/api/health") {
      return next();
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const now = Date.now();
    let record = ipRateLimitMap.get(clientIp);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      ipRateLimitMap.set(clientIp, record);
    } else {
      record.count += 1;
    }

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: "Too many requests. Please slow down and try again in a minute.",
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

// Apply rate limiter to all API endpoints (60 reqs/min per IP)
app.use("/api", apiRateLimiter(60, 60 * 1000));

// Lazy init Stripe client to prevent startup failure if key is missing
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// Lazy init Gemini client with standard header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Diagnosis Endpoint (supports both /api/diagnose and /api/ai-diagnose)
const handleDiagnoseRequest = async (req: express.Request, res: express.Response) => {
  try {
    const bookData = req.body.bookData || req.body.metrics || {};
    const scores = req.body.scores || {};
    const overallScore = req.body.overallScore || 50;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        analysis: generateAlgorithmicAnalysis(bookData, scores, overallScore),
      });
    }

    const prompt = `You are a world-class Amazon KDP publishing expert and Amazon Advertising auditor.
Analyze the following book metrics and scorecard breakdown for an author.
The author is tired of confusing charts and wants clear, blunt, actionable insights about "what they are missing" and why their book is underperforming or where the leak is.

Author's Book Data:
- Title: "${bookData.title || 'Untitled Book'}"
- Genre/Category: ${bookData.genre || 'General Fiction / Non-Fiction'}
- List Price: $${bookData.price || 4.99} (eBook) / $${bookData.paperbackPrice || 14.99} (Paperback)
- Impressions (Last 30 Days): ${bookData.impressions?.toLocaleString()}
- Clicks: ${bookData.clicks?.toLocaleString()}
- CTR: ${bookData.ctr}%
- Orders (Direct Sales): ${bookData.orders}
- Order Conversion Rate (Sales/Clicks): ${bookData.conversionRate}%
- Ad Spend: $${bookData.adSpend}
- Ad Sales: $${bookData.adSales}
- ACoS: ${bookData.acos}%
- KENP Pages Read: ${bookData.kenpReads?.toLocaleString()}
- Estimated Total Royalties: $${bookData.totalRoyalties}
- TACoS (Ad Spend / Total Royalties): ${bookData.tacos}%
- Star Rating: ${bookData.starRating} / 5.0 (${bookData.reviewCount} total reviews)
- Series Read-Through Rate (Book 1 to 2): ${bookData.seriesReadThrough ? `${bookData.seriesReadThrough}%` : 'Single Book / N/A'}

Computed Scorecard (0-100, Red < 50, Yellow 50-74, Green >= 75):
- Overall Health Score: ${overallScore}/100
- 1. Discovery & Traffic Score: ${scores.traffic}/100
- 2. Listing Conversion Score: ${scores.conversion}/100
- 3. Amazon Ads & Profitability Score: ${scores.ads}/100
- 4. Reader Engagement & KENP Score: ${scores.engagement}/100
- 5. Social Proof & Reviews Score: ${scores.socialProof}/100
- 6. Series & Backlist Yield Score: ${scores.series}/100

Format your response in structured JSON with:
{
  "verdictTitle": "A bold 5-8 word executive verdict summarizing the #1 bottleneck (e.g., 'High-Interest Cover Leaking At Weak Blurb')",
  "bottleneckSummary": "2-3 concise sentences explaining in plain English what the numbers mean without jargon.",
  "topMissingElement": "1 sentence describing the single biggest missing element hurting their royalties.",
  "priorityActions": [
    {
      "priority": "URGENT (Fix Today)",
      "area": "Cover / Blurb / Ads / Pricing / Reviews",
      "action": "Specific step to take immediately",
      "expectedImpact": "What metric will improve and by how much"
    },
    {
      "priority": "HIGH (This Week)",
      "area": "area name",
      "action": "Specific step",
      "expectedImpact": "Impact"
    },
    {
      "priority": "STRATEGIC (Next 30 Days)",
      "area": "area name",
      "action": "Specific step",
      "expectedImpact": "Impact"
    }
  ],
  "adTactics": "Specific rule for their Amazon Ads based on their ACoS/CTR (e.g. pause keywords with >20 clicks and 0 orders, lower top-of-search bid to $0.42)",
  "blurbOrCoverPrescription": "Advice on whether their cover or blurb needs urgent attention based on the CTR vs Conversion relationship."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = generateAlgorithmicAnalysis(bookData, scores, overallScore);
    }

    return res.json({
      success: true,
      source: "gemini",
      analysis: parsed,
      ...parsed,
    });
  } catch (err: any) {
    console.error("AI Diagnose error:", err);
    const fallback = generateAlgorithmicAnalysis(req.body.bookData || req.body.metrics, req.body.scores, req.body.overallScore);
    return res.json({
      success: true,
      source: "fallback",
      analysis: fallback,
      ...fallback,
    });
  }
};

app.post("/api/diagnose", handleDiagnoseRequest);
app.post("/api/ai-diagnose", handleDiagnoseRequest);

// AI Q&A Advisor Chat (supports /api/chat and /api/ai-chat)
const handleChatRequest = async (req: express.Request, res: express.Response) => {
  try {
    const question = req.body.question || req.body.message || "";
    const { bookData, scores, overallScore } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackAnswer = generateOfflineChatResponse(question, bookData, scores, overallScore);
      return res.json({
        answer: fallbackAnswer,
        reply: fallbackAnswer,
      });
    }

    const prompt = `You are a seasoned Amazon KDP author consultant.
The author is looking at their KDP Scorecard (Overall Score: ${overallScore}/100):
- Traffic: ${scores?.traffic ?? 50}/100 | Conversion: ${scores?.conversion ?? 50}/100 | Ads: ${scores?.ads ?? 50}/100 | KENP: ${scores?.engagement ?? 50}/100 | Reviews: ${scores?.socialProof ?? 50}/100 | Series: ${scores?.series ?? 50}/100
- CTR: ${bookData?.ctr ?? 0}% | Conversion Rate: ${bookData?.conversionRate ?? 0}% | ACoS: ${bookData?.acos ?? 0}% | Reviews: ${bookData?.reviewCount ?? 0} (${bookData?.starRating ?? 0}★) | Price: $${bookData?.price ?? 0} | KENP Reads: ${bookData?.kenpReads ?? 0}

User Question: "${question}"

Provide a direct, practical, 2-3 paragraph answer in plain English with clear bullet points. Avoid vague motivational fluff; give exact KDP benchmark numbers and concrete publishing actions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    const replyText = response.text || "";
    return res.json({
      answer: replyText,
      reply: replyText,
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    const fallback = generateOfflineChatResponse(req.body.question || req.body.message || "", req.body.bookData, req.body.scores, req.body.overallScore);
    return res.json({
      answer: fallback,
      reply: fallback,
    });
  }
};

app.post("/api/ai-chat", handleChatRequest);
app.post("/api/chat", handleChatRequest);

// Parse messy text from KDP reports or AMS ads
app.post("/api/parse-report", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "Missing raw text" });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `Extract Amazon KDP / AMS advertising numbers from this pasted text:
"""
${rawText.slice(0, 3000)}
"""

Return a clean JSON object with available numbers (use reasonable null or estimated numbers if absent):
{
  "title": "Extracted book title or empty",
  "impressions": number,
  "clicks": number,
  "orders": number,
  "adSpend": number,
  "adSales": number,
  "kenpReads": number,
  "price": number,
  "reviewCount": number,
  "starRating": number
}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const parsed = JSON.parse(response.text || "{}");
        return res.json({ success: true, data: parsed });
      } catch {
        // fallback to regex extraction
      }
    }

    // Heuristic regex parsing
    const extracted = heuristicParseKDP(rawText);
    return res.json({ success: true, data: extracted });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Lookup / Scan Book Title or ASIN or ISBN
app.post("/api/lookup-book", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Missing book query" });
    }

    const cleanQuery = query.trim();
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are an Amazon KDP (Kindle Direct Publishing) Catalog & Analytics Expert.
A self-publishing author wants to score their book. They provided this search query, title, ASIN, ISBN, or Amazon link:
"${cleanQuery}"

Task:
1. Identify the real book title, author, and primary genre/subgenre if recognizable, or format a clean, professional title and genre from the query.
2. Provide a realistic 30-day Amazon KDP performance profile for this book (or realistic benchmarks for its genre if exact real-time private telemetry isn't public).
3. Return a JSON object with:
{
  "title": "Clean, formatted book title",
  "author": "Author name or Unknown Author",
  "genre": "Precise genre e.g. Epic Fantasy, Psychological Thriller, Dark Romance, Self-Help, etc.",
  "price": 4.99, // eBook price in dollars (e.g. 0.99, 2.99, 3.99, 4.99, 9.99)
  "paperbackPrice": 14.99,
  "royaltyRate": 0.70, // 0.70 for $2.99-$9.99, 0.35 otherwise
  "impressions": 48500, // realistic 30-day search + ad impressions (e.g. 15000 to 120000)
  "clicks": 165, // realistic clicks based on typical CTR of 0.2% - 0.45%
  "orders": 12, // realistic units ordered
  "adSpend": 98.50, // realistic monthly ad spend
  "adSales": 49.88, // ad sales
  "kenpReads": 18500, // Kindle Unlimited pages read
  "pageCount": 320,
  "starRating": 4.5,
  "reviewCount": 42,
  "seriesBookCount": 1,
  "seriesReadThrough": 65,
  "bsrRank": 45000,
  "detectedBottleneck": "Short 1-sentence note on the primary leak or opportunity (e.g. 'Strong cover click rate but ad spend is slightly outpacing royalties.')",
  "source": "ai_lookup"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.title) {
          return res.json({ success: true, data: parsed });
        }
      } catch (geminiErr) {
        console.warn("Gemini book lookup fallback:", geminiErr);
      }
    }

    // Heuristic fallback generator based on query keywords
    const lower = cleanQuery.toLowerCase();
    let genre = "Contemporary Fiction";
    let price = 4.99;
    let impressions = 36000;
    let clicks = 135;
    let orders = 10;
    let adSpend = 85.0;
    let adSales = 45.0;
    let kenpReads = 14500;
    let starRating = 4.4;
    let reviewCount = 38;
    let bottleneck = "Product page conversion can be improved with a punchier 3-line blurb hook.";

    if (lower.includes("romance") || lower.includes("love") || lower.includes("heart")) {
      genre = "Contemporary Romance";
      price = 3.99;
      kenpReads = 42000;
      impressions = 65000;
      clicks = 260;
      orders = 22;
      adSpend = 110.0;
      adSales = 88.0;
      reviewCount = 94;
      bottleneck = "High Kindle Unlimited read-through; ad spend has opportunity to scale keyword bids.";
    } else if (lower.includes("fantasy") || lower.includes("dragon") || lower.includes("magic") || lower.includes("blade")) {
      genre = "Epic Fantasy";
      price = 4.99;
      kenpReads = 31000;
      impressions = 52000;
      clicks = 185;
      orders = 14;
      adSpend = 95.0;
      adSales = 55.0;
      reviewCount = 52;
      bottleneck = "Cover CTR is solid; review velocity will unlock higher organic algorithmic placement.";
    } else if (lower.includes("thriller") || lower.includes("mystery") || lower.includes("murder") || lower.includes("silent")) {
      genre = "Psychological Thriller";
      price = 4.99;
      kenpReads = 22000;
      impressions = 48000;
      clicks = 190;
      orders = 15;
      adSpend = 105.0;
      adSales = 65.0;
      reviewCount = 67;
      bottleneck = "ACoS is slightly high at ~62%. Negate loose search terms in Amazon Ads.";
    } else if (lower.includes("habit") || lower.includes("mind") || lower.includes("guide") || lower.includes("business") || lower.includes("money")) {
      genre = "Personal Growth & Non-Fiction";
      price = 9.99;
      kenpReads = 5500;
      impressions = 41000;
      clicks = 145;
      orders = 18;
      adSpend = 120.0;
      adSales = 180.0;
      reviewCount = 85;
      bottleneck = "Strong margins on higher list price. Opportunity to test Amazon Sponsored Brand ads.";
    }

    let isLowContent = false;
    let lowContentType: any = undefined;
    let hasAplusContent = false;
    let printCost = 0;
    let pageCount = 300;

    if (lower.includes("journal") || lower.includes("planner") || lower.includes("coloring") || lower.includes("notebook") || lower.includes("logbook") || lower.includes("puzzle") || lower.includes("activity") || lower.includes("tracker")) {
      isLowContent = true;
      lowContentType = lower.includes("planner") ? "planner" : lower.includes("coloring") ? "coloring_book" : lower.includes("logbook") ? "logbook" : lower.includes("puzzle") ? "puzzle_book" : "journal";
      genre = "Low Content / Paperback";
      price = 7.99;
      kenpReads = 0;
      pageCount = 120;
      impressions = 45000;
      clicks = 180;
      orders = 18;
      adSpend = 54.0;
      adSales = 143.82;
      reviewCount = 28;
      starRating = 4.4;
      printCost = 2.80;
      hasAplusContent = true;
      bottleneck = "Low content margin is thin ($2.00-$2.80/copy). Ensure Amazon Ads CPC does not exceed $0.25 breakeven threshold.";
    }

    // Clean up title from query (remove ASIN / URL parts if needed)
    let displayTitle = cleanQuery;
    if (cleanQuery.startsWith("http")) {
      const match = cleanQuery.match(/\/dp\/([A-Z0-9]{10})/i) || cleanQuery.match(/\/product\/([A-Z0-9]{10})/i);
      displayTitle = match ? `Amazon Book (ASIN ${match[1]})` : "Scanned Amazon Title";
    }

    const result = {
      title: displayTitle.replace(/^["']|["']$/g, ''),
      genre,
      price,
      paperbackPrice: isLowContent ? price : price + 10,
      royaltyRate: isLowContent ? 0.60 : (price >= 2.99 && price <= 9.99 ? 0.70 : 0.35),
      impressions,
      clicks,
      orders,
      adSpend,
      adSales,
      kenpReads,
      pageCount,
      starRating,
      reviewCount,
      seriesBookCount: 1,
      seriesReadThrough: isLowContent ? 0 : 60,
      bsrRank: 38000,
      detectedBottleneck: bottleneck,
      isLowContent,
      lowContentType,
      hasAplusContent,
      printCost: isLowContent ? printCost : undefined,
      interiorColor: isLowContent ? "black_white" : undefined,
      source: "heuristic_lookup",
    };

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Stripe Checkout Session Creation
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const targetPriceId = priceId || "price_1UBaCG85rTSXxqIIXf40J1jY";

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        error: "STRIPE_SECRET_KEY is not configured yet in environment settings.",
        requiresConfig: true,
        priceId: targetPriceId,
      });
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: targetPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/?checkout=cancelled`,
    });

    return res.json({ url: session.url, id: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout creation error:", error);
    return res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});

// Stripe Live Status & Trial Telemetry Endpoint
app.get("/api/stripe-status", async (_req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.json({
        configured: false,
        message: "Stripe key not configured",
        activeTrials: 0,
        activeSubscriptions: 0,
        totalCustomers: 0,
        checkoutSessions: [],
      });
    }

    // Query live Stripe metrics in parallel
    const [subs, customers, sessions] = await Promise.all([
      stripe.subscriptions.list({ limit: 50, status: "all" }).catch(() => ({ data: [] })),
      stripe.customers.list({ limit: 50 }).catch(() => ({ data: [] })),
      stripe.checkout.sessions.list({ limit: 20 }).catch(() => ({ data: [] })),
    ]);

    const trialing = subs.data.filter((s: any) => s.status === "trialing");
    const active = subs.data.filter((s: any) => s.status === "active");

    const formattedSessions = sessions.data.map((s: any) => ({
      id: s.id,
      status: s.status,
      paymentStatus: s.payment_status,
      created: s.created ? new Date(s.created * 1000).toISOString() : null,
      amountTotal: s.amount_total,
      customerEmail: s.customer_details?.email || s.customer_email || null,
      trialDays: s.subscription_data?.trial_period_days ?? null,
    }));

    return res.json({
      configured: true,
      activeTrials: trialing.length,
      activeSubscriptions: active.length,
      totalCustomers: customers.data.length,
      totalCheckoutVisits: sessions.data.length,
      subscriptions: subs.data.map((s: any) => ({
        id: s.id,
        status: s.status,
        trialEnd: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
        created: s.created ? new Date(s.created * 1000).toISOString() : null,
        customer: s.customer,
      })),
      recentSessions: formattedSessions,
    });
  } catch (err: any) {
    console.error("Error querying Stripe API:", err);
    return res.status(500).json({ error: err.message });
  }
});

// --- In-Memory SaaS App Performance & Telemetry Engine ---
interface StoredEvent {
  id: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

const serverStartTime = Date.now();
const telemetryEvents: StoredEvent[] = [];
const uniqueSessions = new Set<string>();

// Record initial app launch event
telemetryEvents.push({
  id: "evt_init",
  event: "app_server_boot",
  properties: { nodeVersion: process.version, platform: process.platform },
  timestamp: new Date().toISOString(),
  sessionId: "system",
});

// Track incoming client telemetry event
app.post("/api/analytics/track", (req, res) => {
  try {
    const { event, properties, sessionId } = req.body;
    if (!event) {
      return res.status(400).json({ error: "Missing event name" });
    }

    const sess = sessionId || "unknown_session";
    uniqueSessions.add(sess);

    const stored: StoredEvent = {
      id: "evt_" + Math.random().toString(36).substring(2, 9),
      event,
      properties: properties || {},
      timestamp: new Date().toISOString(),
      sessionId: sess,
    };

    telemetryEvents.unshift(stored);
    // Keep last 200 events in memory
    if (telemetryEvents.length > 200) {
      telemetryEvents.pop();
    }

    return res.json({ success: true, recordedId: stored.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get aggregated telemetry summary
app.get("/api/analytics/summary", (_req, res) => {
  const now = Date.now();
  const uptimeSeconds = Math.floor((now - serverStartTime) / 1000);

  // Group by event types
  const eventCounts: Record<string, number> = {};
  telemetryEvents.forEach((e) => {
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
  });

  // Calculate SaaS conversion funnel
  const landingViews = eventCounts["page_view_landing"] || eventCounts["landing_page_view"] || 0;
  const auditsRun = (eventCounts["audit_run"] || 0) + (eventCounts["page_view_scorecard"] || 0) + (eventCounts["quick_scan_completed"] || 0);
  const reportsPasted = eventCounts["report_parsed"] || 0;
  const trialsStarted = (eventCounts["trial_started"] || 0) + (eventCounts["trial_activated"] || 0);
  const proCheckoutClicks = eventCounts["pro_upgrade_clicked"] || 0;
  const aiQueries = eventCounts["ai_advisor_asked"] || 0;
  const simulationsRun = eventCounts["simulator_run"] || 0;

  // Funnel conversion rates
  const freeAuditConversionRate = landingViews > 0 ? Math.min(100, Math.round((auditsRun / landingViews) * 100)) : 100;
  const trialConversionRate = auditsRun > 0 ? ((trialsStarted / auditsRun) * 100).toFixed(1) : "0.0";
  const proConversionRate = auditsRun > 0 ? ((proCheckoutClicks / auditsRun) * 100).toFixed(1) : "0.0";

  // Recent trials
  const recentTrials = telemetryEvents.filter(
    (e) => e.event === "trial_started" || e.event === "trial_activated"
  );

  // Memory usage
  const mem = process.memoryUsage();

  return res.json({
    uptime: {
      seconds: uptimeSeconds,
      startedAt: new Date(serverStartTime).toISOString(),
    },
    system: {
      status: "healthy",
      nodeVersion: process.version,
      memoryUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(1),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    },
    overview: {
      totalEvents: telemetryEvents.length,
      uniqueVisitors: Math.max(1, uniqueSessions.size),
      landingViews,
      auditsRun,
      reportsPasted,
      trialsStarted,
      proCheckoutClicks,
      aiQueries,
      simulationsRun,
    },
    trials: {
      total: trialsStarted,
      recent: recentTrials.slice(0, 15),
    },
    funnel: {
      landingViews,
      auditsRun,
      trialsStarted,
      proCheckoutClicks,
      freeAuditConversionRate: `${freeAuditConversionRate}%`,
      trialConversionRate: `${trialConversionRate}%`,
      proConversionRate: `${proConversionRate}%`,
      potentialMRR: `$${(proCheckoutClicks + trialsStarted) * 20}`,
    },
    eventCounts,
    recentEvents: telemetryEvents.slice(0, 30),
  });
});

function heuristicParseKDP(text: string) {
  const clean = text.replace(/,/g, "");
  const num = (pattern: RegExp) => {
    const m = clean.match(pattern);
    return m ? parseFloat(m[1]) : undefined;
  };

  return {
    impressions: num(/impressions?[:\s\t]+(\d+)/i) || num(/(\d+)\s+impressions?/i),
    clicks: num(/clicks?[:\s\t]+(\d+)/i) || num(/(\d+)\s+clicks?/i),
    orders: num(/orders?[:\s\t]+(\d+)/i) || num(/sales?[:\s\t]+(\d+)\s+units?/i) || num(/(\d+)\s+orders?/i),
    adSpend: num(/spend[:\s\t]+\$?(\d+\.?\d*)/i) || num(/\$?(\d+\.?\d*)\s+spent/i),
    adSales: num(/ad\s*sales[:\s\t]+\$?(\d+\.?\d*)/i) || num(/sales[:\s\t]+\$?(\d+\.?\d*)/i),
    kenpReads: num(/kenp[:\s\t]+(\d+)/i) || num(/pages?\s*read[:\s\t]+(\d+)/i) || num(/(\d+)\s+kenp/i),
    price: num(/price[:\s\t]+\$?(\d+\.?\d*)/i) || num(/\$(\d+\.\d{2})/),
    starRating: num(/(\d\.\d)\s*(?:out of 5|stars?|★)/i),
    reviewCount: num(/(\d+)\s*(?:ratings?|reviews?|customer reviews?)/i),
  };
}

function generateAlgorithmicAnalysis(bookData: any, scores: any, overallScore: number) {
  const ctr = Number(bookData.ctr || 0);
  const conv = Number(bookData.conversionRate || 0);
  const acos = Number(bookData.acos || 0);
  const reviews = Number(bookData.reviewCount || 0);
  const rating = Number(bookData.starRating || 0);

  let verdictTitle = "Balanced Funnel with Growth Opportunities";
  let bottleneckSummary = "Your metrics show moderate activity, but key transition points in your Amazon sales funnel are shedding potential buyers.";
  let topMissingElement = "Optimizing your book description hook and testing competitive keyword bids.";

  if (ctr < 0.20 && conv >= 6) {
    verdictTitle = "Invisible Cover with High-Converting Page";
    bottleneckSummary = "Shoppers who land on your book page love what they see and buy, but almost nobody is clicking in search results. Your cover thumbnail or subtitle isn't catching the reader's eye.";
    topMissingElement = "A genre-standard cover redesign with high-contrast typography readable at 100px thumbnail size.";
  } else if (ctr >= 0.35 && conv < 4) {
    verdictTitle = "Click Magnet with a Leaky Sales Page";
    bottleneckSummary = "Your cover is generating fantastic interest, but once readers click through, they bounce without buying. Something on the product page (blurb, sample, price, or reviews) is breaking trust.";
    topMissingElement = "A compelling 3-sentence blurb hook and polishing the first 10% 'Look Inside' sample.";
  } else if (acos > 65) {
    verdictTitle = "Ad Overspend Bleeding Author Royalties";
    bottleneckSummary = "You are spending significantly more to acquire a reader than Amazon is paying you in royalties. Ads are running on irrelevant broad terms or high-cost bids.";
    topMissingElement = "Negative keyword pruning and lowering default CPC bids to match your target breakeven royalty.";
  } else if (reviews < 15 || rating < 4.1) {
    verdictTitle = "Social Proof Deficit Stalling Sales";
    bottleneckSummary = "Buyers hesitate because your listing lacks sufficient recent 5-star ratings to overcome purchase friction in a competitive market.";
    topMissingElement = "An ARC (Advance Review Copy) campaign or backmatter call-to-action asking satisfied readers for an honest review.";
  }

  return {
    verdictTitle,
    bottleneckSummary,
    topMissingElement,
    priorityActions: [
      {
        priority: "URGENT (Fix Today)",
        area: conv < 5 ? "Book Description" : acos > 60 ? "Amazon Ads" : "Thumbnail Cover",
        action: conv < 5 ? "Rewrite the first 2 lines of your Amazon description into a dramatic emotional question or gripping logline." : acos > 60 ? "Pause all ad targets that have accumulated over 15 clicks with 0 orders." : "Add a high-contrast tagline overlay above your book title on the cover.",
        expectedImpact: conv < 5 ? "+40% Conversion on existing clicks" : acos > 60 ? "Immediate 25% reduction in wasted ad spend" : "+0.15% search CTR boost"
      },
      {
        priority: "HIGH (This Week)",
        area: reviews < 25 ? "Social Proof" : "A+ Content",
        action: reviews < 25 ? "Place a friendly, personal note at the back of your book asking readers to leave 1 sentence on Amazon." : "Create standard A+ Content comparison modules showcasing your genre tropes and character art.",
        expectedImpact: "+15% boost in customer trust and conversion"
      },
      {
        priority: "STRATEGIC (Next 30 Days)",
        area: "Series Read-Through / Backlist",
        action: "Ensure Book 1 has a direct clickable link to Book 2 on the very last page before the copyright notice.",
        expectedImpact: "Doubles the lifetime value per reader acquired through ads"
      }
    ],
    adTactics: acos > 50 ? "Set manual exact-match campaigns for top 10 relevant comp authors and drop generic category bids by 30%." : "Gradually increase daily budget on top 3 profitable keywords by $2/day to scale rank.",
    blurbOrCoverPrescription: ctr < 0.25 ? "Priority: Cover Redesign & Category Relevance." : conv < 5 ? "Priority: Blurb rewrite and opening sample editing." : "Cover and blurb are aligned well."
  };
}

function generateOfflineChatResponse(question: string, bookData: any, scores: any, overallScore: number) {
  const q = question.toLowerCase();
  if (q.includes("acos") || q.includes("ad") || q.includes("spend")) {
    return `### Amazon Ads Strategy for Your Score (${scores.ads}/100)
1. **Target ACoS**: Your current ACoS is **${bookData.acos}%**. For an eBook priced at $${bookData.price} with a 70% royalty tier (~$${(bookData.price * 0.7).toFixed(2)} royalty), your breakeven ACoS is approximately 70%.
2. **Immediate Step**: Export your Search Term report from Amazon Advertising. Sort by Clicks descending. Any keyword with more than 15 clicks and 0 orders should be added as a **Negative Exact** keyword immediately.
3. **Bid Formula**: Max Profitable CPC = (Book Royalty) × (Conversion Rate / 100). With your ${bookData.conversionRate}% conversion rate, your ideal default bid is around **$${((bookData.price * 0.7) * (bookData.conversionRate / 100)).toFixed(2)}**.`;
  }
  if (q.includes("blurb") || q.includes("description") || q.includes("convert")) {
    return `### Improving Conversion Rate (${bookData.conversionRate}%, Score ${scores.conversion}/100)
1. **The 3-Second Rule**: 80% of readers on mobile only read the first 3 lines before the "Read more" fold. Make sure your hook is an irresistible single-sentence question or conflict.
2. **Format for Skimming**: Use short 2-line paragraphs, bold trope headers (e.g., **"An impossible choice. A deadly secret."**), and 3 bullet points highlighting the emotional stakes.
3. **Check the 'Look Inside'**: If your conversion is low despite high clicks, review the first 3 pages of your book. Cut unnecessary backstory and plunge the reader straight into active scene conflict.`;
  }
  return `### KDP Diagnostics Summary
- **Overall Score**: ${overallScore}/100 (${overallScore >= 75 ? 'Healthy' : overallScore >= 50 ? 'Moderate Leaks' : 'Critical Focus Needed'}).
- **Your #1 Priority**: Focus on **${scores.conversion < scores.traffic ? 'Listing Conversion' : scores.traffic < 50 ? 'Discovery & CTR' : 'Ad Profitability'}**.
- Review the color badges above: items in **RED (0-49)** represent urgent money leaks, while **YELLOW (50-74)** require weekly optimization.`;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KDP Author Scorecard server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
