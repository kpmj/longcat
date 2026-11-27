/* The home page's own sounds (the designer, 2026-11-14): a small sound for each thing that can be tapped in the scene, and a
   quiet piece of music that loops while the home page is open (four tunes to choose from, see below). Everything is made in the browser from oscillators
   and noise; there are no audio files. It never plays during a take: the microphone would hear it.
   Its sounds go to their own two buses and a limiter of their own, at a low level, so the game's limiter and the log
   of "sounds the game made itself" (synth.js) are left alone. */
import { audioContext } from "./synth.js";
import { loadFile } from "./files.js";

let ac = null, bus = null, musicBus = null, noiseBuf = null;
function ctx() {
  const c = audioContext();
  if (!c) return null;
  if (c !== ac) {
    /* a new context (synth.js makes one when the phone's sound got stuck): nothing of the old one can play on it,
       so the music starts over from "not playing" */
    if (ac) {
      /* the old context is closed a moment later (synth.js): close the music's bus over whatever is still sounding
         on it, so a swap is a short fade and not a cut */
      try { const t = ac.currentTime, g = musicBus.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + 0.4); } catch { /* already closed */ }
      playing = false; clearInterval(timer); timer = null; clearTimeout(haltTimer); haltTimer = null; armed = false;
      loopSrc = null; loopWait = false; // the loop of a file tune lived on the old context
    }
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
  /* ----- the jungle (2026-11-23) ----- */
  /* three birds, each with a very short tune of its own: do mi so do; so mi so re do; mi so mi so do */
  "bird-1"(t) { whistle([84, 88, 91, 96], t, 0.12); },
  "bird-2"(t) { whistle([91, 88, 91, 86, 84], t, 0.11); },
  "bird-3"(t) { whistle([88, 91, 88, 91, 96], t, 0.1); },
  /* a monkey: oo, oo, ah, ah (two round calls, then two open ones, each a little higher) */
  monkey(t) {
    [[420, 520, 800], [440, 560, 850], [520, 700, 1500], [540, 760, 1600]].forEach(([f0, f1, mouth], i) => {
      const b = ac.createBiquadFilter(), at = t + i * 0.15;
      b.type = "bandpass"; b.frequency.value = mouth; b.Q.value = 2.2; b.connect(bus);
      voice(b, "sawtooth", f0, [[0.07, f1], [0.12, f0 * 0.95]], 0.13, 0.2, at, 0.012);
      voice(bus, "sine", f0, [[0.07, f1]], 0.11, 0.04, at, 0.012);
    });
  },
  /* the acorn on the judge's head: a wooden knock that bounces twice more, each smaller */
  acorn(t) {
    [0, 0.11, 0.19].forEach((d, i) => {
      voice(bus, "sine", 980 - i * 60, [[0.04, 520]], 0.07, 0.16 / (i + 1), t + d, 0.002);
      voice(bus, "triangle", 330, [[0.05, 250]], 0.06, 0.07 / (i + 1), t + d, 0.002);
    });
  },
  /* the heart in its paw: two soft notes, like a beat */
  heart(t) { bar(bus, 659, 0.25, 0.07, t); bar(bus, 880, 0.4, 0.07, t + 0.12); },
  /* a cat in the jungle meows differently ("they meow differently than other location"): not the short "mrrp" and
     purr of the other places but one long "mrrrow" that rolls at the start, rises and falls, like a very small wild
     cat. A sound for one place is named kind@place. */
  "cat@jungle"(t) {
    const k = 2 ** ((Math.random() * 4 - 2) / 12), b = ac.createBiquadFilter(), g = ac.createGain();
    const line = [[0.16, 640 * k], [0.34, 600 * k], [0.52, 300 * k]];
    b.type = "bandpass"; b.Q.value = 1.4;
    b.frequency.setValueAtTime(900 * k, t); b.frequency.exponentialRampToValueAtTime(2000 * k, t + 0.18); b.frequency.exponentialRampToValueAtTime(1100 * k, t + 0.5);
    b.connect(g); g.connect(bus); g.gain.value = 0.8;
    voice(b, "sawtooth", 330 * k, line, 0.56, 0.2, t, 0.03);
    voice(bus, "sine", 330 * k, line, 0.5, 0.045, t, 0.03);
    const lfo = ac.createOscillator(), depth = ac.createGain();
    lfo.frequency.value = 28; depth.gain.setValueAtTime(0.45, t); depth.gain.linearRampToValueAtTime(0.0001, t + 0.2);
    lfo.connect(depth); depth.connect(g.gain);
    lfo.start(t); lfo.stop(t + 0.6);
  },
};
/* a bird's whistle: each note slides up into its pitch, with a faint octave above it */
function whistle(notes, t, step) {
  notes.forEach((m, i) => {
    const f = hz(m), at = t + i * step;
    voice(bus, "sine", f * 0.86, [[0.035, f], [step * 0.8, f * 1.02]], step * 1.15, 0.085, at, 0.006);
    voice(bus, "sine", f * 2, [], step * 0.5, 0.012, at, 0.004);
  });
}
/* play the sound of a tap; unknown kinds make no sound. `place`: where the picture is, for a thing that sounds
   different at one place (kind@place above) */
