/* Settings (game-flow board, section 6): a tab of the bottom row (the designer, 2026-11-15; it was a full page behind the
   gear on Home). Four groups: your voice (range,
   key, hear the first note), the microphone (and a test), sound and letters, help. Cat kinds moved to the
   Wardrobe. The dev tools the designer uses to walk the whole month stay at the very bottom, marked as testing only. */
import { app, show, sheet, closeSheet, esc, $, $$, toast, VOICE_MODES, LANE_MODES } from "./app.js";
import { lastTakeText } from "../drill/pitchlog.js";
import * as St from "../state.js";
import { ZONES, timeById, garmentName, sylFor, drillEditCount, placeById } from "../content.js";
import { DEFAULT_RANGE, planTake } from "../drill/drills.js";
import { noteName } from "../audio/pitch.js";
import { setMuted, hum, audioContext, now, demoNote, prepareDemo, audioState, playBuffer } from "../audio/synth.js";
import { loadFile } from "../audio/files.js";
import { DEMO_VOICES } from "../audio/demo-voices.js";
import { MUSIC, setTune, startMusic, stopMusic } from "../audio/ambient.js";
import { openMic, closeMic, readMic, micReady, MIC_MODES, setMicMode, micMode } from "../audio/mic.js";
import { resetTips } from "./tips.js";

/* the first note of the next step, in the current key */
function firstNote(S) {
  const nt = St.nextTake(S) || { step: 1, time: "morning", seed: "onsen.morning.scarf" };
  const plan = planTake({ step: nt.step, time: nt.time, zone: nt.zone, range: S.settings.range, nudge: S.settings.nudge, seed: nt.seed });
  return { midi: plan.notes[0].midi, step: nt.step };
}

async function micState() {
  if (micReady()) return "allowed";
  try { const p = await navigator.permissions?.query({ name: "microphone" }); if (p) return p.state === "granted" ? "allowed" : p.state === "denied" ? "blocked" : "ask"; } catch {}
  return "ask";
}
const MIC_LINE = {
  allowed: ["ok", "Allowed", "Pitch only. Nothing is recorded and nothing leaves this phone."],
  ask: ["", "Not asked yet", "The game asks the first time you sing. Pitch only, nothing is recorded."],
  blocked: ["no", "Blocked", "In the address bar, tap the ᴀA or lock icon and set Microphone to Allow."],
};

