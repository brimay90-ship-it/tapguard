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
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-sec)', opacity: 0.6, marginBottom: 6, fontWeight: 700 }}>Training Journal</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 30, color: 'var(--text-pri)', marginBottom: 16, letterSpacing: 1 }}>CLASS NOTES</div>

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

        {/* Add new note button */}
        <div onClick={openNew} className="liquid-glass" style={{
          width: '100%', border: '1px dashed var(--glass-border)',
          borderRadius: 20, padding: 24, color: 'var(--text-sec)', opacity: 0.6, fontSize: 13,
          fontWeight: 800, cursor: 'pointer', textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: 20, transition: 'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
          letterSpacing: 2
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = 'var(--text-pri)'; e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.opacity = '0.6'; }}
        >⚡ ADD TODAY'S CLASS NOTES</div>

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
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: 'var(--text-pri)', marginBottom:12, letterSpacing: 0.5 }}>{note.title.toUpperCase()}</div>
            <div style={{ display: 'flex', gap:6, flexWrap: 'wrap', marginBottom:12 }}>
              {note.moves.map(m => <span key={m} style={{ fontSize: 10, padding: '4px 10px', background: 'var(--bg-total)', border:'1px solid var(--border)', borderRadius: 20, color: 'var(--text-sec)', opacity: 0.8, fontWeight: 700, letterSpacing:0.3 }}>{m}</span>)}
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
