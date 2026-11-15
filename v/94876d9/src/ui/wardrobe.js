/* The wardrobe (the designer, 2026-11-15, board docs/design/longcat-wardrobe-one-page.md, layout 甲). Two tabs:
   - Dress up: one page where dressing the judge and taking a postcard are the same thing. The picture, four buttons
     under it (scarf, top, hat, sky) and "Take a postcard". A garment's button opens that garment's sheet (ui/cats.js
     openDress): which one it is (the morning's, golden hour's or the night's), who sings it, its yarn, and the way
     to sing one of its steps again. The sky's button goes to the next sky reached. The postcard takes what the
     picture shows, and needs three finished garments. Which one and the sky are only this picture's: Home wears the
     garments of the time of day being knitted. A cat or a yarn changed here is changed everywhere.
     It took the place of the Wearing tab, the "Mix a postcard" sheet and the "Earlier garments" list.
   - Album (ui/album.js): the postcards, the mixed ones too.
   Places opens from the chip at the top left of Home (ui/places.js); the cats are in the Store (ui/cats.js). */
import { app, esc, $, $$, wireTaps, paintDock } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg, placeThumbSvg } from "../art/index.js";
import { ZONES, TIMES, STEPS, garmentName, placeById, timeById } from "../content.js";
import { openDress, purse, singerLabel } from "./cats.js";
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

/* ---------- Dress up: the picture, its four buttons, Take a postcard ---------- */
function dressUp(root) {
  const S = app.S, place = S.here, mx = St.mixable(S, place), p = picked(S, place);
  const garments = ZONES.map((z) => St.garmentSpec(S, place, p.set[z.id], z.id));
  const ready = ZONES.every((z) => St.garmentDone(S, place, p.set[z.id], z.id));
  /* three dots: morning, golden hour, night. The one in the picture, the others that can go on a postcard */
  const dots = (cur, list) => `<i class="mix-dots" aria-hidden="true">${TIMES.map((t) => `<u class="${t.id === cur ? "on" : list.includes(t.id) ? "ok" : ""}"></u>`).join("")}</i>`;
  const chip = (z, i) => {
    const t = p.set[z.id], n = St.progress(S, place, t, z.id), who = singerLabel(S, garments[i].singer), name = garmentName(t, z.id);
    return `<button class="mix-chip" data-zone="${z.id}" aria-label="${esc(z.name)}: ${esc(name.toLowerCase())}${n < STEPS ? `, ${n} of ${STEPS} steps` : ""}, sung by ${esc(who)}. Change">${wardrobeThumbSvg({ ...garments[i] })}<b>${esc(name)}</b><em>${n < STEPS ? `${n} / ${STEPS}` : esc(who)}</em>${dots(t, mx.zones[z.id])}</button>`;
  };
  const sky = `<button class="mix-chip" data-sky="1" aria-label="Sky: ${esc(timeById(p.bg).name.toLowerCase())}${mx.skies.length > 1 ? `. Tap for the next of ${mx.skies.length}` : ", the only one so far"}"><span class="mix-sky">${placeThumbSvg(place, p.bg)}</span><b>${esc(timeById(p.bg).name)}</b><em>Sky</em>${dots(p.bg, mx.skies)}</button>`;
  root.innerHTML = `
    ${topbar(S)}
    ${segs()}
    <div class="scene-wrap small dress-pic">${sceneSvg({ place, time: p.bg, garments, baskets: [], cushion: null, special: St.specialFor(place), animate: true, seed: 3, landscape: true })}</div>
    <div class="mix-chips">${ZONES.map(chip).join("")}${sky}</div>
    <button class="btn primary mix-take" data-a="shoot" ${ready ? "" : "disabled"}>Take a postcard</button>
    <p class="sub">${ready ? "Tap a garment to change which one it is, its cat or its yarn." : "A postcard needs three finished garments. Tap one to change it."}</p>`;
  wireTaps($(".scene-wrap", root));
  wireSegs(root);
  $$(".mix-chip[data-zone]", root).forEach((b) => (b.onclick = () => openPiece(b.dataset.zone)));
  $(".mix-chip[data-sky]", root).onclick = () => { p.bg = mx.skies[(mx.skies.indexOf(p.bg) + 1) % mx.skies.length]; render(root); };
  $("[data-a=shoot]", root).onclick = () => {
    const card = St.addMixCard(S, place, p.set, p.bg, app.real());
    if (!card) return;
    app.save();
    /* the new card is in the Album tab, which gets its dot, and so does the bottom row */
    render(root);
    paintDock();
    openCard(card);
  };
}

/* One garment's sheet. Picking another one there ("Which one") changes the picture underneath. `time` puts that
   one in the picture first (the Garment sheet's "change" button, opened from here, knows which one it was). */
function openPiece(zone, time) {
  const S = app.S, p = picked(S, S.here);
  if (time && time !== p.set[zone] && St.reachedTimes(S, S.here).includes(time)) { p.set[zone] = time; repaint(); }
  openDress(zone, p.set[zone], { which: (t) => { p.set[zone] = t; } });
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

/* repaint: draw the tab again under an open sheet (the garment sheet changes what the picture shows) */
const repaint = () => app.screen === "wardrobe" && render($("#screen"));
app.screens.wardrobe = { render, repaint, openPiece, leave: () => {} };
