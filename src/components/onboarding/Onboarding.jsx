import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, useVelocity } from 'framer-motion';

const G = '#4ade80';
const AMBER = '#f59e0b';

const LEVELS = [
  { val:'beginner',     title:'Beginner',     desc:'Under 1 year – still learning to fall properly',    icon:'🌱' },
  { val:'intermediate', title:'Intermediate', desc:'1–3 years – you have a game, it just leaks',         icon:'⚔️' },
  { val:'advanced',     title:'Advanced',     desc:'3–6 years – dangerous in at least two positions',    icon:'🔥' },
  { val:'expert',       title:'Expert',       desc:'6+ years – people check who you are before rolling', icon:'🏆' },
];
const GI_PREFS = [
  { val:'gi',          title:'Gi Only',      desc:'Collar grips, friction, tradition',             icon:'🥋' },
  { val:'nogi',        title:'No Gi Only',   desc:'Rash guards, speed, leg locks everywhere',      icon:'⚡' },
  { val:'mostly-gi',   title:'Mostly Gi',    desc:'Primarily gi but dabble no gi occasionally',    icon:'🥋' },
  { val:'mostly-nogi', title:'Mostly No Gi', desc:'Primarily no gi, gi when forced',               icon:'⚡' },
  { val:'both',        title:'Gi & No Gi',   desc:'Equal time in both – maximalist approach',      icon:'🔄' },
];
const STYLES = [
  // Stand-up and entry
  { val:'standing',     title:'Standing Game',      desc:'Takedowns, clinch, scrambles',                    icon:'🤼' },
  { val:'judo',         title:'Throws & Trips',     desc:'Trips, hip throws, grip fighting',                icon:'🏆' },

  // Guard families (bottom)
  { val:'closed-guard', title:'Closed Guard',       desc:'Posture breaks, controls, submissions',           icon:'🔒' },
  { val:'open-guard',   title:'Open Guard',         desc:'Hooks, distance, angles & off-balancing',         icon:'🛡️' },
  { val:'half-guard',   title:'Half Guard',         desc:'Knee shield, underhooks, dogfight',               icon:'🟫' },
  { val:'butterfly',    title:'Butterfly Guard',    desc:'Elevation, sweeps, upper-body ties',              icon:'🦋' },
  { val:'rubber',       title:'Rubber Guard',       desc:'Mission control, high guard attacks',             icon:'🔄' },

  // Passing / top control
  { val:'passing',      title:'Guard Passing',      desc:'Knee slice, float passing, pressure or speed',    icon:'🗡️' },
  { val:'pressure',     title:'Top Pressure',       desc:'Crossface, smash, slow cooking',                  icon:'⬇️' },
  { val:'pins',         title:'Top Control',        desc:'Side control, mount, north-south',                icon:'📌' },
  { val:'back-control', title:'Back Control',       desc:'Seatbelt, hooks, RNC system',                     icon:'🎒' },
  { val:'sub-hunting',  title:'Submission Hunting', desc:'Chaining attacks and finishing sequences',         icon:'💀' },

  // Leg attacks
  { val:'leg-lock',     title:'Leg Locks',          desc:'Ashi, straight ankles, heel hook entries',        icon:'🦵' },
];
const GOALS = ['💪 Build Strength','⚡ Get Faster','🧘 Improve Flexibility','⚖️ Gain Weight / Mass','🔥 Lose Weight','🫁 Cardio & Gas Tank','🛡️ Injury Prevention','🏅 Compete','😌 Stress Relief'];
const FREQS = [
  { val:'1', label:'1×', desc:'1 day / week' },
  { val:'2', label:'2×', desc:'2 days / week' },
  { val:'3', label:'3×', desc:'3 days / week' },
  { val:'4', label:'4×', desc:'4 days / week' },
  { val:'5', label:'5+', desc:'Active competitor' },
];
const COMP_KEYS = [
  { key:'guard',    label:'Guard Retention' },
  { key:'pass',     label:'Guard Passing' },
  { key:'sub',      label:'Submissions' },
  { key:'esc',      label:'Escapes' },
  { key:'takedown', label:'Takedowns' },
  { key:'position', label:'Positional Control' },
];

