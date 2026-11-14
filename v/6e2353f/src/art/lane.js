/* The live lane cat (re-rendered every animation frame: a handful of elements, cached heads, patterns as dash
   arrays) and the one-take segment strip shown on the result card. */
import { f, num, int, svgDoc } from "./util.js";
import { lookOf, palOf, animalId, kindId, FUR } from "./palettes.js";
import { bodyMarkup, coatMarkup, pawPair, straight, foldMarkup, foldSpots } from "./cat.js";
import { headFor, tailFor } from "./guests.js";

const MOODS = ["listen", "sing", "smug", "squint", "wide", "sleep"];
const FURK = { short: 1, mid: 1.08, long: 1.16 };
/* a coat pattern as one dashed stroke along the body: [dash, gap, width factor, colour key, round caps] */
const DASH = {
  bands3: [3.5, 26, .92, "stripe"], pale3: [3.5, 26, .92, "belly"], stripes5: [2.2, 12, .92, "stripe"], bold: [9, 62, .92, "stripe"],
  tabby: [2.6, 7.5, .8, "stripe"], pin: [1.1, 5, .92, "stripe"], rosebold: [7, 34, .92, "stripe"],
  rosettes: [0, 20, .4, "stripe", 1], spots: [0, 15, .3, "stripe", 1], freckles: [0, 8.5, .13, "stripe", 1],
};
const headCache = new Map();
function cachedHead(animal, kind, mood, palette, dir, sc) {
  const key = `${animal}|${kind}|${mood}|${palette}|${dir}|${sc}`;
  let h = headCache.get(key);
  if (!h) {
    const look = { palette }, pal = palOf(animal, look);
    h = headFor(animal, kind, 0, 0, dir, mood, sc, pal);
    if (headCache.size > 400) headCache.clear();
    headCache.set(key, h);
  }
  return h;
}

export function laneCatSvg(o = {}) {
  const look = lookOf(o.look, "bottom", "golden"), animal = animalId(o.animal), kind = kindId(o.kind), pal = palOf(animal, look);
  const sc = Math.max(.1, num(o.scale, 1)), w = 17 * FURK[look.fur] * sc, mood = MOODS.includes(o.mood) ? o.mood : "listen";
  let d = "", len = 0, firstDir = 1;
  const subs = Array.isArray(o.subs) ? o.subs : [];
  const pathOf = (lines, measure) => {
    let d = "";
    for (const s of lines) {
      if (!Array.isArray(s) || s.length < 2) continue;
      let px = null, py = null;
      for (let i = 0; i < s.length; i++) {
        const p = s[i];
        if (!p) continue;
        const x = num(p.x), y = num(p.y);
        d += `${px === null ? "M" : "L"}${f(x)} ${f(y)}`;
        if (measure && px !== null) len += Math.hypot(x - px, y - py);
        px = x; py = y;
      }
    }
    return d;
  };
  d = pathOf(subs, true);
  const td = pathOf(Array.isArray(o.threads) ? o.threads : [], false);
  const head = o.head && typeof o.head === "object" ? o.head : null;
  const dir = head ? (num(head.dir, 1) < 0 ? -1 : 1) : firstDir;
  let out = "";
  if (o.tail && typeof o.tail === "object") out += tailFor(animal, kind, num(o.tail.x), num(o.tail.y), dir, w * .45, pal, mood === "sleep");
  /* the thread: the sung line where the voice is between notes, drawn under the body */
  if (td) out += `<path d="${td}" stroke="${pal.furDk}" stroke-width="${f(w * .4)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".5"/>`
    + `<path d="${td}" stroke="${pal.fur}" stroke-width="${f(w * .26)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  if (d) {
    out += `<path d="${d}" stroke="${pal.furDk}" stroke-width="${f(w + 5)}" stroke-dasharray="0 ${f(w * .42)}" stroke-linecap="round" fill="none" opacity=".45"/>`
      + `<path d="${d}" stroke="${pal.fur}" stroke-width="${f(w + 3)}" stroke-dasharray="0 ${f(w * .42)}" stroke-linecap="round" fill="none"/>`
      + `<path d="${d}" stroke="${pal.fur}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
      + `<path d="${d}" transform="translate(0 ${f(w * .26)})" stroke="${pal.belly}" stroke-width="${f(w * .34)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>`;
    const D = DASH[look.pattern];
    if (look.pattern === "twotone") out += `<path d="${d}" stroke="${pal.furDk}" stroke-width="${f(w * .9)}" stroke-dasharray="0 ${f(len / 2)} ${f(len + 1)}" stroke-linecap="round" fill="none"/>`;
    else if (D) out += `<path d="${d}" stroke="${pal[D[3]]}" stroke-width="${f(w * D[2])}" stroke-dasharray="${f(D[0] * sc)} ${f(D[1] * sc)}" stroke-dashoffset="${f(-D[1] * sc / 2)}"${D[4] ? ` stroke-linecap="round"` : ""} fill="none" opacity="${animal === "cat" ? .9 : .5}"/>`;
  }
  if (head) out += `<g transform="translate(${f(head.x)} ${f(head.y)})">${cachedHead(animal, kind, mood, look.palette, dir, Math.round(.85 * sc * 100) / 100)}</g>`;
  const marks = Array.isArray(o.marks) ? o.marks : [];
  for (const m of marks) {
    if (!m || typeof m !== "object") continue;
    const t = m.type === "ok" ? "✓" : m.type === "~" ? "~" : "?";
    const ink = m.type === "ok" ? "#2f8a4a" : m.type === "~" ? "#b47a12" : "#c14a36";
    out += `<text x="${f(m.x)}" y="${f(m.y)}" text-anchor="middle" font-family="Nunito, Helvetica Neue, Arial, PingFang TC, sans-serif" font-weight="800" font-size="${f(20 * sc)}" fill="${ink}" stroke="#fffdf6" stroke-width="${f(3.5 * sc)}" paint-order="stroke" stroke-linejoin="round">${t}</text>`;
  }
  return `<g class="lc-lane">${out}</g>`;
}

