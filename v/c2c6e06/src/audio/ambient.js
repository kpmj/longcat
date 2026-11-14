/* The home page's own sounds (the designer, 2026-11-14): a small sound for each thing that can be tapped in the scene, and a
   quiet piece of music that loops while the home page is open. Everything is made in the browser from oscillators
   and noise; there are no audio files. It never plays during a take: the microphone would hear it.
   Its sounds go to their own two buses and a limiter of their own, at a low level, so the game's limiter and the log
   of "sounds the game made itself" (synth.js) are left alone. */
import { audioContext } from "./synth.js";

let ac = null, bus = null, musicBus = null, noiseBuf = null;
function ctx() {
  const c = audioContext();
  if (!c) return null;
  if (c !== ac) {
    /* a new context (synth.js makes one when the phone's sound got stuck): nothing of the old one can play on it,
       so the music starts over from "not playing" */
    if (ac) { playing = false; clearInterval(timer); timer = null; clearTimeout(haltTimer); haltTimer = null; armed = false; }
    ac = c;
    /* a limiter of its own, like the one on the game's master: music, a tap and one of the game's chimes can land at
       the same moment, and together they must not clip on a phone speaker (advice from the sound session) */
    const limit = ac.createDynamicsCompressor();
    limit.threshold.value = -3; limit.knee.value = 2; limit.ratio.value = 20; limit.attack.value = 0.002; limit.release.value = 0.12;
    limit.connect(ac.destination);
    bus = ac.createGain(); bus.gain.value = 1.6; bus.connect(limit);
    musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(limit);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return ac;
}
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

/* one oscillator with a pitch glide and a soft envelope; `points` = [[seconds, hertz], ...] after the start */
function voice(dest, type, f0, points, dur, vol, t0, attack = 0.008) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  for (const [dt, f] of points) o.frequency.exponentialRampToValueAtTime(Math.max(20, f), t0 + dt);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(g); g.connect(dest);
  o.start(t0); o.stop(t0 + dur + 0.05);
  return { o, g };
}
/* a struck bar: the note and a quiet octave above it */
function bar(dest, f, dur, vol, t0, type = "sine") {
  voice(dest, type, f, [], dur, vol, t0, 0.004);
  voice(dest, "sine", f * 2, [], dur * 0.6, vol * 0.22, t0, 0.004);
}
function hiss(dest, type, f, q, dur, vol, t0, f1 = null) {
  const s = ac.createBufferSource(), b = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; s.loop = true;
  b.type = type; b.frequency.setValueAtTime(f, t0); b.Q.value = q;
  if (f1) b.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  s.connect(b); b.connect(g); g.connect(dest);
  s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05);
  return g;
}

