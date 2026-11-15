/* The wardrobe, by garment (the designer, 2026-11-15, wardrobe redesign board, layout 甲: docs/design/longcat-wardrobe-redesign.md).
   Three tabs:
   - Wearing: what the judge wears on Home, one card per garment. A card opens that garment's sheet (ui/cats.js,
     openDress): who sings it, and its yarn. This took the place of the Yarn tab, which listed every yarn three
     times in rows that scrolled sideways and had a Time row nobody explained.
   - Postcard (design doc section 5; it was called Outfit): three rows of garments, one row of skies, one button.
     Only finished garments and times already reached can be chosen; this month only; photos only (Home never
     changes); no list of combinations and no counter. A finished garment of any time of day can have its cat and
     yarn changed, or a step sung again, from here.
   - Cats (ui/cats.js): the player's cats, the ones who live here, and the ones to bring home. */
import { app, esc, $, $$, sheet, closeSheet, wireTaps } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg } from "../art/index.js";
import { ZONES, TIMES, STEPS, garmentName, placeById, timeById } from "../content.js";
import { openCard } from "./album.js";
import { catIconSvg } from "./home-art.js";
import { renderCats, openDress, purse, singerLabel, yarnLabel, yarnSwatch } from "./cats.js";

let pick = null, mode = "wearing";

const TABS = [["wearing", "Wearing"], ["postcard", "Postcard"], ["cats", "Cats"]];
const segs = () => `<div class="segs three" role="tablist">${TABS.map(([id, name]) => `<button role="tab" data-mode="${id}" aria-selected="${mode === id}" class="${mode === id ? "on" : ""}">${name}</button>`).join("")}</div>`;
function wireSegs(root) { $$(".segs [data-mode]", root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(root); })); }
const topbar = (S) => `<header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(placeById(S.here).name)}</span></div>${purse(S)}</header>`;

