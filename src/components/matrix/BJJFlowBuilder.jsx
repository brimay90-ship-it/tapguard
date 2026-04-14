import { useState, useMemo, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { createPortal } from "react-dom";

// ─── Color system (Reactive) ──────────────────────────────────────────────────
const CAT = {
  "Submission": "#e53e3e",
  "Guard System": "#7c3aed",
  "Guard Pass": "#7c3aed",
  "Position": "#2563eb",
  "Escape & Recovery": "#2563eb",
  "Leg Entanglement": "#d97706",
  "Sweep": "#0891b2",
  "Takedown & Throw": "#0891b2",
  "Style & Meta-system": "#64748b",
};
const SKILL_COL = { Beginner: "#22c55e", Intermediate: "#f59e0b", Advanced: "#ef4444", Elite: "#a855f7" };
const profColor = p => p >= 8 ? "#fbbf24" : p >= 5 ? "#22c55e" : p >= 3 ? "#f59e0b" : "var(--text-sec)";
const catColor = t => CAT[t?.category] || "#64748b";
const haptic = (ms = 8) => { try { navigator.vibrate?.(ms); } catch { } };

// ─── BJJ Data ────────────────────────────────────────────────────────────────
const DATA = [{ "id": 1, "name": "Rear naked choke", "aka": ["RNC", "mata le\u00e3o"], "category": "Submission", "subcategory": "Choke", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["Back mount", "Body triangle", "Bow and arrow choke", "Arm triangle"], "common_setups": ["Seatbelt grip \u2192 arm under chin \u2192 second hand clasps bicep", "Body triangle \u2192 reach under chin from seatbelt", "Turtle roll \u2192 hooks in \u2192 finish"], "primary_counters": ["Chin tuck and grip the choking arm", "Back escape \u2014 hip escape + seat belt strip", "Roll opponent over and come to guard"], "notable_practitioners": ["Marcelo Garcia", "Gordon Ryan", "Roger Gracie"], "notes": "The highest-percentage submission in MMA and no-gi BJJ. Blood choke targeting carotid arteries \u2014 unconsciousness in 3\u20135 seconds if properly applied. The non-choking arm's elbow must align with the opponent's chin centerline.", "position_entered_from": ["Back mount", "Rear mount", "Turtle top"], "style_association": ["All styles", "MMA", "Self-defense"] }, { "id": 2, "name": "Guillotine choke", "aka": ["Mae hadaka jime", "front choke"], "category": "Submission", "subcategory": "Choke", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["Von Flue choke", "Arm-in guillotine", "Anaconda choke", "D'Arce choke", "Closed guard"], "common_setups": ["Opponent shoots double \u2192 snap head down \u2192 arm under chin \u2192 guard pull", "Seated guard \u2192 opponent postures \u2192 reach arm under chin", "Arm-in variant: opponent's arm trapped alongside neck"], "primary_counters": ["Posture up and stack", "Step to the trapped arm's side and drive hips through", "Von Flue choke counter (if arm-in)"], "notable_practitioners": ["Marcelo Garcia", "Renzo Gracie", "Tony Ferguson"], "notes": "Can be blood or air choke depending on grip placement. High elbow guillotine is the modern standard \u2014 elbow points skyward to compress carotid. Arm-in variant is harder to defend but requires different mechanics. Extremely common in MMA.", "position_entered_from": ["Standing", "Closed guard", "Half guard"], "style_association": ["MMA", "Wrestling-base BJJ", "10th Planet"] }, { "id": 3, "name": "Arm-in guillotine", "aka": ["AIG", "arm-in ezekiel variant"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["Guillotine choke", "Anaconda choke", "10-finger guillotine"], "common_setups": ["Opponent's arm trapped inside the choke alongside the neck", "Transition from standard guillotine when opponent defends by tucking arm in", "Front headlock with arm trapped \u2014 pull guard to finish"], "primary_counters": ["Step to choking arm side \u2014 reduces pressure significantly", "Von Flue is NOT applicable here (arm is inside)", "Spin to back"], "notable_practitioners": ["Marcelo Garcia", "Neil Melanson"], "notes": "Trapping the arm inside makes the standard step-to-the-side defense ineffective. Requires more of a squeeze/crunch mechanic than the standard HEG. Often higher percentage from guard pull situations.", "position_entered_from": ["Standing", "Closed guard", "Half guard"], "style_association": ["MMA", "Wrestling-base BJJ"] }, { "id": 4, "name": "Anaconda choke", "aka": ["Arm-in front headlock choke", "anaconda"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["D'Arce choke", "Guillotine choke", "Peruvian necktie", "Turtle top"], "common_setups": ["Front headlock \u2192 thread arm under opponent's armpit \u2192 gable grip \u2192 roll over shoulder", "Opponent turtles \u2192 reach arm under armpit \u2192 secure neck \u2192 roll", "Transition from D'Arce when opponent defends by turning away"], "primary_counters": ["Posture and walk away before grip is secured", "Roll into the choke to reverse position", "Hand fight to prevent the arm thread"], "notable_practitioners": ["Eddie Bravo", "Marcelo Garcia", "Dean Lister"], "notes": "Distinguished from D'Arce by which side the arm threads \u2014 Anaconda threads under the near armpit and rolls over the shoulder. Requires a forward roll to finish. Sets up Peruvian necktie as an alternative.", "position_entered_from": ["Turtle top", "Front headlock", "North-south"], "style_association": ["Wrestling-base BJJ", "No-gi sport BJJ"] }, { "id": 5, "name": "D'Arce choke", "aka": ["Brabo choke", "no-gi arm triangle"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["Anaconda choke", "Arm triangle", "Head and arm choke", "Half guard top"], "common_setups": ["Half guard top \u2192 underhook \u2192 thread arm under neck from outside", "Front headlock \u2192 arm threads under neck and through armpit", "Side control \u2192 far arm trapped \u2192 thread choking arm"], "primary_counters": ["Post on the mat before grip is secured", "Granby roll escape", "Walk hips away and come to knees"], "notable_practitioners": ["Joe D'Arce", "Gordon Ryan", "Garry Tonon"], "notes": "Named after Joe D'Arce who popularized it. Thread direction is opposite to Anaconda \u2014 arm goes under the neck from the outside. Does not require a roll to finish, making it generally higher percentage than Anaconda in top positions.", "position_entered_from": ["Turtle top", "Front headlock", "Half guard top"], "style_association": ["No-gi sport BJJ", "Wrestling-base BJJ", "Danaher Death Squad"] }, { "id": 6, "name": "Triangle choke", "aka": ["Sankaku jime", "front triangle"], "category": "Submission", "subcategory": "Choke", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Armbar from triangle", "Omoplata", "Closed guard", "Stack pass", "Rear triangle"], "common_setups": ["Closed guard \u2192 push one arm across \u2192 leg over shoulder \u2192 lock triangle", "Spider guard \u2192 pull one arm \u2192 shoot triangle", "Mount \u2192 reach for armbar \u2192 opponent pulls arm \u2192 transition to triangle"], "primary_counters": ["Stack and posture \u2014 drive opponent onto their shoulders", "Grab the pants leg / belt and walk hips around", "Tuck chin and pull trapped arm across body"], "notable_practitioners": ["Rickson Gracie", "BJ Penn", "Fabricio Werdum"], "notes": "Legs form a figure-four around the opponent's neck and one arm. The trapped arm's shoulder provides the carotid compression on one side, the thigh on the other. Cutting the angle is critical \u2014 hips must be off to the side of the trapped arm.", "position_entered_from": ["Closed guard", "Open guard", "Mount"], "style_association": ["Sport BJJ", "IBJJF", "All styles"] }, { "id": 7, "name": "Rear triangle choke", "aka": ["Back triangle", "sankaku jime from back"], "category": "Submission", "subcategory": "Choke", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["Rear naked choke", "Back mount", "Body triangle", "Armbar from back"], "common_setups": ["Back mount \u2192 opponent removes hook \u2192 throw leg over shoulder and lock triangle", "Seatbelt \u2192 transition when RNC is defended", "Body triangle \u2192 replace leg on shoulder side with triangle"], "primary_counters": ["Immediately replace the hook before triangle locks", "Posture up and drive forward", "Grip the leg and stack"], "notable_practitioners": ["Gordon Ryan", "John Danaher", "Craig Jones"], "notes": "Highly underutilized from back mount. Forces the opponent to deal with a second submission threat when defending RNC. Can be transitioned to armbar or omoplata if triangle is defended.", "position_entered_from": ["Back mount", "Rear mount"], "style_association": ["No-gi sport BJJ", "Danaher Death Squad"] }, { "id": 8, "name": "Bow and arrow choke", "aka": ["Yumi jime", "bow and arrow"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Rear naked choke", "Clock choke", "Back mount gi", "Collar choke"], "common_setups": ["Back mount \u2192 cross collar grip \u2192 reach for near leg pants grip \u2192 extend body", "Turtle \u2192 collar drag \u2192 take back \u2192 establish bow and arrow", "Clock choke attempt \u2192 opponent turtles \u2192 transition to bow and arrow"], "primary_counters": ["Block the collar grip immediately from back mount", "Chin tuck and two-on-one the choking arm", "Come to knees and hand fight the collar"], "notable_practitioners": ["Roger Gracie", "Bernardo Faria", "Romulo Barral"], "notes": "One of the highest-percentage gi submissions. The pants grip at the knee amplifies the choke by twisting the opponent's spine while the collar cuts the carotid. Works when opponent is face-up or face-down.", "position_entered_from": ["Back mount gi", "Turtle top gi"], "style_association": ["Gi sport BJJ", "IBJJF competition", "Gracie Barra"] }, { "id": 9, "name": "Clock choke", "aka": ["Tokei jime", "rolling clock choke"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Bow and arrow choke", "Turtle position", "Back take from turtle"], "common_setups": ["Opponent turtles \u2192 cross collar grip \u2192 walk around head like clock hands \u2192 pressure down", "Side control \u2192 transition to turtle \u2192 establish collar grip \u2192 walk", "Guard pass to turtle \u2192 immediate collar grab"], "primary_counters": ["Immediately sit out or granby before grip secured", "Grab the choking arm and create space", "Roll away and come to guard"], "notable_practitioners": ["Kron Gracie", "Kyra Gracie", "Ryo Chonan"], "notes": "Walk perpendicular to opponent's spine while driving the cross-collar grip into the mat. The name comes from the circular walking motion. Often sets up back take if opponent defends by sitting out.", "position_entered_from": ["Turtle top gi", "Side control gi"], "style_association": ["Gi sport BJJ", "Traditional BJJ", "Judo base BJJ"] }, { "id": 10, "name": "Baseball bat choke", "aka": ["Baseball choke", "cross-grip collar choke"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Bread cutter choke", "Paper cutter choke", "Side control gi"], "common_setups": ["Side control \u2192 both hands grip collar in baseball bat orientation \u2192 swing hips over head", "North-south \u2192 establish double collar grip \u2192 pull opponent into choke", "Knee on belly \u2192 establish grip \u2192 transition over head"], "primary_counters": ["Block the second hand from establishing the grip", "Bridge and roll before hips are swung over", "Grab the arms and prevent the hip swing"], "notable_practitioners": ["Caio Terra", "Paulo Miyao", "Lucas Lepri"], "notes": "Both thumbs point in the same direction, like gripping a baseball bat. The finishing mechanics involve swinging hips over the opponent's head while pulling the collar. Can be finished from north-south without the hip swing.", "position_entered_from": ["Side control gi", "Mount gi", "North-south gi"], "style_association": ["Gi sport BJJ", "IBJJF competition"] }, { "id": 11, "name": "Ezekiel choke", "aka": ["Sode guruma jime", "sleeve choke"], "category": "Submission", "subcategory": "Choke", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Mount position", "Arm triangle", "Side control"], "common_setups": ["Mount \u2192 thread sleeve through opponent's collar \u2192 grab own sleeve \u2192 squeeze", "No-gi: forearm blade across throat \u2192 opposite hand grips choking wrist \u2192 squeeze", "Guard bottom: Ezekiel from closed guard when opponent's posture is broken"], "primary_counters": ["Frame against the elbow and create distance", "Grab the sleeve grip and strip it", "Bridge and roll before submission tightens"], "notable_practitioners": ["Ezekiel Paraguass\u00fa", "Bernardo Faria", "Keenan Cornelius"], "notes": "Named after Brazilian national judo champion Ezekiel Paraguass\u00fa. Unique in that it can be applied from inside closed guard (bottom player choking the top player). The no-gi version uses the forearm blade across the throat.", "position_entered_from": ["Mount", "Guard", "Side control"], "style_association": ["Sport BJJ", "Self-defense", "MMA"] }, { "id": 12, "name": "Loop choke", "aka": ["Collar drag choke", "loop"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Collar drag", "Closed guard gi", "Spider guard"], "common_setups": ["Collar drag motion \u2192 pull collar while stepping to side \u2192 loop around neck", "Standing \u2192 opponent reaches \u2192 loop collar over head", "Open guard \u2192 opponent postures \u2192 establish collar loop"], "primary_counters": ["Posture up immediately when collar is grabbed", "Two-on-one the gripping arm", "Step to the collar grip side"], "notable_practitioners": ["Caio Terra", "Michael Langhi", "Cobrinha"], "notes": "The collar creates a loop around the neck \u2014 pulling the lapel tightens the noose. Often catches opponents who are used to posturing up against standard collar grips. Works well as a reaction to posturing attempts.", "position_entered_from": ["Closed guard gi", "Open guard gi", "Standing gi"], "style_association": ["Gi sport BJJ", "Collar-sleeve guard systems"] }, { "id": 13, "name": "Von Flue choke", "aka": ["Von Flue", "VF choke"], "category": "Submission", "subcategory": "Choke", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["Guillotine choke", "Arm-in guillotine", "Side control", "Sprawl"], "common_setups": ["Side control \u2192 opponent attacks arm-in guillotine \u2192 flatten out \u2192 drive shoulder into neck", "Sprawl \u2192 opponent locks guillotine \u2192 post on mat \u2192 shoulder into carotid"], "primary_counters": ["Use standard guillotine, not arm-in, to prevent this counter", "Release guillotine and recover guard", "Switch to headlock position"], "notable_practitioners": ["Jason Von Flue", "Josh Thomson"], "notes": "A counter to the arm-in guillotine. When opponent locks an arm-in guillotine from bottom, top player flattens out and drives the point of their shoulder into the opponent's carotid. The opponent's own grip tightens the choke on themselves.", "position_entered_from": ["Side control top", "Sprawl"], "style_association": ["MMA", "No-gi submission wrestling"] }, { "id": 14, "name": "Peruvian necktie", "aka": ["Peruvian necktie"], "category": "Submission", "subcategory": "Choke", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "High", "related_techniques": ["Anaconda choke", "D'Arce choke", "Guillotine choke", "Japanese necktie"], "common_setups": ["Front headlock \u2192 thread arm under armpit like anaconda \u2192 step leg over back \u2192 pull up", "Anaconda grip established \u2192 step leg over back \u2192 rotate and crank", "Opponent turtles \u2192 lock front headlock \u2192 swing leg over"], "primary_counters": ["Fight the front headlock before it is established", "Roll toward opponent before leg steps over", "Posture up and drive forward"], "notable_practitioners": ["Tony Ferguson", "Eddie Bravo", "Eddie Cummings"], "notes": "Combines elements of the anaconda with a leg-over-the-back finish, creating both choke and neck crank pressure. Classified as high risk because it loads the cervical spine. Tap early \u2014 injury can occur before pain in some cases.", "position_entered_from": ["Front headlock", "Turtle top"], "style_association": ["No-gi submission wrestling", "MMA"] }, { "id": 15, "name": "Japanese necktie", "aka": ["Twister side control choke", "Japanese necktie"], "category": "Submission", "subcategory": "Choke", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "High", "related_techniques": ["Peruvian necktie", "Anaconda choke", "Twister"], "common_setups": ["Turtle top \u2192 front headlock \u2192 step leg across back \u2192 fall to side and crank", "Transition from guillotine attempt when opponent turtles", "Anaconda grip \u2192 leg over back \u2192 fall away rather than forward"], "primary_counters": ["Hand fight the headlock setup", "Sit out immediately", "Post foot and stand before leg steps over"], "notable_practitioners": ["Eddie Bravo", "Tony Ferguson"], "notes": "Related to Peruvian necktie but fallen to the opposite side. Has elements of neck crank and is considered high-risk. Some rulesets restrict or ban due to cervical spine loading.", "position_entered_from": ["Turtle top", "Front headlock"], "style_association": ["No-gi submission wrestling", "10th Planet"] }, { "id": 16, "name": "North-south choke", "aka": ["NS choke", "kata gatame variant"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Medium", "related_techniques": ["North-south position", "Kimura", "Arm triangle", "D'Arce choke"], "common_setups": ["North-south \u2192 swim near arm under neck \u2192 gable grip or S-grip \u2192 squeeze chest to chest", "Transition from side control by walking to NS", "Kimura attempt \u2192 opponent defends \u2192 transition to NS choke"], "primary_counters": ["Frame under chin before position is established", "Bridge and granby roll", "Walk hips out and recover guard"], "notable_practitioners": ["Marcelo Garcia", "Gordon Ryan", "Neil Melanson"], "notes": "The arm threading under the neck combined with body weight creates the choke. Chest-to-chest pressure is essential \u2014 the opponent's shoulder does the work on one side of the neck. Often set up from kimura attempts.", "position_entered_from": ["North-south position", "Side control"], "style_association": ["No-gi sport BJJ", "Wrestling-base BJJ"] }, { "id": 17, "name": "Arm triangle choke", "aka": ["Head and arm choke", "kata gatame"], "category": "Submission", "subcategory": "Choke", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Triangle choke", "Mount position", "D'Arce choke", "Anaconda choke"], "common_setups": ["Mount \u2192 push one arm across face \u2192 drop head to mat on trapped arm side \u2192 triangle with arms", "Side control \u2192 swim arm under neck \u2192 trap arm across face \u2192 walk to mount side", "Half guard \u2192 underhook battle \u2192 thread arm under neck"], "primary_counters": ["Keep arms close to body \u2014 never let one arm get isolated", "Bridge and roll toward the trapped arm", "Posture and pull arm free before the triangle locks"], "notable_practitioners": ["Roger Gracie", "Rickson Gracie", "Demian Maia"], "notes": "The arm triangle is the arm-based version of the triangle \u2014 the trapped arm's shoulder provides one side of the choke and the arm triangle provides the other. Must move to the non-trapped arm side to finish efficiently.", "position_entered_from": ["Mount", "Side control", "Half guard top"], "style_association": ["All styles", "Traditional BJJ", "MMA"] }, { "id": 18, "name": "Paper cutter choke", "aka": ["Paper cutter", "modified cross collar"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Baseball bat choke", "Bread cutter choke", "Side control gi"], "common_setups": ["Side control \u2192 far collar deep grip \u2192 near collar shallow grip \u2192 scissor hands", "Half guard top \u2192 underhook side \u2192 far collar \u2192 near lapel \u2192 scissor finish", "Knee on belly \u2192 drop to side control \u2192 establish paper cutter grips"], "primary_counters": ["Block the deep collar grip", "Bridge and roll before grips established", "Chin tuck aggressively"], "notable_practitioners": ["Bernardo Faria", "Xande Ribeiro"], "notes": "Both hands grip the collar in a scissoring action \u2014 one deep, one shallow \u2014 and the cutting motion of the hands creates the choke. Very effective when the opponent is defending other attacks and their collar is accessible.", "position_entered_from": ["Side control gi", "Half guard top gi"], "style_association": ["Gi sport BJJ", "IBJJF competition"] }, { "id": 19, "name": "Bread cutter choke", "aka": ["Bread cutter", "modified gi choke"], "category": "Submission", "subcategory": "Choke", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Paper cutter choke", "Baseball bat choke", "Side control gi"], "common_setups": ["Side control \u2192 far hand cross collar \u2192 near hand blade of wrist across neck \u2192 squeeze", "Mount \u2192 same grips as paper cutter but with more body weight", "Transition from failed baseball bat choke"], "primary_counters": ["Wrist control before blade is established", "Bridging to create space", "Chin tuck"], "notable_practitioners": ["Keenan Cornelius", "Caio Terra"], "notes": "The blade of the wrist acts as a cutting edge across the carotid while the deep collar grip reinforces the pressure. Less common than paper cutter but effective when opponent is defending with chin down.", "position_entered_from": ["Side control gi", "Mount gi", "Half guard top gi"], "style_association": ["Gi sport BJJ"] }, { "id": 20, "name": "Twister", "aka": ["Twister choke", "rodillo"], "category": "Submission", "subcategory": "Choke", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only", "body_target": "Spine", "risk_level": "High", "related_techniques": ["Truck position", "Back mount", "Peruvian necktie", "Truck roll"], "common_setups": ["Truck position \u2192 establish twister hooks \u2192 reach over shoulder for chin \u2192 crank", "Back mount \u2192 transition to truck \u2192 twister hooks \u2192 finish", "Wrestler's guillotine drill \u2192 twister entry"], "primary_counters": ["Never allow the truck position to be established", "Hand fight the over-shoulder grip", "Immediately defend before hooks are set"], "notable_practitioners": ["Eddie Bravo", "Shinya Aoki", "Ryan Hall"], "notes": "Spinal rotation submission \u2014 not purely a choke but involves twisting the spine while applying chin pressure. Illegal in IBJJF as a spinal lock. Eddie Bravo famously submitted Royler Gracie with this at ADCC 2003. Very rare in high-level competition.", "position_entered_from": ["Truck position", "Twister hook position"], "style_association": ["10th Planet system", "Eddie Bravo system"] }, { "id": 21, "name": "Gogoplata", "aka": ["Gogoplata", "shin choke"], "category": "Submission", "subcategory": "Choke", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Rubber guard", "Mission control", "Triangle choke", "Omoplata"], "common_setups": ["Rubber guard \u2192 mission control \u2192 New York \u2192 shoot shin across throat \u2192 pull head down", "Closed guard \u2192 extreme flexibility \u2192 shoot shin across \u2192 pull head", "Inverted guard \u2192 opponent passes \u2192 roll and shoot leg"], "primary_counters": ["Posture up aggressively before shin reaches throat", "Stack opponent", "Strip the shin grip and smash pass"], "notable_practitioners": ["Eddie Bravo", "Shinya Aoki", "Nick Diaz"], "notes": "Requires exceptional hip flexibility to execute consistently. The shin bone presses across the carotid arteries. More of a positional system endpoint (rubber guard) than a standalone technique. Rarely seen in competition due to flexibility requirements.", "position_entered_from": ["Rubber guard", "Guard bottom", "Inverted guard"], "style_association": ["10th Planet system", "Rubber guard system"] }, { "id": 22, "name": "Collar choke", "aka": ["Cross collar choke", "Juji jime"], "category": "Submission", "subcategory": "Choke", "skill_level": "Beginner", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Bow and arrow choke", "Loop choke", "Closed guard gi", "Mount gi"], "common_setups": ["Closed guard \u2192 break posture \u2192 deep cross grip \u2192 second hand deep grip \u2192 pull and crunch", "Mount \u2192 establish deep collar grips \u2192 sit up and pull \u2192 squeeze elbows together", "Back mount \u2192 reach for cross collar \u2192 second hand reinforces \u2192 squeeze"], "primary_counters": ["Posture up immediately to deny collar access", "Two-on-one grip strip", "Chin tuck aggressively and bridge"], "notable_practitioners": ["Roger Gracie", "Rickson Gracie", "Royler Gracie"], "notes": "One of the foundational gi submissions. Both hands grip inside the collar with thumbs pointing in. Pulling the elbows toward the mat while crunching forward creates the choke. Roger Gracie won multiple world titles finishing with this from mount.", "position_entered_from": ["Closed guard gi", "Mount gi", "Back mount gi"], "style_association": ["Traditional BJJ", "Gi sport BJJ", "Gracie academy"] }, { "id": 23, "name": "Wrist lock (choke variant)", "aka": ["Omoplata choke transition"], "category": "Submission", "subcategory": "Choke", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Neck", "risk_level": "Low", "related_techniques": ["Triangle choke", "Armbar"], "common_setups": ["Triangle locked \u2192 opponent tucks chin \u2192 shoot arm over opposite shoulder for armbar \u2192 transition to choke component"], "primary_counters": ["Tap to the triangle before secondary attacks are needed", "Posture and stack"], "notable_practitioners": [], "notes": "More of a transitional finish than a standalone technique. Used when the primary triangle is defended with a strong chin tuck.", "position_entered_from": ["Triangle choke", "Guard bottom"], "style_association": ["Sport BJJ"] }, { "id": 24, "name": "Armbar", "aka": ["Juji gatame", "cross armbar"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Elbow", "risk_level": "High", "related_techniques": ["Triangle choke", "Omoplata", "Kimura", "Guard bottom", "Mount"], "common_setups": ["Guard \u2192 push arm across \u2192 leg over head \u2192 hips up \u2192 extend", "Mount \u2192 step over head \u2192 control arm \u2192 fall back", "Side control \u2192 near arm isolated \u2192 step over and fall"], "primary_counters": ["Stack and posture up \u2192 walk around", "Hitchhiker escape: roll toward thumb and spin", "Grab own lapel or hand to delay \u2192 turn into opponent"], "notable_practitioners": ["Ronda Rousey", "Fabricio Werdum", "Rodolfo Vieira"], "notes": "The most fundamental joint lock in BJJ. Hyperextends the elbow joint. Hips must be on the elbow side of the arm \u2014 not the wrist. Thumbs pointing up = arm is in. Flying armbar is a high-risk high-reward standing variation. Tap before full extension \u2014 elbow pops fast.", "position_entered_from": ["Guard bottom", "Mount", "Side control"], "style_association": ["All styles", "Judo base BJJ", "Sport BJJ"] }, { "id": 25, "name": "Kimura", "aka": ["Gyaku ude garami", "figure-four shoulder lock"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Shoulder", "risk_level": "High", "related_techniques": ["Americana", "Omoplata", "North-south choke", "Half guard top", "Kimura trap system"], "common_setups": ["Guard \u2192 opponent posts arm \u2192 figure-four grip \u2192 sit up and rotate arm behind back", "Side control \u2192 near arm isolated \u2192 figure-four \u2192 walk toward head", "North-south \u2192 both hands on near arm \u2192 figure-four \u2192 rotate"], "primary_counters": ["Grab own belt or thigh immediately when isolated (kimura defense grip)", "Roll through toward opponent", "Posture and pull elbow down before figure-four is locked"], "notable_practitioners": ["Masahiko Kimura", "Gordon Ryan", "Marcelo Garcia"], "notes": "Named after Masahiko Kimura who submitted H\u00e9lio Gracie in 1951. Internal shoulder rotation submission. Finish: figure-four grip, drive elbow toward head, rotate hand toward the back. The kimura grip is foundational to many modern systems \u2014 it controls the arm for both submissions and positional tran", "position_entered_from": ["Guard bottom", "Side control top", "North-south"], "style_association": ["All styles", "Wrestling-base BJJ", "Half guard systems"] }, { "id": 26, "name": "Americana", "aka": ["Ude garami", "figure-four shoulder lock (external)"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Shoulder", "risk_level": "High", "related_techniques": ["Kimura", "Armbar", "Mount position", "Side control"], "common_setups": ["Mount \u2192 push arm to mat at 90 degrees \u2192 figure-four \u2192 sweep arm toward their hip", "Side control \u2192 near arm isolated on mat \u2192 figure-four \u2192 rotate toward feet", "Half guard top \u2192 flatten opponent \u2192 near arm \u2192 figure-four"], "primary_counters": ["Keep elbows glued to body \u2014 never let arm go flat", "Grab your own lapel or hand before figure-four is locked", "Bridge and roll to relieve pressure"], "notable_practitioners": ["Royce Gracie", "Demian Maia"], "notes": "External shoulder rotation \u2014 opposite direction to kimura. Classic beginner technique but effective at all levels when opponent's arm is flat on the mat. The arm must form an L-shape (90 degrees at elbow) for proper mechanics. Often transitions to kimura if opponent rolls.", "position_entered_from": ["Mount", "Side control top", "Half guard top"], "style_association": ["Traditional BJJ", "Self-defense", "All styles"] }, { "id": 27, "name": "Omoplata", "aka": ["Ashi sankaku garami", "shoulder from guard"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Shoulder", "risk_level": "Medium", "related_techniques": ["Triangle choke", "Armbar", "Spider guard", "Gogoplata", "Sweep from omoplata"], "common_setups": ["Spider guard \u2192 pull one arm \u2192 shoot leg over shoulder", "Triangle attempt defended \u2192 turn to side and swing leg over", "Butterfly guard \u2192 opponent underhooks \u2192 sit out and omoplata"], "primary_counters": ["Roll forward before sitting out", "Posture up and stack before leg clears the arm", "Stand up out of omoplata"], "notable_practitioners": ["Cobrinha", "Rafael Mendes", "Rubens Charles"], "notes": "Leg traps the opponent's arm behind them and shoulder lock is applied by sitting up and driving their wrist toward their hip. Highly versatile \u2014 functions as a sweep, submission, and back take entry. If opponent rolls forward, follow into the roll and maintain control to take the back.", "position_entered_from": ["Guard bottom", "Spider guard", "Inverted guard"], "style_association": ["Sport BJJ", "Guard systems", "All styles"] }, { "id": 28, "name": "Wrist lock", "aka": ["Kote gaeshi", "wristlock"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All (restricted in some IBJJF divisions)", "body_target": "Wrist", "risk_level": "High", "related_techniques": ["Armbar", "Kimura", "Spider guard"], "common_setups": ["Any grip \u2014 bend wrist inward (toward forearm) beyond natural range", "Spider guard \u2192 bend the foot-controlled wrist", "Mount \u2192 opponent pushes on face \u2192 grab the pushing hand and bend"], "primary_counters": ["Keep wrists straight and never post with a bent wrist", "Tuck chin and pull arm to body immediately", "Release the pushing frame"], "notable_practitioners": ["Caio Terra", "Paulo Miyao", "Keenan Cornelius"], "notes": "Illegal at white belt in IBJJF \u2014 allowed from blue belt up. Can happen accidentally when opponent posts on a bent wrist. Highly effective as a counter to frames and pushes. Injury occurs extremely fast \u2014 must know to tap early. Sometimes applied opportunistically from spider guard.", "position_entered_from": ["Guard bottom", "Mount", "Side control"], "style_association": ["Sport BJJ", "Judo base BJJ"] }, { "id": 29, "name": "Straight armlock", "aka": ["Ude garami straight", "standing armbar"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Elbow", "risk_level": "High", "related_techniques": ["Armbar", "Kimura", "Americana"], "common_setups": ["Grip opponent's arm at wrist and push straight elbow hyperextension upward", "Sprawl \u2192 opponent shoots single \u2192 straighten arm \u2192 hyperextend over thigh"], "primary_counters": ["Bend the elbow immediately", "Spin to face opponent", "Duck under"], "notable_practitioners": ["Bas Rutten"], "notes": "Straight arm hyperextension in any plane. Less common as a standalone submission but appears as a counter to wrestling shots and in clinch situations.", "position_entered_from": ["Standing", "Side control", "Guard bottom"], "style_association": ["Wrestling-base BJJ", "Self-defense", "Judo"] }, { "id": 30, "name": "Shoulder lock (tarikoplata)", "aka": ["Tarikoplata", "mounted omoplata"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Shoulder", "risk_level": "High", "related_techniques": ["Omoplata", "Kimura", "Armbar", "Side control"], "common_setups": ["Side control \u2192 arm isolated \u2192 thread leg over arm like omoplata from top \u2192 sit up and torque", "Mount \u2192 opponent defends with framing arm \u2192 leg over arm \u2192 tarikoplata lock"], "primary_counters": ["Keep elbows in and never let arm straighten", "Grab own leg to prevent the leg thread"], "notable_practitioners": ["Tarik Hopstock", "Garry Tonon"], "notes": "Named after Tarik Hopstock who popularized it. Applied from top positions using the leg to create the omoplata-like leverage. Very modern technique with limited defense understanding in the broader community.", "position_entered_from": ["Side control", "Mount", "Back mount"], "style_association": ["Modern no-gi sport BJJ"] }, { "id": 31, "name": "Bicep slicer", "aka": ["Bicep crusher", "arm crush"], "category": "Submission", "subcategory": "Joint lock", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (banned in IBJJF until brown/black belt)", "body_target": "Elbow", "risk_level": "High", "related_techniques": ["Armbar", "Triangle", "Calf slicer"], "common_setups": ["Triangle \u2192 arm not fully through \u2192 knee jams into bicep as compression", "Armbar setup \u2192 arm trapped at angle \u2192 knee/forearm into bicep", "Side control \u2192 arm isolated \u2192 knee into bicep"], "primary_counters": ["Tap early \u2014 injury can happen suddenly", "Keep arms fully extended in danger positions", "Pull arm free before compression is applied"], "notable_practitioners": ["Eddie Cummings", "Craig Jones"], "notes": "Compression lock \u2014 the bone or knee acts as a fulcrum against the soft tissue of the bicep and elbow. Illegal at lower IBJJF belt levels. Injury can occur before significant pain \u2014 tap quickly.", "position_entered_from": ["Guard bottom", "Mount", "Side control"], "style_association": ["Submission only", "ADCC-focused"] }, { "id": 32, "name": "Calf slicer", "aka": ["Calf crusher", "bicep slicer for legs"], "category": "Submission", "subcategory": "Leg lock", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (restricted IBJJF)", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Bicep slicer", "Heel hook", "Kneebar", "Single leg X"], "common_setups": ["SLX \u2192 opponent postures \u2192 thread leg through and compress calf", "Turtle attack \u2192 leg thread between legs \u2192 sit back and squeeze", "50/50 \u2192 transition when opponent straightens leg"], "primary_counters": ["Tap early \u2014 very high injury potential", "Keep legs bent and active", "Prevent leg thread before it is established"], "notable_practitioners": ["Eddie Cummings", "Geo Martinez"], "notes": "Compression of the calf against the knee joint. Very fast injury potential \u2014 the fibula and tibia can be compressed before significant pain signals. Illegal in IBJJF at most belt levels. Frequently appears in no-gi submission-only events.", "position_entered_from": ["Guard top", "Leg entanglements", "Single leg X"], "style_association": ["No-gi submission wrestling", "Leg lock systems"] }, { "id": 33, "name": "Heel hook", "aka": ["Inside heel hook (IHH)", "outside heel hook (OHH)"], "category": "Submission", "subcategory": "Leg lock", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (outside heel hook banned IBJJF; inside legal brown/black)", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Ashi garami", "Kneebar", "Toehold", "Saddle position", "50/50"], "common_setups": ["Ashi garami \u2192 cup the heel \u2192 rotate toward your hip (inside)", "Outside ashi \u2192 heel hook cup \u2192 rotate away from opponent (outside)", "50/50 \u2192 inside heel hook from equal position"], "primary_counters": ["Never straighten the trapped leg \u2014 keep knee bent", "Heel hook defense: step over and re-shell", "Knee shield to prevent ashi entry"], "notable_practitioners": ["Gordon Ryan", "Eddie Cummings", "Craig Jones"], "notes": "Rotates the knee joint beyond its natural range of motion. Inside heel hook rotates inward (medial); outside heel hook rotates outward (lateral) and is generally considered more dangerous. Injury to the ACL, MCL, and meniscus can occur very quickly \u2014 tap immediately when feeling pressure. The Danahe", "position_entered_from": ["Ashi garami", "Outside ashi", "50/50"], "style_association": ["Danaher Death Squad", "Leg lock systems", "ADCC-focused"] }, { "id": 34, "name": "Kneebar", "aka": ["Hiza hishigi", "knee bar"], "category": "Submission", "subcategory": "Leg lock", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (banned most IBJJF divisions)", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Heel hook", "Toehold", "Ashi garami", "Calf slicer"], "common_setups": ["Guard pass attempt \u2192 opponent kicks \u2192 step over leg \u2192 armbar mechanics on the knee", "50/50 \u2192 transition from heel hook \u2192 straighten and kneebar", "Standing \u2192 catch a kick \u2192 kneebar mechanics"], "primary_counters": ["Keep knee bent \u2014 never straighten the trapped leg", "Heel of the trapped leg points toward opponent", "Tuck chin and roll toward opponent"], "notable_practitioners": ["Ryan Hall", "Craig Jones", "Lachlan Giles"], "notes": "Hyperextends the knee \u2014 same mechanics as an armbar but applied to the leg. The hips drive the knee past its natural extension. Injury to the PCL and ACL can occur. Must straighten the leg to finish \u2014 keeping knee bent is the primary defense.", "position_entered_from": ["Guard passing", "Leg entanglements", "Open guard"], "style_association": ["ADCC-focused", "Submission only", "Leg lock systems"] }, { "id": 35, "name": "Toehold", "aka": ["Ashi kansetsu", "foot lock (toehold)"], "category": "Submission", "subcategory": "Leg lock", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (restricted IBJJF)", "body_target": "Ankle", "risk_level": "High", "related_techniques": ["Heel hook", "Ankle lock", "Kneebar", "Ashi garami"], "common_setups": ["Leg entanglement \u2192 figure-four grip on foot \u2192 rotate the foot away from opponent", "50/50 \u2192 switch from heel hook to toehold when opponent defends", "Outside ashi \u2192 reach for top of foot \u2192 figure-four \u2192 twist"], "primary_counters": ["Rotate the body in the same direction as the toehold to relieve pressure", "Keep ankle flexed \u2014 never let foot be isolated and extended", "Prevent the figure-four grip"], "notable_practitioners": ["Dean Lister", "Craig Jones", "Garry Tonon"], "notes": "Figure-four grip on the foot rotates the ankle and loads the ligaments of the ankle and knee. Different injury pathway from heel hook \u2014 loads the medial structures of the knee from the other direction. Knee injury is the main risk, not ankle injury as name implies.", "position_entered_from": ["Leg entanglements", "50/50", "Ashi garami"], "style_association": ["Leg lock systems", "ADCC-focused", "No-gi submission wrestling"] }, { "id": 36, "name": "Ankle lock", "aka": ["Straight ankle lock", "Achilles lock"], "category": "Submission", "subcategory": "Leg lock", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All (with conditions \u2014 IBJJF allows from blue belt no-gi)", "body_target": "Ankle", "risk_level": "Medium", "related_techniques": ["Heel hook", "Toehold", "Kneebar", "Ashi garami"], "common_setups": ["Ashi garami \u2192 blade of forearm under Achilles \u2192 squeeze and hip extension", "Guard passing \u2192 opponent kicks out \u2192 catch ankle and lock", "Single leg X \u2192 opponent defends heel hook \u2192 transition to ankle lock"], "primary_counters": ["Sit up and engage with the leg", "Turn hips toward opponent", "Knee line defense: protect the knee before ankle"], "notable_practitioners": ["Dean Lister", "Masakazu Imanari", "Nicky Rodriguez"], "notes": "The most beginner-accessible leg lock. The blade of the forearm sits on the Achilles tendon while hip extension levers the ankle. Often a gateway submission that teaches the mechanics of leg entanglements. Heel hooks are the more dangerous follow-up when ankle lock is defended.", "position_entered_from": ["Guard passing", "Leg entanglements", "Ashi garami"], "style_association": ["All styles", "Leg lock systems", "No-gi BJJ"] }, { "id": 37, "name": "Estima lock", "aka": ["Top foot lock", "Estima lock"], "category": "Submission", "subcategory": "Leg lock", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only", "body_target": "Ankle", "risk_level": "High", "related_techniques": ["Ankle lock", "Toehold", "Torreando pass"], "common_setups": ["Opponent uses foot to push hip \u2192 reach and grab top of foot \u2192 fold foot toward shin", "Torreando pass attempt \u2192 opponent frames with foot \u2192 grab top \u2192 crank"], "primary_counters": ["Never use the top of the foot to frame \u2014 use the shin or knee", "Remove the foot before grip is established", "Rotate toward opponent"], "notable_practitioners": ["Victor Estima", "Braulio Estima"], "notes": "Named after Victor Estima. Applied to the top of the foot when opponent posts with the dorsum of the foot. Folds the foot toward the shin, loading the top of the ankle. Happens very fast \u2014 injury can occur before opponent realizes the position is dangerous.", "position_entered_from": ["Guard passing", "Leg entanglement", "Open guard"], "style_association": ["Sport BJJ", "No-gi submission only"] }, { "id": 38, "name": "Inside heel hook", "aka": ["IHH", "ashi no hiza hishigi medial"], "category": "Leg Entanglement", "subcategory": "Leg lock", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (IBJJF brown/black no-gi only)", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Outside heel hook", "Ashi garami", "Kneebar", "Toehold", "Saddle position"], "common_setups": ["Ashi garami \u2192 armpit grips heel \u2192 rotate elbow toward ceiling (internal rotation)", "Honey hole \u2192 more powerful inside heel hook due to dominant position", "50/50 \u2192 inside heel hook from equal leg entanglement"], "primary_counters": ["Heel hook defense: step over the attacking leg with the free leg", "Never rotate away \u2014 rotate your whole body toward opponent instead", "Keep knee bent and engaged"], "notable_practitioners": ["Gordon Ryan", "Eddie Cummings", "Nicky Ryan"], "notes": "Medial rotation of the knee. The heel is cupped in the armpit and the elbow rotates toward the ceiling, creating internal rotation at the knee. ACL, MCL, and meniscus are all at risk. The Danaher system emphasizes the importance of understanding knee line \u2014 if the knee can't rotate, the ankle drives", "position_entered_from": ["Ashi garami", "Single leg X", "Honey hole / saddle"], "style_association": ["Danaher Death Squad", "Leg lock systems", "ADCC-focused"] }, { "id": 39, "name": "Outside heel hook", "aka": ["OHH", "ashi no hiza hishigi lateral"], "category": "Leg Entanglement", "subcategory": "Leg lock", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (banned IBJJF at all levels)", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Inside heel hook", "Ashi garami", "Kneebar", "50/50"], "common_setups": ["Outside ashi \u2192 cup heel \u2192 rotate elbow away from opponent (external rotation)", "50/50 \u2192 opponent turns away \u2192 transition to outside heel hook", "Front headlock \u2192 opponent turtles \u2192 sit to outside ashi \u2192 OHH"], "primary_counters": ["Straightening is safer than bending for OHH defense", "Keep heel pointing toward opponent", "Prevent outside ashi control from being established"], "notable_practitioners": ["Gordon Ryan", "Nicky Rod", "Craig Jones"], "notes": "External rotation of the knee \u2014 generally considered more dangerous than inside heel hook. The LCL, PCL, and posterolateral corner are at risk. Banned in IBJJF at all levels due to injury severity. Gordon Ryan has finished numerous elite-level opponents with this technique.", "position_entered_from": ["Outside ashi", "50/50", "Reverse ashi"], "style_association": ["Danaher Death Squad", "Leg lock systems", "ADCC elite competition"] }, { "id": 40, "name": "Closed guard", "aka": ["Full guard", "guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Hip bump sweep", "Scissor sweep", "Triangle choke", "Armbar", "Kimura", "Collar choke", "Guillotine"], "common_setups": ["Pull guard from standing", "Opponent passes to half \u2014 re-close legs", "Sprawl defense \u2014 lock legs around waist"], "primary_counters": ["Stand up to break guard", "Elbow-knee pass", "Stack pass \u2014 posture up and stack"], "notable_practitioners": ["Rickson Gracie", "Roger Gracie", "Demian Maia"], "notes": "The foundational BJJ position. Legs locked behind opponent's back, controlling posture and preventing standing. Three primary threats from closed guard: break posture for chokes/sweeps, create distance for triangles/armbars, or use underhook for sweeps. Losing effectiveness as game evolves toward op", "position_entered_from": ["Any bottom position", "Takedown defense", "Back taken \u2014 legs lock up"], "style_association": ["Traditional BJJ", "Self-defense", "MMA"] }, { "id": 41, "name": "Half guard", "aka": ["Half guard", "half mount bottom"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Deep half guard", "Z-guard / knee shield", "Dogfight", "Half guard sweep", "Lockdown", "Waiter sweep"], "common_setups": ["Closed guard \u2192 opponent passes one leg \u2192 lock remaining leg", "Side control escape \u2192 knee shield to half guard", "Takedown defense \u2014 catch one leg"], "primary_counters": ["Knee slice pass", "Smash pass", "Tilt pass to side control"], "notable_practitioners": ["Marcelo Garcia", "Tom DeBlass", "Neil Melanson"], "notes": "One leg trapped between opponent's legs. Foundation for a vast number of sub-systems: deep half, Z-guard, lockdown (10th Planet), dogfight/WT half. Underhook battle is the central conflict \u2014 who gets the underhook determines who attacks.", "position_entered_from": ["Closed guard \u2014 one leg released", "Guard pass defense", "Any bottom position"], "style_association": ["All styles", "Wrestling-base BJJ"] }, { "id": 42, "name": "Butterfly guard", "aka": ["Ashi garami guard", "hook guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Butterfly sweep", "X-guard", "Arm drag to back", "Butterfly guard pass", "Single leg X"], "common_setups": ["Sit up with hooks under opponent's thighs", "Transition from closed guard when opponent creates distance", "Pull guard to seated butterfly position"], "primary_counters": ["Smash the hooks to the mat (leg drag)", "Stay low and don't allow hooks to be inserted", "Backstep pass \u2014 step around hooks"], "notable_practitioners": ["Marcelo Garcia", "Jeff Glover", "Lucas Lepri"], "notes": "Hooks under opponent's inner thighs from seated position. Primary weapon is the butterfly sweep \u2014 using the hooks to off-balance and roll. Marcelo Garcia's system built around butterfly guard is perhaps the most refined in BJJ. Arm drags to the back are equally important from this position.", "position_entered_from": ["Seated open guard", "Half guard transition", "Open guard"], "style_association": ["No-gi BJJ", "Wrestling-base BJJ", "Marcelo Garcia system"] }, { "id": 43, "name": "X-guard", "aka": ["Ashi garami double hook", "X-guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Butterfly guard", "Single leg X", "X-guard sweep", "Ashi garami"], "common_setups": ["Butterfly guard \u2192 hook drops under one thigh \u2192 other leg hooks over top \u2192 X formed", "Single leg taken \u2192 drop to X-guard", "SLX transition \u2192 second hook inserted"], "primary_counters": ["Jump over the hook", "Knee cut through the hooks", "Backstep to remove hooks"], "notable_practitioners": ["Marcelo Garcia", "Rafael Mendes", "Bernardo Faria"], "notes": "Two hooks control one leg from below \u2014 one under the thigh, one over the thigh. Creates a powerful mechanical advantage for sweeping. The X-guard sweep tilts opponent backward while the guard player extends. Natural entry point to single leg X and ashi garami for leg lock systems.", "position_entered_from": ["Butterfly guard", "Single leg takedown defense", "Half guard"], "style_association": ["Modern sport BJJ", "Marcelo Garcia system", "Leg lock entries"] }, { "id": 44, "name": "Spider guard", "aka": ["Spider guard", "sleeve-foot guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Triangle from spider", "Omoplata from spider", "Lasso guard", "Collar-sleeve guard"], "common_setups": ["Grip both sleeves \u2192 place feet in biceps/elbows \u2192 extend legs to control posture", "Sit up guard \u2192 grab sleeves \u2192 place feet on biceps", "Recover to open guard \u2192 establish sleeve grips first"], "primary_counters": ["Push knees to mat to kill guard", "Backstep \u2014 free one bicep \u2192 pass", "Torreando: grab pants \u2192 remove feet"], "notable_practitioners": ["Cobrinha", "Rafael Mendes", "Lucas Lepri"], "notes": "Sleeve grips with feet in biceps create extreme control of posture and arm positioning. Feet on biceps extend to off-balance; feet on hips control distance. Highly effective in gi competition but non-transferable to no-gi. Requires strong grip strength and hip flexibility.", "position_entered_from": ["Open guard gi", "Closed guard opening"], "style_association": ["Gi sport BJJ", "IBJJF competition"] }, { "id": 45, "name": "De La Riva guard", "aka": ["DLR", "de la riva"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Berimbolo", "Reverse DLR", "DLR sweep", "Back take from DLR", "Kiss of the dragon"], "common_setups": ["Opponent stands \u2192 inside hook on lead leg from outside \u2192 collar or ankle grip", "Open guard \u2192 step in \u2192 hook around outside of lead leg", "Guard recovery from half \u2192 insert DLR hook"], "primary_counters": ["Torreando pass", "Knee cut \u2014 drive through the hook", "Long step pass"], "notable_practitioners": ["Ricardo De La Riva", "Rafael Mendes", "Leandro Lo"], "notes": "Ricardo De La Riva developed this system in the 1980s. The hook wraps the outside of the opponent's lead leg from the inside. Foundation for the modern sport BJJ back-take system \u2014 especially the berimbolo. Reverse DLR mirrors this on the inside leg.", "position_entered_from": ["Open guard", "Standing guard recovery"], "style_association": ["Modern sport BJJ", "IBJJF gi competition"] }, { "id": 46, "name": "Reverse De La Riva guard", "aka": ["RDLR", "reverse DLR"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["De La Riva guard", "Single leg X", "Ashi garami", "RDLR sweep", "Leg lock entries from RDLR"], "common_setups": ["DLR hook \u2192 opponent steps around \u2192 hook switches to inside", "Open guard \u2192 inside hook on lead leg", "Standing recovery \u2192 insert RDLR hook"], "primary_counters": ["Headquarters pass", "Leg drag", "Long step to side control"], "notable_practitioners": ["John Danaher", "Gordon Ryan", "Rafael Mendes"], "notes": "Mirror of DLR \u2014 hook is on the inside of the lead leg rather than outside. Primary entry point for the Danaher leg lock system \u2014 RDLR transitions naturally into single leg X (ashi garami), which opens heel hooks. Also used as a sweep guard.", "position_entered_from": ["Open guard", "DLR \u2014 opponent steps around hook"], "style_association": ["Modern sport BJJ", "Danaher leg lock entries"] }, { "id": 47, "name": "Lasso guard", "aka": ["Lasso", "sleeve wrap guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Spider guard", "Worm guard", "Triangle from lasso", "Omoplata from lasso", "Collar-sleeve guard"], "common_setups": ["Spider guard \u2192 thread one leg through sleeve grip \u2192 wrap around arm like a lasso", "Open guard \u2192 grip sleeve \u2192 swing leg over and through", "Collar-sleeve \u2192 convert one grip to lasso"], "primary_counters": ["Break the sleeve grip before lasso is established", "Step over the lasso leg", "Backstep pass"], "notable_practitioners": ["Keenan Cornelius", "Caio Terra", "Bruno Malfacine"], "notes": "The leg wraps around the opponent's arm inside the sleeve grip, creating a powerful hook that is difficult to remove. Provides strong control for triangles and omoplatas. Foundation for Keenan Cornelius's lapel guard systems including worm guard.", "position_entered_from": ["Spider guard", "Open guard gi"], "style_association": ["Gi sport BJJ", "IBJJF competition"] }, { "id": 48, "name": "Worm guard", "aka": ["Worm guard", "lapel guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Elite", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Lasso guard", "De La Riva guard", "Squid guard", "Reverse worm guard"], "common_setups": ["Lasso guard \u2192 grab opponent's own lapel \u2192 thread under their leg \u2192 back to guard", "DLR \u2192 reach for lapel \u2192 thread through and create lock"], "primary_counters": ["Break the lapel grip before threading \u2014 extremely difficult to break once established", "Stay tight and not allow lapel access", "Specific worm guard passes (requires training)"], "notable_practitioners": ["Keenan Cornelius"], "notes": "Keenan Cornelius invented and systematized the lapel guard family. The opponent's own lapel is threaded around their leg to create a powerful lock that requires specific knowledge to pass. Controversial in competition \u2014 some argue it slows the game. Keenan has dedicated entire instructionals to this", "position_entered_from": ["Lasso guard", "De La Riva guard", "Open guard gi"], "style_association": ["Keenan Cornelius system", "Modern gi sport BJJ"] }, { "id": 49, "name": "Rubber guard", "aka": ["Mission control", "new york"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Gogoplata", "Triangle from rubber guard", "Omoplata", "Twister entry", "Mission control"], "common_setups": ["Closed guard \u2192 break posture \u2192 pull leg to shoulder \u2192 establish mission control", "High guard \u2192 opponent postures slightly \u2192 pull leg high \u2192 lock in"], "primary_counters": ["Stack and smash", "Posture up before leg reaches shoulder", "Grip strip on the controlling leg"], "notable_practitioners": ["Eddie Bravo", "Tony Ferguson", "Nick Diaz"], "notes": "Eddie Bravo's system built around extreme flexibility and high guard control. Requires exceptional hip flexibility. Mission control (leg behind neck) \u2192 New York \u2192 Gogoplata is the primary finish sequence. Used effectively by Tony Ferguson in MMA. Less common in sport BJJ due to stalling concerns.", "position_entered_from": ["Closed guard", "High guard"], "style_association": ["10th Planet system", "Eddie Bravo system"] }, { "id": 50, "name": "Single leg X guard", "aka": ["SLX", "ashi garami"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["X-guard", "Ashi garami", "Heel hook entries", "SLX sweep", "Ankle lock from SLX"], "common_setups": ["X-guard \u2192 remove top hook \u2192 single hook under thigh", "RDLR \u2192 sit up \u2192 leg thread \u2192 SLX", "Butterfly guard \u2192 one hook drops \u2192 insert under thigh"], "primary_counters": ["Jump over the hook", "Knee cut through", "Backstep"], "notable_practitioners": ["Gordon Ryan", "Lachlan Giles", "Eddie Cummings"], "notes": "One hook under the thigh from a seated position. Primary entry point into ashi garami / heel hook system. Also functions as a sweep guard \u2014 lifting and off-balancing opponent. The Danaher system uses SLX as the primary gateway into the leg lock matrix.", "position_entered_from": ["X-guard", "Butterfly guard", "RDLR"], "style_association": ["Modern sport BJJ", "Danaher leg lock system", "No-gi competition"] }, { "id": 51, "name": "Deep half guard", "aka": ["Deep half", "deep half guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Half guard", "Electric chair sweep", "Back take from deep half", "Waiter sweep"], "common_setups": ["Half guard \u2192 underhook \u2192 drive under opponent's hips \u2192 wrap far leg", "Side control bottom \u2192 invert under \u2192 wrap far leg", "Guard pass attempt \u2192 dive under as opponent passes"], "primary_counters": ["Stay upright and never let opponent dive under hips", "Whizzer the underhooking arm", "Step over and sprawl to flatten opponent"], "notable_practitioners": ["Jeff Glover", "Brandon Mullins", "Jake Mackenzie"], "notes": "Guard player dives under opponent's hips, wrapping both arms around the far leg. Creates extremely powerful sweep leverage. Electric chair is the signature submission from this position. Jake Mackenzie has perhaps the most complete deep half game in competition.", "position_entered_from": ["Half guard", "Guard pass defense"], "style_association": ["Modern sport BJJ", "Jeff Glover system"] }, { "id": 52, "name": "Z-guard", "aka": ["Knee shield", "Z-guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Half guard", "Dogfight", "Situp sweep", "Z-guard sweep", "Homer Simpson sweep"], "common_setups": ["Half guard \u2192 insert knee shield across opponent's hip/chest as frame", "Side control \u2192 shrimp and create knee shield", "Elbow-knee escape \u2192 create knee shield before full guard is established"], "primary_counters": ["Tilt pass \u2014 drive knee shield to mat", "Headquarters pass \u2014 sit inside the knee shield", "Long step pass"], "notable_practitioners": ["Marcelo Garcia", "Tom DeBlass", "Craig Jones"], "notes": "The knee shield is a powerful frame that prevents opponent from flattening you out or passing. The Z-shape of the body (knee shield + body angle) creates the defensive structure. From here, coming up to the underhook is the primary goal to reach dogfight position.", "position_entered_from": ["Half guard", "Side control escape"], "style_association": ["No-gi BJJ", "Wrestling-base BJJ"] }, { "id": 53, "name": "Lockdown", "aka": ["Lockdown half guard", "Eddie Bravo lockdown"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Old school sweep", "Electric chair", "Whip-up", "Dogfight", "Half guard"], "common_setups": ["Half guard \u2192 foot-over-foot lockdown on trapped leg \u2192 extend hips to stretch", "Old school sweep failure \u2192 maintain lockdown"], "primary_counters": ["Knee slice through lockdown", "Stand up out of lockdown", "Whizzer and flatten opponent"], "notable_practitioners": ["Eddie Bravo", "Geo Martinez", "Richie Martinez"], "notes": "10th Planet signature control. Foot-over-foot lock on the trapped leg hyperextends and controls it, preventing opponent from using the leg to pass. Creates a platform for the full 10th Planet half guard system: old school sweep, electric chair, back take sequences.", "position_entered_from": ["Half guard"], "style_association": ["10th Planet system", "Eddie Bravo system"] }, { "id": 54, "name": "Collar-sleeve guard", "aka": ["Collar sleeve", "93 guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Spider guard", "Sit-up guard", "Triangle from collar-sleeve", "Berimbolo entry"], "common_setups": ["One collar grip \u2192 one sleeve grip \u2192 feet on hip and bicep", "Sit-up guard \u2192 establish collar and sleeve \u2192 insert feet"], "primary_counters": ["Break collar grip first", "Backstep pass", "Knee cut"], "notable_practitioners": ["Caio Terra", "Lucas Lepri", "Miyao brothers"], "notes": "One collar and one sleeve grip with feet as secondary controls. Highly versatile \u2014 transitions to spider, sit-up guard, berimbolo sequences. The sit-up and arm drag from this position is one of the most effective back-take entries in the gi.", "position_entered_from": ["Open guard gi", "Sit-up guard"], "style_association": ["Gi sport BJJ", "IBJJF competition"] }, { "id": 55, "name": "93 guard", "aka": ["Sit-up guard", "underhook guard"], "category": "Guard System", "subcategory": "Guard bottom", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Dogfight", "Sit-up sweep", "Arm drag to back", "Half guard", "Butterfly guard"], "common_setups": ["Half guard \u2192 get underhook \u2192 sit up \u2192 active guard game", "Open guard \u2192 sit up with underhook or collar grip", "Z-guard \u2192 come up to underhook \u2192 93 guard"], "primary_counters": ["Whizzer to counter underhook", "Underhook battle", "Circle behind to take back"], "notable_practitioners": ["Marcelo Garcia", "Matheus Diniz"], "notes": "Sitting up with an underhook from the bottom, threatening back takes and takedowns. The underhook is the primary weapon \u2014 it creates the dogfight position when both players are seated. Very active, wrestling-influenced guard game.", "position_entered_from": ["Half guard", "Open guard", "Collar-sleeve guard"], "style_association": ["No-gi BJJ", "Wrestling-base BJJ"] }, { "id": 56, "name": "Mount", "aka": ["Mounted position", "tate shiho gatame (partial)"], "category": "Position", "subcategory": "Top control", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Rear naked choke", "Armbar", "Collar choke", "Americana", "Ezekiel", "S-mount"], "common_setups": ["Side control \u2192 knee slide to mount", "Guard pass \u2192 drive knee through to mount", "Back mount \u2192 opponent turns \u2192 transition to mount"], "primary_counters": ["Upa / bridge and roll", "Elbow-knee escape to guard", "Half guard recovery"], "notable_practitioners": ["Roger Gracie", "Demian Maia", "Rickson Gracie"], "notes": "Sitting on opponent's chest or belly, knees on the mat beside their hips. Highest control position in BJJ after back mount. High mount (close to head) is more controlling but harder to hold; low mount is more stable. S-mount is an advanced variation that threatens armbar and triangle simultaneously.", "position_entered_from": ["Side control", "Guard pass", "Back mount"], "style_association": ["All styles", "Traditional BJJ", "MMA"] }, { "id": 57, "name": "Back mount", "aka": ["Rear mount", "back control"], "category": "Position", "subcategory": "Top control", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Rear naked choke", "Bow and arrow choke", "Body triangle", "Seatbelt control"], "common_setups": ["Take back via arm drag", "Back take from dogfight", "Berimbolo back take"], "primary_counters": ["Seatbelt strip \u2014 shoulder walk escape", "Hip escape to half guard", "Roll opponent over"], "notable_practitioners": ["Marcelo Garcia", "Gordon Ryan", "Andre Galvao"], "notes": "Chest to back, hooks in or body triangle. Most dominant position in BJJ \u2014 4 points in gi competition, back mount in no-gi. The seatbelt grip (top arm over chest, bottom arm under armpit) is the standard control. Body triangle replaces hooks for more secure control. Point of departure for RNC and bow", "position_entered_from": ["Back take", "Turtle", "Sweep"], "style_association": ["All styles", "No-gi BJJ", "MMA"] }, { "id": 58, "name": "Side control", "aka": ["Kesa gatame (partial)", "cross body"], "category": "Position", "subcategory": "Top control", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Kimura", "Americana", "D'Arce choke", "Arm triangle", "Knee on belly", "North-south"], "common_setups": ["Any guard pass finish", "Double leg takedown \u2192 sprawl to side control", "Sweep opponent to side control"], "primary_counters": ["Frame and shrimp to guard", "Granby roll", "Come to knees (turtle)"], "notable_practitioners": ["Xande Ribeiro", "Bernardo Faria", "Robert Drysdale"], "notes": "Hip to hip with opponent, perpendicular to their body. Near side arm traps opponent's far arm or neck. Multiple grips possible: crossface + underhook, crossface + hip, kesa gatame. Standard starting point for submission attacks and mount transitions.", "position_entered_from": ["Guard pass", "Takedown", "Sweep"], "style_association": ["All styles"] }, { "id": 59, "name": "North-south position", "aka": ["North-south", "kami shiho gatame"], "category": "Position", "subcategory": "Top control", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["North-south choke", "Kimura from NS", "D'Arce from NS", "Side control"], "common_setups": ["Side control \u2192 walk to head \u2192 north-south", "Kimura from guard \u2014 roll to north-south", "Turtle top \u2014 circle to north-south"], "primary_counters": ["Bridge and roll", "Granby roll", "Frame and shrimp to half guard"], "notable_practitioners": ["Marcelo Garcia", "Robert Drysdale"], "notes": "Head above opponent's head, hips above opponent's chin. Primary attack from here is the north-south choke and kimura. Less stable than side control for beginners \u2014 hips must be heavy and chest pressure maintained. Difficult for opponent to escape due to lack of frames.", "position_entered_from": ["Side control", "Kimura attempt"], "style_association": ["Wrestling-base BJJ", "No-gi BJJ"] }, { "id": 60, "name": "Knee on belly", "aka": ["Knee on stomach", "knee ride"], "category": "Position", "subcategory": "Top control", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Side control", "Armbar from KOB", "Baseball bat choke", "Mount"], "common_setups": ["Side control \u2192 post foot on mat \u2192 slide knee to belly", "Guard pass \u2014 land in knee on belly", "Transition from mount to KOB"], "primary_counters": ["Push knee away and recover guard", "Bridge into the knee", "Roll away"], "notable_practitioners": ["Leandro Lo", "Romulo Barral", "Bernardo Faria"], "notes": "One knee drives into the opponent's midsection while the other foot posts on the mat. 2 points in IBJJF competition. Creates tremendous discomfort and forces opponent to react \u2014 creating openings for armbars and chokes. A mobile position \u2014 used to transition between side control and mount.", "position_entered_from": ["Side control", "Guard pass"], "style_association": ["Sport BJJ", "MMA", "All styles"] }, { "id": 61, "name": "Crucifix", "aka": ["Crucifix position", "reverse crucifix"], "category": "Position", "subcategory": "Top control", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Turtle position", "Arm triangle from crucifix", "Neck crank from crucifix", "Back mount"], "common_setups": ["Turtle top \u2192 near arm trapped with legs \u2192 far arm controlled \u2192 crucifix", "Back mount \u2192 step arm over and lock with leg \u2192 crucifix"], "primary_counters": ["Fight the arm trap before both are controlled", "Roll into opponent", "Come to knees before second arm is trapped"], "notable_practitioners": ["Neil Melanson", "Garry Tonon"], "notes": "Both opponent's arms are controlled \u2014 one trapped by legs, one controlled by hands. Creates a highly vulnerable position for submissions including neck cranks, arm triangles, and chokes. Relatively rare in competition but devastating when achieved.", "position_entered_from": ["Turtle top", "Back mount"], "style_association": ["Wrestling-base BJJ", "No-gi submission wrestling"] }, { "id": 62, "name": "Body triangle", "aka": ["Body triangle", "leg triangle on body"], "category": "Position", "subcategory": "Top control", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Back mount", "Rear naked choke", "Bow and arrow choke"], "common_setups": ["Back mount hooks \u2192 remove one hook \u2192 figure-four legs around midsection", "Transition from double hooks when opponent defends one hook"], "primary_counters": ["Create space with elbow into the knee", "Hip escape before triangle is locked", "Roll opponent to relieve pressure"], "notable_practitioners": ["Gordon Ryan", "Roger Gracie"], "notes": "Replaces back mount hooks with a triangle figure-four around the opponent's midsection. More secure than hooks \u2014 cannot be simply removed. The squeezing pressure is a submission threat itself (rib/organ pressure). Combined with RNC is extremely difficult to escape.", "position_entered_from": ["Back mount"], "style_association": ["Back mount specialists", "No-gi BJJ", "MMA"] }, { "id": 63, "name": "Turtle position (defensive)", "aka": ["Turtle", "all-fours"], "category": "Position", "subcategory": "Defensive", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Sit-out escape", "Granby roll", "Back take from turtle", "Anaconda choke", "Clock choke"], "common_setups": ["Guard passed \u2192 roll to knees", "Takedown attempted \u2192 drop to turtle", "Side control \u2192 come to knees to prevent mount"], "primary_counters": ["Opponent attacks back directly", "Clock choke / bow and arrow", "Anaconda / D'Arce choke"], "notable_practitioners": ["Keenan Cornelius", "Jake Shields"], "notes": "Defensive position on all fours. Protects against most submissions but is vulnerable to back takes and front headlock attacks. The goal from turtle is to either sit out/switch (wrestling escape) or granby roll to create space. Staying in turtle too long invites back control.", "position_entered_from": ["Guard pass defense", "Takedown defense", "Side control escape"], "style_association": ["All styles", "Wrestling-base BJJ"] }, { "id": 64, "name": "50/50 position", "aka": ["50/50", "fifty-fifty"], "category": "Leg Entanglement", "subcategory": "Leg control", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Inside heel hook", "Outside heel hook", "Ashi garami", "Saddle position"], "common_setups": ["Heel hook attempt \u2192 opponent defends \u2192 mutual leg entanglement", "DLR \u2192 leg cross \u2192 50/50", "SLX \u2192 opponent counters \u2192 mutual position"], "primary_counters": ["Escape before 50/50 is locked \u2014 it is very difficult to improve position once equal", "Inside heel hook is the primary attack", "Toehold as secondary"], "notable_practitioners": ["Gordon Ryan", "Eddie Cummings", "Garry Tonon"], "notes": "Symmetrical leg entanglement \u2014 both players have equal leg control. Often leads to heel hook exchanges. Points-based scoring often disadvantages 50/50 play as neither player scores. The dominant player is whoever better understands the heel hook mechanics from equal positions.", "position_entered_from": ["Leg entanglement exchanges", "DLR", "Heel hook defense"], "style_association": ["Leg lock systems", "Modern no-gi BJJ", "ADCC competition"] }, { "id": 65, "name": "Saddle position", "aka": ["411", "honey hole"], "category": "Leg Entanglement", "subcategory": "Leg control", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only", "body_target": "Full body", "risk_level": "High", "related_techniques": ["Inside heel hook", "Kneebar", "Toehold", "50/50", "Ashi garami"], "common_setups": ["SLX \u2192 step over for inside heel \u2192 complete saddle", "Heel hook attempt \u2192 step over top leg \u2192 411 lock", "RDLR transition \u2192 insert both legs"], "primary_counters": ["Outside heel hook counter attack before locked", "Prevent second leg from crossing over", "Hand fight to prevent heel cup"], "notable_practitioners": ["Gordon Ryan", "Eddie Cummings", "John Danaher"], "notes": "The 411 (four-one-one) / honey hole is the dominant leg entanglement position. Both legs are inside the opponent's \u2014 the outside leg hooks over, the inside leg hooks under. Creates the highest-percentage inside heel hook and is asymmetric, giving attacker advantage. Gordon Ryan has made this the cen", "position_entered_from": ["Leg entanglement", "RDLR", "Single leg X"], "style_association": ["Danaher Death Squad", "Leg lock specialists", "ADCC elite"] }, { "id": 66, "name": "Ashi garami", "aka": ["Single leg X", "leg knot"], "category": "Leg Entanglement", "subcategory": "Leg control", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Heel hook", "Ankle lock", "Single leg X", "Outside ashi", "Saddle"], "common_setups": ["RDLR \u2192 sit up \u2192 thread second leg \u2192 ashi garami", "SLX \u2192 more upright position with full leg lock entry", "Guard pass attempt caught \u2192 sit back to ashi"], "primary_counters": ["Step over the hook", "Knee shield to prevent entry", "Jump over"], "notable_practitioners": ["Masakazu Imanari", "Gordon Ryan", "John Danaher"], "notes": "The fundamental leg entanglement \u2014 one hook under the thigh from the outside. Primary attacking position for ankle locks. The entry point for the entire Danaher leg lock system. Imanari roll is a spinning entry to ashi garami from standing.", "position_entered_from": ["RDLR", "SLX guard", "Guard passing"], "style_association": ["Danaher leg lock system", "No-gi BJJ", "Judo origin"] }, { "id": 67, "name": "Hip bump sweep", "aka": ["Sit-up sweep", "hip bump"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Scissor sweep", "Kimura from guard", "Triangle from failed sweep", "Closed guard"], "common_setups": ["Closed guard \u2192 opponent postures up \u2192 sit up explosively \u2192 post hand \u2192 rotate hips through", "Set up with kimura attempt \u2014 opponent posts hand to defend \u2192 hip bump that hand", "Collar grip \u2192 pull \u2192 opponent resists \u2192 sit up into hip bump"], "primary_counters": ["Post the arm to the mat", "Base wide with knees", "Post the head to the mat"], "notable_practitioners": ["Rickson Gracie", "Demian Maia"], "notes": "The sit-up sweep. Drive hips through explosively \u2014 the power comes from sitting to your hip and driving through, not from pulling with your arms. Works best when opponent is posturing up. Naturally chains with the kimura \u2014 if they post to stop the sweep, attack the posted arm.", "position_entered_from": ["Closed guard"], "style_association": ["All styles", "Traditional BJJ"] }, { "id": 68, "name": "Scissor sweep", "aka": ["Kani basami (variation)", "scissor sweep"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Hip bump sweep", "Flower sweep", "Collar-sleeve guard", "Closed guard"], "common_setups": ["Open guard \u2192 one foot on hip \u2192 other foot on thigh \u2192 scissor legs", "Closed guard \u2192 open \u2192 establish scissor position \u2192 chop", "Collar-sleeve \u2192 pull sleeve down \u2192 scissor legs"], "primary_counters": ["Base wide", "Post the free leg", "Backstep away from sweep"], "notable_practitioners": ["Royce Gracie", "Jean Jacques Machado"], "notes": "One leg pushes at the hip, other leg chops behind the knee, creating a scissoring action that destroys balance. The collar-sleeve version is more common in modern gi \u2014 sleeve controls the arm while the scissor action is applied. Must control the sleeve to prevent the post.", "position_entered_from": ["Closed guard"], "style_association": ["Traditional BJJ", "All styles"] }, { "id": 69, "name": "Flower sweep", "aka": ["Pendulum sweep", "flower sweep"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Hip bump sweep", "Scissor sweep", "Closed guard", "Omoplata"], "common_setups": ["Closed guard \u2192 opponent leans forward \u2192 hook leg behind knee \u2192 pendulum swing \u2192 reverse", "Failed hip bump sweep \u2192 arm isolated \u2192 grab arm \u2192 pendulum opposite leg"], "primary_counters": ["Base with both knees \u2014 don't lean forward", "Remove arm from isolation", "Post the free leg"], "notable_practitioners": ["Royce Gracie", "Renzo Gracie"], "notes": "Uses a pendulum kicking motion of one leg to create rotational momentum while gripping the arm. The leg swings from behind the knee in an arc \u2014 the power comes from the pendulum motion, not from leg strength. Transitions naturally to omoplata if opponent rolls forward.", "position_entered_from": ["Closed guard"], "style_association": ["Traditional BJJ", "All styles"] }, { "id": 70, "name": "Butterfly sweep", "aka": ["Hook sweep", "butterfly sweep"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Butterfly guard", "Arm drag", "X-guard", "Elevator sweep"], "common_setups": ["Butterfly guard \u2192 establish underhook \u2192 lift hook while controlling far side \u2192 roll over hook", "Butterfly guard \u2192 arm drag \u2192 sweep over dragged arm side", "Sit-up guard \u2192 establish underhook \u2192 butterfly hook elevates"], "primary_counters": ["Post the hand", "Crossface to flatten", "Go to the side being swept"], "notable_practitioners": ["Marcelo Garcia", "Lucas Lepri"], "notes": "The primary butterfly guard sweep. Underhook controls the far side, hook lifts the near side. The key mechanic is connecting the underhook to the hook lift \u2014 when the underhook rises, the hook follows. Marcelo Garcia's butterfly sweep is the definitive version.", "position_entered_from": ["Butterfly guard"], "style_association": ["No-gi BJJ", "Marcelo Garcia system"] }, { "id": 71, "name": "Berimbolo", "aka": ["Inversion sweep", "berimbolo back take"], "category": "Sweep", "subcategory": "Guard sweep / back take", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["De La Riva guard", "Kiss of the dragon", "Back take", "Collar-sleeve guard"], "common_setups": ["DLR \u2192 grip sleeve and ankle \u2192 invert under hips \u2192 hook over near hip \u2192 back take", "Collar-sleeve \u2192 pull to off-balance \u2192 invert \u2192 berimbolo rotation"], "primary_counters": ["Step over before the rotation completes", "Sit to the floor and flatten", "Specific anti-berimbolo pressure from passing"], "notable_practitioners": ["Rafael Mendes", "Guilherme Mendes", "Paulo Miyao"], "notes": "The Mendes Brothers systematized the berimbolo in the early 2010s, transforming modern gi competition. An inversion from DLR that threads under the opponent to emerge behind them. Requires significant inversion ability and timing. Kiss of the dragon is the counter-berimbolo.", "position_entered_from": ["De La Riva guard", "Collar-sleeve guard"], "style_association": ["Modern sport BJJ", "Mendes Brothers system", "IBJJF competition"] }, { "id": 72, "name": "X-guard sweep", "aka": ["X-sweep", "X-guard tilt"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["X-guard", "Single leg X", "Butterfly sweep", "Ashi garami entries"], "common_setups": ["X-guard \u2192 angle foot on hip outward \u2192 other foot pushes \u2192 tilt opponent back", "SLX \u2192 extend both hooks \u2192 opponent falls back \u2192 come up"], "primary_counters": ["Jump over the hook", "Knee cut", "Hop to the extended side"], "notable_practitioners": ["Marcelo Garcia", "Bernardo Faria"], "notes": "The extension of both X-guard hooks simultaneously creates a powerful mechanical tilt. The outer foot pushes the hip, the inner foot lifts the thigh \u2014 coordinated extension tilts opponent backward.", "position_entered_from": ["X-guard", "Single leg X"], "style_association": ["Sport BJJ", "Marcelo Garcia system"] }, { "id": 73, "name": "De La Riva sweep", "aka": ["DLR sweep", "tripod sweep variation"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["De La Riva guard", "Berimbolo", "Back take from DLR", "Tripod sweep"], "common_setups": ["DLR \u2192 grip ankle and collar \u2192 push hip foot \u2192 tilt forward", "DLR \u2192 sickle sweep variation: ankle grip \u2192 push knee back while pulling ankle"], "primary_counters": ["Post the free hand", "Backstep to remove hook", "Drive knee through"], "notable_practitioners": ["Ricardo De La Riva", "Cobrinha"], "notes": "Multiple sweep options from DLR \u2014 push ankle away while pulling collar, or sickle the ankle. The DLR hook provides the mechanical advantage for tilting the opponent.", "position_entered_from": ["De La Riva guard"], "style_association": ["Modern sport BJJ gi"] }, { "id": 74, "name": "Electric chair sweep", "aka": ["Electric chair", "calf slicer sweep"], "category": "Sweep", "subcategory": "Guard sweep / submission threat", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "ADCC / Submission only (compression lock aspect)", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Deep half guard", "Lockdown", "Calf slicer", "Waiter sweep"], "common_setups": ["Deep half \u2192 reach through legs \u2192 far leg ankle grip \u2192 extend hips for compression + sweep", "Lockdown \u2192 vaporizer position \u2192 electric chair extension"], "primary_counters": ["Never let both arms come through the far leg", "Crossface pressure to prevent electric chair entry", "Whizzer to prevent deep half entry"], "notable_practitioners": ["Eddie Bravo", "Jeff Glover", "Jake Mackenzie"], "notes": "The electric chair is both a sweep and a leg lock threat \u2014 the spine extends against the knee while creating the sweep. The leg compression component makes it illegal under IBJJF rules as a calf slicer. Highly effective in submission-only formats.", "position_entered_from": ["Deep half guard", "Lockdown (10th Planet)"], "style_association": ["10th Planet system", "Deep half guard specialists"] }, { "id": 75, "name": "Waiter sweep", "aka": ["Waiter sweep", "leg underhook sweep"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Deep half guard", "Electric chair", "Half guard sweeps"], "common_setups": ["Half guard \u2192 underhook far leg \u2192 extend leg up like a waiter's tray \u2192 opponent falls forward", "Deep half \u2192 reach for far ankle \u2192 lift and sweep"], "primary_counters": ["Sprawl to prevent underhook", "Post free hand", "Step over the lifting leg"], "notable_practitioners": ["Jeff Glover", "Jake Mackenzie"], "notes": "The far leg is controlled and lifted like a waiter carrying a tray \u2014 hence the name. This off-balances the opponent forward over the guard player. Common finish is to come up behind for back control.", "position_entered_from": ["Half guard", "Deep half guard"], "style_association": ["Half guard specialists", "No-gi BJJ"] }, { "id": 76, "name": "Homer Simpson sweep", "aka": ["Old school sweep", "knee shield sweep"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Z-guard", "Half guard", "Dogfight", "Knee shield"], "common_setups": ["Z-guard \u2192 underhook on near arm \u2192 knee shield push \u2192 roll over knee shield side", "Knee shield \u2192 drive opponent back \u2192 switch base and come on top"], "primary_counters": ["Tilt the knee shield down before opponent can push", "Underhook battle \u2014 don't let them control the arm", "Post far arm"], "notable_practitioners": ["Tom DeBlass", "Craig Jones"], "notes": "Named because of the tumbling motion that resembles Homer Simpson falling. The knee shield creates a frame that when opponent pushes into, allows the guard player to roll through to top position.", "position_entered_from": ["Z-guard / knee shield half guard"], "style_association": ["Half guard systems", "Wrestling-base BJJ"] }, { "id": 77, "name": "Sit-up sweep", "aka": ["Technical stand-up sweep", "sit-up guard sweep"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Butterfly guard", "93 guard", "Arm drag", "Dogfight"], "common_setups": ["Butterfly guard \u2192 underhook \u2192 single leg \u2192 shoot \u2192 complete takedown", "Sit-up guard \u2192 underhook battle won \u2192 technical stand-up and shoot"], "primary_counters": ["Whizzer to counter the underhook", "Sprawl on the shot", "Underhook battle \u2014 stay on top of the underhook"], "notable_practitioners": ["Marcelo Garcia", "Jake Shields"], "notes": "Come to sitting position with underhook, then shoot to single or double leg. Bridges guard game and takedown game \u2014 the sit-up creates enough distance and angle to execute a takedown from the bottom.", "position_entered_from": ["Butterfly guard", "Half guard", "Sit-up guard"], "style_association": ["Wrestling-base BJJ", "No-gi BJJ"] }, { "id": 78, "name": "Torreando sweep / reversal", "aka": ["Bullfighter guard pass reversal"], "category": "Sweep", "subcategory": "Guard recovery / reversal", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Torreando pass", "Guard recovery", "Open guard"], "common_setups": ["Opponent grabs legs for torreando \u2192 grab their wrists \u2192 pull and come to knees", "Pants grips applied \u2192 shrimp hard away \u2192 grab wrists \u2192 reverse"], "primary_counters": ["Maintain momentum \u2014 don't pause during the torreando", "Release leg grip quickly"], "notable_practitioners": ["Caio Terra", "Lucas Lepri"], "notes": "Counter to the torreando pass \u2014 when opponent has leg grips, pulling their wrists and coming to knees reverses position. Timing is key \u2014 must move before they circle to the side.", "position_entered_from": ["Open guard \u2014 opponent performing torreando pass"], "style_association": ["Sport BJJ", "Guard recovery systems"] }, { "id": 79, "name": "Tripod sweep", "aka": ["Tripod", "tripod sweep"], "category": "Sweep", "subcategory": "Guard sweep", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["De La Riva guard", "Sickle sweep", "Hook sweep", "Open guard"], "common_setups": ["One foot on hip \u2192 other foot on knee \u2192 grip ankle \u2192 push hip foot while pulling ankle"], "primary_counters": ["Pull the ankle grip free", "Hop over the leg", "Step backward"], "notable_practitioners": ["Cobrinha", "Rafael Mendes"], "notes": "Classic open guard sweep. One foot on hip controls distance, other foot on knee assists with the sweep, ankle grip completes the triangle of control. Very effective against standing opponents.", "position_entered_from": ["Open guard", "De La Riva guard"], "style_association": ["Modern sport BJJ", "All styles"] }, { "id": 80, "name": "Torreando pass", "aka": ["Bullfighter pass", "torreando"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Knee slice pass", "Open guard", "Leg drag", "Side control"], "common_setups": ["Grab both ankles/pants \u2192 push legs to one side \u2192 step around to side control", "Grip both knees \u2192 pivot legs away \u2192 walk to side control", "Grip one pant leg \u2192 push knee across \u2192 circle to pass"], "primary_counters": ["Hip escape away from pass direction", "Grab the passer's wrists and reverse", "Re-guard with hook"], "notable_practitioners": ["Leandro Lo", "Bernardo Faria", "Rubens Charles"], "notes": "Named after the bullfighter (toreador). Push legs to one side and circle the opposite direction. The key is keeping the opponent's legs away from you as you circle. One of the most fundamental passing techniques \u2014 high percentage and relatively low risk.", "position_entered_from": ["Standing vs open guard", "Kneeling vs open guard"], "style_association": ["All styles", "Sport BJJ", "MMA"] }, { "id": 81, "name": "Knee slice pass", "aka": ["Knee cut pass", "knee slice"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Torreando pass", "Half guard top", "Side control", "Over-under pass"], "common_setups": ["Underhook near side \u2192 knee slices through guard from hip to hip \u2192 finish to side control", "Crossface \u2192 knee slides through the gap between opponent's legs", "From headquarters: knee slices through while maintaining crossface"], "primary_counters": ["Knee shield to block the slice", "Re-guard by pulling knee in", "Underhook to sit-up guard"], "notable_practitioners": ["Bernardo Faria", "Xande Ribeiro", "Tom DeBlass"], "notes": "The knee drives from the hip across the thigh to the mat. Crossface and underhook control the upper body while the knee works. One of the most universal passes \u2014 works from standing, kneeling, and in half guard. The knee must stay in contact and pressure throughout.", "position_entered_from": ["Half guard top", "Open guard", "Headquarters position"], "style_association": ["All styles", "Pressure passing"] }, { "id": 82, "name": "Over-under pass", "aka": ["Over-under", "OU pass"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Knee slice pass", "Double under pass", "Side control", "Headquarters position"], "common_setups": ["One arm over one thigh \u2192 other arm under the other thigh \u2192 drive hips through \u2192 circle to side control", "Headquarters position \u2192 establish over-under grips \u2192 pressure forward"], "primary_counters": ["Hip escape to create distance", "Triangle as opponent pressures", "Go to back when OU is established"], "notable_practitioners": ["Bernardo Faria", "Rodolfo Vieira", "Erberth Santos"], "notes": "One arm goes over the near thigh, one arm threads under the far thigh. Creates a powerful pinching action that controls both legs simultaneously. The over-under grip allows driving through the guard with body weight. Bernardo Faria built his entire game around this pass.", "position_entered_from": ["Seated guard", "Open guard", "Half guard top"], "style_association": ["Pressure passing", "Bernardo Faria system"] }, { "id": 83, "name": "Double under pass", "aka": ["Stack pass", "double under"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Over-under pass", "Triangle choke defense", "Stack pass", "Side control"], "common_setups": ["Both arms thread under both thighs \u2192 stack opponent on shoulders \u2192 walk hips around \u2192 side control", "Triangle defense: stack the triangle and walk around"], "primary_counters": ["Hip escape before being stacked", "Granby roll while stacked", "Grab the neck to prevent stacking"], "notable_practitioners": ["Rodolfo Vieira", "Bernardo Faria", "Xande Ribeiro"], "notes": "Both arms scoop under both thighs and stack opponent's hips above their shoulders. Very effective against triangle attacks. The stacking removes opponent's ability to hip escape. Finish by walking around the head to side control.", "position_entered_from": ["Open guard", "Guard pass attempt"], "style_association": ["Sport BJJ", "Pressure passing"] }, { "id": 84, "name": "Leg drag pass", "aka": ["Leg drag", "leg pull pass"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Torreando pass", "DLR guard", "Side control", "Back take from leg drag"], "common_setups": ["Grab near leg \u2192 drag across to mat on opposite side \u2192 chest down to pin \u2192 walk to side control", "DLR \u2192 remove hook \u2192 drag leg across \u2192 pin \u2192 pass"], "primary_counters": ["Hip escape away before leg is dragged", "Frame and create space", "Pull guard back"], "notable_practitioners": ["Leandro Lo", "Rafael Mendes", "Lucas Lepri"], "notes": "Drag one of opponent's legs to the mat across the body's centerline, then establish a chest-to-thigh connection. This pins the leg and collapses the guard structure. Very effective in no-gi because there are no pants grips for the guard player to recover with.", "position_entered_from": ["Open guard", "De La Riva guard", "Spider guard"], "style_association": ["Modern sport BJJ", "No-gi BJJ"] }, { "id": 85, "name": "Smash pass", "aka": ["Body weight pass", "pressure pass"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Half guard top", "Tilt pass", "Over-under pass", "Side control"], "common_setups": ["Half guard top \u2192 flatten opponent \u2192 crossface \u2192 smash knee shield down \u2192 tilt pass", "General: drive weight into opponent and flatten \u2192 lateral pass", "Underhook battle won \u2192 chest pressure \u2192 walk around"], "primary_counters": ["Never allow flattening \u2014 stay on side and maintain frames", "Hip escape when pressure is applied", "Come to knees"], "notable_practitioners": ["Xande Ribeiro", "Tom DeBlass", "Bernardo Faria"], "notes": "The general category of passing that uses body weight and pressure rather than speed. The philosophy is to first flatten the opponent, then pass. Crossface drives the head away, underhook prevents hip escape, weight kills frames. Less athletic than speed-based passing but very reliable.", "position_entered_from": ["Half guard top", "Open guard", "Turtle top"], "style_association": ["Pressure passing system", "Wrestling-base BJJ"] }, { "id": 86, "name": "Tilt pass", "aka": ["Half guard tilt", "tilt"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Half guard top", "Knee slice pass", "Smash pass", "Side control"], "common_setups": ["Half guard top \u2192 underhook near side \u2192 step foot over hip \u2192 tilt opponent to back \u2192 slide knee free"], "primary_counters": ["Don't allow underhook to be established", "Frame on hip to prevent tilt", "Bridge into the tilt direction"], "notable_practitioners": ["Tom DeBlass", "Neil Melanson"], "notes": "From half guard top with underhook \u2014 step far foot over opponent's hip and tilt them to their back. Slides the trapped leg out as they fall back. Clean finish when executed properly.", "position_entered_from": ["Half guard top"], "style_association": ["Half guard top systems", "Pressure passing"] }, { "id": 87, "name": "Cartwheel pass", "aka": ["Rolling pass", "cartwheel"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["DLR guard", "Open guard passing", "Torreando pass"], "common_setups": ["DLR hook \u2192 opponent's hook on hip \u2192 cartwheel over the hook \u2192 land on other side"], "primary_counters": ["Maintain the hook through the cartwheel attempt", "Re-guard during cartwheel", "Pull guard"], "notable_practitioners": ["Rafael Mendes", "Paulo Miyao"], "notes": "An acrobatic pass that cartwheels over the guard player's legs. High risk/reward \u2014 if executed perfectly, bypasses all guards; if failed, gives up position. Predominantly a sport BJJ technique due to the athletic demands.", "position_entered_from": ["Open guard", "DLR guard"], "style_association": ["Modern sport BJJ", "Acrobatic game"] }, { "id": 88, "name": "Headquarters pass", "aka": ["HQ position", "headquarters"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Knee slice pass", "Over-under pass", "Half guard top", "Leg drag"], "common_setups": ["Sit inside opponent's guard \u2014 one knee up, one knee down \u2192 inside position \u2192 pass options", "Guard approach \u2192 sit to HQ \u2192 knee slice or over-under from HQ"], "primary_counters": ["Sit up and attack the near leg", "Take the back from inside HQ", "Establish underhook from guard bottom"], "notable_practitioners": ["Gordon Ryan", "John Danaher", "Nicky Rodriguez"], "notes": "A systematic management position before committing to a pass direction. Sitting with one knee up, one knee down inside opponent's guard gives options for knee slice (leading knee), over-under (both options), or leg drag. The Danaher system heavily features HQ as a centralized position.", "position_entered_from": ["Open guard", "Half guard approach"], "style_association": ["Modern sport BJJ", "Danaher passing system"] }, { "id": 89, "name": "X-pass", "aka": ["X-pass", "headquarters X-pass"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Headquarters position", "Knee slice pass", "Over-under pass"], "common_setups": ["HQ \u2192 underhook near leg \u2192 step far leg back \u2192 drive X motion through \u2192 side control"], "primary_counters": ["Hip escape away from pass", "Establish frames before X motion", "Pull guard"], "notable_practitioners": ["Gordon Ryan", "Nicky Rodriguez"], "notes": "Transition from headquarters that creates an X-shaped body path as the passer drives through.", "position_entered_from": ["Headquarters position", "Open guard"], "style_association": ["Modern no-gi BJJ", "Danaher passing"] }, { "id": 90, "name": "Long step pass", "aka": ["Long step", "combat base pass"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["DLR guard", "RDLR guard", "Torreando pass", "Side control"], "common_setups": ["DLR or RDLR hook present \u2192 step the hooked leg far back \u2192 drive knee through \u2192 pass to side control", "Open guard \u2192 long step one leg back \u2192 collapse guard \u2192 side control"], "primary_counters": ["Maintain hook through the long step", "Hip escape", "Re-establish guard"], "notable_practitioners": ["Leandro Lo", "Marcus Buchecha"], "notes": "Stepping the lead leg far back to strip a DLR or RDLR hook, then driving the knee through. Simple and effective \u2014 doesn't require upper body grips.", "position_entered_from": ["Open guard", "DLR guard", "RDLR guard"], "style_association": ["Modern sport BJJ", "No-gi BJJ"] }, { "id": 91, "name": "Spider guard pass", "aka": ["Lasso break pass", "sleeve strip pass"], "category": "Guard Pass", "subcategory": "Passing technique", "skill_level": "Intermediate", "gi_nogi": "Gi only", "ruleset_legality": "Gi IBJJF / ADCC / Submission only", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Spider guard", "Lasso guard", "Torreando pass", "Side control"], "common_setups": ["Spider guard \u2192 strip bicep foot \u2192 knee cut \u2192 pass", "Lasso guard \u2192 step over lasso \u2192 backstep \u2192 torreando", "Two-on-one sleeve strip \u2192 drive through"], "primary_counters": ["Re-establish sleeve grips", "Triangle as bicep foot is removed", "Omoplata as bicep foot is stripped"], "notable_practitioners": ["Marcus Buchecha", "Leandro Lo", "Bernardo Faria"], "notes": "The key to passing spider is stripping the bicep-foot connection before the guard player can react. Grip fighting to break sleeve grips is equally important. The strip and pass must be done in one continuous motion.", "position_entered_from": ["Spider guard", "Lasso guard"], "style_association": ["Gi sport BJJ", "IBJJF competition"] }, { "id": 92, "name": "Double leg takedown", "aka": ["Double leg", "double"], "category": "Takedown & Throw", "subcategory": "Shooting takedown", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Single leg takedown", "High crotch", "Guard pull", "Sprawl"], "common_setups": ["Level change \u2192 penetration step \u2192 drive both arms through legs \u2192 drive forward", "High crotch \u2192 switch to double \u2192 finish", "Snap down \u2192 opponent postures \u2192 shoot double"], "primary_counters": ["Sprawl \u2014 drive hips to mat and redirect opponent's head", "Guillotine choke on the shot", "Whizzer + circle away"], "notable_practitioners": ["Cael Sanderson", "Henry Cejudo", "Khabib Nurmagomedov"], "notes": "The most fundamental wrestling takedown. Level change drives below opponent's hips, penetration step between their legs, arms drive through both legs. Finish by driving through or lifting. Sprawl is the primary BJJ counter \u2014 hips drop, head redirected, stand-up to front headlock.", "position_entered_from": ["Standing", "Clinch"], "style_association": ["Wrestling-base BJJ", "All styles", "MMA"] }, { "id": 93, "name": "Single leg takedown", "aka": ["Single leg", "uchi mata gaeshi (partial)"], "category": "Takedown & Throw", "subcategory": "Shooting takedown", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Double leg", "High crotch", "X-guard entry from single leg defense", "Guillotine counter"], "common_setups": ["Penetration step \u2192 attack one leg \u2192 drive through or trip", "Double leg attempt \u2192 opponent defends \u2192 switch to single", "Opponent's lead leg presented \u2192 reach \u2192 single leg"], "primary_counters": ["Whizzer + hop around", "Guillotine on the single", "Post forearm on head \u2192 sprawl"], "notable_practitioners": ["Dan Gable", "Ben Askren", "Jake Herbert"], "notes": "Attacking one leg with multiple finish options: drive through, trip the standing leg, lift and dump. The head position during a single leg critically determines success \u2014 head outside leads to easier finishes; head inside is more dangerous.", "position_entered_from": ["Standing", "Clinch", "Guard pull defense"], "style_association": ["Wrestling-base BJJ", "All styles", "MMA"] }, { "id": 94, "name": "High crotch", "aka": ["High crotch single", "inside trip"], "category": "Takedown & Throw", "subcategory": "Shooting takedown", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Double leg", "Single leg", "Front headlock", "Snap down"], "common_setups": ["Penetration step inside \u2192 arm drives high up the crotch \u2192 transition to double or trip", "Tie-up \u2192 snap down \u2192 shoot high crotch"], "primary_counters": ["Front headlock when head is low", "Whizzer", "Cross-face and redirect"], "notable_practitioners": ["Jordan Burroughs", "Kyle Snyder"], "notes": "The arm drives inside the leg and up into the crotch area \u2014 higher than a standard single leg. Creates inside position and can transition to double leg or leg trip. Excellent in no-gi where underhooks are critical.", "position_entered_from": ["Standing", "Clinch"], "style_association": ["Wrestling-base BJJ", "Freestyle wrestling"] }, { "id": 95, "name": "Arm drag to back", "aka": ["Arm drag", "arm drag takedown"], "category": "Takedown & Throw", "subcategory": "Clinch technique", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Back mount", "Butterfly guard", "Double leg", "Rear naked choke"], "common_setups": ["Grip opponent's sleeve/wrist \u2192 pull while stepping to the side \u2192 get behind for back take", "Butterfly guard \u2192 arm drag \u2192 come up behind", "Clinch \u2192 arm drag \u2192 circle behind"], "primary_counters": ["Step with the drag \u2014 don't let them get behind", "Counter arm drag", "Whizzer to block the circle"], "notable_practitioners": ["Marcelo Garcia", "Matt Serra", "Jon Jones"], "notes": "Marcelo Garcia's signature technique. Two-on-one or sleeve grip pulls the arm across, creating a lane to step behind. Can be executed from standing, seated guard, or butterfly guard. Creates back take or at minimum a dominant angle for a shot.", "position_entered_from": ["Standing", "Butterfly guard", "Seated guard"], "style_association": ["No-gi BJJ", "Wrestling-base BJJ", "Marcelo Garcia system"] }, { "id": 96, "name": "Snap down", "aka": ["Head snap", "front headlock entry"], "category": "Takedown & Throw", "subcategory": "Clinch technique", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Front headlock", "Guillotine", "D'Arce choke", "Anaconda choke"], "common_setups": ["Collar tie \u2192 snap head down \u2192 opponent's posture breaks \u2192 attack from front headlock", "Bicep tie \u2192 snap \u2192 front headlock", "Block shot \u2192 snap head down \u2192 front headlock"], "primary_counters": ["Posture up before snap connects", "Sit out", "Come up to full guard pull"], "notable_practitioners": ["Marcelo Garcia", "Frank Mir"], "notes": "Snapping the head down breaks posture and creates the front headlock position. From front headlock, multiple attacks open: guillotine, D'Arce, anaconda. Essential in no-gi for disrupting an opponent's posture and setting up submissions or takedowns.", "position_entered_from": ["Standing", "Collar tie"], "style_association": ["Wrestling-base BJJ", "No-gi BJJ", "MMA"] }, { "id": 97, "name": "Osoto gari", "aka": ["Large outer reap", "outside leg reap"], "category": "Takedown & Throw", "subcategory": "Judo throw", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Kouchi gari", "Ouchi gari", "Harai goshi"], "common_setups": ["Grip lapel and sleeve \u2192 step close \u2192 reap outside leg back \u2192 lean opponent backward", "Off-balance backward \u2192 drive shoulder in \u2192 reap leg"], "primary_counters": ["Step back with the reaping leg", "Counter osoto", "Sprawl angle"], "notable_practitioners": ["Masahiko Kimura", "Neil Adams"], "notes": "Classic judo reap. The reaping leg sweeps the opponent's outside supporting leg backward while the upper body pushes them backward. One of the most powerful throws in judo \u2014 can produce a direct ippon. From BJJ perspective, follow up directly into side control.", "position_entered_from": ["Standing", "Clinch"], "style_association": ["Judo base BJJ", "Gi BJJ"] }, { "id": 98, "name": "Seoi nage", "aka": ["Shoulder throw", "ippon seoi nage"], "category": "Takedown & Throw", "subcategory": "Judo throw", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["O-goshi", "Tai otoshi", "Uchi mata"], "common_setups": ["Sleeve and lapel grip \u2192 turn in \u2192 hips under opponent \u2192 load them on back \u2192 forward throw", "Gripping arm under opponent's arm \u2192 throw over shoulder"], "primary_counters": ["Sprawl over the throw", "Counter to back take", "Hand post"], "notable_practitioners": ["Tadahiro Nomura", "Kosei Inoue"], "notes": "Throw loads opponent onto the back and throws them forward. Two variations: standard (arm under armpit) and ippon seoi nage (arm threads through). Very high percentage at the elite judo level. In BJJ, creates direct access to mount after the throw.", "position_entered_from": ["Standing", "Gi clinch"], "style_association": ["Judo base BJJ", "Gi BJJ"] }, { "id": 99, "name": "Uchi mata", "aka": ["Inner thigh throw", "uchi mata"], "category": "Takedown & Throw", "subcategory": "Judo throw", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Harai goshi", "Seoi nage", "Kouchi gari"], "common_setups": ["Sleeve and lapel grip \u2192 entry \u2192 inner thigh kick up between opponent's legs \u2192 throw forward", "Setup with several other throws \u2192 opponent adjusts \u2192 uchi mata"], "primary_counters": ["Step back and out", "Counter to uchi mata", "Hikkomi gaeshi"], "notable_practitioners": ["Yasuhiro Yamashita", "Ilias Iliadis"], "notes": "One of the most powerful and versatile judo throws. The attacking leg sweeps up between opponent's legs and through their thighs. Works in many directions and from many gripping positions. Requires substantial technique to execute \u2014 not beginner-appropriate.", "position_entered_from": ["Standing", "Clinch"], "style_association": ["Judo base BJJ", "Gi BJJ"] }, { "id": 100, "name": "O-goshi", "aka": ["Major hip throw", "hip throw"], "category": "Takedown & Throw", "subcategory": "Judo throw", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Seoi nage", "Harai goshi", "Uchi mata"], "common_setups": ["Arm around waist or grip \u2192 turn hips under \u2192 load weight \u2192 hip throw forward"], "primary_counters": ["Sprawl over", "Block with hip", "Counter to back"], "notable_practitioners": ["Jigoro Kano"], "notes": "The foundational hip throw in judo \u2014 one of the first throws learned. Hips go below opponent's center of gravity, load their weight, throw forward over the hip. Direct to mount after successful throw in BJJ.", "position_entered_from": ["Standing", "Clinch"], "style_association": ["Judo base BJJ", "Traditional BJJ"] }, { "id": 101, "name": "Kouchi gari", "aka": ["Small inner reap", "ankle reap"], "category": "Takedown & Throw", "subcategory": "Judo throw", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Osoto gari", "Ouchi gari", "Ankle pick"], "common_setups": ["Grip \u2192 reap inside ankle of opponent's lead foot \u2192 pull them forward over the reap", "Setup combination with osoto \u2192 kouchi"], "primary_counters": ["Step the reaping leg forward", "Hop over the reap"], "notable_practitioners": ["Neil Adams", "Toshihiko Koga"], "notes": "Small reap to the inside ankle. Works best as a combination technique or when opponent steps forward. Simpler mechanics than major throws \u2014 good for BJJ practitioners who want a basic judo throw entry.", "position_entered_from": ["Standing", "Clinch"], "style_association": ["Judo base BJJ", "Traditional BJJ"] }, { "id": 102, "name": "Imanari roll", "aka": ["Flying ashi garami", "Imanari roll entry"], "category": "Takedown & Throw", "subcategory": "Leg lock entry", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "All (technique legal; resulting leg lock may be restricted)", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Ashi garami", "Heel hook", "Ankle lock"], "common_setups": ["Standing \u2192 spinning/cartwheel entry to ashi garami or heel hook position from standing"], "primary_counters": ["Jump over the roll", "Step back before rotation completes", "Sprawl"], "notable_practitioners": ["Masakazu Imanari", "Eddie Cummings", "Gary Tonon"], "notes": "Named after Masakazu 'Tobikan Judan' Imanari. A spinning or cartwheel motion from standing that lands in ashi garami or similar leg entanglement. Spectacular and effective at elite levels. Requires significant practice to execute safely.", "position_entered_from": ["Standing"], "style_association": ["No-gi submission wrestling", "Leg lock systems"] }, { "id": 103, "name": "Guard pull", "aka": ["Pulling guard", "jumping guard"], "category": "Takedown & Throw", "subcategory": "Guard entry", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Closed guard", "Open guard", "Collar-sleeve guard", "DLR guard"], "common_setups": ["Grip opponent \u2192 sit to guard (seated pull)", "Grip \u2192 jump \u2192 close guard in air", "Collar-sleeve grips established \u2192 pull to collar-sleeve guard"], "primary_counters": ["Immediately pass \u2014 sitting to guard position before guard is established", "Stay standing and pass", "Turn away and not allow collar grips"], "notable_practitioners": ["Rafael Mendes", "Paulo Miyao", "Cobrinha"], "notes": "Common in sport BJJ to establish a preferred guard position. Controversial in self-defense contexts \u2014 putting yourself on your back has tactical disadvantages outside of sport. In IBJJF, pulling guard means you are on the bottom for points. The seated pull is preferred over jumping guard as it's saf", "position_entered_from": ["Standing"], "style_association": ["Sport BJJ", "IBJJF gi competition"] }, { "id": 104, "name": "Upa / bridge and roll", "aka": ["Upa escape", "trap and roll"], "category": "Escape & Recovery", "subcategory": "Mount escape", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Mount escape elbow-knee", "Mount position", "Half guard recovery"], "common_setups": ["Mount \u2192 trap one arm and foot on same side \u2192 bridge explosively \u2192 roll to top", "High mount \u2192 bridge when opponent leans \u2192 roll"], "primary_counters": ["Post the free arm", "Move hips to the side of the bridge", "Go to high mount before trap is established"], "notable_practitioners": ["Rickson Gracie", "Royce Gracie"], "notes": "The fundamental mount escape. Trap the arm and same-side foot, then bridge explosively to one side. The trapped foot prevents the passer from posting to stop the roll. Must bridge at a diagonal angle \u2014 straight bridge rarely works. Best executed before opponent establishes high mount.", "position_entered_from": ["Mount bottom"], "style_association": ["All styles", "Traditional BJJ"] }, { "id": 105, "name": "Elbow-knee escape", "aka": ["Shrimping escape", "elbow escape"], "category": "Escape & Recovery", "subcategory": "Mount escape", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Mount bottom", "Half guard recovery", "Full guard recovery", "Bridge and roll"], "common_setups": ["Mount \u2192 frame with elbows against hips \u2192 shrimp to side \u2192 knee into space \u2192 recover guard", "Create space with bridge \u2192 insert knee \u2192 full guard or half guard"], "primary_counters": ["S-mount to maintain position when elbow pushes in", "Drive the knee back down with shin", "Chest-to-chest pressure to prevent shrimping"], "notable_practitioners": ["Rickson Gracie", "Roger Gracie"], "notes": "The second fundamental mount escape \u2014 frame and shrimp. Create space with a frame on the hips, shrimp sideways, insert knee to create half guard or full guard. Often combined with bridge \u2014 bridge to create space, then immediately shrimp.", "position_entered_from": ["Mount bottom", "Side control bottom"], "style_association": ["All styles", "Traditional BJJ"] }, { "id": 106, "name": "Side control escape", "aka": ["Side control escape", "guard recovery from side control"], "category": "Escape & Recovery", "subcategory": "Side control escape", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Side control top", "Half guard recovery", "Turtle position", "Guard recovery"], "common_setups": ["Frame against neck and hip \u2192 shrimp away \u2192 knee to half guard or full guard", "Bridge to create space \u2192 turn into opponent \u2192 come to knees", "Underhook near arm \u2192 sit up \u2192 come to knees \u2192 turtle or shots"], "primary_counters": ["Crossface to prevent framing and shrimping", "Underhook to flatten", "Move to mount when bridge occurs"], "notable_practitioners": ["Rickson Gracie", "Keenan Cornelius"], "notes": "Frame under the chin and on the hip simultaneously \u2014 one frame each. Shrimp away from the frame to create space. Coming to knees (turtle) is often safer than trying to recover guard directly. The underhook route: underhook near arm \u2192 sit up \u2192 technical stand-up or shot.", "position_entered_from": ["Side control bottom"], "style_association": ["All styles"] }, { "id": 107, "name": "Back escape", "aka": ["Back mount escape", "seatbelt strip escape"], "category": "Escape & Recovery", "subcategory": "Back escape", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Back mount", "Body triangle", "Rear naked choke defense", "Guard recovery"], "common_setups": ["Seatbelt grip \u2192 two-on-one the top arm \u2192 strip it \u2192 shoulder walk \u2192 turn to face", "Hip escape: pinch knees \u2192 slide hips out to one side \u2192 face opponent \u2192 guard"], "primary_counters": ["Re-establish seatbelt grip", "Squeeze hooks to prevent hip slide", "Move to body triangle to prevent hip escape"], "notable_practitioners": ["Rickson Gracie", "Gordon Ryan (teaching)"], "notes": "Strip the top seatbelt arm using two-on-one grip, then shoulder walk to face opponent \u2014 or hip escape to slide out sideways. The timing must be precise \u2014 defending the choke while escaping simultaneously. Always keep chin tucked to prevent RNC. Sliding out to the side of the bottom hook is the most ", "position_entered_from": ["Back mount bottom"], "style_association": ["All styles"] }, { "id": 108, "name": "Granby roll", "aka": ["Granby roll", "technical stand-up roll"], "category": "Escape & Recovery", "subcategory": "Guard recovery / back escape", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Turtle position", "Side control escape", "Guard recovery", "Back escape"], "common_setups": ["Turtle \u2192 opponent attacks \u2192 invert forward over shoulder \u2192 come to guard", "Side control \u2192 create space \u2192 granby roll to guard", "Back mount \u2192 slip hooks \u2192 granby away"], "primary_counters": ["Maintain weight on top of opponent through the roll", "Circle with the roll to stay on top", "Block with hips during the roll"], "notable_practitioners": ["Jake Shields", "Keenan Cornelius"], "notes": "A forward shoulder roll that creates distance and angle. Named after Granby wrestling program. Must roll over the shoulder at a diagonal \u2014 not straight forward. Creates enough space to come to guard or to create a scramble. Essential skill for defending turtle attacks.", "position_entered_from": ["Turtle", "Side control bottom", "Back mount"], "style_association": ["Wrestling-base BJJ", "Turtle defense specialists"] }, { "id": 109, "name": "Hitchhiker escape", "aka": ["Hitchhiker escape", "armbar escape roll-out"], "category": "Escape & Recovery", "subcategory": "Submission escape", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Elbow", "risk_level": "High", "related_techniques": ["Armbar", "Guard recovery", "Mount escape"], "common_setups": ["Armbar locked \u2192 rotate thumb toward opponent \u2192 roll toward the thumb direction \u2192 come on top"], "primary_counters": ["Adjust angle to prevent rotation", "Squeeze knees to keep arm trapped", "Finish before rotation occurs"], "notable_practitioners": ["Keenan Cornelius"], "notes": "When caught in armbar, rotating the arm so the thumb points toward the opponent allows a roll-through escape. The arm momentarily faces a dangerous angle \u2014 must execute smoothly to avoid injury. Timing is crucial \u2014 too early and opponent adjusts; too late and elbow injury occurs.", "position_entered_from": ["Armbar defense"], "style_association": ["All styles", "Competitive BJJ"] }, { "id": 110, "name": "Leg entanglement escape", "aka": ["Heel hook defense", "ashi garami escape"], "category": "Escape & Recovery", "subcategory": "Leg lock defense", "skill_level": "Advanced", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Heel hook", "Ashi garami", "Ankle lock", "50/50"], "common_setups": ["Heel hook threatened \u2192 engage the leg \u2192 step over opponent's top leg \u2192 re-shell", "Ankle lock threatened \u2192 sit up and turn hips into opponent", "50/50 escape \u2192 disengage and create distance"], "primary_counters": ["Maintain position", "Finish quickly before defense is established"], "notable_practitioners": ["Gordon Ryan (teaching)", "John Danaher (teaching)"], "notes": "The fundamental heel hook defense is the step-over / re-shell: when heel hook is threatened, step the free leg over the opponent's top leg and rotate the body to remove the heel cup. The knee line concept \u2014 protecting the knee from rotation \u2014 is the core principle. Never pull the foot away from a he", "position_entered_from": ["Ashi garami bottom", "Heel hook defense"], "style_association": ["Danaher leg lock defense", "No-gi BJJ"] }, { "id": 111, "name": "Sit-out / switch", "aka": ["Sit-out", "stand-up in base"], "category": "Escape & Recovery", "subcategory": "Turtle escape", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Turtle position", "Guard recovery", "Granby roll", "Technical stand-up"], "common_setups": ["Turtle \u2192 post foot \u2192 sit through away from opponent \u2192 come to standing or seated guard", "Referee position bottom \u2192 explosively sit through and face opponent"], "primary_counters": ["Maintain chest-to-back contact", "Block with hips", "Back step to follow"], "notable_practitioners": ["Jake Shields", "Ben Askren"], "notes": "Pure wrestling escape from turtle. Post one hand and one foot, then drive through to a sitting position facing away from opponent, or continue to a full stand. Highly effective when opponent is riding on top of turtle without a full back control.", "position_entered_from": ["Turtle", "Referee's position (wrestling)"], "style_association": ["Wrestling-base BJJ", "No-gi BJJ"] }, { "id": 112, "name": "Technical stand-up", "aka": ["Technical stand-up", "base stand-up"], "category": "Escape & Recovery", "subcategory": "Guard recovery / standing", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Takedown defense", "Guard recovery", "Sit-up guard"], "common_setups": ["Seated guard \u2192 post one hand \u2192 foot steps up on same side \u2192 stand up in base", "Guard bottom \u2192 push knee \u2192 create space \u2192 technical stand-up"], "primary_counters": ["Chase and maintain connection during stand-up", "Drive into opponent during stand-up", "Immediate takedown as they stand"], "notable_practitioners": ["Anderson Silva", "Jon Jones"], "notes": "The fundamental way to return to standing from the ground. Post the hand, step the same-side foot up, then drive from the heel to stand while keeping your hand on the mat for base. The hand comes off the mat last \u2014 maintaining base throughout.", "position_entered_from": ["Bottom guard", "Seated", "Turtle"], "style_association": ["All styles", "MMA", "Self-defense"] }, { "id": 113, "name": "Traditional / Gracie BJJ", "aka": ["Gracie BJJ", "self-defense BJJ"], "category": "Style & Meta-system", "subcategory": "Complete system", "skill_level": "Beginner", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Closed guard", "Mount", "Rear naked choke", "Americana", "Self-defense curriculum"], "common_setups": ["Closed guard as primary offense", "Mount as primary top submission platform", "Self-defense scenarios \u2014 clinch, standing, groundwork"], "primary_counters": ["Sport-specialized games with narrow technical focus"], "notable_practitioners": ["Rickson Gracie", "Roger Gracie", "Royce Gracie"], "notes": "The original system developed by the Gracie family from Judo and jiu-jitsu. Emphasizes leverage and technique over athleticism, making it effective for smaller practitioners. Prioritizes self-defense scenarios. Still taught at Gracie academies worldwide. Roger Gracie is considered the purest express", "position_entered_from": ["Any"], "style_association": ["Gracie family", "Helio Gracie", "Carlos Gracie"] }, { "id": 114, "name": "Sport BJJ (IBJJF)", "aka": ["Competition BJJ", "sport jiu-jitsu"], "category": "Style & Meta-system", "subcategory": "Competitive system", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "Gi IBJJF / No-gi IBJJF", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["All gi techniques", "Guard systems", "Passing systems"], "common_setups": ["Guard pulling \u2192 offensive guard game", "Guard passing \u2192 top control \u2192 submissions", "Strategic points accumulation"], "primary_counters": ["Submission-only game \u2014 IBJJF allows stalling tactics"], "notable_practitioners": ["Marcus Buchecha", "Leandro Lo", "Roger Gracie"], "notes": "The dominant competitive format globally. Points awarded for: takedown (2), sweep (2), knee on belly (2), mount (4), back control (4), guard pass (3). Heel hooks banned at most levels. Stalling and strategic play around points is common \u2014 sometimes criticized for producing non-finishing matches. Wor", "position_entered_from": ["Any"], "style_association": ["IBJJF competitors", "Most major academies worldwide"] }, { "id": 115, "name": "ADCC / submission wrestling system", "aka": ["ADCC game", "no-gi submission wrestling"], "category": "Style & Meta-system", "subcategory": "Competitive system", "skill_level": "Elite", "gi_nogi": "No-gi only", "ruleset_legality": "ADCC", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["All no-gi techniques", "Leg lock systems", "Takedowns"], "common_setups": ["Takedowns valued \u2014 no guard pull stalling", "Heel hooks and leg locks integral", "Submission finish prioritized"], "primary_counters": ["IBJJF-focused game with no leg lock or takedown development"], "notable_practitioners": ["Gordon Ryan", "Marcelo Garcia", "Davi Ramos"], "notes": "The most prestigious no-gi competition in the world. No points in first half \u2014 submission only. Points scored in second half include takedowns. Heel hooks legal for adults. Produces the most well-rounded grapplers since takedowns, guard, passing, and leg locks are all required. Gordon Ryan is widely", "position_entered_from": ["Any"], "style_association": ["Danaher Death Squad", "ADCC champions"] }, { "id": 116, "name": "Danaher Death Squad system", "aka": ["DDS", "Danaher system"], "category": "Style & Meta-system", "subcategory": "Modern system", "skill_level": "Elite", "gi_nogi": "No-gi primary", "ruleset_legality": "ADCC / Submission only", "body_target": "Full body", "risk_level": "High", "related_techniques": ["Ashi garami", "Heel hook", "Saddle", "Back mount", "RDLR"], "common_setups": ["RDLR \u2192 SLX \u2192 ashi garami \u2192 heel hook system", "Back take system via arm drag / snap down / leg entanglements", "Passing: leg drag \u2192 headquarters \u2192 knee slice"], "primary_counters": ["Guard pulling / IBJJF game with no leg lock exposure"], "notable_practitioners": ["Gordon Ryan", "John Danaher", "Eddie Cummings"], "notes": "John Danaher systematized leg locks and back takes into the most successful competitive system in modern no-gi grappling history. Key innovations: treating leg locks as a positional system (not just opportunistic), the knee line concept, systematic back attack sequences. Gordon Ryan is the primary p", "position_entered_from": ["Any"], "style_association": ["John Danaher", "Gordon Ryan", "Eddie Cummings"] }, { "id": 117, "name": "10th Planet Jiu-Jitsu", "aka": ["10th Planet", "Eddie Bravo system"], "category": "Style & Meta-system", "subcategory": "Modern system", "skill_level": "Advanced", "gi_nogi": "No-gi primary", "ruleset_legality": "Submission only primary", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Rubber guard", "Lockdown", "Twister", "Gogoplata", "Electric chair"], "common_setups": ["Rubber guard \u2192 mission control \u2192 gogoplata / triangle / omoplata", "Lockdown half guard \u2192 old school / electric chair / back take", "Twister system from back"], "primary_counters": ["Gi game \u2014 lockdown less effective in gi", "Strong posture game"], "notable_practitioners": ["Eddie Bravo", "Geo Martinez", "Richie Martinez"], "notes": "Eddie Bravo's revolutionary no-gi system developed from his ADCC 2003 win over Royler Gracie using the twister. Built on unique nomenclature and concepts: mission control, rubber guard, lockdown, twister. Highly influential in MMA \u2014 Tony Ferguson is the most prominent MMA practitioner. 10th Planet h", "position_entered_from": ["Any"], "style_association": ["Eddie Bravo", "10th Planet academies worldwide"] }, { "id": 118, "name": "Pressure / top game system", "aka": ["Pressure passing", "top game BJJ"], "category": "Style & Meta-system", "subcategory": "Passing / control system", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Over-under pass", "Knee slice pass", "Smash pass", "Side control", "Mount"], "common_setups": ["Heavy crossface and underhook control", "Flatten opponent \u2192 smash pass \u2192 side control \u2192 mount", "Pressure-based passing: over-under, knee slice, knee-on-belly"], "primary_counters": ["Active, flexible guard game with multiple sweeps", "Standing and circling opponent"], "notable_practitioners": ["Xande Ribeiro", "Bernardo Faria", "Tom DeBlass"], "notes": "Philosophy: control position through weight and pressure before seeking submission. Top practitioners in this style are often physically strong and heavy \u2014 they use gravity as a weapon. Highly effective in gi and at heavier weight classes. Less dependent on flexibility or agility than open guard / i", "position_entered_from": ["Any standing or top position"], "style_association": ["Xande Ribeiro system", "Bernardo Faria system", "Tom DeBlass"] }, { "id": 119, "name": "Leg lock system (modern)", "aka": ["Leg lock game", "lower body attack system"], "category": "Style & Meta-system", "subcategory": "Submission system", "skill_level": "Advanced", "gi_nogi": "No-gi primary", "ruleset_legality": "ADCC / Submission only", "body_target": "Knee", "risk_level": "High", "related_techniques": ["Heel hook", "Ashi garami", "Saddle", "50/50", "Kneebar", "Toehold"], "common_setups": ["RDLR \u2192 SLX / ashi \u2192 heel hook sequence", "Passing attempt caught \u2192 leg entanglement entered", "Guard pull directly to ashi garami"], "primary_counters": ["Leg lock defense / knee line concept", "Jump over to avoid ashi entries", "Strong passing game to avoid guard leg lock entries"], "notable_practitioners": ["Gordon Ryan", "Craig Jones", "Lachlan Giles"], "notes": "The systematic approach to leg locks as positions rather than opportunistic attacks. Key insight: the position (ashi garami, saddle) matters more than the specific submission \u2014 from a dominant leg position, multiple submissions are available. Completely transformed no-gi BJJ over the 2015-2025 decad", "position_entered_from": ["Any leg entanglement"], "style_association": ["Danaher Death Squad", "Craig Jones system", "Lachlan Giles"] }, { "id": 120, "name": "Modern DLR / berimbolo system", "aka": ["DLR system", "Mendes system"], "category": "Style & Meta-system", "subcategory": "Guard system", "skill_level": "Elite", "gi_nogi": "Gi primary", "ruleset_legality": "Gi IBJJF / All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["De La Riva guard", "Berimbolo", "Collar-sleeve guard", "Back take"], "common_setups": ["Collar-sleeve \u2192 DLR hook \u2192 berimbolo \u2192 back take", "DLR \u2192 sweep or back take", "Multiple inversion sequences from DLR"], "primary_counters": ["Specific anti-berimbolo passing", "Pressure passing to avoid DLR entry"], "notable_practitioners": ["Rafael Mendes", "Guilherme Mendes", "Paulo Miyao"], "notes": "The Mendes Brothers and subsequently the Miyao Brothers transformed gi competition with systematic berimbolo and DLR-based back takes. This system dominated IBJJF competition from roughly 2012-2018. Required high flexibility and technical precision \u2014 not accessible to beginners. Still highly relevan", "position_entered_from": ["Any seated guard"], "style_association": ["Mendes Brothers", "Miyao Brothers", "Art of Jiu-Jitsu"] }, { "id": 121, "name": "Wrestling-base BJJ", "aka": ["Wrestling BJJ", "top pressure game"], "category": "Style & Meta-system", "subcategory": "Complete system", "skill_level": "Intermediate", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["Double leg", "Single leg", "Dogfight", "WT half guard", "Arm drag"], "common_setups": ["Takedown \u2192 top position \u2192 pressure pass \u2192 submissions", "Dogfight / WT half back take system", "Cradle and mat returns"], "primary_counters": ["Active, technical guard game"], "notable_practitioners": ["Ben Askren", "Khabib Nurmagomedov", "Jake Shields"], "notes": "Wrestling credentials translate powerfully into BJJ \u2014 takedown ability forces opponents to engage from bottom. Wrestling-base BJJers typically have superior top pressure and mat returns. The dogfight/WT half position is where wrestling and BJJ intersect most naturally. Most dominant MMA grappling st", "position_entered_from": ["Any"], "style_association": ["Wrestlers transitioning to BJJ", "MMA fighters"] }, { "id": 122, "name": "Judo base BJJ", "aka": ["Judo BJJ", "throwing BJJ"], "category": "Style & Meta-system", "subcategory": "Complete system", "skill_level": "Intermediate", "gi_nogi": "Gi primary", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Medium", "related_techniques": ["Osoto gari", "Seoi nage", "O-goshi", "Uchi mata", "Harai goshi"], "common_setups": ["Grips \u2192 throw \u2192 immediate transition to newaza (ground)", "Osoto gari \u2192 side control", "Seoi nage \u2192 mount transition"], "primary_counters": ["Guard pulling to negate throwing game", "No-gi context removes grip advantage"], "notable_practitioners": ["Ronda Rousey", "Hector Lombard", "Travis Stevens"], "notes": "Judoka who transition to BJJ bring world-class throwing and grip-fighting. The transition from throw to ground is the key skill gap \u2014 judo newaza rules are more restrictive than BJJ, so judoka must develop their ground game. Throws are extremely difficult to defend against from trained judoka.", "position_entered_from": ["Standing"], "style_association": ["Judo crossover practitioners", "Gi BJJ specialists"] }, { "id": 123, "name": "Submission only / EBI ruleset game", "aka": ["Sub only", "EBI game"], "category": "Style & Meta-system", "subcategory": "Competitive system", "skill_level": "Advanced", "gi_nogi": "No-gi primary", "ruleset_legality": "Submission only", "body_target": "Full body", "risk_level": "High", "related_techniques": ["All submission techniques", "Leg lock systems", "Back mount system"], "common_setups": ["Leg locks as primary weapons", "Back takes as primary control", "Overtime tiebreakers: back mount defense vs escape"], "primary_counters": ["Stall-heavy points-based game"], "notable_practitioners": ["Eddie Cummings", "Garry Tonon", "Craig Jones"], "notes": "EBI overtime format: if no submission in regulation, combatants go to overtime alternating between spider web (offense) and back mount (offense). First to submit or escape wins. Emphasizes submission finishing and escape ability over points strategy. Has produced some of the most exciting and techni", "position_entered_from": ["Any"], "style_association": ["Eddie Bravo Invitational", "Polaris", "Who's #1"] }, { "id": 124, "name": "Open guard specialist system", "aka": ["Open guard game", "multiple guard layers"], "category": "Style & Meta-system", "subcategory": "Guard system", "skill_level": "Elite", "gi_nogi": "Both", "ruleset_legality": "All", "body_target": "Full body", "risk_level": "Low", "related_techniques": ["De La Riva guard", "Spider guard", "Butterfly guard", "X-guard", "Collar-sleeve"], "common_setups": ["Multiple interconnected guard systems \u2014 DLR, spider, butterfly, X-guard", "Guard transitions to deny passing", "Attacks from multiple guard angles"], "primary_counters": ["Pressure passing \u2014 slow the guard down", "Submission threats that penalize guard play (wristlock, calf slicer)"], "notable_practitioners": ["Cobrinha", "Rafael Mendes", "Michael Langhi"], "notes": "Philosophy: maintain guard through transitions between multiple systems rather than committing to one. Each guard type addresses specific pass attempts. Cobrinha is perhaps the master of this approach \u2014 fluently transitioning between guards while constantly threatening sweeps and submissions.", "position_entered_from": ["Guard bottom"], "style_association": ["Cobrinha", "Rafael Mendes", "Lucas Lepri system"] },
{
  "id": 125,
  "name": "K-Guard",
  "category": "Guard System",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "High",
  "body_target": "Legs",
  "notes": "A powerful modern open guard entry primarily used to expose the opponent's backside 50/50 for heel hook attacks. It relies on scooping under the opponent's knee and passing your leg over their hip.",
  "common_setups": [
    "Opponent stands above your open guard",
    "Entering from closed guard via Williams guard position"
  ],
  "common_counters": [
    "Immediate backstep pass before the leg laces",
    "Pinning the scooping arm"
  ]
},
{
  "id": 126,
  "name": "Octopus Guard",
  "category": "Guard System",
  "aka": [],
  "skill_level": "Intermediate",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Medium",
  "body_target": "Back / Core",
  "notes": "Created by Eduardo Telles, this guard wraps your arm over the opponent's far shoulder/lat from the bottom, misaligning their centerline and enabling easy back takes or sweeps.",
  "common_setups": [
    "Opponent passes your half guard high",
    "Baiting an underhook and sneaking behind the shoulder"
  ],
  "common_counters": [
    "Stepping over the shoulder to counter-attack",
    "Aggressive cross-facing"
  ]
},
{
  "id": 127,
  "name": "Squid Guard",
  "category": "Guard System",
  "aka": [
    "Matrix Guard",
    "Lapel Guard"
  ],
  "skill_level": "Advanced",
  "gi_nogi": "Gi only",
  "risk_level": "Low",
  "body_target": "Core / Base",
  "notes": "A complex lapel guard developed by Keenan Cornelius. You loop your opponent's lapel outside their leg and under their thigh to immobilize their movement completely.",
  "common_setups": [
    "From open guard by pulling the opponent's lapel out",
    "From De La Riva foot position"
  ],
  "common_counters": [
    "Breaking the lapel grip early",
    "Dropping heavy hips to prevent the foot placement"
  ]
},
{
  "id": 128,
  "name": "Williams Guard (Rat Guard)",
  "category": "Guard System",
  "aka": [
    "Rat Guard"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Shoulders / Neck",
  "notes": "A high closed guard variation where you lock your hands under your own leg (which is thrown over the opponent's shoulder), creating massive posture control to set up omoplatas and gogoplatas.",
  "common_setups": [
    "Opponent defends a standard omoplata by posturing up",
    "From a high closed guard / rubber guard entry"
  ],
  "common_counters": [
    "Peeling the grip before it connects",
    "Stacking heavily onto the neck"
  ]
},
{
  "id": 129,
  "name": "Shin-to-shin Guard",
  "category": "Guard System",
  "aka": [],
  "skill_level": "Fundamental",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Low",
  "body_target": "Legs / Balance",
  "notes": "A seated open guard entry where your shin connects flush against the opponent's shin, allowing you to intercept their forward movement and elevate them into Single Leg X or Asji-garami.",
  "common_setups": [
    "Seated guard vs standing opponent approaching",
    "When an opponent steps into your space"
  ],
  "common_counters": [
    "Knee slicing quickly over the shin",
    "Backstepping to clear the connection entirely"
  ]
},
{
  "id": 130,
  "name": "Quarter Guard",
  "category": "Guard System",
  "aka": [
    "Ankle trap"
  ],
  "skill_level": "Fundamental",
  "gi_nogi": "Both (Equally)",
  "risk_level": "High",
  "body_target": "Ankle",
  "notes": "A last-ditch defensive guard when the opponent has almost passed side control or mount, but you trap their ankle. Often used to dig for deep half guard.",
  "common_setups": [
    "Defending a mount transition",
    "Failing a half-guard sweep and recovering the foot"
  ],
  "common_counters": [
    "Freeing the ankle with a heavy sprawl",
    "Using the free leg to clear the trap"
  ]
},
{
  "id": 131,
  "name": "The Truck",
  "category": "Leg Entanglement",
  "aka": [
    "Wrestling leg ride"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Medium",
  "body_target": "Hips / Spine",
  "notes": "A 10th Planet signature position where you control the opponent's hips by scissoring one leg and hooking the other. An essential gateway to the Twister, calf slicers, and back takes.",
  "common_setups": [
    "Rolling from top turtle position",
    "Transitioning from back control when the opponent slides out"
  ],
  "common_counters": [
    "Kicking the leg free before the lock",
    "Rolling aggressively through the position"
  ]
},
{
  "id": 132,
  "name": "Crab Ride",
  "category": "Position",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "Gi recommended",
  "risk_level": "Medium",
  "body_target": "Hips / Core",
  "notes": "A dynamic back control position closely tied to the berimbolo, where you control the opponent's hips using both of your hooks positioned behind their knees, preventing them from turning to their back.",
  "common_setups": [
    "Completing a berimbolo sweep",
    "Opponent defends a standard back take by turning face down"
  ],
  "common_counters": [
    "Pummeling legs inside to disrupt the hooks",
    "Rolling forward to break the grip structure"
  ]
},
{
  "id": 133,
  "name": "S-Mount",
  "category": "Position",
  "aka": [
    "Technical S-Mount"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Medium",
  "body_target": "Shoulders",
  "notes": "A highly offensive variation of the mount where your legs form an 'S' shape, placing massive localized pressure on the opponent's chest and isolating an arm for an armbar.",
  "common_setups": [
    "From high mount when the opponent tries to frame",
    "From technical mount sliding the back leg up"
  ],
  "common_counters": [
    "Preventing the leg slide with frames",
    "Explosive bridging before the weight settles"
  ]
},
{
  "id": 134,
  "name": "Kesa-Gatame (Scarf Hold)",
  "category": "Position",
  "aka": [
    "Scarf hold"
  ],
  "skill_level": "Fundamental",
  "gi_nogi": "Gi recommended",
  "risk_level": "Medium",
  "body_target": "Ribs / Core",
  "notes": "A Judo-style side control holding the head and far arm tightly to the chest while spreading the legs for base. Creates immense chest pressure but exposes the back if the opponent slips the head.",
  "common_setups": [
    "Finishing a Judo throw like O-goshi",
    "Transitioning smoothly from standard side control"
  ],
  "common_counters": [
    "Bridging and rolling over the holding arm",
    "Slipping the head out the back door"
  ]
},
{
  "id": 135,
  "name": "Reverse Kesa-Gatame",
  "category": "Position",
  "aka": [
    "Twister side control"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Medium",
  "body_target": "Hips",
  "notes": "A side control variant facing the opponent's legs. Used to block knee-elbow escapes, set up far-side armbars, and transition to mount or leg entanglements.",
  "common_setups": [
    "When opponent frames hard in standard side control",
    "Defending a hip escape"
  ],
  "common_counters": [
    "Pushing the hips away to recover guard",
    "Rolling away to turtle"
  ]
},
{
  "id": 136,
  "name": "Buggy Choke",
  "category": "Submission",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "High",
  "body_target": "Neck",
  "notes": "A highly unorthodox submission locked from bottom side control. The bottom player wraps their arm under their own leg to choke the top player. Extremely flexible practitioners benefit most.",
  "common_setups": [
    "Opponent has heavy top side control and settles their head low",
    "When escaping side control seems impossible"
  ],
  "common_counters": [
    "Posturing up aggressively",
    "Framing on the neck/face to break the grip"
  ]
},
{
  "id": 137,
  "name": "Aoki Lock",
  "category": "Submission",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "High",
  "body_target": "Ankle / Heel",
  "notes": "A devastating rotational ankle-heel hybrid lock. Named after Shinya Aoki, it applies outward rotational pressure on the heel while gripping the toes similarly to a straight ankle lock.",
  "common_setups": [
    "From standard Ashi Garami when straight ankle lock fails",
    "Entering into single leg X"
  ],
  "common_counters": [
    "Pummeling the foot to safety immediately",
    "Standing up to relieve pressure"
  ]
},
{
  "id": 138,
  "name": "Barataplata",
  "category": "Submission",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Medium",
  "body_target": "Shoulder / Bicep",
  "notes": "A hybrid shoulder lock and bicep slicer executed typically by throwing your leg over the opponent's trapped arm while facing their legs. An explosive and unpredictable attack.",
  "common_setups": [
    "When an opponent defends an omoplata",
    "From mount or triangle setups where the arm is pinned"
  ],
  "common_counters": [
    "Straightening the arm forcefully before the leg clears",
    "Hitching out the back door"
  ]
},
{
  "id": 139,
  "name": "Monoplata",
  "category": "Submission",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "Gi recommended",
  "risk_level": "Medium",
  "body_target": "Shoulder",
  "notes": "Essentially an omoplata applied from top mount or side control rather than guard. The attacker uses their leg to apply immense rotational pressure to the shoulder while sitting back.",
  "common_setups": [
    "From high mount when pinning one arm to the mat",
    "When an opponent defends an armbar by clasping hands"
  ],
  "common_counters": [
    "Keeping elbows tight to the ribs",
    "Rolling dynamically to relieve shoulder tension"
  ]
},
{
  "id": 140,
  "name": "Banana Split",
  "category": "Submission",
  "aka": [],
  "skill_level": "Unorthodox / Fun",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Groin / Hips",
  "notes": "A painful groin/hip stretch submission from the 10th Planet system. Performed from the Truck position by pulling the opponent's legs apart in opposite directions.",
  "common_setups": [
    "From the Truck position",
    "Rolling from a turtle breakdown"
  ],
  "common_counters": [
    "Preventing the secondary leg hook",
    "Rolling rapidly through the position"
  ]
},
{
  "id": 141,
  "name": "Crotch Ripper",
  "category": "Submission",
  "aka": [],
  "skill_level": "Unorthodox / Fun",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Groin / Hips",
  "notes": "Similar to the Banana Split, this submission from the Truck isolates the far leg and uses both arms and legs to stretch the opponent's groin/hips to an unbearable degree.",
  "common_setups": [
    "From the Truck position when the Banana Split fails",
    "Transitioning from back mount"
  ],
  "common_counters": [
    "Defending the hooks before the stretch begins",
    "Kicking the leg out forcefully"
  ]
},
{
  "id": 142,
  "name": "Dead Orchard",
  "category": "Submission",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Medium",
  "body_target": "Neck / Shoulders",
  "notes": "A complex high-guard control (part of the Rubber Guard system) where the attacker locks a triangle over both of the opponent's shoulders, allowing for free armbars and chokes.",
  "common_setups": [
    "From standard Rubber Guard / Mission Control",
    "When the opponent tries to stack out of a triangle"
  ],
  "common_counters": [
    "Posturing up extremely early",
    "Sprawling heavy on the hips to kill the guard elevation"
  ]
},
{
  "id": 143,
  "name": "Texas Cloverleaf",
  "category": "Submission",
  "aka": [],
  "skill_level": "Intermediate",
  "gi_nogi": "No-gi recommended",
  "risk_level": "High",
  "body_target": "Knees / Calves",
  "notes": "A powerful leg lock compression similar to a calf slicer but acting on both legs. You cross the opponent's legs over one another and apply downward pressure while locking your arms.",
  "common_setups": [
    "From a failed straight ankle lock when the opponent brings in their other leg to defend",
    "From top half or side-saddle position"
  ],
  "common_counters": [
    "Prying the hands apart",
    "Hand-fighting to prevent the figure-four grip"
  ]
},
{
  "id": 144,
  "name": "Crucifix Necktie (Short Choke)",
  "category": "Submission",
  "aka": [
    "Short Choke"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Neck / Trachea",
  "notes": "A rear naked choke variation applied when the forearm is across the throat rather than the deep bicep grip. Often applied from the crucifix or when the chin is tucked.",
  "common_setups": [
    "From the back when the opponent heavily defends the deep RNC",
    "From the Crucifix position"
  ],
  "common_counters": [
    "Peeling the choking hand",
    "Turning the chin toward the choking arm"
  ]
},
{
  "id": 145,
  "name": "Balloon Sweep (Overhead Sweep)",
  "category": "Sweep",
  "aka": [
    "Overhead Sweep"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Gi recommended",
  "risk_level": "Medium",
  "body_target": "Balance",
  "notes": "Using the opponent's forward driving momentum to place a foot on their hips, fall backward, and launch them completely over your head into the mount position.",
  "common_setups": [
    "From open/spider guard when the opponent drives forward aggressively",
    "Luring an opponent by playing a passive seated guard"
  ],
  "common_counters": [
    "Dropping hips backward immediately",
    "Base out with arms to avoid being flipped over"
  ]
},
{
  "id": 146,
  "name": "Kiss of the Dragon",
  "category": "Sweep",
  "aka": [
    "Reverse DLR Spin Under"
  ],
  "skill_level": "Advanced",
  "gi_nogi": "Both (Equally)",
  "risk_level": "High",
  "body_target": "Core / Hips",
  "notes": "A flashy and powerful sweep from Reverse De La Riva guard where the bottom player spins entirely underneath the top player to emerge behind them to take the back.",
  "common_setups": [
    "From Reverse De La Riva when the opponent tries to knee slice",
    "Baiting the knee slice pass on purpose"
  ],
  "common_counters": [
    "Dropping heavy into a smash pass instantly",
    "Backstepping to kill the RDLR hook"
  ]
},
{
  "id": 147,
  "name": "Helicopter Sweep",
  "category": "Sweep",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "Gi recommended",
  "risk_level": "High",
  "body_target": "Balance",
  "notes": "A highly dynamic sweep similar to the balloon sweep, but rotating the opponent dramatically mid-air to land directly into a tight armbar.",
  "common_setups": [
    "From open guard when controlling both sleeves and placing feet on hips",
    "Catching a strongly rushing passer"
  ],
  "common_counters": [
    "Breaking sleeve grips early",
    "Heavy hips and sprawling backward"
  ]
},
{
  "id": 148,
  "name": "Sumi Gaeshi",
  "category": "Takedown & Throw",
  "aka": [
    "Corner Reversal"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Medium",
  "body_target": "Balance",
  "notes": "A classic sacrifice throw where the attacker drops to their back while inserting a butterfly hook to throw the forward-leaning opponent over their head.",
  "common_setups": [
    "Defending a strong single leg takedown",
    "From a collar tie and overhook clinch"
  ],
  "common_counters": [
    "Posturing up and circling out",
    "Re-pummeling arms and sprawling"
  ]
},
{
  "id": 149,
  "name": "Tomoe Nage",
  "category": "Takedown & Throw",
  "aka": [
    "Circle Throw"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Gi recommended",
  "risk_level": "Medium",
  "body_target": "Balance",
  "notes": "A frontal sacrifice throw relying on strong lapel and sleeve grips. The attacker falls straight backward, placing a foot on the hip/groin to launch the opponent overhead.",
  "common_setups": [
    "Breaking posture with strong collar grips",
    "Faking a forward judo throw then dropping back"
  ],
  "common_counters": [
    "Squatting down into a strong base",
    "Slipping off the foot hook by turning the hips"
  ]
},
{
  "id": 150,
  "name": "Body Lock Pass",
  "category": "Guard Pass",
  "aka": [
    "Double under body lock"
  ],
  "skill_level": "Fundamental",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Hips",
  "notes": "A crushing, low-risk pass where the top player locks their hands around the bottom player's waist (body lock), trapping their hips to the mat to slowly bypass the legs.",
  "common_setups": [
    "From half guard top or butterfly guard",
    "When the bottom player sits up for a hook sweep"
  ],
  "common_counters": [
    "Heavy framing on the shoulders and neck",
    "Elevating with butterfly hooks before the hands clasp"
  ]
},
{
  "id": 151,
  "name": "Float Pass",
  "category": "Guard Pass",
  "aka": [
    "Surfing pass"
  ],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "High",
  "body_target": "Core",
  "notes": "A dynamic passing style relying on heavy chest pressure over the opponent's hips. The passer 'floats' their legs backward to kill the guard player's hooks and slides into side control or mount.",
  "common_setups": [
    "When the opponent attempts butterfly or elevating sweeps",
    "Pummeling inside from a standing passing position"
  ],
  "common_counters": [
    "Off-balancing with strong underhooks",
    "Transitioning to single leg X under the float"
  ]
},
{
  "id": 152,
  "name": "Folding Pass",
  "category": "Guard Pass",
  "aka": [
    "Smash Fold"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Low",
  "body_target": "Legs / Knees",
  "notes": "A high-pressure pass that involves forcing both of the opponent's knees to point in the same direction, turning their hips away and rendering their guard inactive.",
  "common_setups": [
    "From Headquarters passing position",
    "Responding to a Z-guard or knee shield by smashing inward"
  ],
  "common_counters": [
    "Stiff-arming the passer's shoulder",
    "Heavily framing against the knee smash to retain the knee shield"
  ]
},
{
  "id": 153,
  "name": "Backstep Pass",
  "category": "Guard Pass",
  "aka": [],
  "skill_level": "Intermediate",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Medium",
  "body_target": "Hips",
  "notes": "A fluid passer movement where the attacker turns their back to the opponent and steps their leg far away to clear the hooks. Critical gateway to the Saddle / Honey Hole positions.",
  "common_setups": [
    "From top half guard passing",
    "When an opponent establishes a strong knee shield"
  ],
  "common_counters": [
    "Taking the back as they expose it",
    "Following the hips and locking into 50/50"
  ]
},
{
  "id": 154,
  "name": "Leg Pin Pass (Staple Pass)",
  "category": "Guard Pass",
  "aka": [
    "Ruotolo Pass"
  ],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Medium",
  "body_target": "Legs",
  "notes": "Modernized dynamic passing largely popularized by the Ruotolo brothers, involving physically stepping on or pinning the opponent's legs/thighs with your shins to bypass the guard.",
  "common_setups": [
    "From standing open guard when the opponent is supine",
    "Capitalizing on loose leg pummeling"
  ],
  "common_counters": [
    "Inverting rapidly",
    "Constantly circling the legs to prevent pins"
  ]
},
{
  "id": 155,
  "name": "Russian Tie (2-on-1)",
  "category": "Takedown & Throw",
  "aka": [],
  "skill_level": "Fundamental",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Shoulders",
  "notes": "A fundamental wrestling grip where two hands control one of the opponent’s arms at the wrist and upper arm. Excellent for neutralizing offense and setting up single legs or lateral drops.",
  "common_setups": [
    "Peeling a collar tie grip",
    "From neutral standing clinch exchanges"
  ],
  "common_counters": [
    "Limp-arming out of the grip",
    "Pummeling for an inside bicep tie"
  ]
},
{
  "id": 156,
  "name": "Fireman's Carry (Kata Guruma)",
  "category": "Takedown & Throw",
  "aka": [
    "Kata Guruma"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Medium",
  "body_target": "Core",
  "notes": "A classic dump takedown where you drop underneath the opponent's arm, load them across your shoulders, and dump them to the far side.",
  "common_setups": [
    "Off an opponent's high collar tie",
    "From an outside step fake single leg"
  ],
  "common_counters": [
    "Heavy sprawl and flattening out",
    "Guillotining the entering head"
  ]
},
{
  "id": 157,
  "name": "Ankle Pick",
  "category": "Takedown & Throw",
  "aka": [],
  "skill_level": "Intermediate",
  "gi_nogi": "Both (Equally)",
  "risk_level": "Low",
  "body_target": "Ankle / Balance",
  "notes": "A safe and effective takedown combining heavy downward pressure on the opponent’s head (collar tie) while reaching down to capture their leading ankle.",
  "common_setups": [
    "Snap down from collar tie",
    "Fake double leg into ankle pick"
  ],
  "common_counters": [
    "Circling the lead leg back quickly",
    "Underhooking and sprawling"
  ]
},
{
  "id": 158,
  "name": "Lateral Drop",
  "category": "Takedown & Throw",
  "aka": [],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "High",
  "body_target": "Balance",
  "notes": "A surprising upper-body sacrifice throw where you trap an overhook and an underhook, stepping deep and dropping to force the opponent gracefully over you.",
  "common_setups": [
    "When the opponent is aggressively driving forward into an underhook",
    "Pummeling from an over-under clinch"
  ],
  "common_counters": [
    "Sinking hips and pulling back to avoid the throw",
    "Limp arm out of the overhook before the drop"
  ]
},
{
  "id": 159,
  "name": "Mat Return",
  "category": "Takedown & Throw",
  "aka": [
    "Belly-to-back lift"
  ],
  "skill_level": "Fundamental",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Base",
  "notes": "A wrestling staple where you trap the opponent's waist from their back. When they begin to stand, you lift them slightly and return them heavily to the mat to establish back control.",
  "common_setups": [
    "When an opponent attempts a technical stand-up from turtle",
    "After escaping a bad position and taking a rear body lock"
  ],
  "common_counters": [
    "Base widening and heavy hips (sprawl weight down)",
    "Switching the hips vigorously"
  ]
},
{
  "id": 160,
  "name": "Tai Otoshi",
  "category": "Takedown & Throw",
  "aka": [
    "Body Drop"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "Gi recommended",
  "risk_level": "Medium",
  "body_target": "Balance",
  "notes": "A powerful Judo hand throw where you step across the opponent's path and pull them strongly over your extended leg into a spinning fall.",
  "common_setups": [
    "With a strong lapel and sleeve grip pulling forward",
    "Creating a reaction by faking backwards"
  ],
  "common_counters": [
    "Squatting deeply and maintaining rigid base",
    "Stepping over the blocking leg"
  ]
},
{
  "id": 161,
  "name": "Kipping Escape",
  "category": "Escape & Recovery",
  "aka": [
    "Danaher Kipping Escape"
  ],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Medium",
  "body_target": "Hips",
  "notes": "A highly dynamic mount escape popularized by the Danaher/Gordon Ryan squad, utilizing an explosive kipping motion of the legs and hips to wedge frames in and enter directly into leg entanglements.",
  "common_setups": [
    "Trapped in low heavy mount",
    "When standard bridge and roll escapes fail due to wide base"
  ],
  "common_counters": [
    "Establishing high mount under the armpits quickly",
    "Isolating one arm heavily to stop the kip rhythm"
  ]
},
{
  "id": 162,
  "name": "Running Man Escape (Ghost Escape)",
  "category": "Escape & Recovery",
  "aka": [
    "Ghost Escape"
  ],
  "skill_level": "Intermediate",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Low",
  "body_target": "Shoulders / Hips",
  "notes": "A slippery side control escape where you roll your hips entirely away from the opponent, presenting the back seemingly but quickly slipping underneath the cross-face to reset guard.",
  "common_setups": [
    "Pinned under heavy side control pressure",
    "When turning into the opponent is blocked by bicep pins"
  ],
  "common_counters": [
    "Following closely immediately into back takes",
    "Crushing the hips with a heavy ride before the slip"
  ]
},
{
  "id": 163,
  "name": "Heel Slip",
  "category": "Escape & Recovery",
  "aka": [
    "Late stage heel hook defense"
  ],
  "skill_level": "Advanced",
  "gi_nogi": "No-gi recommended",
  "risk_level": "Extremely High",
  "body_target": "Heel",
  "notes": "The primary micro-escape once a heel hook has correctly been applied and locked in. The trapped player physically points the toes and pries the heel out precisely before breaking pressure occurs.",
  "common_setups": [
    "When ensnared deeply in a 50/50 or saddle heel hook",
    "As a last resort when positional escapes have failed"
  ],
  "common_counters": [
    "Re-gripping immediately to a higher fulcrum",
    "Switching to an Aoki lock or straight ankle"
  ]
}
];

const TECH_VIDEOS = {
  // Submissions — Chokes
  1:  [{ title: 'Perfect Rear Naked Choke – John Danaher', url: 'https://www.youtube.com/embed/l8-JI7NND3E' }],
  2:  [{ title: 'Guillotine Choke Details', url: 'https://www.youtube.com/embed/ce_0XT1BBQA' }],
  6:  [{ title: 'Triangle Choke from Guard', url: 'https://www.youtube.com/embed/pQ43Oy5k9yQ' }],
  24: [{ title: 'Armbar from Guard – John Danaher', url: 'https://www.youtube.com/embed/pQ43Oy5k9yQ' }],
  // Guard Systems & Retention
  40: [{ title: 'Closed Guard Fundamentals – Roger Gracie', url: 'https://www.youtube.com/embed/kPZh0ZZyZj0' }],
  52: [{ title: 'Guard Retention – John Danaher', url: 'https://www.youtube.com/embed/ce_0XT1BBQA' }],
  85: [{ title: 'Hip Escape Fundamentals', url: 'https://www.youtube.com/embed/uAjBy96dVpg' }],
  90: [{ title: 'Knee Slice Pass – JT Torres', url: 'https://www.youtube.com/embed/F1Nd4MmLuDk' }],
  104:[{ title: 'Bridge & Roll Escape Mechanics', url: 'https://www.youtube.com/embed/uAjBy96dVpg' }],
};

function buildGraph() {
  const byName = {};
  DATA.forEach(t => { byName[t.name.toLowerCase()] = t.id; });
  const adj = {};
  DATA.forEach(t => { adj[t.id] = []; });
  DATA.forEach(t => {
    (t.related_techniques || []).forEach(r => {
      const rid = byName[r.toLowerCase()];
      if (rid && rid !== t.id && !adj[t.id].includes(rid)) {
        adj[t.id].push(rid);
        if (!adj[rid].includes(t.id)) adj[rid].push(t.id);
      }
    });
  });
  return adj;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const Ctx = createContext(null);
const useA = () => useContext(Ctx);

function Provider({ children }) {
  const [store, setStore] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tg_v4")) || { techs: {}, flows: [], belt: "" }; }
    catch { return { techs: {}, flows: [], belt: "" }; }
  });
  const set = fn => setStore(p => {
    const n = typeof fn === "function" ? fn(p) : fn;
    try { localStorage.setItem("tg_v4", JSON.stringify(n)); } catch { }
    return n;
  });
  const rate = (id, prof, status, notes) => set(p => ({ ...p, techs: { ...p.techs, [id]: { proficiency: prof, status, notes: notes || "" } } }));
  const saveFlow = (name, path) => set(p => ({ ...p, flows: [...p.flows, { id: Date.now() + "", name, path, createdAt: new Date().toISOString() }] }));
  const delFlow = fid => set(p => ({ ...p, flows: p.flows.filter(f => f.id !== fid) }));
  const setBelt = belt => set(p => ({ ...p, belt }));
  return <Ctx.Provider value={{ store, rate, saveFlow, delFlow, setBelt }}>{children}</Ctx.Provider>;
}

// ─── Diamond canvas geometry ──────────────────────────────────────────────────
// 4 slots at diagonal positions — verified to fit 390pt iPhone with 136pt cards
const D_R = 150;  // center → spoke
const D_GR = 150;  // spoke  → ghost (same as D_R for perfect diamond grid)
const CW = 162;  // center card width
const SW = 136;  // spoke card width
const GW = 84;   // ghost card width

// Diagonal diamond: top-right, bottom-right, bottom-left, top-left
const D4 = [315, 45, 135, 225];

function dXY(deg, r) {
  const rad = (deg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

// Ghost directions per spoke (the 3 outward corners of the diamond grid)
const GDIRS = {
  315: [45, 315, 225],
  45: [135, 45, 315],
  135: [225, 135, 45],
  225: [315, 225, 135]
};

// ─── NodeAt ───────────────────────────────────────────────────────────────────
function NodeAt({ dx, dy, z, delay, noFade, onClick, children }) {
  return (
    <div onClick={onClick} style={{
      position: "absolute", left: "50%", top: "50%",
      transform: `translate(calc(-50% + ${Math.round(dx)}px), calc(-50% + ${Math.round(dy)}px))`,
      zIndex: z || 4,
      cursor: onClick ? "pointer" : "default",
      WebkitTapHighlightColor: "transparent",
      userSelect: "none",
      animation: noFade ? "none" : `nFade 0.22s ease ${delay || 0}ms both`,
    }}>
      {children}
    </div>
  );
}

// Opposite angle map for the 4 diamond positions
const OPP_ANGLE = { 315: 135, 45: 225, 135: 315, 225: 45 };

// ─── Diamond Canvas ───────────────────────────────────────────────────────────
// Dead-zone: below this distance, pointer-up counts as a tap not a drag
const DRAG_DEAD = 8;

function DiamondCanvas({ focusId, fromId, fromAngle, path, adj, byId, store, onNavigate, onOpenDetail, onTogglePath }) {
  const [slideOut, setSlideOut] = useState(null);

  // ── Free-pan state ──
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0, pointerId: null, didDrag: false });
  const [liveDrag, setLiveDrag] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleNavigate = (nbId, angle) => {
    if (slideOut) return;
    // Reset pan before navigating
    panOffsetRef.current = { x: 0, y: 0 };
    setPanOffset({ x: 0, y: 0 });
    setLiveDrag({ x: 0, y: 0 });
    const p = dXY(angle, D_R);
    setSlideOut({ x: p.x, y: p.y, id: nbId });
    setTimeout(() => onNavigate(nbId, angle), 350);
  };

  const tech = byId[focusId];
  if (!tech) return null;

  const col = catColor(tech);
  const allNbrs = (adj[focusId] || []).map(id => byId[id]).filter(Boolean);

  const fromNode = fromId ? byId[fromId] : null;
  const fromSlotIdx = fromAngle != null ? D4.indexOf(OPP_ANGLE[fromAngle]) : -1;
  const slots = [null, null, null, null];
  if (fromNode && fromSlotIdx >= 0) slots[fromSlotIdx] = fromNode;
  const others = allNbrs.filter(nb => nb.id !== (fromId || -1));
  let oi = 0;
  for (let i = 0; i < 4; i++) {
    if (!slots[i] && oi < others.length) slots[i] = others[oi++];
  }
  const spokes = slots.filter(Boolean);
  const extraN = allNbrs.length - spokes.length;

  const SC = 600;
  const SVG_SIZE = 1200;

  // ── Pointer handlers ──
  const onPointerDown = useCallback((e) => {
    if (slideOut || dragRef.current.active) return;
    dragRef.current = {
      active: true, startX: e.clientX, startY: e.clientY,
      dx: 0, dy: 0, pointerId: e.pointerId, didDrag: false,
    };
  }, [slideOut]);

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    d.dx = dx; d.dy = dy;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_DEAD) d.didDrag = true;
    if (!d.didDrag) return;
    e.preventDefault();
    setLiveDrag({ x: dx, y: dy });
  }, []);

  const onPointerUp = useCallback((e) => {
    const d = dragRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    d.active = false;
    const wasDrag = d.didDrag;
    d.didDrag = false;
    if (!wasDrag) { setLiveDrag({ x: 0, y: 0 }); return; }
    // Commit pan — canvas stays where user left it
    const nx = panOffsetRef.current.x + d.dx;
    const ny = panOffsetRef.current.y + d.dy;
    panOffsetRef.current = { x: nx, y: ny };
    setPanOffset({ x: nx, y: ny });
    setLiveDrag({ x: 0, y: 0 });
  }, []);

  const onPointerCancel = useCallback((e) => {
    const d = dragRef.current;
    if (d.pointerId === e.pointerId) {
      d.active = false; d.didDrag = false;
      setLiveDrag({ x: 0, y: 0 });
    }
  }, []);

  const totalPanX = slideOut ? -slideOut.x : panOffset.x + liveDrag.x;
  const totalPanY = slideOut ? -slideOut.y : panOffset.y + liveDrag.y;

  return (
    <div ref={containerRef}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
      style={{ position: "absolute", inset: 0, overflow: "hidden", touchAction: "none" }}
    >
      {/* Inner pannable world */}
      <div style={{
        position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
        transition: slideOut ? "transform 0.35s cubic-bezier(0.25,0.8,0.25,1)" : "none",
        transform: `translate(${totalPanX}px, ${totalPanY}px)`,
      }}>

        {/* Dot grid — tiles infinitely */}
        <div style={{
          position: "absolute", inset: "-200%",
          backgroundImage: "radial-gradient(circle, var(--text-pri) 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none",
          opacity: 0.1,
        }} />

        {/* Pre-compute ghost layout for lines and cards */}
        {(() => {
          const ghostLayout = [];
          const usedPos = new Set();
          const drawnIds = new Set();
          usedPos.add("0,0");
          usedPos.add("0,210");
          slots.forEach((s, i) => {
            if (s) {
              const p = dXY(D4[i], D_R);
              usedPos.add(`${Math.round(p.x / 10) * 10},${Math.round(p.y / 10) * 10}`);
              drawnIds.add(s.id);
            }
          });
          slots.forEach((nb, i) => {
            if (!nb) return;
            const { x: sx, y: sy } = dXY(D4[i], D_R);
            const availGhosts = (adj[nb.id] || []).filter(gid => gid !== focusId && !drawnIds.has(gid));
            availGhosts.forEach(gtCode => {
              let found = false;
              let ring = 1;
              while (!found && ring < 12) {
                for (let d = 0; d < 3; d++) {
                  const ga = GDIRS[D4[i]][d];
                  const { x: gx, y: gy } = dXY(ga, D_GR * ring);
                  const px = Math.round((sx + gx) / 10) * 10;
                  const py = Math.round((sy + gy) / 10) * 10;
                  const posKey = `${px},${py}`;
                  if (!usedPos.has(posKey)) {
                    usedPos.add(posKey);
                    drawnIds.add(gtCode);
                    ghostLayout.push({ spIndex: i, spId: nb.id, gtCode, ga, px, py, sx, sy });
                    found = true;
                    break;
                  }
                }
                if (!found) ring++;
              }
            });
          });

          return (
            <>
              {/* SVG lines */}
              <svg style={{
                position: "absolute", left: "50%", top: "50%",
                width: SVG_SIZE, height: SVG_SIZE, transform: "translate(-50%, -50%)",
                pointerEvents: "none", zIndex: 1,
                opacity: slideOut ? 0 : 1, transition: "opacity 0.25s"
              }}>
                <defs>
                  <radialGradient id="rfade7" cx="50%" cy="50%" r="50%">
                    <stop offset="30%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                  <mask id="rmask7"><rect width={SVG_SIZE} height={SVG_SIZE} fill="url(#rfade7)" /></mask>
                </defs>
                <g mask="url(#rmask7)">
                  <circle cx={SC} cy={SC} r="54" fill="none" stroke={col} strokeWidth="1" strokeOpacity="0.18" />
                  <circle cx={SC} cy={SC} r="36" fill="none" stroke={col} strokeWidth="0.5" strokeOpacity="0.08" />
                  {spokes.length === 4 && (() => {
                    const pts = D4.map(a => { const { x, y } = dXY(a, D_R); return `${SC + x},${SC + y}`; }).join(" ");
                    return <polygon points={pts} fill="none" stroke="#1d1d1d" strokeWidth="1" strokeDasharray="6 6" />;
                  })()}
                  {slots.map((nb, i) => {
                    if (!nb) return null;
                    const { x, y } = dXY(D4[i], D_R);
                    const ip = path.includes(nb.id);
                    return (
                      <line key={`cl-${nb.id}`}
                        x1={SC} y1={SC} x2={SC + x} y2={SC + y}
                        stroke={ip ? catColor(nb) : "#282828"}
                        strokeWidth={ip ? 2.5 : 1.5}
                        strokeDasharray={ip ? "none" : "8 5"}
                        strokeOpacity={ip ? 0.9 : 1}
                      />
                    );
                  })}
                  {ghostLayout.map((g) => (
                    <line key={`gl-${g.spId}-${g.gtCode}`}
                      x1={SC + g.sx} y1={SC + g.sy} x2={SC + g.px} y2={SC + g.py}
                      stroke="var(--border)" strokeWidth="1" strokeDasharray="4 5" strokeOpacity="0.6"
                    />
                  ))}
                </g>
              </svg>

              {/* Ghost cards */}
              {ghostLayout.map((g, gi) => {
                const gt = byId[g.gtCode];
                if (!gt) return null;
                const gc = catColor(gt);
                return (
                  <NodeAt key={`g-${g.spId}-${g.gtCode}`} dx={g.px} dy={g.py} z={2} delay={g.spIndex * 40 + gi * 20 + 180}
                    onClick={e => { e.stopPropagation(); if (!dragRef.current.didDrag) handleNavigate(gt.id, g.ga); }}>
                    <div style={{
                      width: GW, padding: "6px 9px", boxSizing: "border-box",
                      background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 8,
                      opacity: slideOut ? 0 : 1, overflow: "hidden", transition: "opacity 0.25s"
                    }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700,
                        color: 'var(--text-pri)', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>{gt.name}</div>
                      <div style={{
                        fontSize: 8, color: gc, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.05em", marginTop: 1
                      }}>{gt.subcategory}</div>
                    </div>
                  </NodeAt>
                );
              })}
            </>
          );
        })()}

        {/* Spoke cards */}
        {slots.map((nb, i) => {
          if (!nb) return null;
          const { x, y } = dXY(D4[i], D_R);
          const nbCol = catColor(nb);
          const inPath = path.includes(nb.id);
          const isFrom = nb.id === fromId;
          const prof = store.techs?.[nb.id]?.proficiency || 0;
          const isClicked = slideOut && slideOut.id === nb.id;
          const op = (slideOut && !isClicked) ? 0 : 1;
          return (
            <NodeAt key={`s-${nb.id}`} dx={x} dy={y} z={5} delay={i * 45} noFade={isFrom}
              onClick={slideOut ? null : (e => { e.stopPropagation(); if (!dragRef.current.didDrag) handleNavigate(nb.id, D4[i]); })}>
              <div style={{
                width: SW, boxSizing: "border-box",
                opacity: op, transition: "opacity 0.25s",
                background: inPath ? `${nbCol}1a` : isFrom ? 'var(--bg-card)' : 'var(--bg-card)',
                border: `1.5px solid ${inPath ? nbCol : isFrom ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: 12, padding: "10px 12px",
                boxShadow: inPath ? `0 0 0 2px ${nbCol}28,0 6px 24px #000b` : "0 4px 18px #000a",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700,
                  color: 'var(--text-pri)', lineHeight: 1.2, marginBottom: 3,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{nb.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{
                    fontSize: 9, color: nbCol, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", maxWidth: 86,
                  }}>{nb.subcategory}</span>
                  {prof > 0 && (
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 800,
                      color: profColor(prof), fontFamily: "'Barlow Condensed',sans-serif", flexShrink: 0
                    }}>{prof}</span>
                  )}
                </div>
                <div style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  fontSize: 10, color: nbCol, opacity: isFrom ? 0.2 : 0.4, pointerEvents: "none",
                }}>{isFrom ? "‹" : "›"}</div>
              </div>
            </NodeAt>
          );
        })}

        {extraN > 0 && (
          <NodeAt dx={0} dy={D_R + 48} z={3} delay={240}>
            <div style={{ textAlign: "center", opacity: slideOut ? 0 : 1, transition: "opacity 0.25s" }}>
              <span style={{ fontSize: 11, color: 'var(--text-sec)', fontFamily: "'DM Sans',sans-serif" }}>
                +{extraN} more · tap Details to see all
              </span>
            </div>
          </NodeAt>
        )}

        {/* Center card */}
        <NodeAt dx={0} dy={0} z={10} delay={0} noFade={fromId != null}
          onClick={slideOut ? null : () => { if (!dragRef.current.didDrag) onOpenDetail(focusId); }}>
          <div style={{
            position: "absolute", inset: -14, borderRadius: 26,
            border: `1.5px solid ${col}`, animation: "cPulse 2.8s ease-out infinite",
            pointerEvents: "none"
          }} />
          <div style={{
            width: CW, background: 'var(--bg-card)', border: `2px solid ${col}`,
            borderRadius: 16, overflow: "hidden",
            boxShadow: `0 0 0 4px ${col}12,0 8px 40px #000e`,
          }}>
            <div style={{ padding: "12px 14px 12px" }}>
              <div style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: 20, fontWeight: 700, color: 'var(--text-pri)', lineHeight: 1.15, marginBottom: 5
              }}>{tech.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: col, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {tech.category}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: 'var(--border)', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'var(--text-sec)' }}>{tech.skill_level}</span>
                {(store.techs?.[focusId]?.proficiency || 0) > 0 && (
                  <span style={{
                    marginLeft: "auto", fontSize: 11, fontWeight: 800,
                    color: profColor(store.techs[focusId].proficiency),
                    fontFamily: "'Barlow Condensed',sans-serif"
                  }}>{store.techs[focusId].proficiency}/10</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
                {allNbrs.length} link{allNbrs.length !== 1 && 's'}
              </div>
              {(store.techs?.[focusId]?.proficiency || 0) > 0 && (
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{
                    height: "100%", width: `${(store.techs[focusId].proficiency || 0) * 10}%`,
                    background: col, opacity: 0.6, borderRadius: 2
                  }} />
                </div>
              )}
              <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                <div style={{
                  flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8,
                  background: `${col}22`, fontSize: 11, fontWeight: 700, color: col,
                  fontFamily: "'DM Sans',sans-serif"
                }}>Info ›</div>
                <div onClick={(e) => { e.stopPropagation(); if (onTogglePath) onTogglePath(focusId); }}
                  style={{
                  width: 32, borderRadius: 8, background: path.includes(focusId) ? col : 'var(--bg-card)',
                  color: path.includes(focusId) ? 'var(--bg-card)' : 'var(--text-sec)', fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
                  transition: "background 0.2s, color 0.2s"
                }}>
                  {path.includes(focusId) ? "✓" : "＋"}
                </div>
              </div>
            </div>
          </div>
        </NodeAt>

        <style>{`
          @keyframes nFade  { from{opacity:0} to{opacity:1} }
          @keyframes cPulse { 0%{opacity:.18;transform:scale(1)} 60%{opacity:0;transform:scale(1.18)} 100%{opacity:0} }
        `}</style>
      </div>

      {/* Re-center button */}
      {(Math.abs(panOffset.x) > 30 || Math.abs(panOffset.y) > 30) && !slideOut && (
        <button onClick={() => { panOffsetRef.current = { x: 0, y: 0 }; setPanOffset({ x: 0, y: 0 }); }}
          style={{
            position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
            zIndex: 20, background: 'var(--bg-card)', border: `1px solid var(--border)`,
            borderRadius: 20, padding: "6px 16px", cursor: "pointer",
            fontSize: 11, color: 'var(--text-sec)', fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <span style={{ fontSize: 14 }}>◎</span> Re-center
        </button>
      )}
    </div>
  );
}



// ─── Tooltip Hint ─────────────────────────────────────────────────────────────
function TooltipHint({ text }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <div
        onClick={() => setVisible(v => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          width: 22, height: 22, borderRadius: "50%",
          background: 'var(--bg-card)', border: "1px solid #252525",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: 'var(--text-sec)', cursor: "pointer",
          fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
          flexShrink: 0, userSelect: "none",
        }}
      >ⓘ</div>
      {visible && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", right: 0,
          background: 'var(--border)', border: `1px solid var(--border)`,
          borderRadius: 10, padding: "8px 12px",
          fontSize: 11, color: 'var(--text-sec)', fontFamily: "'DM Sans',sans-serif",
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 50,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}>
          {text}
          <div style={{
            position: "absolute", bottom: -5, right: 8,
            width: 8, height: 8, background: 'var(--border)',
            border: `1px solid var(--border)`, borderTop: "none", borderLeft: "none",
            transform: "rotate(45deg)",
          }} />
        </div>
      )}
    </div>
  );
}

// ─── Path Builder ─────────────────────────────────────────────────────────────
// Redesigned: shows chain with step numbers, visual progress bar,
// inline add/remove per node, and a clear "Build your flow" CTA
function PathBuilder({ path, byId, focusId, onTap, onRemove, onAddFocus, focusInPath }) {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [path.length]);

  const isEmpty = path.length === 0;

  return (
    <div style={{
      background: "var(--bg-card)",
      borderTop: `1px solid var(--border)`,
      flexShrink: 0,
    }}>
      {isEmpty ? (
        /* Empty state — compact tooltip icon only */
        <div style={{
          padding: "8px 14px",
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
        }}>
          <TooltipHint text="Tap + Flow in the header to chain techniques into your game plan" />
        </div>
      ) : (
        <div>
          {/* Progress bar */}
          <div style={{ height: 2, background: 'var(--bg-card)' }}>
            <div style={{
              height: "100%",
              width: `${Math.min(path.length * 14, 100)}%`,
              background: "linear-gradient(90deg,#22c55e,#16a34a)",
              transition: "width 0.4s ease",
              borderRadius: 1,
            }} />
          </div>

          {/* Step count + milestone */}
          <div style={{
            padding: "6px 16px 0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-sec)', fontFamily: "'DM Sans',sans-serif" }}>
              {path.length} technique{path.length !== 1 ? "s" : ""} in flow
            </span>
            {path.length >= 3 && (
              <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "'DM Sans',sans-serif" }}>
                Flow ready to save ✓
              </span>
            )}
          </div>

          {/* Scrollable chain */}
          <div ref={scrollRef} style={{
            display: "flex", alignItems: "center",
            overflowX: "auto", WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none", padding: "6px 16px 10px",
            gap: 0,
          }}>
            {path.map((id, i) => {
              const t = byId[id]; if (!t) return null;
              const col = catColor(t);
              const isFocus = id === focusId;
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {/* Step number + name pill */}
                  <div
                    onClick={() => onTap(id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      minHeight: 36, padding: "0 10px 0 8px",
                      borderRadius: 20,
                      background: isFocus ? col + "1e" : 'var(--bg-card)',
                      border: `1px solid ${isFocus ? col + "55" : 'var(--border)'}`,
                      cursor: "pointer", whiteSpace: "nowrap",
                      transition: "all 0.15s",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {/* Step number badge */}
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: isFocus ? col : 'var(--border)',
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                      color: isFocus ? "#fff" : 'var(--text-sec)',
                      fontFamily: "'Barlow Condensed',sans-serif",
                    }}>{i + 1}</div>
                    <span style={{
                      fontSize: 12, fontWeight: isFocus ? 700 : 500,
                      color: isFocus ? col : "var(--text-sec)",
                      fontFamily: "'DM Sans',sans-serif",
                    }}>{t.name}</span>
                    {/* Remove button */}
                    <div
                      onClick={e => { e.stopPropagation(); onRemove(id); }}
                      style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                        background: "var(--bg-card)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, color: "var(--text-sec)", cursor: "pointer", marginLeft: 2,
                      }}
                    >✕</div>
                  </div>
                  {i < path.length - 1 && (
                    <div style={{
                      width: 16, textAlign: "center",
                      fontSize: 10, color: col + "44",
                      flexShrink: 0,
                    }}>→</div>
                  )}
                </div>
              );
            })}

            {/* Add current focus to path inline */}
            {focusId && !focusInPath && (
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 16, textAlign: "center", fontSize: 10, color: 'var(--border)', flexShrink: 0 }}>→</div>
                <div
                  onClick={onAddFocus}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    minHeight: 36, padding: "0 10px 0 8px",
                    borderRadius: 20,
                    background: "transparent",
                    border: "1px dashed #2a2a2a",
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#22c55e22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "#22c55e", flexShrink: 0,
                  }}>+</div>
                  <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'DM Sans',sans-serif" }}>
                    Add here
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Detail Sheet ─────────────────────────────────────────────────────────────
function DetailSheet({ tech, path, adj, byId, onClose, onAddToPath, onRemoveFromPath, onNavigate }) {
  const { store, rate } = useA();
  const saved = store.techs?.[tech?.id];
  const [prof, setProf] = useState(saved?.proficiency || 0);
  const [status, setStatus] = useState(saved?.status || "Not started");
  const [notes, setNotes] = useState(saved?.notes || "");
  const [tab, setTab] = useState("info");
  const col = catColor(tech);
  const inPath = path.includes(tech?.id);

  useEffect(() => {
    const s = store.techs?.[tech?.id];
    setProf(s?.proficiency || 0);
    setStatus(s?.status || "Not started");
    setNotes(s?.notes || "");
    setTab("info");
  }, [tech?.id]);

  if (!tech) return null;

  const allNbrs = (adj[tech.id] || []).map(id => byId[id]).filter(Boolean);

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      borderRadius: "32px 32px 0 0",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      maxHeight: "calc(100% - 24px)",
      display: "flex", flexDirection: "column",
      boxShadow: "0 -16px 64px rgba(0,0,0,0.4)",
      zIndex: 200,
      animation: "sheetUp 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) both",
    }}>
      {/* Handle — tap to close */}
      <div onClick={onClose} style={{ padding: "12px 0 0", display: "flex", justifyContent: "center", cursor: "pointer" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "8px 18px 12px", borderBottom: "1px solid #191919" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, color: col, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.09em", marginBottom: 3
            }}>{tech.category}</div>
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 22, fontWeight: 700, color: 'var(--text-pri)', lineHeight: 1.1
            }}>{tech.name}</div>
            {tech.aka?.length > 0 && (
              <div style={{ fontSize: 11, color: "#777", marginTop: 3 }}>aka {tech.aka.slice(0, 2).join(", ")}</div>
            )}
          </div>
          {/* Actions: Add/remove from path and Close */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexShrink: 0 }}>
            <button onClick={() => { inPath ? onRemoveFromPath(tech.id) : onAddToPath(tech.id); haptic(8); }} style={{
              minHeight: 40, padding: "0 16px", borderRadius: 20,
              border: `1.5px solid ${inPath ? 'var(--border)' : col}`,
              background: inPath ? 'var(--bg-card)' : `${col}18`,
              color: inPath ? 'var(--text-sec)' : col,
              cursor: "pointer", fontWeight: 700, fontSize: 12,
              fontFamily: "'DM Sans',sans-serif", flexShrink: 0, whiteSpace: "nowrap",
            }}>{inPath ? "✓ In Flow" : "+ Add to Flow"}</button>
            <button onClick={onClose} style={{
              width: 40, height: 40, borderRadius: 20,
              background: "transparent", border: "1px solid #262626", color: "#777",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, cursor: "pointer", flexShrink: 0
            }}>✕</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {[["info", "Details"], ["train", "Training"], ["links", "Connections"], ["video", "Videos"]].map(([t, l]) => {
          const hasVideo = t === "video" && (TECH_VIDEOS[tech?.id] || []).length > 0;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, minHeight: 44, fontSize: 11, border: "none", background: "transparent",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              color: tab === t ? 'var(--text-pri)' : 'var(--text-sec)',
              borderBottom: tab === t ? `2px solid ${col}` : "2px solid transparent",
              fontWeight: tab === t ? 600 : 400,
              position: "relative",
            }}>
              {l}
              {hasVideo && tab !== "video" && (
                <span style={{
                  position: "absolute", top: 8, right: 6,
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#e53e3e", display: "block",
                }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 20px", WebkitOverflowScrolling: "touch" }}>
        {tab === "info" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {[
                { l: tech.skill_level, c: SKILL_COL[tech.skill_level] },
                { l: tech.gi_nogi, c: "#2563eb" },
                { l: `Risk: ${tech.risk_level}`, c: { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" }[tech.risk_level] },
                { l: tech.body_target, c: "#64748b" },
              ].map((b, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: b.c + "1e", color: b.c, fontWeight: 600
                }}>{b.l}</span>
              ))}
            </div>
            {tech.notes && (
              <p style={{
                fontSize: 13, color: "#bbb", lineHeight: 1.7, marginBottom: 14,
                borderLeft: `2px solid ${col}66`, paddingLeft: 12
              }}>{tech.notes}</p>
            )}
            {tech.common_setups?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 8
                }}>Setups</div>
                {tech.common_setups.map((s, i) => (
                  <div key={i} style={{
                    fontSize: 13, color: "#ccc", padding: "6px 0",
                    borderBottom: `1px solid var(--border)`, lineHeight: 1.55
                  }}>• {s}</div>
                ))}
              </div>
            )}
            {tech.primary_counters?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#e53e3e", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 8
                }}>Counters</div>
                {tech.primary_counters.map((c, i) => (
                  <div key={i} style={{
                    fontSize: 13, color: "var(--text-sec)", padding: "6px 0",
                    borderBottom: "1px solid var(--border)", lineHeight: 1.55
                  }}>• {c}</div>
                ))}
              </div>
            )}
            {tech.notable_practitioners?.length > 0 && (
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 8
                }}>Known for</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tech.notable_practitioners.map((p, i) => (
                    <span key={i} style={{
                      fontSize: 12, padding: "3px 10px", background: "var(--bg-total)",
                      borderRadius: 20, color: "var(--text-sec)", border: "1px solid var(--border)"
                    }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "train" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text-sec)" }}>Proficiency</span>
                <span style={{
                  fontSize: 32, fontWeight: 800, color: profColor(prof),
                  fontFamily: "'Barlow Condensed',sans-serif"
                }}>
                  {prof}<span style={{ fontSize: 13, color: "var(--text-sec)", opacity: 0.5 }}>/10</span>
                </span>
              </div>
              <input type="range" min={0} max={10} step={1} value={prof}
                onChange={e => setProf(+e.target.value)}
                style={{ width: "100%", accentColor: profColor(prof), cursor: "pointer" }}
              />
              <div style={{ height: 3, background: "var(--bg-total)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${prof * 10}%`, background: profColor(prof),
                  borderRadius: 2, transition: "width 0.2s,background 0.2s"
                }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {["Not started", "Learning", "Drilling", "Competition ready"].map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  minHeight: 44, borderRadius: 12,
                  border: `1px solid ${status === s ? col : "var(--border)"}`,
                  background: status === s ? col + "1e" : "var(--bg-total)",
                  color: status === s ? col : "var(--text-sec)",
                  cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif",
                }}>{s}</button>
              ))}
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Personal notes..."
              style={{
                width: "100%", boxSizing: "border-box", background: "var(--bg-total)",
                border: "1px solid var(--border)", borderRadius: 10, padding: 12, color: "var(--text-sec)",
                fontSize: 13, fontFamily: "'DM Sans',sans-serif", resize: "none", height: 68, marginBottom: 14
              }}
            />
            <button onClick={() => { rate(tech.id, prof, status, notes); haptic(12); onClose(); }} style={{
              width: "100%", minHeight: 46, borderRadius: 12, border: "none",
              background: `linear-gradient(135deg,${col},${col}bb)`,
              color: 'var(--text-pri)', fontWeight: 700, fontSize: 15, cursor: "pointer",
              fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.04em",
            }}>Save to Arsenal</button>
          </div>
        )}

        {tab === "links" && (
          <div>
            <div style={{ fontSize: 11, color: "var(--text-sec)", opacity: 0.6, marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
              {allNbrs.length} connected techniques — tap to navigate
            </div>
            {allNbrs.map(nb => {
              const nc = catColor(nb);
              const inP = path.includes(nb.id);
              return (
                <div key={nb.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0", borderBottom: "1px solid #141414",
                }}>
                  <div style={{ width: 3, height: 36, borderRadius: 2, background: nc, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: "var(--text-pri)",
                      fontFamily: "'Barlow Condensed',sans-serif",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>{nb.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-sec)", opacity: 0.6, marginTop: 1 }}>{nb.subcategory}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { onNavigate(nb.id); onClose(); }} style={{
                      fontSize: 11, padding: "5px 10px", borderRadius: 16,
                      border: `1px solid ${nc}55`, background: `${nc}11`,
                      color: nc, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    }}>Go →</button>
                    {!inP && (
                      <button onClick={() => onAddToPath(nb.id)} style={{
                        fontSize: 11, padding: "5px 10px", borderRadius: 16,
                        border: `1px solid var(--border)`, background: "transparent",
                        color: 'var(--text-sec)', cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                      }}>+ Flow</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "video" && (
          <div>
            {(TECH_VIDEOS[tech?.id] || []).length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 12, padding: "40px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 32, opacity: 0.2 }}>ðŸŽ¬</div>
                <div style={{ fontSize: 13, color: 'var(--border)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
                  No videos indexed yet for this technique.
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(tech.name + ' BJJ tutorial')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: 12, color: col, padding: "8px 16px",
                    border: `1px solid ${col}44`, borderRadius: 20,
                    textDecoration: "none", fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Search YouTube →
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {(TECH_VIDEOS[tech.id] || []).map((vid, i) => (
                  <div key={i}>
                    <div style={{
                      fontSize: 11, color: col, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      marginBottom: 8, fontFamily: "'DM Sans',sans-serif",
                    }}>
                      {vid.title}
                    </div>
                    <div style={{
                      width: "100%", aspectRatio: "16/9",
                      borderRadius: 12, overflow: "hidden",
                      background: 'var(--bg-page)', border: `1px solid var(--border)`,
                    }}>
                      <iframe
                        width="100%" height="100%"
                        src={vid.url}
                        title={vid.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ display: "block" }}
                      />
                    </div>
                  </div>
                ))}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(tech.name + ' BJJ tutorial')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "block", textAlign: "center",
                    fontSize: 12, color: 'var(--text-sec)', padding: "10px",
                    textDecoration: "none", fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Search more on YouTube →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes sheetUp{from{transform:translateY(60%);opacity:0.5}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

// ─── Library ──────────────────────────────────────────────────────────────────
function Library({ onSelect, onBack }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const filtered = useMemo(() => DATA.filter(t => {
    if (cat !== "All" && t.category !== cat) return false;
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, cat]);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-page)', zIndex: 400, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 14px 0", background: "#0d0d0d", borderBottom: "1px solid #191919", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button onClick={onBack} style={{
            background: "#181818", border: "none", color: "#999",
            width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: 20,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>←</button>
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-pri)' }}>
            Techniques
          </span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: 'var(--text-sec)' }}>{filtered.length}</span>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search techniques..."
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 14px",
            background: 'var(--bg-card)', border: "1px solid #1e1e1e", borderRadius: 10,
            color: "#e0e0e0", fontSize: 14, marginBottom: 10
          }}
        />
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12,
          WebkitOverflowScrolling: "touch", scrollbarWidth: "none"
        }}>
          {["All", ...Object.keys(CAT)].filter((v, i, a) => a.indexOf(v) === i).map(c => {
            const col = CAT[c] || "#22c55e"; const active = cat === c;
            return (
              <button key={c} onClick={() => setCat(c)} style={{
                minHeight: 36, padding: "0 13px", borderRadius: 20,
                border: `1px solid ${active ? col : 'var(--bg-card)'}`,
                background: active ? col + "1e" : "transparent",
                color: active ? col : 'var(--text-sec)', cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 12,
              }}>{c === "All" ? "All" : c.split(" ")[0]}</button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 200px", WebkitOverflowScrolling: "touch" }}>
        {filtered.map(t => {
          const col = catColor(t);
          return (
            <div key={t.id} onClick={() => { haptic(6); onSelect(t.id); onBack(); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 12px",
                marginBottom: 5, borderRadius: 12, background: 'var(--bg-card)', border: "1px solid #181818",
                cursor: "pointer", WebkitTapHighlightColor: "transparent", minHeight: 56
              }}>
              <div style={{ width: 3, height: 40, borderRadius: 2, background: col, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: "#e0e0e0",
                  fontFamily: "'Barlow Condensed',sans-serif",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 1 }}>{t.subcategory} · {t.skill_level}</div>
              </div>
              <span style={{ fontSize: 14, color: 'var(--border)', flexShrink: 0 }}>›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Arsenal ──────────────────────────────────────────────────────────────────
function Arsenal({ byId, onBack, onLoadFlow, onNavigate, embedded = false }) {
  const { store, delFlow } = useA();
  const [view, setView] = useState("saved");
  const saved = Object.entries(store.techs || {}).filter(([, v]) => v.proficiency > 0);
  const byCat = {};
  saved.forEach(([id, info]) => {
    const t = byId[+id]; if (!t) return;
    if (!byCat[t.category]) byCat[t.category] = [];
    byCat[t.category].push({ t, info });
  });
  const compReady = saved.filter(([, v]) => v.status === "Competition ready").length;
  const needsWork = saved.filter(([, v]) => v.proficiency > 0 && v.proficiency < 4).length;

  return (
    <div style={{ ...(embedded ? { flex: 1, overflow: "hidden" } : { position: "absolute", inset: 0, zIndex: 400 }), background: 'var(--bg-page)', display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: embedded ? "12px 16px 12px" : "24px 16px 12px", background: "#0d0d0d",
        borderBottom: "1px solid #191919", flexShrink: 0
      }}>
        {!embedded && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <button onClick={onBack} style={{
              background: "#181818", border: "none", color: "#999",
              width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>←</button>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-pri)' }}>
              Arsenal
            </span>
          </div>
        )}
      </div>

      {/* Saved flows — directly, no sub-tabs */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 120px", WebkitOverflowScrolling: "touch" }}>
        {(store.flows || []).length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "48px 24px", gap: 10, height: "100%",
          }}>
            <div style={{ fontSize: 32, opacity: 0.15 }}>⛓</div>
            <div style={{ fontSize: 14, color: 'var(--border)', fontFamily: "'DM Sans',sans-serif", textAlign: "center", lineHeight: 1.6 }}>
              No saved flows yet.<br />
              <span style={{ color: 'var(--text-sec)' }}>Build a flow on the Techniques tab and tap Save ↗</span>
            </div>
          </div>
        ) : (
          (store.flows || []).map(f => {
            const p = f.path || [];
            return (
              <div key={f.id} style={{
                background: 'var(--bg-card)', borderRadius: 14,
                padding: "14px", marginBottom: 10, border: "1px solid #191919"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 16, fontWeight: 700, color: "#e0e0e0",
                      fontFamily: "'Barlow Condensed',sans-serif"
                    }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 1 }}>
                      {p.length} technique{p.length !== 1 ? "s" : ""} · {new Date(f.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={() => onLoadFlow(f)} style={{
                    minHeight: 36, padding: "0 14px", borderRadius: 20,
                    border: "1px solid #22c55e", background: "#22c55e14",
                    color: "#22c55e", cursor: "pointer", fontSize: 12,
                    fontFamily: "'DM Sans',sans-serif", flexShrink: 0, fontWeight: 600
                  }}>Load ↗</button>
                  <button onClick={() => delFlow(f.id)} style={{
                    minHeight: 36, padding: "0 12px", borderRadius: 20,
                    border: "1px solid #1e1e1e", background: "transparent",
                    color: 'var(--border)', cursor: "pointer", fontSize: 14, flexShrink: 0
                  }}>✕</button>
                </div>
                {/* Chain preview */}
                <div style={{
                  display: "flex", alignItems: "center",
                  overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2
                }}>
                  {p.map((id, i) => {
                    const t = byId[id]; if (!t) return null;
                    const tc = catColor(t);
                    const pr = store.techs?.[id]?.proficiency || 0;
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <div style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: pr > 0 ? tc : tc + "44", border: `1px solid ${tc}`
                          }} />
                          <span style={{
                            fontSize: 9, color: tc,
                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600,
                            whiteSpace: "nowrap", maxWidth: 56,
                            overflow: "hidden", textOverflow: "ellipsis"
                          }}>{t.name.split(" ")[0]}</span>
                        </div>
                        {i < p.length - 1 && <span style={{ color: 'var(--border)', fontSize: 10, padding: "0 3px", marginBottom: 10 }}>›</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Save Modal ────────────────────────────────────────────────────────────────
function SaveModal({ path, byId, onSave, onClose }) {
  const startTech = byId[path[0]];
  const [name, setName] = useState(startTech ? `${startTech.name} Playbook` : "My Playbook");
  return createPortal(
    <div style={{
      position: "fixed", inset: 0, background: "#000b",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999
    }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)', borderRadius: "22px 22px 0 0",
        border: `1px solid var(--border)`, padding: "24px 20px",
        width: "100%", maxWidth: 430, boxSizing: "border-box",
        paddingBottom: `max(28px, env(safe-area-inset-bottom, 28px))`,
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed',sans-serif",
          fontSize: 24, fontWeight: 700, color: 'var(--text-pri)', marginBottom: 4
        }}>
          Save Flow
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
          {path.length} technique{path.length !== 1 ? "s" : ""} · {path.map(id => byId[id]?.name || "").filter(Boolean).slice(0, 2).join(" → ")}
          {path.length > 2 ? ` → +${path.length - 2} more` : ""}
        </div>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus
          onKeyDown={e => e.key === "Enter" && name.trim() && onSave(name.trim())}
          style={{
            width: "100%", boxSizing: "border-box", padding: "13px 14px",
            background: "#0d0d0d", border: `1px solid var(--border)`, borderRadius: 12,
            color: 'var(--text-pri)', fontSize: 16, marginBottom: 14,
            fontFamily: "'Barlow Condensed',sans-serif"
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => name.trim() && onSave(name.trim())} style={{
            flex: 1, minHeight: 50, borderRadius: 14, border: "none",
            background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 17,
            cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif",
            boxShadow: "0 4px 20px #22c55e44",
          }}>Save Playbook ✓</button>
          <button onClick={onClose} style={{
            minHeight: 50, padding: "0 20px", borderRadius: 14,
            border: `1px solid var(--border)`, background: "transparent",
            color: 'var(--text-sec)', fontSize: 14, cursor: "pointer",
          }}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
const STARTERS = [
  { id: 40, label: "Closed Guard", desc: "Classic guard attacks", cat: "Guard System" },
  { id: 41, label: "Half Guard", desc: "Sweeps & back takes", cat: "Guard System" },
  { id: 57, label: "Back Mount", desc: "Choke & submission system", cat: "Position" },
  { id: 58, label: "Side Control", desc: "Top pressure game", cat: "Position" },
  { id: 42, label: "Butterfly", desc: "Elevations & arm drags", cat: "Guard System" },
  { id: 1, label: "Rear Naked Choke", desc: "The most important finish", cat: "Submission" }
];

const RECOMMENDED_WHITE = [
  { id: 56, label: "Mount", desc: "Top control & submissions", cat: "Position" },
  { id: 26, label: "Americana", desc: "Basic shoulder lock", cat: "Submission" },
  { id: 104, label: "Upa Escape", desc: "Fundamental mount escape", cat: "Escape & Recovery" },
  { id: 92, label: "Double Leg", desc: "Highest% wrestling blast", cat: "Takedown & Throw" },
  { id: 25, label: "Kimura", desc: "Versatile shoulder lock", cat: "Submission" },
  { id: 81, label: "Knee Slice pass", desc: "Fast and heavy pressure", cat: "Guard Pass" }
];


function Onboarding({ belt, byId, onSelect, onSearch }) {
  const isWhite = belt === "White";
  return (
    <div style={{
      position: "absolute", inset: 0, background: 'var(--bg-page)',
      display: "flex", flexDirection: "column", zIndex: 500, padding: "24px 20px 0",
      paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))"
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed',sans-serif",
        fontSize: 26, fontWeight: 700, color: 'var(--text-pri)', marginBottom: 4
      }}>
        Where do you want to start?
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 20, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
        Pick a starting point and explore where it might lead.
      </div>

      {/* Search area moved to top */}
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div onClick={onSearch} style={{
          display: "flex", alignItems: "center", padding: "14px 18px",
          background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 16,
          cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke='var(--text-sec)' strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12, flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span style={{ fontSize: 14, color: 'var(--text-sec)', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
            Search all 163 techniques...
          </span>
        </div>
      </div>

      {/* Scrollable list so it never overflows */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, paddingBottom: 120 }}>

        {/* Core Fundamentals Group */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-pri)', marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Fundamental Positions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {STARTERS.map(s => {
              const col = CAT[s.cat] || 'var(--text-sec)';
              return (
                <button key={s.id} onClick={() => { haptic(8); onSelect(s.id); }} style={{
                  padding: "12px 12px", borderRadius: 12,
                  border: `1.5px solid ${col}33`, background: `${col}0d`,
                  cursor: "pointer", textAlign: "left",
                  WebkitTapHighlightColor: "transparent",
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: 'var(--text-pri)',
                    fontFamily: "'Barlow Condensed',sans-serif", marginBottom: 2
                  }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-sec)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.2, flex: 1 }}>{s.desc}</div>
                  <div style={{
                    fontSize: 9, color: col, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", marginTop: 6
                  }}>{s.cat}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* High Success Plays Group */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-pri)', marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>High-Percentage For Beginners</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {RECOMMENDED_WHITE.map(s => {
              const col = CAT[s.cat] || 'var(--text-sec)';
              return (
                <button key={s.id} onClick={() => { haptic(8); onSelect(s.id); }} style={{
                  padding: "12px 12px", borderRadius: 12,
                  border: `1.5px solid ${col}33`, background: `${col}0d`,
                  cursor: "pointer", textAlign: "left",
                  WebkitTapHighlightColor: "transparent",
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: 'var(--text-pri)',
                    fontFamily: "'Barlow Condensed',sans-serif", marginBottom: 2
                  }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-sec)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.2, flex: 1 }}>{s.desc}</div>
                  <div style={{
                    fontSize: 9, color: col, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", marginTop: 6
                  }}>{s.cat}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Belt selector ────────────────────────────────────────────────────────────
function BeltPicker({ onSelect }) {
  const BELTS = [
    { b: "White", c: "#e5e5e5" },
    { b: "Blue", c: "#3b82f6" },
    { b: "Purple", c: "#8b5cf6" },
    { b: "Brown", c: "#92400e" },
    { b: "Black", c: 'var(--text-sec)' },
  ];
  return (
    <div style={{
      position: "absolute", inset: 0, background: 'var(--bg-page)', zIndex: 500,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 28px"
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, marginBottom: 20,
        background: "linear-gradient(135deg,#22c55e,#16a34a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, fontWeight: 900, color: 'var(--text-pri)', fontFamily: "'Barlow Condensed',sans-serif"
      }}>T</div>
      <div style={{
        fontFamily: "'Barlow Condensed',sans-serif",
        fontSize: 28, fontWeight: 700, color: 'var(--text-pri)', marginBottom: 6, textAlign: "center"
      }}>
        What's your belt?
      </div>
      <div style={{
        fontSize: 13, color: 'var(--text-sec)', marginBottom: 32, textAlign: "center",
        fontFamily: "'DM Sans',sans-serif"
      }}>
        We'll personalise your starting view
      </div>
      <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
        {BELTS.map(({ b, c }) => (
          <button key={b} onClick={() => { haptic(8); onSelect(b); }} style={{
            width: "100%", padding: "15px 20px", borderRadius: 14,
            border: `1.5px solid ${c}44`, background: `${c}0d`,
            color: c, cursor: "pointer",
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700,
            textAlign: "left", display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ width: 22, height: 8, borderRadius: 2, background: c, opacity: 0.8, flexShrink: 0 }} />
            {b} Belt
            <span style={{ marginLeft: "auto", fontSize: 14, opacity: 0.3 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const adj = useMemo(() => buildGraph(), []);
  const byId = useMemo(() => { const m = {}; DATA.forEach(t => m[t.id] = t); return m; }, []);
  const { store, saveFlow, setBelt } = useA();

  const [focusId, setFocusId] = useState(null);
  const [fromId, setFromId] = useState(null);
  const [fromAngle, setFromAngle] = useState(null);
  const [navKey, setNavKey] = useState(0);
  const [path, setPath] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [screen, setScreen] = useState("canvas");
  const [showSave, setShowSave] = useState(false);
  const [matrixTab, setMatrixTab] = useState("techniques"); // 'techniques' | 'arsenal'

  // Onboarding
  const [beltDone, setBeltDone] = useState(true);
  const [started, setStarted] = useState(false);

  const detailTech = detailId ? byId[detailId] : null;
  const startTech = focusId ? byId[focusId] : null;
  const flowTitle = startTech ? `${startTech.name} System` : "TAPGUARD";

  // angle: the D4 angle of the spoke that was tapped (from DiamondCanvas)
  function navigateTo(id, angle) {
    setFromId(focusId);
    setFromAngle(angle != null ? angle : null);
    setFocusId(id);
    setDetailId(null);
    setNavKey(k => k + 1);
    haptic(6);
  }
  function addToPath(id) {
    if (!path.includes(id)) { setPath(p => [...p, id]); haptic(10); }
  }
  function removeFromPath(id) { setPath(p => p.filter(x => x !== id)); }
  function loadFlow(f) {
    const v = (f.path || []).filter(id => byId[id]);
    setFromId(null); setFromAngle(null);
    setPath(v); setFocusId(v[0] || null);
    setNavKey(k => k + 1);
    setDetailId(null);
  }
  function clear() {
    setPath([]); setFocusId(null);
    setFromId(null); setFromAngle(null);
    setDetailId(null);
  }

  const focusInPath = focusId && path.includes(focusId);
  const canSave = path.length >= 2;

  return (
    <div style={{
      width: "100%", height: "100%", background: 'var(--bg-page)',
      display: "flex", flexDirection: "column", overflow: "hidden",
      fontFamily: "'DM Sans',sans-serif",
      maxWidth: 430, margin: "0 auto", position: "relative",
      paddingBottom: 115 // Clear the tab bar
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        input,textarea,button{font-family:inherit;outline:none;}
        ::-webkit-scrollbar{display:none;}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:#1e1e1e;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:currentColor;cursor:pointer;}
      `}</style>

      {/* Onboarding layers */}
      { /* Belt picker completely removed for beginners */}
      {beltDone && !started && (
        <Onboarding belt={store.belt || "White"} byId={byId}
          onSelect={id => { setStarted(true); navigateTo(id); }}
          onSearch={() => { setStarted(true); setScreen("library"); }}
        />
      )}

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", padding: "11px 14px",
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        flexShrink: 0, gap: 8, zIndex: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7, flexShrink: 0,
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: "'Barlow Condensed',sans-serif",
        }}>T</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "var(--text-pri)",
            fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.05em",
            lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {flowTitle}
          </div>
          <div style={{ fontSize: 8, color: 'var(--text-sec)', letterSpacing: "0.12em", lineHeight: 1.4 }}>
            {focusId ? `THE PLAYBOOK · ${path.length} MOVE${path.length !== 1 ? "S" : ""}` : "THE PLAYBOOK"}
          </div>
        </div>
        {/* Action buttons — only show on techniques tab */}
        {matrixTab === "techniques" && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <button onClick={() => setScreen("library")} style={{
              minHeight: 34, padding: "0 12px", borderRadius: 20, border: "none",
              background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 11,
              cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif",
              letterSpacing: "0.04em", boxShadow: "0 2px 10px #22c55e44", whiteSpace: "nowrap",
            }}>＋ Technique</button>

            {focusId && (
              <button onClick={() => focusInPath ? removeFromPath(focusId) : addToPath(focusId)} style={{
                minHeight: 34, padding: "0 11px", borderRadius: 20,
                border: `1.5px solid ${focusInPath ? 'var(--border)' : catColor(byId[focusId]) + "66"}`,
                background: focusInPath ? "transparent" : `${catColor(byId[focusId])}16`,
                color: focusInPath ? 'var(--text-sec)' : catColor(byId[focusId]),
                fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.18s",
              }}>
                {focusInPath ? "✓ In Flow" : "+ Flow"}
              </button>
            )}

            {(focusId || path.length > 0) && (
              <button onClick={clear} style={{
                minHeight: 34, width: 34, borderRadius: 20, flexShrink: 0,
                border: `1px solid var(--border)`, background: "transparent",
                color: 'var(--text-sec)', fontSize: 14, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>✕</button>
            )}

            {canSave && (
              <button onClick={() => setShowSave(true)} style={{
                minHeight: 34, padding: "0 11px", borderRadius: 20,
                border: "1px solid #22c55e55", background: "#22c55e0f",
                color: "#22c55e", cursor: "pointer", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap",
              }}>Save ↗</button>
            )}
          </div>
        )}
      </div>

      {/* Matrix tab bar */}
      <div style={{
        display: "flex", flexShrink: 0,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "0 14px",
      }}>
        {[["techniques", "Techniques"], ["arsenal", "Arsenal"]].map(([tab, label]) => (
          <button key={tab} onClick={() => setMatrixTab(tab)} style={{
            flex: 1, minHeight: 38, border: "none", background: "transparent",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600,
            color: matrixTab === tab ? "var(--text-pri)" : 'var(--text-sec)',
            borderBottom: matrixTab === tab ? "2px solid #22c55e" : "2px solid transparent",
            transition: "color 0.15s",
          }}>{label}{tab === "arsenal" && (store.flows || []).length > 0 && (
            <span style={{
              marginLeft: 6, fontSize: 9, fontWeight: 700,
              background: "#22c55e", color: "#fff",
              borderRadius: 8, padding: "1px 5px", verticalAlign: "middle",
            }}>{(store.flows || []).length}</span>
          )}</button>
        ))}
      </div>

      {/* Canvas — Techniques tab */}
      {matrixTab === "techniques" && (
        <>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {focusId ? (
              <DiamondCanvas
                key={navKey}
                focusId={focusId} fromId={fromId} fromAngle={fromAngle}
                path={path} adj={adj} byId={byId} store={store}
                onNavigate={navigateTo}
                onOpenDetail={id => setDetailId(id)}
                onTogglePath={id => path.includes(id) ? removeFromPath(id) : addToPath(id)}
              />
            ) : started ? (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 16, padding: "32px"
              }}>
                <div style={{
                  fontSize: 13, color: 'var(--border)', textAlign: "center",
                  fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6
                }}>
                  Tap <span style={{ color: 'var(--text-sec)' }}>＋ Technique</span> to pick a move<br />and start exploring connections
                </div>
              </div>
            ) : null}

            {/* Detail sheet */}
            {detailTech && (
              <DetailSheet
                tech={detailTech} path={path} adj={adj} byId={byId}
                onClose={() => setDetailId(null)}
                onAddToPath={addToPath}
                onRemoveFromPath={removeFromPath}
                onNavigate={navigateTo}
              />
            )}
          </div>

          {/* Path builder */}
          <PathBuilder
            path={path} byId={byId} focusId={focusId}
            onTap={navigateTo}
            onRemove={removeFromPath}
            onAddFocus={() => addToPath(focusId)}
            focusInPath={focusInPath}
          />
        </>
      )}

      {/* Arsenal tab — embedded inline */}
      {matrixTab === "arsenal" && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Arsenal
            byId={byId}
            onBack={() => setMatrixTab("techniques")}
            onLoadFlow={f => { loadFlow(f); setMatrixTab("techniques"); }}
            onNavigate={id => { navigateTo(id); setMatrixTab("techniques"); }}
            embedded
          />
        </div>
      )}

      {/* Library overlay */}
      {screen === "library" && <Library onSelect={id => { navigateTo(id); setScreen("canvas"); setMatrixTab("techniques"); }} onBack={() => setScreen("canvas")} />}
      {showSave && (
        <SaveModal path={path} byId={byId}
          onSave={name => { saveFlow(name, path); setShowSave(false); haptic(15); }}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  );
}

export default function BJJFlowBuilder() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Provider><App /></Provider>
    </div>
  );
}
