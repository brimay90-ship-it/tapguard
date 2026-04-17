import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { weekPlan, bjjDayTips } from '../../data/weekPlan';
import Calendar from './Calendar';

const G     = '#0BF571';
const AMBER = '#F0A020';
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Convert Date object to our Mon=0 weekday index
const dateToIdx = (date) => (date.getDay() + 6) % 7;

const GIF_MAP = {
  'Kettlebell Push Press': '0528',
  'Turkish Get-Up': '0551',
  'Deficit Push-Ups': '0662',
  'Plank Hold': '2135',
  'Heavy Barbell Row': '0027',
  'Weighted Pull-Ups': '0841',
  'Face Pulls': '0203',
  'Farmer Carry': '3548',
  'Front Squat': '0042',
  'Romanian Deadlift': '0085',
  'Bulgarian Split Squat': '0099',
  'Sprawl Circuits': '1160',
  'Dumbbell Snatch': '3888',
  'Pallof Press': '0979',
  'Ab Wheel Rollout': '0857',
  'Neck Bridges': '1403',
  'Deficit Deadlift': '0032',
  'Chin-Ups': '0253',
  'Dumbbell Rows': '0292',
  'Hanging Leg Raises': '0472',
  'Zercher Squat': '1545',
  'Kettlebell Swing': '0549',
  'Barbell Dips': '3313',
  'Nordic Hamstring Curls': '2400',
  'Goblet Squat': '1760',
  'Push-Ups': '0662',
  'Plank w/ Hip Tap': '3239'
};

const INSTRUCTIONS_MAP = {
  'Kettlebell Push Press': 'Explode up using your legs to drive the weight. Lock out completely at the top and control the descent.',
  'Turkish Get-Up': 'Keep your eye on the weight at all times. Keep your arm locked out and move slowly through each transition phase.',
  'Deficit Push-Ups': 'Lower your chest past your hands to get a deeper stretch. Keep your core tight and maintain a straight body line.',
  'Plank Hold': 'Maintain a straight line from head to heels. Squeeze your glutes and brace your core as if preparing for a punch.',
  'Heavy Barbell Row': 'Hinge at the hips and pull the bar toward your lower ribs. Squeeze your shoulder blades together at the peak.',
  'Weighted Pull-Ups': 'Start from a full dead-hang. Pull until your chin is clearly over the bar. Control the negative phase on the way down.',
  'Face Pulls': 'Pull the rope toward your forehead, pulling the ends apart. Focus on using your rear delts and upper back.',
  'Farmer Carry': 'Walk with a tall posture and a tight core. Keep your shoulders pulled back and down. Prevent the weights from swinging.',
  'Front Squat': 'Keep your elbows high throughout the lift to create a "shelf" for the bar. Drive through your heels and keep your chest up.',
  'Romanian Deadlift': 'Push your hips back until you feel a deep stretch in your hamstrings. Keep the bar close to your shins and your back flat.',
  'Bulgarian Split Squat': 'Elevate your rear foot. Drop your back knee toward the floor while keeping your front knee stable and chest upright.',
  'Sprawl Circuits': 'Drop your hips quickly to the floor, then explode back to your feet as fast as possible. Maintain high intensity.',
  'Dumbbell Snatch': 'Use an explosive hip drive to propel the weight upward. Keep it close to your body and punch the ceiling at the top.',
  'Pallof Press': 'Stand perpendicular to the cable. Repel the weight away from your chest and resist the urge to let it rotate your torso.',
  'Ab Wheel Rollout': 'Brace your core and roll out as far as possible without arching your back. Use your abs to pull yourself back in.',
  'Neck Bridges': 'Move slowly and with total control. Maintain constant tension in your neck muscles throughout the range of motion.',
  'Deficit Deadlift': 'Pull from a deeper starting position than a standard deadlift. Keep your hips low and use your legs to drive the floor away.',
  'Chin-Ups': 'Use an underhand grip. Pull from a full hang until your chest reaches the bar. Squeeze your biceps and lats at the top.',
  'Dumbbell Rows': 'Keep your back flat and pull the dumbbell toward your hip. Avoid rotating your torso as you lift.',
  'Hanging Leg Raises': 'Avoid swinging. Use your lower abs to lift your legs until your hips tilt upward. Control the descent.',
  'Zercher Squat': 'Cradle the bar in the crooks of your elbows. Squat deep while keeping your torso upright and your core braced.',
  'Kettlebell Swing': 'Snap your hips forward to propel the bell. It should "float" at chest level. Your arms act only as hinges.',
  'Barbell Dips': 'Lean slightly forward to target your chest. Lower yourself until your shoulders are below your elbows, then drive up.',
  'Nordic Hamstring Curls': 'Lower your body as slowly as possible, using your hamstrings to resist gravity. Use your hands for a light push-off.',
  'Goblet Squat': 'Hold the weight against your chest. Drop your hips between your knees and keep your heels planted firmly on the floor.',
  'Push-Ups': 'Keep your elbows at a 45-degree angle from your body. Lower until your chest nearly touches the floor and push back up.',
  'Plank w/ Hip Tap': 'Maintain a rock-solid plank. Avoid minimal hip rotation as you lift each hand to tap the opposite hip.'
};

