/* Year two: twelve more places (the designer, 2026-11-14: all twelve, all animated). Each is built with kit.js: one view in
   the indigo ramp, a seat and a floor band give the H scene, the G postcard landscape and the stamp.
   Every view moves when drawn with `animate` (the `on` helper): water scrolls, lamps and plants sway, lights flicker,
   snow and leaves fall, the lighthouse sweeps, fireworks open, a drum turns. Still pictures show the same things at rest.
   Not in the calendar yet (no ids in ../../places/index.js): pass a place object to sceneSvg({ place }) to draw one.
   Titles are placeholders. Importing this file adds the titles' characters to the lettering. */
import { f, inset } from "../../util.js";
import { makePlace, mist, floorBand, RED } from "./kit.js";
import { GLYPHS } from "../glyphs.js";
import { EXTRA } from "../glyphs-year2.js";
Object.assign(GLYPHS, EXTRA);

const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");
const WARM = "#ebb229";
/* floor patterns */
const lines = (y0, c, step, w = 1.2) => `<path d="${rep(Math.ceil(400 / step), i => `M${i * step} ${y0}V500`)}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const ribs = (y0, c, step = 6) => `<path d="${rep(Math.ceil((500 - y0) / step), i => `M0 ${y0 + 4 + i * step}H400`)}" stroke="${c}" stroke-width="1.2" fill="none"/>`;
const checks = (y0, c, s = 13) => `<g fill="${c}">${rep(Math.ceil(400 / s), i => rep(Math.ceil((500 - y0) / s), j => ((i + j) % 2 ? "" : `<rect x="${i * s}" y="${y0 + j * s}" width="${s}" height="${s}"/>`)))}</g>`;
const tufts = (y0, c, q) => q.s(rep(20, i => `M${i * 21 + 4} ${y0 + 12}l-4 -8M${i * 21 + 4} ${y0 + 12}l1 -9M${i * 21 + 4} ${y0 + 12}l5 -7`), c, 1.4);
const ripples = (y0, c, q) => q.s(`M0 ${y0 + 9}${rep(10, () => "q10 -4 20 0t20 0")}M0 ${y0 + 19}${rep(10, () => "q10 -4 20 0t20 0")}`, c, 1.4);
/* seats: all behind the body or below the lap */
const chairBack = (c, q, x = 36, top = 168, r = 62) => q.p(`M${x} 470V${top + r}Q${x} ${top} ${x + r} ${top}H${400 - x - r}Q${400 - x} ${top} ${400 - x} ${top + r}V470Z`, c.a, 2.2);
const bench = (c, q) => q.r(60, 462, 22, 38, c.b, 2) + q.r(318, 462, 22, 38, c.b, 2) + q.r(26, 448, 348, 18, c.a, 2.2, 4);
const cushion = (c, q) => q.p("M26 450Q200 436 374 450Q386 462 374 474Q200 486 26 474Q14 462 26 450Z", c.a, 2.2) + q.l("M60 462Q200 452 340 462", 1.4, .5);
const crate = (c, q) => q.r(74, 446, 252, 54, c.a, 2.2, 3) + q.l("M74 464H326M74 482H326M120 446V500M280 446V500", 1.6);
const stones = (c, q) => [[16, 448, 30, 17], [384, 450, 30, 16], [64, 458, 34, 14], [336, 460, 34, 13]].map(([x, y, rx, ry]) => q.e(x, y, rx, ry, c.l, 1.8)).join("");
const canvasChair = (c, q) => q.p("M78 440V232Q78 218 92 218H308Q322 218 322 232V440Z", c.a, 2.2) + q.l("M96 452L304 500M304 452L96 500", 5) + q.s("M96 452L304 500M304 452L96 500", c.l, 2.4);
const pine = (q, c, x, y, s) => q.p(`M${x} ${y - 78 * s}L${x + 24 * s} ${y - 30 * s}H${x + 10 * s}L${x + 30 * s} ${y}H${x - 30 * s}L${x - 10 * s} ${y - 30 * s}H${x - 24 * s}Z`, c, 1.6);
/* moving things shared by several places */
const waves = (q, on, y, c, dur = 6, o = .8) => `<g${on("lc-scroll", `--lc-w:-40px;animation-duration:${dur}s`)}>${q.s(`M0 ${y}${rep(11, () => "q10 -5 20 0t20 0")}`, c, 1.5, o)}</g>`;
const drift = (on, m, x = 16, dur = 12) => `<g${on("lc-float", `--lc-x:${x}px;--lc-y:0px;animation-duration:${dur}s`)}>${m}</g>`;
const flock = (q, on, V, x, y, dx = 22, dur = 9) => `<g${on("lc-float", `--lc-x:${dx}px;--lc-y:-7px;animation-duration:${dur}s`)}>${q.s(`M${x} ${y}q7 -7 14 0q7 -7 14 0M${x + 36} ${y + 22}q5 -5 10 0q5 -5 10 0`, V.line, 1.5)}</g>`;
const snowD = rep(8, gx => rep(14, gy => { const x = gx * 40 + (gy % 2) * 20 + ((gy * 7) % 9), y = gy * 30 - 120; return `M${x} ${y}a2 2 0 1 0 4 0a2 2 0 1 0 -4 0`; }));
const maple = (x, y, rot, s, line) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 -9L2.4 -3.6L8 -6L5.6 -.4L10 3L3.6 4L0 10L-3.6 4L-10 3L-5.6 -.4L-8 -6L-2.4 -3.6Z" fill="${RED}" stroke="${line}" stroke-width="${f(1 / s)}" stroke-linejoin="round"/>`;

