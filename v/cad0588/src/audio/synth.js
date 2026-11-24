/* Everything the game plays: the hummed demo, the count-in, and the per-place sound effects.
   Six effects a place (in tune / not, for each time of day), synthesised so the demo needs no audio files. */
import { midiToHz, hzToMidi } from "./pitch.js";
import { selfLog, noteSound, fromSelf } from "./self.js";
import { catVoiceNodes, CAT_PEAK, humNodes, demoVoice } from "./demo-voices.js";
import { loadRec, loadRecAll, recReady, recHas, recNodes, REC_PARTIALS } from "./recorded.js";
export { catVoiceNodes, CAT_PEAK };

/* every pitched sound played, so the tracker can ignore the game's own voice (see self.js) */
const heard = selfLog();
const logSound = (t0, dur, f0, f1, glide, partials) => noteSound(heard, { t0, t1: t0 + dur, f0, f1, glide, partials });
export function heardItself(midi, keep) {
  if (!ac || midi == null) return false;
  const delay = (ac.baseLatency || 0) + (ac.outputLatency || 0);
  return fromSelf(heard, midiToHz(midi), ac.currentTime, keep, delay);
}

let ac = null, master = null, fx = null, fxTone = null, muted = false;
/* Everything a take plays is lifted by the same amount while its microphone is open, so the demo, the beat and
   the notes given between rounds stay one level (take-screen.js). The limiter below catches what goes over. */
const MASTER = 1.8;
let boost = 1;
export function setBoost(k = 1) {
  boost = k > 0 ? k : 1;
  if (ac && master) { try { master.gain.setTargetAtTime(MASTER * boost, ac.currentTime, 0.02); } catch { master.gain.value = MASTER * boost; } }
}

export function audioContext() {
  if (!ac) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    /* Play-test, 2026-11-14: "really low even with the volume at max". A default compressor squashed
       everything above -24 dBFS with no make-up gain (the designer's recording peaked near -10 dBFS). Now a limiter
       like the old app's: idle at normal levels, it only catches peaks. */
    master.gain.value = MASTER * boost;
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
    ac.onstatechange = () => kick();
  }
  if (ac.state !== "running") kick();
  return ac;
}
export const now = () => (ac ? ac.currentTime : performance.now() / 1000);

/* Waking the sound. Play-test, 2026-11-14 (a screen recording): a take sat on "Listen first" for ever. An
   iPhone can pause a page's sound from outside (a call, another app's sound, the screen recorder, the
   microphone being let go); the context is then "interrupted", not "suspended", so the old check never
   resumed it, and its clock, which the take ran on, stood still. Now any state but "running" is resumed:
   on every touch, when the page comes back, when the state changes, and at most every 0.4 s while the game
   asks for the context. The take itself no longer depends on this clock (take-screen.js). */
let kicked = 0;
function kick(force = false) {
  if (!ac || ac.state === "running" || ac.state === "closed") return;
  const t = Date.now();
  if (!force && t - kicked < 400) return;
  kicked = t;
  try { const p = ac.resume(); if (p && p.catch) p.catch(() => {}); } catch { /* not allowed yet */ }
}
if (typeof addEventListener === "function" && typeof document !== "undefined") {
  for (const ev of ["pointerdown", "touchend", "click", "keydown"]) addEventListener(ev, () => heal(), true);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(true); });
}
export const audioState = () => (ac ? ac.state : "none");
export const audioRunning = () => !!ac && ac.state === "running";
/* seconds between booking a sound and hearing it, as far as the browser says: [inside the browser, the device] */
export const audioDelay = () => (ac ? [ac.baseLatency ?? null, ac.outputLatency ?? null].map((x) => (x == null ? null : Math.round(x * 1000) / 1000)) : null);
/* true once the sound runs; false if it still does not after `ms` (the caller then asks for a tap) */
export async function wakeAudio(ms = 700) {
  if (!audioContext()) return true; // a browser with no sound at all: nothing to wait for
  kick(true);
  const end = Date.now() + ms;
  while (ac.state !== "running" && Date.now() < end) await new Promise((r) => setTimeout(r, 40));
  return ac.state === "running";
}
/* After the microphone opens or is let go, a phone's sound stops for a moment. Resolves true once the sound's clock
   has moved `need` seconds, false if it has not within `ms`. */
