/* Winding the cat round the judge by hand: the geometry and the gesture, with no page in it (ui/wrap.js draws).
   the designer, 2026-11-22, after trying the first version, where a finger's line was kept as drawn: "手指畫起來的感覺很像是在
   畫畫 像是在畫平面的直線 我想要手指的感覺是把貓咪在水豚繞一圈的感覺".
   So the finger no longer draws; it takes the cat round, a whole turn at a time (the designer, the same day, from a recording
   where half turns piled up in the middle: "限制玩家一定要圍到範圍的邊緣 … 玩家從這一步就一定得繞到後面 繞到後面後有
   圍成一個圓圈 再讓貓頭從那個位置從前面出現").
   - Across the front the cat is taut: one smooth band from the edge it came out of to where the finger is, curved
     the way the game's own rows curve round that part of the judge. Going back along it takes it up again, and so
     does lifting the finger or leaving the shape any other way: a band counts only when it reaches the far edge.
     There it is laid, edge to edge, and that is one turn.
   - From there the cat has to go round the back. Behind the judge it follows the finger's own path ("順著玩家手指畫
     出來的線走"), wherever that goes, until the finger is at the other edge or past it. Lifting the finger on the way
     leaves the cat behind the judge, waiting; the next touch goes on from there.
   - Round at the other edge, it waits with its head just past the judge's side, and comes out there, at the height
     the finger is at, when the finger comes onto the shape on that half. Then the next band starts.
   A band is a list of [x, y] in the scene, kept inside the garment's shape, the same thing the art already draws
   (art/print/garments.js wrapRows). */
export const EDGE = 13;  // scene units outside the shape that still count as on it: a finger is not a pen
export const NEAR = 0.08; // this share of the width from a side is at that side: where a turn ends and the cat comes out

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

/* The winding of one garment, over as many touches as it takes. down / move / up take scene points; `room` is how
   much cat is left. Each answers what to show now and what has just been laid:
     live    the band being pulled across the front (points), or null
     back    the cat's way round the back so far (points, as the finger went; it may leave the shape), or null
     head    where the cat's head is, or null
     commit  a turn that is now laid for good (points, edge to edge), or null
     spent   true when there is no cat left to go on with
     short   (up only) true when a band was let go before the far edge, so it was taken up again
   `mode` is where the cat is: "start" (not on yet: the first band may come from either side), "front" (a band is
   being pulled), "back" (behind the judge, on its way round), "armed" (round, waiting to come out at `side`).
   reset() puts it back to "start" (a turn was undone). */
export function winder({ poly, sag = 0, stroke = 30, edge = EDGE }) {
  let mode = "start", touching = false, A = null, side = 0, home = "start", path = [], live = null, spent = false;
  const uOf = (q) => { const e = span(poly, q[1]); return (q[0] - e.l) / (e.r - e.l || 1); };
  const edgeAt = (s, y) => { const e = span(poly, y); return [s < 0 ? e.l : e.r, e.y]; };
  /* the way round so far, a little softened: the finger's own line, not a straight one */
  const way = (end = null) => {
    const P = end ? [...path, end] : path;
    return P.map((q, i) => (i === 0 || i === P.length - 1 ? q : [(P[i - 1][0] + 2 * q[0] + P[i + 1][0]) / 4, (P[i - 1][1] + 2 * q[1] + P[i + 1][1]) / 4]));
  };
  const peek = (y) => { const E = edgeAt(side, y); return [E[0] + side * 12, E[1]]; };
  function move(q, room) {
    const rawIn = inside(poly, q[0], q[1]), nr = rawIn ? null : nearest(poly, q[0], q[1]);
    const isIn = rawIn || nr.d <= edge, p = rawIn ? q : nr.p, uq = uOf(q);
    const R = { live: null, back: null, head: null, commit: null, spent: false };
    if (!touching || spent) return R;
    if (mode === "back") {
      /* `side` is the side it will come out of: the finger has to get there */
      const last = path[path.length - 1];
      if (Math.hypot(q[0] - last[0], q[1] - last[1]) >= 3) { path.push(q); if (path.length > 400) path.splice(1, 1); }
      if (side < 0 ? uq <= NEAR : uq >= 1 - NEAR) mode = "armed";
      else { R.back = way(); R.head = q; return R; }
    }
    if (mode === "start" && isIn) {
      if (room < stroke) { spent = R.spent = true; return R; }
      side = uOf(p) < 0.5 ? -1 : 1; home = "start"; mode = "front";
      A = edgeAt(side, p[1]);
    } else if (mode === "armed") {
      /* it comes out when the finger is on the shape, on the half it waits at */
      const onHalf = side < 0 ? uq < 0.5 : uq > 0.5;
      if (isIn && onHalf && room >= stroke) { home = "armed"; mode = "front"; A = edgeAt(side, p[1]); }
      else {
        if (isIn && onHalf) spent = R.spent = true;
        R.head = peek(q[1]); R.back = way(R.head);
        return R;
      }
    }
    if (mode !== "front") return R;
    /* a band from the edge it came out of (`side`) towards the other one */
    const far = side < 0 ? uq >= 1 - NEAR : uq <= NEAR;
    if (far) {
      /* there: the turn is laid edge to edge, and the cat goes round the back from this edge */
      let P = taut(poly, A, edgeAt(-side, p[1]), sag);
      const all = lenOf(P) >= room;
      if (all) { P = cut(P, room); spent = R.spent = true; }
      R.commit = P; live = null;
      path = [P[P.length - 1]]; mode = "back"; // round the back it comes out of the same side again
      if (!all) { R.back = way(); R.head = P[P.length - 1]; }
      return R;
    }
    if (!isIn) { live = null; mode = home; return R; } // off the shape before the far edge: taken up again
    const P = taut(poly, A, p, sag);
    if (lenOf(P) >= room) { R.commit = cut(P, room); spent = R.spent = true; live = null; mode = "start"; return R; }
    live = R.live = P;
    R.head = p;
    return R;
  }
  return {
    down(q, room) { touching = true; spent = false; live = null; return move(q, room); },
    move,
    up() { const short = mode === "front" && !!live; if (mode === "front") mode = home; touching = false; live = null; return { commit: null, short }; },
    /* what to show with no finger down: the cat behind the judge where it was left, or waiting at its side */
    still(y) {
      const R = { live: null, back: null, head: null, commit: null, spent: false };
      if (mode === "back" && path.length > 1) { R.back = way(); R.head = path[path.length - 1]; }
      else if (mode === "armed") { R.head = peek(y); R.back = way(R.head); }
      return R;
    },
    reset() { mode = "start"; home = "start"; side = 0; path = []; live = null; A = null; },
    get mode() { return mode; },
    get side() { return side; },
  };
}
