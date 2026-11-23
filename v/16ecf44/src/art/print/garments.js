/* One garment on the judge, in the woodblock style. the designer's choices of 2026-11-14 (docs/design/longcat-garments.md):
   - design 丙: the wraps of one garment are fused into one piece. One key line runs round the whole garment; between
     the rows there is only a soft darker rim, like chunky knitting; a trim says which garment it is.
   - the three garments are a hat, a scarf and a top. The hat replaces the old lap garment: the game's zone id is still
     `bottom` (saves keep working), and this module draws it on the head. `hat` is accepted as the same zone.
   - an off note leaves a pill of fluff (foldMarkup in ./cat.js), not a fold.
   - a garment with a yarn (g.yarn, ./yarn.js) is a cat in a knitted sleeve: "整件毛衣", the designer's choice of 2026-11-14
     after the test board docs/design/longcat-sleeve-test.md. Head, tail, paws and a short piece of body at each end
     are the cat's own coat, in short fur; the body between is the yarn, with a ribbed cuff where the fur comes out.
     The knitting is thin, medium or thick with the time of day, as fur length was. The scarf has no fringe then (it
     crowded the tail end). A garment without a yarn is drawn as before: the cat itself is the garment.
   - a finished garment can be wrapped by hand (the designer, 2026-11-15: "讓玩家可以自己圍評審 … 可以先圍一圈再圍斜斜的"):
     g.wrap is a list of strokes, each a list of [x, y] in the scene. When steps = 12 and the wrap is good, the
     garment's rows are those strokes, in the order they were drawn (a later one lies over an earlier one), instead
     of ZONES' rows; from there on it is the same garment: sleeve, cuffs, head at the end of the last stroke, tail
     at the start of the first, pills, the sung shape of each step spread along the whole length. wrapArea says
     where each garment may be drawn (the hat on the head, the scarf round the neck, the top on the body) and how
     much cat there is. The game keeps the strokes inside it; this module only draws what it is given.
   Guests come from ./guests.js. */
import { f, num, int, clamp, quad, sample, dPath, rng, hash } from "../util.js";
import { FUR, lookOf, animalId, kindId, zoneId, timeId } from "../palettes.js";
import { ZONES as OLD, moodOf } from "../garments.js";
import { headFor, tailFor, palFor } from "./guests.js";
import { COATS, KEY, LWC, coatMarkup, pawPair, foldMarkup, foldSpots, catHead, catTail, catTailTucked, petHearts } from "./cat.js";
import { zzPrint } from "./judge.js";
import { yarnOf, sleeveMarkup, yarnPill, KNIT, CAT_W } from "./yarn.js";

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
/* ---- a wrap laid by hand ----
   Where each garment may be wrapped (a polygon in the scene; the middle of the body may go anywhere inside it), the
   part of the picture worth showing while wrapping it, and how long the garment may be: the system's own rows and
   a little more, for a finger's wobble. The areas follow the system's rows and the designer's standing rules: the hat
   leaves the ears and the eyes showing, the scarf dips under the chin so the mouth stays in sight, and the top
   stays on the body. The sides of the scarf's and the top's are the body's own sides, a few units in (the designer,
   2026-11-22: "make sure that the edge of the dotted lines are close to the end of the body so it makes sense
   that it's wrapping around"; the body is judge.js BODY: x 98 to 302 at the neck, 47 to 353 at y 316). The hat's
   reaches the head's sides too (the designer: "帽子也拉寬"), but only under the ears, which stay in sight: between the ears
   (y 100 to 122) it stays inside them; under them it goes out to the head's sides (x 122 / 278 at y 134, measured
   from the drawn head), and it stops at y 134, clear of the eyes (y 151).
   `shut` lists the edges of a shape (as lines of points) where the cat cannot go behind the judge, because the
   judge goes on there: it can only go round where the judge's outline has air beyond it. The scarf's bottom (the designer,
   2026-11-22: "the scarf can't be wrapped around from that direction since there's whole body down there") and
   its whole top, along the neck and under the chin (the designer, the same day: "The scarf should wrap around the right
   shoulder instead of from the neck … The cloth should wrap around the gap of the body not penetrating from
   somewhere"), so the scarf goes round at the shoulders and the sides; the hat's bottom (the face is under it);
   the top's top and bottom. */
