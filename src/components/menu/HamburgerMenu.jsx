import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';

const G = 'var(--accent)';
const DARK = 'var(--bg-total)';

// ─── BJJ Terminology data ──────────────────────────────────────────────────────
const TERMS = [
  // Positions
  { term: 'Guard', def: 'A ground position where a fighter uses their legs to control an opponent on top of them.' },
  { term: 'Closed Guard', def: 'Guard position with legs locked behind the opponent\'s back.' },
  { term: 'Open Guard', def: 'Any guard variation where the legs are not locked behind the opponent.' },
  { term: 'Half Guard', def: 'A position where you control one of the opponent\'s legs between your own.' },
  { term: 'Butterfly Guard', def: 'Open guard using both feet hooked inside the opponent\'s thighs as hooks.' },
  { term: 'Spider Guard', def: 'Open guard controlling the opponent\'s sleeves while pushing with both feet on their biceps.' },
  { term: 'De La Riva (DLR)', def: 'Open guard with one leg hooked around the outside of the opponent\'s lead leg.' },
  { term: 'X-Guard', def: 'A sweeping-oriented guard where both legs form an "X" under the opponent\'s hips.' },
  { term: 'Single Leg X (SLX)', def: 'Variation of X-Guard controlling one leg, often used as a leg-lock entry.' },
  { term: 'Mount', def: 'A dominant top position sitting on the opponent\'s torso facing their head.' },
  { term: 'Side Control', def: 'Top position beside the opponent\'s torso, perpendicular to their body.' },
  { term: 'North-South', def: 'A top position with your head pointing toward the opponent\'s feet.' },
  { term: 'Back Mount', def: 'Controlling the opponent from behind with both hooks (feet) inside their hips.' },
  { term: 'Turtle', def: 'A defensive position on all fours to protect against back takes and chokes.' },
  { term: 'Knee on Belly (KOB)', def: 'A pin with one knee pressing on the opponent\'s abdomen.' },
  { term: 'Reverse Mount', def: 'Mount position facing toward the opponent\'s feet.' },
  { term: 'Scarf Hold (Kesa Gatame)', def: 'A Judo-derived pin holding the opponent\'s arm and neck from their side.' },

  // Passes
  { term: 'Guard Pass', def: 'The action of moving from inside an opponent\'s guard to a dominant side position.' },
  { term: 'Torreando Pass', def: 'A standing guard pass that grabs and redirects the opponent\'s legs to the side.' },
  { term: 'Knee Slice Pass', def: 'A pass driving your knee through the opponent\'s guard to establish side control.' },
  { term: 'Double Under Pass', def: 'A guard pass scooping under both of the opponent\'s legs to stack and pass.' },
  { term: 'Leg Drag Pass', def: 'A pass dragging one of the opponent\'s legs across their body to clear the guard.' },
  { term: 'X-Pass', def: 'A quick, angular pass stepping to the side immediately after pushing the guard down.' },
  { term: 'Smash Pass', def: 'A heavy top pressure pass flattening the guard player before clearing the legs.' },
  { term: 'Headquarters (HQ)', def: 'A passing posture with one knee up and one knee down inside half guard or open guard.' },

  // Sweeps
  { term: 'Sweep', def: 'Reversing a bottom position to end up on top of the opponent.' },
  { term: 'Hip Bump Sweep', def: 'A sweep from closed guard using hip thrust to off-balance the opponent.' },
  { term: 'Scissor Sweep', def: 'A closed guard sweep using a scissors motion with the legs.' },
  { term: 'Flower Sweep (Pendulum)', def: 'A closed guard sweep swinging the hips to generate momentum.' },
  { term: 'Butterfly Sweep', def: 'A sweep from butterfly guard using both hooks to lift and roll the opponent.' },
  { term: 'Tripod Sweep', def: 'A sweep pushing one of the opponent\'s legs while pulling the other ankle.' },
  { term: 'Sickle Sweep', def: 'An open guard sweep using a hooking motion on the back of the opponent\'s ankle.' },
  { term: 'Homer Simpson Sweep', def: 'A sweep from De La Riva guard rolling under the far leg.' },

  // Submissions
  { term: 'Submission', def: 'A technique forcing the opponent to tap out due to a choke or joint lock.' },
  { term: 'Rear Naked Choke (RNC)', def: 'A blood choke from back mount with one arm around the neck and the other arm behind the head.' },
  { term: 'Triangle Choke', def: 'A choke using the legs to form a triangle around the opponent\'s neck and one arm.' },
  { term: 'Armbar', def: 'A hyperextension joint lock on the elbow joint.' },
  { term: 'Kimura', def: 'A shoulder lock rotating the arm backward. Named after Masahiko Kimura.' },
  { term: 'Americana (Keylock)', def: 'A shoulder lock rotating the arm upward while it\'s bent at 90 degrees.' },
  { term: 'Omoplata', def: 'A shoulder lock applied with the legs from guard.' },
  { term: 'Guillotine Choke', def: 'A front choke around the neck, often taken from a sprawl or guard pull.' },
  { term: 'D\'Arce Choke', def: 'A choke similar to anaconda, applied with the arm going under the neck from the back.' },
  { term: 'Anaconda Choke', def: 'A choke applied by threading the arm under the opponent\'s neck and across their back.' },
  { term: 'Bow and Arrow Choke', def: 'A gi choke from back control pulling the lapel across the throat.' },
  { term: 'Cross Collar Choke', def: 'A gi choke using both hands gripping opposite collars in a scissors motion.' },
  { term: 'Ezekiel Choke', def: 'A choke using the sleeve grip to apply pressure on the neck, even from mount.' },
  { term: 'Heel Hook', def: 'A leg lock rotating the heel to apply torque to the knee joint.' },
  { term: 'Inside Heel Hook (IHH)', def: 'Heel hook applied from an inside position, rotating inward.' },
  { term: 'Outside Heel Hook (OHH)', def: 'Heel hook applied from an outside position. Considered more dangerous.' },
  { term: 'Kneebar', def: 'A leg lock hyperextending the knee joint, similar to an armbar for the leg.' },
  { term: 'Toe Hold', def: 'A footlock twisting the foot to apply pressure on the ankle and knee.' },
  { term: 'Straight Ankle Lock (Achilles Lock)', def: 'A compression lock on the Achilles tendon by squeezing the ankle.' },
  { term: 'Calf Slicer', def: 'A compression lock using the shin against the calf muscle.' },
  { term: 'Wrist Lock', def: 'A joint lock hyperextending or rotating the wrist.' },
  { term: 'Twister', def: 'A spinal lock submission rolling the opponent\'s spine against its natural direction.' },
  { term: 'Clock Choke', def: 'A gi choke applied on a turtled opponent driving the collar into the carotid artery.' },
  { term: 'Paper Cutter Choke', def: 'A side control choke using gi lapel and collar in a scissors action.' },
  { term: 'Gogoplata', def: 'A choke from guard using the shin across the opponent\'s throat.' },

  // Escapes & Defense
  { term: 'Escape', def: 'The act of recovering from a bad position.' },
  { term: 'Bridge and Roll', def: 'A mount escape using a hip bridge to off-balance and roll the opponent.' },
  { term: 'Elbow-Knee Escape (Shrimping)', def: 'Recovering guard from mount by shrimping hips and inserting a knee.' },
  { term: 'Shrimp', def: 'A fundamental hip escape movement used to create space and recover guard.' },
  { term: 'Technical Stand-Up', def: 'A base-safe way to stand up from half-guard or off your back.' },
  { term: 'Granby Roll', def: 'A defensive rolling motion from turtle to recover guard or attack.' },
  { term: 'Hitchhiker Escape', def: 'An armbar escape rotating the thumb down and rolling away.' },
  { term: 'Tap', def: 'The act of submitting by tapping on the opponent or mat to signal surrender.' },

  // Concepts & Strategy
  { term: 'Base', def: 'The stability generated by your grips, stance, and weight distribution.' },
  { term: 'Posture', def: 'Maintaining proper body alignment — typically an upright spine in guard.' },
  { term: 'Grips', def: 'The way hands and fingers control clothing, limbs, or body parts.' },
  { term: 'Pressure', def: 'Using body weight to control and discomfort the opponent.' },
  { term: 'Leverage', def: 'Mechanical advantage used to control or submit without relying on strength.' },
  { term: 'Framing', def: 'Using forearms and hands as frames to create and maintain space.' },
  { term: 'Hip Escape', def: 'Moving the hips laterally to create space — a core BJJ survival movement.' },
  { term: 'Weight Distribution', def: 'How you distribute your body weight to maximize control.' },
  { term: 'Submission Chain', def: 'A series of linked submissions where failing one sets up another.' },
  { term: 'Flow Rolling', def: 'Light, cooperative sparring focusing on movement and technique over intensity.' },
  { term: 'Drilling', def: 'Repetitive practice of a technique without a resisting partner.' },
  { term: 'Live Rolling (Sparring)', def: 'Full-resistance practice between two partners.' },
  { term: 'Positional Sparring', def: 'Drilling from a specific position with one partner trying to advance, the other to escape.' },
  { term: 'Passing the Guard', def: 'Moving from inside the guard to a side or mounted position.' },
  { term: 'Maintaining', def: 'Keeping a dominant position against an escaping opponent.' },
  { term: 'Transition', def: 'Moving from one position or submission attempt to another.' },
  { term: 'Submission Hunt', def: 'Actively seeking submissions while maintaining positional control.' },
  { term: 'Timing', def: 'Applying a technique at the precise moment the opponent creates the opening.' },
  { term: 'Sensitivity', def: 'The ability to feel and react to an opponent\'s movements without seeing them.' },
  { term: 'Inverting', def: 'Rolling your spine under to change the angle of your guard or escape.' },
  { term: 'Berimbolo', def: 'An inversion-based technique from De La Riva to take the back.' },

  // Leg Lock System
  { term: 'Leg Lock', def: 'Any submission targeting the joints and tendons of the legs.' },
  { term: 'Ashi Garami', def: 'A leg entanglement system used to control and attack the legs.' },
  { term: 'Single Leg X (Honey Hole / Inside Sankaku)', def: 'The inside leg entanglement used to apply inside heel hooks.' },
  { term: 'Outside Ashi', def: 'A leg entanglement from the outside, used for outside heel hooks and kneebars.' },
  { term: 'Reaping', def: 'Crossing the knee line with a leg lock entanglement — restricted in some competition rulesets.' },
  { term: 'IBJJF Reaping', def: 'Illegal in IBJJF competition; describes crossing the knee line with a leg entanglement.' },

  // Competition Terms
  { term: 'Points', def: 'Scored for achieving dominant positions: takedowns (2), sweeps (2), guard passes (3), mounts/back takes (4).' },
  { term: 'Advantages', def: 'Awarded for near-submissions or near-sweeps; used as a tiebreaker.' },
  { term: 'Penalty', def: 'Given for stalling, fleeing the mat, or other rule violations.' },
  { term: 'IBJJF', def: 'International Brazilian Jiu-Jitsu Federation — the main sport BJJ governing body.' },
  { term: 'ADCC', def: 'Abu Dhabi Combat Club — prestigious submission grappling competition, no-gi.' },
  { term: 'EBI', def: 'Eddie Bravo Invitational — submission-only tournament with overtime rules.' },
  { term: 'Overtime (OT)', def: 'A tiebreaker round, often an alternate submission attempt format.' },

  // Gi vs No-Gi
  { term: 'Gi (Kimono)', def: 'The traditional BJJ uniform with a jacket, pants, and belt.' },
  { term: 'No-Gi', def: 'BJJ or grappling practiced without the Gi, typically in rash guards and shorts.' },
  { term: 'Lapel', def: 'The folded collar of the Gi jacket, used for various grips and chokes.' },
  { term: 'Collar Grip', def: 'Gripping the opponent\'s Gi collar, used for control and chokes.' },
  { term: 'Sleeve Grip', def: 'Gripping the cuff of the opponent\'s Gi sleeve.' },
  { term: 'Belt Grip', def: 'Gripping the opponent\'s Gi belt for control.' },
  { term: 'Worm Guard', def: 'A highly technical lapel-based guard developed by Keenan Cornelius.' },
  { term: 'Lapel Guard', def: 'Any guard using the opponent\'s Gi lapel for control and sweeps.' },

  // Takedowns & Throws
  { term: 'Takedown', def: 'Bringing the opponent from standing to the ground.' },
  { term: 'Single Leg', def: 'A wrestling takedown attacking one of the opponent\'s legs.' },
  { term: 'Double Leg', def: 'A wrestling takedown attacking both legs simultaneously.' },
  { term: 'Uchi Mata', def: 'A Judo inner thigh throw.' },
  { term: 'Seoi Nage', def: 'A Judo shoulder throw.' },
  { term: 'Osoto Gari', def: 'A Judo outer leg reap throw.' },
  { term: 'Guard Pull', def: 'Voluntarily going to the ground to begin in guard.' },
  { term: 'Sprawl', def: 'Defensive movement shooting hips back to defend a takedown.' },
  { term: 'Snap Down', def: 'Pulling the opponent\'s head down to break their posture from a tie-up.' },

  // Belt System
  { term: 'White Belt', def: 'The starting rank in BJJ — learning fundamental positions and movements.' },
  { term: 'Blue Belt', def: 'Second rank — solid defensive skills and a basic offensive game established.' },
  { term: 'Purple Belt', def: 'Intermediate rank — beginning to develop a personal game.' },
  { term: 'Brown Belt', def: 'Advanced rank — high-level skills, beginning to refine and specialize.' },
  { term: 'Black Belt', def: 'Expert rank — typically takes 8–12 years of dedicated training.' },
  { term: 'Degree (Stripe)', def: 'Each belt has 4 degrees (stripes) before promotion to the next level.' },
  { term: 'Red-Black Belt (Coral)', def: 'Master rank awarded after many years at black belt.' },
  { term: 'Red Belt', def: 'Grandmaster rank — one of the highest honors in BJJ.' },
];

