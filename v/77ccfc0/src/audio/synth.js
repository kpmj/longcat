/* Everything the game plays: the hummed demo, the count-in, and the per-place sound effects.
   Six effects a place (in tune / not, for each time of day), synthesised so the demo needs no audio files. */
import { midiToHz, hzToMidi } from "./pitch.js";
import { selfLog, noteSound, fromSelf } from "./self.js";

/* every pitched sound played, so the tracker can ignore the game's own voice (see self.js) */
const heard = selfLog();
const logSound = (t0, dur, f0, f1, glide, partials) => noteSound(heard, { t0, t1: t0 + dur, f0, f1, glide, partials });
export function heardItself(midi, keep) {
  if (!ac || midi == null) return false;
  const delay = (ac.baseLatency || 0) + (ac.outputLatency || 0);
  return fromSelf(heard, midiToHz(midi), ac.currentTime, keep, delay);
}

let ac = null, master = null, fx = null, fxTone = null, muted = false;

export function audioContext() {
  if (!ac) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    /* Play-test, 2026-11-14: "really low even with the volume at max". A default compressor squashed
       everything above -24 dBFS with no make-up gain (the designer's recording peaked near -10 dBFS). Now a limiter
       like the old app's: idle at normal levels, it only catches peaks. */
    master.gain.value = 1.8;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -3; comp.knee.value = 2; comp.ratio.value = 20;
    comp.attack.value = 0.002; comp.release.value = 0.12;
    master.connect(comp);
    comp.connect(ac.destination);
    /* effects go through their own bus so each time of day can colour them */
    fx = ac.createGain();
    fxTone = ac.createBiquadFilter();
    fxTone.type = "peaking";
    fx.connect(fxTone);
    fxTone.connect(master);
  }
  if (ac.state === "suspended") ac.resume();
  return ac;
}
export const now = () => (ac ? ac.currentTime : performance.now() / 1000);
export function setMuted(m) { muted = !!m; }

/* The cat's voice (drill-ladder board, section 8): the demo sings the syllable the player is asked to sing.
   A small formant synthesiser: one sawtooth at exactly the target pitch through three band-pass filters placed
   at the vowel's formants; a consonant is a short move of those filters (n, m: quiet and low; w starts at "oo";
   y starts at "ee"; l is a quick dip). It sounds like a cat only because the formants are scaled up, as a smaller
   mouth would; the pitch is never bent, because the pitch is what the player copies. */
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
/* The nodes of one sung syllable, on any context (the game's, or an offline one for measuring). fall = semitones
   the pitch drops over the note: 0 for singing, a few for the once-spoken syllable. */
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
  return { src, out };
}
export function sing(t0, midi, dur, syl = "ah", { vol = 1, fall = 0 } = {}) {
  if (muted || !audioContext()) return { stop() {} };
  const f = midiToHz(midi);
  logSound(t0, dur + 0.1, f, f * Math.pow(2, -fall / 12), fall ? 1 : 0, [1, 2, 3, 4, 5]);
  const { src, out } = catVoiceNodes(ac, master, t0, f, dur, syl, CAT_PEAK * vol * (midi < 50 ? 1.3 : 1), fall);
  return {
    stop() {
      try {
        const n = ac.currentTime;
        out.gain.cancelScheduledValues(n);
        out.gain.setTargetAtTime(0, n, 0.03);
        src.stop(n + 0.12);
      } catch { /* already stopped */ }
    },
  };
}

/* A soft hummed note: triangle + sine through a low-pass, a little scoop in and a gentle vibrato. */
export function hum(t0, midi, dur, vol = 1) {
  if (muted || !audioContext()) return { stop() {} };
  const f = midiToHz(midi);
  logSound(t0, dur + 0.1, f, f, 0, [1, 2, 3]);
  const o1 = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator();
  const lp = ac.createBiquadFilter(), g = ac.createGain(), g2 = ac.createGain(), lg = ac.createGain();
  o1.type = "triangle"; o2.type = "sine";
  lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 0.7;
  g2.gain.value = 0.3;
  o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(master);
  o1.frequency.setValueAtTime(f * Math.pow(2, -10 / 1200), t0);
  o1.frequency.exponentialRampToValueAtTime(f, t0 + 0.12);
  o2.frequency.setValueAtTime(f * 2 * Math.pow(2, -10 / 1200), t0);
  o2.frequency.exponentialRampToValueAtTime(f * 2, t0 + 0.12);
  lfo.frequency.value = 5.2; lg.gain.value = f * 0.006;
  lfo.connect(lg); lg.connect(o1.frequency);
  const peak = 0.26 * vol * (midi < 50 ? 1.3 : 1);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.06);
  g.gain.setValueAtTime(peak * 0.85, t0 + Math.max(0.08, dur - 0.1));
  g.gain.linearRampToValueAtTime(0, t0 + dur + 0.05);
  [o1, o2, lfo].forEach((o) => { o.start(t0); o.stop(t0 + dur + 0.1); });
  return {
    stop() {
      try {
        const n = ac.currentTime;
        g.gain.cancelScheduledValues(n);
        g.gain.setTargetAtTime(0, n, 0.03);
        [o1, o2, lfo].forEach((o) => o.stop(n + 0.12));
      } catch { /* already stopped */ }
    },
  };
}

