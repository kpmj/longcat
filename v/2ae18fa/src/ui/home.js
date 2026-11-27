/* Home: the judge where it is now, wearing what has been sung. The picture fills the
   whole screen (full-screen home board, 2026-11-14, the designer chose 丁); the controls float on it in one paper surface:
   place and time, music and settings at the top, and a small row of three cats' progress on the sheet that also
   holds the bottom row. Sing itself is the middle button of that bottom row, on every tab (app.js renderDock).
   A cat's cell opens its Garment sheet. Nothing here counts streaks or shows a score.
   Wrapping a finished garment by hand is in the Wardrobe now (ui/wrap.js; the designer, 2026-11-22). */
import { app, show, sheet, closeSheet, esc, toast, $, $$, wireTaps, hopCat, shownTime, visiting } from "./app.js";
import { startMusic, stopMusic, setTune, setTapSource, prepareTaps } from "../audio/ambient.js";
import { setFxFiles } from "../audio/synth.js";
import { rebuildAudio } from "../audio/synth.js";
import * as St from "../state.js";
import { openDress, singerLabel, yarnLabel } from "./cats.js";
import { openLetter, openPlaces } from "./places.js";
import { wardrobeThumbSvg, placeThumbSvg, stepPoint } from "../art/index.js";
import { homeArt, catIconSvg } from "./home-art.js";
import { placeById, timeById, TIMES, ZONES, STEPS, PATTERNS, SOUNDS, garmentName, ladderFor, ladderKey, LADDER_HOW, sylFor, yarnName } from "../content.js";
import { tip } from "./tips.js";
import { drillForStep } from "../drill/drills.js";

/* Three cats, one line each: the cat (its coat is the garment's own), twelve ticks, a number. The cat stands for
   the garment's name; the name is read out to a screen reader. */
function garmentCells(S, place, time) {
  return ZONES.map((z) => {
    const n = St.progress(S, place, time, z.id), active = !visiting(S, place) && St.activeZone(S, place) === z.id, done = n >= STEPS;
    const ticks = Array.from({ length: STEPS }, (_, i) => `<i${i < n ? ' class="on"' : ""}></i>`).join("");
    return `<button class="home-cell${active ? " on" : ""}${done ? " done" : ""}" data-zone="${z.id}" aria-label="${esc(garmentName(time, z.id))}, ${done ? "done" : `${n} of ${STEPS}`}${active ? ", the one being sung" : ""}">${catIconSvg(St.garmentSpec(S, place, time, z.id), z.id, time)}<span class="home-ticks" aria-hidden="true">${ticks}</span><small aria-hidden="true">${done ? "✓" : n}</small></button>`;
  }).join("");
}

function sceneFor(S, place, real) {
  /* a time of day gone back to: its own picture and garments, with no step lit */
  if (visiting(S, place)) return St.homeScene(S, place, real, { time: shownTime(S, place) });
  const o = St.homeScene(S, place, real);
  const nt = St.nextTake(S, place);
  /* no dashed guide over the steps still to come: the designer found the lines unexplained and asked for them to go (2026-11-14).
     The art still draws one when a scene is given `guide` */
  const glow = app.props.glow;
  if (glow) o.garments = o.garments.map((g) => (g.zone === glow.zone ? { ...g, glow: glow.step } : g));
  return o;
}

/* The picture is laid out for the screen it is on: the judge sits between the top row and the tray, whatever
   the phone's height (home-art.js). It is drawn again when the window changes size. */
let layout = null, resizeT = 0;
function paintArt(root = document.getElementById("screen")) {
  const el = root && $("#home-scene", root);
  if (!el || app.screen !== "home") return;
  const S = app.S, r = root.getBoundingClientRect(), W = r.width || 375, H = r.height || 780;
  const top = $(".home-top", root)?.getBoundingClientRect(), tray = $(".home-tray", root)?.getBoundingClientRect();
  const art = homeArt(sceneFor(S, S.here, app.real()), W, H, top && top.height ? top.bottom - r.top : 92, tray && tray.height ? tray.top - r.top : H - 120);
  layout = art.layout;
  el.innerHTML = art.svg;
  wireTaps(el); // pat a cat or the judge, tap the yuzu, the lamp, the sun
}
function onResize() { clearTimeout(resizeT); resizeT = setTimeout(() => paintArt(), 120); }
function leaveHome() { stopMusic(); window.removeEventListener("resize", onResize); clearTimeout(resizeT); }

