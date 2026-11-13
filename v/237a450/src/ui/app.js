/* The app shell: the save, a tiny router, bottom sheets, toasts and the voice source.
   Screens register themselves in `screens`; nothing here knows what a screen draws. */
import { loadSave, writeSave, freshSave, unreadLetters } from "../state.js";
import { readMic, openMic, micReady } from "../audio/mic.js";
import { setMuted } from "../audio/synth.js";
import { VOICES } from "../drill/take.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const storage = (() => { try { return window.localStorage; } catch { return null; } })();

export const app = {
  S: null,
  screen: null,
  screens: {},
  props: {},
  real: () => new Date(),
  save() { writeSave(storage, app.S); },
  reset() { app.S = freshSave(app.real()); app.save(); },
};

export function boot() {
  app.S = loadSave(storage, app.real());
  if (new URLSearchParams(location.search).has("dev")) app.S.dev.panel = true;
  setMuted(!app.S.settings.sound);
}

/* ---------- router ---------- */
const DOCK = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "wardrobe", label: "Wardrobe", icon: "◫" },
  { id: "album", label: "Album", icon: "▤" },
  { id: "places", label: "Places", icon: "✉" },
  { id: "settings", label: "Settings", icon: "⚙" },
];
export function show(name, props = {}) {
  const prev = app.screen;
  if (prev && app.screens[prev]?.leave) app.screens[prev].leave();
  closeSheet(true);
  app.screen = name;
  app.props = props;
  const root = $("#screen");
  root.className = `screen screen-${name}`;
  root.innerHTML = "";
  const def = app.screens[name];
  const full = def?.fullscreen;
  $("#dock").hidden = !!full;
  document.body.classList.toggle("is-full", !!full);
  app.badge = { places: unreadLetters(app.S, app.real()).length > 0 };
  renderDock();
  def?.render(root, props);
  root.scrollTop = 0;
}
export const refresh = () => show(app.screen, app.props);

function renderDock() {
  const d = $("#dock");
  d.innerHTML = DOCK.map((t) => `<button class="tab${app.screen === t.id ? " on" : ""}" data-tab="${t.id}" aria-label="${t.label}"><span class="ti" aria-hidden="true">${t.icon}</span><span>${t.label}</span>${t.id === "places" && app.badge?.places ? '<i class="dot"></i>' : ""}</button>`).join("");
  $$(".tab", d).forEach((b) => (b.onclick = () => show(b.dataset.tab)));
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
export const VOICE_MODES = [
  { id: "mic", name: "Microphone" },
  { id: "god", name: "Auto-singer, in tune" },
  { id: "human", name: "Auto-singer, a little flat" },
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
    case "wobbly": return VOICES.wobbly(t, note, T);
    case "half": return VOICES.half(t, note, T);
    case "silent": return null;
    case "touch": return touchVoice.down && touchVoice.midi != null ? { midi: touchVoice.midi + Math.sin(t * 29) * 0.03, conf: 0.95 } : null;
    default: return readMic();
  }
}
