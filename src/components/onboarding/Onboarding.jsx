import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';

const G = '#4ade80';

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
  { val:'bottom',    title:'Guard Player',   desc:'Play from the bottom, sweeps & subs',  icon:'🛡️' },
  { val:'pressure',  title:'Top Pressure',   desc:'Pass & grind, positional dominance',    icon:'⬇️' },
  { val:'leg-lock',  title:'Leg Lock Game',  desc:'Entries, outside heel hooks, reaping', icon:'🦵' },
  { val:'rubber',    title:'Rubber Guard',   desc:'Mission control, unorthodox guards',    icon:'🔄' },
  { val:'wrestling', title:'Wrestling Base', desc:'Takedowns, top control, scrambles',     icon:'💪' },
  { val:'judo',      title:'Judo / Throws',  desc:'Uchimata, seoi nage, grips',           icon:'🏆' },
];
const GOALS = ['💪 Build Strength','⚡ Get Faster','🧘 Improve Flexibility','⚖️ Gain Weight / Mass','🔥 Lose Weight','🫁 Cardio & Gas Tank','🛡️ Injury Prevention','🏅 Compete','😌 Stress Relief'];
const FREQS = [
  { val:'2', label:'2×', desc:'2 days / week' },
  { val:'3', label:'3×', desc:'3 days / week' },
  { val:'4', label:'4×', desc:'4 days / week' },
  { val:'5', label:'5+', desc:'Competition prep' },
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
          background: i < step ? G : i === step ? '#166534' : '#1a1a1a',
          transition:'background 0.4s ease',
        }}/>
      ))}
    </div>
  );
}

