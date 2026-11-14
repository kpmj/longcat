/* The judge in the woodblock style (docs/art-style.md). Same ids and geometry as ../judge.js, so it can replace it:
   judgeHead returns head-space markup (head centre at 0 0, drawn inside the scene at translate(200 182) scale(2));
   inside, everything is drawn at scene scale and wrapped in scale(.5). Not wired into the game yet. */
import { f, num, svgDoc } from "../util.js";
import { FACES } from "../judge.js";

export const J = { fur: "#b3885d", dk: "#916b46", muzzle: "#d3b189", ink: "#2a2223", key: "#262122", yuzu: "#ebb229", yuzuDk: "#cf8f1c", leaf: "#5d8a63", ear: "#c79c84", mouth: "#7a3b33", white: "#f8f2e2", tear: "#8fb8cc", card: "#f3ead6" };
const LW = 2.7;
const ell = (cx, cy, rx, ry = rx) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
const ln = (d, w = 1) => `<path d="${d}" fill="none" stroke="${J.key}" stroke-width="${f(LW * w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const sh = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${J.key}" stroke-width="${f(LW * w)}" stroke-linejoin="round"/>`;
const fl = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ""}/>`;

const HEAD = "M-80 -28C-80 -64 -60 -84 -32 -86H32C60 -84 80 -64 80 -28L86 30C90 64 64 82 0 82C-64 82 -90 64 -86 30Z";
const MUZZLE = "M-50 22C-50 0 -34 -6 0 -6C34 -6 50 0 50 22V44C50 66 34 74 0 74C-34 74 -50 66 -50 44Z";

/* one table for all twenty faces: eyes (left, right), look direction, brows, mouth, extras */
const BASE = { l: "lid", r: "lid", look: [0, 0], brow: "", mouth: "split", tilt: 0, dy: 0, hop: 0, nostril: 1 };
const T = {
  neutral: {},
  chew: { chew: true },
  "chew-orange": { l: "dot", r: "dot", look: [3, -3], chew: true },
  yawn: { l: "shut", r: "shut", mouth: "yawn" },
  "look-down": { l: "dotlid", r: "dotlid", look: [0, 3], dy: 10 },
  "ear-flick": { flick: true },
  brow: { r: "flat", brow: "one" },
  "slow-blink": { l: "shut", r: "shut" },
  nostrils: { nostril: 1.5 },
  "head-tilt": { tilt: -7 },
  smirk: { r: "flat", mouth: "smirk" },
  "slow-clap": { paws: "clap" },
  tear: { tear: true },
  nod: { l: "shut", r: "shut", mouth: "smile", dy: 12, ticks: true },
  score10: { paws: "card" },
  applause: { l: "happy", r: "happy", mouth: "smile", paws: "applause" },
  "content-sleep": { l: "shut", r: "shut", mouth: "smile", dy: 12, zz: true },
  pleased: { l: "happy", r: "happy", mouth: "open" },
  hmm: { l: "flat", r: "dot", look: [2, -1], brow: "one", mouth: "wavy", tilt: -7 },
  oops: { l: "wide", r: "wide", brow: "both", mouth: "o", hop: 9 },
};
export const printPose = face => ({ ...BASE, ...(T[FACES.includes(face) ? face : "neutral"] || {}) });

function eye(x, m, look) {
  const y = -30, [lx, ly] = look;
  if (m === "happy") return ln(`M${x - 8} ${y + 3}q8 -9 16 0`, 1.25);
  if (m === "shut") return ln(`M${x - 8} ${y - 1}q8 6.5 16 0`, 1.15);
  if (m === "wide") return sh(ell(x, y, 6.8), J.white, .8) + `<circle cx="${x}" cy="${y}" r="2.4" fill="${J.ink}"/>`;
  if (m === "dot") return `<circle cx="${x + lx}" cy="${y + ly}" r="4.6" fill="${J.ink}"/>`;
  if (m === "dotlid") return `<circle cx="${x + lx}" cy="${y + ly}" r="4.4" fill="${J.ink}"/>` + ln(`M${x - 9} ${y - 3}h18`, 1.1);
  if (m === "flat") return ln(`M${x - 9} ${y}h18`, 1.2);
  return `<path d="M${f(x - 6.5)} ${y - 1}h13a6.5 6 0 0 1 -13 0z" fill="${J.ink}"/>` + ln(`M${f(x - 9.5)} ${y - 1}h19`, 1.1);
}
const MOUTH = {
  split: ln("M-11 43Q-3 44 0 36Q3 44 11 43", .95),
  smile: ln("M-14 40Q-5 47 0 36Q5 47 14 40", .95),
  open: sh("M-11 41Q0 58 11 41Q4 44 0 37Q-4 44 -11 41Z", J.mouth, .8),
  wavy: ln("M-12 44q4 -4.4 8 0t8 0t8 0", .95),
  smirk: ln("M-11 43Q-3 44 0 36Q4 42 13 35", .95),
  o: sh(ell(0, 46, 5, 6.2), J.mouth, .8),
  yawn: sh(ell(0, 48, 10, 13), J.mouth, .8) + fl(ell(0, 55, 6, 4), "#c98078"),
};
function yuzu(hop) {
  const ticks = hop ? ln("M-27 -4q-4 8 -1 16M27 -4q4 8 1 16", .7) : "";
  return `<g transform="translate(24 ${-103 - hop})">${sh(ell(0, 0, 19), J.yuzu, .9)}${fl("M-18 5A19 19 0 0 0 16.5 9.5A23 23 0 0 1 -18 5Z", J.yuzuDk, .55)}<g fill="${J.yuzuDk}"><circle cx="7" cy="3" r="1.1"/><circle cx="1.5" cy="9.5" r="1.1"/><circle cx="10.5" cy="-5" r="1.1"/></g>${sh("M2 -18q11 -15 25 -6q-12 11 -25 6z", J.leaf, .8)}<circle cx="0" cy="-18.5" r="2.2" fill="${J.key}"/>${ticks}</g>`;
}
const zz = (x, y, s) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${ln("M0 0h5l-5 6h5M8.5 -9h3.6l-3.6 4.4h3.6", .7 / s)}</g>`;