/* a card says which cat it is about: that cat hops once as its sheet opens */
function wireCells(root) {
  $$(".home-cell", root).forEach((b) => (b.onclick = () => { hopCat($("#home-scene", root), b.dataset.zone); openGarment(b.dataset.zone, shownTime()); }));
}
/* the picture and the three cells again, under an open sheet: the garment sheet changes a cat or a yarn */
function repaintHome() {
  const root = document.getElementById("screen"), cells = root && $(".home-cells", root), S = app.S;
  if (!cells || app.screen !== "home") return;
  cells.innerHTML = garmentCells(S, S.here, shownTime(S, S.here));
  wireCells(root);
  paintArt(root);
}

let warnedSave = false;
const musicOn = (S) => S.settings.music !== false && S.settings.sound !== false;

export function renderHome(root) {
  const S = app.S, real = app.real();
  const place = S.here, p = placeById(place);
  const beat = St.beatPending(S, place);
  if (beat) return show("beat", { place, time: beat });
  const time = St.currentTime(S, place);
  const shown = shownTime(S, place), away = visiting(S, place);
  const nt = St.nextTake(S, place);
  /* who is visiting follows the date; Home is where a day that has turned is first noticed */
  St.keepVisit(S, real);
  const unread = St.unreadLetters(S).filter((x) => x !== "onsen" || !S.onboarded);
  const special = St.visiting(S);
  /* all nine on: the row says so; the middle button of the bottom row turns into Mix outfits */
  let note = "";
  if (!time && !away) {
    /* the next place opened long ago, when the morning here was finished */
    const more = St.placeWaiting(S, place);
    note = more ? `All nine are on. ${placeById(more).name} is waiting.` : "All nine are on, in every place.";
  }
  const T = timeById(shown), nowName = timeById(time || "night").name.toLowerCase();
  root.innerHTML = `
    <div class="home-art" id="home-scene"></div>
    <header class="home-top">
      <div class="home-where">
        <button class="home-pill paper" data-act="places" aria-label="${esc(p.name)}. Open the places"><b>${esc(p.name)}</b><i aria-hidden="true">▾</i></button>
        <button class="home-pill paper time${away ? " away" : ""}" data-act="times" aria-label="${esc(T.name)}${away ? ", looking back" : ""}. Open the times of day"><span>${esc(T.name)}</span><i aria-hidden="true">▾</i></button>
      </div>
      <div class="home-tools">${unread.length ? `<button class="home-ico paper letter" data-act="letter" aria-label="A letter">✉<i></i></button>` : ""}<button class="home-ico paper music${musicOn(S) ? "" : " off"}" data-act="music" aria-pressed="${musicOn(S)}" aria-label="Music">♪</button></div>
    </header>
    ${special ? '<span class="home-special paper">New Year visit</span>' : ""}
    <section class="home-tray paper" aria-label="The three garments">
      ${away ? `<p class="home-note away">Looking back at the ${esc(T.name.toLowerCase())}. <button class="linkish" data-act="now">Back to ${esc(nowName)}</button></p>` : note ? `<p class="home-note">${esc(note)}</p>` : ""}
      <div class="home-cells">${garmentCells(S, place, shown)}</div>
    </section>`;
  paintArt(root);
  window.removeEventListener("resize", onResize);
  window.addEventListener("resize", onResize);
  /* the home page has its own quiet music, in the colour of the time of day; it stops when the page is left */
  /* Coming back from singing (or from the beat that follows it) the page first settles: the phone has just let
     the microphone go and the result's sounds may still ring. Then the music comes up slowly. */
  const afterTake = app.from === "take" || app.from === "beat";
  setTune(S.dev.homeMusic);
  /* what can be pressed has sound files (the jungle's, the hot spring's, a cat's, the capybara's): fetched now,
     about 250 kB, so that the first press already plays one */
  setTapSource(S.dev.tapSounds);
  setFxFiles(S.dev.tapSounds !== "page");
  if (S.settings.sound !== false) prepareTaps(); // a cat, the capybara and its yuzu are at every place
  if (musicOn(S)) startMusic(shown, afterTake ? { delay: 0.6, fade: 2.6 } : { fade: 1.2 }); else stopMusic();
  /* one tap on the note turns the music off or on (the designer, 2026-11-14); the same setting as the one in Settings */
  const mb = $("[data-act=music]", root);
  if (mb) mb.onclick = () => {
    if (S.settings.sound === false) return toast("All game sound is off. Turn it on in Settings first.");
    S.settings.music = S.settings.music === false;
    app.save();
    const on = musicOn(S);
    mb.classList.toggle("off", !on);
    mb.setAttribute("aria-pressed", String(on));
    /* turning the music on also makes a fresh sound context: when a phone has gone silent, off and on again is what
       a player tries, and this makes that the cure (play-test, 2026-11-14) */
    if (on) { rebuildAudio(); startMusic(shown); } else stopMusic();
    toast(on ? "Music on" : "Music off");
  };
  $$("[data-go]", root).forEach((b) => (b.onclick = () => show(b.dataset.go)));
  /* a card says which cat it is about: that cat hops once as its sheet opens */
  wireCells(root);
  /* the garment just put on (Wear this one, the picker): its cat hops once */
  if (app.props.picked) setTimeout(() => app.screen === "home" && hopCat(document.getElementById("home-scene"), app.props.picked), 250);
  /* the chips at the top left say where the judge is and when: the first opens the places (the designer, 2026-11-15), the
     second the times of day of this place (2026-11-25; they used to be behind the Places row that says Here) */
  const pc = $("[data-act=places]", root);
  if (pc) pc.onclick = () => openPlaces();
  const tc = $("[data-act=times]", root);
  if (tc) tc.onclick = () => openTimes();
  const nb = $("[data-act=now]", root);
  if (nb) nb.onclick = () => { app.visit = null; show("home", { noAutoPick: true }); };
  const lb = $("[data-act=letter]", root);
  if (lb) lb.onclick = () => openLetter(unread[0]);
  if (!nt && time && !away && !app.props.noAutoPick) setTimeout(() => app.screen === "home" && document.getElementById("home-scene") && openPicker(), 350);
  if (!app.canSave && !warnedSave) { warnedSave = true; setTimeout(() => toast("This browser won’t remember your progress."), 600); }
  if (!away) setTimeout(() => homeTips(root, nt, unread), 450);
}