function render(root) {
  const S = app.S;
  const r = S.settings.range, range = r || DEFAULT_RANGE;
  const fn = firstNote(S), nud = S.settings.nudge;
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Settings</span></div></header>
    <section class="settings">
      <div class="card"><h4>Your voice</h4>
        <div class="set"><span><b>Range</b><small>${r ? `${noteName(r.low)} – ${noteName(r.high)}` : `Not measured. Using ${noteName(DEFAULT_RANGE.low)} – ${noteName(DEFAULT_RANGE.high)}`}</small></span><button class="btn small" data-a="range">${r ? "Measure again" : "Measure"}</button></div>
        <div class="set"><span><b>Key</b><small>Moves every drill up or down</small></span><div class="nudge"><button class="btn small" data-a="down" aria-label="A semitone lower" ${nud <= -5 ? "disabled" : ""}>Lower</button><b>${nud > 0 ? "+" : ""}${nud}</b><button class="btn small" data-a="up" aria-label="A semitone higher" ${nud >= 5 ? "disabled" : ""}>Higher</button></div></div>
        <div class="set"><span><b>First note of step ${fn.step}</b><small>${noteName(fn.midi)}</small></span><button class="btn small" data-a="hear">▶ Hear it</button></div>
      </div>
      <div class="card"><h4>Microphone</h4>
        <div class="set"><span><b id="mic-state">…</b><small id="mic-note">&nbsp;</small></span><button class="btn small" data-a="test">Test it</button></div>
      </div>
      <div class="card"><h4>Sound and letters</h4>
        <label class="toggle"><input type="checkbox" data-a="sound" ${S.settings.sound ? "checked" : ""}><span>Game sound (the hum, the bells, taps on the home page)</span></label>
        <label class="toggle"><input type="checkbox" data-a="music" ${S.settings.music !== false ? "checked" : ""}><span>Music on the home page</span></label>
        <label class="toggle"><input type="checkbox" data-a="letters" ${S.settings.letterNotify ? "checked" : ""}><span>Tell me when a letter arrives</span></label>
        <p class="muted small">Only a letter, never a daily reminder. Phone notifications aren’t built yet; for now the letter shows up in the game.</p>
      </div>
      <div class="card"><h4>Help</h4>
        <div class="set"><span><b>Show the tips again</b></span><button class="btn small" data-a="tips">Reset</button></div>
        <div class="set"><span><b>Start over</b><small>Clears progress, postcards and range in this browser</small></span><button class="btn small danger-line" data-a="reset">Clear</button></div>
      </div>
      <p class="sub">Longcat &amp; the Judge · demo build · <button class="linkish" data-a="dev">dev tools (testing only)</button></p>
    </section>`;
  micState().then((st) => {
    const [cls, name, note] = MIC_LINE[st], a = $("#mic-state", root), b = $("#mic-note", root);
    if (a) a.innerHTML = `<i class="mic-dot ${cls}"></i>${esc(name)}`;
    if (b) b.textContent = note;
  });
  $("[data-a=range]", root).onclick = () => show("range", { from: "settings" });
  const nudge = (d) => { S.settings.nudge = Math.max(-5, Math.min(5, S.settings.nudge + d)); app.save(); render(root); };
  $("[data-a=down]", root).onclick = () => nudge(-1);
  $("[data-a=up]", root).onclick = () => nudge(1);
  $("[data-a=hear]", root).onclick = () => { audioContext(); hum(now() + 0.05, firstNote(S).midi, 1.4); };
  $("[data-a=test]", root).onclick = () => openMicTest();
  $("[data-a=sound]", root).onchange = (e) => { S.settings.sound = e.target.checked; setMuted(!S.settings.sound); app.save(); };
  $("[data-a=music]", root).onchange = (e) => { S.settings.music = e.target.checked; app.save(); };
  $("[data-a=letters]", root).onchange = (e) => { S.settings.letterNotify = e.target.checked; app.save(); if (e.target.checked) toast("Noted. Notifications aren’t built yet; letters show up in the game."); };
  $("[data-a=tips]", root).onclick = () => { resetTips(); toast("The tips will show again."); };
  $("[data-a=dev]", root).onclick = () => openDev();
  $("[data-a=reset]", root).onclick = () => confirmReset();
}

/* Test the microphone: a moving level bar and the note it hears, so a player can tell what is wrong. */
export async function openMicTest() {
  audioContext();
  const el = sheet(`<h3>Say “ahh”</h3><div class="meter"><i id="mt-bar"></i></div>
    <div class="heard"><b id="mt-note">–</b><span id="mt-say">Listening…</span></div>
    <p class="muted small">If the bar doesn’t move: check that this page may use the microphone (the ᴀA or lock icon in the address bar), and that nothing covers it.</p>
    <button class="btn primary" data-a="done">Done</button>`, { onClose: () => end() });
  let raf = 0, live = true;
  /* close the microphone again: on iPhone an open microphone keeps every sound quiet, like a call */
  const end = () => { if (!live) return; live = false; cancelAnimationFrame(raf); closeMic(); };
  el.querySelector("[data-a=done]").onclick = () => { end(); closeSheet(); if (app.screen === "settings") show("settings"); };
  const ok = await openMic();
  if (!ok) { el.querySelector("#mt-say").textContent = "The microphone isn’t allowed yet."; return; }
  const loop = () => {
    if (!live || !document.getElementById("mt-bar")) return end();
    const f = readMic(), lvl = f ? Math.min(1, (f.rms || 0) * 12) : 0;
    document.getElementById("mt-bar").style.width = `${Math.round(lvl * 100)}%`;
    const heard = f && f.conf >= 0.5;
    document.getElementById("mt-note").textContent = heard ? noteName(f.midi) : "–";
    document.getElementById("mt-say").textContent = heard ? "The judge can hear you." : lvl > 0.05 ? "Something, but not a sung note yet." : "Listening…";
    raf = requestAnimationFrame(loop);
  };
  loop();
}

function confirmReset() {
  const el = sheet(`<h3>Start over?</h3><p class="muted">This clears the progress, postcards and range saved in this browser. It can’t be undone.</p>
    <div class="row"><button class="btn danger" data-a="yes">Clear and start over</button><button class="btn" data-a="no">Keep everything</button></div>`, { dismissable: false });
  el.querySelector("[data-a=yes]").onclick = () => { closeSheet(true); app.reset(); show("onboard"); };
  el.querySelector("[data-a=no]").onclick = () => closeSheet();
}

/* ---------- dev tools ---------- */
export function openDev() {
  const S = app.S, real = app.real();
  const place = S.here, time = St.currentTime(S, place), nt = St.nextTake(S, place);
  const last = S.takes.slice(-5).reverse().map((t) => `${t.date} ${t.time}.${t.zone} step ${t.step}${t.retake ? " again" : ""}: ${t.counted ? "counted" : "not counted"} · voiced ${t.voiced ?? "–"}`).join("<br>");
  const el = sheet(`
    <h3>Dev tools</h3>
    <p class="muted small">Today is ${St.todayKey(S, real)} (offset ${S.dev.dayOffset} days) · sound ${audioState()} · faces learned ${S.faces} / 12 · sung on ${S.journal.length} days · ${S.takes.length} takes</p>
    <h4>Drills</h4>
    <p class="muted small">Move the twelve steps of a time of day, or change a drill’s notes and speed. ${drillEditCount(S.dev.drillEdits) ? `${drillEditCount(S.dev.drillEdits)} changed on this phone.` : "Nothing changed yet."}</p>
    <button class="btn small" data-a="drills">Open the drill editor</button>
    <h4>Voice source</h4>
    <div class="radio">${VOICE_MODES.map((v) => `<label><input type="radio" name="voice" value="${v.id}" ${S.dev.voice === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <h4>Microphone</h4>
    <p class="muted small">How the phone plays while it listens. If the cat stops following your voice, or the sound crackles, try the other one.</p>
    <div class="radio">${MIC_MODES.map((v) => `<label><input type="radio" name="micmode" value="${v.id}" ${micMode() === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <h4>Cat body on short notes</h4>
    <div class="radio">${LANE_MODES.map((v) => `<label><input type="radio" name="lane" value="${v.id}" ${(S.dev.shortBody || "snap") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <h4>Demo voice</h4>
    <div class="radio">${DEMO_VOICES.map((v) => `<label><input type="radio" name="demo" value="${v.id}" ${(S.dev.demoVoice || "rec") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <button class="btn small" data-a="hear-demo">▶ Hear five notes</button>
    <h4>Home music</h4>
    <p class="muted small">Tunes to compare. A to D are made in the page; E is a short trial loop of sampled instruments. Pick one and it plays while this panel is open; it is the tune Home plays from then on.</p>
    <div class="radio">${MUSIC.map((v) => `<label><input type="radio" name="music" value="${v.id}" ${(S.dev.homeMusic || "box") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <h4>Trial sounds</h4>
    <p class="muted small">Rendered from sampled instruments by the audio engine, not made in the page. Here to be listened to on a phone; nothing in a take uses them yet.</p>
    <button class="btn small" data-a="hear-chord">▶ Hear the chord (piano, C)</button>
    <h4>Progress (${esc(place)} · ${time ? timeById(time).name : "all nine"}${nt ? ` · ${garmentName(nt.time, nt.zone)}, step ${nt.step}` : ""})</h4>
    <div class="grid2">
      <button class="btn small" data-a="one" ${nt ? "" : "disabled"}>Count this step</button>
      <button class="btn small" data-a="tuft" ${nt ? "" : "disabled"}>Count it, with two folds</button>
      <button class="btn small" data-a="garment" ${nt ? "" : "disabled"}>Finish this garment</button>
      <button class="btn small" data-a="time" ${time ? "" : "disabled"}>Finish this time of day</button>
    </div>
    <p class="muted small">Start again empties ${esc(placeById(place).name)} only: its garments, yarns, wraps and postcards. Your cats, treats and the other places stay. It cannot be undone.</p>
    <button class="btn small" data-a="reset-place">Start this place again</button>
    <h4>Date</h4>
    <div class="grid2">
      <button class="btn small" data-a="day">+1 day</button>
      <button class="btn small" data-a="month">Jump to the 1st of next month</button>
      <button class="btn small" data-a="today">Back to today</button>
      <button class="btn small" data-a="range">Measure range</button>
    </div>
    <h4>Last take's pitch numbers</h4>
    <p class="muted small">What the tracker read, frame by frame. Numbers only, no sound. Copy them and paste them into the chat to debug.</p>
    <button class="btn small" data-a="pitchlog">Copy the numbers</button>
    <textarea class="pitchlog" readonly hidden></textarea>
    <h4>Last five takes</h4>
    <p class="muted small mono">${last || "none yet"}</p>`, { tall: true, onClose: () => { if (app.screen !== "home") stopMusic(); } });
  const pl = el.querySelector("[data-a=pitchlog]"), ta = el.querySelector(".pitchlog");
  pl.onclick = async () => {
    const text = lastTakeText();
    if (!text) return toast("Sing a take first.");
    try { await navigator.clipboard.writeText(text); toast("Copied. Paste it into the chat."); }
    catch { ta.hidden = false; ta.value = text; ta.focus(); ta.select(); toast("Select all and copy."); }
  };
  $$("input[name=micmode]", el).forEach((i) => (i.onchange = () => { S.dev.micMode = i.value; setMicMode(i.value); closeMic(); app.save(); toast(`Microphone: ${MIC_MODES.find((v) => v.id === i.value).name}`); }));
  $$("input[name=demo]", el).forEach((i) => (i.onchange = () => { S.dev.demoVoice = i.value; app.save(); hearDemo(); }));
  const hearDemo = async () => { audioContext(); const m = firstNote(S).midi, hs = sylFor("bottom", St.currentTime(S, place) || "morning"), kind = await prepareDemo(S.dev.demoVoice, hs, [0, 2, 4].map((d) => m + d)); [0, 2, 4, 2, 0].forEach((d, k) => demoNote(kind, now() + 0.08 + k * 0.6, m + d, 0.52, hs)); };
  el.querySelector("[data-a=hear-demo]").onclick = hearDemo;
  /* the trial chord: 0.8 puts it about where the recorded voice sits (both measured, neither heard: a draft) */
  el.querySelector("[data-a=hear-chord]").onclick = () => {
    if (S.settings.sound === false) return toast("All game sound is off. Turn it on in Settings first.");
    const c = audioContext();
    loadFile(c, "drill.chord.trial").then((e) => playBuffer(e.buf, { t: now() + 0.05, lead: e.lead, vol: 0.8 }), () => toast("The chord's file did not load."));
  };
  $$("input[name=music]", el).forEach((i) => (i.onchange = () => { S.dev.homeMusic = i.value; app.save(); setTune(i.value);
    /* away from Home the music is not playing: start it so the tune can be heard here; it stops when the panel closes */
    if (S.settings.sound === false) return toast("All game sound is off. Turn it on in Settings first.");
    startMusic(time || "night", { fade: 0.6 });
    toast(`Home music: ${MUSIC.find((v) => v.id === i.value).name}`);
  }));
  $$("input[name=lane]", el).forEach((i) => (i.onchange = () => { S.dev.shortBody = i.value; app.save(); toast(`Short notes: ${LANE_MODES.find((v) => v.id === i.value).name}`); }));
  $$("input[name=voice]", el).forEach((i) => (i.onchange = () => { S.dev.voice = i.value; app.save(); toast(`Voice source: ${VOICE_MODES.find((v) => v.id === i.value).name}`); }));
  const done = (out, name = "") => {
    app.save();
    closeSheet(true);
    if (out?.timeDone) return show("beat", { place, time: out.timeDone });
    if (out?.garmentDone) { show("home", { noAutoPick: true }); return setTimeout(() => app.screens.home.openPicker({ after: `The ${(name || "garment").toLowerCase()} is on.` }), 300); }
    show("home");
  };
  const act = (a, fn) => { const b = el.querySelector(`[data-a=${a}]`); if (b) b.onclick = fn; };
  act("one", () => done(St.recordTake(S, St.nextTake(S, place), St.devGrade(false), real)));
  act("tuft", () => done(St.recordTake(S, St.nextTake(S, place), St.devGrade(true), real)));
  act("garment", () => { const name = garmentName(nt.time, nt.zone); const out = St.devFillGarment(S, place, real, { tufts: true }); done(out, name); });
  act("time", () => {
    let out = null;
    for (const z of ZONES) if (!St.garmentDone(S, place, time, z.id)) { St.chooseZone(S, place, z.id); out = St.devFillGarment(S, place, real, { tufts: true }); }
    done(out);
  });
  /* asks once more on the button itself before anything goes */
  let sure = false;
  act("reset-place", () => {
    if (!sure) { sure = true; el.querySelector("[data-a=reset-place]").textContent = `Tap again to empty ${placeById(place).name}`; return; }
    St.devResetPlace(S, place);
    done(null);
  });
  act("drills", () => { closeSheet(true); show("drills", { time: time || "morning" }); });
  act("day", () => { S.dev.dayOffset++; done(null); });
  act("month", () => { St.devAdvanceToNextMonth(S, real); done(null); });
  act("today", () => { S.dev.dayOffset = 0; done(null); });
  act("range", () => { closeSheet(true); show("range", { from: "settings" }); });
}

app.screens.settings = { render };
