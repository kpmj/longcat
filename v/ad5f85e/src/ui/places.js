/* Places and letters: a sheet behind the chip at the top left of Home, which says where the judge is (the designer,
   2026-11-15; it was a tab of the bottom row, then of the Wardrobe). The row of the place the judge is at opens
   its times of day (ui/home.js openTimes). A new place opens when the morning's three garments are on at the place
   before it (the designer, 2026-11-24; until then on the 1st of a month) and arrives as a two-line letter; the game never
   moves the player there on its own (decision 2). In January the New Year's guests visit: a row and a letter say
   so, and nothing has to be done about it. Any open place can be entered once the tutorial garment is done;
   unfinished months keep everything; "not visited yet", never "missed". */
import { app, show, sheet, closeSheet, esc, $, $$, toast } from "./app.js";
import * as St from "../state.js";
import { placeThumbSvg, letterSvg, guestSvg } from "../art/index.js";
import { PLACES, NEWYEAR_LETTER, VISITORS, TIMES, ZONES, STEPS, placeById } from "../content.js";

export function openPlaces() {
  const S = app.S, real = app.real();
  St.keepVisit(S, real);
  const opened = St.openedPlaces(S);
  const unread = St.unreadLetters(S);
  const nx = St.nextOpening(S);
  const visit = !S.visit ? "" : `<button class="place-row visit" data-letter="${esc(S.visit)}">
      <span class="thumb guest">${guestSvg("dragon")}</span>
      <span class="pinfo"><b>New Year visit</b><span>Four guests are here all January. Any of them will sing a garment.</span></span>
      ${unread.includes(S.visit) ? '<span class="badge env">✉</span>' : ""}
    </button>`;
  const rows = opened.map((place) => {
    const p = placeById(place), n = St.garmentsDone(S, place), here = S.here === place;
    const status = !St.takesAt(S, place) ? "Not visited yet" : n >= 9 ? "All nine" : `${n} / 9 garments`;
    const locked = place !== "onsen" && !St.canTravel(S);
    return `<button class="place-row${here ? " here" : ""}" data-place="${place}" ${locked ? 'data-locked="1"' : ""}>
      <span class="thumb">${placeThumbSvg(place, St.currentTime(S, place) || "night")}</span>
      <span class="pinfo"><b>${esc(p.name)}</b><span>${here ? `${n >= 9 ? "All nine" : `${n} / 9`} · times of day ›` : `${esc(p.seat)} · ${status}`}</span></span>
      ${here ? '<span class="badge">Here</span>' : unread.includes(place) ? '<span class="badge env">✉</span>' : ""}
    </button>`;
  }).join("");
  const root = sheet(`
    <h3>Places</h3>
    <section class="places">
      ${visit}
      ${rows}
      ${nx ? `<div class="place-row future"><span class="thumb ghost"></span><span class="pinfo"><b>Next place</b><span>Opens when the three morning garments are on ${esc(placeById(nx.after).at)}: ${nx.left} ${nx.left === 1 ? "step" : "steps"} to go.</span></span></div>` : ""}
      ${!St.canTravel(S) ? `<p class="sub">Finish your first garment at the hot spring, then you can go anywhere that’s open.</p>` : `<p class="sub">Any open place, any time. Unfinished garments wait for you.</p>`}
    </section>
    <button class="btn" data-a="close">Close</button>`, { tall: true });
  $("[data-a=close]", root).onclick = () => closeSheet();
  const vb = $(".place-row[data-letter]", root);
  if (vb) vb.onclick = () => openLetter(vb.dataset.letter);
  $$(".place-row[data-place]", root).forEach((b) => (b.onclick = () => {
    const place = b.dataset.place;
    if (unread.includes(place)) return openLetter(place);
    if (place === S.here) { closeSheet(true); return app.screens.home.openTimes(); }
    openPlace(place);
  }));
}

