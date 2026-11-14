/* The album: one cell per month. Three time postcards and the mixed ones; an unfinished month says "7 / 9 garments"
   and its door stays open. A postcard is a picture with no score; it can be shared or saved as an image.
   The Faces tab keeps the twelve faces the judge learns in the first garment. "Sung on N days" is only a number:
   no calendar, no missed days. */
import { app, show, sheet, closeSheet, esc, $, $$, toast } from "./app.js";
import * as St from "../state.js";
import { postcardSvg, faceIconSvg } from "../art/index.js";
import { placeById, TIMES, TUTORIAL_FACES, STEPS } from "../content.js";

let mode = "cards";

function cardSvg(card) {
  return postcardSvg({ ...St.cardScene(app.S, card), caption: card.caption, title: placeById(card.place).name, dateLabel: St.monthLabel(card.date) });
}

function head(S) {
  const n = S.journal.length;
  return `<header class="topbar"><div class="where"><span class="place">Album</span></div><span class="days">Sung on ${n} day${n === 1 ? "" : "s"}</span></header>
    <div class="segs" role="tablist"><button role="tab" data-mode="cards" aria-selected="${mode === "cards"}" class="${mode === "cards" ? "on" : ""}">Postcards</button><button role="tab" data-mode="faces" aria-selected="${mode === "faces"}" class="${mode === "faces" ? "on" : ""}">Faces</button></div>`;
}
function wire(root) { $$(".segs [data-mode]", root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(root); })); }

function faces(root) {
  const S = app.S, n = Math.min(S.faces, STEPS);
  root.innerHTML = `${head(S)}
    <section class="album"><div class="faces">${TUTORIAL_FACES.map((f, i) => i < n
      ? `<div class="face">${faceIconSvg(f.id, { size: 64 })}<span>${esc(f.name)}</span></div>`
      : `<div class="face todo"><i class="q" aria-hidden="true">?</i><span>Step ${i + 1}</span></div>`).join("")}</div>
    <p class="sub">${n >= STEPS ? "All twelve. A take where every note lands gets one of them." : `The judge learns one face for every step of the first garment. ${n === 0 ? "None yet." : `${n === 1 ? "One" : n} so far.`}`}</p></section>`;
  wire(root);
}

function render(root) {
  if (mode === "faces") return faces(root);
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
  const cur = St.currentTime(S, S.here), tn = cur ? TIMES.find((t) => t.id === cur).name.toLowerCase() : "";
  root.innerHTML = `${head(S)}
    <section class="album">${cells}<p class="sub">${cur ? `The ${tn} postcard is taken when all three ${tn} garments are on.` : "Places you haven’t been say “not visited yet”. Their doors stay open."}</p></section>`;
  wire(root);
  $$("[data-card]", root).forEach((b) => (b.onclick = () => openCard(St.allCards(S).find((c) => c.id === b.dataset.card))));
}

/* Share opens the phone's share menu with the picture; browsers without it only get Save as image. */
const canShareFiles = () => { try { return !!navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] }); } catch { return false; } };

export function openCard(card) {
  if (!card) return;
  const share = canShareFiles();
  const el = sheet(`<div class="postcard">${cardSvg(card)}</div>
    <div class="row">${share ? `<button class="btn primary" data-a="share">Share</button><button class="btn" data-a="png">Save as image</button>` : `<button class="btn primary" data-a="png">Save as image</button><button class="btn" data-a="close">Close</button>`}</div>
    <p class="muted small">A postcard is a picture: no score, no sound.</p>`, { tall: true });
  el.querySelector("[data-a=close]")?.addEventListener("click", () => closeSheet());
  el.querySelector("[data-a=png]").onclick = () => savePng(card);
  el.querySelector("[data-a=share]")?.addEventListener("click", () => sharePng(card));
}

export function sharePng(card) {
  pngBlob(card, (blob) => {
    const file = new File([blob], `longcat-${card.place}-${card.date}.png`, { type: "image/png" });
    navigator.share({ files: [file], title: "Longcat & the Judge" }).catch((e) => { if (e?.name !== "AbortError") download(blob, file.name); });
  });
}

function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* Rasterise the postcard SVG to a PNG and download it. */
export function savePng(card) { pngBlob(card, (blob) => download(blob, `longcat-${card.place}-${card.date}.png`)); }

function pngBlob(card, done) {
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
      done(blob);
    }, "image/png");
  };
  img.onerror = () => toast("Couldn’t save it. Try again.");
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

app.screens.album = { render };