export async function audioSettled(need = 0.1, ms = 1200) {
  const c = ac;
  if (!c) return true;
  const a0 = c.currentTime, end = Date.now() + ms;
  while (Date.now() < end) {
    await new Promise((r) => setTimeout(r, 30));
    if (c !== ac || c.currentTime - a0 >= need) return true;
  }
  return false;
}
/* Throw the context away and make a new one. Only inside a touch, where a phone lets sound start. The old one is
   closed a moment later, so a chime still ringing is not cut off. Whoever keeps nodes of their own (the home
   music) hears about it through the "longcat-audio" event. */
export function rebuildAudio() {
  const old = ac;
  ac = null; master = null; fx = null; fxTone = null; noiseBuf = null;
  heard.sounds.length = 0;
  stale = false; stuckAt = 0;
  if (old) setTimeout(() => { try { old.close(); } catch { /* already closed */ } }, 1500);
  const fresh = audioContext();
  try { if (typeof dispatchEvent === "function") dispatchEvent(new Event("longcat-audio")); } catch { /* no window */ }
  return fresh;
}

/* Healing, on every touch. Play-test, 2026-11-14 (a second recording): the home page had no sound at all, and
   turning the music off and on did nothing. Resuming is not always enough on an iPhone: after the microphone has
   been used, or when something else took the sound, the context can stay stuck, or say it runs and play nothing.
   A fresh context is what brings sound back, so one is made, inside the touch:
     - when a take has just ended (the microphone was open: markAudioStale), and
     - when the context was already found not running at an earlier touch, and resuming did not help.
   Never while a take holds the sound (holdAudio): its microphone is wired to the context. */
let stale = false, held = false, stuckAt = 0;
export const markAudioStale = () => { stale = true; };
export const holdAudio = (on) => { held = !!on; };
function heal() {
  if (!ac || held) return kick(true);
  if (stale) return void rebuildAudio();
  if (ac.state === "running" || ac.state === "closed") { stuckAt = 0; return; }
  if (stuckAt && Date.now() - stuckAt > 600) return void rebuildAudio();
  if (!stuckAt) stuckAt = Date.now();
  kick(true);
}
export function setMuted(m) { muted = !!m; }

/* The cat's voice and the other demo voices are node graphs in demo-voices.js; this file plays them on the
   game's context and logs them for the self-hearing filter. */
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

const stopper = ({ out, srcs }) => ({
  stop() {
    try {
      const n = ac.currentTime;
      out.gain.cancelScheduledValues(n);
      out.gain.setTargetAtTime(0, n, 0.03);
      srcs.forEach((o) => o.stop(n + 0.12));
    } catch { /* already stopped */ }
  },
});
/* A chord, struck and left to ring, like the piano under a singing exercise: it gives the key of the round to come
   (take-screen.js). Each note is a triangle with a quiet octave over it; it fades as it rings and is let go at the
   end of `dur`. Written down for the self-hearing filter like every pitched sound. */
export function chord(t0, midis, dur, vol = 1) {
  if (muted || !audioContext() || !midis?.length) return { stop() {} };
  const out = ac.createGain(), srcs = [], peak = (0.2 * vol) / Math.sqrt(midis.length / 3);
  const t = Math.max(ac.currentTime, t0);
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(peak, t + 0.008);
  out.gain.exponentialRampToValueAtTime(peak * 0.3, t + Math.max(0.1, dur));
  out.gain.setTargetAtTime(0, t + dur, 0.04);
  out.connect(master);
  for (const m of midis) {
    const f = midiToHz(m);
    logSound(t, dur + 0.2, f, f, 0, [1, 2, 3]);
    [["triangle", 1, 1], ["sine", 2, 0.28]].forEach(([type, k, g]) => {
      const o = ac.createOscillator(), a = ac.createGain();
      o.type = type; o.frequency.value = f * k; a.gain.value = g;
      o.connect(a); a.connect(out);
      o.start(t); o.stop(t + dur + 0.3);
      srcs.push(o);
    });
  }
  return stopper({ out, srcs });
}
/* A soft hummed note (the graph is humNodes in demo-voices.js). */
export function hum(t0, midi, dur, vol = 1) {
  if (muted || !audioContext()) return { stop() {} };
  const f = midiToHz(midi);
  logSound(t0, dur + 0.1, f, f, 0, [1, 2, 3]);
  return stopper(humNodes(ac, master, t0, f, dur, 0.26 * vol * (midi < 50 ? 1.3 : 1)));
}
/* One note of the demo in the chosen voice (Dev panel, "Demo voice"). The cat voice also takes `fall`, for the
   syllable it says once; the others have no words, so they play the plain note. */
