/* Places and letters. A new place opens on the 1st and arrives as a two-line letter; the game never moves the
   player there on its own (decision 2). Any open place can be entered once the tutorial garment is done;
   unfinished months keep everything; "not visited yet", never "missed". */
import { app, show, sheet, closeSheet, esc, $, $$, toast } from "./app.js";
import * as St from "../state.js";
import { placeThumbSvg, letterSvg, guestSvg } from "../art/index.js";
import { PLACES, NEWYEAR_LETTER, placeById } from "../content.js";

function render(root) {
  const S = app.S, real = app.real();
  const opened = St.openedPlaces(S, real);
  const unread = St.unreadLetters(S, real);
  const nx = St.nextOpening(S, real);
  const rows = opened.map((place) => {
    const p = placeById(place), n = St.garmentsDone(S, place), here = S.here === place;
    const status = !St.takesAt(S, place) ? "Not visited yet" : n >= 9 ? "All nine" : `${n} / 9 garments`;
    const locked = place !== "onsen" && !St.canTravel(S);
    return `<button class="place-row${here ? " here" : ""}" data-place="${place}" ${locked ? 'data-locked="1"' : ""}>
      <span class="thumb">${placeThumbSvg(place, St.currentTime(S, place) || "night")}</span>
      <span class="pinfo"><b>${esc(p.name)}${St.specialFor(place) ? " · New Year month" : ""}</b><span>${esc(p.seat)} · ${status}</span></span>
      ${here ? '<span class="badge">Here</span>' : unread.includes(place) ? '<span class="badge env">✉</span>' : ""}
    </button>`;
  }).join("");
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Places</span></div></header>
    <section class="places">
      ${rows}
      ${nx ? `<div class="place-row future"><span class="thumb ghost"></span><span class="pinfo"><b>Next place</b><span>Opens on ${St.monthLabel(nx.date)}. A letter comes first.</span></span></div>` : ""}
      ${!St.canTravel(S) ? `<p class="sub">Finish your first garment at the hot spring, then you can go anywhere that’s open.</p>` : `<p class="sub">Any open place, any time. Unfinished garments wait for you.</p>`}
    </section>`;
  $$(".place-row[data-place]", root).forEach((b) => (b.onclick = () => {
    const place = b.dataset.place;
    if (unread.includes(place)) return openLetter(place);
    travel(place);
  }));
}

function travel(place) {
  const S = app.S;
  if (place !== "onsen" && !St.canTravel(S)) return toast("Finish your first garment at the hot spring first");
  if (St.goTo(S, place, app.real())) { app.save(); show("home"); }
}

/* A letter: two lines of invitation, and a choice. Reading it never moves the player. */
export function openLetter(place) {
  if (!place) return;
  const S = app.S, p = placeById(place), special = St.specialFor(place);
  const lines = special === "newyear" ? NEWYEAR_LETTER : p.letter;
  const canGo = place === "onsen" || St.canTravel(S);
  const el = sheet(`
    <div class="letter">${letterSvg({ place, special })}</div>
    <p class="eyebrow">${St.monthLabel(St.placeOpenKey(PLACES.findIndex((x) => x.id === place)))} · a letter</p>
    ${lines.map((l) => `<p class="letter-line">${esc(l)}</p>`).join("")}
    ${special === "newyear" ? `<div class="guests">${["dachshund", "otter", "ferret", "dragon"].map((a) => guestSvg(a)).join("")}</div>` : ""}
    <div class="row">${S.here === place ? `<button class="btn primary" data-a="stay">OK</button>` : `<button class="btn primary" data-a="go" ${canGo ? "" : "disabled"}>Go there</button><button class="btn" data-a="stay">Stay here for now</button>`}</div>
    ${canGo ? "" : `<p class="muted small">Finish your first garment at the hot spring, then you can go.</p>`}`, { onClose: () => { St.readLetter(S, place); app.save(); refreshBadge(); } });
  St.readLetter(S, place);
  app.save();
  const go = el.querySelector("[data-a=go]");
  if (go) go.onclick = () => { closeSheet(true); travel(place); };
  el.querySelector("[data-a=stay]").onclick = () => { closeSheet(true); refreshBadge(); };
}

function refreshBadge() {
  if (app.screen === "places" || app.screen === "home") show(app.screen, { noAutoPick: true });
}

app.screens.places = { render, openLetter };
