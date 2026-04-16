import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const G     = '#4ade80';
const AMBER = '#f59e0b';
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar({ selectedDate, onSelectDate }) {
  const { bjjDays, workoutDays } = useApp();
  const [offset, setOffset] = useState(0);
  const [view, setView] = useState('week');

  const today = new Date();

  const getReferenceDate = () => {
    if (view === 'month') {
      return new Date(today.getFullYear(), today.getMonth() + offset, 1);
    } else {
      const d = new Date(today);
      d.setDate(d.getDate() + offset * 7);
      return d;
    }
  };

  const refDate = getReferenceDate();
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const navLabel = `${MONTH_NAMES[month]} ${year}`;

  const getRenderDays = () => {
    if (view === 'week') {
      const d = new Date(refDate);
      d.setDate(d.getDate() - d.getDay()); // go to Sunday
      const days = [];
      for(let i = 0; i < 7; i++) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return days;
    } else {
      const days = [];
      const firstDayDate = new Date(year, month, 1);
      const firstDayDOW = firstDayDate.getDay();
      for(let i = 0; i < firstDayDOW; i++) {
        days.push(null);
      }
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for(let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      return days;
    }
  };

  const dowToIdx = (dow) => (dow + 6) % 7;
  const idxBjj     = (idx) => bjjDays.includes(idx);
  const idxWorkout = (idx) => workoutDays.includes(idx);

  return (
    <div className="liquid-glass" style={{borderRadius:20,overflow:'hidden',marginBottom:20}}>

      {/* Header */}
      <div style={{padding:'14px 16px 10px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setOffset(o=>o-1)} style={{background:'none',border:'none',color:'var(--text-sec)',opacity:0.6,fontSize:16,cursor:'pointer',padding:'2px 6px',borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='var(--text-pri)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-sec)'}>‹</button>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:'var(--text-pri)',letterSpacing:0.5,minWidth:120,textAlign:'center'}}>{navLabel}</span>
            <button onClick={()=>setOffset(o=>o+1)} style={{background:'none',border:'none',color:'var(--text-sec)',opacity:0.6,fontSize:16,cursor:'pointer',padding:'2px 6px',borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='var(--text-pri)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-sec)'}>›</button>
          </div>
          
          {/* View Toggle */}
          <div style={{display:'flex', gap: 4, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 8, padding: 2}}>
             <button onClick={() => { setView('week'); setOffset(0); }} style={{ fontSize: 10, fontWeight: 700, background: view === 'week' ? 'var(--border)' : 'transparent', color: view === 'week' ? 'var(--text-pri)' : 'var(--text-sec)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>WEEK</button>
             <button onClick={() => { setView('month'); setOffset(0); }} style={{ fontSize: 10, fontWeight: 700, background: view === 'month' ? 'var(--border)' : 'transparent', color: view === 'month' ? 'var(--text-pri)' : 'var(--text-sec)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>MONTH</button>
          </div>
        </div>

        {/* Day name row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {DAY_NAMES.map(d=>(
            <div key={d} style={{textAlign:'center',fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.3,fontWeight:700,padding:'2px 0'}}>{d}</div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:'6px 8px 10px'}}>
        {getRenderDays().map((dDate, i) => {
          if (!dDate) return <div key={`empty-${i}`}/>;

          const dayNum  = dDate.getDate();
          const dow     = dDate.getDay();
          const idx     = dowToIdx(dow);
          const isToday = today.getDate()===dayNum && today.getMonth()===dDate.getMonth() && today.getFullYear()===dDate.getFullYear();
          const bjj     = idxBjj(idx);
          const wkt     = idxWorkout(idx);
          const sel     = selectedDate && selectedDate.getDate()===dayNum && selectedDate.getMonth()===dDate.getMonth() && selectedDate.getFullYear()===dDate.getFullYear();

          let bg = 'transparent';
          let borderColor = 'transparent';
          let color = 'var(--text-sec)';

          if (sel) { bg = G; color = '#000'; borderColor = G; }
          else if (bjj && wkt) { bg = G+'11'; borderColor = G+'33'; color = 'var(--text-pri)'; }
          else if (bjj)        { bg = G+'11'; borderColor = G+'22'; color = G; }
          else if (wkt)        { bg = AMBER+'11'; borderColor = AMBER+'22'; color = AMBER; }
          else if (isToday)    { borderColor = 'var(--border)'; color = 'var(--text-pri)'; }

          return (
            <div
              key={`day-${i}`}
              onClick={() => onSelectDate && onSelectDate(dDate)}
              style={{
                aspectRatio:'1',
                display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center',
                borderRadius:6,background:bg,
                border:`1px solid ${isToday && !sel ? (bjj?G:wkt?AMBER:'#444') : borderColor}`,
                cursor:'pointer',
                transition:'all 0.15s',
                position:'relative',
              }}
            >
              <span style={{fontSize:11,fontWeight:isToday||sel?900:500,color: sel?'#000':isToday?'var(--text-pri)':color}}>{dayNum}</span>
              {!sel && (bjj || wkt) && (
                <div style={{display:'flex',gap:2,marginTop:1}}>
                  {bjj && <span style={{width:3,height:3,borderRadius:'50%',background:G,display:'inline-block'}}/>}
                  {wkt && <span style={{width:3,height:3,borderRadius:'50%',background:AMBER,display:'inline-block'}}/>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