/* the home's one-time tips: the first step, the first letter */
function homeTips(root, nt, unread) {
  if (app.screen !== "home" || document.querySelector("#sheet-root:not([hidden])")) return;
  const S = app.S, scene = $("#home-scene", root);
  if (!scene) return;
  /* a step of a garment, as a place on the screen: across (0 to 1) and down (px) the picture */
  const at = (zone, step) => { const pt = stepPoint(zone, step), px = layout ? layout.toPx(pt.x, pt.y) : { x: pt.x, y: pt.y }; return { x: px.x / Math.max(1, scene.getBoundingClientRect().width), y: px.y }; };
  const glow = app.props.glow;
  if (glow && St.takesAt(S, S.here) === 1) {
    const left = STEPS - glow.step, name = garmentName(St.currentTime(S, S.here) || "morning", glow.zone).toLowerCase();
    const p = at(glow.zone, glow.step);
    if (tip("step", scene, { text: `That’s one step. ${left === 11 ? "Eleven" : left} more and the ${name} is done.`, at: "below", x: p.x, y: p.y + 24 })) return;
  }
  const lb = $("[data-act=letter]", root);
  if (lb && unread.length) tip("letter", lb, { at: "below", x: 0.3 });
}

/* Which garment next: the player chooses (decided 2026-11-11). Colours come with the garment.
   `except` leaves out the garment being worn (Wear another one). */
