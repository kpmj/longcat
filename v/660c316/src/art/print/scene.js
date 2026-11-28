/* The home scene in the woodblock style: the same layers and options as ../scene.js, with the new judge, the new
   garments, shelves, baskets, waiting cats, cushion and (so far) the new onsen. Other places still come from ../places
   until they are redrawn. A place may add a `frame` layer (paper edge and title), drawn last. */
import { f, num, int, rng, hash, svgDoc, inset, esc, txt, FONT, textWidth } from "../util.js";
import { timeId, zoneId, ZONE_IDS, TIME_NAME } from "../palettes.js";
import { placeLayers as oldPlaceLayers, placeId, PLACE_IDS, PLACE_UI as OLD_UI } from "../places/index.js";
import { newYear } from "./places/newyear.js";
import { zzPrint, hatOnHead } from "./judge.js";
import { judgeFigureOf, itemSeatOf } from "./judges.js";
import { pile, loaf, PILE } from "./loaf.js";
import { KEY } from "./cat.js";
import { garmentLayers, stepPoint, guideMarkup, drawZone } from "./garments.js";
import { onsen, onsenLandscape } from "./places/onsen.js";
import { PLACES as YEAR } from "./places/all.js";
import { jungle } from "./places/jungle.js";

const PLACES = { jungle, ...YEAR };

const DRAW = { onsen, ...Object.fromEntries(Object.entries(PLACES).map(([k, P]) => [k, P.scene])) };
/* wood for shelves and baskets: [fill, line, light]; the line is the key line */
export const woodOf = time => (time === "night" ? ["#8f7458", KEY, "#b39b7c"] : time === "golden" ? ["#c98f55", KEY, "#e8c595"] : ["#c99a62", KEY, "#ead2a8"]);
const PAPER = "#efe6d2", RED = "#bf452d";
const plank = (x, y, wood) => `<rect x="${x}" y="${y}" width="80" height="7" rx="2" fill="${wood[0]}" stroke="${KEY}" stroke-width="1.6"/><path d="M${x + 14} ${y + 7} l6 18 M${x + 66} ${y + 7} l-6 18" stroke="${KEY}" stroke-width="3" stroke-linecap="round"/>`;
const tag = (cx, y, label) => { const w = 14 + textWidth(label, 10.5); return `<rect x="${f(cx - w / 2)}" y="${y}" width="${f(w)}" height="16" rx="1.5" fill="${PAPER}" stroke="${KEY}" stroke-width="1.3"/><text x="${cx}" y="${y + 12}" text-anchor="middle" ${FONT} font-weight="700" font-size="10.5" fill="${KEY}">${esc(label)}</text>`; };
function basket(cx, y, b, wood, time, animate, arrive = null) {
  const t = timeId(b.time), cats = list(b.cats);
  /* a basket's tag says its time of day, unless the basket brings its own label; an empty label means no tag */
  const label = b.label === undefined || b.label === null ? TIME_NAME[t] : txt(b.label);
  return `${pile(cx, y - 35, cats, "sleep", t, 1, animate, arrive)}<path d="M${cx - 30} ${y - 28} L${cx - 24} ${y} H${cx + 24} L${cx + 30} ${y - 28}Z" fill="${wood[0]}" stroke="${KEY}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M${cx - 27} ${y - 19} H${cx + 27} M${cx - 25.5} ${y - 10} H${cx + 25.5} M${cx - 12} ${y - 26} L${cx - 10} ${y - 1} M${cx + 12} ${y - 26} L${cx + 10} ${y - 1} M${cx} ${y - 26} V${y - 1}" stroke="${KEY}" stroke-width=".9" opacity=".55" fill="none"/>
    <rect x="${cx - 32}" y="${y - 32}" width="64" height="8" rx="3" fill="${wood[0]}" stroke="${KEY}" stroke-width="1.6"/>${label ? tag(cx, y - 20, label) : ""}${animate && arrive ? `<g class="lc-arrive" style="animation-delay:${f(Math.max(...arrive.filter(v => v != null)) + .7)}s">${zzPrint(cx + 18, y - 60, 1.1)}</g>` : zzPrint(cx + 18, y - 60, 1.1)}`;
}
/* the daily cushion: a small vermilion zabuton with its step number */
function cushionMarkup(c) {
  const z = zoneId(c.zone);
  if (!z) return "";
  const s = int(c.step, 1, 12, 1), p = stepPoint(z, s), label = c.label == null || txt(c.label) === "" ? String(s) : txt(c.label);
  return `<g transform="translate(${f(p.x)} ${f(p.y + 1)})"><path d="M-15 -4Q0 -8 15 -4Q18 3 15 9Q0 13 -15 9Q-18 3 -15 -4Z" fill="${RED}" stroke="${KEY}" stroke-width="1.6" stroke-linejoin="round"/><circle cy="2.5" r="1.4" fill="${KEY}" opacity=".5"/><text y="6.5" text-anchor="middle" ${FONT} font-weight="800" font-size="${label.length > 2 ? 7 : 9}" fill="${PAPER}">${esc(label)}</text></g>`;
}
/* G landscapes (o.landscape in sceneParts): postcards, and since 2026-11-14 the home page and the wardrobe, which
   show the same background as the postcards. Drawn with `animate` they move and answer a tap like the H scene does */
