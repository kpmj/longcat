/* Postcard, letter, place and wardrobe thumbs and the cat-kind card, in the woodblock style. Same signatures as
   ../cards.js. Postcards use the place's G landscape (indigo) behind the characters. Guests still use the old card. */
import { f, int, esc, svgDoc, inset, FONT, txt } from "../util.js";
import { lookOf, animalId, kindId, zoneId } from "../palettes.js";
import { placeId, PLACE_NAME } from "../places/index.js";
import { wrapCaption } from "../cards.js";
import { stampArt as oldStamp } from "../stamps.js";
import { sceneInner, placeLayers } from "./scene.js";
import { judgeFigure } from "./judge.js";
import { garmentLayers } from "./garments.js";
import { loaf } from "./loaf.js";
import { COATS, KEY, coatMarkup, straight, pawPair, catHead, catTail, bodyMarkup } from "./cat.js";
import { headFor, tailFor, GUEST_PAL } from "./guests.js";
import { glyph } from "./lettering.js";
import { PLACES } from "./places/all.js";

export { wrapCaption };
const PAPER = "#efe6d2", CARD = "#f6efdf", RED = "#bf452d", IND = "#1d3150", MUTE = "#6f6658";
const TIME_OF_FUR = { short: "morning", mid: "golden", long: "night" };
const seal = (x, y, s = 18) => `<rect x="${f(x)}" y="${f(y)}" width="${s}" height="${s}" fill="${RED}"/>${glyph("貓", x + s / 2, y + s * .14, s * .72, PAPER)}`;

/* The print finish of a postcard (the designer, 2026-11-14: "always add this post effect", pointing at the indigo sample on the
   design board): the picture is cut a little rough, and the streaks a baren leaves, where the ink did not take, run
   across it in the colour of the paper. Two filters; a postcard is a still picture, so their cost is paid once.
   The ids are fixed: every postcard defines the same two filters, so several on one page do not disturb each other. */
const printFinish = (x, y, w, h) => `<defs><filter id="lc-pc-rough" filterUnits="userSpaceOnUse" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G"/></filter>`
  + `<filter id="lc-pc-streak" filterUnits="userSpaceOnUse" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"><feTurbulence type="fractalNoise" baseFrequency=".006 .25" numOctaves="3" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .937  0 0 0 0 .902  0 0 0 0 .824  0 0 0 -3.4 1.42"/></filter></defs>`;

/* a postcard: the print on top (G landscape, characters in colour), the place as a title, the caption, the mark */
export function postcardSvg(o = {}) {
  o = o || {};
  const scene = sceneInner({ ...o, animate: false, landscape: true });
  const lines = wrapCaption(o.caption), lh = 20;
  const title = o.title == null ? PLACE_NAME[placeId(o.place)] : txt(o.title);
  const textH = 30 + lines.length * lh, sh = Math.min(450, 590 - 22 - textH - 26 - 20), sw = sh * .8, sx = (400 - sw) / 2, top = 20 + sh + 30;
  return svgDoc("0 0 400 600", `<rect width="400" height="600" rx="6" fill="${CARD}"/><rect x="1" y="1" width="398" height="598" rx="6" fill="none" stroke="${KEY}" stroke-width="2"/>
    ${printFinish(sx, 20, sw, sh)}<g filter="url(#lc-pc-rough)">${inset(sx, 20, sw, sh, "0 0 400 500", scene)}</g><rect x="${f(sx)}" y="20" width="${f(sw)}" height="${f(sh)}" filter="url(#lc-pc-streak)" opacity=".42"/><rect x="${f(sx)}" y="20" width="${f(sw)}" height="${f(sh)}" fill="none" stroke="${KEY}" stroke-width="1.6"/>
    <text x="${f(sx + 2)}" y="${f(top)}" ${FONT} font-weight="800" font-size="18" fill="${KEY}">${esc(title)}</text>
    ${lines.map((l, i) => `<text x="${f(sx + 2)}" y="${f(top + 26 + i * lh)}" ${FONT} font-size="14.5" fill="${KEY}">${esc(l)}</text>`).join("")}
    <path d="M${f(sx)} 572 H${f(sx + sw)}" stroke="${KEY}" stroke-width="1" opacity=".35"/>
    <text x="${f(sx + 2)}" y="590" ${FONT} font-size="10.5" fill="${MUTE}">${esc(txt(o.dateLabel))}</text>
    <text x="${f(sx + sw - 22)}" y="590" text-anchor="end" ${FONT} font-weight="800" font-size="10.5" letter-spacing=".6" fill="${MUTE}">Longcat &amp; the Judge</text>${seal(sx + sw - 16, 577, 16)}`);
}

