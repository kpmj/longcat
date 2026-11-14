/* Settings: cat kinds per body part (free, a setting, never progress), the singer's range and key, sound,
   the monthly letter, and the dev tools the designer uses to walk the whole month quickly. */
import { app, show, sheet, closeSheet, esc, $, $$, toast, VOICE_MODES, LANE_MODES } from "./app.js";
import * as St from "../state.js";
import { catKindSvg } from "../art/index.js";
import { CAT_KINDS, ZONES, timeById, garmentName } from "../content.js";
import { DEFAULT_RANGE, rootFor } from "../drill/drills.js";
import { noteName } from "../audio/pitch.js";
import { setMuted } from "../audio/synth.js";

function render(root) {
  const S = app.S;
  const r = S.settings.range;
  const range = r || DEFAULT_RANGE;
  const root4 = rootFor(range, 4, { nudge: S.settings.nudge });
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Settings</span></div></header>
    <section class="settings">
      <div class="card">
        <h4>Cat kinds</h4>
        <p class="muted small">Only the ears and the tail change. Pick one for each garment and change it any time; postcards already taken stay as they were. All four are free.</p>
        ${ZONES.map((z) => `<div class="kind-row"><span class="wlab">${z.name}</span>${CAT_KINDS.map((k) => `<button class="kind${S.settings.kinds[z.id] === k.id ? " on" : ""}" data-zone="${z.id}" data-kind="${k.id}" aria-pressed="${S.settings.kinds[z.id] === k.id}" aria-label="${esc(k.name)}">${catKindSvg(k.id, { look: { fur: "short", pattern: "plain", palette: "ginger" } })}<span>${esc(k.short)}</span></button>`).join("")}</div>`).join("")}
      </div>
      <div class="card">
        <h4>Range and key</h4>
        <p>${r ? `Your range: <b>${noteName(r.low)} – ${noteName(r.high)}</b>` : `Not measured yet. Using the default, ${noteName(DEFAULT_RANGE.low)} – ${noteName(DEFAULT_RANGE.high)}`}</p>
        <p class="muted small">Every drill sits inside your range. “Do–Re–Mi” now starts on ${noteName(root4)}.</p>
        <div class="row"><button class="btn" data-a="range">${r ? "Measure again" : "Measure my range"}</button></div>
        <div class="nudge"><span>Overall key</span><button class="btn small" data-a="down" aria-label="A semitone lower">Lower</button><b>${S.settings.nudge > 0 ? "+" : ""}${S.settings.nudge}</b><button class="btn small" data-a="up" aria-label="A semitone higher">Higher</button></div>
      </div>
      <div class="card">
        <h4>Sound and letters</h4>
        <label class="toggle"><input type="checkbox" data-a="sound" ${S.settings.sound ? "checked" : ""}><span>Game sound (demo hum, metronome, effects)</span></label>
        <label class="toggle"><input type="checkbox" data-a="letters" ${S.settings.letterNotify ? "checked" : ""}><span>Notify me when the monthly letter arrives</span></label>
        <p class="muted small">Only the monthly letter, never daily reminders. Phone notifications aren’t built yet: for now the letter only shows up in the game.</p>
      </div>
      <div class="card">
        <h4>Where your voice goes</h4>
        <p class="muted small">Your voice becomes pitch numbers on this device. Nothing is recorded and nothing leaves it. Progress is saved in this browser. Postcards are pictures with no score.</p>
      </div>
      <div class="card">
        <h4>For testing</h4>
        <div class="row"><button class="btn" data-a="dev">Dev tools</button><button class="btn ghost" data-a="reset">Start over</button></div>
      </div>
    </section>`;
  $$(".kind", root).forEach((b) => (b.onclick = () => { S.settings.kinds[b.dataset.zone] = b.dataset.kind; app.save(); render(root); }));
  $("[data-a=range]", root).onclick = () => show("range", { from: "settings" });
  $("[data-a=down]", root).onclick = () => { S.settings.nudge = Math.max(-5, S.settings.nudge - 1); app.save(); render(root); };
  $("[data-a=up]", root).onclick = () => { S.settings.nudge = Math.min(5, S.settings.nudge + 1); app.save(); render(root); };
  $("[data-a=sound]", root).onchange = (e) => { S.settings.sound = e.target.checked; setMuted(!S.settings.sound); app.save(); };
  $("[data-a=letters]", root).onchange = (e) => { S.settings.letterNotify = e.target.checked; app.save(); if (e.target.checked) toast("Noted. Notifications aren’t built yet; letters show up in the game."); };
  $("[data-a=dev]", root).onclick = () => openDev();
  $("[data-a=reset]", root).onclick = () => confirmReset();
}

function confirmReset() {
  const el = sheet(`<h3>Start over?</h3><p class="muted">This clears the progress, postcards and range saved in this browser. It can’t be undone.</p>
    <div class="row"><button class="btn danger" data-a="yes">Clear and start over</button><button class="btn" data-a="no">Keep everything</button></div>`);
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
    <p class="muted small">Today is ${St.todayKey(S, real)} (offset ${S.dev.dayOffset} days) · faces learned ${S.faces} / 12 · sung on ${S.journal.length} days · ${S.takes.length} takes</p>
    <h4>Voice source</h4>
    <div class="radio">${VOICE_MODES.map((v) => `<label><input type="radio" name="voice" value="${v.id}" ${S.dev.voice === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <h4>Cat body on short notes (trying options)</h4>
    <div class="radio">${LANE_MODES.map((v) => `<label><input type="radio" name="lane" value="${v.id}" ${(S.dev.lane || "trace") === v.id ? "checked" : ""}> ${esc(v.name)}</label>`).join("")}</div>
    <h4>Progress (${esc(place)} · ${time ? timeById(time).name : "all nine"}${nt ? ` · ${garmentName(nt.time, nt.zone)}, step ${nt.step}` : ""})</h4>
    <div class="grid2">
      <button class="btn small" data-a="one" ${nt ? "" : "disabled"}>Count this step</button>
      <button class="btn small" data-a="tuft" ${nt ? "" : "disabled"}>Count it, with two folds</button>
      <button class="btn small" data-a="garment" ${nt ? "" : "disabled"}>Finish this garment</button>
      <button class="btn small" data-a="time" ${time ? "" : "disabled"}>Finish this time of day</button>
    </div>
    <h4>Date</h4>
    <div class="grid2">
      <button class="btn small" data-a="day">+1 day</button>
      <button class="btn small" data-a="month">Jump to the 1st of next month</button>
      <button class="btn small" data-a="today">Back to today</button>
      <button class="btn small" data-a="range">Measure range</button>
    </div>
    <h4>Last five takes</h4>
    <p class="muted small mono">${last || "none yet"}</p>`, { tall: true });
  $$("input[name=lane]", el).forEach((i) => (i.onchange = () => { S.dev.lane = i.value; app.save(); toast(`Short notes: ${LANE_MODES.find((v) => v.id === i.value).name}`); }));
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
  act("day", () => { S.dev.dayOffset++; done(null); });
  act("month", () => { St.devAdvanceToNextMonth(S, real); done(null); });
  act("today", () => { S.dev.dayOffset = 0; done(null); });
  act("range", () => { closeSheet(true); show("range", { from: "settings" }); });
}

app.screens.settings = { render };
