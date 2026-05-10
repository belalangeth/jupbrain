import { NextResponse } from 'next/server';

// CoinGecko trending coins + Solana categories for real narratives
export async function GET() {
  try {
    const [trendRes, catRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/search/trending', { next: { revalidate: 300 } }),
      fetch('https://api.coingecko.com/api/v3/coins/categories?order=market_cap_change_24h_desc', { next: { revalidate: 300 } }),
    ]);
    const trendData = await trendRes.json();
    const catData: any[] = await catRes.json();

    // Trending coins as narrative signals
    const trendCoins: any[] = trendData.coins?.slice(0, 5) ?? [];
    const coinNarratives = trendCoins.map((c: any) => {
      const item = c.item;
      const chg = item?.data?.price_change_percentage_24h?.usd ?? 0;
      return {
        id:              item.id,
        name:            item.name,
        emoji:           '🔥',
        description:     `${item.name} (${item.symbol?.toUpperCase()}) is trending. Score: #${item.score + 1} globally.`,
        momentum:        chg > 5 ? 'rising' : chg < -5 ? 'fading' : 'peak',
        volumeChange24h: parseFloat(chg.toFixed(2)),
        topTokens:       [item.symbol?.toUpperCase()],
        historicalWinRate: 0,
        socialMentions24h: item.score != null ? (15 - item.score) * 10000 : 50000,
        riskLevel:       'high' as const,
        source:          'CoinGecko Trending',
      };
    });

    // Solana ecosystem categories
    const SOL_CATEGORIES = ['solana-ecosystem','ai-agents','decentralized-finance-defi','meme-token','gaming'];
    const catNarratives = catData
      .filter((c: any) => SOL_CATEGORIES.includes(c.id) || ['Solana','DePIN','AI','Meme','RWA'].some(k => c.name?.includes(k)))
      .slice(0, 5)
      .map((c: any) => {
        const chg = c.market_cap_change_24h ?? 0;
        return {
          id:              c.id,
          name:            c.name,
          emoji:           c.name?.includes('AI') ? '🤖' : c.name?.includes('Meme') ? '🐸' : c.name?.includes('Solana') ? '◎' : c.name?.includes('DeFi') ? '💎' : '📈',
          description:     `${c.name} category. Market cap: $${((c.market_cap ?? 0)/1e9).toFixed(2)}B. Volume: $${((c.volume_24h ?? 0)/1e9).toFixed(2)}B`,
          momentum:        chg > 3 ? 'rising' : chg < -3 ? 'fading' : 'peak',
          volumeChange24h: parseFloat(chg.toFixed(2)),
          topTokens:       c.top_3_coins_id?.slice(0, 3).map((x: string) => x.toUpperCase().slice(0, 4)) ?? ['SOL'],
          historicalWinRate: 0,
          socialMentions24h: Math.floor((c.volume_24h ?? 50000) / 1000),
          riskLevel:       Math.abs(chg) > 10 ? 'high' as const : Math.abs(chg) > 5 ? 'medium' as const : 'low' as const,
          source:          'CoinGecko Categories',
        };
      });

    const narratives = [...catNarratives, ...coinNarratives];
    return NextResponse.json({ narratives, updatedAt: Date.now() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, narratives: [] }, { status: 500 });
  }
}
