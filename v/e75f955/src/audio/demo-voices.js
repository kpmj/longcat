/* The voices that can sing the demo, as node graphs on any audio context (the game's, an offline one for
   measuring, or a proposal board's). No imports and no state, so a board can inline this file as it is.

   Play-test, 2026-11-14: "the human-like demo from the cat sounds very odd". The cat voice is a small formant
   synthesiser, and a synthetic vowel sits in the uncanny place between a voice and a buzzer. The others here
   were built to be compared with it on a phone (Dev panel, "Demo voice"); the choice is the designer's.

   Every builder: (ctx, dest, t0, hz, dur, peak, syl) -> { out, srcs }. `out` is the last gain before `dest`
   (faded to stop the note early); `srcs` are the sources to stop. The pitch is never bent: the pitch is what
   the player copies. `partials` lists the harmonics that carry energy, for the self-hearing filter (self.js). */

/* ---------- the cat voice (drill-ladder board, section 8) ---------- */
const FORMANT = { a: [730, 1090, 2440], i: [270, 2290, 3010], u: [300, 870, 2240], e: [530, 1840, 2480],
  m: [250, 1000, 2200], n: [250, 1500, 2500], l: [360, 1300, 2700], w: [290, 610, 2150], y: [260, 2100, 3000] };
/* [sound, seconds it lasts (consonants) or null = the rest of the note, loudness] */
const SYLLABLE = {
  mm: [["m", null, 0.9]], ah: [["a", null, 1]], oo: [["u", null, 1]], ee: [["i", null, 1]],
  noo: [["n", 0.11, 0.4], ["u", null, 1]], nay: [["n", 0.11, 0.4], ["e", 0.3, 1], ["i", null, 0.9]], nah: [["n", 0.11, 0.4], ["a", null, 1]],
  yah: [["y", 0.09, 0.7], ["a", null, 1]], wee: [["w", 0.1, 0.7], ["i", null, 1]], woo: [["w", 0.12, 0.7], ["u", null, 1]], la: [["l", 0.09, 0.6], ["a", null, 1]],
};
const CAT_MOUTH = 1.32; // how far the formants move up
export const CAT_PEAK = 1.5; // level before the filters, set so the cat is about as loud as the old hum
/* fall = semitones the pitch drops over the note: 0 for singing, a few for the once-spoken syllable. */
export function catVoiceNodes(ctx, dest, t0, hz, dur, syl, peak, fall = 0) {
  const src = ctx.createOscillator(), out = ctx.createGain();
  src.type = "sawtooth";
  src.frequency.setValueAtTime(hz, t0);
  if (fall) src.frequency.exponentialRampToValueAtTime(hz * Math.pow(2, -fall / 12), t0 + dur);
  out.gain.setValueAtTime(0, t0);
  out.connect(dest);
  const bands = [0, 1, 2].map((j) => {
    const bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = "bandpass"; bp.Q.value = [7, 10, 12][j];
    g.gain.value = [1, 0.55, 0.3][j];
    src.connect(bp); bp.connect(g); g.connect(out);
    return bp;
  });
  let t = t0, last = peak;
  (SYLLABLE[syl] || SYLLABLE.ah).forEach(([ph, len, loud], idx) => {
    const F = FORMANT[ph];
    /* a ramp starts from the previous target, so each change of sound is a 70 ms glide of the three filters */
    bands.forEach((bp, j) => { if (idx === 0) bp.frequency.setValueAtTime(F[j] * CAT_MOUTH, t); else bp.frequency.linearRampToValueAtTime(F[j] * CAT_MOUTH, t + 0.07); });
    last = peak * loud;
    out.gain.linearRampToValueAtTime(last, t + (idx === 0 ? 0.04 : 0.07));
    if (len != null) { bands.forEach((bp, j) => bp.frequency.setValueAtTime(F[j] * CAT_MOUTH, t + len)); out.gain.setValueAtTime(last, t + len); t += len; }
  });
  out.gain.setValueAtTime(last, t0 + Math.max(0.1, dur - 0.08));
  out.gain.linearRampToValueAtTime(0, t0 + dur + 0.04);
  src.start(t0); src.stop(t0 + dur + 0.1);
  return { src, out, srcs: [src] };
}

