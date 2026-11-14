/* One take as a small state machine, free of DOM and audio so tests can run it with synthetic voices.
   Flow (same as the meme-games prototypes): the phrase is hummed once in tempo (demo), four count-in beats,
   then the player sings it past a playhead with only the metronome under them. The caller drives it with step(dt, frame).
   While singing, every frame goes to the old Vocal Gym note matcher (./match.js); a note's verdict arrives
   once the singer is past it. */
import { gradeTake, heardShare } from "./grade.js";
import { NoteMatcher } from "./match.js";
import { createOctaveGuard, guardOctave } from "./octave.js";

export const DEMO_LEAD = 0.5;
export const DEMO_TAIL = 0.45;
export const SING_TAIL = 0.55; // keep listening after the last note so a late singer is not cut off

export function createTake(plan) {
  return { plan, phase: "demo", t: -DEMO_LEAD, frames: [], demoIdx: -1, beatIdx: -1, singIdx: -1, matcher: new NoteMatcher(plan.notes), octave: createOctaveGuard(), live: [], grade: null };
}

export function skipDemo(T) {
  if (T.phase === "demo") enterCount(T);
  return T;
}
function enterCount(T, over = 0) {
  T.phase = "count";
  T.t = -T.plan.beat * T.plan.countBeats + over;
  T.beatIdx = -1;
}

/* The demo ends on a beat, so the metronome runs on into the count-in without a hiccup. */
export const demoEnd = (P) => Math.ceil((P.total + DEMO_TAIL) / P.beat - 1e-6) * P.beat;

/* Metronome beats that fall in [from, to) of the take's own clock: every beat while the phrase is hummed, and
   every beat from the first downbeat to the end of the last note while it is sung. The four count-in beats
   are not here: they are the count-in clicks. accent = a note starts on this beat. */
export function ticksIn(T, from, to) {
  const P = T.plan, out = [];
  if (T.phase === "done") return out;
  const end = T.phase === "demo" ? demoEnd(P) - 1e-6 : P.total;
  for (let k = Math.max(0, Math.ceil(from / P.beat - 1e-6)); k * P.beat < to && k * P.beat <= end; k++) {
    out.push({ t: k * P.beat, accent: k % P.perNote === 0 && k / P.perNote < P.notes.length });
  }
  return out;
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
    if (T.t >= demoEnd(P)) { enterCount(T, T.t - demoEnd(P)); ev.push({ type: "phase", phase: "count" }); }
    return ev;
  }
  if (T.phase === "count") {
    const k = Math.floor((T.t + P.beat * P.countBeats) / P.beat);
    if (k > T.beatIdx && k < P.countBeats) { T.beatIdx = k; ev.push({ type: "beat", k }); }
    if (T.t >= 0) { T.phase = "sing"; ev.push({ type: "phase", phase: "sing" }); }
    return ev;
  }
  /* sing */
  let midi = frame && Number.isFinite(frame.midi) ? frame.midi : null;
  const conf = frame ? frame.conf ?? 1 : 0;
  /* a frame read an octave off from where the singer clearly is goes back to that octave (octave.js) */
  if (midi !== null && conf >= 0.5) midi = guardOctave(T.octave, midi, T.t, P.notes, T.matcher.latency);
  T.frames.push({ t: T.t, midi, conf });
  for (let i = T.singIdx + 1; i < P.notes.length && T.t >= P.notes[i].s; i++) { T.singIdx = i; ev.push({ type: "note-start", i }); }
  const ended = (list) => {
    for (const { index, result } of list) {
      const r = { ...result, heard: heardShare(T.frames, P.notes[index], T.matcher.latency) };
      T.live[index] = r;
      ev.push({ type: "note-end", i: index, result: r });
    }
  };
  /* the matcher sees what the old drill saw: a pitch, or nothing when the tracker heard none */
  ended(T.matcher.feed({ time: T.t, midi: midi !== null && conf >= 0.5 ? midi : null, rms: frame?.rms ?? 0.1 }));
  if (T.t >= P.total + SING_TAIL) {
    ended(T.matcher.finish());
    T.phase = "done";
    T.grade = gradeTake(T.frames, P, T.live, T.matcher.latency);
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
  /* in tune, but slides into every note from the one before, the way a real voice changes note */
  slide: (t, n, T) => {
    if (!n) return null;
    const notes = T ? T.plan.notes : [], before = notes[notes.indexOf(n) - 1];
    const a = before ? Math.min(1, (t - n.s) / 0.14) : 1, u = a * a * (3 - 2 * a);
    return { midi: (before ? before.midi + (n.midi - before.midi) * u : n.midi) - 0.1 + Math.sin(t * 31) * 0.08, conf: 0.9 };
  },
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