function DemoModal({ exercise, onClose }) {
  const gifId = GIF_MAP[exercise.title];
  const [loading, setLoading] = useState(true);
  
  // Use jsDelivr CDN pointing to the correct /assets/ folder
  const gifUrl = gifId 
    ? `https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@master/assets/${gifId}.gif`
    : null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.96)',
        zIndex:99999, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding: '24px', backdropFilter: 'blur(16px)',
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:'#111', border:'2px solid var(--border)',
          borderRadius:32, overflow:'hidden', width:'100%', maxWidth:440,
          animation:'fadeUp 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) both', 
          boxShadow: '0 40px 120px rgba(0,0,0,1)',
          position: 'relative',
        }}
      >
        <div style={{padding:'24px 28px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background: 'var(--bg-card)'}}>
          <div style={{flex: 1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'var(--text-pri)', letterSpacing:0.5, textTransform: 'uppercase', lineHeight: 1.1}}>{exercise.title}</div>
            <div style={{fontSize:11, color:G, fontWeight:800, letterSpacing:2.5, textTransform: 'uppercase', marginTop: 5, opacity: 0.9}}>Technique loop</div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', 
              border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
            }}
          >✕</button>
        </div>

        {/* Media Block */}
        <div style={{background:'#000', aspectRatio: '1/1', display:'flex', alignItems:'center', justifyContent:'center', position: 'relative', overflow: 'hidden'}}>
          {loading && (
             <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:15, zIndex: 1}}>
               <div className="spinner" style={{width: 30, height: 30, border:`3px solid ${G}33`, borderTop:`3px solid ${G}`, borderRadius:'50%', animation:'spin 1s linear infinite'}} />
               <div style={{fontSize: 12, color: '#fff', opacity: 0.6, fontWeight: 700}}>LOADING LOOP...</div>
             </div>
          )}
          
          {gifUrl ? (
            <img 
              src={gifUrl} 
              alt={exercise.title}
              style={{width:'100%', height:'100%', objectFit:'cover', opacity: loading ? 0 : 1, transition: 'opacity 0.3s'}}
              onLoad={() => setLoading(false)}
              onError={(e) => { 
                setLoading(false);
                e.target.style.display = 'none'; 
              }}
            />
          ) : (
             <div style={{textAlign: 'center', padding: 40}}>
                <div style={{fontSize: 48, marginBottom: 16}}>🏋️‍♂️</div>
                <div style={{fontSize: 14, color: '#fff', fontWeight: 700}}>Demo unavailable</div>
             </div>
          )}
        </div>

        <div style={{padding:'28px', background: 'var(--bg-card)'}}>
           <div style={{display:'flex', gap:10, flexWrap:'wrap', marginBottom: 20}}>
            {exercise.tags.map(tag=>(
              <span key={tag} style={{fontSize:10,letterSpacing:1.8,textTransform:'uppercase',padding:'4px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-sec)',fontWeight:800}}>{tag}</span>
            ))}
          </div>

          <div style={{marginBottom: 24}}>
            <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:3, marginBottom:10, fontWeight:900, color:G, opacity: 0.9}}>How to Perform</div>
            <div style={{fontSize:14, color:'var(--text-pri)', lineHeight:1.6, fontWeight:500, opacity: 0.8}}>
              {INSTRUCTIONS_MAP[exercise.title] || 'Focus on controlled movement and proper form throughout the entire range of motion.'}
            </div>
          </div>
          
          {exercise.bjjEdge && (
             <div style={{padding:'20px 22px', background:G+'05', borderLeft:`6px solid ${G}`, borderRadius: 16}}>
               <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:3, marginBottom:10, fontWeight:900, color:G, opacity: 0.9}}>BJJ TACTICAL EDGE</div>
               <div style={{fontSize:15, color:'var(--text-pri)', lineHeight:1.7, fontWeight:500, opacity: 0.95}}>{exercise.bjjEdge}</div>
             </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
}





