/* The cat in the woodblock style (docs/art-style.md). Same exports and signatures as ../cat.js, so the garment,
   loaf and lane code can switch to it by changing one import. Every shape gets the key line; the body is a
   key-lined tube whose edge turns into round tufts as the fur grows (short, mid, long). */
import { pillOther } from "./pill.js";
import { f, num } from "../util.js";
import { coatMarkup, foldSpots, straight } from "../cat.js";
import { kindParts } from "../palettes.js";

export { coatMarkup, foldSpots, straight };
export const KEY = "#262122";
/* the three coats. eye = the almond eye colour; ink = the line inside a face */
export const COATS = {
  grey:   { fur: "#a2a8aa", furDk: "#7b8386", stripe: "#51585c", belly: "#eeeadd", ink: KEY, nose: "#a7605a", inner: "#cfa9a4", eye: "#e2d88c" },
  ginger: { fur: "#d99650", furDk: "#bd7a38", stripe: "#96592a", belly: "#f3e6cb", ink: KEY, nose: "#a7605a", inner: "#d9a48f", eye: "#e9d98a" },
  cream:  { fur: "#ecdcb6", furDk: "#d4be90", stripe: "#b2975f", belly: "#f8f1df", ink: KEY, nose: "#a7605a", inner: "#dcb8a4", eye: "#d9dc8e" },
};
const C = COATS.ginger;
/* the line weight inside a cat's head space (head is about 40 wide); garments draw the head at ~.9.
   2.8 since 2026-11-28: GPT's cats, picked by the designer, have a heavier line (2.4 before) */
export const LWC = 2.8;
const key = (w) => `stroke="${KEY}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`;
const ln = (d, w) => `<path d="${d}" fill="none" ${key(w)}/>`;
const both = m => `<g>${m}</g><g transform="scale(-1 1)">${m}</g>`;
/* animated ears: `anim` is a number of seconds that puts this cat out of step with the others */
const bothAnim = (m, anim) => `<g class="lc-ear" style="animation-delay:${f(-anim)}s">${m}</g><g transform="scale(-1 1)"><g class="lc-ear" style="animation-delay:${f(-anim - 3.4)}s;animation-duration:9s">${m}</g></g>`;

/* ears of the seven shapes, in head space (`kind` may carry a charm, "fold+bow": only the shape matters here) */
export function catEars(kindIn, pal, anim = null) {
  const kind = kindParts(kindIn).shape;
  const pair = m => (anim == null ? both(m) : bothAnim(m, anim));
  const one = (outer, inner, extra = "") => pair(`<path d="${outer}" fill="${pal.fur}" ${key(LWC)}/>${inner ? `<path d="${inner}" fill="${pal.inner}"/>` : ""}${extra}`);
  if (kind === "big") return one("M-18.5 -5L-25 -31Q-24.5 -34.5 -20.5 -33L-3.5 -15Z", "M-18 -11L-21.6 -27.6L-9.6 -16Z");
  if (kind === "small") return one("M-18 -7Q-21.5 -21 -14 -22.5Q-8.5 -22 -5 -15Z", "");
  /* folded: a low ear whose tip is bent forward and down, with the crease drawn */
  if (kind === "fold") return one("M-19 -6.5Q-22 -17.5 -15.5 -19.5Q-9 -20 -4.5 -15Z", "", `<path d="M-20.4 -13.2Q-15.6 -20.4 -7.6 -17.2Q-11 -10.6 -17.6 -9.4Z" fill="${pal.fur}" ${key(LWC * .8)}/>`);
  /* curled: a tall ear that arcs back and out at the tip */
  if (kind === "curl") return one("M-18 -6Q-18.5 -20 -22.5 -26.5Q-24.5 -31 -19.5 -30Q-10.5 -26.5 -3.5 -15.2Z", "M-16 -11.5Q-16.2 -20 -19 -25.6Q-12.6 -22.6 -8.4 -15.6Z");
  /* round: a small round ear, set wide */
  if (kind === "round") return one("M-20.2 -8.6A8.2 8.2 0 1 1 -6.4 -15.8Z", "M-17.2 -12.6A4.6 4.6 0 1 1 -10.4 -16.4Z");
  const tuft = kind === "tuft" ? ln("M-16.6 -26l-2 -4.2M-15.4 -27.2l.1 -4.8M-14.2 -26.8l2.3 -3.6", LWC * .7) : "";
  /* pointed: taller since GPT's cats (2026-11-28) */
  return one("M-19 -6L-18.4 -29Q-17.7 -32.2 -14.5 -29.6L-3 -15Z", "M-16.4 -11.4L-16 -25.4L-8 -15.4Z", tuft);
}

