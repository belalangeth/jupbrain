import { NextResponse } from 'next/server';

const KEY = process.env.JUPITER_API_KEY!;
const H   = { 'x-api-key': KEY, 'Content-Type': 'application/json' };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') ?? '50');

  try {
    // Fetch directly from Jupiter Tokens V2 API
    const r = await fetch('https://api.jup.ag/tokens/v2/tag?query=verified', { headers: H, next: { revalidate: 60 } });
    if (!r.ok) {
      throw new Error(`Jupiter API returned ${r.status}`);
    }
    
    let tokens = await r.json();
    if (!Array.isArray(tokens)) {
      tokens = tokens?.data || [];
    }

    // Filter tokens that have price and volume
    let validTokens = tokens.filter((t: any) => t.usdPrice > 0 && t.mcap > 0);

    // Sort by Market Cap (Descending)
    validTokens.sort((a: any, b: any) => (b.mcap || 0) - (a.mcap || 0));

    // Special order: put SOL and USDC at the very top if they exist
    const topMints = ['So11111111111111111111111111111111111111112', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'];
    validTokens.sort((a: any, b: any) => {
      const idxA = topMints.indexOf(a.id);
      const idxB = topMints.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    const displayTokens = validTokens.slice(0, limit);

    const result = displayTokens.map((t: any, i: number) => {
      const v24h = (t.stats24h?.buyVolume || 0) + (t.stats24h?.sellVolume || 0);
      
      return {
        rank:         i + 1,
        id:           t.id,
        symbol:       t.symbol,
        name:         t.name,
        image:        t.icon || t.logoURI,
        price:        parseFloat(t.usdPrice || '0'),
        change24h:    parseFloat(t.stats24h?.priceChange || '0'),
        volume24h:    v24h,
        mcap:         parseFloat(t.mcap || t.fdv || '0'),
        decimals:     t.decimals,
        organicScore: t.organicScore ? Math.min(t.organicScore, 100) / 100 : null,
        verified:     t.isVerified || false,
        tags:         t.tags || [],
        daily_volume: v24h,
        mintAddr:     t.id,
        pair:         `SOL-${t.symbol}`
      };
    });

    return NextResponse.json({ tokens: result, total: tokens.length, source: 'Jupiter Tokens API V2', updatedAt: Date.now() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, tokens: [] }, { status: 500 });
  }
}
