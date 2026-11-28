/* Claude's version of every piece of the train station (2026-11-28, the designer: a traditional Japanese station with a steam
   train; docs/art-generation.md: every piece in two versions, GPT's generated and Claude's drawn in code). Nothing
   here is in the game until the designer has picked on the board (tools/art/station.mjs); station.js uses these drawings
   for every piece that is not a picture.

   THE PROPS are each drawn in the same pixel frame as GPT's picture of it (FRAMES, measured off the pictures in
   tools/art/inbox/set-station/<id>/gpt-game.png), so the two versions share one box and one set of points: where
   the chimney's mouth is, the signal arm's pivot, the clock's middle, the post box's slot, the chime's hook. What
   moves inside a prop is drawn apart from the rest (the signal's arm, the clock's hands, the chime's paper strip),
   for both versions alike: of GPT's picture that part is cut out with a nested <svg> (which clips to its own box,
   no ids needed) and moved on its own.

   THE BACKGROUND is a tall picture of 400 x 711 like GPT's, in the kit's inks: the sky, hills and mist in the time
   of day's ramp (VIEW), wood and stone in their own colours moved to its light (tint); no sun or moon (the place
   draws its own), no train, no objects. */
import { pen, tint, mix, KEY, VIEW } from "./kit.js";

/* each prop's frame, in px of GPT's picture: [width, height] */
export const FRAMES = { signal: [289, 512], clock: [390, 512], postbox: [232, 512], chime: [172, 512] };
/* THE TRAIN, made again (2026-11-28). the designer first found the train a toy (「火車在左上方感覺很像玩具 不像是真的火車」),
   then, of the big train beside the judge, 「the demo doesn't quite fit it ... make sure the train is not being blocked
   by the capybara ... make sure the train fit into the background. the current demo looks pretty detatched」, and
   chose 甲 (the engine's front, chimney and front wheels beside the judge, its back cut by the screen's edge) and 乙
   (the engine on the left and a carriage on the right, standing at the platform behind the bench). The engine is a
   country tank engine, short enough for its chimney to show beside the judge and for a carriage to show on the
   other side: GPT's (tools/art/inbox/set-station/train-real-b, trimmed to 1000 px long) and Claude's below. GPT's
   mainline engine with its tender (train-real) is too long for either: its chimney falls off the screen in 甲 and it
   hides the carriage in 乙. Per version: the frame, the chimney's middle and top and its width, the front (the
   buffer beam's end), the back, the wheels' bottom, the cylinder's middle, and what lights up at night (the cab's
   windows and the headlamp, boxes in the frame). The place lines each up by its front and its wheels */
export const TRAINS = {
  gpt: { frame: [1000, 488], chimney: [810, 5], width: 69, front: 994, back: 8, wheels: 482, cylinder: [900, 360], lit: [[210, 112, 46, 57], [285, 112, 45, 57], [898, 42, 22, 44]] },
  claude: { frame: [1000, 420], chimney: [840, 10], width: 60, front: 992, back: 10, wheels: 414, cylinder: [885, 340], lit: [[186, 96, 52, 56], [254, 96, 52, 56], [889, 83, 22, 22]] },
};
/* THE CARRIAGE (乙): a passenger carriage behind the engine, GPT's and Claude's, with its wheels' bottom, its top, its
   two ends (the couplers) and its windows (they light up at night) */
export const CARRIAGES = {
  gpt: { frame: [1000, 339], wheels: 335, top: 22, front: 3, back: 995, windows: [[82, 109, 20, 40], [900, 109, 20, 40], ...[149, 210, 271, 332, 393, 454, 515, 576, 637, 698, 758, 819].map(x => [x, 114, 37, 43])] },
  claude: { frame: [1000, 300], wheels: 298, top: 18, front: 6, back: 994, windows: [[52, 80, 46, 50], [902, 80, 46, 50], ...Array.from({ length: 10 }, (_, i) => [150 + i * 70, 80, 50, 60])] },
};
/* the points inside the frames that the animation needs */
export const POINTS = {
  signal: { pivot: [103, 116], cut: 113, arm: [113, 90, 176, 50], foot: 496 },
  clock: { middle: [204, 320], cover: 91, hour: 66, minute: 86 },
  postbox: { slot: [116, 134], foot: 496 },
  chime: { hook: [86, 15], strip: 246 },
};
const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");
const q7 = pen(KEY);

