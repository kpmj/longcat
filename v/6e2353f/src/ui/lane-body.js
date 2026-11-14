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
export function onNote(frames, notes, lat = 0) {
  const N = frames.length, out = new Array(N).fill(false), near = new Array(N).fill(false), level = levels(frames, notes, lat);
  let k = 0;
  for (let i = 0; i < N; i++) {
    const f = frames[i];
    if (f.midi == null) continue;
    const t = f.t - lat;
    while (k < notes.length && notes[k].e + EDGE < t) k++;
    let dist = Infinity, middle = false;
    for (let j = k; j < notes.length && notes[j].s - EDGE <= t; j++) {
      const n = notes[j], edge = edgeOf(n);
      dist = Math.min(dist, Math.abs(f.midi - level[j]));
      if (t >= n.s + edge && t <= n.e - edge) middle = true;
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
  return smooth(frames, out);
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
