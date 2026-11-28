/* The jungle (2026-11-23; the brief is in content.js, where it came from in docs/later.md). Birds sit in a tree and each sings a very short
   tune when pressed; monkeys in the trees can be pressed too; the capybara wears an acorn instead of the yuzu and
   holds a heart in its paw (`judge` below; print/judge.js draws them and scene.js passes them on).
   Since 2026-11-28 the heart is away for now, at the designer's word (HOLDS_HEART).
   Built with ./kit.js like the other places. Two things are its own:
   - the leaves are green. The far hills, the mist and the sky stay in the kit's one ink, so the picture still sits
     beside the others; a jungle printed all in indigo would not read as a jungle.
   - the birds and the monkeys are characters, so they keep their own colours at every time of day, like the cats.
   The title uses characters the lettering already has: 雨之森, "the rain's forest".
   What can be pressed is marked with data-tap only when the picture is animated: bird-1, bird-2, bird-3, monkey.
   Where they are: the birds and the monkeys stand only where Home shows the picture, in the places no button,
   title block or judge covers (tools/art/ui-zones.json; tests/home-zones.test.mjs checks each of them at every time
   of day on both measured phones). From 2026-11-27 they were all in the two strips beside the judge's head, five
   things in the left one; since 2026-11-28 (the designer: 「動物有點擁擠」) they move with the day and use the sides low
   beside the body and the ends of the log too (ARRANGE and LAYOUTS below).
   Which version of each piece (2026-11-27, the designer's picks on the piece-by-piece page, docs/art-generation.md): the
   scenery (since 2026-11-28 the waterfall), the sun, the three birds and the two monkeys are pictures (PICKED
   below, art/pictures.js); the branches,
   the fireflies and everything that moves them are drawn here. The first drawings are still in this file, and
   `jungleDrawn` is the place with none of the pictures: the art tools show it as "what was in the game before". */
import { makePlace, mist, floorBand, tint, mix, RED, VIEW, pen } from "./kit.js"; // mist: the first drawing's
import { PICTURES, picture } from "../../pictures.js";
import { framesImage } from "../../frames.js";

const PIC = PICTURES.jungle;
/* the capybara holds the heart in both paws (her idea, 2026-11-23); away for now, see `judge` below */
export const HOLDS_HEART = false;
/* the pieces that are pictures. Take a line out and that piece is drawn by code again */
export const PICKED = { background: true, sun: true, "bird-1": true, "bird-2": true, "bird-3": true, "monkey-sit": true, "monkey-hang": true };
/* the pictures that move in frames when animated (art/frames.js). the designer, 2026-11-28, on the finer-animation page: the
   red bird yes, the hanging monkey no (it sways as one piece, as before) */
export const FRAMED = { "bird-1": true };
/* the sitting monkey's tail, measured off monkey-sit.png (166 x 288): below row 216 there is only the tail; its
   middle line from the body to the tip, and half its width with the key line. The effects layer bends it there */
const SIT_TAIL = { cut: 216, half: 12, line: [[82, 214], [82, 230], [82, 244], [80, 256], [75, 265], [67, 270], [59, 269], [54, 264]] };

const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");
const YUZU = "#ebb229", INK = "#262122";
/* the leaf greens, darkest first, moved to the light of the time of day */
const greens = time => ["#2f5a45", "#4b7d5c", "#79a574", "#b1cb98"].map(c => tint(c, time));
const live = on => on("x") !== "";

/* one big leaf from its stem at 0 0, pointing right, with a midrib; s = size, rot = degrees */
const leaf = (q, x, y, rot, s, fill) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${q.p("M0 0Q10 -13 30 -9Q42 -4 46 0Q40 7 28 9Q10 12 0 0Z", fill, 1.4 / s)}${q.l("M2 0Q22 -3 42 0", 1 / s, .6)}</g>`;
/* a split leaf (the kind with holes), hanging from its stem */
const split = (q, x, y, rot, s, fill) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${q.p("M0 0Q-22 6 -26 30L-15 26L-17 44L-5 37L0 54L5 37L17 44L15 26L26 30Q22 6 0 0Z", fill, 1.5 / s)}${q.l("M0 2V44", 1 / s, .6)}</g>`;
/* a hanging vine with small leaves, swaying from its top */
const vine = (q, on, x, y, len, G, dur) => `<g transform="translate(${x} ${y})"><g${on("lc-sway", `animation-duration:${dur}s;animation-delay:${-(x % 5)}s`)}><path d="M-12 0h24" fill="none"/>${q.s(`M0 0Q4 ${len * .5} 0 ${len}`, G[0], 2.2)}${rep(Math.floor(len / 22), i => leaf(q, i % 2 ? 2 : -2, 14 + i * 22, i % 2 ? 24 : 156, .34, G[2]))}</g></g>`;

