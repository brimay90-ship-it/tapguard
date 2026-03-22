import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [activeTab, setActiveTab] = useState('dash');

  // Onboarding
  const [nickname, setNickname]   = useState('');
  const [belt, setBelt]           = useState('');
  const [giPref, setGiPref]       = useState('');
  const [styles, setStyles]       = useState([]);
  const [goals, setGoals]         = useState([]);
  const [freq, setFreq]           = useState('');
  const [scFreq, setScFreq]       = useState('');
  const [bjjDays, setBjjDays]     = useState([]);
  const [workoutDays, setWorkoutDays] = useState([]);
  const [comp, setComp]           = useState({
    guard: 3, pass: 3, sub: 3, esc: 3, takedown: 3, position: 3,
  });

  // Physical profile
  const [sex, setSex]           = useState('');
  const [weight, setWeight]     = useState('');
  const [height, setHeight]     = useState('');
  const [bodyType, setBodyType] = useState('');

  // Notes
  const [notes, setNotes] = useState([
    { id: 0, date: 'Mar 14 · Thursday', title: 'De La Riva Guard Entries',  moves: ['DLR Hook', 'Berimbolo', 'X-Guard Entry'], feel: 'okay', note: 'DLR hook needs more reps.' },
    { id: 1, date: 'Mar 11 · Monday',   title: 'Knee Slice Pass Series',    moves: ['Knee Slice', 'Leg Weave', 'Torreando'],   feel: 'good', note: 'Clicking now.' },
    { id: 2, date: 'Mar 7 · Friday',    title: 'Back Takes & RNC',          moves: ['Seatbelt', 'Hook Insertion', 'RNC'],      feel: 'lost', note: 'Struggling with seatbelt.' },
  ]);

  // Training — exercise completion
  const [exerciseDone, setExerciseDone] = useState({});
  const toggleExercise = (day, i) => {
    const key = `${day}-${i}`;
    setExerciseDone(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Training — set logs: { 'dayIdx-exIdx-setIdx': { reps: '', weight: '' } }
  const [setLogs, setSetLogs] = useState({});
  const updateSetLog = (dayIdx, exIdx, setIdx, field, value) => {
    const key = `${dayIdx}-${exIdx}-${setIdx}`;
    setSetLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };
  const getSetLog = (dayIdx, exIdx, setIdx) => {
    return setLogs[`${dayIdx}-${exIdx}-${setIdx}`] || {};
  };
  const getPrevSetLog = (dayIdx, exIdx, setIdx) => {
    if (setIdx === 0) return {};
    return setLogs[`${dayIdx}-${exIdx}-${setIdx - 1}`] || {};
  };

  const finishOnboarding = () => setOnboardingDone(true);
  const addNote = (note) => setNotes(prev => [{ ...note, id: Date.now() }, ...prev]);

  const beltColors = {
    beginner: '#dddddd', intermediate: '#3498db',
    advanced: '#9b59b6', expert: '#c0392b',
  };
  const focusMap = {
    guard: 'HIP ESCAPE MECHANICS', pass: 'KNEE SLICE FUNDAMENTALS',
    sub: 'ARM LOCK SETUPS', esc: 'BRIDGE & SHRIMP SERIES',
    takedown: 'SINGLE LEG ENTRIES', position: 'SCARF HOLD CONTROL',
  };

  const lowestComp = Object.entries(comp).sort((a, b) => a[1] - b[1])[0][0];
  const focusSkill = focusMap[lowestComp];
  const beltColor  = beltColors[belt] || '#dddddd';

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
      notes, addNote,
      exerciseDone, toggleExercise,
      setLogs, updateSetLog, getSetLog, getPrevSetLog,
      focusSkill, beltColor, lowestComp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
