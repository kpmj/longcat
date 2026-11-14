/* The wardrobe (design doc section 5): three rows of garments, one row of backgrounds, one button. Only
   finished garments and times already reached can be chosen; this month only; photos only (home never changes);
   no list of combinations and no counter. The Cats tab holds the four cat kinds per body part (free, a setting,
   never progress; moved here from Settings by the game-flow board): the judge above changes as you pick. */
import { app, show, esc, $, $$ } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg, catKindSvg } from "../art/index.js";
import { ZONES, TIMES, STEPS, CAT_KINDS, garmentName, placeById } from "../content.js";
import { openCard } from "./album.js";

let pick = null, mode = "outfit";

const segs = () => `<div class="segs" role="tablist"><button role="tab" data-mode="outfit" aria-selected="${mode === "outfit"}" class="${mode === "outfit" ? "on" : ""}">Outfit</button><button role="tab" data-mode="cats" aria-selected="${mode === "cats"}" class="${mode === "cats" ? "on" : ""}">Cats</button></div>`;
function wireSegs(root) { $$(".segs [data-mode]", root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(root); })); }

/* Cats: ears and tail per body part. The preview is the judge as it is at home, so a change shows at once. */
function cats(root) {
  const S = app.S, place = S.here;
  const o = St.homeScene(S, place, app.real(), { cushion: null, animate: true });
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(placeById(place).name)}</span></div></header>
    ${segs()}
    <div class="scene-wrap small">${sceneSvg(o)}</div>
    <section class="wardrobe kinds">
      ${ZONES.map((z) => `<div class="kind-row"><span class="wlab">${z.name}</span>${CAT_KINDS.map((k) => `<button class="kind${S.settings.kinds[z.id] === k.id ? " on" : ""}" data-zone="${z.id}" data-kind="${k.id}" aria-pressed="${S.settings.kinds[z.id] === k.id}" aria-label="${esc(z.name)}: ${esc(k.name)}">${catKindSvg(k.id, { look: { fur: "short", pattern: "plain", palette: "ginger" } })}<span>${esc(k.short)}</span></button>`).join("")}</div>`).join("")}
      <p class="sub">Only the ears and the tail change. All four are free; change them any time. Postcards already taken stay as they were.</p>
    </section>`;
  $$(".kind", root).forEach((b) => (b.onclick = () => { S.settings.kinds[b.dataset.zone] = b.dataset.kind; app.save(); cats(root); }));
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
    <div class="scene-wrap small">${sceneSvg({ place, time: pick.bg, garments, baskets: [], cushion: null, special: St.specialFor(place), animate: true, seed: 3 })}</div>
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
      <button class="btn primary big" data-a="shoot" ${ZONES.every((z) => pick.set[z.id]) ? "" : "disabled"}>Take a postcard</button>
      <p class="sub">${any ? "Finished garments and times you’ve reached, mixed any way you like. Home doesn’t change." : "Finish a garment and it lands here."}</p>
    </section>`;
  $$(".wcell", root).forEach((b) => (b.onclick = () => {
    pick.set[b.dataset.zone] = pick.set[b.dataset.zone] === b.dataset.time ? null : b.dataset.time;
    render(root);
  }));
  wireSegs(root);
  $$(".bgchip", root).forEach((b) => (b.onclick = () => { pick.bg = b.dataset.bg; render(root); }));
  $("[data-a=shoot]", root).onclick = () => {
    const card = St.addMixCard(S, place, pick.set, pick.bg, app.real());
    if (!card) return;
    app.save();
    openCard(card);
  };
}

app.screens.wardrobe = { render, leave: () => {} };
