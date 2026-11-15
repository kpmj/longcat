/* The wardrobe, by garment (the designer, 2026-11-15, wardrobe redesign board, layout 甲: docs/design/longcat-wardrobe-redesign.md).
   Two tabs:
   - Wearing: what the judge wears on Home, one card per garment. A card opens that garment's sheet (ui/cats.js,
     openDress): who sings it, and its yarn. Under the cards, "Earlier garments" lists the finished garments of the
     other times of day (one opens Home's Garment sheet, where its cat and yarn can be changed and a step sung again)
     and "Mix a postcard" opens the maker (ui/album.js openMaker) whenever there is something to mix.
   - Album (ui/album.js): the postcards, the mixed ones too. It was a tab of the bottom row (the designer, 2026-11-15).
   Places was a tab here for a day; it opens from the chip at the top left of Home now (ui/places.js). The Cats tab
   that was here is the Store in the bottom row (ui/cats.js). */
import { app, esc, $, $$, sheet, closeSheet, wireTaps, paintDock } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg } from "../art/index.js";
import { ZONES, TIMES, garmentName, placeById, timeById } from "../content.js";
import { catIconSvg } from "./home-art.js";
import { openDress, purse, singerLabel, yarnLabel, yarnSwatch } from "./cats.js";
import { renderAlbum, openMaker } from "./album.js";

let mode = "wearing";

const TABS = [["wearing", "Wearing"], ["album", "Album"]];
/* a dot on Album while it holds a postcard not looked at yet */
const segs = () => {
  const fresh = mode !== "album" && St.newIn(app.S, "album");
  return `<div class="segs" role="tablist">${TABS.map(([id, name]) => `<button role="tab" data-mode="${id}" aria-selected="${mode === id}" class="${mode === id ? "on" : ""}">${name}${id === "album" && fresh ? '<i class="dot" aria-label="a new postcard"></i>' : ""}</button>`).join("")}</div>`;
};
function wireSegs(root) { $$(".segs [data-mode]", root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(root); })); }
const topbar = (S) => `<header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(placeById(S.here).name)}</span></div>${purse(S)}</header>`;
/* this month's finished garments of the other times of day */
const earlier = (S, place, time) => TIMES.flatMap((t) => (t.id === time ? [] : ZONES.filter((z) => St.garmentDone(S, place, t.id, z.id)).map((z) => ({ time: t.id, zone: z.id }))));

/* ---------- Wearing: the three garments the judge has on now ---------- */
function wearing(root) {
  const S = app.S, place = S.here, time = St.currentTime(S, place) || "night", old = earlier(S, place, time), mix = St.mixable(S, place).any;
  const card = (z) => {
    const g = St.garmentSpec(S, place, time, z.id), who = singerLabel(S, g.singer), y = yarnLabel(g.yarn);
    return `<button class="wear-slot" data-zone="${z.id}" aria-label="${esc(z.name)}: sung by ${esc(who)}, ${esc(y.toLowerCase())}. Change">
      <span class="wear-z">${esc(z.name)}</span><span class="wear-pair">${catIconSvg(g, z.id, time)}${g.yarn ? yarnSwatch(g.yarn, time) : `<span class="wear-none">no yarn</span>`}</span>
      <b>${esc(who)}</b><em>${esc(y)}</em></button>`;
  };
  root.innerHTML = `
    ${topbar(S)}
    ${segs()}
    <div class="scene-wrap small">${sceneSvg(St.homeScene(S, place, app.real(), { cushion: null, animate: true }))}</div>
    <div class="wear-slots">${ZONES.map(card).join("")}</div>
    <p class="sub">What the judge wears on Home. Tap one to change its cat or its yarn.</p>
    ${old.length || mix ? `<div class="row tight wear-more">${old.length ? `<button class="btn ghost" data-a="earlier">Earlier garments</button>` : ""}${mix ? `<button class="btn mix-open" data-a="mix">Mix a postcard</button>` : ""}</div>` : ""}`;
  wireTaps($(".scene-wrap", root));
  wireSegs(root);
  $$(".wear-slot", root).forEach((b) => (b.onclick = () => openDress(b.dataset.zone, time)));
  const eb = $("[data-a=earlier]", root);
  if (eb) eb.onclick = () => pickGarment(old);
  const mb = $("[data-a=mix]", root);
  if (mb) mb.onclick = () => openMaker();
  /* another screen can ask for the maker: show("wardrobe", { tab: "wearing", mix: true }) (the bottom row's Mix,
     the month's last beat) */
  if (app.props.mix) { app.props.mix = null; if (mix) setTimeout(() => app.screen === "wardrobe" && mode === "wearing" && openMaker(), 250); }
}

function render(root) {
  /* another screen can ask for a tab: show("wardrobe", { tab: "album" }) */
  if (app.props.tab && TABS.some(([id]) => id === app.props.tab)) { mode = app.props.tab; app.props.tab = null; }
  if (mode === "album") {
    /* looking at the Album takes its dot away, here and in the bottom row */
    if (St.newIn(app.S, "album")) { St.markSeen(app.S, "album"); app.save(); paintDock(); }
    return renderAlbum(root, topbar(app.S), segs(), wireSegs);
  }
  wearing(root);
}

/* Pick one of this month's finished garments of another time of day (the designer, 2026-11-14: finished garments of earlier
   times can be sung again too). It opens the Garment sheet on Home, which changes its cat and yarn and asks which
   step to sing again; neither moves progress. */
function pickGarment(done) {
  const S = app.S, place = S.here;
  const el = sheet(`
    <h3>Earlier garments</h3>
    <p class="muted">Pick one to change its cat or its yarn, or to sing a step again. Nothing moves forward or back.</p>
    <div class="redo-list">${done.map((g) => `<button class="redo-g" data-zone="${g.zone}" data-time="${g.time}">${wardrobeThumbSvg({ ...St.garmentSpec(S, place, g.time, g.zone) })}<span><b>${esc(garmentName(g.time, g.zone))}</b><i>${esc(timeById(g.time).name)}</i></span></button>`).join("")}</div>
    <button class="btn" data-a="close">Not now</button>`);
  el.querySelector("[data-a=close]").onclick = () => closeSheet();
  el.querySelectorAll(".redo-g").forEach((b) => (b.onclick = () => { closeSheet(true); app.screens.home.openGarment(b.dataset.zone, b.dataset.time); }));
}

/* repaint: draw the tab again under an open sheet (the garment sheet changes what the picture shows) */
app.screens.wardrobe = { render, repaint: () => app.screen === "wardrobe" && render($("#screen")), leave: () => {} };
