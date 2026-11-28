/* The other eleven places in the woodblock style, built with ./kit.js: each gives one picture of itself (`view`, in
   the indigo ramp), its seat and its floor band. Titles are placeholders until the designer decides the wording.
   Seats follow the contract: behind the body or below the lap, never over lap, belly or neck. */
import { f } from "../../util.js";
import { makePlace, mist, floorBand, RED, PAPER } from "./kit.js";

const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");
/* patterns for the floor band, drawn from y0 down */
const lines = (y0, c, step, w = 1.2) => `<path d="${rep(Math.ceil(400 / step), i => `M${i * step} ${y0}V500`)}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const ribs = (y0, c, step = 6) => `<path d="${rep(Math.ceil((500 - y0) / step), i => `M0 ${y0 + 4 + i * step}H400`)}" stroke="${c}" stroke-width="1.2" fill="none"/>`;
const checks = (y0, c, s = 13) => `<g fill="${c}">${rep(Math.ceil(400 / s), i => rep(Math.ceil((500 - y0) / s), j => ((i + j) % 2 ? "" : `<rect x="${i * s}" y="${y0 + j * s}" width="${s}" height="${s}"/>`)))}</g>`;
const diamonds = (y0, c) => `<g fill="${c}">${rep(17, i => `<path d="M${i * 26 - 6} ${y0 + 13}l13 -9l13 9l-13 9z"/>`)}</g>`;
const dots = (y0, c) => `<g fill="${c}">${rep(28, i => `<circle cx="${i * 15 + (i % 2) * 4}" cy="${y0 + 8 + (i % 3) * 7}" r="1.8"/>`)}</g>`;
/* ----- small moving things, shared ----- */
const WARM = "#ebb229";
/* straps hanging from a rail between the round window and the title; each sways on its own beat */
const straps = (q, on) => q.l("M112 14H318", 3) + rep(5, i => `<g transform="translate(${130 + i * 42} 14)"><g${on("lc-sway", `animation-delay:${-i * .9}s;animation-duration:${3.2 + (i % 2) * .7}s`)}>${q.l("M0 0V20", 1.8)}${q.c(0, 27, 6.5, "none", 2.2)}</g></g>`);
/* motes of dust drifting in the light */
const motes = (c, on, list) => list.map(([x, y, r], i) => `<circle${on("lc-float", `--lc-x:${i % 2 ? 7 : -6}px;--lc-y:${-5 - (i % 3) * 3}px;animation-delay:${-i * 1.3}s;animation-duration:${6 + (i % 3) * 2}s`)} cx="${x}" cy="${y}" r="${r}" fill="${c.paper}" opacity=".75"/>`).join("");
/* rain and snow as one path on a lattice, so a loop of one lattice step has no seam */
const rainD = rep(30, gx => rep(28, gy => `M${gx * 15 + (gy % 2) * 7} ${gy * 20 - 40}l-4.500 12`));
const snowD = rep(12, gx => rep(22, gy => { const x = gx * 40 + (gy % 2) * 20 + ((gy * 7) % 9), y = gy * 30 - 120; return `M${x} ${y}a1.800 1.800 0 1 0 3.600 0a1.800 1.800 0 1 0 -3.600 0`; }));

/* a chair back that shows round the judge's body: rounded top, two arms, a base */
const chairBack = (c, q, x = 36, top = 168, r = 62) => q.p(`M${x} 470V${top + r}Q${x} ${top} ${x + r} ${top}H${400 - x - r}Q${400 - x} ${top} ${400 - x} ${top + r}V470Z`, c.a, 2.2);
const arms = (c, q) => q.r(6, 322, 50, 148, c.a, 2.2, 20) + q.r(344, 322, 50, 148, c.a, 2.2, 20) + q.r(24, 452, 352, 26, c.b, 2.2, 8);

/* ---------- 客廳 ---------- */
const livingroom = makePlace({
  name: "評審宅", grounds: { morning: "#d9c9a3", golden: "#d99a66", night: "#3d3f4c" }, crop: "20 30 330 330",
  tones: { a: "#8fa89a", b: "#6f8a7c", l: "#c9d6cb" }, floor: ["#b5654a", "#e2c79a"],
  view(V, q, time, on) {
    const d = V.d;
    return q.f("M0 0H400V500H0Z", d[4]) + q.r(40, 50, 120, 150, V.sky[1], 2.4) + `<circle cx="118" cy="92" r="14" fill="${V.disc[0]}"/>` + q.l("M100 50V200M40 125H160", 2)
      + q.p("M30 44h26q-8 60 4 160h-30Z", d[2]) + q.p("M170 44h-26q8 60 -4 160h30Z", d[2]) + q.r(24, 38, 152, 7, d[1], 1.6, 3)
      + q.r(214, 62, 72, 52, V.paper, 2.4) + q.f("M218 110q16 -24 30 -8q14 -18 34 8Z", d[3]) + `<circle cx="266" cy="78" r="6" fill="${RED}"/>`
      + q.p("M318 62L346 40L374 62Z", d[1]) + q.r(322, 62, 48, 60, d[2], 1.8) + q.c(346, 88, 14, V.paper, 1.6) + q.l("M346 88v-9M346 88l6 4", 1.6) + `<g transform="translate(340 122)"><g${on("lc-sway", "animation-duration:2.2s")}>${q.l("M0 0v30", 1.6)}</g></g><g transform="translate(352 122)"><g${on("lc-sway", "animation-duration:1.7s")}>${q.l("M0 0v22", 1.6)}</g></g>`
      + q.r(0, 300, 400, 200, d[3], 0) + q.l("M0 300H400", 2) + q.r(0, 440, 400, 60, d[2], 1.6)
      + (V.glow ? `<circle cx="30" cy="250" r="48" fill="${V.warm}" opacity="${V.glow}"/>` : "") + q.l("M30 268V470", 2.4) + q.p("M12 268L18 236H42L48 268Z", V.lit ? V.warm : d[5]);
  },
  seat: (c, q) => chairBack(c, q) + q.f("M86 206a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M196 194a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M306 206a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", c.b) + arms(c, q),
  /* a wall clock whose pendulum swings */
  fx: (c, q, time, on) => ({ back: q.p("M36 122L60 104L84 122Z", c.b, 1.8) + q.r(40, 122, 40, 42, c.l, 1.8) + q.c(60, 140, 11, c.paper, 1.6) + q.l("M60 140v-7M60 140l5 3", 1.6)
    + `<g transform="translate(60 164)"><g${on("lc-sway", "animation-duration:2.2s")}>${q.l("M0 0V22", 1.6)}${q.c(0, 26, 4.5, WARM, 1.5)}</g></g>` }),
  band: (c, y0) => floorBand(y0, c.fill, c.k, diamonds(y0, c.mark)),
});

/* ---------- 夜市 ---------- */
const nightmarket = makePlace({
  name: "夜市口", grounds: { morning: "#dcc38c", golden: "#d98a55", night: "#33303d" }, crop: "30 20 330 330", bandY: 484,
  tones: { a: "#bf452d", b: "#96301f", l: "#e7775f" }, floor: ["#8f8a82", "#c9c2b3"],
  view(V, q, time, on) {
    const d = V.d, lamp = (x, y) => `<g transform="translate(${f(x)} ${f(y)})"><g${on("lc-sway", `animation-delay:${f(-(x % 5))}s;animation-duration:${f(4 + (x % 3) * .6)}s`)}>${V.lit ? `<circle cy="10" r="17" fill="${V.warm}" opacity="${V.glow * .8}"/>` : ""}${q.e(0, 10, 9, 12, RED, 1.4)}${q.l("M-5 2h10M-5 18h10", 1)}</g></g>`;
    return q.f("M0 250V170h40v-30h50v40h40v-60h60v50h50v-30h60v40h50v-50h50V250Z", d[2])
      + q.l("M0 60Q200 112 400 60M0 112Q200 150 400 104", 1.4) + rep(8, i => lamp(30 + i * 48, 62 + 44 * Math.sin((30 + i * 48) / 400 * Math.PI))) + rep(4, i => lamp(70 + i * 86, 112 + 34 * Math.sin((70 + i * 86) / 400 * Math.PI)))
      + q.p("M-10 252L20 214H122L142 252Z", d[1], 2) + q.f("M20 214h20l8 38h-28zM62 214h20l8 38h-20zM102 214h20l20 38h-30z", d[4]) + q.r(0, 252, 132, 90, d[3], 2) + q.r(28, 268, 64, 22, V.paper, 1.6)
      + q.p("M268 244L290 206H410V244Z", d[1], 2) + q.r(280, 244, 130, 98, d[3], 2) + q.r(296, 262, 50, 20, V.paper, 1.6)
      + q.r(0, 340, 400, 160, d[3], 1.8) + q.l("M0 384H400M0 432H400M100 340V500M200 340V500M300 340V500", 1, .45);
  },
  /* a red plastic stool: only its legs show below the lap */
  seat: (c, q) => q.p("M118 452L98 500H116L134 458Z", c.a, 2) + q.p("M282 452L302 500H284L266 458Z", c.a, 2) + q.r(112, 448, 176, 12, c.a, 2, 5),
  /* a string of red lanterns that sway; they glow in the evening */
  fx: (c, q, time, on) => ({ back: q.l("M104 14Q212 42 322 14", 1.4) + rep(5, i => { const t = (i + .5) / 5, x = 104 + 218 * t, y = 14 + 56 * t * (1 - t);
    return `<g transform="translate(${f(x)} ${f(y)})"><g${on("lc-sway", `animation-delay:${-i * 1.1}s;animation-duration:${4 + (i % 2)}s`)}>${c.lit ? `<circle cy="12" r="16" fill="${WARM}" opacity=".28"/>` : ""}${q.e(0, 12, 8, 10, RED, 1.6)}${q.l("M-4.500 4h9M-4.500 20h9M0 0v2", 1.2)}</g></g>`; }) }),
  band: (c, y0) => floorBand(y0, c.fill, c.k, checks(y0, c.mark, 16)),
});

/* ---------- 火車 ---------- */
const train = makePlace({
  name: "車窗邊", fxOnView: true, grounds: { morning: "#cfd3bd", golden: "#d9965f", night: "#353b47" }, crop: "30 40 330 330",
  tones: { a: "#4f7a78", b: "#3a5f5e", l: "#efe6d2" }, floor: ["#6f7f8a", "#93a1aa"],
  view(V, q, time, on) {
    const d = V.d;
    return q.f("M0 0H400V500H0Z", d[4]) + q.r(30, 70, 340, 170, V.sky[1], 2.6, 14) + `<circle cx="${V.disc[1]}" cy="${Math.min(150, V.disc[2])}" r="18" fill="${V.disc[0]}"/>`
      + `<svg x="32" y="72" width="336" height="166" viewBox="32 72 336 166"><g${on("lc-scroll", "--lc-w:-336px")}>${[0, 336].map(dx => `<g transform="translate(${dx} 0)">${q.f("M32 205Q110 140 190 190Q270 130 368 205V238H32Z", d[2])}${q.f("M32 222Q120 190 210 214Q290 196 368 222V238H32Z", d[1])}</g>`).join("")}</g></svg>` + q.l("M200 70V240", 3) + q.l("M96 70V240M304 70V240", 1.4, .5)
      + q.l("M20 40H380", 3.2) + q.l("M60 40v14M200 40v14M340 40v14", 2) + q.r(250, 14, 70, 26, d[2], 1.6, 6) + q.r(90, 18, 50, 22, d[3], 1.6, 5)
      + q.r(0, 270, 400, 230, d[3], 0) + q.l("M0 270H400", 2) + q.r(0, 440, 400, 60, d[2], 1.6);
  },
  /* a window seat: a tall moquette back with a white cloth over the headrest */
  seat: (c, q) => chairBack(c, q, 30, 150, 40) + q.r(30, 150, 340, 46, c.l, 2, 14) + q.l("M30 196H370", 1.6) + q.f("M44 230h8v200h-8zM348 230h8v200h-8z", c.b, .6) + q.r(20, 452, 360, 24, c.b, 2.2, 8),
  fx: (c, q, time, on) => ({ back: straps(q, on) }),
  band: (c, y0) => floorBand(y0, c.fill, c.k, ribs(y0, c.mark)),
});

/* ---------- 海邊 ---------- */
const beach = makePlace({
  name: "海之濱", grounds: { morning: "#e2d2a2", golden: "#e09a66", night: "#343c4c" }, crop: "40 90 320 320",
  tones: { a: "#efe6d2", b: "#bf452d", l: "#c99a62" }, floor: ["#e6d3a3", "#cdb882"],
  view(V, q, time, on) {
    const d = V.d, wave = y => `M0 ${y}${rep(10, () => "q10 -6 20 0t20 0")}`;
    return q.p("M250 252q30 -28 72 -8q22 -4 44 8Z", d[3], 1.4) + q.r(0, 250, 400, 96, d[2], 1.8) + q.s(wave(272), V.paper, 1.6, .9) + q.s(wave(296), V.paper, 1.6, .8) + q.s(wave(322), V.paper, 1.8, .9)
      + mist(V, -20, 232, 150, 12) + `<g${on("lc-float", "--lc-x:10px;--lc-y:-5px;animation-duration:7s")}>${q.s("M286 120q8 -8 16 0q8 -8 16 0", V.line, 1.6)}</g><g${on("lc-float", "--lc-x:-8px;--lc-y:-4px;animation-duration:9s;animation-delay:-3s")}>${q.s("M330 150q6 -6 12 0q6 -6 12 0", V.line, 1.6)}</g>`
      + q.p("M-10 344Q200 324 410 344V500H-10Z", d[4], 1.8) + q.s("M30 380q20 -6 40 0M250 396q24 -6 48 0M120 440q20 -5 40 0M300 450q18 -5 36 0", d[3], 1.6)
      + q.l("M70 470V226", 2.6) + q.p("M-4 252Q70 148 144 252Z", V.paper, 2) + q.f("M24 252Q48 176 70 172Q60 200 56 252Z", d[1]) + q.f("M84 252Q80 200 70 172Q96 180 118 252Z", d[1]);
  },
  /* an upright beach chair: striped canvas behind the body, wooden legs below */
  seat: (c, q) => q.p("M70 470V214Q70 200 84 200H316Q330 200 330 214V470Z", c.a, 2.2) + rep(6, i => q.f(`M${86 + i * 42} 201h20v268h-20z`, c.b)) + q.p("M70 470V214Q70 200 84 200H316Q330 200 330 214V470Z", "none", 2.2)
    + q.p("M58 196h14v290h-14zM328 196h14v290h-14z", c.l, 2),
  /* two gulls drifting */
  fx: (c, q, time, on) => ({ back: [[150, 34, 9], [268, 50, -7]].map(([x, y, dx], i) => `<g${on("lc-float", `--lc-x:${dx}px;--lc-y:-5px;animation-delay:${-i * 2.4}s;animation-duration:${7 + i * 2}s`)}>${q.l(`M${x} ${y}q7 -8 14 0q7 -8 14 0`, 1.8)}</g>`).join("") }),
  band: (c, y0, q, time, on) => floorBand(y0, c.fill, c.k, `<g${on("lc-scroll", "--lc-w:-40px;animation-duration:5s")}>${q.s(`M0 ${y0 + 9}${rep(11, () => "q10 -4 20 0t20 0")}M0 ${y0 + 19}${rep(11, () => "q10 -4 20 0t20 0")}`, c.mark, 1.4)}</g>`),
});

/* ---------- 圖書館 ---------- */
const library = makePlace({
  name: "書之森", fxOnView: true, grounds: { morning: "#d4c7a6", golden: "#cf9562", night: "#383844" }, crop: "40 30 320 320",
  tones: { a: "#8a5a3c", b: "#6b4329", l: "#b98656" }, floor: ["#b08a5c", "#8f6c44"],
  view(V, q, time, on) {
    const d = V.d, shelf = x0 => q.r(x0, 30, 112, 410, d[1], 2.2) + rep(5, r => rep(8, i => q.r(x0 + 6 + i * 13, 42 + r * 80 + (i % 3) * 4, 10, 60 - (i % 3) * 4, d[2 + ((i * 7 + r * 3) % 4)], .9)) + q.l(`M${x0} ${106 + r * 80}h112`, 1.8));
    return q.f("M0 0H400V500H0Z", d[4]) + shelf(-2) + shelf(290)
      + q.p("M150 300V112Q150 52 200 52Q250 52 250 112V300Z", V.sky[1], 2.6) + `<circle cx="216" cy="104" r="12" fill="${V.disc[0]}"/>` + q.l("M200 52V300M150 180H250M150 112Q200 96 250 112", 1.8)
      + q.r(0, 440, 400, 60, d[2], 1.8) + (V.glow ? `<circle cx="132" cy="330" r="40" fill="${V.warm}" opacity="${V.glow}"/>` : "") + q.l("M132 440V352", 2.2) + q.p("M116 352L122 326H142L148 352Z", V.lit ? V.warm : d[5]);
  },
  /* an armchair by the window: dark leather with buttons */
  seat: (c, q) => chairBack(c, q, 40, 160, 70) + q.f(rep(4, i => `M${88 + i * 72} ${214 - 14 * Math.sin((i + .5) / 4 * Math.PI)}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`), c.b) + arms(c, q),
  /* a hanging lamp that barely sways, and dust in its light */
  fx: (c, q, time, on) => ({ back: `<g transform="translate(150 8)"><g${on("lc-sway", "animation-duration:8s")}>${q.l("M0 0V24", 1.6)}${c.lit ? `<circle cy="38" r="26" fill="${WARM}" opacity=".22"/>` : ""}${q.p("M-16 40L-9 24H9L16 40Z", c.lit ? WARM : c.l, 1.8)}</g></g>`
    + motes(c, on, [[122, 70, 1.6], [176, 84, 1.3], [140, 110, 1.8], [100, 150, 1.4], [296, 200, 1.6], [306, 120, 1.3], [118, 210, 1.5]]) }),
  band: (c, y0) => floorBand(y0, c.fill, c.k, lines(y0, c.mark, 34, 1.4)),
});

/* ---------- 露營 ---------- */
const camping = makePlace({
  name: "營火旁", grounds: { morning: "#cdd3a8", golden: "#d9905a", night: "#30384a" }, crop: "40 90 320 320", bandY: 480,
  tones: { a: "#5d7a4f", b: "#44603a", l: "#c9c2b3" }, floor: ["#8ea06a", "#5d7a4f"],
  view(V, q, time, on) {
    const d = V.d, pine = (x, y, s) => q.p(`M${x} ${y - 78 * s}L${x + 24 * s} ${y - 30 * s}H${x + 10 * s}L${x + 30 * s} ${y}H${x - 30 * s}L${x - 10 * s} ${y - 30 * s}H${x - 24 * s}Z`, d[1], 1.6);
    return q.p("M-10 262L70 172L130 232L210 142L290 232L340 192L410 252V344H-10Z", d[3], 1.6) + q.f("M196 160L210 142L226 162L212 156Z", V.paper) + mist(V, 90, 250, 190, 13)
      + pine(30, 336, 1.2) + pine(74, 348, .9) + pine(352, 338, 1.2) + pine(388, 352, 1) + pine(310, 346, .8)
      + q.p("M-10 352Q200 332 410 352V500H-10Z", d[4], 1.8) + q.p("M248 362L300 272L352 362Z", V.paper, 2) + q.p("M300 272L300 362L320 362Z", d[2], 1.6)
      + (V.glow ? `<circle cx="72" cy="418" r="44" fill="${V.warm}" opacity="${V.glow}"/>` : "") + q.l("M52 440L92 424M52 424L92 440", 4) + `<g${on("lc-flame")}>${q.p("M72 426q-14 -16 -2 -30q2 10 8 6q0 -10 8 -16q10 22 -2 40Z", V.lit ? V.warm : RED, 1.6)}</g>`;
  },
  /* a folding chair: canvas back, crossed legs below the lap */
  seat: (c, q) => q.p("M78 440V232Q78 218 92 218H308Q322 218 322 232V440Z", c.a, 2.2) + q.l("M78 250H322", 1.4, .5) + q.l("M96 452L304 500M304 452L96 500", 5) + q.s("M96 452L304 500M304 452L96 500", c.l, 2.4),
  /* a small campfire at the front: the flame flickers and sparks rise */
  fx: (c, q, time, on) => ({ front: `<g transform="translate(34 472)">${c.lit ? `<circle cy="-8" r="26" fill="${WARM}" opacity=".25"/>` : ""}${q.l("M-14 6L14 -4M-14 -4L14 6", 4.5)}<g${on("lc-flame")}>${q.p("M0 2q-13 -14 -2 -28q2 9 7 5q0 -9 7 -14q9 20 -2 37Z", c.lit ? WARM : RED, 1.7)}</g>`
    + rep(3, i => `<circle${on("lc-spark", `--lc-x:${[8, -6, 3][i]}px;animation-delay:${-i * .9}s`)} cx="${[2, -4, 6][i]}" cy="-28" r="1.6" fill="${WARM}"/>`) + `</g>` }),
  band: (c, y0, q) => floorBand(y0, c.fill, c.k, q.s(rep(20, i => `M${i * 21 + 4} ${y0 + 12}l-4 -8M${i * 21 + 4} ${y0 + 12}l1 -9M${i * 21 + 4} ${y0 + 12}l5 -7`), c.mark, 1.4)),
});

/* ---------- 電影院 ---------- */
const cinema = makePlace({
  name: "銀幕前", fxOnView: true, grounds: { morning: "#cdb7a0", golden: "#c9825a", night: "#2f2c38" }, crop: "30 20 340 340",
  tones: { a: "#a8392c", b: "#7c2a22", l: "#d8644c" }, floor: ["#6f3a3a", "#a8605a"],
  view(V, q, time, on) {
    const d = V.d, row = (y, s) => rep(9, i => q.p(`M${i * 48 - 10} ${y + 54}V${y + 14}Q${i * 48 - 10} ${y} ${i * 48 + 4} ${y}H${i * 48 + 22}Q${i * 48 + 36} ${y} ${i * 48 + 36} ${y + 14}V${y + 54}Z`, s, 1.4));
    return q.f("M0 0H400V500H0Z", d[1]) + q.r(62, 48, 276, 156, V.paper, 2.8, 4) + q.f("M66 198L130 120L180 170L240 100L334 198Z", d[3]) + `<circle cx="282" cy="92" r="16" fill="${RED}"/>`
      + q.p("M0 0H62V262Q30 252 0 272Z", RED, 2) + q.p("M400 0H338V262Q370 252 400 272Z", RED, 2) + q.l("M20 0V258M42 0V256M358 0V256M380 0V258", 1.2, .5)
      + row(296, d[2]) + row(352, d[0]) + q.r(0, 430, 400, 70, d[2], 1.6) + (V.lit ? rep(5, i => `<circle cx="${40 + i * 80}" cy="444" r="3" fill="${V.warm}"/>`) : "");
  },
  /* a red velvet seat: a rounded back, dark armrests */
  seat: (c, q) => chairBack(c, q, 44, 176, 54) + q.l("M72 236Q200 214 328 236", 1.6, .5) + q.r(18, 356, 42, 80, c.b, 2.2, 12) + q.r(340, 356, 42, 80, c.b, 2.2, 12) + q.r(30, 452, 340, 26, c.b, 2.2, 8),
  /* the projector's beam from above, flickering, with dust in it */
  fx: (c, q, time, on) => ({ back: `<g${on("lc-flicker", "animation-duration:1.7s")}><path d="M186 8H214L372 250H28Z" fill="${c.paper}" opacity=".16"/></g>` + motes(c, on, [[150, 60, 1.5], [248, 74, 1.3], [120, 130, 1.6], [286, 150, 1.5], [96, 190, 1.3], [312, 210, 1.6]]) }),
  band: (c, y0) => floorBand(y0, c.fill, c.k, dots(y0, c.mark)),
});

/* ---------- 公車 ---------- */
const bus = makePlace({
  name: "末班車", grounds: { morning: "#d6cfae", golden: "#d9965a", night: "#34394a" }, crop: "30 30 340 340",
  tones: { a: "#5f7f9a", b: "#45627a", l: "#d9a441" }, floor: ["#5a5f66", "#80868e"],
  view(V, q, time, on) {
    const d = V.d;
    return q.f("M0 0H400V500H0Z", d[4]) + q.r(0, 0, 400, 58, d[3], 1.8) + q.r(20, 80, 360, 132, V.sky[1], 2.6, 18) + `<circle cx="${V.disc[1]}" cy="120" r="16" fill="${V.disc[0]}"/>`
      + q.f("M22 210V152h40v-22h40v30h50v-42h50v42h60v-26h50v36h64V210Z", d[2]) + (V.lit ? q.f(rep(8, i => `M${40 + i * 42} ${170 + (i % 3) * 8}h6v8h-6z`), V.warm) : "") + q.l("M200 80V212", 2.4)
      + q.l("M0 66H400", 4) + rep(6, i => `<g transform="translate(${40 + i * 64} 66)"><g${on("lc-sway", `animation-delay:${-i * .8}s;animation-duration:${3.2 + (i % 2) * .7}s`)}>${q.l("M0 0v22", 1.8)}${q.c(0, 30, 7, "none", 2)}</g></g>`)
      + q.r(0, 250, 400, 250, d[3], 0) + q.l("M0 250H400", 2) + q.r(0, 440, 400, 60, d[2], 1.6) + q.r(364, 226, 16, 16, V.lit ? V.warm : RED, 1.4, 3);
  },
  /* the back row: one long bench back across the bus, the judge in the middle seat */
  seat: (c, q) => q.r(-6, 232, 412, 240, c.a, 2.2, 22) + q.l("M48 244V452M352 244V452", 1.8, .6) + q.f(rep(9, i => `M${14 + i * 46} 262h18v6h-18z`), c.l, .8) + q.r(-6, 452, 412, 26, c.b, 2.2, 6),
  fx: (c, q, time, on) => ({ back: straps(q, on) }),
  band: (c, y0) => floorBand(y0, c.fill, c.k, ribs(y0, c.mark, 5)),
});

/* ---------- 美術館 ---------- */
const museum = makePlace({
  name: "美術館", fxOnView: true, grounds: { morning: "#dcd6c4", golden: "#dba074", night: "#3a3d4a" }, crop: "20 30 340 340", bandY: 484,
  tones: { a: "#b98656", b: "#916b46", l: "#d9b98a" }, floor: ["#b9a888", "#9c8a6a"],
  view(V, q, time, on) {
    const d = V.d;
    return q.f("M0 0H400V500H0Z", d[5]) + (V.lit ? q.f("M70 0L20 240H160Z", V.warm, V.glow * .5) + q.f("M316 0L250 200H380Z", V.warm, V.glow * .5) : "")
      + q.r(30, 72, 124, 156, V.paper, 3.2) + q.r(40, 82, 104, 136, d[4], 1.2) + q.r(62, 124, 60, 62, d[2], 1.6, 20) + `<circle cx="104" cy="118" r="10" fill="${V.warm === PAPER ? "#ebb229" : V.warm}" stroke="${V.line}" stroke-width="1.4"/>` + q.f("M76 150h10v3h-10zM98 150h10v3h-10z", V.line)
      + q.r(258, 92, 114, 92, V.paper, 3) + q.f("M264 178q20 -34 40 -14q18 -26 62 14Z", d[3]) + `<circle cx="338" cy="116" r="9" fill="${RED}"/>`
      + q.r(172, 40, 62, 46, V.paper, 2.6) + q.s("M178 58q8 -6 16 0t16 0t16 0M178 70q8 -6 16 0t16 0t16 0", d[2], 1.6)
      + q.r(76, 240, 32, 8, V.paper, 1) + q.r(298, 196, 32, 8, V.paper, 1) + q.r(0, 430, 400, 70, d[3], 1.8)
      + q.l("M20 430V372M380 430V372", 2.6) + q.c(20, 368, 5, d[1], 1.6) + q.c(380, 368, 5, d[1], 1.6) + q.s("M20 374Q200 424 380 374", RED, 2.4);
  },
  /* a gallery bench: a wooden slab under the lap, two legs */
  seat: (c, q) => q.r(60, 462, 22, 38, c.b, 2) + q.r(318, 462, 22, 38, c.b, 2) + q.r(26, 448, 348, 18, c.a, 2.2, 4),
  /* a hanging mobile that turns slowly */
  fx: (c, q, time, on) => ({ back: `<g transform="translate(152 8)"><g${on("lc-sway", "animation-duration:9s")}>${q.l("M0 0V16M-34 16H34M-34 16V28M34 16V24", 1.5)}${q.c(-34, 35, 7, RED, 1.6)}<g transform="translate(34 24)"><g${on("lc-sway", "animation-duration:5s;animation-delay:-2s")}>${q.l("M-16 0H16M-16 0V8M16 0V10", 1.4)}${q.p("M-22 8h12l-6 11z", WARM, 1.5)}${q.p("M16 10a6.500 6.500 0 1 0 6 9a5 5 0 1 1 -6 -9z", "#33517a", 1.5)}</g></g></g></g>` }),
  band: (c, y0) => floorBand(y0, c.fill, c.k, lines(y0, c.mark, 50, 1.2) + `<path d="M0 ${y0 + 8}H400" stroke="${c.mark}" stroke-width="1"/>`),
});

