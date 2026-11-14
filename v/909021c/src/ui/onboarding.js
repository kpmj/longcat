/* First run (game-flow board, section 3): the title, a page that says what the microphone is for before the
   phone asks, your range (decision 1: lowest note, then highest), the onsen's letter, then the first garment,
   which is also the tutorial. */
import { app, show, sheet, closeSheet, esc, $, readVoice, prepareVoice, touchVoice } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, letterSvg, judgeBustSvg } from "../art/index.js";
import { createHold, feedHold, rangeFrom, HOLD_SECONDS } from "../drill/range.js";
import { audioContext, chime, now } from "../audio/synth.js";
import { noteName } from "../audio/pitch.js";
import { ZONES, placeById } from "../content.js";

function welcome(root) {
  const S = app.S;
  const waiting = ZONES.map((z) => St.garmentSpec(S, "onsen", "morning", z.id));
  root.innerHTML = `
    <div class="scene-wrap">${sceneSvg({ place: "onsen", time: "morning", garments: waiting, baskets: [], cushion: null, animate: true, seed: 1 })}</div>
    <section class="intro">
      <h1>Longcat &amp; the Judge</h1>
      <p>Sing a little. A cat grows around the capybara. No scores, and wrong notes count too.</p>
      <button class="btn primary big" data-a="start">Start</button>
    </section>`;
  $("[data-a=start]", root).onclick = () => { audioContext(); show("onboard", { step: "mic" }); };
}

/* Before the phone's own question: what the judge listens for and what it never keeps. */
function micStep(root) {
  root.innerHTML = `
    <section class="range mic-intro">
      <div class="bust">${judgeBustSvg({ face: "head-tilt", place: "onsen", time: "morning", garments: [], animate: true })}</div>
      <h2>The judge needs to hear you</h2>
      <ul class="dots-list"><li>It listens for pitch: how high or low you sing.</li><li>Nothing is recorded.</li><li>Nothing leaves this phone.</li></ul>
      <button class="btn primary big" data-a="allow">Allow the microphone</button>
      <p class="muted small">Your phone will ask next. Tap “Allow”.</p>
    </section>`;
  $("[data-a=allow]", root).onclick = async () => {
    audioContext();
    const ok = await prepareVoice();
    if (ok) return show("range", { from: "onboard" });
    micBlocked(() => show("onboard", { step: "mic" }), () => show("onboard", { step: "letter" }), "Skip for now");
  };
}

/* The microphone was refused: say how to fix it, not why. */
export function micBlocked(retry, away, awayLabel = "Home") {
  const el = sheet(`<h3>Singing needs the microphone</h3><p class="muted">This page isn’t allowed to use it yet. Nothing is recorded and nothing leaves this phone.</p>
    <ol class="fix"><li>Tap the <b>ᴀA</b> or lock icon in the address bar.</li><li>Set <b>Microphone</b> to <b>Allow</b>.</li><li>Come back and tap “Try again”.</li></ol>
    <div class="row"><button class="btn primary" data-a="retry">Try again</button><button class="btn" data-a="away">${esc(awayLabel)}</button></div>
    ${app.S.dev.panel ? `<button class="btn ghost" data-a="touch">Use the touch voice (testing)</button>` : ""}`, { dismissable: false });
  el.querySelector("[data-a=retry]").onclick = () => { closeSheet(true); retry(); };
  el.querySelector("[data-a=away]").onclick = () => { closeSheet(true); away(); };
  const t = el.querySelector("[data-a=touch]");
  if (t) t.onclick = () => { app.S.dev.voice = "touch"; app.save(); closeSheet(true); retry(); };
}

function letterStep(root) {
  const p = placeById("onsen");
  root.innerHTML = `
    <section class="intro letter-intro">
      <div class="letter">${letterSvg({ place: "onsen", special: false })}</div>
      <p class="eyebrow">A letter</p>
      ${p.letter.map((l) => `<p class="letter-line">${esc(l)}</p>`).join("")}
      <p class="muted">On the 1st of every month a letter invites the judge to sit somewhere new.</p>
      <button class="btn primary big" data-a="go">Go and sit there</button>
    </section>`;
  $("[data-a=go]", root).onclick = () => {
    St.readLetter(app.S, "onsen");
    app.S.onboarded = true;
    app.save();
    show("home");
  };
}

function render(root, { step = "welcome" } = {}) {
  if (step === "letter") return letterStep(root);
  if (step === "mic") return micStep(root);
  welcome(root);
}
app.screens.onboard = { render, fullscreen: true };

/* ---------- the range finder ---------- */
let RF = null;
const SIM = { low: 47.3, high: 66.2 }; // what the automatic test voices "sing"

