import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const G     = '#4ade80';
const AMBER = '#f59e0b';
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar({ selectedDate, onSelectDate }) {
  const { bjjDays, workoutDays } = useApp();
  const [offset, setOffset] = useState(0);

  const today = new Date();

  const getMonthData = () => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year  = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, firstDay, daysInMonth };
  };

  const dowToIdx = (dow) => (dow + 6) % 7;
  const idxBjj     = (idx) => bjjDays.includes(idx);
  const idxWorkout = (idx) => workoutDays.includes(idx);

  const { year, month, firstDay, daysInMonth } = getMonthData();

  const navLabel = `${MONTH_NAMES[month]} ${year}`;

  const isSelected = (dayNum) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === dayNum &&
           selectedDate.getMonth() === month &&
           selectedDate.getFullYear() === year;
  };

  return (
    <div className="liquid-glass" style={{borderRadius:20,overflow:'hidden',marginBottom:20}}>

      {/* Header */}
      <div style={{padding:'14px 16px 10px',borderBottom:'1px solid #1a1a1a'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setOffset(o=>o-1)} style={{background:'none',border:'none',color:'#555',fontSize:16,cursor:'pointer',padding:'2px 6px',borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#555'}>‹</button>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:'#fff',letterSpacing:0.5,minWidth:160,textAlign:'center'}}>{navLabel}</span>
            <button onClick={()=>setOffset(o=>o+1)} style={{background:'none',border:'none',color:'#555',fontSize:16,cursor:'pointer',padding:'2px 6px',borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#555'}>›</button>
          </div>
          {/* Legend */}
          <div style={{display:'flex',gap:10}}>
            <div style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#555',fontWeight:600}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:G,display:'inline-block'}}/>BJJ
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#555',fontWeight:600}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:AMBER,display:'inline-block'}}/>WKT
            </div>
          </div>
        </div>

        {/* Day name row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {DAY_NAMES.map(d=>(
            <div key={d} style={{textAlign:'center',fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'#333',fontWeight:700,padding:'2px 0'}}>{d}</div>
          ))}
        </div>
      </div>

      {/* Month grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:'6px 8px 10px'}}>
        {Array.from({length: firstDay}).map((_,i)=><div key={`e${i}`}/>)}

        {Array.from({length: daysInMonth}).map((_,i)=>{
          const dayNum  = i + 1;
          const dow     = (firstDay + i) % 7;
          const idx     = dowToIdx(dow);
          const isToday = today.getDate()===dayNum && today.getMonth()===month && today.getFullYear()===year;
          const bjj     = idxBjj(idx);
          const wkt     = idxWorkout(idx);
          const sel     = isSelected(dayNum);

          let bg = 'transparent';
          let borderColor = 'transparent';
          let color = '#555';

          if (sel) { bg = G; color = '#000'; borderColor = G; }
          else if (bjj && wkt) { bg = 'rgba(74,222,128,0.12)'; borderColor = 'rgba(74,222,128,0.3)'; color = '#fff'; }
          else if (bjj)        { bg = 'rgba(74,222,128,0.08)'; borderColor = 'rgba(74,222,128,0.2)'; color = G; }
          else if (wkt)        { bg = 'rgba(245,158,11,0.08)'; borderColor = 'rgba(245,158,11,0.2)'; color = AMBER; }
          else if (isToday)    { borderColor = '#444'; color = '#fff'; }

          return (
            <div
              key={dayNum}
              onClick={() => {
                const clicked = new Date(year, month, dayNum);
                onSelectDate && onSelectDate(clicked);
              }}
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
              <span style={{fontSize:11,fontWeight:isToday||sel?900:500,color: sel?'#000':isToday?'#fff':color}}>{dayNum}</span>
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