const LANDSCAPE = { onsen: onsenLandscape, ...Object.fromEntries(Object.entries(PLACES).map(([k, P]) => [k, P.landscape])) };
/* a place made with places/kit.js can be passed as itself instead of an id (the year-two places, not in the calendar yet) */
const madePlace = place => (place && typeof place === "object" && typeof place.scene === "function" && typeof place.landscape === "function" ? place : null);
export function placeLayers(place, time, seed = 0, animate = false, landscape = false) {
  const own = madePlace(place), t = timeId(time);
  if (own) return { ...(landscape ? own.landscape(t, animate) : own.scene(t, rng(hash(`${own.name}|${t}|${seed}`)), animate)), wood: woodOf(t) };
  const p = placeId(place);
  if (landscape && LANDSCAPE[p]) return { ...LANDSCAPE[p](t, animate), wood: woodOf(t) };
  if (!DRAW[p]) return { ...oldPlaceLayers(p, t, seed, animate), wood: woodOf(t), frame: "" };
  return { ...DRAW[p](t, rng(hash(`${p}|${t}|${seed}`)), animate), wood: woodOf(t) };
}
const list = v => (Array.isArray(v) ? v.filter(x => x && typeof x === "object") : []);

export function sceneParts(o = {}) {
  const own = madePlace(o.place), place = own ? own.name : placeId(o.place), time = timeId(o.time), animate = o.animate !== false, seed = num(o.seed);
  const L = placeLayers(own || place, time, seed, animate, !!o.landscape);
  const seen = new Set(), worn = [], waiting = [];
  for (const g of list(o.garments)) {
    const z = zoneId(g.zone);
    if (!z || seen.has(z)) continue;
    seen.add(z);
    if (int(g.steps, 0, 12, 0) > 0) worn.push(g); else waiting.push(g);
  }
  for (const w of list(o.waiting)) { const z = zoneId(w.zone); if (z && !seen.has(z)) { seen.add(z); waiting.push(w); } }
  /* catMotion: the finer cat's pieces, asked for by the trial page only (tools/art/cats-motion.mjs) */
  const ctx = { time, animate, seed, ink: L.ink, catMotion: o.catMotion || null };
  const order = ["bottom", "top", "scarf"];
  worn.sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone));
  const layers = worn.map(g => garmentLayers(g, ctx));
  for (let i = 1; i < layers.length; i++) {
    const a = layers[i - 1], b = layers[i];
    if (!a || !b) continue;
    const d = Math.hypot(a.headAt.x - b.headAt.x, a.headAt.y - b.headAt.y);
    if (d < 40) layers[i] = garmentLayers(worn[i], { ...ctx, headLift: Math.min(20, 40 - d) });
  }
  /* The hat is worn on the head, so it is anchored there: it is drawn inside the head's own group (`onHead` below)
     and shakes, yawns, tilts, nods and bobs with it (the designer, 2026-11-14: "the hat cat doesn't move along with the
     head"). The scarf and the top sit on the body, which only breathes, and stay in the scene's own layers. */
  const isHat = i => drawZone(worn[i].zone) === "hat";
  const ok = layers.filter((l, i) => l && !isHat(i)), hat = layers.filter((l, i) => l && isHat(i));
  const garments = ok.map(l => l.under).join("") + ok.map(l => l.art).join("");
  const heads = ok.map(l => l.head).join("");
  const baskets = list(o.baskets).slice(0, 2);
  /* the reset beat: `leaving` = the finished garments of the time that just ended. One by one (hat, scarf, top) each
     lets go, a small cat runs in an arc to the newest basket (the last in `baskets`), pops in there and sleeps.
     Still pictures and reduced motion show the end: nothing worn, three cats asleep */
  const LEAVE_AT = { hat: .5, scarf: 1.5, top: 2.5 };
  const leaving = animate ? list(o.leaving).filter(g => drawZone(g.zone) && int(g.steps, 0, 12, 0) > 0) : [];
  const newB = leaving.length ? baskets.length - 1 : -1;
  const bx = i => (i === 0 ? 352 : 48);
  let leaveArt = "", runners = "", arrive = null;
  if (newB >= 0) {
    const cats = list(baskets[newB].cats), spots = PILE(Math.min(3, cats.length));
    arrive = cats.map(() => .2);
    for (const g of leaving) {
      const z = drawZone(g.zone), d = LEAVE_AT[z], Lr = garmentLayers(g, { time, animate: false, seed });
      if (!Lr) continue;
      leaveArt += `<g class="lc-leave" style="animation-delay:${d}s">${Lr.art}${Lr.head}</g>`;
      const k = Math.max(0, cats.findIndex(c => drawZone(c.zone) === z)), sp = spots[Math.min(k, spots.length - 1)];
      const tx = bx(newB) + sp[0], ty = 205 + sp[1], dx = tx - Lr.headAt.x, dy = ty - Lr.headAt.y;
      arrive[Math.min(k, arrive.length - 1)] = d + 1.2;
      runners += `<g transform="translate(${f(Lr.headAt.x)} ${f(Lr.headAt.y)})"><g class="lc-run-x" style="--lc-dx:${f(dx)}px;animation-delay:${f(d + .3)}s"><g class="lc-run-y" style="--lc-dy:${f(dy)}px;animation-delay:${f(d + .3)}s"><g class="lc-scurry">${loaf(0, 0, dx < 0 ? -1 : 1, { zone: g.zone, look: g.look, kind: g.kind, animal: g.animal }, "normal", 1, g.zone, time)}</g></g></g></g>`;
    }
  }
  let shelves = "";
  /* shelves sit lower than in the old scene so they clear the round window and the title */
  if (baskets[0]) shelves += plank(312, 240, L.wood) + basket(352, 240, baskets[0], L.wood, time, animate, newB === 0 ? arrive : null);
  if (baskets[1]) shelves += plank(8, 240, L.wood) + basket(48, 240, baskets[1], L.wood, time, animate, newB === 1 ? arrive : null);
  /* the cats that are waiting sit on the judge's lap, not on a shelf at the side, so they do not cover the
     background (the designer, 2026-11-14). The lap is free now that the lap garment is a hat. `arriving`: they pop onto the
     lap one after another */
  const waitingArt = waiting.length ? pile(200, 437, waiting.map(w => ({ ...w, mark: drawZone(w.zone) })), "normal", time, 1.15, animate, o.arriving ? waiting.map((_, i) => .3 + i * .35) : null) : "";
  /* a small breeze crosses in front of the judge: two lines of wind and a leaf */
  const breeze = animate && o.react === "shiver" ? `<g class="lc-breeze"><path d="M0 300q22 -9 44 0t44 0M30 324q18 -7 36 0t36 0" fill="none" stroke="#f8f2e2" stroke-width="2.4" stroke-linecap="round" opacity=".85"/><path transform="translate(104 300) rotate(30)" d="M0 -9L2.4 -3.6L8 -6L5.6 -.4L10 3L3.6 4L0 10L-3.6 4L-10 3L-5.6 -.4L-8 -6L-2.4 -3.6Z" fill="#bf452d" stroke="${KEY}" stroke-width="1.2" stroke-linejoin="round"/></g>` : "";
  const cushion0 = o.cushion && typeof o.cushion === "object" ? cushionMarkup(o.cushion) : "";
  /* a cushion on a step of the hat rides the head with the hat */
  const cushionOnHead = !!cushion0 && drawZone(o.cushion.zone) === "hat", cushion = cushionOnHead ? "" : cushion0;
  const guides = o.guide == null ? [] : (o.guide === "all" ? ZONE_IDS : [].concat(o.guide)).map(zoneId).filter(Boolean);
  const guideOf = z => { const g = worn.find(w => w.zone === z); return guideMarkup(z, g ? g.steps : 0); };
  const guide = guides.filter(z => drawZone(z) !== "hat").map(guideOf).join("");
  /* the fruit on the judge's head is seated on top of the hat, however far the hat has grown (hatOnHead) */
  const { onHead, itemLift } = hatOnHead(hat[0] || null, itemSeatOf(o.judge), { guide: guides.filter(z => drawZone(z) === "hat").map(guideOf).join(""), cushion: cushionOnHead ? cushion0 : "" });
  /* o.judge: which of the six judges sits here (print/judges.js); the capybara unless told otherwise */
  /* a place may give the judge something else on its head and something to hold (the jungle: an acorn, a heart).
     o.hold === false: the paws are down and empty (wrapping by hand: the heart would lie on the turns being laid).
     o.holdUp: the heart is lifted beside the head (the bust, which ends at the chest) */
  const things = L.judge || {};
  const J = judgeFigureOf(o.judge, o.face || "neutral", { animate, react: o.react, paws: o.paws, onHead, itemLift, item: things.item, hold: o.hold === false ? null : things.hold, holdUp: !!o.holdUp });
  const special = o.special === "newyear" ? newYear(time, rng(hash(`ny|${place}|${seed}`)), animate) : "";
  const character0 = `${J.feet}${J.body}${J.lap}${J.head}${guide}${garments}${J.arms || ""}${cushion}${J.held || ""}${heads}${leaveArt}${waitingArt}${J.paws}`;
  const character = animate && o.react === "shiver" ? `<g class="lc-shiver">${character0}</g>` : character0;
  return { place, time, L, special, shelves, character: (animate ? `<g class="lc-breathe">${character}</g>` : character) + runners + breeze, judge: J, garments, heads, onHead, itemLift, cushion: cushion0 };
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
  const p = sceneParts({ place: o.place, time: o.time, face: o.face || "neutral", garments: o.garments, animate: o.animate !== false, holdUp: true });
  /* a tall hat lifts the fruit out of the frame's top: the picture slides down by as much as it needs */
  const down = p.itemLift * .8;
  return svgDoc("0 0 300 220", `<g transform="translate(-10 ${f(-33.6 + down)}) scale(.8)">${p.L.back}${o.rainbow ? rainbowMarkup() : ""}${p.special}${p.L.seat}${p.character}</g>`);
}
/* UI colours beside each backdrop: bg = the scene's ground, ink = text on it, accent = the place's button colour */
export const PLACE_UI = Object.fromEntries(PLACE_IDS.map(p => [p, Object.fromEntries(["morning", "golden", "night"].map(t => {
  const L = placeLayers(p, t, 0, false);
  return [t, { bg: L.wall, ink: L.ink, accent: OLD_UI[p][t].accent }];
}))]));

