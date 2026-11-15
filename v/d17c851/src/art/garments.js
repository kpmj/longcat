/* The three fixed paths on the judge and a garment laid along one of them.
   Each zone is a few wrap rows; a row runs across the front, goes behind the judge and comes back at x0.
   Rows are listed lowest first and drawn in that order, so a higher row lies over the one below. The tail stays at x0. */
import { f, num, int, clamp, quad, sample, dPath, rng, hash } from "./util.js";
import { FUR, lookOf, palOf, animalId, kindId, zoneId, timeId, K } from "./palettes.js";
import { bodyMarkup, coatMarkup, pawPair, foldMarkup, foldSpots } from "./cat.js";
import { headFor, tailFor } from "./guests.js";
import { zzMarkup } from "./judge.js";

export const ZONES = {
  bottom: { rows: [[442, 3], [426, 4], [410, 5]], x0: 57, x1: 343, per: 4, headDx: -6, headDy: -6 },
  top:    { rows: [[388, 5], [368, 8], [348, 12], [328, 16]], x0: 46, x1: 354, per: 3, headDx: 6, headDy: -4 },
  scarf:  { rows: [[282, 26], [270, 21], [258, 15]], x0: 311, x1: 89, per: 4, headDx: 4, headDy: -3 },
};
export const ZONE_NAME = { scarf: "Scarf", top: "Top", bottom: "Bottom" };
const ZN = 72, AMP = 2;
const curve = (Z, y, sag) => [[Z.x0, y], ...quad([Z.x0, y], [200, y + 2 * sag], [Z.x1, y], 24)];
/* per zone: the 72 body samples of every row, and a fine arc-length table for exact step points */
const ROWS = {}, FINE = {};
for (const k in ZONES) {
  const Z = ZONES[k];
  ROWS[k] = Z.rows.map(([y, sag]) => sample(curve(Z, y, sag), ZN));
  FINE[k] = Z.rows.map(([y, sag]) => {
    const pts = curve(Z, y, sag), acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, acc, len: acc[acc.length - 1] };
  });
}
function along(zone, r, t) {
  const F = FINE[zone][r], target = clamp(t, 0, 1) * F.len;
  let i = 1;
  while (i < F.acc.length - 1 && F.acc[i] < target) i++;
  const a = F.pts[i - 1], b = F.pts[i], L = (F.acc[i] - F.acc[i - 1]) || 1, u = (target - F.acc[i - 1]) / L;
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, angle: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
}

/* the point at the end of `step` on the zone's path (0 = the start of the path, where the tail is) */
export function stepPoint(zone, step) {
  const z = zoneId(zone) || "bottom", Z = ZONES[z], s = int(step, 0, 12, 0);
  const r = s === 0 ? 0 : Math.floor((s - 1) / Z.per), t = s === 0 ? 0 : (s - r * Z.per) / Z.per;
  const p = along(z, r, t);
  return { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, angle: Math.round(p.angle * 10) / 10 };
}
/* a dashed guide over the steps not yet worn (from `from` to 12) */
export function guideMarkup(zone, from = 0, color = "#fdf6e8") {
  const z = zoneId(zone);
  if (!z) return "";
  const Z = ZONES[z], s0 = int(from, 0, 12, 0);
  let out = "";
  Z.rows.forEach((_, r) => {
    const a = clamp(s0 - r * Z.per, 0, Z.per) / Z.per;
    if (a >= 1) return;
    const pts = [];
    for (let i = 0; i <= 24; i++) pts.push(along(z, r, a + (1 - a) * i / 24));
    out += `<path d="${dPath(pts)}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round" opacity=".8"/>`;
  });
  return out;
}

/* the shape of one take, sampled at t in [0, 1]: null samples (silence) count as 0 so the body never breaks */
function shapeAt(shape, t) {
  if (!Array.isArray(shape) || !shape.length) return null;
  const x = clamp(t, 0, 1) * (shape.length - 1), i = Math.floor(x), fr = x - i;
  const a = num(shape[i]), b = num(shape[Math.min(shape.length - 1, i + 1)]);
  return clamp(a + (b - a) * fr, -1, 1);
}

/* the default mood of a garment: in progress = awake; finished = by time of day */
export function moodOf(g, time) {
  if (g.mood === "awake" || g.mood === "squint" || g.mood === "asleep") return g.mood;
  if (int(g.steps, 0, 12, 0) < 12) return "awake";
  return { morning: "awake", golden: "squint", night: "asleep" }[timeId(time)];
}
const FACE_OF_MOOD = { awake: "normal", squint: "smug", asleep: "sleep" };

