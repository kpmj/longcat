/* A cat (or guest) curled into a loaf: used for the baskets of sleeping cats, the cats waiting beside the seat,
   and the kind / guest cards. Shows its coat pattern so a sleeping cat is still recognisably that garment. */
import { f } from "./util.js";
import { lookOf, palOf, animalId, kindId, FUR } from "./palettes.js";
import { coatMarkup, straight } from "./cat.js";
import { headFor, tailFor } from "./guests.js";

export function loaf(x, y, dir, c = {}, mood = "sleep", sc = 1, zone = "bottom", time = "morning") {
  const look = lookOf(c.look, c.zone || zone, time), animal = animalId(c.animal), kind = kindId(c.kind), pal = palOf(animal, look);
  const long = FUR[look.fur].fluff > 2, rx = 19 + (long ? 1.5 : 0), ry = 11 + (long ? 1 : 0);
  const pts = straight(-14, -1, 28).map(p => ({ ...p }));
  const coat = coatMarkup([{ pts, pattern: look.pattern }], 15, pal, animal === "cat" ? .9 : .5);
  const asleep = mood === "sleep";
  const tail = tailFor(animal, kind, 15, 3, -1, 6, pal, asleep);
  const fluff = long ? `<g fill="${pal.fur}">${[-14, -5, 4, 13].map(x0 => `<circle cx="${x0}" cy="-9" r="5"/>`).join("")}</g>` : "";
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(dir * sc * 100) / 100 || .01} ${f(sc * 100) / 100 || .01})">${asleep ? "" : tail}<ellipse rx="${rx}" ry="${ry}" fill="${pal.fur}" stroke="${pal.furDk}" stroke-width=".8"/>${fluff}<g>${coat}</g><ellipse cy="5" rx="12" ry="4.5" fill="${pal.belly}" opacity=".9"/>${asleep ? tail : ""}${headFor(animal, kind, -12, -6, 1, mood, .55, pal)}</g>`;
}
/* three loaves stacked: two below, one on top */
export function pile(cx, y, cats, mood, time, sc = 1) {
  const list = (cats || []).slice(0, 3);
  const spots = list.length === 1 ? [[0, 0, 1]] : list.length === 2 ? [[-16, 0, 1], [16, 0, -1]] : [[-17, 0, 1], [17, 0, -1], [0, -12, 1]];
  return list.map((c, i) => loaf(cx + spots[i][0] * sc, y + spots[i][1] * sc, spots[i][2], c, mood, sc, c && c.zone, time)).join("");
}
