/* Winding the cat round the judge by hand: the geometry and the gesture, with no page in it (ui/wrap.js draws).
   the designer, 2026-11-22, after trying the first version, where a finger's line was kept as drawn: "手指畫起來的感覺很像是在
   畫畫 像是在畫平面的直線 我想要手指的感覺是把貓咪在水豚繞一圈的感覺".
   So the finger no longer draws; it pulls the cat round.
   - Across the front the cat is taut: one smooth band from where it came out to where the finger is, curved the way
     the game's own rows curve round that part of the judge. Going back along it takes it up again.
   - Past the far edge, or turning back near it, the cat goes round the back. That pass lays nothing in front.
   - Behind, the cat follows the finger too, all the way (the designer, 2026-11-22, from a recording: it "snaps to the front
     immediately" when it came out a fifth of the way early). It comes out only when the finger is right at the far
     side or past it, or turns back near it; then the next band starts from that edge, at the finger's height. To and fro, or round and round, both wind it: every other pass is behind.
   - A band still ends where the finger is lifted, so a short or slanted turn is as easy as before.
   A band is a list of [x, y] in the scene, kept inside the garment's shape, the same thing the art already draws
   (art/print/garments.js wrapRows). */
export const EDGE = 13;  // scene units outside the shape that still count as on it: a finger is not a pen
export const TURN = 0.2; // the outer fifth of the shape, on each side: where a pass starts from the edge and may turn
const BACK = 0.07;       // how far back from the far side the finger must come for it to be a turn
const FAR = 0.3;         // behind the judge: how near the far side a turn back brings the cat out
const BACK_B = 0.04;     // and how far back the finger must come there
const PAST = 0.03;       // behind the judge: this near the far side is at it

export const lenOf = (P) => { let n = 0; for (let i = 1; i < P.length; i++) n += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return n; };
export function inside(poly, x, y) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
/* where the line from a (one side of the shape's edge) to b (the other side) crosses the edge, near enough */
export function crossing(poly, a, b) {
  let lo = a, hi = b;
  const inLo = inside(poly, a[0], a[1]);
  for (let k = 0; k < 7; k++) { const m = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2]; if (inside(poly, m[0], m[1]) === inLo) lo = m; else hi = m; }
  return inLo ? lo : hi;
}
/* the nearest point of the shape's edge, and how far away it is */
export function nearest(poly, x, y) {
  let best = null;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i], dx = bx - ax, dy = by - ay;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    const px = ax + dx * u, py = ay + dy * u, d = Math.hypot(x - px, y - py);
    if (!best || d < best.d) best = { d, p: [px, py] };
  }
  return best;
}
/* a line cut to a length */
export function cut(P, max) {
  const out = [P[0]];
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (acc + d >= max) { const u = d ? (max - acc) / d : 0; out.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u]); return out; }
    acc += d;
    out.push(P[i]);
  }
  return out;
}
/* the shape's left and right edge at a height (a height above or below the shape reads as its top or bottom) */
export function span(poly, y) {
  let lo = Infinity, hi = -Infinity;
  for (const p of poly) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
  const yy = Math.max(lo + 0.5, Math.min(hi - 0.5, y));
  let l = Infinity, r = -Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i];
    if (ay > yy !== by > yy) { const x = ax + ((yy - ay) / (by - ay)) * (bx - ax); l = Math.min(l, x); r = Math.max(r, x); }
  }
  return { l, r, y: yy };
}
const bend = (A, C, F, n) => { const P = []; for (let i = 0; i <= n; i++) { const t = i / n, k = 1 - t; P.push([k * k * A[0] + 2 * t * k * C[0] + t * t * F[0], k * k * A[1] + 2 * t * k * C[1] + t * t * F[1]]); } return P; };
/* The cat pulled taut from A to F across the front. `sag` is how far a band right across the shape hangs (or, when
   negative, rises) in its middle, as a share of the shape's width, twice over (it is where the curve's handle goes,
   like the rows in art/garments.js); a shorter band is a piece of the same curve. Points that would leave the shape
   stay on its edge. */
export function taut(poly, A, F, sag = 0) {
  const c = Math.hypot(F[0] - A[0], F[1] - A[1]);
  if (c < 0.5) return [A, F];
  const e = span(poly, (A[1] + F[1]) / 2), off = (sag * c * c) / Math.max(40, e.r - e.l);
  return bend(A, [(A[0] + F[0]) / 2, (A[1] + F[1]) / 2 + off], F, Math.max(6, Math.min(40, Math.round(c / 7))))
    .map((q) => (inside(poly, q[0], q[1]) ? q : nearest(poly, q[0], q[1]).p));
}

/* One finger's gesture on one garment's shape. down / move / up take scene points; `room` is how much cat is left.
   Each answers what to show now and what has just been laid:
     live    the band being pulled across the front (points), or null
     back    the cat on its way round the back (points; it may run past the shape's sides), or null
     head    where the cat's head is, or null
     commit  a band that is now laid for good (points), or null
     spent   true when there is no cat left to go on with */
