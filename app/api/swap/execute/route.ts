import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const KEY = process.env.JUPITER_API_KEY!;
  
  try {
    const body = await req.json();
    
    const res = await fetch(`https://api.jup.ag/swap/v2/execute`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': KEY 
      },
      body: JSON.stringify(body)
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
