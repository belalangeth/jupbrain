'use client';
import Script from 'next/script';
import { useState, useEffect } from 'react';

export function PixelTrade({fomoScore,initialOutputMint='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'}:{fomoScore:number;initialOutputMint?:string}){
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    if(!loaded){
      if(typeof window!=='undefined' && (window as any).Jupiter) setLoaded(true);
      return;
    }
    const init=()=>{
      try{
        (window as any).Jupiter?.init({
          displayMode:'integrated',
          integratedTargetId:'jup-terminal-v2',
          endpoint:'https://api.mainnet-beta.solana.com',
          strictTokenList:false,
          defaultExplorer:'SolanaFM',
          formProps:{initialInputMint:'So11111111111111111111111111111111111111112',initialOutputMint},
        });
      }catch(e){console.warn(e);}
    };
    init();
  },[loaded, initialOutputMint]);

  return(
    <div className="container" style={{paddingTop:16}}>
      <div className="sec-hdr">
        <div className="sec-title"><span className="pixel-sq pixel-sq-lime"/><span className="pixel-sq pixel-sq-cyan" style={{marginLeft:3}}/>&nbsp;SWAP — JUPITER SWAP V2</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span className="badge badge-green">META-AGGREGATOR</span>
          <span className="badge badge-cyan">GASLESS</span>
          <span className="badge badge-lime">MEV PROTECTED</span>
        </div>
      </div>

      {fomoScore>65&&(
        <div className="warn" style={{marginBottom:12}}>
          ⚠ FOMO SCORE: {fomoScore}/100 — HIGH EMOTIONAL RISK. CONSIDER LIMIT ORDER INSTEAD.
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <div className="card card-p">
          <div style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--muted)',marginBottom:8}}>HOW JUPITER SWAP V2 WORKS</div>
          {[
            ['GET /swap/v2/order','Best price from ALL routers'],
            ['Routers compete','Metis, JupiterZ RFQ, Dflow, OKX'],
            ['POST /swap/v2/execute','Managed landing + MEV protection'],
            ['GASLESS built-in','Auto when balance &lt; 0.01 SOL'],
          ].map(([k,v])=>(
            <div key={k} className="quote-row">
              <span className="quote-key" style={{fontFamily:'var(--font-mono)',fontSize:12}} dangerouslySetInnerHTML={{__html:k}}/>
              <span className="quote-val" style={{fontSize:12,textAlign:'right',maxWidth:160}} dangerouslySetInnerHTML={{__html:v}}/>
            </div>
          ))}
        </div>
        <div className="card card-p">
          <div style={{fontFamily:'var(--font-pixel)',fontSize:13,color:'var(--muted)',marginBottom:8}}>QUICK LINKS</div>
          {[
            {l:'SOL → USDC',u:'https://jup.ag/swap/SOL-USDC'},
            {l:'SOL → JUP',u:'https://jup.ag/swap/SOL-JUP'},
            {l:'SOL → BONK',u:'https://jup.ag/swap/SOL-BONK'},
            {l:'SOL → WIF',u:'https://jup.ag/swap/SOL-WIF'},
          ].map(({l,u})=>(
            <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="btn btn-navy btn-full" style={{marginBottom:6,justifyContent:'space-between',fontSize:15}}>
              {l}<span>→</span>
            </a>
          ))}
        </div>
      </div>

      <div className="card" style={{minHeight:520}}>
        <div className="card-header">
          <span className="pixel-sq pixel-sq-lime"/><span className="pixel-sq pixel-sq-mag" style={{marginLeft:4}}/>
          <span className="card-header-title">JUPITER TERMINAL — SWAP V2</span>
          <span className="badge badge-green" style={{marginLeft:'auto'}}>LIVE</span>
        </div>
        <Script src="https://terminal.jup.ag/main-v4.js" data-preload onLoad={()=>setLoaded(true)}/>
        <div id="jup-terminal-v2" style={{minHeight:480}}/>
        {!loaded&&<div style={{padding:40,textAlign:'center',fontFamily:'var(--font-pixel)',color:'var(--lime)',fontSize:18}}>LOADING JUPITER TERMINAL...</div>}
      </div>
    </div>
  );
}