export function tapSound(kind, place = null) {
  const play = (place && TAP[`${kind}@${place}`]) || TAP[kind];
  if (!play || !ctx() || ac.state !== "running") return;
  play(ac.currentTime + 0.005);
}

/* ---------- the home page's music ----------
   Four tunes to compare (the designer, 2026-11-14: "generate 3 more bgm so I can compare them"); the Dev panel's "Home
   music" picks one (S.dev.homeMusic), "box" is the first one and the default. Each is sixteen bars, written as
   numbers so it can be changed here, made from oscillators and noise, and each has three moods: morning a little
   quicker and brighter, night slower, an octave lower and softer.

   A tune is { name, bpm (at golden hour), per (steps to a bar), step(bar, i, t, unit) }: `step` books whatever
   sounds at step i of that bar, t on the sound clock, unit = the length of one step in seconds. */
const _ = null;
const MOOD = {
  morning: { speed: 1.085, lift: 0, mel: 1, bright: 0.3, pad: 0.8 },
  golden: { speed: 1, lift: 0, mel: 0.95, bright: 0.2, pad: 1 },
  night: { speed: 0.857, lift: -12, mel: 0.8, bright: 0.08, pad: 1.2 },
};
const LEVEL = 0.95; // quiet under the game's own sounds, still heard on a phone speaker
let mood = MOOD.golden;

