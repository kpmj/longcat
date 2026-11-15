/* Cats of one's own (the designer, 2026-11-14 and 15; boards: docs/design/longcat-yarn-shop-animals.md for the rules,
   longcat-shop-screens.md for the screens, layout 甲).
   - The Wardrobe's third tab, Cats: who sings now, the player's cats, the cats who live at this place, the
     shelf of cats and other long animals that can be brought home for treats, and the baskets where the
     player's cats that are not singing sleep.
   - Three sheets: one of the player's own (name it, say where it sings), one to bring home, and "Who sings the
     scarf?", which the Garment sheet on Home opens too.
   - The line on the result sheet that says what a take earned.
   Treats are only ever earned by singing (state.js earnTreats); nothing here sells them. */
import { app, show, esc, $, $$, sheet, closeSheet, toast, wireTaps } from "./app.js";
import * as St from "../state.js";
import { catKindSvg, guestSvg, nappingSvg } from "../art/index.js";
import { ZONES, ZONE_IDS, TREATS, isAnimal, priceOf, catCoat, singerWords, singerNote, placeById } from "../content.js";

/* the coin: a gold disc with a small fish. Drawn here until the art session draws one in the print's style */
export const treatIcon = (s = 16) => `<svg class="treat" width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill="#e6b84f" stroke="#3e2a3c" stroke-width="1.6"/><path d="M5.2 10c1.6-2.6 4.6-2.9 6.6-.9l2.4-1.7v5.2l-2.4-1.7c-2 2-5 1.7-6.6-.9z" fill="#3e2a3c"/></svg>`;
const num = (n) => Number(n).toLocaleString("en");
const zoneName = (id) => (ZONES.find((z) => z.id === id) || ZONES[0]).name;
const singerSvg = (id) => (isAnimal(id) ? guestSvg(id) : catKindSvg(id, { look: { fur: "short", ...catCoat(id) } }));
/* what a singer is called: the player's name for it, or what it looks like */
export const singerLabel = (S, id) => St.catName(S, id) || singerWords(id);
const now = (S) => ({ place: S.here, time: St.currentTime(S, S.here) || "night" });
const purse = (S) => `<span class="purse" role="img" aria-label="${num(St.treatsOf(S))} treats">${treatIcon(18)}${num(St.treatsOf(S))}</span>`;
const again = () => show(app.screen, app.props);

const card = (S, id, o = {}) => `<button class="cat-card${o.on ? " on" : ""}" data-cat="${esc(id)}" aria-label="${esc(singerLabel(S, id))}${o.say ? `, ${esc(o.say)}` : ""}">${o.tag ? `<i class="cat-tag">${esc(o.tag)}</i>` : ""}${singerSvg(id)}<span>${esc(singerLabel(S, id))}</span>${o.under || ""}</button>`;
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

