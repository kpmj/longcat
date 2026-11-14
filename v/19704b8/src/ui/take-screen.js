/* The singing screen. The phrase is hummed once while its notes stream past the playhead; four beats; then the
   player sings it unaccompanied. The pitch draws the cat: the head rides the playhead, the body trails behind as
   sung. At the end of every note the judge makes one of three faces (on the note, close, off the note), the
   note block takes that colour and a sound says the same thing. Every "?" is on the cat, never on the singer.
   Behind the lane, the note chart of the old drill: a line for every pitch in the phrase, named in the gutter.
   Notes that land in a row build a combo; the judge gets happier and the sky around it fills up (stars, music,
   a rainbow, confetti). An off note ends the run quietly; nothing is lost. */
import { app, show, sheet, closeSheet, esc, $, readVoice, prepareVoice, touchVoice } from "./app.js";
import * as St from "../state.js";
import { planTake } from "../drill/drills.js";
import { createTake, stepTake, skipDemo, currentIndex, DEMO_LEAD } from "../drill/take.js";
import { takeMood } from "../drill/grade.js";
import { laneCatSvg, judgeBustSvg, segmentSvg, faceIconSvg } from "../art/index.js";
import { hum, click, placeSfx, noteCue, chime, audioContext, now } from "../audio/synth.js";
import { comboTier, nextCombo, COMBO_TIERS } from "./combo.js";
import { TUTORIAL_FACES, NOTE_FACE, NOTE_WORD, NOTE_GLYPH, garmentName, STEPS } from "../content.js";
import { noteName } from "../audio/pitch.js";

const W = 390, H = 300, PLAY_X = 118, PXS = 92, MID_Y = 150, GUTTER = 40;
const HOP = 0.16; // the demo head leaves for the next note this long before it arrives, and lands on time
const FOLLOW = 0.03; // seconds for the head to settle on the sung pitch (time based, so phones keep up)
let R = null;

const clock = () => (audioContext() ? now() : performance.now() / 1000);

function geometry(plan) {
  const ms = plan.notes.map((n) => n.midi);
  const lo = Math.min(...ms), hi = Math.max(...ms);
  const step = Math.max(9, Math.min(18, 170 / Math.max(4, hi - lo)));
  return { mid: (lo + hi) / 2, step };
}
const yRaw = (m) => MID_Y - (m - R.geo.mid) * R.geo.step;
const yOf = (m) => Math.max(26, Math.min(H - 26, yRaw(m)));

/* The old drill's note chart: a line for every pitch the phrase uses, padded three semitones either side with
   faint semitone lines, so the singer sees which note is which and how far apart they are. */
