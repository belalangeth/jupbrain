import { NextResponse } from 'next/server';

const KEY  = process.env.JUPITER_API_KEY!;
const BASE = 'https://api.jup.ag/prediction/v1';
const H    = { 'x-api-key': KEY, 'Content-Type': 'application/json' };

// POST /api/prediction-order — craft buy/sell order transaction
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ownerPubkey, marketId, isYes, isBuy, amount } = body;

    if (!ownerPubkey || !marketId) {
      return NextResponse.json({ error: 'ownerPubkey and marketId required' }, { status: 400 });
    }

    const depositAmount = Math.floor(Number(amount) * 1_000_000).toString(); // micro USD
    
    const r = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({ 
        ownerPubkey, 
        marketId, 
        isYes: !!isYes, 
        isBuy: isBuy !== false, 
        depositAmount,
        depositMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // default to USDC
      }),
    });

    const data = await r.json();
    if (!r.ok) return NextResponse.json({ error: data?.error || data?.message || 'Order creation failed', raw: data }, { status: r.status });

    return NextResponse.json({ transaction: data.transaction, txMeta: data.txMeta, source: 'Jupiter Prediction V1' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