/* eyes and mouth by mood: normal (awake), listen, sing, smug, squint, wide, sleep. almond eyes with a slit.
   mouth (optional) replaces the mood's mouth with the shape of a sung sound: "mm" closed, "oo" small and round,
   "ee" wide, "ah" open, "ay" half open (the lane cat shows which sound the drill is sung on) */
const SUNG = {
  mm: (my, lw) => ln(`M-4.4 ${f(my + 1.6)}h8.8`, lw * .95),
  oo: (my, lw) => `<ellipse cx="0" cy="${f(my + 2.2)}" rx="2.3" ry="2.8" fill="#7a3b33" ${key(lw * .45)}/>`,
  ee: (my, lw) => `<path d="M-5.4 ${f(my + .4)}h10.8q0 3.4 -5.4 3.4q-5.4 0 -5.4 -3.4z" fill="#7a3b33" ${key(lw * .45)}/><path d="M-3.6 ${f(my + 1.3)}h7.2" stroke="#f8f2e2" stroke-width="1.1" stroke-linecap="round"/>`,
  ah: (my, lw) => `<ellipse cx="0" cy="${f(my + 3.2)}" rx="3.9" ry="4.9" fill="#7a3b33" ${key(lw * .45)}/><ellipse cx="0" cy="${f(my + 5.6)}" rx="2" ry="1.5" fill="#c9675c"/>`,
  ay: (my, lw) => `<path d="M-4.6 ${f(my + .4)}h9.2q0 5.4 -4.6 5.4q-4.6 0 -4.6 -5.4z" fill="#7a3b33" ${key(lw * .45)}/>`,
};
export function catFace(mood, pal, dy = 0, sung = null) {
  const y = -2 + dy, lw = LWC;
  /* the almond eye, a little larger since GPT's cats (2026-11-28) */
  const almond = x => `<path d="M${f(x - 4.8)} ${f(y)}Q${x} ${f(y - 5.2)} ${f(x + 4.8)} ${f(y)}Q${x} ${f(y + 4.3)} ${f(x - 4.8)} ${f(y)}Z" fill="${pal.eye || "#e9d98a"}" ${key(lw * .5)}/><path d="M${x} ${f(y - 3.3)}V${f(y + 2.5)}" ${key(lw * .68)}/>`;
  const eye = x => mood === "smug" || mood === "listen" ? ln(`M${f(x - 3.6)} ${f(y + .6)}q3.6 -4.4 7.2 0`, lw * .8)
    : mood === "sleep" ? ln(`M${f(x - 3.6)} ${f(y - 1.4)}q3.6 3.6 7.2 0`, lw * .8)
      : mood === "squint" ? ln(`M${f(x - 4)} ${f(y)}h8`, lw * .9)
        : mood === "wide" ? `<circle cx="${x}" cy="${f(y)}" r="4.6" fill="#f8f2e2" ${key(lw * .55)}/><circle cx="${x}" cy="${f(y)}" r="2" fill="${KEY}"/>`
          : almond(x);
  const my = 7 + dy;
  const mouth = SUNG[sung] ? SUNG[sung](my, lw) : mood === "wide" || mood === "sing" ? `<ellipse cx="0" cy="${f(my + 2.4)}" rx="${mood === "sing" ? 3 : 2.4}" ry="${mood === "sing" ? 3.8 : 3}" fill="#7a3b33" ${key(lw * .45)}/>`
    : mood === "squint" ? ln(`M-3.4 ${f(my + 1)}h6.8`, lw * .6)
      : ln(`M-3.6 ${f(my)}q1.8 2.2 3.6 0q1.8 2.2 3.6 0`, lw * .6);
  return `${eye(-8.4)}${eye(8.4)}<path d="M-2 ${f(3.6 + dy)}h4l-2 2.4z" fill="${pal.nose}" stroke="${pal.nose}" stroke-width=".9" stroke-linejoin="round"/>${mouth}`;
}
/* the head: rounder, with fuller cheeks below the eyes, as GPT drew the cats the designer picked (2026-11-28) */
const HEAD = "M-21 0C-21.5 -12 -12.5 -17.5 0 -17.5C12.5 -17.5 21.5 -12 21 0C22.5 6 19 13 11 15.5C7.5 16.6 3.8 17 0 17C-3.8 17 -7.5 16.6 -11 15.5C-19 13 -22.5 6 -21 0Z";
/* A charm: one small thing worn by the ear on the cat's own right (drawn at the left of the head space), flat and
   key-lined like everything else. It sits beside the ear, not on the crown, so the judge's fruit can still rest on
   a hat cat's head. Colours are the print's own red, green, indigo and ochre, the same on every coat. */
