/* The jungle (2026-11-23; the brief is in content.js, where it came from in docs/later.md). Birds sit in a tree and each sings a very short
   tune when pressed; monkeys in the trees can be pressed too; the capybara wears an acorn instead of the yuzu and
   holds a heart in its paw (`judge` below; print/judge.js draws them and scene.js passes them on).
   Built with ./kit.js like the other places. Two things are its own:
   - the leaves are green. The far hills, the mist and the sky stay in the kit's one ink, so the picture still sits
     beside the others; a jungle printed all in indigo would not read as a jungle.
   - the birds and the monkeys are characters, so they keep their own colours at every time of day, like the cats.
   The title uses characters the lettering already has: 雨之森, "the rain's forest".
   What can be pressed is marked with data-tap only when the picture is animated: bird-1, bird-2, bird-3, monkey. */
import { makePlace, mist, floorBand, tint, mix, RED } from "./kit.js";

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
function bird(q, on, { x, y, s = 1, dir = 1, body, wing, beak = YUZU, n }) {
  const art = q.p("M-6 -7Q-21 -4 -26 7Q-14 6 -5 -1Z", wing, 1.3) + q.e(0, -9, 10.5, 8.6, body, 1.5) + q.c(7.5, -17.5, 6.6, body, 1.5)
    + q.p("M13 -19.6L20.5 -16.6L13 -14Z", beak, 1.2) + `<circle cx="9" cy="-19" r="1.35" fill="${INK}"/>`
    + q.p("M-7 -11Q0 -17 6.5 -9Q0 -2.500 -7 -11Z", wing, 1.2) + q.l("M-2.500 -1V2.500M3 -1V2.500", 1.3);
  const note = (nx, ny, d) => `<g transform="translate(${nx} ${ny}) scale(${dir} 1)"><g class="lc-note" style="--lc-x:${nx > 0 ? 7 : -7}px;animation-delay:${d}s"><ellipse cx="-2.600" cy="0" rx="3.200" ry="2.500" fill="${INK}"/><path d="M.400 0V-11Q4.500 -10 6 -5.500" fill="none" stroke="${INK}" stroke-width="1.500" stroke-linecap="round"/></g></g>`;
  const inner = `<circle cy="-11" r="17" fill="${INK}" fill-opacity="0"/><g${on("lc-peep")}><g${on("lc-bob", `animation-delay:${-n * 1.3}s;animation-duration:${3.6 + n * .5}s`)}>${art}</g></g>${live(on) ? note(10, -32, 0) + note(20, -26, .14) : ""}`;
  return `<g transform="translate(${x} ${y}) scale(${dir * s} ${s})">${live(on) ? `<g data-tap="bird-${n}">${inner}</g>` : inner}</g>`;
}

const MONKEY = { fur: "#8a5f3c", dk: "#6d4a2e", face: "#e3c39a" };
/* a monkey's head at 0 0: ears, face mask, eyes, a small smile */
const monkeyHead = q => q.c(-10.500, -1, 4.200, MONKEY.face, 1.3) + q.c(10.500, -1, 4.200, MONKEY.face, 1.3) + q.c(0, 0, 10.500, MONKEY.fur, 1.5)
  + q.f("M-7 -2.500Q-7 -7 -3.500 -7Q0 -7 0 -4Q0 -7 3.500 -7Q7 -7 7 -2.500Q7 6.500 0 7.500Q-7 6.500 -7 -2.500Z", MONKEY.face)
  + `<circle cx="-3.200" cy="-2" r="1.300" fill="${INK}"/><circle cx="3.200" cy="-2" r="1.300" fill="${INK}"/>` + q.l("M-2.500 3Q0 5 2.500 3", 1.1);
