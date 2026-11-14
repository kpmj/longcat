/* Which parts of the sung line are the cat's fat body and which are only a thin thread.

   Play-test, 2026-11-13: the fat body sweeping across the pitch lines between notes was distracting, and that
   stretch is the one part of a take that is not graded. So the body is fat while the voice sits on a note and
   shrinks to a thread while it travels to the next one. Nothing sung is hidden: the thread still follows the
   real voice.

   Each note has a level: where this singer actually held it (the note plus the singer's own offset, taken from
   the middle of the note; before that exists, from the last few frames if they are steady, else from the note
   before). Someone who sings everything a little flat, or an octave down, still gets a whole cat.

   A voiced frame is body when
     - it falls in the middle of a note, wherever the pitch is (a held wrong note is drawn as it was sung), or
     - it is within NEAR of the level of a note that is sounding then or whose edge is within EDGE. A wander
       out to FAR and back again stays body, so it does not flicker.
   Runs shorter than MIN_RUN are folded into their neighbours unless they join two different pitches. Where the
   voice leaps from one frame to the next the caller breaks the body too (leapt), so only the thread crosses.
   Pure. */

export const NEAR = 0.35; // semitones: the voice has arrived on the level
export const FAR = 0.6; // semitones: a wander this far that comes back is still the body
export const EDGE = 0.2; // seconds around a note's start and end where the voice may still be travelling
export const MIN_RUN = 0.06; // seconds
export const JUMP = 1.5; // semitones from one frame to the next: the voice leapt, so the fat body breaks there
export const leapt = (a, b) => Math.abs(a - b) > JUMP;

