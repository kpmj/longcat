/* Drill planning: which notes a take asks for, in which key, at which speed, how many times.
   Key (decision 1, 2026-11-12): the player sings their lowest and highest note once; every drill's root is
   placed inside that range. Each garment has a ladder of drills for each time of day (content.js LADDERS); the
   step says how many sets a take has (STEP_RULE below). */
import { drillAt, sylFor, MOUTH } from "../content.js";

export const DEFAULT_RANGE = { low: 48, high: 67 }; // C3–G4: used until the range finder has run
const EDGE = 2; // keep this many semitones away from the edges the singer reached
export const BEAT_AIM = 0.66; // seconds: notes up to about a second apart get one beat each, longer ones get beats in between

/* Air between notes (the designer, 2026-11-25: "the cat-head indicator still feels too rush in between notes ... a bigger gap
   between notes so the user doesn't have to sing the next note right away. just like how vocalista space the
   notes"). Until then a note at golden hour and at night filled its whole place and the next began 0.08 s later; a
   morning note left a fifth of its place free. Now every note leaves the end of its place empty: the
   bar ends, the cat's head crosses the gap, and the next bar begins. A drill's `dur` is the whole place of a note,
   the gap included. In Vocalista's recording a note is a short piano tone on its beat and the pill on the screen
   marks where it starts; nothing there has to be held to the next one.
   The first numbers (35 % of the place, 0.2 to 0.6 s) were the agent's; the designer played them the same day: "gap between
   notes are way too long". Now about half: 18 %, 0.12 to 0.25 s. On the recording's screen a pill covers about
   86 % of the way to the next one, which is near this; still the agent's numbers, to be played.
   the designer, 2026-11-27, after playing those: "i feel like the notes are still too close to each other. when i sing the
   drill i feel rushed". A step back towards the first numbers, not all the way: 25 %, 0.16 to 0.32 s. Part of the
   rush was the picture and not the gap: the sung line was drawn late by the microphone's delay, so it ran about a
   tenth of a second past the end of each note into the gap (ui/lane-body.js, fixed the same day). A drill's `dur`
   is still a note's whole place, so the takes are as long as they were. */
export const GAP_SHARE = 0.25, GAP_MIN = 0.16, GAP_MAX = 0.32;

/* How long after its beat a note reaches the cat's head while the take is sung (the designer, 2026-11-27, after the sung
   line had been moved back to the note's start: "I still think the cat head is too ahead than note. maybe let's
   slow like 0.5 seconds of the cat head. e.g. the cat head is right on beat but it feels rushed so just slow the
   cat head arrival by 0.5 second"). The beat, the count, the chords and Go are where they were; the notes in the
   lane come this much later, and the grade follows the lane (take.js createTake). 0.5 s was the designer's guess ("maybe",
   "like") and went live; the designer played it the same day: half a second "feels not quite right", could it be 0.2 (in
   Chinese). So 0.2 s. Dev tools → Head delay tries other numbers on the phone. The picture is that much behind the
   metronome: a note meets the head a fifth of a second after its tick. */
export const HEAD_DELAY = 0.2;
export const gapOf = (slot) => Math.min(GAP_MAX, Math.max(GAP_MIN, slot * GAP_SHARE));

/* Where in the singer's range a time of day puts a drill sung once: morning in the middle, the others a little
   under it. Which drills a time of day has is in content.js LADDERS. */
export const FLAVOURS = {
  morning: { centred: true },
  golden: { centred: false },
  night: { centred: false },
};

/* THE RULE OF THE STEPS (the designer, 2026-11-25, in the evening: "i don't like using the time in the day to seperate the
   length. let's change it back to what we had but slightly different ... step 1-4 ranges from 8-10 seconds, step
   5-8 ranges from 24-30 seconds(3 sets), step 9-12 ranges from 40-50 seconds(5sets)"). A drill is a shape and the
   time each note gets; how often it is sung is the step's:
     steps 1 to 4    once: a take of 8 to 10 seconds
     steps 5 to 8    three sets: 24 to 30 seconds
     steps 9 to 12   five sets: 40 to 50 seconds
   A take is counted as the player meets it: the demo, the count and the singing (`takeSeconds`), not the card or
   the result. What a drill is for belongs to the garment (content.js LADDERS: the scarf agility, the top breath,
   the hat range), and the time of day changes nothing about the length: it only says which twelve drills the
   garment has (nine ladders, since later the same evening). For some hours of the same day the time of day
   decided the length (morning once, golden hour three rounds, night a minute); the designer played it and took it back.
   A ladder only has to choose `dur` so that its takes land in the band of their step (tests/engine.test.mjs
   checks the built-in ones). */
