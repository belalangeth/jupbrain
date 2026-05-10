'use client';
export function AICoach({ insights, personalityEmoji }:{ insights:string[]; personalityEmoji:string }) {
  return (
    <div className="card card-p">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
        <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,rgba(124,58,237,.15),rgba(13,148,136,.1))',border:'1px solid rgba(124,58,237,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🧠</div>
        <div style={{flex:1}}>
          <h3 style={{fontFamily:'var(--font-h)',fontWeight:700,fontSize:15,color:'var(--t1)',marginBottom:2}}>AI Coaching</h3>
          <p style={{fontSize:12,color:'var(--t3)'}}>From your on-chain behavior</p>
        </div>
        <span style={{fontSize:22}}>{personalityEmoji}</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {insights.map((ins,i)=>(
          <div key={i} style={{display:'flex',gap:10,padding:'12px 14px',borderRadius:12,background:'rgba(124,58,237,0.05)',border:'1px solid rgba(124,58,237,0.12)'}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:'var(--violet)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0}}>{i+1}</div>
            <p style={{fontSize:13,lineHeight:1.6,color:'var(--t2)'}}>{ins}</p>
          </div>
        ))}
      </div>
      <div style={{marginTop:12,padding:'10px 12px',borderRadius:10,background:'rgba(13,148,136,0.05)',border:'1px solid rgba(13,148,136,0.15)',fontSize:12,color:'var(--t3)',lineHeight:1.5}}>
        💡 More trades = more accurate profile
      </div>
    </div>
  );
}
