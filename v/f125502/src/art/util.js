/* Small helpers shared by every art file. Nothing here touches the DOM. */

export const FONT = `font-family="Nunito, Helvetica Neue, Arial, PingFang TC, sans-serif"`;
/* a rough text width: Latin glyphs about .56 em, CJK glyphs 1 em */
export const textWidth = (s, size) => [...String(s == null ? "" : s)].reduce((a, c) => a + (/[\u0000-\u024f]/.test(c) ? (/[A-Z]/.test(c) ? .66 : /[ilj.,'!|]/.test(c) ? .3 : .55) : 1), 0) * size;

/* a number for markup: one decimal, never NaN or undefined */
export const f = v => {
  const n = +v;
  if (!Number.isFinite(n)) return "0";
  const r = Math.round(n * 10) / 10;
  return String(r === 0 ? 0 : r);
};
export const num = (v, d = 0) => (Number.isFinite(+v) && v !== null && v !== "" ? +v : d);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const int = (v, a, b, d = a) => clamp(Math.round(num(v, d)), a, b);

/* caller text: strings and finite numbers only, anything else is empty */
export const txt = v => (typeof v === "string" ? v : typeof v === "number" && Number.isFinite(v) ? String(v) : "");
/* text for markup */
export const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* deterministic randomness: a string hash and a small PRNG */
export function hash(s) {
  let h = 2166136261;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed) {
  let a = (typeof seed === "number" && Number.isFinite(seed) ? seed : hash(seed)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* a quadratic curve as points (the first point excluded) */
export const quad = (a, c, b, n = 6) => {
  const o = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    o.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return o;
};
/* n evenly spaced samples along a polyline, each with its unit tangent */
export function sample(pts, n = 36) {
  const Ls = [];
  let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(d); tot += d; }
  const out = [];
  let seg = 0, acc = 0;
  for (let i = 0; i < n; i++) {
    const target = (i + .5) / n * tot;
    while (seg < Ls.length - 1 && acc + Ls[seg] < target) { acc += Ls[seg]; seg++; }
    const L = Ls[seg] || 1, t = (target - acc) / L, a = pts[seg], b = pts[seg + 1] || a;
    out.push({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, tx: (b[0] - a[0]) / L, ty: (b[1] - a[1]) / L });
  }
  return out;
}
export const dPath = pts => pts.map((q, i) => `${i ? "L" : "M"}${f(q.x)} ${f(q.y)}`).join("");

/* a nested svg used to place one drawing inside another without ids (nested svgs clip by themselves) */
export const inset = (x, y, w, h, vb, body) => `<svg x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
export const svgDoc = (vb, body, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${extra}>${body}</svg>`;
