import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import RollDetail from './RollDetail';

const G     = '#4ade80';
const AMBER = '#f59e0b';
const RED   = '#ef4444';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function nowLabel() {
  const now    = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return { day: String(now.getDate()), month: months[now.getMonth()] };
}

// ── Camera Picker Sheet ───────────────────────────────────────────────────────
function CameraPickerSheet({ onPick, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end',
      maxWidth: 430, margin: '0 auto',
    }}>
      <div style={{
        width: '100%', background: '#0d0d0d',
        borderRadius: '20px 20px 0 0', padding: '24px 20px 40px',
        border: '1px solid #1f1f1f', borderBottom: 'none',
        animation: 'fadeUp 0.25s ease both',
      }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: G, fontWeight: 700, marginBottom: 6 }}>Start Recording</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: 1, marginBottom: 20 }}>CHOOSE CAMERA</div>

        {[
          { label: 'Rear Camera', sub: 'Best for filming your rolls', icon: '📷', facing: 'environment' },
          { label: 'Front Camera', sub: 'Selfie cam — good for solo drilling', icon: '🤳', facing: 'user' },
        ].map(opt => (
          <div key={opt.facing} onClick={() => onPick(opt.facing)} style={{
            background: '#111', border: '1px solid #1f1f1f', borderRadius: 12,
            padding: '16px 18px', marginBottom: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'border-color 0.18s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'}
          >
            <span style={{ fontSize: 28 }}>{opt.icon}</span>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: 0.5 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{opt.sub}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#333', fontSize: 18 }}>›</span>
          </div>
        ))}

        <button onClick={onDismiss} style={{
          width: '100%', background: 'transparent', border: '1px solid #1f1f1f',
          color: '#444', padding: 12, borderRadius: 10, fontSize: 13,
          fontWeight: 700, cursor: 'pointer', marginTop: 4,
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Analysis Modal ────────────────────────────────────────────────────────────
function AnalysisModal({ duration, rounds, videoBlobUrl, onSave, onDismiss }) {
  const { belt, comp, styles } = useApp();
  const [description,  setDescription]  = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [partner,      setPartner]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const compSummary = Object.entries(comp).map(([k, v]) => `${k}: ${v}/10`).join(', ');
  const styleStr    = styles.length ? styles.join(', ') : 'general';

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

Analyze this as a chess coach would — identify specific moments where the student missed opportunities or made technical errors.

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "title": "short session name",
  "tags": ["${fmt(duration)}", "${rounds} round${rounds !== 1 ? 's' : ''}", "one style tag"],
  "missed": <number>,
  "missedMoves": [
    { "move": "Technique Name", "explain": "Specific moment + why it was available + what to drill." }
  ],
  "timeline": [
    { "time": "M:SS", "move": "What happened", "note": "coaching note", "color": "#2d7a4f or #e8a020 or #c0392b" }
  ]
}

Generate 3–6 missed moves and 6–10 timeline entries. Be specific to BJJ terminology.`;

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
      const data   = await response.json();
      const text   = data.content?.find(b => b.type === 'text')?.text || '';
      const clean  = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      const { day, month } = nowLabel();
      const newSession = {
        id:           Date.now(),
        day, month,
        title:        sessionTitle || parsed.title || 'Open Mat Session',
        tags:         parsed.tags  || [fmt(duration), `${rounds} rounds`],
        missed:       parsed.missed ?? parsed.missedMoves?.length ?? 0,
        partner:      partner || 'Training Partner',
        missedMoves:  parsed.missedMoves || [],
        timeline:     parsed.timeline    || [],
        aiGenerated:  true,
        videoBlobUrl: videoBlobUrl || null,
      };
      onSave(newSession);
    } catch (err) {
      setError('Analysis failed — check your connection and try again.');
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
        width: '100%', background: '#0d0d0d',
        borderRadius: '20px 20px 0 0', padding: '24px 20px 40px',
        border: '1px solid #1f1f1f', borderBottom: 'none',
        animation: 'fadeUp 0.3s ease both',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: G, fontWeight: 700, marginBottom: 4 }}>Session Complete</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: 1 }}>AI ROLL ANALYSIS</div>
          </div>
          <div style={{ background: '#111', border: `1px solid ${G}`, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: G }}>{fmt(duration)}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#444', fontWeight: 700 }}>{rounds} round{rounds !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Video preview */}
        {videoBlobUrl && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: G, fontWeight: 700, marginBottom: 8 }}>📹 Video Captured</div>
            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', border: `1px solid rgba(74,222,128,0.2)`, aspectRatio: '16/9' }}>
              <video
                controls
                src={videoBlobUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ fontSize: 11, color: '#333', marginTop: 6 }}>Playback available this session only.</div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <p style={lbl}>Session Name <span style={{ color: '#333' }}>(optional)</span></p>
          <input style={inp} placeholder="e.g. Evening Open Mat" value={sessionTitle}
            onChange={e => setSessionTitle(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e => e.target.style.borderColor = '#1f1f1f'} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={lbl}>Partner Belt <span style={{ color: '#333' }}>(optional)</span></p>
          <input style={inp} placeholder="e.g. Blue belt, 2 stripe" value={partner}
            onChange={e => setPartner(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e => e.target.style.borderColor = '#1f1f1f'} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={lbl}>Describe Your Roll <span style={{ color: RED }}>*</span></p>
          <textarea style={{ ...inp, minHeight: 110 }}
            placeholder="What happened? e.g. Started from standing, shot a double leg, ended in guard. Tried a triangle at 3 mins but got stacked. Got passed at 7 mins, tapped to RNC..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e => e.target.style.borderColor = '#1f1f1f'} />
          <div style={{ fontSize: 11, color: '#333', marginTop: 6 }}>More detail = better analysis.</div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: RED }}>{error}</div>
        )}

        <button onClick={analyze} disabled={loading} style={{
          width: '100%', background: loading ? '#1a1a1a' : G,
          color: loading ? '#444' : '#000', border: 'none', padding: 14,
          borderRadius: 10, fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 20, letterSpacing: 2,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.18s', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {loading ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid #333', borderTopColor: G, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              ANALYZING WITH AI...
            </>
          ) : '⚡ ANALYZE SESSION'}
        </button>

        <button onClick={onDismiss} style={{
          width: '100%', background: 'transparent', border: '1px solid #1f1f1f',
          color: '#444', padding: 12, borderRadius: 10, fontSize: 13,
          fontWeight: 700, cursor: 'pointer',
        }}>Discard Session</button>
      </div>
    </div>
  );
}

// ── Main Rolls Component ──────────────────────────────────────────────────────
export default function Rolls() {
  const { sessions, addSession } = useApp();

  const [selected,     setSelected]    = useState(null);
  const [phase,        setPhase]       = useState('idle'); // idle | picking | recording | modal
  const [recSeconds,   setRecSeconds]  = useState(0);
  const [rounds,       setRounds]      = useState(1);
  const [savedDur,     setSavedDur]    = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [camError,     setCamError]    = useState('');

  const timerRef    = useRef(null);
  const mediaRef    = useRef(null);   // MediaRecorder
  const chunksRef   = useRef([]);
  const streamRef   = useRef(null);   // MediaStream (to stop tracks)
  const viewfinderRef = useRef(null); // <video> element for live preview

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      stopStream();
    };
  }, []);

  // Attach live stream to viewfinder whenever it mounts
  useEffect(() => {
    if (phase === 'recording' && viewfinderRef.current && streamRef.current) {
      viewfinderRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const handlePickCamera = async (facingMode) => {
    setCamError('');
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        setVideoBlobUrl(url);
        stopStream();
      };

      recorder.start(1000);
      setPhase('recording');
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch (err) {
      setCamError('Camera access denied — check your browser permissions.');
      setPhase('idle');
      console.warn('Camera error:', err);
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setSavedDur(recSeconds);
    setRecSeconds(0);

    if (mediaRef.current?.state !== 'inactive') {
      mediaRef.current.stop(); // triggers onstop → builds blob
    }

    setPhase('modal');
  };

  const handleSave = (session) => {
    addSession(session);
    setPhase('idle');
    setRounds(1);
    setVideoBlobUrl(null);
    setSelected(session);
  };

  const handleDismiss = () => {
    if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    setVideoBlobUrl(null);
    setPhase('idle');
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
            background: '#111', border: '1px solid #1f1f1f', borderRadius: 12,
            padding: '16px', marginBottom: 8, cursor: 'pointer',
            display: 'flex', gap: 14, alignItems: 'flex-start',
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
                {session.videoBlobUrl && (
                  <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, color: AMBER, fontWeight: 700 }}>📹</span>
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

        {/* ── IDLE: Start button ── */}
        {phase === 'idle' && (
          <div style={{ marginTop: 8 }}>
            {camError && (
              <div style={{ fontSize: 11, color: AMBER, marginBottom: 8, padding: '8px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8 }}>
                ⚠ {camError}
              </div>
            )}
            <div onClick={() => setPhase('picking')} style={{
              width: '100%', background: '#111', border: '1px dashed #1f1f1f',
              borderRadius: 12, padding: 20, color: '#444', fontSize: 14,
              fontWeight: 700, cursor: 'pointer', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = '#aaa'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#444'; }}
            >⏺ START RECORDING SESSION</div>
          </div>
        )}

        {/* ── RECORDING: viewfinder + timer + controls ── */}
        {phase === 'recording' && (
          <div style={{ marginTop: 8, border: `1px solid ${G}`, borderRadius: 12, overflow: 'hidden', background: '#000' }}>

            {/* Live viewfinder */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
              <video
                ref={viewfinderRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* REC badge */}
              <div style={{
                position: 'absolute', top: 10, left: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '4px 10px',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: RED, display: 'inline-block', animation: 'pulse 1s ease infinite' }} />
                <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>REC</span>
              </div>
              {/* Live timer overlay */}
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '4px 10px',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: G, letterSpacing: 2,
              }}>{fmt(recSeconds)}</div>
            </div>

            {/* Controls below viewfinder */}
            <div style={{ padding: '14px 16px 16px', background: '#0d0d0d' }}>
              {/* Round counter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#444', fontWeight: 700 }}>Rounds</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setRounds(r => Math.max(1, r - 1))} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', minWidth: 24, textAlign: 'center' }}>{rounds}</span>
                  <button onClick={() => setRounds(r => r + 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              <button onClick={stopRecording} style={{
                width: '100%', background: RED, color: '#fff', border: 'none',
                borderRadius: 10, padding: 14,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: 18, letterSpacing: 2, cursor: 'pointer',
              }}>⏹ STOP & ANALYZE</button>
            </div>
          </div>
        )}
      </div>

      {/* Camera picker sheet */}
      {phase === 'picking' && (
        <CameraPickerSheet
          onPick={handlePickCamera}
          onDismiss={() => setPhase('idle')}
        />
      )}

      {/* RollDetail overlay */}
      {selected && <RollDetail session={selected} onBack={() => setSelected(null)} />}

      {/* Analysis modal */}
      {phase === 'modal' && (
        <AnalysisModal
          duration={savedDur}
          rounds={rounds}
          videoBlobUrl={videoBlobUrl}
          onSave={handleSave}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