/* --- instruments --- */
/* a music-box bar */
function pluck(midi, t, vol, long) {
  const f = hz(midi + mood.lift);
  voice(musicBus, "sine", f, [], long ? 1.5 : 1.1, vol, t, 0.006);
  voice(musicBus, "sine", f * 3, [], 0.28, vol * mood.bright, t, 0.004);
  voice(musicBus, "triangle", f * 2, [], 0.5, vol * 0.18, t, 0.004);
}
/* a soft plucked string, for bass notes and answers */
function string(midi, t, vol, dur = 0.7) {
  const b = ac.createBiquadFilter();
  b.type = "lowpass"; b.frequency.setValueAtTime(1800, t); b.frequency.exponentialRampToValueAtTime(500, t + 0.5); b.connect(musicBus);
  voice(b, "triangle", hz(midi), [], dur, vol, t, 0.005);
}
/* a held chord, two slightly detuned sines a note */
function pad(notes, t, dur, vol) {
  for (const n of notes) for (const detune of [-4, 5]) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = hz(n); o.detune.value = detune;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.35); g.gain.linearRampToValueAtTime(0, t + dur * 1.15);
    o.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur * 1.2);
  }
}
/* a koto string: a bright pluck that settles down onto its pitch and dies away through a closing filter */
function koto(midi, t, vol, dur = 1.3) {
  const f = hz(midi + mood.lift), b = ac.createBiquadFilter();
  b.type = "lowpass"; b.Q.value = 1.2; b.frequency.setValueAtTime(Math.min(6000, f * 7), t); b.frequency.exponentialRampToValueAtTime(Math.max(500, f * 1.6), t + 0.45); b.connect(musicBus);
  voice(b, "sawtooth", f * 1.014, [[0.06, f]], dur, vol * 0.55, t, 0.003);
  voice(musicBus, "sine", f, [], dur * 0.9, vol * 0.5, t, 0.004);
}
/* a small flute: a sine with a slow start, held for its length, with a little vibrato once it has settled */
function flute(midi, t, len, vol) {
  const f = hz(midi + mood.lift), o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain(), lfo = ac.createOscillator(), depth = ac.createGain();
  o.type = "sine"; o.frequency.value = f; o2.type = "triangle"; o2.frequency.value = f * 2;
  lfo.frequency.value = 4.6; depth.gain.setValueAtTime(0, t); depth.gain.linearRampToValueAtTime(f * 0.004, t + Math.min(0.5, len * 0.6));
  lfo.connect(depth); depth.connect(o.frequency);
  const rel = Math.min(0.25, len * 0.3), hold = Math.max(0.08, len - rel);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.07); g.gain.setValueAtTime(vol, t + hold); g.gain.linearRampToValueAtTime(0, t + len + 0.12);
  g2.gain.value = 0.1 + mood.bright * 0.25;
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(musicBus);
  for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + len + 0.2); }
}
/* a kalimba tine: a round note with a short high ping on top */
function tine(midi, t, vol, dur = 0.9) {
  const f = hz(midi + mood.lift);
  voice(musicBus, "sine", f, [], dur, vol, t, 0.004);
  voice(musicBus, "sine", f * 2, [], dur * 0.4, vol * 0.2, t, 0.003);
  voice(musicBus, "sine", f * 5.4, [], 0.06, vol * (0.1 + mood.bright * 0.3), t, 0.002);
}
const shaker = (t, vol) => hiss(musicBus, "highpass", 6500, 0.7, 0.06, vol, t);

/* --- A: the music box (the first tune) ---
   In D, in the five-note scale of the place (D E F# A B, no half steps), at walking pace: a music-box melody, a
   plucked string answering between its notes, a soft pad holding each bar's chord. */
const BOX_MELODY = [
  [74, _, 71, _, 69, _, 71, _], [74, _, _, 71, 69, _, _, _], [66, _, 69, _, 71, _, 74, _], [76, _, _, 74, 71, _, 69, _],
  [74, _, 76, _, 78, _, 76, _], [74, _, _, 71, _, 69, _, _], [66, _, 71, _, 69, _, 64, _], [62, _, 69, _, 74, _, _, _],
  [71, _, 74, _, 71, _, 66, _], [69, _, _, 66, _, 62, _, _], [64, _, 66, _, 71, _, 76, _], [76, _, _, 71, 69, _, _, _],
  [78, _, 76, _, 74, _, 71, _], [74, _, _, 69, _, 71, _, _], [66, _, 69, _, 71, _, 69, _], [74, _, _, _, 62, _, _, _],
];
/* each bar's chord: bass note, then the notes the pad holds */
const BOX_CH = { D: [38, [50, 57, 62, 66]], Bm: [35, [47, 54, 59, 62]], G: [43, [55, 59, 62, 67]], A: [45, [52, 57, 61, 64]], Em: [40, [52, 55, 59, 64]] };
const BOX_CHORDS = ["D", "Bm", "G", "A", "D", "Bm", "G", "D", "G", "D", "Em", "A", "G", "D", "A", "D"];
function boxStep(bar, i, t0, unit) {
  const [bass, tones] = BOX_CH[BOX_CHORDS[bar]], t = t0 + (i % 2 ? unit * 0.06 : 0);
  if (i === 0) { pad(tones, t, unit * 8, 0.012 * mood.pad); string(bass + 12, t, 0.05); }
  const m = BOX_MELODY[bar][i];
  if (m != null) pluck(m, t, 0.075 * mood.mel * (i === 0 ? 1 : 0.85), BOX_MELODY[bar][(i + 1) % 8] == null && BOX_MELODY[bar][(i + 2) % 8] == null);
  /* the string answers on the off-beats, where the melody rests */
  if (i % 2 === 1 && m == null) string(tones[(i + bar) % tones.length] + 12, t, 0.022);
}

