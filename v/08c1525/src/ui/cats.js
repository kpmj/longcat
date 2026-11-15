/* Cats of one's own (the designer, 2026-11-14 and 15; boards: docs/design/longcat-yarn-shop-animals.md for the rules,
   longcat-shop-screens.md for the shop, longcat-wardrobe-redesign.md for the Wardrobe by garment, layout 甲).
   - The Store, a tab of the bottom row (it was the Wardrobe's Cats tab until the designer moved it, 2026-11-15): the
     player's cats, the cats who live at this place, the shelf of cats and other long animals that can be brought
     home for treats, and the baskets where the player's cats that are not singing sleep.
   - One garment's choices (paintDress): who sings it, and its yarn. In a sheet from the Garment sheet on Home
     (openDress), and straight in the Wardrobe's Dress up page, where it also asks which one (the morning's,
     golden hour's or the night's) and leads to that garment's steps.
   - Two sheets for one singer: the player's own (name it, say where it sings) and one to bring home.
   - The line on the result sheet that says what a take earned.
   Treats are only ever earned by singing (state.js earnTreats); nothing here sells them. */
import { app, show, esc, $, $$, sheet, closeSheet, toast, wireTaps } from "./app.js";
import * as St from "../state.js";
import { catKindSvg, guestSvg, nappingSvg, yarnSwatchSvg, wardrobeThumbSvg } from "../art/index.js";
import { ZONES, ZONE_IDS, TIMES, STEPS, TREATS, YARN_PATTERNS, YARN_COLOR_NAMES, isAnimal, priceOf, catCoat, singerWords, singerNote, timeById, yarnName, garmentName } from "../content.js";

/* the coin: a gold disc with a small fish. Drawn here until the art session draws one in the print's style */
export const treatIcon = (s = 16) => `<svg class="treat" width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="#e6b84f" stroke="#3e2a3c" stroke-width="1.6"/><path d="M5.2 10c1.6-2.6 4.6-2.9 6.6-.9l2.4-1.7v5.2l-2.4-1.7c-2 2-5 1.7-6.6-.9z" fill="#3e2a3c"/></svg>`;
const num = (n) => Number(n).toLocaleString("en");
const zoneName = (id) => (ZONES.find((z) => z.id === id) || ZONES[0]).name;
const singerSvg = (id) => (isAnimal(id) ? guestSvg(id) : catKindSvg(id, { look: { fur: "short", ...catCoat(id) } }));
/* what a singer is called: the player's name for it, or what it looks like */
export const singerLabel = (S, id) => St.catName(S, id) || singerWords(id);
const now = (S) => ({ place: S.here, time: St.currentTime(S, S.here) || "night" });
export const purse = (S) => `<span class="purse" role="img" aria-label="${num(St.treatsOf(S))} treats">${treatIcon(18)}${num(St.treatsOf(S))}</span>`;
const again = () => show(app.screen, app.props);
/* draw the screen again under an open sheet, where the screen knows how (wardrobe.js and home.js) */
const repaint = () => { const scr = app.screens[app.screen]; if (scr && scr.repaint) scr.repaint(); };
/* a yarn in a word or two: the colour of a plain yarn, the pattern of the others (each pattern comes once a month) */
export const yarnLabel = (y) => { if (!y) return "No yarn"; const t = y.type === "plain" ? YARN_COLOR_NAMES[y.a] || "Plain" : (YARN_PATTERNS.find((x) => x.id === y.type) || YARN_PATTERNS[0]).name; return t.charAt(0).toUpperCase() + t.slice(1); };
/* a yarn as a swatch; none at all is an empty outline the same size (the art's yarnSwatchSvg is 96 x 40) */
const NO_SWATCH = `<svg viewBox="0 0 96 40" aria-hidden="true"><rect x="7" y="11" width="82" height="18" rx="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 4" opacity=".55"/></svg>`;
export const yarnSwatch = (y, time) => (y ? yarnSwatchSvg(y, time) : NO_SWATCH);

const card = (S, id, o = {}) => `<button class="cat-card${o.on ? " on" : ""}" data-cat="${esc(id)}" aria-label="${esc(singerLabel(S, id))}${o.say ? `, ${esc(o.say)}` : ""}">${o.tag ? `<i class="cat-tag">${esc(o.tag)}</i>` : ""}${o.zz ? `<i class="cat-zz" aria-hidden="true">z z</i>` : ""}${singerSvg(id)}<span>${esc(singerLabel(S, id))}</span>${o.under || ""}</button>`;
const price = (id, word = "") => `<em class="${word ? "keep" : ""}">${treatIcon(13)}${word ? `${word} ` : ""}${num(priceOf(id))}</em>`;