const median = (a) => {
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const edgeOf = (n) => Math.min(EDGE, (n.e - n.s) * 0.3);

/* the pitch each note was really held at */
function levels(frames, notes, lat) {
  const out = [];
  let carry = 0, i = 0;
  for (const n of notes) {
    const edge = edgeOf(n), mid = [], all = [];
    while (i < frames.length && frames[i].t - lat < n.s - EDGE) i++;
    for (let j = i; j < frames.length && frames[j].t - lat <= n.e + EDGE; j++) {
      const f = frames[j], t = f.t - lat;
      if (f.midi == null) continue;
      if (t >= n.s) all.push(f.midi - n.midi);
      if (t >= n.s + edge && t <= n.e - edge) mid.push(f.midi - n.midi);
    }
    const recent = all.slice(-6);
    if (mid.length >= 3) carry = median(mid);
    else if (recent.length >= 5 && Math.max(...recent) - Math.min(...recent) <= FAR) carry = median(recent);
    out.push(n.midi + carry);
  }
  return out;
}

/* frames: [{ t, midi }] in time order, midi null for silence; notes: [{ midi, s, e }] in time order; lat:
   seconds the singer runs behind. Returns one boolean per frame: true = body, false = thread (or silence). */
export const onNote = (frames, notes, lat = 0) => classify(frames, notes, lat).on;

/* on: body or not, per frame; ref: which note each frame is nearest to (-1 for none); level: the pitch each
   note was held at. middle = false drops the "middle of a note is always body" rule. */
function classify(frames, notes, lat = 0, { middle: keepMiddle = true } = {}) {
  const N = frames.length, out = new Array(N).fill(false), near = new Array(N).fill(false), ref = new Array(N).fill(-1);
  const level = levels(frames, notes, lat);
  let k = 0;
  for (let i = 0; i < N; i++) {
    const f = frames[i];
    if (f.midi == null) continue;
    const t = f.t - lat;
    while (k < notes.length && notes[k].e + EDGE < t) k++;
    let dist = Infinity, middle = false;
    for (let j = k; j < notes.length && notes[j].s - EDGE <= t; j++) {
      const n = notes[j], edge = edgeOf(n), d = Math.abs(f.midi - level[j]);
      if (d < dist) { dist = d; ref[i] = j; }
      if (keepMiddle && t >= n.s + edge && t <= n.e - edge) middle = true;
    }
    out[i] = middle || dist <= NEAR;
    near[i] = middle || dist <= FAR;
  }
  /* a wander out to FAR and back stays body; one that keeps going does not, so the body ends flat on its line */
  for (let i = 0; i < N; i++) {
    if (out[i] || !near[i] || !i || !out[i - 1]) continue;
    let j = i;
    while (j < N && near[j] && !out[j]) j++;
    if (j < N && out[j]) for (let m = i; m < j; m++) out[m] = true;
    i = j;
  }
  return { on: smooth(frames, out), ref, level };
}

/* fold short runs into what surrounds them; a run that touches silence or either end is left alone */
function smooth(frames, on) {
  let i = 0;
  while (i < frames.length) {
    let j = i;
    while (j + 1 < frames.length && on[j + 1] === on[i] && (frames[j + 1].midi == null) === (frames[i].midi == null)) j++;
    const inside = i > 0 && j < frames.length - 1 && frames[i - 1].midi != null && frames[j + 1].midi != null && frames[i].midi != null;
    /* a short thread between two different pitches is a quick change of note, not a blip: it stays a thread */
    const blip = inside && (on[i] || Math.abs(frames[i - 1].midi - frames[j + 1].midi) <= FAR);
    if (blip && frames[j + 1].t - frames[i].t < MIN_RUN) for (let m = i; m <= j; m++) on[m] = !on[m];
    i = j + 1;
  }
  return on;
}

/* ---------- what the lane draws ---------- */

/* A pitch tracker now and then reports a wild pitch for a moment (an octave slip, the start of a note, the
   phone's own sounds). Only for drawing; grading still sees every frame.
   1. A stretch further than FAR_DRAW from every note of the phrase near it, shorter than OUTLIER_SECONDS,
      is not drawn (play-test, 2026-11-14: lines dropping from the body to the bottom of the lane at the
      start of notes). A singer who really stays that far off for longer is drawn as sung.
   2. A leap that comes straight back within SPIKE frames is drawn as the pitch around it. */
export const SPIKE = 4;
export const FAR_DRAW = 5; // semitones
export const OUTLIER_SECONDS = 0.25;
export function dropFarBlips(frames, notes, lat = 0) {
  const out = frames.map((f) => ({ t: f.t, midi: f.midi }));
  const far = out.map((f) => {
    if (f.midi == null) return false;
    const near = notes.filter((n) => f.t - lat >= n.s - 0.5 && f.t - lat <= n.e + 0.5);
    return near.length > 0 && near.every((n) => Math.abs(f.midi - n.midi) > FAR_DRAW);
  });
  for (let i = 0; i < out.length; i++) {
    if (!far[i]) continue;
    let j = i;
    while (j < out.length && far[j]) j++;
    if (out[j - 1].t - out[i].t < OUTLIER_SECONDS) for (let m = i; m < j; m++) out[m].midi = null;
    i = j;
  }
  return out;
}
export function despike(frames) {
  const out = frames.map((f) => ({ t: f.t, midi: f.midi }));
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1].midi;
    if (a == null || out[i].midi == null || !leapt(a, out[i].midi)) continue;
    let j = i;
    while (j < out.length && j - i < SPIKE && out[j].midi != null && leapt(a, out[j].midi)) j++;
    if (j < out.length && j - i < SPIKE && out[j].midi != null) for (let m = i; m < j; m++) out[m].midi = a + ((out[j].midi - a) * (m - i + 1)) / (j - i + 1);
  }
  return out;
}

/* a 5-frame median, then a mean over `half` frames either side: for the slim and short bodies, which show the
   line, not the wobble. The short body uses a wide mean, so it swings after the head instead of kinking. */
function eased(frames, half = 1) {
  const med = frames.map((f, i) => {
    if (f.midi == null) return null;
    const w = [];
    for (let j = Math.max(0, i - 2); j <= Math.min(frames.length - 1, i + 2); j++) if (frames[j].midi != null) w.push(frames[j].midi);
    return median(w);
  });
  return frames.map((f, i) => {
    if (med[i] == null) return { t: f.t, midi: null };
    const w = [];
    for (let j = i - half; j <= i + half; j++) if (med[j] != null) w.push(med[j]);
    return { t: f.t, midi: w.reduce((x, y) => x + y, 0) / w.length };
  });
}

