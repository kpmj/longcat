/* Microphone input: getUserMedia -> analyser -> YIN, read once per animation frame, at the microphone's own
   sample rate (as the old Vocal Gym drill did). Audio never leaves the device: frames are turned into numbers
   here and the stream is never recorded. */
import { yin } from "./pitch.js";
import { audioContext } from "./synth.js";

let stream = null, analyser = null, buf = null;

export const micReady = () => !!analyser;

export async function openMic() {
  if (analyser) return true;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  } catch {
    return false;
  }
  const ac = audioContext();
  if (!ac) return false;
  const src = ac.createMediaStreamSource(stream);
  analyser = ac.createAnalyser();
  analyser.fftSize = 4096;
  src.connect(analyser);
  buf = new Float32Array(analyser.fftSize);
  return true;
}

export function closeMic() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
  analyser = null;
}

/* The pitch right now: { midi, conf, rms } or null. */
export function readMic() {
  if (!analyser) return null;
  analyser.getFloatTimeDomainData(buf);
  return yin(buf, audioContext().sampleRate);
}