function OptCard({ icon, title, desc, selected, onClick, large }) {
  return (
    <div onClick={onClick} style={{
      background: selected ? 'rgba(74,222,128,0.06)' : '#111',
      border: `1px solid ${selected ? G : '#1f1f1f'}`,
      borderLeft: selected ? `3px solid ${G}` : '1px solid #1f1f1f',
      borderRadius:10, padding:'14px', cursor:'pointer',
      transition:'all 0.18s', position:'relative',
    }}>
      <div style={{
        position:'absolute', top:10, right:10,
        width:18, height:18, borderRadius:'50%',
        background: selected ? G : '#111',
        border: `1px solid ${selected ? G : '#333'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, color: selected ? '#000' : 'transparent',
        transition:'all 0.18s', fontWeight:900,
      }}>✓</div>
      {icon && <div style={{fontSize: large ? 26 : 18, marginBottom:6}}>{icon}</div>}
      <div style={{
        fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
        fontSize: large ? 26 : 15, letterSpacing:0.5,
        color:'#fff', marginBottom:3,
      }}>{title}</div>
      {desc && <div style={{fontSize:11, color:'#555', fontWeight:400, lineHeight:1.4}}>{desc}</div>}
    </div>
  );
}

function CompBar({ label, skillKey, value, onChange }) {
  const trackRef = useRef(null);
  const isDragging = useRef(false);

  const getValueFromEvent = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * 10);
  };

  // Mouse events
  const onMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    onChange(getValueFromEvent(e.clientX));

    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      onChange(getValueFromEvent(e.clientX));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Touch events
  const onTouchStart = (e) => {
    isDragging.current = true;
    onChange(getValueFromEvent(e.touches[0].clientX));

    const onTouchMove = (e) => {
      e.preventDefault();
      if (!isDragging.current) return;
      onChange(getValueFromEvent(e.touches[0].clientX));
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  const desc = SKILL_DESCS[skillKey]?.[value] || '';

  return (
    <div style={{marginBottom:22}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <span style={{fontSize:14, fontWeight:600, color:'#ccc'}}>{label}</span>
        <span style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:800, fontSize:18, color:G, letterSpacing:1,
        }}>{value} / 10</span>
      </div>

      {/* Skill description */}
      <div style={{
        fontSize:11, color:'#4ade80', opacity: value === 0 ? 0.3 : 0.8,
        marginBottom:10, minHeight:16, fontStyle:'italic', lineHeight:1.4,
        transition:'opacity 0.2s',
      }}>{desc}</div>

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          width:'100%', height:6, background:'#1a1a1a',
          borderRadius:3, position:'relative', cursor:'pointer',
          touchAction:'none',
        }}
      >
        {/* Fill */}
        <div style={{
          width:`${value * 10}%`, height:'100%',
          background:`linear-gradient(90deg, #166534, ${G})`,
          borderRadius:3, pointerEvents:'none',
        }}/>
        {/* Handle */}
        <div style={{
          position:'absolute', top:'50%',
          left:`${value * 10}%`,
          transform:'translate(-50%, -50%)',
          width:22, height:22, borderRadius:'50%',
          background:'#fff', border:`2px solid ${G}`,
          pointerEvents:'none',
          boxShadow:'0 0 8px rgba(74,222,128,0.4)',
          transition:'box-shadow 0.15s',
        }}/>
      </div>

      {/* Tick marks */}
      <div style={{display:'flex', justifyContent:'space-between', marginTop:4}}>
        {[0,1,2,3,4,5,6,7,8,9,10].map(n=>(
          <div key={n} style={{
            fontSize:8, color: n <= value ? G : '#333',
            fontWeight:700, width:8, textAlign:'center',
          }}>{n}</div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({ value, onChange, optA, optB }) {
  return (
    <div style={{display:'inline-flex',background:'#111',border:'1px solid #1f1f1f',borderRadius:50,padding:3}}>
      {[optA,optB].map(opt=>{
        const active=value===opt.val;
        return (
          <div key={opt.val} onClick={()=>onChange(opt.val)} style={{
            padding:'10px 28px', borderRadius:50,
            fontSize:14, fontWeight:700,
            color: active ? '#000' : '#555',
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
    <div style={{display:'inline-flex',background:'#111',border:'1px solid #1f1f1f',borderRadius:50,padding:3}}>
      {['metric','imperial'].map(u=>{
        const active=unit===u;
        return (
          <div key={u} onClick={()=>onChange(u)} style={{
            padding:'6px 14px', borderRadius:50,
            fontSize:11, letterSpacing:1, textTransform:'uppercase', fontWeight:700,
            color: active ? '#000' : '#555',
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
      <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'#444',marginBottom:8,fontWeight:700}}>{label}</div>
      <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{
        width:'100%', background:'#111', border:'1px solid #1f1f1f', borderRadius:10,
        padding:'13px 14px', color:'#fff', fontFamily:"'Barlow',sans-serif",
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
    width:'100%', background:'#111', border:'1px solid #1f1f1f', borderRadius:10,
    padding:'13px 14px', color:'#fff', fontFamily:"'Barlow',sans-serif",
    fontSize:16, fontWeight:600, outline:'none', cursor:'pointer',
    appearance:'none', WebkitAppearance:'none',
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234ade80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center',
    transition:'border-color 0.18s',
  };
  return (
    <div>
      <div style={{fontSize:10,letterSpacing:2,textTransform:'uppercase',color:'#444',marginBottom:8,fontWeight:700}}>Height</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div>
          <select value={feet} onChange={e=>onFeet(e.target.value)} style={selStyle}
            onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#1f1f1f'}>
            <option value="" disabled>ft</option>
            {FEET_OPTS.map(f=><option key={f} value={f}>{f} ft</option>)}
          </select>
        </div>
        <div>
          <select value={inches} onChange={e=>onInches(e.target.value)} style={selStyle}
            onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#1f1f1f'}>
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

const lbl = { fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#444', marginBottom:10, fontWeight:700 };
const title = () => ({ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:42, lineHeight:0.95, letterSpacing:1, color:'#fff', marginBottom:10 });
const sub = { fontSize:14, lineHeight:1.6, color:'#666', fontWeight:400 };

export default function Onboarding() {
  const { belt, setBelt, styles, setStyles, goals, setGoals, freq, setFreq, comp, setComp, finishOnboarding, nickname, setNickname, scFreq, setScFreq, bjjDays, setBjjDays, workoutDays, setWorkoutDays } = useApp();
  const [step, setStep]       = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [giPref, setGiPref]   = useState('');
  const [sex, setSex]         = useState('');
  const [unit, setUnit]         = useState('imperial');
  const [weight, setWeight]     = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomGoal, setShowCustomGoal] = useState(false);

  const goNext = ()=>{ setAnimKey(k=>k+1); setStep(s=>s+1); };
  const goBack = ()=>{ setAnimKey(k=>k+1); setStep(s=>s-1); };

  const wPH  = unit==='metric' ? '75' : '165';
  const wLbl = unit==='metric' ? 'Weight (kg)' : 'Weight (lbs)';

  const inp = {
    width:'100%', background:'#111', border:'1px solid #1f1f1f', borderRadius:10,
    padding:'16px 18px', color:'#fff', fontFamily:"'Barlow Condensed',sans-serif",
    fontSize:28, fontWeight:800, letterSpacing:2, outline:'none', transition:'border-color 0.18s',
  };

  const steps = [
    // 0 – Name
    <StepWrapper key="name" animKey={animKey}>
      <p style={lbl}>Step 1 of {TOTAL_STEPS}</p>
      <h1 style={title()}>WHAT DO WE<br/>CALL YOU?</h1>
      <p style={sub}>Nickname, first name, mat name – your call. This is how the app talks to you.</p>
      <div style={{marginTop:28}}>
        <input type="text" value={nickname} onChange={e=>setNickname(e.target.value)}
          placeholder="e.g. Marcus, Cobra..." maxLength={20} style={inp}
          onFocus={e=>e.target.style.borderColor=G}
          onBlur={e=>e.target.style.borderColor='#1f1f1f'}
        />
        {nickname.length>0 && (
          <div style={{marginTop:14,padding:'12px 16px',background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.15)',borderRadius:10,fontSize:14,color:'#666',animation:'fadeUp 0.25s ease both'}}>
            Welcome to the mats, <span style={{color:'#fff',fontWeight:700}}>{nickname}</span>. Let's build your profile.
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
            border:`1px solid ${goals.includes(g)?G:'#1f1f1f'}`,
            background:goals.includes(g)?'rgba(74,222,128,0.08)':'#111',
            color:goals.includes(g)?'#fff':'#555',
            fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.18s',
          }}>{g}</div>
        ))}
        {/* Other tile */}
        <div
          onClick={()=>setShowCustomGoal(v=>!v)}
          style={{
            padding:'9px 16px', borderRadius:50,
            border:`1px solid ${showCustomGoal?G:'#1f1f1f'}`,
            background:showCustomGoal?'rgba(74,222,128,0.08)':'#111',
            color:showCustomGoal?'#fff':'#555',
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
              width:'100%',background:'#111',border:`1px solid ${G}`,borderRadius:10,
              padding:'13px 16px',color:'#fff',fontFamily:"'Barlow',sans-serif",
              fontSize:15,fontWeight:600,outline:'none',
            }}
          />
        </div>
      )}
    </StepWrapper>,

    // 7 – Frequency
    <StepWrapper key="freq" animKey={animKey}>
      <p style={lbl}>Step 8 of {TOTAL_STEPS}</p>
      <h1 style={title()}>HOW OFTEN?</h1>
      <p style={sub}>How many days per week do you train BJJ?</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:20}}>
        {FREQS.map(f=><OptCard key={f.val} title={f.label} desc={f.desc} large selected={freq===f.val} onClick={()=>setFreq(f.val)}/>)}
      </div>
    </StepWrapper>,

    // 8 – S&C workouts per week
    <StepWrapper key="scfreq" animKey={animKey}>
      <p style={lbl}>Step 9 of {TOTAL_STEPS}</p>
      <h1 style={title()}>OUTSIDE<br/>WORKOUTS?</h1>
      <p style={sub}>How many strength & conditioning sessions do you want per week on top of your BJJ training?</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:20}}>
        {[
          {val:'1',label:'1×',desc:'Minimal – just support work'},
          {val:'2',label:'2×',desc:'Balanced – most popular'},
          {val:'3',label:'3×',desc:'Serious – dedicated athlete'},
          {val:'4',label:'4+',desc:'Full commitment'},
        ].map(f=><OptCard key={f.val} title={f.label} desc={f.desc} large selected={scFreq===f.val} onClick={()=>setScFreq(f.val)}/>)}
      </div>
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
                border:`1px solid ${active?'#4ade80':'#1f1f1f'}`,
                background:active?'rgba(74,222,128,0.1)':'#111',
                color:active?'#4ade80':'#555',
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
              <div key={d} onClick={()=>setWorkoutDays(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i].sort())} style={{
                padding:'10px 14px', borderRadius:8, cursor:'pointer',
                border:`1px solid ${active?'#f59e0b':'#1f1f1f'}`,
                background:active?'rgba(245,158,11,0.1)':'#111',
                color:active?'#f59e0b':'#555',
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
          <div style={{marginTop:10,fontSize:12,color:'#555',fontStyle:'italic'}}>
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
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'#000',maxWidth:430,margin:'0 auto',overflow:'hidden'}}>
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
          {step===TOTAL_STEPS-1?'BUILD MY PLAN':'NEXT →'}
        </button>
      </div>
    </div>
  );
}
