/* Note matching: the old Vocal Gym drill scorer (src/vocal_gym/static/scoring.js on main, the melody path of
   StreamingScorer), ported as it is (the designer, 2026-11-13: "I've tweaked how the drill responded and the accuracy to
   a good spot; reuse it"). Only the plan shape is Longcat's: targets are { midi, s, e } in seconds.

   1. Frames are grouped into sung notes as they arrive: a 5-frame median decides where one note ends and the
      next begins (a jump of more than 0.6 semitones, a gap over 60 ms, or a re-articulation), notes shorter
      than 0.1 s are dropped, and each note keeps its raw frames.
   2. Latency is the median offset of the first three sung notes that land within 0.9 s and a semitone of a
      target, held between -0.3 and 0.5 s, then subtracted. Latency is forgiven; rhythm is not.
   3. Each target takes the closest sung note starting within 0.45 s of it and within 3 semitones, each sung
      note used once. A held note across repeated targets of the same pitch is split between them.
   4. Verdicts: more than 30 % of the note 300 cents or further away is red; more than half of the note within
      50 cents, on time within 250 ms, is green; else the note's middle within 50 cents and 120 ms is green,
      within 95 cents and 250 ms amber, anything else red. No sung note for a target is a miss.

   A target's verdict is given once the singer is past it (0.45 s after it should have started, and after the
   note being sung then has ended), so the judge reacts as the old drill did. Pure: no DOM, no audio. */

export const PITCH_GREEN_CENTS = 50.0;
export const PITCH_AMBER_CENTS = 95.0;
export const TIMING_GREEN_MS = 120.0;
export const TIMING_AMBER_MS = 250.0;
export const STABILITY_GREEN_CENTS = 25.0;
export const COVERAGE_PASS_FRACTION = 0.5;
export const FAR_OFF_CENTS = 300.0;
export const FAR_OFF_FAIL_FRACTION = 0.3;
export const MATCH_WINDOW_SECONDS = 0.45;
export const LATENCY_LOCK_COUNT = 3;
const SMOOTH_WIDTH = 5;

/* Longcat's three levels: green is on the note, amber is close, red or nothing sung is off. */
export const LEVEL_OF = { green: "good", amber: "mid", red: "off", miss: "off" };

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function std(values) {
  const m = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - m) * (v - m), 0) / values.length);
}
function stabilityCents(frameMidis) {
  if (frameMidis.length < 3) return 0.0;
  const trim = Math.max(1, Math.floor(frameMidis.length / 5));
  const core = frameMidis.length > 2 * trim ? frameMidis.slice(trim, frameMidis.length - trim) : frameMidis;
  return std(core) * 100.0;
}

/* Frames in, sung notes out, as they close. frame = { time, midi | null, rms }. */
export class OnlineSegmenter {
  constructor({ minNoteSeconds = 0.1, pitchBreakSemitones = 0.6, maxGapSeconds = 0.06, rearticulationRmsRatio = 0.35 } = {}) {
    this.minNoteSeconds = minNoteSeconds;
    this.pitchBreakSemitones = pitchBreakSemitones;
    this.maxGapSeconds = maxGapSeconds;
    this.rearticulationRmsRatio = rearticulationRmsRatio;
    this.frames = [];
    this.processed = 0;
    this.current = null; // { start, frameMidis, smoothed, rms }
    this.lastVoicedTime = 0.0;
    this.frontierTime = -Infinity;
  }

  get openNoteStart() {
    return this.current ? this.current.start : null;
  }

  feed(frame) {
    this.frames.push(frame);
    return this._drain(false);
  }

  flush() {
    const closed = this._drain(true);
    if (this.current !== null) {
      const note = this._close();
      this.current = null;
      if (note !== null) closed.push(note);
    }
    return closed;
  }

  _drain(final) {
    const half = SMOOTH_WIDTH >> 1;
    const closed = [];
    const limit = final ? this.frames.length : this.frames.length - half;
    while (this.processed < limit) {
      const note = this._step(this.frames[this.processed], this._smoothedMidi(this.processed));
      if (note !== null) closed.push(note);
      this.processed++;
    }
    return closed;
  }