/* a monkey hanging from a vine by one arm; x y = where the vine is tied. It sways, and swings when pressed */
function hanging(q, on, x, y, len, G) {
  const m = q.s(`M0 0V${len}`, G[0], 2.4)
    + q.s(`M9 ${len + 46}Q24 ${len + 50} 22 ${len + 34}Q21 ${len + 26} 15 ${len + 30}`, MONKEY.dk, 3.200)   // tail
    + q.s(`M3 ${len + 22}L1 ${len + 2}`, MONKEY.fur, 6) + q.c(0.500, len, 4, MONKEY.fur, 1.3)   // the arm up the vine
    + q.e(3, len + 34, 10.500, 13, MONKEY.fur, 1.5) + q.e(3, len + 37, 6, 8, MONKEY.face, 0)
    + q.s(`M-5 ${len + 30}Q-13 ${len + 36} -9 ${len + 44}`, MONKEY.fur, 5) + q.s(`M-2 ${len + 45}Q-8 ${len + 54} -2 ${len + 56}M8 ${len + 45}Q14 ${len + 54} 8 ${len + 56}`, MONKEY.fur, 5)
    + `<g transform="translate(4 ${len + 17})">${monkeyHead(q)}</g>`;
  const inner = `<circle cx="3" cy="${len + 30}" r="26" fill="${INK}" fill-opacity="0"/><g${on("lc-sway", "animation-duration:3.600s")}><path d="M-30 0h60" fill="none"/>${m}</g>`;
  return `<g transform="translate(${x} ${y})">${live(on) ? `<g data-tap="monkey">${inner}</g>` : inner}</g>`;
}
/* a monkey sitting on a branch, feet at x y, its tail hanging down behind the branch. Pressed, it jumps */
function sitting(q, on, x, y) {
  const m = q.s("M-9 -4Q-20 4 -16 18Q-13 26 -7 21", MONKEY.dk, 3.200)
    + q.e(0, -13, 11.500, 13, MONKEY.fur, 1.5) + q.e(1, -10, 6.500, 8.500, MONKEY.face, 0)
    + q.s("M-8 -14Q-14 -6 -8 -1M9 -14Q15 -7 9 -2", MONKEY.fur, 5) + q.s("M-5 -1H-11M6 -1H12", MONKEY.dk, 4.600)
    + `<g transform="translate(1 -32)">${monkeyHead(q)}</g>`;
  const inner = `<circle cy="-18" r="25" fill="${INK}" fill-opacity="0"/><g${on("lc-peep")}>${m}</g>`;
  return `<g transform="translate(${x} ${y})">${live(on) ? `<g data-tap="monkey">${inner}</g>` : inner}</g>`;
}

