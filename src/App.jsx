import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Onboarding from './components/onboarding/Onboarding';
import Dashboard from './components/dashboard/Dashboard';
import Rolls from './components/rolls/Rolls';
import Notes from './components/notes/Notes';
import Training from './components/training/Training';

// Design tokens
export const t = {
  bg:       '#000000',
  bg2:      '#111111',
  bg3:      '#1a1a1a',
  bg4:      '#222222',
  green:    '#4ade80',
  greenDim: '#166534',
  greenMid: '#22c55e',
  white:    '#ffffff',
  gray1:    '#aaaaaa',
  gray2:    '#666666',
  gray3:    '#333333',
  gray4:    '#222222',
  border:   '#2a2a2a',
  red:      '#ef4444',
  amber:    '#f59e0b',
};

const NAV = [
  { id: 'dash',     icon: '⬡', label: 'HOME' },
  { id: 'roll',     icon: '▶', label: 'ROLLS' },
  { id: 'notes',    icon: '✎', label: 'NOTES' },
  { id: 'training', icon: '◈', label: 'WORKOUT' },
];

function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 5500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999, animation: 'splashFade 5.5s ease forwards',
    }}>
      <div style={{ animation: 'logoScale 2s ease forwards', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 72, height: 72, background: '#4ade80', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 34, color: '#000', letterSpacing: 1,
        }}>TG</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800, fontSize: 36, letterSpacing: 6, color: '#fff',
        }}>TAPGUARD</div>
      </div>
      <div style={{
        fontSize: 14, letterSpacing: 4, textTransform: 'uppercase',
        color: '#444', marginTop: 10, fontWeight: 500, textAlign: 'center',
      }}>
        <span style={{ animation: 'taglineFade 1s ease 0.5s forwards', opacity: 0, display: 'block' }}>
          Train Smarter...
        </span>
        <span style={{ animation: 'taglineFade 1s ease 2s forwards', opacity: 0, display: 'block' }}>
          Tap Less.
        </span>
      </div>
      <div style={{
        position: 'absolute', bottom: 56,
        width: 100, height: 2, background: '#222', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: '#4ade80', borderRadius: 2,
          animation: 'tabEnter 5s ease forwards', width: '100%',
        }} />
      </div>
    </div>
  );
}

function MainApp() {
  const { activeTab, setActiveTab, belt, beltColor, onboardingDone, nickname } = useApp();
  const [tabKey, setTabKey] = useState(0);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabKey(k => k + 1);
  };

  if (!onboardingDone) return <Onboarding />;

  const beltLabel = belt
    ? belt.charAt(0).toUpperCase() + belt.slice(1)
    : 'Beginner';

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#000', maxWidth: 430, margin: '0 auto', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: '#4ade80', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 16, color: '#000',
            }}>TG</div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#fff',
            }}>TAPGUARD</span>
          </div>
          <div style={{
            fontSize: 11, letterSpacing: 1, fontWeight: 600,
            padding: '4px 12px', borderRadius: 50,
            background: '#111', border: '1px solid #2a2a2a',
            color: '#4ade80', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: beltColor, display: 'inline-block' }} />
            {beltLabel}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {NAV.map(tab => (
          <div key={tab.id} style={{
            display: activeTab === tab.id ? 'block' : 'none',
            height: '100%', position: 'relative',
            animation: activeTab === tab.id ? 'tabEnter 0.28s ease both' : 'none',
          }}>
            {tab.id === 'dash'     && <Dashboard key={tabKey} />}
            {tab.id === 'roll'     && <Rolls />}
            {tab.id === 'notes'    && <Notes />}
            {tab.id === 'training' && <Training />}
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div style={{
        flexShrink: 0, background: '#111',
        borderTop: '1px solid #1f1f1f',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 10px)',
      }}>
        {NAV.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <div key={tab.id} onClick={() => handleTabSwitch(tab.id)} style={{
              flex: 1, padding: '12px 4px 8px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, cursor: 'pointer',
            }}>
              <span style={{
                fontSize: 18, transition: 'transform 0.2s',
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                display: 'inline-block',
                color: isActive ? '#4ade80' : '#444',
              }}>{tab.icon}</span>
              <span style={{
                fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
                fontWeight: 700,
                color: isActive ? '#4ade80' : '#444',
                transition: 'color 0.2s',
              }}>{tab.label}</span>
              {isActive && (
                <div style={{
                  width: 20, height: 2, borderRadius: 1,
                  background: '#4ade80', marginTop: 1,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <AppProvider>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <MainApp />
    </AppProvider>
  );
}