  _smoothedMidi(index) {
    if (this.frames[index].midi === null) return null;
    const half = SMOOTH_WIDTH >> 1;
    const window = [];
    for (let i = Math.max(0, index - half); i < Math.min(this.frames.length, index + half + 1); i++) {
      if (this.frames[i].midi !== null) window.push(this.frames[i].midi);
    }
    return median(window);
  }

  _step(raw, smoothedMidi) {
    this.frontierTime = raw.time;
    let closed = null;
    const quiet = Boolean(this.current && this.current.rms.length && raw.rms < this.rearticulationRmsRatio * median(this.current.rms));
    if (smoothedMidi === null || quiet) {
      if (this.current && raw.time - this.lastVoicedTime > this.maxGapSeconds) {
        closed = this._close();
        this.current = null;
      }
      return closed;
    }
    const rawMidi = raw.midi !== null ? raw.midi : smoothedMidi;
    if (this.current === null) {
      this._begin(raw, smoothedMidi, rawMidi);
    } else if (Math.abs(smoothedMidi - median(this.current.smoothed)) > this.pitchBreakSemitones) {
      closed = this._close();
      this._begin(raw, smoothedMidi, rawMidi);
    } else {
      this.current.frameMidis.push(rawMidi);
      this.current.smoothed.push(smoothedMidi);
      this.current.rms.push(raw.rms);
    }
    this.lastVoicedTime = raw.time;
    return closed;
  }

  _begin(raw, smoothedMidi, rawMidi) {
    this.current = { start: raw.time, frameMidis: [rawMidi], smoothed: [smoothedMidi], rms: [raw.rms] };
  }

  _close() {
    const note = { start: this.current.start, end: this.lastVoicedTime, midi: median(this.current.frameMidis), frameMidis: this.current.frameMidis };
    note.duration = note.end - note.start;
    note.stabilityCents = stabilityCents(note.frameMidis);
    return note.duration >= this.minNoteSeconds ? note : null;
  }
}

export function verdictOf(cents, timingMs, frameMidis = null, targetMidi = null) {
  if (frameMidis?.length && targetMidi !== null) {
    const offsets = frameMidis.map((m) => Math.abs(m - targetMidi) * 100.0);
    const far = offsets.filter((o) => o >= FAR_OFF_CENTS).length / offsets.length;
    if (far > FAR_OFF_FAIL_FRACTION) return "red"; // wild excursions fail outright
    const within = offsets.filter((o) => o <= PITCH_GREEN_CENTS).length / offsets.length;
    if (within > COVERAGE_PASS_FRACTION && Math.abs(timingMs) <= TIMING_AMBER_MS) return "green"; // most of it was IN the note
  }
  if (Math.abs(cents) <= PITCH_GREEN_CENTS && Math.abs(timingMs) <= TIMING_GREEN_MS) return "green";
  if (Math.abs(cents) <= PITCH_AMBER_CENTS && Math.abs(timingMs) <= TIMING_AMBER_MS) return "amber";
  return "red";
}

/* One held sung note across several consecutive same-pitch targets is split at their boundaries: legato over
   two written Cs sang both. */
function splitHeldRepeats(targets, note, latency) {
  const covered = targets.filter((t) => {
    if (Math.abs(t.midi - note.midi) > 1.0) return false;
    const tStart = t.s + latency;
    const overlap = Math.min(note.end, t.e + latency) - Math.max(note.start, tStart);
    return overlap >= 0.5 * (t.e - t.s);
  });
  if (covered.length < 2 || new Set(covered.map((t) => t.midi)).size !== 1) return [note];
  covered.sort((a, b) => a.s - b.s);
  const cuts = [note.start];
  for (const t of covered.slice(1)) cuts.push(Math.min(Math.max(t.s + latency, cuts[cuts.length - 1] + 0.05), note.end - 0.05));
  cuts.push(note.end);
  const frames = note.frameMidis ?? [];
  const span = note.end - note.start || 1e-9;
  const pieces = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const lo = Math.floor(((cuts[i] - note.start) / span) * frames.length + 0.5);
    const hi = Math.floor(((cuts[i + 1] - note.start) / span) * frames.length + 0.5);
    let piece = frames.slice(lo, hi);
    if (!piece.length) piece = frames.slice();
    pieces.push({ ...note, start: cuts[i], end: cuts[i + 1], midi: piece.length ? median(piece) : note.midi, frameMidis: piece, stabilityCents: stabilityCents(piece) });
  }
  return pieces;
}