/* A bird at its feet (x y), facing dir. Pressed, it hops and two notes rise (lc-peep, lc-note in ART_CSS; the tune is
   the page's, audio/ambient.js). n = which bird: each has its own tune. */
function bird(q, on, { x, y, s = 1, dir = 1, body, wing, beak = YUZU, n, pic, frames }) {
  /* a picture already faces its way, so it is not turned over like the drawing: only its notes go the way it looks.
     It stands in a box on its feet (the box's bottom is where the drawing's legs end). A bird with frames
     (art/frames.js; the red one since 2026-11-28) blinks, looks up and sings in them, and pressed it crouches and
     beats its wings as it hops, in place of the whole picture bobbing and hopping */
  const framed = !!(pic && frames && live(on));
  const art = framed ? framesImage(pic, frames, `bird-${n}`, -21, -37, 42, 39.5, "xMidYMax meet")
    : pic ? picture(pic, -21, -37, 42, 39.5, "xMidYMax meet")
    : q.p("M-6 -7Q-21 -4 -26 7Q-14 6 -5 -1Z", wing, 1.3) + q.e(0, -9, 10.5, 8.6, body, 1.5) + q.c(7.5, -17.5, 6.6, body, 1.5)
    + q.p("M13 -19.6L20.5 -16.6L13 -14Z", beak, 1.2) + `<circle cx="9" cy="-19" r="1.35" fill="${INK}"/>`
    + q.p("M-7 -11Q0 -17 6.5 -9Q0 -2.500 -7 -11Z", wing, 1.2) + q.l("M-2.500 -1V2.500M3 -1V2.500", 1.3);
  const turn = pic ? 1 : dir, fwd = pic ? dir : 1, top = pic ? -12 : 0;
  const note = (nx, ny, d) => `<g transform="translate(${nx * fwd} ${ny + top}) scale(${pic ? 1 : dir} 1)"><g class="lc-note" style="--lc-x:${7 * fwd}px;animation-delay:${d}s"><ellipse cx="-2.600" cy="0" rx="3.200" ry="2.500" fill="${INK}"/><path d="M.400 0V-11Q4.500 -10 6 -5.500" fill="none" stroke="${INK}" stroke-width="1.500" stroke-linecap="round"/></g></g>`;
  const body2 = framed ? `<g${on("lc-hop-fr")}>${art}</g>` : `<g${on("lc-peep")}><g${on("lc-bob", `animation-delay:${-n * 1.3}s;animation-duration:${3.6 + n * .5}s`)}>${art}</g></g>`;
  const inner = `<circle cy="${pic ? -18 : -11}" r="${pic ? 21 : 17}" fill="${INK}" fill-opacity="0"/>${body2}${live(on) ? note(10, -32, 0) + note(20, -26, .14) : ""}`;
  return `<g transform="translate(${x} ${y}) scale(${turn * s} ${s})">${live(on) ? `<g data-tap="bird-${n}">${inner}</g>` : inner}</g>`;
}

const MONKEY = { fur: "#8a5f3c", dk: "#6d4a2e", face: "#e3c39a" };
/* a monkey's head at 0 0: ears, face mask, eyes, a small smile */
const monkeyHead = q => q.c(-10.500, -1, 4.200, MONKEY.face, 1.3) + q.c(10.500, -1, 4.200, MONKEY.face, 1.3) + q.c(0, 0, 10.500, MONKEY.fur, 1.5)
  + q.f("M-7 -2.500Q-7 -7 -3.500 -7Q0 -7 0 -4Q0 -7 3.500 -7Q7 -7 7 -2.500Q7 6.500 0 7.500Q-7 6.500 -7 -2.500Z", MONKEY.face)
  + `<circle cx="-3.200" cy="-2" r="1.300" fill="${INK}"/><circle cx="3.200" cy="-2" r="1.300" fill="${INK}"/>` + q.l("M-2.500 3Q0 5 2.500 3", 1.1);
