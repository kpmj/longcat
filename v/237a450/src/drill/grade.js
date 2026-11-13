/* Grading a take (the designer's play-test, 2026-11-13). Every note gets one of three levels from how much of it was
   sung on the note:

     good  at least 80 % of the note was on it
     mid   30 to 80 %: room to improve
     off   under 30 %; silence counts as not on the note

   "On the note" is generous: within ON_CENTS of it, so a voice a little flat or sharp still counts. The slide
   from one note into the next is not graded (the first and last bit of every note is skipped). Latency is
   forgiven (estimated per take and subtracted); rhythm is not. A take counts if any voice was heard
   (decision 3, 2026-11-12).

   frames: [{ t, midi | null, conf }] with t in seconds from the first downbeat. */
import { STEPS } from "../content.js";

export const ON_CENTS = 60; // a frame this close to the note is on it (a semitone is 100)
export const GOOD_SHARE = 0.8;
export const OFF_SHARE = 0.3;
export const LEAD_SKIP = 0.18, LEAD_PART = 0.3; // the slide into a note: this many seconds, at most this part of it
export const TAIL_SKIP = 0.06, TAIL_PART = 0.1;
export const MIN_CONF = 0.5;
export const COUNT_SECONDS = 0.35; // any voice at all for this long and the take counts
export const SHAPE_N = 12;
export const LEVELS = ["good", "mid", "off"];

/* Singing the right note an octave away is the right note (and protects against tracker octave slips). */
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

/* The singer's constant delay (device + reaction): median offset of each note's first in-tune-ish frame. */
export function estimateLatency(frames, notes) {
  const offs = [];
  for (const n of notes) {
    const f = frames.find((x) => x.t >= n.s - 0.1 && x.t <= n.s + 0.5 && isVoiced(x) && Math.abs(foldCents((x.midi - n.midi) * 100)) < 150);
    if (f) offs.push(f.t - n.s);
  }
  if (!offs.length) return 0.1;
  return Math.max(0, Math.min(0.35, median(offs)));
}

/* The part of a note that is graded: the note minus the slide in and the release. */
export function windowOf(n, lat) {
  const len = n.e - n.s;
  return [n.s + lat + Math.min(LEAD_SKIP, len * LEAD_PART), n.e + lat - Math.min(TAIL_SKIP, len * TAIL_PART)];
}
export const levelOf = (share) => (share >= GOOD_SHARE ? "good" : share >= OFF_SHARE ? "mid" : "off");

export function gradeNote(frames, n, lat = 0.1) {
  const [a, b] = windowOf(n, lat);
  const inWin = frames.filter((f) => f.t >= a && f.t < b);
  const voiced = inWin.filter(isVoiced);
  const cs = voiced.map((f) => foldCents((f.midi - n.midi) * 100));
  const on = cs.filter((c) => Math.abs(c) <= ON_CENTS).length;
  const share = inWin.length ? on / inWin.length : 0;
  return {
    verdict: levelOf(share),
    share: Math.round(share * 100) / 100, // how much of the note was on it
    heard: inWin.length ? Math.round((voiced.length / inWin.length) * 100) / 100 : 0,
    cents: Math.round(median(cs)),
    frames: inWin.length,
  };
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

export function gradeTake(frames, plan) {
  const dt = frameStep(frames);
  const lat = estimateLatency(frames, plan.notes);
  const notes = plan.notes.map((n) => gradeNote(frames, n, lat));
  const sing = frames.filter((f) => f.t >= -0.2 && f.t <= plan.total + 0.6);
  const voicedSeconds = sing.filter(isVoiced).length * dt;
  let inWin = 0, voicedIn = 0;
  for (const n of plan.notes) {
    const [a, b] = windowOf(n, lat);
    for (const f of frames) if (f.t >= a && f.t < b) { inWin++; if (isVoiced(f)) voicedIn++; }
  }
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