function tone(type, f0, f1, dur, vol, t = null, filter = null) {
  if (muted || !audioContext()) return;
  const t0 = t ?? ac.currentTime;
  logSound(t0, dur + 0.05, f0, Math.max(20, f1), dur, type === "sine" ? [1] : [1, 2, 3]);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur + 0.02);
  let node = o;
  if (filter) { const b = ac.createBiquadFilter(); b.type = filter.type; b.frequency.value = filter.f; b.Q.value = filter.q || 1; o.connect(b); node = b; }
  node.connect(g); g.connect(fx);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
let noiseBuf = null;
function noise(dur, vol, type, f, q = 1, t = null, f1 = null) {
  if (muted || !audioContext()) return;
  const t0 = t ?? ac.currentTime;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ac.createBufferSource(), b = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; b.type = type; b.frequency.setValueAtTime(f, t0); b.Q.value = q;
  if (f1) b.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  s.connect(b); b.connect(g); g.connect(fx);
  s.start(t0); s.stop(t0 + dur + 0.05);
}

/* The metronome under the demo and the singing. A short burst of high noise, not a tone: the microphone hears
   the phone's own speaker, and a tone would be taken for a sung pitch. Noise has no pitch, and it is over in
   a fraction of the tracker's window. Quiet on purpose. */
export function tick(t = null, accent = false) {
  if (muted || !audioContext()) return;
  const t0 = Math.max(ac.currentTime, t ?? 0);
  if (!noiseBuf) noise(0.001, 0, "lowpass", 100); // makes the shared noise buffer
  const s = ac.createBufferSource(), b = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; b.type = "bandpass"; b.frequency.value = accent ? 4200 : 3200; b.Q.value = 3;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(accent ? 0.55 : 0.32, t0 + 0.001); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.024);
  s.connect(b); b.connect(g); g.connect(fx);
  s.start(t0); s.stop(t0 + 0.05);
}
export function click(t, accent = false) { tone("sine", accent ? 1400 : 1000, accent ? 1400 : 1000, 0.07, 0.2, t); }
export function chime(notes = [523, 659, 784]) {
  if (!audioContext()) return;
  notes.forEach((f, i) => tone("sine", f, f, 0.32, 0.12, ac.currentTime + i * 0.11));
}

/* The sound at the end of every note, the same in every place so it can be learned once (the designer's play-test,
   2026-11-13: the old per-place sound for a right note fell in pitch and read as "wrong").
     good  two bright bell notes going up, in tune with the note just sung
     mid   one soft plain note
     off   one low note sliding down
   scale < 1 while more notes are still to be sung, so it does not drown the voice the microphone is hearing. */
function bell(f, t0, dur, vol, type = "sine") {
  logSound(t0, dur + 0.03, f, f, 0, type === "sine" ? [1, 2] : [1, 2, 3]);
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
  o.type = type; o.frequency.value = f;
  o2.type = "sine"; o2.frequency.value = f * 2; g2.gain.value = 0.25;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
  [o, o2].forEach((x) => { x.start(t0); x.stop(t0 + dur + 0.03); });
}
const register = (f, lo) => { while (f < lo) f *= 2; while (f >= lo * 2) f /= 2; return f; };
export function noteCue(level, midi, scale = 1) {
  if (muted || !audioContext()) return;
  const t = ac.currentTime, f = midiToHz(midi);
  if (level === "good") {
    const a = register(f, 700);
    bell(a, t, 0.2, 0.2 * scale);
    bell(a * 1.5, t + 0.075, 0.28, 0.2 * scale);
  } else if (level === "mid") {
    bell(register(f, 500), t, 0.13, 0.1 * scale, "triangle");
  } else {
    const a = register(f, 300);
    logSound(t, 0.32, a, a * 0.62, 0.24, [1, 3]);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(a, t);
    o.frequency.exponentialRampToValueAtTime(a * 0.62, t + 0.24);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.17 * scale, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.32);
  }
}
export function purr() { noise(0.5, 0.05, "lowpass", 180, 0.7); }

