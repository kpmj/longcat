/* The home scene in the woodblock style: the same layers and options as ../scene.js, with the new judge, the new
   garments, shelves, baskets, waiting cats, cushion and (so far) the new onsen. Other places still come from ../places
   until they are redrawn. A place may add a `frame` layer (paper edge and title), drawn last. */
import { f, num, int, rng, hash, svgDoc, inset, esc, txt, FONT, textWidth } from "../util.js";
import { timeId, zoneId, ZONE_IDS, TIME_NAME } from "../palettes.js";
import { placeLayers as oldPlaceLayers, placeId, PLACE_IDS, PLACE_UI as OLD_UI } from "../places/index.js";
import { newYear } from "../places/newyear.js";
import { judgeFigure, zzPrint } from "./judge.js";
import { pile } from "./loaf.js";
import { KEY } from "./cat.js";
import { garmentLayers, stepPoint, guideMarkup } from "./garments.js";
import { onsen, onsenLandscape } from "./places/onsen.js";
import { PLACES } from "./places/all.js";

const DRAW = { onsen, ...Object.fromEntries(Object.entries(PLACES).map(([k, P]) => [k, P.scene])) };
/* wood for shelves and baskets: [fill, line, light]; the line is the key line */
export const woodOf = time => (time === "night" ? ["#8f7458", KEY, "#b39b7c"] : time === "golden" ? ["#c98f55", KEY, "#e8c595"] : ["#c99a62", KEY, "#ead2a8"]);
const PAPER = "#efe6d2", RED = "#bf452d";
const plank = (x, y, wood) => `<rect x="${x}" y="${y}" width="80" height="7" rx="2" fill="${wood[0]}" stroke="${KEY}" stroke-width="1.6"/><path d="M${x + 14} ${y + 7} l6 18 M${x + 66} ${y + 7} l-6 18" stroke="${KEY}" stroke-width="3" stroke-linecap="round"/>`;
const tag = (cx, y, label) => { const w = 14 + textWidth(label, 10.5); return `<rect x="${f(cx - w / 2)}" y="${y}" width="${f(w)}" height="16" rx="1.5" fill="${PAPER}" stroke="${KEY}" stroke-width="1.3"/><text x="${cx}" y="${y + 12}" text-anchor="middle" ${FONT} font-weight="700" font-size="10.5" fill="${KEY}">${esc(label)}</text>`; };
function basket(cx, y, b, wood, time, animate) {
  const t = timeId(b.time), cats = list(b.cats);
  return `${pile(cx, y - 35, cats, "sleep", t, 1, animate)}<path d="M${cx - 30} ${y - 28} L${cx - 24} ${y} H${cx + 24} L${cx + 30} ${y - 28}Z" fill="${wood[0]}" stroke="${KEY}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M${cx - 27} ${y - 19} H${cx + 27} M${cx - 25.5} ${y - 10} H${cx + 25.5} M${cx - 12} ${y - 26} L${cx - 10} ${y - 1} M${cx + 12} ${y - 26} L${cx + 10} ${y - 1} M${cx} ${y - 26} V${y - 1}" stroke="${KEY}" stroke-width=".9" opacity=".55" fill="none"/>
    <rect x="${cx - 32}" y="${y - 32}" width="64" height="8" rx="3" fill="${wood[0]}" stroke="${KEY}" stroke-width="1.6"/>${tag(cx, y - 20, TIME_NAME[t])}${zzPrint(cx + 18, y - 60, 1.1)}`;
}
/* the daily cushion: a small vermilion zabuton with its step number */
function cushionMarkup(c) {
  const z = zoneId(c.zone);
  if (!z) return "";
  const s = int(c.step, 1, 12, 1), p = stepPoint(z, s), label = c.label == null || txt(c.label) === "" ? String(s) : txt(c.label);
  return `<g transform="translate(${f(p.x)} ${f(p.y + 1)})"><path d="M-15 -4Q0 -8 15 -4Q18 3 15 9Q0 13 -15 9Q-18 3 -15 -4Z" fill="${RED}" stroke="${KEY}" stroke-width="1.6" stroke-linejoin="round"/><circle cy="2.5" r="1.4" fill="${KEY}" opacity=".5"/><text y="6.5" text-anchor="middle" ${FONT} font-weight="800" font-size="${label.length > 2 ? 7 : 9}" fill="${PAPER}">${esc(label)}</text></g>`;
}
/* G landscapes, for postcards (o.landscape in sceneParts); places without one use their scene backdrop */
const LANDSCAPE = { onsen: onsenLandscape, ...Object.fromEntries(Object.entries(PLACES).map(([k, P]) => [k, P.landscape])) };
export function placeLayers(place, time, seed = 0, animate = false, landscape = false) {
  const p = placeId(place), t = timeId(time);
  if (landscape && LANDSCAPE[p]) return { ...LANDSCAPE[p](t), wood: woodOf(t) };
  if (!DRAW[p]) return { ...oldPlaceLayers(p, t, seed, animate), wood: woodOf(t), frame: "" };
  return { ...DRAW[p](t, rng(hash(`${p}|${t}|${seed}`)), animate), wood: woodOf(t) };
}
const list = v => (Array.isArray(v) ? v.filter(x => x && typeof x === "object") : []);

