/* Yarn: the knitted sleeve a garment's cat wears (the designer, 2026-11-14: "整件毛衣", docs/design/longcat-sleeve-test.md).
   The cat keeps its own coat on head, tail, paws and a short piece of body at each end; the body between is yarn.
   A yarn is { type, a, b, c }: a pattern and up to three colour ids from YARN_COLORS (a = ground, b = second colour,
   c = a thin third line). Flat colours only, like the rest of the print: a third tone is mixed, never transparent.
   Which yarn a garment has is the game's business (content.js yarnFor); this module only draws one. */
import { f, num, clamp, svgDoc } from "../util.js";
import { KEY, LWC } from "./cat.js";

export const YARN_COLORS = {
  vermilion: "#bf452d", indigo: "#33517a", moss: "#6f8f5a", yuzu: "#ebb229", milk: "#f3ead6", sky: "#7fa3b5",
  plum: "#7b5a8a", teal: "#2f7f80", rose: "#d58c92", wine: "#8f3548", forest: "#3d6b52", navy: "#27395e",
  sea: "#3f8fa6", coral: "#de6f55", lilac: "#a99ac6", mint: "#9cc3a5", slate: "#55607a", lantern: "#f0c24c",
};
export const YARN_TYPES = ["plain", "stripe", "wide", "check", "dots", "zigzag", "diamond", "star", "fairisle", "snowflake", "nordic"];
/* the three that carry an accent line of their own (GPT's designs, picked by the designer on 2026-11-27): c defaults to red */
const ACCENTED = ["fairisle", "snowflake", "nordic"];
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`; };
const dark = (c, t = .2) => mix(c, "#1c1418", t);
const lit = c => mix(c, "#fff6e0", .32);
const col = (id, d) => YARN_COLORS[id] || (typeof id === "string" && /^#[0-9a-f]{6}$/i.test(id) ? id : d);
/* a yarn made safe to draw: null for none; unknown types are plain, unknown colours fall back */
export function yarnOf(y) {
  if (!y || typeof y !== "object") return null;
  const a = col(y.a, YARN_COLORS.vermilion), b = col(y.b, a === YARN_COLORS.milk ? YARN_COLORS.indigo : YARN_COLORS.milk);
  const type = YARN_TYPES.includes(y.type) ? y.type : "plain";
  return { type, a, b, c: col(y.c, ACCENTED.includes(type) ? YARN_COLORS.vermilion : null) };
}
/* knit weight goes with the time of day, as fur length did: thin with a flat edge in the morning, thicker with a
   scalloped edge at golden hour and at night. w = the sleeve's width in the 400 x 500 scene */
export const KNIT = { morning: { w: 21.5, bump: 0 }, golden: { w: 23.5, bump: .53 }, night: { w: 25.5, bump: .57 } };
/* the cat inside is drawn in short fur, a little narrower than any sleeve */
export const CAT_W = 19.5;
const LW = LWC * .9;

/* ---- a row of body samples ({ x, y, tx, ty }) as a line you can walk along by distance ---- */
export function line(pts) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const len = acc[acc.length - 1];
  const at = (s, d = 0) => {
    const t = clamp(s, 0, len);
    let i = 1;
    while (i < acc.length - 1 && acc[i] < t) i++;
    const a = pts[i - 1], b = pts[Math.min(i, pts.length - 1)], L = (acc[Math.min(i, acc.length - 1)] - acc[i - 1]) || 1, u = (t - acc[i - 1]) / L;
    const tx = a.tx + (b.tx - a.tx) * u, ty = a.ty + (b.ty - a.ty) * u, n = Math.hypot(tx, ty) || 1;
    return { x: a.x + (b.x - a.x) * u - ty / n * d, y: a.y + (b.y - a.y) * u + tx / n * d, tx: tx / n, ty: ty / n };
  };
  /* the points from s0 to s1, moved sideways by d */
  const run = (s0, s1, d = 0) => {
    const out = [at(s0, d)];
    for (let i = 0; i < acc.length; i++) if (acc[i] > s0 + .4 && acc[i] < s1 - .4) out.push(at(acc[i], d));
    out.push(at(s1, d));
    return out;
  };
  return { len, at, run };
}
const dp = P => P.map((q, i) => `${i ? "L" : "M"}${f(q.x)} ${f(q.y)}`).join("");
const band = (P, c, w) => (P.length > 1 ? `<path d="${dp(P)}" fill="none" stroke="${c}" stroke-width="${f(w)}" stroke-linejoin="round"/>` : "");
const dot = (p, r, c) => `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(r)}" fill="${c}"/>`;