/* ---------- 下雨的屋頂 ---------- */
const rooftop = makePlace({
  name: "雨屋頂", fxOnView: true, grounds: { morning: "#c9cdbf", golden: "#cf9468", night: "#31364a" }, crop: "40 60 320 320", bandY: 482,
  tones: { a: "#c99a62", b: "#96704a", l: "#e8cfa0" }, floor: ["#8f97a0", "#b9c2c9"],
  view(V, q, time, on) {
    const d = V.d;
    return q.f("M0 300V222h30v-42h40v62h30v-92h50v72h40v-42h50v62h40v-82h50v52h70V300Z", d[2])
      + (V.lit ? q.f(rep(10, i => `M${14 + i * 38} ${236 + (i % 4) * 12}h7v9h-7z`), V.warm) : "")
      + q.r(310, 150, 52, 52, d[1], 1.8, 4) + q.l("M316 202V246M356 202V246M316 222H356", 2) + q.l("M120 150V96M106 110H134M112 124H128", 1.8)
      + q.r(0, 298, 400, 36, d[4], 1.8) + q.r(0, 332, 400, 170, d[3], 1.8) + q.e(110, 400, 40, 9, d[4], 1.2) + q.e(300, 430, 52, 10, d[4], 1.2)
      + q.r(0, 0, 400, 32, d[1], 1.8) + rep(21, i => q.c(i * 20, 32, 10, d[1], 1.6)) + q.l("M360 42V120", 1.6) + rep(4, i => q.c(360, 56 + i * 18, 4, d[2], 1.2))
      + (on("x") ? "" : q.s(rep(26, i => `M${(i * 53) % 400} ${50 + (i * 37) % 260}l-6 16`), V.paper, 1.5, .75));
  },
  /* a wooden crate under the eaves: boards below the lap */
  seat: (c, q) => q.r(74, 446, 252, 54, c.a, 2.2, 3) + q.l("M74 464H326M74 482H326", 1.6) + q.l("M120 446V500M280 446V500", 1.6),
  /* rain, behind the judge */
  fx: (c, q, time, on) => ({ back: `<g${on("lc-rain")}><path d="${rainD}" fill="none" stroke="${c.paper}" stroke-width="1.5" stroke-linecap="round" opacity=".6"/></g>` }),
  band: (c, y0, q) => floorBand(y0, c.fill, c.k, q.e(90, y0 + 10, 44, 5, c.mark, 0) + q.e(310, y0 + 12, 50, 5, c.mark, 0)),
});

