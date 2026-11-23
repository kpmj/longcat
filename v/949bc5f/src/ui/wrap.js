/* Wrap it yourself (the designer, 2026-11-15: "讓玩家可以自己圍評審"). A screen of its own, opened from the Wardrobe: a finished
   garment's choices in Dress up have "Wrap it yourself" (the designer, 2026-11-22: "圍圍巾的ui感覺應該要在 wardrobe 裡面"; it
   used to be a button at the top of Home). The picture closes in on one part of the judge and the player winds the
   cat round it with a finger.
   - It is plainly the player's turn (the designer, 2026-11-22: "It's not clear it's your turn to wrap yourself since the
     existing wrapping hasn't been cleared out yet"). The screen is for one garment. It opens with the wrap the
     garment had fading off the judge; then the judge is bare, the cat waits with its head past the judge's side,
     the shape to wrap is marked and a finger shows the way across. The tray says "Your turn" and, from there on,
     what is happening: across, round the back, across again, how many turns, no cat left.
   - Nothing is kept until "Done", which needs a wrap long enough to wear; "Cancel" leaves the garment as it was.
     A turn laid gives a small tap (where a browser can) and a ring where it ended.
     "Undo a turn" takes the last one off, "Start again" all of them. (The game's own wrap comes back from Dress
     up: "Wrap it for me".) Both ways out go back to Dress up, with that garment in the picture.
   - Only a finished garment can be wrapped, and only where it belongs: the hat on the head, the scarf round the
     neck, the top on the body (the dashed shape; the art's wrapArea).
   - The finger does not draw: it pulls the cat round (the designer, 2026-11-22: "我想要手指的感覺是把貓咪在水豚繞一圈的感覺";
     the gesture is ui/wind.js). Across the front the cat is a taut band from where it came out to the finger, curved
     the way that part of the judge is round; past the far side, or turning back there, it goes round the back, and
     it comes out again on the other side at the finger's height. To and fro or round and round, every other pass is
     behind the judge. Each pass across the front is one turn; a slanted pass is a slanted turn; lifting the finger
     ends the turn there. Later turns lie over earlier ones.
   - There is only so much cat: a bar shows how much is left, and a band stops when it is used up.
   The wrap shows wherever the garment does: Home, the Wardrobe, the singing screen, and the postcards taken from
   then on (a postcard keeps the wrap it was taken with). */
import { app, show, esc, $, $$, toast } from "./app.js";
import * as St from "../state.js";
import { sceneParts, wrapArea, garmentLayers, YARN_COLORS } from "../art/index.js";
import { garmentName } from "../content.js";
import { winder, lenOf, span, taut } from "./wind.js";
import { catIconSvg } from "./home-art.js";
import { buzz } from "./haptic.js";

const PART = { bottom: "head", scarf: "neck", top: "body" };
/* how the game's own rows curve on each part (art/garments.js): the handle of a band right across, as a share of the
   shape's width. The hat's rows rise over the head; the scarf hangs under the chin; the top hangs a little. */
const SAG = { hat: -0.12, scarf: 0.19, top: 0.07 };
const total = (strokes) => (strokes || []).reduce((a, s) => a + lenOf(s), 0);
/* few enough points to keep: every other one goes until it fits */
function thin(P) { let Q = P; while (Q.length > St.WRAP_MAX.points) Q = Q.filter((_, i) => i % 2 === 0 || i === Q.length - 1); return Q.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]); }
const dOf = (P) => (P && P.length > 1 ? `M${P.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L")}` : "");

let onResize = null;

/* can this garment be wrapped by hand (it is finished), and has it been */
export const canWrap = (time, zone, S = app.S) => St.wrappable(S, S.here).some((g) => g.time === time && g.zone === zone);
export const wrappedByHand = (time, zone, S = app.S) => !!St.wrapOf(S, S.here, time, zone);
export const openWrap = (time, zone) => show("wrap", { time, zone });