/* --- B: the koto ---
   In D again, in the "yo" scale (D E G A B), slower and with more air: one plucked line, open fifths under it
   instead of full chords, a low string on the first and third beat, and a small sweep up the strings to open
   each four-bar line. */
const KOTO_MELODY = [
  [74, _, _, 71, 69, _, 71, _], [74, _, 76, _, 74, _, _, _], [79, _, _, 76, 74, _, 71, _], [69, _, _, _, _, _, 62, 64],
  [67, _, _, 64, 62, _, 64, _], [69, _, 71, _, 69, _, _, _], [67, _, 69, _, 71, _, 74, _], [76, _, _, _, 69, _, _, _],
  [74, _, _, 71, 69, _, 71, _], [74, _, 76, _, 79, _, _, _], [79, _, 76, _, 74, _, 71, _], [74, _, _, _, _, _, 69, 71],
  [76, _, _, 71, 76, _, 74, _], [71, _, 69, _, 67, _, _, _], [69, _, 71, _, 69, _, 64, _], [62, _, _, _, _, _, _, _],
];
const KOTO_CH = { D: [50, [50, 57, 64]], G: [43, [55, 62, 67]], E: [52, [52, 59, 64]], A: [45, [57, 64, 69]] };
const KOTO_CHORDS = ["D", "D", "G", "D", "E", "D", "G", "A", "D", "D", "G", "D", "E", "G", "A", "D"];
function kotoStep(bar, i, t, unit) {
  const [bass, tones] = KOTO_CH[KOTO_CHORDS[bar]];
  if (i === 0) {
    pad(tones, t, unit * 8, 0.008 * mood.pad);
    koto(bass - mood.lift, t, 0.05, 1.6); // the low strings stay where they are at night
    /* the sweep: three strings just ahead of the line's first note */
    if (bar % 4 === 0) [50, 57, 62].forEach((n, k) => koto(n - mood.lift, t - unit * 0.6 + k * unit * 0.2, 0.022, 0.9));
  }
  if (i === 4) koto(bass + 7 - mood.lift, t, 0.03, 1.2);
  const m = KOTO_MELODY[bar][i];
  if (m != null) koto(m, t, 0.085 * mood.mel * (i === 0 ? 1 : 0.88), KOTO_MELODY[bar][(i + 1) % 8] == null ? 1.6 : 1);
}

/* --- C: the flute waltz ---
   In three, in G: a small flute in long notes, a low string on the first beat and two soft notes of the chord on
   the second and third. The tune keeps to G A B D E, with one C over the C chord near the end. */
