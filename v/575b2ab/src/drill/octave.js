/* Octave slips. A voice with a thin fundamental (a low "oo", a breathy "ah") is now and then read by YIN an
   octave too high or too low for a frame or a few: the line jumped to the edge of the lane and the note
   matcher split the note into pieces too far from the target, so a sung note came out as "not sung".
   Found by the overnight sweep (2026-11-14): a synthetic singer with a thin fundamental lost whole notes
   this way while every other singer was graded as expected.

   A frame is folded back by an octave only when all three hold:
     - it is not near any note of the phrase sounding about now,
     - an octave up or down it is near one of those notes,
     - the singer's last few frames were already near that note.
   So a singer who really sings an octave off keeps their octave (their last frames are off too), and an
   octave leap that the phrase asks for is never folded (the new note is itself a note of the phrase).
   Pure, and used before the note matcher, so grading and drawing both see the folded pitch. */

export const NEAR = 1.0; // semitones
export const SLIP = 0.5; // how close to exactly 12 semitones a jump must be
export const MEMORY = 5; // recent voiced frames that set where the singer is
export const REACH = 0.5; // seconds around a note during which it counts as "about now"

const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

export function createOctaveGuard() { return { recent: [] }; }

/* g: the guard's state; midi: the tracker's pitch (or null); t: take clock; notes: the plan's notes;
   lat: the singer's delay so far. Returns the pitch to use. */
export function guardOctave(g, midi, t, notes, lat = 0) {
  if (midi == null) return null;
  const near = notes.filter((n) => t - lat >= n.s - REACH && t - lat <= n.e + REACH).map((n) => n.midi);
  let out = midi;
  if (near.length && g.recent.length >= 3 && !near.some((m) => Math.abs(midi - m) <= NEAR)) {
    const where = median(g.recent);
    for (const shift of [-12, 12]) {
      const f = midi + shift;
      /* exactly an octave from where the singer was, and then on a note of the phrase */
      if (Math.abs(f - where) <= SLIP + NEAR / 2 && near.some((m) => Math.abs(f - m) <= NEAR)) { out = f; break; }
    }
  }
  g.recent.push(out);
  if (g.recent.length > MEMORY) g.recent.shift();
  return out;
}
