/* Winding the cat round the judge by hand: the geometry and the gesture, with no page in it (ui/wrap.js draws).
   the designer, 2026-11-22, after trying the first version, where a finger's line was kept as drawn: "手指畫起來的感覺很像是在
   畫畫 像是在畫平面的直線 我想要手指的感覺是把貓咪在水豚繞一圈的感覺".
   So the finger no longer draws; it takes the cat round, a whole turn at a time (the designer, the same day, from a recording
   where half turns piled up in the middle: "限制玩家一定要圍到範圍的邊緣 … 玩家從這一步就一定得繞到後面 繞到後面後有
   圍成一個圓圈 再讓貓頭從那個位置從前面出現").
   And it may go behind, or come out, at any spot of the shape's outline: a side, over a shoulder, a corner (the designer,
   the same day, from a recording where a crisscross turn got stuck: "I want the flexibility to wrap around from any
   spot so user can freely create the shape they want as long as it's wrapped around in a reasonable way").
   "Reasonable" is two rules. A band in front has to go across: at least two fifths of the shape's width sideways.
   And the cat cannot come out where it went in: the spot has to be a fifth of the width away, any way. So it may
   go in at the bottom right and come out over the right shoulder, which is how a crisscross is made.
   - Across the front the cat is taut: one smooth band from the spot it came out at to where the finger is, curved
     the way the game's own rows curve round that part of the judge. Going back along it takes it up again. When the
     finger goes off the shape, anywhere, or is right at a side, the band is laid to that spot of the outline if it
     went across; if it did not, the cat is behind the judge again where it was.
   - Then it is behind. It follows the finger's own path ("順著玩家手指畫出來的線走"), over the shape or off it, and
     nothing is laid. Lifting the finger leaves it there; the next touch goes on.
   - Not every edge of the shape is the judge's outline with air beyond it: the scarf's bottom is only a line
     across the body (the designer, the same day: "we only allow user to keep moving along the bottom dotted line"), and its
     top runs along the neck and under the chin, where the head is (the designer: "The scarf should wrap around the right
     shoulder instead of from the neck"). Such an edge is `shut` (lines of points, from art wrapArea): with the
     finger past it the band's end slides along it and nothing is laid; the cat cannot come out there either. It
     goes round at the shoulders and the sides.
   - It can come out once the finger is off the shape, or right at a side, at a spot away from where it went in.
     From then on its head peeks out at the spot of the outline nearest the finger and goes round the outline with
     it; it comes out there when the finger comes onto the shape.
   A band is a list of [x, y] in the scene, kept inside the garment's shape, the same thing the art already draws
   (art/print/garments.js wrapRows). */
export const NEAR = 0.08; // this share of the width from a side is at that side
export const ACROSS = 0.4; // a band in front goes at least this share of the shape's width sideways
export const APART = 0.2;  // where the cat comes out is at least this share of the width from where it went in
const OFF = 4;            // scene units outside the shape before the finger counts as off it

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
     back    the cat's way round the back so far (points, as the finger went), or null
     head    where the cat's head is, or null
     commit  a turn that is now laid for good (points, outline to outline), or null
     spent   true when there is no cat left to go on with
     short   (up only) true when a band was let go before it had gone across, so it was taken up again
   `mode` is where the cat is: "start" (not on yet), "front" (a band is being pulled), "back" (behind the judge,
   not yet across from where it went in), "armed" (behind, peeking at the outline, ready to come out).
   `side` is the side the next band will come from, as near as can be said (-1 left, 1 right), for a hint.
   reset() puts it back to "start" (a turn was undone). */
