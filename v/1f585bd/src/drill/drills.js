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

/* A small deterministic PRNG so the free melody is the same every time a given step is sung (retakes too). */
export function seeded(seedText) {
  let h = 2166136261;
  for (const ch of String(seedText)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SCALE = [0, 2, 4, 5, 7, 9, 11, 12];
/* notes = how many; top = the highest scale degree it may reach (2 = within a third, 7 = the octave) */
export function freeMelody(seedText, { notes = 8, top = 7 } = {}) {
  const rnd = seeded(seedText);
  const out = [0];
  let k = 0;
  for (let j = 1; j < notes; j++) {
    k = Math.max(0, Math.min(top, k + [-2, -1, -1, 1, 1, 2][Math.floor(rnd() * 6)]));
    out.push(SCALE[k]);
  }
  return out;
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
export const REST_MIN = 1.2; // seconds of rest between rounds, at least: a breath, and the next first note is given
const CUE_AFTER = 0.25, CUE_BEFORE = 0.45, CUE_LONG = 0.5; // the cue leaves the last note alone and ends well before the next
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
   several rounds (plan.reps), a rest between them, and a cue of each next first note (plan.cues); the demo
   is the first round only (plan.demoCount notes, plan.demoTotal seconds). */
/* The count-in: Ready, 3, 2, 1, and one beat that shows nothing. Five beats, not four (2026-11-14): the microphone
   opens on the first, which is silent, so the phone has a beat to settle before the clicks; and the last is
   empty, a beat to breathe, so nobody has to start on a starting gun (take-screen.js). */
export const COUNT_BEATS = 5;
export function planTake({ step, time = "golden", zone = "", range, nudge = 0, seed = "", drill: given = null }) {
  const drill = given || drillForStep(step, time); // `drill` is for the dev drill editor: hear a drill before it is saved
  const fl = FLAVOURS[time] || FLAVOURS.golden;
  const rel = drill.free ? freeMelody(seed || drill.id, drill.free) : drill.rel;
  const low = Math.min(...rel), span = Math.max(...rel) - low;
  /* rootFor places the lowest note of the phrase; a phrase that dips below its first note is lifted to fit */
  const base = rootFor(range, span, { centred: fl.centred, nudge });
  const climb = drill.climb && !drill.free ? climbRounds(range, span, base, drill.climb, nudge) : { start: base, shifts: [0], up: 0 };
  const root = climb.start - low;
  /* the cat's sound: from the zone, or from the seed "place.time.zone" when no zone is given */
  const syl = sylFor(zone || String(seed).split(".")[2], time);
  const slot = drill.dur / fl.speed;
  const len = slot * fl.noteFrac;
  /* The metronome: every note starts on a beat. Notes up to about a second apart get one beat each; slower
     drills get two or more beats to a note. The count-in runs at the same beat, so the tempo never changes
     within a take. The rest between rounds is a whole number of note slots, so the beat runs through it. */
  const every = slot + GAP, perNote = Math.max(1, Math.round(every / BEAT_AIM)), beat = every / perNote;
  const restSlots = Math.max(1, Math.ceil(REST_MIN / every - 1e-9));
  const notes = [], reps = [], cues = [];
  climb.shifts.forEach((shift, k) => {
    const first = k * (rel.length + restSlots) * every;
    const i0 = notes.length;
    rel.forEach((r, j) => notes.push({ midi: root + shift + r, s: first + j * every, e: first + j * every + len }));
    const before = reps[k - 1];
    reps.push({ i0, n: rel.length, shift, s: first, e: notes[notes.length - 1].e, dir: !before ? "" : shift > before.shift ? "up" : "down" });
    if (before) {
      /* the next first note, sounded in the rest: after the last note has had its time, done well before the entry */
      const dur = Math.min(CUE_LONG, first - CUE_BEFORE - (before.e + CUE_AFTER));
      if (dur > 0.15) cues.push({ t: first - CUE_BEFORE - dur, dur, midi: notes[i0].midi, rep: k });
    }
  });
  const total = notes[notes.length - 1].e;
  const accents = new Set(notes.map((n) => Math.round(n.s / beat)));
  return { step, drill, time, root, notes, total, beat, perNote, countBeats: COUNT_BEATS, syl, mouth: MOUTH[syl] || "ah",
    reps, cues, accents, demoCount: rel.length, demoTotal: reps[0].e };
}
