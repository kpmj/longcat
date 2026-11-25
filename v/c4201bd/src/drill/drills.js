/* Drill planning: which notes a take asks for, in which key, at which speed.
   Key (decision 1, 2026-11-12): the player sings their lowest and highest note once; every drill's root is
   placed inside that range. Each time of day has its own ladder of drills (content.js LADDERS) and its own
   flavour: speed, note length and where in the range the drill sits. */
import { drillAt, sylFor, MOUTH } from "../content.js";

export const DEFAULT_RANGE = { low: 48, high: 67 }; // C3–G4: used until the range finder has run
const EDGE = 2; // keep this many semitones away from the edges the singer reached
export const GAP = 0.08; // silence between notes, seconds
export const BEAT_AIM = 0.66; // seconds: notes up to about a second apart get one beat each, longer ones get beats in between

/* rootShift moves the drill relative to the standard position; speed < 1 is slower; noteFrac < 1 leaves
   more air between notes. Night keeps the standard voicing threshold until real-voice tests (doc section 6). */
export const FLAVOURS = {
  morning: { speed: 0.85, noteFrac: 0.8, centred: true },
  golden: { speed: 1, noteFrac: 1, centred: false },
  night: { speed: 0.74, noteFrac: 1, centred: false },
};

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

/* Climbing (the designer, 2026-11-14: "for do re mi fa so fa mi re do ... the next one will be starting from re ... climb
   to the note that is the limit for the user and go back down"). A drill with climb: { by, most, back } is sung
   in rounds: the same shape, `by` semitones higher each round, until its top note reaches the top of the singer's
   range, then back down the same way. `most` caps the rounds going up; a capped climb still ends at the top, so
   it starts higher instead of stopping short. Returns the lowest note of round one and each round's shift. */
export const CLIMB_DEFAULT = { by: 2, most: 3, back: true };
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
export function climbRounds(range, span, base, climb, nudge = 0) {
  const { by, most, back } = { ...CLIMB_DEFAULT, ...climb };
  const { lo, hi } = bounds(range);
  const top = Math.floor(hi) + nudge - span; // the highest place the phrase's lowest note may sit
  /* a wide phrase leaves no room above its usual place: it starts lower, down to the bottom of the range */
  const start0 = Math.max(Math.min(base, Math.ceil(lo) + nudge), Math.min(base, top - by * Math.min(2, most)));
  const room = Math.max(0, Math.floor((top - start0) / by));
  const up = Math.min(room, most);
  const start = start0 + (room - up) * by;
  const shifts = [];
  for (let k = 0; k <= up; k++) shifts.push(k * by);
  if (back) for (let k = up - 1; k >= 0; k--) shifts.push(k * by);
  return { start, shifts, up };
}

/* The full plan of one take: notes with start/end in seconds from the first downbeat. A climbing drill has
   several rounds (plan.reps), a rest between them, and two places for a cue in each rest (plan.cues); the demo is
   the first round only (plan.demoCount notes, plan.demoTotal seconds). Every round knows its chord (rep.chord). */
/* The count-in: 3, 2, 1, Go, four beats on the demo's own beat, and the first note is the beat after Go (the designer,
   2026-11-24: "Let's do 3,2,1 go", and the metronome is to run on from the demo into the singing without a gap).
   It was five from 2026-11-14: Ready, 3, 2, 1 and a beat that showed nothing. Ready was the silent beat on which
   the microphone opened; the microphone now opens before the demo (take-screen.js). The empty beat was the designer's, so
   that nobody starts on a starting gun; Go stands on that beat now, still a whole beat before the note. */
export const COUNT_BEATS = 4;
export function planTake({ step, time = "golden", zone = "", range, nudge = 0, seed = "", drill: given = null }) {
  const drill = given || drillForStep(step, time); // `drill` is for the dev drill editor: hear a drill before it is saved
  const fl = FLAVOURS[time] || FLAVOURS.golden;
  const rel = drill.rel;
  const low = Math.min(...rel), span = Math.max(...rel) - low;
  /* rootFor places the lowest note of the phrase; a phrase that dips below its first note is lifted to fit */
  const base = rootFor(range, span, { centred: fl.centred, nudge });
  const climb = drill.climb ? climbRounds(range, span, base, drill.climb, nudge) : { start: base, shifts: [0], up: 0 };
  const root = climb.start - low;
  /* the cat's sound: from the zone, or from the seed "place.time.zone" when no zone is given */
  const syl = sylFor(zone || String(seed).split(".")[2], time);
  const slot = drill.dur / fl.speed;
  const len = slot * fl.noteFrac;
  /* The metronome: every note starts on a beat. Notes up to about a second apart get one beat each; slower
     drills get two or more beats to a note. The count-in runs at the same beat, so the tempo never changes
     within a take. A round and the rest after it are a whole number of beats, so the beat runs through the rest. */
  const every = slot + GAP, perNote = Math.max(1, Math.round(every / BEAT_AIM)), beat = every / perNote;
  const restBeats = Math.ceil(REST_BEATS / perNote) * perNote; // a whole number of notes: the next round starts where a note would
  const roundBeats = rel.length * perNote + restBeats; // every note's own beats, then the rest
  const notes = [], reps = [], cues = [], lift = chordLift(root);
  climb.shifts.forEach((shift, k) => {
    const first = k * roundBeats * beat;
    const i0 = notes.length;
    rel.forEach((r, j) => notes.push({ midi: root + shift + r, s: first + j * every, e: first + j * every + len }));
    const before = reps[k - 1];
    const chord = chordOf(root + shift + lift, rel);
    reps.push({ i0, n: rel.length, shift, s: first, e: notes[notes.length - 1].e, dir: !before ? "" : shift > before.shift ? "up" : "down", chord: chord.next });
    /* the rest before this round: the chord of the round just sung, then this round's, each on its beat. For now
       only the second sounds, as this round's first note, sung (`midi`, for `sung` seconds) */
    if (before) cues.push(
      { t: first - restBeats * beat, dur: (restBeats - CUE_BEATS) * beat * 0.95, midis: chordOf(root + before.shift + lift, rel).home, rep: k, home: true },
      { t: first - CUE_BEATS * beat, dur: CUE_BEATS * beat * 0.95, midis: chord.next, rep: k, midi: notes[i0].midi, sung: Math.min(CUE_LONG, beat * 0.9) },
    );
  });
  const total = notes[notes.length - 1].e;
  const accents = new Set(notes.map((n) => Math.round(n.s / beat)));
  return { step, drill, time, root, notes, total, beat, perNote, restBeats, countBeats: COUNT_BEATS, syl, mouth: MOUTH[syl] || "ah",
    reps, cues, accents, demoCount: rel.length, demoTotal: reps[0].e };
}
