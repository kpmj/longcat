/* The recorded demo voice: a person singing each syllable, one file for every note from D2 to C5.

   2026-11-14: every synthesised voice was turned down ("odd", then "like an instrument; it does not show how the
   sound is made", then "still odd"), so the designer recorded the five syllables the game uses (mm, oo, ah, noo,
   yah), each at three pitches. Offline, the WORLD vocoder replaced the pitch of each recording and kept its
   spectral envelope, so the mouth stays the same size at every note (tools/voice/ has the scripts; nothing of
   that runs here). Chosen by ear on a phone: the mouth a little smaller (1.15), brightened for phone speakers.
   The three takes of a syllable are matched in colour and in how loud they start, because a phrase that crossed
   from one take to the next changed voice at that note.

   Notes above about B3 are further from anything that was recorded, and nobody had heard them when this was
   written. A higher singer's own recordings are the real answer there.

   This file only fetches, decodes and plays. No imports, so synth.js can use it without a circle. The files are a
   person's voice: they are in the game because that person said so. */

export const REC_SYLS = ["mm", "oo", "ah", "noo", "yah"];
export const REC_LOW = 38, REC_HIGH = 72; // MIDI notes there is a file for
export const REC_GAIN = 1.2; // the files are a little under the other voices in level
export const REC_PARTIALS = [1, 2, 3, 4, 5, 6]; // harmonics that carry energy, for the self-hearing filter

const cache = new Map(); // "ah_57" -> { buf, lead } once loaded, or { promise } while loading
const key = (syl, midi) => `${syl}_${midi}`;

export const recHas = (syl, midi) => REC_SYLS.includes(syl) && Number.isInteger(midi) && midi >= REC_LOW && midi <= REC_HIGH;
/* the loaded note, or null if it is not here yet */
export const recReady = (syl, midi) => { const e = cache.get(key(syl, midi)); return e && e.buf ? e : null; };

export function loadRec(ctx, syl, midi) {
  if (!recHas(syl, midi)) return Promise.reject(new Error("no recording for that note"));
  const k = key(syl, midi), e = cache.get(k);
  if (e) return e.buf ? Promise.resolve(e) : e.promise;
  const promise = fetch(new URL(`./voice/${k}.m4a`, import.meta.url))
    .then((r) => { if (!r.ok) throw new Error(`voice file ${k}: ${r.status}`); return r.arrayBuffer(); })
    .then((a) => new Promise((ok, no) => { const p = ctx.decodeAudioData(a, ok, no); if (p && p.catch) p.catch(no); }))
    .then((buf) => {
      /* compressed audio can begin with some silent milliseconds, different in each browser: find where the voice
         really starts, so a note booked for a moment sounds at that moment */
      const d = buf.getChannelData(0);
      let i = 0;
      while (i < d.length && Math.abs(d[i]) < 0.004) i++;
      const done = { buf, lead: Math.max(0, i / buf.sampleRate - 0.004) };
      cache.set(k, done);
      return done;
    })
    .catch((err) => { cache.delete(k); throw err; });
  cache.set(k, { promise });
  return promise;
}

/* Every note of a phrase, before it is needed. Resolves true when all are here, false if one is missing, fails, or
   they take longer than `ms`: the caller then sings the whole phrase in a synthesised voice, never half and half. */
export function loadRecAll(ctx, syl, midis, ms = 6000) {
  const want = [...new Set(midis.map((m) => Math.round(m)))];
  if (!ctx || !want.every((m) => recHas(syl, m))) return Promise.resolve(false);
  const all = Promise.all(want.map((m) => loadRec(ctx, syl, m))).then(() => true, () => false);
  return Promise.race([all, new Promise((r) => setTimeout(() => r(false), ms))]);
}

/* One note: the file from its start, cut to the note's length with a short fade. Returns { out, srcs } like the
   synthesised voices in demo-voices.js. */
export function recNodes(ctx, dest, e, t0, dur, vol = 1) {
  const src = ctx.createBufferSource(), out = ctx.createGain();
  src.buffer = e.buf;
  const len = Math.max(0.08, Math.min(dur + 0.04, e.buf.duration - e.lead - 0.05));
  out.gain.setValueAtTime(REC_GAIN * vol, t0);
  out.gain.setValueAtTime(REC_GAIN * vol, t0 + Math.max(0.03, len - 0.08));
  out.gain.linearRampToValueAtTime(0, t0 + len);
  src.connect(out); out.connect(dest);
  src.start(t0, e.lead); src.stop(t0 + len + 0.05);
  return { out, srcs: [src] };
}
