/* The judge in the woodblock style (docs/art-style.md). Same ids and geometry as ../judge.js, so it can replace it:
   judgeHead returns head-space markup (head centre at 0 0, drawn inside the scene at translate(200 182) scale(2));
   inside, everything is drawn at scene scale and wrapped in scale(.5). Two capybaras: the first, and since
   2026-11-27 the new one the designer picked (NEW below), drawn only when ../style.js says so. */
import { f, num, svgDoc } from "../util.js";
import { FACES } from "../judge.js";
import { NEW_JUDGE } from "../style.js";

export const J = { fur: "#b3885d", dk: "#916b46", muzzle: "#d3b189", ink: "#2a2223", key: "#262122", yuzu: "#ebb229", yuzuDk: "#cf8f1c", leaf: "#5d8a63", ear: "#c79c84", mouth: "#7a3b33", white: "#f8f2e2", tear: "#8fb8cc", card: "#f3ead6" };
const LW = 2.7;
const ell = (cx, cy, rx, ry = rx) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
const ln = (d, w = 1) => `<path d="${d}" fill="none" stroke="${J.key}" stroke-width="${f(LW * w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const sh = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${J.key}" stroke-width="${f(LW * w)}" stroke-linejoin="round"/>`;
const fl = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ""}/>`;

const HEAD = "M-80 -28C-80 -64 -60 -84 -32 -86H32C60 -84 80 -64 80 -28L86 30C90 64 64 82 0 82C-64 82 -90 64 -86 30Z";
/* The new capybara (2026-11-27, the designer's pick; ../style.js). Measured off GPT's picture laid on the 400 x 500 scene: a
   taller head that runs straight into the body with no chin (its outline curls in at the bottom of each side, and
   the body's begins under it), pointed ears at the top corners, the face higher in the head, a pear-shaped body
   with a big pale belly, the arms hanging at its sides with pale paws, two small feet. Head space as before:
   scene minus (200 182). */
const NEW = {
  fill: "M-85 -58C-85 -90 -66 -99 -38 -99H38C66 -99 86 -90 86 -58L88 34C88 46 80 53 70 55H-68C-80 53 -87 46 -87 34Z",
  line: "M-72 55C-82 51 -87 43 -87 34L-85 -58C-85 -90 -66 -99 -38 -99H38C66 -99 86 -90 86 -58L88 34C88 43 83 51 74 55",
  shade: "M62 -92C80 -84 86 -70 86 -58L88 34C88 44 84 50 76 54C84 30 84 -40 62 -92Z",
  face: -20,
  body: "M117 228C100 246 83 290 75 340C70 372 70 410 74 426C78 442 92 448 112 448H288C308 448 322 442 326 426C330 410 330 372 325 340C317 290 300 246 283 228Z",
  bodyShade: "M283 228C300 246 317 290 325 340C330 372 330 410 326 426C322 442 308 448 288 448H262C318 420 322 300 283 228Z",
  belly: [200, 352, 80, 86],
  feet: [[146, 451], [254, 451]],
  paw: "#e3c39a",
};
/* the body's left edge at a height, for the garments' areas (print/garments.js): the cubic sides of NEW.body */
const cubic = (a, b, c, d, t) => ((1 - t) ** 3) * a + 3 * ((1 - t) ** 2) * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
const LEFT = [[[117, 228], [100, 246], [83, 290], [75, 340]], [[75, 340], [70, 372], [70, 410], [74, 426]]];
export function bodyLeftAt(y) {
  for (const [a, b, c, d] of LEFT) {
    if (y < a[1] || y > d[1]) continue;
    let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (cubic(a[1], b[1], c[1], d[1], m) < y) lo = m; else hi = m; }
    return Math.round(cubic(a[0], b[0], c[0], d[0], lo) * 10) / 10;
  }
  return y < 228 ? 117 : 74;
}
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
/* where the fruit sits on the head, in head space: the new head is taller, so it sits higher */
const ITEM_Y = NEW_JUDGE ? -119 : -103;
function yuzu(hop, lift = 0) {
  const ticks = hop ? ln("M-27 -4q-4 8 -1 16M27 -4q4 8 1 16", .7) : "";
  return `<g transform="translate(24 ${f(ITEM_Y - hop - lift)})">${sh(ell(0, 0, 19), J.yuzu, .9)}${fl("M-18 5A19 19 0 0 0 16.5 9.5A23 23 0 0 1 -18 5Z", J.yuzuDk, .55)}<g fill="${J.yuzuDk}"><circle cx="7" cy="3" r="1.1"/><circle cx="1.5" cy="9.5" r="1.1"/><circle cx="10.5" cy="-5" r="1.1"/></g>${sh("M2 -18q11 -15 25 -6q-12 11 -25 6z", J.leaf, .8)}<circle cx="0" cy="-18.5" r="2.2" fill="${J.key}"/>${ticks}</g>`;
}
/* the jungle's acorn (2026-11-23): it sits where the yuzu sits, cap up, and is as tall */
function acorn(hop, lift = 0) {
  const ticks = hop ? ln("M-25 -4q-4 8 -1 16M25 -4q4 8 1 16", .7) : "";
  return `<g transform="translate(24 ${f(ITEM_Y - hop - lift)})">${sh("M-14 -6Q-14 13 0 19Q14 13 14 -6Z", "#c99a62", .9)}${fl("M-13 2Q-10 14 0 18Q10 14 13 2Q4 12 -13 2Z", "#a87a45", .6)}${sh("M-17.500 -6Q-18 -21 0 -22Q18 -21 17.500 -6Z", "#7a5a3a", .9)}${ln("M-10 -11h5M-2 -14h5M7 -11h5M-6 -8h5M3 -8h5M-3 -18h4", .42)}${ln("M0 -22q1 -7 6 -9", .85)}${ticks}</g>`;
}
const ITEMS = { yuzu, acorn };
const zz = (x, y, s) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${ln("M0 0h5l-5 6h5M8.5 -9h3.6l-3.6 4.4h3.6", .7 / s)}</g>`;