/* ---------- 雪地纜車 ---------- */
const skilift = makePlace({
  name: "雪纜車", fxOnView: true, grounds: { morning: "#cfd9dc", golden: "#dba27a", night: "#2f394e" }, crop: "40 60 320 320",
  tones: { a: "#bf452d", b: "#96301f", l: "#c6d3dc" }, floor: ["#e9eef0", "#b9c8d2"],
  view(V, q, time, on) {
    const d = V.d, pine = (x, y, s) => q.p(`M${x} ${y - 30 * s}L${x + 10 * s} ${y}H${x - 10 * s}Z`, d[1], 1.2);
    return q.p("M-10 300L80 152L150 242L230 112L310 242L360 182L410 262V360H-10Z", d[5], 1.8) + q.f("M80 152L112 194L92 186L70 208L52 198Z", d[3]) + q.f("M230 112L272 178L246 166L222 196L198 164Z", d[3]) + q.f("M360 182L386 224L366 216L346 232Z", d[3])
      + mist(V, 150, 252, 170, 12) + q.p("M-10 342Q200 300 410 352V500H-10Z", V.paper, 1.8) + rep(7, i => pine(20 + i * 58, 372 + (i % 3) * 26, 1 + (i % 2) * .4))
      + q.l("M-10 60L410 132", 2.2) + q.l("M320 116V338M300 338H340M306 126H334", 2.6)
      + q.l("M110 80V104", 1.8) + q.r(92, 104, 38, 32, RED, 1.8, 6) + q.r(98, 110, 26, 12, V.sky[2], 1.2, 3)
      + (on("x") ? "" : `<g fill="${V.paper}">${rep(22, i => `<circle cx="${(i * 67) % 400}" cy="${40 + (i * 43) % 280}" r="${1.4 + (i % 3) * .5}"/>`)}</g>`);
  },
  /* the cabin: a red shell behind the judge with a window, no safety bar */
  seat: (c, q) => q.l("M200 96V132", 3) + q.p("M22 478V196Q22 132 86 132H314Q378 132 378 196V478Z", c.a, 2.4) + q.r(48, 158, 304, 96, c.l, 2.2, 16) + q.l("M200 158V254", 2) + q.r(14, 452, 372, 28, c.b, 2.2, 8),
  /* snow, behind the judge: two layers at two speeds */
  fx: (c, q, time, on) => ({ back: `<g${on("lc-snow")}><path d="${snowD}" fill="${c.paper}" opacity=".9"/></g><g transform="translate(13 40) scale(1.3)"><g${on("lc-snow", "animation-duration:14s")}><path d="${snowD}" fill="${c.paper}" opacity=".55"/></g></g>` }),
  band: (c, y0, q) => `<path d="M0 ${y0 + 6}${rep(8, () => "a25 9 0 0 1 50 0")}V500H0Z" fill="${c.fill}" stroke="${c.k}" stroke-width="1.6"/>` + q.s(`M30 ${y0 + 18}q10 -4 20 0M210 ${y0 + 20}q12 -4 24 0M330 ${y0 + 16}q10 -4 20 0`, c.mark, 1.6),
});

export const PLACES = { livingroom, nightmarket, train, beach, library, camping, cinema, bus, museum, rooftop, skilift };
