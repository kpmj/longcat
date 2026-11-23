/* Wrap it yourself (the designer, 2026-11-15: "讓玩家可以自己圍評審 … 直接在 main page 給玩家圍"). Opened by the button at
   the top of Home, on the Home page itself: the picture closes in on one part of the judge and the player draws
   on it with a finger.
   - The game wraps a garment while it is being sung and when its twelfth step is done, as before. Only a finished
     garment can be wrapped again, and only where it belongs: the hat on the head, the scarf round the neck, the top
     on the body (the dashed shape; the art's wrapArea).
   - The finger does not draw: it pulls the cat round (the designer, 2026-11-22: "我想要手指的感覺是把貓咪在水豚繞一圈的感覺";
     the gesture is ui/wind.js). Across the front the cat is a taut band from where it came out to the finger, curved
     the way that part of the judge is round; past the far side, or turning back there, it goes round the back, and
     it comes out again on the other side at the finger's height. To and fro or round and round, every other pass is
     behind the judge. Each pass across the front is one turn; a slanted pass is a slanted turn; lifting the finger
     ends the turn there. Later turns lie over earlier ones.
   - There is only so much cat: a bar shows how much is left, and a line stops when it is used up.
   - Every turn is kept at once (state.js setWrap). Undo takes the last turn off; "Wrap it for me" puts the game's
     own wrap back at once.
   The wrap shows wherever the garment does: Home, the Wardrobe, the singing screen, and the postcards taken from
   then on (a postcard keeps the wrap it was taken with). */
import { app, show, esc, $, $$, toast, closeSheet } from "./app.js";
import * as St from "../state.js";
import { sceneParts, wrapArea, wardrobeThumbSvg, YARN_COLORS } from "../art/index.js";
import { garmentName, timeById } from "../content.js";
import { winder, lenOf } from "./wind.js";
import { catIconSvg } from "./home-art.js";

const PART = { bottom: "head", scarf: "neck", top: "body" };
/* how the game's own rows curve on each part (art/garments.js): the handle of a band right across, as a share of the
   shape's width. The hat's rows rise over the head; the scarf hangs under the chin; the top hangs a little. */
