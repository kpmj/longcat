/* The album: one cell per month. Three time postcards and the mixed ones; an unfinished month says "7 / 9 garments"
   and its door stays open. A postcard is a picture with no score; it can be saved as an image. */
import { app, show, sheet, closeSheet, esc, $, $$, toast } from "./app.js";
import * as St from "../state.js";
import { postcardSvg, placeThumbSvg } from "../art/index.js";
import { placeById, TIMES } from "../content.js";

function cardSvg(card) {
  return postcardSvg({ ...St.cardScene(app.S, card), caption: card.caption, title: placeById(card.place).name, dateLabel: St.monthLabel(card.date) });
}

function render(root) {
  const S = app.S, real = app.real();
  const opened = St.openedPlaces(S, real);
  const cells = opened.map((place) => {
    const p = placeById(place), m = S.months[place];
    const n = St.garmentsDone(S, place), cards = m?.cards || [];
    const status = !m || !St.takesAt(S, place) ? "Not visited yet" : n >= 9 ? "All nine" : `${n} / 9 garments`;
    const timeCards = TIMES.map((t) => cards.find((c) => c.kind === "time" && c.bg === t.id));
    const mixes = cards.filter((c) => c.kind === "mix");
    return `<article class="month">
      <header><b>${esc(p.name)}</b><span>${status}</span></header>
      <div class="cards">${timeCards.map((c, i) => c
        ? `<button class="pc" data-card="${c.id}" aria-label="${esc(TIMES[i].name)} postcard">${cardSvg(c)}</button>`
        : `<div class="pc empty"><span>${esc(TIMES[i].name)}</span></div>`).join("")}</div>
      ${mixes.length ? `<div class="mixes">${mixes.map((c) => `<button class="pc mini" data-card="${c.id}" aria-label="Mixed postcard">${cardSvg(c)}</button>`).join("")}</div>` : ""}
    </article>`;
  }).join("");
  root.innerHTML = `
    <header class="topbar"><div class="where"><span class="place">Album</span></div></header>
    <section class="album">${cells}<p class="sub">Places you haven’t been say “not visited yet”. Their doors stay open.</p></section>`;
  $$("[data-card]", root).forEach((b) => (b.onclick = () => openCard(St.allCards(S).find((c) => c.id === b.dataset.card))));
}

export function openCard(card) {
  if (!card) return;
  const el = sheet(`<div class="postcard">${cardSvg(card)}</div>
    <div class="row"><button class="btn primary" data-a="png">Save as image</button><button class="btn" data-a="close">Close</button></div>
    <p class="muted small">A postcard is a picture: no score, no sound.</p>`, { tall: true });
  el.querySelector("[data-a=close]").onclick = () => closeSheet();
  el.querySelector("[data-a=png]").onclick = () => savePng(card);
}

/* Rasterise the postcard SVG to a PNG and download it. */
export function savePng(card) {
  const svg = cardSvg(card).replace(/^\s*<svg([^>]*)>/, (m, a) => {
    let attrs = a.replace(/\s(width|height)="[^"]*"/g, "");
    if (!/xmlns=/.test(attrs)) attrs += ' xmlns="http://www.w3.org/2000/svg"';
    return `<svg${attrs} width="800" height="1200">`;
  });
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement("canvas");
    cv.width = 800; cv.height = 1200;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 800, 1200);
    ctx.drawImage(img, 0, 0, 800, 1200);
    cv.toBlob((blob) => {
      if (!blob) return toast("Couldn’t save it. Try again.");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `longcat-${card.place}-${card.date}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, "image/png");
  };
  img.onerror = () => toast("Couldn’t save it. Try again.");
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

app.screens.album = { render };
