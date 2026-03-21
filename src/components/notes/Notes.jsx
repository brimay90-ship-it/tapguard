import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import NoteEditor from './NoteEditor';

const G = '#4ade80';
const feelColors = { lost:'#ef4444', okay:'#f59e0b', good:G, locked:'#3b82f6' };
const feelLabels = { lost:'Struggling', okay:'Felt okay', good:'Clicking', locked:'Locked in' };

export default function Notes() {
  const { notes } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const filters = ['All','Techniques','Drills','Sparring'];

  return (
    <div style={{ position:'relative', height:'100%' }}>
      <div style={{ padding:'20px 20px 100px', overflowY:'auto', height:'100%' }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:6, fontWeight:700 }}>Training Journal</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:30, color:'#fff', marginBottom:16, letterSpacing:1 }}>CLASS NOTES</div>

        <div style={{ display:'flex', gap:6, marginBottom:16 }}>
          {filters.map(f=>(
            <div key={f} onClick={()=>setFilter(f)} style={{
              padding:'7px 14px', borderRadius:50,
              border:`1px solid ${filter===f?G:'#1f1f1f'}`,
              background:filter===f?'rgba(74,222,128,0.08)':'#111',
              color:filter===f?'#fff':'#444',
              fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.18s',
            }}>{f}</div>
          ))}
        </div>

        <div onClick={()=>setEditorOpen(true)} style={{
          width:'100%', background:'#111', border:'1px dashed #1f1f1f',
          borderRadius:12, padding:20, color:'#444', fontSize:14,
          fontWeight:700, cursor:'pointer', textAlign:'center',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          marginBottom:16, transition:'all 0.18s',
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=G;e.currentTarget.style.color='#aaa';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#1f1f1f';e.currentTarget.style.color='#444';}}
        >+ ADD TODAY'S CLASS NOTES</div>

        {notes.map(note=>(
          <div key={note.id} onClick={()=>setEditorOpen(true)} style={{
            background:'#111', border:'1px solid #1f1f1f',
            borderRadius:12, padding:'16px', marginBottom:8,
            cursor:'pointer', transition:'border-color 0.18s',
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=G}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#1f1f1f'}
          >
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#333', marginBottom:6, fontWeight:700 }}>{note.date}</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8, letterSpacing:0.5 }}>{note.title}</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
              {note.moves.map(m=><span key={m} style={{ fontSize:11, padding:'3px 8px', background:'#1a1a1a', borderRadius:4, color:'#666', fontWeight:600 }}>{m}</span>)}
            </div>
            {note.feel && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:feelColors[note.feel]||'#444', display:'inline-block' }}/>
                <span style={{ fontSize:12, color:'#444', fontWeight:600 }}>{feelLabels[note.feel]||note.feel}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {editorOpen && <NoteEditor onClose={()=>setEditorOpen(false)}/>}
    </div>
  );
}
