import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import RollDetail from './RollDetail';

const G     = '#4ade80';
const AMBER = '#f59e0b';
const RED   = '#ef4444';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function nowLabel() {
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return { day: String(now.getDate()), month: months[now.getMonth()], dayName: days[now.getDay()] };
}

// ── AI Analysis Modal ─────────────────────────────────────────────────────────
function AnalysisModal({ duration, rounds, onSave, onDismiss }) {
  const { belt, comp, styles } = useApp();
  const [description, setDescription] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [partner, setPartner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const compSummary = Object.entries(comp)
    .map(([k, v]) => `${k}: ${v}/10`)
    .join(', ');
  const styleStr = styles.length ? styles.join(', ') : 'general';

  const analyze = async () => {
    if (!description.trim()) { setError('Please describe what happened in your roll.'); return; }
    setError('');
    setLoading(true);

    const prompt = `You are an expert BJJ coach analyzing a student's rolling session. The student is a ${belt || 'white'} belt with these self-rated competency scores: ${compSummary}. Their preferred style is: ${styleStr}.

Session details:
- Duration: ${fmt(duration)}
- Rounds: ${rounds}
- Partner: ${partner || 'unknown belt'}
- Student's description: "${description}"

Analyze this session as a chess coach would — identify the specific moments where the student missed opportunities or made mistakes that led to bad outcomes.

Respond ONLY with a valid JSON object, no markdown, no explanation. Use this exact shape:
{
  "title": "short session name (e.g. Evening Open Mat)",
  "tags": ["${fmt(duration)}", "${rounds} round${rounds !== 1 ? 's' : ''}", "one style tag"],
  "missed": <number of missed opportunities>,
  "missedMoves": [
    {
      "move": "Technique Name",
      "explain": "Specific moment + why it was available + what to drill. Be direct and coach-like. Include a timestamp estimate if possible."
    }
  ],
  "timeline": [
    {
      "time": "M:SS",
      "move": "What happened",
      "note": "brief coaching note",
      "color": "#2d7a4f for success, #e8a020 for neutral/near-miss, #c0392b for mistake/tap"
    }
  ]
}

Generate 3-6 missed moves and 6-10 timeline entries. Be specific to BJJ technique names. Make timeline reflect the described events realistically.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.find(b => b.type === 'text')?.text || '';
      // Strip any accidental markdown fences
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      const { day, month } = nowLabel();
      const newSession = {
        id: Date.now(),
        day,
        month,
        title: sessionTitle || parsed.title || 'Open Mat Session',
        tags: parsed.tags || [fmt(duration), `${rounds} rounds`],
        missed: parsed.missed || parsed.missedMoves?.length || 0,
        partner: partner || 'Training Partner',
        missedMoves: parsed.missedMoves || [],
        timeline: parsed.timeline || [],
        aiGenerated: true,
      };

      onSave(newSession);
    } catch (err) {
      setError('Analysis failed. Check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', background: '#111', border: '1px solid #1f1f1f',
    borderRadius: 10, padding: '12px 14px', color: '#fff',
    fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: 500,
    outline: 'none', resize: 'none', transition: 'border-color 0.18s',
    boxSizing: 'border-box',
  };
  const lbl = { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 8, fontWeight: 700 };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      zIndex: 100, display: 'flex', alignItems: 'flex-end',
      maxWidth: 430, margin: '0 auto',
    }}>
      <div style={{
        width: '100%', background: '#0d0d0d', borderRadius: '20px 20px 0 0',
        padding: '24px 20px 40px', border: '1px solid #1f1f1f',
        borderBottom: 'none', animation: 'fadeUp 0.3s ease both',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: G, fontWeight: 700, marginBottom: 4 }}>
              Session Complete
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: 1 }}>
              AI ROLL ANALYSIS
            </div>
          </div>
          <div style={{
            background: '#111', border: `1px solid ${G}`,
            borderRadius: 8, padding: '8px 12px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: G }}>{fmt(duration)}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#444', fontWeight: 700 }}>{rounds} round{rounds !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Session title */}
        <div style={{ marginBottom: 14 }}>
          <p style={lbl}>Session Name <span style={{ color: '#333' }}>(optional)</span></p>
          <input style={inp} placeholder="e.g. Evening Open Mat" value={sessionTitle}
            onChange={e => setSessionTitle(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e => e.target.style.borderColor = '#1f1f1f'}
          />
        </div>

        {/* Partner */}
        <div style={{ marginBottom: 14 }}>
          <p style={lbl}>Partner Belt <span style={{ color: '#333' }}>(optional)</span></p>
          <input style={inp} placeholder="e.g. Blue belt, 2 stripe" value={partner}
            onChange={e => setPartner(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e => e.target.style.borderColor = '#1f1f1f'}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <p style={lbl}>Describe Your Roll <span style={{ color: RED }}>*</span></p>
          <textarea style={{ ...inp, minHeight: 110 }}
            placeholder="What happened? e.g. Started from standing, shot a double leg, ended up in guard. Tried a triangle around 3 mins but they stacked me. Got passed at 7 mins, tapped to an RNC. Second round I pulled guard and went for a kimura..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e => e.target.style.borderColor = '#1f1f1f'}
          />
          <div style={{ fontSize: 11, color: '#333', marginTop: 6 }}>
            The more detail you give, the better the analysis. Include positions, attempts, taps, and resets.
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: RED }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <button onClick={analyze} disabled={loading} style={{
          width: '100%', background: loading ? '#1a1a1a' : G,
          color: loading ? '#444' : '#000', border: 'none',
          padding: 14, borderRadius: 10,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 20, letterSpacing: 2,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.18s', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {loading ? (
            <>
              <span style={{
                width: 16, height: 16, border: `2px solid #333`,
                borderTopColor: G, borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
              ANALYZING WITH AI...
            </>
          ) : '⚡ ANALYZE SESSION'}
        </button>

        <button onClick={onDismiss} style={{
          width: '100%', background: 'transparent',
          border: '1px solid #1f1f1f', color: '#444',
          padding: 12, borderRadius: 10, fontSize: 13,
          fontWeight: 700, cursor: 'pointer',
        }}>Discard Session</button>
      </div>
    </div>
  );
}