const AREA = {
  hat: { poly: [[158, 86], [242, 86], [257, 104], [259, 119], [275, 124], [278, 134], [122, 134], [125, 124], [141, 119], [143, 104]], view: [78, 34, 244, 226], shut: [[[278, 134], [122, 134]]] },
  /* the sides of these two run on the body's own outline, as drawn (measured from the BODY path: x 96.4 at y 253,
     80.4 at 263, 67.5 at 276, 57 at 292, 50 at 308, 47.3 at 316, 44.7 at 326, 42.2 at 340, 40.5 at 356, 40 from 372).
     They were a few units inside it, and with the outline's own thickness that read as a gap (the designer, 2026-11-22: "Can
     you match the dotted lines to get closer to the edge of body?") */
  scarf: { poly: [[96.4, 253], [128, 253], [160, 269], [240, 269], [272, 253], [303.6, 253], [312.7, 258], [319.6, 263], [327.3, 270], [332.5, 276], [338.3, 284], [343, 292], [346.9, 300], [350.1, 308], [352.7, 316], [47.3, 316], [49.9, 308], [53.1, 300], [57, 292], [61.7, 284], [67.5, 276], [72.7, 270], [80.4, 263], [87.3, 258]], view: [16, 176, 368, 250], shut: [[[352.7, 316], [47.3, 316]], [[96.4, 253], [128, 253], [160, 269], [240, 269], [272, 253], [303.6, 253]]] },
  top: { poly: [[44.7, 326], [355.3, 326], [357.8, 340], [359.5, 356], [360, 372], [360, 400], [40, 400], [40, 372], [40.5, 356], [42.2, 340]], view: [10, 216, 380, 268], shut: [[[44.7, 326], [355.3, 326]], [[360, 400], [40, 400]]] },
};
export function wrapArea(zone) {
  const z = drawZone(zone);
  if (!z) return null;
  const own = FINE[z].reduce((a, F) => a + F.len, 0), P = AREA[z].poly;
  /* enough cat for as many whole turns, side to side across the middle of the shape, as the game's own rows, and
     half a turn more: a turn by hand runs the whole width, which can be longer than a row of the game's */
  const ys = P.map(p => p[1]), mid = (Math.min(...ys) + Math.max(...ys)) / 2;
  let l = Infinity, r = -Infinity;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [ax, ay] = P[j], [bx, by] = P[i];
    if (ay > mid !== by > mid) { const x = ax + (mid - ay) / (by - ay) * (bx - ax); l = Math.min(l, x); r = Math.max(r, x); }
  }
  const turns = Math.round((ZONES[z].rows.length + .5) * (r - l) * 1.08);
  return { zone: z, poly: P.map(p => [...p]), view: [...AREA[z].view], shut: AREA[z].shut.map(line => line.map(p => [...p])), own: Math.round(own), max: Math.max(Math.round(own * 1.1), turns), min: 60, stroke: 30 };
}
/* A finger's line made soft: laid out again in even 5 px steps, then each point pulled towards its neighbours a few
   times (the two ends stay). No turn is left much tighter than half a sleeve, so the sideways offsets the patterns
   and the cuffs use (yarn.js Ln.at) do not kink. */