/* ---------- the Wardrobe's Cats tab ---------- */
export function renderCats(root, segs, wireSegs) {
  const S = app.S, { place, time } = now(S);
  const cast = St.castAt(S, place, time), shelf = St.shelfAt(S, place), singing = (id) => ZONES.find((z) => cast[z.id] === id);
  const kindOf = (id) => (St.ownsCat(S, id) ? "yours" : St.specialFor(place) ? "a guest" : "lives here");
  const napping = S.cats.filter((id) => !singing(id));
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(placeById(place).name)}</span></div>${purse(S)}</header>
    ${segs}
    <section class="cats-tab">
      <h4 class="cats-h">Singing now</h4>
      <div class="cat-slots">${ZONES.map((z) => `<button class="cat-slot" data-zone="${z.id}" aria-label="${esc(z.name)}: ${esc(singerLabel(S, cast[z.id]))}. Change"><span class="cat-z">${esc(z.name)}</span>${singerSvg(cast[z.id])}<b>${esc(singerLabel(S, cast[z.id]))}</b><em>${kindOf(cast[z.id])}</em></button>`).join("")}</div>
      <h4 class="cats-h">Your cats <i>${S.cats.length}</i></h4>
      <div class="cat-shelf">${S.cats.map((id) => { const z = singing(id); return card(S, id, { on: !!z, tag: z ? z.name : "", say: z ? `sings the ${z.name.toLowerCase()}` : "" }); }).join("")}</div>
      ${shelf.here.length ? `<h4 class="cats-h">They live here <i>and sing here for free</i></h4>
      <div class="cat-shelf">${shelf.here.map((id) => card(S, id, { tag: singing(id) ? singing(id).name : "", under: price(id, "Keep"), say: `keep for ${priceOf(id)} treats` })).join("")}</div>` : ""}
      ${shelf.cats.length + shelf.animals.length ? `<h4 class="cats-h">More to bring home</h4>
      <div class="cat-shelf">${[...shelf.cats.slice(0, 2), ...shelf.animals, ...shelf.cats.slice(2)].map((id) => card(S, id, { under: price(id), say: `${priceOf(id)} treats` })).join("")}</div>` : ""}
      ${napping.length ? `<h4 class="cats-h">Asleep <i>${napping.length === 1 ? "the one who isn’t singing" : "the ones who aren’t singing"}. You can pat them</i></h4>
      <div class="cat-naps" id="cat-naps">${napsSvg(napping, time)}</div>` : ""}
      <p class="sub">Every take you sing through earns ${TREATS.take} treats, for the first ${TREATS.perDay} of a day.</p>
    </section>`;
  wireSegs(root);
  wireTaps($("#cat-naps", root));
  $$(".cat-slot", root).forEach((b) => (b.onclick = () => openChange(b.dataset.zone)));
  $$(".cat-card", root).forEach((b) => (b.onclick = () => openSinger(b.dataset.cat)));
}

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
    toast(`${singerWords(id)} is yours now.`);
    setTimeout(() => openOwn(id), 500);
  };
}

/* ---------- who sings this garment: the player's cats and the ones who live here ---------- */
export function openChange(zone) {
  const S = app.S, { place, time } = now(S), cast = St.castAt(S, place, time), z = ZONES.find((x) => x.id === zone) || ZONES[0];
  const home = [...new Set(Object.values(St.homeCast(place, time)))].filter((id) => !St.ownsCat(S, id));
  const tagOf = (id) => { const at = ZONES.find((x) => cast[x.id] === id); return cast[zone] === id ? "Now" : at ? at.name : ""; };
  const el = sheet(`
    <h3>Who sings the ${esc(z.name.toLowerCase())}?</h3>
    <p class="muted">Your cats, and the ones who ${St.specialFor(place) ? "are visiting" : "live here"}. One already singing changes places.</p>
    <div class="cat-grid">${S.cats.map((id) => card(S, id, { on: cast[zone] === id, tag: tagOf(id) })).join("")}${home.map((id) => card(S, id, { on: cast[zone] === id, tag: tagOf(id) || (St.specialFor(place) ? "Guest" : "Lives here") })).join("")}<button class="cat-card more" data-a="more"><b aria-hidden="true">+</b>More cats</button></div>
    <button class="btn" data-a="close">Not now</button>`, { tall: true });
  $("[data-a=close]", el).onclick = () => closeSheet();
  $("[data-a=more]", el).onclick = () => { closeSheet(true); show("wardrobe", { tab: "cats" }); };
  $$(".cat-card[data-cat]", el).forEach((b) => (b.onclick = () => {
    if (!St.setSinger(S, place, time, zone, b.dataset.cat)) return;
    app.save();
    closeSheet(true);
    if (app.screen === "home") show("home", { noAutoPick: true, picked: zone }); else again();
    toast(`${singerLabel(S, b.dataset.cat)} sings the ${z.name.toLowerCase()} now.`);
  }));
}

/* ---------- the result sheet's line: what this take earned (t = recordTake's or retakeStep's `treats`) ---------- */
export function treatLine(t) {
  if (!t) return "";
  if (!t.got) return `<div class="treat-line"><span>That’s all the treats for today. Sing on if you like.</span></div>`;
  return `<div class="treat-line"><span>${t.first ? "Enough for a cat now. Wardrobe, then Cats." : "For singing it through"}</span><b>${treatIcon(17)}+${t.got}</b></div>`;
}