function laneGrid(plan) {
  const targets = new Set(plan.notes.map((n) => n.midi));
  const lo = Math.min(...targets) - 3, hi = Math.max(...targets) + 3;
  let lines = "", labels = "";
  for (let m = lo; m <= hi; m++) {
    const y = yRaw(m);
    if (y < 12 || y > H - 12) continue;
    if (targets.has(m)) {
      lines += `<line class="gl-line" x1="${GUTTER}" x2="${W}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
      labels += `<text class="gl-label" id="gl-${m}" x="${GUTTER - 6}" y="${(y + 4).toFixed(1)}">${noteName(m)}</text>`;
    } else {
      lines += `<line class="gl-faint" x1="${GUTTER}" x2="${W}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }
  }
  return { lines, gutter: `<rect class="gl-gutter" width="${GUTTER}" height="${H}"/>${labels}` };
}

/* Where the head is while the phrase is demonstrated (and while the singer is silent): sitting on the current
   note, hopping to the next one just before it arrives so it lands as the note reaches the line. */
function guideY(t) {
  const N = R.plan.notes;
  const k = N.findIndex((n) => t < n.s);
  if (k === -1) return yOf(N[N.length - 1].midi);
  if (k === 0) return yOf(N[0].midi);
  const y0 = yOf(N[k - 1].midi), y1 = yOf(N[k].midi);
  const a = (t - (N[k].s - HOP)) / HOP;
  if (a <= 0) return y0;
  const u = a * a * (3 - 2 * a);
  return y0 + (y1 - y0) * u - Math.sin(Math.PI * a) * (y0 === y1 ? 6 : 10);
}

function laneNotes(plan) {
  return plan.notes.map((n, i) => {
    const x = n.s * PXS, w = Math.max(14, (n.e - n.s) * PXS - 3), y = yOf(n.midi);
    return `<g class="nb" id="nb-${i}"><rect x="${x.toFixed(1)}" y="${(y - 12).toFixed(1)}" width="${w.toFixed(1)}" height="24" rx="12"/><text x="${(x + 12).toFixed(1)}" y="${(y + 5).toFixed(1)}">${esc(plan.drill.syl)}</text></g>`;
  }).join("");
}

function render(root, { ctx, retake = false, outcome = null }) {
  const S = app.S;
  if (!ctx) return show("home");
  audioContext(); // inside the tap that opened this screen, so the browser lets sound start
  const plan = planTake({ step: ctx.step, time: ctx.time, range: S.settings.range, nudge: S.settings.nudge, seed: ctx.seed });
  const g = St.garmentSpec(S, ctx.place, ctx.time, ctx.zone);
  R = { ctx, retake, outcome, plan, T: createTake(plan), geo: null, g, raf: 0, last: 0, nodes: [], face: "neutral", faceUntil: 0, mood: "listen", moodUntil: 0, headY: MID_Y, marks: [], silentFor: 0, started: false, flash: null, gridOn: null, tier: 0 };
  R.geo = geometry(plan);
  R.headY = yOf(plan.notes[0].midi);
  const grid = laneGrid(plan);
  R.wearing = ["scarf", "top", "bottom"].map((z) => St.garmentSpec(S, ctx.place, ctx.time, z));
  const name = garmentName(ctx.time, ctx.zone);
  root.innerHTML = `
    <header class="take-head">
      <button class="icon-btn" data-act="close" aria-label="Leave. This take won’t count.">✕</button>
      <div><b>${esc(name)} · step ${ctx.step}${retake ? " · again" : ""}</b><span>${esc(plan.drill.name)} · sing “${esc(plan.drill.syl)}” · starts on ${noteName(plan.notes[0].midi)}</span></div>
    </header>
    <div class="lane-wrap">
      <svg class="lane" id="lane" viewBox="0 0 ${W} ${H}" aria-label="Lane">
        <rect width="${W}" height="${H}" class="lane-bg"/>
        <g id="lane-grid">${grid.lines}</g>
        <g id="lane-notes">${laneNotes(plan)}</g>
        <line x1="${PLAY_X}" y1="14" x2="${PLAY_X}" y2="${H - 14}" class="playhead"/>
        <g id="lane-cat"></g>
        <g id="lane-gutter">${grid.gutter}</g>
      </svg>
      <div class="countdown" id="countdown" aria-live="polite"></div>
      <div class="hint"><b id="hint-big">Listen first</b><span id="hint-small"></span></div>
    </div>
    <div class="judge-wrap" id="judge-wrap">
      <div class="judge-art" id="judge"></div>
      <div class="fx" id="fx" aria-hidden="true"></div>
      <div class="combo-chip" id="combo" hidden></div>
    </div>
    <div class="take-foot"><button class="btn ghost" data-act="skip">Skip the demo</button></div>`;
  $("[data-act=close]", root).onclick = () => { stop(); show("home"); };
  $("[data-act=skip]", root).onclick = () => { if (R.T.phase === "demo") { stopNodes(); skipDemo(R.T); onCount(); } };
  wireTouch(root);
  R.tier = comboTier(app.combo || 0);
  paintJudge();
  showCombo(app.combo || 0, false);
  start();
}

/* LATER (decision 5, fix 4 of the list): the judge humming along under the singer is not built; the
   take stays "hear it once, then sing unaccompanied". See docs/later.md. */
async function start() {
  const ok = await prepareVoice();
  if (!R) return;
  if (!ok) return micProblem();
  R.started = true;
  const t0 = clock() + DEMO_LEAD;
  R.plan.notes.forEach((n) => R.nodes.push(hum(t0 + n.s, n.midi, n.e - n.s)));
  R.last = clock();
  loop();
}

function micProblem() {
  const el = sheet(`<h3>Singing needs the microphone</h3>
    <p class="muted">Your voice becomes pitch numbers on this device. Nothing is recorded and nothing leaves it. Allow the microphone, or use the touch voice for testing.</p>
    <div class="row"><button class="btn primary" data-a="retry">Try again</button><button class="btn" data-a="touch">Use touch voice</button></div>
    <button class="btn ghost" data-a="home">Home</button>`, { dismissable: false });
  el.querySelector("[data-a=retry]").onclick = () => { closeSheet(true); show("take", app.props); };
  el.querySelector("[data-a=touch]").onclick = () => { app.S.dev.voice = "touch"; app.save(); closeSheet(true); show("take", app.props); };
  el.querySelector("[data-a=home]").onclick = () => { closeSheet(true); show("home"); };
}

function stopNodes() { R.nodes.forEach((n) => n && n.stop && n.stop()); R.nodes = []; }
function stop() {
  if (!R) return;
  cancelAnimationFrame(R.raf);
  stopNodes();
  R = null;
}

function onCount() {
  const b = R.plan.beat, t = clock();
  for (let k = 0; k < R.plan.countBeats; k++) click(t + k * b, k === R.plan.countBeats - 1);
  const skip = document.querySelector("[data-act=skip]");
  if (skip) skip.hidden = true;
}

/* Ready, 3, 2, 1 on the four count-in beats; GO on the first downbeat, as the first note reaches the line. */
function countdown(text, go = false) {
  const el = document.getElementById("countdown");
  if (!el) return;
  el.textContent = text;
  el.className = `countdown${go ? " go" : ""}`;
  void el.offsetWidth; // restart the pop
  el.classList.add("pop");
}

function hint(big, small = "", level = "") {
  const a = document.getElementById("hint-big"), b = document.getElementById("hint-small");
  if (a) { a.textContent = big; a.className = level; }
  if (b) b.textContent = small;
}

function paintJudge() {
  const el = document.getElementById("judge");
  if (el) el.innerHTML = judgeBustSvg({ face: R.face, place: R.ctx.place, time: R.ctx.time, garments: R.wearing, rainbow: R.tier >= 3 });
}

function setFace(face, hold = 0.9) {
  R.faceUntil = R.T.t + hold;
  if (face === R.face) return;
  R.face = face;
  paintJudge();
}

function setLevel(level) {
  const el = document.getElementById("judge-wrap");
  if (el) el.dataset.level = level || "";
}

/* ---------- the combo ----------
   Notes on the note in a row, across takes, for as long as the app is open (the old drill's rule: a close note
   keeps the run going without adding to it; an off note ends it). */
const STAR = (x, y, s, d) => `<i class="fx-star" style="left:${x}%;top:${y}%;--s:${s};animation-delay:${d}s"><svg viewBox="-10 -10 20 20"><path d="M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4Z"/></svg></i>`;
const FX = {
  1: () => [[7, 18, 1, 0], [88, 14, .8, .5], [14, 62, .7, 1.1], [84, 58, 1, .3], [30, 8, .6, .8], [70, 6, .7, 1.4]].map((a) => STAR(...a)).join(""),
  2: () => [[10, "♪", 0], [86, "♫", 1.1], [20, "♫", 2.2], [76, "♪", .6], [50, "♪", 1.7]].map(([x, n, d]) => `<i class="fx-note" style="left:${x}%;animation-delay:${d}s">${n}</i>`).join(""),
  4: () => Array.from({ length: 16 }, (_, i) => `<i class="fx-confetti c${i % 5}" style="left:${(i * 37) % 100}%;animation-delay:${((i * 0.29) % 2.4).toFixed(2)}s;--r:${(i * 47) % 360}deg"></i>`).join(""),
};
function paintFx(tier) {
  const el = document.getElementById("fx");
  if (!el) return;
  let html = "";
  if (tier >= 1) html += FX[1]();
  if (tier >= 2) html += FX[2]();
  if (tier >= 4) html += FX[4]();
  el.innerHTML = html;
  el.dataset.tier = String(tier);
}
function showCombo(n, live = true) {
  const chip = document.getElementById("combo");
  const tier = comboTier(n);
  if (chip) {
    chip.hidden = n < 3;
    chip.dataset.tier = String(tier);
    chip.textContent = `${n} in a row`;
    if (live && n >= 3) { chip.classList.remove("bump"); void chip.offsetWidth; chip.classList.add("bump"); }
  }
  const fx = document.getElementById("fx");
  if (tier > R.tier) {
    R.tier = tier;
    if (fx) fx.classList.remove("ending"); // a new run can start while the last one is still fading
    paintFx(tier);
    paintJudge();
    if (live && fx) {
      fx.classList.remove("burst"); void fx.offsetWidth; fx.classList.add("burst");
      chime(COMBO_TIERS[tier - 1].chime); // high, above the pitch tracker's range, so the mic ignores it
    }
  } else if (tier < R.tier) {
    R.tier = tier;
    if (fx) {
      fx.classList.add("ending");
      setTimeout(() => {
        if (!R || R.tier > 0) return; // a new run already took over
        fx.classList.remove("ending");
        paintFx(0);
        paintJudge();
      }, 650);
    }
    else paintJudge();
  } else if (!live) {
    paintFx(tier);
  }
}

/* The judge's face for a whole take. While the first garment is still teaching faces it is one of the three
   note faces; once all twelve are learned, a take in which every note landed gets one of those instead. */
function takeFace(mood, learnedAll) {
  if (mood !== "good" || !learnedAll) return NOTE_FACE[mood] || "neutral";
  return TUTORIAL_FACES[(app.S.takes.length * 7 + 3) % TUTORIAL_FACES.length].id;
}

function onNoteEnd(i, r) {
  const n = R.plan.notes[i], v = r.verdict, last = i === R.plan.notes.length - 1;
  const before = app.combo || 0;
  app.combo = nextCombo(before, v);
  setFace(NOTE_FACE[v], 99); // the face stays until the next note says otherwise
  setLevel(v);
  showCombo(app.combo);
  R.mood = v === "good" ? "smug" : v === "off" ? "wide" : "squint";
  R.moodUntil = R.T.t + 0.75;
  R.marks.push({ t: (n.s + n.e) / 2, midi: n.midi, type: v === "good" ? "ok" : v === "off" ? "?" : "~" });
  noteCue(v, n.midi, last ? 1 : 0.6); // quieter while more notes are still to be sung
  R.flash = { text: `${NOTE_GLYPH[v]} ${v === "off" && r.heard < 0.2 ? "Didn’t hear it" : NOTE_WORD[v]}`, level: v, until: R.T.t + 0.8 };
  const nb = document.getElementById(`nb-${i}`);
  if (nb) {
    nb.classList.add(v);
    const tx = nb.querySelector("text");
    if (tx) tx.textContent = NOTE_GLYPH[v];
  }
}

function loop() {
  if (!R) return;
  const t = clock();
  const dt = Math.max(0, Math.min(0.1, t - R.last));
  R.last = t;
  frame(dt);
  if (R && R.T.phase !== "done") R.raf = requestAnimationFrame(loop);
}

/* One frame: read the voice, advance the take, draw. Also used by window.LC.run() with a fixed dt. */
export function frame(dt) {
  if (!R || !R.started) return;
  const T = R.T, P = R.plan;
  const i = currentIndex(T);
  const v = T.phase === "sing" ? readVoice(T.t, i >= 0 ? P.notes[i] : null, T) : null;
  const evs = stepTake(T, dt, v);
  for (const e of evs) {
    if (e.type === "demo-note") hint("Listen first", `${P.drill.name} · ${noteName(P.notes[e.i].midi)}`);
    else if (e.type === "phase" && e.phase === "count") onCount();
    else if (e.type === "beat") { countdown(["Ready", "3", "2", "1"][e.k] || ""); hint("", "sing as the notes reach the line"); }
    else if (e.type === "phase" && e.phase === "sing") { countdown("GO!", true); hint("Sing", `“${P.drill.syl}”`); }
    else if (e.type === "note-end") onNoteEnd(e.i, e.result);
    else if (e.type === "done") { draw(v, 0); return finish(e.grade); }
  }
  if (T.phase === "sing") {
    R.silentFor = v ? 0 : R.silentFor + dt;
    if (R.flash && T.t < R.flash.until) hint(R.flash.text, `“${P.drill.syl}”`, R.flash.level);
    else if (R.silentFor > 1.4 && T.t < P.total) hint("Sing out", "the judge can’t hear you yet");
    else hint("Sing", `“${P.drill.syl}”`);
  }
  if (R.face !== "neutral" && T.t > R.faceUntil) { setFace("neutral", 0); setLevel(""); }
  draw(v, dt);
}

/* light the gutter name of the line the voice is on (within a quarter tone) */
function markGrid(midi) {
  const on = midi == null ? null : Math.round(midi);
  const hit = on != null && Math.abs(midi - on) <= 0.5 && document.getElementById(`gl-${on}`) ? on : null;
  if (hit === R.gridOn) return;
  if (R.gridOn != null) document.getElementById(`gl-${R.gridOn}`)?.classList.remove("on");
  if (hit != null) document.getElementById(`gl-${hit}`).classList.add("on");
  R.gridOn = hit;
}

function draw(v, dt = 1 / 60) {
  const T = R.T, P = R.plan;
  const shift = PLAY_X - T.t * PXS;
  const notes = document.getElementById("lane-notes");
  if (notes) notes.setAttribute("transform", `translate(${shift.toFixed(1)} 0)`);
  const subs = [[]];
  let tail = null;
  for (const f of T.frames) {
    const x = PLAY_X - (T.t - f.t) * PXS;
    if (x < -30) continue;
    if (f.midi == null || f.conf < 0.5) { if (subs[subs.length - 1].length) subs.push([]); continue; }
    const p = { x, y: yOf(f.midi) };
    if (!tail) tail = { x: p.x, y: p.y };
    subs[subs.length - 1].push(p);
  }
  if (T.phase === "demo" || T.phase === "count") R.headY = guideY(T.phase === "demo" ? T.t : 0);
  else {
    const want = v ? yOf(v.midi) : guideY(T.t);
    const k = dt > 0 ? 1 - Math.exp(-dt / (v ? FOLLOW : 0.08)) : 1;
    R.headY += (want - R.headY) * k;
  }
  markGrid(v ? v.midi : null);
  const last = subs[subs.length - 1];
  if (v && last.length) last.push({ x: PLAY_X, y: R.headY });
  let mood = R.mood;
  if (T.t > R.moodUntil) mood = T.phase === "sing" && v ? "sing" : "listen";
  const marks = R.marks.map((m) => ({ x: PLAY_X - (T.t - m.t) * PXS, y: yOf(m.midi) - 26, type: m.type })).filter((m) => m.x > -20);
  const bob = T.phase === "demo" ? Math.sin(T.t * 6) * 1.5 : 0;
  const el = document.getElementById("lane-cat");
  if (el) el.innerHTML = laneCatSvg({ subs: subs.filter((s) => s.length > 1), head: { x: PLAY_X, y: R.headY + bob, dir: 1 }, tail, look: R.g.look, kind: R.g.kind, animal: R.g.animal, mood, marks });
}

function wireTouch(root) {
  const lane = $("#lane", root);
  const toMidi = (e) => {
    const r = lane.getBoundingClientRect();
    const y = ((e.clientY - r.top) / r.height) * H;
    return R ? R.geo.mid + (MID_Y - y) / R.geo.step : null;
  };
  lane.addEventListener("pointerdown", (e) => { if (app.S.dev.voice !== "touch") return; touchVoice.down = true; touchVoice.midi = toMidi(e); lane.setPointerCapture(e.pointerId); });
  lane.addEventListener("pointermove", (e) => { if (touchVoice.down) touchVoice.midi = toMidi(e); });
  const up = () => { touchVoice.down = false; };
  lane.addEventListener("pointerup", up);
  lane.addEventListener("pointercancel", up);
}

/* ---------- the result ---------- */
function resultLine(grade, mood) {
  const n = grade.notes.length, c = grade.counts;
  if (mood === "good") return "Every note landed. The cat looks smug.";
  if (mood === "mid") return c.good ? `${c.good} of ${n} notes landed. The ${c.mid === 1 ? "other was" : "others were"} close.` : "Close on every note. Nearly there.";
  return c.off === 1 ? "One note got away. It left a fold in the fur." : `${c.off} notes got away. Each left a fold in the fur.`;
}

function finish(grade) {
  const { ctx, retake, plan } = R;
  const S = app.S, real = app.real();
  const learnedAll = St.tutorialDone(S);
  cancelAnimationFrame(R.raf);
  const props = { ...app.props };
  const before = retake ? St.stepsOf(S, ctx.place, ctx.time, ctx.zone)[ctx.step - 1] : null;
  const out = retake ? St.retakeStep(S, ctx, grade, real) : St.recordTake(S, ctx, grade, real);
  app.save();
  const outcome = retake ? props.outcome : out;
  const name = garmentName(ctx.time, ctx.zone);
  R = null;
  if (!out.counted) {
    const el = sheet(`<h3>It didn’t hear that.</h3>
      <p class="muted">${retake ? "This one doesn’t count. The step you sang before stays." : "The microphone didn’t pick up any voice. This take doesn’t count, and nothing is lost."}</p>
      <div class="row"><button class="btn primary" data-a="again">Sing again</button><button class="btn" data-a="ok">${retake ? "Keep the first one" : "Home"}</button></div>`, { dismissable: false });
    el.querySelector("[data-a=again]").onclick = () => { closeSheet(true); show("take", props); };
    el.querySelector("[data-a=ok]").onclick = () => { closeSheet(true); retake ? accept(ctx, outcome) : show("home"); };
    return;
  }
  const mood = takeMood(grade);
  let line = resultLine(grade, mood);
  if (retake && before?.tuft && !grade.tuft) line = `The fold is smoothed out. ${line}`;
  if (mood === "good") { chime(); placeSfx(ctx.place, ctx.time, "hit", 0.8); }
  else placeSfx(ctx.place, ctx.time, mood === "off" ? "miss" : "hit", 0.7);
  /* LATER (decision 5, 2026-11-12: add nothing, test first). Option 甲 would make this moment the best beat in
     the game: the fold smooths out, the cat purrs, the judge's ear twitches. the designer wants to come back to it after
     the ten-day test. See docs/later.md. */
  const g = St.garmentSpec(S, ctx.place, ctx.time, ctx.zone);
  const learned = !retake && out.learned;
  const el = sheet(`
    <p class="eyebrow">${retake ? "Sung again" : "Done"}</p>
    <h3>${esc(name)} ${ctx.step} / ${STEPS}</h3>
    <div class="seg">${segmentSvg({ shape: grade.shape, folds: grade.folds, look: g.look, kind: g.kind, animal: g.animal })}</div>
    <div class="note-dots" role="img" aria-label="${grade.counts.good} on the note, ${grade.counts.mid} close, ${grade.counts.off} off the note">${grade.notes.map((r) => `<i class="nd ${r.verdict}">${NOTE_GLYPH[r.verdict]}</i>`).join("")}</div>
    <p class="note-key"><i class="nd good">✓</i> on the note <i class="nd mid">~</i> close <i class="nd off">?</i> off the note</p>
    <div class="verdict ${mood}">${faceIconSvg(takeFace(mood, learnedAll), { size: 64 })}<p class="line">${esc(line)}</p></div>
    ${learned ? `<div class="learned">${faceIconSvg(learned.id, { size: 72 })}<div><span class="eyebrow">The judge learned</span><b>${esc(learned.name)}</b>${S.faces >= STEPS ? "<span>All twelve faces learned. From now on, a take where every note lands gets one of them.</span>" : "<span>One new face for every step of the first garment.</span>"}</div></div>` : ""}
    <div class="row"><button class="btn primary" data-a="ok">Keep it</button><button class="btn" data-a="retake">Sing this step again</button></div>`, { dismissable: false });
  el.querySelector("[data-a=ok]").onclick = () => { closeSheet(true); accept(ctx, outcome); };
  el.querySelector("[data-a=retake]").onclick = () => { closeSheet(true); show("take", { ctx, retake: true, outcome }); };
}

/* After "Keep it": a finished time plays the reset beat; a finished garment asks for the next one. */
function accept(ctx, outcome) {
  if (outcome?.timeDone) return show("beat", { place: ctx.place, time: outcome.timeDone });
  if (outcome?.garmentDone) {
    show("home", { glow: { zone: ctx.zone, step: ctx.step }, noAutoPick: true });
    return setTimeout(() => app.screens.home.openPicker?.({ after: `The ${garmentName(ctx.time, ctx.zone).toLowerCase()} is on.` }), 600);
  }
  show("home", { glow: { zone: ctx.zone, step: ctx.step } });
}

app.screens.take = { render, fullscreen: true, leave: () => stop() };

/* Test hook: step the running take by hand when animation frames are throttled. */
export function runFrames(seconds, fps = 60) {
  for (let k = 0; k < seconds * fps && R && R.T.phase !== "done"; k++) frame(1 / fps);
  if (R) R.last = clock();
  return R ? R.T.phase : "done";
}
export const running = () => R;
