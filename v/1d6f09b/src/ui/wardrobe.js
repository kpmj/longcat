/* The wardrobe (the designer, 2026-11-15, board docs/design/longcat-wardrobe-one-page.md, layout 甲). Two tabs:
   - Dress up: one page where dressing the judge and taking a postcard are the same thing. At the top, the picture
     with a list beside it (scarf, top, hat, sky) and "Take a postcard"; under them, straight in the page, the
     choices of the row picked in the list (the designer, 2026-11-15: "turn [the four buttons] to a list … and have [the
     garment's sheet] straight in the page, so the user can easily see the changes they make"). For a garment
     (ui/cats.js paintDress): which one it is (the morning's, golden hour's or the night's), who sings it, its
     yarn, and the way to sing one of its steps again. For the sky: which one. The top stays put while the choices
     scroll under it. The postcard takes what the picture shows, and needs three finished garments. Which one and
     the sky are only this picture's: Home wears the garments of the time of day being knitted. A cat or a yarn
     changed here is changed everywhere.
     It took the place of the Wearing tab, the "Mix a postcard" sheet and the "Earlier garments" list.
   - Album (ui/album.js): the postcards, the mixed ones too.
   Places opens from the chip at the top left of Home (ui/places.js); the cats are in the Store (ui/cats.js). */
import { app, esc, $, $$, wireTaps, paintDock } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg, placeThumbSvg } from "../art/index.js";
import { ZONES, TIMES, STEPS, garmentName, placeById, timeById } from "../content.js";
import { paintDress, purse } from "./cats.js";
import { renderAlbum, openCard } from "./album.js";

let mode = "dress";

const TABS = [["dress", "Dress up"], ["album", "Album"]];
/* a dot on Album while it holds a postcard not looked at yet */
const segs = () => {
  const fresh = mode !== "album" && St.newIn(app.S, "album");
  return `<div class="segs" role="tablist">${TABS.map(([id, name]) => `<button role="tab" data-mode="${id}" aria-selected="${mode === id}" class="${mode === id ? "on" : ""}">${name}${id === "album" && fresh ? '<i class="dot" aria-label="a new postcard"></i>' : ""}</button>`).join("")}</div>`;
};
function wireSegs(root) { $$(".segs [data-mode]", root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(root); })); }
const topbar = (S) => `<header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(placeById(S.here).name)}</span></div>${purse(S)}</header>`;

/* What the picture shows: { place, bg, set: { zone: time } }. It is kept while at this place, and starts again
   (state.js dressStart) when a garment is finished or a new sky is reached, so that the new one is on. */
let pick = null;
function picked(S, place) {
  const reached = St.reachedTimes(S, place), n = `${St.garmentsDone(S, place)}.${reached.length}`;
  const ok = pick && pick.place === place && pick.n === n && reached.includes(pick.bg) && ZONES.every((z) => reached.includes(pick.set[z.id]));
  if (!ok) pick = { place, n, ...St.dressStart(S, place) };
  return pick;
}
/* the row of the list whose choices are in the page: a garment, or "sky" */
let sel = ZONES[0].id;

