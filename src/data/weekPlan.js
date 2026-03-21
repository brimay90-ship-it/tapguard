export const weekPlan = [
  [ // Mon
    { title: 'Hip Escape Drill', meta: '3 × 10 each side', tags: ['Mobility', 'BJJ-Specific'] },
    { title: 'Kettlebell Swing', meta: '4 × 15 reps', tags: ['Strength', 'Power'] },
    { title: 'Hip Flexor Stretch', meta: 'Hold 45 sec × 3', tags: ['Flexibility'] },
    { title: 'Sprawl to Base', meta: '3 × 20 reps', tags: ['BJJ-Specific', 'Cardio'] },
  ],
  [ // Tue
    { title: 'Pigeon Pose Sequence', meta: '2 min each side × 3', tags: ['Flexibility'] },
    { title: 'Thoracic Rotation', meta: '3 × 10 each side', tags: ['Mobility'] },
    { title: '90/90 Hip Stretch', meta: '2 × 60 sec', tags: ['Flexibility'] },
  ],
  [ // Wed
    { title: 'Deadlift', meta: '4 × 5 @ 75% 1RM', tags: ['Strength'] },
    { title: 'Pull-Ups', meta: '4 × max reps', tags: ['Strength', 'Grip'] },
    { title: 'Plank w/ Hip Tap', meta: '3 × 45 sec', tags: ['Core'] },
    { title: 'Face Pull', meta: '3 × 15 reps', tags: ['Injury Prevention'] },
    { title: 'Neck Bridges', meta: '2 × 30 sec', tags: ['BJJ-Specific'] },
  ],
  [ // Thu
    { title: 'Burgener Warm-up', meta: '10 min', tags: ['Mobility'] },
    { title: 'Jump Rope', meta: '5 × 2 min rounds', tags: ['Cardio', 'Footwork'] },
    { title: 'Sprawl Circuits', meta: '3 × 10 sprawls', tags: ['BJJ-Specific'] },
  ],
  [ // Fri
    { title: 'Front Squat', meta: '4 × 5 reps', tags: ['Strength', 'Power'] },
    { title: 'Single-Leg RDL', meta: '3 × 8 each leg', tags: ['Strength', 'Balance'] },
    { title: 'TRX Row', meta: '3 × 12 reps', tags: ['Strength'] },
    { title: 'L-Sit Hold', meta: '3 × 20 sec', tags: ['Core'] },
  ],
  [ // Sat
    { title: '5-Min Rounds', meta: '5 × 5 min rolling', tags: ['Cardio', 'Sparring'] },
    { title: 'Active Recovery Walk', meta: '20 min easy', tags: ['Recovery'] },
    { title: 'Full Body Stretch', meta: '15 min flow', tags: ['Flexibility'] },
  ],
  [ // Sun
    { title: 'Yoga Flow', meta: '30 min', tags: ['Recovery', 'Flexibility'] },
    { title: 'Ice Bath / Cold Shower', meta: '5 min', tags: ['Recovery'] },
  ],
];