/* a monkey hanging from a vine by one arm; x y = where the vine is tied. It sways, and swings when pressed */
function hanging(q, on, x, y, len, G, pic) {
  /* the picture brings its own vine, at the middle of its top: it hangs from the same knot */
  const m = pic ? picture(pic, -16.500, -3, 39, len + 61, "xMidYMin meet") : q.s(`M0 0V${len}`, G[0], 2.4)
    + q.s(`M9 ${len + 46}Q24 ${len + 50} 22 ${len + 34}Q21 ${len + 26} 15 ${len + 30}`, MONKEY.dk, 3.200)   // tail
    + q.s(`M3 ${len + 22}L1 ${len + 2}`, MONKEY.fur, 6) + q.c(0.500, len, 4, MONKEY.fur, 1.3)   // the arm up the vine
    + q.e(3, len + 34, 10.500, 13, MONKEY.fur, 1.5) + q.e(3, len + 37, 6, 8, MONKEY.face, 0)
    + q.s(`M-5 ${len + 30}Q-13 ${len + 36} -9 ${len + 44}`, MONKEY.fur, 5) + q.s(`M-2 ${len + 45}Q-8 ${len + 54} -2 ${len + 56}M8 ${len + 45}Q14 ${len + 54} 8 ${len + 56}`, MONKEY.fur, 5)
    + `<g transform="translate(4 ${len + 17})">${monkeyHead(q)}</g>`;
  const inner = `<circle cx="3" cy="${len + 30}" r="26" fill="${INK}" fill-opacity="0"/><g${on("lc-sway", "animation-duration:3.600s")}><path d="M-30 0h60" fill="none"/>${m}</g>`;
  return `<g transform="translate(${x} ${y})">${live(on) ? `<g data-tap="monkey">${inner}</g>` : inner}</g>`;
}
/* a monkey sitting on a branch, feet at x y, its tail hanging down behind the branch. Pressed, it jumps */
function sitting(q, on, x, y, pic) {
  /* in the picture the feet are about three quarters of the way down, the tail hangs below them. On Home the
     effects layer draws this picture itself, its tail swinging (SIT_TAIL below, ui/home-fx.js); lc-fx-sit puts the
     still one away while it does */
  const m = pic ? (live(on) ? `<g class="lc-fx-sit">${picture(pic, -17.500, -45.600, 35, 60)}</g>` : picture(pic, -17.500, -45.600, 35, 60)) : q.s("M-9 -4Q-20 4 -16 18Q-13 26 -7 21", MONKEY.dk, 3.200)
    + q.e(0, -13, 11.500, 13, MONKEY.fur, 1.5) + q.e(1, -10, 6.500, 8.500, MONKEY.face, 0)
    + q.s("M-8 -14Q-14 -6 -8 -1M9 -14Q15 -7 9 -2", MONKEY.fur, 5) + q.s("M-5 -1H-11M6 -1H12", MONKEY.dk, 4.600)
    + `<g transform="translate(1 -32)">${monkeyHead(q)}</g>`;
  const inner = `<circle cy="-18" r="25" fill="${INK}" fill-opacity="0"/><g${on("lc-peep")}>${m}</g>`;
  return `<g transform="translate(${x} ${y})">${live(on) ? `<g data-tap="monkey">${inner}</g>` : inner}</g>`;
}

/* The place's things one by one, back to front: `id`, the drawing, and for what can be replaced by another picture
   its `box` in the print's 400 x 500 ([x, y, width, height], measured off the drawing) and where it holds on to the
   picture (`hold`: "bottom" stands on its branch, "top" hangs from it). The art tools read this list to show each
   thing alone and to lay other versions in the same boxes (tools/art/set.mjs). */
