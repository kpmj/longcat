/* The cat in the woodblock style (docs/art-style.md). Same exports and signatures as ../cat.js, so the garment,
   loaf and lane code can switch to it by changing one import. Every shape gets the key line; the body is a
   key-lined tube whose edge turns into round tufts as the fur grows (short, mid, long). */
import { f, num } from "../util.js";
import { coatMarkup, foldSpots, straight } from "../cat.js";

export { coatMarkup, foldSpots, straight };
export const KEY = "#262122";
/* the three coats. eye = the almond eye colour; ink = the line inside a face */
export const COATS = {
  grey:   { fur: "#a2a8aa", furDk: "#7b8386", stripe: "#51585c", belly: "#eeeadd", ink: KEY, nose: "#a7605a", inner: "#cfa9a4", eye: "#e2d88c" },
  ginger: { fur: "#d99650", furDk: "#bd7a38", stripe: "#96592a", belly: "#f3e6cb", ink: KEY, nose: "#a7605a", inner: "#d9a48f", eye: "#e9d98a" },
  cream:  { fur: "#ecdcb6", furDk: "#d4be90", stripe: "#b2975f", belly: "#f8f1df", ink: KEY, nose: "#a7605a", inner: "#dcb8a4", eye: "#d9dc8e" },
};
const C = COATS.ginger;
/* the line weight inside a cat's head space (head is about 40 wide); garments draw the head at ~.9 */
export const LWC = 2.4;
const key = (w) => `stroke="${KEY}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`;
const ln = (d, w) => `<path d="${d}" fill="none" ${key(w)}/>`;
const both = m => `<g>${m}</g><g transform="scale(-1 1)">${m}</g>`;
/* animated ears: `anim` is a number of seconds that puts this cat out of step with the others */
const bothAnim = (m, anim) => `<g class="lc-ear" style="animation-delay:${f(-anim)}s">${m}</g><g transform="scale(-1 1)"><g class="lc-ear" style="animation-delay:${f(-anim - 3.4)}s;animation-duration:9s">${m}</g></g>`;

/* ears of the four kinds, in head space */
export function catEars(kind, pal, anim = null) {
  const pair = m => (anim == null ? both(m) : bothAnim(m, anim));
  const one = (outer, inner, extra = "") => pair(`<path d="${outer}" fill="${pal.fur}" ${key(LWC)}/>${inner ? `<path d="${inner}" fill="${pal.inner}"/>` : ""}${extra}`);
  if (kind === "big") return one("M-18.5 -5L-25 -31Q-24.5 -34.5 -20.5 -33L-3.5 -15Z", "M-18 -11L-21.6 -27.6L-9.6 -16Z");
  if (kind === "small") return one("M-18 -7Q-21.5 -21 -14 -22.5Q-8.5 -22 -5 -15Z", "");
  const tuft = kind === "tuft" ? ln("M-16.6 -26l-2 -4.2M-15.4 -27.2l.1 -4.8M-14.2 -26.8l2.3 -3.6", LWC * .7) : "";
  return one("M-18 -6L-17 -26Q-16.4 -29 -13.4 -26.8L-3.5 -15.2Z", "M-15.8 -11.4L-15.2 -22.6L-8.4 -15.4Z", tuft);
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
  const almond = x => `<path d="M${f(x - 4.2)} ${f(y)}Q${x} ${f(y - 4.6)} ${f(x + 4.2)} ${f(y)}Q${x} ${f(y + 3.8)} ${f(x - 4.2)} ${f(y)}Z" fill="${pal.eye || "#e9d98a"}" ${key(lw * .55)}/><path d="M${x} ${f(y - 3)}V${f(y + 2.2)}" ${key(lw * .7)}/>`;
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
const HEAD = "M-20.5 1C-21 -11.5 -12 -17 0 -17C12 -17 21 -11.5 20.5 1C20 10.5 10.5 15.5 0 15.5C-10.5 15.5 -20 10.5 -20.5 1Z";
/* the cat's head at (x, y), facing dir (1 = right), scale sc */
/* anim (optional, seconds): the ears twitch and the open eyes blink, out of step by that much. Leave it out for the
   lane cat, which is redrawn every frame. mouth (optional): the shape of a sung sound, see catFace */
export function catHead(x, y, dir, mood, sc = 1, pal = C, kind = "point", anim = null, mouth = null) {
  const s = f(dir * sc * 100) / 100 || .01, t = f(sc * 100) / 100 || .01;
  const marks = `<path d="M-4.6 -16v5M0 -17v6.2M4.6 -16v5" stroke="${pal.stripe}" stroke-width="1.9" stroke-linecap="round"/>`;
  const whisk = `<path d="M-13.5 4l-11 -1.8M-13.5 7l-10.4 1.8M13.5 4l11 -1.8M13.5 7l10.4 1.8" ${key(LWC * .38)} opacity=".75"/>`;
  /* animated and awake: the face blinks, and a second, happy face waits for a pat (shown while lc-tapped) */
  const blinks = anim != null && (mood === "normal" || mood === "wide");
  const face0 = blinks ? `<g class="lc-blink" style="animation-delay:${f(-anim * 1.7)}s">${catFace(mood, pal, 0, mouth)}</g>` : catFace(mood, pal, 0, mouth);
  const face = anim != null && mood !== "sleep" ? `<g class="lc-face">${face0}</g><g class="lc-face-pet">${catFace("smug", pal)}</g>` : face0;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s} ${t})">${catEars(kind, pal, anim)}<path d="${HEAD}" fill="${pal.fur}"/><ellipse cy="7.6" rx="9.4" ry="6.4" fill="${pal.belly}"/>${marks}<path d="${HEAD}" fill="none" ${key(LWC)}/>${whisk}${face}</g>`;
}