/* The cats that have finished and gone to sleep, on their own: one basket per finished time of day, side by side
   (320 x 104). They left the home page on 2026-11-14 (it was too full) and live in the wardrobe's Cats tab.
   o = { baskets: [{ time, cats, label }], time (for the wood), animate }. Animated, they breathe and can be patted.
   Since 2026-11-15 nobody sleeps after a time of day (a place has three singers all day); the Wardrobe's Cats tab
   uses this for the player's cats that are not singing, with `label: ""` so the baskets carry no time. */
export function nappingSvg(o = {}) {
  const baskets = list(o && o.baskets).slice(0, 3), time = timeId(o && o.time), animate = !o || o.animate !== false, wood = woodOf(time);
  const n = baskets.length, xs = n === 1 ? [160] : n === 2 ? [100, 220] : [64, 160, 256];
  const floor = `<rect width="320" height="104" fill="${PAPER}"/><path d="M12 91H308" stroke="${KEY}" stroke-width="1.6" stroke-linecap="round"/><path d="M30 97H110M150 97H290" stroke="${KEY}" stroke-width="1" stroke-linecap="round" opacity=".35"/>`;
  return svgDoc("0 0 320 104", floor + baskets.map((b, i) => `<ellipse cx="${xs[i]}" cy="91" rx="40" ry="4" fill="${KEY}" opacity=".12"/>` + basket(xs[i], 90, b, wood, time, animate)).join(""));
}
