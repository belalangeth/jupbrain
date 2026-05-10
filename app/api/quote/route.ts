import { NextResponse } from 'next/server';

// Jupiter Swap V2 — get quote via /order endpoint
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inputMint  = searchParams.get('inputMint')  ?? 'So11111111111111111111111111111111111111112';
  const outputMint = searchParams.get('outputMint') ?? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  const amount     = searchParams.get('amount')     ?? '100000000'; // 0.1 SOL in lamports
  const slippageBps = searchParams.get('slippageBps') ?? '50';

  try {
    // Try Jupiter Swap V2 /order first (new API)
    let quoteData: any = null;
    try {
      const v2Res = await fetch(
        `https://api.jup.ag/swap/v2/order?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&onlyDirectRoutes=false`,
        { next: { revalidate: 0 } }
      );
      if (v2Res.ok) quoteData = await v2Res.json();
    } catch {}

    // Fallback to v6 quote API (well-documented)
    if (!quoteData) {
      const v6Res = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`,
        { next: { revalidate: 0 } }
      );
      quoteData = await v6Res.json();
    }

    return NextResponse.json({ quote: quoteData, source: 'Jupiter Swap V2', updatedAt: Date.now() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
