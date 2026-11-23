/* The wardrobe (the designer, 2026-11-15, board docs/design/longcat-wardrobe-one-page.md, layout 甲). Two tabs:
   - Dress up: one page where dressing the judge and taking a postcard are the same thing. At the top, the picture,
     as wide as the screen (the designer, 2026-11-22: "expand the view a bigger to fill from left to right … so user can see
     better"; it used to be a small picture with a list beside it), framed on the part being dressed. Under it one
     row of tabs: Scarf, Top, Hat, Sky, and the button that takes the postcard. Under them, straight in the page,
     the choices of the tab picked (ui/cats.js paintDress): who sings the garment, which also sets how thick it is
     (content.js knitOf), its yarn, and the way to sing one of its steps again. For the sky: which time of day.
     The top stays put while the choices scroll under it.
     Picking a garment's tab makes that garment hop once on the judge, so it is plain which one it is (the designer,
     2026-11-22: "show a quick highlight on the capybara to indicate what's being selected"). Tapping the picked
     tab again opens its two ways of being wrapped, "Wrap it yourself" (ui/wrap.js) and "Wrap it for me", in a
     strip under the tabs (the designer, the same day: "blend them with scarf, hat and top icon. Like if you click it again
     then you can select"); they used to be a section among the choices.
     The judge wears what was knitted at the picture's time of day, where that is finished, and the newest finished
     garment where it is not: the row that picked each garment's time by hand is gone (the designer, the same day: "we can
     completely remove this ui selection"), because what it seemed to pick, the size, is the cat's now.
     The postcard takes what the picture shows, and needs three finished garments. The sky is only this picture's:
     Home wears the garments of the time of day being knitted. A cat or a yarn changed here is changed everywhere.
   - Album (ui/album.js): the postcards, the mixed ones too.
   Places opens from the chip at the top left of Home (ui/places.js); the cats are in the Store (ui/cats.js). */
import { app, esc, $, $$, wireTaps, paintDock, hopCat, toast } from "./app.js";
import * as St from "../state.js";
import { sceneParts, wardrobeThumbSvg, placeThumbSvg } from "../art/index.js";
import { ZONES, TIMES, STEPS, placeById, timeById } from "../content.js";
import { paintDress } from "./cats.js";
import { canWrap, wrappedByHand, openWrap } from "./wrap.js";
import { renderAlbum, openCard } from "./album.js";

let mode = "dress";

const TABS = [["dress", "Dress up"], ["album", "Album"]];
/* a dot on Album while it holds a postcard not looked at yet */
const segs = () => {
  const fresh = mode !== "album" && St.newIn(app.S, "album");
  return `<div class="segs" role="tablist">${TABS.map(([id, name]) => `<button role="tab" data-mode="${id}" aria-selected="${mode === id}" class="${mode === id ? "on" : ""}">${name}${id === "album" && fresh ? '<i class="dot" aria-label="a new postcard"></i>' : ""}</button>`).join("")}</div>`;
};
function wireSegs(root) { $$(".segs [data-mode]", root).forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(root); })); }
/* no treats up here: they are the Store's (the designer, 2026-11-15) */
const topbar = (S) => `<header class="topbar"><div class="where"><span class="place">Wardrobe</span><span class="time-chip">${esc(placeById(S.here).name)}</span></div></header>`;

/* What the picture shows: { place, bg, set: { zone: time } }. `bg` is the time of day picked (the sky); `set` follows
   from it. It is kept while at this place, and starts again (state.js dressStart) when a garment is finished or a
   new sky is reached, so that the new one is on. */
let pick = null;
function picked(S, place) {
  const reached = St.reachedTimes(S, place), n = `${St.garmentsDone(S, place)}.${reached.length}`;
  if (!(pick && pick.place === place && pick.n === n && reached.includes(pick.bg))) pick = { place, n, bg: St.dressStart(S, place).bg };
  /* each part wears what was knitted at that time of day if it is finished, else the newest finished one */
  const start = St.dressStart(S, place).set;
  pick.set = Object.fromEntries(ZONES.map((z) => [z.id, St.garmentDone(S, place, pick.bg, z.id) ? pick.bg : start[z.id]]));
  return pick;
}
/* the tab whose choices are in the page: a garment, or "sky"; whether its wrap choices are open; and the garment
   to hop once when the page is next drawn */
