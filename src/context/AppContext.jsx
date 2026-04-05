import { createContext, useContext, useState, useEffect } from 'react';
import { rollSessions as seedSessions, notesSample } from '../data/weekPlan';

const AppContext = createContext(null);

const STORAGE_KEY = 'tapguard_state';
const NOTES_SESSION_KEY = 'tapguard_notes_session';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* quota exceeded — fail silently */ }
}

function loadNotesForSession(fallbackNotes) {
  try {
    const raw = sessionStorage.getItem(NOTES_SESSION_KEY);
    return raw ? JSON.parse(raw) : fallbackNotes;
  } catch {
    return fallbackNotes;
  }
}

function saveNotesForSession(notes) {
  try { sessionStorage.setItem(NOTES_SESSION_KEY, JSON.stringify(notes)); }
  catch { /* quota exceeded — fail silently */ }
}

function migrateStyles(input) {
  const arr = Array.isArray(input) ? input : [];
  const mapped = arr.map((s) => {
    switch (s) {
      // Already-migrated keys
      case 'standing':
      case 'judo':
      case 'closed-guard':
      case 'open-guard':
      case 'half-guard':
      case 'butterfly':
      case 'rubber':
      case 'passing':
      case 'pressure':
      case 'pins':
      case 'back-control':
      case 'leg-lock':
      case 'sub-hunting':
        return s;

      // Legacy broad keys
      case 'bottom':
        return 'open-guard';
      case 'wrestling':
        return 'standing';

      // Legacy specific guards
      case 'dlr':
      case 'spider':
      case 'x-guard':
      case 'slx':
        return 'open-guard';

      // Legacy top/passing
      case 'knee-slice':
      case 'float-pass':
        return 'passing';
      case 'side-control':
      case 'mount':
      case 'north-south':
        return 'pins';

      // Legacy leg-lock specifics
      case 'ashi':
      case 'saddle':
        return 'leg-lock';

      default:
        return null;
    }
  }).filter(Boolean);

  return Array.from(new Set(mapped));
}

const BELT_COLORS = {
  white: '#dddddd', blue: '#3498db', purple: '#9b59b6',
  brown: '#8B4513', black: '#111111',
};

const FOCUS_MAP = {
  guard: 'HIP ESCAPE MECHANICS', pass: 'KNEE SLICE FUNDAMENTALS',
  sub: 'ARM LOCK SETUPS', esc: 'BRIDGE & SHRIMP SERIES',
  takedown: 'SINGLE LEG ENTRIES', position: 'SCARF HOLD CONTROL',
};

export function AppProvider({ children }) {
  const saved = loadState();

  const [onboardingDone, setOnboardingDone] = useState(saved?.onboardingDone ?? false);
  const [activeTab,      setActiveTab]      = useState('dash');

  const [nickname,    setNickname]    = useState(saved?.nickname    ?? '');
  const [belt,        setBelt]        = useState(saved?.belt        ?? '');
  const [giPref,      setGiPref]      = useState(saved?.giPref      ?? '');
  const [styles,      setStyles]      = useState(() => migrateStyles(saved?.styles ?? []));
  const [goals,       setGoals]       = useState(saved?.goals       ?? []);
  const [freq,        setFreq]        = useState(saved?.freq        ?? '');
  const [scFreq,      setScFreq]      = useState(saved?.scFreq      ?? '');
  const [bjjDays,     setBjjDays]     = useState(saved?.bjjDays     ?? []);
  const [workoutDays, setWorkoutDays] = useState(saved?.workoutDays ?? []);
  const [comp,        setComp]        = useState(saved?.comp        ?? {
    guard: 3, pass: 3, sub: 3, esc: 3, takedown: 3, position: 3,
  });

  const [sex,      setSex]      = useState(saved?.sex      ?? '');
  const [weight,   setWeight]   = useState(saved?.weight   ?? '');
  const [height,   setHeight]   = useState(saved?.height   ?? '');
  const [bodyType, setBodyType] = useState(saved?.bodyType ?? '');

  const [theme, setInternalTheme] = useState(saved?.theme ?? 'dark');
  const setTheme = (t) => {
    setInternalTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const [notes, setNotes] = useState(() => loadNotesForSession(saved?.notes ?? notesSample));

  // Sessions — seeded from weekPlan, persisted after that
  const [sessions, setSessions] = useState(saved?.sessions ?? seedSessions);
  const addSession = (session) => setSessions(prev => [session, ...prev]);

  const [exerciseDone, setExerciseDone] = useState(saved?.exerciseDone ?? {});
  const toggleExercise = (day, i) => {
    const key = `${day}-${i}`;
    setExerciseDone(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [setLogs, setSetLogs] = useState(saved?.setLogs ?? {});
  const updateSetLog = (dayIdx, exIdx, setIdx, field, value) => {
    const key = `${dayIdx}-${exIdx}-${setIdx}`;
    setSetLogs(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: value } }));
  };
  const getSetLog     = (dayIdx, exIdx, setIdx) => setLogs[`${dayIdx}-${exIdx}-${setIdx}`] || {};
  const getPrevSetLog = (dayIdx, exIdx, setIdx) => {
    if (setIdx === 0) return {};
    return setLogs[`${dayIdx}-${exIdx}-${setIdx - 1}`] || {};
  };

  const finishOnboarding = () => setOnboardingDone(true);
  const addNote          = (note) => setNotes(prev => [{ ...note, id: Date.now() }, ...prev]);
  const updateNote       = (id, updates) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));

  const lowestComp = Object.entries(comp).sort((a, b) => a[1] - b[1])[0][0];
  const focusSkill = FOCUS_MAP[lowestComp];
  const beltColor  = BELT_COLORS[belt] || '#dddddd';

  useEffect(() => {
    saveState({
      onboardingDone,
      nickname, belt, giPref, styles, goals,
      freq, scFreq, bjjDays, workoutDays, comp,
      sex, weight, height, bodyType, theme,
      sessions, exerciseDone, setLogs,
    });
  }, [
    onboardingDone,
    nickname, belt, giPref, styles, goals,
    freq, scFreq, bjjDays, workoutDays, comp,
    sex, weight, height, bodyType, theme,
    sessions, exerciseDone, setLogs,
  ]);

  useEffect(() => {
    saveNotesForSession(notes);
  }, [notes]);

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
      theme, setTheme,
      notes, addNote, updateNote,
      sessions, addSession,
      exerciseDone, toggleExercise,
      setLogs, updateSetLog, getSetLog, getPrevSetLog,
      focusSkill, beltColor, lowestComp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