/* ---------- the props ---------- */
const TRAIN = { body: "#2b2a30", dark: "#1d1c22", plate: "#35343b", rod: "#c9c6c0", rim: "#e9e3d6", red: "#bf452d", coal: "#3b3029" };
/* a country tank engine, side on, facing right, at real proportions, in the frame of TRAINS.claude (1000 x 420:
   wheels on y 414, chimney at x 840): a coal bunker and the cab at the back, water tanks along the boiler */
export function drawTrain(time) {
  const c = k => tint(TRAIN[k], time), W = 6, lit = time === "night" ? "#f4d566" : "#e9e1cc";
  const rivets = (x0, x1, y) => rep(Math.floor((x1 - x0) / 26), i => `<circle cx="${x0 + 13 + i * 26}" cy="${y}" r="3" fill="${c("plate")}" stroke="${KEY}" stroke-width="1.600"/>`);
  /* a wheel: black, a thin pale rim, spokes, a silver hub */
  const wheel = (x, r, cy) => `<g transform="translate(${x} ${cy})">${q7.c(0, 0, r, c("dark"), W)}<circle r="${r - 5}" fill="none" stroke="${c("rim")}" stroke-width="3.400"/>`
    + rep(12, i => q7.l(`M0 0L${((r - 9) * Math.cos(i * Math.PI / 6)).toFixed(1)} ${((r - 9) * Math.sin(i * Math.PI / 6)).toFixed(1)}`, 2.6)) + q7.c(0, 0, r * .22, c("rod"), 3.4) + `</g>`;
  const bunker = q7.p("M20 112H166V350H20Z", c("body"), W) + q7.p("M26 112Q54 78 96 84Q140 80 162 112Z", c("coal"), W) + rivets(20, 166, 140) + rivets(20, 166, 326);
  const cab = q7.r(150, 40, 200, 22, c("dark"), W, 6) + q7.p("M164 60H336V350H164Z", c("body"), W) + q7.r(186, 96, 52, 56, lit, W, 3) + q7.r(254, 96, 52, 56, lit, W, 3) + q7.l("M164 204H336", 3, .5) + rivets(164, 336, 222);
  const boiler = q7.p("M330 128H880Q900 128 900 148V250H330Z", c("body"), W) + q7.l("M420 128V250M540 128V250M660 128V250", 3, .45)
    + q7.p("M440 128Q440 92 472 92Q504 92 504 128Z", c("body"), W) + q7.p("M572 128Q572 84 610 84Q648 84 648 128Z", c("body"), W) + q7.l("M684 128V100M678 100H690", 4)
    + q7.p("M814 128L818 40H862L866 128Z", c("body"), W) + q7.r(804, 10, 72, 30, c("dark"), W, 8)
    + q7.r(880, 76, 40, 36, c("dark"), W, 8) + q7.c(900, 94, 11, lit, 4) + q7.e(912, 220, 26, 70, c("dark"), W) + q7.c(916, 220, 14, c("plate"), 4);
  const tank = q7.p("M330 170H770V336H330Z", c("plate"), W) + rivets(330, 770, 186) + rivets(330, 770, 320) + q7.l("M346 176H754", 2.6, .4) + q7.l("M330 146H880", 3.4);
  const frame = q7.r(14, 336, 950, 16, c("dark"), W, 3) + q7.r(950, 322, 42, 44, c("red"), W, 4) + q7.r(6, 326, 18, 36, c("dark"), W, 3) + q7.p("M842 346H934V396H842Z", c("body"), W)
    + wheel(110, 36, 378) + wheel(410, 62, 352) + wheel(540, 62, 352) + wheel(670, 62, 352) + wheel(884, 36, 378)
    + q7.r(404, 346, 272, 12, c("rod"), 4, 6) + q7.p("M886 360L540 356L542 364L888 368Z", c("rod"), 4);
  return bunker + cab + boiler + tank + frame;
}
const CAR = { body: "#5a2a24", dark: "#3e1c18", roof: "#7f8791", cream: "#e9dcc0", glass: "#a9bccb", wheel: "#1d1c22", rod: "#c9c6c0" };
/* a passenger carriage, side on, in the frame of CARRIAGES.claude (1000 x 300: wheels on y 298): a maroon body, a
   curved grey roof, ten windows, a door at each end, two bogies */