const CH = { red: "#bf452d", green: "#5d8a63", indigo: "#33517a", gold: "#ebb229", pink: "#f0c4bd", paper: "#f8f2e2" };
const leafShape = (rot, c = CH.green) => `<path transform="rotate(${rot})" d="M0 0Q4.4 -4.6 10 -.6Q5 4 0 0Z" fill="${c}" ${key(LWC * .5)}/>`;
const CHARM = {
  camellia: () => leafShape(-150) + leafShape(-40) + `<circle r="5.2" fill="${CH.red}" ${key(LWC * .6)}/><path d="M-3.6 -1.4q3.6 -3 7.2 0M-2.6 2.4q2.6 2 5.2 0" fill="none" ${key(LWC * .34)} opacity=".6"/><circle r="1.9" fill="${CH.gold}" ${key(LWC * .34)}/>`,
  plum: () => [0, 72, 144, 216, 288].map(a => `<circle transform="rotate(${a})" cy="-3.5" r="2.7" fill="${CH.pink}" ${key(LWC * .45)}/>`).join("") + `<circle r="1.7" fill="${CH.red}"/>`,
  leaf: () => `<path transform="rotate(-28)" d="M-8 1Q-2 -8 9 -3Q3 7 -8 1Z" fill="${CH.green}" ${key(LWC * .6)}/><path transform="rotate(-28)" d="M-6.4 .8Q0 -1.6 7 -2.6" fill="none" ${key(LWC * .36)}/>`,
  bow: () => `<path d="M0 0L-7.4 -4.6Q-9.4 0 -7.4 4.6ZM0 0L7.4 -4.6Q9.4 0 7.4 4.6Z" fill="${CH.indigo}" ${key(LWC * .6)}/><rect x="-2.1" y="-2.3" width="4.2" height="4.6" rx="1.2" fill="${CH.indigo}" ${key(LWC * .6)}/>`,
  bell: () => `<path d="M-5 -5.4Q0 -8.6 5 -5.4" fill="none" stroke="${CH.red}" stroke-width="2.2" stroke-linecap="round"/><circle cy=".8" r="4.8" fill="${CH.gold}" ${key(LWC * .6)}/><path d="M-4.2 .2h8.4M0 1.2v3" fill="none" ${key(LWC * .42)}/>`,
  /* the jungle's three (2026-11-23): a red flower with a long yellow middle, a parrot's feather, a small banana */
  hibiscus: () => [0, 72, 144, 216, 288].map(a => `<path transform="rotate(${a})" d="M0 0Q-4.200 -4 0 -7.400Q4.200 -4 0 0Z" fill="${CH.red}" ${key(LWC * .45)}/>`).join("") + `<path d="M0 0L4.600 -5.200" fill="none" stroke="${CH.gold}" stroke-width="1.800" stroke-linecap="round"/><circle cx="4.900" cy="-5.600" r="1.300" fill="${CH.gold}" ${key(LWC * .3)}/>`,
  feather: () => `<path transform="rotate(-36)" d="M-8.500 0Q-2 -5.400 9 -1.200Q2 5 -8.500 0Z" fill="${CH.indigo}" ${key(LWC * .6)}/><path transform="rotate(-36)" d="M1 -3.300Q5.500 -3.600 9 -1.200Q5 2 1.600 2.700Z" fill="${CH.gold}"/><path transform="rotate(-36)" d="M-8.500 0Q-2 -5.400 9 -1.200Q2 5 -8.500 0ZM-10.500 .400L6 -.900" fill="none" ${key(LWC * .4)}/>`,
  banana: () => `<path transform="rotate(-20)" d="M-8 -3.600Q0 4.200 9 -3.400Q10 -1 8.400 1.400Q0 9 -9 -.800Z" fill="${CH.gold}" ${key(LWC * .6)}/><path transform="rotate(-20)" d="M9 -3.400l1.400 -2.200" fill="none" ${key(LWC * .6)}/>`,
  berry: () => leafShape(-160) + leafShape(-110) + [[-1.6, 1.8], [3.4, -.6], [1.8, 4.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.7" fill="${CH.red}" ${key(LWC * .45)}/>`).join(""),
};
/* the charm in head space; nothing for a kind without one */
export const charmMarkup = kind => { const c = kindParts(kind).charm; return c && CHARM[c] ? `<g transform="translate(-13.6 -14.4)">${CHARM[c]()}</g>` : ""; };
/* the cat's head at (x, y), facing dir (1 = right), scale sc */
/* anim (optional, seconds): the ears twitch and the open eyes blink, out of step by that much. Leave it out for the
   lane cat, which is redrawn every frame. mouth (optional): the shape of a sung sound, see catFace */
export function catHead(x, y, dir, mood, sc = 1, pal = C, kind = "point", anim = null, mouth = null, rich = false) {
  const s = f(dir * sc * 100) / 100 || .01, t = f(sc * 100) / 100 || .01;
  const marks = `<path d="M-5 -16.2v5.6M0 -17.4v7M5 -16.2v5.6" stroke="${pal.stripe}" stroke-width="2.6" stroke-linecap="round"/>`;
  const whisk = `<path d="M-13.5 4l-11 -1.8M-13.5 7l-10.4 1.8M13.5 4l11 -1.8M13.5 7l10.4 1.8" ${key(LWC * .38)} opacity=".75"/>`;
  /* animated and awake: the face blinks, and a second, happy face waits for a pat (shown while lc-tapped) */
  const blinks = anim != null && (mood === "normal" || mood === "wide");
  /* rich (the finer cat, asked for with `catMotion.face`): the face glances aside (lc-look), blinks on a longer, uneven
     beat (lc-blink2), and a yawning face waits for its moment (lc-awake gives way to lc-face-yawn, the head tipping up
     with lc-yawn-tilt). The CSS that moves them is the trial page's until the designer picks (tools/art/cats-motion.mjs) */
  if (rich && anim != null && mood !== "sleep") {
    const d = k => f(-anim * k);
    const open = blinks ? `<g class="lc-blink2" style="animation-delay:${d(1.7)}s">${catFace(mood, pal, 0, mouth)}</g>` : catFace(mood, pal, 0, mouth);
    const face = `<g class="lc-face"><g class="lc-awake" style="animation-delay:${d(2.3)}s"><g class="lc-look" style="animation-delay:${d(1.3)}s">${open}</g></g><g class="lc-face-yawn" style="animation-delay:${d(2.3)}s">${catFace("squint", pal, 0, "ah")}</g></g><g class="lc-face-pet">${catFace("smug", pal)}</g>`;
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${s} ${t})"><g class="lc-yawn-tilt" style="transform-origin:0px 15px;animation-delay:${d(2.3)}s">${catEars(kind, pal, anim)}<path d="${HEAD}" fill="${pal.fur}"/><ellipse cy="8.4" rx="10.6" ry="7" fill="${pal.belly}"/>${marks}<path d="${HEAD}" fill="none" ${key(LWC)}/>${whisk}${face}${charmMarkup(kind)}</g></g>`;
  }
  const face0 = blinks ? `<g class="lc-blink" style="animation-delay:${f(-anim * 1.7)}s">${catFace(mood, pal, 0, mouth)}</g>` : catFace(mood, pal, 0, mouth);
  const face = anim != null && mood !== "sleep" ? `<g class="lc-face">${face0}</g><g class="lc-face-pet">${catFace("smug", pal)}</g>` : face0;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s} ${t})">${catEars(kind, pal, anim)}<path d="${HEAD}" fill="${pal.fur}"/><ellipse cy="8.4" rx="10.6" ry="7" fill="${pal.belly}"/>${marks}<path d="${HEAD}" fill="none" ${key(LWC)}/>${whisk}${face}${charmMarkup(kind)}</g>`;
}