/* ---------- a sound for each thing that can be tapped (the art's data-tap kinds) ---------- */
const TAP = {
  /* a pat: a short rising "mrrp", then a purr (low noise that flutters about 25 times a second) */
  cat(t) {
    const k = 2 ** ((Math.random() * 4 - 2) / 12), b = ac.createBiquadFilter(), g = ac.createGain();
    b.type = "bandpass"; b.frequency.value = 1900 * k; b.Q.value = 1.6; b.connect(bus);
    voice(b, "sawtooth", 560 * k, [[0.07, 900 * k], [0.2, 760 * k]], 0.24, 0.16, t, 0.02);
    voice(bus, "sine", 560 * k, [[0.07, 900 * k], [0.2, 760 * k]], 0.22, 0.05, t, 0.02);
    const purr = hiss(g, "lowpass", 330, 0.8, 0.75, 0.2, t + 0.16); // 330 Hz: a phone speaker has nothing below that
    const lfo = ac.createOscillator(), depth = ac.createGain();
    lfo.frequency.value = 25; depth.gain.value = 0.5; g.gain.value = 0.5;
    lfo.connect(depth); depth.connect(g.gain); g.connect(bus);
    lfo.start(t + 0.16); lfo.stop(t + 1);
    void purr;
  },
  /* the judge: a wooden tap and a low, unbothered "mm" */
  judge(t) {
    voice(bus, "sine", 520, [[0.05, 240]], 0.07, 0.14, t, 0.002);
    voice(bus, "triangle", 233, [[0.3, 196]], 0.42, 0.12, t + 0.05, 0.05);
  },
  /* the yuzu on its head: a round little bounce */
  yuzu(t) { voice(bus, "sine", 420, [[0.09, 780], [0.26, 520]], 0.3, 0.14, t); },
  /* a yuzu in the water: plip, plop */
  dunk(t) {
    voice(bus, "sine", 1150, [[0.08, 420]], 0.1, 0.12, t, 0.003);
    voice(bus, "sine", 760, [[0.09, 300]], 0.12, 0.1, t + 0.13, 0.003);
    hiss(bus, "bandpass", 2600, 1.2, 0.12, 0.03, t);
  },
  /* the lantern: one small bell */
  lamp(t) { bar(bus, 1568, 0.8, 0.07, t); },
  /* the sun or the moon: three bright notes going up */
  window(t) { [1175, 1480, 1760].forEach((f, i) => bar(bus, f, 0.4, 0.06, t + i * 0.07)); },
  /* hanging things: a wind chime, never the same twice */
  swing(t) {
    const notes = [1175, 1319, 1568, 1760, 1976, 2349];
    let at = t;
    for (let i = 0; i < 4; i++) { bar(bus, notes[Math.floor(Math.random() * notes.length)], 1, 0.045, at); at += 0.06 + Math.random() * 0.1; }
  },
  /* the campfire: a soft whoosh and a few crackles */
  fire(t) {
    hiss(bus, "lowpass", 500, 0.7, 0.35, 0.07, t, 220);
    let at = t + 0.03;
    for (let i = 0; i < 5; i++) { hiss(bus, "bandpass", 1800 + Math.random() * 2200, 4, 0.03, 0.09, at); at += 0.04 + Math.random() * 0.09; }
  },
};
/* play the sound of a tap; unknown kinds make no sound */
export function tapSound(kind) {
  if (!TAP[kind] || !ctx() || ac.state !== "running") return;
  TAP[kind](ac.currentTime + 0.005);
}

/* ---------- the home page's music ----------
   Sixteen bars in D, in the five-note scale of the place (D E F# A B, no half steps), at walking pace: a music-box
   melody, a plucked string answering between its notes, a soft pad holding each bar's chord. Morning is a little
   quicker and brighter, night slower, lower and softer. Written as numbers so it can be changed here. */
const _ = null;
const MELODY = [
  [74, _, 71, _, 69, _, 71, _], [74, _, _, 71, 69, _, _, _], [66, _, 69, _, 71, _, 74, _], [76, _, _, 74, 71, _, 69, _],
  [74, _, 76, _, 78, _, 76, _], [74, _, _, 71, _, 69, _, _], [66, _, 71, _, 69, _, 64, _], [62, _, 69, _, 74, _, _, _],
  [71, _, 74, _, 71, _, 66, _], [69, _, _, 66, _, 62, _, _], [64, _, 66, _, 71, _, 76, _], [76, _, _, 71, 69, _, _, _],
  [78, _, 76, _, 74, _, 71, _], [74, _, _, 69, _, 71, _, _], [66, _, 69, _, 71, _, 69, _], [74, _, _, _, 62, _, _, _],
];
/* each bar's chord: bass note, then the notes the pad holds */
const CH = { D: [38, [50, 57, 62, 66]], Bm: [35, [47, 54, 59, 62]], G: [43, [55, 59, 62, 67]], A: [45, [52, 57, 61, 64]], Em: [40, [52, 55, 59, 64]] };
const CHORDS = ["D", "Bm", "G", "A", "D", "Bm", "G", "D", "G", "D", "Em", "A", "G", "D", "A", "D"];
const MOOD = {
  morning: { bpm: 76, lift: 0, mel: 1, bright: 0.3, pad: 0.8 },
  golden: { bpm: 70, lift: 0, mel: 0.95, bright: 0.2, pad: 1 },
  night: { bpm: 60, lift: -12, mel: 0.8, bright: 0.08, pad: 1.2 },
};
const LEVEL = 0.95; // quiet under the game's own sounds, still heard on a phone speaker
let wanted = false, playing = false, mood = MOOD.golden, step = 0, nextAt = 0, timer = null, haltTimer = null, armed = false;

