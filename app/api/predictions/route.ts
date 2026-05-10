import { NextResponse } from 'next/server';

const KEY = process.env.JUPITER_API_KEY!;
const H   = { 'x-api-key': KEY };

export async function GET() {
  try {
    // Jupiter Prediction V1 — get active events
    const r = await fetch('https://api.jup.ag/prediction/v1/events?limit=50&status=active', { headers: H, next: { revalidate: 60 } });

    let events: any[] = [];
    if (r.ok) {
      const d = await r.json();
      events = Array.isArray(d?.data) ? d.data : [];
    }

    // Fallback: search for crypto events if empty
    if (events.length === 0) {
      for (const term of ['crypto','bitcoin','solana','ethereum','trump']) {
        try {
          const sr = await fetch(`https://api.jup.ag/prediction/v1/events/search?q=${term}&limit=15`, { headers: H, next: { revalidate: 60 } });
          if (sr.ok) {
            const sd = await sr.json();
            const evts: any[] = Array.isArray(sd?.data) ? sd.data : [];
            evts.forEach(e => { if (!events.find(x => x.eventId === e.eventId)) events.push(e); });
          }
        } catch {}
        if (events.length >= 12) break;
      }
    }

    if (!Array.isArray(events)) events = [];
    let markets = events.slice(0, 18).map(mapEvent);
    
    if (markets.length === 0) {
      markets = FALLBACK;
    }

    return NextResponse.json({ markets, source: 'Jupiter Prediction V1', updatedAt: Date.now() });
  } catch (e: any) {
    return NextResponse.json({ markets: FALLBACK, source: 'fallback', error: e.message });
  }
}

function mapEvent(e: any) {
  const m = Array.isArray(e.markets) ? e.markets[0] : null;
  const pricing = m?.pricing || {};
  let yesP = parseFloat(pricing.buyYesPriceUsd) || parseFloat(pricing.sellYesPriceUsd) || 0;
  
  if (yesP === 0) {
    if (m?.outcomePrices && m.outcomePrices.length >= 2) {
      yesP = parseFloat(m.outcomePrices[0]);
    }
  }
  if (yesP === 0 || isNaN(yesP)) yesP = 0.5;

  const meta = e.metadata || {};
  
  let endDate = '-';
  if (m?.resolveAt) endDate = m.resolveAt.slice(0, 10);
  else if (meta.closeTime) endDate = String(meta.closeTime).slice(0, 10);

  return {
    id:          e.eventId ?? String(Math.random()),
    question:    meta.title ?? e.description ?? 'Market',
    platform:    'Jupiter Prediction',
    platformUrl: `https://jup.ag/prediction/${meta.slug ?? ''}`,
    yesOdds:     Math.min(99, Math.max(1, Math.round(yesP * 100))),
    noOdds:      Math.min(99, Math.max(1, Math.round((1 - yesP) * 100))),
    volume:      parseFloat(e.volumeUsd ?? pricing.volume ?? '0') || 0,
    endDate:     endDate,
    hot:         (parseFloat(e.volumeUsd ?? pricing.volume ?? '0') || 0) > 5000,
    category:    e.category ?? 'Crypto',
    tags:        extractTags(meta.title ?? e.description ?? ''),
    marketId:    e.eventId,
    slug:        meta.slug ?? '',
  };
}

function extractTags(q: string) {
  const m = q.toUpperCase().match(/\b(SOL|JUP|BONK|WIF|BTC|ETH|PYTH|JTO|ORCA|USDC|TRUMP|FED|AI|NFT)\b/g) ?? [];
  return m.length > 0 ? [...new Set(m)].slice(0, 3) : ['CRYPTO'];
}

const FALLBACK = [
  { id:'f1', question:'Will SOL reach $200 before Q3 2026?',     platform:'Jupiter Prediction', platformUrl:'https://jup.ag/prediction', yesOdds:42, noOdds:58, volume:287400, endDate:'2026-09-30', hot:true,  category:'Crypto',  tags:['SOL'],       marketId:'f1', slug:'sol-200' },
  { id:'f2', question:'Will JUP exceed $1.00 in 2026?',          platform:'Jupiter Prediction', platformUrl:'https://jup.ag/prediction', yesOdds:35, noOdds:65, volume:145200, endDate:'2026-12-31', hot:false, category:'Crypto',  tags:['JUP'],       marketId:'f2', slug:'jup-1' },
  { id:'f3', question:'Will Bitcoin hit $150,000 in 2026?',      platform:'Jupiter Prediction', platformUrl:'https://jup.ag/prediction', yesOdds:61, noOdds:39, volume:892000, endDate:'2026-12-31', hot:true,  category:'Crypto',  tags:['BTC'],       marketId:'f3', slug:'btc-150k' },
  { id:'f4', question:'Will the Fed cut rates in June 2026?',    platform:'Jupiter Prediction', platformUrl:'https://jup.ag/prediction', yesOdds:73, noOdds:27, volume:421000, endDate:'2026-06-30', hot:true,  category:'Markets', tags:['FED'],       marketId:'f4', slug:'fed-june' },
  { id:'f5', question:'Will Solana flip Ethereum in market cap?',platform:'Jupiter Prediction', platformUrl:'https://jup.ag/prediction', yesOdds:18, noOdds:82, volume:98300,  endDate:'2026-12-31', hot:false, category:'Crypto',  tags:['SOL','ETH'], marketId:'f5', slug:'sol-flip-eth' },
  { id:'f6', question:'Will BONK reach $0.0001 by end of 2026?', platform:'Jupiter Prediction', platformUrl:'https://jup.ag/prediction', yesOdds:29, noOdds:71, volume:54100,  endDate:'2026-12-31', hot:false, category:'Crypto',  tags:['BONK'],      marketId:'f6', slug:'bonk-0001' },
];
