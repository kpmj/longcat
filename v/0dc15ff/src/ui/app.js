/* The app shell: the save, a tiny router, bottom sheets, toasts and the voice source.
   Screens register themselves in `screens`; nothing here knows what a screen draws. */
import { loadSave, writeSave, freshSave, unreadLetters, newIn, markSeen, currentTime, nextTake, beatPending } from "../state.js";
import { tapSound, stopMusic } from "../audio/ambient.js";
import { drawZone } from "../art/index.js";
import { hideTip } from "./tips.js";
import { readMic, openMic, micReady } from "../audio/mic.js";
import { setMuted } from "../audio/synth.js";
import { VOICES } from "../drill/take.js";
import { applyDrillEdits, drillEditCount } from "../content.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const storage = (() => { try { return window.localStorage; } catch { return null; } })();
/* can this browser keep the save? (a private window may not) */
const canSave = (() => { try { storage.setItem("longcat-probe", "1"); storage.removeItem("longcat-probe"); return true; } catch { return false; } })();

export const app = {
  S: null,
  screen: null,
  screens: {},
  props: {},
  real: () => new Date(),
  save() { writeSave(storage, app.S); },
  /* Start over clears the player's month, not the designer's drill edits (dev tools → Drill editor has its own undo) */
  reset() { const keep = app.S?.dev?.drillEdits || null; app.S = freshSave(app.real()); app.S.dev.drillEdits = keep; app.save(); },
  canSave,
};

export function boot() {
  app.S = loadSave(storage, app.real());
  if (new URLSearchParams(location.search).has("dev")) app.S.dev.panel = true;
  app.S.dev.drillEdits = drillEditCount(app.S.dev.drillEdits) ? applyDrillEdits(app.S.dev.drillEdits) : null;
  setMuted(!app.S.settings.sound);
}

/* ---------- router ----------
   Four tabs, each a place in the game; Settings is behind the gear on Home (game-flow board, decision A). */
const DOCK = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "wardrobe", label: "Wardrobe", icon: "◫" },
  { id: "album", label: "Album", icon: "▤" },
  { id: "places", label: "Places", icon: "✉" },
];
export function show(name, props = {}) {
  const prev = app.screen;
  if (prev && app.screens[prev]?.leave) app.screens[prev].leave();
  closeSheet(true);
  hideTip();
  app.from = prev || null;
  app.screen = name;
  if (name !== "home") stopMusic(); // the music is Home's (a tune tried out in the dev tools stops here too)
  if (name === "wardrobe" || name === "album") { markSeen(app.S, name); app.save(); }
  app.props = props;
  const root = $("#screen");
  root.className = `screen screen-${name}`;
  root.innerHTML = "";
  const def = app.screens[name];
  const full = def?.fullscreen;
  $("#dock").hidden = !!full;
  document.body.classList.toggle("is-full", !!full);
  document.body.classList.toggle("is-home", name === "home");
  app.badge = { places: unreadLetters(app.S, app.real()).length > 0, wardrobe: newIn(app.S, "wardrobe"), album: newIn(app.S, "album") };
  renderDock();
  def?.render(root, props);
  root.scrollTop = 0;
}
export const refresh = () => show(app.screen, app.props);

/* The bottom row: two tabs, Sing, two tabs (full-screen home board, 2026-11-14). Sing is the same button on every
   tab and starts the next step from wherever it is pressed. With no garment chosen yet it says Pick and goes to the
   picker on Home; with all nine on it says Mix and opens the Wardrobe. */
function singButton() {
  const S = app.S, place = S.here;
  if (!currentTime(S, place)) return { big: "Mix", small: "outfits", label: "Mix outfits", go: () => app.screen !== "wardrobe" && show("wardrobe") };
  const nt = nextTake(S, place);
  if (!nt) return { big: "Pick", small: "a garment", label: "Pick a garment", go: () => (app.screen === "home" ? app.screens.home.openPicker() : show("home")) };
  return { big: "Sing", small: `step ${nt.step}`, label: `Sing step ${nt.step}, ${nt.drill.name}`, go: () => (beatPending(S, place) ? show("home") : show("take", { ctx: nextTake(S, place) })) };
}
function renderDock() {
  const d = $("#dock");
  const tab = (t) => `<button class="tab${app.screen === t.id ? " on" : ""}" data-tab="${t.id}" aria-label="${t.label}"${app.screen === t.id ? ' aria-current="page"' : ""}><span class="ti" aria-hidden="true">${t.icon}</span><span>${t.label}</span>${app.badge?.[t.id] ? '<i class="dot" aria-label="something new"></i>' : ""}</button>`;
  const sing = singButton();
  d.innerHTML = `${DOCK.slice(0, 2).map(tab).join("")}<button class="dock-sing" data-act="sing" aria-label="${esc(sing.label)}"><b>${sing.big}</b><span>${esc(sing.small)}</span></button>${DOCK.slice(2).map(tab).join("")}`;
  $$(".tab", d).forEach((b) => (b.onclick = () => show(b.dataset.tab)));
  $(".dock-sing", d).onclick = () => sing.go();
}

