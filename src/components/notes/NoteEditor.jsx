import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';

const G = '#0BF571';
const FEELS = [
  { val: 'lost',   emoji: '😵', label: 'Lost'      },
  { val: 'okay',   emoji: '😐', label: 'Okay'      },
  { val: 'good',   emoji: '💪', label: 'Good'      },
  { val: 'locked', emoji: '🔒', label: 'Locked In' },
];
const CATEGORIES = ['Techniques', 'Drills', 'Sparring'];

// note prop: existing note object (edit mode) or null (new note)
export default function NoteEditor({ note: existingNote, onClose }) {
  const { addNote, updateNote } = useApp();
  const isEditing = !!existingNote;

  const [title,        setTitle]        = useState(existingNote?.title        ?? '');
  const [notesCovered, setNotesCovered] = useState(existingNote?.notesCovered || existingNote?.note || '');
  const [notesExtra,   setNotesExtra]   = useState(existingNote?.notesExtra   || '');
  const [moves,    setMoves]    = useState(existingNote?.moves    ?? []);
  const [mi,       setMi]       = useState(''); // Move input
  const [feel,     setFeel]     = useState(existingNote?.feel     ?? null);
  const [category, setCategory] = useState(existingNote?.category ?? 'Techniques');

  // New Fields for Drills & Sparring
  const [drills,        setDrills]        = useState(existingNote?.drills        ?? []);
  const [di,            setDi]            = useState(''); // Drill input
  const [rounds,        setRounds]        = useState(existingNote?.rounds        ?? '');
  const [opponentRank,  setOpponentRank]  = useState(existingNote?.opponentRank  ?? 'Blue');
  const [opponentStyle, setOpponentStyle] = useState(existingNote?.opponentStyle ?? []);
  const [si,            setSi]            = useState(''); // Style input
  const [sparringNotes, setSparringNotes] = useState(existingNote?.sparringNotes ?? '');

  const addTag = (val, setter) => {
    if (!val.trim()) return;
    setter(p => [...p, val.trim()]);
  };
  const remTag = (i, setter) => setter(p => p.filter((_, idx) => idx !== i));

  const save = () => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const now    = new Date();
    const date   = `${months[now.getMonth()]} ${now.getDate()} · ${days[now.getDay()]}`;

    const data = {
      title: title || 'Untitled',
      date: isEditing ? existingNote.date : date,
      moves,
      feel,
      category,
      notesCovered,
      notesExtra,
      // Category specific fields
      drills,
      rounds,
      opponentRank,
      opponentStyle,
      sparringNotes
    };

    if (isEditing) {
      updateNote(existingNote.id, data);
    } else {
      addNote(data);
    }
    onClose();
  };

  const inp = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--bg-total)', border: '1px solid var(--border)', borderRadius: 16,
    padding: '14px 18px', color: 'var(--text-pri)', fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15, fontWeight: 600, outline: 'none', resize: 'none',
    transition: 'all 0.3s ease',
  };
  const lbl = { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: G, marginBottom: 12, fontWeight: 800 };

  const overlay = (
    <div className="overlay-enter" style={{ 
      position: 'fixed', inset: 0, 
      background: 'var(--bg-page)', 
      overflowY: 'auto', padding: '20px 20px 100px', zIndex: 9999,
    }}>
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-sec)', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', marginBottom: 20, fontWeight: 800, transition: 'color 0.18s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-pri)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sec)'}
      >← BACK</button>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, color: 'var(--text-pri)', marginBottom: 24, letterSpacing: 1, animation: 'fadeUp 0.35s ease both' }}>
        {isEditing ? 'EDIT JOURNAL' : 'NEW JOURNAL ENTRY'}
      </div>

      {/* Title */}
      <div style={{ animationDelay: '0s' }}>
        <p style={lbl}>Session Title</p>
        <input style={inp} placeholder="e.g. Wednesday Night No-Gi" value={title} onChange={e => setTitle(e.target.value)}
          onFocus={e => e.target.style.borderColor = G}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Category Segmented Picker */}
      <div style={{ marginTop: 24 }}>
        <p style={lbl}>Session Type</p>
        <div style={{ 
          display: 'flex', background: 'var(--bg-total)', borderRadius: 14, 
          padding: 4, border: '1px solid var(--border)', position: 'relative'
        }}>
          {CATEGORIES.map(c => {
            const active = category === c;
            return (
              <div key={c} onClick={() => setCategory(c)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, textAlign: 'center',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                color: active ? '#000' : 'var(--text-sec)',
                background: active ? G : 'transparent',
                boxShadow: active ? `0 4px 12px ${G}33` : 'none',
                zIndex: 1,
              }}>{c}</div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Fields Based on Category */}
      <div style={{ marginTop: 24, padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        
        {category === 'Techniques' && (
          <div className="fade-enter">
            <p style={lbl}>What Was Covered</p>
            <textarea style={inp} rows={3} placeholder="What technique, concept or drill was the focus?" value={notesCovered} onChange={e => setNotesCovered(e.target.value)}
              onFocus={e => e.target.style.borderColor = G}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            <div style={{ marginTop: 20 }}>
              <p style={lbl}>Moves Practiced</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {moves.map((m, i) => (
                  <div key={i} style={{ padding: '6px 12px', background: G+'11', border: `1px solid ${G}33`, borderRadius: 50, fontSize: 12, fontWeight: 600, color: 'var(--text-pri)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {m}<span onClick={() => remTag(i, setMoves)} style={{ color: G, cursor: 'pointer', fontSize: 16 }}>×</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} placeholder="Add a move..." value={mi} onChange={e => setMi(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (addTag(mi, setMoves), setMi(''))}
                  onFocus={e => e.target.style.borderColor = G}
                />
                <button onClick={() => (addTag(mi, setMoves), setMi(''))} style={{ background: G, border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 900 }}>+</button>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <p style={lbl}>Extra Notes</p>
              <textarea style={inp} rows={3} placeholder="Partner feedback, specific struggles, etc." value={notesExtra} onChange={e => setNotesExtra(e.target.value)}
                onFocus={e => e.target.style.borderColor = G}
              />
            </div>
          </div>
        )}

        {category === 'Drills' && (
          <div className="fade-enter">
            <p style={lbl}>Drill Types</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {drills.map((d, i) => (
                <div key={i} style={{ padding: '6px 12px', background: '#3b82f611', border: '1px solid #3b82f633', borderRadius: 50, fontSize: 12, fontWeight: 600, color: 'var(--text-pri)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {d}<span onClick={() => remTag(i, setDrills)} style={{ color: '#3b82f6', cursor: 'pointer', fontSize: 16 }}>×</span>
                </div>
              ))}
              {drills.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-sec)', opacity: 0.5 }}>e.g. Resistance, Speed, Positional...</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="Add drill type..." value={di} onChange={e => setDi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (addTag(di, setDrills), setDi(''))}
                onFocus={e => e.target.style.borderColor = G}
              />
              <button onClick={() => (addTag(di, setDrills), setDi(''))} style={{ background: G, border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 900 }}>+</button>
            </div>

            <div style={{ marginTop: 20 }}>
              <p style={lbl}>Rounds / Duration</p>
              <input style={inp} placeholder="e.g. 5 rounds of 3 mins" value={rounds} onChange={e => setRounds(e.target.value)}
                onFocus={e => e.target.style.borderColor = G}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <p style={lbl}>Focus Points</p>
              <textarea style={inp} rows={4} placeholder="What were you trying to improve? (e.g. keeping elbows tight, weight distribution)" value={notesCovered} onChange={e => setNotesCovered(e.target.value)}
                onFocus={e => e.target.style.borderColor = G}
              />
            </div>
          </div>
        )}

        {category === 'Sparring' && (
          <div className="fade-enter">
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <p style={lbl}>Opponent Rank</p>
                <select style={{ ...inp, appearance: 'none' }} value={opponentRank} onChange={e => setOpponentRank(e.target.value)}>
                  {['White', 'Blue', 'Purple', 'Brown', 'Black'].map(r => <option key={r} value={r}>{r} Belt</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <p style={lbl}>Rounds</p>
                <input style={inp} placeholder="e.g. 6 rounds" value={rounds} onChange={e => setRounds(e.target.value)} />
              </div>
            </div>

            <p style={lbl}>Opponent Styles</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {opponentStyle.map((s, i) => (
                <div key={i} style={{ padding: '6px 12px', background: '#f0a02011', border: '1px solid #f0a02033', borderRadius: 50, fontSize: 12, fontWeight: 600, color: 'var(--text-pri)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {s}<span onClick={() => remTag(i, setOpponentStyle)} style={{ color: '#f0a020', cursor: 'pointer', fontSize: 16 }}>×</span>
                </div>
              ))}
              {opponentStyle.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-sec)', opacity: 0.5 }}>e.g. Aggressive, Flexible, Heavy...</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="Add style tag..." value={si} onChange={e => setSi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (addTag(si, setOpponentStyle), setSi(''))}
                onFocus={e => e.target.style.borderColor = G}
              />
              <button onClick={() => (addTag(si, setOpponentStyle), setSi(''))} style={{ background: G, border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 900 }}>+</button>
            </div>

            <p style={lbl}>Sparring Breakdown</p>
            <textarea style={inp} rows={4} placeholder="Key takeaways from the rounds. Who did you roll with? What subs did you hit/miss?" value={sparringNotes} onChange={e => setSparringNotes(e.target.value)}
              onFocus={e => e.target.style.borderColor = G}
            />
          </div>
        )}
      </div>

      {/* Feel */}
      <div style={{ marginTop: 0, marginBottom: 24 }}>
        <p style={lbl}>How Did It Feel?</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {FEELS.map(f => (
            <div key={f.val} onClick={() => setFeel(f.val)} style={{
              flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center',
              border: `1px solid ${feel === f.val ? G : 'var(--border)'}`,
              background: feel === f.val ? G+'11' : 'var(--bg-total)',
              cursor: 'pointer', transition: 'all 0.18s',
              transform: feel === f.val ? 'scale(1.04)' : 'scale(1)',
            }}>
              <div style={{ fontSize: 18 }}>{f.emoji}</div>
              <div style={{ fontSize: 10, color: 'var(--text-sec)', opacity: 0.6, marginTop: 4, fontWeight: 700, letterSpacing: 0.5 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div style={{ marginTop: 0 }}>
        <button onClick={save} style={{ width: '100%', background: G, color: '#000', border: 'none', padding: 14, borderRadius: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: 2, cursor: 'pointer', transition: 'opacity 0.18s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >{isEditing ? 'SAVE CHANGES' : 'SAVE ENTRY'}</button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
