# TapGuard — Project Memory for Claude

## What This App Is
TapGuard is a mobile BJJ (Brazilian Jiu-Jitsu) coaching app for new students.
It helps them identify technique mistakes, track progress, log classes, and follow
a customised strength & conditioning plan. Target users: white and blue belts.

Max width: 430px (mobile-first). Minimal vertical scrolling — prefer click-throughs.

---

## Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Inline styles only — NO Tailwind, NO CSS modules, NO styled-components
- **State:** React Context API via `src/context/AppContext.jsx`
- **Fonts:** Bebas Neue (headings/display), DM Sans (body) — loaded via Google Fonts in index.css
- **No external UI libraries** — everything is built from scratch

---

## Design System

### Colors (always use these exact values)
```
--ink:        #0d0d0b   (page background)
--ink2:       #141410   (card background)
--ink3:       #1c1b17   (elevated surface)
--paper:      #f0ebe0   (primary text)
--tan:        #c8b99a   (secondary text)
--muted:      #6b6458   (tertiary text / labels)
--border:     #2a2720   (default border)
--red:        #c0392b   (primary accent)
--red2:       #962d22   (red hover state)
--accent:     #e8a020   (amber / warnings / missed moves)
--blue:       #2d6a9f   (info)
--green:      #2d7a4f   (success / completed)
```

### Typography
- **Display/headings:** `fontFamily: "'Bebas Neue', sans-serif"` — used for all section titles, card titles, nav labels
- **Body:** `fontFamily: "'DM Sans', sans-serif"` — used for descriptions, labels, inputs
- **Eyebrow labels:** `fontSize: 9-10px, letterSpacing: 3-4px, textTransform: 'uppercase', color: muted or red`
- **Section titles:** `fontSize: 28-46px, fontFamily: Bebas Neue`
- **Card titles:** `fontSize: 17-20px, fontFamily: Bebas Neue, letterSpacing: 1px`
- **Body text:** `fontSize: 12-14px, fontWeight: 300, lineHeight: 1.5-1.7`

### Card Pattern (use for ALL cards)
```jsx
style={{
  background: '#141410',
  border: '1px solid #2a2720',
  borderRadius: 6,
  padding: '16px 18px',
  cursor: 'pointer',
  transition: 'border-color 0.18s',
}}
onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.35)'}
onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2720'}
```

### Accent Card (left red border — used for focus/highlight cards)
```jsx
style={{
  background: '#141410',
  border: '1px solid #2a2720',
  borderLeft: '3px solid #c0392b',
  borderRadius: 6,
  padding: '16px 18px',
}}
```

### Button — Primary
```jsx
style={{
  background: '#c0392b',
  color: '#fff',
  border: 'none',
  padding: 14,
  borderRadius: 6,
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 18,
  letterSpacing: 2,
  cursor: 'pointer',
}}
```

### Button — Ghost/Back
```jsx
style={{
  background: 'transparent',
  border: '1px solid #2a2720',
  color: '#6b6458',
  padding: '14px 16px',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
}}
```

### Slide-in Overlay (used for detail views — RollDetail, NoteEditor)
```jsx
style={{
  position: 'absolute',
  inset: 0,
  background: '#0d0d0b',
  overflowY: 'auto',
  padding: '20px 24px 80px',
  zIndex: 10,
}}
```

### Eyebrow Label Pattern
```jsx
<div style={{
  fontSize: 9,
  letterSpacing: 3,
  textTransform: 'uppercase',
  color: '#c0392b', // or '#6b6458' for neutral
  marginBottom: 6,
}}>
  Label Text
</div>
```

---

## File Structure
```
tapguard/
  CLAUDE.md                          ← you are here
  src/
    main.jsx                         ← entry point
    index.css                        ← global styles + Google Fonts import
    App.jsx                          ← root component, tab routing, header
    context/
      AppContext.jsx                 ← ALL shared state lives here
    data/
      weekPlan.js                    ← exercise plans (7 days) + rollSessions + notesSample
    components/
      onboarding/
        Onboarding.jsx               ← 5-step wizard (belt, style, comp, goals, freq)
      dashboard/
        Dashboard.jsx                ← competency map, focus card, quick actions
      rolls/
        Rolls.jsx                    ← session list + record button
        RollDetail.jsx               ← chess-style missed moves + timeline (slide-in)
      notes/
        Notes.jsx                    ← note cards + filter tabs
        NoteEditor.jsx               ← full note entry form (slide-in)
      training/
        Training.jsx                 ← day nav + exercise checklist
```