/* one garment on the judge. returns layers: under (glow), art (body, tail, paws, tufts) and head (with front paws) */
export function garmentLayers(g, ctx = {}) {
  const zone = zoneId(g && g.zone);
  if (!zone) return null;
  const steps = int(g.steps, 0, 12, 0);
  if (!steps) return null;
  const Z = ZONES[zone], time = timeId(ctx.time), look = lookOf(g.look, zone, time), animal = animalId(g.animal), kind = kindId(g.kind);
  const F = FUR[look.fur], pal = palOf(animal, look), w = F.w, hd = Math.sign(Z.x1 - Z.x0);
  const shapes = Array.isArray(g.shapes) ? g.shapes : [], tufts = Array.isArray(g.tufts) ? g.tufts : [], folds = Array.isArray(g.folds) ? g.folds : [];
  const R = rng(hash(`${ctx.seed || 0}|${zone}`));
  const phase = Array.from({ length: 12 }, () => R() * Math.PI * 2);
  const glow = g.glow == null ? 0 : int(g.glow, 0, 12, 0);
  const mood = moodOf(g, time), face = FACE_OF_MOOD[mood];
  let under = "", art = "", end = null;
  ROWS[zone].forEach((row, r) => {
    const n = Math.round(clamp(steps - r * Z.per, 0, Z.per) / Z.per * ZN);
    if (!n) return;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const c = row[i], u = (i + .5) / ZN * Z.per, s = r * Z.per + Math.floor(u), t = u % 1;
      const v = shapeAt(shapes[s], t);
      const off = (v == null ? .3 * Math.sin(t * Math.PI * 2 + phase[s]) : v) * AMP * Math.sin(t * Math.PI);
      pts.push({ x: c.x - c.ty * off, y: c.y + c.tx * off, tx: c.tx, ty: c.ty, fluff: F.fluff });
    }
    if (glow && Math.floor((glow - 1) / Z.per) === r) {
      const a = Math.round(((glow - 1) % Z.per) / Z.per * ZN), b = Math.round(((glow - 1) % Z.per + 1) / Z.per * ZN);
      const seg = pts.slice(a, Math.min(n, b));
      if (seg.length > 1) under += `<path${ctx.animate ? ` class="lc-glow"` : ""} d="${dPath(seg)}" stroke="#fff6d8" stroke-width="${f(w * 1.9 + 14)}" fill="none" stroke-linecap="round" opacity=".8"/>`;
    }
    const patches = [];
    for (let c = 0; c * 24 < n; c++) patches.push({ pattern: look.pattern, pts: Array.from({ length: 12 }, (_, j) => (c * 24 + 2 * j < n ? pts[c * 24 + 2 * j] : null)) });
    art += bodyMarkup([pts], w, pal, { outline: true, tuftR: F.tuftR }) + coatMarkup(patches, w, pal, animal === "cat" ? .92 : .55);
    /* folds: one for every note that got away in that step. Drawn with their own row, so the next row up lies
       over a fold's top the same way it lies over the fur; never a hole */
    for (let k = 0; k < Z.per; k++) {
      const s = r * Z.per + k;
      if (s >= steps) break;
      for (const x of foldSpots(folds[s], tufts[s])) {
        const i = clamp(Math.round((k + x) / Z.per * ZN), 2, n - 3);
        if (i >= 2) art += foldMarkup(pts[i], w, pal);
      }
    }
    end = pts[n - 1];
  });
  const first = ROWS[zone][0][0];
  const tucked = mood === "asleep";
  const tail = tailFor(animal, kind, first.x - hd * 2, first.y + 2, hd, w * .38, pal, tucked);
  const hind = pawPair(first.x + hd * 12, first.y + w * .5, hd, .9, pal);
  const hx = end.x + hd * Z.headDx, hy = end.y + Z.headDy - num(ctx.headLift);
  const tailG = ctx.animate && !tucked ? `<g class="lc-tail ${hd > 0 ? "lc-tail-l" : "lc-tail-r"}">${tail}</g>` : tail;
  const head = pawPair(end.x + hd * 3, end.y + 12, hd, 1, pal) + headFor(animal, kind, hx, hy, hd, face, .9, pal)
    + (mood === "asleep" ? zzMarkup(hx + 14, hy - 20, ctx.ink || K.mute, 10) : "");
  return { under, art: hind + art + tailG, head, headAt: { x: hx, y: hy } };
}
