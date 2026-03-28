import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { weekPlan, bjjDayTips } from '../../data/weekPlan';

const G = '#0BF571';
const FOCUS_SKILLS = [
  { skill: 'HIP ESCAPE MECHANICS',    desc: 'Drill shrimp + bridge combos 10 min before class.', detail: `The hip escape (shrimp) is the single most important movement in BJJ. Without it, you cannot recover guard, escape side control, or create frames.\n\nKey checkpoints:\n• Drive off your bottom foot, not your top\n• Keep your inside elbow glued to your inside knee\n• Shrimp THEN replace guard — not simultaneously\n• Chin tucked, don't give up your neck\n\nDrill: 3 sets of 10 full-length shrimps before every session.`, youtube: 'https://www.youtube.com/embed/5pFhMyCRO5Y' },
  { skill: 'KNEE SLICE PASS',          desc: 'Weight forward, pin the hip before you slice.', detail: `The knee slice is one of the highest percentage guard passes at every level.\n\nKey checkpoints:\n• Establish a strong cross-collar or underhook grip first\n• Drop your hip onto their far hip — this IS the pass\n• Slice your knee across their thigh at a diagonal\n• Land in side control with your head on the mat side\n\nDrill: Slow-motion knee slice from standing — 5 on each side.`, youtube: 'https://www.youtube.com/embed/7fFqfHBolco' },
  { skill: 'ARMBAR FROM GUARD',        desc: 'Break posture completely before attacking the arm.', detail: `The most common mistake: attacking the arm before breaking posture.\n\nKey checkpoints:\n• Two hands on head/collar — break them DOWN first\n• Rotate 90° with hips UNDER their arm\n• Squeeze knees together throughout\n• Hips up, heels down to finish\n\nDrill: Posture break isolation — partner resists, you break 10 times.`, youtube: 'https://www.youtube.com/embed/oMkU9bBrLgc' },
  { skill: 'REAR NAKED CHOKE',         desc: 'Hooks first, seatbelt locked, then choke.', detail: `The number one error: going for the choke before back control is established.\n\nKey checkpoints:\n• Top hook in first, bottom hook second\n• Seatbelt: top arm over shoulder, bottom under armpit\n• Bicep across throat, hand behind their head\n• Squeeze with your whole body — not just arms\n\nDrill: Back control retention 30 sec holds — no finish.`, youtube: 'https://www.youtube.com/embed/4lLDMqKpN38' },
  { skill: 'SINGLE LEG TAKEDOWN',      desc: 'Level change first — stop reaching from standing.', detail: `The fatal flaw: reaching for the leg without a level change.\n\nKey checkpoints:\n• Level change first — bend knees, not your back\n• Penetration step between their feet\n• Head on outside of their hip\n• Lift and drive through — don't pull\n\nDrill: Level change shadow shots — 3 sets of 10.`, youtube: 'https://www.youtube.com/embed/h0L3oJKGqiU' },
  { skill: 'MOUNT ESCAPES',            desc: 'Bridge to disturb, shrimp to escape — in that order.', detail: `Most beginners bridge randomly and hope. The bridge is a setup, not the escape.\n\nKey checkpoints:\n• Elbows IN — flared elbows gift armbars\n• Bridge explosively to disturb their base\n• Immediately shrimp as they post\n• Get to half guard — don't try to roll them\n\nDrill: Bridge and shrimp to half guard — 3 sets of 5 each side.`, youtube: 'https://www.youtube.com/embed/XCh0JqpEeis' },
  { skill: 'GUARD RETENTION',          desc: 'Frame on their hip before they clear your leg.', detail: `Guard retention is about being proactive. By the time you react, you're already late.\n\nKey checkpoints:\n• Inside hand frames on their hip — straight arm\n• Outside hand controls their sleeve or wrist\n• Knee shield connected to elbow at all times\n• Move hips AWAY first, then re-engage\n\nDrill: Guard retention solo shrimping — 3 sets of 10.`, youtube: 'https://www.youtube.com/embed/RJSF_SWm8xc' },
];

