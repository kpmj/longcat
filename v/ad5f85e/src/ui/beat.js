/* The reset beat (design doc section 3): when the third garment of a time is finished, five things happen in
   order, each one putting something away rather than taking it: the postcard is taken, the sky changes, the
   three cats climb down into a basket, the judge looks down at itself and raises a brow, and the three are back
   (since 2026-11-15 a place has three singers all day long, so it is the same three after a nap, not new ones).
   Since 2026-11-14 the middle of it moves (the scene options leaving / react / paws / arriving, see
   docs/art-style.md): the cats let go one by one and run to the basket; the judge, with nothing on, feels a
   breeze, holds its tummy and raises one eyebrow as if that was the plan. Cute, never rude: it is a capybara
   without its hat. */
import { app, show, esc, $ } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, postcardSvg } from "../art/index.js";
import { TIME_IDS, ZONE_IDS, PLACE_IDS, OPEN_AFTER, timeById, placeById } from "../content.js";
import { chime } from "../audio/synth.js";
import { openCard } from "./album.js";

function render(root, { place, time }) {
  const S = app.S, real = app.real();
  St.ensureTimeCards(S, place, real);
  app.save();
  const card = St.monthOf(S, place).cards.find((c) => c.kind === "time" && c.bg === time);
  const next = TIME_IDS[TIME_IDS.indexOf(time) + 1] || null;
  const tName = timeById(time).name;
  const done = (t) => ZONE_IDS.map((z) => St.garmentSpec(S, place, t, z));
  const prevBaskets = St.basketsFor(S, place).filter((b) => b.time !== time);
  const withThis = [...prevBaskets, { time, cats: done(time).map((g) => ({ zone: g.zone, look: g.look, kind: g.kind, animal: g.animal })) }];
  const special = St.visiting(S);
  const base = { place, special, animate: true, cushion: null };
  /* a guest among the three: they are not all cats */
  const guests = done(time).some((g) => g.animal && g.animal !== "cat");
  /* finishing the morning is what opens the next place (the designer, 2026-11-24): its letter has come, and the last frame says so */
  const opens = time === OPEN_AFTER ? PLACE_IDS[PLACE_IDS.indexOf(place) + 1] || null : null;
  const letter = opens && !S.letters.includes(opens) ? opens : null;
  const beats = next ? [
    { cap: `The ${tName.toLowerCase()} postcard is taken and put in the album.`, html: postcardSvg({ ...St.cardScene(S, card), caption: card.caption, title: placeById(place).name, dateLabel: St.monthLabel(card.date) }), card: true },
    { cap: "The sky changes.", scene: { ...base, time: next, garments: done(time), baskets: prevBaskets } },
    { cap: `One by one the ${guests ? "three" : "cats"} let go, hop down and curl up in a basket. Its tag says “${tName}”.`, scene: { ...base, time: next, garments: [], leaving: done(time), baskets: withThis } },
    { cap: "The judge looks down at itself. No hat. No scarf. No top.", scene: { ...base, time: next, garments: [], baskets: withThis, face: "look-down", react: "plop" } },
    { cap: "A small breeze. It holds its tummy and raises one eyebrow, as if this was the plan.", scene: { ...base, time: next, garments: [], baskets: withThis, face: "brow", react: "shiver", paws: "tummy" } },
    { cap: `After a nap the three are back on the shelf. Their yarn is a little thicker than the last.`, scene: { ...base, time: next, garments: ZONE_IDS.map((z) => St.garmentSpec(S, place, next, z)), baskets: prevBaskets, arriving: true } },
  ] : [
    { cap: "The night postcard is taken and put in the album.", html: postcardSvg({ ...St.cardScene(S, card), caption: card.caption, title: placeById(place).name, dateLabel: St.monthLabel(card.date) }), card: true },
    { cap: "All nine are on.", scene: { ...base, time: "night", garments: done("night"), baskets: prevBaskets, face: St.tutorialDone(S) ? "content-sleep" : "neutral" }, end: true },
  ];
  /* LATER (decision 5, option 乙): after the month's last postcard, the earliest and latest shape of the same drill
     side by side ("the same phrase, the first day and today"). The shapes are already saved per step; nothing reads them yet. */
  let k = 0;
  const more = St.placeWaiting(S, place);
  const paint = () => {
    const b = beats[k];
    root.innerHTML = `
      <div class="beat-stage${b.card ? " is-card" : ""}">${b.html || sceneSvg(b.scene)}</div>
      <div class="beat-foot">
        <p class="beat-cap">${esc(b.cap)}</p>
        ${b.end ? `<p class="muted">The wardrobe is all open: mix the nine any way you like and take postcards. ${more ? `${esc(placeById(more).name)} is waiting in Places. ` : ""}Nothing here ever closes.</p>` : ""}
        ${letter && k === beats.length - 1 ? `<p class="muted">A letter has come: ${esc(placeById(letter).name)} is open. Go when you like. The rest of the day here waits for you.</p>` : ""}
        <div class="dots">${beats.map((_, i) => `<i class="${i === k ? "on" : ""}"></i>`).join("")}</div>
        ${b.card ? `<button class="btn ghost tight" data-a="share">Share or save this postcard</button>` : ""}
        ${b.end ? `<div class="row"><button class="btn primary" data-a="wardrobe">Mix a postcard</button><button class="btn" data-a="home">Home</button></div>`
          : `<button class="btn primary" data-a="next">${k === beats.length - 1 ? "Which one first?" : "Next"}</button>`}
      </div>`;
    const go = (screen) => { St.markBeatSeen(S, place, time); app.save(); show(screen); };
    const n = $("[data-a=next]", root);
    if (n) n.onclick = () => {
      if (k < beats.length - 1) { k++; paint(); return; }
      St.markBeatSeen(S, place, time);
      app.save();
      show("home", { noAutoPick: true });
      setTimeout(() => app.screens.home.openPicker?.({ after: `${timeById(next).name} is here.` }), 400);
    };
    const sh = $("[data-a=share]", root);
    if (sh) sh.onclick = () => openCard(card);
    const w = $("[data-a=wardrobe]", root);
    if (w) w.onclick = () => { St.markBeatSeen(S, place, time); app.save(); show("wardrobe", { tab: "dress" }); };
    const h = $("[data-a=home]", root);
    if (h) h.onclick = () => go("home");
  };
  chime([523, 659, 784, 1046]);
  paint();
}

app.screens.beat = { render, fullscreen: true };
