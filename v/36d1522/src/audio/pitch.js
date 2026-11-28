/* YIN pitch detection: the old Vocal Gym tracker (src/vocal_gym/static/yin.js on main of the vocal_gym repository), ported as it is
   (the designer, 2026-11-13: "I've tweaked how the drill responded and the accuracy to a good spot; reuse it").

   Same constants and the same frame body: difference function, cumulative mean normalised difference, first dip
   below 0.15 (else the global minimum if it is under 0.5), parabolic refinement, 70–1000 Hz. It runs at the
   microphone's own sample rate on the newest 32 ms window, with only a near-silence gate, so quiet or breathy
   singing still gives a pitch.

   yin() returns { midi, conf, rms } or null for silence / unpitched frames. Pure: browser and Node tests. */

export const FMIN = 70.0;
export const FMAX = 1000.0;
export const YIN_THRESHOLD = 0.15;
export const WINDOW_SECONDS = 0.032;
const SILENCE_RMS = 1e-4;

export const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const hzToMidi = (f) => 69 + 12 * Math.log2(f / 440);

const NOTE_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
export const noteName = (m) => {
  const r = Math.round(m);
  return NOTE_NAMES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1);
};

/* How many samples one reading needs at this rate. */
export const samplesNeeded = (sr) => Math.round(WINDOW_SECONDS * sr) + Math.floor(sr / FMIN);

/* samples: Float32Array at sampleRate sr; the newest samplesNeeded(sr) samples are read. */
export function yin(samples, sr) {
  const window = Math.round(WINDOW_SECONDS * sr);
  const tauMin = Math.max(2, Math.floor(sr / FMAX));
  const tauMax = Math.floor(sr / FMIN);
  if (samples.length < window + tauMax) return null;
  const offset = samples.length - (window + tauMax);

  let energy = 0;
  for (let i = offset; i < offset + window; i++) energy += samples[i] * samples[i];
  const rms = Math.sqrt(energy / window);
  if (rms < SILENCE_RMS) return null;

  const d = new Float64Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let j = offset; j < offset + window; j++) {
      const diff = samples[j] - samples[j + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }

  const cmndf = new Float64Array(tauMax + 1);
  cmndf[0] = 1.0;
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau];
    cmndf[tau] = running > 1e-12 ? (d[tau] * tau) / running : 1.0;
  }

  let tau = -1;
  for (let t = tauMin; t < tauMax; t++) {
    if (cmndf[t] < YIN_THRESHOLD) {
      while (t + 1 < tauMax && cmndf[t + 1] < cmndf[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) {
    let best = tauMin;
    for (let t = tauMin; t < tauMax; t++) if (cmndf[t] < cmndf[best]) best = t;
    if (cmndf[best] >= 0.5) return null;
    tau = best;
  }

  let refined = tau;
  if (tau > 0 && tau < tauMax) {
    const left = cmndf[tau - 1], mid = cmndf[tau], right = cmndf[tau + 1];
    const denominator = 2.0 * (left - 2.0 * mid + right);
    if (Math.abs(denominator) > 1e-12) refined = tau + (left - right) / denominator;
  }

  const hz = sr / refined;
  if (hz < FMIN || hz > FMAX) return null;
  return { midi: hzToMidi(hz), conf: Math.max(0, 1.0 - cmndf[tau]), rms };
}
