/* Home's effects layer (2026-11-28). A place that has one (`motion` from its landscape; the jungle) is drawn in two
   SVG layers with a canvas between them (home-art.js), and here the canvas gets what the designer picked on the
   finer-animation page: the waterfall's spray and its splash when pressed, leaves that turn over as they fall, and
   the sitting monkey with its tail swinging, which hops when pressed. The canvas is in Home's own px; the tall
   picture's units and the print's are turned into them with the layout home-art.js drew with.

   Home is drawn again on a resize and under an open sheet: each time the old canvas leaves the page and its loop
   stops (art/fx.js), and a new one starts here. Nothing runs when the player asks for less motion; the picture then
   keeps its own still monkey, drops and leaves. */
import { makeFx, waterSpray, fallingLeaves, bendingTail, steamWisps, puff, lessMotion } from "../art/fx.js";

export const fxWanted = (art) => !!(art && art.motion && art.layers) && !lessMotion();

export function startHomeFx(el, art, W, H) {
  const M = art.motion, L = art.layout, canvas = el.querySelector("canvas.lc-fx-back");
  el.classList.remove("lc-fx-on", "lc-fx-tail");
  el._lcFx = null;
  if (!canvas) return;
  const fx = makeFx(canvas, { width: W, height: H, fps: 30 });
  const state = { water: null, tail: null };
  if (M.falls) state.water = fx.add(waterSpray({ at: L.tallPx, falls: M.falls, pale: M.falls.pale }));
  /* the hot spring's steam, rising off the pool beside the judge (the print's units) */
  if (M.steam) fx.add(steamWisps({ sources: M.steam.sources.map(([x, y]) => { const p = L.toPx(x, y); return [p.x, p.y]; }), pale: M.steam.pale, scale: L.s }));
  if (M.leaves) {
    const { strips, from, to, greens } = M.leaves;
    state.leaves = fx.add(fallingLeaves({ strips: strips.map(([a, b]) => [L.tallPx(a, 0).x, L.tallPx(b, 0).x]), from: L.tallPx(0, from).y, to: L.tallPx(0, to).y, greens }));
  }
  el.classList.add("lc-fx-on");
  if (M.tail) {
    const img = new Image();
    img.onload = () => {
      if (!canvas.isConnected) return;
      const [x, y, w, h] = M.tail.box, p = L.toPx(x, y), q = L.toPx(x + w, y + h);
      state.tail = fx.add(bendingTail({ img, box: { x: p.x, y: p.y, w: q.x - p.x, h: q.y - p.y, unit: (q.y - p.y) / h }, cut: M.tail.cut, line: M.tail.line, half: M.tail.half }));
      el.classList.add("lc-fx-tail");
    };
    img.src = M.tail.href;
  }
  /* a press on the water splashes; a press on the sitting monkey makes the one on the canvas hop */
  el._lcFx = {
    tap(t) {
      if (t.dataset.tap === "waterfall" && state.water) state.water.splash();
      if (t.dataset.tap === "monkey" && state.tail && t.querySelector(".lc-fx-sit")) state.tail.hop();
      /* the shishi-odoshi pressed: as its tube comes down, the water it held splashes off the stone */
      if (t.dataset.tap === "shishi" && M.shishi) { const p = (M.shishi.tall ? L.tallPx : L.toPx)(M.shishi.at[0], M.shishi.at[1]); setTimeout(() => { if (canvas.isConnected) fx.add(puff({ x: p.x, y: p.y, colours: ["#eef6fa", "#cfe3ea", "#a9c6d6"], count: 12, speed: .7, spread: 1.1, life: [.4, .7] })); }, 150); }
    },
    /* a leaf on the canvas is a thing to press too (the designer, 2026-11-28): it falls quicker, once */
    leafAt: (x, y) => !!(state.leaves && state.leaves.hit(x, y)),
    leafSpots: () => (state.leaves ? state.leaves.positions : []),
  };
  if (!el._lcFxWired) {
    el._lcFxWired = true;
    el.addEventListener("click", (e) => { const t = e.target.closest ? e.target.closest("[data-tap]") : null; if (t && el._lcFx) el._lcFx.tap(t); });
    /* first, before anything behind it answers: a press on a leaf is the leaf's. The leaves fall between the
       scenery and the judge, so what the judge's layer covers is the judge's */
    el.addEventListener("click", (e) => {
      if (!el._lcFx || !el._lcFx.leafAt) return;
      const t = e.target.closest ? e.target.closest("[data-tap]") : null;
      if (t && t.closest(".lc-front")) return;
      const r = el.getBoundingClientRect();
      if (el._lcFx.leafAt(e.clientX - r.left, e.clientY - r.top)) e.stopPropagation();
    }, true);
  }
}

/* a Home without an effects layer: nothing of the last one stays on the element */
export function stopHomeFx(el) {
  el.classList.remove("lc-fx-on", "lc-fx-tail");
  el._lcFx = null;
}
