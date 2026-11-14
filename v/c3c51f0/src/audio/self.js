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
export const UNDERTONES = [1, 2, 3, 4, 5, 6]; // YIN reads a high tone as half, a third, ... a sixth of its pitch
export const KEEP_SEMITONES = 1; // a quarter of this from the note being sung is the singer, whatever is playing
/* While a bell rings over the voice, the tracker can also lock onto a low pitch the two share (A3 and a D6 bell
   read as D2). So while one is audible, a frame further than this from every note of the phrase near now is
   dropped too. The note matcher never pairs a sung note further than 3 semitones from its target anyway, so
   this does not change how a note is graded. */
export const FAR_SEMITONES = 3;

export const selfLog = () => ({ sounds: [] });

/* one sound: from t0 to t1 on the audio clock, pitch f0 gliding to f1 over `glide` seconds, with partials as
   multiples of the pitch */
export function noteSound(log, { t0, t1, f0, f1 = f0, glide = 0, partials = [1] }) {
  log.sounds = log.sounds.filter((s) => s.t1 + 2 > t0);
  log.sounds.push({ t0, t1, f0, f1, glide, partials });
}

const pitchAt = (s, t) => (t <= s.t0 || !s.glide ? (t <= s.t0 ? s.f0 : s.f1) : t >= s.t0 + s.glide ? s.f1 : s.f0 * Math.pow(s.f1 / s.f0, (t - s.t0) / s.glide));

/* hz: the tracker's pitch; t: the audio clock when the microphone was read; keep: midi notes the singer
   should be on now; delay: how late the speaker sounds reach the microphone (output + input latency).
   A frame that matches a sound still ringing is the game's own unless it is closer to a note the singer
   should be on than to that sound: notes a semitone apart put the bell's undertone right next to the target. */
export function fromSelf(log, hz, t, keep = [], delay = 0) {
  if (!(hz > 0)) return false;
  const m = hzToMidi(hz);
  const target = keep.length ? Math.min(...keep.map((k) => Math.abs(m - k))) : Infinity;
  if (target <= KEEP_SEMITONES / 4) return false; // right on the note: the singer, whatever is ringing
  const tol = Math.pow(2, SELF_CENTS / 1200);
  for (const s of log.sounds) {
    if (t < s.t0 + delay || t > s.t1 + delay + SELF_TAIL) continue;
    if (keep.length && target > FAR_SEMITONES) return true;
    /* the pitches this sound went through during the stretch the microphone just heard */
    const a = Math.max(s.t0, t - delay - SELF_TAIL), b = Math.min(s.t1, t - delay);
    const pa = pitchAt(s, a), pb = pitchAt(s, Math.max(a, b));
    const lo = Math.min(pa, pb), hi = Math.max(pa, pb);
    for (const p of s.partials) for (const n of UNDERTONES) {
      const bl = (lo * p) / n, bh = (hi * p) / n;
      if (hz < bl / tol || hz > bh * tol) continue;
      const own = hz < bl ? hzToMidi(bl) : hz > bh ? hzToMidi(bh) : m;
      if (Math.abs(m - own) < target) return true;
    }
  }
  return false;
}

/* the note the singer should be on now (and one just ending or starting, within `reach`), for `keep`. Only
   these: the "on the note" bells are the finished note's pitch a few octaves up, so their undertones land
   exactly on the note just sung. Keeping that note as well let a bell over the next note pass as the singer. */
export const notesNear = (notes, t, lat = 0, reach = 0.1) => notes.filter((n) => t - lat >= n.s - reach && t - lat <= n.e + reach).map((n) => n.midi);