const SAG = { hat: -0.12, scarf: 0.19, top: 0.07 };
const total = (strokes) => (strokes || []).reduce((a, s) => a + lenOf(s), 0);
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
  closeSheet(true); // the garment picker may have opened by itself just before
  root.classList.add("wrap-mode");
  $("#dock").hidden = true;
  let strokes = null, W = null, liveLen = 0, dragging = false;
  let band = null, backD = "", painted = 0, later = 0; // the band being pulled, the way round the back, and when the picture was last drawn

  const area = () => wrapArea(cur.zone);
  const leftOf = () => Math.max(0, area().max - total(strokes));
  const spec = () => St.garmentSpec(S, place, cur.time, cur.zone);
  const inkOf = () => { const g = spec(); return (g.yarn && YARN_COLORS[g.yarn.a]) || "#e8d9b8"; };
  /* The part of the picture on show: as wide as the art says for this garment, as tall as the screen has room for,
     and never past the picture's own edges. Both layers use it, so a point of one is the same point of the other. */
  function viewBox() {
    const [x, y, w, h] = area().view, r = $(".wrap-stage", root).getBoundingClientRect();
    const tall = Math.min(500, r.width > 0 && r.height > 0 ? (w * r.height) / r.width : h);
    return `${x} ${Math.round(Math.max(0, Math.min(500 - tall, y + h / 2 - tall / 2)))} ${w} ${Math.round(tall)}`;
  }
  /* the picture: the judge with this one garment, close up. While a wrap is being drawn it shows the turns so far */
  function paintPicture() {
    const g = spec(), lay = band ? [...(strokes || []), band] : strokes;
    const worn = !lay ? [g] : lay.length ? [{ ...g, wrap: lay }] : [];
    clearTimeout(later); later = 0; painted = performance.now();
    const p = sceneParts({ place, time: cur.time, face: "neutral", garments: worn, baskets: [], cushion: null, special: St.specialFor(place), animate: false, seed: 3, landscape: true });
    $("#wrap-base", root).innerHTML = `<svg viewBox="${viewBox()}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${p.L.back}${p.special}${p.L.seat}<g id="wrap-behind"><path d="${backD}" fill="none" stroke="#262122" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><path d="${backD}" fill="none" stroke="${inkOf()}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/></g>${p.character}${p.L.front}</svg>`;
  }
  function paintOver() {
    const A = area(), d = `M${A.poly.map((q) => q.join(" ")).join("L")}Z`, ink = inkOf();
    const head = catIconSvg(spec(), cur.zone, cur.time).replace("<svg ", '<svg x="-20" y="-11" width="40" height="39.2" ');
    $("#wrap-over", root).innerHTML = `<svg viewBox="${viewBox()}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Pull the cat across the judge’s ${PART[cur.zone]} and round, to wrap the ${esc(garmentName(cur.time, cur.zone).toLowerCase())}">
      <path d="${d}" fill="#fffdf6" fill-opacity=".1" stroke="#262122" stroke-width="3.4" stroke-linejoin="round" stroke-opacity=".55"/>
      <path d="${d}" fill="none" stroke="#fffdf6" stroke-width="1.8" stroke-linejoin="round" stroke-dasharray="5 6"/>
      <path id="wrap-ghost" fill="none" stroke="#fffdf6" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 11"/>
      <path id="wrap-live-key" fill="none" stroke="#262122" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <path id="wrap-live" fill="none" stroke="${ink}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>
      <g id="wrap-head" hidden>${head}</g></svg>`;
    W = winder({ poly: A.poly, sag: SAG[A.zone] || 0, stroke: A.stroke });
    wirePointer($("#wrap-over svg", root));
  }
  function paintTray() {
    const A = area(), left = leftOf(), n = strokes ? strokes.length : 0, name = garmentName(cur.time, cur.zone).toLowerCase();
    const say = strokes === null
      ? `Pull the cat across the ${PART[cur.zone]} and keep going, to and fro: it goes round the back and comes out the other side.`
      : left < A.stroke ? "That’s all of the cat. Undo a turn, or leave it like this."
        : !strokes.length ? "Pull it right across. Past the side, the cat goes round the back."
          : total(strokes) < A.min ? "A little more: this is too short to wear."
          : "Keep going: each time across the front is one turn. Start higher or lower, or slant it.";
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
    band = null; backD = "";
    paintPicture(); paintOver(); paintTray();
    const on = $(".wrap-pick.on", root);
    if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---- winding (the gesture itself is ui/wind.js) ---- */
  const dOf = (P) => (P && P.length > 1 ? `M${P.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L")}` : "");
  /* the picture, at most once a frame's worth of time (a timer, not an animation frame: those can be held back) */
  function paintSoon() {
    if (performance.now() - painted >= 16) paintPicture();
    else if (!later) later = setTimeout(paintPicture, 16);
  }
  /* A band long enough to be a turn is drawn by the picture itself, as the garment's last turn: the real cat in its
     sleeve, its head at the finger. A shorter one is a plain band with the cat's face on it, on top. The way round
     the back is a dotted line on top and a band under the judge, which shows only where it passes the judge's side. */
  function showLive(r) {
    const A = area(), L = (r && r.live) || null, real = !!L && lenOf(L) >= A.stroke, had = !!band;
    band = real ? thin(L) : null;
    backD = dOf(r && r.back);
    const d = real ? "" : dOf(L);
    $("#wrap-live", root)?.setAttribute("d", d);
    $("#wrap-live-key", root)?.setAttribute("d", d);
    $("#wrap-ghost", root)?.setAttribute("d", backD);
    $$("#wrap-behind path", root).forEach((el) => el.setAttribute("d", backD));
    const h = $("#wrap-head", root);
    if (h) {
      const on = !!L && !real && !!r.head;
      h.toggleAttribute("hidden", !on);
      if (on) h.setAttribute("transform", `translate(${r.head[0].toFixed(1)} ${r.head[1].toFixed(1)})`);
    }
    if (band || had) paintSoon();
    liveLen = L ? lenOf(L) : 0;
    if (strokes !== null) $("#wrap-left", root).style.width = `${Math.round((Math.max(0, leftOf() - liveLen) / area().max) * 100)}%`;
  }
  /* what the gesture answered: a band begun, a band laid, the cat run out */
  function apply(r) {
    /* the first band of a new wrap takes the game's wrap off */
    if ((r.live || r.commit) && strokes === null) { strokes = []; paintPicture(); paintTray(); }
    if (r.commit) { strokes.push(thin(r.commit)); band = null; keep(); paintPicture(); paintPicks(); paintTray(); }
    else if (r.spent) toast("That’s all of the cat. Undo a turn first.");
    showLive(r);
  }
  function wirePointer(svg) {
    const at = (e) => { const m = svg.getScreenCTM(); if (!m) return null; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return [p.x, p.y]; };
    svg.onpointerdown = (e) => {
      const q = at(e);
      if (!q) return;
      e.preventDefault();
      dragging = true;
      try { svg.setPointerCapture(e.pointerId); } catch { /* an old browser: the cat still follows inside the picture */ }
      apply(W.down(q, leftOf()));
    };
    svg.onpointermove = (e) => { if (!dragging) return; const q = at(e); if (q) { e.preventDefault(); apply(W.move(q, leftOf())); } };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      const r = W.up(), had = !!band;
      band = null;
      if (r.commit) apply(r);
      /* nothing long enough was laid: the game's wrap is back */
      else if (strokes && !strokes.length) { strokes = St.wrapOf(S, place, cur.time, cur.zone); paintPicture(); paintTray(); }
      else if (had) paintPicture();
      showLive(null);
    };
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