export function drawCarriage(time) {
  const c = k => tint(CAR[k], time), W = 6, C = CARRIAGES.claude;
  const wheel = x => `<g transform="translate(${x} 270)">${q7.c(0, 0, 28, c("wheel"), W)}<circle r="22" fill="none" stroke="${c("rod")}" stroke-width="3"/>${q7.c(0, 0, 7, c("rod"), 3)}</g>`;
  const bogie = x => q7.r(x - 70, 246, 140, 18, c("dark"), W, 4) + wheel(x - 40) + wheel(x + 40) + q7.l(`M${x - 12} 246V264M${x + 12} 246V264`, 3);
  return q7.p("M14 52Q14 18 60 16H940Q986 18 986 52Z", c("roof"), W) + rep(6, i => q7.r(200 + i * 120, 8, 30, 12, c("roof"), 4, 3))
    + q7.p("M20 50H980V236H20Z", c("body"), W) + q7.l("M20 160H980", 6) + `<path d="M20 160H980" stroke="${c("cream")}" stroke-width="3.400"/>`
    + C.windows.slice(2).map(([x, y, w, h]) => q7.r(x, y, w, h, c("glass"), W, 3) + q7.r(x, y, w, 10, c("cream"), 0)).join("")
    + q7.r(40, 62, 70, 174, c("dark"), W, 3) + q7.r(890, 62, 70, 174, c("dark"), W, 3) + q7.r(52, 80, 46, 50, c("glass"), 4, 3) + q7.r(902, 80, 46, 50, c("glass"), 4, 3)
    + q7.r(16, 236, 968, 14, c("dark"), W, 3) + bogie(220) + bogie(780) + q7.r(0, 210, 18, 18, c("dark"), 4, 3) + q7.r(982, 210, 18, 18, c("dark"), 4, 3);
}
/* the signal: everything but its arm, and the arm alone (it turns round the pivot) */
const SIG = { post: "#2c3550", plate: "#a9a39c", red: "#bf452d", white: "#f3ead6", lens: "#efe2be" };
export function drawSignal(time) {
  const c = k => tint(SIG[k], time), W = 7, lens = time === "night" ? "#f4d566" : c("lens");
  return q7.r(70, 468, 58, 28, c("post"), W, 6) + q7.r(86, 40, 26, 432, c("post"), W, 4) + q7.c(99, 30, 16, c("post"), W)
    + q7.r(80, 180, 38, 12, c("post"), W, 4) + q7.r(80, 380, 38, 12, c("post"), W, 4)
    + q7.l("M54 182V392M70 182V392", 6) + rep(6, i => q7.l(`M54 ${200 + i * 34}H70`, 5)) /* the ladder */
    + q7.r(78, 88, 40, 54, c("plate"), W, 8)
    + q7.c(48, 108, 30, c("plate"), W) + q7.c(48, 108, 19, lens, 5) + q7.r(38, 64, 20, 16, c("plate"), 6, 5);
}
export function drawSignalArm(time) {
  const c = k => tint(SIG[k], time);
  return q7.p("M104 98H254Q272 98 272 116Q272 134 254 134H104Z", c("red"), 7) + `<path d="M216 99.500H236V132.500H216Z" fill="${c("white")}"/>` + q7.l("M216 99V133M236 99V133", 4);
}
/* the bolt the arm turns on, drawn over it in both versions */
export const signalBolt = time => q7.c(103, 116, 13, tint(SIG.plate, time), 6) + q7.c(103, 116, 6, tint(SIG.white, time), 4);
/* the clock without its hands, and the hands (they spin round the middle) */
const CLOCK = { iron: "#3a3739", wood: "#9a5f37", face: "#f4e1bd" };
export function drawClock(time) {
  const c = k => tint(CLOCK[k], time), W = 8;
  return q7.r(16, 16, 46, 176, c("iron"), W, 10) + q7.r(40, 56, 284, 28, c("iron"), W, 12) + q7.c(322, 70, 18, c("iron"), W)
    + q7.s("M62 172Q72 92 160 82", KEY, 22) + q7.s("M62 172Q72 92 160 82", c("iron"), 10)
    + q7.c(204, 128, 22, "none", 10) + q7.r(196, 84, 16, 30, c("iron"), 6, 4) + q7.r(194, 146, 20, 26, c("iron"), 6, 4)
    + q7.c(204, 320, 168, c("wood"), W) + q7.c(204, 320, 136, c("face"), W)
    + rep(12, i => { const a = i * Math.PI / 6, s = Math.sin(a), k = Math.cos(a); return q7.l(`M${(204 + 100 * s).toFixed(1)} ${(320 - 100 * k).toFixed(1)}L${(204 + 120 * s).toFixed(1)} ${(320 - 120 * k).toFixed(1)}`, 9); });
}
/* the hands at 0 0 (the clock's middle), at ten past ten like GPT's: each in its own group, so each can turn */
const PIN = `<path d="M-600 -600H600V600H-600Z" fill="none"/>`;
export const clockHands = (cls = ["", ""]) => `<g${cls[0]}>${PIN}<g transform="rotate(-57)">${q7.l("M0 6V-66", 12)}</g></g><g${cls[1]}>${PIN}<g transform="rotate(58)">${q7.l("M0 8V-86", 9)}</g></g>${q7.c(0, 0, 13, KEY, 0)}`;
/* the cream that hides GPT's own hands (they are drawn again by code to turn) */
export const clockCover = () => `<circle cx="204" cy="320" r="${POINTS.clock.cover}" fill="${CLOCK.face}"/>`;
const POST = { red: "#c4402c", dk: "#8e2a1f", base: "#2c2a2e" };
export function drawPostbox(time) {
  const c = k => tint(POST[k], time), W = 8;
  return q7.r(36, 462, 160, 34, c("base"), W, 6)
    + q7.p("M44 124H188V454Q188 466 176 466H56Q44 466 44 454Z", c("red"), W) + q7.p("M150 130H180V460H150Z", c("dk"), 0, .35)
    + q7.l("M44 168H188M44 420H188", 6)
    + q7.p("M24 122Q24 34 116 34Q208 34 208 122Z", c("red"), W) + q7.p("M22 116H210V132H22Z", c("dk"), W) + q7.c(116, 30, 12, c("red"), W)
    + q7.r(74, 144, 84, 12, KEY, 0, 4) + q7.r(84, 236, 64, 70, mix(c("red"), "#ffffff", .2), 6, 6);
}
/* a letter, for the post box when it is pressed: an envelope with a red stamp, at 0 0 */
export const letter = () => q7.r(-16, -11, 32, 22, "#f6efe0", 2.6, 2) + q7.l("M-16 -11L0 2L16 -11", 2.2) + q7.r(6, -8, 7, 7, "#bf452d", 1.4);
/* the chime: the hook, the string and the glass bell, and the paper strip apart (it swings behind the bell) */
const CHIME = { glass: "#dbe7ee", wave: "#3f6f9c", red: "#bf452d", paper: "#f6efe0" };
export function drawChime(time) {
  const c = k => tint(CHIME[k], time), W = 7;
  return q7.l("M86 50V20Q86 12 94 14", 6) + q7.s("M86 50V100", c("red"), 6)
    + q7.p("M30 214Q22 110 86 100Q150 110 142 214Q86 226 30 214Z", c("glass"), W, .95)
    + q7.p("M34 170Q52 158 70 170Q88 182 106 170Q124 158 140 170L142 196Q86 210 30 196Z", c("wave"), 5)
    + q7.l("M60 124Q70 112 86 110", 5, .7) + q7.s("M86 216V246", c("red"), 5);
}
export function drawChimeStrip(time) {
  const c = k => tint(CHIME[k], time);
  return q7.s("M86 246V292", c("red"), 5) + q7.p("M78 254H94V270H78Z", "#e7f0f4", 5) + q7.p("M62 290H110V494H62Z", c("paper"), 7);
}