function getTitleAndTagline(score, styles) {
  const styleKey = styles && styles[0];
  const tiers = [
    { range:[0,25],   items:[
      { title:'Professional Tap Machine',      tagline:'You\'re basically a free submission dispenser.' },
      { title:'Donation Artist',               tagline:'Giving away taps like they\'re business cards.' },
      { title:'Certified Mat Inspector',       tagline:'Nobody studies the ceiling more diligently.' },
    ]},
    { range:[26,50],  items:[
      { title:'Occasionally Dangerous',        tagline:'Like a speed bump. Annoying but survivable.' },
      { title:'Emerging Menace',               tagline:'The gym is mildly aware of your existence.' },
      { title:'Work In Progress',              tagline:'Heavy emphasis on the "in progress" part.' },
    ]},
    { range:[51,75],  items:[
      { title:'Certified Problem',             tagline:'People start to remember what you train.' },
      { title:'Gym Hazard',                    tagline:'New students get a quiet warning about you.' },
      { title:'Involuntary Instructor',        tagline:'Teaching humility, one tap at a time.' },
    ]},
    { range:[76,100], items:[
      { title:'Do Not Engage',                 tagline:'The warm-up round is someone else\'s nightmare.' },
      { title:'Insurance Liability',           tagline:'The gym owner checks your membership monthly.' },
      { title:'Helio Is Watching',             tagline:'From wherever he is, he\'s nodding.' },
    ]},
  ];
  const styleTitles = {
    'leg-lock':  { title:'Orthopaedic Surgeon\'s BFF', tagline:'Keeping knee specialists in business since day one.' },
    'rubber':    { title:'Mission Control Operator',   tagline:'Eddie Bravo is your spirit animal. God help us.' },
    'pressure':  { title:'Human Weighted Blanket',     tagline:'Oppressive, suffocating, and oddly effective.' },
    'bottom':    { title:'Guard Goblin',               tagline:'Happiest when horizontal and causing problems.' },
    'wrestling': { title:'Takedown Tyrant',            tagline:'If it\'s not on the ground, it\'s not your problem.' },
    'judo':      { title:'Airtime Architect',           tagline:'Your partners are getting frequent flyer miles.' },
  };
  if (styleKey && styleTitles[styleKey] && score > 20 && (score * 7) % 10 < 4) return styleTitles[styleKey];
  const tier = tiers.find(t => score >= t.range[0] && score <= t.range[1]) || tiers[0];
  return tier.items[Math.floor((score/26) % tier.items.length) % tier.items.length];
}