/* ---------- a soft hum: triangle + sine through a low-pass, a little scoop in, a gentle vibrato ---------- */
export function humNodes(ctx, dest, t0, hz, dur, peak) {
  const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lfo = ctx.createOscillator();
  const lp = ctx.createBiquadFilter(), g = ctx.createGain(), g2 = ctx.createGain(), lg = ctx.createGain();
  o1.type = "triangle"; o2.type = "sine";
  lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 0.7;
  g2.gain.value = 0.3;
  o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest);
  o1.frequency.setValueAtTime(hz * Math.pow(2, -10 / 1200), t0);
  o1.frequency.exponentialRampToValueAtTime(hz, t0 + 0.12);
  o2.frequency.setValueAtTime(hz * 2 * Math.pow(2, -10 / 1200), t0);
  o2.frequency.exponentialRampToValueAtTime(hz * 2, t0 + 0.12);
  lfo.frequency.value = 5.2; lg.gain.value = hz * 0.006;
  lfo.connect(lg); lg.connect(o1.frequency);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.06);
  g.gain.setValueAtTime(peak * 0.85, t0 + Math.max(0.08, dur - 0.1));
  g.gain.linearRampToValueAtTime(0, t0 + dur + 0.05);
  const srcs = [o1, o2, lfo];
  srcs.forEach((o) => { o.start(t0); o.stop(t0 + dur + 0.1); });
  return { out: g, srcs };
}

const noiseOf = new WeakMap();
function noiseBuffer(ctx) {
  let b = noiseOf.get(ctx);
  if (!b) {
    b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseOf.set(ctx, b);
  }
  return b;
}

/* ---------- an ocarina: nearly a pure tone, a puff of breath at the start, a late light vibrato ---------- */
export function ocarinaNodes(ctx, dest, t0, hz, dur, peak) {
  const out = ctx.createGain(), srcs = [];
  out.gain.setValueAtTime(0, t0);
  out.gain.linearRampToValueAtTime(peak, t0 + 0.045);
  out.gain.setValueAtTime(peak * 0.92, t0 + Math.max(0.08, dur - 0.07));
  out.gain.linearRampToValueAtTime(0, t0 + dur + 0.05);
  out.connect(dest);
  const lfo = ctx.createOscillator(), depth = ctx.createGain();
  lfo.frequency.value = 5; depth.gain.setValueAtTime(0, t0);
  if (dur > 0.55) { depth.gain.setValueAtTime(0, t0 + 0.3); depth.gain.linearRampToValueAtTime(1, t0 + 0.55); }
  lfo.connect(depth);
  /* a phone speaker hardly plays a plain tone below about 300 Hz, so low notes get more of the upper harmonics */
  const low = hz < 260;
  [[1, 1], [2, low ? 0.4 : 0.14], [3, low ? 0.2 : 0.05], [4, low ? 0.08 : 0]].forEach(([k, a]) => {
    if (!a) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), v = ctx.createGain();
    o.type = "sine"; o.frequency.value = hz * k; g.gain.value = a;
    v.gain.value = hz * k * 0.003; depth.connect(v); v.connect(o.frequency);
    o.connect(g); g.connect(out);
    srcs.push(o);
  });
  /* breath: noise has no pitch, so the tracker cannot take it for a note */
  const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
  n.buffer = noiseBuffer(ctx); n.loop = true;
  bp.type = "bandpass"; bp.frequency.value = Math.min(5000, hz * 3); bp.Q.value = 1.5;
  ng.gain.setValueAtTime(0.5, t0); ng.gain.exponentialRampToValueAtTime(0.06, t0 + 0.09);
  n.connect(bp); bp.connect(ng); ng.connect(out);
  srcs.push(n, lfo);
  srcs.forEach((o) => { o.start(t0); o.stop(t0 + dur + 0.1); });
  return { out, srcs };
}

