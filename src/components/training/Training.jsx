import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { weekPlan } from '../../data/weekPlan';
import Calendar from './Calendar';

const G     = '#4ade80';
const AMBER = '#f59e0b';
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function Training() {
  const { goals, exerciseDone, toggleExercise, bjjDays, workoutDays, scFreq } = useApp();
  const [currentDay, setCurrentDay] = useState(new Date().getDay()===0?6:new Date().getDay()-1);

  const goalsDisplay = goals.length
    ? goals.slice(0,3).map(g=>g.replace(/^[\S]+ /,'')).join(' · ')
    : 'Cardio & Gas Tank · Flexibility';

  const exercises = weekPlan[currentDay] || [];

  const isBjjDay     = bjjDays.includes(currentDay);
  const isWorkoutDay = workoutDays.includes(currentDay);

  return (
    <div style={{ padding:'20px 20px 100px', overflowY:'auto', height:'100%' }}>
      <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:6, fontWeight:700 }}>Workout Plan</div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:30, color:'#fff', marginBottom:16, letterSpacing:1 }}>YOUR WORKOUT PLAN</div>

      {/* Goal Banner */}
      <div style={{ background:'#111', border:'1px solid #1f1f1f', borderTop:`3px solid ${G}`, borderRadius:12, padding:'14px 16px', marginBottom:14 }}>
        <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:G, marginBottom:4, fontWeight:700 }}>Active Goals</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'#fff', marginBottom:2, letterSpacing:0.5 }}>{goalsDisplay}</div>
        <div style={{ fontSize:12, color:'#444', fontWeight:500 }}>
          {scFreq ? `${scFreq}× workouts/week outside BJJ · ` : ''}Customised for your level & style
        </div>
      </div>

      {/* Calendar */}
      <Calendar />

      {/* Day Nav */}
      <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {DAYS.map((day,i)=>{
          const bjj = bjjDays.includes(i);
          const wkt = workoutDays.includes(i);
          const active = currentDay === i;
          return (
            <div key={day} onClick={()=>setCurrentDay(i)} style={{
              flexShrink:0, padding:'7px 12px', borderRadius:50,
              border:`1px solid ${active ? (bjj?G:wkt?AMBER:'#fff') : bjj?'rgba(74,222,128,0.3)':wkt?'rgba(245,158,11,0.3)':'#1f1f1f'}`,
              background: active ? (bjj?'rgba(74,222,128,0.15)':wkt?'rgba(245,158,11,0.15)':'#222') : '#111',
              color: active ? '#fff' : bjj ? G : wkt ? AMBER : '#444',
              fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.18s',
              display:'flex', alignItems:'center', gap:4,
            }}>
              {day}
              {bjj && <span style={{fontSize:8}}>🥋</span>}
              {wkt && <span style={{fontSize:8}}>🏋️</span>}
            </div>
          );
        })}
      </div>

      {/* Day type banner */}
      {(isBjjDay || isWorkoutDay) && (
        <div style={{
          marginBottom:12, padding:'8px 14px', borderRadius:8,
          background: isBjjDay && isWorkoutDay ? 'rgba(74,222,128,0.06)' : isBjjDay ? 'rgba(74,222,128,0.06)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${isBjjDay ? 'rgba(74,222,128,0.2)' : 'rgba(245,158,11,0.2)'}`,
          display:'flex', alignItems:'center', gap:8,
          fontSize:12, fontWeight:600,
          color: isBjjDay ? G : AMBER,
        }}>
          {isBjjDay && isWorkoutDay && '🥋 BJJ Class + 🏋️ Workout Day'}
          {isBjjDay && !isWorkoutDay && '🥋 BJJ Class Day'}
          {!isBjjDay && isWorkoutDay && '🏋️ Workout Day'}
        </div>
      )}

      {/* Exercises */}
      {exercises.length > 0 ? exercises.map((ex,i)=>{
        const key  = `${currentDay}-${i}`;
        const done = exerciseDone[key];
        return (
          <div key={i} onClick={()=>toggleExercise(currentDay,i)} style={{
            background:'#111', border:'1px solid #1f1f1f',
            borderRadius:12, padding:'16px', marginBottom:8,
            display:'flex', gap:14, alignItems:'flex-start',
            cursor:'pointer', opacity:done?0.45:1, transition:'all 0.18s',
          }}
            onMouseEnter={e=>!done&&(e.currentTarget.style.borderColor=G)}
            onMouseLeave={e=>(e.currentTarget.style.borderColor='#1f1f1f')}
          >
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, lineHeight:1, color:'#222', minWidth:28 }}>{String(i+1).padStart(2,'0')}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'#fff', marginBottom:3, letterSpacing:0.5, textDecoration:done?'line-through':'none' }}>{ex.title}</div>
              <div style={{ fontSize:12, color:'#444', marginBottom:6, fontWeight:500 }}>{ex.meta}</div>
              <div style={{ display:'flex', gap:5 }}>
                {ex.tags.map(tag=><span key={tag} style={{ fontSize:9, letterSpacing:1, textTransform:'uppercase', padding:'2px 6px', background:'#1a1a1a', borderRadius:3, color:'#333', fontWeight:700 }}>{tag}</span>)}
              </div>
            </div>
            <div style={{
              width:22, height:22, borderRadius:'50%',
              background:done?G:'#111', border:`1px solid ${done?G:'#222'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, color:done?'#000':'transparent',
              flexShrink:0, marginTop:2, transition:'all 0.18s', fontWeight:900,
            }}>✓</div>
          </div>
        );
      }) : (
        <div style={{
          background:'#111', border:'1px solid #1f1f1f', borderRadius:12,
          padding:'24px', textAlign:'center',
          color:'#333', fontSize:14, fontWeight:600,
        }}>
          {isBjjDay ? '🥋 BJJ class day — focus on the mats. Rest or mobility only.' : 'Rest day — recovery is training too.'}
        </div>
      )}
    </div>
  );
}