/* ---- the patterns. Each paints one row's piece between s0 and s1 over the ground colour; `g` is how far along the
   whole garment the row starts, so a pattern runs on from row to row ---- */
function stitches(Ln, s0, s1, w, a, lanes, period) {
  /* plain knitting: rows of small V stitches a little darker than the yarn, the only texture a plain yarn has */
  let out = "";
  const h = w / lanes, c = dark(a, .26);
  for (let k = 0; k < lanes; k++) {
    const mid = -w / 2 + h * (k + .5), P = [];
    for (let s = s0 + 1.5, i = 0; s <= s1 - 1.5; s += period / 2, i++) P.push(Ln.at(s, mid + (i % 2 ? h * .26 : -h * .26)));
    if (P.length > 1) out += `<path d="${dp(P)}" fill="none" stroke="${c}" stroke-width="1.05" stroke-linejoin="round" stroke-linecap="round" opacity=".7"/>`;
  }
  return out;
}
/* For the patterns that know up from down (a row runs either way round the judge): the sideways distance d that is
   `h` towards the top of the picture, on this row */
const upOf = (Ln, s0) => (Ln.at(s0).tx < 0 ? 1 : -1);
/* ribbing: short raised bars across the sleeve, a little lighter than the yarn, as on a brim or a hem */
function ribs(Ln, s0, s1, w, a) {
  let out = "";
  const c = mix(a, "#ffffff", .2), e = w * .4;
  for (let s = s0 + 2.6; s < s1 - 2; s += 4.8) out += `<path d="${dp([Ln.at(s, -e), Ln.at(s, e)])}" fill="none" stroke="${c}" stroke-width="2.9" stroke-linecap="round"/>`;
  return out;
}
/* a lane of small knitted Vs at sideways distance d, their points to the bottom of the picture */
function vLane(Ln, s0, s1, d, up, c, p = 4.6) {
  let out = "";
  for (let s = s0 + p * .7; s < s1 - p * .5; s += p) out += `<path d="${dp([Ln.at(s - 1.7, d + up * 1.6), Ln.at(s, d - up * 1.5), Ln.at(s + 1.7, d + up * 1.6)])}" fill="none" stroke="${c}" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>`;
  return out;
}
/* a flower of eight short petals, the knitted snowflake */
function flower(c, r, colour) {
  let arms = "";
  for (let k = 0; k < 8; k++) { const q = k * Math.PI / 4, ux = Math.cos(q), uy = Math.sin(q); arms += `M${f(c.x + ux * r * .25)} ${f(c.y + uy * r * .25)}L${f(c.x + ux * r)} ${f(c.y + uy * r)}`; }
  return `<path d="${arms}" fill="none" stroke="${colour}" stroke-width="${f(r * .55)}" stroke-linecap="round"/>`;
}
const across = (Ln, s0, s1, g, p, each) => { let out = ""; for (let k = Math.floor((g + s0) / p); k * p < g + s1; k++) out += each(k, Math.max(s0, k * p - g), Math.min(s1, (k + 1) * p - g)); return out; };
const PAINT = {
  plain: (Ln, s0, s1, w, y, g, K) => stitches(Ln, s0, s1, w, y.a, K.bump ? 2 : 3, K.bump ? 7 : 5.5),
  /* narrow stripes across the sleeve */
  stripe: (Ln, s0, s1, w, y, g) => across(Ln, s0, s1, g, 6.5, (k, a, b) => (k % 2 ? band(Ln.run(a, b), y.b, w) : "")),
  /* wide stripes, with a thin line of the third colour at each change */
  wide: (Ln, s0, s1, w, y, g) => across(Ln, s0, s1, g, 17, (k, a, b) => (k % 2 ? band(Ln.run(a, b), y.b, w) : "") + (y.c && b - a > 3 ? band(Ln.run(a, Math.min(b, a + 2.2)), y.c, w) : "")),
  /* gingham: two lanes, squares of ground, mixed and second colour */
  check: (Ln, s0, s1, w, y, g) => {
    const m = mix(y.a, y.b, .5);
    return band(Ln.run(s0, s1, -w / 4), m, w / 2) + across(Ln, s0, s1, g, w / 2, (k, a, b) => (k % 2 ? band(Ln.run(a, b, w / 4), m, w / 2) + band(Ln.run(a, b, -w / 4), y.b, w / 2) : ""));
  },
  /* dots in two staggered lanes */
  dots: (Ln, s0, s1, w, y, g) => {
    let out = "";
    for (let k = Math.ceil((g + s0 + 3.2) / 8.5); k * 8.5 < g + s1 - 3.2; k++) out += dot(Ln.at(k * 8.5 - g, k % 2 ? w * .22 : -w * .22), 2.9, y.b);
    return out;
  },
  /* one zigzag line down the middle */
  zigzag: (Ln, s0, s1, w, y, g) => {
    const P = [];
    for (let k = Math.ceil((g + s0 + 1.5) / 5.5); k * 5.5 < g + s1 - 1.5; k++) P.push(Ln.at(k * 5.5 - g, k % 2 ? w * .2 : -w * .2));
    return P.length > 1 ? `<path d="${dp(P)}" fill="none" stroke="${y.b}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` : "";
  },
  /* argyle: a chain of diamonds with a thin crossing line */
  diamond: (Ln, s0, s1, w, y, g) => {
    let out = "", cross = "";
    const h = w * .44, p = 2 * h;
    for (let k = Math.ceil((g + s0) / p); (k + 1) * p <= g + s1; k++) {
      const a = k * p - g;
      out += `<path d="${dp([Ln.at(a), Ln.at(a + h, -w * .46), Ln.at(a + p), Ln.at(a + h, w * .46)])}Z" fill="${y.b}"/>`;
      cross += `<path d="${dp([Ln.at(a, -w * .46), Ln.at(a + p, w * .46)])}${dp([Ln.at(a, w * .46), Ln.at(a + p, -w * .46)])}" fill="none" stroke="${y.c || lit(y.a)}" stroke-width="1.1"/>`;
    }
    return out + cross;
  },
  /* GPT's hat (the designer's pick, 2026-11-27): a Fair Isle beanie. The lowest row is the brim, ribbed; the next a band of
     small Vs, cream under red; the rows above carry little cream sprigs (a stem and three Vs opening upwards) */
  fairisle: (Ln, s0, s1, w, y, g, K, i = 0, n = 1) => {
    const up = upOf(Ln, s0);
    if (i === 0 && n > 1) return ribs(Ln, s0, s1, w, y.a);
    if (i === 1 && n > 2) return vLane(Ln, s0, s1, -up * w * .2, up, y.b) + vLane(Ln, s0, s1, up * w * .18, up, y.c);
    let out = "";
    for (let k = Math.ceil((g + s0 + 5) / 11); k * 11 < g + s1 - 5; k++) {
      const s = k * 11 - g, h = w * .3;
      let d = `${dp([Ln.at(s, -up * h), Ln.at(s, up * h)])}`;
      for (const t of [-.45, 0, .45]) d += dp([Ln.at(s - 3, up * (t * h + 2.8)), Ln.at(s, up * t * h), Ln.at(s + 3, up * (t * h + 2.8))]);
      out += `<path d="${d}" fill="none" stroke="${y.b}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return out;
  },
  /* GPT's scarf: a thick cowl. A pale zigzag runs along the rows at the edges, each with a red line outside it; the
     middle row carries cream snowflakes */
  snowflake: (Ln, s0, s1, w, y, g, K, i = 0, n = 1) => {
    const up = upOf(Ln, s0), pale = mix(y.a, y.b, .55), mid = n > 2 && i === Math.floor(n / 2);
    if (mid) { let out = ""; for (let k = Math.ceil((g + s0 + 8) / 24); k * 24 < g + s1 - 8; k++) out += flower(Ln.at(k * 24 - g), w * .3, y.b); return out; }
    const side = i === 0 ? -1 : 1, P = [];
    for (let k = Math.ceil((g + s0 + 1) / 4.6); k * 4.6 < g + s1 - 1; k++) P.push(Ln.at(k * 4.6 - g, up * (k % 2 ? w * .17 : -w * .17) - up * side * w * .06));
    return (P.length > 1 ? `<path d="${dp(P)}" fill="none" stroke="${pale}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` : "")
      + band(Ln.run(s0, s1, up * side * w * .36), y.c, 2.6);
  },
  /* GPT's top: a Nordic band. The lowest row is the hem, ribbed; the rows above carry two cream zigzags that meet
     and part, with a red diamond in each opening */
  nordic: (Ln, s0, s1, w, y, g, K, i = 0, n = 1) => {
    if (i === 0 && n > 1) return ribs(Ln, s0, s1, w, y.a);
    const p = 12, top = [], bot = [];
    let gems = "";
    for (let k = Math.ceil((g + s0) / (p / 2)); k * p / 2 < g + s1; k++) {
      const s = k * p / 2 - g, wide = k % 2 === 0;
      top.push(Ln.at(s, wide ? w * .38 : w * .12)); bot.push(Ln.at(s, wide ? -w * .38 : -w * .12));
      if (wide && s - p * .3 > s0 && s + p * .3 < s1) gems += `<path d="${dp([Ln.at(s - p * .27), Ln.at(s, -w * .17), Ln.at(s + p * .27), Ln.at(s, w * .17)])}Z" fill="${y.c}"/>`;
    }
    const zz = P => (P.length > 1 ? `<path d="${dp(P)}" fill="none" stroke="${y.b}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` : "");
    return gems + zz(top) + zz(bot);
  },
  /* a band of small eight-pointed stars down the middle, a dotted line along each edge */
  star: (Ln, s0, s1, w, y, g) => {
    let out = "";
    for (let k = Math.ceil((g + s0 + 5) / 13); k * 13 < g + s1 - 5; k++) {
      const c = Ln.at(k * 13 - g), r = w * .2;
      const arms = [0, 45, 90, 135].map(a => { const q = a * Math.PI / 180, ux = Math.cos(q) * c.tx - Math.sin(q) * c.ty, uy = Math.cos(q) * c.ty + Math.sin(q) * c.tx, rr = a % 90 ? r * .72 : r; return `M${f(c.x - ux * rr)} ${f(c.y - uy * rr)}L${f(c.x + ux * rr)} ${f(c.y + uy * rr)}`; }).join("");
      out += `<path d="${arms}" fill="none" stroke="${y.b}" stroke-width="1.7" stroke-linecap="round"/>`;
    }
    for (let s = Math.ceil((g + s0 + 2) / 4.4) * 4.4 - g; s < s1 - 2; s += 4.4) out += dot(Ln.at(s, -w * .37), 1.15, y.b) + dot(Ln.at(s, w * .37), 1.15, y.b);
    return out;
  },
};
/* a ribbed cuff across the sleeve at distance s: where the cat's own fur comes out */
export function cuff(Ln, s, w, y) {
  const h = w / 2 + 1.4, L = 3.2;
  let ribs = "";
  for (let k = -2; k <= 2; k++) ribs += dp([Ln.at(s - L + .6, k * h * .38), Ln.at(s + L - .6, k * h * .38)]);
  return `<path d="${dp([Ln.at(s - L, -h), Ln.at(s + L, -h), Ln.at(s + L, h), Ln.at(s - L, h)])}Z" fill="${dark(y.a, .24)}" stroke="${KEY}" stroke-width="1.9" stroke-linejoin="round"/><path d="${ribs}" fill="none" stroke="${KEY}" stroke-width=".95" opacity=".55"/>`;
}
/* what an off note leaves on knitting: a small ball of the yarn with a loose loop. Never a hole. sc scales it */
export function yarnPill(q, w, y, sc = 1) {
  const x = num(q.x), yy = num(q.y), r = Math.min(6, w * .26) * sc, k = `stroke="${KEY}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<g class="lc-pill"><path d="M${f(x + r * .3)} ${f(yy - r * .6)}q${f(r * 1.6)} ${f(-r * 2.4)} ${f(r * 2.3)} ${f(-r * .5)}q${f(r * .3)} ${f(r * 1.5)} ${f(-r * 1.2)} ${f(r)}" fill="none" ${k} stroke-width="${f(1.5 * sc)}"/><circle cx="${f(x)}" cy="${f(yy)}" r="${f(r)}" fill="${lit(y.a)}" ${k} stroke-width="${f(1.7 * sc)}"/><path d="M${f(x - r * .5)} ${f(yy - r * .1)}q${f(r * .5)} ${f(-r * .55)} ${f(r)} 0" fill="none" ${k} stroke-width="${f(sc)}"/></g>`;
}

/* The sleeve over the rows of one garment. rows = [{ pts }] lowest first, as garments.js lays them out; y = yarnOf();
   K = KNIT[time]. Returns { art, rows } where rows gain { Ln, g, s0, s1 } (the part of each row under the sleeve),
   or null when nothing can be drawn. The cat's own body is drawn by the caller, under this. */
export function sleeveMarkup(rowsIn, y, K) {
  const ws = K.w, rows = rowsIn.filter(r => r.pts && r.pts.length > 1).map(r => ({ ...r, Ln: line(r.pts) }));
  if (!rows.length) return null;
  /* how much fur shows: a short piece by the tail, and a collar that clears the head. Short garments keep less */
  const total = rows.reduce((a, r) => a + r.Ln.len, 0), k = clamp(total / 80, .45, 1);
  const GA = 9 * k, GB = Math.max(GA + 2, total - (19 + 8 * k));
  let g0 = 0;
  for (const r of rows) { r.g = g0; g0 += r.Ln.len; r.s0 = clamp(GA - r.g, 0, r.Ln.len); r.s1 = clamp(GB - r.g, 0, r.Ln.len); }
  const piece = rows.filter(r => r.s1 - r.s0 > 1);
  if (!piece.length) return { art: "", rows, ws, top: ws / 2 };
  /* a row that goes on round the judge ends round; an end where fur comes out ends square, under its cuff */
  const ends = (r, c, wd) => (r.s0 < .01 && r.g > 0 ? dot(r.Ln.at(0), wd / 2, c) : "") + (r.s1 > r.Ln.len - .01 && r.g + r.Ln.len < total - .01 ? dot(r.Ln.at(r.s1), wd / 2, c) : "");
  const bumps = (r, c, extra) => {
    if (!K.bump) return "";
    let o = "", i = 0;
    for (let s = r.s0 + ws * .3; s < r.s1 - ws * .2; s += ws * .42, i++) o += dot(r.Ln.at(s), ws * (i % 2 ? K.bump + .05 : K.bump) + extra, c);
    return o;
  };
  /* one key line round the whole sleeve, then each row's yarn with a soft darker rim under the higher rows */
  let art = piece.map(r => bumps(r, KEY, LW) + band(r.Ln.run(r.s0, r.s1), KEY, ws + 2 * LW) + ends(r, KEY, ws + 2 * LW)).join("");
  const rim = dark(y.a, .3);
  piece.forEach((r, i) => {
    const P = r.Ln.run(r.s0, r.s1);
    art += (i ? band(P, rim, ws + 2.2) + ends(r, rim, ws + 2.2) : "") + bumps(r, y.a, 0) + band(P, y.a, ws) + ends(r, y.a, ws) + PAINT[y.type](r.Ln, r.s0, r.s1, ws, y, r.g, K, i, piece.length);
  });
  const A = piece[0], B = piece[piece.length - 1];
  return { art, cuffs: cuff(A.Ln, A.s0, ws, y) + cuff(B.Ln, B.s1, ws, y), rows, piece, ws, rim: dark(y.a, .34), top: ws / 2 + (K.bump ? Math.max(0, ws * K.bump - ws / 2) : 0) };
}

/* one yarn as a short straight piece of sleeve with its two cuffs (96 x 40): for pickers */
export function yarnSwatchSvg(yIn, time = "morning") {
  const y = yarnOf(yIn) || yarnOf({}), K = KNIT[time] || KNIT.morning;
  const Ln = line(Array.from({ length: 30 }, (_, i) => ({ x: 6 + i * 2.9, y: 20, tx: 1, ty: 0 }))), P = Ln.run(0, Ln.len);
  /* a swatch shows a pattern's middle course, not its brim */
  return svgDoc("0 0 96 40", band(P, KEY, K.w + 2 * LW) + band(P, y.a, K.w) + PAINT[y.type](Ln, 0, Ln.len, K.w, y, 0, K, 2, 3) + cuff(Ln, 3.2, K.w, y) + cuff(Ln, Ln.len - 3.2, K.w, y));
}
/* the colours a simple drawing needs to stand for a yarn (the lane cat while singing): ground, second colour, and
   how the second colour repeats along the body: [dash, gap, round] in body-width units, or null for none */
export function yarnInk(yIn) {
  const y = yarnOf(yIn);
  if (!y) return null;
  const rep = { stripe: [.3, .3, 0], wide: [.75, .75, 0], check: [.5, .5, 0], dots: [0, .5, 1], zigzag: [.12, .2, 0], diamond: [0, 1, 1], star: [0, .62, 1], fairisle: [0, .62, 1], snowflake: [0, 1.1, 1], nordic: [0, 1, 1] }[y.type] || null;
  return { a: y.a, b: y.b, rep, rim: dark(y.a, .3), lit: lit(y.a) };
}