/* a key-lined tube: the line under, the fur over */
const pipe = (d, c, w, lw = LWC * .9) => `<path d="${d}" fill="none" stroke="${KEY}" stroke-width="${f(w + 2 * lw)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const blob = (cx, cy, r, c, lw = LWC * .9) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${c}" ${key(lw)}/>`;

/* tails start at (x, y) and grow away from dir (the way the cat faces). w = the tail's base thickness */
export function catTail(kindIn, x, y, dir, w = 8, pal = C) {
  const kind = kindParts(kindIn).shape;
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  const d = `M${P(0, 0)} Q${P(-14, -1)} ${P(-15, -13)} Q${P(-16, -22)} ${P(-8, -24)}`;
  if (kind === "big") return pipe(`M${P(0, 0)} Q${P(-17, 0)} ${P(-17, -15)} Q${P(-17, -28)} ${P(-8, -29)}`, pal.fur, w * .68);
  if (kind === "tuft") return pipe(d, pal.fur, w * 1.35) + blob(x - 8 * dir, y - 25, w * 1.1, pal.fur) + `<path d="M${P(-13, -27)} q${f(4 * dir)} -5 ${f(9 * dir)} -1" stroke="${pal.stripe}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if (kind === "small") return blob(x - 4 * dir, y - 5, w * .9, pal.fur);
  /* folded: short and thick, held low */
  if (kind === "fold") return pipe(`M${P(0, 0)} Q${P(-12, -1)} ${P(-13, -12)}`, pal.fur, w * 1.15);
  /* curled: a plume that rolls over at the tip */
  if (kind === "curl") return pipe(`M${P(0, 0)} Q${P(-16, 0)} ${P(-16, -14)} Q${P(-16, -25)} ${P(-7, -23)} Q${P(-1.5, -21)} ${P(-5.5, -15.5)}`, pal.fur, w * .8);
  /* round: long and thin with two rings near the tip */
  if (kind === "round") return pipe(d, pal.fur, w * .85) + `<path d="M${P(-15.6, -15.5)}h${f(4.6 * dir)}M${P(-13.4, -21.6)}l${f(3.6 * dir)} 2.6" stroke="${pal.stripe}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return pipe(d, pal.fur, w * 1.05);
}
/* THE TAIL IN THREE PIECES (the finer cat, asked for with `catMotion.tail`; trial 2026-11-28). The same tail as
   catTail, cut along its length into pieces that each turn at their joint, the next one inside the last, a little
   later and a little further, so it swings like a whip and not like a stick. It is drawn twice, the key line first
   and the fur over it, both with the same turning groups, so no line shows at a joint. phase: seconds that put this
   cat out of step with the others. The CSS that turns them is the trial page's until the designer picks: each piece carries
   its turn (--lc-a, degrees), the way the cat faces (--lc-d), how much later than the last piece it turns (--lc-lag)
   and this cat's phase (--lc-ph), so a swish on a pat can keep the lag and drop the phase. */
