/* The singing screen. The phrase is hummed once while its notes stream past the playhead; four beats; then the
   player sings it unaccompanied. The pitch draws the cat: the head rides the playhead, the body trails behind as
   sung. At the end of every note the judge makes one of three faces (on the note, close, off the note), the
   note block takes that colour and a sound says the same thing. Every "?" is on the cat, never on the singer.
   Behind the lane, the note chart of the old drill: a line for every pitch in the phrase, named in the gutter.
   Notes that land in a row build a combo; the judge gets happier and the sky around it fills up (stars, music,
   a rainbow, confetti). An off note ends the run quietly; nothing is lost. */
import { app, show, sheet, closeSheet, esc, $, readVoice, prepareVoice, touchVoice } from "./app.js";
import { openMic, closeMic, micReady, micMode, micInfo } from "../audio/mic.js";
import * as St from "../state.js";
import { treatLine } from "./cats.js";
import { planTake, HEAD_DELAY } from "../drill/drills.js";
import { createTake, stepTake, skipDemo, currentIndex, ticksIn, DEMO_LEAD, latOf, sungTime, sungIndex } from "../drill/take.js";
import { takeMood } from "../drill/grade.js";
import { steadiness, steadyLine } from "../drill/steady.js";
import { laneCatSvg, judgeBustSvg, segmentSvg, faceIconSvg } from "../art/index.js";
import { laneShape, laneInside, onChart, FAR_DRAW, OUTLIER_SECONDS, lagToDraw, easeLag, LAG_GUESS } from "./lane-body.js";
import { demoNote, prepareDemo, pianoChord, preparePiano, click, tick, placeSfx, noteCue, chime, audioContext, now, heardItself, wakeAudio, rebuildAudio, audioRunning, audioState, audioDelay, holdAudio, markAudioStale, audioSettled, setBoost } from "../audio/synth.js";
import { notesNear } from "../audio/self.js";
import { keepTake } from "../drill/pitchlog.js";
import { musicQuiet } from "../audio/ambient.js";
import { demoVoice } from "../audio/demo-voices.js";
import { comboTier, nextCombo, COMBO_TIERS } from "./combo.js";
import { TUTORIAL_FACES, NOTE_FACE, NOTE_WORD, NOTE_GLYPH, garmentName, STEPS, ZONES, drillCard, timeById } from "../content.js";
import { noteName } from "../audio/pitch.js";
import { tip, hideTip } from "./tips.js";
import { micBlocked } from "./onboarding.js";
import { openMicTest } from "./settings.js";

const W = 390, PLAY_X = 118, PXS = 92, GUTTER = 40;
/* The lane's height, in its own units (it is always W wide): set for each take from the room the screen has, so
   the notes get the page and the judge a strip (the designer, 2026-11-14). 300 is the least, as it was when it was fixed. */
let H = 300, MID_Y = 150;
const HOP = 0.16; // the demo head leaves for the next note this long before it arrives, and lands on time
/* The head moves like a soft spring: it starts gently and settles without overshooting (time based, so
   phones keep up). Within a note it follows the voice quickly; landing on another note it takes a little
   longer (the designer, 2026-11-14: "it feels a bit rushed ... add a very slight delay when landing on the next note"). */
const FOLLOW = 0.02; // seconds: following the voice within a note
const LAND = 0.08; // seconds: moving to another note. 0.045, then 0.065 ("still a little rushed"), then 0.08 ("should
// probably move a bit slower ... it's very slight though", 2026-11-14). The head now takes about a quarter slower to
// cross to the next note; within a semitone of it, it follows the voice at FOLLOW again.
let R = null;
/* One level for the whole take. the designer, 2026-11-24: first "When player starts singing the sound becomes too quiet so
   players can't hear the notes and the tempo", then, with the beat and the cues booked louder under the
   microphone, "The total volume of the singing part is still too low. Please make it the same as the demo", and
   "keep the 節拍器 going even in between the demo and the singing. Cutting out the tempo cue throws the player off".
   A phone changes how it plays the moment a page opens the microphone, and its sound stops for an instant while it
   does. So the microphone is now opened before the demo and stays open to the end of the take: the demo, the count
   and the singing are played the same way, and the metronome runs through all three on one beat. How loud that is
   depends on how the microphone was asked for (audio/mic.js MIC_MODES); everything the take plays is lifted by
   MIC_BOOST for that mode. DRAFT numbers, not heard on a phone by the agent. */
const MIC_BOOST = { speaker: 1.3, plain: 2.2 };

const clock = () => (audioContext() ? now() : performance.now() / 1000);
const wall = () => performance.now() / 1000;

const CHART_PAD = 3; // semitones of faint lines above and below the phrase's notes
const BLOCK_H = 24; // a note's block
function geometry(plan) {
  const ms = plan.notes.map((n) => n.midi);
  const lo = Math.min(...ms), hi = Math.max(...ms);
  /* A taller lane gives wide drills (an octave, a climb) more room per semitone. The cap stays near what it was:
     the head follows the real voice, and more pixels per semitone would make every waver look bigger (the designer asked
     for a calmer head, 2026-11-14). */
  const step = Math.max(9, Math.min(20, (H - 130) / Math.max(4, hi - lo)));
  /* lo, hi: what the chart shows, the phrase's notes and three semitones either side (laneGrid) */
  return { mid: (lo + hi) / 2, step, lo: lo - CHART_PAD, hi: hi + CHART_PAD };
}
const yRaw = (m) => MID_Y - (m - R.geo.mid) * R.geo.step;
const yOf = (m) => Math.max(26, Math.min(H - 26, yRaw(m)));

/* The old drill's note chart: a line for every pitch the phrase uses, padded three semitones either side with
   faint semitone lines, so the singer sees which note is which and how far apart they are. */
