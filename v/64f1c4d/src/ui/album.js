/* The album: postcards, and where one is mixed (the designer, 2026-11-15, board docs/design/longcat-postcards-together.md,
   layout 甲: "these two tabs seem to belong together"). One cell per month: its three time postcards and the mixed
   ones; an unfinished month says "7 / 9 garments" and its door stays open. A postcard is a picture with no score;
   it can be shared or saved as an image. "Sung on N days" is only a number: no calendar, no missed days.
   - At the place the player is at, a dashed "Mix one" card stands before the mixed postcards whenever there is
     something to mix (state.js mixable). It opens the maker.
   - The maker is a sheet: the picture and four buttons under it (scarf, top, hat, sky). A tap on one goes to the
     next finished garment of that kind, or the next sky reached; three dots under it are morning, golden hour and
     night (the one in use, the others that can be had, the ones not finished). Only this month; photos only (Home
     never changes); no list of combinations and no counter. It took the place of the Wardrobe's Postcard tab and
     its twelve cells.
   - There is no Faces tab any more: the judge still learns its twelve faces and makes them, and nothing lists them. */
import { app, sheet, closeSheet, esc, $, $$, toast } from "./app.js";
import * as St from "../state.js";
import { postcardSvg, sceneSvg, wardrobeThumbSvg, placeThumbSvg } from "../art/index.js";
import { placeById, timeById, TIMES, ZONES, garmentName } from "../content.js";

function cardSvg(card) {
  return postcardSvg({ ...St.cardScene(app.S, card), caption: card.caption, title: placeById(card.place).name, dateLabel: St.monthLabel(card.date) });
}

function render(root) {
  const S = app.S, real = app.real(), n = S.journal.length;
  const opened = St.openedPlaces(S, real);
  const canMix = St.mixable(S, S.here).any;
  const cells = opened.map((place) => {
    const p = placeById(place), m = S.months[place];
    const done = St.garmentsDone(S, place), cards = m?.cards || [];
    const status = !m || !St.takesAt(S, place) ? "Not visited yet" : done >= 9 ? "All nine" : `${done} / 9 garments`;
    const timeCards = TIMES.map((t) => cards.find((c) => c.kind === "time" && c.bg === t.id));
    const mixes = cards.filter((c) => c.kind === "mix"), mixHere = place === S.here && canMix;
    return `<article class="month">
      <header><b>${esc(p.name)}</b><span>${status}</span></header>
      <div class="cards">${timeCards.map((c, i) => c
        ? `<button class="pc" data-card="${c.id}" aria-label="${esc(TIMES[i].name)} postcard">${cardSvg(c)}</button>`
        : `<div class="pc empty"><span>${esc(TIMES[i].name)}</span></div>`).join("")}</div>
      ${mixes.length || mixHere ? `<div class="mixes">${mixHere ? `<button class="pc mini mix-new" data-a="mix" aria-label="Mix a postcard"><b aria-hidden="true">+</b><span>Mix one</span></button>` : ""}${mixes.map((c) => `<button class="pc mini" data-card="${c.id}" aria-label="Mixed postcard">${cardSvg(c)}</button>`).join("")}</div>` : ""}
    </article>`;
  }).join("");
  const cur = St.currentTime(S, S.here), tn = cur ? TIMES.find((t) => t.id === cur).name.toLowerCase() : "";
  root.innerHTML = `<header class="topbar"><div class="where"><span class="place">Album</span></div><span class="days">Sung on ${n} day${n === 1 ? "" : "s"}</span></header>
    <section class="album">${cells}<p class="sub">${cur ? `The ${tn} postcard is taken when all three ${tn} garments are on.` : "Places you haven’t been say “not visited yet”. Their doors stay open."}</p></section>`;
  $$("[data-card]", root).forEach((b) => (b.onclick = () => openCard(St.allCards(S).find((c) => c.id === b.dataset.card))));
  const mix = $("[data-a=mix]", root);
  if (mix) mix.onclick = () => openMaker();
  /* another screen can ask for the maker: show("album", { mix: true }) (the bottom row's Mix, the month's last beat) */
  if (app.props.mix) { app.props.mix = null; if (canMix) setTimeout(() => app.screen === "album" && openMaker(), 250); }
}

