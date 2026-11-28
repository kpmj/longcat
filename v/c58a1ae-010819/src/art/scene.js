/* The home scene: place, judge, garments, waiting cats, baskets of sleeping cats and the daily cushion. 400 x 500. */
import { f, num, int, esc, rng, hash, svgDoc, FONT, textWidth, txt } from "./util.js";
import { K, timeId, zoneId, TIME_NAME, ZONE_IDS } from "./palettes.js";
import { judgeFigure } from "./judge.js";
import { garmentLayers, stepPoint, guideMarkup } from "./garments.js";
import { pile } from "./loaf.js";
import { placeLayers, placeId } from "./places/index.js";
import { newYear } from "./places/newyear.js";

const list = v => (Array.isArray(v) ? v.filter(x => x && typeof x === "object") : []);

/* a plank shelf, lashed to whatever stands at the side of the place */
const plank = (x, y, wood) => `<rect x="${x}" y="${y}" width="80" height="7" rx="3" fill="${wood[0]}" stroke="${wood[1]}"/><path d="M${x + 14} ${y + 6} l6 18 M${x + 66} ${y + 6} l-6 18" stroke="${wood[1]}" stroke-width="3" stroke-linecap="round"/>`;
const tag = (cx, y, label, wood) => { const w = 14 + textWidth(label, 10.5); return `<rect x="${f(cx - w / 2)}" y="${y}" width="${f(w)}" height="16" rx="3" fill="${K.paper}" stroke="${wood[1]}"/><text x="${cx}" y="${y + 12}" text-anchor="middle" ${FONT} font-weight="700" font-size="10.5" fill="${K.brown}">${esc(label)}</text>`; };
function basket(cx, y, b, wood, ink, time) {
  const t = timeId(b.time), cats = list(b.cats);
  return `${pile(cx, y - 35, cats, "sleep", t)}<path d="M${cx - 30} ${y - 28} L${cx - 24} ${y} H${cx + 24} L${cx + 30} ${y - 28}Z" fill="${wood[0]}" stroke="${wood[1]}" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M${cx - 27} ${y - 19} H${cx + 27} M${cx - 25.5} ${y - 10} H${cx + 25.5} M${cx - 12} ${y - 26} L${cx - 10} ${y - 1} M${cx + 12} ${y - 26} L${cx + 10} ${y - 1} M${cx} ${y - 26} V${y - 1}" stroke="${wood[1]}" stroke-width="1" opacity=".55" fill="none"/>
    <rect x="${cx - 32}" y="${y - 32}" width="64" height="8" rx="4" fill="${wood[0]}" stroke="${wood[1]}" stroke-width="1.2"/>${tag(cx, y - 20, TIME_NAME[t], wood)}
    <text x="${cx + 18}" y="${y - 66}" ${FONT} font-weight="700" font-size="10" fill="${ink}" opacity=".75">z z</text>`;
}
function cushionMarkup(c) {
  const z = zoneId(c.zone);
  if (!z) return "";
  const s = int(c.step, 1, 12, 1), p = stepPoint(z, s), label = c.label == null || txt(c.label) === "" ? String(s) : txt(c.label);
  return `<g transform="translate(${f(p.x)} ${f(p.y + 1)})"><ellipse cy="3" rx="15" ry="7.5" fill="${K.pink}" stroke="#c97f88" stroke-width="1"/><ellipse cy="1" rx="10.5" ry="4.2" fill="${K.pinkLt}"/><path d="M-13 1 l-4 -2 M13 1 l4 -2" stroke="#c97f88" stroke-width="1.4" stroke-linecap="round"/><text y="5.5" text-anchor="middle" ${FONT} font-weight="700" font-size="${label.length > 2 ? 7 : 9}" fill="${K.brown}">${esc(label)}</text></g>`;
}

/* every layer of the scene, so the bust, thumbs and postcards can reuse parts */
export function sceneParts(o = {}) {
  const place = placeId(o.place), time = timeId(o.time), animate = o.animate !== false, seed = num(o.seed);
  const L = placeLayers(place, time, seed, animate);
  const J = judgeFigure(o.face || "neutral", { animate, ink: L.ink });
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
  /* three heads must stay apart: when a higher cat's head lands on a lower one, lift the higher head a little */
  for (let i = 1; i < layers.length; i++) {
    const a = layers[i - 1], b = layers[i];
    if (!a || !b) continue;
    const d = Math.hypot(a.headAt.x - b.headAt.x, a.headAt.y - b.headAt.y);
    if (d < 40) layers[i] = garmentLayers(worn[i], { ...ctx, headLift: Math.min(20, 40 - d) });
  }
  layers.splice(0, layers.length, ...layers.filter(Boolean));
  const garments = layers.map(l => l.under).join("") + layers.map(l => l.art).join("");
  const heads = layers.map(l => l.head).join("");
  const baskets = list(o.baskets).slice(0, 2);
  let shelves = "";
  if (baskets[0]) shelves += plank(312, 214, L.wood) + basket(352, 214, baskets[0], L.wood, L.ink, time);
  if (baskets[1]) shelves += plank(8, 214, L.wood) + basket(48, 214, baskets[1], L.wood, L.ink, time);
  if (waiting.length) {
    const y = baskets[1] ? 126 : 214;
    shelves += plank(8, y, L.wood) + pile(48, y - 12, waiting, "normal", time);
  }
  const guides = o.guide == null ? [] : (o.guide === "all" ? ZONE_IDS : [].concat(o.guide)).map(zoneId).filter(Boolean);
  const guide = guides.map(z => { const g = worn.find(w => w.zone === z); return guideMarkup(z, g ? g.steps : 0); }).join("");
  const cushion = o.cushion && typeof o.cushion === "object" ? cushionMarkup(o.cushion) : "";
  const special = o.special === "newyear" ? newYear(time, rng(hash(`ny|${place}|${seed}`)), animate) : "";
  const character = `${J.feet}${J.body}${J.lap}${J.head}${guide}${garments}${cushion}${heads}${J.paws}`;
  return { place, time, L, special, shelves, character: animate ? `<g class="lc-breathe">${character}</g>` : character, judge: J, garments, heads, cushion };
}
export const sceneInner = o => { const p = sceneParts(o); return `${p.L.back}${p.special}${p.L.seat}${p.shelves}${p.character}${p.L.front}`; };
export const sceneSvg = (o = {}) => svgDoc("0 0 400 500", sceneInner(o || {}));
