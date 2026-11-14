/* Everything the game plays: the hummed demo, the count-in, and the per-place sound effects.
   Six effects a place (in tune / not, for each time of day), synthesised so the demo needs no audio files. */
import { midiToHz } from "./pitch.js";

let ac = null, master = null, fx = null, fxTone = null, muted = false;

export function audioContext() {
  if (!ac) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.6;
    const comp = ac.createDynamicsCompressor();
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

/* A soft hummed note: triangle + sine through a low-pass, a little scoop in and a gentle vibrato. */
export function hum(t0, midi, dur, vol = 1) {
  if (muted || !audioContext()) return { stop() {} };
  const f = midiToHz(midi);
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