/* WHERE THE ANIMALS ARE. the designer, 2026-11-28: 「叢林的背景動物有點擁擠」: three birds, the sun and the sitting monkey were all
   in the strip left of the judge's head, the hanging monkey alone on the right. An arrangement says where each
   one is, in the print's 400 x 500: a bird or the sitting monkey by its feet, the hanging monkey by the knot of its
   vine, the sun by its box; the branches they stand on (a path from the edge, its width, and a leaf at its tip:
   x y degrees size, which green); and the fireflies. Besides the strips beside the head, the free places on Home are
   beside the body, low down (the body narrows to x 75 at its waist), and the two ends of the log, which the judge's
   feet leave free; a long top covers the log's middle, so each end holds one (x 16 to 70 and 330 to 384; the log's
   top is y 447).
   A layout says which arrangement each time of day shows. The game shows LAYOUT. */
const ARRANGE = {
  /* as it was from 2026-11-27: everything in the left strip but the hanging monkey */
  first: {
    sun: [78, 154, 34, 34],
    branches: [["M16 104Q42 102 72 92", 6, [70, 93, -24, .42, 2]], ["M14 144Q66 138 108 122", 9.5, [104, 123, -30, .5, 2]], ["M22 224Q54 222 86 210", 9.5, [84, 211, -26, .5, 1]], ["M392 156Q364 154 334 147", 9.5, [336, 147, 196, .5, 2]]],
    birds: { "bird-1": [44, 135, 1, 1.1], "bird-2": [88, 124, -1, 1.1], "bird-3": [54, 93, 1, 1.05] },
    sit: [62, 212], hang: [344, 151],
    flies: [[28, 66], [100, 178], [26, 190], [374, 236], [310, 200]],
  },
  /* 甲 spread: one thing to a place, round both sides. Up on the left the sun and the red bird; under the title the
     hanging monkey; low beside the body the sitting monkey (left) and the yellow bird (right); the blue bird on the
     log's left end */
  spread: {
    sun: [66, 50, 36, 36],
    branches: [["M10 168Q48 166 92 154", 9.5, [90, 155, -28, .5, 2]], ["M392 156Q364 154 334 147", 9.5, [336, 147, 196, .5, 2]], ["M8 302Q34 302 62 294", 8, [60, 295, -24, .42, 1]], ["M394 330Q376 328 346 320", 8, [348, 320, 200, .42, 2]]],
    birds: { "bird-1": [52, 166, 1, 1.1], "bird-2": [366, 328, -1, 1.1], "bird-3": [40, 447, 1, 1.05] },
    sit: [38, 300], hang: [344, 151],
    flies: [[30, 110], [104, 210], [26, 380], [376, 240], [372, 410]],
  },
  /* 乙 birds low, monkeys high: a bird on each end of the log (a long top covers the log's middle, so each end holds
     one) and one on a low branch on the left; the hanging monkey up on the left under the sun, the sitting monkey on
     a branch under the title */
  log: {
    sun: [70, 46, 36, 36],
    branches: [["M10 112Q40 110 74 100", 9.5, [72, 101, -24, .46, 2]], ["M394 238Q366 236 330 228", 9.5, [332, 228, 200, .5, 2]], ["M8 322Q34 322 62 314", 8, [60, 315, -24, .42, 1]]],
    birds: { "bird-1": [40, 447, 1, 1.1], "bird-2": [38, 320, 1, 1.05], "bird-3": [358, 447, -1, 1.05] },
    sit: [356, 234], hang: [50, 108],
    flies: [[96, 120], [100, 250], [30, 390], [370, 160], [372, 380]],
  },
  /* the night of 丙: the three birds asleep side by side on one branch up on the left, under the moon; the monkeys
     low: one sitting on the log's right end, one hanging under the title */
  night: {
    sun: [66, 50, 36, 36],
    branches: [["M8 206Q60 204 112 192", 9.5, [110, 193, -26, .46, 2]], ["M392 156Q364 154 334 147", 9.5, [336, 147, 196, .5, 2]]],
    birds: { "bird-1": [30, 205, 1, .95], "bird-3": [62, 203, 1, .95], "bird-2": [94, 197, -1, .95] },
    sit: [356, 447], hang: [344, 151],
    flies: [[40, 130], [104, 260], [28, 340], [372, 260], [376, 380]],
  },
};
/* 甲, 乙 the same all day; 丙 moves with the day: the birds up singing in the morning, down low at golden hour,
   asleep together up on a branch at night while the monkeys come down */