export function sceneParts(o = {}) {
  const place = placeId(o.place), time = timeId(o.time), animate = o.animate !== false, seed = num(o.seed);
  const L = placeLayers(place, time, seed, animate, !!o.landscape);
  const J = judgeFigure(o.face || "neutral", { animate });
  const seen = new Set(), worn = [], waiting = [];
  for (const g of list(o.garments)) {
    const z = zoneId(g.zone);
    if (!z || seen.has(z)) continue;
    seen.add(z);
    if (int(g.steps, 0, 12, 0) > 0) worn.push(g); else waiting.push(g);
  }
  for (const w of list(o.waiting)) { const z = zoneId(w.zone); if (z && !seen.has(z)) { seen.add(z); waiting.push(w); } }
  const ctx = { time, animate, seed, ink: L.ink };
  const order = ["bottom", "top", "scarf"];
  worn.sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone));
  const layers = worn.map(g => garmentLayers(g, ctx));
  for (let i = 1; i < layers.length; i++) {
    const a = layers[i - 1], b = layers[i];
    if (!a || !b) continue;
    const d = Math.hypot(a.headAt.x - b.headAt.x, a.headAt.y - b.headAt.y);
    if (d < 40) layers[i] = garmentLayers(worn[i], { ...ctx, headLift: Math.min(20, 40 - d) });
  }
  const ok = layers.filter(Boolean);
  const garments = ok.map(l => l.under).join("") + ok.map(l => l.art).join("");
  const heads = ok.map(l => l.head).join("");
  const baskets = list(o.baskets).slice(0, 2);
  let shelves = "";
  /* shelves sit lower than in the old scene so they clear the round window and the title */
  if (baskets[0]) shelves += plank(312, 240, L.wood) + basket(352, 240, baskets[0], L.wood, time, animate);
  if (baskets[1]) shelves += plank(8, 240, L.wood) + basket(48, 240, baskets[1], L.wood, time, animate);
  if (waiting.length) {
    const y = baskets[1] ? 152 : 240;
    shelves += plank(8, y, L.wood) + pile(48, y - 12, waiting, "normal", time, 1, animate);
  }
  const cushion = o.cushion && typeof o.cushion === "object" ? cushionMarkup(o.cushion) : "";
  const guides = o.guide == null ? [] : (o.guide === "all" ? ZONE_IDS : [].concat(o.guide)).map(zoneId).filter(Boolean);
  const guide = guides.map(z => { const g = worn.find(w => w.zone === z); return guideMarkup(z, g ? g.steps : 0); }).join("");
  const special = o.special === "newyear" ? newYear(time, rng(hash(`ny|${place}|${seed}`)), animate) : "";
  const character = `${J.feet}${J.body}${J.lap}${J.head}${guide}${garments}${cushion}${heads}${J.paws}`;
  return { place, time, L, special, shelves, character: animate ? `<g class="lc-breathe">${character}</g>` : character, judge: J, garments, heads, cushion };
}
export const sceneInner = o => { const p = sceneParts(o); return `${p.L.back}${p.special}${p.L.seat}${p.shelves}${p.character}${p.L.front}${p.L.frame || ""}`; };
/* the picture is clipped to its own 400 x 500 (a nested svg clips by itself): the page shows the svg in boxes of other
   proportions, and drifting water or a falling leaf must not show outside the paper edge */
export const sceneSvg = (o = {}) => svgDoc("0 0 400 500", inset(0, 0, 400, 500, "0 0 400 500", sceneInner(o || {})));
export { stepPoint };

/* a rainbow printed behind the judge (scene space): seven flat bands with a key line, shown on the singing screen
   while a long run of notes keeps landing */
const RAINBOW = ["#bf452d", "#d98a3a", "#ebb229", "#7f9a63", "#5d8ba3", "#33517a", "#7b5a8a"];
const rainbowMarkup = () => `<g fill="none" stroke-width="9.5">${RAINBOW.map((c, i) => { const r = 228 - i * 9; return `<path d="M${f(200 - r)} 330 A${r} ${r} 0 0 1 ${f(200 + r)} 330" stroke="${c}"/>`; }).join("")}</g>`
  + `<g fill="none" stroke="${KEY}" stroke-width="1.6"><path d="M-33 330A233 233 0 0 1 433 330"/><path d="M30.500 330A169.500 169.500 0 0 1 369.500 330"/></g>`;
/* the judge from the chest up (300 x 220), for the singing screen: the same framing as ../portrait.js, no paper edge */
export function judgeBustSvg(o = {}) {
  const p = sceneParts({ place: o.place, time: o.time, face: o.face || "neutral", garments: o.garments, animate: o.animate !== false });
  return svgDoc("0 0 300 220", `<g transform="translate(-10 -33.6) scale(.8)">${p.L.back}${o.rainbow ? rainbowMarkup() : ""}${p.special}${p.L.seat}${p.character}</g>`);
}
/* UI colours beside each backdrop: bg = the scene's ground, ink = text on it, accent = the place's button colour */
export const PLACE_UI = Object.fromEntries(PLACE_IDS.map(p => [p, Object.fromEntries(["morning", "golden", "night"].map(t => {
  const L = placeLayers(p, t, 0, false);
  return [t, { bg: L.wall, ink: L.ink, accent: OLD_UI[p][t].accent }];
}))]));