// Skill descriptions for each rating 0-10
const SKILL_DESCS = {
  guard: [
    'Not rated yet',
    'Gets swept or passed almost every time',
    'Occasional guard recovery but mostly gets passed',
    'Can hold guard briefly under light pressure',
    'Survives moderate pressure with effort',
    'Decent retention — holds guard against most white belts',
    'Solid guard — blues and purples have to work for it',
    'Hard to pass — uses framing and hip movement well',
    'Rarely gets passed — recovers from bad positions',
    'Guard is a weapon — forces mistakes from the top',
    'Near impassable — controls the top player completely',
  ],
  pass: [
    'Not rated yet',
    'Struggles to even engage with the guard',
    'Gets stuck in guard almost every time',
    'Occasionally advances but usually gets swept',
    'Can pass newer grapplers with effort',
    'Passes most white belts, struggles with blues',
    'Has 1–2 reliable passes that work consistently',
    'Passes most guards with patience and good base',
    'Can pass most guards with ease',
    'Advanced passer — combines setups and misdirection',
    'Passes everything — guard is irrelevant against them',
  ],
  sub: [
    'Not rated yet',
    'Rarely threatens — no real finishing ability',
    'Gets close occasionally but can\'t close it out',
    'Lands subs on beginners, misses setups',
    'Has one or two go-to submissions that sometimes land',
    'Decent finisher — submits most white belts',
    'Lands submissions regularly on lower belts',
    'Creative and dangerous — threatens from many positions',
    'High finish rate — sets traps and chains subs well',
    'Elite finisher — submissions are inevitable',
    'Submits nearly everyone — unstoppable finishing game',
  ],
  esc: [
    'Not rated yet',
    'Gets pinned and stays pinned',
    'Rarely escapes — movement is basic',
    'Can escape side control occasionally',
    'Escapes mount and back with significant effort',
    'Survives bad positions and sometimes escapes',
    'Escapes consistently against lower belts',
    'Good framing and hip movement — rarely stays stuck',
    'Escapes most positions smoothly under pressure',
    'Rarely tapped from bad spots — escapes everything',
    'Untappable from bottom — escape artist',
  ],
  takedown: [
    'Not rated yet',
    'No real takedown game — pulls guard every time',
    'Attempts takedowns but rarely scores',
    'Can score a single leg against beginners',
    'Has a go-to takedown that works occasionally',
    'Decent wrestling — scores on most white belts',
    'Solid takedown game — controls where the fight starts',
    'Hard to take down and scores regularly',
    'Dominant on the feet — dictates the grappling',
    'High-level takedowns — almost always gets the takedown',
    'Elite level — controls the entire match from the stand',
  ],
  position: [
    'Not rated yet',
    'Struggles to hold any position',
    'Can hold mount for a few seconds before being escaped',
    'Holds positions briefly but gets reversed often',
    'Maintains top control against beginners',
    'Decent control — holds side control with some effort',
    'Good weight distribution — hard to move off position',
    'Dominant on top — controls and advances position well',
    'High-level control — rarely loses dominant position',
    'Crushing pressure — submissions follow naturally',
    'Immovable — total positional dominance',
  ],
};

const BODY_TYPES = [
  { val:'ectomorph', title:'Lean / Lanky',   desc:'Long limbs, hard to gain weight',      icon:'📏' },
  { val:'mesomorph', title:'Athletic',        desc:'Naturally muscular, moderate build',   icon:'💪' },
  { val:'endomorph', title:'Stocky / Sturdy', desc:'Lower centre of gravity, strong base', icon:'🛡️' },
  { val:'mixed',     title:'Mixed / Unsure',  desc:'Somewhere in between',                 icon:'🔄' },
];

const TOTAL_STEPS = 10;

function Progress({ step }) {
  return (
    <div style={{ display:'flex', gap:4, marginBottom:28 }}>
      {Array.from({length:TOTAL_STEPS}).map((_,i)=>(
        <div key={i} style={{
          flex:1, height:3, borderRadius:2,
          background: i < step ? G : i === step ? G+'44' : 'var(--border)',
          transition:'background 0.4s ease',
        }}/>
      ))}
    </div>
  );
}