/* ---------- a music box that holds: a plucked start, then the note stays quietly for its whole length ---------- */
export function musicBoxNodes(ctx, dest, t0, hz, dur, peak) {
  const out = ctx.createGain(), srcs = [], end = t0 + dur;
  out.gain.setValueAtTime(1, t0);
  out.gain.setValueAtTime(1, end);
  out.gain.linearRampToValueAtTime(0, end + 0.14);
  out.connect(dest);
  /* [harmonic, level at the pluck, level it settles to, seconds to settle] */
  [[1, 1, 0.42, 0.45], [2, 0.38, hz < 260 ? 0.2 : 0.06, 0.3], [4, 0.14, hz < 260 ? 0.03 : 0.004, 0.16]].forEach(([k, a, hold, settle]) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = hz * k;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak * a, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(peak * hold, t0 + settle);
    g.gain.exponentialRampToValueAtTime(peak * hold * 0.7, Math.max(t0 + settle + 0.01, end));
    o.connect(g); g.connect(out);
    srcs.push(o);
  });
  srcs.forEach((o) => { o.start(t0); o.stop(end + 0.2); });
  return { out, srcs };
}

/* ---------- a meow: a cat sound, not a syllable. The mouth opens from "m" through "ee" and "ah" to "ow" ---------- */
const MEOW_MOUTH = 1.25;
export function meowNodes(ctx, dest, t0, hz, dur, peak) {
  const src = ctx.createOscillator(), soft = ctx.createBiquadFilter(), out = ctx.createGain();
  src.type = "sawtooth"; src.frequency.value = hz;
  soft.type = "lowpass"; soft.frequency.value = 3600; soft.Q.value = 0.5;
  src.connect(soft);
  out.gain.setValueAtTime(0, t0);
  out.connect(dest);
  const tm = t0 + Math.min(0.06, dur * 0.15), te = tm + Math.min(0.1, dur * 0.2), ta = te + (t0 + dur - te) * 0.4, end = t0 + dur;
  /* two moving formants and a little of the plain tone underneath for body */
  [[[250, 320, 950, 480], 5, 1], [[1100, 2500, 1650, 900], 8, 0.5]].forEach(([F, q, a]) => {
    const bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = "bandpass"; bp.Q.value = q; g.gain.value = a;
    bp.frequency.setValueAtTime(F[0] * MEOW_MOUTH, t0);
    bp.frequency.setValueAtTime(F[0] * MEOW_MOUTH, tm);
    bp.frequency.linearRampToValueAtTime(F[1] * MEOW_MOUTH, te);
    bp.frequency.linearRampToValueAtTime(F[2] * MEOW_MOUTH, ta);
    bp.frequency.linearRampToValueAtTime(F[3] * MEOW_MOUTH, end);
    soft.connect(bp); bp.connect(g); g.connect(out);
  });
  const body = ctx.createBiquadFilter(), bg = ctx.createGain();
  body.type = "lowpass"; body.frequency.value = Math.max(500, hz * 1.5); bg.gain.value = 0.12;
  soft.connect(body); body.connect(bg); bg.connect(out);
  out.gain.linearRampToValueAtTime(peak * 0.35, t0 + 0.03);
  out.gain.setValueAtTime(peak * 0.35, tm);
  out.gain.linearRampToValueAtTime(peak, te);
  out.gain.setValueAtTime(peak, ta);
  out.gain.linearRampToValueAtTime(peak * 0.6, Math.max(ta + 0.01, end - 0.04));
  out.gain.linearRampToValueAtTime(0, end + 0.05);
  src.start(t0); src.stop(end + 0.1);
  return { out, srcs: [src] };
}