/* Per place: what an in-tune note and a missed note sound like (design doc section 7 table). The time of day
   shifts the colour: morning a little brighter, night lower and softer. */
const SFX = {
  onsen: { hit: () => tone("sine", 620, 1500, 0.13, 0.16), miss: () => { tone("sine", 220, 90, 0.22, 0.2); noise(0.18, 0.05, "lowpass", 600); } },
  livingroom: { hit: () => { tone("triangle", 2600, 2550, 0.18, 0.08); tone("sine", 3900, 3900, 0.12, 0.04); }, miss: () => { tone("sine", 660, 660, 0.14, 0.1); tone("sine", 523, 523, 0.2, 0.1, now() + 0.17); } },
  nightmarket: { hit: () => { noise(0.08, 0.12, "bandpass", 3200, 4); tone("square", 900, 880, 0.05, 0.03); }, miss: () => noise(0.5, 0.06, "bandpass", 1800, 6, null, 500) },
  train: { hit: () => tone("sine", 1760, 1760, 0.35, 0.1), miss: () => { tone("sawtooth", 440, 430, 0.5, 0.04, null, { type: "lowpass", f: 1200 }); tone("sawtooth", 554, 545, 0.5, 0.03, null, { type: "lowpass", f: 1200 }); } },
  beach: { hit: () => noise(0.6, 0.07, "lowpass", 900, 0.7, null, 300), miss: () => [0, 0.12, 0.22].forEach((d) => tone("triangle", 1800, 1200, 0.08, 0.05, now() + d)) },
  library: { hit: () => noise(0.12, 0.08, "highpass", 2500, 0.8), miss: () => noise(0.7, 0.05, "highpass", 4000, 0.5) },
  camping: { hit: () => [0, 0.05, 0.13].forEach((d) => noise(0.03, 0.1, "bandpass", 2000 + d * 4000, 3, now() + d)), miss: () => tone("sawtooth", 620, 660, 0.5, 0.015, null, { type: "bandpass", f: 650, q: 8 }) },
  cinema: { hit: () => noise(0.05, 0.14, "bandpass", 1500, 2), miss: () => [0, 0.2].forEach((d) => tone("square", 1200, 1200, 0.12, 0.03, now() + d)) },
  bus: { hit: () => tone("sine", 1568, 1568, 0.25, 0.1), miss: () => tone("sawtooth", 2400, 1900, 0.4, 0.02, null, { type: "bandpass", f: 2200, q: 5 }) },
  museum: { hit: () => { noise(0.04, 0.12, "highpass", 3000); noise(0.04, 0.1, "highpass", 3000, 1, now() + 0.07); }, miss: () => noise(0.18, 0.08, "bandpass", 400, 1.5) },
  rooftop: { hit: () => tone("sine", 900, 1800, 0.09, 0.12), miss: () => { tone("sine", 330, 300, 0.25, 0.08); tone("sine", 300, 280, 0.25, 0.06, now() + 0.28); } },
  skilift: { hit: () => tone("sine", 2093, 2093, 0.4, 0.08), miss: () => noise(0.35, 0.08, "lowpass", 700, 0.7, null, 200) },
};
/* scale < 1 while the player is singing, so the effect doesn't drown the voice the microphone is listening to */
const TIME_COLOUR = { morning: { f: 2600, gain: 5 }, golden: { f: 1200, gain: 0 }, night: { f: 900, gain: -7 } };
export function placeSfx(place, time, kind, scale = 1) {
  if (muted || !audioContext()) return;
  const s = SFX[place] || SFX.onsen;
  const c = TIME_COLOUR[time] || TIME_COLOUR.golden;
  const t = ac.currentTime;
  fxTone.frequency.setValueAtTime(c.f, t);
  fxTone.gain.setValueAtTime(c.gain, t);
  fx.gain.setValueAtTime((time === "night" ? 0.75 : 1) * scale, t);
  (kind === "hit" ? s.hit : s.miss)();
  fx.gain.setValueAtTime(1, t + 0.9);
  fxTone.gain.setValueAtTime(0, t + 0.9);
}