function OptCard({ icon, title, desc, selected, onClick, large }) {
  return (
    <div onClick={onClick} style={{
      background: selected ? G+'11' : 'var(--bg-total)',
      border: `1px solid ${selected ? G : 'var(--border)'}`,
      borderLeft: selected ? `3px solid ${G}` : '1px solid var(--border)',
      borderRadius:10, padding:'14px', cursor:'pointer',
      transition:'all 0.18s', position:'relative',
    }}>
      <div style={{
        position:'absolute', top:10, right:10,
        width:18, height:18, borderRadius:'50%',
        background: selected ? G : 'var(--bg-total)',
        border: `1px solid ${selected ? G : 'var(--border)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, color: selected ? '#000' : 'transparent',
        transition:'all 0.18s', fontWeight:900,
      }}>✓</div>
      {icon && <div style={{fontSize: large ? 26 : 18, marginBottom:6}}>{icon}</div>}
      <div style={{
        fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
        fontSize: large ? 26 : 15, letterSpacing:0.5,
        color:'var(--text-pri)', marginBottom:3,
      }}>{title}</div>
      {desc && <div style={{fontSize:11, color:'var(--text-sec)', opacity: 0.6, fontWeight:400, lineHeight:1.4}}>{desc}</div>}
    </div>
  );
}

function CompBar({ label, skillKey, value, onChange }) {
  const trackRef = useRef(null);
  const mValue = useMotionValue(value);
  const isScrubbingRef = useRef(false);
  
  // Spring physics for the knob - High-index optical feel
  const springX = useSpring(mValue, { stiffness: 400, damping: 38, mass: 1 });
  const velocity = useVelocity(springX);
  
  // Interaction Physics: High-elasticity warping
  const scaleRefract = useTransform(velocity, [-3000, 0, 3000], [1.15, 1, 1.15]);
  const skewRefract = useTransform(velocity, [-3000, 0, 3000], [-10, 0, 10]);

  useEffect(() => {
    mValue.set(value);
  }, [value, mValue]);

  const setFromClientX = (clientX) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const localX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, localX / rect.width));
    const newVal = Math.round(pct * 10);
    if (newVal !== value) onChange(newVal);
  };

  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ 
          fontSize: 14, fontWeight: 900, color: G, 
          letterSpacing: 2, textTransform: 'uppercase', 
          userSelect: 'none', pointerEvents: 'none',
          textShadow: `0 0 15px ${G}33`
        }}>{label}</span>
        <motion.span 
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 26, color: G, letterSpacing: 1,
            userSelect: 'none'
          }}
          animate={{ scale: [1, 1.1, 1] }}
          key={value}
        >{value}</motion.span>
      </div>

      {/* Skill description */}
      <div style={{
        marginBottom: 16,
        minHeight: 34,
        userSelect: 'none',
      }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${skillKey}-${value}`}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: value === 0 ? 0.35 : 0.9, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              fontSize: 13,
              color: 'var(--text-sec)',
              fontStyle: 'italic',
              lineHeight: 1.4,
              letterSpacing: 0.3,
            }}
          >
            {SKILL_DESCS[skillKey]?.[value] || ''}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Frosted Glass Filament Rail - iOS 26 Light Style */}
      <div
        ref={trackRef}
        style={{
          width: '100%', height: 10, 
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 5, position: 'relative', 
          touchAction: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
          userSelect: 'none'
        }}
      >
        {/* Interaction Surface (tap + scrub) */}
        <div
          onPointerDown={(e) => {
            isScrubbingRef.current = true;
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!isScrubbingRef.current) return;
            setFromClientX(e.clientX);
          }}
          onPointerUp={() => { isScrubbingRef.current = false; }}
          onPointerCancel={() => { isScrubbingRef.current = false; }}
          style={{ position: 'absolute', inset: -20, zIndex: 20, cursor: 'pointer' }}
        />

        {/* Light Frosted Glass Pill Handle */}
        <motion.div
          style={{
            position: 'absolute', top: '50%',
            left: `${value * 10}%`,
            x: '-50%', y: '-50%',
            width: 48, height: 26, borderRadius: 13,
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px) saturate(140%) brightness(1.2)',
            WebkitBackdropFilter: 'blur(12px) saturate(140%) brightness(1.2)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 10,
            pointerEvents: 'none',
            WebkitTapHighlightColor: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            filter: 'url(#optical-magnification)'
          }}
        >
          {/* Subtle Glass Reflection Shine with Green Color Pass */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: `linear-gradient(${G}33, transparent)`,
            borderRadius: '13px 13px 0 0'
          }} />
        </motion.div>
      </div>
    </div>
  );
}

function ToggleSwitch({ value, onChange, optA, optB }) {
  return (
    <div style={{display:'inline-flex',background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:50,padding:3}}>
      {[optA,optB].map(opt=>{
        const active=value===opt.val;
        return (
          <div key={opt.val} onClick={()=>onChange(opt.val)} style={{
            padding:'10px 28px', borderRadius:50,
            fontSize:14, fontWeight:700,
            color: active ? '#000' : 'var(--text-sec)',
            background: active ? G : 'transparent',
            cursor:'pointer', transition:'all 0.22s ease', userSelect:'none',
          }}>{opt.label}</div>
        );
      })}
    </div>
  );
}