export const STEP_RULE = [
  { to: 4, rounds: 1, take: [8, 10] },
  { to: 8, rounds: 3, take: [24, 30] },
  { to: 12, rounds: 5, take: [40, 50] },
];
export const ruleOf = (step) => STEP_RULE.find((r) => step <= r.to) || STEP_RULE[STEP_RULE.length - 1];
const DEMO_TAIL = 0.45; // as in take.js: the demo ends on the first beat this long after its last note

/* The drill of a step: each garment (scarf, top, hat) has a ladder for each time of day (content.js). */
export function drillForStep(step, zone = "scarf", time = "golden") {
  return drillAt(zone, time, step);
}


/* The part of the range a phrase may use: EDGE semitones inside what the singer reached. */
function bounds(range) {
  const r = range && Number.isFinite(range.low) && Number.isFinite(range.high) && range.high > range.low ? range : DEFAULT_RANGE;
  return { lo: r.low + EDGE, hi: r.high - EDGE, centre: (r.low + r.high) / 2 };
}

/* Where the drill's root sits for this singer. Standard: the phrase starts a little under the middle of the
   range and climbs through it. Centred (morning): the phrase's own middle sits on the range's middle. */
export function rootFor(range, span, { centred = false, nudge = 0 } = {}) {
  const { lo, hi, centre } = bounds(range);
  let root = centred ? centre - span / 2 : centre - 4;
  if (hi - lo >= span) root = Math.max(lo, Math.min(hi - span, root));
  else root = centre - span / 2; // narrow range: centre the phrase and accept the edges
  return Math.max(36, Math.min(76, Math.round(root) + nudge));
}

/* Rounds. the designer, 2026-11-14, of the first climbing drill: "for do re mi fa so fa mi re do ... the next one will be
   starting from re ... climb to the note that is the limit for the user and go back down". Until 2026-11-25 a
   drill said itself whether it climbed (`climb: { by, most, back }`, steps 10 to 12 of every ladder); now the step
   says it (STEP_RULE) and `roundsFor` places the rounds. */
/* Between rounds, as Vocalista does it (the designer, 2026-11-24: "it plays the whole chord for the next set and it's on
   beat so the player doesn't get confused when to start ... Please follow exactly how it's implemented"). Measured
   from the sound of the designer's recording, round after round the same: the last note has its beat; on the next beat the
   chord of the round just sung, for one beat; on the beat after that the chord of the round to come, which rings
   for two beats; and the round starts on the beat after those. Three beats of rest, nothing off the beat, no voice.
   Its chords are close triads about an octave above the sung notes: the home chord with its fifth underneath
   (F♯3 B3 D♯4 F♯4 after a round in B), the next one from its root (C4 E4 G4 before a round in C).
   Before this the game sang the next first note alone: first wherever it fitted in the rest, then on a beat with
   1.4 s to react (the same day).

   the designer, 2026-11-25, after hearing it: the chords made in the page sound odd. Until chord recordings made in Logic
   Pro replace them, the rest keeps its three beats and its two places, but what sounds is the cue from before: the
   cat sings the next round's first note, on the beat where the next chord belongs (`cue.midi`, `cue.sung`). The
   home chord's place is silent. The chords stay in the plan (`cue.midis`, `rep.chord`) for those recordings.

   The same day, of the timing: the cue still came in unnaturally; it should be as if one note were left out, then
   a beat to think, then sing (in Chinese), and the timing was to be taken from the recording. What the recording
   has and the game did not: there a note is a beat, so the cue and the next round both fall where a note would
   have. Most of our climbing drills give a note two beats, and after a rest of three the cue and the round fell
   on the light beats between. So the rest is now a whole number of notes (`restBeats`, three beats or more): for
   a note of two beats it is one note left out, then the cue where the next note would start, a beat to think, and
   the round; for a note of one beat it is the recording's three beats as before. The cue is always two beats
   before the round.

   the designer, 2026-11-27, after playing the two piano chords: "for the cue in between sets, can you just play the chord
   one time and show GO right at the next beat instead". So a rest has ONE chord now, the chord of the round to
   come, two beats before it as before; on the next beat the screen says Go (`cue.go`), as the count before the
   take does, and the round starts on the beat after that. The chord of the round just sung, which stood on the
   first beat of the rest, is gone from the plan; the rest is as long as it was, with the metronome alone until
   the chord. `chordOf(...).home` is still here for whoever wants that chord back.

   the designer, later the same day, after playing the one chord: "when the cue happens, can you play the current chord then
   the updated chord to indicated the next starting point just like vocalista? tow chords should be played fairly
   quickly like within one beat so the next beat shows go". So the beat two beats before the round has BOTH chords
   again, half a beat each: on the beat the chord of the round just sung (with its fifth underneath, as in the
   recording), on its half the chord of the round to come, which rings on under Go; Go on the next beat; the round
   on the beat after. In the recording each chord has a beat of its own; here they share one, at the designer's word. */
