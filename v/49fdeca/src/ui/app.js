/* The app shell: the save, a tiny router, bottom sheets, toasts and the voice source.
   Screens register themselves in `screens`; nothing here knows what a screen draws. */
import { loadSave, writeSave, freshSave, newIn, markSeen, currentTime, reachedTimes, nextTake, beatPending, homeScene } from "../state.js";
import { sceneParts } from "../art/index.js";
import { tapSound, stopMusic } from "../audio/ambient.js";
import { drawZone } from "../art/index.js";
import { hideTip } from "./tips.js";
import { readMic, openMic, micReady, setMicMode } from "../audio/mic.js";
import { setMuted } from "../audio/synth.js";
import { VOICES, late } from "../drill/take.js";
const LATE_VOICE = late(VOICES.good, 0.12); // in tune, heard 0.12 s after the beat, as a phone's microphone does
import { applyDrillEdits, drillEditCount } from "../content.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const storage = (() => { try { return window.localStorage; } catch { return null; } })();
/* can this browser keep the save? (a private window may not) */
const canSave = (() => { try { storage.setItem("longcat-probe", "1"); storage.removeItem("longcat-probe"); return true; } catch { return false; } })();

export const app = {
  S: null,
  /* Going back to a time of day (the designer, 2026-11-25): { place, time } while Home shows a time of day other than the
     one being sung, or null. It is where the player is looking, not progress: it is not saved, and it ends with a
     tap on "Back to …", on Sing, or by going to another place. */
  visit: null,
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
  setMicMode(app.S.dev.micMode);
}

/* ---------- router ----------
   Four tabs: Home, Wardrobe, Store, Settings (the designer, 2026-11-15; Store and Settings changed places the same day). The Store is where the Wardrobe's Cats tab went;
   Settings took the Album's spot (it was the gear on Home) and the Album is a tab of the Wardrobe; Places opens
   from the chip at the top left of Home. */
const BAG = `<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 7.4h12.8l-1 9.6H4.6z"/><path d="M7.1 7.4V6a2.9 2.9 0 0 1 5.8 0v1.4"/></svg>`;
const COG = `<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-linejoin="round"><circle cx="10" cy="10" r="7.1" stroke-width="2.6" stroke-dasharray="2.79 2.79"/><circle cx="10" cy="10" r="5.2" stroke-width="1.7"/><circle cx="10" cy="10" r="1.7" stroke-width="1.5"/></svg>`;
const DOCK = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "wardrobe", label: "Wardrobe", icon: "◫" },
  { id: "store", label: "Store", icon: BAG },
  { id: "settings", label: "Settings", icon: COG },
];
/* The sky of where the player is, for the strip at the top of every tab: the colour at the top of that place's
   picture at that time of day (the art's L.up), a paler band under it, and the sun or moon of that time. */
const SKY = { morning: ["#5d7ea3", "#c9553f"], golden: ["#d27a58", "#fdf3cf"], night: ["#0e1a30", "#f2ecd6"] };
const skyOf = {};
const mixHex = (a, b, t) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, "0")).join("");
function paintSky() {
  const S = app.S, place = S.here, time = shownTime(S, place), k = `${place}.${time}`;
  if (!skyOf[k]) {
    let up = null;
    try { up = sceneParts(homeScene(S, place, app.real(), { animate: false, time })).L.up; } catch { /* a place with no picture yet */ }
    const sky = /^#[0-9a-fA-F]{6}$/.test(up || "") ? up : SKY[time][0];
    skyOf[k] = [sky, mixHex(sky, "#f6efe0", 0.32), SKY[time][1]];
  }
  const [sky, sky2, sun] = skyOf[k], st = document.body.style;
  st.setProperty("--sky", sky); st.setProperty("--sky2", sky2); st.setProperty("--sun", sun);
}

export function show(name, props = {}) {
  const prev = app.screen;
  if (prev && app.screens[prev]?.leave) app.screens[prev].leave();
  closeSheet(true);
  hideTip();
  app.from = prev || null;
  app.screen = name;
  if (name !== "home") stopMusic(); // the music is Home's (a tune tried out in the dev tools stops here too)
  if (name === "wardrobe") { markSeen(app.S, name); app.save(); }
  app.props = props;
  const root = $("#screen");
  root.className = `screen screen-${name}`;
  root.innerHTML = "";
  const def = app.screens[name];
  const full = def?.fullscreen;
  $("#dock").hidden = !!full;
  document.body.classList.toggle("is-full", !!full);
  document.body.classList.toggle("is-home", name === "home");
  paintSky();
  paintDock();
  def?.render(root, props);
  root.scrollTop = 0;
  /* the Wardrobe scrolls the page itself (its top stays put), so a new screen starts at the top of the page too */
  if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
}
export const refresh = () => show(app.screen, app.props);
/* The dots of the bottom row. The Album is a tab of the Wardrobe, so a new postcard puts its dot on the Wardrobe
   (and on that tab, ui/wardrobe.js) until the tab is looked at. */
export function paintDock() {
  app.badge = { wardrobe: newIn(app.S, "wardrobe") || newIn(app.S, "album") };
  renderDock();
}

/* The bottom row: two tabs, Sing, two tabs (full-screen home board, 2026-11-14). Sing is the same button on every
   tab and starts the next step from wherever it is pressed. With no garment chosen yet it says Pick and goes to the
   picker on Home; with all nine on it says Mix and opens the Wardrobe's "Mix a postcard". */
/* The time of day Home shows: the one being sung, or one the player has gone back to. Only a time already reached
   can be gone back to; a visit that no longer fits (another place, a place started again) is dropped. */
export function shownTime(S = app.S, place = S.here) {
  const cur = currentTime(S, place), v = app.visit;
  if (v && (v.place !== place || v.time === cur || !reachedTimes(S, place).includes(v.time))) app.visit = null;
  return app.visit ? app.visit.time : cur || "night";
}
export const visiting = (S = app.S, place = S.here) => { shownTime(S, place); return !!app.visit; };

function singButton() {
  const S = app.S, place = S.here;
  if (!currentTime(S, place)) return { big: "Mix", small: "a postcard", label: "Mix a postcard", go: () => show("wardrobe", { tab: "dress" }) };
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
  /* Sing is always the next step of the time being sung: a visit to another time of day ends with it */
  $(".dock-sing", d).onclick = () => { app.visit = null; sing.go(); };
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
  { id: "late", name: "Auto-singer, in tune, heard 0.12 s late" },
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
    case "late": return LATE_VOICE(t, note, T);
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
    if (app.S.settings.sound !== false) tapSound(t.dataset.tap, app.S.here);
    /* a thing that stays changed when pressed (the jungle's heart, red or pink): the art names a class with
       data-toggle, and it goes on the page's root, so it holds while the picture is drawn again; it is not saved */
    if (t.dataset.toggle) document.documentElement.classList.toggle(t.dataset.toggle);
    for (const x of els) {
      x.classList.remove("lc-tapped");
      x.getBoundingClientRect(); // restart the animation when tapped again
      x.classList.add("lc-tapped");
      clearTimeout(x._lcTap);
      x._lcTap = setTimeout(() => x.classList.remove("lc-tapped"), 1400);
    }
  };
}