export function winder({ poly, sag = 0, stroke = 30, edge = EDGE }) {
  let mode = "up", A = null, B = null, out = 0, from = 0, peak = null, bpeak = null, live = null, prev = null, prevIn = false, spent = false;
  const uOf = (q) => { const e = span(poly, q[1]); return (q[0] - e.l) / (e.r - e.l || 1); };
  const edgeAt = (s, y) => { const e = span(poly, y); return [s < 0 ? e.l : e.r, e.y]; };
  /* from where it left the front (a little past the side, since it goes round), behind the judge, to the finger */
  const behind = (q) => {
    const e = span(poly, q[1]), G = [Math.max(e.l - 14, Math.min(e.r + 14, q[0])), e.y], S = [B[0] + out * 12, B[1]];
    const c = Math.hypot(G[0] - S[0], G[1] - S[1]), off = (-0.6 * sag * c * c) / Math.max(40, e.r - e.l);
    return bend(S, [(S[0] + G[0]) / 2, (S[1] + G[1]) / 2 + off], G, Math.max(4, Math.min(30, Math.round(c / 9))));
  };
  function move(q, room) {
    const rawIn = inside(poly, q[0], q[1]), nr = rawIn ? null : nearest(poly, q[0], q[1]);
    const isIn = rawIn || nr.d <= edge, p = rawIn ? q : nr.p, uq = uOf(q);
    const R = { live: null, back: null, head: null, commit: null, spent: false };
    const done = () => { prev = q; prevIn = isIn; return R; };
    const goBack = (side, at) => { mode = "back"; out = side; B = at; live = null; bpeak = null; R.back = behind(q); R.head = R.back[R.back.length - 1]; };
    if (mode === "up" || spent) return done();
    if (mode === "back") {
      /* how far round it has got, and the furthest it has been: it comes out at the far side, or when the finger
         turns back near there */
      const prog = -out * uq;
      if (bpeak === null || prog > bpeak) bpeak = prog;
      const past = out > 0 ? uq <= PAST : uq >= 1 - PAST, far = out > 0 ? -bpeak <= FAR : bpeak >= 1 - FAR;
      if (past || (far && bpeak - prog >= BACK_B)) { mode = "armed"; from = -out; }
      else { R.back = behind(q); R.head = R.back[R.back.length - 1]; }
    }
    if (mode === "armed" && isIn) {
      if (room < stroke) { spent = R.spent = true; return done(); }
      if (prev && !prevIn && rawIn) A = crossing(poly, prev, q);
      else if (from) A = edgeAt(from, p[1]);
      else { const u = uOf(p); A = u <= TURN ? edgeAt(-1, p[1]) : u >= 1 - TURN ? edgeAt(1, p[1]) : p; }
      mode = "front"; peak = null; live = null;
    }
    if (mode !== "front") {
      /* come round and waiting: all the way behind, its head just past the side it will come out of */
      if (mode === "armed" && from && B) { R.back = behind([from * 1e6, q[1]]); R.head = R.back[R.back.length - 1]; }
      return done();
    }
    if (!isIn) {
      /* off the shape: by a side, the cat goes round the back; by the top or the bottom, the band just ends */
      const P = live, ok = P && lenOf(P) >= stroke, sideways = uq <= TURN || uq >= 1 - TURN, s = uq > 0.5 ? 1 : -1;
      live = null;
      if (ok) R.commit = P;
      if (ok && sideways) goBack(s, P[P.length - 1]);
      else { mode = "armed"; from = sideways ? s : 0; }
      return done();
    }
    let P = taut(poly, A, p, sag);
    const allOf = (Q) => { R.commit = cut(Q, room); spent = R.spent = true; live = null; mode = "armed"; from = 0; return done(); };
    if (lenOf(P) >= room) return allOf(P);
    const uA = uOf(A), uF = uOf(p);
    if (Math.abs(uF - uA) > 0.2) { const s = uF > uA ? 1 : -1; if (!peak || peak.s !== s || s * uF > s * peak.u) peak = { s, u: uF, q: p }; }
    const far = peak && (peak.s > 0 ? peak.u >= 1 - TURN : peak.u <= TURN);
    if (far && peak.s * (peak.u - uF) >= BACK) {
      /* turned back at the far side without leaving the shape: the band runs to the edge there, and round it goes */
      const E = edgeAt(peak.s, peak.q[1]);
      P = taut(poly, A, E, sag);
      if (lenOf(P) >= room) return allOf(P);
      if (lenOf(P) >= stroke) R.commit = P;
      goBack(peak.s, E);
      return done();
    }
    live = R.live = P;
    R.head = p;
    return done();
  }
  return {
    down(q, room) { mode = "armed"; A = B = peak = bpeak = live = prev = null; out = from = 0; prevIn = spent = false; return move(q, room); },
    move,
    up() { const R = { commit: mode === "front" && live && lenOf(live) >= stroke ? live : null }; mode = "up"; live = null; return R; },
    get mode() { return mode; },
  };
}
