'use client';
type Token={id:string;rank:number;symbol:string;name:string;emoji:string;image:string|null;price:number;pair:string;change24h:number;volume24h:number;mcap:number;verified:boolean;organicScore:number|null;daily_volume?:number;mintAddr?:string;decimals?:number};
function fmtP(p:number){if(p>=1000)return p.toLocaleString(undefined,{maximumFractionDigits:0});if(p>=1)return p.toFixed(2);if(p>=0.001)return p.toFixed(4);return p.toExponential(2);}
function fmtV(n:number){if(n>=1e9)return'$'+(n/1e9).toFixed(1)+'B';if(n>=1e6)return'$'+(n/1e6).toFixed(1)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(0)+'K';return'$'+n.toFixed(0);}

export function PixelMarkets({tokens,loading}:{tokens:Token[];loading:boolean}){
  return(
    <div className="container" style={{paddingTop:16}}>
      <div className="sec-hdr">
        <div className="sec-title"><span className="pixel-sq pixel-sq-lime"/><span className="pixel-sq pixel-sq-mag" style={{marginLeft:3}}/>&nbsp;TOP SOLANA PAIRS</div>
        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted)'}}>
          <span className="live-dot"/>&nbsp;JUPITER PRICE V3 · 30s
        </div>
      </div>
      <div className="card" style={{maxHeight:'75vh',overflow:'auto',scrollbarWidth:'thin',scrollbarColor:'var(--lime) var(--navy)'}}>
        {loading
          ?<div style={{padding:40,textAlign:'center',fontFamily:'var(--font-pixel)',color:'var(--lime)',fontSize:20}}>LOADING PRICES...</div>
          :<table className="rt" style={{width:'100%',position:'relative'}}>
            <thead style={{position:'sticky',top:0,zIndex:10,background:'var(--navy-d)'}}>
              <tr><th>#</th><th>TOKEN</th><th>PAIR</th><th>PRICE (JUPITER)</th><th>24H</th><th>VOLUME</th><th>MKT CAP</th><th>SCORE</th><th>TRADE</th></tr>
            </thead>
            <tbody>{tokens.map(t=>(
              <tr key={t.id}>
                <td style={{color:'var(--muted)',fontFamily:'var(--font-pixel)',paddingLeft:14}}>{t.rank}</td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {t.image?<img src={t.image} alt={t.symbol} width={24} height={24} style={{borderRadius:'50%'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>:<span>{t.emoji ?? '🪙'}</span>}
                    <div><div className="rt-sym">{t.symbol}</div><div className="rt-name" style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</div></div>
                    {t.verified&&<span className="badge badge-lime" style={{fontSize:10}}>VRFD</span>}
                  </div>
                </td>
                <td><span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--lime)',background:'rgba(204,255,0,.1)',padding:'2px 7px',border:'1px solid rgba(204,255,0,.3)'}}>{t.pair ?? `SOL-${t.symbol}`}</span></td>
                <td><span className="rt-price">${fmtP(t.price)}</span></td>
                <td><span className={`rt-chg ${(t.change24h||0)>=0?'chg-pos':'chg-neg'}`}>{(t.change24h||0)>=0?'▲':'▼'}{Math.abs(t.change24h||0).toFixed(2)}%</span></td>
                <td><span className="rt-vol">{fmtV(t.volume24h||t.daily_volume||0)}</span></td>
                <td><span className="rt-vol">{(t.mcap||0)>0?fmtV(t.mcap):'—'}</span></td>
                <td>{t.organicScore!=null?<span className="badge badge-cyan">{t.organicScore.toFixed(2)}</span>:<span style={{color:'var(--muted)',fontSize:11}}>—</span>}</td>
                <td><a href={`https://jup.ag/swap/SOL-${t.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-lime" style={{padding:'4px 12px',fontSize:14}}>SWAP→</a></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
      <div style={{marginTop:8,fontSize:11,color:'var(--muted)',textAlign:'right',fontFamily:'var(--font-pixel)'}}>SOURCE: JUPITER PRICE V3 + TOKENS V2 · ORGANIC SCORE FROM JUPITER VRFD</div>
    </div>
  );
}
