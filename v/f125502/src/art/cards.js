/* Postcard, letter, place and wardrobe thumbs, cat-kind and guest cards. */
import { f, num, int, esc, svgDoc, inset, FONT, textWidth, txt } from "./util.js";
import { K, lookOf, palOf, animalId, kindId, zoneId } from "./palettes.js";
import { sceneInner } from "./scene.js";
import { placeLayers, placeId, PLACE_NAME } from "./places/index.js";
import { judgeFigure } from "./judge.js";
import { garmentLayers } from "./garments.js";
import { bodyMarkup, coatMarkup, pawPair, straight } from "./cat.js";
import { headFor, tailFor } from "./guests.js";
import { loaf } from "./loaf.js";
import { stampArt } from "./stamps.js";

const TIME_OF_FUR = { short: "morning", mid: "golden", long: "night" };

/* caption lines. English wraps by words at about 36 characters; CJK (if it ever comes in) counts double and
   never starts a line with punctuation. A caption that does not end in a full stop gets one. */
const PUNCT = "，。、！？；：」』）…,.;:!?)";
const isWide = ch => /[⺀-￯]/.test(ch);
export function wrapCaption(text, max = 36, maxLines = 5) {
  let s = txt(text).replace(/\s+/g, " ").trim();
  if (!s) return [];
  if (!/[.!?…。！？」"”')]$/.test(s)) s += [...s].some(isWide) ? "。" : ".";
  /* tokens: a Latin word with its trailing space, or a single wide character */
  const tokens = s.match(/[⺀-￯]|[^\s⺀-￯]+\s?|\s/g) || [s];
  const tw = t => [...t].reduce((a, c) => a + (isWide(c) ? 2 : 1), 0);
  const lines = [];
  let cur = "";
  for (let tok of tokens) {
    if (!cur && tok === " ") continue;
    if (tw(cur.trimEnd() + tok.trimEnd()) > max && cur.trim() && !(PUNCT.includes(tok[0]) && isWide(tok[0]))) { lines.push(cur.trimEnd()); cur = ""; }
    while (tw(tok.trimEnd()) > max) { lines.push(tok.slice(0, max)); tok = tok.slice(max); }
    cur += tok;
  }
  if (cur.trim()) lines.push(cur.trimEnd());
  if (lines.length > maxLines) { const keep = lines.slice(0, maxLines); keep[maxLines - 1] = keep[maxLines - 1].replace(/\s*\S{0,3}$/, "") + "…"; return keep; }
  return lines;
}

/* a postcard: the scene on top, the place as a title, the caption, the game's mark. No score of any kind. */
export function postcardSvg(o = {}) {
  o = o || {};
  const scene = sceneInner({ ...o, animate: false });
  const lines = wrapCaption(o.caption), fs = 14.5, lh = 20;
  const title = o.title == null ? PLACE_NAME[placeId(o.place)] : txt(o.title);
  const textH = 30 + lines.length * lh, sh = Math.min(450, 590 - 22 - textH - 26 - 20), sw = sh * .8, sx = (400 - sw) / 2, top = 20 + sh + 30;
  return svgDoc("0 0 400 600", `<rect width="400" height="600" rx="10" fill="#fffdf8"/><rect x=".75" y=".75" width="398.5" height="598.5" rx="10" fill="none" stroke="${K.dim}" stroke-width="1.5"/>
    ${inset(sx, 20, sw, sh, "0 0 400 500", scene)}<rect x="${f(sx)}" y="20" width="${f(sw)}" height="${f(sh)}" fill="none" stroke="#ece2cf" stroke-width="1"/>
    <text x="${f(sx + 4)}" y="${f(top)}" ${FONT} font-weight="800" font-size="18" fill="${K.brown}">${esc(title)}</text>
    ${lines.map((l, i) => `<text x="${f(sx + 4)}" y="${f(top + 26 + i * lh)}" ${FONT} font-size="${fs}" fill="${K.brown}">${esc(l)}</text>`).join("")}
    <path d="M${f(sx)} 574 H${f(sx + sw)}" stroke="#ece2cf" stroke-width="1"/>
    <text x="${f(sx + 4)}" y="590" ${FONT} font-size="10.5" fill="${K.mute}">${esc(txt(o.dateLabel))}</text>
    <text x="${f(sx + sw - 4)}" y="590" text-anchor="end" ${FONT} font-weight="800" font-size="10.5" letter-spacing=".6" fill="${K.mute}">Longcat &amp; the Judge</text>`);
}

/* the monthly letter: an envelope addressed to the judge with a stamp of the place (New Year stamp when special) */
export function letterSvg(o = {}) {
  o = o || {};
  const special = !!o.special, place = placeId(o.place);
  const paper = special ? "#f7e2d2" : "#fbf3e4", edge = special ? "#d9a08a" : K.dim;
  const perf = Array.from({ length: 8 }, (_, i) => `<circle cx="${f(i * 7.4)}" cy="0" r="1.9"/><circle cx="${f(i * 7.4)}" cy="64" r="1.9"/>`).join("") + Array.from({ length: 10 }, (_, i) => `<circle cx="0" cy="${f(i * 7.1)}" r="1.9"/><circle cx="52" cy="${f(i * 7.1)}" r="1.9"/>`).join("");
  const stamp = `<g transform="translate(234 30) rotate(3)"><rect x="-2" y="-2" width="56" height="68" fill="#fffdf8"/><g fill="${paper}">${perf}</g><g transform="translate(4 6)">${stampArt(place, special)}</g></g>`;
  const postmark = `<g transform="translate(222 76)" opacity=".55" fill="none" stroke="${special ? "#a8392c" : "#6f6a8a"}" stroke-width="1.4"><circle r="20"/><circle r="15"/><path d="M24 -6 q8 -5 16 0 t16 0 M24 2 q8 -5 16 0 t16 0 M24 10 q8 -5 16 0 t16 0"/></g>`;
  /* an airmail edge: little slanted red and blue bars all round */
  const c1 = special ? "#d9574a" : "#d97a68", c2 = special ? "#f0c35a" : "#7f9fc4";
  let bars = "";
  for (let x = 22, i = 0; x < 298; x += 13, i++) bars += `<path d="M${x} 22 l6 0 l-4 6 l-6 0z M${x} 172 l6 0 l-4 6 l-6 0z" fill="${i % 2 ? c2 : c1}"/>`;
  return svgDoc("0 0 320 200", `<rect x="14" y="18" width="292" height="164" rx="8" fill="${paper}" stroke="${edge}" stroke-width="1.5"/>${bars}
    <path d="M14 32 L160 112 L306 32" fill="none" stroke="${edge}" stroke-width="1" opacity=".5"/>
    <text x="38" y="124" ${FONT} font-weight="800" font-size="17" fill="${K.brown}">To: The Judge</text>
    <path d="M38 138 H192 M38 152 H160" stroke="${edge}" stroke-width="1.2" opacity=".8"/>${stamp}${postmark}`);
}

/* the place and its empty seat */
const THUMB_Y = { onsen: 110, station: 230, livingroom: 20, nightmarket: 30, train: 0, beach: 60, library: 10, camping: 120, cinema: 10, bus: 0, museum: 10, rooftop: 20, skilift: 0 };
export function placeThumbSvg(place, time) {
  const p = placeId(place), L = placeLayers(p, time === "golden" || time === "night" ? time : "morning", 0, false);
  return svgDoc("0 0 160 100", inset(0, 0, 160, 100, `0 ${THUMB_Y[p]} 400 250`, `${L.back}${L.seat}${L.front}`));
}

/* a simplified judge wearing one garment (partial when steps < 12; at 0 the cat waits on the lap) */
export function wardrobeThumbSvg(o = {}) {
  o = o || {};
  const zone = zoneId(o.zone) || "bottom", look = lookOf(o.look, zone, "morning"), time = TIME_OF_FUR[look.fur], steps = int(o.steps, 0, 12, 12);
  const J = judgeFigure("neutral");
  const g = { zone, look, kind: kindId(o.kind), animal: animalId(o.animal), steps };
  const L = steps ? garmentLayers(g, { time, animate: false }) : null;
  const wait = steps ? "" : loaf(326, 430, -1, g, "normal", 1.5, zone, time);
  const body = `${J.body}${J.lap}${J.head}${L ? L.art + L.head : ""}${wait}`;
  return svgDoc("0 0 120 120", `<rect width="120" height="120" rx="14" fill="#f6efe2"/>${inset(4, 4, 112, 112, "-12 40 424 424", body)}`);
}

/* a cat sitting as a loaf, showing its kind: ears and tail (same body, face and colour for all four) */
export function catKindSvg(kind, o = {}) {
  const k = kindId(kind), look = lookOf((o && o.look) || { fur: "short", pattern: "plain", palette: "ginger" }, "bottom", "morning"), pal = palOf("cat", look);
  const art = `<g transform="translate(40 24) scale(1.2)">${tailFor("cat", k, 0, 0, -1, 8, pal, false)}</g><ellipse cx="10" cy="22" rx="32" ry="17" fill="${pal.fur}"/>${coatMarkup([{ pts: straight(-16, 20, 50), pattern: look.pattern }], 22, pal)}<ellipse cx="6" cy="29" rx="20" ry="8" fill="${pal.belly}" opacity=".9"/>${pawPair(-10, 38, 1, 1, pal)}${headFor("cat", k, -12, -4, 1, "normal", 1.2, pal)}`;
  return svgDoc("0 0 120 100", `<g transform="translate(48 54) scale(.86)">${art}</g>`);
}

/* a special-month guest lying long */
export function guestSvg(animal) {
  const a = animalId(animal) === "cat" ? "dachshund" : animalId(animal), pal = palOf(a, null);
  const pts = Array.from({ length: 16 }, (_, i) => { const t = (i + .5) / 16; return { x: 34 + 88 * t, y: 76 - Math.sin(t * Math.PI) * 4, tx: 1, ty: 0 }; });
  const spines = a === "dragon" ? `<g fill="${pal.mane}">${[44, 58, 72, 86, 100, 114].map((x, i) => `<path d="M${x - 5} ${f(66 - Math.sin(((x - 34) / 88) * Math.PI) * 4)} l5 -9 l5 9z"/>`).join("")}</g>` : "";
  const art = `${tailFor(a, "point", 34, 78, 1, 9, pal, false)}${pawPair(44, 88, 1, .9, pal)}${spines}${bodyMarkup([pts], 22, pal, { outline: true })}${pawPair(118, 89, 1, 1, pal)}${headFor(a, "point", 130, 66, 1, "smug", 1, pal)}`;
  return svgDoc("0 0 160 120", `<ellipse cx="84" cy="98" rx="62" ry="6" fill="#000" opacity=".06"/>${art}`);
}
