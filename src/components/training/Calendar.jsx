import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const G     = '#4ade80';
const AMBER = '#f59e0b';
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar() {
  const { bjjDays, workoutDays } = useApp();
  const [view, setView]   = useState('month'); // 'month' | 'week'
  const [offset, setOffset] = useState(0);     // month or week offset from today

  const today = new Date();

  // ── Month view helpers ────────────────────────────────
  const getMonthData = () => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year  = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, firstDay, daysInMonth };
  };

  // ── Week view helpers ─────────────────────────────────
  const getWeekData = () => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + offset * 7);
    return Array.from({length:7}, (_,i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  // What type is a given weekday index (0=Sun)?
  const isBjj     = (dow) => bjjDays.includes(dow === 0 ? 6 : dow - 1);     // our bjjDays uses Mon=0
  const isWorkout = (dow) => workoutDays.includes(dow === 0 ? 6 : dow - 1);

  // Convert JS getDay() (0=Sun) to our Mon=0 index
  const dowToIdx = (dow) => (dow + 6) % 7;
  const idxBjj     = (idx) => bjjDays.includes(idx);
  const idxWorkout = (idx) => workoutDays.includes(idx);

  const getDayStyle = (idx, isToday, inMonth = true) => {
    const bjj = idxBjj(idx);
    const wkt = idxWorkout(idx);
    let bg = 'transparent';
    let border = '1px solid transparent';
    let color = inMonth ? '#666' : '#2a2a2a';

    if (bjj && wkt) { bg = 'rgba(74,222,128,0.12)'; border = `1px solid rgba(74,222,128,0.3)`; color = '#fff'; }
    else if (bjj)   { bg = 'rgba(74,222,128,0.1)';  border = `1px solid rgba(74,222,128,0.25)`; color = G; }
    else if (wkt)   { bg = 'rgba(245,158,11,0.1)';  border = `1px solid rgba(245,158,11,0.25)`; color = AMBER; }

    if (isToday) { border = `2px solid ${bjj ? G : wkt ? AMBER : '#444'}`; }

    return { bg, border, color };
  };

  const { year, month, firstDay, daysInMonth } = getMonthData();
  const weekDays = getWeekData();

  const navLabel = view === 'month'
    ? `${MONTH_NAMES[month]} ${year}`
    : (() => {
        const s = weekDays[0]; const e = weekDays[6];
        return `${MONTH_NAMES[s.getMonth()].slice(0,3)} ${s.getDate()} – ${e.getDate()}`;
      })();

  return (
    <div style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:12,overflow:'hidden',marginBottom:16}}>

      {/* Header */}
      <div style={{padding:'14px 16px 10px',borderBottom:'1px solid #1a1a1a'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          {/* Nav */}
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setOffset(o=>o-1)} style={{background:'none',border:'none',color:'#555',fontSize:16,cursor:'pointer',padding:'2px 6px',borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#555'}>‹</button>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:'#fff',letterSpacing:0.5,minWidth:160,textAlign:'center'}}>{navLabel}</span>
            <button onClick={()=>setOffset(o=>o+1)} style={{background:'none',border:'none',color:'#555',fontSize:16,cursor:'pointer',padding:'2px 6px',borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#555'}>›</button>
          </div>

          {/* View toggle */}
          <div style={{display:'inline-flex',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:50,padding:2}}>
            {['month','week'].map(v=>(
              <div key={v} onClick={()=>{setView(v);setOffset(0);}} style={{
                padding:'5px 12px',borderRadius:50,fontSize:10,letterSpacing:1,
                textTransform:'uppercase',fontWeight:700,cursor:'pointer',transition:'all 0.18s',
                background:view===v?G:'transparent',
                color:view===v?'#000':'#555',
              }}>{v}</div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{display:'flex',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#555',fontWeight:600}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:G,display:'inline-block'}}/>BJJ Class
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#555',fontWeight:600}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:AMBER,display:'inline-block'}}/>Workout
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#555',fontWeight:600}}>
            <span style={{width:8,height:8,borderRadius:2,background:'rgba(74,222,128,0.3)',border:`1px solid ${G}`,display:'inline-block'}}/>Both
          </div>
        </div>
      </div>

      {/* Day name row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'8px 8px 4px'}}>
        {DAY_NAMES.map(d=>(
          <div key={d} style={{textAlign:'center',fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'#333',fontWeight:700,padding:'2px 0'}}>{d}</div>
        ))}
      </div>

      {/* ── MONTH VIEW ── */}
      {view === 'month' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:'0 8px 10px'}}>
          {/* Empty cells before first day */}
          {Array.from({length: firstDay}).map((_,i)=><div key={`e${i}`}/>)}

          {Array.from({length: daysInMonth}).map((_,i)=>{
            const dayNum  = i + 1;
            const dow     = (firstDay + i) % 7;          // 0=Sun
            const idx     = dowToIdx(dow);               // Mon=0
            const isToday = today.getDate()===dayNum && today.getMonth()===month && today.getFullYear()===year;
            const bjj     = idxBjj(idx);
            const wkt     = idxWorkout(idx);
            const {bg,border,color} = getDayStyle(idx, isToday);

            return (
              <div key={dayNum} style={{
                aspectRatio:'1',
                display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center',
                borderRadius:6,background:bg,border,
                position:'relative',
              }}>
                <span style={{fontSize:12,fontWeight:isToday?900:500,color:isToday?'#fff':color}}>{dayNum}</span>
                {/* Dots */}
                {(bjj || wkt) && (
                  <div style={{display:'flex',gap:2,marginTop:2}}>
                    {bjj && <span style={{width:4,height:4,borderRadius:'50%',background:G,display:'inline-block'}}/>}
                    {wkt && <span style={{width:4,height:4,borderRadius:'50%',background:AMBER,display:'inline-block'}}/>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── WEEK VIEW ── */}
      {view === 'week' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,padding:'0 8px 12px'}}>
          {weekDays.map((d,i)=>{
            const dow     = d.getDay();
            const idx     = dowToIdx(dow);
            const isToday = d.toDateString() === today.toDateString();
            const bjj     = idxBjj(idx);
            const wkt     = idxWorkout(idx);
            const {bg,border,color} = getDayStyle(idx, isToday);

            return (
              <div key={i} style={{
                borderRadius:10,background:bg,border,
                padding:'10px 4px',
                display:'flex',flexDirection:'column',
                alignItems:'center',gap:4,
                minHeight:72,
              }}>
                <span style={{fontSize:11,fontWeight:700,color:isToday?'#fff':color}}>{d.getDate()}</span>
                <div style={{display:'flex',flexDirection:'column',gap:2,alignItems:'center'}}>
                  {bjj && (
                    <div style={{fontSize:9,fontWeight:700,color:G,letterSpacing:0.5,textAlign:'center',lineHeight:1.2}}>🥋</div>
                  )}
                  {wkt && (
                    <div style={{fontSize:9,fontWeight:700,color:AMBER,letterSpacing:0.5,textAlign:'center',lineHeight:1.2}}>🏋️</div>
                  )}
                  {!bjj && !wkt && (
                    <div style={{fontSize:9,color:'#2a2a2a',fontWeight:600}}>—</div>
                  )}
                </div>
                {isToday && (
                  <div style={{width:4,height:4,borderRadius:'50%',background:bjj?G:wkt?AMBER:'#444'}}/>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
