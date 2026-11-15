/* Wrap it yourself (the designer, 2026-11-15: "讓玩家可以自己圍評審 … 直接在 main page 給玩家圍"). Opened by the button at
   the top of Home, on the Home page itself: the picture closes in on one part of the judge and the player draws
   on it with a finger.
   - The game wraps a garment while it is being sung and when its twelfth step is done, as before. Only a finished
     garment can be wrapped again, and only where it belongs: the hat on the head, the scarf round the neck, the top
     on the body (the dashed shape; the art's wrapArea).
   - Each line drawn inside the shape is one turn of the garment. A line that leaves the shape ends there (the cat
     goes round the back) and a new one starts where the finger comes in again, so going to and fro wraps it round
     and round; a slanted line is a slanted turn. Later turns lie over earlier ones.
   - There is only so much cat: a bar shows how much is left, and a line stops when it is used up.
   - Every turn is kept at once (state.js setWrap). Undo takes the last turn off; "Wrap it for me" puts the game's
     own wrap back at once.
   The wrap shows wherever the garment does: Home, the Wardrobe, the singing screen, and the postcards taken from
   then on (a postcard keeps the wrap it was taken with). */
import { app, show, esc, $, $$, toast } from "./app.js";
import * as St from "../state.js";
import { sceneParts, wrapArea, wardrobeThumbSvg, YARN_COLORS } from "../art/index.js";
import { garmentName, timeById } from "../content.js";

const PART = { bottom: "head", scarf: "neck", top: "body" };
const lenOf = (P) => { let n = 0; for (let i = 1; i < P.length; i++) n += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return n; };
const total = (strokes) => (strokes || []).reduce((a, s) => a + lenOf(s), 0);
function inside(poly, x, y) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
/* where the line from a (one side of the shape's edge) to b (the other side) crosses the edge, near enough */
function crossing(poly, a, b) {
  let lo = a, hi = b;
  const inLo = inside(poly, a[0], a[1]);
  for (let k = 0; k < 7; k++) { const m = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2]; if (inside(poly, m[0], m[1]) === inLo) lo = m; else hi = m; }
  return inLo ? lo : hi;
}
/* the nearest point of the shape's edge, and how far away it is */
function nearest(poly, x, y) {
  let best = null;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i], dx = bx - ax, dy = by - ay;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    const px = ax + dx * u, py = ay + dy * u, d = Math.hypot(x - px, y - py);
    if (!best || d < best.d) best = { d, p: [px, py] };
  }
  return best;
}
/* A finger is not a pen: a little way outside the shape still counts, and the line slides along the edge there.
   Only well outside (EDGE scene units, about a finger's width on a phone) does the line end and go round the back. */
const EDGE = 13;
/* a line cut to a length */
function cut(P, max) {
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
/* few enough points to keep: every other one goes until it fits */
function thin(P) { let Q = P; while (Q.length > St.WRAP_MAX.points) Q = Q.filter((_, i) => i % 2 === 0 || i === Q.length - 1); return Q.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]); }

let cur = null; // { time, zone }: the garment on the table

export function canWrap(S = app.S) { return St.wrappable(S, S.here).length > 0; }

