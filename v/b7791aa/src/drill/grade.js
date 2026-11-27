/* Grading a whole take. Each note's verdict comes from the old Vocal Gym drill scorer (./match.js): on the note
   (green), close (amber) or off (red, or nothing sung for it). This file adds what Longcat needs on top: the
   counts, where the folds go, whether the take counts, the take's shape and its 有聲比例.

   A take counts if any voice was heard (decision 3, 2026-11-12). frames: [{ t, midi | null, conf }] with t in
   seconds from the first downbeat. */
import { STEPS } from "../content.js";

export const MIN_CONF = 0.5;
export const COUNT_SECONDS = 0.35; // any voice at all for this long and the take counts
export const SHAPE_N = 12;
export const LEVELS = ["good", "mid", "off"];

/* The garment's wobble is drawn by distance from the note; an octave away draws as the note (it is only art). */
export const foldCents = (c) => c - 1200 * Math.round(c / 1200);
const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const isVoiced = (f) => f.midi != null && f.conf >= MIN_CONF;

export function frameStep(frames) {
  if (frames.length < 2) return 1 / 60;
  const d = [];
  for (let i = 1; i < frames.length; i++) d.push(frames[i].t - frames[i - 1].t);
  return Math.max(1 / 240, Math.min(0.1, median(d)));
}

/* How much of a note's time had any voice in it, after latency: 0 means the singer was silent there. */
export function heardShare(frames, n, lat) {
  const inWin = frames.filter((f) => f.t >= n.s + lat && f.t < n.e + lat);
  return inWin.length ? Math.round((inWin.filter(isVoiced).length / inWin.length) * 100) / 100 : 0;
}

/* The take's shape: SHAPE_N slices of how far from the note each part was, in [-1, 1]; null where silent. */
export function takeShape(frames, plan, lat) {
  const out = [];
  const T = Math.max(0.1, plan.total);
  for (let i = 0; i < SHAPE_N; i++) {
    const a = (T * i) / SHAPE_N + lat, b = (T * (i + 1)) / SHAPE_N + lat;
    const sl = frames.filter((f) => f.t >= a && f.t < b);
    const v = sl.filter(isVoiced);
    if (!sl.length || v.length < sl.length * 0.4) { out.push(null); continue; }
    const cs = v.map((f) => {
      const n = plan.notes.find((x) => f.t - lat >= x.s - 0.04 && f.t - lat < x.e + 0.04) || nearestNote(plan.notes, f.t - lat);
      return foldCents((f.midi - n.midi) * 100);
    });
    const m = cs.reduce((s, x) => s + x, 0) / cs.length;
    out.push(Math.round(Math.max(-1, Math.min(1, m / 100)) * 100) / 100);
  }
  return out;
}
function nearestNote(notes, t) {
  let best = notes[0], bd = Infinity;
  for (const n of notes) {
    const d = t < n.s ? n.s - t : t > n.e ? t - n.e : 0;
    if (d < bd) { bd = d; best = n; }
  }
  return best;
}

/* results: the matcher's per-note results, in order; lat: the latency it settled on. */
export function gradeTake(frames, plan, results, lat) {
  const dt = frameStep(frames);
  const notes = plan.notes.map((n, i) => ({ ...results[i], heard: heardShare(frames, n, lat) }));
  const sing = frames.filter((f) => f.t >= -0.2 && f.t <= plan.total + 0.6 + Math.max(0, lat)); // a late singer's last note runs that much past the plan
  const voicedSeconds = sing.filter(isVoiced).length * dt;
  let inWin = 0, voicedIn = 0;
  for (const n of plan.notes) for (const f of frames) if (f.t >= n.s + lat && f.t < n.e + lat) { inWin++; if (isVoiced(f)) voicedIn++; }
  const counts = { good: 0, mid: 0, off: 0 };
  notes.forEach((r) => counts[r.verdict]++);
  /* where along the take each off note sits (0 to 1): the garment gets a fold there */
  const T = Math.max(0.1, plan.total);
  const folds = [];
  plan.notes.forEach((n, i) => { if (notes[i].verdict === "off") folds.push(Math.round(((n.s + n.e) / 2 / T) * 100) / 100); });
  return {
    counted: voicedSeconds >= COUNT_SECONDS,
    voicedSeconds: Math.round(voicedSeconds * 100) / 100,
    voicedRatio: inWin ? Math.round((voicedIn / inWin) * 100) / 100 : 0, // 有聲比例: local only, never shown
    latency: Math.round(lat * 1000) / 1000,
    notes,
    counts,
    folds,
    tuft: folds.length > 0, // kept for saves written before folds
    shape: takeShape(frames, plan, lat),
  };
}

/* One word for the whole take, used for the result line and the judge's face. */
export function takeMood(g) {
  if (!g.counted) return "unheard";
  if (g.counts.off) return "off";
  if (g.counts.mid) return "mid";
  return "good";
}

export const emptySteps = () => Array.from({ length: STEPS }, () => null);