/* How the body is drawn when the notes are short (under SHORT_NOTE seconds). Long notes always use "trace":
   a long note is practice in holding steady, so its wobble should show.
     snap   fat pieces lie flat on the line of the note they belong to; the head and the thread show the voice.
            The game's choice for short notes (the designer, 2026-11-14, option A of
            docs/design/longcat-short-note-body-options.html): on a half-second note there is no time to read
            the wobble, only whether you are on the note.
     trace  fat on the notes following the real voice, a thread between
     slim   no fat body at all: the whole line is one slim, smoothed ribbon
     stub   only a short piece of body behind the head; what was sung before is told by the blocks alone
   The other three stay behind the Dev panel for comparing. */
export const BODY_MODES = ["snap", "trace", "slim", "stub"];
export const SHORT_BODY = "snap";
export const SHORT_NOTE = 0.8;
export const STUB_SECONDS = 0.32;
export const SNAP_TO_LINE = 0.5; // semitones: a level this close to the note is drawn on the note's own line
export const isShort = (notes) => notes.length > 1 && notes[0].e - notes[0].s < SHORT_NOTE;

/* frames: [{ t, midi | null }]; now: the take clock; xOf(t), yOf(midi): the caller's coordinates. Returns
   { subs, threads, tail, slim, headJoins }: polylines for laneCatSvg, and whether the body runs up to the
   head (so the caller can join the two). */
export function laneShape({ frames, notes, lat = 0, now, mode = SHORT_BODY, xOf, yOf, cull = -30 }) {
  const m = !isShort(notes) ? "trace" : BODY_MODES.includes(mode) ? mode : SHORT_BODY;
  const clean = despike(dropFarBlips(frames, notes, lat)), line = m === "slim" ? eased(clean) : m === "stub" ? eased(clean, 6) : clean;
  const threads = [[]], subs = [[]];
  const cut = (list) => { if (list[list.length - 1].length) list.push([]); };
  let tail = null, headJoins = false;
  if (m === "slim" || m === "stub") {
    const first = line.find((f) => f.midi != null);
    for (const f of line) {
      const x = xOf(f.t), keep = f.midi != null && x >= cull && (m === "slim" || f.t >= now - STUB_SECONDS);
      const list = m === "slim" ? threads : subs;
      if (!keep) { if (f.midi == null) cut(list); continue; }
      const p = { x, y: yOf(f.midi) };
      if (!list[list.length - 1].length && (m === "stub" || f === first)) tail = p;
      list[list.length - 1].push(p);
    }
    if (m === "stub") { const last = subs[subs.length - 1]; tail = last.length > 1 ? last[0] : null; }
    headJoins = m === "stub";
    return { subs: clip(subs), threads: clip(threads), tail, slim: m === "slim", headJoins };
  }
  const c = classify(line, notes, lat, { middle: m !== "snap" });
  let firstOn = true, prev = null, prevRef = -1;
  line.forEach((f, i) => {
    if (f.midi == null) { cut(threads); cut(subs); prev = null; return; }
    const x = xOf(f.t);
    if (x < cull) { if (c.on[i]) firstOn = false; return; }
    const p = { x, y: yOf(f.midi) };
    threads[threads.length - 1].push(p);
    const j = c.ref[i];
    if (!c.on[i] || (prev != null && (m === "snap" ? j !== prevRef : leapt(prev, f.midi)))) cut(subs);
    prev = c.on[i] ? f.midi : null;
    prevRef = j;
    if (!c.on[i]) return;
    /* snap: the piece lies on the note's line (or, for a singer well off it, on the pitch they held) */
    const q = m === "snap" && j >= 0 ? { x, y: yOf(Math.abs(c.level[j] - notes[j].midi) <= SNAP_TO_LINE ? notes[j].midi : c.level[j]) } : p;
    if (firstOn) { tail = q; firstOn = false; } // the tail belongs to where the cat began, not to every piece
    subs[subs.length - 1].push(q);
  });
  headJoins = m === "trace" && c.on.length > 0 && c.on[c.on.length - 1];
  return { subs: clip(subs), threads: clip(threads), tail, slim: false, headJoins };
}
const clip = (list) => list.filter((s) => s.length > 1);