const TAIL_PATHS = {
  point: [[[-14, -1], [-15, -13]], [[-16, -22], [-8, -24]]],
  big: [[[-17, 0], [-17, -15]], [[-17, -28], [-8, -29]]],
  fold: [[[-12, -1], [-13, -12]]],
  curl: [[[-16, 0], [-16, -14]], [[-16, -25], [-7, -23]], [[-1.5, -21], [-5.5, -15.5]]],
};
const TAIL_W = { point: 1.05, tuft: 1.35, round: .85, big: .68, fold: 1.15, curl: .8 };
export function catTailChain(kindIn, x, y, dir, w = 8, pal = C, phase = 0) {
  const kind = kindParts(kindIn).shape;
  if (kind === "small") return `<g class="lc-tseg" style="transform-origin:${f(x)}px ${f(y)}px;--lc-a:9;--lc-d:${dir};--lc-ph:${f(phase)}s">${catTail(kindIn, x, y, dir, w, pal)}</g>`;
  const segs = TAIL_PATHS[kind] || TAIL_PATHS.point, sw = w * (TAIL_W[kind] || 1.05), lw = LWC * .9;
  /* points along the tail, 12 to each curve, in the drawing's own units */
  const pts = [[0, 0]];
  let a = [0, 0];
  for (const [c, b] of segs) { for (let i = 1; i <= 12; i++) { const t = i / 12, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } a = b; }
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = len[len.length - 1], cuts = kind === "fold" ? [0, .5, 1] : [0, .38, .7, 1];
  const at = q => len.findIndex(v => v >= q * L);
  const pieces = cuts.slice(0, -1).map((q, k) => pts.slice(at(q), at(cuts[k + 1]) + 1));
  const P = ([dx, dy]) => `${f(x + dx * dir)} ${f(y + dy)}`;
  const d = piece => piece.map((p, i) => `${i ? "L" : "M"}${P(p)}`).join("");
  /* what is drawn at the tip: the tuft's brush, the rings of the round tail (in the piece they sit on) */
  const last = pieces.length - 1;
  const extra = k => {
    let m = "";
    if (kind === "tuft" && k === last) m += blob(x - 8 * dir, y - 25, w * 1.1, pal.fur) + `<path d="M${P([-13, -27])} q${f(4 * dir)} -5 ${f(9 * dir)} -1" stroke="${pal.stripe}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    if (kind === "round" && k === last) m += `<path d="M${P([-15.6, -15.5])}h${f(4.6 * dir)}M${P([-13.4, -21.6])}l${f(3.6 * dir)} 2.6" stroke="${pal.stripe}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return m;
  };
  const AMP = [5, 7, 10];
  const nest = fur => {
    let inner = "";
    for (let k = last; k >= 0; k--) {
      const [jx, jy] = pieces[k][0], stroke = fur ? `stroke="${pal.fur}" stroke-width="${f(sw)}"` : `stroke="${KEY}" stroke-width="${f(sw + 2 * lw)}"`;
      inner = `<g class="lc-tseg" style="transform-origin:${f(x + jx * dir)}px ${f(y + jy)}px;--lc-a:${AMP[k]};--lc-d:${dir};--lc-lag:${f(k * .22)}s;--lc-ph:${f(phase)}s"><path d="${d(pieces[k])}" fill="none" ${stroke} stroke-linecap="round" stroke-linejoin="round"/>${fur ? extra(k) : ""}${inner}</g>`;
    }
    return inner;
  };
  return nest(false) + nest(true);
}