export function openPicker({ after = null, except = null, tipText = null } = {}) {
  const S = app.S, place = S.here, time = St.currentTime(S, place);
  if (!time) return;
  const left = ZONES.filter((z) => !St.garmentDone(S, place, time, z.id) && z.id !== except);
  if (!left.length) return;
  const first = !St.tutorialDone(S) && S.faces === 0;
  const fresh = ZONES.every((z) => St.progress(S, place, time, z.id) === 0);
  const el = sheet(`
    <h3>${after ? esc(after) + "<br>" : ""}${except ? "Wear which one instead?" : fresh ? "Which one first?" : "Which one next?"}</h3>
    <p class="muted">${first ? "The first one is also the tutorial: twelve short steps, one at a time." : except ? "The one you’re wearing keeps its steps and waits for you." : "Each garment trains one thing: the scarf agility, the top breath, the hat range. Its twelve drills are new at each time of day."}</p>
    <div class="pick-row">${left.map((z) => `<button class="pick" data-zone="${z.id}">
      ${wardrobeThumbSvg({ zone: z.id, ...St.garmentSpec(S, place, time, z.id), steps: STEPS })}
      <b>${esc(garmentName(time, z.id))}</b><em>${esc(z.aim)}</em><span>${esc(SOUNDS[z.id].cat)} · “${sylFor(z.id, time)}” · ${St.progress(S, place, time, z.id)} / ${STEPS}</span></button>`).join("")}</div>`, { onClose: () => {} });
  $$(".pick", el).forEach((b) => (b.onclick = () => {
    St.chooseZone(S, place, b.dataset.zone);
    app.save();
    closeSheet(true);
    show("home", { noAutoPick: true, picked: b.dataset.zone });
  }));
  if (tipText) setTimeout(() => tip("garment", el.querySelector("h3"), { text: tipText, at: "above" }), 380);
}

/* The Garment sheet: one garment's twelve steps at a glance, and the way to wear another one mid-way
   (game-flow board, decision D). During the tutorial the first garment is worn to the end. */
