/* The cat: head, ears and tails of the four kinds, paws, the fluffy body and the twelve coat patterns.
   Ported from the approved board (03-art.js) and cleaned up: patterns are ids, every number goes through f(). */
import { f, num } from "./util.js";
import { COATS } from "./palettes.js";

const C = COATS.ginger;

/* ears of the four kinds, in head space (head radius 20) */
export function catEars(kind, pal) {
  const pair = (outer, inner) => `<path d="${outer} ${mirror(outer)}" fill="${pal.fur}"/><path d="${inner} ${mirror(inner)}" fill="${pal.inner}"/>`;
  if (kind === "big") return pair("M-20 -3 L-29 -33 L-2 -18Z", "M-18.5 -9 L-24.5 -27.5 L-8 -18Z");
  if (kind === "small") return pair("M-20 -6 L-18.5 -20 Q-15 -23.5 -8 -17.5Z", "M-17 -11 L-16.3 -18.2 L-11.5 -16.4Z");
  const tips = kind === "tuft" ? `<path d="M-17.8 -24.5 Q-20 -31 -19.6 -37.5 Q-16.2 -32.5 -13.6 -25.8Z M17.8 -24.5 Q20 -31 19.6 -37.5 Q16.2 -32.5 13.6 -25.8Z" fill="${pal.stripe}"/>` : "";
  return pair("M-19 -8 L-17 -29 L-4 -17Z", "M-15 -12 L-14 -24 L-7 -17Z") + tips;
}
/* mirror a path made only of absolute M/L/Q commands across x = 0 */
function mirror(d) {
  return d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (_, x, y) => `${f(-x)} ${y}`);
}

