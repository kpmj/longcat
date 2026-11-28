/* Steadiness: did the voice stay where it was, once it was on a note? (the designer, 2026-11-24, after Vocalista's second
   measure.) It is read beside the grading and changes none of it: the matcher's thresholds (match.js) decide
   whether a note was the right one; this only asks whether a held note held still, wherever it sat. A singer who
   is off the note but steady is told so, which is the point: it is something to do well that is not accuracy.

   A note is looked at only if it is long enough to hold (HOLD_MIN) and enough of it was sung. The start of the
   note is left out, where every voice finds its way in. The note is steady when nearly all of what was sung lies
   within STEADY_CENTS of its own middle (the median of what was sung, not the note asked for).

   DRAFT numbers, chosen by the agent and tried only on the automatic singers: a real voice has not been measured.
   The result sheet says a line only when it went well, and never a number. */
import { MIN_CONF } from "./grade.js";

export const HOLD_MIN = 0.6; // seconds: shorter notes are passed through, not held
export const STEADY_LEAD = 0.15; // seconds left out at the start of a note
export const STEADY_TAIL = 0.05; // and at its end
export const STEADY_CENTS = 30; // within this of the note's own middle counts as still
export const STEADY_SHARE = 0.85; // this much of the sung part must be still
export const STEADY_SUNG = 0.6; // and this much of the window must have been sung at all

const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/* frames: [{ t, midi | null, conf }]; lat: the matcher's latency. Returns { of, steady, notes }: how many notes
   could be judged, how many of them held still, and one of true / false / null (not judged) for every note. */
export function steadiness(frames, plan, lat = 0) {
  const notes = plan.notes.map((n) => {
    if (n.e - n.s < HOLD_MIN) return null;
    const a = n.s + lat + STEADY_LEAD, b = n.e + lat - STEADY_TAIL;
    const win = frames.filter((f) => f.t >= a && f.t < b);
    const sung = win.filter((f) => f.midi != null && f.conf >= MIN_CONF).map((f) => f.midi);
    if (win.length < 4 || sung.length < win.length * STEADY_SUNG) return null;
    const mid = median(sung);
    return sung.filter((m) => Math.abs(m - mid) * 100 <= STEADY_CENTS).length >= sung.length * STEADY_SHARE;
  });
  const judged = notes.filter((x) => x !== null);
  return { of: judged.length, steady: judged.filter(Boolean).length, notes };
}

/* What the result says, or "" for nothing: only when every held note was steady, or all but one of four or more. */
export function steadyLine(s) {
  if (!s || !s.of) return "";
  if (s.steady === s.of) return s.of === 1 ? "You held it steady." : "You held every note steady.";
  if (s.of >= 4 && s.steady >= s.of - 1) return "You held nearly every note steady.";
  return "";
}