/* The place sheet: what the nine garments there look like, then Go there (game-flow board, change 11). */
function openPlace(place) {
  const S = app.S, p = placeById(place), here = S.here === place;
  const canGo = place === "onsen" || St.canTravel(S), visited = St.takesAt(S, place) > 0;
  const nine = TIMES.map((t) => `<span class="wlab">${esc(t.name)}</span>${ZONES.map((z) => {
    const n = St.progress(S, place, t.id, z.id);
    return `<i class="${n >= STEPS ? "done" : n > 0 ? "part" : ""}">${n >= STEPS ? "✓" : n > 0 ? `${n}/${STEPS}` : ""}</i>`;
  }).join("")}`).join("");
  const el = sheet(`
    <div class="phead"><span class="thumb">${placeThumbSvg(place, St.currentTime(S, place) || "night")}</span><div><p class="eyebrow">Place ${PLACES.findIndex((x) => x.id === place) + 1}</p><h3>${esc(p.name)}</h3><p class="muted small">${esc(p.seat[0].toUpperCase() + p.seat.slice(1))}.</p></div></div>
    <div class="nine"><span></span>${ZONES.map((z) => `<b>${z.name}</b>`).join("")}${nine}</div>
    <p class="muted small">${here ? "The judge is sitting here now." : !visited ? `Nothing sung here yet. ${esc(placeById(S.here).name)} keeps everything while you’re away.` : `${St.garmentsDone(S, place)} of 9 garments. Everything here waits for you.`}</p>
    ${!canGo ? `<p class="muted small">Finish your first garment at the hot spring, then you can go.</p>` : ""}
    <div class="row">${here ? `<button class="btn primary" data-a="stay">OK</button>` : `<button class="btn primary" data-a="go" ${canGo ? "" : "disabled"}>Go there</button><button class="btn" data-a="stay">Stay here</button>`}</div>`);
  const go = el.querySelector("[data-a=go]");
  if (go) go.onclick = () => { closeSheet(true); travel(place); };
  el.querySelector("[data-a=stay]").onclick = () => closeSheet();
}

function travel(place) {
  const S = app.S;
  if (place !== "onsen" && !St.canTravel(S)) return toast("Finish your first garment at the hot spring first");
  if (St.goTo(S, place)) { app.save(); show("home"); }
}

/* A letter: two lines of invitation, and a choice. Reading it never moves the player. */
export function openLetter(place) {
  if (!place) return;
  if (St.isVisitLetter(place)) return openVisitLetter(place);
  const S = app.S, p = placeById(place), special = false;
  const lines = p.letter;
  const canGo = place === "onsen" || St.canTravel(S);
  const el = sheet(`
    <div class="letter">${letterSvg({ place, special })}</div>
    <p class="eyebrow">A letter</p>
    ${lines.map((l) => `<p class="letter-line">${esc(l)}</p>`).join("")}
    <div class="row">${S.here === place ? `<button class="btn primary" data-a="stay">OK</button>` : `<button class="btn primary" data-a="go" ${canGo ? "" : "disabled"}>Go there</button><button class="btn" data-a="stay">Stay here for now</button>`}</div>
    ${canGo ? "" : `<p class="muted small">Finish your first garment at the hot spring, then you can go.</p>`}`, { onClose: () => { St.readLetter(S, place); app.save(); refreshBadge(); } });
  St.readLetter(S, place);
  app.save();
  const go = el.querySelector("[data-a=go]");
  if (go) go.onclick = () => { closeSheet(true); travel(place); };
  el.querySelector("[data-a=stay]").onclick = () => { closeSheet(true); refreshBadge(); };
}

/* The visit's letter: who has come and what they will do. It asks nothing; the one button leads to Dress up, where
   a guest can be put on a garment, and the other shuts it. */
function openVisitLetter(id) {
  const S = app.S, kind = String(id).split("-")[0];
  const el = sheet(`
    <div class="letter">${letterSvg({ place: S.here, special: true })}</div>
    <p class="eyebrow">A letter</p>
    ${NEWYEAR_LETTER.map((l) => `<p class="letter-line">${esc(l)}</p>`).join("")}
    <div class="guests">${(VISITORS[kind] || []).map((a) => guestSvg(a)).join("")}</div>
    <div class="row"><button class="btn primary" data-a="stay">OK</button><button class="btn" data-a="dress">Dress up</button></div>
    <p class="muted small">Nothing waits on them. The cats sing as always, and the guests go home when January ends.</p>`, { onClose: () => { St.readLetter(S, id); app.save(); refreshBadge(); } });
  St.readLetter(S, id);
  app.save();
  el.querySelector("[data-a=stay]").onclick = () => { closeSheet(true); refreshBadge(); };
  el.querySelector("[data-a=dress]").onclick = () => { closeSheet(true); show("wardrobe", { tab: "dress" }); };
}

function refreshBadge() {
  if (app.screen === "home") show("home", { noAutoPick: true });
}