export const LAYOUTS = { first: {}, spread: { all: "spread" }, log: { all: "log" }, day: { morning: "spread", golden: "log", night: "night" } };
/* the designer's pick (2026-11-28, on the page of tools/art/sets/jungle-new.json): 丙, the animals move with the day */
export const LAYOUT = "day";
const arrangementOf = (layout, time) => ARRANGE[(LAYOUTS[layout] || {})[time] || (LAYOUTS[layout] || {}).all || "first"];
/* a thing's box in the print, for the art tools: a bird stands in a box on its feet, the monkeys round their own */
const birdBox = ([x, y, , s]) => [Math.round(x - 22 * s), Math.round(y - 37.5 * s), Math.round(44 * s), Math.round(40 * s)];

function parts(V, q, time, on, picked = PICKED, layout = LAYOUT) {
  const G = greens(time), bark = tint("#8a6a48", time), pic = id => (picked[id] ? PIC[id] : null), A = arrangementOf(layout, time);
  /* the sun where Home shows it, in the left strip: a picture by day; the moon stays a plain disc. Without the
     picture the kit's own disc is in the sky and this part is empty */
  const [sx, sy, sw, sh] = A.sun, moon = `<circle cx="${sx + sw / 2}" cy="${sy + sh / 2}" r="${sw * .38}" fill="${V.disc[0]}"/>`;
  const disc = `<g${on("lc-sun")}>${pic("sun") && time !== "night" ? picture(PIC.sun, sx, sy, sw, sh) : time === "night" ? moon : `<circle cx="${sx + sw / 2}" cy="${sy + sh / 2}" r="${sw * .45}" fill="${V.disc[0]}"/>`}</g>`;
  /* pressed, it pops: the sun or moon is a thing of its own, the sky behind it is not (the designer, 2026-11-28) */
  const sun = !picked.background ? "" : live(on) ? `<g data-tap="window">${disc}</g>` : disc;
  const branch = (d, w = 9.500) => q.s(d, INK, w) + q.s(d, bark, w - (w > 7 ? 3 : 2.400));
  const BIRD = { "bird-1": { body: RED, wing: "#33517a", n: 1 }, "bird-2": { body: YUZU, wing: "#5d8a63", beak: RED, n: 2 }, "bird-3": { body: "#3f8fa6", wing: YUZU, n: 3 } };
  const birdPart = id => { const b = A.birds[id], [x, y, dir, s] = b; return { id, box: birdBox(b), hold: "bottom", svg: bird(q, on, { x, y, s, dir, ...BIRD[id], pic: pic(id), frames: pic(id) && FRAMED[id] ? PIC[`${id}-frames`] : null }) }; };
  const [mx, my] = A.sit, [hx, hy] = A.hang;
  return [
    { id: "sun", box: A.sun, hold: "middle", svg: sun },
    /* the branches the animals stand on and hang from, each from the edge of the picture */
    { id: "branches", svg: A.branches.map(([d, w, [lx, ly, rot, ls, g]]) => branch(d, w) + leaf(q, lx, ly, rot, ls, G[g])).join("") },
    ...["bird-1", "bird-2", "bird-3"].map(birdPart),
    { id: "monkey-sit", box: [mx - 22, my - 45, 40, 73], hold: "bottom", svg: sitting(q, on, mx, my, pic("monkey-sit")) },
    { id: "monkey-hang", box: [hx - 15, hy - 2, 41, 78], hold: "top", svg: hanging(q, on, hx, hy, 16, G, pic("monkey-hang")) },
    { id: "fireflies", svg: V.glow ? A.flies.map(([fx, fy]) => `<circle${on("lc-twinkle")} cx="${fx}" cy="${fy}" r="2.200" fill="${V.warm}" opacity="${time === "night" ? .95 : .5}"/>`).join("") : "" },
  ];
}
/* the pieces as they are in the game, or with `picked` given (an empty object: none) as they were drawn first, or in
   another layout */
