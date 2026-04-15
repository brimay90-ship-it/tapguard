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
        position:'fixed', inset:0, background:'var(--overlay-bg)',
        zIndex:999, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:24,
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:16, overflow:'hidden', width:'100%', maxWidth:380,
          animation:'fadeUp 0.25s ease both',
        }}
      >
        <div style={{padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'var(--text-pri)', letterSpacing:0.5}}>{exercise.title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-sec)',opacity:0.6,fontSize:20,cursor:'pointer',lineHeight:1}}>✕</button>
        </div>
        <div style={{background:'var(--bg-total)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:200}}>
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
          <div style={{fontSize:12, color:'var(--text-sec)', opacity:0.6, marginBottom:4}}>{exercise.meta}</div>
          <div style={{display:'flex', gap:5, flexWrap:'wrap', marginBottom: exercise.bjjEdge ? 12 : 0}}>
            {exercise.tags.map(tag=>(
              <span key={tag} style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',padding:'2px 6px',background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:3,color:'var(--text-sec)',opacity:0.8,fontWeight:700}}>{tag}</span>
            ))}
          </div>
          {exercise.bjjEdge && (
             <div style={{fontSize:13, color:G, opacity:0.9, fontWeight:600, padding:'10px 12px', background:G+'11', borderLeft:`3px solid ${G}`, borderRadius:'0 6px 6px 0', lineHeight:1.4}}>
               <span style={{display:'block', fontSize:10, textTransform:'uppercase', letterSpacing:1, marginBottom:4, fontWeight:900, color:G}}>BJJ Edge</span>
               {exercise.bjjEdge}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SetTracker({ exercise, dayIdx, exIdx, exerciseDone, toggleExercise, getSetLog, updateSetLog, getPrevSetLog }) {
  const done = exerciseDone[`${dayIdx}-${exIdx}`];
  const numSets = exercise.sets || 3;

  return (
    <div className="liquid-glass" style={{
      border:`1px solid ${done ? G+'66' : 'var(--border)'}`,
      borderRadius:20, marginBottom:12, overflow:'hidden',
      opacity: done ? 0.6 : 1, transition:'all 0.3s ease',
    }}>
      {/* Exercise header */}
      <div style={{padding:'14px 16px 10px', display:'flex', gap:12, alignItems:'flex-start'}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:24,lineHeight:1,color:'var(--text-sec)',opacity:0.2,minWidth:26}}>
          {String(exIdx+1).padStart(2,'0')}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:'var(--text-pri)',marginBottom:2,letterSpacing:0.5,textDecoration:done?'line-through':'none'}}>
            {exercise.title}
          </div>
          <div style={{fontSize:11,color:'var(--text-sec)',opacity:0.6,fontWeight:500}}>{exercise.meta}</div>
          {exercise.bjjEdge && (
            <div style={{fontSize:10,color:G,opacity:0.9,fontWeight:600,marginTop:6,fontStyle:'italic', lineHeight:1.3}}>
              ↳ {exercise.bjjEdge}
            </div>
          )}
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
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.4,fontWeight:700,textAlign:'center'}}>SET</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.4,fontWeight:700,textAlign:'center'}}>REPS</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.4,fontWeight:700,textAlign:'center'}}>LBS</div>
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
                  background:'var(--bg-total)',border:'1px solid var(--border)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:12,fontWeight:800,color:'var(--text-sec)',opacity:0.6,
                  fontFamily:"'Barlow Condensed',sans-serif",
                }}>{setIdx+1}</div>

                {/* Reps input */}
                <input
                  type="number"
                  value={log.reps || ''}
                  placeholder={repsPlaceholder}
                  onChange={e=>updateSetLog(dayIdx,exIdx,setIdx,'reps',e.target.value)}
                  style={{
                    background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:8,
                    padding:'7px 10px',color:'var(--text-pri)',textAlign:'center',
                    fontSize:14,fontWeight:700,outline:'none',width:'100%',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.target.style.borderColor=G}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}
                />

                {/* Weight input */}
                <input
                  type="number"
                  value={log.weight || ''}
                  placeholder={weightPlaceholder}
                  onChange={e=>updateSetLog(dayIdx,exIdx,setIdx,'weight',e.target.value)}
                  style={{
                    background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:8,
                    padding:'7px 10px',color:'var(--text-pri)',textAlign:'center',
                    fontSize:14,fontWeight:700,outline:'none',width:'100%',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.target.style.borderColor=AMBER}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}
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
      <div className="liquid-glass" style={{borderTop:`3px solid ${G}`, borderRadius:16, padding:'20px', marginBottom:12}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:G,marginBottom:12,fontWeight:800}}>🥋 PRE-CLASS WARMUP</div>
        {tips.warmup.map((item,i)=>(
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:10}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:G+'22',border:`1px solid ${G}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:G,fontWeight:900,flexShrink:0,marginTop:2}}>{i+1}</div>
            <div style={{fontSize:14,color:'var(--text-pri)',fontWeight:500,lineHeight:1.4}}>{item}</div>
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
    <div style={{ padding:'20px 20px 80px' }}>

      {/* Header */}
      <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--text-sec)', opacity:0.6, marginBottom:4, fontWeight:700 }}>Workout Plan</div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'var(--text-pri)', marginBottom:14, letterSpacing:1 }}>YOUR WORKOUT PLAN</div>

      {/* Weekly summary chips */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        <div className="liquid-glass" style={{padding:'10px 18px',borderRadius:20,border:'1px solid rgba(11,245,113,0.3)',fontSize:11,fontWeight:800,color:G, letterSpacing:1}}>
          🥋 {remainingBjj}× BJJ / WEEK
        </div>
        <div className="liquid-glass" style={{padding:'10px 18px',borderRadius:20,border:'1px solid rgba(240,160,32,0.3)',fontSize:11,fontWeight:800,color:AMBER, letterSpacing:1}}>
          🏋️ {remainingWorkout}× LIFT / WEEK
        </div>
        <div className="liquid-glass" style={{padding:'10px 18px',borderRadius:20,border:'1px solid rgba(255,255,255,0.14)',fontSize:11,fontWeight:800,color:'#555', letterSpacing:1}}>
          😴 {restDays} REST DAYS
        </div>
      </div>

      {/* Calendar */}
      <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div style={{
        marginBottom:12, padding:'10px 14px', borderRadius:10,
        background: isBjjDay && isWorkoutDay ? G+'11'
                  : isBjjDay ? G+'11'
                  : isWorkoutDay ? AMBER+'11'
                  : 'var(--bg-total)',
        border: `1px solid ${isBjjDay ? G+'33' : isWorkoutDay ? AMBER+'33' : 'var(--border)'}`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-sec)',opacity:0.6,marginBottom:2}}>{formattedDate}</div>
          <div style={{fontSize:13,fontWeight:700,color: isBjjDay ? G : isWorkoutDay ? AMBER : 'var(--text-sec)'}}>
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
            <div style={{background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:12,padding:'20px',textAlign:'center',color:'var(--text-sec)',opacity:0.4,fontSize:13}}>
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
        <div className="liquid-glass" style={{borderRadius:20, padding:'32px 24px', textAlign:'center', border:'1px solid var(--border)'}}>
          <div style={{fontSize:48,marginBottom:16}}>😴</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:24,color:'var(--text-pri)',marginBottom:8, letterSpacing:1}}>REST DAY</div>
          <div style={{fontSize:15,color:'var(--text-sec)',opacity:0.7,lineHeight:1.6, marginBottom:20}}>Recovery is training too. Sleep, hydrate, and let your body adapt.</div>
          <div style={{padding:'16px',background:'var(--bg-total)',borderRadius:12,fontSize:13,color:G,textAlign:'left', borderLeft:`4px solid ${G}`}}>
            <span style={{fontWeight:800, letterSpacing:1, fontSize:10, display:'block', marginBottom:4}}>COACH'S TIP:</span>
            Light walk or mobility work only. Avoid anything that spikes heart rate.
          </div>
        </div>
      )}

      {/* Gif overlay */}
      {gifEx && <GifOverlay exercise={gifEx} onClose={()=>setGifEx(null)} />}
    </div>
  );
}