/* 1 · tea hills: rows of tea bushes climbing a hillside, a small hut */
const teahill = makePlace({
  name: "茶之丘", grounds: { morning: "#cfd6a8", golden: "#dba066", night: "#313a48" }, crop: "40 120 320 320", bandY: 480,
  tones: { a: "#b98656", b: "#916b46", l: "#d9b98a" }, floor: ["#8ea06a", "#5d7a4f"],
  view(V, q, time, on) {
    const d = V.d;
    /* two pickers in straw hats work their way along the rows; smoke from the hut; the mist and the birds drift */
    const picker = (x, y, dl) => `<g${on("lc-bob", `animation-delay:${dl}s;animation-duration:3.4s`)}>${q.c(x, y + 5, 5.5, d[0], 0)}${q.p(`M${x - 11} ${y}L${x} ${y - 9}L${x + 11} ${y}Z`, V.paper, 1.3)}</g>`;
    return q.p("M-10 250Q110 150 230 220Q320 170 410 230V330H-10Z", d[3], 1.4) + drift(on, mist(V, 60, 232, 200, 13), 18, 13) + flock(q, on, V, 96, 150)
      + rep(6, k => q.p(`M-10 ${292 + k * 36}Q200 ${246 + k * 36} 410 ${292 + k * 36}V${332 + k * 36}Q200 ${286 + k * 36} -10 ${332 + k * 36}Z`, d[k % 2 ? 2 : 1], 1.3)
        + q.s(rep(14, i => `M${i * 30 + (k % 2) * 15} ${f(292 + k * 36 - 46 * Math.sin((i * 30 + (k % 2) * 15) / 400 * Math.PI) + 8)}q7 -9 14 0`), d[4], 1.3, .7))
      + picker(118, 300, 0) + picker(236, 352, -1.6)
      + q.r(332, 226, 8, 16, d[1], 1.3) + `<g${on("lc-steam")}>${q.s("M336 222c-5 -7 4 -10 0 -17c-4 -6 3 -9 1 -15", V.paper, 2.2, .85)}</g>`
      + q.r(292, 248, 50, 30, V.paper, 1.8) + q.p("M284 250L317 226L350 250Z", d[1], 1.8) + q.r(310, 258, 12, 20, V.lit ? V.warm : d[3], 1.2);
  },
  seat: bench, band: (c, y0, q) => floorBand(y0, c.fill, c.k, tufts(y0, c.mark, q)),
});

/* 2 · under the lighthouse: a cliff, the tower, the sea; the lamp turns on in the evening */
const lighthouse = makePlace({
  name: "燈塔下", grounds: { morning: "#cfd9dc", golden: "#df9c6c", night: "#2c3649" }, crop: "30 60 330 330", bandY: 480,
  tones: { a: "#c6d3dc", b: "#93abc4", l: "#efe6d2" }, floor: ["#9aa58a", "#6f7f66"],
  view(V, q, time, on) {
    const d = V.d;
    /* the lamp sweeps across the sky from the evening on; the sea rolls; a boat sits on the horizon */
    return (V.lit ? `<g${on("lc-sweep", "transform-origin:92px 94px")}><path d="M92 94L420 20V150Z" fill="${V.warm}" opacity="${V.glow * .75}"/></g>` : "")
      + q.r(0, 262, 400, 90, d[2], 1.8) + waves(q, on, 284, V.paper, 6, .85) + waves(q, on, 310, V.paper, 4.5, .8) + drift(on, mist(V, 220, 244, 170, 12), -16, 14)
      + `<g transform="translate(318 262)"><g${on("lc-bob", "animation-duration:5s")}>${q.p("M-16 0H16L11 8H-11Z", d[0], 1.2)}${q.l("M0 0V-16", 1.2)}${q.p("M0 -16L10 -4H0Z", V.paper, 1)}</g></g>`
      + q.p("M-10 500V250Q30 224 96 232Q150 240 170 300Q190 360 250 372V500Z", d[3], 1.8) + q.s("M20 290q40 -14 90 -4M40 340q50 -10 110 4", d[4], 1.6, .7)
      + q.p("M64 232L72 120H112L120 232Z", V.paper, 2) + q.f("M69 168L71 144H113L115 168Z", RED) + q.r(66, 104, 52, 18, d[1], 1.8, 3) + q.r(76, 82, 32, 24, V.lit ? V.warm : d[5], 1.8) + q.p("M70 84L92 62L114 84Z", d[1], 1.8)
      + q.r(86, 196, 12, 36, d[1], 1.4, 5)
      + flock(q, on, V, 250, 130, 14, 7)
      + q.p("M240 372Q320 352 410 366V500H240Z", d[4], 1.8);
  },
  seat: (c, q) => stones(c, q), band: (c, y0, q) => floorBand(y0, c.fill, c.k, tufts(y0, c.mark, q)),
});