export const jungleParts = (time = "morning", picked = PICKED, layout = LAYOUT) => parts(VIEW[time], pen(VIEW[time].line), time, () => "", picked, layout);

/* The scenery as a picture: one tall painting (400 x 711 in the print's units) of trunks, a roof of leaves, far hills
   and mist, with nothing in it where Home's buttons and the judge are. Home shows all of it (`tall`); the print
   shows its top 4:5. A time of day with a picture of its own (`back-golden`, `back-night` in art/pictures.js) shows
   that one; a time without one shows the morning picture moved to its light through a colour matrix. */
const TALL = [400, 711];
const LIGHT = { golden: ".86 .06 0 0 .12  .02 .76 0 0 .07  0 .04 .62 0 .03  0 0 0 1 0", night: ".30 .02 0 0 .02  .02 .36 .02 0 .05  .03 .06 .52 0 .11  0 0 0 1 0" };
const scenery = (time, x, y, w, h, fit) => (PIC[`back-${time}`] ? picture(PIC[`back-${time}`], x, y, w, h, fit) : sceneryLit(time, x, y, w, h, fit));
const sceneryLit = (time, x, y, w, h, fit) => (LIGHT[time] ? `<filter id="lc-jungle-${time}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${LIGHT[time]}"/></filter>` : "")
  + `<g${LIGHT[time] ? ` filter="url(#lc-jungle-${time})"` : ""}>${picture(PIC.back, x, y, w, h, fit)}</g>`;
/* what moves in front of the painting: leaves that come down the two strips beside the judge's head, one at a
   time, from under the roof of leaves. Only when the picture is animated: a still shows none in mid air */
const LEAF = "M0 0Q5 -7 15 -5Q21 -2 23 0Q20 4 14 5Q5 6 0 0Z";
function airOf(V, q, time, on, [w, h]) {
  if (!live(on)) return "";
  const G = greens(time);
  return [[40, 0, 17], [84, 7, 21], [330, 11, 19], [372, 3, 23]].map(([x, d, dur], i) => `<g transform="translate(${x * w / 400} ${70 * h / 711})"><g${on("lc-leaf", `animation-delay:${-d}s;animation-duration:${dur}s`)}>${q.p(LEAF, G[2 + (i % 2)], 1.1)}</g></g>`).join("");
}
/* THE WATERFALL (2026-11-28, the designer: "Can you make the waterfall animation? When the waterfall is clicked. Now the
   monkey moves when the waterfall is clicked"). The water is part of the picture (back*.jpg, GPT's waterfall);
   what moves is drawn here over it, measured off the picture in its own 400 x 711 (the print shows its top 500 in
   the same units): the water from x 338 to 390, its lip near y 200, its foot near y 556, under the log on Home.
   Pale streaks run down the water and the foam at its foot breathes, all the time. A tap on the water is the
   waterfall's own (data-tap="waterfall"), so the picture behind no longer swings the hanging monkey: the streaks
   rush, a wash of white runs down the water, drops splash out of its side and spray swells at its foot (ART_CSS),
   and it sounds (audio/ambient.js). Since the same day the picture behind answers no tap at all. Only while
   the picture is animated; a postcard shows the picture alone. */
