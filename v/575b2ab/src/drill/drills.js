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

/* Where the drill's root sits for this singer. Standard: the phrase starts a little under the middle of the
   range and climbs through it. Centred (morning): the phrase's own middle sits on the range's middle. */
export function rootFor(range, span, { centred = false, nudge = 0 } = {}) {
  const r = range && Number.isFinite(range.low) && Number.isFinite(range.high) && range.high > range.low ? range : DEFAULT_RANGE;
  const centre = (r.low + r.high) / 2;
  const lo = r.low + EDGE, hi = r.high - EDGE;
  let root = centred ? centre - span / 2 : centre - 4;
  if (hi - lo >= span) root = Math.max(lo, Math.min(hi - span, root));
  else root = centre - span / 2; // narrow range: centre the phrase and accept the edges
  return Math.max(36, Math.min(76, Math.round(root) + nudge));
}

/* The full plan of one take: notes with start/end in seconds from the first downbeat. */
export function planTake({ step, time = "golden", zone = "", range, nudge = 0, seed = "" }) {
  const drill = drillForStep(step, time);
  const fl = FLAVOURS[time] || FLAVOURS.golden;
  const rel = drill.free ? freeMelody(seed || drill.id, drill.free) : drill.rel;
  const low = Math.min(...rel), span = Math.max(...rel) - low;
  /* rootFor places the lowest note of the phrase; a phrase that dips below its first note is lifted to fit */
  const root = rootFor(range, span, { centred: fl.centred, nudge }) - low;
  /* the cat's sound: from the zone, or from the seed "place.time.zone" when no zone is given */
  const syl = sylFor(zone || String(seed).split(".")[2], time);
  const slot = drill.dur / fl.speed;
  const len = slot * fl.noteFrac;
  const notes = [];
  let s = 0;
  rel.forEach((r) => {
    notes.push({ midi: root + r, s, e: s + len });
    s += slot + GAP;
  });
  const total = notes[notes.length - 1].e;
  /* The metronome: every note starts on a beat. Notes up to about a second apart get one beat each; slower
     drills get two or more beats to a note. The count-in runs at the same beat, so the tempo never changes
     within a take. */
  const every = slot + GAP, perNote = Math.max(1, Math.round(every / BEAT_AIM));
  return { step, drill, time, root, notes, total, beat: every / perNote, perNote, countBeats: 4, syl, mouth: MOUTH[syl] || "ah" };
}