function UnitToggle({ unit, onChange }) {
  return (
    <div style={{display:'inline-flex',background:'var(--bg-total)',border:'1px solid var(--border)',borderRadius:50,padding:3}}>
      {['metric','imperial'].map(u=>{
        const active=unit===u;
        return (
          <div key={u} onClick={()=>onChange(u)} style={{
            padding:'6px 14px', borderRadius:50,
            fontSize:11, letterSpacing:1, textTransform:'uppercase', fontWeight:700,
            color: active ? '#000' : 'var(--text-sec)',
            background: active ? G : 'transparent',
            cursor:'pointer', transition:'all 0.2s', userSelect:'none',
          }}>{u}</div>
        );
      })}
    </div>
  );
}

function MeasureInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.6,marginBottom:8,fontWeight:700}}>{label}</div>
      <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{
        width:'100%', background:'var(--bg-total)', border:'1px solid var(--border)', borderRadius:10,
        padding:'13px 14px', color:'var(--text-pri)', fontFamily:"'Barlow',sans-serif",
        fontSize:16, fontWeight:600, outline:'none', transition:'border-color 0.18s',
      }}
        onFocus={e=>e.target.style.borderColor=G}
        onBlur={e=>e.target.style.borderColor='#1f1f1f'}
      />
    </div>
  );
}

