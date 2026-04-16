import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Onboarding from './components/onboarding/Onboarding';
import Dashboard from './components/dashboard/Dashboard';
import BJJFlowBuilder from './components/matrix/BJJFlowBuilder';
import Rolls from './components/rolls/Rolls';
import Notes from './components/notes/Notes';
import Training from './components/training/Training';
import HamburgerMenu from './components/menu/HamburgerMenu';

// ── Brand tokens (from Figma ColorSystem.tsx) ─────────────────────────────────
export const t = {
  bg:     '#080808', // Deep Void
  bg2:    '#111214', // Carbon
  bg3:    '#1A1C20', // Graphite
  border: '#2A2D32', // Steel
  smoke:  '#5A5D65', // Placeholder / muted
  mist:   '#8A8D96', // Secondary text
  cloud:  '#C8CAD0', // Body text
  white:  '#FFFFFF',
  green:  '#0BF571', // Guard Green
  gold:   '#F0A020', // Submission Gold
  ice:    '#00D4FF', // Ice Blue
  red:    '#FF3B5C', // Submit Red
};

// ── Nav with SVG icons (Reactive) ─────────────────────────────────────────────
const NAV = [
  {
    id: 'dash', label: 'HOME',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill={active ? 'var(--accent)' : 'var(--text-sec)'}>
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    id: 'matrix', label: 'MATRIX',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill={active ? 'var(--accent)' : 'var(--text-sec)'}>
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'roll', label: 'ROLLS',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill={active ? 'var(--accent)' : 'var(--text-sec)'}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'notes', label: 'NOTES',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 20 20" fill={active ? 'var(--accent)' : 'var(--text-sec)'}>
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'training', label: 'WORKOUT',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'var(--accent)' : 'var(--text-sec)'}>
        <path d="M21 9h-3V6a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4H10V6a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v3H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h4v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3h3a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z" />
      </svg>
    ),
  },
];

// ── Wordmark (Reactive) ──────────────────────────────────────────────────────
function Wordmark({ size = 20 }) {
  return (
    <div style={{ fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
      <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', display: 'block' }}>GROUND</span>
      <span style={{ color: 'var(--text-pri)', fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', display: 'block' }}>WORK</span>
      <div style={{ color: 'var(--text-sec)', opacity: 0.3, fontSize: size * 0.28, letterSpacing: '0.22em', fontWeight: 500, marginTop: 2 }}>
        BJJ TECHNIQUE & CONDITIONING
      </div>
    </div>
  );
}

// ── Splash screen ─────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  const [fade, setFade] = useState(false);

  useEffect(() => { 
    // Start fading out after 2.8 seconds
    const fadeTimer = setTimeout(() => setFade(true), 2800); 
    // Unmount completely after the 0.5s fade finishes (3.3 seconds total)
    const doneTimer = setTimeout(onDone, 3300); 
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); }; 
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity: fade ? 0 : 1, transition: 'opacity 0.5s ease-out'
    }}>
      {/* Background Video */}
      <video 
        src="/Splash.mp4" 
        autoPlay 
        muted 
        playsInline 
        loop
        style={{ position: 'absolute', inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
      />
      
      {/* Dark overlay for contrast */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />

      {/* Glow backdrop */}
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(11,245,113,0.12) 0%, transparent 70%)',
        zIndex: 2,
      }} />

      {/* Logo */}
      <div style={{ animation: 'logoScale 0.6s ease forwards', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        <img src="/stacked (2).svg" alt="GroundWork" style={{ width: 220, height: 'auto' }} />
      </div>

      {/* Loading bar */}
      <div style={{
        position: 'absolute', bottom: 56,
        width: 100, height: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden',
        zIndex: 2,
      }}>
        <div style={{
          height: '100%', background: 'var(--accent)', borderRadius: 2,
          animation: 'splashBar 2.4s ease forwards',
        }} />
      </div>
    </div>
  );
}

// ── Main app shell ────────────────────────────────────────────────────────────
function MainApp() {
  const { activeTab, setActiveTab, belt, beltColor, onboardingDone } = useApp();
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
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-page)', maxWidth: 430, margin: '0 auto', overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header Background Gradient Layer */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, 
        height: 80, zIndex: 109,
        background: 'var(--bg-page)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        pointerEvents: 'none', 
      }}/>

      {/* Header Content Layer */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, 
        height: 55, zIndex: 110, padding: '0 20px',
        pointerEvents: 'none', 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', height: '100%', maxWidth: 430, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/icon (2).svg" alt="GroundWork" style={{ height: 28, width: 'auto' }} />
          </div>
          {/* Hamburger menu */}
          <HamburgerMenu />
        </div>
      </div>

      {/* Content Area - Centralized Scroll Container */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        overflowY: activeTab === 'matrix' ? 'hidden' : 'auto', 
        WebkitOverflowScrolling: 'touch',
        padding: activeTab === 'matrix' ? '55px 0 0' : '55px 0 180px', // Clear header always
      }}>
        {NAV.map(tab => (
          <div key={tab.id} style={{
            display: activeTab === tab.id ? 'flex' : 'none',
            flexDirection: 'column',
            height: tab.id === 'matrix' ? '100%' : 'auto',
            animation: activeTab === tab.id ? 'tabEnter 0.28s ease both' : 'none',
            position: 'relative',
          }}>
            {tab.id === 'dash'     && <Dashboard key={tabKey} />}
            {tab.id === 'matrix'   && <BJJFlowBuilder />}
            {tab.id === 'roll'     && <Rolls />}
            {tab.id === 'notes'    && <Notes />}
            {tab.id === 'training' && <Training />}
          </div>
        ))}
      </div>

      {/* Bottom Nav - iOS 26 Liquid Glass Pill */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        height: 68,
        zIndex: 100,
        borderRadius: 34,
        width: 'auto',
        minWidth: 320,
        pointerEvents: 'none' // Allow scrolling through the container
      }} className="liquid-glass-pill">
        
        <div style={{ position:'relative', display:'flex', width:'100%', height:'100%', padding:'0 8px', alignItems:'center', pointerEvents: 'none' }}>
          {/* Animated Background Pill */}
          {(() => {
            const idx = NAV.findIndex(t => t.id === activeTab);
            const offsets = { dash: 4, matrix: 2, roll: 0, notes: -2, training: -4 };
            const currentOffset = offsets[activeTab] || 0;
            return (
              <div className="tab-active-pill" style={{
                width: `calc(100% / ${NAV.length} - 4px)`,
                left: `calc(${(idx * (100 / NAV.length))}% + 2px + ${currentOffset}px)`,
                height: 52,
                pointerEvents: 'none'
              }} />
            );
          })()}

          {NAV.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} onClick={() => handleTabSwitch(tab.id)} style={{
                flex: 1, height: 56,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                borderRadius: 28,
                margin: '0 2px',
                padding: '0 8px',
                minWidth: 58,
                zIndex: 1,
                pointerEvents: 'auto' // Re-enable pointer events for buttons
              }}>
                <div style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                }}>
                  {tab.icon(isActive)}
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase',
                    fontWeight: 800,
                    color: isActive ? 'var(--text-pri)' : 'var(--text-sec)',
                    transition: 'color 0.2s',
                    marginTop: 2
                  }}>{tab.label}</span>
                </div>
              </div>
            );
          })}
        </div>
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