const PATTERN_NAME = Object.fromEntries(PATTERNS.map((x) => [x.id, x.name]));
/* a garment's `look.fur` is how thick its knitting is: a cat's own fur no longer changes with the time (the designer, 2026-11-14) */
const KNIT = { short: "thin knit", mid: "medium knit", long: "thick knit" };
const upper = (t) => t.charAt(0).toUpperCase() + t.slice(1);
export function openGarment(zone, time = St.currentTime(app.S, app.S.here) || "night") {
  const S = app.S, place = S.here;
  const g = St.garmentSpec(S, place, time, zone), steps = St.stepsOf(S, place, time, zone);
  const n = steps.length, done = n >= STEPS, active = St.activeZone(S, place) === zone;
  const z = ZONES.find((x) => x.id === zone), name = garmentName(time, zone);
  const folds = steps.map((st, i) => (st?.tuft ? i + 1 : 0)).filter(Boolean);
  const others = ZONES.filter((x) => x.id !== zone && !St.garmentDone(S, place, time, x.id));
  const inTutorial = !St.tutorialDone(S);
  const grid = ladderFor(zone, time).map((d, i) => {
    const k = i + 1, st = k <= n ? (folds.includes(k) ? "fold" : "done") : k === n + 1 && !done ? "next" : "todo";
    /* a step already sung can be sung again (the designer, 2026-11-14: "allow user to go back to the previous drills
       to redo them"); it never moves anything forward */
    return k <= n
      ? `<button class="gstep ${st}" data-step="${k}" aria-label="Sing step ${k}, ${esc(d.name)}, again"><b>${k} <i aria-hidden="true">↻</i></b><span>${esc(d.name)}</span></button>`
      : `<div class="gstep ${st}"><b>${k}</b><span>${esc(d.name)}</span></div>`;
  }).join("");
  let buttons = "", note = "";
  if (done) {
    /* opened from the Wardrobe's page it needs no way there */
    const inWardrobe = app.screen === "wardrobe";
    note = inWardrobe ? "" : "It’s in the Wardrobe now.";
    buttons = inWardrobe ? `<button class="btn primary" data-a="close">OK</button>` : `<div class="row"><button class="btn primary" data-a="close">OK</button><button class="btn" data-a="wardrobe">Wardrobe</button></div>`;
  } else if (active) {
    buttons = `<div class="row"><button class="btn primary" data-a="sing">Sing step ${n + 1}</button>${others.length && !inTutorial ? `<button class="btn" data-a="other">Wear another one</button>` : ""}</div>`;
  } else if (inTutorial) {
    note = "The first garment is the tutorial. Finish it first, then you can switch any time.";
    buttons = `<button class="btn primary" data-a="close">OK</button>`;
  } else {
    note = St.activeZone(S, place) ? `The ${garmentName(time, St.activeZone(S, place)).toLowerCase()} keeps its steps and waits for you.` : "";
    buttons = `<div class="row"><button class="btn primary" data-a="wear">Wear this one</button><button class="btn" data-a="close">Not now</button></div>`;
  }
  const el = sheet(`
    <div class="ghead">${wardrobeThumbSvg({ ...g, steps: done ? STEPS : g.steps })}<div><p class="eyebrow">${esc(timeById(time).name)} · ${esc(z.aim.toLowerCase())} · ${esc(SOUNDS[zone].cat)}, “${sylFor(zone, time)}”</p><h3>${esc(name)} · ${n} / ${STEPS}</h3><p class="muted small">${g.yarn ? `${esc(upper(yarnName(g.yarn)))}, ${KNIT[g.look.fur] || ""}` : `No yarn: ${esc((PATTERN_NAME[g.look.pattern] || "").toLowerCase())} on ${esc(g.look.palette)}`}.</p><button class="who-btn" data-a="cat">${esc(singerLabel(S, g.singer))} · ${esc(yarnLabel(g.yarn).toLowerCase())} · change</button></div></div>
    <p class="muted small"><b>${esc(z.aim)}:</b> ${esc(z.how)}. <b>${esc(timeById(time).name)}:</b> ${esc(LADDER_HOW[ladderKey(zone, time)] || "")}. Steps 1 to 4 are sung once, 5 to 8 in three sets, 9 to 12 in five.</p>
    <div class="gsteps">${grid}</div>
    ${n ? `<p class="muted small">Tap a step you’ve sung to sing it again.</p>` : ""}
    ${folds.length ? `<p class="muted small">${folds.length === 1 ? `Step ${folds[0]} has a fold: one note got away there.` : `Steps ${folds.join(", ")} have folds: a note got away there.`} It’s part of the ${esc(name.toLowerCase())} now.</p>` : ""}
    ${note ? `<p class="muted small">${esc(note)}</p>` : ""}
    ${buttons}`);
  const on = (a, fn) => { const b = el.querySelector(`[data-a=${a}]`); if (b) b.onclick = fn; };
  on("close", () => closeSheet());
  on("wardrobe", () => { closeSheet(true); if (app.screen !== "wardrobe") show("wardrobe", { tab: "dress" }); });
  /* in the Wardrobe the choices are in the page itself: it puts this one in the picture and shows them */
  on("cat", () => { closeSheet(true); if (app.screen === "wardrobe") app.screens.wardrobe.openPiece(zone, time); else openDress(zone, time); });
  on("sing", () => { closeSheet(true); show("take", { ctx: St.nextTake(S, place) }); });
  on("other", () => { closeSheet(true); openPicker({ except: zone }); });
  on("wear", () => { St.chooseZone(S, place, zone); app.save(); closeSheet(true); show("home", { noAutoPick: true, picked: zone }); });
  el.querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => { closeSheet(true); askRedo(place, time, zone, Number(b.dataset.step)); }));
}

/* Singing an earlier step again: the new take replaces that step (its shape and its folds) once it is sung;
   a silent take keeps the old one. It counts as practice, never as progress. */
