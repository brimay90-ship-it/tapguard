import { useApp } from '../../context/AppContext';

const G = '#4ade80';

export default function RollDetail({ session, onBack }) {
  if (!session) return null;
  const rollCount = parseInt(session.tags[1]) || 1;
  const rolls = Array.from({length:rollCount},(_,i)=>({label:`Roll ${i+1}`,duration:session.tags[0]}));

  return (
    <div className="overlay-enter" style={{ position:'absolute', inset:0, background:'#000', overflowY:'auto', padding:'20px 20px 80px', zIndex:10 }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#444', cursor:'pointer', background:'none', border:'none', marginBottom:20, fontWeight:700, transition:'color 0.18s' }}
        onMouseEnter={e=>e.currentTarget.style.color='#aaa'} onMouseLeave={e=>e.currentTarget.style.color='#444'}
      >← Back</button>

      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:'#fff', marginBottom:4, letterSpacing:1 }}>{session.title.toUpperCase()}</div>
      <div style={{ fontSize:12, color:'#444', marginBottom:8, fontWeight:600 }}>{session.month} {session.day} · {session.tags[0]} · {session.tags[1]}</div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:24 }}>
        {session.tags.map(t=><span key={t} style={{ fontSize:9, letterSpacing:1, textTransform:'uppercase', padding:'2px 8px', background:'#111', borderRadius:4, color:'#444', fontWeight:600 }}>{t}</span>)}
      </div>

      {/* Roll Headers */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:10, fontWeight:700 }}>RECORDED ROLLS</div>
        <div style={{ display:'flex', gap:8 }}>
          {rolls.map((roll,i)=>(
            <div key={i} style={{
              background: i===0?'rgba(74,222,128,0.08)':'#111',
              border:`1px solid ${i===0?G:'#1f1f1f'}`,
              borderRadius:8, padding:'10px 14px', cursor:'pointer', transition:'all 0.18s',
            }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:16, color: i===0?G:'#fff' }}>{roll.label}</div>
              <div style={{ fontSize:10, color:'#444', marginTop:2, fontWeight:600 }}>{roll.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Missed Moves */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#f59e0b', marginBottom:12, fontWeight:700 }}>⚡ MISSED OPPORTUNITIES — CHESS ANALYSIS</div>
        {session.missedMoves.map((m,i)=>(
          <div key={i} className="card-enter" style={{ background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:10, padding:'14px 16px', marginBottom:8, animationDelay:`${i*0.08}s` }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'#fff', marginBottom:4, letterSpacing:0.5 }}>{m.move}</div>
            <div style={{ fontSize:13, color:'#666', fontWeight:400, lineHeight:1.5 }}>{m.explain}</div>
          </div>
        ))}
      </div>

      {/* Video */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:10, fontWeight:700 }}>SESSION RECORDING</div>
        <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:12, overflow:'hidden', background:'#111', border:'1px solid #1f1f1f', position:'relative' }}>
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/RcLRgNYMJbA" title="BJJ Rolling Session" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{display:'block'}}/>
          <div style={{ position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.8)', border:`1px solid ${G}`, borderRadius:4, padding:'4px 8px', fontSize:9, letterSpacing:2, textTransform:'uppercase', color:G, fontWeight:700 }}>Sample Roll</div>
        </div>
        <div style={{ fontSize:11, color:'#333', marginTop:8, fontStyle:'italic', fontWeight:400 }}>Your recorded session will appear here after processing.</div>
      </div>

      {/* Timeline */}
      <div>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:8, fontWeight:700 }}>SESSION TIMELINE</div>
        {session.timeline.map((tl,i)=>(
          <div key={i} className="card-enter" style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'12px 0', borderBottom:'1px solid #111', animationDelay:`${i*0.05}s` }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:14, color:'#333', minWidth:36, letterSpacing:1 }}>{tl.time}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:2 }}>{tl.move}</div>
              <div style={{ fontSize:11, color:'#444', fontWeight:400 }}>{tl.note}</div>
            </div>
            <div style={{ width:8, height:8, borderRadius:'50%', background:tl.color, marginTop:5, flexShrink:0 }}/>
          </div>
        ))}
      </div>
    </div>
  );
}
