/* The wardrobe (design doc section 5): three rows of garments, one row of backgrounds, one button. Only
   finished garments and times already reached can be chosen; this month only; photos only (home never changes);
   no list of combinations and no counter. The Cats tab shows this month's three cats (cast by the game) and lets
   the player put any coat collected this month on any of them: the judge above changes as you pick. */
import { app, show, esc, $, $$, sheet, closeSheet, wireTaps, hopCat } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg, nappingSvg, loaf } from "../art/index.js";
import { ZONES, TIMES, STEPS, PATTERNS, PALETTE_NAMES, garmentName, placeById, timeById, kindFor, catWords } from "../content.js";
import { openCard } from "./album.js";

let pick = null, mode = "outfit";

const segs = () => `<div class="segs" role="tablist"><button role="tab" data-mode="outfit" aria-selected="${mode === "outfit"}" class="${mode === "outfit" ? "on" : ""}">Outfit</button><button role="tab" data-mode="cats" aria-selected="${mode === "cats"}" class="${mode === "cats" ? "on" : ""}">Cats</button></div>`;
function wireSegs(root) { $$(".segs [data-mode]", root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(root); })); }

/* Cats (the designer, 2026-11-14): this month's three cats and their coats.
   - The cats are cast by the game: three different kinds a month, one per garment (content.js kindFor). Nothing to
     choose and nothing to unlock there; the row at the top only shows who they are.
   - The coats are the player's: every finished garment of this month adds its coat (pattern and colour), and any
     cat of this month can wear any of them (state.js, coats). Each garment row lists its own coat first, then the
     collected ones, drawn on that very cat. The picture above is the judge wearing that time's three garments, so a
     change shows at once; home, the baskets and the Outfit tab follow. Next month starts with none. */
