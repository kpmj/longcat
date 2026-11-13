/* YIN pitch detection (de Cheveigné & Kawahara 2002), written fresh for Longcat.
   Same constants as the old app's tracker: threshold 0.15, 32 ms window. Range 65–1050 Hz covers bass to soprano.
   Returns { midi, conf } or null for silence / unpitched frames. Pure: runs in the browser and in Node tests. */

export const FMIN = 65;
export const FMAX = 1050;
const THRESHOLD = 0.15;
const RMS_GATE = 0.006;

export const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const hzToMidi = (f) => 69 + 12 * Math.log2(f / 440);

const NOTE_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
export const noteName = (m) => {
  const r = Math.round(m);
  return NOTE_NAMES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1);
};

/* samples: Float32Array at sampleRate sr. Needs at least window + tauMax samples. */
export function yin(samples, sr) {
  const W = Math.round(0.032 * sr);
  const tauMin = Math.max(2, Math.floor(sr / FMAX));
  const tauMax = Math.floor(sr / FMIN);
  if (samples.length < W + tauMax + 1) return null;
  const off = samples.length - (W + tauMax + 1); // use the newest samples
  let energy = 0;
  for (let i = 0; i < W; i++) energy += samples[off + i] * samples[off + i];
  const rms = Math.sqrt(energy / W);
  if (rms < RMS_GATE) return null;

  const d = new Float64Array(tauMax + 2);
  d[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let s = 0;
    for (let j = 0; j < W; j++) {
      const diff = samples[off + j] - samples[off + j + tau];
      s += diff * diff;
    }
    running += s;
    d[tau] = running > 1e-12 ? (s * tau) / running : 1;
  }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (d[t] < THRESHOLD) {
      while (t + 1 <= tauMax && d[t + 1] < d[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) return null;
  let refined = tau;
  const a = d[tau - 1], b = d[tau], c = d[tau + 1];
  const den = 2 * (a - 2 * b + c);
  if (Math.abs(den) > 1e-12) refined = tau + (a - c) / den;
  const f = sr / refined;
  if (f < FMIN || f > FMAX) return null;
  return { midi: hzToMidi(f), conf: Math.max(0, Math.min(1, 1 - b)), rms };
}

/* Average-and-decimate to about 16 kHz so YIN stays cheap on phones. */
export function downsample(buf, sr, target = 16000, out = null) {
  const k = Math.max(1, Math.round(sr / target));
  const n = Math.floor(buf.length / k);
  const o = out && out.length === n ? out : new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < k; j++) s += buf[i * k + j];
    o[i] = s / k;
  }
  return { samples: o, sr: sr / k };
}