/* ---------- the backgrounds: three ideas, 400 x 711 ---------- */
const WOOD = { board: "#6b4a34", dark: "#4a3426", post: "#7d5638", stone: "#b9b4aa", stoneDk: "#8f8a80", gravel: "#a8a196", roof: "#7f8791", roofDk: "#5d6470", noren: "#33517a", leaf: ["#2f5a45", "#4b7d5c", "#79a574"], snow: "#eef2f4", snowDk: "#c9d6df", cedar: "#2f5546" };
const W8 = (k, time) => tint(WOOD[k], time);
/* the sky in the time of day's steps, far hills and mist: what shows above the platform and behind the judge */
function skyAndHills(V, q, time, hills = "M-10 330Q40 290 90 302Q140 262 200 286Q260 258 310 290Q356 270 410 300V420H-10Z") {
  const bands = V.sky.map((c, i) => `<rect y="${i * 80}" width="400" height="${i === 3 ? 480 : 80}" fill="${c}"/>`).join("");
  const stars = time === "night" ? [[24, 74], [62, 120], [92, 70], [306, 230], [352, 214], [384, 250], [40, 196]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#f2ecd6"/>`).join("") : "";
  const mist = (x, y, w, h) => `<g fill="${V.mist}" opacity="${V.mistO}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/><rect x="${x + w * .3}" y="${y + h * .6}" width="${w * .8}" height="${h}" rx="${h / 2}"/></g>`;
  return bands + stars + q.p(hills, V.d[3], 1.4, .95) + q.p("M-10 372Q70 340 150 356Q240 332 320 352Q370 342 410 356V440H-10Z", V.d[2], 1.4, .9) + mist(40, 360, 160, 14) + mist(220, 386, 150, 12);
}
/* across the tracks (2026-11-28, for the train made again): we sit on the near platform; one pair of rails runs right
   behind its edge; the wooden station building stands on the far side, its roof's eave just above a train's roof
   so it shows at the two sides; hills and sky above. The same heights as GPT's picture of the idea, measured on it
   (ACROSS), so a train stands on either the same way */
export const ACROSS = { roof: 258, eave: 336, wall: 446, rails: [470, 482], edge: 494, floor: 516 };
function backAcross(time) {
  const V = VIEW[time], q = pen(V.line), lit = time === "night", glow = lit ? V.warm : tint("#efe6d2", time), A = ACROSS;
  const wall = q.p(`M-10 ${A.eave}H410V${A.wall}H-10Z`, W8("board", time), 1.8) + q.l(rep(22, i => `M${i * 20 - 4} ${A.eave + 8}V${A.wall}`), 1.2, .4)
    + q.l(rep(5, i => `M${i * 96 + 12} ${A.eave}V${A.wall}`), 4) + q.r(4, 368, 34, 60, glow, 1.8) + q.l(`M21 368V428M4 398H38`, 1.4)
    + q.r(46, 360, 48, 86, lit ? mix(V.warm, "#3a2a20", .35) : W8("dark", time), 1.6) + q.p("M44 360H96V404Q83 396 70 404Q57 396 44 404Z", tint(WOOD.noren, time), 1.4);
  const roof = q.p(`M-14 ${A.roof + 12}Q200 ${A.roof} 414 ${A.roof + 12}V${A.eave - 10}H-14Z`, W8("roof", time), 1.8) + q.l(rep(22, i => `M${i * 20 - 8} ${A.roof + 14}V${A.eave - 12}`), 1.1, .5)
    + q.p(`M-14 ${A.eave - 12}H414V${A.eave}H-14Z`, W8("roofDk", time), 1.6);
  const far = q.r(-10, A.wall, 420, 18, W8("stone", time), 1.4) + q.l(rep(9, i => `M${i * 48 + 30} ${A.wall}V${A.wall + 18}`), 1, .5);
  const track = q.r(-10, A.wall + 18, 420, A.edge - A.wall - 18, W8("gravel", time), 1.2) + rep(15, i => q.r(i * 28 - 6, A.rails[0] + 4, 18, 9, W8("dark", time), 1, 2)) + q.l(`M-10 ${A.rails[0]}H410M-10 ${A.rails[1]}H410`, 3.2);
  return skyAndHills(V, q, time, "M-10 230Q40 180 90 192Q140 152 200 176Q260 148 310 180Q356 160 410 190V280H-10Z") + roof + wall + far + track
    + q.r(-10, A.edge, 420, A.floor - A.edge, tint("#e9dcc4", time), 1.6) + q.r(-10, A.floor, 420, 711 - A.floor, W8("stone", time), 1.6);
}
/* Claude's first three ideas (甲 木造站房, 乙 山間小站, 丙 雪國車站) were on the first board; the designer chose GPT's, then the
   train needed the station across the tracks. They are in git history (before 6d0f01d) */
export const BACKS = { across: backAcross };
export const TALL = [400, 711];