/* 3 · the flower shop: shelves of pots, a big window, plants hanging from the ceiling */
const flowershop = makePlace({
  name: "花之屋", grounds: { morning: "#dcd9c0", golden: "#dfa27a", night: "#3a3c49" }, crop: "30 30 340 340",
  tones: { a: "#c99a62", b: "#96704a", l: "#e8cfa0" }, floor: ["#b9ad9b", "#8f8474"],
  view(V, q, time, on) {
    const d = V.d, pot = (x, y, s, fl) => q.p(`M${x - 11 * s} ${y}h${22 * s}l${-3 * s} ${18 * s}h${-16 * s}Z`, d[2], 1.3) + q.c(x - 6 * s, y - 8 * s, 8 * s, d[1], 1.1) + q.c(x + 6 * s, y - 10 * s, 9 * s, d[1], 1.1) + q.c(x, y - 18 * s, 8 * s, d[1], 1.1)
      + (fl ? `<g fill="${fl}">${[[-6, -12], [5, -17], [1, -24], [9, -8]].map(([a, b]) => `<circle cx="${f(x + a * s)}" cy="${f(y + b * s)}" r="${f(2.6 * s)}"/>`).join("")}</g>` : "");
    const hang = (x, len, s) => `<g transform="translate(${x} 0)"><g${on("lc-sway", `animation-duration:${5 + (x % 3)}s`)}>${q.l(`M0 0V${len}`, 1.3)}${q.p(`M${-10 * s} ${len}h${20 * s}l${-4 * s} ${12 * s}h${-12 * s}Z`, d[2], 1.3)}${q.s(`M${-6 * s} ${len + 12 * s}q-6 ${14 * s} -2 ${26 * s}M0 ${len + 12 * s}q2 ${12 * s} -1 ${22 * s}M${6 * s} ${len + 12 * s}q8 ${12 * s} 4 ${24 * s}`, d[1], 2.2)}</g></g>`;
    return q.f("M0 0H400V500H0Z", d[5]) + q.r(120, 60, 170, 170, V.sky[1], 2.6, 6) + `<circle cx="250" cy="110" r="16" fill="${V.disc[0]}"/>` + q.l("M205 60V230M120 145H290", 2)
      + hang(60, 46, 1.2) + hang(330, 62, 1.1) + hang(206, 30, .9)
      /* two butterflies wander between the pots */
      + [[150, 270, 46, -30, 8, WARM], [286, 330, -40, -22, 11, V.paper]].map(([x, y, dx, dy, dur, c]) => `<g transform="translate(${x} ${y})"><g${on("lc-float", `--lc-x:${dx}px;--lc-y:${dy}px;animation-duration:${dur}s`)}><g${on("lc-flame", "animation-duration:.5s")}>${q.p("M0 0L-8 -7L-6 3Z", c, 1)}${q.p("M0 0L8 -7L6 3Z", c, 1)}</g></g></g>`).join("")
      + q.r(0, 250, 110, 8, d[1], 1.6) + q.r(300, 280, 110, 8, d[1], 1.6) + pot(28, 232, 1, RED) + pot(72, 232, 1.1, V.paper) + pot(330, 262, 1, WARM) + pot(372, 262, 1.1, RED)
      + q.r(0, 330, 400, 170, d[4], 0) + q.l("M0 330H400", 2) + q.p("M20 430h44l-6 -50h-32Z", d[2], 1.6) + `<g${on("lc-bob", "animation-duration:5.5s")}>${pot(42, 380, 1.4, RED)}</g>` + q.p("M330 430h50l-7 -44h-36Z", d[2], 1.6) + `<g${on("lc-bob", "animation-duration:6.5s;animation-delay:-2s")}>${pot(355, 386, 1.3, V.paper)}</g>`
      + q.r(0, 430, 400, 70, d[3], 1.8);
  },
  seat: crate, band: (c, y0) => floorBand(y0, c.fill, c.k, checks(y0, c.mark, 16)),
});