/* the tail tucked along the body (asleep) */
export function catTailTucked(kindIn, x, y, dir, w = 8, pal = C) {
  const kind = kindParts(kindIn).shape;
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  if (kind === "small") return blob(x - 2 * dir, y + 4, w * .85, pal.fur);
  const sw = kind === "tuft" ? w * 1.3 : kind === "big" ? w * .55 : kind === "fold" ? w * 1.15 : kind === "round" ? w * .72 : kind === "curl" ? w * .8 : w * .9;
  return pipe(`M${P(0, 0)} Q${P(-8, 10)} ${P(8, 10)} T${P(26, 7)}`, pal.fur, sw);
}

/* a pair of little paws tucked under the body at (x, y) */
export const pawPair = (x, y, dir, sc = 1, pal = C) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(dir * sc * 100) / 100 || .01} ${f(sc * 100) / 100 || .01})"><ellipse cx="-6" cy="0" rx="6.2" ry="4" fill="${pal.fur}" ${key(LWC * .85 / sc)}/><ellipse cx="7" cy="1" rx="6.2" ry="4" fill="${pal.fur}" ${key(LWC * .85 / sc)}/><path d="M-6 -1.5v3M7 -.5v3" ${key(LWC * .4 / sc)}/></g>`;

/* the body along polylines. Short fur is a smooth key-lined tube; longer fur (p.fluff > 0, tuftR above .5) turns the edge
   into round tufts, each with the key line, so the outline goes scalloped. A pale belly line runs along the lower side.
   o.lw sets the key line (default .9 of the cat's line); o.outline is accepted for compatibility (the key line is always there) */