export const rollSessions = [
  {
    id: 0,
    day: '14', month: 'Mar',
    title: 'Evening Open Mat',
    tags: ['22 min', '3 rounds', 'Guard Play'],
    missed: 5,
    partner: 'Blue Belt Partner',
    missedMoves: [
      {
        move: 'Triangle from Closed Guard',
        explain: "At 4:12, your partner's posture was broken and their arm was inside. Classic triangle setup — your hips never elevated. Drill: triangle hip-up isolation, 3×10 each side.",
      },
      {
        move: 'Back Take from Turtle',
        explain: 'At 9:45 you let them turtle and reset instead of attacking. Arm drag to seatbelt was available for 3 full seconds. Key cue: when they drop to turtle, your first thought is seatbelt, not reset.',
      },
      {
        move: 'Kimura Trap from Side Control',
        explain: 'At 16:03, their far arm bridged and became isolated. You had shoulder control but did not thread the kimura grip. Drill: kimura trap from modified side control.',
      },
    ],
    timeline: [
      { time: '0:00', move: 'Pulled guard', note: 'Established closed guard', color: '#2d7a4f' },
      { time: '2:10', move: 'Attempted armbar', note: 'Escaped by stacking — posture not fully broken', color: '#e8a020' },
      { time: '4:12', move: 'Missed triangle ⚡', note: 'Arm in, hips flat — opportunity missed', color: '#c0392b' },
      { time: '7:30', move: 'Guard passed — tapped', note: 'Knee slice, lost framing too early', color: '#c0392b' },
      { time: '9:45', move: 'Missed back take ⚡', note: 'Turtle presented — reset taken instead', color: '#c0392b' },
      { time: '14:20', move: 'Successful double leg', note: 'Good penetration step, established top', color: '#2d7a4f' },
      { time: '19:00', move: 'Completed choke from back', note: 'Clean seatbelt, excellent hook placement', color: '#2d7a4f' },
    ],
  },
  {
    id: 1,
    day: '11', month: 'Mar',
    title: 'Class + Rolling',
    tags: ['18 min', '2 rounds', 'Passing'],
    missed: 3,
    partner: 'White Belt Partner',
    missedMoves: [
      { move: 'Darce Choke', explain: 'At 6:20, you had underhook and their head was low. Darce was there — you took side control instead. Next time look for head position first.' },
      { move: 'Knee Slice Counter', explain: 'At 11:05 your knee slice was defended — the leg weave follow-up was open but you reset to standing.' },
    ],
    timeline: [
      { time: '0:00', move: 'Clinch from standing', note: 'Good posture, controlled grips', color: '#2d7a4f' },
      { time: '3:10', move: 'Pulled to guard', note: 'Partner pulled first', color: '#e8a020' },
      { time: '6:20', move: 'Missed darce ⚡', note: 'Underhook available — took side control', color: '#c0392b' },
      { time: '11:05', move: 'Missed leg weave ⚡', note: 'Knee slice defended, reset instead', color: '#c0392b' },
      { time: '15:00', move: 'Submitted via armbar', note: 'Partner caught straight armbar from guard', color: '#c0392b' },
    ],
  },
  {
    id: 2,
    day: '08', month: 'Mar',
    title: 'Competition Prep',
    tags: ['34 min', '5 rounds', 'Leg Locks'],
    missed: 7,
    partner: 'Purple Belt Partner',
    missedMoves: [
      { move: 'Outside Heel Hook Entry', explain: 'Multiple times you had ashi garami but didn\'t commit to the outside heel hook. Hesitation is the enemy — drill the entry 50 times solo.' },
      { move: 'Saddle Position', explain: 'At 22:10 you had the inside position but went for kneebar instead of transitioning to saddle for the outside heel hook.' },
    ],
    timeline: [
      { time: '0:00', move: 'Guard pull', note: 'Immediate butterfly hook', color: '#2d7a4f' },
      { time: '5:00', move: 'Ashi garami entry', note: 'Good entry, hesitated on finish', color: '#e8a020' },
      { time: '12:00', move: 'Tapped to heel hook', note: 'Partner finished outside heel hook', color: '#c0392b' },
      { time: '22:10', move: 'Missed saddle ⚡', note: 'Kneebar attempted instead', color: '#c0392b' },
      { time: '30:00', move: 'Successful kneebar', note: 'Good control, clean finish', color: '#2d7a4f' },
    ],
  },
];

export const notesSample = [
  {
    id: 0,
    date: 'Mar 14 · Thursday',
    title: 'De La Riva Guard Entries',
    moves: ['DLR Hook', 'Berimbolo', 'X-Guard Entry'],
    feel: 'okay',
    feelEmoji: '😐',
    note: 'DLR hook needs more reps. Berimbolo timing is off — need to commit earlier.',
  },
  {
    id: 1,
    date: 'Mar 11 · Monday',
    title: 'Knee Slice Pass Series',
    moves: ['Knee Slice', 'Leg Weave', 'Torreando'],
    feel: 'good',
    feelEmoji: '💪',
    note: 'Clicking now — hitting knee slice in sparring. Leg weave needs work.',
  },
  {
    id: 2,
    date: 'Mar 7 · Friday',
    title: 'Back Takes & Rear Naked Choke',
    moves: ['Seatbelt', 'Hook Insertion', 'RNC'],
    feel: 'lost',
    feelEmoji: '😵',
    note: 'Struggling with seatbelt control. Keep losing position when they chin-tuck.',
  },
];
