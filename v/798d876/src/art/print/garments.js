/* One garment on the judge, in the woodblock style. the designer's choices of 2026-11-14 (docs/design/longcat-garments.md):
   - design 丙: the wraps of one garment are fused into one piece. One key line runs round the whole garment; between
     the rows there is only a soft darker rim, like chunky knitting; a trim says which garment it is.
   - the three garments are a hat, a scarf and a top. The hat replaces the old lap garment: the game's zone id is still
     `bottom` (saves keep working), and this module draws it on the head. `hat` is accepted as the same zone.
   - an off note leaves a pill of fluff (foldMarkup in ./cat.js), not a fold.
   Guests still come from ../guests.js until they are redrawn. */
import { f, num, int, clamp, quad, sample, dPath, rng, hash } from "../util.js";
import { FUR, lookOf, palOf, animalId, kindId, zoneId, timeId } from "../palettes.js";
import { ZONES as OLD, moodOf } from "../garments.js";
import { headFor, tailFor } from "../guests.js";
import { COATS, KEY, LWC, coatMarkup, pawPair, foldMarkup, foldSpots, catHead, catTail, catTailTucked } from "./cat.js";
import { zzPrint } from "./judge.js";

/* rows lowest first: [y, sag, x0, x1]. The hat is a small cap of three rows between the judge's ears; it runs right
   to left so the cat's head ends on the left, clear of the yuzu, which sits in the top row like an egg in a nest */
export const ZONES = {
  hat: { rows: [[123, -5, 262, 138], [109, -7, 256, 144], [95, -8, 244, 156]], per: 4, headDx: 6, headDy: -5 },
  top: { rows: OLD.top.rows.map(([y, s]) => [y, s, OLD.top.x0, OLD.top.x1]), per: OLD.top.per, headDx: OLD.top.headDx, headDy: OLD.top.headDy },
  scarf: { rows: OLD.scarf.rows.map(([y, s]) => [y, s, OLD.scarf.x0, OLD.scarf.x1]), per: OLD.scarf.per, headDx: OLD.scarf.headDx, headDy: OLD.scarf.headDy },
};
export const ZONE_NAME = { scarf: "Scarf", top: "Top", hat: "Hat", bottom: "Hat" };
/* the zone to draw: `bottom` (the game's id) and `hat` are the same garment */
export const drawZone = z => (z === "hat" || z === "bottom" ? "hat" : zoneId(z));
const ZN = 72, AMP = 2, LW = LWC * .9;
const curve = ([y, sag, x0, x1]) => [[x0, y], ...quad([x0, y], [(x0 + x1) / 2, y + 2 * sag], [x1, y], 24)];
const ROWS = {}, FINE = {};
for (const k in ZONES) {
  ROWS[k] = ZONES[k].rows.map(r => sample(curve(r), ZN));
  FINE[k] = ZONES[k].rows.map(r => {
    const pts = curve(r), acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, acc, len: acc[acc.length - 1] };
  });
}
/* the point at the end of `step` on the zone's path (0 = the start, where the tail is) */
export function stepPoint(zone, step) {
  const z = drawZone(zone) || "hat", Z = ZONES[z], s = int(step, 0, 12, 0);
  const r = s === 0 ? 0 : Math.floor((s - 1) / Z.per), t = s === 0 ? 0 : (s - r * Z.per) / Z.per;
  const F = FINE[z][r], target = clamp(t, 0, 1) * F.len;
  let i = 1;
  while (i < F.acc.length - 1 && F.acc[i] < target) i++;
  const a = F.pts[i - 1], b = F.pts[i], L = (F.acc[i] - F.acc[i - 1]) || 1, u = (target - F.acc[i - 1]) / L;
  return { x: Math.round((a[0] + (b[0] - a[0]) * u) * 10) / 10, y: Math.round((a[1] + (b[1] - a[1]) * u) * 10) / 10, angle: Math.round(Math.atan2(b[1] - a[1], b[0] - a[0]) * 1800 / Math.PI) / 10 };
}
function shapeAt(shape, t) {
  if (!Array.isArray(shape) || !shape.length) return null;
  const x = clamp(t, 0, 1) * (shape.length - 1), i = Math.floor(x), fr = x - i;
  const a = num(shape[i]), b = num(shape[Math.min(shape.length - 1, i + 1)]);
  return clamp(a + (b - a) * fr, -1, 1);
}
const FACE_OF_MOOD = { awake: "normal", squint: "smug", asleep: "sleep" };
export const palPrint = (look) => COATS[look && look.palette] || COATS.ginger;
const st = (S, c, sw) => `<path d="${dPath(S)}" fill="none" stroke="${c}" stroke-width="${f(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`;
/* round tufts along a row, for mid and long fur; `extra` grows them (the key line under the fur) */
function tufts(S, w, F, extra) {
  if (F.tuftR <= .51 && !F.fluff) return "";
  let o = "", acc = w, last = S[0], k = 0;
  for (let i = 0; i < S.length; i++) {
    const p = S[i];
    acc += i ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
    last = p;
    if (acc < w * .42 && i !== S.length - 1) continue;
    acc = 0;
    o += `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(w * (k % 2 ? F.tuftR + .06 : F.tuftR) + F.fluff + extra)}"/>`;
    k++;
  }
  return o;
}
const keyLine = (w) => `stroke="${KEY}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"`;