/* The times of day of this place. the designer, 2026-11-14: tap the time chip "so I can go back to the previous time and
   redo the drill to fix the imperfect ones"; it was a list of garments, three to a time, each opening its sheet.
   the designer, 2026-11-25: the player should be able to jump to a time of day and see the judge's picture as it is there,
   which that list never showed. Now it is three cards with the place's picture at each time: tapping a time the
   player has reached makes Home that time of day (`app.visit`): its picture, sky, music and three garments, whose
   steps can be sung again from their sheets. A time not reached yet is shown and cannot be opened. Nothing here
   moves progress. */
function openTimes() {
  const S = app.S, place = S.here, reached = St.reachedTimes(S, place), cur = St.currentTime(S, place), shown = shownTime(S, place);
  const cards = TIMES.map((t, i) => {
    const ok = reached.includes(t.id), here = t.id === shown;
    const done = ZONES.filter((z) => St.garmentDone(S, place, t.id, z.id)).length;
    const steps = ZONES.reduce((a, z) => a + St.progress(S, place, t.id, z.id), 0);
    const line = !ok ? `Opens when the three ${TIMES[i - 1].name.toLowerCase()} garments are on.`
      : done >= ZONES.length ? "All three garments are on." : `${done} of 3 garments · ${steps} of ${STEPS * ZONES.length} steps`;
    const badge = here ? '<span class="badge">Here</span>' : !ok ? '<span class="badge quiet">Not yet</span>' : `<span class="tod-go" aria-hidden="true">${t.id === cur ? "Back ›" : "Go ›"}</span>`;
    return `<button class="place-row tod${here ? " here" : ""}${ok ? "" : " future"}" data-time="${t.id}" ${ok && !here ? "" : "disabled"} aria-label="${esc(t.name)}. ${esc(here ? "You are here." : ok ? "Go there." : "Not yet.")}">
      <span class="thumb">${placeThumbSvg(place, t.id)}</span>
      <span class="pinfo"><b>${esc(t.name)}${t.id === cur ? ' <i class="tod-now">singing now</i>' : ""}</b><span>${esc(t.weather)}</span><span>${esc(line)}</span></span>
      ${badge}</button>`;
  }).join("");
  const el = sheet(`
    <h3>Times of day</h3>
    <p class="muted small">Go to any time of day you have reached ${esc(placeById(place).at)}. The judge is there as you left it; tap a garment to sing a step again. Nothing moves forward or back.</p>
    <section class="places">${cards}</section>
    <button class="btn" data-a="close">Close</button>`, { tall: true });
  el.querySelector("[data-a=close]").onclick = () => closeSheet();
  el.querySelectorAll(".tod:not([disabled])").forEach((b) => (b.onclick = () => {
    app.visit = b.dataset.time === cur ? null : { place, time: b.dataset.time };
    closeSheet(true);
    show("home", { noAutoPick: true });
  }));
}

function askRedo(place, time, zone, step) {
  const d = ladderFor(zone, time)[step - 1], name = garmentName(time, zone);
  const el = sheet(`
    <h3>Sing step ${step} again?</h3>
    <p class="muted">${esc(name)} · ${esc(d.name)}. What you sing now takes the place of this step, folds and all. Nothing moves forward or back.</p>
    <div class="row"><button class="btn primary" data-a="go">Sing it again</button><button class="btn" data-a="no">Not now</button></div>`);
  el.querySelector("[data-a=go]").onclick = () => {
    closeSheet(true);
    /* after singing, go back to where this was asked from (home or the Wardrobe) */
    const back = app.screen === "wardrobe" ? "wardrobe" : "home";
    show("take", { ctx: { place, time, zone, step, drill: drillForStep(step, zone, time), seed: `${place}.${time}.${zone}`, back }, retake: true, outcome: null });
  };
  el.querySelector("[data-a=no]").onclick = () => { closeSheet(true); openGarment(zone, time); };
}

app.screens.home = { render: renderHome, repaint: repaintHome, openPicker, openGarment, openTimes, leave: leaveHome };
