/* The judge up close: the bust for the singing screen and the face icons. */
import { f, num, svgDoc } from "./util.js";
import { pose, judgeHead, pawsIcon, zzMarkup, FACES } from "./judge.js";
import { sceneParts } from "./scene.js";
import { K } from "./palettes.js";

/* a soft rainbow in the sky behind the judge (scene space): seven bands rising from both lower corners and
   passing behind its head. Shown while a long run of notes keeps landing (the singing screen's combo) */
const RAINBOW = ["#f28b82", "#fbbc5c", "#fde68a", "#a7d99b", "#8fc6ec", "#a5a8e8", "#d3a6e6"];
function rainbowMarkup() {
  return `<g opacity=".62" fill="none" stroke-width="9.5">${RAINBOW.map((c, i) => {
    const r = 228 - i * 9;
    return `<path d="M${f(200 - r)} 330 A${r} ${r} 0 0 1 ${f(200 + r)} 330" stroke="${c}"/>`;
  }).join("")}</g>`;
}

/* the judge from the chest up (300 x 220): the scene's own place, judge and garments, framed on the face.
   o.rainbow puts a rainbow in the sky behind it */
export function judgeBustSvg(o = {}) {
  const p = sceneParts({ place: o.place, time: o.time, face: o.face || "neutral", garments: o.garments, animate: o.animate !== false });
  const k = .8, tx = 150 - 200 * k, ty = 112 - 182 * k;
  return svgDoc("0 0 300 220", `<g transform="translate(${f(tx)} ${f(ty)}) scale(${k})">${p.L.back}${o.rainbow ? rainbowMarkup() : ""}${p.special}${p.L.seat}${p.character}</g>`);
}

/* the judge's head making one face. size sets width and height; the viewBox is fixed */
export function faceIconSvg(face, opts = {}) {
  const size = Math.max(8, num(opts && opts.size, 96)), fc = FACES.includes(face) ? face : "neutral", p = pose(fc);
  const body = `${judgeHead(p, { animate: !!(opts && opts.animate) })}${pawsIcon(p)}${p.zz ? zzMarkup(52, -52, K.mute, 14) : ""}`;
  return svgDoc("-74 -76 148 148", body, ` width="${f(size)}" height="${f(size)}"`);
}
