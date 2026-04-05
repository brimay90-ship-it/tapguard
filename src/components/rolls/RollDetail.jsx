import { createPortal } from 'react-dom';

const G     = '#0BF571';
const AMBER = '#F0A020';
const RED   = '#FF3B5C';

export default function RollDetail({ session, onBack }) {
  if (!session) return null;

  const rollCount = parseInt(session.tags?.[1]) || 1;
  const rolls     = Array.from({ length: rollCount }, (_, i) => ({
    label: `Roll ${i + 1}`, duration: session.tags?.[0] || '',
  }));

  const hasVideo   = !!session.videoBlobUrl;
  const hasYouTube = !!session.youtubeEmbed;

  const overlay = (
    <div className="overlay-enter" style={{
      position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.96)',
      overflowY: 'auto', padding: '20px 20px 80px', zIndex: 9999,
    }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
        color: '#444', cursor: 'pointer', background: 'none', border: 'none',
        marginBottom: 20, fontWeight: 700, transition: 'color 0.18s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
        onMouseLeave={e => e.currentTarget.style.color = '#444'}
      >← Back</button>

      {/* Title */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, color: '#fff', marginBottom: 4, letterSpacing: 1 }}>
        {session.title.toUpperCase()}
      </div>
      <div style={{ fontSize: 12, color: '#444', marginBottom: 8, fontWeight: 600 }}>
        {session.month} {session.day} · {session.tags?.[0]} · {session.tags?.[1]}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 24 }}>
        {session.tags?.map(t => (
          <span key={t} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', background: '#111', borderRadius: 4, color: '#444', fontWeight: 600 }}>{t}</span>
        ))}
        {session.aiGenerated && (
          <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 4, color: G, fontWeight: 700 }}>AI Analysis</span>
        )}
      </div>

      {/* Roll headers */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 10, fontWeight: 700 }}>RECORDED ROLLS</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {rolls.map((roll, i) => (
            <div key={i} className="liquid-glass" style={{
              background: i === 0 ? 'rgba(11,245,113,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? G : 'rgba(255,255,255,0.14)'}`,
              borderRadius: 12, padding: '12px 18px', flex:1, textAlign:'center'
            }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: i === 0 ? G : '#fff', letterSpacing:0.5 }}>{roll.label.toUpperCase()}</div>
              <div style={{ fontSize:11, color: '#444', marginTop:4, fontWeight:800, letterSpacing:1 }}>{roll.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Missed moves */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: AMBER, marginBottom: 12, fontWeight: 700 }}>⚡ MISSED OPPORTUNITIES — CHESS ANALYSIS</div>
        {session.missedMoves?.map((m, i) => (
          <div key={i} className="card-enter" style={{
            background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 8,
            animationDelay: `${i * 0.08}s`,
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4, letterSpacing: 0.5 }}>{m.move}</div>
            <div style={{ fontSize: 13, color: '#666', fontWeight: 400, lineHeight: 1.5 }}>{m.explain}</div>
          </div>
        ))}
      </div>

      {/* Session recording */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 10, fontWeight: 700 }}>SESSION RECORDING</div>

        {/* Recorded or imported video blob */}
        {hasVideo && (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid rgba(74,222,128,0.2)`, background: '#080808' }}>
            <video controls src={session.videoBlobUrl} style={{ width: '100%', display: 'block', maxHeight: 240, objectFit: 'cover' }} />
            <div style={{ padding: '10px 14px', background: '#080808', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: AMBER, fontSize: 13 }}>⚠</span>
              <span style={{ fontSize: 11, color: '#333' }}>Video available this session only — clears on refresh.</span>
            </div>
          </div>
        )}

        {/* YouTube embed */}
        {hasYouTube && !hasVideo && (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid rgba(239,68,68,0.2)`, background: '#080808' }}>
            <div style={{ aspectRatio: '16/9' }}>
              <iframe
                width="100%" height="100%"
                src={session.youtubeEmbed}
                title="Roll footage"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block' }}
              />
            </div>
            <div style={{ padding: '10px 14px', background: '#080808', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: RED, fontSize: 13 }}>▶</span>
              <span style={{ fontSize: 11, color: '#555' }}>YouTube · linked footage</span>
            </div>
          </div>
        )}

        {/* No recording */}
        {!hasVideo && !hasYouTube && (
          <div style={{
            background: '#111', border: '1px solid #1f1f1f',
            borderRadius: 12, padding: '24px 18px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📹</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: '#333', marginBottom: 6 }}>No Recording</div>
            <div style={{ fontSize: 12, color: '#2A2D32', lineHeight: 1.6 }}>
              Record, import, or link a YouTube video when starting your next session.
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 8, fontWeight: 700 }}>SESSION TIMELINE</div>
        {session.timeline?.map((tl, i) => (
          <div key={i} className="card-enter" style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '12px 0', borderBottom: '1px solid #111',
            animationDelay: `${i * 0.05}s`,
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, color: '#333', minWidth: 36, letterSpacing: 1 }}>{tl.time}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{tl.move}</div>
              <div style={{ fontSize: 11, color: '#444', fontWeight: 400 }}>{tl.note}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: tl.color, marginTop: 5, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