export const CHORD_SPLIT = 0.5; // of a beat: where in the cue's beat the second chord comes
export const REST_BEATS = 3; // the rest is this long at least; it fills the bar (see planTake)
export const BAR = 4; // beats: a round and its rest are whole bars
export const CUE_BEATS = 2; // the cue's own beat and one to think: the round starts this many beats after the cue
const CUE_LONG = 0.8; // the sung cue lasts most of a beat, and this long at the most
const CHORD_LOW = 55, CHORD_HIGH = 66; // round one's chord has its root between G3 and F♯4, where a phone's speaker carries it
/* How many octaves the chords of a take sit above (or below) what is sung: decided once, from round one, so the
   chords climb with the rounds and never drop an octave between two of them. */
export function chordLift(rootMidi) {
  let lift = 0;
  while (rootMidi + lift < CHORD_LOW) lift += 12;
  while (rootMidi + lift > CHORD_HIGH) lift -= 12;
  return lift;
}
/* The triad on `c`: major, or minor when the drill has a minor third and no major one. */
export function chordOf(c, rel = [0, 4, 7]) {
  const pcs = new Set(rel.map((r) => ((r % 12) + 12) % 12)), third = pcs.has(3) && !pcs.has(4) ? 3 : 4;
  return { next: [c, c + third, c + 7], home: [c - 5, c, c + third, c + 7] };
}
/* Where n rounds of a phrase sit. way "up": each round a step higher; "down": each a step lower; "wave": up, a
   step a round, as far as half the rounds go, and back the same way. A step is a whole tone where the singer has
   room for two of them above the phrase, a semitone where there is less, and nothing where there is none: then
   every round is sung in the same place, and the take is as long as the rule says all the same. With less room
   than the rounds ask for they turn round early. `reach` (the hat's drills, which are for the range): the rounds
   end at the edge of what the singer has, the top going up and the bottom coming down, instead of starting from
   the usual place. Returns the lowest note of the lowest round and every round's shift above it. */
export function roundsFor(range, span, base, { n = 1, way = "up", nudge = 0, reach = false } = {}) {
  if (n <= 1) return { start: base, shifts: [0], by: 0, up: 0 };
  const { lo, hi } = bounds(range);
  const floor = Math.ceil(lo) + nudge, top = Math.floor(hi) + nudge - span; // where the phrase's lowest note may sit
  const room = Math.max(0, top - floor);
  const want = way === "wave" ? Math.floor(n / 2) : n - 1; // a wave of five goes up two and comes down two
  const by = Math.floor(room / 2) >= Math.min(want, 2) ? 2 : room >= 1 ? 1 : 0;
  const up = by ? Math.min(want, Math.floor(room / by)) : 0;
  const start = !up ? base : !reach ? Math.max(floor, Math.min(base, top - up * by)) : way === "down" ? floor : top - up * by;
  const shifts = [];
  for (let k = 0, pos = 0, dir = 1; k < n; k++) {
    shifts.push(pos * by);
    if (!up) continue;
    if (pos + dir > up || pos + dir < 0) dir = -dir;
    pos += dir;
  }
  /* coming down, the same walk is taken from the top: 4, 2, 0, and with little room 3, 2, 1, 0, 1 */
  return { start, shifts: way === "down" ? shifts.map((v) => up * by - v) : shifts, by, up };
}
/* How the sets of a garment move. Three sets: a step higher each time, or a step lower when the phrase itself
   comes down. Five sets: up two steps and back, as the first climbing drills did. The hat's drills are for the
   range, so its sets keep going the one way, to the top of what the singer has, or down to the bottom. */
const wayOf = (zone, rel, n) => {
  const falls = rel[rel.length - 1] < rel[0];
  if (zone === "bottom") return { way: falls ? "down" : "up", reach: true };
  return { way: n >= 5 ? "wave" : falls ? "down" : "up", reach: false };
};

/* A take as the player meets it, in seconds: the demo (one round, to its closing beat), the count, the singing. */
export const takeSeconds = (P) => Math.ceil(((P.demoTotal ?? P.total) + DEMO_TAIL) / P.beat - 1e-6) * P.beat + P.countBeats * P.beat + P.total;

/* The full plan of one take: notes with start/end in seconds from the first downbeat. From step 5 on
   it has several rounds (plan.reps; plan.way says how they move: "up", "down", "wave", or "same" where the singer
   has no room), a rest between them, and a cue in each rest (plan.cues: two chords in one beat, then Go); the demo is the first
   round only (plan.demoCount notes, plan.demoTotal seconds). Every round knows its chord (rep.chord).
   `rounds` is for the tests: sing it this many times whatever the step says. */
