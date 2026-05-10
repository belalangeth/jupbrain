import { NextResponse } from 'next/server';

const RPC = 'https://api.mainnet-beta.solana.com';

async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    next: { revalidate: 60 },
  });
  const d = await r.json();
  return d.result;
}

export async function GET() {
  try {
    const [perf, vote] = await Promise.all([
      rpc('getRecentPerformanceSamples', [1]),
      rpc('getVoteAccounts'),
    ]);

    const sample = perf?.[0];
    const tps = sample ? Math.round(sample.numTransactions / sample.samplePeriodSecs) : 0;
    const validators = (vote?.current?.length ?? 0) + (vote?.delinquent?.length ?? 0);

    return NextResponse.json({
      tps,
      validators,
      updatedAt: Date.now(),
    });
  } catch {
    return NextResponse.json({ tps: 0, validators: 0, updatedAt: Date.now() });
  }
}
