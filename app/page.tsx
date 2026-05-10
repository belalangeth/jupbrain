'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { PixelNav } from '@/components/PixelNav';
import { PixelMarkets } from '@/components/PixelMarkets';
import { PixelTrade } from '@/components/PixelTrade';
import { PixelOrders } from '@/components/PixelOrders';
import { PixelPredict } from '@/components/PixelPredict';
import { PersonalityCard } from '@/components/PersonalityCard';
import { BehavioralMetrics } from '@/components/BehavioralMetrics';
import { AICoach } from '@/components/AICoach';
import { PERSONALITY_CONFIGS, type BehavioralAnalysis } from '@/lib/behavioral';

const WalletBtn = dynamic(async()=>(await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,{ssr:false});

type Result = BehavioralAnalysis & { aiCoaching: string[] };
type Token = { id:string;rank:number;symbol:string;name:string;emoji:string;image:string|null;price:number;pair:string;change24h:number;volume24h:number;mcap:number;verified:boolean;organicScore:number|null;jupMint:string;mintAddr:string;decimals:number;daily_volume:number };
type Market = { id:string;question:string;platform:string;platformUrl:string;yesOdds:number;noOdds:number;volume:number;endDate:string;tags:string[];hot:boolean;category:string };
type Stats = { tps:number;validators:number };
const DEMO = 'DemoWallet9xSolanaBrain42TraderXYZ';

function fmtP(p:number){if(p>=1000)return p.toLocaleString(undefined,{maximumFractionDigits:0});if(p>=1)return p.toFixed(2);if(p>=0.001)return p.toFixed(4);return p.toExponential(2);}

function useDarkMode(){
  const [dark,setDark]=useState(true); // default dark for terminal feel
  useEffect(()=>{
    const s=localStorage.getItem('sb-theme');
    const isDark=s!=='light';
    setDark(isDark);
    document.documentElement.setAttribute('data-theme',isDark?'dark':'light');
  },[]);
  const toggle=()=>{
    const next=!dark; setDark(next);
    document.documentElement.setAttribute('data-theme',next?'dark':'light');
    localStorage.setItem('sb-theme',next?'dark':'light');
  };
  return {dark,toggle};
}

/* ── Ticker ── */
function Ticker({tokens}:{tokens:Token[]}){
  const items=[...tokens,...tokens];
  return(
    <div className="ticker-wrap">
      <div className="ticker-track">
        {items.map((t,i)=>(
          <div key={i} className="ticker-item">
            {t.image?<img src={t.image} alt={t.symbol} className="ticker-logo" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>:<span>{t.emoji}</span>}
            <span className="ticker-sym">{t.symbol}</span>
            <span className="ticker-price">${fmtP(t.price)}</span>
            <span className={`ticker-chg ${t.change24h>=0?'chg-pos':'chg-neg'}`}>{t.change24h>=0?'▲':'▼'}{Math.abs(t.change24h).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Home ── */
function HomeTab({tokens,totalTokens,stats,onAnalyze}:{tokens:Token[];totalTokens:number;stats:Stats|null;onAnalyze:()=>void}){
  const sol=tokens.find(t=>t.symbol==='SOL');
  return(
    <div>
      <div className="hero">
        <div className="hero-title glow-anim">JUPBRAIN</div>
        <div className="hero-sub">BEHAVIORAL INTELLIGENCE · JUPITER DEFI SUITE · SOLANA</div>
        <div className="hero-ctas">
          <button className="btn btn-lime" onClick={onAnalyze}>Ψ ANALYZE MY WALLET</button>
          <WalletBtn/>
          <a href="https://jup.ag" target="_blank" className="btn btn-navy">◎ OPEN JUPITER</a>
        </div>
        <div className="hero-stats">
          {[
            {v:sol?`$${fmtP(sol.price)}`:'—',l:'SOL PRICE LIVE'},
            {v:stats?.tps?`${stats.tps.toLocaleString()}`:'—',l:'SOLANA TPS'},
            {v:stats?.validators?`${stats.validators}`:'—',l:'VALIDATORS'},
            {v:totalTokens>0?totalTokens.toLocaleString():'—',l:'TOKENS TRACKED'},
          ].map(s=>(
            <div key={s.l} className="hero-stat">
              <div className="hero-stat-val">{s.v}</div>
              <div className="hero-stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      {tokens.length>0&&<Ticker tokens={tokens}/>}
      <div className="container" style={{marginTop:28,paddingBottom:32}}>
        <div className="feature-grid">
          {[
            {icon:'Ψ',t:'BEHAVIORAL BRAIN',d:'AI analyzes your on-chain swap history to detect FOMO, panic selling, and revenge trading patterns. Get personalized coaching to trade smarter.'},
            {icon:'⇄',t:'JUPITER SWAP V2',d:'Best price across ALL routers simultaneously: Metis, JupiterZ RFQ, Dflow, OKX. Gasless + MEV protection built-in. No extra setup needed.'},
            {icon:'◎',t:'TRIGGER ORDERS',d:'Set limit orders with OCO (TP/SL) and OTOCO via Jupiter Trigger V2. Auto-executes at your target price. Never miss an entry or exit again.'},
          ].map(f=>(
            <div key={f.t} className="card feature-card">
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.t}</div>
              <p className="feature-desc">{f.d}</p>
            </div>
          ))}
        </div>
        <div className="api-badges">
          {['JUPITER PRICE V3','JUPITER TOKENS V2','JUPITER SWAP V2','JUPITER TRIGGER V2','JUPITER PREDICTION V1','SOLANA RPC'].map(b=>(
            <span key={b} className="badge badge-lime">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Brain ── */
function BrainTab({result,isDemo,onScan,loading}:{result:Result|null;isDemo:boolean;onScan:(a:string,d?:boolean)=>void;loading:boolean}){
  if(!result) return(
    <div className="container" style={{paddingTop:40,textAlign:'center'}}>
      <div style={{fontFamily:'var(--font-pixel)',fontSize:64,color:'var(--lime)',textShadow:'0 0 30px rgba(204,255,0,.5)'}}>Ψ</div>
      <div style={{fontFamily:'var(--font-pixel)',fontSize:32,color:'var(--lime)',margin:'12px 0'}}>BEHAVIORAL ANALYSIS</div>
      <p style={{color:'var(--muted)',marginBottom:28,maxWidth:480,margin:'0 auto 28px',lineHeight:1.7}}>Connect your Solana wallet or try demo mode to analyze your trading psychology, FOMO score, and get AI coaching.</p>
      <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
        <button className="btn btn-lime" style={{fontSize:18,padding:'10px 28px'}} onClick={()=>onScan(DEMO,true)} disabled={loading}>
          {loading?'SCANNING...':'◈ TRY DEMO MODE'}
        </button>
        <WalletBtn/>
      </div>
    </div>
  );
  const cfg=PERSONALITY_CONFIGS[result.personalityType];
  return(
    <div className="container" style={{paddingTop:16}}>
      {isDemo&&<div className="demo-bar">◈ DEMO MODE — CONNECT REAL WALLET FOR ACTUAL ON-CHAIN ANALYSIS</div>}
      <div className="dash-grid">
        <div className="dash-col">
          <div style={{flex:'0 0 auto'}}><PersonalityCard personalityType={result.personalityType} walletAddress={result.walletAddress} totalSwaps={result.totalSwaps} fomoScore={result.fomoScore} diamondHandScore={result.diamondHandScore}/></div>
          <div style={{flex:1,minHeight:0}}><AICoach insights={result.aiCoaching} personalityEmoji={cfg.emoji}/></div>
        </div>
        <div className="dash-col">
          <div style={{flex:1,minHeight:0,overflowY:'auto'}}><BehavioralMetrics analysis={result}/></div>
        </div>
        <div className="jup-wrap">
          <div className="jup-header">
            <div style={{fontFamily:'var(--font-pixel)',fontSize:16,color:'var(--lime)'}}>⇄ SMART SWAP — JUPITER V2</div>
            <div style={{fontSize:11,color:'var(--muted)'}}>FOMO score: {result.fomoScore}/100 · {result.fomoScore>65?'⚠ HIGH RISK — USE LIMIT ORDER':'✓ STABLE'}</div>
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:0}}>
            <PixelTrade fomoScore={result.fomoScore}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Scanner ── */
function Scanner({addr}:{addr:string}){
  return(
    <div className="scanner">
      <div className="scan-box"><span style={{fontSize:48,fontFamily:'var(--font-pixel)',color:'var(--lime)'}}>Ψ</span></div>
      <div style={{fontFamily:'var(--font-pixel)',fontSize:28,color:'var(--lime)'}}>SCANNING WALLET</div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:14,color:'var(--muted)'}}>{addr.slice(0,8)}...{addr.slice(-6)}</div>
      {['▸ FETCHING JUPITER HISTORY','▸ DETECTING FOMO PATTERNS','▸ MAPPING PSYCHOLOGY','▸ GENERATING PROFILE'].map((s,i)=>(
        <div key={s} className="scan-step" style={{animationDelay:`${i*.6}s`}}>{s}</div>
      ))}
    </div>
  );
}

/* ── Main ── */
export default function Home(){
  const {publicKey,connected}=useWallet();
  const {dark,toggle}=useDarkMode();
  const [tab,setTab]=useState('home');
  const [result,setResult]=useState<Result|null>(null);
  const [loading,setLoading]=useState(false);
  const [isDemo,setIsDemo]=useState(false);
  const [scanning,setScanning]=useState(false);
  const [scanAddr,setScanAddr]=useState('');
  const [tradeMint,setTradeMint]=useState('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const [tokens,setTokens]=useState<Token[]>([]);
  const [totalTokens,setTotalTokens]=useState(0);
  const [tokensLoading,setTokensLoading]=useState(true);
  const [markets,setMarkets]=useState<Market[]>([]);
  const [marketsLoading,setMarketsLoading]=useState(true);
  const [stats,setStats]=useState<Stats|null>(null);

  useEffect(()=>{
    const load=async()=>{try{const r=await fetch('/api/tokens?limit=100');const d=await r.json();setTokens(d.tokens??[]);setTotalTokens(d.total??0);}catch{}finally{setTokensLoading(false);}};
    load();const iv=setInterval(load,15000);return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    fetch('/api/predictions?q=crypto').then(r=>r.json()).then(d=>setMarkets(d.markets??[])).catch(()=>{}).finally(()=>setMarketsLoading(false));
  },[]);

  useEffect(()=>{
    const load=()=>fetch('/api/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
    load();const iv=setInterval(load,60000);return()=>clearInterval(iv);
  },[]);

  const runAnalysis=useCallback(async(addr:string,demo=false)=>{
    setLoading(true);setIsDemo(demo);setScanAddr(addr);setScanning(true);setResult(null);setTab('brain');
    await new Promise(r=>setTimeout(r,2400));
    try{const res=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({walletAddress:addr})});setResult(await res.json());}
    catch{}finally{setLoading(false);setScanning(false);}
  },[]);

  if(connected&&publicKey&&!result&&!loading) runAnalysis(publicKey.toBase58(),false);

  const fomoScore=result?.fomoScore??0;

  return(
    <>
      <PixelNav tab={tab} setTab={setTab} dark={dark} toggleDark={toggle}/>
      <div className="page">
        {scanning&&<Scanner addr={scanAddr}/>}
        {!scanning&&tab==='home'   &&<HomeTab tokens={tokens} totalTokens={totalTokens} stats={stats} onAnalyze={()=>runAnalysis(DEMO,true)}/>}
        {!scanning&&tab==='markets'&&<PixelMarkets tokens={tokens} loading={tokensLoading} onTrade={(mint)=>{setTradeMint(mint);setTab('trade');}}/>}
        {!scanning&&tab==='trade'  &&<PixelTrade fomoScore={fomoScore} initialOutputMint={tradeMint}/>}
        {!scanning&&tab==='orders' &&<PixelOrders tokens={tokens} fomoScore={fomoScore}/>}
        {!scanning&&tab==='predict'&&<PixelPredict markets={markets} loading={marketsLoading}/>}
        {!scanning&&tab==='brain'  &&<BrainTab result={result} isDemo={isDemo} onScan={runAnalysis} loading={loading}/>}
      </div>
    </>
  );
}
