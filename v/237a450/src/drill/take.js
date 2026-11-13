/* One take as a small state machine, free of DOM and audio so tests can run it with synthetic voices.
   Flow (same as the meme-games prototypes): the phrase is hummed once in tempo (demo), four count-in beats,
   then the player sings it unaccompanied past a playhead. The caller drives it with step(dt, frame). */
import { gradeNote, gradeTake, estimateLatency } from "./grade.js";

export const DEMO_LEAD = 0.5;
export const DEMO_TAIL = 0.45;
export const SING_TAIL = 0.55; // keep listening after the last note so a late singer is not cut off

export function createTake(plan) {
  return { plan, phase: "demo", t: -DEMO_LEAD, frames: [], demoIdx: -1, beatIdx: -1, singIdx: -1, ended: 0, lat: 0.1, live: [], grade: null };
}

export function skipDemo(T) {
  if (T.phase === "demo") enterCount(T);
  return T;
}
function enterCount(T) {
  T.phase = "count";
  T.t = -T.plan.beat * T.plan.countBeats;
  T.beatIdx = -1;
}

export function currentIndex(T) {
  const n = T.plan.notes;
  for (let i = 0; i < n.length; i++) if (T.t >= n[i].s && T.t < n[i].e) return i;
  return -1;
}

/* Advance by dt seconds. frame = { midi, conf } (or null) is what the voice did during this step; it is only
   recorded while singing. Returns a list of events for the view. */
export function stepTake(T, dt, frame = null) {
  const ev = [];
  const P = T.plan;
  if (T.phase === "done") return ev;
  T.t += dt;
  if (T.phase === "demo") {
    for (let i = T.demoIdx + 1; i < P.notes.length && T.t >= P.notes[i].s; i++) { T.demoIdx = i; ev.push({ type: "demo-note", i }); }
    if (T.t >= P.total + DEMO_TAIL) { enterCount(T); ev.push({ type: "phase", phase: "count" }); }
    return ev;
  }
  if (T.phase === "count") {
    const k = Math.floor((T.t + P.beat * P.countBeats) / P.beat);
    if (k > T.beatIdx && k < P.countBeats) { T.beatIdx = k; ev.push({ type: "beat", k }); }
    if (T.t >= 0) { T.phase = "sing"; ev.push({ type: "phase", phase: "sing" }); }
    return ev;
  }
  /* sing */
  T.frames.push({ t: T.t, midi: frame && Number.isFinite(frame.midi) ? frame.midi : null, conf: frame ? frame.conf ?? 1 : 0 });
  for (let i = T.singIdx + 1; i < P.notes.length && T.t >= P.notes[i].s; i++) { T.singIdx = i; ev.push({ type: "note-start", i }); }
  while (T.ended < P.notes.length && T.t >= P.notes[T.ended].e + T.lat + 0.05) {
    const i = T.ended++;
    const r = gradeNote(T.frames, P.notes[i], T.lat);
    T.live[i] = r;
    T.lat = estimateLatency(T.frames, P.notes.slice(0, i + 1));
    ev.push({ type: "note-end", i, result: r });
  }
  if (T.t >= P.total + SING_TAIL) {
    T.phase = "done";
    T.grade = gradeTake(T.frames, P);
    ev.push({ type: "done", grade: T.grade });
  }
  return ev;
}

/* Run a whole take with a synthetic voice: voice(t, note | null) -> { midi, conf } | null. */
export function simulateTake(plan, voice, fps = 60) {
  const T = createTake(plan);
  skipDemo(T);
  const dt = 1 / fps;
  let guard = 0;
  while (T.phase !== "done" && guard++ < 100000) {
    const i = currentIndex(T);
    stepTake(T, dt, T.phase === "sing" ? voice(T.t, i >= 0 ? plan.notes[i] : null, T) : null);
  }
  return T;
}

/* Synthetic singers, for tests and the dev panel. Each takes the note under the playhead (with the singer's own
   delay already applied by the caller's timing) and returns a frame. */
export const VOICES = {
  good: (t, n) => (n ? { midi: n.midi + Math.sin(t * 11) * 0.05, conf: 0.95 } : null),
  silent: () => null,
  /* in tune except the third note (or the second, in short phrases), sung a minor third sharp */
  tufty: (t, n, T) => {
    if (!n) return null;
    const notes = T ? T.plan.notes : [];
    const bad = notes.length > 2 ? 2 : notes.length - 1;
    const i = notes.indexOf(n);
    return { midi: n.midi + (i === bad ? 3 : 0) + Math.sin(t * 9) * 0.06, conf: 0.92 };
  },
  /* near every note but drifting a semitone either side: on the note about half the time */
  wobbly: (t, n) => (n ? { midi: n.midi + Math.sin(t * 9) * 0.95, conf: 0.9 } : null),
  /* a little flat and a little shaky, the way a real voice is: still on the note */
  human: (t, n) => (n ? { midi: n.midi - 0.3 + Math.sin(t * 31) * 0.2, conf: 0.85 } : null),
  /* sings the first half of the phrase, then stops */
  half: (t, n, T) => (n && T && T.plan.notes.indexOf(n) < T.plan.notes.length / 2 ? { midi: n.midi, conf: 0.9 } : null),
};

/* A singer who comes in late by `delay` seconds, like a phone with input latency. */
export function late(voice, delay) {
  return (t, n, T) => {
    if (!T) return voice(t, n, T);
    const tt = t - delay;
    const m = T.plan.notes.find((x) => tt >= x.s && tt < x.e) || null;
    return voice(tt, m, T);
  };
}