/* ---------- the maker: mix a postcard ---------- */
let pick = null;
function openMaker() {
  const S = app.S, place = S.here, mx = St.mixable(S, place);
  if (!mx.any) return;
  /* it opens on the newest finished garment of each kind under the newest sky, and keeps the mix while at this place */
  if (!pick || pick.place !== place || !ZONES.every((z) => mx.zones[z.id].includes(pick.set[z.id])) || !mx.skies.includes(pick.bg)) {
    pick = { place, bg: mx.skies[mx.skies.length - 1], set: {} };
    for (const z of ZONES) pick.set[z.id] = mx.zones[z.id][mx.zones[z.id].length - 1];
  }
  const el = sheet(`
    <div class="mix-head"><h3>Mix a postcard</h3><span>${esc(placeById(place).name)}</span></div>
    <div id="mix-body"></div>
    <p class="muted small mix-hint">Tap one to change it. Only finished garments come up.</p>
    <div class="row"><button class="btn" data-a="close">Close</button><button class="btn primary mix-take" data-a="shoot">Take a postcard</button></div>`, { tall: true });
  const body = $("#mix-body", el);
  const next = (list, cur) => list[(list.indexOf(cur) + 1) % list.length];
  const dots = (cur, list) => `<i class="mix-dots" aria-hidden="true">${TIMES.map((t) => `<u class="${t.id === cur ? "on" : list.includes(t.id) ? "ok" : ""}"></u>`).join("")}</i>`;
  const say = (what, cur, list) => `${what}: ${esc(timeById(cur).name.toLowerCase())}${list.length > 1 ? `. Tap for the next of ${list.length}` : ", the only one finished"}`;
  const paint = () => {
    const garments = ZONES.map((z) => St.garmentSpec(S, place, pick.set[z.id], z.id));
    body.innerHTML = `
      <div class="scene-wrap small mix-pic">${sceneSvg({ place, time: pick.bg, garments, baskets: [], cushion: null, special: St.specialFor(place), animate: true, seed: 3, landscape: true })}</div>
      <div class="mix-chips">${ZONES.map((z, i) => `<button class="mix-chip" data-zone="${z.id}" aria-label="${say(esc(garmentName(pick.set[z.id], z.id)), pick.set[z.id], mx.zones[z.id])}">${wardrobeThumbSvg({ ...garments[i] })}<b>${esc(garmentName(pick.set[z.id], z.id))}</b>${dots(pick.set[z.id], mx.zones[z.id])}</button>`).join("")}<button class="mix-chip" data-sky="1" aria-label="${say("Sky", pick.bg, mx.skies)}"><span class="mix-sky">${placeThumbSvg(place, pick.bg)}</span><b>${esc(timeById(pick.bg).name)}</b>${dots(pick.bg, mx.skies)}</button></div>`;
    $$(".mix-chip[data-zone]", body).forEach((b) => (b.onclick = () => { const z = b.dataset.zone; pick.set[z] = next(mx.zones[z], pick.set[z]); paint(); }));
    $(".mix-chip[data-sky]", body).onclick = () => { pick.bg = next(mx.skies, pick.bg); paint(); };
  };
  paint();
  $("[data-a=close]", el).onclick = () => closeSheet();
  $("[data-a=shoot]", el).onclick = () => {
    const card = St.addMixCard(S, place, pick.set, pick.bg, app.real());
    if (!card) return;
    app.save();
    closeSheet(true);
    /* the new card is in the album behind its own sheet */
    if (app.screen === "album") render($("#screen"));
    openCard(card);
  };
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

app.screens.album = { render, openMaker };