/* the head in head space. o.animate adds the blink class to the resting eyes */
export function judgeHead(face, o = {}) {
  const p = typeof face === "object" && face ? face : printPose(face);
  const ear = (sx, flick) => `<g transform="translate(${sx * 67} -71) rotate(${sx * 40 + (flick ? -34 : 0)})">${sh(ell(0, 0, 9, 11.5), J.dk)}${fl(ell(0, 1.5, 4, 6), J.ear, .9)}</g>`
    + (flick ? ln("M-88 -92q-8 6 -6 16M-96 -84q-6 5 -4 12", .6) : "");
  const nostril = sx => `<path d="${ell(0, 0, 5.6 * p.nostril, 2.8 * p.nostril)}" transform="translate(${sx * 15} 13) rotate(${sx * 26})" fill="${J.ink}"/>`;
  const dots = [[34, 31], [43, 40], [32, 45]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/><circle cx="${-x}" cy="${y}" r="1.7"/>`).join("");
  const brow = p.brow === "one" ? ln("M43 -45q9 -6 19 -2") : p.brow === "both" ? ln("M-62 -44q9 -6 19 -1M43 -45q10 -5 19 1") : "";
  const resting = p.l === "lid" && p.r === "lid";
  const eyes = `<g${o.animate && resting ? ` class="lc-blink"` : ""}>${eye(-52, p.l, p.look)}${eye(52, p.r, p.look)}</g>`;
  const muzzle = `<g${p.chew ? ` transform="translate(3 2) rotate(3)"` : ""}>${fl(MUZZLE, J.muzzle)}${nostril(-1)}${nostril(1)}${ln("M0 20V36", .85)}<g fill="${J.dk}">${dots}</g>${MOUTH[p.mouth] || MOUTH.split}</g>`
    + (p.chew ? ln("M60 34q6 3 5 10", .6) : "");
  const tear = p.tear ? sh("M-58 -16q-6 8 0 14q6 -6 0 -14z", J.tear, .6) : "";
  const shade = fl("M60 -70C76 -58 80 -40 80 -28L86 30C88 52 78 68 58 76C74 58 74 10 60 -70Z", J.dk, .35);
  const head = ear(-1, p.flick) + ear(1, false) + fl(HEAD, J.fur) + shade + ln(HEAD) + muzzle + yuzu(p.hop) + eyes + brow + tear;
  const tf = [p.tilt ? `rotate(${p.tilt} 0 68)` : "", p.dy ? `translate(0 ${p.dy})` : ""].filter(Boolean).join(" ");
  const ticks = p.ticks ? ln("M104 -40v20M98 -28l6 6l6 -6M-104 -40v20M-110 -28l6 6l6 -6", .7) : "";
  const sleep = p.zz && !o.noZz ? zz(98, -74, 2.1) : "";
  return `<g transform="scale(.5)"><g${tf ? ` transform="${tf}"` : ""}>${head}</g>${ticks}${sleep}</g>`;
}

/* paws, card and motion ticks, at scene scale; x y is the paw centre */
const paw = (x, y, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">${sh(ell(0, 0, 22, 15), J.fur)}${ln("M-9 -11v8M0 -13v9M9 -11v8", .6)}</g>`;
const motion = (x, y, d) => ln(`M${x + 30 * d} ${y - 18}q${12 * d} 18 0 36M${x + 42 * d} ${y - 26}q${15 * d} 26 0 52`, .7);
const card = (x, y) => `<g transform="translate(${x} ${y}) rotate(7)">${sh("M-38 -110h76v96h-76Z", J.card)}<text y="-46" text-anchor="middle" font-family="Nunito, Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="46" fill="${J.key}">10</text></g>`;
function pawsScene(p, cx, cy, w = 128) {
  if (p.paws === "clap") return paw(cx - 26, cy, -12) + paw(cx + 26, cy, 12) + motion(cx, cy - 6, 1) + motion(cx, cy - 6, -1);
  if (p.paws === "applause") return paw(cx - w, cy - 64, -20) + paw(cx + w, cy - 64, 20) + motion(cx - w, cy - 64, -1) + motion(cx + w, cy - 64, 1);
  if (p.paws === "card") return card(cx + w * .8, cy - 60) + paw(cx + w * .8, cy - 56);
  return "";
}

/* the seated judge in scene space (400 x 500): the same layers as ../judge.js judgeFigure */
export function judgeFigure(face, o = {}) {
  const p = printPose(face);
  const BODY = "M104 250C68 262 40 302 40 372V420C40 450 62 464 96 464H304C338 464 360 450 360 420V372C360 302 332 262 296 250Z";
  const body = fl(BODY, J.fur) + fl(ell(200, 386, 88, 64), J.muzzle, .55) + fl("M296 250C332 262 360 302 360 372V420C360 450 338 464 304 464H272C330 440 344 360 296 250Z", J.dk, .35) + ln(BODY);
  const lap = ln("M64 424Q128 404 194 414M206 414Q272 404 336 424", .6);
  const feet = [146, 254].map(x => `<g transform="translate(${x} 462)">${sh(ell(0, 0, 29, 11.5), J.dk)}${ln("M-9 -3.5v7M0 -4.5v8M9 -3.5v7", .6)}</g>`).join("");
  const head = `<g transform="translate(200 182) scale(2)">${judgeHead(p, o)}</g>`;
  const paws = pawsScene(p, 200, 270);
  return { body, lap, feet, head, paws };
}

/* the head making one face, like ../portrait.js faceIconSvg */
export function faceIconSvg(face, opts = {}) {
  const size = Math.max(8, num(opts && opts.size, 96)), p = printPose(face);
  const paws = p.paws ? `<g transform="scale(.5)">${pawsScene(p, 0, p.paws === "clap" ? 118 : 150, 92)}</g>` : "";
  return svgDoc("-74 -76 148 148", judgeHead(p, { animate: !!(opts && opts.animate) }) + paws, ` width="${f(size)}" height="${f(size)}"`);
}
