/* Drill planning: which notes a take asks for, in which key, at which speed, how many times.
   Key (decision 1, 2026-11-12): the player sings their lowest and highest note once; every drill's root is
   placed inside that range. Each time of day has its own ladder of drills (content.js LADDERS) and its own rule
   for how long a take is (TIME_RULE below). */
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
   86 % of the way to the next one, which is near this; still the agent's numbers, to be played. */
export const GAP_SHARE = 0.18, GAP_MIN = 0.12, GAP_MAX = 0.25;
export const gapOf = (slot) => Math.min(GAP_MAX, Math.max(GAP_MIN, slot * GAP_SHARE));

/* Where in the singer's range a time of day puts its drills: morning in the middle, the others a little under it. */
export const FLAVOURS = {
  morning: { centred: true },
  golden: { centred: false },
  night: { centred: false },
};

/* THE RULE OF THE THREE TIMES (the designer, 2026-11-25). A drill is a shape and the time each note gets; how often it is
   sung is not the drill's, it is the time of day's:
     morning  once. Short, for the foundation: a take of 8 to 10 seconds.
     golden   three rounds, each a step higher, or each a step lower when the shape itself comes down: 24 to 30 s.
     night    as long as the exercise in the designer's Vocalista recording: round after round, up to the top and back, 50
              seconds to a minute. The number of rounds is whatever brings the take nearest to `aim`.
   A take is counted as the player meets it: the demo, the count and the singing (`takeSeconds`), not the card or
   the result. Every place uses this rule, and a place added later gets it without anything being written for it:
   a shape put in a morning ladder is sung once, in a night ladder for a minute. What a new ladder has to do itself
   is choose `dur` so that its takes land in the band (tests/engine.test.mjs checks the built-in ones):
     morning  a phrase of about 2.5 to 3.2 s (one note of 3 s, two of 1.5, three of 1, four of 0.75)
     golden   a phrase of about 4.4 to 5.2 s
     night    a phrase of up to 7 s or so; the rounds make up the rest */
export const TIME_RULE = {
  morning: { rounds: 1, take: [8, 10] },
  golden: { rounds: 3, take: [24, 30] },
  night: { aim: 55, most: 15, take: [50, 60] },
};
const DEMO_TAIL = 0.45; // as in take.js: the demo ends on the first beat this long after its last note