const WALTZ_MELODY = [ // [note, how many steps it lasts]; six steps to a bar
  [[74, 4], _, _, _, [71, 2], _], [[69, 6], _, _, _, _, _], [[71, 4], _, _, _, [67, 2], _], [[64, 6], _, _, _, _, _],
  [[67, 2], _, [69, 2], _, [67, 2], _], [[64, 4], _, _, _, [67, 2], _], [[69, 2], _, [71, 2], _, [74, 2], _], [[69, 6], _, _, _, _, _],
  [[74, 4], _, _, _, [76, 2], _], [[79, 6], _, _, _, _, _], [[76, 4], _, _, _, [71, 2], _], [[76, 6], _, _, _, _, _],
  [[79, 2], _, [76, 2], _, [72, 2], _], [[74, 4], _, _, _, [69, 2], _], [[71, 2], _, [69, 2], _, [67, 2], _], [[67, 6], _, _, _, _, _],
];
const WALTZ_CH = { G: [43, [59, 62, 67]], Em: [40, [59, 64, 67]], C: [48, [60, 64, 67]], D: [50, [57, 62, 66]] };
const WALTZ_CHORDS = ["G", "G", "Em", "Em", "C", "C", "D", "D", "G", "G", "Em", "Em", "C", "D", "G", "G"];
function waltzStep(bar, i, t, unit) {
  const [bass, tones] = WALTZ_CH[WALTZ_CHORDS[bar]];
  if (i === 0) { pad(tones, t, unit * 6, 0.008 * mood.pad); string(bass + 12, t, 0.055, 1.1); }
  if (i === 2 || i === 4) { string(tones[0] + 12, t, 0.02, 0.5); string(tones[i === 2 ? 1 : 2] + 12, t, 0.02, 0.5); }
  const m = WALTZ_MELODY[bar][i];
  if (m != null) flute(m[0], t, unit * m[1] * 0.96, 0.04 * mood.mel); // a held note carries further than a plucked one
}

/* --- D: the kalimba ---
   In F, quicker and lighter on its feet: a thumb pattern on the notes of each bar's chord, a short tune above it
   that leans off the beat, a soft bass and a shaker. The tune keeps to F G A C D. */
const KALIMBA_MELODY = [
  [77, _, _, 74, _, 72, _, _], [74, _, _, 72, _, 69, _, _], [74, _, 77, _, _, 74, _, _], [72, _, _, _, 67, _, 69, _],
  [77, _, _, 79, _, 81, _, _], [77, _, _, 74, _, _, _, _], [74, _, 72, _, 74, _, 77, _], [79, _, _, _, _, _, 72, 74],
  [77, _, _, 74, _, 72, _, _], [74, _, _, 77, _, 74, _, _], [77, _, _, 74, _, 72, _, _], [69, _, _, _, 72, _, _, _],
  [74, _, 77, _, 74, _, _, 72], [72, _, _, 67, _, 72, _, _], [69, _, 72, _, 77, _, _, _], [65, _, _, _, _, _, _, _],
];
const KALIMBA_CH = { F: [41, [53, 57, 60]], Dm: [38, [53, 57, 62]], Bb: [46, [53, 58, 62]], C: [48, [52, 55, 60]] };
const KALIMBA_CHORDS = ["F", "Dm", "Bb", "C", "F", "Dm", "Bb", "C", "F", "Dm", "Bb", "F", "Bb", "C", "F", "F"];
const THUMB = [0, _, 1, 2, _, 1, 2, _]; // which note of the chord the thumbs play on each step
function kalimbaStep(bar, i, t0, unit) {
  const [bass, tones] = KALIMBA_CH[KALIMBA_CHORDS[bar]], t = t0 + (i % 2 ? unit * 0.1 : 0); // a little swing
  if (i === 0) { pad(tones, t, unit * 8, 0.007 * mood.pad); string(bass + 12, t, 0.05, 0.8); }
  if (i === 3) string(bass + 12, t, 0.026, 0.5);
  if (THUMB[i] != null && !(bar === 15 && i > 0)) tine(tones[THUMB[i]] + 12 - mood.lift, t, 0.03, 0.6);
  if (i % 2 === 1) shaker(t, 0.012 + mood.bright * 0.02);
  const m = KALIMBA_MELODY[bar][i];
  if (m != null) tine(m, t, 0.075 * mood.mel * (i === 0 ? 1 : 0.9), 1);
}