let catTime = null;
const catIcon = (place, time, zone, key) => `<svg viewBox="-27 -29 54 43" aria-hidden="true">${loaf(0, 0, 1, { zone, look: St.coatLook(place, time, zone, key), kind: kindFor(place, zone), animal: St.animalFor(place, time, zone) }, "normal", 1, zone, time)}</svg>`;
const coatName = (place, c) => { const l = c.look, p = PATTERNS.find((x) => x.id === l.pattern); return `${p ? p.name : l.pattern}, ${PALETTE_NAMES[l.palette] || l.palette}`; };
function cats(root) {
  const S = app.S, place = S.here;
  const reached = St.reachedTimes(S, place), cur = St.currentTime(S, place) || "night";
  if (!reached.includes(catTime)) catTime = cur;
  const time = catTime;
  const o = time === cur
    ? St.homeScene(S, place, app.real(), { cushion: null, animate: true })
    : { place, time, garments: ZONES.map((z) => St.garmentSpec(S, place, time, z.id)), baskets: [], cushion: null, special: St.specialFor(place), animate: true, seed: 3, landscape: true };
  const coats = St.collectedCoats(S, place);
  /* the cats that have finished and gone to sleep: off the home page (it was too full), kept here (the designer, 2026-11-14) */
  const asleep = St.basketsFor(S, place);
  /* who this cat is, under the garment's name: its shape, and its charm when it wears one */
  const who = (z) => { const w = catWords(kindFor(place, z)); return `<i>${esc(w.shape)}</i>${w.charm ? `<i>${esc(w.charm.replace(/^a /, ""))}</i>` : ""}`; };
  const row = (z) => {
    const own = St.coatKey(time, z.id), worn = St.coatOf(S, place, time, z.id);
    const opts = [{ key: own, label: "Its own", name: "its own coat" }, ...coats.filter((c) => c.key !== own).map((c) => ({ key: c.key, label: garmentName(c.time, c.zone), name: coatName(place, c) }))];
    return `<div class="coat-row"><span class="wlab">${z.name}${who(z.id)}</span><div class="coats">${opts.map((c) => `<button class="coat${worn === c.key ? " on" : ""}" data-zone="${z.id}" data-coat="${c.key}" aria-pressed="${worn === c.key}" aria-label="${esc(garmentName(time, z.id))}: ${esc(c.name)}">${catIcon(place, time, z.id, c.key)}<span>${esc(c.label)}</span></button>`).join("")}</div></div>`;
  };
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(placeById(place).name)}</span></div></header>
    ${segs()}
    <div class="scene-wrap small">${sceneSvg(o)}</div>
    <section class="wardrobe kinds">
      ${reached.length > 1 ? `<div class="wrow bgs"><span class="wlab">Time</span>${TIMES.map((t) => `<button class="bgchip t-${t.id}${time === t.id ? " on" : ""}" data-cat-time="${t.id}" ${reached.includes(t.id) ? "" : "disabled"} aria-pressed="${time === t.id}">${esc(t.name)}</button>`).join("")}</div>` : ""}
      ${ZONES.map(row).join("")}
      <p class="sub">${coats.length ? "Any coat you’ve collected can go on any cat this month." : "Finish a garment and its coat lands here, for any cat this month."} Next month brings three other cats, and its coats start again.</p>
      ${asleep.length ? `<div class="nap"><span class="wlab">Asleep</span><div class="seg" id="nap">${nappingSvg({ baskets: asleep, time: o.time })}</div></div>
      <p class="sub">The ${St.specialFor(place) ? "guests" : "cats"} of the earlier ${asleep.length > 1 ? "times" : "time"} of day sleep here. You can pat them.</p>` : ""}
    </section>`;
  wireTaps($(".scene-wrap", root));
  wireTaps($("#nap", root));
  $$(".coat", root).forEach((b) => (b.onclick = () => {
    if (!St.setCoat(S, place, time, b.dataset.zone, b.dataset.coat)) return;
    app.save();
    cats(root);
    hopCat($(".scene-wrap", root), b.dataset.zone);
  }));
  $$("[data-cat-time]", root).forEach((b) => (b.onclick = () => { catTime = b.dataset.catTime; cats(root); }));
  wireSegs(root);
}

function render(root) {
  if (mode === "cats") return cats(root);
  const S = app.S, place = S.here, p = placeById(place);
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
    <header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(p.name)}</span></div></header>
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
      <p class="sub">${any ? "Finished garments and times you’ve reached, mixed any way you like. Home doesn’t change." : "Finish a garment and it lands here."}</p>
      ${any ? `<button class="btn ghost" data-a="redo">Sing a step again</button>` : ""}
    </section>`;
  $$(".wcell", root).forEach((b) => (b.onclick = () => {
    pick.set[b.dataset.zone] = pick.set[b.dataset.zone] === b.dataset.time ? null : b.dataset.time;
    render(root);
  }));
  wireSegs(root);
  $$(".bgchip", root).forEach((b) => (b.onclick = () => { pick.bg = b.dataset.bg; render(root); }));
  const redo = $("[data-a=redo]", root);
  if (redo) redo.onclick = () => pickToRedo();
  $("[data-a=shoot]", root).onclick = () => {
    const card = St.addMixCard(S, place, pick.set, pick.bg, app.real());
    if (!card) return;
    app.save();
    openCard(card);
  };
}

/* Singing a step of a finished garment again (the designer, 2026-11-14: finished garments of earlier times too). A tap on
   a cell above picks it for the postcard, so this has its own button: pick a garment, then a step in its
   Garment sheet (home.js). It never moves progress. */
function pickToRedo() {
  const S = app.S, place = S.here;
  const done = [];
  for (const t of TIMES) for (const z of ZONES) if (St.garmentDone(S, place, t.id, z.id)) done.push({ time: t.id, zone: z.id });
  const el = sheet(`
    <h3>Sing a step again</h3>
    <p class="muted">Pick a garment, then the step. The new take replaces that step. Nothing moves forward or back.</p>
    <div class="redo-list">${done.map((g) => `<button class="redo-g" data-zone="${g.zone}" data-time="${g.time}">${wardrobeThumbSvg({ ...St.garmentSpec(S, place, g.time, g.zone) })}<span><b>${esc(garmentName(g.time, g.zone))}</b><i>${esc(timeById(g.time).name)}</i></span></button>`).join("")}</div>
    <button class="btn" data-a="close">Not now</button>`);
  el.querySelector("[data-a=close]").onclick = () => closeSheet();
  el.querySelectorAll(".redo-g").forEach((b) => (b.onclick = () => { closeSheet(true); app.screens.home.openGarment(b.dataset.zone, b.dataset.time); }));
}

app.screens.wardrobe = { render, leave: () => {} };