export const jungle = makePlace({
  name: "雨之森", grounds: { morning: "#cfd8a6", golden: "#dc9a62", night: "#2c3a40" }, crop: "0 60 330 330", stampCrop: "0 60 300 355", bandY: 480,
  tones: { a: "#8a6a48", b: "#6b4f34", l: "#7fa06a" }, floor: ["#6f9160", "#4b7250"], ownColours: true,
  /* what the judge has here instead of the yuzu, and what it holds (scene.js hands these to the judge) */
  judge: { item: "acorn", hold: "heart" },
  view(V, q, time, on) {
    const d = V.d, G = greens(time), bark = tint("#8a6a48", time), barkDk = tint("#6b4f34", time);
    const hills = "M-10 300Q30 250 78 262Q112 214 160 240Q204 196 250 236Q292 208 330 244Q372 226 410 262V360H-10Z";
    /* the roof of leaves along the top, in two rows, scalloped underneath */
    const roof = (y, r, fill, w) => q.p(`M-10 -10H410V${y}${rep(Math.ceil(420 / r), i => `a${r / 2} ${r * .42} 0 0 1 ${-r} 0`)}Z`, fill, w);
    const trunk = (x, w, lean) => q.p(`M${x} -10Q${x + lean} 240 ${x - w * .5} 510H${x + w * 1.5}Q${x + w + lean} 240 ${x + w} -10Z`, bark, 1.8) + q.s(`M${x + w * .5} 60q4 60 0 120M${x + w * .55} 250q4 50 -1 110`, barkDk, 1.4, .7);
    return q.p(hills, d[3], 1.4, .9) + mist(V, 60, 286, 200, 13) + q.p("M-10 352Q100 318 200 336Q300 318 410 350V500H-10Z", G[1], 1.6) + mist(V, 180, 330, 170, 12)
      + q.p("M-10 438Q200 424 410 438V500H-10Z", G[2], 1.6)
      + trunk(-14, 34, 8) + trunk(378, 30, -8)
      /* the birds' branch, from the left tree */
      + q.s("M14 144Q66 138 112 120", INK, 9.500) + q.s("M14 144Q66 138 112 120", bark, 6.500) + leaf(q, 108, 121, -30, .62, G[2]) + leaf(q, 100, 125, 26, .5, G[1])
      /* the sitting monkey's branch, from the right tree, under the hanging one */
      + q.s("M392 282Q362 280 334 270", INK, 9.500) + q.s("M392 282Q362 280 334 270", bark, 6.500) + leaf(q, 336, 270, 200, .5, G[2])
      + roof(34, 46, G[0], 1.6) + roof(16, 38, G[1], 1.4)
      + split(q, 60, 34, 12, .8, G[2]) + split(q, 300, 30, -14, .72, G[2]) + split(q, 196, 20, 4, .56, G[1])
      + vine(q, on, 128, 30, 34, G, 5.5) + vine(q, on, 268, 32, 26, G, 4.6) + vine(q, on, 20, 36, 60, G, 6.2)
      + q.s("M150 26Q158 40 172 44", INK, 6) + q.s("M150 26Q158 40 172 44", bark, 3.600)
      + bird(q, on, { x: 50, y: 135, s: 1.15, dir: 1, body: RED, wing: "#33517a", n: 1 })
      + bird(q, on, { x: 88, y: 126, s: 1.15, dir: -1, body: YUZU, wing: "#5d8a63", beak: RED, n: 2 })
      + bird(q, on, { x: 166, y: 41, s: 1.05, dir: -1, body: "#3f8fa6", wing: YUZU, n: 3 })
      + sitting(q, on, 354, 275) + hanging(q, on, 356, 34, 112, G)
      /* big leaves at the foot of the trees, in front of the roots */
      + leaf(q, 4, 436, -52, 1.25, G[1]) + leaf(q, 10, 446, -18, 1.1, G[2]) + leaf(q, 396, 440, -128, 1.25, G[1]) + leaf(q, 392, 448, -162, 1.1, G[2])
      + (V.glow ? rep(5, i => `<circle${on("lc-twinkle")} cx="${[58, 112, 300, 338, 246][i]}" cy="${[300, 180, 300, 392, 96][i]}" r="2.200" fill="${V.warm}" opacity="${time === "night" ? .95 : .5}"/>`) : "");
  },
  /* a mossy log behind the judge's feet: bark, a ring at one end, moss along the top */
  seat: (c, q) => q.r(16, 446, 368, 28, c.a, 2.2, 13) + q.e(372, 460, 9, 12.500, mix(c.a, "#ffffff", .25), 1.6) + q.e(372, 460, 4, 6, "none", 1.1)
    + q.p("M40 447Q70 438 104 446Q150 438 188 447Q240 440 292 447Q320 441 348 447V452H40Z", c.l, 1.5) + q.s("M60 462h36M150 466h50M250 461h40", c.b, 1.4, .7),
  /* in the plain scene (the singing screen) the place is only in the round window, so a few vines hang into the picture */
  fx: (c, q, time, on) => { const G = greens(time); return { back: vine(q, on, 150, -4, 52, G, 5.2) + vine(q, on, 232, -4, 34, G, 4.4) + vine(q, on, 290, -4, 66, G, 6) }; },
  band: (c, y0, q) => floorBand(y0, c.fill, c.k, q.s(rep(14, i => `M${i * 30 + 8} ${y0 + 15}q-7 -9 -11 -3M${i * 30 + 8} ${y0 + 15}q0 -11 3 -12M${i * 30 + 8} ${y0 + 15}q7 -9 12 -4`), c.mark, 1.5)),
});