const TUNES = {
  box: { name: "A · Music box (the first one)", bpm: 70, per: 8, step: boxStep },
  koto: { name: "B · Koto, slow and open", bpm: 63, per: 8, step: kotoStep },
  waltz: { name: "C · Flute waltz, in three", bpm: 84, per: 6, step: waltzStep },
  kalimba: { name: "D · Kalimba, light and quick", bpm: 86, per: 8, step: kalimbaStep },
  /* A tune with `file` is not booked note by note: it is one sound file, rendered by the audio engine from sampled
     instruments (docs/audio/playbook.md), looped between the two points its manifest gives. This one is four bars
     to try the path, for the designer to hear on a phone (2026-11-26); it has one mood, whatever the time of day. */
  trial: { name: "E · Trial loop (sampled instruments, four bars)", bpm: 72, per: 8, file: "music.trial.loop" },
};
/* How loud a file tune sits on the music bus. The files are all at one loudness (-18 LUFS); the tunes made in the
   page are far below full scale. Set so the trial loop reads the same on the bus as tune A does at golden hour
   (-33 dB, measured on the bus in a desktop browser on 2026-11-26; not heard): a draft until the designer has listened. */
const FILE_LEVEL = 0.33;
export const MUSIC = Object.entries(TUNES).map(([id, t]) => ({ id, name: t.name }));
const BARS = 16;

/* --- playing it, and getting in and out of it softly ---
   The music is only ever switched by its bus: a fade-in from silence when it starts, a quick fade to silence when
   it stops. Nothing here stops a note that is sounding; the bus is simply closed over it. */
const FADE_OUT = 0.35; // seconds: fast enough that a take can wait for it, slow enough not to be a cut
let tune = TUNES.box, wanted = false, playing = false, step = 0, nextAt = 0, timer = null, haltTimer = null, armed = false, quietAt = 0, startTimer = null, fadeIn = 1.5;
let loopSrc = null, loopWait = false; // a file tune's looping source, and whether its file is on the way

/* Start a file tune's loop at `at` (once its file is here; the first time that is a moment later). */
function startLoop(at) {
  if (loopSrc || loopWait) return;
  const c = ac, want = tune;
  loopWait = true;
  loadFile(c, want.file).then((e) => {
    loopWait = false;
    if (ac !== c || !playing || tune !== want || loopSrc) return;
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = e.buf; s.loop = true; s.loopStart = e.info.loopStart; s.loopEnd = e.info.loopEnd;
    g.gain.value = FILE_LEVEL * LEVEL;
    s.connect(g); g.connect(musicBus);
    s.start(Math.max(at, c.currentTime + 0.02), e.info.loopStart);
    loopSrc = s;
  }, () => { loopWait = false; });
}
function stopLoop(at = 0) {
  if (!loopSrc) return;
  try { loopSrc.stop(at); } catch { /* already stopped */ }
  loopSrc = null;
}

const unitNow = () => 60 / (tune.bpm * mood.speed) / 2;
function schedule() {
  if (!playing || !ac) return;
  if (tune.file) return startLoop(nextAt);
  const unit = unitNow();
  while (nextAt < ac.currentTime + 0.5) {
    tune.step(Math.floor(step / tune.per) % BARS, step % tune.per, nextAt, unit);
    nextAt += unit;
    step = (step + 1) % (tune.per * BARS);
  }
}
/* open the bus over `seconds`, from wherever it is now */
function openBus(seconds) {
  const t = ac.currentTime, g = musicBus.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(LEVEL, t + Math.max(0.05, seconds));
  quietAt = 0;
}
function begin() {
  if (playing || !wanted || !ctx()) return;
  if (ac.state !== "running") {
    /* Browsers start sound only after a touch, and a context made inside a touch takes a moment to run: begin as
       soon as it does, or at the next touch, whichever comes first. (Waiting only for a touch left Home silent
       after a take until the player touched the screen again.) */
    if (!armed) {
      armed = true;
      const c = ac;
      const go = () => {
        if (!armed) return;
        if (ctx() !== c) { armed = false; removeEventListener("pointerdown", go); return begin(); }
        if (c.state !== "running") { try { c.resume().then(go, () => {}); } catch { /* not allowed yet */ } return; }
        armed = false; removeEventListener("pointerdown", go); c.removeEventListener("statechange", go);
        begin();
      };
      addEventListener("pointerdown", go);
      c.addEventListener("statechange", go);
    }
    return;
  }
  playing = true;
  nextAt = ac.currentTime + 0.25;
  openBus(fadeIn);
  schedule();
  timer = setInterval(schedule, 120);
}
/* Start the music (or keep it going) in the colour of the time of day. `delay`: seconds of silence first, so the
   page it starts on can settle; `fade`: how long it takes to come up. Coming home from a take both are longer. */
