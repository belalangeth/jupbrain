import { NextResponse } from 'next/server';

const KEY  = process.env.JUPITER_API_KEY!;
const BASE = 'https://api.jup.ag/trigger/v2';
const H    = { 'x-api-key': KEY, 'Content-Type': 'application/json' };

// GET  — request sign challenge for wallet
// POST — verify signed challenge, get JWT; or craft deposit; or create order
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const wallet = searchParams.get('wallet');

  if (action === 'challenge' && wallet) {
    try {
      const r = await fetch(`${BASE}/auth/challenge`, {
        method: 'POST', headers: H,
        body: JSON.stringify({ wallet }),
      });
      const d = await r.json();
      return NextResponse.json({ message: d.message ?? d.challenge ?? d, raw: d });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === 'vault' && wallet) {
    try {
      const r = await fetch(`${BASE}/vault?wallet=${wallet}`, { headers: H });
      const d = await r.json();
      return NextResponse.json(d);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'action required: challenge | vault' }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, wallet, signature, message, jwt, orderParams, depositTx } = body;

    // Step 1: verify signed challenge → get JWT
    if (action === 'verify') {
      const r = await fetch(`${BASE}/auth/verify`, {
        method: 'POST', headers: H,
        body: JSON.stringify({ wallet, message, signature }),
      });
      const d = await r.json();
      return NextResponse.json({ jwt: d.token ?? d.jwt ?? d.accessToken, raw: d });
    }

    // Step 2: craft deposit transaction
    if (action === 'deposit') {
      const r = await fetch(`${BASE}/deposit/craft`, {
        method: 'POST',
        headers: { ...H, 'Authorization': `Bearer ${jwt}` },
        body: JSON.stringify({ wallet, amount: orderParams?.amount ?? 10 }),
      });
      const d = await r.json();
      return NextResponse.json({ transaction: d.transaction ?? d.tx, raw: d });
    }

    // Step 3: create limit/OCO/OTOCO order
    if (action === 'create-order') {
      const r = await fetch(`${BASE}/orders/price`, {
        method: 'POST',
        headers: { ...H, 'Authorization': `Bearer ${jwt}` },
        body: JSON.stringify({
          wallet,
          inputMint:    orderParams.inputMint,
          outputMint:   orderParams.outputMint,
          makingAmount: orderParams.makingAmount,
          takingAmount: orderParams.takingAmount,
          slippageBps:  orderParams.slippageBps ?? 50,
          expiredAt:    orderParams.expiredAt ?? null,
          orderType:    orderParams.orderType ?? 'single', // single | oco | otoco
          tpRate:       orderParams.tpRate ?? null,
          slRate:       orderParams.slRate ?? null,
        }),
      });
      const d = await r.json();
      return NextResponse.json({ order: d, raw: d });
    }

    return NextResponse.json({ error: 'action required: verify | deposit | create-order' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
