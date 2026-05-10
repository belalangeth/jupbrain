'use client';
import { BehavioralAnalysis, BehavioralPattern } from '@/lib/behavioral';

function Ring({ score, label, invert=false }:{score:number;label:string;invert?:boolean}) {
  const r=30, circ=2*Math.PI*r, fill=(score/100)*circ;
  const c = invert ? (score>65?'#059669':score>40?'#d97706':'#dc2626') : (score>65?'#dc2626':score>40?'#d97706':'#059669');
  return (
    <div className="ring-wrap">
      <div style={{position:'relative',width:76,height:76,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
        <svg width={76} height={76} viewBox="0 0 76 76" style={{transform:'rotate(-90deg)'}}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="6"/>
          <circle cx="38" cy="38" r={r} fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}/>
        </svg>
        <span style={{position:'absolute',fontFamily:'var(--font-h)',fontWeight:800,fontSize:15,color:c}}>{score}</span>
      </div>
      <span className="ring-label">{label}</span>
    </div>
  );
}

function PatternRow({ p }:{p:BehavioralPattern}) {
  const ic=p.impact==='high'?'#dc2626':p.impact==='medium'?'#d97706':'#059669';
  const fc=p.frequency>65?'#dc2626':p.frequency>40?'#d97706':'#059669';
  return (
    <div style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:18}}>{p.emoji}</span>
          <span style={{fontFamily:'var(--font-h)',fontWeight:600,fontSize:14,color:'var(--t1)'}}>{p.name}</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:11,padding:'2px 8px',borderRadius:999,fontWeight:600,background:`${ic}18`,color:ic,border:`1px solid ${ic}30`}}>{p.impact}</span>
          <span style={{fontFamily:'var(--font-h)',fontWeight:700,fontSize:14,color:fc}}>{p.frequency}%</span>
        </div>
      </div>
      <div className="bar"><div className="bar-fill" style={{width:`${p.frequency}%`,background:`linear-gradient(90deg,${fc}66,${fc})`}}/></div>
      <p style={{fontSize:12,color:'var(--t3)',marginTop:6,lineHeight:1.5}}>{p.description}</p>
    </div>
  );
}

export function BehavioralMetrics({ analysis }:{ analysis:BehavioralAnalysis }) {
  const { fomoScore,panicSellScore,revengeTradeScore,diamondHandScore,narrativeChaserScore,overallRiskScore,totalSwaps,totalVolumeUsd,avgHoldTimeDays,topPatterns } = analysis;
  const rc=overallRiskScore>65?'#dc2626':overallRiskScore>40?'#d97706':'#059669';
  const rl=overallRiskScore>65?'High Risk':overallRiskScore>40?'Medium Risk':'Low Risk';
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="card card-p">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <h3 style={{fontFamily:'var(--font-h)',fontWeight:700,fontSize:16,color:'var(--t1)'}}>Behavioral Risk Score</h3>
          <span style={{fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:999,background:`${rc}18`,color:rc,border:`1px solid ${rc}30`}}>{rl}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:10}}>
          <Ring score={fomoScore} label="FOMO"/>
          <Ring score={panicSellScore} label="Panic Sell"/>
          <Ring score={revengeTradeScore} label="Revenge"/>
          <Ring score={diamondHandScore} label="Diamond" invert/>
          <Ring score={narrativeChaserScore} label="Narrative"/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[{v:String(totalSwaps),l:'Swaps'},{v:`$${(totalVolumeUsd/1000).toFixed(1)}K`,l:'Volume'},{v:`${avgHoldTimeDays}d`,l:'Avg Hold'}].map(s=>(
          <div key={s.l} className="stat-box"><div className="stat-box-val">{s.v}</div><div className="stat-box-lbl">{s.l}</div></div>
        ))}
      </div>
      <div className="card card-p">
        <h3 style={{fontFamily:'var(--font-h)',fontWeight:700,fontSize:16,marginBottom:4,color:'var(--t1)'}}>Top Patterns</h3>
        {topPatterns.map(p=><PatternRow key={p.id} p={p}/>)}
      </div>
    </div>
  );
}