export function garmentLayers(g, ctx = {}) {
  const zone = drawZone(g && g.zone);
  if (!zone) return null;
  const steps = int(g.steps, 0, 12, 0);
  if (!steps) return null;
  const Z = ZONES[zone], time = timeId(ctx.time), look = lookOf(g.look, zone === "hat" ? "bottom" : zone, time), animal = animalId(g.animal), kind = kindId(g.kind);
  const F = FUR[look.fur], cat = animal === "cat", pal = cat ? palPrint(look) : palOf(animal, look), w = F.w, hd = Math.sign(Z.rows[0][3] - Z.rows[0][2]);
  const shapes = Array.isArray(g.shapes) ? g.shapes : [], tuftFlags = Array.isArray(g.tufts) ? g.tufts : [], folds = Array.isArray(g.folds) ? g.folds : [];
  const R = rng(hash(`${ctx.seed || 0}|${zone}`));
  const phase = Array.from({ length: 12 }, () => R() * Math.PI * 2);
  const glow = g.glow == null ? 0 : int(g.glow, 0, 12, 0);
  const mood = moodOf(g, time), face = FACE_OF_MOOD[mood];
  let under = "";
  const rows = [];
  ROWS[zone].forEach((row, r) => {
    const n = Math.round(clamp(steps - r * Z.per, 0, Z.per) / Z.per * ZN);
    if (!n) return;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const c = row[i], u = (i + .5) / ZN * Z.per, s = r * Z.per + Math.floor(u), t = u % 1;
      const v = shapeAt(shapes[s], t);
      const off = (v == null ? .3 * Math.sin(t * Math.PI * 2 + phase[s]) : v) * AMP * Math.sin(t * Math.PI);
      pts.push({ x: c.x - c.ty * off, y: c.y + c.tx * off, tx: c.tx, ty: c.ty });
    }
    if (glow && Math.floor((glow - 1) / Z.per) === r) {
      const a = Math.round(((glow - 1) % Z.per) / Z.per * ZN), b = Math.round(((glow - 1) % Z.per + 1) / Z.per * ZN);
      const seg = pts.slice(a, Math.min(n, b));
      if (seg.length > 1) under += `<path${ctx.animate ? ` class="lc-glow"` : ""} d="${dPath(seg)}" stroke="#f8f0d8" stroke-width="${f(w * 1.9 + 14)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
    }
    rows.push({ r, n, pts });
  });
  /* one key line round the whole garment: every row's line first, then every row's fur with a soft rim under the higher rows */
  let art = rows.map(({ pts }) => `<g fill="${KEY}">${tufts(pts, w, F, LW)}</g>` + st(pts, KEY, w + 2 * LW)).join("");
  let pills = "";
  rows.forEach(({ r, n, pts }, i) => {
    const patches = [];
    for (let c = 0; c * 24 < n; c++) patches.push({ pattern: look.pattern, pts: Array.from({ length: 12 }, (_, j) => (c * 24 + 2 * j < n ? pts[c * 24 + 2 * j] : null)) });
    art += (i ? st(pts, pal.furDk, w + 2.2) : "") + `<g fill="${pal.fur}">${tufts(pts, w, F, 0)}</g>` + st(pts, pal.fur, w) + coatMarkup(patches, w, pal, cat ? 1 : .55);
    for (let k = 0; k < Z.per; k++) {
      const s = r * Z.per + k;
      if (s >= steps) break;
      for (const x of foldSpots(folds[s], tuftFlags[s])) {
        const j = clamp(Math.round((k + x) / Z.per * ZN), 2, n - 3);
        if (j >= 2) pills += foldMarkup(pts[j], w, pal);
      }
    }
  });
  const first = rows[0].pts[0], lastRow = rows[rows.length - 1].pts, end = lastRow[lastRow.length - 1], tucked = mood === "asleep";
  /* the trim that says which garment it is: fringe on the scarf, a ribbed hem on the top, a ribbed brim on the hat */
  let trim = "";
  if (zone === "scarf") trim = [-7, -2, 3, 8].map(dx => `<path d="M${f(first.x + 8 + dx)} ${f(first.y + w * .45)}v${f(13 - Math.abs(dx) * .4)}" fill="none" ${keyLine(1.6)}/>`).join("");
  let rib = "";
  if (zone !== "scarf") { const S0 = rows[0].pts; for (let i = 3; i < S0.length; i += 4) rib += `M${f(S0[i].x)} ${f(S0[i].y + w * .1)}v${f(w * .36)}`; }
  const tail = cat ? (tucked ? catTailTucked : catTail)(kind, first.x - hd * 2, first.y + 2, hd, w * .38, pal) : tailFor(animal, kind, first.x - hd * 2, first.y + 2, hd, w * .38, pal, tucked);
  const hind = zone === "hat" ? "" : pawPair(first.x + hd * 12, first.y + w * .5, hd, .9, pal);
  const hx = end.x + hd * Z.headDx, hy = end.y + Z.headDy - num(ctx.headLift);
  const tailG = ctx.animate && !tucked ? `<g class="lc-tail ${hd > 0 ? "lc-tail-l" : "lc-tail-r"}">${tail}</g>` : tail;
  const beat = { hat: 1.5, top: 7, scarf: 12.5 }[zone];
  const headM = cat ? catHead(hx, hy, hd, face, .95, pal, kind, ctx.animate ? beat : null) : headFor(animal, kind, hx, hy, hd, face, .9, pal);
  const head0 = pawPair(end.x + hd * 3, end.y + 12, hd, 1, pal) + headM;
  /* animated: an awake cat stretches now and then (each garment at its own moment); a sleeping one breathes */
  const head = (ctx.animate ? `<g class="${tucked ? "lc-snooze" : "lc-stretch"}" style="--lc-d:${hd};animation-delay:${-beat}s">${head0}</g>` : head0) + (mood === "asleep" ? zzPrint(hx + 14, hy - 20) : "");
  return { under, art: trim + tailG + hind + art + (rib ? `<path d="${rib}" stroke="${pal.furDk}" stroke-width="1.5" stroke-linecap="round" fill="none"/>` : "") + pills, head, headAt: { x: hx, y: hy } };
}

/* a dashed guide over the steps not yet worn (from `from` to 12) */
export function guideMarkup(zone, from = 0, color = "#f8f2e2") {
  const z = drawZone(zone);
  if (!z) return "";
  const Z = ZONES[z], s0 = int(from, 0, 12, 0);
  let out = "";
  FINE[z].forEach((F, r) => {
    const a = clamp(s0 - r * Z.per, 0, Z.per) / Z.per;
    if (a >= 1) return;
    const pts = F.pts.map(([x, y]) => ({ x, y })), k = Math.round(a * (pts.length - 1));
    out += `<path d="${dPath(pts.slice(k))}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round" opacity=".85"/>`;
  });
  return out;
}