/* ---------- Wearing: the three garments the judge has on now ---------- */
function wearing(root) {
  const S = app.S, place = S.here, time = St.currentTime(S, place) || "night";
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
    <p class="sub">What the judge wears on Home. Tap one to change its cat or its yarn.</p>`;
  wireTaps($(".scene-wrap", root));
  wireSegs(root);
  $$(".wear-slot", root).forEach((b) => (b.onclick = () => openDress(b.dataset.zone, time)));
}

function render(root) {
  /* another screen can ask for a tab: show("wardrobe", { tab: "cats" }) */
  if (app.props.tab && TABS.some(([id]) => id === app.props.tab)) { mode = app.props.tab; app.props.tab = null; }
  if (mode === "wearing") return wearing(root);
  if (mode === "cats") return renderCats(root, topbar(app.S), segs(), wireSegs);
  const S = app.S, place = S.here;
  const reached = St.reachedTimes(S, place);
  if (!pick || pick.place !== place) {
    pick = { place, bg: reached[reached.length - 1], set: {} };
    for (const z of ZONES) {
      const t = [...TIMES].reverse().find((x) => St.garmentDone(S, place, x.id, z.id));
      pick.set[z.id] = t ? t.id : null;
    }
  }
  const garments = ZONES.filter((z) => pick.set[z.id]).map((z) => St.garmentSpec(S, place, pick.set[z.id], z.id));
  const any = garments.length > 0;
  root.innerHTML = `
    ${topbar(S)}
    ${segs()}
    <div class="scene-pic"><div class="scene-wrap small">${sceneSvg({ place, time: pick.bg, garments, baskets: [], cushion: null, special: St.specialFor(place), animate: true, seed: 3, landscape: true })}</div>
      <button class="btn shoot" data-a="shoot" ${ZONES.every((z) => pick.set[z.id]) ? "" : "disabled"}>Take a postcard</button></div>
    <section class="wardrobe">
      ${ZONES.map((z) => `<div class="wrow"><span class="wlab">${z.name}</span>${TIMES.map((t) => {
        const n = St.progress(S, place, t.id, z.id), ok = n >= STEPS, on = pick.set[z.id] === t.id;
        return `<button class="wcell${on ? " on" : ""}" data-zone="${z.id}" data-time="${t.id}" ${ok ? "" : "disabled"} aria-pressed="${on}">
          ${wardrobeThumbSvg({ ...St.garmentSpec(S, place, t.id, z.id) })}<span>${ok ? esc(garmentName(t.id, z.id)) : `${n} / ${STEPS}`}</span></button>`;
      }).join("")}</div>`).join("")}
      <div class="wrow bgs"><span class="wlab">Sky</span>${TIMES.map((t) => {
        const ok = reached.includes(t.id), on = pick.bg === t.id;
        return `<button class="bgchip t-${t.id}${on ? " on" : ""}" data-bg="${t.id}" ${ok ? "" : "disabled"} aria-pressed="${on}">${esc(t.name)}</button>`;
      }).join("")}</div>
      <p class="sub">${any ? "Finished garments and times you’ve reached, mixed any way you like, for a postcard. Home doesn’t change." : "Finish a garment and it lands here."}</p>
      ${any ? `<div class="row tight"><button class="btn ghost" data-a="dress">Cat and yarn of a garment</button><button class="btn ghost" data-a="redo">Sing a step again</button></div>` : ""}
    </section>`;
  $$(".wcell", root).forEach((b) => (b.onclick = () => {
    pick.set[b.dataset.zone] = pick.set[b.dataset.zone] === b.dataset.time ? null : b.dataset.time;
    render(root);
  }));
  wireSegs(root);
  $$(".bgchip", root).forEach((b) => (b.onclick = () => { pick.bg = b.dataset.bg; render(root); }));
  const redo = $("[data-a=redo]", root);
  if (redo) redo.onclick = () => pickGarment("Sing a step again", "Pick a garment, then the step. The new take replaces that step. Nothing moves forward or back.", (zone, time) => app.screens.home.openGarment(zone, time));
  const dress = $("[data-a=dress]", root);
  if (dress) dress.onclick = () => pickGarment("Cat and yarn of a garment", "Pick a finished garment to change who sings it or what it is knitted in.", (zone, time) => openDress(zone, time));
  $("[data-a=shoot]", root).onclick = () => {
    const card = St.addMixCard(S, place, pick.set, pick.bg, app.real());
    if (!card) return;
    app.save();
    openCard(card);
  };
}

/* Pick one of this month's finished garments, of any time of day. Used for singing a step again (the designer, 2026-11-14:
   finished garments of earlier times too; the Garment sheet on Home then asks which step, and it never moves
   progress) and for changing a garment's cat and yarn. A tap on a cell above picks it for the postcard, so these
   have their own buttons. */
function pickGarment(title, text, then) {
  const S = app.S, place = S.here;
  const done = [];
  for (const t of TIMES) for (const z of ZONES) if (St.garmentDone(S, place, t.id, z.id)) done.push({ time: t.id, zone: z.id });
  const el = sheet(`
    <h3>${esc(title)}</h3>
    <p class="muted">${esc(text)}</p>
    <div class="redo-list">${done.map((g) => `<button class="redo-g" data-zone="${g.zone}" data-time="${g.time}">${wardrobeThumbSvg({ ...St.garmentSpec(S, place, g.time, g.zone) })}<span><b>${esc(garmentName(g.time, g.zone))}</b><i>${esc(timeById(g.time).name)}</i></span></button>`).join("")}</div>
    <button class="btn" data-a="close">Not now</button>`);
  el.querySelector("[data-a=close]").onclick = () => closeSheet();
  el.querySelectorAll(".redo-g").forEach((b) => (b.onclick = () => { closeSheet(true); then(b.dataset.zone, b.dataset.time); }));
}

/* repaint: draw the tab again under an open sheet (the garment sheet changes what the picture shows) */
app.screens.wardrobe = { render, repaint: () => app.screen === "wardrobe" && render($("#screen")), leave: () => {} };