const FALLS = { top: 206, foot: 556, xs: [348, 355, 362, 369, 376, 383] };
const paleOf = time => (time === "night" ? "#d6e3ef" : time === "golden" ? "#fff4d6" : "#f6fafc");
function fallsOf(time, on) {
  if (!live(on)) return "";
  const pale = paleOf(time);
  const streaks = FALLS.xs.map((x, i) => `<g${on("lc-fall", `animation-delay:${-(i * .37 + (i % 2) * .6).toFixed(2)}s;animation-duration:${(1.5 + (i % 3) * .25).toFixed(2)}s`)}><path d="M${x} ${FALLS.top}v${26 + (i % 3) * 10}" fill="none" stroke="${pale}" stroke-width="2.400" stroke-linecap="round"/></g>`).join("");
  const foam = [[328, 557, 9, 5], [345, 561, 11, 6], [361, 556, 8, 5]].map(([x, y, rx, ry], i) => `<g${on("lc-foam", `animation-delay:${-i * .5}s`)}><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f7f9f8" opacity=".850"/></g>`).join("");
  /* pressed: a wash of white rushes down the water; drops splash out of its left side, where the water shows on
     every phone (on the designer's the log hides the foot of the fall); and at the foot, where it shows, a puff of spray */
  const surge = `<g class="lc-surge"><rect x="341" y="196" width="48" height="64" rx="20" fill="#ffffff" opacity=".600"/></g>`;
  const drops = [[340, 300, -18, -16], [339, 336, -26, -10], [338, 372, -14, -20], [338, 410, -24, -14], [338, 446, -16, -18], [339, 478, -28, -8], [341, 266, -12, -12]].map(([x, y, dx, dy], i) => `<g class="lc-drop" style="--lc-x:${dx}px;--lc-y:${dy}px;animation-delay:${(.08 + i * .07).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="3.400" fill="${pale}" stroke="${INK}" stroke-width=".900"/></g>`).join("");
  const spray = `<g class="lc-spray"><ellipse cx="346" cy="552" rx="22" ry="9" fill="#ffffff" opacity=".700"/></g>`;
  /* what can be pressed: the water, down to the foam */
  const hit = `<path d="M338 204Q362 190 392 192V562H318Q332 552 336 540Z" fill="${INK}" fill-opacity="0"/>`;
  return `<g data-tap="waterfall">${hit}${streaks}${foam}${surge}${spray}${drops}</g>`;
}

/* WHAT THE EFFECTS LAYER MOVES on Home (art/fx.js, ui/home-fx.js). the designer, 2026-11-28, on the finer-animation page
   (tools/art/motion.mjs): spray and drops at the foot of the waterfall all the time and a splash when it is pressed,
   leaves that sway and turn over as they come down the strips beside the head, and the sitting monkey's tail
   swinging like a rope, lagging behind when it hops. While it runs, the picture's own drops, spray and leaves and
   the still monkey are put away (ART_CSS, lc-fx-on and lc-fx-tail). The waterfall and the leaves in the tall
   picture's units, the monkey's box in the print's */
function motionOf(time, picked, layout) {
  const [mx, my] = arrangementOf(layout, time).sit;
  return {
    tall: TALL,
    falls: { left: 340, right: 390, top: FALLS.top, foot: 552, pale: paleOf(time) },
    leaves: { strips: [[18, 100], [300, 384]], from: 70, to: 560, greens: greens(time) },
    tail: picked["monkey-sit"] ? { href: PIC["monkey-sit"].href, box: [mx - 17.5, my - 45.6, 35, 60], ...SIT_TAIL } : null,
  };
}

