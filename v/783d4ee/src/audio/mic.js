/* Microphone input: getUserMedia -> analyser -> YIN, read once per animation frame, at the microphone's own
   sample rate (as the old Vocal Gym drill did). Audio never leaves the device: frames are turned into numbers
   here and the stream is never recorded. */
import { yin } from "./pitch.js";
import { audioContext } from "./synth.js";

let stream = null, analyser = null, buf = null, granted = false;

/* How the microphone is opened (the designer, 2026-11-24: "The total volume of the singing part is still too low. Please
   make it the same as the demo."). An iPhone decides where a page's sound comes out by how the page asked for the
   microphone, and the page cannot choose the loudspeaker itself:
     speaker  echo cancelling on. The phone treats it as a call on speakerphone: sound comes from the loudspeaker
              at about its usual level, and the phone takes its own sound out of what the microphone hears. It
              also treats the voice (levels it, may cut what it thinks is noise), which the tracker has not been
              tried with.
     plain    echo cancelling off, as it was until now. The microphone is untouched, but on iOS 27 the sound moves
              to the earpiece, far quieter (WebKit bug 326286); on older systems it stayed on the loudspeaker at
              call level.
   The game's choice is "speaker"; Dev tools → Microphone switches. Reports on that bug also say sound crackles
   in this mode on iOS 27.0 and 27.0.1 and no longer on 27.2. The agent has heard neither. */
export const MIC_MODES = [
  { id: "speaker", name: "Loudspeaker (the phone filters the microphone)" },
  { id: "plain", name: "Untouched microphone (quiet on a new iPhone)" },
];
let mode = "speaker";
export const micMode = () => mode;
export function setMicMode(m) { mode = MIC_MODES.some((x) => x.id === m) ? m : "speaker"; }
/* what the browser really gave, for the take log (Dev tools → Copy last take) */
export function micInfo() {
  try { const s = stream?.getAudioTracks()[0]?.getSettings() || {}; return { mode, ec: s.echoCancellation ?? null, ns: s.noiseSuppression ?? null, agc: s.autoGainControl ?? null, rate: s.sampleRate ?? null }; }
  catch { return { mode }; }
}

export const micReady = () => !!analyser;
/* true once the singer has allowed the microphone in this visit, so opening it again asks nothing */
export const micGranted = () => granted;

/* Play-test, 2026-11-14: "the output volume on my phone is still pretty low". While a page holds the
   microphone, an iPhone treats it like a call, whatever the volume buttons say. The game used to open the
   microphone at the first take and never close it, so after that every sound was at call level. Now the
   microphone is open for a take and closed with it (take-screen.js), and where the browser lets a page say so,
   the phone is told that the rest is plain playback. */
function audioSession(type) {
  try { if (navigator.audioSession) navigator.audioSession.type = type; } catch { /* not supported: fine */ }
}

export async function openMic() {
  if (analyser) return true;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  audioSession("play-and-record");
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: mode === "speaker", noiseSuppression: false, autoGainControl: false } });
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