/* The player's cats that are not singing here nap in baskets, three to a basket, and can be patted (the designer,
   2026-11-15: "把沒上場的貓放回衣櫃睡覺"). Asleep a cat wears no sleeve: it is just the cat, in its own coat. */
const asCat = (id, i) => (isAnimal(id)
  ? { zone: ZONE_IDS[i % 3], animal: id, kind: "point", look: { fur: "short", pattern: "plain", palette: "ginger" } }
  : { zone: ZONE_IDS[i % 3], animal: "cat", kind: id, look: { fur: "short", ...catCoat(id) } });
function napsSvg(ids, time) {
  const baskets = [];
  for (let i = 0; i < ids.length; i += 3) baskets.push({ time, label: "", cats: ids.slice(i, i + 3).map(asCat) });
  const rows = [];
  for (let i = 0; i < baskets.length; i += 3) rows.push(nappingSvg({ baskets: baskets.slice(i, i + 3), time }));
  return rows.join("");
}

/* ---------- the Store ----------
   Who sings is chosen per garment (paintDress), so this is only the cats themselves:
   the player's (a tag says which garment one is singing, "z z" that it is asleep), the ones who live here, the
   shelf, and the baskets. A cat of the player's opens its own sheet; any other opens the one to bring it home. */
function renderStore(root) {
  const S = app.S, { place, time } = now(S);
  const cast = St.castAt(S, place, time), shelf = St.shelfAt(S, place), singing = (id) => ZONES.find((z) => cast[z.id] === id);
  const napping = S.cats.filter((id) => !singing(id));
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Store</span></div>${purse(S)}</header>
    <section class="cats-tab">
      <h4 class="cats-h">Your cats <i>${S.cats.length}${napping.length ? " · the ones not singing are asleep" : ""}</i></h4>
      <div class="cat-grid four">${S.cats.map((id) => { const z = singing(id); return card(S, id, { on: !!z, tag: z ? z.name : "", zz: !z, say: z ? `sings the ${z.name.toLowerCase()}` : "asleep" }); }).join("")}</div>
      ${shelf.here.length ? `<h4 class="cats-h">They live here <i>keep one and it comes along</i></h4>
      <div class="cat-shelf">${shelf.here.map((id) => card(S, id, { tag: singing(id) ? singing(id).name : "", under: price(id, "Keep"), say: `keep for ${priceOf(id)} treats` })).join("")}</div>` : ""}
      ${shelf.cats.length + shelf.animals.length ? `<h4 class="cats-h">More to bring home</h4>
      <div class="cat-shelf">${[...shelf.cats.slice(0, 2), ...shelf.animals, ...shelf.cats.slice(2)].map((id) => card(S, id, { under: price(id), say: `${priceOf(id)} treats` })).join("")}</div>` : ""}
      ${napping.length ? `<h4 class="cats-h">Asleep <i>you can pat them</i></h4>
      <div class="cat-naps" id="cat-naps">${napsSvg(napping, time)}</div>` : ""}
      <p class="sub">Every take you sing through earns ${TREATS.take} treats, for the first ${TREATS.perDay} of a day.</p>
    </section>`;
  wireTaps($("#cat-naps", root));
  $$(".cat-card", root).forEach((b) => (b.onclick = () => openSinger(b.dataset.cat)));
}
app.screens.store = { render: renderStore };

/* ---------- one singer: the player's own, or one to bring home ---------- */
export function openSinger(id) {
  const S = app.S;
  return St.ownsCat(S, id) ? openOwn(id) : openBring(id);
}

function openOwn(id) {
  const S = app.S, { place, time } = now(S), cast = St.castAt(S, place, time);
  const what = isAnimal(id) ? singerWords(id).toLowerCase() : "cat";
  const el = sheet(`
    <div class="cat-hero">${singerSvg(id)}<div><p class="eyebrow">YOUR ${esc(what.toUpperCase())}</p><h3 id="cat-title">${esc(singerLabel(S, id))}</h3><p>${esc(St.catName(S, id) ? `${singerWords(id)}. ${singerNote(id)}` : singerNote(id))}</p></div></div>
    <label class="cat-name"><span>Name</span><input id="cat-name" type="text" maxlength="14" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Give it a name" value="${esc(St.catName(S, id))}"></label>
    <h4>Where should it sing?</h4>
    <div class="pick-row">${ZONES.map((z) => `<button class="pick${cast[z.id] === id ? " on" : ""}" data-zone="${z.id}" aria-pressed="${cast[z.id] === id}"><b>${esc(z.name)}</b><span>${cast[z.id] === id ? "it sings here" : `now: ${esc(singerLabel(S, cast[z.id]))}`}</span></button>`).join("")}</div>
    <button class="btn" data-a="close">Close</button>`, { onClose: again });
  const input = $("#cat-name", el);
  input.oninput = () => {
    St.nameCat(S, id, input.value);
    app.save();
    $("#cat-title", el).textContent = singerLabel(S, id);
  };
  $$(".pick", el).forEach((b) => (b.onclick = () => {
    St.setSinger(S, place, time, b.dataset.zone, id);
    app.save();
    closeSheet(true);
    again();
    toast(`${singerLabel(S, id)} sings the ${zoneName(b.dataset.zone).toLowerCase()} now.`);
  }));
  $("[data-a=close]", el).onclick = () => closeSheet();
}

/* how long until there are enough treats, in days of singing the paid takes */
const daysFor = (need) => { const d = Math.ceil(need / (TREATS.take * TREATS.perDay)); return d <= 1 ? "About one day of singing." : `About ${d} days of singing.`; };

function openBring(id) {
  const S = app.S, { place } = now(S), have = St.treatsOf(S), cost = priceOf(id), short = have < cost;
  const here = St.catsHere(place).includes(id), what = isAnimal(id) ? "long animal" : "cat";
  if (!St.shelfAt(S, place).here.concat(St.shelfAt(S, place).cats, St.shelfAt(S, place).animals).includes(id)) return;
  const el = sheet(`
    <div class="cat-hero">${singerSvg(id)}<div><p class="eyebrow">${here ? "A CAT WHO LIVES HERE" : `A ${what.toUpperCase()} TO BRING HOME`}</p><h3>${esc(singerWords(id))}</h3><p>${esc(singerNote(id))} ${here ? "Keep it and it comes along to every place." : "It stays for good and can sing at any place."}</p></div></div>
    <div class="treat-have${short ? " short" : ""}"><span>${short ? `${num(cost - have)} more. ${daysFor(cost - have)}` : "You have"}</span><b>${treatIcon(17)}${num(have)}</b></div>
    <div class="row"><button class="btn" data-a="close">Not now</button><button class="btn primary" data-a="buy" ${short ? "disabled" : ""}>${here ? "Keep" : "Bring home"} ${treatIcon(15)}${num(cost)}</button></div>`);
  $("[data-a=close]", el).onclick = () => closeSheet();
  $("[data-a=buy]", el).onclick = () => {
    if (!St.buyCat(S, id, place)) return;
    app.save();
    closeSheet(true);
    again();
    /* its own sheet opens next: a name for it, and where it sings. That sheet is the "it is yours" */
    setTimeout(() => openOwn(id), 350);
  };
}

/* ---------- one garment: who sings it, and its yarn ----------
   Everything about one garment in one place (wardrobe redesign, layout 甲). The singer is the place's for that
   zone, the same at every time of day; the yarn is this garment's own choice (state.js setSinger, setYarn). A tap
   changes it at once and `changed` draws again, so the picture follows.
   paintDress draws the choices into an element. It is used twice:
   - straight in the Wardrobe's Dress up page (ui/wardrobe.js), with `which`: a first row asks which one it is, of
     the three times of day, and tells the page through which(time); a last line leads to that garment's steps
     (Home's Garment sheet), where a step can be sung again. Which one only changes the page's picture, never Home.
     A garment not finished yet is grey and cannot be picked (the designer, 2026-11-15: "show it grey for the cloth that
     hasn't been unlocked", and then of one at 1 / 12: "This one doesn't grey out"); so is one of a time of day not
     reached. The one being knitted is still in the picture, grey in this row, while nothing of its kind is
     finished (state.js dressStart).
   - in a sheet (openDress), from the Garment sheet on Home: who sings it and its yarn only. */
export function paintDress(body, zone, t, { which = null, changed = () => {} } = {}) {
  const S = app.S, place = S.here, z = ZONES.find((x) => x.id === zone) || ZONES[0];
  const n = St.progress(S, place, t, z.id), reached = St.reachedTimes(S, place);
  const cell = (x) => {
    const k = St.progress(S, place, x.id, z.id), ok = reached.includes(x.id), locked = k < STEPS, name = garmentName(x.id, z.id);
    return `<button class="wcell${x.id === t ? " on" : ""}${locked ? " locked" : ""}" data-time="${x.id}" aria-pressed="${x.id === t}" ${locked && x.id !== t ? "disabled" : ""} aria-label="${esc(name)}, ${esc(x.name.toLowerCase())}${k >= STEPS ? "" : !ok ? ", not yet" : k ? `, ${k} of ${STEPS} steps` : ", not started"}">${wardrobeThumbSvg({ ...St.garmentSpec(S, place, x.id, z.id) })}<span>${k >= STEPS ? esc(name) : ok ? `${k} / ${STEPS}` : "Not yet"}</span></button>`;
  };
  const cast = St.castAt(S, place, t), cur = cast[z.id];
  const home = [...new Set(Object.values(St.homeCast(place, t)))].filter((id) => !St.ownsCat(S, id));
  const ids = [cur, ...S.cats.filter((id) => id !== cur), ...home.filter((id) => id !== cur)];
  const tagOf = (id) => { const at = ZONES.find((x) => cast[x.id] === id); return id === cur ? "Now" : at ? at.name : ""; };
  const own = St.yarnKey(t, z.id), worn = St.yarnKeyOf(S, place, t, z.id);
  /* none at all first (the designer: "can you have no yarn to be the first option"), then its own, then the collected */
  const yarns = [{ key: St.NO_YARN, label: "No yarn", yarn: null }, { key: own, label: "Its own", yarn: St.yarnAt(place, own) }, ...St.collectedYarns(S, place).filter((c) => c.key !== own).map((c) => ({ key: c.key, label: yarnLabel(c.yarn), yarn: c.yarn }))];
  body.innerHTML = `${which ? `
    <h4>Which one <i>for this picture only</i></h4>
    <div class="dress-which">${TIMES.map(cell).join("")}</div>` : ""}
    <h4>Who sings it</h4>
    <div class="cat-shelf">${ids.map((id) => card(S, id, { on: id === cur, tag: tagOf(id), say: id === cur ? "sings it now" : "" })).join("")}<button class="cat-card more" data-a="more"><b aria-hidden="true">+</b>More cats</button></div>
    <h4>Its yarn</h4>
    <div class="dress-yarns">${yarns.map((c) => `<button class="coat${worn === c.key ? " on" : ""}" data-yarn="${c.key}" aria-pressed="${worn === c.key}" aria-label="${c.yarn ? esc(yarnName(c.yarn)) : "no yarn, just the cat"}${c.key === own ? ", its own yarn" : ""}">${yarnSwatch(c.yarn, t)}<span>${esc(c.label)}</span></button>`).join("")}</div>${which && n ? `
    <button class="dress-link" data-a="steps">Sing a step of the ${esc(garmentName(t, z.id).toLowerCase())} again ›</button>` : ""}`;
  $$(".wcell[data-time]", body).forEach((b) => (b.onclick = () => { if (b.dataset.time !== t) which(b.dataset.time); }));
  const sb = $("[data-a=steps]", body);
  if (sb) sb.onclick = () => { closeSheet(true); app.screens.home.openGarment(z.id, t); };
  $$(".cat-card[data-cat]", body).forEach((b) => (b.onclick = () => { if (!St.setSinger(S, place, t, z.id, b.dataset.cat)) return; app.save(); changed(); }));
  $$(".coat", body).forEach((b) => (b.onclick = () => { if (!St.setYarn(S, place, t, z.id, b.dataset.yarn)) return; app.save(); changed(); }));
  $("[data-a=more]", body).onclick = () => { closeSheet(true); show("store"); };
}

export function openDress(zone, time) {
  const S = app.S, place = S.here, z = ZONES.find((x) => x.id === zone) || ZONES[0];
  const t = time || St.currentTime(S, place) || "night";
  const el = sheet(`
    <div class="dress-head"><h3>${esc(z.name)}</h3><span>${esc(timeById(t).name)} · ${St.progress(S, place, t, z.id)} / ${STEPS}</span></div>
    <div id="dress-body"></div>
    <button class="btn primary" data-a="close">Done</button>`, { onClose: repaint });
  const body = $("#dress-body", el);
  const paint = () => paintDress(body, z.id, t, { changed: () => { paint(); repaint(); } });
  paint();
  $("[data-a=close]", el).onclick = () => closeSheet();
}

/* ---------- the result sheet's line: what this take earned (t = recordTake's or retakeStep's `treats`) ---------- */
export function treatLine(t) {
  if (!t) return "";
  if (!t.got) return `<div class="treat-line"><span>That’s all the treats for today. Sing on if you like.</span></div>`;
  return `<div class="treat-line"><span>${t.first ? "Enough for a cat now. It’s in the Store." : "For singing it through"}</span><b>${treatIcon(17)}+${t.got}</b></div>`;
}