/* ---------- sheets and toasts ---------- */
let sheetClose = null;
export function sheet(html, { onClose = null, dismissable = true, tall = false } = {}) {
  closeSheet(true);
  const root = $("#sheet-root");
  root.innerHTML = `<div class="scrim"></div><section class="sheet${tall ? " tall" : ""}" role="dialog" aria-modal="true"><div class="grab" aria-hidden="true"></div>${html}</section>`;
  root.hidden = false;
  requestAnimationFrame(() => root.classList.add("up"));
  sheetClose = onClose;
  if (dismissable) $(".scrim", root).onclick = () => closeSheet();
  return $(".sheet", root);
}
export function closeSheet(silent = false) {
  const root = $("#sheet-root");
  if (!root || root.hidden) return;
  root.classList.remove("up");
  root.hidden = true;
  root.innerHTML = "";
  const cb = sheetClose;
  sheetClose = null;
  if (!silent && cb) cb();
}
let toastT = 0;
export function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("on"), 2400);
}

/* ---------- the voice ----------
   mic is the real thing. The others are test tools (design doc: touch voice stays a test tool):
   god = sings everything in tune, human = a little flat and shaky (still on the note), wobbly = drifts a
   semitone either side (close), tufty = one clear miss per phrase, half = stops halfway, silent = nothing,
   touch = press the lane. */
/* How the lane draws the cat when the notes are short. The first is the game's own; the rest are kept for
   comparing (see lane-body.js). */
export const LANE_MODES = [
  { id: "snap", name: "A · Body lies flat on the note line (the game's choice)" },
  { id: "trace", name: "Before: fat following the voice, thread between" },
  { id: "slim", name: "B · One slim body, no fat pieces" },
  { id: "stub", name: "C · Short cat: head and a little body" },
];
export const VOICE_MODES = [
  { id: "mic", name: "Microphone" },
  { id: "god", name: "Auto-singer, in tune" },
  { id: "human", name: "Auto-singer, a little flat" },
  { id: "slide", name: "Auto-singer, slides between notes" },
  { id: "wobbly", name: "Auto-singer, drifting (close)" },
  { id: "tufty", name: "Auto-singer, one wrong note" },
  { id: "half", name: "Auto-singer, stops halfway" },
  { id: "silent", name: "Silence" },
  { id: "touch", name: "Press the lane to sing" },
];
export const touchVoice = { down: false, midi: null };
export async function prepareVoice() {
  if (app.S.dev.voice !== "mic") return true;
  if (micReady()) return true;
  return openMic();
}
/* One frame of voice. note = the note under the playhead (null between notes); T = the running take. */
export function readVoice(t, note, T) {
  switch (app.S.dev.voice) {
    case "god": return VOICES.good(t, note, T);
    case "tufty": return VOICES.tufty(t, note, T);
    case "human": return VOICES.human(t, note, T);
    case "slide": return VOICES.slide(t, note, T);
    case "wobbly": return VOICES.wobbly(t, note, T);
    case "half": return VOICES.half(t, note, T);
    case "silent": return null;
    case "touch": return touchVoice.down && touchVoice.midi != null ? { midi: touchVoice.midi + Math.sin(t * 29) * 0.03, conf: 0.95 } : null;
    default: return readMic();
  }
}

/* The cat of one garment hops once: the garment whose card was tapped on the home page, or the one just put on.
   Nothing stays on the picture (the designer, 2026-11-14). The art marks the cat's pieces with data-zone; with reduced
   motion nothing moves. */
export function hopCat(el, zone) {
  const z = drawZone(zone);
  if (!el || !z) return;
  for (const x of el.querySelectorAll(`[data-zone="${z}"]`)) {
    x.classList.remove("lc-picked");
    x.getBoundingClientRect(); // restart the hop when picked again
    x.classList.add("lc-picked");
    clearTimeout(x._lcPick);
    x._lcPick = setTimeout(() => x.classList.remove("lc-picked"), 900);
  }
}

/* A drawing answers a touch: pat a cat or the judge, tap the yuzu, the lamp, the sun. The art marks what can be tapped
   with data-tap and does the rest in CSS (ART_CSS); data-group makes several pieces answer as one. */
export function wireTaps(el) {
  if (!el) return;
  el.onclick = (e) => {
    const t = e.target.closest ? e.target.closest("[data-tap]") : null;
    if (!t || !el.contains(t)) return;
    const group = t.dataset.group, els = group ? [...el.querySelectorAll(`[data-group="${group}"]`)] : [t];
    if (app.S.settings.sound !== false) tapSound(t.dataset.tap);
    for (const x of els) {
      x.classList.remove("lc-tapped");
      x.getBoundingClientRect(); // restart the animation when tapped again
      x.classList.add("lc-tapped");
      clearTimeout(x._lcTap);
      x._lcTap = setTimeout(() => x.classList.remove("lc-tapped"), 1400);
    }
  };
}
