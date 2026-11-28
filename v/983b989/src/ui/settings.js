/* Settings (game-flow board, section 6): a tab of the bottom row (the designer, 2026-11-15; it was a full page behind the
   gear on Home). Four groups: your voice (range,
   key, hear the first note), the microphone (and a test), sound and letters, help. Cat kinds moved to the
   Wardrobe. The dev tools the designer uses to walk the whole month stay at the very bottom, marked as testing only. */
import { app, show, sheet, closeSheet, esc, $, $$, toast, VOICE_MODES, LANE_MODES } from "./app.js";
import { lastTakeText } from "../drill/pitchlog.js";
import * as St from "../state.js";
import { ZONES, timeById, garmentName, sylFor, drillEditCount, placeById } from "../content.js";
import { DEFAULT_RANGE, planTake, chordOf, CHORD_SPLIT, HEAD_DELAY } from "../drill/drills.js";
import { noteName } from "../audio/pitch.js";
import { setMuted, hum, audioContext, now, demoNote, prepareDemo, audioState, audioReport, playBuffer, pianoChord, preparePiano, setFxFiles, setDrillFiles, prepareDrill, endDrill, tick, click, chime, noteCue } from "../audio/synth.js";
import { loadFile } from "../audio/files.js";
import { DEMO_VOICES } from "../audio/demo-voices.js";
import { MUSIC, setTune, startMusic, stopMusic, setTapSource, prepareTaps, tapSound, musicState } from "../audio/ambient.js";
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
/* what the jungle's birds, acorn and heart sound like when pressed (ambient.js `tapSound`) */
const DRILL_SOURCES = [
  { id: "files", name: "Sound files (sampled instruments)" },
  { id: "page", name: "Made in the page (as before)" },
];
const TAP_SOURCES = [
  { id: "files", name: "Sound files (instruments, recordings, the designer's voice)" },
  { id: "page", name: "Made in the page (as before)" },
];
/* the singing screen's finer motion, a trial (take-screen.js, 2026-11-28): each piece on or off */
const DRILL_FX = [
  { id: "note", name: "A note that lands throws a puff of yarn and stars" },
  { id: "miss", name: "A note that gets away shakes and loses grey fluff" },
  { id: "combo", name: "A run of good notes: the print's stars, ink notes and paper" },
  { id: "head", name: "The cat's head stretches, leans and squashes as it moves" },
];
/* what sounds in the rest before the next round (take-screen.js `playCues`) */
/* Dev: how long after its beat a note reaches the cat's head (drills.js HEAD_DELAY; null = the game's) */
const HEAD_DELAYS = [null, 0, 0.1, 0.3, 0.5];
const BETWEEN = [
  { id: "chords", name: "Two quick piano chords (this round’s, the next one’s), then Go" },
  { id: "sung", name: "The cat sings the next first note (as before)" },
  { id: "both", name: "Both" },
];
export function openDev() {
  const S = app.S, real = app.real();
  const place = S.here, time = St.currentTime(S, place), nt = St.nextTake(S, place);
  const last = S.takes.slice(-5).reverse().map((t) => `${t.date} ${t.time}.${t.zone} step ${t.step}${t.retake ? " again" : ""}: ${t.counted ? "counted" : "not counted"} · voiced ${t.voiced ?? "–"}`).join("<br>");
  const el = sheet(`
    <h3>Dev tools</h3>
    <p class="muted small">Today is ${St.todayKey(S, real)} (offset ${S.dev.dayOffset} days) · sound ${audioState()} · faces learned ${S.faces} / 12 · sung on ${S.journal.length} days · ${S.takes.length} takes</p>
    <h4>Sound, live</h4>
    <p class="muted small">If the phone goes quiet, take a screenshot of this line. The clock should keep moving.</p>
    <p class="muted small" data-sound-live>…</p>
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
    <div class="radio">${DEMO_VOICES.map((v) => `<label><input type="radio" name="demo" value="${v.id}" ${(S.dev.demoVoice || "rec2") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <button class="btn small" data-a="hear-demo">▶ Hear five notes</button>
    <h4>Note area</h4>
    <p class="muted small">How a take is drawn. Sweep: the chart stands still and the cat’s head moves across it; a long drill moves on once the head is a third of the way in. Scroll: the head stands still and the notes come to it.</p>
    <div class="radio">${[["sweep", "Sweep (the game’s)"], ["scroll", "Scroll, as before"]].map(([id, name]) => `<label><input type="radio" name="view" value="${id}" ${(S.dev.view || "sweep") === id ? "checked" : ""}> ${name}</label>`).join("")}</div>
    <h4>Head delay</h4>
    <p class="muted small">How long after its beat a note reaches the cat’s head while you sing. The grade follows the picture. The beat, the count, the chords and Go do not move.</p>
    <div class="radio">${HEAD_DELAYS.map((d) => `<label><input type="radio" name="headdelay" value="${d ?? ""}" ${(S.dev.headDelay ?? null) === d ? "checked" : ""}> ${d == null ? `The game’s (${HEAD_DELAY} s)` : d === 0 ? "None: on the beat" : `${d} s`}</label>`).join("")}</div>
    <h4>Between rounds</h4>
    <p class="muted small">What sounds in the rest before the next round of a drill. The chords are piano notes rendered from a sampled upright: two beats before the round the chord of the round just sung and, half a beat later, the chord of the round to come; the screen says Go on the next beat.</p>
    <div class="radio">${BETWEEN.map((v) => `<label><input type="radio" name="between" value="${v.id}" ${(S.dev.between || "chords") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <button class="btn small" data-a="hear-rest">▶ Hear one rest (C, then up to D)</button>
    <h4>Sounds of things you press</h4>
    <p class="muted small">From sampled instruments, recordings and the designer's voice: the jungle's birds, acorn, heart, monkey and cat; the hot spring's sun or moon, lantern and yuzu in the water; the capybara and the yuzu on its head; a cat; and the sounds after a take at the hot spring and in the jungle. Or all of them as the page made them before.</p>
    <div class="radio">${TAP_SOURCES.map((v) => `<label><input type="radio" name="taps" value="${v.id}" ${(S.dev.tapSounds || "files") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <div class="row">${["bird-1", "bird-2", "bird-3", "acorn", "heart", "monkey", "window", "lamp", "dunk", "yuzu", "judge", "cat"].map((k) => `<button class="btn small" data-hear-tap="${k}">▶ ${k}</button>`).join("")}</div>
    <h4>Sounds of a take</h4>
    <p class="muted small">From sampled instruments (2026-11-28): the beat (a shaker, with a cajon's slap on a note's beat), the count (a woodblock), the end of each note (glockenspiel, vibraphone, marimba, in tune with the note), the combo chimes and the chimes after a take, a finished time of day and the range. Or all of them as the page made them before.</p>
    <div class="radio">${DRILL_SOURCES.map((v) => `<label><input type="radio" name="drillsounds" value="${v.id}" ${(S.dev.drillSounds || "files") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <div class="row">${["tick", "accent", "count", "go", "good", "mid", "off", "combo", "chime"].map((k) => `<button class="btn small" data-hear-drill="${k}">▶ ${k}</button>`).join("")}</div>
    <h4>Home music</h4>
    <p class="muted small">F is Home's tune: rendered from sampled instruments, one file for each time of day. A to D are the earlier tunes, made in the page; E is four bars that tried the path. Pick one and it plays while this panel is open; it is the tune Home plays from then on.</p>
    <div class="radio">${MUSIC.map((v) => `<label><input type="radio" name="music" value="${v.id}" ${(S.dev.homeMusic || "yuzu") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <h4>Singing screen motion (trial)</h4>
    <p class="muted small">Finer motion on the singing screen, each piece on its own. Off for everyone else. Sing a take with some on and some off, and say which to keep.</p>
    <div class="radio">${DRILL_FX.map((v) => `<label><input type="checkbox" name="drillfx" value="${v.id}" ${S.dev.drillFx && S.dev.drillFx[v.id] ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <button class="btn small" data-a="drillfx-all">All four on</button>
    <h4>Trial sounds</h4>
    <p class="muted small">The first chord rendered from a sampled piano (2026-11-26), as one file. The chords of a take are now put together from single notes: see "Between rounds" above.</p>
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
  $$("input[name=drillsounds]", el).forEach((i) => (i.onchange = () => { S.dev.drillSounds = i.value; app.save(); setDrillFiles(i.value !== "page"); toast(`Sounds of a take: ${DRILL_SOURCES.find((v) => v.id === i.value).name}`); }));
  /* each drill sound once, as a take would play it (its files loaded as for a take on C4, E4, G4) */
  $$("[data-hear-drill]", el).forEach((b) => (b.onclick = async () => {
    audioContext(); setDrillFiles(S.dev.drillSounds !== "page");
    await prepareDrill([60, 64, 67]);
    const k = b.dataset.hearDrill, t = now() + 0.05;
    if (k === "tick" || k === "accent") tick(t, k === "accent");
    else if (k === "count" || k === "go") click(t, k === "go");
    else if (k === "combo") chime([1319, 1568, 1760]);
    else if (k === "chime") chime();
    else noteCue(k, 64);
    setTimeout(endDrill, 1500);
  }));
  $$("input[name=taps]", el).forEach((i) => (i.onchange = () => { S.dev.tapSounds = i.value; app.save(); setTapSource(i.value); prepareTaps(); setFxFiles(i.value !== "page"); toast(`Sounds of things you press: ${TAP_SOURCES.find((v) => v.id === i.value).name}`); }));
  $$("[data-hear-tap]", el).forEach((b) => (b.onclick = () => {
    if (S.settings.sound === false) return toast("All game sound is off. Turn it on in Settings first.");
    audioContext(); setTapSource(S.dev.tapSounds); prepareTaps();
    tapSound(b.dataset.hearTap, ["monkey"].includes(b.dataset.hearTap) ? "jungle" : null); // the first press may still be the page's sound: its file is on the way
  }));
  /* the singing screen's finer motion: each piece on or off (take-screen.js reads S.dev.drillFx when a take starts) */
  const keepDrillFx = () => { S.dev.drillFx = Object.fromEntries($$("input[name=drillfx]", el).map((i) => [i.value, i.checked])); app.save(); };
  $$("input[name=drillfx]", el).forEach((i) => (i.onchange = () => { keepDrillFx(); toast(`${DRILL_FX.find((v) => v.id === i.value).name}: ${i.checked ? "on" : "off"}`); }));
  el.querySelector("[data-a=drillfx-all]").onclick = () => { $$("input[name=drillfx]", el).forEach((i) => (i.checked = true)); keepDrillFx(); toast("All four on. Sing a take."); };
  $$("input[name=view]", el).forEach((i) => (i.onchange = () => { S.dev.view = i.value; app.save(); toast(i.value === "scroll" ? "Note area: scroll" : "Note area: sweep"); }));
  $$("input[name=headdelay]", el).forEach((i) => (i.onchange = () => { S.dev.headDelay = i.value === "" ? null : Number(i.value); app.save(); toast(`Head delay: ${i.value === "" ? HEAD_DELAY : i.value} s`); }));
  $$("input[name=between]", el).forEach((i) => (i.onchange = () => { S.dev.between = i.value; app.save(); toast(`Between rounds: ${BETWEEN.find((v) => v.id === i.value).name}`); }));
  /* one rest as a take plays it, at 100 beats a minute: the chord of a round in C for a beat, then the chord of the
     next round, a whole tone up, for two beats; the round would begin where it stops */
  el.querySelector("[data-a=hear-rest]").onclick = async () => {
    if (S.settings.sound === false) return toast("All game sound is off. Turn it on in Settings first.");
    audioContext();
    const home = chordOf(60).home, next = chordOf(62).next, beat = 0.6, t = now() + 0.1;
    if (!(await preparePiano([...home, ...next]))) return toast("The piano notes did not load.");
    pianoChord(home, t, CHORD_SPLIT * beat * 0.95);
    pianoChord(next, t + CHORD_SPLIT * beat, (2 - CHORD_SPLIT) * beat * 0.95 - 0.25 * beat);
  };
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
  /* the sound as it is now, twice a second while the sheet is open (the designer, 2026-11-28: no sound on the phone at
     times): the context's state and rate, its clock, what the phone was told the sound is, how many contexts this
     visit has made, and the music's own state */
  const live = el.querySelector("[data-sound-live]");
  const paint = () => {
    if (!live.isConnected) return clearInterval(liveTimer);
    const a = audioReport(), m = musicState();
    live.textContent = `context ${a.state}${a.rate ? ` at ${a.rate} Hz` : ""} · clock ${a.clock ?? "–"} s · session ${a.session} · contexts made ${a.made}` +
      ` · music ${m.wanted ? "wanted" : "off"}, ${m.playing ? "playing" : "not playing"}, ${m.looping ? "sounding" : "no sound yet"}${m.file ? ` (${m.file.split(".").pop()})` : ""}`;
  };
  const liveTimer = setInterval(paint, 500);
  paint();
  const act = (a, fn) => { const b = el.querySelector(`[data-a=${a}]`); if (b) b.onclick = fn; };
  act("one",() => done(St.recordTake(S, St.nextTake(S, place), St.devGrade(false), real)));
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