/* The drill of a step: each time of day has its own ladder (content.js). */
export function drillForStep(step, time = "golden") {
  return drillAt(time, step);
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
   drill said itself whether it climbed (`climb: { by, most, back }`, steps 10 to 12 of every ladder); now the time
   of day says it (TIME_RULE) and `roundsFor` places the rounds. */
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
   before the round. */
export const REST_BEATS = 3; // the rest is this long at least, and a whole number of notes
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
   than the rounds ask for they turn round early. Returns the lowest note of the lowest round and every round's
   shift above it. */
export function roundsFor(range, span, base, { n = 1, way = "up", nudge = 0 } = {}) {
  if (n <= 1) return { start: base, shifts: [0], by: 0, up: 0 };
  const { lo, hi } = bounds(range);
  const floor = Math.ceil(lo) + nudge, top = Math.floor(hi) + nudge - span; // where the phrase's lowest note may sit
  const room = Math.max(0, top - floor);
  const want = way === "wave" ? Math.floor(n / 2) : n - 1; // a wave of six goes up three and comes down two
  const by = Math.floor(room / 2) >= Math.min(want, 2) ? 2 : room >= 1 ? 1 : 0;
  const up = by ? Math.min(want, Math.floor(room / by)) : 0;
  const start = up ? Math.max(floor, Math.min(base, top - up * by)) : base;
  const shifts = [];
  for (let k = 0, pos = 0, dir = 1; k < n; k++) {
    shifts.push(pos * by);
    if (!up) continue;
    if (pos + dir > up || pos + dir < 0) dir = -dir;
    pos += dir;
  }
  if (way === "down") shifts.reverse();
  return { start, shifts, by, up };
}
/* how a time of day sings this shape: "once", or the way of its rounds */
const wayOf = (time, rel) => (time === "night" ? "wave" : rel[rel.length - 1] < rel[0] ? "down" : "up");

/* A take as the player meets it, in seconds: the demo (one round, to its closing beat), the count, the singing. */
export const takeSeconds = (P) => Math.ceil(((P.demoTotal ?? P.total) + DEMO_TAIL) / P.beat - 1e-6) * P.beat + P.countBeats * P.beat + P.total;

/* The full plan of one take: notes with start/end in seconds from the first downbeat. At golden hour and at night
   it has several rounds (plan.reps; plan.way says how they move: "up", "down", "wave", or "same" where the singer
   has no room), a rest between them, and two places for a cue in each rest (plan.cues); the demo is the first
   round only (plan.demoCount notes, plan.demoTotal seconds). Every round knows its chord (rep.chord).
   `rounds` is for the dev drill editor and the tests: sing it this many times whatever the time of day says. */
/* The count-in: 3, 2, 1, Go, four beats on the demo's own beat, and the first note is the beat after Go (the designer,
   2026-11-24: "Let's do 3,2,1 go", and the metronome is to run on from the demo into the singing without a gap).
   It was five from 2026-11-14: Ready, 3, 2, 1 and a beat that showed nothing. Ready was the silent beat on which
   the microphone opened; the microphone now opens before the demo (take-screen.js). The empty beat was the designer's, so
   that nobody starts on a starting gun; Go stands on that beat now, still a whole beat before the note. */
export const COUNT_BEATS = 4;
export function planTake({ step, time = "golden", zone = "", range, nudge = 0, seed = "", drill: given = null, rounds = null }) {
  const drill = given || drillForStep(step, time); // `drill` is for the dev drill editor: hear a drill before it is saved
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
  /* a whole number of notes, so the next round starts where a note would; after a long held note (four beats or
     more) that would be a rest as long as the note, and four beats are enough */
  const restBeats = perNote <= 3 ? Math.ceil(REST_BEATS / perNote) * perNote : 4;
  const roundBeats = rel.length * perNote + restBeats; // every note's own beats, then the rest
  /* how many rounds: the time of day's (TIME_RULE). At night, as many as bring the whole take nearest to its aim */
  const rule = TIME_RULE[time] || TIME_RULE.golden, phrase = (rel.length - 1) * every + len;
  const whole = (n) => Math.ceil((phrase + DEMO_TAIL) / beat - 1e-6) * beat + COUNT_BEATS * beat + (n - 1) * roundBeats * beat + phrase;
  let n = rounds || rule.rounds || 0;
  if (!n) for (let k = 3, best = Infinity; k <= rule.most; k++) { const d = Math.abs(whole(k) - rule.aim); if (d < best - 1e-9) { best = d; n = k; } }
  const climb = roundsFor(range, span, base, { n, way: wayOf(time, rel), nudge });
  const root = climb.start - low;
  const notes = [], reps = [], cues = [], lift = chordLift(root);
  climb.shifts.forEach((shift, k) => {
    const first = k * roundBeats * beat;
    const i0 = notes.length;
    rel.forEach((r, j) => notes.push({ midi: root + shift + r, s: first + j * every, e: first + j * every + len }));
    const before = reps[k - 1];
    const chord = chordOf(root + shift + lift, rel);
    reps.push({ i0, n: rel.length, shift, s: first, e: notes[notes.length - 1].e, dir: !before ? "" : shift > before.shift ? "up" : shift < before.shift ? "down" : "same", chord: chord.next });
    /* the rest before this round: the chord of the round just sung, then this round's, each on its beat. For now
       only the second sounds, as this round's first note, sung (`midi`, for `sung` seconds) */
    if (before) cues.push(
      { t: first - restBeats * beat, dur: (restBeats - CUE_BEATS) * beat * 0.95, midis: chordOf(root + before.shift + lift, rel).home, rep: k, home: true },
      { t: first - CUE_BEATS * beat, dur: CUE_BEATS * beat * 0.95, midis: chord.next, rep: k, midi: notes[i0].midi, sung: Math.min(CUE_LONG, beat * 0.9) },
    );
  });
  const total = notes[notes.length - 1].e;
  const accents = new Set(notes.map((n) => Math.round(n.s / beat)));
  const dirs = new Set(reps.slice(1).map((r) => r.dir));
  const way = reps.length < 2 ? "once" : dirs.has("same") ? "same" : dirs.size > 1 ? "wave" : [...dirs][0];
  return { step, drill, time, root, notes, total, beat, perNote, restBeats, countBeats: COUNT_BEATS, syl, mouth: MOUTH[syl] || "ah",
    reps, cues, accents, way, by: climb.by, demoCount: rel.length, demoTotal: reps[0].e };
}