function SpiderChart({ comp }) {
  const keys=[['guard','GUARD'],['pass','PASSING'],['sub','SUBS'],['esc','ESCAPES'],['takedown','TDs']];
  const n=5; const cx=115; const cy=110; const r=70; const lr=r+28;
  const pt=(i,v,max=10)=>{const a=(Math.PI*2*i)/n-Math.PI/2; const d=(v/max)*r; return{x:cx+d*Math.cos(a),y:cy+d*Math.sin(a)};};
  const lp=(i)=>{const a=(Math.PI*2*i)/n-Math.PI/2; return{x:cx+lr*Math.cos(a),y:cy+lr*Math.sin(a)};};
  const dp=keys.map(([k],i)=>pt(i,comp[k]||0));
  const path=dp.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
  return (
    <svg width="230" height="220" style={{overflow:'visible'}}>
      {[2,4,6,8,10].map(v=>{
        const pts=keys.map((_,i)=>pt(i,v));
        const d=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
        return <path key={v} d={d} fill="none" stroke={v===10?'#2A2D32':'#1A1C20'} strokeWidth={v===10?1:0.5}/>;
      })}
      {keys.map((_,i)=>{const tip=pt(i,10); return <line key={i} x1={cx} y1={cy} x2={tip.x.toFixed(1)} y2={tip.y.toFixed(1)} stroke="#1f1f1f" strokeWidth={0.75}/>;  })}
      <path d={path} fill="rgba(74,222,128,0.12)" stroke={G} strokeWidth={1.5} strokeLinejoin="round"/>
      {dp.map((p,i)=><circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3} fill={G} stroke="#000" strokeWidth={1.5}/>)}
      {keys.map(([k,label],i)=>{
        const p=lp(i); const a=(Math.PI*2*i)/n-Math.PI/2;
        const anchor=Math.abs(Math.cos(a))<0.2?'middle':Math.cos(a)>0?'start':'end';
        return (
          <g key={i}>
            <text x={p.x.toFixed(1)} y={(p.y-7).toFixed(1)} textAnchor={anchor} dominantBaseline="central" fontSize={8} fill="#555" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" letterSpacing="1">{label}</text>
            <text x={p.x.toFixed(1)} y={(p.y+7).toFixed(1)} textAnchor={anchor} dominantBaseline="central" fontSize={14} fill={G} fontFamily="'Barlow Condensed', sans-serif" fontWeight="800">{comp[k]||0}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={2} fill="#222"/>
    </svg>
  );
}

function calcScore(comp) {
  const keys=['guard','pass','sub','esc','takedown','position'];
  return Math.round((keys.reduce((s,k)=>s+(comp[k]||0),0)/(keys.length*10))*100);
}

function FocusOverlay({ focus, onClose }) {
  return (
    <div className="overlay-enter" style={{
      position:'fixed', inset:0, zIndex:50,
      background:'#080808', overflowY:'auto',
      padding:'0 0 60px', maxWidth:430, margin:'0 auto',
    }}>
      <div style={{ padding:'52px 20px 20px', borderBottom:'1px solid #1A1C20', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#555', fontSize:13, cursor:'pointer', fontWeight:600, fontFamily:"'Space Grotesk',sans-serif", display:'flex', alignItems:'center', gap:6 }}>← Back</button>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:G, fontWeight:700 }}>This Week's Focus</div>
      </div>
      <div style={{ padding:'24px 20px 0' }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:40, color:'#fff', lineHeight:0.95, marginBottom:20, letterSpacing:1 }}>{focus.skill}</h1>
        <div style={{ width:'100%', aspectRatio:'16/9', borderRadius:12, overflow:'hidden', background:'#111', marginBottom:20, border:'1px solid #1A1C20' }}>
          <iframe width="100%" height="100%" src={focus.youtube} title={focus.skill} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{display:'block'}}/>
        </div>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#555', marginBottom:14, fontWeight:600 }}>TECHNIQUE BREAKDOWN</div>
        {focus.detail.split('\n').map((line,i)=>{
          const isBullet=line.startsWith('•'); const isHeader=line.endsWith(':')&&!isBullet; const isEmpty=line.trim()==='';
          if(isEmpty) return <div key={i} style={{height:10}}/>;
          if(isHeader) return <div key={i} style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:'#fff',marginBottom:8,marginTop:4}}>{line}</div>;
          if(isBullet) return <div key={i} style={{display:'flex',gap:10,marginBottom:6}}><span style={{color:G,flexShrink:0}}>•</span><span style={{fontSize:14,color:'#aaa',fontWeight:400,lineHeight:1.6}}>{line.slice(2)}</span></div>;
          return <p key={i} style={{fontSize:14,color:'#aaa',fontWeight:400,lineHeight:1.7,marginBottom:8}}>{line}</p>;
        })}
      </div>
    </div>
  );
}

// Map lowestComp key to FOCUS_SKILLS index
const COMP_TO_FOCUS_IDX = {
  esc:      0, // HIP ESCAPE MECHANICS
  pass:     1, // KNEE SLICE PASS
  sub:      2, // ARMBAR FROM GUARD
  guard:    6, // GUARD RETENTION
  takedown: 4, // SINGLE LEG TAKEDOWN
  position: 5, // MOUNT ESCAPES
};

// ─── WOD card helpers ────────────────────────────────────────────────────────
const REST_QUOTES = [
  { quote: "Rest is not idleness. The body adapts while you sleep.", author: "Rickson Gracie" },
  { quote: "Champions aren't made in gyms. They're made from something they have deep inside them.", author: "Muhammad Ali" },
  { quote: "The fight is won or lost far away from witnesses, in the gym, long before I dance under those lights.", author: "Muhammad Ali" },
  { quote: "There is no greater wealth in this world than peace of mind.", author: "Helio Gracie" },
  { quote: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee" },
  { quote: "An injury is only a setback if you let it be.", author: "Georges St-Pierre" },
];

const BJJ_CLASS_FOCUS = [
  { icon: '🥋', focus: 'Guard Work', tip: 'Today zero in on your guard retention and sweeps. Pick one sweep and drill it 20 times before sparring.' },
  { icon: '🔒', focus: 'Back Control', tip: 'Focus on seatbelt control and hook placement. Aim to take the back at least once in every round today.' },
  { icon: '🤼', focus: 'Top Game', tip: 'Practice maintaining heavy side control pressure. Work your transitions from side control to mount.' },
  { icon: '⚡', focus: 'Takedowns', tip: 'Start every roll from standing. Drill your level change on a partner before class begins.' },
  { icon: '🧠', focus: 'Submissions', tip: 'Hunt one submission family today — either arm attacks or chokes. Notice the setups that open them up.' },
  { icon: '🛡️', focus: 'Escapes & Defense', tip: 'Let your partner establish dominant positions and practice escaping. Controlled adversity builds real skill.' },
  { icon: '🔀', focus: 'Transitions', tip: 'Focus on the moments between positions today. Smooth transitions beat explosive movements every time.' },
];

const WORKOUT_LABELS = {
  'Strength': { type: 'Strength Day', emoji: '💪', quote: 'Strength doesn\'t come from what you can do. It comes from overcoming what you once thought you couldn\'t.' },
  'Power':    { type: 'Power Day',    emoji: '⚡', quote: 'Train harder than you think you need to. The mat doesn\'t care about excuses.' },
  'Cardio':   { type: 'Cardio Day',   emoji: '🫀', quote: 'Your gas tank is your most dangerous weapon. Fill it up.' },
  'Core':     { type: 'Core Day',     emoji: '🧱', quote: 'A strong core holds the whole game together. On the mat. Off the mat.' },
  'BJJ-Specific': { type: 'BJJ Conditioning', emoji: '🥋', quote: 'Every rep today is a technique tomorrow. Put in the work.' },
  'Balance':  { type: 'Stability Day', emoji: '⚖️', quote: 'Balance and stability are the foundations of explosive movement.' },
  'Grip':     { type: 'Grip & Pulling Day', emoji: '🖐️', quote: 'Grip strength is grappling strength. Earn it.' },
  'Flexibility': { type: 'Mobility Day', emoji: '🧘', quote: 'Flexibility fuels the positions your opponents can\'t reach.' },
};

function getWorkoutMeta(exercises) {
  if (!exercises || exercises.length === 0) return { type: 'Workout Day', emoji: '🏋️', quote: 'Show up. Do the work. Improve.' };
  const allTags = exercises.flatMap(e => e.tags || []);
  const priority = ['BJJ-Specific','Power','Cardio','Grip','Flexibility','Balance','Core','Strength'];
  for (const tag of priority) {
    if (allTags.includes(tag) && WORKOUT_LABELS[tag]) return WORKOUT_LABELS[tag];
  }
  return { type: 'Strength Day', emoji: '💪', quote: 'Show up. Do the work. Improve.' };
}

export default function Dashboard() {
  const { comp, belt, beltColor, setActiveTab, styles, nickname, lowestComp, bjjDays, workoutDays } = useApp();

  // Seed focusIndex from the user's weakest comp area
  const seedIndex = COMP_TO_FOCUS_IDX[lowestComp] ?? 0;
  const [focusIndex, setFocusIndex] = useState(seedIndex);
  const [focusOverlay, setFocusOverlay] = useState(false);

  const score = calcScore(comp);
  const { title, tagline } = getTitleAndTagline(score, styles);
  // Fixed: was score < 75 ? G : G (identical branches)
  const scoreColor = score < 30 ? '#5A5D65' : score < 60 ? '#F0A020' : score < 80 ? '#F0A020' : G;
  const currentFocus = FOCUS_SKILLS[focusIndex % FOCUS_SKILLS.length];

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? 'MORNING' : hour < 17 ? 'AFTERNOON' : 'EVENING';
  const displayName = nickname ? nickname.toUpperCase() : 'FIGHTER';
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ─── Today's WOD ─────────────────────────────────────────────────────────────
  const todayIdx     = (now.getDay() + 6) % 7;  // Mon=0 … Sun=6, same as Training.jsx
  const isBjjToday     = bjjDays.includes(todayIdx);
  const isWorkoutToday = workoutDays.includes(todayIdx);
  const todayExercises = weekPlan[todayIdx] || [];
  const todayBjjTips  = bjjDayTips[todayIdx] || bjjDayTips[0];
  const workoutMeta   = getWorkoutMeta(todayExercises);
  // pick BJJ class focus deterministically from day-of-week
  const bjjClassFocus = BJJ_CLASS_FOCUS[todayIdx % BJJ_CLASS_FOCUS.length];
  // rest day quote, cycle by date
  const restQuote     = REST_QUOTES[now.getDate() % REST_QUOTES.length];

  return (
    <>
      <div style={{ padding:'16px 20px 100px', overflowY:'auto', height:'100%' }}>

        {/* Greeting */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:32, color:'#fff', lineHeight:1.0, letterSpacing:1 }}>
            {`GOOD ${timeOfDay},`}<br/>{displayName}
          </div>
          <div style={{ fontSize:11, color:'#444', textAlign:'right', paddingTop:2, lineHeight:1.6, fontWeight:600 }}>
            {days[now.getDay()]}<br/>
            <span style={{color:'#888'}}>{months[now.getMonth()]} {now.getDate()}</span>
          </div>
        </div>

        {/* Focus Card */}
        <div key={focusIndex} onClick={()=>setFocusOverlay(true)} style={{
          background:'#111', border:'1px solid #1f1f1f',
          borderLeft:'3px solid transparent', backgroundImage:'linear-gradient(#1A1C20, #1A1C20), linear-gradient(to bottom, #0BF571, rgba(11,245,113,0.15))', backgroundOrigin:'border-box', backgroundClip:'padding-box, border-box', borderRadius:12,
          padding:'16px 16px', marginBottom:10,
          animation:'fadeUp 0.3s ease both', cursor:'pointer',
        }}>
          <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:G, marginBottom:6, fontWeight:700 }}>This Week's Focus</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:4, letterSpacing:0.5 }}>{currentFocus.skill}</div>
          <div style={{ fontSize:13, color:'#666', fontWeight:400, lineHeight:1.5, marginBottom:12 }}>{currentFocus.desc}</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:12, color:'#444', fontStyle:'italic' }}>Tap for full breakdown →</div>
            <button onClick={e=>{ e.stopPropagation(); setFocusIndex(i=>(i+1)%FOCUS_SKILLS.length); }} style={{
              background:'transparent', border:'1px solid #2A2D32',
              borderRadius:50, padding:'5px 12px', color:'#555',
              fontSize:11, fontWeight:600, letterSpacing:1,
              cursor:'pointer', transition:'all 0.18s',
              fontFamily:"'Space Grotesk',sans-serif",
            }}>Not this week →</button>
          </div>
        </div>

        {/* ── Workout of the Day Card ── */}
        <div style={{
          marginBottom:10,
          borderRadius:12,
          overflow:'hidden',
          border: isBjjToday && isWorkoutToday ? '1px solid rgba(11,245,113,0.25)'
                : isBjjToday     ? '1px solid rgba(11,245,113,0.25)'
                : isWorkoutToday ? '1px solid rgba(240,160,32,0.25)'
                : '1px solid #1f1f1f',
          background: isBjjToday && isWorkoutToday ? 'linear-gradient(135deg,#0a1a10,#111)'
                    : isBjjToday     ? 'linear-gradient(135deg,#0a1a10,#111)'
                    : isWorkoutToday ? 'linear-gradient(135deg,#1a110a,#111)'
                    : '#111',
        }}>

          {/* Accent bar */}
          <div style={{
            height:3,
            background: isBjjToday && isWorkoutToday ? 'linear-gradient(to right,#0BF571,#F0A020)'
                      : isBjjToday     ? '#0BF571'
                      : isWorkoutToday ? '#F0A020'
                      : '#2A2D32',
          }}/>

          <div style={{padding:'14px 16px'}}>
            <div style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',fontWeight:700,marginBottom:8,
              color: isBjjToday && !isWorkoutToday ? G : isWorkoutToday && !isBjjToday ? '#F0A020' : isBjjToday && isWorkoutToday ? G : '#444'
            }}>Workout of the Day</div>

            {/* ── SCENARIO 1: REST DAY ── */}
            {!isBjjToday && !isWorkoutToday && (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <span style={{fontSize:28}}>😴</span>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:'#fff',letterSpacing:0.5}}>Rest Day</div>
                    <div style={{fontSize:11,color:'#444',fontWeight:500}}>Recovery is training too</div>
                  </div>
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'12px 14px',borderLeft:'2px solid #2a2a2a'}}>
                  <div style={{fontSize:13,color:'#777',lineHeight:1.65,fontStyle:'italic',marginBottom:6}}>"{restQuote.quote}"</div>
                  <div style={{fontSize:10,color:'#444',letterSpacing:1,textTransform:'uppercase',fontWeight:700}}>— {restQuote.author}</div>
                </div>
              </div>
            )}

            {/* ── SCENARIO 2: BJJ ONLY ── */}
            {isBjjToday && !isWorkoutToday && (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <span style={{fontSize:28}}>{bjjClassFocus.icon}</span>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:'#fff',letterSpacing:0.5}}>BJJ Class Day</div>
                    <div style={{fontSize:11,color:G,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Focus: {bjjClassFocus.focus}</div>
                  </div>
                </div>
                <div style={{fontSize:13,color:'#888',lineHeight:1.6,marginBottom:10}}>{bjjClassFocus.tip}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {todayBjjTips.warmup.slice(0,2).map((w,i) => (
                    <div key={i} style={{fontSize:10,padding:'4px 8px',borderRadius:6,background:'rgba(11,245,113,0.08)',border:'1px solid rgba(11,245,113,0.15)',color:G,fontWeight:600}}>{w}</div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SCENARIO 3: LIFTING ONLY ── */}
            {!isBjjToday && isWorkoutToday && (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <span style={{fontSize:28}}>{workoutMeta.emoji}</span>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:'#fff',letterSpacing:0.5}}>{workoutMeta.type}</div>
                    <div style={{fontSize:11,color:'#F0A020',fontWeight:600}}>{todayExercises.length} exercises planned</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
                  {todayExercises.slice(0,3).map((ex,i) => (
                    <div key={i} style={{fontSize:10,padding:'4px 8px',borderRadius:6,background:'rgba(240,160,32,0.08)',border:'1px solid rgba(240,160,32,0.2)',color:'#F0A020',fontWeight:600}}>{ex.title}</div>
                  ))}
                  {todayExercises.length > 3 && <div style={{fontSize:10,padding:'4px 8px',borderRadius:6,background:'#1A1C20',color:'#555',fontWeight:600}}>+{todayExercises.length - 3} more</div>}
                </div>
                <div style={{fontSize:12,color:'#555',fontStyle:'italic',lineHeight:1.5}}>" {workoutMeta.quote} "</div>
              </div>
            )}

            {/* ── SCENARIO 4: BJJ + LIFTING COMBO ── */}
            {isBjjToday && isWorkoutToday && (
              <div>
                {/* Split pill header */}
                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:50,background:'rgba(11,245,113,0.1)',border:'1px solid rgba(11,245,113,0.25)'}}>
                    <span style={{fontSize:13}}>🥋</span>
                    <span style={{fontSize:11,fontWeight:700,color:G,letterSpacing:0.5}}>BJJ Class</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:50,background:'rgba(240,160,32,0.1)',border:'1px solid rgba(240,160,32,0.25)'}}>
                    <span style={{fontSize:13}}>🏋️</span>
                    <span style={{fontSize:11,fontWeight:700,color:'#F0A020',letterSpacing:0.5}}>Lifting</span>
                  </div>
                </div>

                {/* BJJ class details */}
                <div style={{marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                    <span style={{fontSize:20}}>{bjjClassFocus.icon}</span>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:'#fff'}}>
                      Focus: {bjjClassFocus.focus}
                    </div>
                  </div>
                  <div style={{fontSize:13,color:'#888',lineHeight:1.55,marginBottom:8}}>{bjjClassFocus.tip}</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {todayBjjTips.warmup.slice(0,2).map((w,i) => (
                      <div key={i} style={{fontSize:10,padding:'4px 8px',borderRadius:6,background:'rgba(11,245,113,0.08)',border:'1px solid rgba(11,245,113,0.15)',color:G,fontWeight:600}}>{w}</div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{height:1,background:'#222',marginBottom:12}}/>

                {/* Compact lifting synopsis */}
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:20}}>{workoutMeta.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:'#ccc',marginBottom:5}}>
                      {workoutMeta.type} &middot; {todayExercises.length} exercises
                    </div>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                      {todayExercises.slice(0,3).map((ex,i) => (
                        <div key={i} style={{fontSize:10,padding:'3px 7px',borderRadius:5,background:'rgba(240,160,32,0.07)',border:'1px solid rgba(240,160,32,0.18)',color:'#C07818',fontWeight:600}}>{ex.title}</div>
                      ))}
                      {todayExercises.length > 3 && <div style={{fontSize:10,padding:'3px 7px',borderRadius:5,background:'#1A1C20',color:'#555',fontWeight:600}}>+{todayExercises.length - 3}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View full plan link */}
            <div onClick={() => setActiveTab('training')} style={{
              marginTop:12, fontSize:11, color:'#333', cursor:'pointer',
              display:'flex', alignItems:'center', gap:4,
            }}>View full plan →</div>
          </div>
        </div>

        {/* KPI Score */}
        <div style={{
          background:'#111', border:'1px solid #1f1f1f',
          borderRadius:12, padding:'18px 18px', marginBottom:10,
          display:'flex', alignItems:'center', gap:18,
        }}>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:64, lineHeight:1, color:scoreColor, letterSpacing:-2 }}>{score}</div>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#444', marginTop:2, fontWeight:700 }}>Overall</div>
          </div>
          <div style={{ width:1, height:56, background:'#222', flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#444', marginBottom:6, fontWeight:700 }}>YOUR RANK</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:'#fff', lineHeight:1.1, marginBottom:6, letterSpacing:0.5 }}>{title}</div>
            <div style={{ fontSize:12, color:'#555', fontWeight:400, lineHeight:1.4, fontStyle:'italic' }}>{tagline}</div>
          </div>
        </div>

        {/* Skill Map */}
        <div style={{ background:'#111', border:'1px solid #1f1f1f', borderRadius:12, padding:'16px 18px', marginBottom:10 }}>
          <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:8, fontWeight:700 }}>Skill Map</div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <SpiderChart comp={comp}/>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:10, fontWeight:700 }}>Quick Actions</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { icon:'🎬', label:'New Roll',        sub:'Record session',  tab:'roll' },
            { icon:'📝', label:'Log Class',        sub:"Today's notes",  tab:'notes' },
            { icon:'🏋️', label:"Today's Workout", sub:'Workout plan',       tab:'training' },
            { icon:'♟',  label:'Missed Moves',     sub:'From last roll', tab:'roll' },
          ].map(card=>(
            <div key={card.label} onClick={()=>setActiveTab(card.tab)} style={{
              background:'#111', border:'1px solid #1f1f1f',
              borderRadius:12, padding:'14px', cursor:'pointer',
              transition:'border-color 0.18s',
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#0BF571'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1f1f1f'}
            >
              <div style={{fontSize:18,marginBottom:8}}>{card.icon}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,letterSpacing:0.5,color:'#fff',marginBottom:3}}>{card.label}</div>
              <div style={{fontSize:11,color:'#555',fontWeight:400}}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {focusOverlay && <FocusOverlay focus={currentFocus} onClose={()=>setFocusOverlay(false)}/>}
    </>
  );
}