/* eyes and mouth by mood. moods: normal (awake), listen, sing, smug (the golden squint), squint, wide, sleep */
export function catFace(mood, pal, dy = 0) {
  const y = -3 + dy;
  let eyes;
  if (mood === "smug" || mood === "listen") eyes = `<path d="M-11 ${y + 1} q4 -5 8 0 M3 ${y + 1} q4 -5 8 0" stroke="${pal.ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  else if (mood === "sleep") eyes = `<path d="M-11 ${y - 1} q4 4 8 0 M3 ${y - 1} q4 4 8 0" stroke="${pal.ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  else if (mood === "squint") eyes = `<path d="M-11 ${y} h8 M3 ${y} h8" stroke="${pal.ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  else if (mood === "wide") eyes = `<circle cx="-7" cy="${y}" r="4.4" fill="#fff" stroke="${pal.ink}" stroke-width="1.4"/><circle cx="7" cy="${y}" r="4.4" fill="#fff" stroke="${pal.ink}" stroke-width="1.4"/><circle cx="-6.2" cy="${y + .4}" r="2" fill="${pal.ink}"/><circle cx="7.8" cy="${y + .4}" r="2" fill="${pal.ink}"/>`;
  else eyes = `<circle cx="-7" cy="${y}" r="2.4" fill="${pal.ink}"/><circle cx="7" cy="${y}" r="2.4" fill="${pal.ink}"/>`;
  const my = 6 + dy;
  const mouth = mood === "wide" ? `<ellipse cx="0" cy="${my + 2}" rx="3" ry="4" fill="#7a3a3a"/>`
    : mood === "sing" ? `<ellipse cx="0" cy="${my + 2}" rx="3.6" ry="4.6" fill="#7a3a3a"/>`
    : mood === "squint" ? `<path d="M-4 ${my + 1} h8" stroke="${pal.ink}" stroke-width="1.8" stroke-linecap="round"/>`
    : `<path d="M-5 ${my} q2.5 3.5 5 0 q2.5 3.5 5 0" stroke="${pal.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return `${eyes}<path d="M-2.5 ${3.5 + dy} h5 l-2.5 3z" fill="${pal.nose}"/>${mouth}`;
}
/* the cat's head at (x, y), facing dir (1 = right), scale sc */
export function catHead(x, y, dir, mood, sc = 1, pal = C, kind = "point") {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(dir * sc * 100) / 100 || .01} ${f(sc * 100) / 100 || .01})">${catEars(kind, pal)}<circle r="20" fill="${pal.fur}"/><path d="M-7 -19 q3 5 6 0 M1 -19 q3 5 6 0" stroke="${pal.stripe}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/><path d="M-21 3 h-11 M-21 7 l-11 3 M21 3 h11 M21 7 l11 3" stroke="${pal.ink}" stroke-width="1.2" opacity=".55" stroke-linecap="round"/>${catFace(mood, pal)}</g>`;
}

/* tails start at (x, y) and grow away from dir (the way the cat faces). w = the tail's base thickness */
export function catTail(kind, x, y, dir, w = 8, pal = C) {
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  if (kind === "big") return `<path d="M${P(0, 0)} Q${P(-17, 0)} ${P(-17, -15)} Q${P(-17, -28)} ${P(-8, -29)}" stroke="${pal.fur}" stroke-width="${f(w * .62)}" fill="none" stroke-linecap="round"/>`;
  if (kind === "tuft") return `<path d="M${P(0, 0)} Q${P(-14, -1)} ${P(-15, -13)} Q${P(-16, -22)} ${P(-8, -24)}" stroke="${pal.fur}" stroke-width="${f(w * 1.55)}" fill="none" stroke-linecap="round"/><circle cx="${f(x - 8 * dir)}" cy="${f(y - 25)}" r="${f(w * 1.15)}" fill="${pal.fur}"/><path d="M${P(-13, -27)} q${f(4 * dir)} -5 ${f(9 * dir)} -1" stroke="${pal.furDk}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/>`;
  if (kind === "small") return `<circle cx="${f(x - 4 * dir)}" cy="${f(y - 5)}" r="${f(w * .95)}" fill="${pal.fur}"/><path d="M${P(-8, -8)} q${f(3 * dir)} -4 ${f(7 * dir)} -2" stroke="${pal.furDk}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  return `<path d="M${P(0, 0)} Q${P(-14, -1)} ${P(-15, -13)} Q${P(-16, -22)} ${P(-8, -24)}" stroke="${pal.fur}" stroke-width="${f(w)}" fill="none" stroke-linecap="round"/><circle cx="${f(x - 8 * dir)}" cy="${f(y - 24)}" r="${f(w * .75)}" fill="${pal.fur}"/>`;
}
/* the tail tucked along the body (asleep): it curls forward under the first stretch of body */
export function catTailTucked(kind, x, y, dir, w = 8, pal = C) {
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  if (kind === "small") return `<circle cx="${f(x - 2 * dir)}" cy="${f(y + 4)}" r="${f(w * .9)}" fill="${pal.fur}"/>`;
  const sw = kind === "tuft" ? w * 1.4 : kind === "big" ? w * .62 : w;
  return `<path d="M${P(0, 0)} Q${P(-8, 10)} ${P(8, 10)} T${P(26, 7)}" stroke="${pal.fur}" stroke-width="${f(sw)}" fill="none" stroke-linecap="round"/><path d="M${P(4, 10)} Q${P(14, 11)} ${P(24, 7.5)}" stroke="${pal.furDk}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".5"/>`;
}

/* a pair of little paws tucked under the body at (x, y) */
export const pawPair = (x, y, dir, sc = 1, pal = C) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(dir * sc * 100) / 100 || .01} ${f(sc * 100) / 100 || .01})"><ellipse cx="-6" cy="0" rx="6.5" ry="4.2" fill="${pal.fur}"/><ellipse cx="7" cy="1" rx="6.5" ry="4.2" fill="${pal.fur}"/><path d="M-9 1.5 v-2.5 M-6 .5 v-2.5 M-3 1.5 v-2.5 M4 2.5 v-2.5 M7 1.5 v-2.5 M10 2.5 v-2.5" stroke="${pal.stripe}" stroke-width="1" stroke-linecap="round" opacity=".7"/></g>`;