function pluck(midi, t, vol, long) {
  const f = hz(midi + mood.lift);
  voice(musicBus, "sine", f, [], long ? 1.5 : 1.1, vol, t, 0.006);
  voice(musicBus, "sine", f * 3, [], 0.28, vol * mood.bright, t, 0.004);
  voice(musicBus, "triangle", f * 2, [], 0.5, vol * 0.18, t, 0.004);
}
function string(midi, t, vol) {
  const b = ac.createBiquadFilter();
  b.type = "lowpass"; b.frequency.setValueAtTime(1800, t); b.frequency.exponentialRampToValueAtTime(500, t + 0.5); b.connect(musicBus);
  voice(b, "triangle", hz(midi), [], 0.7, vol, t, 0.005);
}
function pad(notes, t, dur, vol) {
  for (const n of notes) for (const detune of [-4, 5]) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = hz(n); o.detune.value = detune;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.35); g.gain.linearRampToValueAtTime(0, t + dur * 1.15);
    o.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur * 1.2);
  }
}
function schedule() {
  if (!playing || !ac) return;
  const eighth = 60 / mood.bpm / 2;
  while (nextAt < ac.currentTime + 0.5) {
    const barNo = Math.floor(step / 8) % 16, i = step % 8, [bass, tones] = CH[CHORDS[barNo]], t = nextAt + (i % 2 ? eighth * 0.06 : 0);
    if (i === 0) { pad(tones, t, eighth * 8, 0.012 * mood.pad); string(bass + 12, t, 0.05); }
    const m = MELODY[barNo][i];
    if (m != null) pluck(m, t, 0.075 * mood.mel * (i === 0 ? 1 : 0.85), MELODY[barNo][(i + 1) % 8] == null && MELODY[barNo][(i + 2) % 8] == null);
    /* the string answers on the off-beats, where the melody rests */
    if (i % 2 === 1 && m == null) string(tones[(i + barNo) % tones.length] + 12, t, 0.022);
    nextAt += eighth;
    step = (step + 1) % 128;
  }
}
function begin() {
  if (playing || !wanted || !ctx()) return;
  if (ac.state !== "running") {
    /* browsers start sound only after a touch: wait for the first one */
    if (!armed) { armed = true; const go = () => { armed = false; removeEventListener("pointerdown", go); if (ctx() && ac.state !== "running") ac.resume().then(begin, () => {}); else begin(); }; addEventListener("pointerdown", go); }
    return;
  }
  playing = true;
  nextAt = ac.currentTime + 0.25;
  musicBus.gain.cancelScheduledValues(ac.currentTime);
  musicBus.gain.setValueAtTime(musicBus.gain.value, ac.currentTime);
  musicBus.gain.linearRampToValueAtTime(LEVEL, ac.currentTime + 1.5);
  schedule();
  timer = setInterval(schedule, 120);
}
/* start the music (or keep it going) in the colour of the time of day */
export function startMusic(time = "golden") {
  mood = MOOD[time] || MOOD.golden;
  wanted = true;
  clearTimeout(haltTimer); haltTimer = null;
  if (playing && ac) {
    musicBus.gain.cancelScheduledValues(ac.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ac.currentTime);
    musicBus.gain.linearRampToValueAtTime(LEVEL, ac.currentTime + 0.8);
    return;
  }
  begin();
}
/* fade out, then stop scheduling; `keep` = stop only for now (the page went to the background) */
function fadeOut(keep) {
  if (!playing || !ac) return;
  musicBus.gain.cancelScheduledValues(ac.currentTime);
  musicBus.gain.setValueAtTime(musicBus.gain.value, ac.currentTime);
  musicBus.gain.linearRampToValueAtTime(0, ac.currentTime + 0.6);
  clearTimeout(haltTimer);
  haltTimer = setTimeout(() => { if (wanted && !keep) return; playing = false; clearInterval(timer); timer = null; }, 700);
}
/* fade the music out and stop; a start that comes straight after keeps it playing */
export function stopMusic() { wanted = false; fadeOut(false); }
export const musicState = () => ({ wanted, playing, step, bpm: mood.bpm });
/* the two buses, for measuring levels in the dev tools */
export const ambientNodes = () => (ctx() ? { bus, musicBus } : null);
/* the game made a fresh sound context: if the music is wanted, it begins again on the new one */
if (typeof addEventListener === "function") addEventListener("longcat-audio", () => { ctx(); if (wanted) begin(); });
/* no music while the page is in the background */
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => {
  if (document.hidden) fadeOut(true); else if (wanted) { clearTimeout(haltTimer); if (playing) startMusic(Object.keys(MOOD).find((k) => MOOD[k] === mood)); else begin(); }
});