export function openWrap(want = null) {
  const S = app.S, place = S.here, list = St.wrappable(S, place);
  if (!list.length || app.screen !== "home") return;
  const now = St.currentTime(S, place);
  const has = (g) => g && list.some((x) => x.time === g.time && x.zone === g.zone);
  cur = has(want) ? want : has(cur) ? cur : list.find((g) => g.time === now) || list[0];
  const root = $("#screen");
  root.classList.add("wrap-mode");
  $("#dock").hidden = true;
  let strokes = null, live = null, prev = null, prevIn = false, spent = false, dragging = false;

  const area = () => wrapArea(cur.zone);
  const leftOf = () => Math.max(0, area().max - total(strokes));
  const spec = () => St.garmentSpec(S, place, cur.time, cur.zone);
  /* The part of the picture on show: as wide as the art says for this garment, as tall as the screen has room for,
     and never past the picture's own edges. Both layers use it, so a point of one is the same point of the other. */
  function viewBox() {
    const [x, y, w, h] = area().view, r = $(".wrap-stage", root).getBoundingClientRect();
    const tall = Math.min(500, r.width > 0 && r.height > 0 ? (w * r.height) / r.width : h);
    return `${x} ${Math.round(Math.max(0, Math.min(500 - tall, y + h / 2 - tall / 2)))} ${w} ${Math.round(tall)}`;
  }
  /* the picture: the judge with this one garment, close up. While a wrap is being drawn it shows the turns so far */
  function paintPicture() {
    const g = spec();
    const worn = strokes === null ? [g] : strokes.length ? [{ ...g, wrap: strokes }] : [];
    const p = sceneParts({ place, time: cur.time, face: "neutral", garments: worn, baskets: [], cushion: null, special: St.specialFor(place), animate: false, seed: 3, landscape: true });
    $("#wrap-base", root).innerHTML = `<svg viewBox="${viewBox()}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${p.L.back}${p.special}${p.L.seat}${p.character}${p.L.front}</svg>`;
  }
  function paintOver() {
    const A = area(), d = `M${A.poly.map((q) => q.join(" ")).join("L")}Z`, g = spec();
    const ink = (g.yarn && YARN_COLORS[g.yarn.a]) || "#e8d9b8";
    $("#wrap-over", root).innerHTML = `<svg viewBox="${viewBox()}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Draw on the judge’s ${PART[cur.zone]} to wrap the ${esc(garmentName(cur.time, cur.zone).toLowerCase())}">
      <path d="${d}" fill="#fffdf6" fill-opacity=".1" stroke="#262122" stroke-width="3.4" stroke-linejoin="round" stroke-opacity=".55"/>
      <path d="${d}" fill="none" stroke="#fffdf6" stroke-width="1.8" stroke-linejoin="round" stroke-dasharray="5 6"/>
      <path id="wrap-live-key" fill="none" stroke="#262122" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <path id="wrap-live" fill="none" stroke="${ink}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    wirePointer($("#wrap-over svg", root));
  }
  function paintTray() {
    const A = area(), left = leftOf(), n = strokes ? strokes.length : 0, name = garmentName(cur.time, cur.zone).toLowerCase();
    const say = strokes === null
      ? `Draw across the ${PART[cur.zone]}, inside the dashed shape. Each line is one turn of the ${name}.`
      : left < A.stroke ? "That’s all of the cat. Undo a turn, or leave it like this."
        : total(strokes) < A.min ? "A little more: this is too short to wear."
          : "Go on, or lift your finger and start another turn. A slanted line is a slanted turn.";
    $("#wrap-say", root).textContent = say;
    $("#wrap-left", root).style.width = `${Math.round((strokes === null ? 1 : left / A.max) * 100)}%`;
    $("#wrap-meter", root).setAttribute("aria-label", strokes === null ? "All of the cat is left" : `${Math.round((left / A.max) * 100)} percent of the cat is left`);
    $("[data-a=undo]", root).disabled = !n;
    $("[data-a=auto]", root).disabled = strokes === null;
    $$(".wrap-pick", root).forEach((b) => { const on = b.dataset.time === cur.time && b.dataset.zone === cur.zone; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
  }
  function paintPicks() {
    $("#wrap-picks", root).innerHTML = St.wrappable(S, place).map((g) => `<button class="wrap-pick" data-time="${g.time}" data-zone="${g.zone}" aria-label="${esc(garmentName(g.time, g.zone))}, ${esc(timeById(g.time).name.toLowerCase())}${St.wrapOf(S, place, g.time, g.zone) ? ", wrapped by you" : ""}">${wardrobeThumbSvg({ ...St.garmentSpec(S, place, g.time, g.zone) })}<span>${esc(garmentName(g.time, g.zone))}</span></button>`).join("");
    $$(".wrap-pick", root).forEach((b) => (b.onclick = () => { if (dragging) return; pick({ time: b.dataset.time, zone: b.dataset.zone }); }));
  }
  /* keep what there is: long enough to wear, it is the garment's wrap; too short (or nothing), the game's stays */
  function keep() {
    St.setWrap(S, place, cur.time, cur.zone, strokes && total(strokes) >= area().min ? strokes : null);
    app.save();
  }
  function pick(g) {
    cur = g;
    strokes = St.wrapOf(S, place, cur.time, cur.zone);
    live = null;
    paintPicture(); paintOver(); paintTray();
    const on = $(".wrap-pick.on", root);
    if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---- drawing ---- */
  function showLive() {
    const d = live && live.length > 1 ? `M${live.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L")}` : "";
    $("#wrap-live", root)?.setAttribute("d", d);
    $("#wrap-live-key", root)?.setAttribute("d", d);
    if (strokes !== null) $("#wrap-left", root).style.width = `${Math.round((Math.max(0, leftOf() - (live ? lenOf(live) : 0)) / area().max) * 100)}%`;
  }
  function endStroke() {
    const A = area(), P = live;
    live = null;
    showLive();
    if (!P || lenOf(P) < A.stroke) { if (strokes && !strokes.length) strokes = St.wrapOf(S, place, cur.time, cur.zone); paintPicture(); paintTray(); return; }
    strokes.push(thin(P));
    keep();
    paintPicture(); paintPicks(); paintTray();
  }
  function addPoint(q) {
    const room = leftOf();
    const last = live[live.length - 1];
    if (Math.hypot(q[0] - last[0], q[1] - last[1]) < 2.5) return;
    live.push(q);
    if (lenOf(live) >= room) { live = cut(live, room); spent = true; endStroke(); }
  }
  function wirePointer(svg) {
    const at = (e) => { const m = svg.getScreenCTM(); if (!m) return null; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return [p.x, p.y]; };
    const move = (q) => {
      const A = area(), raw = q, rawIn = inside(A.poly, q[0], q[1]), near = rawIn ? null : nearest(A.poly, q[0], q[1]);
      const isIn = rawIn || near.d <= EDGE;
      if (!rawIn && isIn) q = near.p;
      if (spent) { prev = raw; prevIn = isIn; return; }
      if (isIn && !live) {
        if (leftOf() < A.stroke) { spent = true; toast("That’s all of the cat. Undo a turn first."); return; }
        /* the first line of a new wrap takes the game's wrap off */
        if (strokes === null) { strokes = []; paintPicture(); paintTray(); }
        /* coming in from well outside: the line starts on the edge, where the finger crossed it */
        live = [prev && !prevIn && rawIn ? crossing(A.poly, prev, q) : q];
        if (prev && !prevIn && rawIn) addPoint(q);
      } else if (isIn && live) addPoint(q);
      else if (!isIn && live) endStroke();
      prev = raw; prevIn = isIn;
      showLive();
    };
    svg.onpointerdown = (e) => {
      const q = at(e);
      if (!q) return;
      e.preventDefault();
      dragging = true; spent = false; prev = null; prevIn = false; live = null;
      try { svg.setPointerCapture(e.pointerId); } catch { /* an old browser: the line still follows inside the picture */ }
      move(q);
    };
    svg.onpointermove = (e) => { if (!dragging) return; const q = at(e); if (q) { e.preventDefault(); move(q); } };
    const up = () => { if (!dragging) return; dragging = false; if (live) endStroke(); prev = null; };
    svg.onpointerup = up;
    svg.onpointercancel = up;
    svg.onlostpointercapture = up;
  }

  root.innerHTML = `
    <header class="wrap-top">
      <span class="home-pill paper"><b>Wrap it yourself</b></span>
      <button class="btn primary wrap-done" data-a="done">Done</button>
    </header>
    <div class="wrap-stage"><div id="wrap-base"></div><div id="wrap-over"></div></div>
    <section class="wrap-tray paper" aria-label="Wrapping">
      <div class="wrap-picks" id="wrap-picks"></div>
      <p class="wrap-say" id="wrap-say" aria-live="polite"></p>
      <div class="wrap-meter" id="wrap-meter" role="img"><span>Cat left</span><i><u id="wrap-left"></u></i></div>
      <div class="row tight"><button class="btn" data-a="undo">Undo a turn</button><button class="btn" data-a="auto">Wrap it for me</button></div>
    </section>`;
  $("[data-a=done]", root).onclick = () => show("home", { noAutoPick: true });
  $("[data-a=undo]", root).onclick = () => {
    if (!strokes || !strokes.length) return;
    strokes.pop();
    if (!strokes.length) strokes = null;
    keep();
    /* too short to wear without that turn: the game's wrap is back */
    if (strokes && total(strokes) < area().min) strokes = null;
    paintPicture(); paintPicks(); paintTray();
  };
  $("[data-a=auto]", root).onclick = () => {
    strokes = null;
    keep();
    paintPicture(); paintPicks(); paintTray();
    toast(`The ${garmentName(cur.time, cur.zone).toLowerCase()} is wrapped the way it was.`);
  };
  paintPicks();
  pick(cur);
  /* the phone turned, or the window changed: the picture is fitted again (not in the middle of a line) */
  const onResize = () => {
    if (!root.classList.contains("wrap-mode") || !$(".wrap-stage", root)) return window.removeEventListener("resize", onResize);
    if (!dragging) { paintPicture(); paintOver(); }
  };
  window.addEventListener("resize", onResize);
}
