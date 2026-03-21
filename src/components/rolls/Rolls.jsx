import { useState } from 'react';
import RollDetail from './RollDetail';
import { rollSessions } from '../../data/weekPlan';

const G = '#4ade80';

export default function Rolls() {
  const [selected, setSelected]   = useState(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [timer, setTimer]         = useState(null);

  const toggleRecord = () => {
    if (!recording) {
      setRecording(true); setRecSeconds(0);
      const t = setInterval(() => setRecSeconds(s => s + 1), 1000);
      setTimer(t);
    } else {
      setRecording(false); clearInterval(timer); setTimer(null); setRecSeconds(0);
    }
  };
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{ position:'relative', height:'100%' }}>
      <div style={{ padding:'20px 20px 120px', overflowY:'auto', height:'100%' }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:6, fontWeight:700 }}>Session History</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:30, color:'#fff', marginBottom:20, letterSpacing:1 }}>ROLL ANALYSIS</div>

        {rollSessions.map(session => (
          <div key={session.id} onClick={() => setSelected(session)} style={{
            background:'#111', border:'1px solid #1f1f1f',
            borderRadius:12, padding:'16px', marginBottom:8,
            cursor:'pointer', display:'flex', gap:14, alignItems:'flex-start',
            transition:'border-color 0.18s',
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=G}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#1f1f1f'}
          >
            <div style={{ textAlign:'center', minWidth:38 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, lineHeight:1, color:G }}>{session.day}</div>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#444', fontWeight:700 }}>{session.month}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'#fff', marginBottom:6, letterSpacing:0.5 }}>{session.title}</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:6 }}>
                {session.tags.map(t => (
                  <span key={t} style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', padding:'2px 8px', background:'#1a1a1a', borderRadius:4, color:'#555', fontWeight:600 }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize:12, color:'#f59e0b', display:'flex', alignItems:'center', gap:4, fontWeight:600 }}>⚡ {session.missed} missed opportunities</div>
            </div>
            <span style={{ color:'#333', fontSize:18, alignSelf:'center' }}>›</span>
          </div>
        ))}

        <div onClick={toggleRecord} style={{
          width:'100%', background: recording ? 'rgba(74,222,128,0.04)' : '#111',
          border:`1px ${recording?'solid':'dashed'} ${recording?G:'#1f1f1f'}`,
          borderRadius:12, padding:20, color: recording ? '#fff' : '#444',
          fontSize:14, fontWeight:700, cursor:'pointer', textAlign:'center',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          marginTop:8, transition:'all 0.18s',
          animation: recording ? 'pulse 1.2s ease-in-out infinite' : 'none',
        }}>
          {recording ? `⏹ ${fmt(recSeconds)} — STOP RECORDING` : '⏺ START RECORDING SESSION'}
        </div>
      </div>
      {selected && <RollDetail session={selected} onBack={() => setSelected(null)} />}
    </div>
  );
}