const FEET_OPTS   = [4, 5, 6, 7];
const INCHES_OPTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function HeightImperial({ feet, inches, onFeet, onInches }) {
  const selStyle = {
    width:'100%', background:'var(--bg-total)', border:'1px solid var(--border)', borderRadius:10,
    padding:'13px 14px', color:'var(--text-pri)', fontFamily:"'Barlow',sans-serif",
    fontSize:16, fontWeight:600, outline:'none', cursor:'pointer',
    appearance:'none', WebkitAppearance:'none',
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234ade80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center',
    transition:'border-color 0.18s',
  };
  return (
    <div>
      <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'var(--text-sec)',opacity:0.6,marginBottom:8,fontWeight:700}}>Height</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div>
          <select value={feet} onChange={e=>onFeet(e.target.value)} style={selStyle}
            onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='var(--border)'}>
            <option value="" disabled>ft</option>
            {FEET_OPTS.map(f=><option key={f} value={f}>{f} ft</option>)}
          </select>
        </div>
        <div>
          <select value={inches} onChange={e=>onInches(e.target.value)} style={selStyle}
            onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='var(--border)'}>
            <option value="" disabled>in</option>
            {INCHES_OPTS.map(i=><option key={i} value={i}>{i} in</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepWrapper({ children, animKey }) {
  return <div key={animKey} style={{animation:'stepIn 0.3s ease both'}}>{children}</div>;
}

const lbl = { fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-sec)', opacity:0.6, marginBottom:10, fontWeight:700 };
const title = () => ({ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:42, lineHeight:0.95, letterSpacing:1, color:'var(--text-pri)', marginBottom:10 });
const sub = { fontSize:14, lineHeight:1.6, color:'var(--text-sec)', opacity:0.6, fontWeight:400 };

export default function Onboarding() {
  const { belt, setBelt, styles, setStyles, goals, setGoals, freq, setFreq, comp, setComp, finishOnboarding, nickname, setNickname, scFreq, setScFreq, bjjDays, setBjjDays, workoutDays, setWorkoutDays } = useApp();
  const [step, setStep]       = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [giPref, setGiPref]   = useState('both');
  const [sex, setSex]         = useState('male');
  const [unit, setUnit]         = useState('imperial');
  const [weight, setWeight]     = useState('185');
  const [heightCm, setHeightCm] = useState('178');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('10');
  const [bodyType, setBodyType] = useState('mesomorph');
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomGoal, setShowCustomGoal] = useState(false);
  const [showCustomFreq, setShowCustomFreq] = useState(false);
  const [showCustomScFreq, setShowCustomScFreq] = useState(false);
  const manualWorkoutRef = useRef(false);

  useEffect(() => {
    if (!freq) setFreq('2');
    if (!scFreq) setScFreq('2');
    if (!nickname) setNickname('Champion');
  }, []);

  // Auto-suggest workout days based on BJJ days
  useEffect(() => {
    if (manualWorkoutRef.current) return;
    if (bjjDays.length === 0 && workoutDays.length === 0) return;
    
    const count = parseInt(scFreq) || 0;
    if (count === 0) {
      setWorkoutDays([]);
      return;
    }

    const available = [0,1,2,3,4,5,6].filter(d => !bjjDays.includes(d));
    const suggested = available.slice(0, count);
    
    // If not enough non-BJJ days, fill with BJJ days as overflow
    if (suggested.length < count) {
      const remaining = count - suggested.length;
      const bjjSorted = [...bjjDays].sort();
      suggested.push(...bjjSorted.slice(0, remaining));
    }

    setWorkoutDays(suggested.sort((a,b) => a-b));
  }, [bjjDays, scFreq]);

  const goNext = ()=>{ setAnimKey(k=>k+1); setStep(s=>s+1); };
  const goBack = ()=>{ setAnimKey(k=>k+1); setStep(s=>s-1); };

  const wPH  = unit==='metric' ? '75' : '165';
  const wLbl = unit==='metric' ? 'Weight (kg)' : 'Weight (lbs)';

  const inp = {
    width:'100%', background:'var(--bg-total)', border:'1px solid var(--border)', borderRadius:10,
    padding:'16px 18px', color:'var(--text-pri)', fontFamily:"'Barlow Condensed',sans-serif",
    fontSize:28, fontWeight:800, letterSpacing:2, outline:'none', transition:'border-color 0.18s',
  };


  const steps = [
    // 0 – Name
    <StepWrapper key="name" animKey={animKey}>
      <p style={lbl}>Step 1 of {TOTAL_STEPS}</p>
      <h1 style={title()}>WHAT SHOULD WE<br/>CALL YOU?</h1>
      <p style={sub}>Nickname, first name, mat name – your call.</p>
      <div style={{marginTop:28}}>
        <input type="text" value={nickname} onChange={e=>setNickname(e.target.value)}
          placeholder="e.g. Marcus, Cobra..." maxLength={20} style={inp}
          onFocus={e=>e.target.style.borderColor=G}
          onBlur={e=>e.target.style.borderColor='var(--border)'}
        />
        {nickname.length>0 && (
          <div style={{marginTop:14,padding:'12px 16px',background:G+'11',border:`1px solid ${G}33`,borderRadius:10,fontSize:14,color:'var(--text-sec)',animation:'fadeUp 0.25s ease both'}}>
            Welcome to the mats, <span style={{color:'var(--text-pri)',fontWeight:700}}>{nickname}</span>. Let's build your profile.
          </div>
        )}
      </div>
    </StepWrapper>,

    // 1 – Level
    <StepWrapper key="level" animKey={animKey}>
      <p style={lbl}>Step 2 of {TOTAL_STEPS}</p>
      <h1 style={title()}>YOUR LEVEL</h1>
      <p style={sub}>Ego at the door. The app works better with honest input.</p>
      <div style={{display:'grid',gap:8,marginTop:20}}>
        {LEVELS.map(l=><OptCard key={l.val} {...l} selected={belt===l.val} onClick={()=>setBelt(l.val)}/>)}
      </div>
    </StepWrapper>,

    // 2 – Gi Pref
    <StepWrapper key="gi" animKey={animKey}>
      <p style={lbl}>Step 3 of {TOTAL_STEPS}</p>
      <h1 style={title()}>GI OR<br/>NO GI?</h1>
      <p style={sub}>Shapes your technique library and grip recommendations.</p>
      <div style={{display:'grid',gap:8,marginTop:20}}>
        {GI_PREFS.map(g=><OptCard key={g.val} {...g} selected={giPref===g.val} onClick={()=>setGiPref(g.val)}/>)}
      </div>
    </StepWrapper>,

    // 3 – Style
    <StepWrapper key="style" animKey={animKey}>
      <p style={lbl}>Step 4 of {TOTAL_STEPS}</p>
      <h1 style={title()}>YOUR STYLE</h1>
      <p style={sub}>Pick all that apply.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:20}}>
        {STYLES.map(st=><OptCard key={st.val} {...st} selected={styles.includes(st.val)} onClick={()=>setStyles(prev=>prev.includes(st.val)?prev.filter(v=>v!==st.val):[...prev,st.val])}/>)}
      </div>
    </StepWrapper>,

    // 4 – Competency
    <StepWrapper key="comp" animKey={animKey}>
      <p style={lbl}>Step 5 of {TOTAL_STEPS}</p>
      <h1 style={title()}>RATE YOURSELF</h1>
      <p style={sub}>Honest numbers only – your coach isn't watching.</p>
      <div style={{marginTop:20}}>
        {COMP_KEYS.map(({key,label})=>(
          <CompBar
            key={key}
            label={label}
            skillKey={key}
            value={comp[key]}
            onChange={val=>setComp(prev=>({...prev,[key]:val}))}
          />
        ))}
      </div>
    </StepWrapper>,

    // 5 – About Me
    <StepWrapper key="profile" animKey={animKey}>
      <p style={lbl}>Step 6 of {TOTAL_STEPS}</p>
      <h1 style={title()}>ABOUT ME</h1>
      <p style={sub}>Personalises your S&C plan and technique recommendations.</p>
      <div style={{marginTop:22}}>
        <div style={{...lbl,marginBottom:12}}>Sex</div>
        <ToggleSwitch value={sex} onChange={setSex} optA={{val:'male',label:'Male'}} optB={{val:'female',label:'Female'}}/>
      </div>
      <div style={{marginTop:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={lbl}>Measurements</div>
          <UnitToggle unit={unit} onChange={u=>{
            if(u==='imperial'&&unit==='metric'){
              if(weight) setWeight(Math.round(parseFloat(weight)*2.205).toString());
              if(heightCm) {
                const totalIn = Math.round(parseFloat(heightCm) / 2.54);
                setHeightFt(String(Math.floor(totalIn / 12)));
                setHeightIn(String(totalIn % 12));
              }
            } else if(u==='metric'&&unit==='imperial'){
              if(weight) setWeight(Math.round(parseFloat(weight)/2.205).toString());
              if(heightFt) {
                const totalIn = (parseInt(heightFt)||0)*12 + (parseInt(heightIn)||0);
                setHeightCm(Math.round(totalIn * 2.54).toString());
              }
            }
            setUnit(u);
          }}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <MeasureInput label={wLbl} value={weight} onChange={setWeight} placeholder={wPH}/>
          {unit==='metric'
            ? <MeasureInput label="Height (cm)" value={heightCm} onChange={setHeightCm} placeholder="175"/>
            : <HeightImperial feet={heightFt} inches={heightIn} onFeet={setHeightFt} onInches={setHeightIn}/>
          }
        </div>
      </div>
      <div style={{marginTop:20}}>
        <div style={{...lbl,marginBottom:10}}>Body Type</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {BODY_TYPES.map(b=><OptCard key={b.val} {...b} selected={bodyType===b.val} onClick={()=>setBodyType(b.val)}/>)}
        </div>
      </div>
    </StepWrapper>,

    // 6 – Goals
    <StepWrapper key="goals" animKey={animKey}>
      <p style={lbl}>Step 7 of {TOTAL_STEPS}</p>
      <h1 style={title()}>TRAINING GOALS</h1>
      <p style={sub}>What are you optimising for? Pick all that apply.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:20}}>
        {GOALS.map(g=>(
          <div key={g} onClick={()=>setGoals(prev=>prev.includes(g)?prev.filter(v=>v!==g):[...prev,g])} style={{
            padding:'9px 16px', borderRadius:50,
            border:`1px solid ${goals.includes(g)?G:'var(--border)'}`,
            background:goals.includes(g)?G+'11':'var(--bg-total)',
            color:goals.includes(g)?'var(--text-pri)':'var(--text-sec)',
            opacity: goals.includes(g) ? 1 : 0.6,
            fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.18s',
          }}>{g}</div>
        ))}
        {/* Other tile */}
        <div
          onClick={()=>setShowCustomGoal(v=>!v)}
          style={{
            padding:'9px 16px', borderRadius:50,
            border:`1px solid ${showCustomGoal?G:'var(--border)'}`,
            background:showCustomGoal?G+'11':'var(--bg-total)',
            color:showCustomGoal?'var(--text-pri)':'var(--text-sec)',
            opacity: showCustomGoal ? 1 : 0.6,
            fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.18s',
          }}
        >✏️ Other</div>
      </div>
      {showCustomGoal && (
        <div style={{marginTop:12,animation:'fadeUp 0.2s ease both'}}>
          <input
            type="text"
            value={customGoal}
            onChange={e=>{
              setCustomGoal(e.target.value);
              setGoals(prev=>{
                const filtered = prev.filter(g=>!g.startsWith('✏️'));
                return e.target.value.trim() ? [...filtered, `✏️ ${e.target.value.trim()}`] : filtered;
              });
            }}
            placeholder="Describe your goal..."
            style={{
              width:'100%',background:'var(--bg-total)',border:`1px solid ${G}`,borderRadius:10,
              padding:'13px 16px',color:'var(--text-pri)',fontFamily:"'Barlow',sans-serif",
              fontSize:15,fontWeight:600,outline:'none',
            }}
          />
        </div>
      )}
    </StepWrapper>,

    // 7 – Frequency
    <StepWrapper key="freq" animKey={animKey}>
      <p style={lbl}>Step 8 of {TOTAL_STEPS}</p>
      <h1 style={title()}>BJJ TRAINING<br/>DAYS</h1>
      <p style={sub}>How many days per week do you train BJJ?</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:20}}>
        {FREQS.map(f=><OptCard key={f.val} title={f.label} desc={f.desc} large selected={freq===f.val && !showCustomFreq} onClick={()=>{setFreq(f.val); setShowCustomFreq(false);}}/>)}
        <OptCard title="Other" desc="Custom schedule" large selected={showCustomFreq} onClick={()=>setShowCustomFreq(true)}/>
      </div>
      {showCustomFreq && (
        <div style={{marginTop:16, animation:'fadeUp 0.2s ease both'}}>
          <div style={{...lbl, marginBottom:10}}>Days Per Week (1-7)</div>
          <div style={{display:'flex', gap:6}}>
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} onClick={()=>setFreq(String(n))} style={{
                flex:1, height:44, display:'flex', alignItems:'center', justifyContent:'center',
                borderRadius:10, background: freq === String(n) ? G : 'var(--bg-total)',
                border: `1px solid ${freq === String(n) ? G : 'var(--border)'}`,
                color: freq === String(n) ? '#000' : 'var(--text-pri)',
                fontSize:16, fontWeight:800, cursor:'pointer', transition:'all 0.18s'
              }}>{n}</div>
            ))}
          </div>
        </div>
      )}
    </StepWrapper>,

    // 8 – S&C workouts per week
    <StepWrapper key="scfreq" animKey={animKey}>
      <p style={lbl}>Step 9 of {TOTAL_STEPS}</p>
      <h1 style={title()}>LIFTING / OTHER<br/>WORKOUTS?</h1>
      <p style={sub}>How many weight-lifting or S&C sessions do you want per week in addition to BJJ?</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:20}}>
        {[
          {val:'1',label:'1×',desc:'Minimal intensity'},
          {val:'2',label:'2×',desc:'Balanced – most popular'},
          {val:'3',label:'3×',desc:'Serious – dedicated athlete'},
          {val:'4',label:'4×',desc:'High volume training'},
          {val:'5',label:'5+',desc:'Intense competition prep'},
        ].map(f=><OptCard key={f.val} title={f.label} desc={f.desc} large selected={scFreq===f.val && !showCustomScFreq} onClick={()=>{setScFreq(f.val); setShowCustomScFreq(false);}}/>)}
        <OptCard title="Other" desc="Custom volume" large selected={showCustomScFreq} onClick={()=>setShowCustomScFreq(true)}/>
      </div>
      {showCustomScFreq && (
        <div style={{marginTop:16, animation:'fadeUp 0.2s ease both'}}>
          <div style={{...lbl, marginBottom:10}}>Lifting Days Per Week (1-7)</div>
          <div style={{display:'flex', gap:6}}>
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} onClick={()=>setScFreq(String(n))} style={{
                flex:1, height:44, display:'flex', alignItems:'center', justifyContent:'center',
                borderRadius:10, background: scFreq === String(n) ? G : 'var(--bg-total)',
                border: `1px solid ${scFreq === String(n) ? G : 'var(--border)'}`,
                color: scFreq === String(n) ? '#000' : 'var(--text-pri)',
                fontSize:16, fontWeight:800, cursor:'pointer', transition:'all 0.18s'
              }}>{n}</div>
            ))}
          </div>
        </div>
      )}
    </StepWrapper>,

    // 9 – Pick BJJ days + workout days
    <StepWrapper key="schedule" animKey={animKey}>
      <p style={lbl}>Step 10 of {TOTAL_STEPS}</p>
      <h1 style={title()}>YOUR WEEK</h1>
      <p style={sub}>Select your BJJ class days, then pick your workout days. They can overlap – that's your call.</p>

      <div style={{marginTop:20}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',fontWeight:700,color:'#4ade80',marginBottom:10}}>
          🥋 BJJ Class Days
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{
            const active = bjjDays.includes(i);
            return (
              <div key={d} onClick={()=>setBjjDays(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i].sort())} style={{
                padding:'10px 14px', borderRadius:8, cursor:'pointer',
                border:`1px solid ${active?'#4ade80':'var(--border)'}`,
                background:active?G+'11':'var(--bg-total)',
                color:active?'#4ade80':'var(--text-sec)',
                opacity: active ? 1 : 0.6,
                fontSize:13, fontWeight:700, transition:'all 0.18s',
                minWidth:48, textAlign:'center',
              }}>{d}</div>
            );
          })}
        </div>
      </div>

      <div style={{marginTop:20}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',fontWeight:700,color:'#f59e0b',marginBottom:10}}>
          🏋️ Workout Days
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>{
            const active = workoutDays.includes(i);
            const isBjj  = bjjDays.includes(i);
            return (
              <div key={d} onClick={()=>{
                manualWorkoutRef.current = true;
                setWorkoutDays(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i].sort());
              }} style={{
                padding:'10px 14px', borderRadius:8, cursor:'pointer',
                border:`1px solid ${active?'#f59e0b':'var(--border)'}`,
                background:active?AMBER+'11':'var(--bg-total)',
                color:active?'#f59e0b':'var(--text-sec)',
                opacity: active ? 1 : 0.6,
                fontSize:13, fontWeight:700, transition:'all 0.18s',
                minWidth:48, textAlign:'center',
                position:'relative',
              }}>
                {d}
                {isBjj && active && (
                  <div style={{position:'absolute',top:-4,right:-4,width:8,height:8,borderRadius:'50%',background:'#4ade80',border:'1px solid #000'}}/>
                )}
              </div>
            );
          })}
        </div>
        {workoutDays.some(d=>bjjDays.includes(d)) && (
          <div style={{marginTop:10,fontSize:12,color:'var(--text-sec)',opacity:0.6,fontStyle:'italic'}}>
            💡 Days with both BJJ and a workout are marked with a green dot – bold choice.
          </div>
        )}
      </div>
    </StepWrapper>,
  ];

  const canNext=[
    nickname.trim().length>0,
    belt!=='',
    giPref!=='',
    styles.length>0,
    true,
    true,
    goals.length>0,
    freq!=='',
    scFreq!=='',
    bjjDays.length>0,
  ];

  return (
    <div style={{height:'100dvh',display:'flex',flexDirection:'column',background:'var(--bg-page)',maxWidth:430,margin:'0 auto',overflow:'hidden', userSelect: 'none'}}>
      {/* Global Shader Definitions */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="optical-magnification" x="-50%" y="-50%" width="200%" height="200%">
            {/* Subtle refraction warping - iOS 26 feel */}
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="5" result="smoothNoise" />
            <feDisplacementMap in="SourceGraphic" in2="smoothNoise" scale="12" xChannelSelector="R" yChannelSelector="G" result="magnified" />
            
            {/* Clean refraction for realism — no chromatic split to avoid pink hue */}
            <feComposite in="magnified" in2="SourceGraphic" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div style={{padding:'52px 24px 0',flexShrink:0}}>
        <Progress step={step}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 24px 12px',scrollbarWidth:'none'}}>
        {steps[step]}
      </div>
      <div style={{padding:'16px 24px 36px',borderTop:'1px solid #1a1a1a',display:'flex',gap:10,flexShrink:0}}>
        {step>0 && (
          <button onClick={goBack} style={{
            background:'transparent',border:'1px solid #1f1f1f',
            color:'#555',padding:'14px 16px',borderRadius:10,
            fontSize:14,fontWeight:700,cursor:'pointer',transition:'all 0.18s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#555';e.currentTarget.style.color='#aaa';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#1f1f1f';e.currentTarget.style.color='#555';}}
          >←</button>
        )}
        <button disabled={!canNext[step]} onClick={()=>step<TOTAL_STEPS-1?goNext():finishOnboarding()} style={{
          flex:1,
          background:canNext[step]?G:'#1a1a1a',
          color:canNext[step]?'#000':'#333',
          border:'none',padding:14,borderRadius:10,
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:900,fontSize:20,letterSpacing:2,
          cursor:canNext[step]?'pointer':'not-allowed',
          transition:'all 0.18s',
        }}
          onMouseDown={e=>e.currentTarget.style.transform='scale(0.98)'}
          onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
        >
          {step===TOTAL_STEPS-1?'BUILD MY PLAN':'NEXT \u2192'}
        </button>
      </div>
    </div>
  );
}