/* The anchor on the head. Whatever is worn on the head (the hat cat, its guide) is drawn inside the head's own group,
   after the face, so every motion of the head carries it: the idle shake and yawn, the bob of a pat, and the fixed
   tilt or nod of a face. o.onHead = { under, over }, markup in head space (the scene minus the head's place, see
   judgeFigure): `under` is the hat's body, `over` the hat cat's head.
   - The fruit sits on top of the hat (the designer, 2026-11-14: "the hat portion will cover the fruit. Let's make the fruit
     always sit on top of the hat when the hat is being built"). So it is drawn between the two, over the hat's body
     and behind the cat's head, and o.itemLift raises it by as much as the hat has grown under it (hatOnHead).
   - the unpainted line pins the middle of the group's box: the head turns about the bottom middle of that box
     (ART_CSS, fill-box), and a cat that hangs over one side would otherwise move the pivot;
   - lc-rider: a pat on the judge is not a pat on the cat riding it (ART_CSS). */
const rider = m => (m ? `<g class="lc-rider">${m}</g>` : "");
export const onHeadOf = (o, item) => (o.onHead ? `<path d="M-170 0h340" fill="none"/>${rider(o.onHead.under)}${item}${rider(o.onHead.over)}` : item);
/* scene markup -> head space, for a head that judgeFigure puts at (200 182) */
const shift = m => (m ? `<g transform="translate(-200 -182)">${m}</g>` : "");
export const toHead = h => (h && (h.under || h.over) ? { under: shift(h.under), over: shift(h.over) } : null);
/* How a hat sits on a head. L = the hat's garmentLayers (or null), seat = the point in the scene where the thing on
   the judge's head rests (its bottom middle). The fruit sinks SINK into the fur, like an egg in a nest. */
export const YUZU_SEAT = { x: 224, y: NEW_JUDGE ? 82 : 98 }, SINK = 3;
export function hatOnHead(L, seat = YUZU_SEAT, extra = {}) {
  const under = (extra.guide || "") + (L ? L.under + L.art : "") + (extra.cushion || ""), over = L ? L.head : "";
  return { onHead: under || over ? { under, over } : null, itemLift: L ? Math.max(0, Math.round((seat.y - SINK - L.topAt(seat.x)) * 10) / 10) : 0 };
}