export function demoNote(kind, t0, midi, dur, syl = "ah", opts = {}) {
  const V = demoVoice(kind);
  if (V.recorded) {
    if (muted || !audioContext()) return { stop() {} };
    const m = Math.round(midi), e = recReady(syl, m);
    if (e) {
      const f = midiToHz(m);
      logSound(t0, dur + V.tail, f, f, 0, REC_PARTIALS);
      return stopper(recNodes(ac, master, e, t0, dur, opts.vol ?? 1));
    }
    /* not loaded (prepareDemo was not called, or the note is outside what was recorded): fetch it for next time
       and sing this one in the synthesised voice */
    if (recHas(syl, m)) loadRec(ac, syl, m).catch(() => {});
    return demoNote("sung", t0, midi, dur, syl, opts);
  }
  if (V.id === "cat") return sing(t0, midi, dur, syl, opts);
  if (muted || !audioContext()) return { stop() {} };
  const f = midiToHz(midi), fall = V.words ? opts.fall || 0 : 0;
  logSound(t0, dur + V.tail, f, f * Math.pow(2, -fall / 12), fall ? 1 : 0, V.partials);
  return stopper(V.nodes(ac, master, t0, f, dur, V.peak * (opts.vol ?? 1) * (midi < 50 ? 1.3 : 1), syl, fall));
}

/* Before a phrase is sung in the recorded voice, its notes have to be fetched. Resolves to the voice to use for
   the whole phrase: the one asked for, or the synthesised one if the recordings are not all here in time. */
export async function prepareDemo(kind, syl, midis, ms = 6000) {
  const V = demoVoice(kind);
  if (!V.recorded) return V.id;
  if (muted || !audioContext()) return V.id;
  return (await loadRecAll(ac, syl, midis, ms)) ? V.id : "sung";
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
/* accent = a note starts on this beat. the designer, 2026-11-24: "let's have the starting beat for each note stronger so
   the player knows that's the beat they are singing". The two used to differ a little (0.55 against 0.32, a
   slightly higher band). Now the note's beat is a full knock, lower, about three times as strong and twice as
   long, and the beats in between are a light tap. */
export function tick(t = null, accent = false) {
  if (muted || !audioContext()) return;
  const t0 = Math.max(ac.currentTime, t ?? 0);
  if (!noiseBuf) noise(0.001, 0, "lowpass", 100); // makes the shared noise buffer
  const s = ac.createBufferSource(), b = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; b.type = "bandpass"; b.frequency.value = accent ? 2600 : 3800; b.Q.value = accent ? 2 : 3;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(accent ? 0.95 : 0.3, t0 + 0.001); g.gain.exponentialRampToValueAtTime(0.001, t0 + (accent ? 0.05 : 0.024));
  s.connect(b); b.connect(g); g.connect(fx);
  s.start(t0); s.stop(t0 + 0.08);
}
export function click(t, accent = false) { tone("sine", accent ? 1400 : 1000, accent ? 1400 : 1000, accent ? 0.1 : 0.07, accent ? 0.3 : 0.2, t); }
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
  jungle: { hit: () => { tone("sine", 2300, 3100, 0.07, 0.1); tone("sine", 2700, 3500, 0.07, 0.08, now() + 0.09); }, miss: () => { tone("triangle", 430, 560, 0.12, 0.09); tone("triangle", 430, 330, 0.16, 0.08, now() + 0.15); } },
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