function SetTracker({ exercise, dayIdx, exIdx, exerciseDone, toggleExercise, getSetLog, updateSetLog, getPrevSetLog, isExpanded, onToggleHeader, onAutoAdvance }) {
  const done = exerciseDone[`${dayIdx}-${exIdx}`];
  const numSets = exercise.sets || 3;

  // Monitor for full completion to auto-advance
  useEffect(() => {
    if (done || !isExpanded) return;
    
    let allComplete = true;
    for (let s = 0; s < numSets; s++) {
      const log = getSetLog(dayIdx, exIdx, s);
      if (!log.reps || !log.weight) {
        allComplete = false;
        break;
      }
    }

    if (allComplete) {
      // Small delay for UX so user sees the last checkmark
      const timer = setTimeout(() => {
        toggleExercise(dayIdx, exIdx);
        onAutoAdvance(exIdx + 1, false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [dayIdx, exIdx, numSets, isExpanded, done, getSetLog, toggleExercise, onAutoAdvance]);

  return (
    <div className="liquid-glass" style={{
      border:`1px solid ${done ? G+'66' : 'var(--border)'}`,
      borderRadius:20, marginBottom:12,
      opacity: done ? 0.6 : 1, transition:'all 0.3s ease',
    }}>
      {/* Exercise header */}
      <div 
        onClick={onToggleHeader}
        style={{padding:'16px 18px 14px', display:'flex', gap:14, alignItems:'flex-start', cursor:'pointer'}}
      >
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:32,lineHeight:1,color:'var(--text-sec)',opacity:0.2,minWidth:34}}>
          {String(exIdx+1).padStart(2,'0')}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:21,color:'var(--text-pri)',letterSpacing:0.5,textDecoration:done?'line-through':'none', marginBottom: 2}}>
            {exercise.title}
          </div>
          <div style={{fontSize:13,color:'var(--text-sec)',opacity:0.8,fontWeight:600}}>{exercise.meta}</div>
        </div>
        {/* "Show me" link */}
        <div
          onClick={(e)=>{ 
            e.stopPropagation(); 
            onAutoAdvance(exIdx); // Use the callback to trigger the modal in parent
          }}
          style={{
            padding: '6px 12px', borderRadius: 8, background: G+'11', border: `1px solid ${G}33`,
            fontSize: 10, fontWeight: 800, color: G, letterSpacing: 0.5, cursor: 'pointer',
            textTransform: 'uppercase', marginTop: 4, transition: 'all 0.2s'
          }}
          onMouseEnter={e=>e.currentTarget.style.background=G+'22'}
          onMouseLeave={e=>e.currentTarget.style.background=G+'11'}
        >Show me</div>
      </div>

      {/* Set rows - only if expanded */}
      {isExpanded && (
        <div style={{padding:'4px 14px 18px', animation: 'fadeDown 0.25s ease both'}}>
          {/* Header row */}
          <div style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr',gap:10,marginBottom:8}}>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.4,fontWeight:700,textAlign:'center'}}>SET</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.4,fontWeight:700,textAlign:'center'}}>REPS</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.4,fontWeight:700,textAlign:'center'}}>LBS</div>
          </div>

          {Array.from({length: numSets}).map((_,setIdx)=>{
            const log  = getSetLog(dayIdx, exIdx, setIdx);
            const prev = getPrevSetLog(dayIdx, exIdx, setIdx);
            const repsPlaceholder = log.reps ? '' : (prev.reps || (exercise.reps ? String(exercise.reps) : '—'));
            const weightPlaceholder = log.weight ? '' : (prev.weight || '0');
            const isSetComplete = log.reps && log.weight;

            return (
              <div key={setIdx} style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr',gap:10,marginBottom:8,alignItems:'center'}}>
                {/* Set number / Checkmark */}
                <div style={{
                  width:32,height:32,borderRadius:8,
                  background: isSetComplete ? G : 'var(--bg-total)', 
                  border: isSetComplete ? `1px solid ${G}` : '1px solid var(--border)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:14,fontWeight:800,color: isSetComplete ? '#000' : 'var(--text-sec)', opacity: isSetComplete ? 1 : 0.6,
                  fontFamily:"'Barlow Condensed',sans-serif",
                  transition: 'all 0.3s ease'
                }}>
                  {isSetComplete ? '✓' : setIdx+1}
                </div>

                {/* Reps input */}
                <input
                  type="number"
                  inputMode="numeric"
                  value={log.reps || ''}
                  placeholder={repsPlaceholder}
                  onChange={e=>updateSetLog(dayIdx,exIdx,setIdx,'reps',e.target.value)}
                  style={{
                    background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:10,
                    padding:'10px',color:'var(--text-pri)',textAlign:'center',
                    fontSize:15,fontWeight:700,outline:'none',width:'100%',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.target.style.borderColor=G}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}
                />

                {/* Weight input */}
                <input
                  type="number"
                  inputMode="numeric"
                  value={log.weight || ''}
                  placeholder={weightPlaceholder}
                  onChange={e=>updateSetLog(dayIdx,exIdx,setIdx,'weight',e.target.value)}
                  style={{
                    background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:10,
                    padding:'10px',color:'var(--text-pri)',textAlign:'center',
                    fontSize:15,fontWeight:700,outline:'none',width:'100%',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.target.style.borderColor=AMBER}
                  onBlur={e=>e.target.style.borderColor='var(--border)'}
                />
              </div>
            );
          })}

          {/* Edge Fact Section */}
          {exercise.bjjEdge && (
            <div style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-total)', 
              borderLeft: `3px solid ${G}`, animation: 'fadeUp 0.3s ease both'
            }}>
              <div style={{fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: G, fontWeight: 900, marginBottom: 4}}>EDGE</div>
              <div style={{fontSize: 12, color: 'var(--text-pri)', lineHeight: 1.4, fontWeight: 500, opacity: 0.8}}>{exercise.bjjEdge}</div>
            </div>
          )}
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
  const { goals, exerciseDone, toggleExercise, bjjDays, setBjjDays, setFreq, workoutDays, setWorkoutDays, setScFreq, scFreq, getSetLog, updateSetLog, getPrevSetLog, setLogs } = useApp();

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [demoEx, setDemoEx] = useState(null);
  const [expandedExIdx, setExpandedExIdx] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && !timerPaused) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerPaused]);

  useEffect(() => {
    let timer = null;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(true);
      setExpandedExIdx(0);
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const dayIdx = dateToIdx(selectedDate);
  const isBjjDay     = bjjDays.includes(dayIdx);
  const isWorkoutDay = workoutDays.includes(dayIdx);
  const exercises    = weekPlan[dayIdx] || [];

  const remainingBjj     = Math.max(0, (bjjDays.length || 0));
  const remainingWorkout = Math.max(0, (workoutDays.length || 0));
  const totalDays = 7;
  const restDays = totalDays - new Set([...bjjDays, ...workoutDays]).size;

  const formattedDate = selectedDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  return (
    <div style={{ padding:'20px 20px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'var(--text-sec)', opacity:0.6, marginBottom:4, fontWeight:700 }}>Workout Plan</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'var(--text-pri)', letterSpacing:1 }}>YOUR WORKOUT PLAN</div>
        </div>
        <button 
          onClick={() => setShowUpdateModal(true)}
          style={{
            padding: '8px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: G, fontSize: 10, fontWeight: 900, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase'
          }}
        >
          Update
        </button>
      </div>

      {/* Weekly summary card */}
      <div className="liquid-glass" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px', borderRadius: 20, border: '1px solid var(--border)', 
        marginBottom: 20
      }}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 4}}>
           <div style={{fontSize:20, marginBottom:2}}>🥋</div>
           <div style={{fontSize:11,fontWeight:800,color:G, letterSpacing:0.5}}>{remainingBjj} BJJ</div>
        </div>
        <div style={{width: 1, height: 32, background: 'var(--border)'}} />
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 4}}>
           <div style={{fontSize:20, marginBottom:2}}>🏋️</div>
           <div style={{fontSize:11,fontWeight:800,color:AMBER, letterSpacing:0.5}}>{remainingWorkout} LIFTS</div>
        </div>
        <div style={{width: 1, height: 32, background: 'var(--border)'}} />
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 4}}>
           <div style={{fontSize:20, marginBottom:2}}>😴</div>
           <div style={{fontSize:11,fontWeight:800,color:'var(--text-sec)', letterSpacing:0.5}}>{restDays} REST</div>
        </div>
      </div>

      {/* Calendar */}
      <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div style={{
        marginBottom:20, padding:'14px 18px', borderRadius:16,
        background: isBjjDay && isWorkoutDay ? G+'11'
                  : isBjjDay ? G+'11'
                  : isWorkoutDay ? AMBER+'11'
                  : 'var(--bg-total)',
        border: `1px solid ${isBjjDay ? G+'33' : isWorkoutDay ? AMBER+'33' : 'var(--border)'}`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-sec)',opacity:0.6,marginBottom:4}}>{formattedDate}</div>
          <div style={{fontSize:14,fontWeight:900,color: isBjjDay ? G : isWorkoutDay ? AMBER : 'var(--text-pri)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5}}>
            {isBjjDay && isWorkoutDay && '🥋 BJJ CLASS + 🏋️ WORKOUT DAY'}
            {isBjjDay && !isWorkoutDay && '🥋 BJJ CLASS DAY'}
            {!isBjjDay && isWorkoutDay && '🏋️ WORKOUT DAY'}
            {!isBjjDay && !isWorkoutDay && '😴 REST DAY'}
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      {isWorkoutDay && (
        <div style={{ marginBottom: 24 }}>
          {!timerActive ? (
            <button
              onClick={() => {
                setCountdown(3);
              }}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, background: G, border: 'none',
                color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900,
                letterSpacing: 1, cursor: 'pointer', transition: 'transform 0.1s',
              }}
              onMouseDown={e=>e.currentTarget.style.transform='scale(0.98)'}
              onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
            >
              START WORKOUT
            </button>
          ) : (
            <div className="liquid-glass" style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 16, 
              border: `1px solid ${AMBER}44`, justifyContent: 'space-between'
            }}>
              <div style={{display:'flex', alignItems: 'center', gap: 12}}>
                <div style={{ 
                  width: 10, height: 10, borderRadius: '50%', background: timerPaused ? '#666' : AMBER,
                  animation: timerPaused ? 'none' : 'pulse 1.5s infinite'
                }} />
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, color: 'var(--text-pri)', letterSpacing: 1 }}>
                  {formatTime(timerSeconds)}
                </div>
              </div>
              <div style={{display:'flex', gap: 8}}>
                <button
                  onClick={() => setTimerPaused(!timerPaused)}
                  style={{
                    width: 50, height: 50, borderRadius: 12, background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: timerPaused ? G : 'var(--text-pri)',
                    transition: 'all 0.2s'
                  }}
                >
                  {timerPaused ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  style={{
                    width: 50, height: 50, borderRadius: 12, background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WORKOUT DAY — exercises with set tracking ── */}
      {isWorkoutDay && (
        <div style={{marginBottom: 20}}>
          <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:AMBER,marginBottom:10,fontWeight:700}}>🏋️ Today's Exercises</div>
          {exercises.length > 0 ? exercises.map((ex, i) => (
            <div key={i} style={{position:'relative'}}>
              <SetTracker
                exercise={ex}
                dayIdx={dayIdx}
                exIdx={i}
                exerciseDone={exerciseDone}
                toggleExercise={toggleExercise}
                getSetLog={getSetLog}
                updateSetLog={updateSetLog}
                getPrevSetLog={getPrevSetLog}
                isExpanded={expandedExIdx === i}
                onToggleHeader={() => setExpandedExIdx(expandedExIdx === i ? null : i)}
                onAutoAdvance={(nextIdx, showDemo = true) => {
                  if (showDemo) setDemoEx(ex);
                  else setExpandedExIdx(nextIdx < exercises.length ? nextIdx : null);
                }}
                setLogs={setLogs}
              />
            </div>
          )) : (
            <div style={{background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:12,padding:'20px',textAlign:'center',color:'var(--text-sec)',opacity:0.4,fontSize:13}}>
              No exercises planned for this day.
            </div>
          )}

          {timerActive && (
            <button
              onClick={() => {
                if (window.confirm('Finish workout and save time?')) {
                  setTimerActive(false);
                  alert(`Workout finished in ${formatTime(timerSeconds)}!`);
                  setTimerSeconds(0);
                }
              }}
              style={{
                width: '100%', padding: '16px', borderRadius: 16, background: G, border: 'none', marginTop: 12,
                color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900,
                letterSpacing: 1, cursor: 'pointer'
              }}
            >
              FINISH WORKOUT
            </button>
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

      {/* Video Demo overlay */}
      {demoEx && <DemoModal exercise={demoEx} onClose={()=>setDemoEx(null)} />}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div className="liquid-glass" style={{
            width: '100%', maxWidth: 320, borderRadius: 24, padding: '32px 24px', textAlign: 'center',
            border: '2px solid var(--border)', animation: 'fadeUp 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28) both',
            boxShadow: '0 40px 120px rgba(0,0,0,1)'
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24, color: 'var(--text-pri)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Clear Timer?</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>This will reset your workout progress and stop the current timer.</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowClearConfirm(false)}
                style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-pri)', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}
              >CANCEL</button>
              <button 
                onClick={() => {
                  setTimerActive(false);
                  setTimerPaused(false);
                  setTimerSeconds(0);
                  setShowClearConfirm(false);
                }}
                style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#ff3b30', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 1, boxShadow: '0 8px 24px rgba(255,59,48,0.4)' }}
              >CLEAR</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Schedule Update Modal */}
      {showUpdateModal && (
        <ScheduleModal 
          bjjDays={bjjDays}
          workoutDays={workoutDays}
          onSave={(newBjj, newWk) => {
            setBjjDays(newBjj);
            setFreq(String(newBjj.length));
            setWorkoutDays(newWk);
            setScFreq(String(newWk.length));
            setShowUpdateModal(false);
          }}
          onClose={() => setShowUpdateModal(false)}
        />
      )}


      {/* Countdown Overlay */}
      {countdown !== null && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100001,
          background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            fontSize: 14, color: G, fontWeight: 900, letterSpacing: 4, 
            textTransform: 'uppercase', marginBottom: 20, opacity: 0.8
          }}>GET READY</div>
          <div key={countdown} style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 160, fontWeight: 900, 
            color: '#fff', lineHeight: 1, animation: 'countPop 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) both'
          }}>
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <style>{`
            @keyframes countPop {
              0% { transform: scale(0.5); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>,
        document.body
      )}
    </div>
  );
}

function ScheduleModal({ bjjDays, workoutDays, onSave, onClose }) {
  const [tempBjj, setTempBjj] = useState([...bjjDays]);
  const [tempWk, setTempWk]   = useState([...workoutDays]);

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="liquid-glass" style={{
        width: '100%', maxWidth: 400, borderRadius: 28, padding: '32px 24px',
        border: '2px solid var(--border)', animation: 'fadeUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) both',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >✕</button>

        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, color: '#fff', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>UPDATE SCHEDULE</h2>
        <p style={{ fontSize: 14, color: 'var(--text-sec)', marginBottom: 28, lineHeight: 1.5 }}>Adjust your training volume and specific days below.</p>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 800, color: G, marginBottom: 12 }}>🥋 BJJ Class Days</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['M','T','W','T','F','S','S'].map((d,i)=>{
              const active = tempBjj.includes(i);
              return (
                <div key={i} onClick={() => {
                  setTempBjj(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort());
                }} style={{
                  flex: 1, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? G : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? G : 'var(--border)'}`,
                  color: active ? '#000' : 'var(--text-pri)', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}>{d}</div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 800, color: AMBER, marginBottom: 12 }}>🏋️ Workout Days</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['M','T','W','T','F','S','S'].map((d,i)=>{
              const active = tempWk.includes(i);
              return (
                <div key={i} onClick={() => {
                  setTempWk(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort());
                }} style={{
                  flex: 1, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? AMBER : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? AMBER : 'var(--border)'}`,
                  color: active ? '#000' : 'var(--text-pri)', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}>{d}</div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={() => onSave(tempBjj, tempWk)}
          style={{
            width: '100%', padding: '16px', borderRadius: 16, background: G, border: 'none',
            color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900,
            letterSpacing: 1, cursor: 'pointer', boxShadow: `0 10px 30px ${G}33`
          }}
        >SAVE SCHEDULE</button>
      </div>
    </div>,
    document.body
  );
}
