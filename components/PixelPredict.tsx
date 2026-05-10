'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, VersionedTransaction } from '@solana/web3.js';

type Market={id:string;question:string;platform:string;platformUrl:string;yesOdds:number;noOdds:number;volume:number;endDate:string;tags:string[];hot:boolean;category:string;source?:string;marketId?:string};
function fmtV(n:number){if(n>=1e6)return'$'+(n/1e6).toFixed(1)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(0)+'K';return'$'+n.toFixed(0);}

export function PixelPredict({markets,loading}:{markets:Market[];loading:boolean}){
  const { publicKey, signTransaction } = useWallet();
  const [filter,setFilter]=useState<'all'|'solana'|'crypto'>('all');
  const [buying,setBuying]=useState<string|null>(null);
  const [betAmount,setBetAmount]=useState<number>(10);

  const displayed=filter==='all'?markets:filter==='solana'?markets.filter(m=>/(SOL|JUP|BONK|WIF|solana)/i.test(m.question)):markets.filter(m=>/(BTC|ETH|crypto)/i.test(m.question));

  const handlePredict = async(m:Market, isYes:boolean) => {
    if (!publicKey || !signTransaction) {
      alert('⚠️ PLEASE CONNECT WALLET FIRST');
      return;
    }
    setBuying(m.id + (isYes ? '-yes' : '-no'));
    try {
      const res = await fetch('/api/prediction-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerPubkey: publicKey.toBase58(),
          marketId: m.marketId ?? m.id,
          isYes,
          isBuy: true,
          amount: betAmount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to craft order');

      const txBuffer = Buffer.from(data.transaction, 'base64');
      const tx = VersionedTransaction.deserialize(txBuffer);
      const signed = await signTransaction(tx);
      const conn = new Connection('https://api.mainnet-beta.solana.com');
      const sig = await conn.sendRawTransaction(signed.serialize());
      alert(`✅ PREDICTION PLACED!\nSignature: ${sig}`);
    } catch(e:any) {
      alert(`❌ ERROR: ${e.message}`);
    } finally {
      setBuying(null);
    }
  };

  return(
    <div className="container" style={{paddingTop:16}}>
      <div className="sec-hdr">
        <div className="sec-title"><span className="pixel-sq pixel-sq-lime"/><span className="pixel-sq pixel-sq-mag" style={{marginLeft:3}}/>&nbsp;PREDICTION MARKETS</div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <span className="live-dot"/>&nbsp;<span style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--muted)'}}>JUPITER PREDICTION V1</span>
        </div>
      </div>

      <div style={{marginBottom:16,display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        {(['all','solana','crypto'] as const).map(f=>(
          <button key={f} className={`btn ${filter===f?'btn-lime':'btn-ghost'}`} onClick={()=>setFilter(f)} style={{fontSize:15}}>
            {f.toUpperCase()}
          </button>
        ))}
        
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--lime)'}}>BET SIZE (USDC):</span>
          <input 
            type="number" 
            className="search-input" 
            value={betAmount} 
            onChange={e=>setBetAmount(Number(e.target.value))} 
            style={{width:80,textAlign:'center'}}
          />
        </div>
      </div>

      {loading
        ?<div style={{padding:60,textAlign:'center',fontFamily:'var(--font-pixel)',color:'var(--lime)',fontSize:22}}>LOADING MARKETS...</div>
        :displayed.length===0
          ?<div className="dashed-box">NO MARKETS FOUND. <a href="https://jup.ag/prediction" target="_blank" style={{color:'var(--lime)'}}>OPEN JUPITER →</a></div>
          :<div className="pred-grid">
            {displayed.map(m=>(
              <div key={m.id} className="card pred-card" style={{display:'flex',flexDirection:'column'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <a href={m.platformUrl} target="_blank" rel="noopener noreferrer" className="badge badge-lime" style={{fontSize:12,textDecoration:'none'}}>{m.platform} ↗</a>
                  <div style={{display:'flex',gap:4}}>
                    {m.hot&&<span className="badge badge-magenta" style={{fontSize:11}}>HOT</span>}
                    <span style={{fontFamily:'var(--font-pixel)',fontSize:11,color:'var(--muted)'}}>{m.category.toUpperCase()}</span>
                  </div>
                </div>
                <p className="pred-q" style={{flex:1}}>{m.question.toUpperCase()}</p>
                <div className="pred-bar-wrap"><div className="pred-bar-fill" style={{width:`${m.yesOdds}%`}}/></div>
                <div className="pred-odds">
                  <div style={{flex:1}}>
                    <button className="btn btn-ghost btn-full" style={{flexDirection:'column',gap:2,padding:'8px',borderColor:'var(--matrix)',color:'var(--matrix)'}} onClick={()=>handlePredict(m,true)} disabled={buying!==null}>
                      <span className="pred-yes">{buying===m.id+'-yes'?'...':`${m.yesOdds}%`}</span>
                      <span className="pred-sub">BUY YES</span>
                    </button>
                  </div>
                  <div style={{width:10}}/>
                  <div style={{flex:1}}>
                    <button className="btn btn-ghost btn-full" style={{flexDirection:'column',gap:2,padding:'8px',borderColor:'var(--red)',color:'var(--red)'}} onClick={()=>handlePredict(m,false)} disabled={buying!==null}>
                      <span className="pred-no">{buying===m.id+'-no'?'...':`${m.noOdds}%`}</span>
                      <span className="pred-sub">BUY NO</span>
                    </button>
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                  <span style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--amber)'}}>VOL: {fmtV(m.volume)}</span>
                  <div style={{display:'flex',gap:4}}>{m.tags.map(t=><span key={t} className="badge badge-cyan" style={{fontSize:10}}>{t}</span>)}</div>
                </div>
                <div style={{marginTop:6,fontFamily:'var(--font-pixel)',fontSize:12,color:'var(--muted)'}}>ENDS: {m.endDate}</div>
              </div>
            ))}
          </div>
      }
      <div style={{marginTop:12,textAlign:'center',fontFamily:'var(--font-pixel)',fontSize:12,color:'var(--muted)'}}>
        POWERED BY <a href="https://jup.ag/prediction" target="_blank" style={{color:'var(--lime)'}}>JUPITER PREDICTION V1</a> · AGGREGATES POLYMARKET + KALSHI
      </div>
    </div>
  );
}
