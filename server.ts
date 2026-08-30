import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

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

// AI Diagnosis Endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { bookData, scores, overallScore } = req.body;
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
    });
  } catch (err: any) {
    console.error("AI Diagnose error:", err);
    // Fallback to robust deterministic algorithmic analysis
    return res.json({
      success: true,
      source: "fallback",
      analysis: generateAlgorithmicAnalysis(req.body.bookData, req.body.scores, req.body.overallScore),
    });
  }
});

// AI Q&A Advisor Chat
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { question, bookData, scores, overallScore } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: generateOfflineChatResponse(question, bookData, scores, overallScore),
      });
    }

    const prompt = `You are a seasoned Amazon KDP author consultant.
The author is looking at their KDP Scorecard (Overall Score: ${overallScore}/100):
- Traffic: ${scores.traffic}/100 | Conversion: ${scores.conversion}/100 | Ads: ${scores.ads}/100 | KENP: ${scores.engagement}/100 | Reviews: ${scores.socialProof}/100 | Series: ${scores.series}/100
- CTR: ${bookData.ctr}% | Conversion Rate: ${bookData.conversionRate}% | ACoS: ${bookData.acos}% | Reviews: ${bookData.reviewCount} (${bookData.starRating}★) | Price: $${bookData.price} | KENP Reads: ${bookData.kenpReads}

User Question: "${question}"

Provide a direct, practical, 2-3 paragraph answer in plain English with clear bullet points. Avoid vague motivational fluff; give exact KDP benchmark numbers and concrete publishing actions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    return res.json({
      answer: response.text,
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    return res.json({
      answer: generateOfflineChatResponse(req.body.question, req.body.bookData, req.body.scores, req.body.overallScore),
    });
  }
});

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