const build = (picked = PICKED, layout = LAYOUT) => makePlace({
  name: "雨之森", grounds: { morning: "#cfd8a6", golden: "#dc9a62", night: "#2c3a40" }, crop: "0 60 330 330", stampCrop: "0 60 300 355", bandY: 480,
  tones: { a: "#8a6a48", b: "#6b4f34", l: "#7fa06a" }, floor: ["#6f9160", "#4b7250"], ownColours: true,
  /* what the judge has here instead of the yuzu, and what it holds (scene.js hands these to the judge). The heart is
     away for now (the designer, 2026-11-28: "把愛心先拿走"; the arms hang at its sides as at the hot spring): HOLDS_HEART
     brings it back, and everything that draws and sounds it is still in print/judge.js and audio/ambient.js */
  judge: HOLDS_HEART ? { item: "acorn", hold: "heart" } : { item: "acorn" },
  view(V, q, time, on) {
    if (picked.background) return scenery(time, 0, 0, 400, 500, "xMidYMin slice") + fallsOf(time, on) + airOf(V, q, time, on, [400, 500]);
    const d = V.d, G = greens(time), bark = tint("#8a6a48", time), barkDk = tint("#6b4f34", time);
    const hills = "M-10 300Q30 250 78 262Q112 214 160 240Q204 196 250 236Q292 208 330 244Q372 226 410 262V360H-10Z";
    /* the roof of leaves along the top, in two rows, scalloped underneath */
    const roof = (y, r, fill, w) => q.p(`M-10 -10H410V${y}${rep(Math.ceil(420 / r), i => `a${r / 2} ${r * .42} 0 0 1 ${-r} 0`)}Z`, fill, w);
    const trunk = (x, w, lean) => q.p(`M${x} -10Q${x + lean} 240 ${x - w * .5} 510H${x + w * 1.5}Q${x + w + lean} 240 ${x + w} -10Z`, bark, 1.8) + q.s(`M${x + w * .5} 60q4 60 0 120M${x + w * .55} 250q4 50 -1 110`, barkDk, 1.4, .7);
    return q.p(hills, d[3], 1.4, .9) + mist(V, 60, 286, 200, 13) + q.p("M-10 352Q100 318 200 336Q300 318 410 350V500H-10Z", G[1], 1.6) + mist(V, 180, 330, 170, 12)
      + q.p("M-10 438Q200 424 410 438V500H-10Z", G[2], 1.6)
      + trunk(-14, 34, 8) + trunk(378, 30, -8)
      + roof(34, 46, G[0], 1.6) + roof(16, 38, G[1], 1.4)
      + split(q, 60, 34, 12, .8, G[2]) + split(q, 300, 30, -14, .72, G[2]) + split(q, 196, 20, 4, .56, G[1])
      + vine(q, on, 128, 30, 34, G, 5.5) + vine(q, on, 268, 32, 26, G, 4.6) + vine(q, on, 20, 36, 60, G, 6.2)
      /* big leaves at the foot of the trees, in front of the roots */
      + leaf(q, 4, 436, -52, 1.25, G[1]) + leaf(q, 10, 446, -18, 1.1, G[2]) + leaf(q, 396, 440, -128, 1.25, G[1]) + leaf(q, 392, 448, -162, 1.1, G[2]);
  },
  /* the animals, each with the branch it sits on or hangs from, and the fireflies: not scenery, so they are their
     own layer and can stand in front of another background (kit.js, spec.things) */
  things: (V, q, time, on) => parts(V, q, time, on, picked, layout).map(p => p.svg).join(""),
  /* the whole painting for Home, which fills the phone with it (ui/home-art.js) */
  tall: picked.background ? (V, q, time, on) => ({ box: `0 0 ${TALL[0]} ${TALL[1]}`, inner: scenery(time, 0, 0, TALL[0], TALL[1], "xMidYMid slice") + fallsOf(time, on) + airOf(V, q, time, on, TALL) }) : null,
  /* what the effects layer moves on Home (motionOf above) */
  motion: picked.background ? time => motionOf(time, picked, layout) : null,
  /* a mossy log behind the judge's feet: bark, a ring at one end, moss along the top */
  seat: (c, q) => q.r(16, 446, 368, 28, c.a, 2.2, 13) + q.e(372, 460, 9, 12.500, mix(c.a, "#ffffff", .25), 1.6) + q.e(372, 460, 4, 6, "none", 1.1)
    + q.p("M40 447Q70 438 104 446Q150 438 188 447Q240 440 292 447Q320 441 348 447V452H40Z", c.l, 1.5) + q.s("M60 462h36M150 466h50M250 461h40", c.b, 1.4, .7),
  /* in the plain scene (the singing screen) the place is only in the round window, so a few vines hang into the picture */
  fx: (c, q, time, on) => { const G = greens(time); return { back: vine(q, on, 150, -4, 52, G, 5.2) + vine(q, on, 232, -4, 34, G, 4.4) + vine(q, on, 290, -4, 66, G, 6) }; },
  band: (c, y0, q) => floorBand(y0, c.fill, c.k, q.s(rep(14, i => `M${i * 30 + 8} ${y0 + 15}q-7 -9 -11 -3M${i * 30 + 8} ${y0 + 15}q0 -11 3 -12M${i * 30 + 8} ${y0 + 15}q7 -9 12 -4`), c.mark, 1.5)),
});
export const jungle = build();
/* the jungle as it was drawn before any picture was chosen */
export const jungleDrawn = build({});
/* the jungle in another of the LAYOUTS, for the art tools to show (tools/art/set.mjs) */
export const jungleIn = layout => build(PICKED, layout);
