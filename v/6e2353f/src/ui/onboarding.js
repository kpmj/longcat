/* First run: meet the judge, find your range (decision 1: lowest note, then highest), read the onsen's letter,
   then pick the first garment, which is also the tutorial. */
import { app, show, esc, $, readVoice, prepareVoice, touchVoice } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, letterSvg } from "../art/index.js";
import { createHold, feedHold, rangeFrom, HOLD_SECONDS } from "../drill/range.js";
import { audioContext, chime, now } from "../audio/synth.js";
import { noteName } from "../audio/pitch.js";
import { ZONES, placeById } from "../content.js";
import { rootFor } from "../drill/drills.js";

function welcome(root) {
  const S = app.S;
  const waiting = ZONES.map((z) => St.garmentSpec(S, "onsen", "morning", z.id));
  root.innerHTML = `
    <div class="scene-wrap">${sceneSvg({ place: "onsen", time: "morning", garments: waiting, baskets: [], cushion: null, animate: true, seed: 1 })}</div>
    <section class="intro">
      <h1>Longcat &amp; the Judge</h1>
      <p>A capybara judge sits by the hot spring. Three cats are its three garments: a scarf, a top and a lap blanket.</p>
      <p>Every time you finish singing, the garment it’s wearing grows one step. No scores. Wrong notes count too.</p>
      <button class="btn primary big" data-a="start">Start</button>
    </section>`;
  $("[data-a=start]", root).onclick = () => { audioContext(); show("range", { from: "onboard" }); };
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
  welcome(root);
}
app.screens.onboard = { render, fullscreen: true };

/* ---------- the range finder ---------- */
let RF = null;
const SIM = { low: 47.3, high: 66.2 }; // what the automatic test voices "sing"

function rangeRender(root, { from = "onboard" } = {}) {
  RF = { from, phase: "low", hold: createHold(), lowHold: null, raf: 0, t0: now(), last: now(), wait: 0 };
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
  root.innerHTML = `
    <section class="range">
      <p class="eyebrow">Your range · lowest ✓ → highest ✓</p>
      <h2>${noteName(range.low)} – ${noteName(range.high)}</h2>
      <p>Every drill sits inside this range. “Do–Re–Mi” starts on ${noteName(rootFor(range, 4))}.</p>
      <p class="muted small">You can measure again in Settings, or move everything up or down.</p>
      <button class="btn primary big" data-a="ok">OK</button>
    </section>`;
  root.querySelector("[data-a=ok]").onclick = () => (from === "onboard" ? show("onboard", { step: "letter" }) : show("settings"));
}

function stopRange() {
  if (RF?.raf) cancelAnimationFrame(RF.raf);
  touchVoice.down = false;
  RF = null;
}

app.screens.range = { render: rangeRender, fullscreen: true, leave: () => { if (RF && RF.phase !== "done") stopRange(); } };
