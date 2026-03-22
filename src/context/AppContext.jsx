import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

// ── localStorage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'tapguard_state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded — fail silently
  }
}

// ── Belt colours keyed by belt value (matches onboarding) ────────────────────
const BELT_COLORS = {
  white:  '#dddddd',
  blue:   '#3498db',
  purple: '#9b59b6',
  brown:  '#8B4513',
  black:  '#111111',
};

// ── Competency → focus skill map ─────────────────────────────────────────────
const FOCUS_MAP = {
  guard:    'HIP ESCAPE MECHANICS',
  pass:     'KNEE SLICE FUNDAMENTALS',
  sub:      'ARM LOCK SETUPS',
  esc:      'BRIDGE & SHRIMP SERIES',
  takedown: 'SINGLE LEG ENTRIES',
  position: 'SCARF HOLD CONTROL',
};

export function AppProvider({ children }) {
  const saved = loadState();

  const [onboardingDone, setOnboardingDone] = useState(saved?.onboardingDone ?? false);
  const [activeTab,      setActiveTab]      = useState('dash');

  // Onboarding
  const [nickname,    setNickname]    = useState(saved?.nickname    ?? '');
  const [belt,        setBelt]        = useState(saved?.belt        ?? '');
  const [giPref,      setGiPref]      = useState(saved?.giPref      ?? '');
  const [styles,      setStyles]      = useState(saved?.styles      ?? []);
  const [goals,       setGoals]       = useState(saved?.goals       ?? []);
  const [freq,        setFreq]        = useState(saved?.freq        ?? '');
  const [scFreq,      setScFreq]      = useState(saved?.scFreq      ?? '');
  const [bjjDays,     setBjjDays]     = useState(saved?.bjjDays     ?? []);
  const [workoutDays, setWorkoutDays] = useState(saved?.workoutDays ?? []);
  const [comp,        setComp]        = useState(saved?.comp        ?? {
    guard: 3, pass: 3, sub: 3, esc: 3, takedown: 3, position: 3,
  });

  // Physical profile
  const [sex,      setSex]      = useState(saved?.sex      ?? '');
  const [weight,   setWeight]   = useState(saved?.weight   ?? '');
  const [height,   setHeight]   = useState(saved?.height   ?? '');
  const [bodyType, setBodyType] = useState(saved?.bodyType ?? '');

  // Notes
  const [notes, setNotes] = useState(saved?.notes ?? [
    { id: 0, date: 'Mar 14 · Thursday', title: 'De La Riva Guard Entries',  moves: ['DLR Hook', 'Berimbolo', 'X-Guard Entry'], feel: 'okay', note: 'DLR hook needs more reps.' },
    { id: 1, date: 'Mar 11 · Monday',   title: 'Knee Slice Pass Series',    moves: ['Knee Slice', 'Leg Weave', 'Torreando'],   feel: 'good', note: 'Clicking now.' },
    { id: 2, date: 'Mar 7 · Friday',    title: 'Back Takes & RNC',          moves: ['Seatbelt', 'Hook Insertion', 'RNC'],      feel: 'lost', note: 'Struggling with seatbelt.' },
  ]);

  // Training — exercise completion
  const [exerciseDone, setExerciseDone] = useState(saved?.exerciseDone ?? {});
  const toggleExercise = (day, i) => {
    const key = `${day}-${i}`;
    setExerciseDone(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Training — set logs
  const [setLogs, setSetLogs] = useState(saved?.setLogs ?? {});
  const updateSetLog = (dayIdx, exIdx, setIdx, field, value) => {
    const key = `${dayIdx}-${exIdx}-${setIdx}`;
    setSetLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };
  const getSetLog     = (dayIdx, exIdx, setIdx) => setLogs[`${dayIdx}-${exIdx}-${setIdx}`] || {};
  const getPrevSetLog = (dayIdx, exIdx, setIdx) => {
    if (setIdx === 0) return {};
    return setLogs[`${dayIdx}-${exIdx}-${setIdx - 1}`] || {};
  };

  const finishOnboarding = () => setOnboardingDone(true);
  const addNote          = (note) => setNotes(prev => [{ ...note, id: Date.now() }, ...prev]);
  const updateNote       = (id, updates) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));

  // Derived
  const lowestComp = Object.entries(comp).sort((a, b) => a[1] - b[1])[0][0];
  const focusSkill = FOCUS_MAP[lowestComp];
  const beltColor  = BELT_COLORS[belt] || '#dddddd';

  // Persist on every relevant state change
  useEffect(() => {
    saveState({
      onboardingDone,
      nickname, belt, giPref, styles, goals,
      freq, scFreq, bjjDays, workoutDays, comp,
      sex, weight, height, bodyType,
      notes, exerciseDone, setLogs,
    });
  }, [
    onboardingDone,
    nickname, belt, giPref, styles, goals,
    freq, scFreq, bjjDays, workoutDays, comp,
    sex, weight, height, bodyType,
    notes, exerciseDone, setLogs,
  ]);

  return (
    <AppContext.Provider value={{
      onboardingDone, finishOnboarding,
      activeTab, setActiveTab,
      nickname, setNickname,
      belt, setBelt,
      giPref, setGiPref,
      styles, setStyles,
      goals, setGoals,
      freq, setFreq,
      scFreq, setScFreq,
      bjjDays, setBjjDays,
      workoutDays, setWorkoutDays,
      comp, setComp,
      sex, setSex,
      weight, setWeight,
      height, setHeight,
      bodyType, setBodyType,
      notes, addNote, updateNote,
      exerciseDone, toggleExercise,
      setLogs, updateSetLog, getSetLog, getPrevSetLog,
      focusSkill, beltColor, lowestComp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