/* ---------- a softer sung voice: the same syllables as the cat voice, built to sound less like a buzzer ----------
   the designer, 2026-11-14, after hearing the hum: "it sounds like an instrument; it does not show how the sound is made".
   So the demo has to sing the syllable, and the instruments above cannot be it. What made the cat voice odd, and
   what is different here:
     - the source was a plain sawtooth (bright and buzzy); here the harmonics fall off faster, like a relaxed voice,
       with a little breath mixed in;
     - the mouth was always scaled up 1.32 times, a tiny mouth even on a low man's note; here the mouth follows the
       pitch: full size on low notes, a little smaller on high ones, so the demo sounds like a singer of your range;
     - three formants with nothing between them sounded hollow; here there are five, and a little of the plain tone
       underneath;
     - the pitch stood perfectly still; here a long note gets a light, late vibrato (12 cents either way, well inside
       what the game calls on the note), as a person's would;
     - on high notes the first formant follows the pitch up, as singers do, so "oo" and "ee" do not go thin.
   Still a synthesiser: only a recording of a person will sound like a person. */
const waveOf = new WeakMap();
function voiceWave(ctx) {
  let w = waveOf.get(ctx);
  if (!w) {
    const N = 48, real = new Float32Array(N + 1), imag = new Float32Array(N + 1);
    for (let k = 1; k <= N; k++) imag[k] = 1 / Math.pow(k, SUNG_TILT);
    w = ctx.createPeriodicWave(real, imag);
    waveOf.set(ctx, w);
  }
  return w;
}
const SUNG_Q = [6, 9, 12, 12, 12], SUNG_GAIN = [1, 0.6, 0.32, 0.14, 0.07], SUNG_BODY = 0.1, SUNG_TILT = 1.6;
/* How loud a vowel comes out at a pitch: the harmonics that fall on a formant pass, the rest do not, so "ah" on
   one note can be several times louder than "oo" on another. This adds up what gets through (each band-pass as
   its resonance curve), and the voice divides by it, so every note of a demo is about equally loud. */
export function sungLevel(hz, F, bodyCut) {
  let p = 0;
  for (let k = 1; k <= 48 && k * hz < 12000; k++) {
    const fr = k * hz;
    let g = SUNG_BODY / Math.sqrt(1 + Math.pow(fr / bodyCut, 4));
    for (let j = 0; j < 5; j++) g += SUNG_GAIN[j] / Math.sqrt(1 + SUNG_Q[j] * SUNG_Q[j] * Math.pow(fr / F[j] - F[j] / fr, 2));
    p += Math.pow(g / Math.pow(k, SUNG_TILT), 2);
  }
  return Math.sqrt(p);
}
export const mouthFor = (hz) => (hz <= 175 ? 1 : hz >= 330 ? 1.17 : 1 + (0.17 * (hz - 175)) / 155);
export const VIBRATO_CENTS = 12;
export function sungVoiceNodes(ctx, dest, t0, hz, dur, syl, peak, fall = 0) {
  const src = ctx.createOscillator(), out = ctx.createGain(), srcs = [src], mouth = mouthFor(hz), end = t0 + dur;
  src.setPeriodicWave(voiceWave(ctx));
  src.frequency.setValueAtTime(hz, t0);
  if (fall) src.frequency.exponentialRampToValueAtTime(hz * Math.pow(2, -fall / 12), end);
  else if (dur >= 0.7) {
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = 5.4;
    depth.gain.setValueAtTime(0, t0);
    depth.gain.setValueAtTime(0, t0 + 0.28);
    depth.gain.linearRampToValueAtTime(hz * (Math.pow(2, VIBRATO_CENTS / 1200) - 1), t0 + 0.65);
    lfo.connect(depth); depth.connect(src.frequency);
    lfo.start(t0); lfo.stop(end + 0.15);
    srcs.push(lfo);
  }
  out.gain.setValueAtTime(0, t0);
  out.connect(dest);
  /* the first three formants move with the sound; the two above them only give the voice its ring */
  const formants = (ph) => { const F = FORMANT[ph]; return [Math.max(F[0] * mouth, hz * 1.02), F[1] * mouth, F[2] * mouth, 3300 * mouth, 4200 * mouth]; };
  const bands = [0, 1, 2, 3, 4].map((j) => {
    const bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = "bandpass"; bp.Q.value = SUNG_Q[j];
    g.gain.value = SUNG_GAIN[j];
    src.connect(bp); bp.connect(g); g.connect(out);
    return bp;
  });
  const body = ctx.createBiquadFilter(), bg = ctx.createGain(), bodyCut = Math.max(700, hz * 2);
  body.type = "lowpass"; body.frequency.value = bodyCut; bg.gain.value = SUNG_BODY;
  src.connect(body); body.connect(bg); bg.connect(out);
  const breath = ctx.createBufferSource(), bbp = ctx.createBiquadFilter(), bgain = ctx.createGain();
  breath.buffer = noiseBuffer(ctx); breath.loop = true;
  bbp.type = "bandpass"; bbp.frequency.value = 2200 * mouth; bbp.Q.value = 0.8; bgain.gain.value = 0.004;
  breath.connect(bbp); bbp.connect(bgain); bgain.connect(out);
  breath.start(t0); breath.stop(end + 0.15);
  srcs.push(breath);
  let t = t0, last = peak;
  (SYLLABLE[syl] || SYLLABLE.ah).forEach(([ph, len, loud], idx) => {
    const F = formants(ph);
    bands.forEach((bp, j) => { if (idx === 0) bp.frequency.setValueAtTime(F[j], t); else bp.frequency.linearRampToValueAtTime(F[j], t + 0.09); });
    last = (peak * loud) / Math.max(0.05, sungLevel(hz, F, bodyCut));
    out.gain.linearRampToValueAtTime(last * (len == null ? 0.88 : 1), t + (idx === 0 ? 0.07 : 0.09));
    if (len != null) { bands.forEach((bp, j) => bp.frequency.setValueAtTime(F[j], t + len)); out.gain.setValueAtTime(last, t + len); t += len; }
  });
  /* a held vowel swells a little and lets go slowly */
  const hold = Math.max(t + 0.1, end - 0.1);
  if (hold - t > 0.35) out.gain.linearRampToValueAtTime(last, t + (hold - t) * 0.45);
  out.gain.setValueAtTime(last * (hold - t > 0.35 ? 1 : 0.88), hold);
  out.gain.linearRampToValueAtTime(0, end + 0.06);
  src.start(t0); src.stop(end + 0.15);
  return { out, srcs };
}