export function startMusic(time = "golden", { delay = 0, fade = 1.5 } = {}) {
  mood = MOOD[time] || MOOD.golden;
  wanted = true;
  fadeIn = fade;
  clearTimeout(haltTimer); haltTimer = null;
  clearTimeout(startTimer); startTimer = null;
  if (playing && ac) return openBus(Math.min(fade, 0.8)); // it was only fading out: bring it back
  if (delay > 0) startTimer = setTimeout(() => { startTimer = null; if (wanted) begin(); }, delay * 1000);
  else begin();
}
/* close the bus quickly, then stop booking notes; `keep` = stop only for now (the page went to the background) */
function fadeOut(keep, seconds = FADE_OUT) {
  clearTimeout(startTimer); startTimer = null;
  if (!playing || !ac) return;
  const t = ac.currentTime, g = musicBus.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  /* most of the way down along a curve (the ear hears that as even), then exactly to nothing */
  g.setTargetAtTime(0, t, seconds / 4);
  g.linearRampToValueAtTime(0, t + seconds);
  quietAt = Date.now() + seconds * 1000;
  clearTimeout(haltTimer);
  haltTimer = setTimeout(() => { if (wanted && !keep) return; playing = false; clearInterval(timer); timer = null; stopLoop(); }, seconds * 1000 + 80);
}
/* fade the music out and stop; a start that comes straight after keeps it playing */
export function stopMusic() { wanted = false; fadeOut(false); }
/* Resolves once the music can no longer be heard (at once if it is not playing). A take waits for this before it
   opens the microphone or books its first sound, so the phone's switch to call volume never lands on music. */
export function musicQuiet() {
  const ms = playing && !wanted ? Math.max(0, quietAt - Date.now()) + 40 : 0;
  return new Promise((r) => (ms > 0 ? setTimeout(r, Math.min(ms, 600)) : r()));
}
/* Which tune plays (the Dev panel). Changing it while the music is on closes the bus, starts the new tune from
   its first bar and opens the bus again. */
export function setTune(id) {
  const next = TUNES[id] || TUNES.box;
  if (next === tune) return;
  if (!playing || !ac) { tune = next; step = 0; return; }
  /* no more of the old tune is booked from now; the bus closes over what is already sounding or booked (half a
     second ahead at the most), and opens again as the new tune's first bar begins */
  const c = ac, t = c.currentTime, g = musicBus.gain;
  tune = next; step = 0;
  nextAt = t + 0.75;
  stopLoop(t + 0.3); // a file tune that was playing ends once the bus has closed over it
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.setTargetAtTime(0, t, 0.06);
  g.linearRampToValueAtTime(0, t + 0.25);
  setTimeout(() => { if (ac === c && playing && wanted) openBus(0.6); }, 620);
}
export const tuneId = () => Object.keys(TUNES).find((k) => TUNES[k] === tune);
export const musicState = () => ({ wanted, playing, step, tune: tuneId(), bpm: Math.round(tune.bpm * mood.speed) });
/* the two buses, for measuring levels in the dev tools */
export const ambientNodes = () => (ctx() ? { bus, musicBus } : null);
/* the game made a fresh sound context: if the music is wanted, it begins again on the new one */
if (typeof addEventListener === "function") addEventListener("longcat-audio", () => { ctx(); if (wanted && !startTimer) begin(); });
/* no music while the page is in the background */
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => {
  if (document.hidden) fadeOut(true, 0.6); else if (wanted) { clearTimeout(haltTimer); if (playing) openBus(0.8); else begin(); }
});
