/* Microphone input: getUserMedia -> analyser -> YIN, read once per animation frame, at the microphone's own
   sample rate (as the old Vocal Gym drill did). Audio never leaves the device: frames are turned into numbers
   here and the stream is never recorded. */
import { yin } from "./pitch.js";
import { audioContext } from "./synth.js";

let stream = null, analyser = null, buf = null, granted = false;

export const micReady = () => !!analyser;
/* true once the singer has allowed the microphone in this visit, so opening it again asks nothing */
export const micGranted = () => granted;

/* Play-test, 2026-11-14: "the output volume on my phone is still pretty low". While a page holds the
   microphone, an iPhone treats it like a call and plays everything quietly, whatever the volume buttons say.
   The game used to open the microphone at the first take and never close it, so after that every sound was
   quiet. Now the microphone is open only from the count-in to the end of singing (take-screen.js), and
   where the browser lets a page say so, the phone is told that the rest is plain playback. */
function audioSession(type) {
  try { if (navigator.audioSession) navigator.audioSession.type = type; } catch { /* not supported: fine */ }
}

export async function openMic() {
  if (analyser) return true;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  audioSession("play-and-record");
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  } catch {
    audioSession("playback");
    return false;
  }
  granted = true;
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
  if (stream || analyser) audioSession("playback");
  stream = null;
  analyser = null;
}

/* The pitch right now: { midi, conf, rms } or null. */
export function readMic() {
  if (!analyser) return null;
  analyser.getFloatTimeDomainData(buf);
  return yin(buf, audioContext().sampleRate);
}