function soften(P0) {
  let len = 0;
  for (let i = 1; i < P0.length; i++) len += Math.hypot(P0[i][0] - P0[i - 1][0], P0[i][1] - P0[i - 1][1]);
  const n = Math.max(2, Math.round(len / 5));
  let P = [P0[0], ...sample(P0, n).map(q => [q.x, q.y]), P0[P0.length - 1]];
  for (let k = 0; k < 5; k++) P = P.map((p, i) => (i === 0 || i === P.length - 1 ? p : [(P[i - 1][0] + 2 * p[0] + P[i + 1][0]) / 4, (P[i - 1][1] + 2 * p[1] + P[i + 1][1]) / 4]));
  return P;
}
/* the strokes of a wrap as rows of body samples ({ pts, len }), or null when there is nothing to draw */
function wrapRows(wrap) {
  if (!Array.isArray(wrap)) return null;
  const rows = [];
  for (const s of wrap.slice(0, 12)) {
    if (!Array.isArray(s)) continue;
    const P = [];
    for (const p of s.slice(0, 200)) {
      if (!Array.isArray(p) || !Number.isFinite(+p[0]) || !Number.isFinite(+p[1]) || p[0] === null || p[1] === null) continue;
      const q = [clamp(+p[0], 0, 400), clamp(+p[1], 0, 500)], l = P[P.length - 1];
      if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > .5) P.push(q);
    }
    if (P.length < 2) continue;
    const Q = soften(P);
    let len = 0;
    for (let i = 1; i < Q.length; i++) len += Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]);
    if (len < 14) continue;
    rows.push({ pts: sample(Q, Math.max(8, Math.round(len / 3))), len });
  }
  return rows.length ? rows : null;
}
/* which way a row runs at one of its ends (1 = to the right), read over its last few samples, not one */
const dirAt = (pts, end) => { const n = pts.length, a = end ? pts[Math.max(0, n - 8)] : pts[0], b = end ? pts[n - 1] : pts[Math.min(n - 1, 7)]; return b.x - a.x < 0 ? -1 : 1; };

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
  const yarn = yarnOf(g.yarn), cat = animal === "cat", pal = palFor(animal, look), hd = Math.sign(Z.rows[0][3] - Z.rows[0][2]);
  /* inside a sleeve the cat is short-furred and a little narrower than the knitting */
  const F = yarn ? FUR.short : FUR[look.fur], w = yarn ? CAT_W : F.w;
  const shapes = Array.isArray(g.shapes) ? g.shapes : [], tuftFlags = Array.isArray(g.tufts) ? g.tufts : [], folds = Array.isArray(g.folds) ? g.folds : [];
  const R = rng(hash(`${ctx.seed || 0}|${zone}`));
  const phase = Array.from({ length: 12 }, () => R() * Math.PI * 2);
  const glow = g.glow == null ? 0 : int(g.glow, 0, 12, 0);
  const mood = moodOf(g, time), face = FACE_OF_MOOD[mood];
  let under = "", newSeg = null;
  const rows = [];
  /* a finished garment the player has wrapped by hand: its rows are the strokes */
  const custom = steps === 12 ? wrapRows(g.wrap) : null;
  const total = custom ? custom.reduce((a, r) => a + r.len, 0) : 0;
  if (custom) {
    let g0 = 0;
    custom.forEach((row, r) => {
      const n = row.pts.length;
      const pts = row.pts.map((c, i) => {
        const u = clamp((g0 + (i + .5) / n * row.len) / total * 12, 0, 11.999), s = Math.floor(u), t = u - s;
        const v = shapeAt(shapes[s], t);
        const off = (v == null ? .3 * Math.sin(t * Math.PI * 2 + phase[s]) : v) * AMP * Math.sin(t * Math.PI);
        return { x: c.x - c.ty * off, y: c.y + c.tx * off, tx: c.tx, ty: c.ty };
      });
      rows.push({ r, n, pts, g0, len: row.len });
      g0 += row.len;
    });
  }
  else ROWS[zone].forEach((row, r) => {
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
      if (seg.length > 1) newSeg = seg;
    }
    rows.push({ r, n, pts });
  });
  /* one key line round the whole garment: every row's line first, then every row's fur with a soft rim under the higher rows */
  let art = rows.map(({ pts }) => `<g fill="${KEY}">${tufts(pts, w, F, LW)}</g>` + st(pts, KEY, w + 2 * LW)).join("");
  let pills = "";
  const S = yarn ? sleeveMarkup(rows, yarn, KNIT[time]) : null;
  /* a pill sits on the knitting when there is some under it, on the fur otherwise */
  const pillAt = (i, j, n) => {
    const R0 = S && S.rows[i];
    if (!R0 || R0.s1 - R0.s0 < 12) return foldMarkup(rows[i].pts[j], w, pal);
    return yarnPill(R0.Ln.at(clamp((j + .5) / n * R0.Ln.len, R0.s0 + 5, R0.s1 - 5)), S.ws, yarn);
  };
  rows.forEach(({ r, n, pts }, i) => {
    const patches = [];
    for (let c = 0; c * 24 < n; c++) patches.push({ pattern: look.pattern, pts: Array.from({ length: 12 }, (_, j) => (c * 24 + 2 * j < n ? pts[c * 24 + 2 * j] : null)) });
    art += (i ? st(pts, pal.furDk, w + 2.2) : "") + `<g fill="${pal.fur}">${tufts(pts, w, F, 0)}</g>` + st(pts, pal.fur, w) + coatMarkup(patches, w, pal, cat ? 1 : .55);
    for (let k = 0; !custom && k < Z.per; k++) {
      const s = r * Z.per + k;
      if (s >= steps) break;
      for (const x of foldSpots(folds[s], tuftFlags[s])) {
        const j = clamp(Math.round((k + x) / Z.per * ZN), 2, n - 3);
        if (j >= 2) pills += pillAt(i, j, n);
      }
    }
  });
  /* by hand: each step's pills at its place along the whole length */
  if (custom) for (let s = 0; s < 12; s++) for (const x of foldSpots(folds[s], tuftFlags[s])) {
    const d = (s + x) / 12 * total, i = Math.max(0, rows.findIndex(r => d < r.g0 + r.len)), r = rows[i];
    pills += pillAt(i, clamp(Math.round((d - r.g0) / r.len * r.n), Math.min(2, r.n - 1), Math.max(0, r.n - 3)), r.n);
  }
  const first = rows[0].pts[0], lastRow = rows[rows.length - 1].pts, end = lastRow[lastRow.length - 1], tucked = mood === "asleep";
  /* which way the tail end and the head end run: the rows' own way, or the way the player drew them */
  const hdT = custom ? dirAt(rows[0].pts, false) : hd, hdH = custom ? dirAt(lastRow, true) : hd;
  /* the trim that says which garment it is: fringe on the scarf, a ribbed hem on the top, a ribbed brim on the hat */
  let trim = "";
  if (zone === "scarf" && !S) trim = [-7, -2, 3, 8].map(dx => `<path d="M${f(first.x + 8 + dx)} ${f(first.y + w * .45)}v${f(13 - Math.abs(dx) * .4)}" fill="none" ${keyLine(1.6)}/>`).join("");
  let rib = "";
  if (zone !== "scarf" && !S) { const S0 = rows[0].pts; for (let i = 3; i < S0.length; i += 4) rib += `M${f(S0[i].x)} ${f(S0[i].y + w * .1)}v${f(w * .36)}`; }
  /* on a sleeve the ribbed hem runs along the lower edge of the knitting's first row */
  if (zone !== "scarf" && S && S.piece) { const A = S.piece[0]; for (let s = A.s0 + 7; s < A.s1 - 3; s += 5.2) { const sd = custom ? (A.Ln.at(s).tx < 0 ? -1 : 1) : hd, a = A.Ln.at(s, sd * S.ws * .16), b = A.Ln.at(s, sd * S.ws * .46); rib += `M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}`; } }
  const tail = cat ? (tucked ? catTailTucked : catTail)(kind, first.x - hdT * 2, first.y + 2, hdT, w * .38, pal) : tailFor(animal, kind, first.x - hdT * 2, first.y + 2, hdT, w * .38, pal, tucked);
  const hind = zone === "hat" ? "" : pawPair(first.x + hdT * 12, first.y + w * .5, hdT, .9, pal);
  const hx = end.x + hdH * Math.abs(Z.headDx), hy = end.y + Z.headDy - num(ctx.headLift);
  const tailG = ctx.animate && !tucked ? `<g class="lc-tail ${hdT > 0 ? "lc-tail-l" : "lc-tail-r"}">${tail}</g>` : tail;
  /* The step just sung. the designer, 2026-11-14: the wide cream light under the piece "seems a little distracting"; of five
     options (docs/design/longcat-cat-highlight-options.html) the designer chose B with a little of A.
     B: the whole cat hops once and three print sparkles twinkle for two seconds, then they are gone (only when
     animated). The little of A, a thin amber rim round the new piece, came out again the same day: the designer asked for it
     to be removed. Nothing is drawn under or round the cat; with reduced motion the step just sung is not marked. */
  let mark = "";
  if (newSeg) {
    const a = newSeg[0], b = newSeg[newSeg.length - 1], mid = newSeg[newSeg.length >> 1], T = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const star = (x, y, k, i) => `<g transform="translate(${f(x)} ${f(y)})"><path class="lc-new-spark" style="animation-delay:${f(.25 + i * .18)}s" d="M0 ${f(-7 * k)}Q${f(1.2 * k)} ${f(-1.2 * k)} ${f(7 * k)} 0Q${f(1.2 * k)} ${f(1.2 * k)} 0 ${f(7 * k)}Q${f(-1.2 * k)} ${f(1.2 * k)} ${f(-7 * k)} 0Q${f(-1.2 * k)} ${f(-1.2 * k)} 0 ${f(-7 * k)}Z" fill="#efe6d2" stroke="${KEY}" stroke-width="1.3" stroke-linejoin="round"/></g>`;
    if (ctx.animate) mark = star(hx + (b.x - a.x) / T * 29, hy - 15, 1, 0) + star(a.x - hd * 6, a.y - w * .5 - 14, .8, 1) + star(mid.x, mid.y - w * .5 - 20, 1.15, 2);
  }
  const hop = s => (newSeg && ctx.animate ? `<g class="lc-new-hop">${s}</g>` : s);
  const beat = { hat: 1.5, top: 7, scarf: 12.5 }[zone];
  const headM = cat ? catHead(hx, hy, hdH, face, .95, pal, kind, ctx.animate ? beat : null) : headFor(animal, kind, hx, hy, hdH, face, .95, pal, ctx.animate ? beat : null);
  const head0 = pawPair(end.x + hdH * 3, end.y + 12, hdH, 1, pal) + headM;
  /* animated: an awake cat stretches now and then (each garment at its own moment); a sleeping one breathes */
  /* animated: the head can be patted (data-tap; the whole garment answers through data-group): it nuzzles and hearts rise */
  const head = (ctx.animate ? `<g data-tap="cat" data-group="g-${zone}" data-zone="${zone}">${hop(`<g class="${tucked ? "lc-snooze" : "lc-stretch"}" style="--lc-d:${hdH};animation-delay:${-beat}s"><g class="lc-nuzzle">${head0}</g></g>`)}${petHearts(hx, hy - 26)}</g>` : head0) + (mood === "asleep" ? zzPrint(hx + 14, hy - 20) : "");
  const artAll = trim + tailG + hind + art + (S ? S.art : "") + (rib ? `<path d="${rib}" stroke="${S ? S.rim : pal.furDk}" stroke-width="1.5" stroke-linecap="round" fill="none"/>` : "") + (S && S.cuffs ? S.cuffs : "") + pills;
  /* how high the garment reaches at scene x: the top of its fur within 9 px of x, and the top of the cat's head when
     that is under x. Infinity where nothing is there yet. The judge's fruit is seated on this (hatOnHead) */
  const furTop = S ? S.top : w / 2 + (F.tuftR > .51 || F.fluff ? Math.max(0, w * F.tuftR + F.fluff - w / 2) : 0);
  const topAt = x => {
    let top = Infinity;
    for (const { pts } of rows) for (const p of pts) if (Math.abs(p.x - x) <= 9) top = Math.min(top, p.y - furTop);
    const dx = Math.max(0, Math.abs(x - hx) - 8);
    if (dx < 18) top = Math.min(top, hy - 18.5 * Math.sqrt(1 - (dx / 19.5) ** 2));
    return top;
  };
  return { under: hop(under), art: ctx.animate ? `<g data-tap="cat" data-group="g-${zone}" data-zone="${zone}">${hop(artAll)}</g>` : artAll, head: head + mark, headAt: { x: hx, y: hy }, topAt };
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
