/* The game hearing itself. Play-test, 2026-11-14 (the designer's screen recording of "Free melody"): lines shot to the top
   or the bottom of the lane now and then. The microphone runs without echo cancelling (as the old drill's did,
   because cancelling bends and gates sung notes), so it hears the phone's own speaker. Run over the recording's
   sound alone, the tracker read the "on the note" bells as a confident sung pitch for about 0.4 s each time,
   and those frames reached the note matcher too.

   So every pitched sound the game plays while you sing is written down here (when, which pitch, which
   partials), and a microphone frame that matches one of them, or one of its undertones, while it can still
   be heard, is dropped as if nothing was sung. A frame close to a note of the phrase is always kept: that is
   the singer. Pure, so tests can check it. */
import { hzToMidi } from "./pitch.js";

export const SELF_TAIL = 0.14; // seconds a sound may still reach the tracker after it stops (echo, the 32 ms window)
export const SELF_CENTS = 70; // how close to a played pitch a frame must be to count as the game's own sound
export const UNDERTONES = [1, 2, 3, 4]; // YIN reads a high tone as half, a third or a quarter of its pitch
export const KEEP_SEMITONES = 1; // a frame this close to a note of the phrase is the singer, whatever is playing

export const selfLog = () => ({ sounds: [] });

/* one sound: from t0 to t1 on the audio clock, pitch f0 gliding to f1 over `glide` seconds, with partials as
   multiples of the pitch */
export function noteSound(log, { t0, t1, f0, f1 = f0, glide = 0, partials = [1] }) {
  log.sounds = log.sounds.filter((s) => s.t1 + 2 > t0);
  log.sounds.push({ t0, t1, f0, f1, glide, partials });
}

const pitchAt = (s, t) => (t <= s.t0 || !s.glide ? (t <= s.t0 ? s.f0 : s.f1) : t >= s.t0 + s.glide ? s.f1 : s.f0 * Math.pow(s.f1 / s.f0, (t - s.t0) / s.glide));

/* hz: the tracker's pitch; t: the audio clock when the microphone was read; keep: midi notes of the phrase
   near now; delay: how late the speaker sounds reach the microphone (output + input latency). */
export function fromSelf(log, hz, t, keep = [], delay = 0) {
  if (!(hz > 0)) return false;
  const m = hzToMidi(hz);
  if (keep.some((k) => Math.abs(m - k) <= KEEP_SEMITONES)) return false;
  const tol = Math.pow(2, SELF_CENTS / 1200);
  for (const s of log.sounds) {
    if (t < s.t0 + delay || t > s.t1 + delay + SELF_TAIL) continue;
    /* the pitches this sound went through during the stretch the microphone just heard */
    const a = Math.max(s.t0, t - delay - SELF_TAIL), b = Math.min(s.t1, t - delay);
    const pa = pitchAt(s, a), pb = pitchAt(s, Math.max(a, b));
    const lo = Math.min(pa, pb), hi = Math.max(pa, pb);
    for (const p of s.partials) for (const n of UNDERTONES) {
      if (hz >= (lo * p) / n / tol && hz <= (hi * p) / n * tol) return true;
    }
  }
  return false;
}

/* the notes of the phrase within half a second of now, for `keep` */
export const notesNear = (notes, t, lat = 0, reach = 0.5) => notes.filter((n) => t - lat >= n.s - reach && t - lat <= n.e + reach).map((n) => n.midi);