let sel = ZONES[0].id, menu = false, flash = null;
/* three turns of a wrap. Drawn here until the art session draws one in the print's style */
const WRAP_ICO = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M4 8.5q8 -5 16 0"/><path d="M4 13.5q8 -5 16 0"/><path d="M5.5 18.5q6.5 -4.5 13 0"/></svg>`;

/* The picture is 400 units wide and 350 high, out of the scene's 500: it is framed on what is being dressed (the
   hat and the sky from the top, the scarf a little lower, the top from the chin down to the feet). */
const FRAME = { bottom: 22, sky: 22, scarf: 46, top: 122 }, FRAME_H = 350;

/* ---------- Dress up: the picture, its tabs, then the choices of the tab picked ---------- */
function dressUp(root) {
  const S = app.S, place = S.here, p = picked(S, place), reached = St.reachedTimes(S, place);
  const garments = ZONES.map((z) => St.garmentSpec(S, place, p.set[z.id], z.id));
  const ready = ZONES.every((z) => St.garmentDone(S, place, p.set[z.id], z.id));
  const sc = sceneParts({ place, time: p.bg, garments, baskets: [], cushion: null, special: St.specialFor(place), animate: true, seed: 3, landscape: true });
  const picture = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${FRAME[sel] ?? FRAME.scarf} 400 ${FRAME_H}" preserveAspectRatio="xMidYMin slice" role="img" aria-label="The judge ${esc(placeById(place).at)}, ${esc(timeById(p.bg).name.toLowerCase())}">${sc.L.back}${sc.special}${sc.L.seat}${sc.shelves}${sc.character}${sc.L.front}</svg>`;
  const tab = (z, i) => {
    const t = p.set[z.id], n = St.progress(S, place, t, z.id), name = St.garmentTitle(S, place, t, z.id), on = sel === z.id;
    /* the picked tab of a finished garment says there is more behind it: its wrap */
    const more = on && canWrap(t, z.id);
    return `<button class="dress-tab${on ? " on" : ""}${more ? " more" : ""}" role="tab" data-sel="${z.id}" aria-selected="${on}"${more ? ` aria-expanded="${menu}"` : ""} aria-label="${esc(z.name)}: ${esc(name.toLowerCase())}${n < STEPS ? `, ${n} of ${STEPS} steps` : ""}${more ? ". Tap again for how it is wrapped" : ""}">${wardrobeThumbSvg({ ...garments[i] })}<b>${esc(z.name)}</b><em>${n < STEPS ? `${n} / ${STEPS}` : more ? `Wrap ${menu ? "▴" : "▾"}` : esc(name)}</em></button>`;
  };
  const sky = `<button class="dress-tab${sel === "sky" ? " on" : ""}" role="tab" data-sel="sky" aria-selected="${sel === "sky"}" aria-label="Sky: ${esc(timeById(p.bg).name.toLowerCase())}"><i class="dress-sky">${placeThumbSvg(place, p.bg)}</i><b>Sky</b><em>${esc(timeById(p.bg).name)}</em></button>`;
  /* the picked garment's two ways of being wrapped, under its tab */
  const zi = ZONES.findIndex((z) => z.id === sel), open = menu && zi >= 0 && canWrap(p.set[sel], sel);
  const wrapMenu = !open ? "" : `<div class="dress-menu" role="group" aria-label="How the ${esc(ZONES[zi].name.toLowerCase())} is wrapped" style="--at:${((zi + 0.5) / 5) * 100}%">
        <button class="btn" data-a="wrap">${WRAP_ICO}Wrap it yourself</button>
        <button class="btn" data-a="unwrap" ${wrappedByHand(p.set[sel], sel) ? "" : "disabled"}>Wrap it for me</button>
      </div>`;
  root.innerHTML = `
    ${topbar(S)}
    ${segs()}
    <div class="dress-top">
      <div class="scene-wrap small dress-pic">${picture}</div>
      <div class="dress-tabs" role="tablist" aria-label="What to dress">${ZONES.map(tab).join("")}${sky}<button class="dress-tab shoot" data-a="shoot" ${ready ? "" : "disabled"} aria-label="Take a postcard${ready ? "" : ": it needs three finished garments"}"><i class="dress-cam" aria-hidden="true"></i><b>Postcard</b><em>${ready ? "Take it" : "Not yet"}</em></button></div>
      ${wrapMenu}
    </div>
    ${ready ? "" : `<p class="sub">A postcard needs three finished garments.</p>`}
    <section class="dress-panel"></section>`;
  /* drawn again after every change, where it was: the choices scroll under the picture */
  const again = () => { const page = document.scrollingElement, y = page ? page.scrollTop : 0; render(root); if (page) page.scrollTop = y; };
  const panel = $(".dress-panel", root);
  if (sel === "sky") {
    panel.innerHTML = `<h4>Which time of day <i>for this picture only</i></h4>
      <p class="dress-say">The judge wears what was knitted then.</p>
      <div class="dress-which">${TIMES.map((t) => { const ok = reached.includes(t.id); return `<button class="wcell sky${t.id === p.bg ? " on" : ""}${ok ? "" : " locked"}" data-time="${t.id}" aria-pressed="${t.id === p.bg}" ${ok ? "" : "disabled"} aria-label="${esc(t.name)}${ok ? "" : ", not yet"}"><i class="dress-sky">${placeThumbSvg(place, t.id)}</i><span>${ok ? esc(t.name) : "Not yet"}</span></button>`; }).join("")}</div>`;
    $$(".wcell[data-time]", panel).forEach((b) => (b.onclick = () => { if (b.dataset.time === p.bg) return; p.bg = b.dataset.time; again(); }));
  } else {
    paintDress(panel, sel, p.set[sel], { changed: again, page: true });
  }
  wireTaps($(".scene-wrap", root));
  wireSegs(root);
  /* a tab picked: its garment hops once on the judge. The picked tab tapped again: its wrap choices open or shut */
  $$(".dress-tab[data-sel]", root).forEach((b) => (b.onclick = () => {
    const id = b.dataset.sel;
    if (sel === id) { if (id === "sky" || !canWrap(p.set[id], id)) return; menu = !menu; }
    else { sel = id; menu = false; if (id !== "sky") flash = id; }
    again();
  }));
  if (flash) { hopCat($(".dress-pic", root), flash); flash = null; }
  const wb = $(".dress-menu [data-a=wrap]", root), ub = $(".dress-menu [data-a=unwrap]", root);
  if (wb) wb.onclick = () => { menu = false; openWrap(p.set[sel], sel); };
  if (ub) ub.onclick = () => {
    St.setWrap(S, place, p.set[sel], sel, null);
    app.save();
    toast(`The ${ZONES[zi].name.toLowerCase()} is wrapped the way it was.`);
    menu = false; flash = sel;
    again();
  };
  $("[data-a=shoot]", root).onclick = () => {
    const card = St.addMixCard(S, place, p.set, p.bg, app.real());
    if (!card) return;
    app.save();
    /* the new card is in the Album tab, which gets its dot, and so does the bottom row */
    again();
    paintDock();
    openCard(card);
  };
}

/* Put one garment in the picture and open its choices (the Garment sheet's "change" button and the wrap screen's
   way back know which one it was): the picture goes to that garment's time of day. */
function openPiece(zone, time) {
  const S = app.S, p = picked(S, S.here);
  if (time && St.garmentDone(S, S.here, time, zone) && St.reachedTimes(S, S.here).includes(time)) p.bg = time;
  sel = zone;
  repaint();
}

function render(root) {
  /* another screen can ask for a tab: show("wardrobe", { tab: "album" }) */
  if (app.props.tab && TABS.some(([id]) => id === app.props.tab)) { mode = app.props.tab; app.props.tab = null; }
  if (mode === "album") {
    /* looking at the Album takes its dot away, here and in the bottom row */
    if (St.newIn(app.S, "album")) { St.markSeen(app.S, "album"); app.save(); paintDock(); }
    return renderAlbum(root, topbar(app.S), segs(), wireSegs);
  }
  dressUp(root);
}

/* repaint: draw the tab again under an open sheet (a sheet can change what the picture shows) */
const repaint = () => app.screen === "wardrobe" && render($("#screen"));
app.screens.wardrobe = { render, repaint, openPiece, leave: () => {} };