/* feed(frame) returns newly finalised { index, result } pairs, in order; finish() gives the rest. */
export class NoteMatcher {
  constructor(notes, latencyS = null) {
    this.targets = notes;
    /* a single long note is a hold: let it drift 1.5 semitones before it counts as a new note, as the old
       app's sustain drills did */
    this.segmenter = new OnlineSegmenter({ pitchBreakSemitones: notes.length === 1 ? 1.5 : 0.6 });
    this.available = [];
    this.allNotes = [];
    this.results = [];
    this.fixedLatency = latencyS;
    this.offsets = [];
    this.finished = false;
  }

  get latency() {
    if (this.fixedLatency !== null) return this.fixedLatency;
    if (!this.offsets.length) return 0.0;
    return Math.min(0.5, Math.max(-0.3, median(this.offsets.slice(0, LATENCY_LOCK_COUNT))));
  }

  feed(frame) {
    for (const note of this.segmenter.feed(frame)) this._ingest(note);
    return this._finalizeDue(false);
  }

  finish() {
    if (!this.finished) {
      for (const note of this.segmenter.flush()) this._ingest(note);
      this.finished = true;
    }
    return this._finalizeDue(true);
  }

  _ingest(note) {
    this.allNotes.push(note);
    /* The latency is updated before a held note is split, not after (overnight sweep, 2026-11-14): when the
       very first sung note held through two written notes of the same pitch, it was split with no latency
       known yet, so the second half started a whole delay early and a late singer's second note was red. */
    if (this.fixedLatency === null && this.offsets.length < LATENCY_LOCK_COUNT) {
      const nearby = this.targets.filter((t) => Math.abs(note.start - t.s) <= 2 * MATCH_WINDOW_SECONDS && Math.abs(note.midi - t.midi) <= 1.0);
      if (nearby.length) {
        const closest = nearby.reduce((best, t) => (Math.abs(note.start - t.s) < Math.abs(note.start - best.s) ? t : best));
        this.offsets.push(note.start - closest.s);
      }
    }
    for (const piece of splitHeldRepeats(this.targets, note, this.latency)) this.available.push(piece);
  }

  _finalizeDue(final) {
    const emitted = [];
    while (this.results.length < this.targets.length) {
      const index = this.results.length;
      const target = this.targets[index];
      const expected = target.s + this.latency;
      const deadline = expected + MATCH_WINDOW_SECONDS;
      if (!final) {
        if (this.segmenter.frontierTime <= deadline) break;
        const openStart = this.segmenter.openNoteStart;
        if (openStart !== null && expected - MATCH_WINDOW_SECONDS <= openStart && openStart <= deadline) break; // still being sung
      }
      const result = this._gradePair(target, this._takeMatch(target, expected));
      this.results.push(result);
      emitted.push({ index, result });
    }
    return emitted;
  }

  _takeMatch(target, expected) {
    const candidates = this.available.filter((s) => Math.abs(s.start - expected) <= MATCH_WINDOW_SECONDS && Math.abs(s.midi - target.midi) <= 3.0);
    if (!candidates.length) return null;
    const cost = (s) => Math.abs(s.start - expected) + 0.05 * Math.abs(s.midi - target.midi);
    const chosen = candidates.reduce((best, s) => (cost(s) < cost(best) ? s : best));
    this.available.splice(this.available.indexOf(chosen), 1);
    return chosen;
  }

  _gradePair(target, sung) {
    if (sung === null) return { hit: false, cents: null, timingMs: null, stabilityCents: null, raw: "miss", verdict: LEVEL_OF.miss };
    const cents = (sung.midi - target.midi) * 100;
    const timingMs = (sung.start - this.latency - target.s) * 1000;
    const raw = verdictOf(cents, timingMs, sung.frameMidis, target.midi);
    return { hit: true, cents: Math.round(cents), timingMs: Math.round(timingMs), stabilityCents: Math.round(sung.stabilityCents), raw, verdict: LEVEL_OF[raw] };
  }
}