---

## State Shape (AppContext)
```js
{
  // Onboarding
  onboardingDone: bool,
  belt: 'white' | 'blue' | 'purple' | 'brown',
  styles: string[],        // e.g. ['bottom', 'leg-lock']
  goals: string[],         // e.g. ['💪 Build Strength', '🫁 Cardio & Gas Tank']
  freq: '2' | '3' | '4' | '5',
  comp: {
    guard: 0-10,
    pass: 0-10,
    sub: 0-10,
    esc: 0-10,
    takedown: 0-10,
    position: 0-10,
  },

  // App
  activeTab: 'dash' | 'roll' | 'notes' | 'training',
  notes: NoteObject[],
  exerciseDone: { 'day-index': bool },

  // Derived
  focusSkill: string,      // based on lowest comp score
  beltColor: string,       // hex color for belt badge dot
  lowestComp: string,      // key of lowest comp score
}
```

---

## Key Component Behaviours

### Onboarding (Onboarding.jsx)
- 5 steps: Belt → Style → Competency bars → Goals → Frequency
- Each step uses `canNext` array to enable/disable the Next button
- Step 2 (Style) and Step 3 (Goals) are multi-select
- Competency bars: tap anywhere on bar to set value 0–10
- On finish: calls `finishOnboarding()` from context → shows main app

### Dashboard (Dashboard.jsx)
- Reads `comp` from context to render skill bars
- `focusSkill` is auto-derived from lowest comp score
- Quick action cards call `setActiveTab()` to navigate

### Rolls (Rolls.jsx)
- Session list from `rollSessions` in weekPlan.js
- Clicking a session opens `RollDetail` as a slide-in overlay
- Record button toggles recording state + live timer

### RollDetail (RollDetail.jsx)
- Receives `session` prop and `onBack` callback
- Shows missed moves (amber cards) + timeline with colored dots
- Green = success, amber = neutral, red = mistake/missed

### Notes (Notes.jsx)
- Reads `notes` from context
- Opens `NoteEditor` as slide-in overlay
- Feel colors: lost=#e74c3c, okay=#f39c12, good=#27ae60, locked=#3498db

### NoteEditor (NoteEditor.jsx)
- Controlled form: title, body, moves (add/remove chips), feel picker, extra
- On save: calls `addNote()` from context, resets form, closes

### Training (Training.jsx)
- Day nav defaults to today's day of week
- Exercises from `weekPlan[currentDay]`
- Tap exercise to toggle done — calls `toggleExercise(day, i)` from context
- Done exercises get strikethrough + green checkmark

---

## Coding Rules — ALWAYS Follow These

1. **Inline styles only** — never add CSS classes or external stylesheets (except index.css)
2. **No new dependencies** — do not suggest installing any npm packages
3. **Mobile width** — all layouts must work at 430px max-width
4. **No vertical scroll on main screens** — content fits in viewport, details use slide-in overlays
5. **Bebas Neue for all titles** — never use a different font for headings
6. **Always include hover states** on interactive cards using onMouseEnter/onMouseLeave
7. **Context for shared state** — never lift state above AppContext or duplicate state
8. **Data stays in weekPlan.js** — exercise data, session data, sample notes all live there
9. **Overlays use position absolute + zIndex 10** — not modals or portals
10. **Red (#c0392b) is the only primary accent** — don't introduce new accent colors

---

## Current Limitations / Known TODOs
- [ ] No real audio recording — record button is UI only (timer mock)
- [ ] No backend / persistence — state resets on refresh
- [ ] AI analysis is mocked — missed moves are hardcoded sample data
- [ ] No actual video/audio processing
- [ ] Notes filter tabs (Techniques, Drills, Sparring) are UI only — not wired to filter logic
- [ ] Onboarding data doesn't yet personalise the S&C plan beyond goals display

---

## How to Run
```bash
cd C:\Users\brima\tapguard
npm run dev
# Open http://localhost:5173
```

---

## When I Ask You to Make Changes
- Always tell me which file to edit
- Give me the complete updated file content (not diffs) so I can Ctrl+A → paste
- Remind me to save with Ctrl+S
- If changing AppContext, remind me that all components re-render
- Flag if a change touches more than one file
