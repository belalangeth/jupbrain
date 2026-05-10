'use client';
import dynamic from 'next/dynamic';
const WalletBtn = dynamic(async()=>(await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,{ssr:false});
const TABS=[{id:'home',icon:'⌂',label:'HOME'},{id:'markets',icon:'◈',label:'MARKETS'},{id:'trade',icon:'⇄',label:'TRADE'},{id:'orders',icon:'◎',label:'ORDERS'},{id:'predict',icon:'◆',label:'PREDICT'},{id:'brain',icon:'Ψ',label:'BRAIN'}];
export function PixelNav({tab,setTab,dark,toggleDark}:{tab:string;setTab:(t:string)=>void;dark:boolean;toggleDark:()=>void}){
  const btnStyle=(id:string)=>({
    fontFamily:'var(--font-pixel)',fontSize:16,textTransform:'uppercase' as const,
    padding:'0 14px',height:'var(--nav-h)',display:'flex',alignItems:'center',gap:6,
    background:tab===id?'rgba(204,255,0,.15)':'transparent',
    color:tab===id?'var(--lime)':'rgba(240,240,232,.7)',
    borderTop:'none',borderRight:'none',borderLeft:'none',
    borderBottom:tab===id?'3px solid var(--lime)':'3px solid transparent',
    cursor:'pointer',whiteSpace:'nowrap' as const,flexShrink:0 as const,
    transition:'all .15s',letterSpacing:'.06em',
  });
  return(
    <>
      <nav className="navbar">
        <div className="nav-logo" style={{flexShrink:0}}>
          <div className="nav-logo-box">Ψ</div>
          <span className="nav-logo-text" style={{fontSize:18}}>JUPBRAIN</span>
        </div>
        <div style={{display:'flex',flex:1,overflowX:'auto',scrollbarWidth:'none'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={btnStyle(t.id)}>
              {t.icon}&nbsp;{t.label}
            </button>
          ))}
        </div>
        <div className="nav-right" style={{flexShrink:0,gap:8}}>
          <button onClick={toggleDark} style={{background:'transparent',border:'2px solid rgba(204,255,0,.5)',padding:'5px 10px',fontSize:14,cursor:'pointer',color:'var(--lime)',fontFamily:'var(--font-pixel)',letterSpacing:'.05em'}}>
            {dark?'☀ LIGHT':'◐ DARK'}
          </button>
          <WalletBtn/>
        </div>
      </nav>
      <div className="bottom-nav">
        {TABS.map(t=>(
          <button key={t.id} className={`bnav-item${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
            <span className="bnav-icon">{t.icon}</span>
            <span style={{fontSize:11}}>{t.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
