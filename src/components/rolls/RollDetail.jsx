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
      position: 'fixed', inset: 0, background: 'var(--bg-page)',
      overflowY: 'auto', padding: '20px 20px 80px', zIndex: 9999,
    }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
        color: 'var(--text-sec)', cursor: 'pointer', background: 'none', border: 'none',
        marginBottom: 20, fontWeight: 700, transition: 'color 0.18s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-pri)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sec)'}
      >← Back</button>

      {/* Title */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, color: 'var(--text-pri)', marginBottom: 4, letterSpacing: 1 }}>
        {session.title.toUpperCase()}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-sec)', opacity: 0.6, marginBottom: 8, fontWeight: 600 }}>
        {session.month} {session.day} · {session.tags?.[0]} · {session.tags?.[1]}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 24 }}>
        {session.tags?.map(t => (
          <span key={t} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', background: 'var(--bg-total)', borderRadius: 4, color: 'var(--text-sec)', fontWeight: 600 }}>{t}</span>
        ))}
        {session.aiGenerated && (
          <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', background: G+'11', border: `1px solid ${G}33`, borderRadius: 4, color: G, fontWeight: 700 }}>AI Analysis</span>
        )}
      </div>

      {/* Roll headers */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-sec)', opacity:0.6, marginBottom: 10, fontWeight: 700 }}>RECORDED ROLLS</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {rolls.map((roll, i) => (
            <div key={i} className="liquid-glass" style={{
              background: i === 0 ? G+'11' : 'var(--glass-bg)',
              border: `1px solid ${i === 0 ? G : 'var(--glass-border)'}`,
              borderRadius: 12, padding: '12px 18px', flex:1, textAlign:'center'
            }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: i === 0 ? G : 'var(--text-pri)', letterSpacing:0.5 }}>{roll.label.toUpperCase()}</div>
              <div style={{ fontSize:11, color: 'var(--text-sec)', opacity:0.6, marginTop:4, fontWeight:800, letterSpacing:1 }}>{roll.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Missed moves */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: AMBER, marginBottom: 12, fontWeight: 700 }}>⚡ MISSED OPPORTUNITIES — CHESS ANALYSIS</div>
        {session.missedMoves?.map((m, i) => (
          <div key={i} className="card-enter" style={{
            background: AMBER+'11', border: `1px solid ${AMBER}33`,
            borderRadius: 10, padding: '14px 16px', marginBottom: 8,
            animationDelay: `${i * 0.08}s`,
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-pri)', marginBottom: 4, letterSpacing: 0.5 }}>{m.move}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', opacity:0.8, fontWeight: 400, lineHeight: 1.5 }}>{m.explain}</div>
          </div>
        ))}
      </div>

      {/* Session recording */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-sec)', opacity:0.6, marginBottom: 10, fontWeight: 700 }}>SESSION RECORDING</div>

        {/* Recorded or imported video blob */}
        {hasVideo && (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${G}33`, background: 'var(--bg-total)' }}>
            <video controls src={session.videoBlobUrl} style={{ width: '100%', display: 'block', maxHeight: 240, objectFit: 'cover' }} />
            <div style={{ padding: '10px 14px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: AMBER, fontSize: 13 }}>⚠</span>
              <span style={{ fontSize: 11, color: 'var(--text-sec)', opacity:0.7 }}>Video available this session only — clears on refresh.</span>
            </div>
          </div>
        )}

        {/* YouTube embed */}
        {hasYouTube && !hasVideo && (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${RED}33`, background: 'var(--bg-total)' }}>
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
            <div style={{ padding: '10px 14px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: RED, fontSize: 13 }}>▶</span>
              <span style={{ fontSize: 11, color: 'var(--text-sec)', opacity:0.7 }}>YouTube · linked footage</span>
            </div>
          </div>
        )}

        {/* No recording */}
        {!hasVideo && !hasYouTube && (
          <div style={{
            background: 'var(--bg-total)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '24px 18px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📹</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--text-sec)', opacity:0.4, marginBottom: 6 }}>No Recording</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', opacity:0.3, lineHeight: 1.6 }}>
              Record, import, or link a YouTube video when starting your next session.
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform:'uppercase', color: 'var(--text-sec)', opacity:0.6, marginBottom: 8, fontWeight: 700 }}>SESSION TIMELINE</div>
        {session.timeline?.map((tl, i) => (
          <div key={i} className="card-enter" style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '12px 0', borderBottom: '1px solid var(--border)',
            animationDelay: `${i * 0.05}s`,
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, color: 'var(--text-sec)', opacity:0.4, minWidth: 36, letterSpacing: 1 }}>{tl.time}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-pri)', marginBottom: 2 }}>{tl.move}</div>
              <div style={{ fontSize: 11, color: 'var(--text-sec)', opacity:0.7, fontWeight: 400 }}>{tl.note}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: tl.color, marginTop: 5, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