function rangeRender(root, { from = "onboard" } = {}) {
  RF = { from, phase: "low", hold: createHold(), lowHold: null, raf: 0, t0: now(), last: now(), wait: 0, phaseAt: 0 };
  root.innerHTML = `
    <section class="range">
      <p class="eyebrow" id="rf-step">Your range · lowest ● → highest ○</p>
      <h2 id="rf-title">Sing your lowest comfortable note</h2>
      <p class="muted" id="rf-hint">On “ah”, hold it for two seconds. No need to be loud.</p>
      <div class="ring" id="rf-pad">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="84" class="ring-bg"/><circle cx="100" cy="100" r="84" class="ring-fg" id="rf-ring" transform="rotate(-90 100 100)" stroke-dasharray="0 600"/></svg>
        <div class="ring-note"><b id="rf-note">–</b><span id="rf-sub">sing when ready</span></div>
      </div>
      <p class="muted small">Your voice becomes pitch numbers on this device. Nothing is recorded and nothing leaves it.</p>
      <div class="row"><button class="btn ghost" data-a="skip">${from === "onboard" ? "Skip for now, use the default" : "Cancel"}</button></div>
    </section>`;
  $("[data-a=skip]", root).onclick = () => { stopRange(); from === "onboard" ? show("onboard", { step: "letter" }) : show("settings"); };
  const pad = $("#rf-pad", root);
  pad.addEventListener("pointerdown", (e) => { if (app.S.dev.voice !== "touch") return; touchVoice.down = true; touchVoice.midi = RF.phase === "low" ? 47 : 66; pad.setPointerCapture(e.pointerId); });
  pad.addEventListener("pointerup", () => { touchVoice.down = false; });
  prepareVoice().then((ok) => {
    if (!RF) return;
    if (!ok) {
      $("#rf-hint").textContent = "This needs the microphone. Allow it, or skip and measure later in Settings.";
      micBlocked(() => show("range", { from }), () => { stopRange(); from === "onboard" ? show("onboard", { step: "letter" }) : show("settings"); }, from === "onboard" ? "Skip for now" : "Settings");
      return;
    }
    RF.last = now();
    tick();
  });
}

function simVoice(t) {
  const v = app.S.dev.voice;
  if (["god", "tufty", "human", "slide", "half"].includes(v)) return { midi: SIM[RF.phase] + Math.sin(t * 7) * 0.08, conf: 0.95 };
  /* a voice that keeps slipping between the note and the semitone above: must still land the hold */
  if (v === "wobbly") return { midi: SIM[RF.phase] + (Math.sin(t * 5) > 0.2 ? 1 : 0) + Math.sin(t * 23) * 0.15, conf: 0.9 };
  return readVoice(t, null, null);
}

function tick() {
  if (!RF) return;
  const t = now();
  rangeFrame(Math.max(0, Math.min(0.1, t - RF.last)));
  RF && (RF.last = t);
  if (RF && RF.phase !== "done") RF.raf = requestAnimationFrame(tick);
}

export function rangeFrame(dt) {
  if (!RF || RF.phase === "done") return;
  RF.clock = (RF.clock || 0) + dt;
  /* fifteen seconds without catching a note: skipping becomes the main button */
  if (RF.clock - RF.phaseAt > 15 && !RF.hold.caught) document.querySelector("[data-a=skip]")?.classList.replace("ghost", "primary");
  if (RF.wait > 0) { RF.wait -= dt; if (RF.wait <= 0) nextPhase(); return; }
  const f = simVoice(RF.clock);
  feedHold(RF.hold, f, RF.clock);
  const note = document.getElementById("rf-note"), sub = document.getElementById("rf-sub"), ring = document.getElementById("rf-ring");
  if (note) note.textContent = f && f.conf >= 0.5 ? noteName(f.midi) : "–";
  const p = Math.min(1, RF.hold.held / HOLD_SECONDS);
  if (ring) ring.setAttribute("stroke-dasharray", `${(2 * Math.PI * 84 * p).toFixed(1)} 600`);
  if (sub) sub.textContent = RF.hold.caught ? "got it" : f && f.conf >= 0.5 ? `${RF.hold.held.toFixed(1)} s, keep holding` : "sing when ready";
  if (RF.hold.caught) { chime([523, 659]); RF.wait = 0.8; }
}

function nextPhase() {
  if (RF.phase === "low") {
    RF.lowHold = RF.hold.caught;
    RF.phase = "high";
    RF.hold = createHold();
    RF.phaseAt = RF.clock;
    document.querySelector("[data-a=skip]")?.classList.replace("primary", "ghost");
    document.getElementById("rf-step").textContent = "Your range · lowest ✓ → highest ●";
    document.getElementById("rf-title").textContent = "Now your highest note, without straining";
    document.getElementById("rf-hint").textContent = "“ah” again, two seconds. Don’t push.";
    document.getElementById("rf-ring").setAttribute("stroke-dasharray", "0 600");
    return;
  }
  const range = rangeFrom(RF.lowHold, RF.hold.caught);
  const S = app.S;
  S.settings.range = range;
  S.settings.nudge = 0;
  app.save();
  const from = RF.from;
  stopRange();
  RF = { phase: "done" };
  chime([523, 659, 784, 1046]);
  const root = document.getElementById("screen");
  /* the range on a bar from C2 to C6 */
  const pos = (m) => Math.max(0, Math.min(100, ((m - 36) / 48) * 100)).toFixed(1);
  root.innerHTML = `
    <section class="range">
      <p class="eyebrow">Your range · lowest ✓ → highest ✓</p>
      <h2>Got it</h2>
      <div class="rangebar" role="img" aria-label="${noteName(range.low)} to ${noteName(range.high)}"><i style="left:${pos(range.low)}%;right:${(100 - pos(range.high)).toFixed(1)}%"></i><b style="left:${pos(range.low)}%">${noteName(range.low)}</b><b class="hi" style="left:${pos(range.high)}%">${noteName(range.high)}</b></div>
      <p>Every drill will sit inside this, a little away from the edges.</p>
      <p class="muted small">Change it any time in Settings.</p>
      <button class="btn primary big" data-a="ok">OK</button>
      <button class="btn ghost" data-a="again">Measure again</button>
    </section>`;
  root.querySelector("[data-a=ok]").onclick = () => (from === "onboard" ? show("onboard", { step: "letter" }) : show("settings"));
  root.querySelector("[data-a=again]").onclick = () => show("range", { from });
}

function stopRange() {
  if (RF?.raf) cancelAnimationFrame(RF.raf);
  touchVoice.down = false;
  RF = null;
}

app.screens.range = { render: rangeRender, fullscreen: true, leave: () => { if (RF && RF.phase !== "done") stopRange(); } };