function laneGrid(plan) {
  const targets = new Set(plan.notes.map((n) => n.midi));
  const lo = Math.min(...targets) - CHART_PAD, hi = Math.max(...targets) + CHART_PAD;
  let lines = "", labels = "";
  for (let m = lo; m <= hi; m++) {
    const y = yRaw(m);
    if (y < 12 || y > H - 12) continue;
    if (targets.has(m)) {
      lines += `<line class="gl-line" id="gll-${m}" x1="${GUTTER}" x2="${W}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
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
  const bars = plan.notes.map((n, i) => {
    const x = n.s * PXS, w = Math.max(14, (n.e - n.s) * PXS - 3), y = yOf(n.midi);
    return `<g class="nb" id="nb-${i}"><rect x="${x.toFixed(1)}" y="${(y - BLOCK_H / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${BLOCK_H}" rx="${BLOCK_H / 2}"/></g>`;
  }).join("");
  /* a climbing drill: each later round is marked where it begins, "↑ 2 / 5" or "↓ 4 / 5" */
  const tags = plan.reps.length > 1 ? plan.reps.slice(1).map((r, k) => `<text class="rep-tag" x="${(r.s * PXS).toFixed(1)}" y="20">${r.dir === "up" ? "↑" : r.dir === "down" ? "↓" : "·"} ${k + 2} / ${plan.reps.length}</text>`).join("") : "";
  return bars + tags;
}
/* the sound written on each note, in a layer of its own above the sung line, so the line never covers it */
const laneLabels = (plan) => plan.notes.map((n, i) => `<text class="nl" id="nl-${i}" x="${(n.s * PXS + 12).toFixed(1)}" y="${(yOf(n.midi) + 5).toFixed(1)}">${esc(plan.syl)}</text>`).join("");

/* ---------- rounds (a climbing drill) ----------
   The round being sung, or the one coming: it changes as the last note of a round ends. */
/* how long after its beat a note reaches the head (drills.js HEAD_DELAY); the Dev panel can try another */
export const headDelay = (S) => (Number.isFinite(S.dev.headDelay) ? Math.min(1, Math.max(0, S.dev.headDelay)) : HEAD_DELAY);
const roundAt = (P, t) => { const k = P.reps.findIndex((r) => t < r.e); return k === -1 ? P.reps.length - 1 : k; };
/* The chart has a line for every pitch of every round, which is a crowd: only the round at hand keeps its
   note names, the others' lines go faint. */
function focusRound(k) {
  const P = R.plan;
  if (P.reps.length < 2 || k === R.round) return;
  R.round = k;
  const rep = P.reps[k], mine = new Set(P.notes.slice(rep.i0, rep.i0 + rep.n).map((n) => n.midi));
  for (const m of new Set(P.notes.map((n) => n.midi))) {
    document.getElementById(`gl-${m}`)?.classList.toggle("away", !mine.has(m));
    document.getElementById(`gll-${m}`)?.classList.toggle("away", !mine.has(m));
  }
}
/* The rest before a round (the designer, 2026-11-27: "play the current chord then the updated chord ... within one beat so
   the next beat shows go"): two beats before the round the chord of the round just sung and, half a beat later,
   the chord of the round to come, which rings until just before it; on the beat between, the screen says Go
   (`frame`). In Vocalista's recording, and here until that day, each chord had a beat of its own; for some hours
   there was the second chord alone. Piano notes rendered by the audio engine (synth.js `pianoChord`), since 2026-11-27;
   the chords made in the page had sounded odd and for two days the cat sang the next round's first note in the
   second chord's place instead. That sung note is still here: it is what a take gives when its piano notes did not
   arrive in time, and the Dev panel can choose it, or both (`S.dev.between`). Both kinds of sound are written down
   for the self-hearing filter, so the phone's own cue is never taken for the singer. */
function playCues() {
  const P = R.plan, T = R.T;
  while (R.cue < P.cues.length && T.t >= P.cues[R.cue].t - 0.1) {
    const c = P.cues[R.cue++], at = clock() + Math.max(0, c.t - T.t);
    /* The chord of the round to come is let go a quarter of a beat before the round. The pitch tracker reads a chord
       as one low note that is none of its own (for F sharp major a pitch near G2), which the self-hearing filter
       cannot know as the game's; what is left of the chord in the room must be gone when the first note is read. */
    const ring = (c.home ? c.dur : c.dur - 0.25 * P.beat) - Math.max(0, T.t - c.t);
    if (R.chords && T.t < c.t + c.dur * 0.5) R.nodes.push(pianoChord(c.midis, at, ring));
    if (R.sungCue && c.midi != null && T.t < c.t + c.sung * 0.5) R.nodes.push(demoNote(R.demoKind, at, c.midi, c.sung, P.syl));
  }
}
const roundWord = (P, k) => `round ${k + 1} of ${P.reps.length}`;
/* how the rounds of a take move, in words (drills.js: the time of day decides the rounds; plan.way says how they
   go, plan.by is 2 for a whole tone, 1 for a semitone where the singer has less room) */
const WAY_WORDS = { up: "higher each time", down: "lower each time", wave: "higher each time, then back down", same: "the same notes each time" };
const wayWords = (P) => WAY_WORDS[P.way] || "";
const DIR_WORDS = { up: ["A step higher", "A little higher"], down: ["A step lower", "A little lower"], same: ["Once more", "Once more"] };
const dirWords = (P, rep) => (DIR_WORDS[rep.dir] || DIR_WORDS.same)[P.by === 2 ? 0 : 1];

/* Every take plays the phrase once before the count (of a climbing drill, its first round). For a few hours on
   2026-11-24 a drill met before gave its first note only; the designer, after playing it: "The demo is too short. The player
   doesn't know what notes to sing next. It will need to play out one sequence at least." "Skip demo" is still in
   the header for whoever wants the count at once. */

function render(root, { ctx, retake = false, outcome = null, card = false, carded = false }) {
  const S = app.S;
  if (!ctx) return show("home");
  audioContext(); // inside the tap that opened this screen, so the browser lets sound start
  const plan = planTake({ step: ctx.step, time: ctx.time, zone: ctx.zone, range: S.settings.range, nudge: S.settings.nudge, seed: ctx.seed });
  /* a drill met for the first time shows its card before anything sounds; the title opens it again (`card`) */
  const withCard = card || (!St.heardDrill(S, plan.drill.id) && !carded && !retake);
  const g = St.garmentSpec(S, ctx.place, ctx.time, ctx.zone);
  R = { ctx, retake, outcome, plan, T: createTake(plan, { delay: headDelay(S) }), geo: null, g, raf: 0, last: 0, nodes: [], face: "neutral", faceUntil: 0, mood: "listen", moodUntil: 0, headY: MID_Y, marks: [], silentFor: 0, started: false, flash: null, gridOn: null, tier: 0, ticked: -1, raw: [], round: -1, cue: 0 };
  /* how far back the sung line is drawn (lane-body.js): what earlier takes with the microphone found, until this one knows */
  R.lagKnown = S.dev.voice === "mic" ? St.knownLag(S) ?? LAG_GUESS : null;
  R.lag = lagToDraw(null, R.lagKnown);
  R.wearing = ["scarf", "top", "bottom"].map((z) => St.garmentSpec(S, ctx.place, ctx.time, z));
  const name = garmentName(ctx.time, ctx.zone);
  /* Twelve segments under the garment's name: the steps sung, and the one being sung (the designer, 2026-11-24, after
     Vocalista's ten: where this garment stands, at a glance, instead of "step 5" in words). The line under them
     (the drill, the sound, the first note) is there until the singing starts, then it is put away. */
  const sung = St.progress(S, ctx.place, ctx.time, ctx.zone);
  const segs = Array.from({ length: STEPS }, (_, k) => `<i${k + 1 === ctx.step ? ' class="now"' : k < sung ? ' class="done"' : ""}></i>`).join("");
  root.innerHTML = `
    <header class="take-head" id="take-head">
      <button class="icon-btn" data-act="close" aria-label="Leave. This take won’t count.">✕</button>
      <button class="take-title" data-act="card" aria-label="${esc(name)}, step ${ctx.step} of ${STEPS}${retake ? ", again" : ""}. ${esc(plan.drill.name)}: about this drill.">
        <b>${esc(name)}${retake ? " · again" : ""}</b>
        <span class="psegs" aria-hidden="true">${segs}</span>
        <span class="sub">${esc(plan.drill.name)}${plan.reps.length > 1 ? ` × ${plan.reps.length}` : ""} · sing “${esc(plan.syl)}” · starts on ${noteName(plan.notes[0].midi)}</span>
      </button>
      <button class="btn ghost skip" data-act="skip">Skip demo</button>
      ${plan.reps.length > 1 ? `<button class="icon-btn pause" data-act="pause" aria-label="Pause" hidden><i></i><i></i></button>` : ""}
    </header>
    <div class="lane-wrap" id="lane-wrap"></div>
    <div class="judge-wrap" id="judge-wrap">
      <div class="judge-art" id="judge"></div>
      <div class="fx" id="fx" aria-hidden="true"></div>
      <div class="combo-chip" id="combo" hidden></div>
    </div>
    `;
  /* the note area takes the height the screen has left between the header and the judge's strip: its picture is
     drawn to that shape, at least as tall as it used to be */
  const wrap = $("#lane-wrap", root), box = wrap.getBoundingClientRect();
  H = box.width > 0 && box.height > 0 ? Math.max(300, Math.min(720, Math.round((W * box.height) / box.width))) : 300;
  MID_Y = H / 2;
  R.geo = geometry(plan);
  R.headY = yOf(plan.notes[0].midi);
  const grid = laneGrid(plan);
  wrap.innerHTML = `
      <svg class="lane" id="lane" viewBox="0 0 ${W} ${H}" aria-label="Lane">
        <rect width="${W}" height="${H}" class="lane-bg"/>
        <g id="lane-grid">${grid.lines}</g>
        <g id="lane-notes">${laneNotes(plan)}</g>
        <line x1="${PLAY_X}" y1="14" x2="${PLAY_X}" y2="${H - 14}" class="playhead"/>
        <g id="lane-line"></g>
        <g id="lane-labels">${laneLabels(plan)}</g>
        <g id="lane-cat"></g>
        <g id="lane-gutter">${grid.gutter}</g>
      </svg>
      <div class="countdown" id="countdown" aria-live="polite"></div>
      <div class="say" id="say" hidden></div>
      <div class="hint"><b id="hint-big">Listen first</b><span id="hint-small"></span></div>`;
  $("[data-act=close]", root).onclick = () => { stop(); show("home"); };
  $("[data-act=skip]", root).onclick = () => { if (R.started && R.T.phase === "demo") { stopNodes(); skipDemo(R.T); onCount(); } };
  /* the drill's card, asked for: the take starts over behind it (before the singing only) */
  $("[data-act=card]", root).onclick = () => { if (!R || R.T.phase === "sing" || R.T.phase === "done") return; const props = { ...app.props, card: true }; stop(); show("take", props); };
  const pz = $("[data-act=pause]", root);
  if (pz) pz.onclick = () => pause();
  wireTouch(root);
  R.tier = comboTier(app.combo || 0);
  paintJudge();
  showCombo(app.combo || 0, false);
  focusRound(0);
  if (withCard) { hint("", ""); openCard(); } else start();
}

/* ---------- the drill's card ----------
   the designer, 2026-11-24, after Vocalista's intro card: the first time a drill comes up, a card says what it is before
   anything sounds: its plain name, its shape, the sound, a goal in a few words and one line of how (content.js
   DRILL_CARD). "Hear it" plays the phrase on the card, as often as wanted. "Start" begins the take, which plays
   the phrase once more before the count, as every take does. A tap outside the card leaves, as the header's ✕
   does. A drill is met (state.js hearDrill) once a take of it reaches the count. The same card opens from the title while the take has not reached the singing. */
let PV = null; // the card's preview: its sounds and its timers
function stopPreview() {
  if (!PV) return;
  PV.nodes.forEach((n) => n && n.stop && n.stop());
  PV.timers.forEach(clearTimeout);
  PV = null;
}
function cardFigure(P) {
  const first = P.notes.slice(0, P.demoCount), ms = first.map((n) => n.midi);
  const lo = Math.min(...ms), hi = Math.max(...ms), FW = 300, FH = 84, pad = 22;
  const dy = hi > lo ? Math.min(9, (FH - 34) / (hi - lo)) : 0, mid = (lo + hi) / 2;
  const span = Math.max(0.1, P.demoTotal), k = (FW - pad * 2) / span;
  const bars = first.map((n) => ({ x: pad + n.s * k, w: Math.min(120, Math.max(10, (n.e - n.s) * k - 5)), y: FH / 2 - (n.midi - mid) * dy }));
  const shift = (FW - (bars[bars.length - 1].x + bars[bars.length - 1].w) - bars[0].x) / 2; // a capped bar leaves room: centre the phrase
  return `<svg viewBox="0 0 ${FW} ${FH}" aria-hidden="true">${bars.map((r) => `<rect class="dc-pill" x="${(r.x + shift).toFixed(1)}" y="${(r.y - 6).toFixed(1)}" width="${r.w.toFixed(1)}" height="12" rx="6"/>`).join("")}</svg>`;
}
function openCard() {
  const S = app.S, P = R.plan, d = P.drill, T = timeById(R.ctx.time), words = drillCard(d.id);
  const fresh = !St.heardDrill(S, d.id), props = app.props;
  const rounds = P.reps.length > 1 ? ` · ${P.reps.length} rounds, ${wayWords(P)}` : "";
  const el = sheet(`
    <p class="eyebrow">${fresh ? "New · " : ""}${esc(garmentName(R.ctx.time, R.ctx.zone))} · ${esc((ZONES.find((z) => z.id === R.ctx.zone) || ZONES[0]).aim)}</p>
    <h3>${esc(d.name)}</h3>
    <div class="dc-fig">${cardFigure(P)}<b>“${esc(P.syl)}”</b><span>starts on ${noteName(P.notes[0].midi)}${rounds}</span></div>
    ${words ? `<div class="dc-words"><p class="eyebrow">GOAL</p><p class="dc-goal">${esc(words.goal)}</p><p class="eyebrow">HOW</p><p>${esc(words.how)}</p></div>` : ""}
    <div class="row onward"><button class="btn dc-hear" data-a="hear">▶ Hear it</button><button class="btn primary" data-a="start">Start</button></div>`,
    { onClose: () => { stopPreview(); stop(); show("home"); } });
  el.querySelector("[data-a=hear]").onclick = () => previewDrill(el, P);
  el.querySelector("[data-a=start]").onclick = () => { stopPreview(); closeSheet(true); show("take", { ...props, card: false, carded: true }); };
}
async function previewDrill(el, P) {
  if (PV || !R) return;
  const mine = (PV = { nodes: [], timers: [] }), btn = el.querySelector("[data-a=hear]");
  btn.disabled = true;
  audioContext();
  await musicQuiet();
  /* a microphone left open would make a phone play this quietly (audio/mic.js) */
  if (app.S.dev.voice === "mic" && micReady()) { closeMic(); await audioSettled(); }
  if (PV === mine) await wakeAudio();
  const first = P.notes.slice(0, P.demoCount);
  const kind = PV === mine ? await prepareDemo(app.S.dev.demoVoice, P.syl, first.map((n) => n.midi)) : null;
  if (PV !== mine) return;
  const lead = 0.2, t0 = clock() + lead, pills = [...el.querySelectorAll(".dc-pill")];
  first.forEach((n, i) => {
    mine.nodes.push(demoNote(kind, t0 + n.s, n.midi, n.e - n.s, P.syl));
    mine.timers.push(setTimeout(() => pills[i]?.classList.add("on"), (lead + n.s) * 1000), setTimeout(() => pills[i]?.classList.remove("on"), (lead + n.e) * 1000));
  });
  mine.timers.push(setTimeout(() => {
    if (PV !== mine) return;
    PV = null;
    btn.disabled = false;
  }, (lead + P.demoTotal + 0.15) * 1000));
}

/* LATER (decision 5, fix 4 of the list): the judge humming along under the singer is not built; the
   take stays "hear it once, then sing with only the metronome". See docs/later.md. */
async function start() {
  /* The microphone is opened here, before the demo, and closed when the take ends (see MIC_BOOST above for why).
     Until 2026-11-24 it was opened at the count, so that the demo played at full volume; the price was the phone
     changing its sound, and the beat stopping, between the demo and the singing. */
  const mic = app.S.dev.voice === "mic";
  /* Home's music is fading out (ambient.js, about a third of a second). Nothing of the take may start over it:
     opening or closing the microphone makes a phone drop to call volume, and the music is not in the log of
     sounds the game made itself. */
  await musicQuiet();
  if (!R) return;
  /* one left open by the range finder or the microphone test is wired to a sound context that may be gone */
  if (mic && micReady()) closeMic();
  const listen = async () => {
    /* if the browser's question is slow to come, say what the game is waiting for */
    const wait = setTimeout(() => R && !R.started && hint("Allow the microphone", "The demo starts right after"), 1200);
    const ok = await prepareVoice();
    clearTimeout(wait);
    if (!R) return false;
    if (!ok) { micProblem(); return false; }
    await audioSettled(); // opening the microphone switches the phone's sound: wait until it runs again
    return !!R;
  };
  if (mic && !(await listen())) return;
  if (!R) return;
  /* the phone may have paused the sound (synth.js): wake it, and if it will not wake, ask for one tap */
  const before = audioContext();
  if (!(await wakeAudio()) && R) await soundAsleep();
  if (!R) return;
  /* that tap may have made a new sound context: the microphone has to be wired to it */
  if (mic && audioContext() !== before) { closeMic(); if (!(await listen())) return; }
  if (mic) { holdAudio(true); setBoost(MIC_BOOST[micMode()] || 1); hint(LISTEN(), ""); }
  /* the recorded voice: fetch this take's notes before anything is sung (the cues between rounds are first notes
     of rounds, so they are among them); if they do not all arrive, the whole take uses the synthesised voice */
  const fetching = setTimeout(() => R && !R.started && hint(LISTEN(), "getting the voice…"), 700);
  R.demoKind = await prepareDemo(app.S.dev.demoVoice, R.plan.syl, R.plan.notes.map((n) => n.midi));
  if (!R) return;
  /* the piano notes of the chords between rounds: all of them or none (then the cat sings the first note) */
  const between = app.S.dev.between || "chords";
  R.chords = between !== "sung" && (await preparePiano(R.plan.cues.flatMap((c) => c.midis)));
  if (!R) return;
  R.sungCue = between !== "chords" || !R.chords;
  clearTimeout(fetching);
  hint(LISTEN(), "");
  await sayOnce();
  if (!R) return;
  holdAudio(true); // from here to the end of the take nothing may swap the context under the microphone
  R.started = true;
  const t0 = clock() + DEMO_LEAD;
  /* the demo is the cat singing the phrase on its own sound; of a climbing drill, the first round only */
  R.plan.notes.slice(0, R.plan.demoCount).forEach((n) => R.nodes.push(demoNote(R.demoKind, t0 + n.s, n.midi, n.e - n.s, R.plan.syl)));
  R.last = clock(); R.lastW = wall(); R.stall = 0;
  loop();
  setTimeout(() => R && R.T.phase === "demo" && laneTip("listen", 5000), 250);
}

/* The sound did not wake on its own: a button over the lane, because a tap is the one thing a phone always
   accepts. One tap resumes it; if that fails too, a fresh context is made. The take starts either way, so
   this screen can never be a dead end. */
function soundAsleep() {
  /* nobody has touched the page (the test hook): nothing to tap, the take runs by the wall clock */
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return Promise.resolve();
  return new Promise((done) => {
    const wrap = document.querySelector(".lane-wrap");
    if (!wrap) return done();
    const b = document.createElement("button");
    b.className = "wake";
    b.innerHTML = "<b>Tap to turn the sound on</b><span>The phone paused it</span>";
    wrap.appendChild(b);
    hint("", "");
    b.onclick = async () => {
      b.disabled = true;
      let ok = await wakeAudio(500);
      if (!ok) { rebuildAudio(); ok = await wakeAudio(500); }
      b.remove();
      if (R) hint(LISTEN(), ok ? "" : "No sound right now");
      done();
    };
  });
}

/* The first time a sound comes up, the cat says it once on its own, with the word large on the lane, before the
   demo sings it (drill-ladder board, section 8). This is where a player learns which sound "noo" or "yah" is. For
   a day it was said before every take, after Vocalista; the designer, 2026-11-25: not again at the start of a drill, the
   sound has been shown already. */
async function sayOnce() {
  const S = app.S, syl = R.plan.syl;
  if (S.said.includes(syl)) return;
  S.said.push(syl);
  app.save();
  const el = document.getElementById("say"), skip = document.querySelector(".take-head .skip");
  if (skip) skip.hidden = true;
  const cat = !!demoVoice(R.demoKind).words; // a voice with no words cannot say it: the word is shown, the note is played
  if (el) { el.innerHTML = `<b>${esc(syl)}</b><span>${cat ? "the cat says it once" : "the sound to sing"}</span>`; el.hidden = false; }
  hint("", "");
  R.saying = true;
  try { draw(null, 0); } catch { /* the lane is not ready yet */ }
  R.nodes.push(demoNote(R.demoKind, clock() + 0.12, R.plan.notes[0].midi, 0.7, syl, cat ? { fall: 3 } : {}));
  await new Promise((r) => setTimeout(r, 1250));
  if (!R) return;
  R.saying = false;
  if (el) el.hidden = true;
  if (skip) skip.hidden = false;
  hint(LISTEN(), "");
}
const LISTEN = () => "Listen first";

function micProblem() {
  const props = app.props;
  micBlocked(() => show("take", props), () => show("home"));
}

function stopNodes() { R.nodes.forEach((n) => n && n.stop && n.stop()); R.nodes = []; }
function stop() {
  stopPreview();
  if (!R) return;
  setBoost(1);
  holdAudio(false); markAudioStale(); // the next touch makes a fresh sound context (synth.js, "Healing")
  cancelAnimationFrame(R.raf);
  if (R.paused) R.paused.timers.forEach(clearTimeout);
  stopNodes();
  closeMic();
  R = null;
}

function onCount() {
  /* Open the microphone for the count-in and the singing, and hold the take still until it is really open.
     the designer, 2026-11-14: "I'm not sure if it's delayed by the microphone access notification, but sometimes the
     drill feels unsynced after that event". Opening the microphone switches a phone's sound to call mode: the
     sound stops for a moment, and some browsers ask their question again first. The count used to run on through
     all of that, so afterwards sound and picture could be apart. Now the take's clock stands at the first count
     beat, showing Ready, until the microphone is open and the sound's clock is moving again (loop); only then
     does the count go Ready, 3, 2, 1. However long the phone takes, nothing is counted during it. */
  R.clicked = -1;
  /* the demo has played, or was skipped: this drill has been met, and its card will not come up by itself again */
  if (!St.heardDrill(app.S, R.plan.drill.id)) { St.hearDrill(app.S, R.plan.drill.id); app.save(); }
  /* the microphone is open since before the demo; this is only for one that is not, whatever the reason */
  if (app.S.dev.voice === "mic" && !micReady()) {
    R.hold = { since: wall(), ready: false, a0: 0, w0: 0, told: false };
    const mine = R;
    openMic().then((ok) => {
      /* the take it was opened for is gone: with no take running, the microphone is let go again (another take
         keeps it, its own or this one) */
      if (R !== mine) { if (ok && !R) closeMic(); return; }
      if (!R) return;
      if (!ok) { stop(); micProblem(); return; }
      if (R.hold) { R.hold.ready = true; R.hold.a0 = clock(); R.hold.w0 = wall(); }
    });
  }
  const skip = document.querySelector("[data-act=skip]");
  if (skip) skip.hidden = true;
  hideTip();
  /* The one-time bubbles come here, before the singing, one to a take; none comes up while the player sings
     (the designer, 2026-11-24: a quieter singing screen). A climbing drill explains itself first, then the line, then the
     voice, which used to pop up on the first sung note. */
  (R.plan.reps.length > 1 && laneTip("climb", 5000, H - 70)) || laneTip("line", 3500, H - 40) || laneTip("voice", 4000, H - 40);
}

/* a lane tip hangs under the cat's head (or under a given lane height), its arrow pointing up at the line */
function laneTip(id, ms, laneY = null) {
  const lane = document.getElementById("lane");
  if (!lane || !R) return false;
  const k = lane.getBoundingClientRect().height / H;
  return tip(id, lane, { at: "below", x: PLAY_X / W, y: (laneY ?? R.headY + 18) * k + 12, ms });
}

/* ---------- pause (a climbing drill) ----------
   Steps 10 to 12 run for up to a minute, and leaving used to throw the take away. The pause button is in the
   header while such a drill is sung. Paused, the take's clock stands still and no frame is read; "Go on" counts
   3, 2, 1 at the drill's own beat and the take runs on from where it stood, so a note cut in two is finished, not
   started again. The microphone stays open through it (it is still read only while the take runs). */
function pause() {
  if (!R || R.paused || R.T.phase !== "sing") return;
  R.paused = { timers: [] };
  stopNodes();
  /* a first-note cue cut off by the pause is given again */
  const C = R.plan.cues;
  while (R.cue > 0 && C[R.cue - 1].t + C[R.cue - 1].dur > R.T.t) R.cue--;
  hint("", "");
  const wrap = document.getElementById("lane-wrap");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "paused"; el.id = "paused";
  el.innerHTML = `<b>Paused</b><span>${esc(roundWord(R.plan, roundAt(R.plan, R.T.t)))} · it goes on from here</span><div class="row"><button class="btn" data-a="leave">Leave</button><button class="btn primary" data-a="go">Go on</button></div>`;
  wrap.appendChild(el);
  el.querySelector("[data-a=leave]").onclick = () => { stop(); show("home"); };
  el.querySelector("[data-a=go]").onclick = () => resume();
}
function resume() {
  if (!R || !R.paused || R.paused.going) return;
  R.paused.going = true;
  document.getElementById("paused")?.remove();
  const beat = Math.max(0.5, R.plan.beat), at = clock() + 0.05, mine = R;
  ["3", "2", "1"].forEach((w, k) => {
    click(at + k * beat, k === 2);
    R.paused.timers.push(setTimeout(() => R === mine && countdown(w), k * beat * 1000));
  });
  R.paused.timers.push(setTimeout(() => {
    if (R !== mine) return;
    R.paused = null;
    countdown("");
    R.last = clock(); R.lastW = wall(); R.stall = 0;
  }, 3 * beat * 1000));
}

/* Ready, 3, 2, 1 and then one beat that shows nothing; the first note is the beat after that, with nothing popping
   up at it. the designer, 2026-11-14: "the player has to sing the first note the instant GO appears ... it feels rushed".
   GO used to appear on the first note itself, so it worked as a starting gun: the singer waited for it and was
   late. For one deploy the empty beat said "Breathe"; the designer asked for it to go: "one more beat between the note
   and 1, but we show nothing there". The beat is still heard as the metronome's soft tick (bookTicks). */
function countdown(text, go = false) {
  const el = document.getElementById("countdown");
  if (!el) return;
  el.textContent = text;
  el.style.fontSize = text.length > 5 ? "50px" : "";
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
  if (!el) return;
  el.innerHTML = judgeBustSvg({ face: R.face, place: R.ctx.place, time: R.ctx.time, garments: R.wearing, rainbow: R.tier >= 3 });
  /* the judge's box is as wide as the screen: fill it, and if it is shorter than the bust keep the body and its
     garments and lose the sky above the head */
  const svg = el.firstElementChild;
  if (!svg) return;
  svg.setAttribute("preserveAspectRatio", "xMidYMax slice");
  /* the bust is framed from the sky down to the chest (0 0 300 220): look a little lower, so more of the scarf and
     the shoulders is in view and less empty sky. The fruit on a full hat still clears the top. */
  svg.setAttribute("viewBox", "0 6 300 220");
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

/* The judge's face for a whole take: one of the three note faces, except that a take in which every note landed
   gets one of the twelve the judge learns in the first garment. During that garment it is the face learned at this
   step (`learned`); nothing on the sheet says so and nothing lists them: an Easter egg (the designer, 2026-11-15). */
function takeFace(mood, learnedAll, learned) {
  if (mood === "good" && learned) return learned.id;
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
  if (nb) nb.classList.add(v);
  document.getElementById(`nl-${i}`)?.classList.add("done"); // the mark is drawn above the cat instead
}

/* The metronome runs under the demo and the singing (the designer, 2026-11-13: "add the 節拍器 in the background the
   whole time so when the user is doing their part they can follow it"). Beats are booked a little ahead on
   the audio clock so they do not wobble with the frame rate; R.ticked is the last moment already booked. */
const TICK_AHEAD = 0.12;
function bookTicks() {
  const T = R.T, at = clock();
  /* The count-in (until 2026-11-24: di, di, Di on 3, 2, 1 and a soft tick on an empty beat). the designer, 2026-11-14: "the di di Di with
     3, 2, 1 is not synced". All four clicks used to be booked at once when the count began, at fixed moments of
     the audio clock; the microphone opens at that same moment, and when the phone's sound stumbled then, the
     clicks slid away from the numbers and stayed away. Now each click is booked just before its own beat, from
     where the take's clock is, like the metronome: a stumble can no longer shift the ones after it. */
  if (T.phase === "count") {
    /* 3, 2, 1, Go: the metronome's light tap goes on through the count, on the demo's beat, and each count beat
       has its own click over it, a higher one on Go (the designer, 2026-11-24). The first note is the beat after Go and
       gets the metronome's knock. Nothing else sounds in the count: for a day round one's chord rang from "1"
       through Go, and it confused the player (the designer, 2026-11-25). */
    const P = R.plan, n = P.countBeats;
    for (let k = (R.clicked ?? -1) + 1; k < n; k++) {
      const tk = -P.beat * (n - k);
      if (tk >= T.t + TICK_AHEAD) break;
      const when = Math.max(at, at + (tk - T.t));
      tick(when, false);
      click(when, k === n - 1);
      R.clicked = k;
    }
  }
  for (const k of ticksIn(T, T.t, T.t + TICK_AHEAD)) {
    const when = at + (k.t - T.t);
    if (when <= R.ticked + 0.02) continue;
    tick(when, k.accent);
    R.ticked = when;
  }
}

/* The take runs on the audio clock, so what is seen stays with what is heard. But that clock can stand still
   (the phone paused the sound, see synth.js), and a take must never freeze: when the audio clock has not moved
   for a quarter of a second, or the sound is not running, the frame's time comes from the wall clock. */
function loop() {
  if (!R) return;
  const t = clock(), w = wall(), dw = w - R.lastW;
  let d = t - R.last;
  R.stall = d > 0 ? 0 : R.stall + dw;
  if (R.stall > 0.25 || !audioRunning()) d = dw;
  let dt = Math.max(0, Math.min(0.1, d));
  R.last = t; R.lastW = w;
  if (R.hold) {
    /* waiting for the microphone (onCount): released once it is open and the sound's clock has run a little
       since, or after a second and a half if that clock will not move (the wall clock then drives the take) */
    const h = R.hold;
    if (h.ready && (t - h.a0 >= 0.12 || w - h.w0 > 1.5)) {
      R.hold = null; R.stall = 0;
      R.micDelay = audioDelay();
      countdown("Ready"); hint("", "sing as the notes reach the line");
    } else {
      if (!h.told && w - h.since > 0.8) { h.told = true; hint("", "waiting for the microphone…"); }
      dt = 0;
    }
  }
  if (!R.paused) frame(dt);
  if (R && R.T.phase !== "done") R.raf = requestAnimationFrame(loop);
}

/* One frame: read the voice, advance the take, draw. Also used by window.LC.run() with a fixed dt. */
export function frame(dt) {
  if (!R || !R.started || R.paused) return;
  const T = R.T, P = R.plan;
  /* the auto-singers sing with the picture: the note under the head, which is `T.delay` behind the beat */
  const i = sungIndex(T);
  let v = T.phase === "sing" ? readVoice(sungTime(T), i >= 0 ? P.notes[i] : null, T) : null;
  const heard = v;
  /* the microphone also hears the phone's own bells: a frame that is one of them is not the singer */
  if (v && app.S.dev.voice === "mic" && heardItself(v.midi, notesNear(P.notes, T.t, latOf(T)))) v = null;
  if (T.phase === "sing") R.raw.push([T.t, heard ? heard.midi : null, heard ? heard.conf : 0, heard ? heard.rms : null, !!heard && !v]);
  const evs = stepTake(T, dt, v);
  if (T.phase !== "done") bookTicks();
  for (const e of evs) {
    if (e.type === "demo-note") hint("Listen first", P.reps.length > 1 ? `Then ${P.reps.length} rounds: ${wayWords(P)}` : `${P.drill.name} · ${noteName(P.notes[e.i].midi)}`);
    else if (e.type === "phase" && e.phase === "count") onCount();
    else if (e.type === "beat") { const w = ["3", "2", "1", "Go"][e.k - (P.countBeats - 4)] || ""; countdown(w, w === "Go"); hint("", "sing as the notes reach the line"); }
    else if (e.type === "phase" && e.phase === "sing") {
      hint("Sing", `“${P.syl}”`); hideTip();
      countdown(""); // Go has had its beat (with reduced motion it would not fade by itself)
      const pz = document.querySelector("[data-act=pause]");
      if (pz) pz.hidden = false;
      document.getElementById("take-head")?.classList.add("singing");
    }
    else if (e.type === "note-end") onNoteEnd(e.i, e.result);
    else if (e.type === "done") { draw(v, 0); return finish(e.grade); }
  }
  if (T.phase === "sing") {
    R.silentFor = v ? 0 : R.silentFor + dt;
    /* where the singer is: the picture's time, `T.delay` behind the beat. The round, its rest and the hints go
       by it; the chords and Go go by the beat */
    const ts = sungTime(T);
    const many = P.reps.length > 1, k = roundAt(P, ts), rep = P.reps[k], resting = many && ts < rep.s && k > 0;
    /* a rest between rounds is not the singer being silent: without this, "Sing out" flashed as every round began */
    if (ts > rep.e || ts < rep.s) R.silentFor = 0;
    if (many) { focusRound(k); playCues(); }
    /* Go on the last beat of a rest, as in the count before the take: the chord, Go, and the round on the next beat */
    const kb = roundAt(P, T.t), rb = P.reps[kb];
    const go = many && kb > 0 && T.t >= rb.s - P.beat && T.t < rb.s;
    if (go !== !!R.goOn) { R.goOn = go; countdown(go ? "Go" : "", go); }
    /* one thing at a time: a note's verdict, or where the next round starts, or that nothing is heard. "Sing" is
       said as the singing begins and then goes; it used to sit there for the whole take */
    if (R.flash && T.t < R.flash.until) hint(R.flash.text, "", R.flash.level);
    else if (resting) hint(dirWords(P, rep), `${roundWord(P, k)} · from ${noteName(P.notes[rep.i0].midi)}`);
    else if (R.silentFor > 1.4 && ts < rep.e) hint("Sing out", "the judge can’t hear you yet"); // never in the rest between rounds
    else if (ts < 1.2 && !R.marks.length) hint("Sing", `“${P.syl}”`);
    else hint("", "");
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

/* The head follows the voice, but a jump far from the phrase has to last before the head goes there: a
   voice starting a note is often read far too low or too high for a moment. */
function steadyVoice(v, t, notes, lat) {
  if (!v || v.midi == null) { R.jump = null; return null; }
  const near = notes.filter((n) => t - lat >= n.s - 0.5 && t - lat <= n.e + 0.5).map((n) => n.midi);
  const far = near.length && near.every((m) => Math.abs(v.midi - m) > FAR_DRAW);
  if (!far) { R.jump = null; R.headMidi = v.midi; return v.midi; }
  if (!R.jump || Math.abs(R.jump.midi - v.midi) > 1.5) R.jump = { midi: v.midi, since: t };
  if (t - R.jump.since >= OUTLIER_SECONDS) { R.headMidi = v.midi; return v.midi; }
  return R.headMidi ?? null;
}

/* beside the head, when the voice is shown an octave from where it really is (lane-body.js onChart) */
const OCT_WORDS = { 1: "an octave high", 2: "two octaves high", "-1": "an octave low", "-2": "two octaves low" };
const octTag = (oct, x, y) => (OCT_WORDS[oct] ? `<text class="oct-tag" x="${(x + 26).toFixed(1)}" y="${(y - 14).toFixed(1)}">${oct > 0 ? "↑" : "↓"} ${OCT_WORDS[oct]}</text>` : "");

/* a critically damped spring towards `want`, with time constant tau, stepped finely so a slow frame is fine */
function springHead(want, tau, dt) {
  if (!(dt > 0)) { R.headY = want; R.headV = 0; return; }
  const w = 1 / tau, n = Math.max(1, Math.ceil(dt * 480)), h = dt / n;
  let y = R.headY, v = R.headV || 0;
  for (let i = 0; i < n; i++) { v += (w * w * (want - y) - 2 * w * v) * h; y += v * h; }
  R.headY = y; R.headV = v;
}

function draw(v, dt = 1 / 60) {
  const T = R.T, P = R.plan;
  /* the notes come to the head `T.delay` after their beat while the take is sung (and counted in); in the demo
     they are with the sound */
  const tp = sungTime(T), late = T.t - tp;
  const shift = PLAY_X - tp * PXS;
  const notes = document.getElementById("lane-notes");
  if (notes) notes.setAttribute("transform", `translate(${shift.toFixed(1)} 0)`);
  document.getElementById("lane-labels")?.setAttribute("transform", `translate(${shift.toFixed(1)} 0)`);
  /* What is drawn of the voice (the designer, 2026-11-27: the line was a mess; a line thinner than the note's button,
     that does not hide the note, without the lines that jump up and down; the cat's head shows what is heard).
     For some hours that was a thin FLAT line on each note sung. the designer, the same day: "Inside the note it can show
     the fluctuation of the note, don't need to draw the lines right around the note." So: a thin line that
     follows the voice, drawn only while the voice is inside a note's block (lane-body.js laneInside); nothing
     beside a block or between two; and the head alone says where the voice is. The line lies between the note
     blocks and their labels. Until that day the body was as fat as a block and lay over it.
     The other ways of drawing (Dev tools → lane) still go through laneShape. */
  const voiced = T.frames.map((f) => (f.midi == null || f.conf < 0.5 ? { t: f.t, midi: null } : f));
  /* the line is drawn where it was sung, not where it was heard: back by the delay the matcher measures */
  const measured = T.matcher.offsets.length ? T.matcher.latency : null;
  R.lag = easeLag(R.lag, lagToDraw(measured, R.lagKnown), dt);
  const lag = R.lag;
  const xOf = (t) => PLAY_X - (T.t - t + lag) * PXS, mode = app.S.dev.shortBody || "snap";
  const shape = mode === "snap"
    ? { ...laneInside({ frames: voiced, notes: P.notes, off: lag + T.delay, xOf, yOf, half: BLOCK_H / 2 }), threads: [], slim: false, headJoins: false }
    : laneShape({ frames: voiced, notes: P.notes, lat: (measured ?? lag) + T.delay, now: T.t, mode, holds: "snap", xOf, yOf });
  if (T.phase === "demo" || T.phase === "count") { R.headY = guideY(T.phase === "demo" ? T.t : 0); R.headV = 0; }
  else {
    const hv = steadyVoice(v, T.t, P.notes, latOf(T));
    /* a voice off the chart by an octave is shown on the note of the same name, with a tag that says so */
    const seen = onChart(hv, R.geo.lo - 0.5, R.geo.hi + 0.5);
    R.oct = hv != null ? seen.oct : 0;
    R.seenMidi = hv != null ? seen.midi : null;
    const want = hv != null ? yOf(seen.midi) : guideY(tp);
    const semitone = Math.abs(yOf(61) - yOf(60));
    springHead(want, hv == null ? 0.08 : Math.abs(want - R.headY) > semitone ? LAND : FOLLOW, dt);
  }
  markGrid(T.phase === "sing" && v ? R.seenMidi ?? v.midi : v ? v.midi : null);
  /* join the newest end of the line to the head, which eases after the voice */
  const sung = voiced.length && voiced[voiced.length - 1].midi != null;
  const joinTo = (list) => { const l = list[list.length - 1]; if (v && sung && l && PLAY_X - l[l.length - 1].x < 4 + lag * PXS) l.push({ x: PLAY_X, y: R.headY }); };
  joinTo(shape.threads);
  if (shape.headJoins) joinTo(shape.subs);
  let mood = R.mood;
  if (T.t > R.moodUntil) mood = T.phase === "sing" && v ? "sing" : "listen";
  const marks = R.marks.map((m) => ({ x: PLAY_X - (T.t - m.t - late) * PXS, y: yOf(m.midi) - 26, type: m.type })).filter((m) => m.x > -20);
  const bob = T.phase === "demo" ? Math.sin(T.t * 6) * 1.5 : 0;
  const el = document.getElementById("lane-cat");
  /* the cat's mouth shows the sound: while a demo note sounds, while it waits for the singer, and while it hears one */
  const open = R.saying || (T.phase === "demo" ? currentIndex(T) >= 0 : T.phase === "count" ? true : !!v);
  const mouth = open || P.mouth === "mm" ? P.mouth : null;
  const line = document.getElementById("lane-line");
  if (line) line.innerHTML = laneCatSvg({ subs: shape.subs, threads: shape.slim ? shape.threads : [], slim: shape.slim, thin: true, tail: shape.tail, look: R.g.look, yarn: R.g.yarn, kind: R.g.kind, animal: R.g.animal });
  if (el) el.innerHTML = laneCatSvg({ subs: [], threads: [], head: { x: PLAY_X, y: R.headY + bob, dir: 1 }, tail: null, look: R.g.look, yarn: R.g.yarn, kind: R.g.kind, animal: R.g.animal, mood, marks, mouth }) + octTag(T.phase === "sing" && v ? R.oct : 0, PLAY_X, R.headY + bob);
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
  return c.off === 1 ? "One note got away. It left a pill in the knitting." : `${c.off} notes got away. Each left a pill in the knitting.`;
}

function finish(grade) {
  const heardBy = micInfo();
  setBoost(1);
  closeMic(); // the singing is over: the result sounds play at full volume
  holdAudio(false); markAudioStale();
  try { keepTake({ raw: R.raw, plan: R.plan, grade, latency: latOf(R.T), extra: { headDelay: R.T.delay, voice: app.S.dev.voice, mic: heardBy, retake: !!R.retake, sound: audioState(), soundDelay: R.micDelay ?? audioDelay(), ...(R.plan.reps.length > 1 ? { rounds: R.plan.reps.map((r) => [r.i0, r.n, r.shift]) } : {}) } }); } catch { /* debugging aid only */ }
  const { ctx, retake, plan } = R;
  /* did the held notes hold still? read beside the grade, which it does not touch (drill/steady.js) */
  let steady = "";
  try { steady = steadyLine(steadiness(R.T.frames, plan, latOf(R.T))); } catch { /* the result does without it */ }
  const S = app.S, real = app.real();
  /* what this take found about the delay, for the first notes of the next one (saved below with the take) */
  if (S.dev.voice === "mic" && grade.counted && R.T.matcher.offsets.length) St.keepLag(S, R.T.matcher.latency);
  const learnedAll = St.tutorialDone(S);
  cancelAnimationFrame(R.raf);
  hideTip();
  const props = app.props;
  const before = retake ? St.stepsOf(S, ctx.place, ctx.time, ctx.zone)[ctx.step - 1] : null;
  const out = retake ? St.retakeStep(S, ctx, grade, real) : St.recordTake(S, ctx, grade, real);
  app.save();
  const outcome = retake ? props.outcome : out;
  const name = garmentName(ctx.time, ctx.zone);
  R = null;
  if (!out.counted) {
    /* nothing heard: it doesn't count and nothing is lost; the second time in a row, offer the microphone test */
    app.silentRuns = (app.silentRuns || 0) + 1;
    const el = sheet(`<h3>It didn’t hear that.</h3>
      <p class="muted">${retake ? "This one doesn’t count. The step you sang before stays." : "The microphone didn’t pick up any voice. This take doesn’t count, and nothing is lost."}</p>
      <div class="row"><button class="btn primary" data-a="again">Sing again</button><button class="btn" data-a="ok">${retake ? "Keep the first one" : "Home"}</button></div>
      ${app.silentRuns >= 2 ? `<button class="btn ghost" data-a="test">Test the microphone</button>` : ""}`, { dismissable: false });
    el.querySelector("[data-a=again]").onclick = () => { closeSheet(true); show("take", props); };
    el.querySelector("[data-a=ok]").onclick = () => { closeSheet(true); retake ? accept(ctx, outcome) : show("home"); };
    const t = el.querySelector("[data-a=test]");
    if (t) t.onclick = () => { closeSheet(true); show("home"); openMicTest(); };
    return;
  }
  app.silentRuns = 0;
  const mood = takeMood(grade);
  let line = resultLine(grade, mood);
  if (retake && before?.tuft && !grade.tuft) line = `The fold is smoothed out. ${line}`;
  if (mood === "good") { chime(); placeSfx(ctx.place, ctx.time, "hit", 0.8); }
  else placeSfx(ctx.place, ctx.time, mood === "off" ? "miss" : "hit", 0.7);
  /* LATER (decision 5, 2026-11-12: add nothing, test first). Option 甲 would make this moment the best beat in
     the game: the fold smooths out, the cat purrs, the judge's ear twitches. the designer wants to come back to it after
     the ten-day test. See docs/later.md. */
  const g = St.garmentSpec(S, ctx.place, ctx.time, ctx.zone);
  /* the legend only for the first three results; the key buttons when half the notes or more got away
     (game-flow board, decision C: they move the same Lower / Higher as Settings) */
  const legend = S.takes.filter((t) => t.counted).length <= 3;
  /* the designer, 2026-11-24 (Vocalista review, "一口氣唱下去"): the main button sings the next step of the same garment
     without going Home. Not when the garment or the time of day has just been finished (Home shows it going on),
     and not for a step sung again from the Wardrobe. */
  const nt = !outcome?.garmentDone && !outcome?.timeDone && ctx.back !== "wardrobe" ? St.nextTake(S, ctx.place) : null;
  const onward = nt && nt.time === ctx.time && nt.zone === ctx.zone && nt.step > ctx.step ? nt : null;
  const keyfix = grade.counts.off * 2 >= grade.notes.length;
  const el = sheet(`
    <div class="rhead">${faceIconSvg(takeFace(mood, learnedAll, !retake && out.learned), { size: 56 })}<div><p class="eyebrow">${retake ? "Sung again" : "Done"} · ${esc(name)} ${ctx.step} / ${STEPS}</p><h3>${esc(line)}</h3></div></div>
    <div class="seg">${segmentSvg({ shape: grade.shape, folds: grade.folds, look: g.look, yarn: g.yarn, kind: g.kind, animal: g.animal })}</div>
    <div class="note-dots${plan.reps.length > 1 ? " rounds" : ""}" role="img" aria-label="${grade.counts.good} on the note, ${grade.counts.mid} close, ${grade.counts.off} off the note">${plan.reps.map((rep) => `<span>${grade.notes.slice(rep.i0, rep.i0 + rep.n).map((r) => `<i class="nd ${r.verdict}">${NOTE_GLYPH[r.verdict]}</i>`).join("")}</span>`).join("")}</div>
    ${legend ? `<p class="note-key"><i class="nd good">✓</i> on the note <i class="nd mid">~</i> close <i class="nd off">?</i> off the note</p>` : ""}
    ${steady ? `<p class="steady-line">${esc(steady)}</p>` : ""}
    ${treatLine(out.treats)}
    ${onward
      ? `<div class="row onward"><button class="btn again" data-a="retake" aria-label="Sing this step again" title="Sing this step again">↻</button><button class="btn primary" data-a="next">Next step · ${onward.step} of ${STEPS}</button></div>
    <button class="linkish stop-here" data-a="ok">Stop here</button>`
      : `<div class="row"><button class="btn" data-a="retake">Sing this step again</button><button class="btn primary" data-a="ok">Keep it</button></div>`}
    ${keyfix ? `<p class="keyfix" id="keyfix">Felt out of reach? <button data-a="lower" ${S.settings.nudge <= -5 ? "disabled" : ""}>Lower the key</button> · <button data-a="higher" ${S.settings.nudge >= 5 ? "disabled" : ""}>Raise the key</button></p>` : ""}`, { dismissable: false });
  el.querySelector("[data-a=ok]").onclick = () => { closeSheet(true); accept(ctx, outcome); };
  const on = el.querySelector("[data-a=next]");
  if (on) on.onclick = () => { closeSheet(true); show("take", { ctx: { ...onward, ...(ctx.back ? { back: ctx.back } : {}) } }); };
  el.querySelector("[data-a=retake]").onclick = () => { closeSheet(true); show("take", { ctx, retake: true, outcome }); };
  const key = (d) => {
    S.settings.nudge = Math.max(-5, Math.min(5, S.settings.nudge + d));
    app.save();
    const n = S.settings.nudge;
    el.querySelector("#keyfix").textContent = `Key ${n > 0 ? "+" : ""}${n}: every drill is a semitone ${d < 0 ? "lower" : "higher"} now. Change it back in Settings.`;
  };
  el.querySelector("[data-a=lower]")?.addEventListener("click", () => key(-1));
  el.querySelector("[data-a=higher]")?.addEventListener("click", () => key(1));
  if (grade.counts.off > 0) setTimeout(() => tip("fold", el.querySelector(".seg"), { at: "below", x: 0.6 }), 380);
}

/* After "Keep it": a finished time plays the reset beat; a finished garment asks for the next one. */
function accept(ctx, outcome) {
  if (outcome?.timeDone) return show("beat", { place: ctx.place, time: outcome.timeDone });
  if (outcome?.garmentDone) {
    show("home", { glow: { zone: ctx.zone, step: ctx.step }, noAutoPick: true });
    const nm = garmentName(ctx.time, ctx.zone).toLowerCase();
    return setTimeout(() => app.screens.home.openPicker?.({ after: `The ${nm} is on.`, tipText: `The ${nm} is in the Wardrobe now. Other places are open too.` }), 600);
  }
  /* a step sung again from the Wardrobe goes back there; one of another time of day doesn't glow on home */
  if (!outcome && ctx.back === "wardrobe") return show("wardrobe");
  if (ctx.time !== St.currentTime(app.S, ctx.place)) return show("home");
  show("home", { glow: { zone: ctx.zone, step: ctx.step } });
}

app.screens.take = { render, fullscreen: true, leave: () => stop() };

/* Test hook: step the running take by hand when animation frames are throttled. */
export function runFrames(seconds, fps = 60) {
  for (let k = 0; k < seconds * fps && R && R.T.phase !== "done"; k++) frame(1 / fps);
  if (R) { R.last = clock(); R.lastW = wall(); R.stall = 0; }
  return R ? R.T.phase : "done";
}
export const running = () => R;
