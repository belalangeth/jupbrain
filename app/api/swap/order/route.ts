import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const KEY = process.env.JUPITER_API_KEY!;
  
  try {
    const res = await fetch(`https://api.jup.ag/swap/v2/order?${searchParams.toString()}`, {
      headers: { 'x-api-key': KEY }
    });
    
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