/* stamp pictures. The onsen and New Year are drawn for the print; the other places borrow the old picture with the
   key line added round every shape (until each place is redrawn) */
const STAMP = {
  onsen: `<rect width="44" height="52" fill="#c6d3dc"/><rect width="44" height="14" fill="#93abc4"/><circle cx="12" cy="16" r="6" fill="${RED}"/><path d="M0 30L12 20L20 26L30 16L44 28V52H0Z" fill="#5d7ea3" stroke="${IND}" stroke-width=".9" stroke-linejoin="round"/><rect x="-2" y="27" width="26" height="4" rx="2" fill="${PAPER}"/><path d="M0 38q5.5 -3 11 0t11 0t11 0t11 0V52H0Z" fill="#33517a" stroke="${IND}" stroke-width=".9"/><path d="M4 45q3 -2 6 0M20 47q3 -2 6 0M32 44q3 -2 6 0" stroke="${PAPER}" stroke-width=".9" fill="none"/><circle cx="31" cy="42" r="4" fill="#ebb229" stroke="${IND}" stroke-width=".8"/><path d="M31.5 38q3 -3 5 -1q-3 2 -5 1z" fill="#5d8a63"/>`,
  newyear: `<rect width="44" height="52" fill="${RED}"/><rect x="11" y="13" width="22" height="22" transform="rotate(45 22 24)" fill="#d8644c" stroke="#ebb229" stroke-width="1.5"/><g transform="translate(22 24)">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.sin(a * Math.PI / 180) * 5).toFixed(1)}" cy="${(-Math.cos(a * Math.PI / 180) * 5).toFixed(1)}" r="3.9" fill="#f2d27a" stroke="${KEY}" stroke-width=".7"/>`).join("")}<circle r="2.6" fill="${RED}"/></g><path d="M4 46q9 -6 18 0t18 0" stroke="#ebb229" stroke-width="1.6" fill="none"/>`,
};
export const stampArt = (place, special) => (special ? STAMP.newyear : STAMP[place] || (PLACES[place] && PLACES[place].stamp()) || `<g stroke="${KEY}" stroke-width=".8" stroke-linejoin="round">${oldStamp(place, false)}</g>`);

/* the monthly letter: an envelope addressed to the judge, an airmail edge in red and indigo, a stamp, a postmark */
export function letterSvg(o = {}) {
  o = o || {};
  const special = !!o.special, place = placeId(o.place);
  const paper = special ? "#f2dcc8" : PAPER;
  const perf = Array.from({ length: 8 }, (_, i) => `<circle cx="${f(i * 7.4)}" cy="0" r="1.9"/><circle cx="${f(i * 7.4)}" cy="64" r="1.9"/>`).join("") + Array.from({ length: 10 }, (_, i) => `<circle cx="0" cy="${f(i * 7.1)}" r="1.9"/><circle cx="52" cy="${f(i * 7.1)}" r="1.9"/>`).join("");
  const stamp = `<g transform="translate(234 30) rotate(3)"><rect x="-2" y="-2" width="56" height="68" fill="#fbf6ea" stroke="${KEY}" stroke-width=".8"/><g fill="${paper}">${perf}</g><g transform="translate(4 6)">${stampArt(place, special)}<rect width="44" height="52" fill="none" stroke="${KEY}" stroke-width="1"/></g></g>`;
  const postmark = `<g transform="translate(222 76)" opacity=".6" fill="none" stroke="${special ? RED : IND}" stroke-width="1.4"><circle r="20"/><circle r="15"/><path d="M24 -6q8 -5 16 0t16 0M24 2q8 -5 16 0t16 0M24 10q8 -5 16 0t16 0"/></g>`;
  let bars = "";
  for (let x = 22, i = 0; x < 298; x += 13, i++) bars += `<path d="M${x} 22l6 0l-4 6l-6 0zM${x} 172l6 0l-4 6l-6 0z" fill="${i % 2 ? IND : RED}"/>`;
  return svgDoc("0 0 320 200", `<rect x="14" y="18" width="292" height="164" rx="4" fill="${paper}" stroke="${KEY}" stroke-width="2"/>${bars}
    <path d="M14 32L160 112L306 32" fill="none" stroke="${KEY}" stroke-width="1" opacity=".3"/>
    <text x="38" y="124" ${FONT} font-weight="800" font-size="17" fill="${KEY}">To: The Judge</text>
    <path d="M38 138H192M38 152H160" stroke="${KEY}" stroke-width="1" opacity=".35"/>${stamp}${postmark}${seal(272, 146, 18)}`);
}

/* the place and its empty seat (no paper edge or title) */
const THUMB_Y = { onsen: 110, livingroom: 20, nightmarket: 30, train: 0, beach: 60, library: 10, camping: 120, cinema: 10, bus: 0, museum: 10, rooftop: 20, skilift: 0 };
export function placeThumbSvg(place, time) {
  /* the G landscape where a place has one: a thumb has to read as a place, and the H scene is mostly flat ground */
  const p = placeId(place), L = placeLayers(p, time === "golden" || time === "night" ? time : "morning", 0, false, true);
  return svgDoc("0 0 160 100", inset(0, 0, 160, 100, `0 ${p === "onsen" ? 205 : THUMB_Y[p]} 400 250`, `${L.back}${L.seat}${L.front}`) + `<rect x=".75" y=".75" width="158.5" height="98.5" fill="none" stroke="${KEY}" stroke-width="1.5"/>`);
}

/* a simplified judge wearing one garment (partial when steps < 12; at 0 the cat waits on the lap) */
export function wardrobeThumbSvg(o = {}) {
  o = o || {};
  const zone = zoneId(o.zone) || "bottom", look = lookOf(o.look, zone, "morning"), time = TIME_OF_FUR[look.fur], steps = int(o.steps, 0, 12, 12);
  const J = judgeFigure("neutral");
  const g = { zone, look, kind: kindId(o.kind), animal: animalId(o.animal), steps };
  const L = steps ? garmentLayers(g, { time, animate: false }) : null;
  const wait = steps ? "" : loaf(326, 430, -1, g, "normal", 1.5, zone, time);
  const body = `${J.feet}${J.body}${J.lap}${J.head}${L ? L.art + L.head : ""}${wait}`;
  return svgDoc("0 0 120 120", `<rect width="120" height="120" rx="8" fill="${PAPER}"/>${inset(4, 4, 112, 112, "-12 40 424 424", body)}<rect x="1" y="1" width="118" height="118" rx="8" fill="none" stroke="${KEY}" stroke-width="1.5"/>`);
}

/* a cat sitting as a loaf, showing its kind: ears and tail */
export function catKindSvg(kind, o = {}) {
  const k = kindId(kind), look = lookOf((o && o.look) || { fur: "short", pattern: "plain", palette: "ginger" }, "bottom", "morning"), pal = COATS[look.palette] || COATS.ginger;
  const art = `<g transform="translate(40 24) scale(1.2)">${catTail(k, 0, 0, -1, 8, pal)}</g><ellipse cx="10" cy="22" rx="32" ry="17" fill="${pal.fur}" stroke="${KEY}" stroke-width="2.2"/>${coatMarkup([{ pts: straight(-16, 20, 50), pattern: look.pattern }], 22, pal, 1)}<ellipse cx="6" cy="29" rx="20" ry="7" fill="${pal.belly}"/>${pawPair(-10, 38, 1, 1, pal)}${catHead(-12, -4, 1, "normal", 1.2, pal, k)}`;
  return svgDoc("0 0 120 100", `<g transform="translate(48 54) scale(.86)">${art}</g>`);
}

/* a special-month guest lying long */
export function guestSvg(animal) {
  const a = animalId(animal) === "cat" ? "dachshund" : animalId(animal), pal = GUEST_PAL[a];
  const pts = Array.from({ length: 16 }, (_, i) => { const t = (i + .5) / 16; return { x: 34 + 88 * t, y: 76 - Math.sin(t * Math.PI) * 4, tx: 1, ty: 0 }; });
  const spines = a === "dragon" ? [44, 58, 72, 86, 100, 114].map(x => `<path d="M${x - 6} ${f(67 - Math.sin(((x - 34) / 88) * Math.PI) * 4)}l6 -11l6 11z" fill="${pal.mane}" stroke="${KEY}" stroke-width="1.6" stroke-linejoin="round"/>`).join("") : "";
  const art = `${tailFor(a, "point", 34, 78, 1, 9, pal, false)}${pawPair(44, 88, 1, .9, pal)}${spines}${bodyMarkup([pts], 22, pal)}${pawPair(118, 89, 1, 1, pal)}${headFor(a, "point", 130, 66, 1, "smug", 1, pal)}`;
  return svgDoc("0 0 160 120", `<ellipse cx="84" cy="98" rx="62" ry="6" fill="${KEY}" opacity=".1"/>${art}`);
}