/* 4 · the fishing harbour: boats at the pier, nets, a far light */
const harbour = makePlace({
  name: "漁港邊", grounds: { morning: "#cdd8d2", golden: "#dd9b68", night: "#2f394c" }, crop: "30 90 330 330", bandY: 482,
  tones: { a: "#8fa3ad", b: "#6a7f8a", l: "#c6d3dc" }, floor: ["#b08a5c", "#8f6c44"],
  view(V, q, time, on) {
    const d = V.d, boat = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><g${on("lc-bob", `animation-delay:${-(x % 5)}s`)}>${q.p("M-44 0H44L34 20H-34Z", c, 1.8 / s)}${q.f("M-42 4H42L40 9H-40Z", RED)}${q.r(-12, -20, 26, 20, V.paper, 1.6 / s)}${q.l("M20 -20V-52M20 -50L-30 -8", 1.4 / s)}${q.r(-6, -14, 8, 8, V.lit ? V.warm : d[3], 1 / s)}</g></g>`;
    return q.p("M-10 262L70 228L140 250L230 210L330 244L410 226V290H-10Z", d[3], 1.4) + mist(V, 100, 250, 190, 12)
      + q.r(0, 278, 400, 100, d[2], 1.8) + waves(q, on, 300, V.paper, 7, .75) + waves(q, on, 340, V.paper, 5, .75) + flock(q, on, V, 40, 150, 26, 10)
      + boat(110, 320, 1, d[1]) + boat(300, 300, .8, d[1]) + boat(214, 352, .6, d[3])
      + q.r(0, 372, 400, 130, d[4], 1.8) + rep(5, i => q.r(20 + i * 90, 356, 14, 30, d[1], 1.6, 4)) + q.s("M27 362Q72 384 117 362Q162 384 207 362Q252 384 297 362Q342 384 387 362", d[1], 1.6)
      + q.p("M300 440q30 -40 80 -36l-10 40Z", d[3], 1.6) + q.s("M312 434l56 -30M322 440l52 -26M338 404l8 36M356 404l6 34", d[1], 1)
      + q.l("M352 250V200", 2) + q.r(346, 186, 12, 14, V.lit ? V.warm : V.paper, 1.4) + (V.lit ? `<circle${on("lc-flicker")} cx="352" cy="193" r="18" fill="${V.warm}" opacity="${V.glow}"/>` : "");
  },
  seat: crate, band: (c, y0) => floorBand(y0, c.fill, c.k, lines(y0, c.mark, 34, 1.4)),
});

/* 5 · the firefly stream: trees on both banks, reeds, lights over the water in the evening */
const fireflies = makePlace({
  name: "螢之川", grounds: { morning: "#c9d6b8", golden: "#c98f62", night: "#27323f" }, crop: "40 90 320 320", bandY: 478,
  tones: { a: "#8fa3ad", b: "#6a7f8a", l: "#c9c2b3" }, floor: ["#6f93a0", "#a9c3cc"],
  view(V, q, time, on) {
    const d = V.d, tree = (x, y, s) => q.l(`M${x} ${y}V${y - 60 * s}`, 5 * s) + q.c(x, y - 80 * s, 34 * s, d[1], 1.6) + q.c(x - 26 * s, y - 56 * s, 24 * s, d[1], 1.6) + q.c(x + 26 * s, y - 58 * s, 26 * s, d[1], 1.6);
    const flies = [[90, 250], [140, 300], [210, 260], [260, 320], [300, 250], [180, 350], [120, 380], [280, 390], [60, 330], [340, 340], [230, 220]];
    return q.p("M-10 300Q100 240 200 280Q300 236 410 290V360H-10Z", d[3], 1.4) + mist(V, 90, 284, 220, 12)
      + tree(40, 330, 1.3) + tree(360, 320, 1.4) + tree(110, 300, .8) + tree(300, 296, .7)
      + q.p("M-10 340Q80 320 120 360Q160 400 150 500H-10Z", d[2], 1.8) + q.p("M410 330Q320 320 290 370Q260 420 280 500H410Z", d[2], 1.8)
      + q.p("M150 500Q160 400 120 360Q200 330 290 370Q260 420 280 500Z", d[4], 1.6) + drift(on, q.s("M170 410q20 -8 40 0M200 450q24 -8 48 0M180 380q16 -6 32 0", V.paper, 1.5, .8), 8, 5)
      + `<g${on("lc-sway", "transform-origin:50% 100%;animation-duration:6s")}>${q.s(rep(7, i => `M${96 + i * 8} 372q-4 -30 ${i % 2 ? 6 : -4} -52`), d[1], 1.8)}</g><g${on("lc-sway", "transform-origin:50% 100%;animation-duration:7.5s;animation-delay:-2s")}>${q.s(rep(7, i => `M${296 + i * 8} 384q4 -30 ${i % 2 ? -6 : 4} -54`), d[1], 1.8)}</g>`
      /* each firefly wanders on its own small path and its light comes and goes */
      + flies.map(([x, y], i) => `<g${on("lc-float", `--lc-x:${((i * 37) % 31) - 15}px;--lc-y:${-6 - ((i * 23) % 17)}px;animation-duration:${5 + (i % 4) * 1.5}s;animation-delay:${-i * .9}s`)}>${V.lit ? `<circle cx="${x}" cy="${y}" r="9" fill="${V.warm}" opacity="${V.glow * .5}"/>` : ""}<circle${on("lc-twinkle", `animation-delay:${-i * .7}s`)} cx="${x}" cy="${y}" r="${V.lit ? 2.8 : 1.6}" fill="${V.lit ? V.warm : V.paper}"/></g>`).join("");
  },
  seat: (c, q) => stones(c, q), band: (c, y0, q) => floorBand(y0, c.fill, c.k, ripples(y0, c.mark, q)),
});

/* 6 · fireworks night: a festival by the river; stalls, a row of lanterns, bursts in the sky after dark */
const fireworks = makePlace({
  name: "花火夜", grounds: { morning: "#d9d0b0", golden: "#d88f5c", night: "#2b2f44" }, crop: "30 30 340 340",
  tones: { a: "#bf452d", b: "#96301f", l: "#e7775f" }, floor: ["#3f6f93", "#efe6d2"],
  view(V, q, time, on) {
    /* after dark the bursts open one after another; the lanterns sway on their line and the crowd bobs */
    const d = V.d, burst = (x, y, r, c, n = 14, dl = 0, dur = 4.2) => `<g${on("lc-burst", `animation-delay:${dl}s;animation-duration:${dur}s`)}>${q.s(rep(n, i => { const a = i / n * Math.PI * 2; return `M${f(x + Math.cos(a) * r * .3)} ${f(y + Math.sin(a) * r * .3)}L${f(x + Math.cos(a) * r)} ${f(y + Math.sin(a) * r)}`; }), c, 2.2)}${rep(n, i => { const a = (i + .5) / n * Math.PI * 2; return `<circle cx="${f(x + Math.cos(a) * r * 1.1)}" cy="${f(y + Math.sin(a) * r * 1.1)}" r="1.8" fill="${c}"/>`; })}</g>`;
    const lamp = (x, y, i) => `<g transform="translate(${f(x)} ${f(y)})"><g${on("lc-sway", `animation-duration:${4 + (i % 3)}s;animation-delay:${-i * .6}s`)}>${V.lit ? `<circle cy="8" r="14" fill="${V.warm}" opacity="${V.glow * .7}"/>` : ""}${q.e(0, 8, 7, 9, RED, 1.3)}</g></g>`;
    return (V.lit ? burst(110, 100, 46, V.warm, 14, 0, 4.2) + burst(270, 130, 56, RED, 14, -1.5, 5) + burst(196, 60, 30, V.paper, 10, -2.9, 3.6) : drift(on, q.s("M90 110q20 -14 44 -4M250 140q22 -12 46 0", V.paper, 2, .6), 20, 14))
      + q.p("M-10 290L80 262L180 280L290 256L410 282V330H-10Z", d[3], 1.4)
      + q.l("M0 232Q200 262 400 232", 1.3) + rep(9, i => lamp(22 + i * 44.5, 232 + 30 * Math.sin((22 + i * 44.5) / 400 * Math.PI) * .5, i))
      + q.p("M-10 320L20 286H130L152 320Z", d[1], 2) + q.f("M20 286h22l6 34h-30zM64 286h22l6 34h-22zM108 286h22l22 34h-34z", d[4]) + q.r(0, 320, 142, 70, d[3], 2)
      + q.p("M256 314L280 280H410V314Z", d[1], 2) + q.r(268, 314, 142, 76, d[3], 2) + q.r(288, 330, 56, 22, V.paper, 1.4)
      + q.r(0, 386, 400, 114, d[3], 1.8) + rep(9, i => `<g${on("lc-bob", `animation-duration:${3 + (i % 3) * .7}s;animation-delay:${-i * .5}s`)}>${q.c(24 + i * 44, 396 + (i % 2) * 6, 13, d[1], 1.4)}</g>`);
  },
  seat: cushion, band: (c, y0) => floorBand(y0, c.fill, c.k, checks(y0, c.mark, 14)),
});

/* 7 · the sea of rice: flat paddies full of water, a scarecrow, an egret */
const ricefield = makePlace({
  name: "稻之海", grounds: { morning: "#cdd8b4", golden: "#dfa468", night: "#2e3a47" }, crop: "40 110 320 320", bandY: 478,
  tones: { a: "#d9b65a", b: "#b08f3c", l: "#eed9a0" }, floor: ["#8fb0b6", "#5d8a63"],
  view(V, q, time, on) {
    const d = V.d;
    /* the seedlings shimmer row by row, the scarecrow leans in the wind, the egret steps, dragonflies hover */
    const fly = (x, y, dx, dur) => `<g transform="translate(${x} ${y})"><g${on("lc-float", `--lc-x:${dx}px;--lc-y:-10px;animation-duration:${dur}s`)}>${q.l("M-7 0H7", 1.6)}${q.s("M-2 0L-7 -6M-2 0L-7 6M1 0L6 -6M1 0L6 6", V.paper, 1.4, .9)}</g></g>`;
    return q.p("M-10 270L60 236L130 258L220 222L320 252L410 234V300H-10Z", d[3], 1.4) + drift(on, mist(V, 60, 262, 210, 12), 16, 12)
      + q.l("M30 290V226M26 236H34M150 290V236M146 246H154", 1.6) + q.s("M30 232Q90 250 150 242Q270 232 400 250", V.line, 1, .6)
      + q.r(0, 290, 400, 210, d[4], 1.8) + rep(5, k => q.l(`M0 ${318 + k * 34}H400`, 1.2, .5))
      + rep(6, k => `<g${on("lc-float", `--lc-x:${k % 2 ? 2.5 : -2.5}px;--lc-y:0px;animation-duration:${3 + k * .4}s`)}>${q.s(rep(20 + k * 2, i => `M${f(i * 400 / (20 + k * 2) + (k % 2) * 6)} ${302 + k * 34}v${-8 - k * 1.5}`), d[1], 1.6 + k * .2)}</g>`)
      + fly(200, 268, 34, 6) + fly(70, 330, -26, 8)
      + `<g transform="translate(316 300)"><g${on("lc-sway", "animation-duration:6s;transform-origin:50% 100%")}>${q.l("M0 60V-30M-34 -8H34", 3)}${q.c(0, -40, 13, V.paper, 1.6)}${q.p("M-20 -54L0 -66L20 -54Z", d[1], 1.6)}${q.p("M-30 -8H30L22 30H-22Z", RED, 1.6)}</g></g>`
      + `<g${on("lc-float", "--lc-x:0px;--lc-y:-3px;animation-duration:5s")}>${q.p("M96 356q-2 -30 10 -40q4 -4 10 0l10 4l-12 2q-4 14 -6 34Z", V.paper, 1.4)}${q.l("M102 356v22M108 356v20", 1.2)}</g>`;
  },
  seat: (c, q) => q.e(30, 452, 40, 26, c.a, 2) + q.s("M4 440q26 -10 52 0M2 456q28 -8 56 0", c.b, 1.6) + q.e(372, 454, 38, 24, c.a, 2) + q.s("M348 444q24 -8 48 0", c.b, 1.6),
  band: (c, y0, q) => floorBand(y0, c.fill, c.k, q.s(rep(26, i => `M${i * 16 + 4} ${y0 + 16}v-10`), c.mark, 1.8)),
});

/* 8 · the temple in maple season: a curved roof, stone steps, red leaves */
const mapletemple = makePlace({
  name: "楓之寺", grounds: { morning: "#d9cfae", golden: "#d98a55", night: "#33303d" }, crop: "30 40 340 340",
  tones: { a: "#bf452d", b: "#96301f", l: "#e7775f" }, floor: ["#b08a5c", "#8f6c44"], fxOnView: true,
  view(V, q, time, on) {
    const d = V.d;
    return q.p("M-10 260L80 210L170 240L260 196L410 250V320H-10Z", d[3], 1.4) + mist(V, 30, 246, 200, 12)
      + q.p("M250 250L276 150H304L330 250Z", d[2], 1.6) + rep(3, i => q.p(`M${248 + i * 6} ${196 + i * 26}Q290 ${176 + i * 26} ${332 - i * 6} ${196 + i * 26}L${322 - i * 6} ${204 + i * 26}H${258 + i * 6}Z`, d[1], 1.5)) + q.l("M290 150V126", 2)
      + q.p("M150 300Q270 250 400 280L410 300H140Z", d[1], 2) + q.p("M170 300H400V400H170Z", d[4], 1.8) + rep(4, i => q.r(190 + i * 54, 300, 10, 100, d[1], 1.4)) + q.r(160, 396, 250, 12, d[2], 1.6)
      + rep(4, i => q.r(120 - i * 12, 408 + i * 14, 300 + i * 24, 14, d[i % 2 ? 4 : 3], 1.4))
      + q.s("M-6 40Q70 70 150 50M60 60q10 30 0 60M110 56q20 20 14 50", V.line, 2.4)
      + [[30, 62, 10, 1.6], [70, 86, 40, 1.4], [108, 70, -20, 1.5], [140, 96, 60, 1.2], [56, 120, 0, 1.3], [128, 124, 30, 1.2], [20, 100, -40, 1.2], [160, 60, 20, 1.3]].map(([x, y, r, s], i) => `<g${on("lc-sway", `animation-duration:${4 + (i % 3)}s`)}>${maple(x, y, r, s, V.line)}</g>`).join("")
      + q.r(48, 380, 16, 34, d[4], 1.6) + q.r(42, 350, 28, 30, d[4], 1.6) + q.p("M32 352Q56 328 80 352Z", d[4], 1.6) + (V.lit ? `<circle${on("lc-flicker")} cx="56" cy="364" r="20" fill="${V.warm}" opacity="${V.glow * .8}"/>` : "") + q.r(50, 358, 12, 12, V.lit ? V.warm : V.paper, 1.2);
  },
  fx: (c, q, time, on) => ({ back: [[112, 0], [300, 5], [250, 10], [40, 3], [190, 8]].map(([x, d], i) => `<g transform="translate(${x} 20)"><g${on("lc-leaf", `animation-delay:${-d}s;animation-duration:${15 + i * 2}s`)}>${maple(0, 0, 0, 1.1, c.k)}</g></g>`).join("") }),
  seat: cushion, band: (c, y0) => floorBand(y0, c.fill, c.k, lines(y0, c.mark, 40, 1.4)),
});

/* 9 · the observatory: a dome on a hill and a very big sky */
const observatory = makePlace({
  name: "星之台", grounds: { morning: "#cfd8dc", golden: "#d9976a", night: "#262d42" }, crop: "30 60 340 340", bandY: 480,
  tones: { a: "#5f7f9a", b: "#45627a", l: "#c9c2b3" }, floor: ["#7f9a6f", "#56704a"],
  view(V, q, time, on) {
    const d = V.d, stars = rep(34, i => `<circle${on("lc-twinkle")} cx="${(i * 97) % 400}" cy="${10 + (i * 53) % 230}" r="${1 + (i % 3) * .5}" fill="${V.paper}"${V.lit ? "" : ` opacity=".5"`}/>`);
    /* by day, clouds and birds cross the big sky; from the evening on, a shooting star now and then */
    const cloud = (x, y, w, dx, dur) => drift(on, `<g fill="${V.paper}" opacity=".85"><rect x="${x}" y="${y}" width="${w}" height="12" rx="6"/><rect x="${x + w * .25}" y="${y + 8}" width="${w * .9}" height="12" rx="6"/></g>`, dx, dur);
    const shoot = (x, y, dl) => (V.lit && on("lc-shoot") ? `<g${on("lc-shoot", `animation-delay:${dl}s`)}>${q.s(`M${x} ${y}l34 -15`, V.paper, 2.2)}<circle cx="${x}" cy="${y}" r="2.6" fill="${V.paper}"/></g>` : "");
    return (time === "night" ? `<path d="M-20 40Q200 120 420 30L420 90Q200 190 -20 110Z" fill="${V.paper}" opacity=".16"/>` : "") + stars
      + (time === "morning" ? cloud(40, 70, 90, 22, 15) + cloud(190, 130, 70, -18, 12) + flock(q, on, V, 150, 190, 24, 9) : "") + shoot(300, 70, 0) + shoot(180, 40, -6)
      + q.p("M-10 320Q110 250 230 290Q320 250 410 300V360H-10Z", d[3], 1.4) + mist(V, 20, 300, 180, 12)
      + q.p("M-10 372Q200 300 410 372V500H-10Z", d[2], 1.8)
      + q.r(236, 300, 116, 60, V.paper, 2) + q.p("M232 302A62 62 0 0 1 356 302Z", d[5], 2) + q.p("M284 242Q294 268 290 302H304Q304 266 296 241Z", time === "morning" ? d[4] : d[0], 1.4) + q.r(276, 326, 18, 34, d[2], 1.4) + (V.lit ? `<rect${on("lc-flicker", "animation-duration:5s")} x="310" y="318" width="26" height="16" fill="${V.warm}"/>` : "") + q.r(310, 318, 26, 16, V.lit ? "none" : d[3], 1.3)
      + `<g transform="translate(110 356)">${q.l("M0 0L-16 44M0 0L16 44M0 0V40", 2)}<g transform="rotate(-38)"><g${on("lc-sway", "transform-origin:50% 50%;animation-duration:10s")}>${q.r(-34, -10, 64, 16, d[1], 1.6, 4)}${q.r(28, -7, 12, 10, d[3], 1.2)}</g></g></g>`;
  },
  seat: canvasChair, band: (c, y0, q) => floorBand(y0, c.fill, c.k, tufts(y0, c.mark, q)),
});

/* 10 · the old coffee house: pendant lamps, a counter with a siphon, cups on a shelf */
const cafe = makePlace({
  name: "喫茶店", grounds: { morning: "#d6c7a8", golden: "#c98a5a", night: "#383540" }, crop: "30 30 340 340",
  tones: { a: "#7c3b30", b: "#5c2a22", l: "#b98656" }, floor: ["#8a5a3c", "#d9b98a"],
  view(V, q, time, on) {
    const d = V.d, lampP = (x, len) => `<g transform="translate(${x} 0)"><g${on("lc-sway", `animation-duration:${7 + (x % 3)}s`)}>${q.l(`M0 0V${len}`, 1.4)}${V.lit ? `<circle cy="${len + 12}" r="30" fill="${V.warm}" opacity="${V.glow * .7}"/>` : ""}${q.p(`M-18 ${len + 16}Q-16 ${len} 0 ${len}Q16 ${len} 18 ${len + 16}Z`, V.lit ? V.warm : d[2], 1.8)}</g></g>`;
    const cup = (x, y) => q.p(`M${x - 7} ${y}h14l-2 10h-10Z`, V.paper, 1.2) + q.l(`M${x + 7} ${y + 2}q5 1 2 6`, 1.1);
    return q.f("M0 0H400V500H0Z", d[4]) + q.r(24, 70, 120, 120, V.sky[1], 2.4, 4) + q.s(rep(8, i => `M26 ${84 + i * 14}H142`), V.line, 1.1, .6)
      + lampP(110, 40) + lampP(290, 56)
      /* a wall clock with a swinging pendulum */
      + q.r(158, 66, 30, 36, d[1], 1.6, 3) + q.c(173, 82, 10, V.paper, 1.2) + q.l("M173 82V75M173 82h5", 1.2) + `<g transform="translate(173 102)"><g${on("lc-sway", "animation-duration:2s")}>${q.l("M0 0V22", 1.2)}${q.c(0, 26, 5, V.lit ? V.warm : d[3], 1.2)}</g></g>`
      + q.r(200, 90, 180, 8, d[1], 1.6) + q.r(200, 140, 180, 8, d[1], 1.6) + rep(6, i => cup(220 + i * 28, 80)) + rep(5, i => q.r(214 + i * 34, 112, 16, 28, d[2 + (i % 3)], 1.1, 3))
      + q.r(250, 170, 96, 60, V.paper, 2) + q.s("M262 186h60M262 200h72M262 214h48", V.line, 1.4, .7)
      + q.r(0, 290, 400, 210, d[3], 0) + q.l("M0 290H400", 2) + q.r(0, 262, 400, 30, d[1], 1.8)
      + q.l("M70 262V206M60 262H80", 2) + q.c(70, 196, 13, V.paper, 1.6) + q.p("M60 226h20l-3 20h-14Z", d[5], 1.4) + `<g${on("lc-steam")}>${q.s("M70 178c-5 -6 4 -9 0 -15", V.paper, 2, .8)}</g>`
      /* the siphon bubbles; the cups on the counter steam */
      + [[66, 198, 0], [73, 200, -.9], [70, 194, -1.8]].map(([x, y, dl]) => (on("lc-spark") ? `<circle${on("lc-spark", `--lc-x:0px;animation-delay:${dl}s;animation-duration:1.8s`)} cx="${x}" cy="${y + 40}" r="1.6" fill="${d[1]}"/>` : "")).join("")
      + cup(120, 252) + cup(330, 252) + `<g${on("lc-steam")}>${q.s("M120 246c-4 -5 3 -8 0 -13", V.paper, 1.8, .8)}</g><g${on("lc-steam")}>${q.s("M330 246c-4 -5 3 -8 0 -13", V.paper, 1.8, .8)}</g>`
      + q.r(0, 440, 400, 60, d[2], 1.6);
  },
  seat: (c, q) => chairBack(c, q, 30, 170, 80) + q.f(rep(4, i => `M${88 + i * 72} ${222 - 16 * Math.sin((i + .5) / 4 * Math.PI)}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`), c.b) + q.r(18, 452, 364, 26, c.b, 2.2, 8),
  band: (c, y0) => floorBand(y0, c.fill, c.k, checks(y0, c.mark, 13)),
});

/* 11 · the laundromat: a row of round doors, one of them turning, a bench under the strip light */
const laundromat = makePlace({
  name: "洗衣店", grounds: { morning: "#d3dcd9", golden: "#dba27a", night: "#2f3848" }, crop: "30 60 340 340", bandY: 484,
  tones: { a: "#c6d3dc", b: "#93abc4", l: "#efe6d2" }, floor: ["#c9c2b3", "#8f97a0"],
  view(V, q, time, on) {
    const d = V.d, machine = (x, y, spin) => q.r(x, y, 78, 92, V.paper, 2, 6) + q.r(x + 8, y + 8, 62, 12, d[3], 1.2, 3) + q.c(x + 62, y + 14, 3, spin ? d[3] : RED, .8) + q.c(x + 39, y + 56, 27, d[2], 1.8) + q.c(x + 39, y + 56, 20, d[4], 1.2)
      + `<g transform="translate(${x + 39} ${y + 56})"><g${spin ? on("lc-spin") : ""}><circle r="18" fill="none"/>${q.p("M-12 4q6 -12 14 -4q8 6 10 -2q2 12 -10 12q-10 0 -14 -6Z", spin ? RED : d[3], 1)}${spin ? q.c(8, -9, 3, V.paper, .8) : ""}</g></g>`
      + (spin ? `<circle${on("lc-twinkle", "animation-duration:1.4s")} cx="${x + 62}" cy="${y + 14}" r="3" fill="${RED}"/>` : "");
    return q.f("M0 0H400V500H0Z", d[5]) + q.r(60, 22, 280, 12, V.lit ? V.warm : V.paper, 1.6, 6) + (V.lit ? `<path${on("lc-flicker", "animation-duration:6s")} d="M40 34H360L400 200H0Z" fill="${V.warm}" opacity="${V.glow * .35}"/>` : "")
      + q.r(20, 60, 96, 110, V.sky[1], 2.2, 4) + `<circle cx="80" cy="96" r="12" fill="${V.disc[0]}"/>` + q.l("M68 60V170", 1.6)
      + q.r(222, 70, 76, 150, d[2], 2, 5) + q.r(230, 80, 60, 70, d[4], 1.2, 3) + rep(6, i => q.r(234 + (i % 3) * 19, 86 + Math.floor(i / 3) * 30, 14, 22, [RED, WARM, d[1]][i % 3], .8, 2)) + q.r(248, 172, 24, 12, d[0], 1)
      + machine(8, 230, false) + machine(92, 230, true) + machine(176, 230, false) + machine(260, 230, false) + machine(344, 230, false)
      + q.r(0, 322, 400, 180, d[4], 1.8) + q.p("M150 420h64l-8 -40h-48Z", d[2], 1.6) + q.s("M160 380q10 -14 22 -4q12 -12 26 4", V.paper, 5);
  },
  seat: bench, band: (c, y0) => floorBand(y0, c.fill, c.k, checks(y0, c.mark, 20)),
});

/* 12 · by the warm table: a paper window with snow outside, a kettle, mandarins on the quilted table */
const kotatsu = makePlace({
  name: "暖桌旁", grounds: { morning: "#dcd4bc", golden: "#d99666", night: "#35333f" }, crop: "30 40 340 340",
  tones: { a: "#bf452d", b: "#96301f", l: "#e7775f" }, floor: ["#c9b98a", "#a8985f"],
  view(V, q, time, on) {
    const d = V.d;
    return q.f("M0 0H400V500H0Z", d[4]) + q.r(24, 50, 210, 190, V.sky[0], 2.6)
      /* snow falls outside the paper window, in two layers at two speeds */
      + inset(24, 50, 210, 190, "0 0 210 190", `<g${on("lc-snow")}><path d="${snowD}" fill="${V.paper}"/></g><g transform="translate(11 30) scale(1.35)"><g${on("lc-snow", "animation-duration:14s")}><path d="${snowD}" fill="${V.paper}" opacity=".6"/></g></g>`)
      + q.p("M24 240Q84 214 134 226Q184 206 234 232V240Z", V.paper, 1.4)
      + q.s(rep(4, i => `M${66 + i * 42} 50V240`) + rep(3, i => `M24 ${98 + i * 48}H234`), V.line, 2)
      + `<g${on("lc-sway", "animation-duration:9s")}>${q.r(254, 60, 58, 160, V.paper, 2.4)}${q.s("M283 84c-12 18 12 28 0 48c-10 16 8 28 0 44", V.line, 3)}${q.r(248, 54, 70, 8, d[1], 1.4)}${q.r(248, 218, 70, 8, d[1], 1.4)}</g>`
      + q.r(0, 280, 400, 220, d[3], 0) + q.l("M0 280H400", 2)
      + q.p("M10 352H150L166 430H-6Z", RED, 2) + q.s("M24 372l120 40M40 356l110 60M144 372l-120 40M128 356l-110 60", V.paper, 1.2, .6) + q.r(6, 338, 148, 16, d[1], 2, 3)
      + rep(3, i => q.c(54 + i * 22, 330 - (i === 1 ? 10 : 0), 9, WARM, 1.4)) + q.r(46, 334, 60, 6, d[2], 1.2, 3)
      + q.p("M300 420q-6 -40 30 -40q36 0 30 40Z", d[1], 1.8) + q.l("M312 384Q330 356 348 384M356 400l16 -10", 2) + `<g${on("lc-steam")}>${q.s("M376 384c-6 -8 5 -12 0 -20c-4 -7 4 -11 1 -17", V.paper, 2.4, .85)}</g>`
      + q.r(0, 440, 400, 60, d[2], 1.6);
  },
  seat: cushion, band: (c, y0) => floorBand(y0, c.fill, c.k, lines(y0, c.mark, 50, 1.2) + ribs(y0, c.mark, 7)),
});

export const YEAR2 = { teahill, lighthouse, flowershop, harbour, fireflies, fireworks, ricefield, mapletemple, observatory, cafe, laundromat, kotatsu };
export const YEAR2_INFO = [
  ["teahill", "茶之丘", "茶園", "一排一排的茶樹沿著山坡往上，山上一間小屋。"],
  ["lighthouse", "燈塔下", "燈塔", "懸崖、白色的塔、海。傍晚開始，塔上的燈會掃過天空。"],
  ["flowershop", "花之屋", "花店", "架上的盆栽、一大扇窗、從天花板垂下來的植物會輕輕晃。"],
  ["harbour", "漁港邊", "漁港", "停在碼頭的小船隨波起伏，岸上堆著漁網，遠處一盞燈。"],
  ["fireflies", "螢之川", "螢火蟲的小溪", "兩岸是樹，水邊有蘆葦。傍晚之後，水面上是一點一點的光。"],
  ["fireworks", "花火夜", "煙火大會", "河邊的祭典：攤位、一排燈籠。天黑之後，天上開煙火。"],
  ["ricefield", "稻之海", "稻田", "灌滿水的田、一個稻草人、一隻白鷺。"],
  ["mapletemple", "楓之寺", "楓葉的寺院", "彎彎的屋簷、石階、紅葉，葉子會一片一片落下。"],
  ["observatory", "星之台", "天文台", "山丘上的圓頂，和一片很大的天空。夜晚是滿天的星和銀河。"],
  ["cafe", "喫茶店", "老咖啡店", "吊燈、吧檯上的虹吸壺、架上一排杯子。"],
  ["laundromat", "洗衣店", "自助洗衣店", "一排圓門，其中一台在轉。日光燈下一張長椅。"],
  ["kotatsu", "暖桌旁", "暖桌", "紙窗外下著雪，桌上放著橘子，水壺冒著熱氣。"],
];
