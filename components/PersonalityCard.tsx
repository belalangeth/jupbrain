'use client';
import { PERSONALITY_CONFIGS, PersonalityType } from '@/lib/behavioral';

const GRADIENTS: Record<string,string> = {
  'emotional-degen':   'linear-gradient(135deg,#f43f5e,#f97316)',
  'calculated-sniper': 'linear-gradient(135deg,#0d9488,#0ea5e9)',
  'narrative-chaser':  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'diamond-phantom':   'linear-gradient(135deg,#7c3aed,#06b6d4)',
  'revenge-trader':    'linear-gradient(135deg,#be123c,#9333ea)',
  'contrarian':        'linear-gradient(135deg,#0369a1,#0d9488)',
};

export function PersonalityCard({ personalityType, walletAddress, totalSwaps, fomoScore, diamondHandScore }:{
  personalityType:PersonalityType; walletAddress:string; totalSwaps:number; fomoScore:number; diamondHandScore:number;
}) {
  const config = PERSONALITY_CONFIGS[personalityType];
  const short = walletAddress.slice(0,4)+'...'+walletAddress.slice(-4);
  const fc = fomoScore>65?'#ef4444':fomoScore>40?'#f59e0b':'#10b981';
  const hc = diamondHandScore>65?'#10b981':diamondHandScore>40?'#f59e0b':'#ef4444';

  const share = () => {
    const t = `My Solana trading personality on JupBrain 🧠\n\n${config.emoji} ${config.label}\n"${config.tagline}"\n\nFOMO: ${fomoScore}/100 · Diamond Hands: ${diamondHandScore}/100\n\n#JupBrain #Solana #Jupiter`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank');
  };

  return (
    <div>
      <h2 style={{fontFamily:'var(--font-h)',fontWeight:700,fontSize:16,marginBottom:12,color:'var(--t1)'}}>Your Trading Identity</h2>
      <div className="p-card" style={{background:GRADIENTS[personalityType]??GRADIENTS['diamond-phantom']}}>
        <div className="shine"/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
            <div>
              <div style={{fontSize:40,marginBottom:6}}>{config.emoji}</div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',color:'rgba(255,255,255,.6)',textTransform:'uppercase',marginBottom:4}}>Trading Personality</div>
              <h3 style={{fontFamily:'var(--font-h)',fontWeight:900,fontSize:20,color:'#fff'}}>{config.label}</h3>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Wallet</div>
              <div style={{fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,.7)',marginBottom:8}}>{short}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Swaps</div>
              <div style={{fontFamily:'var(--font-h)',fontWeight:900,fontSize:22,color:'#fff'}}>{totalSwaps}</div>
            </div>
          </div>
          <p style={{fontStyle:'italic',color:'rgba(255,255,255,.6)',fontSize:13,marginBottom:14}}>"{config.tagline}"</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
            {config.traits.map(t=><span key={t} style={{fontSize:12,padding:'3px 10px',borderRadius:999,background:'rgba(255,255,255,.15)',color:'rgba(255,255,255,.85)',border:'1px solid rgba(255,255,255,.15)'}}>{t}</span>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {[{l:'💪 Strength',v:config.strength},{l:'⚠️ Weakness',v:config.weakness}].map(b=>(
              <div key={b.l} style={{background:'rgba(0,0,0,.18)',borderRadius:10,padding:'10px 12px'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginBottom:3}}>{b.l}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.78)',lineHeight:1.4}}>{b.v}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:20,alignItems:'flex-end'}}>
            <div><div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>FOMO</div><span style={{fontFamily:'var(--font-h)',fontWeight:800,fontSize:20,color:fc}}>{fomoScore}<span style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>/100</span></span></div>
            <div><div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Diamond Hands</div><span style={{fontFamily:'var(--font-h)',fontWeight:800,fontSize:20,color:hc}}>{diamondHandScore}<span style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>/100</span></span></div>
            <div style={{marginLeft:'auto'}}><div style={{fontSize:11,color:'rgba(255,255,255,.25)'}}>jupbrain.app</div></div>
          </div>
        </div>
      </div>
      <button onClick={share} className="btn btn-outline btn-full" style={{marginTop:10}}>𝕏 &nbsp;Share Personality</button>
    </div>
  );
}