/* one take as a short furry strip: tail stub, wobble from the shape, a fold for every note that got away, a head */
export function segmentSvg(o = {}) {
  const W = Math.max(60, num(o.width, 320)), H = Math.max(30, num(o.height, 90));
  const look = lookOf(o.look, "bottom", "golden"), animal = animalId(o.animal), kind = kindId(o.kind), pal = palOf(animal, look);
  const w = Math.min(H * .34, 30) * FURK[look.fur] / 1.16, x0 = W * .16, len = W * .62, y = H * .58, amp = Math.min(4, H * .05);
  const shape = Array.isArray(o.shape) ? o.shape : [];
  const n = 24, pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i + .5) / n, k = t * Math.max(0, shape.length - 1), a = num(shape[Math.floor(k)]), b = num(shape[Math.min(shape.length - 1, Math.floor(k) + 1)]);
    const v = shape.length ? Math.max(-1, Math.min(1, a + (b - a) * (k - Math.floor(k)))) : 0;
    pts.push({ x: x0 + len * t, y: y - v * amp * Math.sin(t * Math.PI), tx: 1, ty: 0, fluff: FUR[look.fur].fluff * w / 25 });
  }
  const coatPts = pts.filter((_, i) => i % 2 === 0);
  let tuft = "";
  for (const x of foldSpots(o.folds, o.tuft)) tuft += foldMarkup(pts[int((.06 + x * .8) * n, 2, n - 4)], w, pal, w / 22); // kept clear of the head
  const end = pts[n - 1], hs = w / 22;
  const body = bodyMarkup([pts], w, pal, { outline: true, tuftR: FUR[look.fur].tuftR }) + coatMarkup([{ pts: coatPts, pattern: look.pattern }], w, pal, animal === "cat" ? .92 : .55);
  const art = tailFor(animal, kind, x0 - 2, y + 2, 1, w * .38, pal, false) + pawPair(x0 + 12 * hs, y + w * .5, 1, .9 * hs, pal) + body + tuft
    + pawPair(end.x + 3 * hs, end.y + w * .55, 1, hs, pal) + headFor(animal, kind, end.x + 8 * hs, end.y - 5 * hs, 1, "smug", .9 * hs, pal);
  return svgDoc(`0 0 ${f(W)} ${f(H)}`, art);
}