/* a plump, fluffy body along polylines: a wide stroke under a scalloped edge of overlapping tufts, a pale belly line.
   points may carry fluff (extra tuft radius). o.outline draws a soft darker rim so neighbouring garments stay apart */
export function bodyMarkup(subs, w = 22, pal = C, o = {}) {
  const polys = subs.filter(s => s && s.length > 1);
  if (!polys.length) return "";
  const d = polys.map(s => s.map((p, i) => `${i ? "L" : "M"}${f(p.x)} ${f(p.y)}`).join("")).join("");
  const tr = o.tuftR || .52;
  let tufts = "", rim = "", k = 0;
  for (const s of polys) {
    let acc = w, last = s[0];
    for (let i = 0; i < s.length; i++) {
      const p = s[i];
      acc += i ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
      last = p;
      if (acc < w * .38 && i !== s.length - 1) continue;
      acc = 0;
      const r = w * (k % 2 ? tr + .08 : tr) + num(p.fluff);
      tufts += `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(r)}"/>`;
      if (o.outline) rim += `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(r + 1.3)}"/>`;
      k++;
    }
  }
  const belly = o.belly === false ? "" : `<path d="${d}" transform="translate(0 ${f(w * .26)})" stroke="${pal.belly}" stroke-width="${f(w * .34)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
  return `${rim ? `<g fill="${pal.furDk}" opacity=".55">${rim}</g>` : ""}<g fill="${pal.fur}">${tufts}</g><path d="${d}" stroke="${pal.fur}" stroke-width="${f(w * .96)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${belly}`;
}

/* a fold: where a note got away, the fur is rumpled. A lump a little wider than the body with three creases
   bent the same way right across it, like the wrinkles in a pushed-up sleeve; dark enough to read on any coat
   and at any size, and still there when a higher wrap row covers the top of this one. Never a hole.
   q = { x, y, tx, ty } on the body's middle line. */
export function foldMarkup(q, w, pal = C, sc = 1) {
  const h = w / 2, tx = num(q.tx, 1), ty = num(q.ty), ux = ty, uy = -tx; // u points out of the upper edge
  const P = (a, u) => `${f(q.x + tx * a * sc + ux * u)} ${f(q.y + ty * a * sc + uy * u)}`;
  const ang = Math.atan2(ty, tx) * 180 / Math.PI;
  const lump = `<ellipse cx="${f(q.x)}" cy="${f(q.y)}" rx="${f(10.5 * sc)}" ry="${f(h * 1.3)}" transform="rotate(${f(ang)} ${f(q.x)} ${f(q.y)})" fill="${pal.fur}" stroke="${pal.furDk}" stroke-width="${f(1.4 * sc)}"/>`;
  const crease = (a, k) => `M${P(a - 2.2, h * 1.12 * k)} Q${P(a + 3.6, 0)} ${P(a - 2.2, -h * 1.12 * k)}`;
  return lump + `<path d="${crease(-5.4, .86)}${crease(0, 1)}${crease(5.4, .86)}" stroke="${pal.stripe}" stroke-width="${f(2.3 * sc)}" fill="none" stroke-linecap="round"/>`;
}
/* where the folds of one step go: positions 0..1 along the step, kept apart and off the step's ends.
   `folds` = an array of positions; a save from before folds only has tuft = true, which is one fold in the middle */
export function foldSpots(folds, tuft) {
  const list = Array.isArray(folds) ? folds.map((x) => num(x, .5)) : tuft ? [.5] : [];
  const out = [];
  for (const x of list.map((v) => Math.max(.12, Math.min(.88, v))).sort((a, b) => a - b)) if (!out.length || x - out[out.length - 1] >= .16) out.push(x);
  return out;
}

