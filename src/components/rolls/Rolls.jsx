import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import RollDetail from './RollDetail';

const G     = '#0BF571';
const AMBER = '#F0A020';
const RED   = '#FF3B5C';
const BLUE  = '#3b82f6';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function nowLabel() {
  const now    = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return { day: String(now.getDate()), month: months[now.getMonth()] };
}

function parseYouTubeId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtu.be'))    return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch { /* fall through */ }
  const match = url.trim().match(/^[a-zA-Z0-9_-]{11}$/);
  return match ? match[0] : null;
}

// ── Camera Picker ─────────────────────────────────────────────────────────────
function CameraPickerSheet({ onPick, onDismiss }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'var(--overlay-bg)', zIndex:200, display:'flex', alignItems:'flex-end', maxWidth:430, margin:'0 auto' }}>
      <div style={{ width:'100%', background:'var(--bg-card)', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px', border:'1px solid var(--border)', borderBottom:'none', animation:'fadeUp 0.25s ease both' }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:G, fontWeight:700, marginBottom:6 }}>Start Recording</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, color:'var(--text-pri)', letterSpacing:1, marginBottom:20 }}>CHOOSE CAMERA</div>
        {/* Option cards */}
        {[
          { label:'Rear Camera',  sub:'Best for filming your rolls',      icon:'📷', facing:'environment' },
          { label:'Front Camera', sub:'Selfie cam — good for solo drill', icon:'🤳', facing:'user' },
        ].map(opt => (
          <div key={opt.facing} onClick={() => onPick(opt.facing)} style={{ background:'var(--bg-total)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px', marginBottom:10, cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'border-color 0.18s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ fontSize:28 }}>{opt.icon}</span>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:'var(--text-pri)', letterSpacing:0.5 }}>{opt.label}</div>
              <div style={{ fontSize:12, color:'var(--text-sec)', marginTop:2, opacity:0.6 }}>{opt.sub}</div>
            </div>
            <span style={{ marginLeft:'auto', color:'var(--border)', fontSize:18 }}>›</span>
          </div>
        ))}
        <button onClick={onDismiss} style={{ width:'100%', background:'transparent', border:'1px solid var(--border)', color:'var(--text-sec)', padding:12, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', marginTop:4 }}>Cancel</button>
      </div>
    </div>
  );
}

// ── YouTube Link Sheet ────────────────────────────────────────────────────────
function YouTubeLinkSheet({ onConfirm, onDismiss }) {
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');

  const handleConfirm = () => {
    const id = parseYouTubeId(url);
    if (!id) { setErr("Couldn't recognise that URL — paste a full YouTube link or video ID."); return; }
    onConfirm(id);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--overlay-bg)', zIndex:200, display:'flex', alignItems:'flex-end', maxWidth:430, margin:'0 auto' }}>
      <div style={{ width:'100%', background:'var(--bg-card)', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px', border:'1px solid var(--border)', borderBottom:'none', animation:'fadeUp 0.25s ease both' }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:BLUE, fontWeight:700, marginBottom:6 }}>YouTube</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, color:'var(--text-pri)', letterSpacing:1, marginBottom:6 }}>PASTE VIDEO LINK</div>
        <div style={{ fontSize:13, color:'var(--text-sec)', marginBottom:20, lineHeight:1.5, opacity:0.7 }}>Paste a link to your YouTube roll and we'll embed it in the session for review.</div>
        <input
          autoFocus value={url}
          onChange={e => { setUrl(e.target.value); setErr(''); }}
          placeholder="https://youtube.com/watch?v=..."
          style={{ width:'100%', background:'var(--bg-total)', border:`1px solid ${err ? RED : 'var(--border)'}`, borderRadius:10, padding:'13px 14px', color:'var(--text-pri)', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, outline:'none', boxSizing:'border-box', transition:'border-color 0.18s', marginBottom: err ? 8 : 16 }}
          onFocus={e => e.target.style.borderColor = BLUE}
          onBlur={e  => e.target.style.borderColor = err ? RED : 'var(--border)'}
        />
        {err && <div style={{ fontSize:12, color:RED, marginBottom:14 }}>{err}</div>}
        <button onClick={handleConfirm} style={{ width:'100%', background:BLUE, color:'#fff', border:'none', padding:14, borderRadius:10, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, letterSpacing:2, cursor:'pointer', marginBottom:10 }}>USE THIS VIDEO →</button>
        <button onClick={onDismiss} style={{ width:'100%', background:'transparent', border:'1px solid var(--border)', color:'var(--text-sec)', padding:12, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Analysis Modal ────────────────────────────────────────────────────────────
function AnalysisModal({ duration, rounds, mediaSource, onSave, onDismiss }) {
  const { belt, comp, styles, nickname } = useApp();
  const [sessionTitle, setSessionTitle] = useState('');
  const [partner,      setPartner]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const compSummary   = Object.entries(comp).map(([k, v]) => `${k}: ${v}/10`).join(', ');
  const styleStr      = styles.length ? styles.join(', ') : 'general';
  const durationLabel = duration > 0 ? fmt(duration) : 'Imported';
  const weakest       = Object.entries(comp).sort((a, b) => a[1] - b[1])[0][0];

  const analyze = async () => {
    setError('');
    setLoading(true);

    const prompt = `You are an expert BJJ coach generating a realistic post-session analysis for a student.

Student profile:
- Name: ${nickname || 'the student'}
- Belt: ${belt || 'white'} belt
- Style preference: ${styleStr}
- Self-rated competency scores: ${compSummary}
- Weakest area: ${weakest}

Session details:
- Duration: ${durationLabel}
- Rounds: ${rounds}
- Partner: ${partner || 'unknown belt'}

Based on this profile, generate a realistic and specific analysis of what likely happened in a typical roll for this student. Focus on their weakest areas. Be direct and coach-like — name specific techniques, timestamps, and corrections.

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "title": "short descriptive session name",
  "tags": ["${durationLabel}", "${rounds} round${rounds !== 1 ? 's' : ''}", "one BJJ style tag"],
  "missed": <integer>,
  "missedMoves": [
    { "move": "Exact Technique Name", "explain": "Specific moment with estimated timestamp + why it was available + drill to fix it." }
  ],
  "timeline": [
    { "time": "M:SS", "move": "What happened", "note": "one-line coaching note", "color": "#2d7a4f for success, #e8a020 for neutral, #c0392b for mistake or tap" }
  ]
}

Generate 3–5 missed moves and 7–10 timeline entries. Use real BJJ terminology.`;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-3-5',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API ${response.status}: ${errBody}`);
      }

      const data   = await response.json();
      const text   = data.content?.find(b => b.type === 'text')?.text || '';
      const clean  = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      const { day, month } = nowLabel();
      onSave({
        id:          Date.now(),
        day, month,
        title:       sessionTitle || parsed.title || 'Open Mat Session',
        tags:        parsed.tags  || [durationLabel, `${rounds} rounds`],
        missed:      parsed.missed ?? parsed.missedMoves?.length ?? 0,
        partner:     partner || 'Training Partner',
        missedMoves: parsed.missedMoves || [],
        timeline:    parsed.timeline    || [],
        aiGenerated: true,
        mediaSource: mediaSource || null,
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inp = { width:'100%', background:'var(--bg-total)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', color:'var(--text-pri)', fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:500, outline:'none', transition:'border-color 0.18s', boxSizing:'border-box' };
  const lbl = { fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-sec)', opacity:0.6, marginBottom:8, fontWeight:700 };

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--overlay-bg)', zIndex:100, display:'flex', alignItems:'flex-end', maxWidth:430, margin:'0 auto' }}>
      <div style={{ width:'100%', background:'var(--bg-card)', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px', border:'1px solid var(--border)', borderBottom:'none', animation:'fadeUp 0.3s ease both', maxHeight:'92vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:G, fontWeight:700, marginBottom:4 }}>
              {mediaSource?.type === 'youtube' ? 'YouTube Linked' : mediaSource?.type === 'blob' && duration === 0 ? 'Video Imported' : 'Session Complete'}
            </div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'var(--text-pri)', letterSpacing:1 }}>AI ROLL ANALYSIS</div>
          </div>
          <div style={{ background:'var(--bg-total)', border:`1px solid ${G}`, borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, color:G }}>{durationLabel}</div>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--text-sec)', opacity:0.6, fontWeight:700 }}>{rounds} round{rounds !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Profile pill — shows what AI is using */}
        <div style={{ background:'var(--accent)11', border:`1px solid ${G}33`, borderRadius:10, padding:'12px 14px', marginBottom:18 }}>
          <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:G, fontWeight:700, marginBottom:6 }}>Analyzing as</div>
          <div style={{ fontSize:13, color:'var(--text-sec)', lineHeight:1.6 }}>
            <span style={{ color:'var(--text-pri)', fontWeight:600 }}>{belt ? belt.charAt(0).toUpperCase()+belt.slice(1) : 'White'} belt</span>
            {' · '}Weakest: <span style={{ color:AMBER, fontWeight:600 }}>{weakest}</span>
            {' · '}Style: {styleStr}
          </div>
        </div>

        {/* Media preview */}
        {mediaSource?.type === 'blob' && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:G, fontWeight:700, marginBottom:8 }}>📹 Video Ready</div>
            <div style={{ borderRadius:12, overflow:'hidden', background:'#080808', border:'1px solid rgba(74,222,128,0.2)', aspectRatio:'16/9' }}>
              <video controls src={mediaSource.url} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
            <div style={{ fontSize:11, color:'#333', marginTop:6 }}>Playback available this session only.</div>
          </div>
        )}

        {mediaSource?.type === 'youtube' && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:BLUE, fontWeight:700, marginBottom:8 }}>▶ YouTube Linked</div>
            <div style={{ borderRadius:12, overflow:'hidden', background:'#080808', border:'1px solid rgba(59,130,246,0.2)', aspectRatio:'16/9' }}>
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${mediaSource.id}`} title="Session Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display:'block' }} />
            </div>
          </div>
        )}

        {/* Optional fields */}
        <div style={{ marginBottom:14 }}>
          <p style={lbl}>Session Name <span style={{ color:'#333' }}>(optional)</span></p>
          <input style={inp} placeholder="e.g. Evening Open Mat" value={sessionTitle}
            onChange={e => setSessionTitle(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e  => e.target.style.borderColor = '#1f1f1f'} />
        </div>

        <div style={{ marginBottom:20 }}>
          <p style={lbl}>Partner Belt <span style={{ color:'var(--text-sec)', opacity:0.4 }}>(optional)</span></p>
          <input style={inp} placeholder="e.g. Blue belt, 2 stripe" value={partner}
            onChange={e => setPartner(e.target.value)}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13, color:RED }}>{error}</div>
        )}

        <button onClick={analyze} disabled={loading} style={{ width:'100%', background:loading ? '#1A1C20' : G, color:loading ? '#444' : '#000', border:'none', padding:14, borderRadius:10, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, letterSpacing:2, cursor:loading ? 'not-allowed' : 'pointer', transition:'all 0.18s', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          {loading ? (
            <><span style={{ width:16, height:16, border:'2px solid #333', borderTopColor:G, borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />ANALYZING WITH AI...</>
          ) : '⚡ ANALYZE SESSION'}
        </button>

        <button onClick={onDismiss} style={{ width:'100%', background:'transparent', border:'1px solid var(--border)', color:'var(--text-sec)', padding:12, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>Discard</button>
      </div>
    </div>
  );
}

// ── Main Rolls Component ──────────────────────────────────────────────────────
export default function Rolls() {
  const { sessions, addSession } = useApp();

  const [selected,     setSelected]    = useState(null);
  const [phase,        setPhase]       = useState('idle'); // idle | picking | recording | youtube | modal
  const [recSeconds,   setRecSeconds]  = useState(0);
  const [rounds,       setRounds]      = useState(1);
  const [savedDur,     setSavedDur]    = useState(0);
  const [mediaSource,  setMediaSource] = useState(null);
  const [camError,     setCamError]    = useState('');
  const [showMenu,     setShowMenu]    = useState(false);

  const timerRef      = useRef(null);
  const mediaRef      = useRef(null);
  const chunksRef     = useRef([]);
  const streamRef     = useRef(null);
  const viewfinderRef = useRef(null);
  const fileInputRef  = useRef(null);

  useEffect(() => () => { clearInterval(timerRef.current); stopStream(); }, []);

  useEffect(() => {
    if (phase === 'recording' && viewfinderRef.current && streamRef.current) {
      viewfinderRef.current.srcObject = streamRef.current;
    }
  }, [phase]);

  const stopStream = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; };

  const handlePickCamera = async (facingMode) => {
    setCamError('');
    chunksRef.current = [];
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setMediaSource({ type: 'blob', url: URL.createObjectURL(blob) });
        stopStream();
      };
      recorder.start(1000);
      setPhase('recording');
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch (err) {
      setCamError('Camera access denied — check your browser permissions.');
      setPhase('idle');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setSavedDur(recSeconds);
    setRecSeconds(0);
    if (mediaRef.current?.state !== 'inactive') mediaRef.current.stop();
    setPhase('modal');
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaSource({ type: 'blob', url: URL.createObjectURL(file) });
    setSavedDur(0);
    setPhase('modal');
    e.target.value = '';
  };

  const handleYouTubeConfirm = (videoId) => {
    setMediaSource({ type: 'youtube', id: videoId });
    setSavedDur(0);
    setPhase('modal');
  };

  const handleSave = (session) => {
    addSession(session);
    setPhase('idle');
    setRounds(1);
    setMediaSource(null);
    setSelected(session);
  };

  const handleDismiss = () => {
    if (mediaSource?.type === 'blob') URL.revokeObjectURL(mediaSource.url);
    setMediaSource(null);
    setPhase('idle');
    setRounds(1);
    setSavedDur(0);
  };

  return (
    <div style={{ position:'relative' }}>
      <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" onChange={handleFileImport} style={{ display:'none' }} />

      <div style={{ padding:'20px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:30, color:'var(--text-pri)', letterSpacing:1 }}>ROLL ANALYSIS</div>
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              style={{ width:44, height:44, borderRadius:'50%', background:G, border:'none', color:'#000', fontSize:28, fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 4px 12px ${G}44`, transition:'transform 0.2s', paddingBottom: 2 }}
              onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
            >+</button>
            {showMenu && (
              <>
                <div style={{ position:'fixed', inset:0, zIndex:9 }} onClick={() => setShowMenu(false)} />
                <div style={{ position:'absolute', top:52, right:0, width:190, background:'var(--bg-card)', border:`1px solid ${G}44`, borderRadius:14, padding:6, zIndex:10, boxShadow:`0 8px 24px rgba(0,0,0,0.8)`, animation: 'fadeUp 0.15s ease both' }}>
                  <div onClick={() => { setPhase('picking'); setShowMenu(false); }} style={{ padding:'12px 14px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all 0.2s', borderRadius:10, color:'var(--text-pri)' }} onMouseEnter={e => { e.currentTarget.style.background='var(--glass-bg)'; e.currentTarget.style.transform='translateX(4px)'; }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateX(0)'; }}>
                    <span style={{ color:G, fontSize:18 }}>⏺</span> Record Session
                  </div>
                  <div onClick={() => { fileInputRef.current.click(); setShowMenu(false); }} style={{ padding:'12px 14px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all 0.2s', borderRadius:10, color:'var(--text-pri)' }} onMouseEnter={e => { e.currentTarget.style.background='var(--glass-bg)'; e.currentTarget.style.transform='translateX(4px)'; }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateX(0)'; }}>
                    <span style={{ color:AMBER, fontSize:18 }}>📂</span> Import Video
                  </div>
                  <div onClick={() => { setPhase('youtube'); setShowMenu(false); }} style={{ padding:'12px 14px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all 0.2s', borderRadius:10, color:'var(--text-pri)' }} onMouseEnter={e => { e.currentTarget.style.background='var(--glass-bg)'; e.currentTarget.style.transform='translateX(4px)'; }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateX(0)'; }}>
                    <span style={{ color:BLUE, fontSize:18 }}>▶</span> YouTube Link
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ fontSize:14, letterSpacing:2, textTransform:'uppercase', color:'var(--text-sec)', fontWeight:800, marginBottom:16, borderBottom:'1px solid var(--border)', paddingBottom:8 }}>Roll log</div>

        {camError && <div style={{ fontSize:11, color:AMBER, marginBottom:16, padding:'8px 12px', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:8 }}>⚠ {camError}</div>}

        {sessions.map(session => (
          <div key={session.id} onClick={() => setSelected(session)} className="liquid-glass" style={{
            borderRadius:20, padding:'20px', marginBottom:12,
            cursor:'pointer', display:'flex', gap:14, alignItems:'flex-start',
            transition:'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            border:'1px solid var(--border)'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ textAlign:'center', minWidth:42 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:32, lineHeight:1, color:G }}>{session.day}</div>
              <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-sec)', opacity:0.6, fontWeight:800 }}>{session.month}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, color:'var(--text-pri)', letterSpacing:0.5 }}>{session.title.toUpperCase()}</div>
                {session.aiGenerated && <span style={{ fontSize:9, letterSpacing:1.5, textTransform:'uppercase', padding:'3px 8px', background:G+'11', border:`1px solid ${G}33`, borderRadius:20, color:G, fontWeight:800 }}>AI ANALYZED</span>}
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                {session.tags.map(t => <span key={t} style={{ fontSize:10, letterSpacing:1, textTransform:'uppercase', padding:'3px 10px', background:'var(--glass-bg)', border:'1px solid var(--glass-border)', borderRadius:20, color:'var(--text-sec)', opacity:0.8, fontWeight:700 }}>{t}</span>)}
              </div>
              <div style={{ fontSize:13, color:AMBER, display:'flex', alignItems:'center', gap:6, fontWeight:700, letterSpacing:0.3 }}>
                <span style={{fontSize:16}}>⚡</span> {session.missed} MISSED OPPORTUNITIES
              </div>
            </div>
            <span style={{ color:'var(--border)', fontSize:22, alignSelf:'center' }}>›</span>
          </div>
        ))}

        {/* Idle state moved to dropdown */}

        {/* ── RECORDING: live viewfinder ── */}
        {phase === 'recording' && (
          <div style={{ marginTop:8, border:`1px solid ${G}`, borderRadius:12, overflow:'hidden', background:'#080808' }}>
            <div style={{ position:'relative', aspectRatio:'16/9', background:'#080808' }}>
              <video ref={viewfinderRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              <div style={{ position:'absolute', top:10, left:10, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.7)', borderRadius:6, padding:'4px 10px' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:RED, display:'inline-block', animation:'pulse 1s ease infinite' }} />
                <span style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#fff', fontWeight:700 }}>REC</span>
              </div>
              <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.7)', borderRadius:6, padding:'4px 10px', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, color:G, letterSpacing:2 }}>{fmt(recSeconds)}</div>
            </div>
            <div style={{ padding:'14px 16px 16px', background:'#080808' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:14 }}>
                <div style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#444', fontWeight:700 }}>Rounds</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <button onClick={() => setRounds(r => Math.max(1, r - 1))} style={{ width:32, height:32, borderRadius:'50%', background:'#111', border:'1px solid #2A2D32', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'#fff', minWidth:24, textAlign:'center' }}>{rounds}</span>
                  <button onClick={() => setRounds(r => r + 1)} style={{ width:32, height:32, borderRadius:'50%', background:'#111', border:'1px solid #2A2D32', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                </div>
              </div>
              <button onClick={stopRecording} style={{ width:'100%', background:RED, color:'#fff', border:'none', borderRadius:10, padding:14, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, letterSpacing:2, cursor:'pointer' }}>⏹ STOP & ANALYZE</button>
            </div>
          </div>
        )}
      </div>

      {phase === 'picking'  && <CameraPickerSheet onPick={handlePickCamera} onDismiss={() => setPhase('idle')} />}
      {phase === 'youtube'  && <YouTubeLinkSheet onConfirm={handleYouTubeConfirm} onDismiss={() => setPhase('idle')} />}
      {selected             && <RollDetail session={selected} onBack={() => setSelected(null)} />}
      {phase === 'modal'    && <AnalysisModal duration={savedDur} rounds={rounds} mediaSource={mediaSource} onSave={handleSave} onDismiss={handleDismiss} />}
    </div>
  );
}
