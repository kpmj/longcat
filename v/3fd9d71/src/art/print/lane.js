/* The live lane cat and the one-take segment strip in the woodblock style. Same signatures as ../lane.js.
   The lane cat is re-rendered every animation frame, so it stays a handful of strokes: a key line under the fur,
   tufts as round-capped dashes for mid and long fur, the pattern as one dashed stroke, a cached head. */
import { f, num, int, svgDoc } from "../util.js";
import { lookOf, animalId, kindId, FUR } from "../palettes.js";
import { headFor, tailFor, palFor as guestPal } from "./guests.js";
import { yarnOf, yarnInk, sleeveMarkup, yarnPill, KNIT, CAT_W } from "./yarn.js";
import { COATS, KEY, LWC, bodyMarkup, coatMarkup, pawPair, foldMarkup, foldSpots, catHead, catTail, catTailTucked } from "./cat.js";

const MOODS = ["listen", "sing", "smug", "squint", "wide", "sleep"];
const MOUTHS = ["mm", "oo", "ee", "ah", "ay"]; // o.mouth: the sound being sung, drawn on a cat's face (guests keep their own)
const FURK = { short: 1, mid: 1.08, long: 1.16 };
const DASH = {
  bands3: [3.5, 26, .92, "stripe"], pale3: [3.5, 26, .92, "belly"], stripes5: [2.2, 12, .92, "stripe"], bold: [9, 62, .92, "stripe"],
  tabby: [2.6, 7.5, .8, "stripe"], pin: [1.1, 5, .92, "stripe"], rosebold: [7, 34, .92, "stripe"],
  rosettes: [0, 20, .4, "stripe", 1], spots: [0, 15, .3, "stripe", 1], freckles: [0, 8.5, .13, "stripe", 1],
};
const MARK = { ok: ["✓", "#3f7a55"], "~": ["~", "#a8741c"], "?": ["?", "#bf452d"] };
/* cats wear the woodblock coats; guests their own colours */
const palFor = (animal, look) => guestPal(animal, look);
const headOf = (animal, kind, x, y, dir, mood, sc, pal, mouth = null) => (animal === "cat" ? catHead(x, y, dir, mood, sc, pal, kind, null, mouth) : headFor(animal, kind, x, y, dir, mood, sc, pal));
const tailOf = (animal, kind, x, y, dir, w, pal, tucked) => (animal === "cat" ? (tucked ? catTailTucked : catTail)(kind, x, y, dir, w, pal) : tailFor(animal, kind, x, y, dir, w, pal, tucked));

const headCache = new Map();
function cachedHead(animal, kind, mood, palette, dir, sc, mouth = null) {
  const key = `${animal}|${kind}|${mood}|${palette}|${dir}|${sc}|${mouth || ""}`;
  let h = headCache.get(key);
  if (!h) {
    h = headOf(animal, kind, 0, 0, dir, mood, sc, palFor(animal, { palette }), mouth);
    if (headCache.size > 400) headCache.clear();
    headCache.set(key, h);
  }
  return h;
}
const stroke = (d, c, w, extra = "") => `<path d="${d}" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" fill="none"${extra}/>`;