function render(root, props = {}) {
  const S = app.S, place = S.here, list = St.wrappable(S, place);
  const cur = list.find((g) => g.time === props.time && g.zone === props.zone) || list[0];
  if (!cur) return show("wardrobe");
  const A = wrapArea(cur.zone), name = garmentName(cur.time, cur.zone), part = PART[cur.zone];
  /* the garment as it is kept: what fades off at the start, and what "Cancel" leaves alone */
  const g0 = St.garmentSpec(S, place, cur.time, cur.zone);
  const ink = (g0.yarn && YARN_COLORS[g0.yarn.a]) || "#e8d9b8";
  /* where the cat waits and where the finger's hint runs: across the middle of the shape, left to right */
  const midY = (Math.min(...A.poly.map((q) => q[1])) + Math.max(...A.poly.map((q) => q[1]))) / 2, E = span(A.poly, midY);
  const waitAt = [E.l - 12, E.y], hintD = dOf(taut(A.poly, [E.l, E.y], [E.r, E.y], SAG[A.zone] || 0));

  let strokes = [], dragging = false; // the turns laid on this visit; nothing is kept until Done
  let band = null, backD = "", liveLen = 0, painted = 0, later = 0; // the band being pulled, the way round the back, and when the picture was last drawn
  let hideHead = false; // the garment's head is off the garment: the cat is behind the judge, or just coming out
  let headArt = null, inPic = false, headShown = false; // the cat's own head ({ html, at }), whether the picture has it, whether it is out in the middle layer
  let phase = "";
  const W = winder({ poly: A.poly, sag: SAG[A.zone] || 0, stroke: A.stroke });
  const leftOf = () => Math.max(0, A.max - total(strokes));
  const wearable = () => total(strokes) >= A.min;

  /* The part of the picture on show: as wide as the art says for this garment, as tall as the screen has room for,
     and never past the picture's own edges. Every layer uses it, so a point of one is the same point of another. */
  function viewBox() {
    const [x, y, w, h] = A.view, r = $(".wrap-stage", root).getBoundingClientRect();
    const tall = Math.min(500, r.width > 0 && r.height > 0 ? (w * r.height) / r.width : h);
    return `${x} ${Math.round(Math.max(0, Math.min(500 - tall, y + h / 2 - tall / 2)))} ${w} ${Math.round(tall)}`;
  }
  const scene = (garments) => sceneParts({ place, time: cur.time, face: "neutral", garments, baskets: [], cushion: null, special: St.specialFor(place), animate: false, seed: 3, landscape: true });
  const svg = (inner, more = 'aria-hidden="true"') => `<svg viewBox="${viewBox()}" preserveAspectRatio="xMidYMid meet" ${more}>${inner}</svg>`;

  /* The picture: the judge with the turns laid so far, close up, in two layers (what is behind the judge, and the
     judge) so that a third between them can hold the cat on its way round the back. While a band is pulled it is
     drawn as the garment's last turn. While the cat is behind the judge its head is not on the garment: the same
     head, the art's own, is in the middle layer (showLive). With no turn laid the judge is bare. */
  function paintPicture() {
    const lay = band ? [...strokes, band] : strokes, worn = lay.length ? [{ ...g0, wrap: lay }] : [];
    clearTimeout(later); later = 0; painted = performance.now();
    const p = scene(worn), Lr = garmentLayers(worn[0] || { ...g0, wrap: null }, { time: cur.time, animate: false, seed: 3, ink: p.L.ink });
    inPic = !!(Lr && Lr.head && worn.length && p.character.includes(Lr.head));
    headArt = Lr && Lr.head && (inPic || !worn.length) ? { html: Lr.head, at: [Lr.headAt.x, Lr.headAt.y] } : null;
    $("#wrap-base", root).innerHTML = svg(`${p.L.back}${p.special}${p.L.seat}`);
    $("#wrap-fore", root).innerHTML = svg(`${hideHead && inPic ? p.character.replace(headArt.html, "") : p.character}${p.L.front}`);
    if (headArt) for (const id of ["#wrap-bhead", "#wrap-xhead"]) { const el = $(id, root); if (el) el.innerHTML = `<g class="wrap-bob">${headArt.html}</g>`; }
  }
  /* the layers that stay while the picture is drawn again: behind the judge, and on top */
  function paintLayers() {
    const d = `M${A.poly.map((q) => q.join(" ")).join("L")}Z`;
    $("#wrap-mid", root).innerHTML = svg(`
      <path class="wrap-b" fill="none" stroke="#262122" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="wrap-b" fill="none" stroke="${ink}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>
      <g id="wrap-bhead" hidden></g>`);
    headShown = false;
    const face = catIconSvg(g0, cur.zone, cur.time).replace("<svg ", '<svg x="-20" y="-11" width="40" height="39.2" ');
    $("#wrap-over", root).innerHTML = svg(`
      <path class="wrap-zone" d="${d}" fill="#fffdf6" fill-opacity=".1" stroke="#262122" stroke-width="3.4" stroke-linejoin="round" stroke-opacity=".55"/>
      <path class="wrap-zone wrap-dash" d="${d}" fill="none" stroke="#fffdf6" stroke-width="1.8" stroke-linejoin="round" stroke-dasharray="5 6"/>
      <g id="wrap-hint">
        <path d="${hintD}" fill="none" stroke="${ink}" stroke-width="21" stroke-linecap="round" opacity=".3"/>
        <path d="${hintD}" fill="none" stroke="#fffdf6" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>
        <g class="wrap-finger"><circle r="14" fill="#fffdf6" fill-opacity=".9" stroke="#262122" stroke-width="2.4"/><circle r="5.5" fill="#262122" fill-opacity=".3"/>
          <animateMotion dur="2.4s" repeatCount="indefinite" path="${hintD}" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.7;1"/>
          <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;0.1;0.7;0.85;1"/></g>
      </g>
      <path id="wrap-ghost" fill="none" stroke="#fffdf6" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 11"/>
      <path id="wrap-live-key" fill="none" stroke="#262122" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <path id="wrap-live" fill="none" stroke="${ink}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>
      <g id="wrap-head" hidden>${face}</g>
      <g id="wrap-xhead" hidden></g>
      <circle id="wrap-pop" r="17" fill="none" stroke="#fffdf6" stroke-width="3.2"/>`, `role="img" aria-label="Pull the cat across the judge’s ${part} and round, to wrap the ${esc(name.toLowerCase())}"`);
    wirePointer($("#wrap-over svg", root));
  }
  /* what the tray says: whose turn it is, then what is happening */
  function paintTray() {
    const n = strokes.length, left = leftOf(), turns = `${n} turn${n === 1 ? "" : "s"} round`;
    const [title, say] = phase === "back" ? ["Round the back it goes", "Bring your finger back to the other side."]
      : phase === "wait" ? ["Now across again", "The cat comes out where your finger is."]
      : phase === "pull" && !n ? ["That’s it, right across", "Past the side, the cat goes round the back."]
      : !n ? ["Your turn", `Pull the cat across the ${part}, from one side to the other.`]
      : left < A.stroke ? ["That’s all of the cat", `${turns}. Tap Done, or undo a turn.`]
      : !wearable() ? ["A little more", "This is too short to wear yet."]
      : [turns, "Keep going, to and fro, or tap Done. Start higher or lower, or slant it."];
    $("#wrap-title", root).textContent = title;
    $("#wrap-say", root).textContent = say;
    $("#wrap-left", root).style.width = `${Math.round((Math.max(0, left - liveLen) / A.max) * 100)}%`;
    $("#wrap-meter", root).setAttribute("aria-label", `${Math.round((left / A.max) * 100)} percent of the cat is left`);
    $("[data-a=undo]", root).disabled = !n;
    $("[data-a=clear]", root).disabled = !n;
    $("[data-a=done]", root).disabled = !wearable();
  }

  /* ---- winding (the gesture itself is ui/wind.js) ---- */
  /* the picture, at most once a frame's worth of time (a timer, not an animation frame: those can be held back) */
  function paintSoon() {
    if (performance.now() - painted >= 16) paintPicture();
    else if (!later) later = setTimeout(paintPicture, 16);
  }
  /* A band long enough to be a turn is drawn by the picture itself, as the garment's last turn: the real cat in its
     sleeve, its head at the finger. A shorter one is a plain band with the cat's face on it, on top.
     Round the back (the designer, 2026-11-22: "animate the cat head to the back of the capybara"): the cat is a band in the
     layer under the judge, and its head goes with it there, from where it left the front to where the finger is,
     so the judge hides it; a faint copy on top and a dotted line say where it is.
     Before the first turn the same head waits past the judge's side, and the finger's hint plays.
     `must`: the picture has changed. */
  function showLive(r, must = false) {
    const L = (r && r.live) || null, real = !!L && lenOf(L) >= A.stroke, had = !!band, wasHide = hideHead;
    band = real ? thin(L) : null;
    backD = dOf(r && r.back);
    hideHead = !!backD || (!!L && !real);
    if (must || hideHead !== wasHide) paintPicture();
    else if (band || had) paintSoon();
    const d = real ? "" : dOf(L);
    $("#wrap-live", root)?.setAttribute("d", d);
    $("#wrap-live-key", root)?.setAttribute("d", d);
    $("#wrap-ghost", root)?.setAttribute("d", backD);
    $$("#wrap-mid .wrap-b", root).forEach((el) => el.setAttribute("d", backD));
    const h = $("#wrap-head", root);
    if (h) {
      const on = !!L && !real && !!r.head;
      h.toggleAttribute("hidden", !on);
      if (on) h.setAttribute("transform", `translate(${r.head[0].toFixed(1)} ${r.head[1].toFixed(1)})`);
    }
    /* the head behind the judge: waiting at the side before the first turn; on a way round the back it starts where
       the garment's head was and slides to where the cat has got to */
    const fresh = !strokes.length && !L && !backD, go = !!backD && !!headArt && !!r.head;
    const at = go ? r.head : fresh && headArt ? waitAt : null, b = $("#wrap-bhead", root), x = $("#wrap-xhead", root);
    const move = (el) => (el.style.transform = `translate(${(at[0] - headArt.at[0]).toFixed(1)}px, ${(at[1] - headArt.at[1]).toFixed(1)}px)`);
    if (b) {
      b.toggleAttribute("hidden", !at);
      if (at) {
        if (!headShown) { b.style.transition = "none"; b.style.transform = go ? "translate(0px, 0px)" : ""; if (!go) move(b); b.getBoundingClientRect(); b.style.transition = ""; }
        move(b);
      }
      headShown = !!at;
    }
    if (x) { x.toggleAttribute("hidden", !go); if (go) move(x); }
    $(".wrap-stage", root).classList.toggle("fresh", fresh);
    liveLen = L ? lenOf(L) : 0;
    const now = backD ? (W.mode === "armed" ? "wait" : "back") : L ? "pull" : "rest";
    if (now !== phase || must) { phase = now; paintTray(); }
    else $("#wrap-left", root).style.width = `${Math.round((Math.max(0, leftOf() - liveLen) / A.max) * 100)}%`;
  }
  /* a turn is laid (the designer, 2026-11-22: "add a slight vibration when one wrap is done"): a tap where the phone can
     make one (ui/haptic.js), and a ring that opens where the turn ended, for the phones that cannot */
  function laid(at) {
    buzz(12);
    const c = $("#wrap-pop", root);
    if (!c) return;
    c.setAttribute("cx", at[0].toFixed(1)); c.setAttribute("cy", at[1].toFixed(1));
    c.classList.remove("go"); c.getBoundingClientRect(); c.classList.add("go");
  }
  /* what the gesture answered: a band laid, or the cat run out */
  function apply(r) {
    if (r.commit) { strokes.push(thin(r.commit)); band = null; laid(r.commit[r.commit.length - 1]); }
    else if (r.spent) toast("That’s all of the cat. Undo a turn first.");
    showLive(r, !!r.commit);
  }
  function wirePointer(el) {
    const at = (e) => { const m = el.getScreenCTM(); if (!m) return null; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return [p.x, p.y]; };
    el.onpointerdown = (e) => {
      const q = at(e);
      if (!q) return;
      e.preventDefault();
      dragging = true;
      try { el.setPointerCapture(e.pointerId); } catch { /* an old browser: the cat still follows inside the picture */ }
      apply(W.down(q, leftOf()));
    };
    el.onpointermove = (e) => { if (!dragging) return; const q = at(e); if (q) { e.preventDefault(); apply(W.move(q, leftOf())); } };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      const r = W.up();
      band = null;
      if (r.commit) apply(r); else showLive(null, true);
    };
    el.onpointerup = up;
    el.onpointercancel = up;
    el.onlostpointercapture = up;
  }

  root.innerHTML = `
    <header class="wrap-top">
      <button class="btn wrap-cancel" data-a="cancel">Cancel</button>
      <span class="home-pill paper"><b>${esc(name)}</b></span>
      <button class="btn primary wrap-done" data-a="done" disabled>Done</button>
    </header>
    <div class="wrap-stage fresh"><div id="wrap-base"></div><div id="wrap-mid"></div><div id="wrap-fore"></div><div id="wrap-over"></div><div id="wrap-was"></div></div>
    <section class="wrap-tray paper" aria-label="Wrapping the ${esc(name.toLowerCase())}">
      <h3 class="wrap-title" id="wrap-title" aria-live="polite"></h3>
      <p class="wrap-say" id="wrap-say" aria-live="polite"></p>
      <div class="wrap-meter" id="wrap-meter" role="img"><span>Cat left</span><i><u id="wrap-left"></u></i></div>
      <div class="row tight"><button class="btn" data-a="undo">Undo a turn</button><button class="btn" data-a="clear">Start again</button></div>
    </section>`;
  const back = () => { show("wardrobe", { tab: "dress" }); app.screens.wardrobe.openPiece(cur.zone, cur.time); };
  $("[data-a=cancel]", root).onclick = back;
  $("[data-a=done]", root).onclick = () => {
    if (!wearable()) return;
    St.setWrap(S, place, cur.time, cur.zone, strokes);
    app.save();
    back();
    toast(`The ${name.toLowerCase()} is wrapped your way.`);
  };
  $("[data-a=undo]", root).onclick = () => { if (!strokes.length || dragging) return; strokes.pop(); showLive(null, true); };
  $("[data-a=clear]", root).onclick = () => { if (!strokes.length || dragging) return; strokes = []; showLive(null, true); };
  paintLayers();
  showLive(null, true);
  /* the wrap it had fades off the judge: now it is the player's turn */
  const was = $("#wrap-was", root);
  if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const p = scene([g0]);
    was.innerHTML = svg(`${p.L.back}${p.special}${p.L.seat}${p.character}${p.L.front}`);
    const gone = () => { was.innerHTML = ""; };
    was.onanimationend = gone;
    setTimeout(gone, 1500);
  }
  /* the phone turned, or the window changed: the picture is fitted again (not in the middle of a turn) */
  leave();
  onResize = () => { if (app.screen === "wrap" && $(".wrap-stage", root) && !dragging) { paintLayers(); showLive(null, true); } };
  window.addEventListener("resize", onResize);
}
function leave() { if (onResize) window.removeEventListener("resize", onResize); onResize = null; }
app.screens.wrap = { render, fullscreen: true, leave };