export function bodyMarkup(subs, w = 22, pal = C, o = {}) {
  const polys = subs.filter(s => s && s.length > 1);
  if (!polys.length) return "";
  const lw = num(o.lw, LWC * .9);
  const d = polys.map(s => s.map((p, i) => `${i ? "L" : "M"}${f(p.x)} ${f(p.y)}`).join("")).join("");
  const tr = o.tuftR || .5;
  let under = "", over = "", k = 0;
  if (tr > .51 || polys.some(s => s.some(p => num(p.fluff) > 0))) {
    for (const s of polys) {
      let acc = w, last = s[0];
      for (let i = 0; i < s.length; i++) {
        const p = s[i];
        acc += i ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
        last = p;
        if (acc < w * .42 && i !== s.length - 1) continue;
        acc = 0;
        const r = w * (k % 2 ? tr + .06 : tr) + num(p.fluff);
        under += `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(r + lw)}"/>`;
        over += `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(r)}"/>`;
        k++;
      }
    }
  }
  const belly = o.belly === false ? "" : `<path d="${d}" transform="translate(0 ${f(w * .27)})" stroke="${pal.belly}" stroke-width="${f(w * .26)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<g fill="${KEY}">${under}</g><path d="${d}" stroke="${KEY}" stroke-width="${f(w + 2 * lw)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g fill="${pal.fur}">${over}</g><path d="${d}" stroke="${pal.fur}" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${belly}`;
}

/* what an off note leaves (the designer, 2026-11-14: a pill, not a fold): a little ball of fluff with a loose loop of yarn,
   sitting on the body's middle line. Never a hole. The name stays foldMarkup so every caller keeps working.
   q = { x, y } on the body's middle line; sc scales it */
export function foldMarkup(q, w, pal = C, sc = 1) {
  const x = num(q.x), y = num(q.y), r = Math.min(6.2, w * .27) * sc;
  /* (another way of showing it, on trial: ./pill.js) */
  const other = pillOther(x, y, r, pal.furDk, sc);
  if (other != null) return other;
  return `<g class="lc-pill"><path d="M${f(x + r * .3)} ${f(y - r * .6)}q${f(r * 1.6)} ${f(-r * 2.4)} ${f(r * 2.3)} ${f(-r * .5)}q${f(r * .3)} ${f(r * 1.5)} ${f(-r * 1.2)} ${f(r)}" fill="none" ${key(LWC * .62 * sc)}/>`
    + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${pal.furDk}" ${key(LWC * .7 * sc)}/><path d="M${f(x - r * .5)} ${f(y - r * .1)}q${f(r * .5)} ${f(-r * .55)} ${f(r)} 0" fill="none" ${key(LWC * .4 * sc)}/></g>`;
}

/* three small hearts that rise from (x y) when the thing they belong to is patted; hidden otherwise (ART_CSS) */
export const petHearts = (x, y, s = 1) => [[-9, 0, -8, 0], [2, -7, 5, .12], [12, 1, 10, .24]].map(([dx, dy, drift, d]) => `<g transform="translate(${f(x + dx * s)} ${f(y + dy * s)}) scale(${s})"><g class="lc-heart" style="--lc-x:${drift}px;animation-delay:${d}s"><path d="M0 4.500C-8 -2 -4.500 -8.500 0 -4C4.500 -8.500 8 -2 0 4.500Z" fill="#bf452d" ${key(1.1)}/></g></g>`).join("");
