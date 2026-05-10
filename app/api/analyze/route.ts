import { NextRequest, NextResponse } from 'next/server';
import { generateDemoAnalysis } from '@/lib/behavioral';

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }

    // Generate behavioral analysis (demo mode with deterministic data)
    const analysis = generateDemoAnalysis(walletAddress);

    // Generate AI coaching via Gemini if key is available
    let aiCoaching: string[] = [];
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are a brutally honest trading psychology coach for crypto traders.
A Solana trader has these behavioral scores (0-100, higher = worse):
- FOMO Score: ${analysis.fomoScore}/100
- Panic Sell Score: ${analysis.panicSellScore}/100
- Revenge Trade Score: ${analysis.revengeTradeScore}/100
- Diamond Hand Score: ${analysis.diamondHandScore}/100 (higher = better)
- Narrative Chaser Score: ${analysis.narrativeChaserScore}/100
- Trading Personality: ${analysis.personalityType}
- Total swaps: ${analysis.totalSwaps} in last 30 days
- Avg hold time: ${analysis.avgHoldTimeDays} days

Give exactly 3 specific, actionable coaching insights. Be direct, concise, slightly brutal but constructive.
Format as JSON array of strings. Each insight max 120 chars. No fluff.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiCoaching = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fall through to defaults
      }
    }

    if (aiCoaching.length === 0) {
      const { fomoScore, panicSellScore, revengeTradeScore, narrativeChaserScore, avgHoldTimeDays } = analysis;
      aiCoaching = [
        fomoScore > 60
          ? `Your FOMO score is ${fomoScore}/100. You're buying into pumps — set a rule: never buy after +20% in 24h.`
          : `Your FOMO resistance is solid at ${fomoScore}/100. Keep your entry discipline, it's your edge.`,
        panicSellScore > 55
          ? `You panic-sold ${panicSellScore}% of dips. Pre-commit your stop-loss BEFORE entering. Decide when sober.`
          : `Low panic sell rate — great. Your exits are more rational than 80% of Solana degens.`,
        revengeTradeScore > 50
          ? `Revenge trading detected. After any loss > $200, enforce a mandatory 3-hour cooldown. No exceptions.`
          : narrativeChaserScore > 65
          ? `You chase narratives ${narrativeChaserScore}% of the time. By the time it's on Twitter, you're already late.`
          : `Avg hold time: ${avgHoldTimeDays} days. Consider longer holds — compound gains beat frequent small wins.`,
      ];
    }

    return NextResponse.json({ ...analysis, aiCoaching });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