// ─── BJJ Terminology Screen ────────────────────────────────────────────────────
function TerminologyScreen({ onBack }) {
  const [q, setQ] = useState('');
  const filtered = q.trim()
    ? TERMS.filter(t =>
        t.term.toLowerCase().includes(q.toLowerCase()) ||
        t.def.toLowerCase().includes(q.toLowerCase())
      )
    : TERMS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '16px 20px 12px', background: 'var(--bg-total)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, color: '#444', pointerEvents: 'none'
          }}>🔍</span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search terms..."
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '11px 14px 11px 36px', color: 'var(--text-pri)',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, lineHeight: 1
            }}>×</button>
          )}
        </div>
        <div style={{ fontSize: 10, color: '#333', marginTop: 8, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em' }}>
          {filtered.length} TERM{filtered.length !== 1 ? 'S' : ''}
        </div>
      </div>

      {/* Term list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 40px', WebkitOverflowScrolling: 'touch' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#333', fontFamily: "'DM Sans', sans-serif" }}>
            No terms match "{q}"
          </div>
        ) : filtered.map((item, i) => (
          <div key={i} style={{
            padding: '13px 0', borderBottom: '1px solid var(--border)',
            borderTop: i === 0 ? 'none' : undefined,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: '#e0e0e0',
              fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 4,
              letterSpacing: '0.02em',
            }}>
              {q ? highlightMatch(item.term, q) : item.term}
            </div>
            <div style={{
              fontSize: 13, color: 'var(--text-sec)', fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.55,
            }}>
              {item.def}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function highlightMatch(text, q) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: G }}>{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

// ─── User Settings Screen ──────────────────────────────────────────────────────
const BELTS = ['white', 'blue', 'purple', 'brown', 'black'];
const BELT_COLORS = { white: '#ddd', blue: '#3498db', purple: '#9b59b6', brown: '#8B4513', black: '#555' };
const GI_PREFS = [{ val: 'gi', label: 'Gi' }, { val: 'nogi', label: 'No-Gi' }, { val: 'both', label: 'Both' }];

const BODY_TYPES = ['Lanky', 'Athletic', 'Stocky', 'Heavy'];
const SEXES = ['Male', 'Female'];
const STYLE_OPTIONS = [
  { id: 'standing', label: 'Standing / Wrestling' },
  { id: 'closed-guard', label: 'Closed Guard' },
  { id: 'open-guard', label: 'Open Guard' },
  { id: 'half-guard', label: 'Half Guard' },
  { id: 'passing', label: 'Passing / Pressure' },
  { id: 'back-control', label: 'Back Control' },
  { id: 'leg-lock', label: 'Leg Locks' },
];

function SettingsScreen() {
  const { 
    nickname, setNickname, 
    belt, setBelt, 
    giPref, setGiPref, 
    weight, setWeight, 
    height, setHeight,
    sex, setSex,
    bodyType, setBodyType,
    styles, setStyles,
    theme, setTheme
  } = useApp();

  const toggleStyle = (id) => {
    setStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 60px', WebkitOverflowScrolling: 'touch' }}>
      {/* Nickname */}
      <Section label="Display Name">
        <input
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Your name or nickname"
          style={fieldStyle}
        />
      </Section>

      {/* Belt */}
      <Section label="Belt Rank">
        <div style={{ display: 'flex', gap: 8 }}>
          {BELTS.map(b => (
            <button key={b} onClick={() => setBelt(b)} style={{
              flex: 1, minHeight: 38, borderRadius: 10, border: `1.5px solid ${belt === b ? BELT_COLORS[b] : 'var(--border)'}`,
              background: belt === b ? BELT_COLORS[b] + '22' : 'transparent',
              color: belt === b ? BELT_COLORS[b] : 'var(--text-sec)',
              fontSize: 9, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
              letterSpacing: '0.03em', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.15s',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: BELT_COLORS[b], margin: '0 auto 4px' }} />
              {b}
            </button>
          ))}
        </div>
      </Section>

      {/* Gi Pref */}
      <Section label="Training Style">
        <div style={{ display: 'flex', gap: 8 }}>
          {GI_PREFS.map(g => (
            <button key={g.val} onClick={() => setGiPref(g.val)} style={{
              flex: 1, minHeight: 38, borderRadius: 10, border: `1.5px solid ${giPref === g.val ? G : 'var(--border)'}`,
              background: giPref === g.val ? G + '18' : 'transparent',
              color: giPref === g.val ? G : 'var(--text-sec)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
            }}>{g.label}</button>
          ))}
        </div>
      </Section>

      {/* Physical Stats */}
      <Section label="Physical Profile">
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={sublabel}>Gender</div>
            <select value={sex} onChange={e => setSex(e.target.value)} style={fieldStyle}>
              <option value="">Select...</option>
              {SEXES.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={sublabel}>Body Type</div>
            <select value={bodyType} onChange={e => setBodyType(e.target.value)} style={fieldStyle}>
              <option value="">Select...</option>
              {BODY_TYPES.map(bt => <option key={bt} value={bt.toLowerCase()}>{bt}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={sublabel}>Weight (kg)</div>
            <input value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 80" type="number" style={fieldStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={sublabel}>Height (cm)</div>
            <input value={height} onChange={e => setHeight(e.target.value)}
              placeholder="e.g. 178" type="number" style={fieldStyle} />
          </div>
        </div>
      </Section>

      {/* BJJ Style Profile */}
      <Section label="BJJ Style Profile">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STYLE_OPTIONS.map(s => {
            const active = styles.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggleStyle(s.id)} style={{
                padding: '8px 14px', borderRadius: 20,
                border: `1px solid ${active ? G : '#222'}`,
                background: active ? G + '18' : 'transparent',
                color: active ? G : '#444',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
              }}>
                {active ? '✓ ' : '+ '}{s.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Preferences */}
      <Section label="App Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: 'var(--text-pri)', fontFamily: "'DM Sans', sans-serif" }}>Units</div>
            <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
              {['Metric', 'Imperial'].map(u => (
                <div key={u} style={{
                  padding: '4px 12px', fontSize: 11, borderRadius: 6, fontWeight: 700,
                  background: u === 'Metric' ? 'var(--border)' : 'transparent',
                  color: u === 'Metric' ? 'var(--text-pri)' : 'var(--text-sec)',
                  fontFamily: "'DM Sans', sans-serif", cursor: 'not-allowed',
                }}>{u}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: 'var(--text-pri)', fontFamily: "'DM Sans', sans-serif" }}>Appearance</div>
            <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
              {[
                { val: 'dark', label: 'DARK' },
                { val: 'light', label: 'LIGHT' }
              ].map(t => (
                <button
                  key={t.val}
                  onClick={() => setTheme(t.val)}
                  style={{
                    padding: '4px 12px', fontSize: 10, borderRadius: 6, fontWeight: 800,
                    border: 'none', cursor: 'pointer',
                    background: theme === t.val ? 'var(--accent)' : 'transparent',
                    color: theme === t.val ? '#000' : 'var(--text-sec)',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>


    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: G, letterSpacing: '0.12em',
        textTransform: 'uppercase', marginBottom: 10, fontFamily: "'DM Sans', sans-serif",
      }}>{label}</div>
      {children}
    </div>
  );
}

const fieldStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
  color: 'var(--text-pri)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
};
const sublabel = { fontSize: 11, color: 'var(--text-sec)', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" };

// ─── Main Hamburger Menu ───────────────────────────────────────────────────────
export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState(null); // null | 'settings' | 'terminology'

  const close = useCallback(() => { setOpen(false); setTimeout(() => setScreen(null), 300); }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  const handleLogout = () => {
    if (window.confirm('Reset the app? All data will be cleared.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const MENU_ITEMS = [
    {
      id: 'settings',
      icon: '⚙️',
      label: 'User Settings',
      sub: 'Profile, game styles & preferences',
      action: () => setScreen('settings'),
    },
    {
      id: 'terminology',
      icon: '📚',
      label: 'BJJ Terminology',
      sub: `${TERMS.length}+ terms with search`,
      action: () => setScreen('terminology'),
    },
  ];

  const screenTitle = screen === 'settings' ? 'Settings' : screen === 'terminology' ? 'BJJ Terminology' : '';

  const menu = (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, background: '#000',
          opacity: open ? 0.7 : 0, zIndex: 9000,
          transition: 'opacity 0.28s ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(88vw, 380px)',
        background: 'var(--bg-total)',
        borderLeft: '1px solid var(--border)',
        zIndex: 9001,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: open ? '-20px 0 60px rgba(0,0,0,0.4)' : 'none',
      }}>
        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '52px 20px 16px',
          borderBottom: '1px solid var(--border)', flexShrink: 0,
          background: 'var(--bg-total)',
        }}>
          {screen ? (
            <button onClick={() => setScreen(null)} style={{
              background: 'var(--bg-card)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-sec)', cursor: 'pointer', fontSize: 18, flexShrink: 0,
            }}>←</button>
          ) : (
            <button onClick={close} style={{
              background: 'var(--bg-card)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-sec)', cursor: 'pointer', fontSize: 22, flexShrink: 0,
            }}>✕</button>
          )}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 20, fontWeight: 700, color: 'var(--text-pri)',
          }}>
            {screen ? screenTitle : 'Menu'}
          </div>
        </div>

        {/* Drawer content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!screen && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '8px 0 20px' }}>
              {MENU_ITEMS.map(item => (
                <button key={item.id} onClick={item.action} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', border: 'none', background: 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid var(--border)', transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: 'var(--bg-card)',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, flexShrink: 0,
                  }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 600, color: 'var(--text-pri)',
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                      {item.sub}
                    </div>
                  </div>
                  <span style={{ color: 'var(--border)', fontSize: 18 }}>›</span>
                </button>
              ))}

              {/* Logout — visually separated */}
              <div style={{ marginTop: 16, padding: '0 20px' }}>
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '14px 18px', borderRadius: 14,
                  border: '1px solid #2a1515', background: '#1a0505',
                  color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#220808'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1a0505'}
                >
                  <span style={{ fontSize: 18 }}>↺</span>
                  Reset & Logout
                </button>
              </div>

              {/* App version */}
              <div style={{
                display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: 40, paddingBottom: 10,
              }}>
                <img src="/horizontal (2).svg" alt="GroundWork" style={{ height: 20, width: 'auto', opacity: 0.8 }} />
              </div>
            </div>
          )}

          {screen === 'settings' && <SettingsScreen />}
          {screen === 'terminology' && <TerminologyScreen onBack={() => setScreen(null)} />}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 4.5, padding: '4px 6px',
          borderRadius: 8,
        }}
      >
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            display: 'block', width: 18,
            height: i === 1 ? 1.5 : 1.5,
            borderRadius: 2,
            background: '#888',
            width: i === 1 ? 12 : 18,
            transition: 'width 0.2s',
          }} />
        ))}
      </button>

      {createPortal(menu, document.body)}
    </>
  );
}
