/* Frames: a generated animal that moves inside itself (2026-11-28). A generated picture is one still; for the red
   bird of the jungle GPT drew eight poses from it on one sheet (blink, look up, sing, crouch, wings up, wings down,
   settle), which tools/art/motion/frames.py lined up on the feet and laid side by side in one strip
   (art/pictures.js, "bird-1-frames"). the designer picked them on the finer-animation page (tools/art/motion.mjs) over the
   bird moving as one piece. Only generated things move this way: the judge, the cats, garments and faces are drawn
   in code and move in code.

   The strip is one <image> in a nested <svg> the size of one cell, where the picture's box is; CSS moves it a cell at
   a time (step-end). It sits in the group the still sat in, so it stands, faces and answers a tap as before. A still
   (postcards, the album, reduced motion) shows the first frame, which is the picture itself. */

/* [frame from 1, seconds]: the idle loop, and what a press plays once over the hop (lc-hop-fr below) */
export const FRAME_PLAYS = {
  "bird-1": {
    idle: [[1, 1.8], [2, .12], [1, 1], [3, .7], [1, .35], [4, .28], [1, .14], [4, .28], [1, 1.4], [2, .12], [1, .5], [2, .12], [1, 1.2]],
    tap: [[5, .1], [6, .09], [7, .09], [6, .09], [7, .09], [6, .08], [7, .08], [8, .1], [1, .08]],
  },
};
const total = seq => seq.reduce((s, [, t]) => s + t, 0);
function keyframes(name, seq, cw) {
  const T = total(seq);
  let at = 0;
  const steps = seq.map(([fr, t]) => { const k = `${(at / T * 100).toFixed(3)}% { transform: translateX(${-(fr - 1) * cw}px); }`; at += t; return k; });
  return `@keyframes ${name} { ${steps.join(" ")} 100% { transform: translateX(${-(seq[seq.length - 1][0] - 1) * cw}px); } }`;
}
/* the CSS for each animal with frames: its loop, its press, and a hop that gets ready first (down a little, then up
   while the wings beat, then a small bounce); used in ART_CSS */
export function framesCss(strips) {
  return Object.entries(FRAME_PLAYS).map(([id, play]) => {
    const s = strips[id], cw = s.cell[0], n = `lc-fr-${id}`;
    return `${keyframes(`${n}-idle`, play.idle, cw)}
${keyframes(`${n}-tap`, play.tap, cw)}
@media (prefers-reduced-motion: no-preference) {
  .${n} { animation: ${n}-idle ${total(play.idle).toFixed(2)}s step-end infinite; }
  .lc-tapped .${n} { animation: ${n}-tap ${total(play.tap).toFixed(2)}s step-end 1; }
  .lc-tapped .lc-hop-fr { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-hop-fr ${total(play.tap).toFixed(2)}s ease-in-out both; }
}`;
  }).join("\n") + `
@keyframes lc-hop-fr { 0% { transform: translateY(0); } 12% { transform: translateY(1.5px) scaleY(.94); } 45% { transform: translateY(-17px) rotate(-6deg); } 78% { transform: translateY(0) rotate(2deg); } 88% { transform: translateY(-3px); } 100% { transform: translateY(0); } }`;
}

/* the strip where `pic` would be drawn in the box x y w h (fitted as SVG's preserveAspectRatio `fit`, meet) */
export function framesImage(pic, strip, id, x, y, w, h, fit = "xMidYMid meet") {
  const m = /x(Min|Mid|Max)Y(Min|Mid|Max)/.exec(fit) || [, "Mid", "Mid"];
  const k = Math.min(w / pic.w, h / pic.h), [cw, ch] = strip.cell, [pl, pt] = strip.pad;
  const ix = x + (m[1] === "Min" ? 0 : m[1] === "Mid" ? (w - pic.w * k) / 2 : w - pic.w * k);
  const iy = y + (m[2] === "Min" ? 0 : m[2] === "Mid" ? (h - pic.h * k) / 2 : h - pic.h * k);
  const f = v => +v.toFixed(3);
  return `<svg x="${f(ix - pl * k)}" y="${f(iy - pt * k)}" width="${f(cw * k)}" height="${f(ch * k)}" viewBox="0 0 ${cw} ${ch}" overflow="hidden"><image class="lc-fr-${id}" href="${strip.href}" width="${cw * strip.frames}" height="${ch}"/></svg>`;
}