/* ---------- Dress up: the picture and its list, then the choices of the row picked ---------- */
function dressUp(root) {
  const S = app.S, place = S.here, p = picked(S, place), reached = St.reachedTimes(S, place);
  const garments = ZONES.map((z) => St.garmentSpec(S, place, p.set[z.id], z.id));
  const ready = ZONES.every((z) => St.garmentDone(S, place, p.set[z.id], z.id));
  const row = (z, i) => {
    const t = p.set[z.id], n = St.progress(S, place, t, z.id), name = garmentName(t, z.id);
    return `<button class="dress-row${sel === z.id ? " on" : ""}" data-sel="${z.id}" aria-pressed="${sel === z.id}" aria-label="${esc(z.name)}: ${esc(name.toLowerCase())}${n < STEPS ? `, ${n} of ${STEPS} steps` : ""}">${wardrobeThumbSvg({ ...garments[i] })}<span><b>${esc(z.name)}</b><em>${n < STEPS ? `${n} / ${STEPS}` : esc(name)}</em></span></button>`;
  };
  const sky = `<button class="dress-row${sel === "sky" ? " on" : ""}" data-sel="sky" aria-pressed="${sel === "sky"}" aria-label="Sky: ${esc(timeById(p.bg).name.toLowerCase())}"><i class="dress-sky">${placeThumbSvg(place, p.bg)}</i><span><b>Sky</b><em>${esc(timeById(p.bg).name)}</em></span></button>`;
  root.innerHTML = `
    ${topbar(S)}
    ${segs()}
    <div class="dress-top">
      <div class="scene-wrap small dress-pic">${sceneSvg({ place, time: p.bg, garments, baskets: [], cushion: null, special: St.specialFor(place), animate: true, seed: 3, landscape: true })}</div>
      <div class="dress-side">
        <div class="dress-list">${ZONES.map(row).join("")}${sky}</div>
        <button class="btn primary mix-take" data-a="shoot" ${ready ? "" : "disabled"}>Take a postcard</button>
      </div>
    </div>
    ${ready ? "" : `<p class="sub">A postcard needs three finished garments.</p>`}
    <section class="dress-panel"></section>`;
  /* drawn again after every change, where it was: the choices scroll under the picture */
  const again = () => { const page = document.scrollingElement, y = page ? page.scrollTop : 0; render(root); if (page) page.scrollTop = y; };
  const panel = $(".dress-panel", root);
  if (sel === "sky") {
    panel.innerHTML = `<h4>Which sky <i>for this picture only</i></h4>
      <div class="dress-which">${TIMES.map((t) => { const ok = reached.includes(t.id); return `<button class="wcell sky${t.id === p.bg ? " on" : ""}${ok ? "" : " locked"}" data-time="${t.id}" aria-pressed="${t.id === p.bg}" ${ok ? "" : "disabled"} aria-label="${esc(t.name)}${ok ? "" : ", not yet"}"><i class="dress-sky">${placeThumbSvg(place, t.id)}</i><span>${ok ? esc(t.name) : "Not yet"}</span></button>`; }).join("")}</div>`;
    $$(".wcell[data-time]", panel).forEach((b) => (b.onclick = () => { if (b.dataset.time === p.bg) return; p.bg = b.dataset.time; again(); }));
  } else {
    paintDress(panel, sel, p.set[sel], { which: (t) => { p.set[sel] = t; again(); }, changed: again });
  }
  wireTaps($(".scene-wrap", root));
  wireSegs(root);
  $$(".dress-row", root).forEach((b) => (b.onclick = () => { if (sel === b.dataset.sel) return; sel = b.dataset.sel; again(); }));
  $("[data-a=shoot]", root).onclick = () => {
    const card = St.addMixCard(S, place, p.set, p.bg, app.real());
    if (!card) return;
    app.save();
    /* the new card is in the Album tab, which gets its dot, and so does the bottom row */
    again();
    paintDock();
    openCard(card);
  };
}

/* Put one garment in the picture and open its choices (the Garment sheet's "change" button, opened from here,
   knows which one it was). */
function openPiece(zone, time) {
  const S = app.S, p = picked(S, S.here);
  if (time && St.reachedTimes(S, S.here).includes(time) && St.progress(S, S.here, time, zone)) p.set[zone] = time;
  sel = zone;
  repaint();
}

function render(root) {
  /* another screen can ask for a tab: show("wardrobe", { tab: "album" }) */
  if (app.props.tab && TABS.some(([id]) => id === app.props.tab)) { mode = app.props.tab; app.props.tab = null; }
  if (mode === "album") {
    /* looking at the Album takes its dot away, here and in the bottom row */
    if (St.newIn(app.S, "album")) { St.markSeen(app.S, "album"); app.save(); paintDock(); }
    return renderAlbum(root, topbar(app.S), segs(), wireSegs);
  }
  dressUp(root);
}

/* repaint: draw the tab again under an open sheet (a sheet can change what the picture shows) */
const repaint = () => app.screen === "wardrobe" && render($("#screen"));
app.screens.wardrobe = { render, repaint, openPiece, leave: () => {} };