/* a key-lined tube: the line under, the fur over */
const pipe = (d, c, w, lw = LWC * .9) => `<path d="${d}" fill="none" stroke="${KEY}" stroke-width="${f(w + 2 * lw)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const blob = (cx, cy, r, c, lw = LWC * .9) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${c}" ${key(lw)}/>`;

/* tails start at (x, y) and grow away from dir (the way the cat faces). w = the tail's base thickness */
export function catTail(kind, x, y, dir, w = 8, pal = C) {
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  const d = `M${P(0, 0)} Q${P(-14, -1)} ${P(-15, -13)} Q${P(-16, -22)} ${P(-8, -24)}`;
  if (kind === "big") return pipe(`M${P(0, 0)} Q${P(-17, 0)} ${P(-17, -15)} Q${P(-17, -28)} ${P(-8, -29)}`, pal.fur, w * .55);
  if (kind === "tuft") return pipe(d, pal.fur, w * 1.35) + blob(x - 8 * dir, y - 25, w * 1.1, pal.fur) + `<path d="M${P(-13, -27)} q${f(4 * dir)} -5 ${f(9 * dir)} -1" stroke="${pal.stripe}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if (kind === "small") return blob(x - 4 * dir, y - 5, w * .9, pal.fur);
  return pipe(d, pal.fur, w * .9);
}
/* the tail tucked along the body (asleep) */
export function catTailTucked(kind, x, y, dir, w = 8, pal = C) {
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  if (kind === "small") return blob(x - 2 * dir, y + 4, w * .85, pal.fur);
  const sw = kind === "tuft" ? w * 1.3 : kind === "big" ? w * .55 : w * .9;
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
  return `<g class="lc-pill"><path d="M${f(x + r * .3)} ${f(y - r * .6)}q${f(r * 1.6)} ${f(-r * 2.4)} ${f(r * 2.3)} ${f(-r * .5)}q${f(r * .3)} ${f(r * 1.5)} ${f(-r * 1.2)} ${f(r)}" fill="none" ${key(LWC * .62 * sc)}/>`
    + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${pal.furDk}" ${key(LWC * .7 * sc)}/><path d="M${f(x - r * .5)} ${f(y - r * .1)}q${f(r * .5)} ${f(-r * .55)} ${f(r)} 0" fill="none" ${key(LWC * .4 * sc)}/></g>`;
}

/* three small hearts that rise from (x y) when the thing they belong to is patted; hidden otherwise (ART_CSS) */
export const petHearts = (x, y, s = 1) => [[-9, 0, -8, 0], [2, -7, 5, .12], [12, 1, 10, .24]].map(([dx, dy, drift, d]) => `<g transform="translate(${f(x + dx * s)} ${f(y + dy * s)}) scale(${s})"><g class="lc-heart" style="--lc-x:${drift}px;animation-delay:${d}s"><path d="M0 4.500C-8 -2 -4.500 -8.500 0 -4C4.500 -8.500 8 -2 0 4.500Z" fill="#bf452d" ${key(1.1)}/></g></g>`).join("");
