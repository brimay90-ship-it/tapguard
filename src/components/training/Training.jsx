import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { weekPlan, bjjDayTips } from '../../data/weekPlan';
import Calendar from './Calendar';

const G     = '#0BF571';
const AMBER = '#F0A020';
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Convert Date object to our Mon=0 weekday index
const dateToIdx = (date) => (date.getDay() + 6) % 7;

function GifOverlay({ exercise, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.92)',
        zIndex:999, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:24,
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:'#111', border:'1px solid #2A2D32',
          borderRadius:16, overflow:'hidden', width:'100%', maxWidth:380,
          animation:'fadeUp 0.25s ease both',
        }}
      >
        <div style={{padding:'14px 16px', borderBottom:'1px solid #1A1C20', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'#fff', letterSpacing:0.5}}>{exercise.title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#555',fontSize:20,cursor:'pointer',lineHeight:1}}>✕</button>
        </div>
        <div style={{background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', minHeight:200}}>
          <img
            src={exercise.gifUrl}
            alt={exercise.title}
            style={{width:'100%', maxHeight:280, objectFit:'contain'}}
            onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
          />
          <div style={{display:'none', alignItems:'center', justifyContent:'center', height:200, color:'#333', fontSize:13, flexDirection:'column', gap:8}}>
            <span style={{fontSize:32}}>🎬</span>
            <span>Demo not available</span>
          </div>
        </div>
        <div style={{padding:'12px 16px'}}>
          <div style={{fontSize:12, color:'#555', marginBottom:4}}>{exercise.meta}</div>
          <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
            {exercise.tags.map(tag=>(
              <span key={tag} style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',padding:'2px 6px',background:'#1A1C20',borderRadius:3,color:'#444',fontWeight:700}}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SetTracker({ exercise, dayIdx, exIdx, exerciseDone, toggleExercise, getSetLog, updateSetLog, getPrevSetLog }) {
  const done = exerciseDone[`${dayIdx}-${exIdx}`];
  const numSets = exercise.sets || 3;

  return (
    <div style={{
      background:'#111', border:`1px solid ${done ? 'rgba(74,222,128,0.2)' : '#1f1f1f'}`,
      borderRadius:12, marginBottom:10, overflow:'hidden',
      opacity: done ? 0.6 : 1, transition:'all 0.2s',
    }}>
      {/* Exercise header */}
      <div style={{padding:'14px 16px 10px', display:'flex', gap:12, alignItems:'flex-start'}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:24,lineHeight:1,color:'#222',minWidth:26}}>
          {String(exIdx+1).padStart(2,'0')}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:'#fff',marginBottom:2,letterSpacing:0.5,textDecoration:done?'line-through':'none'}}>
            {exercise.title}
          </div>
          <div style={{fontSize:11,color:'#444',fontWeight:500}}>{exercise.meta}</div>
        </div>
        {/* Done toggle */}
        <div
          onClick={()=>toggleExercise(dayIdx, exIdx)}
          style={{
            width:24,height:24,borderRadius:'50%',flexShrink:0,marginTop:2,
            background:done?G:'#111',border:`1px solid ${done?G:'#333'}`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:11,color:done?'#000':'transparent',
            cursor:'pointer',transition:'all 0.18s',fontWeight:900,
          }}
        >✓</div>
      </div>

      {/* Set rows */}
      {!done && (
        <div style={{padding:'0 14px 12px'}}>
          {/* Header row */}
          <div style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr',gap:8,marginBottom:6}}>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'#333',fontWeight:700,textAlign:'center'}}>SET</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'#333',fontWeight:700,textAlign:'center'}}>REPS</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'#333',fontWeight:700,textAlign:'center'}}>LBS</div>
          </div>

          {Array.from({length: numSets}).map((_,setIdx)=>{
            const log  = getSetLog(dayIdx, exIdx, setIdx);
            const prev = getPrevSetLog(dayIdx, exIdx, setIdx);
            const repsPlaceholder = log.reps ? '' : (prev.reps || (exercise.reps ? String(exercise.reps) : '—'));
            const weightPlaceholder = log.weight ? '' : (prev.weight || '0');

            return (
              <div key={setIdx} style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr',gap:8,marginBottom:6,alignItems:'center'}}>
                {/* Set number */}
                <div style={{
                  width:28,height:28,borderRadius:6,
                  background:'#1A1C20',border:'1px solid #2A2D32',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:12,fontWeight:800,color:'#444',
                  fontFamily:"'Barlow Condensed',sans-serif",
                }}>{setIdx+1}</div>

                {/* Reps input */}
                <input
                  type="number"
                  value={log.reps || ''}
                  placeholder={repsPlaceholder}
                  onChange={e=>updateSetLog(dayIdx,exIdx,setIdx,'reps',e.target.value)}
                  style={{
                    background:'#1A1C20',border:'1px solid #2A2D32',borderRadius:8,
                    padding:'7px 10px',color:'#fff',textAlign:'center',
                    fontSize:14,fontWeight:700,outline:'none',width:'100%',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.target.style.borderColor=G}
                  onBlur={e=>e.target.style.borderColor='#2A2D32'}
                />

                {/* Weight input */}
                <input
                  type="number"
                  value={log.weight || ''}
                  placeholder={weightPlaceholder}
                  onChange={e=>updateSetLog(dayIdx,exIdx,setIdx,'weight',e.target.value)}
                  style={{
                    background:'#1A1C20',border:'1px solid #2A2D32',borderRadius:8,
                    padding:'7px 10px',color:'#fff',textAlign:'center',
                    fontSize:14,fontWeight:700,outline:'none',width:'100%',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.target.style.borderColor=AMBER}
                  onBlur={e=>e.target.style.borderColor='#2A2D32'}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BJJDayContent({ dayIdx }) {
  const tips = bjjDayTips[dayIdx] || bjjDayTips[0];
  return (
    <div>
      {/* Pre-class warmup */}
      <div style={{background:'#111',border:'1px solid #1f1f1f',borderTop:`3px solid ${G}`,borderRadius:12,padding:'14px 16px',marginBottom:10}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:G,marginBottom:10,fontWeight:700}}>🥋 Pre-Class Warmup</div>
        {tips.warmup.map((item,i)=>(
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:7}}>
            <div style={{width:18,height:18,borderRadius:'50%',background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:G,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</div>
            <div style={{fontSize:13,color:'#aaa',fontWeight:500,lineHeight:1.4}}>{item}</div>
          </div>
        ))}
      </div>

      {/* Hydration */}
      <div style={{background:'#111',border:'1px solid #1f1f1f',borderTop:'3px solid #3b82f6',borderRadius:12,padding:'14px 16px',marginBottom:10}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'#3b82f6',marginBottom:8,fontWeight:700}}>💧 Hydration</div>
        <div style={{fontSize:13,color:'#aaa',fontWeight:500,lineHeight:1.5}}>{tips.hydration}</div>
      </div>

      {/* Recovery & extras */}
      <div style={{background:'#111',border:'1px solid #1f1f1f',borderTop:`3px solid ${AMBER}`,borderRadius:12,padding:'14px 16px',marginBottom:10}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:AMBER,marginBottom:10,fontWeight:700}}>⚡ Recovery & Extras</div>
        <div style={{marginBottom:10}}>
          {tips.recovery.map((item,i)=>(
            <div key={i} style={{fontSize:13,color:'#aaa',marginBottom:5,display:'flex',gap:8,alignItems:'flex-start'}}>
              <span style={{color:AMBER,marginTop:1}}>›</span>{item}
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid #1A1C20',paddingTop:10}}>
          {tips.extras.map((item,i)=>(
            <div key={i} style={{fontSize:13,color:'#aaa',marginBottom:6,lineHeight:1.4}}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Training() {
  const { goals, exerciseDone, toggleExercise, bjjDays, workoutDays, scFreq, getSetLog, updateSetLog, getPrevSetLog } = useApp();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [gifEx, setGifEx] = useState(null);

  const dayIdx = dateToIdx(selectedDate);
  const isBjjDay     = bjjDays.includes(dayIdx);
  const isWorkoutDay = workoutDays.includes(dayIdx);
  const exercises    = weekPlan[dayIdx] || [];

  const goalsDisplay = goals.length
    ? goals.slice(0,3).map(g=>g.replace(/^[\S]+ /,'')).join(' · ')
    : 'Cardio & Gas Tank · Flexibility';

  const totalDays = 7;
  const remainingBjj     = Math.max(0, (bjjDays.length || 0));
  const remainingWorkout = Math.max(0, (workoutDays.length || 0));
  const restDays = totalDays - new Set([...bjjDays, ...workoutDays]).size;

  const formattedDate = selectedDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  return (
    <div style={{ padding:'20px 20px 100px', overflowY:'auto', height:'100%' }}>

      {/* Header */}
      <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:4, fontWeight:700 }}>Workout Plan</div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'#fff', marginBottom:14, letterSpacing:1 }}>YOUR WORKOUT PLAN</div>

      {/* Weekly summary chips */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        <div style={{padding:'6px 12px',borderRadius:50,background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.2)',fontSize:11,fontWeight:700,color:G}}>
          🥋 {remainingBjj}× BJJ / week
        </div>
        <div style={{padding:'6px 12px',borderRadius:50,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',fontSize:11,fontWeight:700,color:AMBER}}>
          🏋️ {remainingWorkout}× Workouts / week
        </div>
        <div style={{padding:'6px 12px',borderRadius:50,background:'#111',border:'1px solid #1f1f1f',fontSize:11,fontWeight:700,color:'#444'}}>
          😴 {restDays} Rest days
        </div>
      </div>

      {/* Calendar */}
      <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* Selected date header */}
      <div style={{
        marginBottom:12, padding:'10px 14px', borderRadius:10,
        background: isBjjDay && isWorkoutDay ? 'rgba(74,222,128,0.06)'
                  : isBjjDay ? 'rgba(74,222,128,0.06)'
                  : isWorkoutDay ? 'rgba(245,158,11,0.06)'
                  : '#111',
        border: `1px solid ${isBjjDay ? 'rgba(74,222,128,0.2)' : isWorkoutDay ? 'rgba(245,158,11,0.2)' : '#1f1f1f'}`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#555',marginBottom:2}}>{formattedDate}</div>
          <div style={{fontSize:13,fontWeight:700,color: isBjjDay ? G : isWorkoutDay ? AMBER : '#444'}}>
            {isBjjDay && isWorkoutDay && '🥋 BJJ Class + 🏋️ Workout Day'}
            {isBjjDay && !isWorkoutDay && '🥋 BJJ Class Day'}
            {!isBjjDay && isWorkoutDay && '🏋️ Workout Day'}
            {!isBjjDay && !isWorkoutDay && '😴 Rest Day'}
          </div>
        </div>
      </div>

      {/* ── WORKOUT DAY — exercises with set tracking ── */}
      {isWorkoutDay && (
        <div>
          <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:AMBER,marginBottom:10,fontWeight:700}}>🏋️ Today's Exercises</div>
          {exercises.length > 0 ? exercises.map((ex, i) => (
            <div key={i} style={{position:'relative'}}>
              {/* Gif button */}
              <div
                onClick={()=>setGifEx(ex)}
                style={{
                  position:'absolute',top:12,right:44,
                  width:28,height:28,borderRadius:6,zIndex:2,
                  background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.2)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  cursor:'pointer',fontSize:13,
                }}
                title="View exercise demo"
              >🎬</div>
              <SetTracker
                exercise={ex}
                dayIdx={dayIdx}
                exIdx={i}
                exerciseDone={exerciseDone}
                toggleExercise={toggleExercise}
                getSetLog={getSetLog}
                updateSetLog={updateSetLog}
                getPrevSetLog={getPrevSetLog}
              />
            </div>
          )) : (
            <div style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:12,padding:'20px',textAlign:'center',color:'#333',fontSize:13}}>
              No exercises planned for this day.
            </div>
          )}
        </div>
      )}

      {/* ── BJJ DAY — recovery & tips ── */}
      {isBjjDay && (
        <div style={{marginTop: isWorkoutDay ? 16 : 0}}>
          {isWorkoutDay && <div style={{height:1,background:'#1A1C20',marginBottom:16}}/>}
          <BJJDayContent dayIdx={dayIdx} />
        </div>
      )}

      {/* ── REST DAY ── */}
      {!isBjjDay && !isWorkoutDay && (
        <div style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:12,padding:'24px',textAlign:'center'}}>
          <div style={{fontSize:28,marginBottom:8}}>😴</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:'#fff',marginBottom:6}}>REST DAY</div>
          <div style={{fontSize:13,color:'#444',lineHeight:1.6}}>Recovery is training too. Sleep, hydrate, and let your body adapt.</div>
          <div style={{marginTop:14,padding:'10px 14px',background:'#1A1C20',borderRadius:8,fontSize:12,color:'#555',textAlign:'left'}}>
            💡 Light walk or mobility work only. Avoid anything that spikes heart rate.
          </div>
        </div>
      )}

      {/* Gif overlay */}
      {gifEx && <GifOverlay exercise={gifEx} onClose={()=>setGifEx(null)} />}
    </div>
  );
}