/* the head in head space. o.animate adds the blink class to the resting eyes; o.onHead rides the head (see rider) */
export function judgeHead(face, o = {}) {
  const p = typeof face === "object" && face ? face : printPose(face);
  /* the new capybara's ears are pointed and stand at the head's top corners; the first one's are small and round */
  const earArt = NEW_JUDGE
    ? (sx, flick) => `<g transform="translate(${sx * 63} -99) scale(${sx * 1.05} 1.05) rotate(${-12 + (flick ? -30 : 0)})">${sh("M-17 14L-10 -16Q-6 -26 2 -19L18 7Z", J.fur)}${fl("M-9 10L-5 -9Q-2 -15 3 -10L10 5Z", "#e9c9a0", .95)}</g>`
    : (sx, flick) => `<g transform="translate(${sx * 67} -71) rotate(${sx * 40 + (flick ? -34 : 0)})">${sh(ell(0, 0, 9, 11.5), J.dk)}${fl(ell(0, 1.5, 4, 6), J.ear, .9)}</g>`;
  /* animated: each ear twitches now and then, out of step with the other */
  const ear = (sx, flick) => (o.animate && !flick ? `<g class="lc-ear" style="animation-delay:${sx < 0 ? -2 : -5.6}s;animation-duration:${sx < 0 ? 7.5 : 9.5}s">${earArt(sx, flick)}</g>` : earArt(sx, flick))
    + (flick ? ln("M-88 -92q-8 6 -6 16M-96 -84q-6 5 -4 12", .6) : "");
  const nostril = sx => `<path d="${ell(0, 0, 5.6 * p.nostril, 2.8 * p.nostril)}" transform="translate(${sx * 15} 13) rotate(${sx * 26})" fill="${J.ink}"/>`;
  const dots = [[34, 31], [43, 40], [32, 45]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/><circle cx="${-x}" cy="${y}" r="1.7"/>`).join("");
  const brow = p.brow === "one" ? ln("M43 -45q9 -6 19 -2") : p.brow === "both" ? ln("M-62 -44q9 -6 19 -1M43 -45q10 -5 19 1") : "";
  const resting = p.l === "lid" && p.r === "lid";
  const eyes = `<g${o.animate && resting ? ` class="lc-blink"` : ""}>${eye(-52, p.l, p.look)}${eye(52, p.r, p.look)}</g>`;
  /* at rest and animated, the judge yawns now and then: the resting eyes and mouth swap with shut eyes and an open mouth */
  const idle = !!o.animate && resting && p.mouth === "split" && !p.chew && !p.tilt && !p.dy && !p.paws && !p.flick && !p.tear && p.nostril === 1 && !p.brow;
  const mouthM = idle ? "" : MOUTH[p.mouth] || MOUTH.split;
  const muzzle = `<g${p.chew ? ` transform="translate(3 2) rotate(3)"` : ""}>${fl(MUZZLE, J.muzzle)}${nostril(-1)}${nostril(1)}${ln("M0 20V36", .85)}<g fill="${J.dk}">${dots}</g>${mouthM}</g>`
    + (p.chew ? ln("M60 34q6 3 5 10", .6) : "");
  /* idle: a third face waits for a pat: eyes shut in arcs and a small smile (shown while lc-tapped) */
  const face2 = idle ? `<g class="lc-face"><g class="lc-yawn-off">${MOUTH.split}${eyes}</g><g class="lc-yawn-on">${MOUTH.yawn}${eye(-52, "shut", [0, 0])}${eye(52, "shut", [0, 0])}</g></g><g class="lc-face-pet">${MOUTH.smile}${eye(-52, "happy", [0, 0])}${eye(52, "happy", [0, 0])}</g>` : eyes;
  const tear = p.tear ? sh("M-58 -16q-6 8 0 14q6 -6 0 -14z", J.tear, .6) : "";
  const shade = fl(NEW_JUDGE ? NEW.shade : "M60 -70C76 -58 80 -40 80 -28L86 30C88 52 78 68 58 76C74 58 74 10 60 -70Z", J.dk, .35);
  /* animated: the yuzu can be tapped on its own and hops. o.itemLift: how far the hat has raised it */
  const lift = num(o.itemLift);
  /* o.item: what is on the head, the yuzu unless a place says otherwise; its data-tap is its own name */
  const itemId = ITEMS[o.item] ? o.item : "yuzu", item = ITEMS[itemId];
  const yz = o.animate && !p.hop ? `<g data-tap="${itemId}"><g class="lc-hop">${o.react === "plop" ? `<g class="lc-plop">${item(0, lift)}</g>` : item(0, lift)}</g></g>` : item(p.hop, lift);
  /* the new head: the face sits higher (NEW.face), and its outline is open at the bottom, where the body goes on */
  const faceArt = NEW_JUDGE ? `<g transform="translate(0 ${NEW.face})">${muzzle}${face2}${brow}${tear}</g>` : muzzle + face2 + brow + tear;
  const head0 = ear(-1, p.flick) + ear(1, false) + (NEW_JUDGE ? fl(NEW.fill, J.fur) + shade + ln(NEW.line) : fl(HEAD, J.fur) + shade + ln(HEAD)) + faceArt + onHeadOf(o, yz);
  /* idle: the head shakes now and then and tips back with the yawn. Animated: a pat makes it bob (lc-bobble) */
  const head1 = idle ? `<g class="lc-shake"><g class="lc-yawn-head">${head0}</g></g>` : head0;
  const head = o.animate ? `<g class="lc-bobble">${head1}</g>` : head1;
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
  /* both paws over the tummy: the judge has nothing on and pretends that was the plan */
  if (p.paws === "tummy") return `<g class="lc-tummy">${paw(cx - 36, cy + 102, 18)}${paw(cx + 36, cy + 102, -18)}</g>`;
  return "";
}

/* A heart held in both paws at the chest (the jungle, 2026-11-23: "capybara is holding a heart if the heart is
   clicked it toggles between red and pink"; at the chest since 2026-11-24, the designer's choice over beside the head). Two
   hearts lie on each other, red under pink; the pink one shows while the page has lc-pink on its root (ART_CSS; the
   page turns it with data-toggle). The paws are part of what can be pressed. The arms are drawn with the body, under
   the garments; the heart and the paws lie on the garments and under the cats' heads (print/scene.js), so the heart
   never hides a cat's face.
   o.holdUp: the picture ends at the chest (judgeBustSvg), where that heart would be cut in half. There one paw
   lifts the heart beside the head, where the 10 card is held, and the other waves. */
const HEART = "M0 17C-9 9 -22 2 -22 -8C-22 -17 -8 -20 0 -9C8 -20 22 -17 22 -8C22 2 9 9 0 17Z";
const HOLD = { x: 200, y: 338, s: 1.2, paw: [28, 20, 34], arm: NEW_JUDGE ? [112, 292] : [92, 306] };
const HOLD_UP = { x: 313, y: 188, paw: [312, 217], wave: [84, 210] };
const UP_ROOT = NEW_JUDGE ? [[287, 262], [113, 262]] : [[303, 258], [97, 258]];
const heartOne = (c, hi, cls = "") => `<g${cls ? ` class="${cls}"` : ""}>${sh(HEART, c)}<path d="M-14.500 -8q1 -6 7 -7" fill="none" stroke="${hi}" stroke-width="2.600" stroke-linecap="round"/></g>`;
const heartAt = (x, y, s = 1) => `<g transform="translate(${x} ${y})${s === 1 ? "" : ` scale(${s})`}"><circle r="27" fill="${J.key}" fill-opacity="0"/><g class="lc-beat">${heartOne("#d23f2f", "#f0a79a")}${heartOne("#f4a3b8", "#fde3ea", "lc-held-b")}</g></g>`;
const pressable = (m, animate) => (animate ? `<g data-tap="heart" data-toggle="lc-pink">${m}</g>` : m);
function heartHold(animate) {
  const [dx, dy, rot] = HOLD.paw;
  return pressable(heartAt(HOLD.x, HOLD.y, HOLD.s) + paw(HOLD.x - dx, HOLD.y + dy, rot) + paw(HOLD.x + dx, HOLD.y + dy, -rot), animate);
}
function heartUp(animate) {
  const wave = paw(HOLD_UP.wave[0], HOLD_UP.wave[1], -24);
  return pressable(heartAt(HOLD_UP.x, HOLD_UP.y), animate) + (animate ? `<g class="lc-wave">${wave}</g>` : wave) + paw(HOLD_UP.paw[0], HOLD_UP.paw[1], 14);
}
/* an arm from inside the body out to a paw: the fur runs a little further into the body than the line does, so the
   arm has no line across its root */
const arm = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0) || 1, bx = x0 - (x1 - x0) / L * 12, by = y0 - (y1 - y0) / L * 12; return `<path d="M${x0} ${y0}L${x1} ${y1}" fill="none" stroke="${J.key}" stroke-width="30.500" stroke-linecap="round"/><path d="M${f(bx)} ${f(by)}L${x1} ${y1}" fill="none" stroke="${J.fur}" stroke-width="25" stroke-linecap="round"/>`; };
const heartArms = up => { if (up) return arm(...UP_ROOT[0], HOLD_UP.paw[0], HOLD_UP.paw[1] + 6) + arm(...UP_ROOT[1], HOLD_UP.wave[0], HOLD_UP.wave[1] + 6); const [ax, ay] = HOLD.arm, [dx, dy] = HOLD.paw; return arm(ax, ay, HOLD.x - dx, HOLD.y + dy) + arm(400 - ax, ay, HOLD.x + dx, HOLD.y + dy); };

/* the seated judge in scene space (400 x 500): the same layers as ../judge.js judgeFigure */
export function judgeFigure(face, o = {}) {
  const p = printPose(face);
  if (o.paws === "tummy") p.paws = "tummy";
  const BODY = "M104 250C68 262 40 302 40 372V420C40 450 62 464 96 464H304C338 464 360 450 360 420V372C360 302 332 262 296 250Z";
  /* o.hold = "heart": the judge holds a heart, unless this face needs the paws for something else */
  const holding = o.hold === "heart" && !p.paws, up = holding && !!o.holdUp;
  /* the new capybara's arms hang at its sides: the arm's inner edge and a pale paw. Not while the paws are busy */
  const sideArms = NEW_JUDGE && !holding && !p.paws ? [-1, 1].map(s => { const x = v => 200 + s * (v - 200); return ln(`M${x(116)} 283C${x(111)} 300 ${x(104)} 316 ${x(97)} 330`, .9) + `<g transform="translate(${x(91)} 327) rotate(${s * -18})">${sh(ell(0, 0, 14, 10.5), NEW.paw, .85)}</g>`; }).join("") : "";
  const body = NEW_JUDGE
    ? fl(NEW.body, J.fur) + fl(ell(...NEW.belly), J.muzzle, .55) + fl(NEW.bodyShade, J.dk, .35) + ln(NEW.body) + sideArms + (holding ? heartArms(up) : "")
    : fl(BODY, J.fur) + fl(ell(200, 386, 88, 64), J.muzzle, .55) + fl("M296 250C332 262 360 302 360 372V420C360 450 338 464 304 464H272C330 440 344 360 296 250Z", J.dk, .35) + ln(BODY) + (holding ? heartArms(up) : "");
  /* the new capybara stands: no lap */
  const lap = NEW_JUDGE ? "" : ln("M64 424Q128 404 194 414M206 414Q272 404 336 424", .6);
  const feet = (NEW_JUDGE ? NEW.feet : [[146, 462], [254, 462]]).map(([x, y]) => `<g transform="translate(${x} ${y})">${sh(ell(0, 0, NEW_JUDGE ? 27 : 29, NEW_JUDGE ? 10 : 11.5), J.dk)}${ln("M-9 -3.5v7M0 -4.5v8M9 -3.5v7", .6)}</g>`).join("");
  const head = `<g transform="translate(200 182) scale(2)">${judgeHead(p, { ...o, onHead: toHead(o.onHead) })}</g>`;
  /* held: in front of the garments and behind the cats' heads; paws: in front of everything */
  const paws = up ? heartUp(!!o.animate) : holding ? "" : pawsScene(p, 200, 270), held = holding && !up ? heartHold(!!o.animate) : "";
  /* animated: head and body can be patted; they answer together through data-group */
  const tap = m => (o.animate ? `<g data-tap="judge" data-group="judge">${m}</g>` : m);
  return { body: tap(body), lap, feet, head: tap(head), paws, held };
}

/* the head making one face, like ../portrait.js faceIconSvg */
export function faceIconSvg(face, opts = {}) {
  const size = Math.max(8, num(opts && opts.size, 96)), p = printPose(face);
  const paws = p.paws ? `<g transform="scale(.5)">${pawsScene(p, 0, p.paws === "clap" ? 118 : 150, 92)}</g>` : "";
  /* the new head has no chin of its own: its shoulders come with it, and the box sits higher, round its taller head */
  const shoulders = NEW_JUDGE ? `<g transform="scale(.5) translate(-200 -182)">${fl(NEW.body, J.fur)}${fl(NEW.bodyShade, J.dk, .35)}${ln(NEW.body)}</g>` : "";
  return svgDoc(NEW_JUDGE ? "-74 -86 148 148" : "-74 -76 148 148", shoulders + judgeHead(p, { animate: !!(opts && opts.animate) }) + paws, ` width="${f(size)}" height="${f(size)}"`);
}
/* "z z" as cut lines instead of type, in any space; s scales it */
export const zzPrint = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="M0 0h5l-5 6h5M8.5 -9h3.6l-3.6 4.4h3.6" fill="none" stroke="${J.key}" stroke-width="${f(1.9 / s)}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
