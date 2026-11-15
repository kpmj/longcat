/* The album: a tab of the Wardrobe that shows the postcards (the designer, 2026-11-15: "move the entire Album inside
   Wardrobe as a tab just to show the result after mixing"; it was a tab of the bottom row). One cell per month: its
   three time postcards and the mixed ones; an unfinished month says "7 / 9 garments" and its door stays open. A
   postcard is a picture with no score; it can be shared or saved as an image. "Sung on N days" is only a number: no
   calendar, no missed days.
   - A mixed postcard is taken on the Wardrobe's Dress up page (ui/wardrobe.js), which took the place of the maker's
     sheet that was here (board docs/design/longcat-wardrobe-one-page.md, layout 甲).
   - There is no Faces tab any more: the judge still learns its twelve faces and makes them, and nothing lists them. */
import { app, sheet, closeSheet, esc, $$, toast } from "./app.js";
import * as St from "../state.js";
import { postcardSvg } from "../art/index.js";
import { placeById, TIMES } from "../content.js";

function cardSvg(card) {
  return postcardSvg({ ...St.cardScene(app.S, card), caption: card.caption, title: placeById(card.place).name, dateLabel: St.monthLabel(card.date) });
}

export function renderAlbum(root, topbar, segs, wireSegs) {
  const S = app.S, real = app.real(), n = S.journal.length;
  const opened = St.openedPlaces(S, real);
  const cells = opened.map((place) => {
    const p = placeById(place), m = S.months[place];
    const done = St.garmentsDone(S, place), cards = m?.cards || [];
    const status = !m || !St.takesAt(S, place) ? "Not visited yet" : done >= 9 ? "All nine" : `${done} / 9 garments`;
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
  root.innerHTML = `${topbar}${segs}
    <section class="album"><p class="days">Sung on ${n} day${n === 1 ? "" : "s"}</p>${cells}<p class="sub">${cur ? `The ${tn} postcard is taken when all three ${tn} garments are on.` : "Places you haven’t been say “not visited yet”. Their doors stay open."}</p></section>`;
  $$("[data-card]", root).forEach((b) => (b.onclick = () => openCard(St.allCards(S).find((c) => c.id === b.dataset.card))));
  wireSegs(root);
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


