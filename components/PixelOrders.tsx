'use client';
import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

type Token={symbol:string;price:number;mintAddr:string;decimals:number};

export function PixelOrders({tokens,fomoScore}:{tokens:Token[];fomoScore:number}){
  const { publicKey, signMessage, signTransaction } = useWallet();
  const [type,setType]=useState<'single'|'oco'|'otoco'>('oco');
  const [limitPrice,setLimitPrice]=useState('');
  const [tp,setTp]=useState('');
  const [sl,setSl]=useState('');
  const [amount,setAmount]=useState('10');
  const [loading,setLoading]=useState(false);

  // Default pairs
  const sol=tokens.find(t=>t.symbol==='SOL') || {symbol:'SOL',price:100,mintAddr:'So11111111111111111111111111111111111111112',decimals:9};
  const usdc=tokens.find(t=>t.symbol==='USDC') || {symbol:'USDC',price:1,mintAddr:'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',decimals:6};
  
  const PAIRS = useMemo(() => [
    {from:sol,to:usdc},
    ...tokens.filter(t=>t.symbol!=='SOL'&&t.symbol!=='USDC').slice(0,10).map(t=>({from:sol,to:t}))
  ], [tokens, sol, usdc]);

  const [pairIdx,setPairIdx]=useState(0);
  const pair = PAIRS[pairIdx];
  const currentP = pair?.to?.price && pair?.from?.price ? (pair.from.price / pair.to.price).toFixed(6) : '—';

  const handleCreate=async()=>{
    if (!publicKey || !signMessage || !signTransaction) {
      alert('⚠️ PLEASE CONNECT WALLET FIRST');
      return;
    }
    setLoading(true);
    try {
      const w = publicKey.toBase58();
      
      // 1. Get Challenge
      let r = await fetch(`/api/trigger?action=challenge&wallet=${w}`);
      let d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Challenge failed');
      
      const messageToSign = d.message;
      const encodedMessage = new TextEncoder().encode(messageToSign);
      const signatureArray = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureArray);

      // 2. Verify and Get JWT
      r = await fetch(`/api/trigger`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', wallet: w, message: messageToSign, signature })
      });
      d = await r.json();
      if (!r.ok || !d.jwt) throw new Error(d.error || 'Verification failed');
      const jwt = d.jwt;

      // 3. Craft Deposit
      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount < 10) throw new Error('Min $10 deposit');
      
      // Amount in smallest unit for input token
      const makingAmount = Math.floor(depositAmount / pair.from.price * (10 ** pair.from.decimals)).toString();
      
      r = await fetch(`/api/trigger`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit', wallet: w, jwt, orderParams: { amount: depositAmount } })
      });
      d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to craft deposit');

      const txBuffer = Buffer.from(d.transaction, 'base64');
      const tx = VersionedTransaction.deserialize(txBuffer);
      const signedTx = await signTransaction(tx);
      const conn = new Connection('https://api.mainnet-beta.solana.com');
      const sig = await conn.sendRawTransaction(signedTx.serialize());
      
      // 4. Create Order
      const targetRate = limitPrice ? parseFloat(limitPrice) : parseFloat(currentP);
      const takingAmount = Math.floor((depositAmount / pair.from.price) * targetRate * (10 ** pair.to.decimals)).toString();

      const orderParams: any = {
        inputMint: pair.from.mintAddr,
        outputMint: pair.to.mintAddr,
        makingAmount,
        takingAmount,
        orderType: type
      };

      if (type === 'oco' || type === 'otoco') {
        orderParams.tpRate = parseFloat(tp);
        orderParams.slRate = parseFloat(sl);
      }

      r = await fetch(`/api/trigger`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-order', wallet: w, jwt, orderParams })
      });
      d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to create order');

      alert(`✅ ${type.toUpperCase()} ORDER CREATED!\nDeposit Tx: ${sig}\nOrder ID: ${d.order.id || 'N/A'}`);
    } catch(e:any) {
      alert(`❌ ERROR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className="container" style={{paddingTop:16}}>
      <div className="sec-hdr">
        <div className="sec-title"><span className="pixel-sq pixel-sq-lime"/><span className="pixel-sq pixel-sq-cyan" style={{marginLeft:3}}/>&nbsp;TRIGGER ORDERS — JUPITER TRIGGER V2</div>
        <span className="badge badge-magenta">NEW</span>
      </div>

      {fomoScore>65&&<div className="warn" style={{marginBottom:12}}>Ψ FOMO SCORE {fomoScore}/100 — LIMIT ORDER RECOMMENDED OVER MARKET ORDER</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {/* Order form */}
        <div className="card">
          <div className="card-header">
            <span className="pixel-sq pixel-sq-lime"/>
            <span className="card-header-title">CREATE ORDER</span>
          </div>
          <div style={{padding:16,display:'flex',flexDirection:'column',gap:12}}>
            {/* Order type */}
            <div>
              <label className="field-lbl">ORDER TYPE</label>
              <div style={{display:'flex',gap:4}}>
                {(['single','oco','otoco'] as const).map(t=>(
                  <button key={t} className={`btn ${type===t?'btn-lime':'btn-ghost'}`} style={{flex:1,fontSize:14}} onClick={()=>setType(t)}>
                    {t==='single'?'LIMIT':t==='oco'?'OCO (TP/SL)':'OTOCO'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-lbl">PAIR</label>
              <select className="field-sel" value={pairIdx} onChange={e=>setPairIdx(+e.target.value)}>
                {PAIRS.map((p,i)=><option key={i} value={i}>{p.from.symbol}/{p.to.symbol}</option>)}
              </select>
            </div>
            <div style={{background:'rgba(204,255,0,.06)',border:'1px solid rgba(204,255,0,.2)',padding:'8px 12px',fontFamily:'var(--font-pixel)',fontSize:15}}>
              CURRENT RATE: <span style={{color:'var(--lime)'}}>{currentP} {pair?.to?.symbol}/{pair?.from?.symbol}</span>
            </div>
            {(type==='single'||type==='oco'||type==='otoco')&&(
              <div>
                <label className="field-lbl">LIMIT PRICE ({pair?.to?.symbol})</label>
                <input className="field-inp" placeholder={`e.g. ${currentP}`} value={limitPrice} onChange={e=>setLimitPrice(e.target.value)}/>
              </div>
            )}
            {(type==='oco'||type==='otoco')&&(<>
              <div className="order-grid">
                <div>
                  <label className="field-lbl" style={{color:'var(--matrix)'}}>TAKE PROFIT RATE</label>
                  <input className="field-inp side-buy" placeholder="TP rate" value={tp} onChange={e=>setTp(e.target.value)} style={{borderColor:'var(--matrix)'}}/>
                </div>
                <div>
                  <label className="field-lbl" style={{color:'var(--red)'}}>STOP LOSS RATE</label>
                  <input className="field-inp side-sell" placeholder="SL rate" value={sl} onChange={e=>setSl(e.target.value)} style={{borderColor:'var(--red)'}}/>
                </div>
              </div>
            </>)}
            <div>
              <label className="field-lbl">AMOUNT TO DEPOSIT (USD VALUE)</label>
              <input className="field-inp" type="number" min="10" placeholder="Min $10" value={amount} onChange={e=>setAmount(e.target.value)}/>
            </div>
            <button className="btn btn-lime btn-full" style={{fontSize:18,padding:'12px'}} onClick={handleCreate} disabled={loading}>
              {loading?'AUTHORIZING & SIGNING...':`→ CREATE ${type.toUpperCase()} ORDER ON JUPITER`}
            </button>
            <div style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--font-pixel)',textAlign:'center'}}>
              POWERED BY JUPITER TRIGGER V2 · VAULT-BASED · IN-APP EXECUTION
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div className="card">
            <div className="card-header"><span className="pixel-sq pixel-sq-cyan"/><span className="card-header-title">ABOUT TRIGGER V2</span></div>
            <div style={{padding:14,display:'flex',flexDirection:'column',gap:6}}>
              {[
                {t:'IN-APP AUTH',d:'Wallet signature generates JWT for secure session'},
                {t:'DEPOSIT TX',d:'Requires transaction signature to fund the vault'},
                {t:'SINGLE LIMIT',d:'Buy/sell when price hits target'},
                {t:'OCO — TP/SL',d:'One-cancels-other: take profit + stop loss simultaneously'},
                {t:'OTOCO',d:'One-triggers-OCO: limit entry that auto-creates TP/SL'},
              ].map(({t,d})=>(
                <div key={t} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid rgba(204,255,0,.1)'}}>
                  <span className="badge badge-lime" style={{fontSize:11,flexShrink:0}}>{t}</span>
                  <span style={{fontSize:12,color:'var(--muted)'}}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-p">
            <div style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--lime)',marginBottom:8}}>BRAIN RECOMMENDATION</div>
            {fomoScore>65
              ?<><p style={{fontSize:13,color:'var(--amber)',marginBottom:8}}>Your FOMO score is HIGH ({fomoScore}/100). Using an OCO order with TP/SL prevents emotional exits and locks in profit targets automatically.</p>
                <div className="dashed-box" style={{fontSize:13}}>SUGGESTED: Set TP at +8% · SL at -4% from current price</div></>
              :<p style={{fontSize:13,color:'var(--muted)'}}>Your trading behavior is stable. A single limit order at your target price works well.</p>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
