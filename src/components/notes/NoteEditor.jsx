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

  const [title,    setTitle]    = useState(existingNote?.title    ?? '');
  const [body,     setBody]     = useState(existingNote?.note     ?? '');
  const [moves,    setMoves]    = useState(existingNote?.moves    ?? []);
  const [mi,       setMi]       = useState('');
  const [feel,     setFeel]     = useState(existingNote?.feel     ?? null);
  const [category, setCategory] = useState(existingNote?.category ?? 'Techniques');

  const addMove = () => {
    if (!mi.trim()) return;
    setMoves(p => [...p, mi.trim()]);
    setMi('');
  };
  const remMove = (i) => setMoves(p => p.filter((_, idx) => idx !== i));

  const save = () => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const now    = new Date();
    const date   = `${months[now.getMonth()]} ${now.getDate()} · ${days[now.getDay()]}`;

    if (isEditing) {
      updateNote(existingNote.id, { title: title || 'Untitled', note: body, moves, feel, category });
    } else {
      addNote({ title: title || 'Untitled', date, moves, feel, note: body, category });
    }
    onClose();
  };

  const inp = {
    width: '100%', boxSizing: 'border-box',
    background: '#111', border: '1px solid #2a2a2a', borderRadius: 16,
    padding: '14px 18px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15, fontWeight: 600, outline: 'none', resize: 'none',
    transition: 'all 0.3s ease',
  };
  const lbl = { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: G, marginBottom: 12, fontWeight: 800 };

  const overlay = (
    <div className="overlay-enter" style={{ 
      position: 'fixed', inset: 0, 
      background: 'rgba(8,8,8,0.92)', 
      overflowY: 'auto', padding: '20px 20px 100px', zIndex: 9999,
    }}>
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666', cursor: 'pointer', background: 'none', border: 'none', marginBottom: 20, fontWeight: 800, transition: 'color 0.18s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = '#666'}
      >← BACK</button>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, color: '#fff', marginBottom: 24, letterSpacing: 1, animation: 'fadeUp 0.35s ease both' }}>
        {isEditing ? 'EDIT NOTES' : 'NEW CLASS NOTES'}
      </div>

      {/* Title */}
      <div style={{ animationDelay: '0s' }}>
        <p style={lbl}>Lesson Title</p>
        <input style={inp} placeholder="e.g. Open Guard Workshop" value={title} onChange={e => setTitle(e.target.value)}
          onFocus={e => e.target.style.borderColor = G}
          onBlur={e => e.target.style.borderColor = '#1f1f1f'}
        />
      </div>

      {/* Category */}
      <div style={{ marginTop: 16 }}>
        <p style={lbl}>Category</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {CATEGORIES.map(c => (
            <div key={c} onClick={() => setCategory(c)} style={{
              flex: 1, padding: '9px 8px', borderRadius: 10, textAlign: 'center',
              border: `1px solid ${category === c ? G : '#1f1f1f'}`,
              background: category === c ? 'rgba(74,222,128,0.08)' : '#111',
              color: category === c ? '#fff' : '#444',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s',
            }}>{c}</div>
          ))}
        </div>
      </div>

      {/* What was covered */}
      <div style={{ marginTop: 16 }}>
        <p style={lbl}>What Was Covered</p>
        <textarea style={inp} rows={3} placeholder="What technique, concept or drill was the focus?" value={body} onChange={e => setBody(e.target.value)}
          onFocus={e => e.target.style.borderColor = G}
          onBlur={e => e.target.style.borderColor = '#1f1f1f'}
        />
      </div>

      {/* Moves */}
      <div style={{ marginTop: 16 }}>
        <p style={lbl}>Moves Practiced</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {moves.map((m, i) => (
            <div key={i} style={{ padding: '5px 10px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, animation: 'fadeUp 0.2s ease both' }}>
              {m}<span onClick={() => remMove(i)} style={{ color: G, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Add a move..." value={mi} onChange={e => setMi(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMove()}
            onFocus={e => e.target.style.borderColor = G}
            onBlur={e => e.target.style.borderColor = '#1f1f1f'}
          />
          <button onClick={addMove} style={{ background: G, border: 'none', borderRadius: 10, color: '#000', padding: '10px 14px', cursor: 'pointer', fontSize: 18, fontWeight: 900, transition: 'opacity 0.18s' }}>+</button>
        </div>
      </div>

      {/* Feel */}
      <div style={{ marginTop: 16 }}>
        <p style={lbl}>How Did It Feel?</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {FEELS.map(f => (
            <div key={f.val} onClick={() => setFeel(f.val)} style={{
              flex: 1, padding: '10px 8px', borderRadius: 10, textAlign: 'center',
              border: `1px solid ${feel === f.val ? G : '#1f1f1f'}`,
              background: feel === f.val ? 'rgba(74,222,128,0.08)' : '#111',
              cursor: 'pointer', transition: 'all 0.18s',
              transform: feel === f.val ? 'scale(1.04)' : 'scale(1)',
            }}>
              <div style={{ fontSize: 18 }}>{f.emoji}</div>
              <div style={{ fontSize: 10, color: '#444', marginTop: 4, fontWeight: 700, letterSpacing: 0.5 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra notes */}
      <div style={{ marginTop: 16 }}>
        <p style={lbl}>Extra Notes</p>
        <textarea style={inp} rows={3} placeholder="Aha moments, what to drill next, partner feedback..." value={body} onChange={e => setBody(e.target.value)}
          onFocus={e => e.target.style.borderColor = G}
          onBlur={e => e.target.style.borderColor = '#1f1f1f'}
        />
      </div>

      {/* Save */}
      <div style={{ marginTop: 20 }}>
        <button onClick={save} style={{ width: '100%', background: G, color: '#000', border: 'none', padding: 14, borderRadius: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: 2, cursor: 'pointer', transition: 'opacity 0.18s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >{isEditing ? 'SAVE CHANGES' : 'SAVE NOTES'}</button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
