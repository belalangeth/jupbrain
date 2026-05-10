import { NextResponse } from 'next/server';

const TOKENS = [
  { mint:'So11111111111111111111111111111111111111112', symbol:'SOL',  name:'Solana',       emoji:'◎', cgId:'solana' },
  { mint:'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol:'JUP',  name:'Jupiter',      emoji:'🪐', cgId:'jupiter-exchange-solana' },
  { mint:'4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol:'RAY',  name:'Raydium',      emoji:'💠', cgId:'raydium' },
  { mint:'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol:'BONK', name:'Bonk',         emoji:'🐕', cgId:'bonk' },
  { mint:'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol:'WIF',  name:'dogwifhat',    emoji:'🎩', cgId:'dogwifcoin' },
  { mint:'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', symbol:'PYTH', name:'Pyth Network', emoji:'🔮', cgId:'pyth-network' },
  { mint:'jtojtomepa8berHfBCTBE2bXUkdShMYGPhRb2FkbQHC',  symbol:'JTO',  name:'Jito',         emoji:'⚡', cgId:'jito-governance-token' },
  { mint:'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', symbol:'ORCA', name:'Orca',         emoji:'🐋', cgId:'orca' },
  { mint:'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', symbol:'RNDR', name:'Render',       emoji:'🎨', cgId:'render-token' },
  { mint:'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux', symbol:'HNT',  name:'Helium',       emoji:'📡', cgId:'helium' },
];

export async function GET() {
  try {
    const mintIds = TOKENS.map(t => t.mint).join(',');
    const cgIds   = TOKENS.map(t => t.cgId).join(',');

    // Jupiter Price V3 (primary source)
    const jupPriceRes = await fetch(`https://api.jup.ag/price/v3?ids=${mintIds}`, { next: { revalidate: 30 } });
    const jupPrice    = await jupPriceRes.json();

    // Jupiter Tokens V2 — search for logos + metadata
    const metaMap: Record<string,any> = {};
    try {
      const tokenRes = await fetch('https://api.jup.ag/tokens/v2/tagged/verified?limit=200', { next: { revalidate: 3600 } });
      const tokenData: any[] = await tokenRes.json();
      tokenData.forEach((t:any) => { metaMap[t.address] = t; });
    } catch {}

    // CoinGecko for 24h change + volume + market cap
    const cgMap: Record<string,any> = {};
    try {
      const cgRes  = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`, { next: { revalidate: 60 } });
      const cgData = await cgRes.json();
      TOKENS.forEach(t => { cgMap[t.mint] = cgData[t.cgId]; });
    } catch {}

    const tokens = TOKENS.map((t, i) => {
      const jp   = jupPrice?.data?.[t.mint];
      const meta = metaMap[t.mint];
      const cg   = cgMap[t.mint];
      return {
        id:           t.mint,
        rank:         i + 1,
        symbol:       meta?.symbol ?? t.symbol,
        name:         meta?.name   ?? t.name,
        emoji:        t.emoji,
        image:        meta?.logoURI ?? null,
        price:        parseFloat(jp?.price ?? '0') || (cg?.usd ?? 0),
        pair:         `${t.symbol}/USDC`,
        jupMint:      t.mint,
        change24h:    cg?.usd_24h_change    ?? 0,
        volume24h:    cg?.usd_24h_vol       ?? 0,
        marketCap:    cg?.usd_market_cap    ?? 0,
        verified:     !!(meta?.tags?.includes('verified')),
        organicScore: meta?.organicScore    ?? null,
      };
    });

    return NextResponse.json({ tokens, source: 'Jupiter Price V3 + Tokens V2', updatedAt: Date.now() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
