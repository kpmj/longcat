/* What an off note leaves on the knitting and on a cat's fur. Since 2026-11-14 a small ball of fluff with a loose
   loop (the designer then: a pill, not a fold; yarn.js yarnPill, cat.js foldMarkup). the designer, 2026-11-28: "Can we redesign the
   balls on the clothes? They look kinda weird now. I might remove that whole idea all together". The other ways it
   could look, tried on a board (tools/art/pills-board.mjs) before the game changes:
   - ball: the ball of fluff with its loop, as it has been;
   - none: nothing; an off note leaves no mark;
   - snag: only a little loop of the yarn pulled out of the row;
   - mend: a small cross stitch in cream thread, as a mended spot;
   - fuzz: three tiny specks of fluff, no ball.
   `PILL.style` says which; the game draws "ball" until the designer picks. */
const KEY = "#262122";
const f = n => (Math.round(n * 100) / 100).toString();
export const PILL = { style: "ball" };
export const PILL_STYLES = ["ball", "none", "snag", "mend", "fuzz"];

/* the other ways, at (x y), r the ball's radius as it would have been, c its colour, sc the scale of the lines;
   null for "ball" (the caller draws its own) */
export function pillOther(x, y, r, c, sc = 1) {
  const k = w => `stroke="${KEY}" stroke-width="${f(w * sc)}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  switch (PILL.style) {
    case "none": return "";
    case "snag": {
      const d = `M${f(x - r * .7)} ${f(y + r * .2)}q${f(r * .1)} ${f(-r * 2.3)} ${f(r * 1.1)} ${f(-r * 1.8)}q${f(r * .8)} ${f(r * .7)} ${f(-r * .1)} ${f(r * 1.7)}`;
      return `<g class="lc-pill"><path d="${d}" ${k(2.3)}/><path d="${d}" stroke="${c}" stroke-width="${f(1.1 * sc)}" stroke-linecap="round" fill="none"/></g>`;
    }
    case "mend": {
      const a = r * .75, d = `M${f(x - a)} ${f(y - a)}L${f(x + a)} ${f(y + a)}M${f(x + a)} ${f(y - a)}L${f(x - a)} ${f(y + a)}`;
      return `<g class="lc-pill"><path d="${d}" ${k(3)}/><path d="${d}" stroke="#f6efe0" stroke-width="${f(1.5 * sc)}" stroke-linecap="round" fill="none"/></g>`;
    }
    case "fuzz":
      return `<g class="lc-pill">${[[-.55, .2, .36], [.25, -.45, .3], [.6, .45, .26]].map(([dx, dy, rr]) => `<circle cx="${f(x + dx * r)}" cy="${f(y + dy * r)}" r="${f(rr * r)}" fill="${c}" stroke="${KEY}" stroke-width="${f(.7 * sc)}"/>`).join("")}</g>`;
    default: return null;
  }
}