/* The demo voices, in the order the Dev panel lists them. peak = the level that makes each about as loud as
   the others (measured with an offline context: all within about 3 dB of the cat voice); tail = seconds a note rings past its end. */
export const DEMO_VOICES = [
  /* the recorded voice has no node graph here: its files are fetched and played by recorded.js through synth.js */
  { id: "rec", name: "Recorded voice (the game's voice now)", words: true, recorded: true, tail: 0.1 },
  { id: "cat", name: "First synthesised cat voice", words: true, peak: CAT_PEAK, tail: 0.1, partials: [1, 2, 3, 4, 5], nodes: (c, d, t, hz, dur, peak, syl, fall) => catVoiceNodes(c, d, t, hz, dur, syl, peak, fall) },
  { id: "sung", name: "E · Softer sung voice, sings the syllable", words: true, peak: 0.31, tail: 0.15, partials: [1, 2, 3, 4, 5], nodes: (c, d, t, hz, dur, peak, syl, fall) => sungVoiceNodes(c, d, t, hz, dur, syl, peak, fall) },
  { id: "hum", name: "A · Soft hum", peak: 0.26, tail: 0.1, partials: [1, 2, 3], nodes: humNodes },
  { id: "ocarina", name: "B · Ocarina", peak: 0.24, tail: 0.1, partials: [1, 2, 3, 4], nodes: ocarinaNodes },
  { id: "musicbox", name: "C · Music box that holds the note", peak: 0.5, tail: 0.2, partials: [1, 2, 4], nodes: musicBoxNodes },
  { id: "meow", name: "D · Meow", peak: 1.2, tail: 0.1, partials: [1, 2, 3, 4, 5], nodes: meowNodes },
];
export const demoVoice = (id) => DEMO_VOICES.find((v) => v.id === id) || DEMO_VOICES[0];
