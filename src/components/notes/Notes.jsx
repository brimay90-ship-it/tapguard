import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import NoteEditor from './NoteEditor';

const G = '#0BF571';
const feelColors = { lost: '#FF3B5C', okay: '#F0A020', good: G, locked: '#3b82f6' };
const feelLabels = { lost: 'Struggling', okay: 'Felt okay', good: 'Clicking', locked: 'Locked in' };

// Notes each get a 'category' field ('Techniques' | 'Drills' | 'Sparring')
// Legacy notes without a category fall under 'Techniques' by default
const FILTERS = ['All', 'Techniques', 'Drills', 'Sparring'];

export default function Notes() {
  const { notes } = useApp();
  const [editorOpen,   setEditorOpen]   = useState(false);
  const [selectedNote, setSelectedNote] = useState(null); // null = new note
  const [filter,       setFilter]       = useState('All');

  const openNew = () => {
    setSelectedNote(null);
    setEditorOpen(true);
  };

  const openNote = (note) => {
    setSelectedNote(note);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedNote(null);
  };

  // Filter by category — legacy notes default to 'Techniques'
  const filtered = filter === 'All'
    ? notes
    : notes.filter(n => (n.category || 'Techniques') === filter);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ padding: '20px 20px 20px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, color: 'var(--text-pri)', letterSpacing: 1 }}>TRAINING JOURNAL</div>
            <button 
              onClick={openNew} 
              style={{ width:44, height:44, borderRadius:'50%', background:G, border:'none', color:'#000', fontSize:28, fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 4px 12px ${G}44`, transition:'transform 0.2s', paddingBottom: 2, flexShrink: 0 }}
              onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
            >+</button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {FILTERS.map(f => (
            <div key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 50,
              border: `1px solid ${filter === f ? G : 'var(--border)'}`,
              background: filter === f ? G+'11' : 'var(--bg-total)',
              color: filter === f ? 'var(--text-pri)' : 'var(--text-sec)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
            }}>{f}</div>
          ))}
        </div>

        {/* Legacy add note button removed, replaced by + button */}

        {/* Note cards — each opens in editor for viewing/editing */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-sec)', opacity: 0.3, fontSize: 13, marginTop: 32 }}>
            No {filter !== 'All' ? filter.toLowerCase() : ''} notes yet.
          </div>
        )}

        {filtered.map(note => (
          <div key={note.id} onClick={() => openNote(note)} className="liquid-glass" style={{
            borderRadius:20, padding:'20px', marginBottom:12,
            cursor:'pointer', transition:'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            border:'1px solid var(--border)'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom:10 }}>
              <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color:G, fontWeight:800 }}>{note.date}</div>
              {note.category && (
                <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 10px', background: 'var(--bg-total)', border:'1px solid var(--border)', borderRadius: 20, color: 'var(--text-sec)', opacity: 0.6, fontWeight:800 }}>
                  {note.category}
                </div>
              )}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: 'var(--text-pri)', marginBottom: 12, letterSpacing: 0.5 }}>{note.title.toUpperCase()}</div>
            
            {/* Category-specific summary content */}
            <div style={{ marginBottom: 16 }}>
              {(!note.category || note.category === 'Techniques') && (
                <div style={{ display: 'flex', gap:6, flexWrap: 'wrap' }}>
                  {note.moves && note.moves.map(m => <span key={m} style={{ fontSize: 10, padding: '4px 10px', background: 'var(--bg-total)', border:'1px solid var(--border)', borderRadius: 20, color: 'var(--text-sec)', opacity: 0.8, fontWeight: 700, letterSpacing:0.3 }}>{m}</span>)}
                  {(!note.moves || note.moves.length === 0) && <span style={{ fontSize: 12, color: 'var(--text-sec)', opacity: 0.4, fontStyle: 'italic' }}>Curriculum overview...</span>}
                </div>
              )}

              {note.category === 'Drills' && (
                <div>
                  <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    {note.rounds || 'Drill Session'}
                  </div>
                  <div style={{ display: 'flex', gap:6, flexWrap: 'wrap' }}>
                    {note.drills && note.drills.map(d => <span key={d} style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius: 20, color: '#3b82f6', fontWeight: 700, letterSpacing:0.3 }}>{d}</span>)}
                  </div>
                </div>
              )}

              {note.category === 'Sparring' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 10, padding: '3px 8px', background: 'var(--bg-total)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-pri)', fontWeight: 800 }}>
                      vs {note.opponentRank} Belt
                    </div>
                    {note.rounds && <div style={{ fontSize: 11, color: '#f0a020', fontWeight: 800 }}>{note.rounds}</div>}
                  </div>
                  <div style={{ display: 'flex', gap:6, flexWrap: 'wrap' }}>
                    {note.opponentStyle && note.opponentStyle.map(s => <span key={s} style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(240,160,32,0.08)', border:'1px solid rgba(240,160,32,0.2)', borderRadius: 20, color: '#f0a020', fontWeight: 700, letterSpacing:0.3 }}>{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            {note.feel && (
              <div style={{ display: 'flex', alignItems: 'center', gap:8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: feelColors[note.feel] || 'var(--border)', display: 'inline-block', boxShadow:`0 0 10px ${feelColors[note.feel] || 'transparent'}` }} />
                <span style={{ fontSize: 12, color: 'var(--text-sec)', opacity: 0.5, fontWeight: 700, textTransform:'uppercase', letterSpacing:1 }}>{feelLabels[note.feel] || note.feel}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {editorOpen && <NoteEditor note={selectedNote} onClose={closeEditor} />}
    </div>
  );
}
