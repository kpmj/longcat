/* More things for the judge's head, beside the yuzu and the jungle's acorn (print/judge.js ITEMS). Drawn in code like
   them: the judge and what it wears are never generated. Each sits where the yuzu sits and is about as tall; `at`
   gives the transform for a hop and for how far a hat has raised it.

   The hot spring made again (2026-11-28, the designer: 「像是火車站一樣可以重新設計溫泉嗎」): ideas for what the judge has on
   its head there, to choose on the board (tools/art/onsen-board.mjs):
   - towel: a small folded white towel with two indigo stripes, the bather's habit;
   - egg: an onsen egg standing in a small wooden cup;
   - oke: a tiny wooden bath bucket with two dark hoops. */
import { f } from "../util.js";

const KEY = "#262122", LW = 2.7;
const ell = (cx, cy, rx, ry = rx) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
const ln = (d, w = 1) => `<path d="${d}" fill="none" stroke="${KEY}" stroke-width="${f(LW * w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const sh = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${KEY}" stroke-width="${f(LW * w)}" stroke-linejoin="round"/>`;
const fl = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ""}/>`;
const ticksOf = hop => (hop ? ln("M-27 -4q-4 8 -1 16M27 -4q4 8 1 16", .7) : "");

export function moreItems(at) {
  return {
    /* folded in three, its ends hanging a little over the sides, two indigo stripes across */
    towel: (hop, lift = 0) => `<g transform="${at(hop, lift)}">${sh("M-24 4Q-25 -6 -20 -10H20Q25 -6 24 4Q22 10 18 12H-18Q-22 10 -24 4Z", "#f6f1e4", .9)}${fl("M-23 -2H23V1H-23Z", "#33517a", .9)}${fl("M-22 5H22V7.5H-22Z", "#33517a", .9)}${ln("M-20 -10Q0 -14 20 -10", .55)}${ln("M-18 12q2 4 6 4M18 12q-2 4 -6 4", .55)}${ticksOf(hop)}</g>`,
    /* an onsen egg in a small cup of pale wood */
    egg: (hop, lift = 0) => `<g transform="${at(hop, lift)}">${sh(ell(0, -6, 12.5, 16), "#f7efdf", .9)}${fl("M7 -16Q11 -10 10 -3Q6 -12 2 -16Z", "#ffffff", .8)}${sh("M-15 4H15L12 17H-12Z", "#d9b98a", .9)}${ln("M-13 9H13", .45)}${ticksOf(hop)}</g>`,
    /* a tiny bath bucket */
    oke: (hop, lift = 0) => `<g transform="${at(hop, lift)}">${sh("M-16 -10H16L13 15H-13Z", "#e2c79a", .9)}${sh(ell(0, -10, 16, 4.5), "#cfae7c", .9)}${fl(ell(0, -10, 11, 2.6), "#9fc7d4", .9)}${ln("M-15.4 -3H15.4M-13.8 9H13.8", .8)}${ln("M-6 -2V14M5 -2V14", .35)}${ticksOf(hop)}</g>`,
  };
}
