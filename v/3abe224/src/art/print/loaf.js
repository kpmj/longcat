/* A cat (or guest) curled into a loaf, in the woodblock style. Same signatures as ../loaf.js. */
import { f } from "../util.js";
import { lookOf, animalId, kindId, FUR } from "../palettes.js";
import { headFor, tailFor, palFor } from "./guests.js";
import { COATS, KEY, LWC, coatMarkup, straight, catHead, catTail, catTailTucked, petHearts } from "./cat.js";

export function loaf(x, y, dir, c = {}, mood = "sleep", sc = 1, zone = "bottom", time = "morning", anim = null) {
  const look = lookOf(c.look, c.zone || zone, time), animal = animalId(c.animal), kind = kindId(c.kind);
  const cat = animal === "cat", pal = palFor(animal, look);
  const long = FUR[look.fur].fluff > 2, rx = 19 + (long ? 1.5 : 0), ry = 11 + (long ? 1 : 0), lw = LWC * .8;
  const coat = coatMarkup([{ pts: straight(-14, -1, 28), pattern: look.pattern }], 15, pal, cat ? 1 : .5);
  const asleep = mood === "sleep";
  const tail = cat ? (asleep ? catTailTucked : catTail)(kind, 15, 3, -1, 6, pal) : tailFor(animal, kind, 15, 3, -1, 6, pal, asleep);
  const tufts = long ? [-14, -5, 4, 13].map(x0 => `<circle cx="${x0}" cy="-9" r="5"/>`).join("") : "";
  const body = `${tufts ? `<g fill="${KEY}" transform="translate(0 -${f(lw)})">${tufts}</g>` : ""}<ellipse rx="${rx}" ry="${ry}" fill="${pal.fur}" stroke="${KEY}" stroke-width="${f(lw)}"/>${tufts ? `<g fill="${pal.fur}">${tufts}</g>` : ""}`;
  const head = cat ? catHead(-12, -6, 1, mood, .55, pal, kind, asleep ? null : anim) : headFor(animal, kind, -12, -6, 1, mood, .55, pal, asleep ? null : anim);
  const inner = `${asleep ? "" : tail}${body}${coat}<ellipse cy="5" rx="12" ry="4.2" fill="${pal.belly}"/>${asleep ? tail : ""}${head}`;
  /* animated: a sleeping loaf breathes; an awake one twitches its ears and blinks (in catHead) */
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(dir * sc * 100) / 100 || .01} ${f(sc * 100) / 100 || .01})">${anim == null ? inner : `<g data-tap="cat"><g class="lc-nuzzle">${asleep ? `<g class="lc-snooze" style="animation-delay:${f(-anim)}s">${inner}</g>` : inner}</g>${petHearts(-10, -26, .8)}</g>`}</g>`;
}
/* three loaves stacked: two below, one on top. PILE gives each one's place, so a runner can aim at it.
   `arrive` (seconds per cat, or null): each loaf pops in at that moment, for the reset beat */
export const PILE = n => (n === 1 ? [[0, 0, 1]] : n === 2 ? [[-16, 0, 1], [16, 0, -1]] : [[-17, 0, 1], [17, 0, -1], [0, -12, 1]]);
export function pile(cx, y, cats, mood, time, sc = 1, animate = false, arrive = null) {
  const list = (cats || []).slice(0, 3);
  const spots = PILE(list.length);
  const wrap = (m, i) => (animate && arrive && arrive[i] != null ? `<g class="lc-arrive" style="animation-delay:${f(arrive[i])}s">${m}</g>` : m);
  return list.map((c, i) => wrap(loaf(cx + spots[i][0] * sc, y + spots[i][1] * sc, spots[i][2], c, mood, sc, c && c.zone, time, animate ? 2.3 + i * 3.1 + (cx > 200 ? 1.7 : 0) : null), i)).join("");
}