export function laneCatSvg(o = {}) {
  const look = lookOf(o.look, "bottom", "golden"), animal = animalId(o.animal), kind = kindId(o.kind), pal = palFor(animal, look);
  const sc = Math.max(.1, num(o.scale, 1)), w = 17 * FURK[look.fur] * sc, lw = 2 * sc, mood = MOODS.includes(o.mood) ? o.mood : "listen";
  let len = 0;
  const pathOf = (lines, measure) => {
    let d = "";
    for (const s of lines) {
      if (!Array.isArray(s) || s.length < 2) continue;
      let px = null, py = null;
      for (const p of s) {
        if (!p) continue;
        const x = num(p.x), y = num(p.y);
        d += `${px === null ? "M" : "L"}${f(x)} ${f(y)}`;
        if (measure && px !== null) len += Math.hypot(x - px, y - py);
        px = x; py = y;
      }
    }
    return d;
  };
  const d = pathOf(Array.isArray(o.subs) ? o.subs : [], true);
  const td = pathOf(Array.isArray(o.threads) ? o.threads : [], false);
  const head = o.head && typeof o.head === "object" ? o.head : null;
  const dir = head && num(head.dir, 1) < 0 ? -1 : 1;
  let out = "";
  /* o.thin (the designer, 2026-11-27: a line thinner than the note's button, that does not hide the note): the body is one
     plain line, about a quarter of a note block high, in the yarn's ground colour or the fur's, with its key
     line and nothing else: no pattern, no belly, no fluff. The tail is small to match. The head shows the pitch. */
  const thin = o.thin === true, tb = w * .36;
  if (o.tail && typeof o.tail === "object") out += tailOf(animal, kind, num(o.tail.x), num(o.tail.y), dir, w * (thin ? .26 : .45), pal, mood === "sleep");
  const tw = o.slim ? w * .52 : w * .26;
  if (td) out += stroke(td, KEY, tw + 2 * lw * .7) + stroke(td, pal.fur, tw) + (o.slim ? stroke(td, pal.belly, tw * .28, ` transform="translate(0 ${f(tw * .22)})"`) : "");
  /* o.yarn: the body being sung is knitting (print/yarn.js). Still a handful of strokes: the ground, and the yarn's
     second colour as one dashed stroke; head and tail stay the cat's own */
  const ink = yarnInk(o.yarn);
  if (d && thin) out += stroke(d, KEY, tb + 2 * lw * .7) + stroke(d, ink ? ink.a : pal.fur, tb);
  else if (d && ink) {
    out += stroke(d, KEY, w + 2 * lw) + stroke(d, ink.a, w);
    if (ink.rep) out += `<path d="${d}" stroke="${ink.b}" stroke-width="${f(ink.rep[2] ? w * .28 : w)}" stroke-dasharray="${f(ink.rep[0] * w)} ${f(ink.rep[1] * w)}" stroke-dashoffset="${f(-ink.rep[1] * w / 2)}"${ink.rep[2] ? ` stroke-linecap="round"` : ""} stroke-linejoin="round" fill="none"/>`;
  } else if (d) {
    const fluffy = look.fur !== "short", dots = ` stroke-dasharray="0 ${f(w * .42)}"`;
    out += (fluffy ? stroke(d, KEY, w + 3 + 2 * lw, dots) : "") + stroke(d, KEY, w + 2 * lw) + (fluffy ? stroke(d, pal.fur, w + 3, dots) : "")
      + stroke(d, pal.fur, w) + stroke(d, pal.belly, w * .26, ` transform="translate(0 ${f(w * .27)})"`);
    const D = DASH[look.pattern];
    if (look.pattern === "twotone") out += stroke(d, pal.furDk, w, ` stroke-dasharray="0 ${f(len / 2)} ${f(len + 1)}"`);
    else if (D) out += `<path d="${d}" stroke="${pal[D[3]]}" stroke-width="${f(w * D[2])}" stroke-dasharray="${f(D[0] * sc)} ${f(D[1] * sc)}" stroke-dashoffset="${f(-D[1] * sc / 2)}"${D[4] ? ` stroke-linecap="round"` : ""} stroke-linejoin="round" fill="none"${animal === "cat" ? "" : ` opacity=".5"`}/>`;
  }
  /* head.tf (optional): a turn and a stretch round the head's middle, from how fast it moves (the singing screen's
     finer motion, a trial in Dev tools since 2026-11-28); without it the head is drawn as before */
  if (head) out += `<g transform="translate(${f(head.x)} ${f(head.y)})${typeof head.tf === "string" ? ` ${head.tf}` : ""}">${cachedHead(animal, kind, mood, look.palette, dir, Math.round(.85 * sc * 100) / 100, MOUTHS.includes(o.mouth) ? o.mouth : null)}</g>`;
  for (const m of Array.isArray(o.marks) ? o.marks : []) {
    if (!m || typeof m !== "object") continue;
    const [t, ink] = MARK[m.type] || MARK["?"];
    out += `<text x="${f(m.x)}" y="${f(m.y)}" text-anchor="middle" font-family="Nunito, Helvetica Neue, Arial, PingFang TC, sans-serif" font-weight="800" font-size="${f(20 * sc)}" fill="${ink}" stroke="#f8f2e2" stroke-width="${f(3.5 * sc)}" paint-order="stroke" stroke-linejoin="round">${t}</text>`;
  }
  return `<g class="lc-lane">${out}</g>`;
}

/* one take as a short strip: tail stub, wobble from the shape, a fold for every note that got away, a head */
export function segmentSvg(o = {}) {
  const W = Math.max(60, num(o.width, 320)), H = Math.max(30, num(o.height, 90));
  const look = lookOf(o.look, "bottom", "golden"), animal = animalId(o.animal), kind = kindId(o.kind), pal = palFor(animal, look);
  const w = Math.min(H * .34, 30) * FURK[look.fur] / 1.16, x0 = W * .16, len = W * .62, y = H * .58, amp = Math.min(4, H * .05);
  const shape = Array.isArray(o.shape) ? o.shape : [];
  const n = 24, pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i + .5) / n, k = t * Math.max(0, shape.length - 1), a = num(shape[Math.floor(k)]), b = num(shape[Math.min(shape.length - 1, Math.floor(k) + 1)]);
    const v = shape.length ? Math.max(-1, Math.min(1, a + (b - a) * (k - Math.floor(k)))) : 0;
    pts.push({ x: x0 + len * t, y: y - v * amp * Math.sin(t * Math.PI), tx: 1, ty: 0, fluff: FUR[look.fur].fluff * w / 25 });
  }
  const hs = w / 22, end = pts[n - 1];
  /* o.yarn: the piece is a sleeve with its two cuffs; the cat inside is short-furred and a little narrower */
  const yarn = yarnOf(o.yarn), K0 = KNIT[{ short: "morning", mid: "golden", long: "night" }[look.fur]];
  const S = yarn ? sleeveMarkup([{ pts }], yarn, { w, bump: K0.bump }) : null, wc = S ? w * CAT_W / K0.w : w;
  if (S) for (const p of pts) p.fluff = 0;
  let folds = "";
  for (const x of foldSpots(o.folds, o.tuft)) { const q = pts[int((.06 + x * .8) * n, 2, n - 4)]; folds += S ? yarnPill(q, w, yarn, hs) : foldMarkup(q, w, pal, hs); }
  const body = bodyMarkup([pts], wc, pal, { tuftR: S ? .5 : FUR[look.fur].tuftR, lw: LWC * .9 * hs }) + coatMarkup([{ pts: pts.filter((_, i) => i % 2 === 0), pattern: look.pattern }], wc, pal, animal === "cat" ? 1 : .55) + (S ? S.art + (S.cuffs || "") : "");
  const art = tailOf(animal, kind, x0 - 2, y + 2, 1, w * .38, pal, false) + pawPair(x0 + 12 * hs, y + w * .5, 1, .9 * hs, pal) + body + folds
    + pawPair(end.x + 3 * hs, end.y + w * .55, 1, hs, pal) + headOf(animal, kind, end.x + 8 * hs, end.y - 5 * hs, 1, "smug", .9 * hs, pal);
  return svgDoc(`0 0 ${f(W)} ${f(H)}`, art);
}