/* the coat: segs = [{ pts: up to 12 samples {x,y,tx,ty} (null = missing), pattern }]. the pattern features sit at fixed sample
   positions, so a garment keeps its markings as it grows */
export function coatMarkup(segs, w, pal = C, opacity = .92) {
  let out = "";
  for (const sg of segs) {
    const pts = sg.pts, P = sg.pattern;
    const at = t => {
      const i = Math.min(pts.length - 1, Math.floor(t)), fr = t - i, a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)];
      if (!a || !b) return null;
      return { x: a.x + (b.x - a.x) * fr, y: a.y + (b.y - a.y) * fr, nx: -a.ty, ny: a.tx };
    };
    const bar = (t, th, len, col = pal.stripe) => { const p = at(t); if (!p) return ""; const h = len / 2; return `<line x1="${f(p.x - p.nx * h)}" y1="${f(p.y - p.ny * h)}" x2="${f(p.x + p.nx * h)}" y2="${f(p.y + p.ny * h)}" stroke="${col}" stroke-width="${f(th)}" stroke-linecap="round"/>`; };
    const dot = (t, r, off = 0, col = pal.stripe) => { const p = at(t); if (!p) return ""; return `<circle cx="${f(p.x + p.nx * off)}" cy="${f(p.y + p.ny * off)}" r="${f(r)}" fill="${col}"/>`; };
    const ring = (t, r) => { const p = at(t); if (!p) return ""; return `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(r)}" fill="none" stroke="${pal.stripe}" stroke-width="${f(w * .13)}"/>`; };
    const cap = from => { const q = pts.slice(from).filter(Boolean); return q.length > 1 ? `<path d="${q.map((p, i) => `${i ? "L" : "M"}${f(p.x)} ${f(p.y)}`).join("")}" stroke="${pal.furDk}" stroke-width="${f(w * .9)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ""; };
    const L = w * .92;
    switch (P) {
      case "twotone": out += cap(6); break;
      case "bands3": out += [2, 5.5, 9].map(t => bar(t, w * .17, L)).join(""); break;
      case "pale3": out += [2, 5.5, 9].map(t => bar(t, w * .17, L, pal.belly)).join(""); break;
      case "rosettes": out += [2, 5.5, 9].map(t => ring(t, w * .24)).join(""); break;
      case "stripes5": out += [1.5, 3.5, 5.5, 7.5, 9.5].map(t => bar(t, w * .11, L)).join(""); break;
      case "spots": out += [1.2, 4, 6.8, 9.6].map((t, i) => dot(t, w * .16, (i % 2 ? 1 : -1) * w * .18)).join(""); break;
      case "bold": out += bar(5.5, w * .42, L); break;
      case "tabby": out += [1, 2.4, 3.8, 5.2, 6.6, 8, 9.4, 10.6].map((t, i) => bar(t, w * .13, i % 2 ? L * .7 : L)).join(""); break;
      case "pin": out += [.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5].map(t => bar(t, w * .06, L)).join(""); break;
      case "rosebold": out += ring(2, w * .24) + bar(5.5, w * .42, L) + ring(9, w * .24); break;
      case "freckles": out += [.8, 2.1, 3.4, 5, 6.3, 7.9, 9.2, 10.6].map((t, i) => dot(t, w * .07, [.22, -.1, .15, -.25, .05, .2, -.18, .1][i] * w)).join(""); break;
    }
  }
  return out ? `<g opacity="${opacity}">${out}</g>` : "";
}
/* twelve straight samples from (x, y), for strips, swatches and loaves */
export const straight = (x, y, len, n = 12, bend = 0) => Array.from({ length: n }, (_, i) => {
  const t = (i + .5) / n, yy = y - Math.sin(t * Math.PI) * bend, dy = -Math.cos(t * Math.PI) * bend * Math.PI / len;
  const m = Math.hypot(1, dy);
  return { x: x + len * t, y: yy, tx: 1 / m, ty: dy / m };
});
