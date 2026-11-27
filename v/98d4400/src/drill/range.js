/* The range finder (decision 1, 2026-11-12): sing your lowest note, then your highest, each held for two
   seconds. Pure; the view feeds it frames.

   A held note is never perfectly still (the designer's play-test, 2026-11-13: a voice that drifts between a note and
   the semitone next to it kept restarting the hold). So the hold is forgiving:
   - a frame belongs to the hold if it is within HOLD_TOLERANCE semitones of the hold's middle (its median);
   - a frame outside that, or a short dropout, is ignored, not a restart;
   - the hold only starts over when the voice has stayed away, or silent, for longer than HOLD_GRACE.
   The edges of the range are the 10th percentile of the low hold and the 90th of the high one. */

export const HOLD_SECONDS = 2;
export const HOLD_TOLERANCE = 1.5; // semitones either side of the hold's middle
export const HOLD_GRACE = 0.45; // seconds the voice may stray or drop out before the hold starts over
const MIN_FRAMES = 30;
const MIN_KEPT = 0.6; // at least this much of the hold has to be on the note
const MIN_CONF = 0.5;

export function createHold() {
  return { frames: [], start: null, last: null, held: 0, fed: 0, stray: [], caught: null };
}

const median = (a) => {
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function begin(h, frames, t0, t) {
  h.frames = frames;
  h.start = frames.length ? t0 : null;
  h.last = frames.length ? t : null;
  h.fed = frames.length;
  h.stray = [];
  h.held = frames.length ? t - t0 : 0;
}

/* frame = { midi, conf } | null, at clock time t (seconds). Returns the hold, with caught = midis once done. */
export function feedHold(h, frame, t) {
  if (h.caught) return h;
  const voiced = !!frame && frame.midi != null && frame.conf >= MIN_CONF;
  if (!h.frames.length) {
    if (voiced) begin(h, [frame.midi], t, t);
    return h;
  }
  h.fed++;
  const near = voiced && Math.abs(frame.midi - median(h.frames)) <= HOLD_TOLERANCE;
  if (near) {
    h.frames.push(frame.midi);
    h.last = t;
    h.stray = [];
  } else {
    if (voiced) h.stray.push({ midi: frame.midi, t });
    if (t - h.last > HOLD_GRACE) {
      /* the voice has moved on: start over from the newest note it settled on */
      const s = h.stray, end = s[s.length - 1];
      const kept = end ? s.filter((x) => Math.abs(x.midi - end.midi) <= HOLD_TOLERANCE) : [];
      begin(h, kept.map((x) => x.midi), kept.length ? kept[0].t : t, t);
      return h;
    }
  }
  h.held = t - h.start;
  if (near && h.held >= HOLD_SECONDS && h.frames.length >= MIN_FRAMES && h.frames.length >= h.fed * MIN_KEPT) h.caught = [...h.frames];
  return h;
}

function percentile(a, p) {
  const s = [...a].sort((x, y) => x - y);
  const i = Math.max(0, Math.min(s.length - 1, (p / 100) * (s.length - 1)));
  const lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}

/* Both holds in, a range out. If the singer swapped them, swap back; insist on at least a fifth. */
export function rangeFrom(lowHold, highHold) {
  let low = percentile(lowHold, 10), high = percentile(highHold, 90);
  if (high < low) [low, high] = [percentile(highHold, 10), percentile(lowHold, 90)];
  if (high - low < 7) {
    const c = (low + high) / 2;
    low = c - 3.5;
    high = c + 3.5;
  }
  return { low: Math.round(low * 10) / 10, high: Math.round(high * 10) / 10 };
}