export function winder({ poly, sag = 0, stroke = 30, shut = [] }) {
  const ys = poly.map((q) => q[1]), xs = poly.map((q) => q[0]);
  const cen = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const M = span(poly, cen[1]), across = ACROSS * (M.r - M.l), apart = Math.max(30, APART * (M.r - M.l));
  const far = (q) => Math.hypot(q[0] - B[0], q[1] - B[1]) >= apart; // far enough from where it went in to come out
  let mode = "start", touching = false, A = null, B = null, C = null, home = "start", path = [], live = null, spent = false, prev = null, prevOff = true;
  const uOf = (q) => { const e = span(poly, q[1]); return (q[0] - e.l) / (e.r - e.l || 1); };
  /* on an edge where the judge goes on beyond it (`shut`: lines of points), not on its outline with air beyond */
  const seg = (q, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], u = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(q[0] - a[0] - dx * u, q[1] - a[1] - dy * u); };
  const onShut = (q) => shut.some((L) => L.some((a, i) => i > 0 && seg(q, L[i - 1], a) < 0.75));
  const edgeAt = (s, y) => { const e = span(poly, y); return [s < 0 ? e.l : e.r, e.y]; };
  /* the way round so far, a little softened: the finger's own line, not a straight one */
  const way = (end = null) => {
    const P = end ? [...path, end] : path;
    return P.map((q, i) => (i === 0 || i === P.length - 1 ? q : [(P[i - 1][0] + 2 * q[0] + P[i + 1][0]) / 4, (P[i - 1][1] + 2 * q[1] + P[i + 1][1]) / 4]));
  };
  /* its head just outside the outline at C */
  const peek = () => { const d = Math.hypot(C[0] - cen[0], C[1] - cen[1]) || 1; return [C[0] + ((C[0] - cen[0]) / d) * 12, C[1] + ((C[1] - cen[1]) / d) * 12]; };
  function move(q, room) {
    const rawIn = inside(poly, q[0], q[1]), nr = nearest(poly, q[0], q[1]), p = rawIn ? q : nr.p, uq = uOf(p);
    /* past a shut edge the finger is not off the shape: its spot on that edge stands for it */
    const rail = !rawIn && onShut(nr.p), off = !rawIn && nr.d > OFF && !rail;
    /* the spot of the outline the finger is at, if it is at one: off the shape, on its rim, or right at a side */
    const atSide = uq <= NEAR ? -1 : uq >= 1 - NEAR ? 1 : 0;
    const spot = atSide ? edgeAt(atSide, p[1]) : !rawIn && !rail ? nr.p : null;
    const R = { live: null, back: null, head: null, commit: null, spent: false };
    const done = () => { prev = q; prevOff = off; return R; };
    const waiting = () => { R.head = peek(); R.back = way(R.head); return done(); };
    if (!touching || spent) return done();
    if (mode === "back") {
      const last = path[path.length - 1];
      if (Math.hypot(q[0] - last[0], q[1] - last[1]) >= 3) { path.push(q); if (path.length > 400) path.splice(1, 1); }
      if (spot && far(spot)) { mode = "armed"; C = spot; }
      else { R.back = way(); R.head = q; return done(); }
    }
    if (mode === "armed") {
      if (!rawIn) {
        /* off the shape: the head goes round the outline with the finger, or the cat is back where it went in */
        const last = path[path.length - 1];
        if (Math.hypot(q[0] - last[0], q[1] - last[1]) >= 3) { path.push(q); if (path.length > 400) path.splice(1, 1); }
        if (rail && !atSide) return waiting(); // below a shut edge: it stays where it was peeking
        /* at a side, the side itself: a corner of a shut edge is not a way out, the side next to it is */
        const at2 = atSide ? edgeAt(atSide, p[1]) : nr.p;
        if (far(at2)) C = at2;
        else { mode = "back"; R.back = way(); R.head = q; return done(); }
        return waiting();
      }
      if (room < stroke) { spent = R.spent = true; return waiting(); }
      A = C; home = "armed"; mode = "front";
    } else if (mode === "start") {
      if (off || (!rawIn && nr.d > 30)) return done(); // a touch well below a shut edge starts nothing
      if (room < stroke) { spent = R.spent = true; return done(); }
      /* the first band: from where the finger came onto the shape, or from the nearer side */
      const came = prev && prevOff ? nearest(poly, prev[0], prev[1]).p : null;
      A = came && !onShut(came) ? came : edgeAt(uq < 0.5 ? -1 : 1, p[1]);
      home = "start"; mode = "front";
    }
    if (mode !== "front") return done();
    if (spot && Math.abs(spot[0] - A[0]) >= across) {
      /* at the outline, and across: the turn is laid, and the cat goes behind from this spot */
      let P = taut(poly, A, spot, sag);
      const all = lenOf(P) >= room;
      if (all) { P = cut(P, room); spent = R.spent = true; }
      R.commit = P; live = null; B = P[P.length - 1]; path = [B]; mode = all ? "start" : "back";
      if (!all) R.head = B;
      return done();
    }
    if (off) {
      /* off the shape before it had gone across: taken up again; the cat is behind where it was */
      live = null; mode = home;
      if (mode === "armed") return waiting();
      return done();
    }
    const P = taut(poly, A, p, sag);
    if (lenOf(P) >= room) { R.commit = cut(P, room); spent = R.spent = true; live = null; mode = "start"; return done(); }
    live = R.live = P;
    R.head = p;
    return done();
  }
  return {
    down(q, room) { touching = true; spent = false; live = null; prev = null; prevOff = true; return move(q, room); },
    move,
    up() { const short = mode === "front" && !!live; if (mode === "front") mode = home; touching = false; live = null; return { commit: null, short }; },
    /* what to show with no finger down: the cat behind the judge where it was left, or peeking at the outline */
    still() {
      const R = { live: null, back: null, head: null, commit: null, spent: false };
      if (mode === "back" && path.length > 1) { R.back = way(); R.head = path[path.length - 1]; }
      else if (mode === "armed") { R.head = peek(); R.back = way(R.head); }
      return R;
    },
    reset() { mode = "start"; home = "start"; path = []; live = null; A = B = C = null; },
    get mode() { return mode; },
    get side() { return mode === "armed" && C ? (C[0] < cen[0] ? -1 : 1) : mode === "back" && B ? (B[0] < cen[0] ? 1 : -1) : -1; },
  };
}