/* The count-in: 3, 2, 1, Go, four beats on the demo's own beat, and the first note is the beat after Go (the designer,
   2026-11-24: "Let's do 3,2,1 go", and the metronome is to run on from the demo into the singing without a gap).
   It was five from 2026-11-14: Ready, 3, 2, 1 and a beat that showed nothing. Ready was the silent beat on which
   the microphone opened; the microphone now opens before the demo (take-screen.js). The empty beat was the designer's, so
   that nobody starts on a starting gun; Go stands on that beat now, still a whole beat before the note. */
export const COUNT_BEATS = 4;
export function planTake({ step, time = "golden", zone = "", range, nudge = 0, seed = "", drill: given = null, rounds = null }) {
  const zoneId = zone || String(seed).split(".")[2] || "scarf";
  const drill = given || drillForStep(step, zoneId, time); // `drill` is for the dev drill editor: hear a drill before it is saved
  const fl = FLAVOURS[time] || FLAVOURS.golden;
  const rel = drill.rel;
  const low = Math.min(...rel), span = Math.max(...rel) - low;
  /* rootFor places the lowest note of the phrase; a phrase that dips below its first note is lifted to fit */
  const base = rootFor(range, span, { centred: fl.centred, nudge });
  /* the cat's sound: from the zone, or from the seed "place.time.zone" when no zone is given */
  const syl = sylFor(zone || String(seed).split(".")[2], time);
  /* a note's place and the part of it that sounds: the rest of the place is the gap before the next note */
  const slot = drill.dur, every = slot, len = slot - gapOf(slot);
  /* The metronome: every note starts on a beat. Notes up to about a second apart get one beat each; slower
     drills get two or more beats to a note. The count-in runs at the same beat, so the tempo never changes
     within a take. A round and the rest after it are a whole number of beats, so the beat runs through the rest. */
  const perNote = Math.max(1, Math.round(every / BEAT_AIM)), beat = every / perNote;
  /* A round and its rest are whole bars of four beats (the designer, 2026-11-25, of a night step 1: the cue "comes in off
     beat. it's really not helping player to sing on the right beat. please make sure it's on the beat and gives it
     a proper gap between two sets"). The cue was on a metronome beat already, but a round of nine, ten or eleven
     beats has no bar to it: a held note of five beats and a rest of four brought the cue on beat 7 and the next
     round on beat 9. The recording's round is twelve beats, three bars, with the cue on the third beat of the last
     one. Now every round is 8, 12, 16 ... beats: the notes, then a rest of three beats or more that fills the bar;
     the cue on the third beat of the last bar, a beat to think, and the round on the bar line. */
  const noteBeats = rel.length * perNote;
  const roundBeats = Math.ceil((noteBeats + REST_BEATS) / BAR - 1e-9) * BAR, restBeats = roundBeats - noteBeats;
  /* how many sets: the step's (STEP_RULE) */
  const n = rounds || ruleOf(step || 1).rounds;
  const climb = roundsFor(range, span, base, { n, nudge, ...wayOf(zoneId, rel, n) });
  const root = climb.start - low;
  const notes = [], reps = [], cues = [], lift = chordLift(root);
  climb.shifts.forEach((shift, k) => {
    const first = k * roundBeats * beat;
    const i0 = notes.length;
    rel.forEach((r, j) => notes.push({ midi: root + shift + r, s: first + j * every, e: first + j * every + len }));
    const before = reps[k - 1];
    const chord = chordOf(root + shift + lift, rel);
    reps.push({ i0, n: rel.length, shift, s: first, e: notes[notes.length - 1].e, dir: !before ? "" : shift > before.shift ? "up" : shift < before.shift ? "down" : "same", chord: chord.next });
    /* the rest before this round: two beats before it the chord of the round just sung and, half a beat later,
       this round's; Go on the beat between (`go`). `midi` and `sung` are this round's first note, on the cue's
       beat, for a take that sings the cue instead of the chords */
    if (before) {
      const at = first - CUE_BEATS * beat, next = at + CHORD_SPLIT * beat;
      cues.push(
        { t: at, dur: CHORD_SPLIT * beat * 0.95, midis: chordOf(root + before.shift + lift, rel).home, rep: k, home: true, midi: notes[i0].midi, sung: Math.min(CUE_LONG, beat * 0.9) },
        { t: next, dur: (first - next) * 0.95, midis: chord.next, rep: k, go: first - beat },
      );
    }
  });
  const total = notes[notes.length - 1].e;
  const accents = new Set(notes.map((n) => Math.round(n.s / beat)));
  const dirs = new Set(reps.slice(1).map((r) => r.dir));
  const way = reps.length < 2 ? "once" : dirs.has("same") ? "same" : dirs.size > 1 ? "wave" : [...dirs][0];
  return { step, drill, time, root, notes, total, beat, perNote, restBeats, countBeats: COUNT_BEATS, syl, mouth: MOUTH[syl] || "ah",
    reps, cues, accents, way, by: climb.by, demoCount: rel.length, demoTotal: reps[0].e };
}
