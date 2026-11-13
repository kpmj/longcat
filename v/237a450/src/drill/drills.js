/* Drill planning: which notes a take asks for, in which key, at which speed.
   Key (decision 1, 2026-11-12): the player sings their lowest and highest note once; every drill's root is
   placed inside that range. Flavour (design doc section 6): only speed, note length and where in the range the
   drill sits change between times of day. */
import { DRILLS, STEPS } from "../content.js";

export const DEFAULT_RANGE = { low: 48, high: 67 }; // C3–G4: used until the range finder has run
const EDGE = 2; // keep this many semitones away from the edges the singer reached
export const GAP = 0.08; // silence between notes, seconds

/* rootShift moves the drill relative to the standard position; speed < 1 is slower; noteFrac < 1 leaves
   more air between notes. Night keeps the standard voicing threshold until real-voice tests (doc section 6). */
export const FLAVOURS = {
  morning: { speed: 0.85, noteFrac: 0.8, centred: true },
  golden: { speed: 1, noteFrac: 1, centred: false },
  night: { speed: 0.74, noteFrac: 1, centred: false },
};

export function drillForStep(step) {
  return DRILLS[Math.max(1, Math.min(STEPS, step)) - 1];
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
export function freeMelody(seedText) {
  const rnd = seeded(seedText);
  const out = [0];
  let k = 0;
  for (let j = 1; j < 8; j++) {
    k = Math.max(0, Math.min(7, k + [-2, -1, -1, 1, 1, 2][Math.floor(rnd() * 6)]));
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
export function planTake({ step, time = "golden", range, nudge = 0, seed = "" }) {
  const drill = drillForStep(step);
  const fl = FLAVOURS[time] || FLAVOURS.golden;
  const rel = drill.free ? freeMelody(seed || drill.id) : drill.rel;
  const span = Math.max(...rel) - Math.min(...rel);
  const root = rootFor(range, span, { centred: fl.centred, nudge });
  const slot = drill.dur / fl.speed;
  const len = slot * fl.noteFrac;
  const notes = [];
  let s = 0;
  rel.forEach((r) => {
    notes.push({ midi: root + r, s, e: s + len });
    s += slot + GAP;
  });
  const total = notes[notes.length - 1].e;
  const beat = Math.min(0.75, Math.max(0.5, slot));
  return { step, drill, time, root, notes, total, beat, countBeats: 4 };
}