// ── Main Rolls Component ──────────────────────────────────────────────────────
export default function Rolls() {
  const { sessions, addSession } = useApp();
  const [selected,    setSelected]   = useState(null);
  const [recording,   setRecording]  = useState(false);
  const [recSeconds,  setRecSeconds] = useState(0);
  const [rounds,      setRounds]     = useState(1);
  const [showModal,   setShowModal]  = useState(false);
  const [savedDur,    setSavedDur]   = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startRecording = () => {
    setRecording(true);
    setRecSeconds(0);
    timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
    setSavedDur(recSeconds);
    setShowModal(true);
    setRecSeconds(0);
  };

  const handleSave = (session) => {
    addSession(session);
    setShowModal(false);
    setRounds(1);
    // Open the new session immediately
    setSelected(session);
  };

  const handleDismiss = () => {
    setShowModal(false);
    setRounds(1);
    setSavedDur(0);
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ padding: '20px 20px 120px', overflowY: 'auto', height: '100%' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 6, fontWeight: 700 }}>Session History</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 30, color: '#fff', marginBottom: 20, letterSpacing: 1 }}>ROLL ANALYSIS</div>

        {/* Session list */}
        {sessions.map(session => (
          <div key={session.id} onClick={() => setSelected(session)} style={{
            background: '#111', border: '1px solid #1f1f1f',
            borderRadius: 12, padding: '16px', marginBottom: 8,
            cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start',
            transition: 'border-color 0.18s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'}
          >
            <div style={{ textAlign: 'center', minWidth: 38 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, lineHeight: 1, color: G }}>{session.day}</div>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#444', fontWeight: 700 }}>{session.month}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: 0.5 }}>{session.title}</div>
                {session.aiGenerated && (
                  <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 6px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 4, color: G, fontWeight: 700 }}>AI</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                {session.tags.map(t => (
                  <span key={t} style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', background: '#1a1a1a', borderRadius: 4, color: '#555', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: AMBER, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>⚡ {session.missed} missed opportunities</div>
            </div>
            <span style={{ color: '#333', fontSize: 18, alignSelf: 'center' }}>›</span>
          </div>
        ))}

        {/* Record button */}
        {!recording ? (
          <div style={{ marginTop: 8 }}>
            <div onClick={startRecording} style={{
              width: '100%', background: '#111', border: '1px dashed #1f1f1f',
              borderRadius: 12, padding: 20, color: '#444',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = '#aaa'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#444'; }}
            >⏺ START RECORDING SESSION</div>
          </div>
        ) : (
          <div style={{
            marginTop: 8, background: 'rgba(74,222,128,0.04)',
            border: `1px solid ${G}`, borderRadius: 12, padding: 20,
            animation: 'pulse 1.2s ease-in-out infinite',
          }}>
            {/* Live timer */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, color: G, letterSpacing: 2 }}>{fmt(recSeconds)}</div>
              <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#444', fontWeight: 700, marginTop: 4 }}>Recording</div>
            </div>

            {/* Round counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#444', fontWeight: 700 }}>Rounds</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setRounds(r => Math.max(1, r - 1))} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', minWidth: 24, textAlign: 'center' }}>{rounds}</span>
                <button onClick={() => setRounds(r => r + 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            <button onClick={stopRecording} style={{
              width: '100%', background: RED, color: '#fff',
              border: 'none', borderRadius: 10, padding: 14,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 18, letterSpacing: 2, cursor: 'pointer',
            }}>⏹ STOP & ANALYZE</button>
          </div>
        )}
      </div>

      {selected && <RollDetail session={selected} onBack={() => setSelected(null)} />}

      {showModal && (
        <AnalysisModal
          duration={savedDur}
          rounds={rounds}
          onSave={handleSave}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
