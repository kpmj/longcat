/* Home: the judge where it is now, wearing what has been sung, the cushion on the next step, the baskets of
   earlier cats; one button to sing, one line under it. The three progress chips open the Garment sheet.
   Settings is the gear in the top bar. Nothing here counts streaks or shows a score. */
import { app, show, sheet, closeSheet, esc, toast, $, $$ } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg, stepPoint } from "../art/index.js";
import { placeById, timeById, ZONES, STEPS, DRILLS, PATTERNS, garmentName } from "../content.js";
import { tip } from "./tips.js";
import { drillForStep } from "../drill/drills.js";

function garmentChips(S, place, time) {
  return ZONES.map((z) => {
    const n = St.progress(S, place, time, z.id), active = St.activeZone(S, place) === z.id;
    const label = n >= STEPS ? "done" : n > 0 || active ? `${n} / ${STEPS}` : "not yet";
    return `<button class="gchip${active ? " on" : ""}${n >= STEPS ? " done" : ""}" data-zone="${z.id}" aria-label="${esc(garmentName(time, z.id))}, ${z.name}, ${label}"><b>${esc(garmentName(time, z.id))}</b><span>${z.name} · ${label}</span><i style="--p:${Math.round((n / STEPS) * 100)}%"></i></button>`;
  }).join("");
}

function sceneFor(S, place, real) {
  const o = St.homeScene(S, place, real);
  const nt = St.nextTake(S, place);
  if (nt) o.guide = nt.zone; // a dashed line over the steps still to come on the garment being worn
  const glow = app.props.glow;
  if (glow) o.garments = o.garments.map((g) => (g.zone === glow.zone ? { ...g, glow: glow.step } : g));
  return o;
}

let warnedSave = false;

export function renderHome(root) {
  const S = app.S, real = app.real();
  const place = S.here, p = placeById(place);
  const beat = St.beatPending(S, place);
  if (beat) return show("beat", { place, time: beat });
  const time = St.currentTime(S, place);
  const shownTime = time || "night";
  const nt = St.nextTake(S, place);
  const unread = St.unreadLetters(S, real).filter((x) => x !== "onsen" || !S.onboarded);
  const special = St.specialFor(place);
  let cta, sub;
  if (!time) {
    const nx = St.nextOpening(S, real);
    cta = `<div class="row"><button class="btn primary" data-go="wardrobe">Mix outfits</button><button class="btn" data-go="places">Other places</button></div>`;
    sub = nx ? `All nine are on. The next letter comes on ${St.monthLabel(nx.date)}.` : "All nine are on. Every place is open.";
  } else if (!nt) {
    cta = `<button class="btn primary big" data-act="pick">Pick a garment</button>`;
    sub = `${timeById(time).name}: three garments. You choose which goes on first.`;
  } else {
    cta = `<button class="btn primary big" data-act="sing">Sing step ${nt.step} · ${esc(nt.drill.name)}</button>`;
    sub = `${esc(garmentName(time, nt.zone))} · ${nt.step - 1} of ${STEPS} · ${timeById(time).flavour} singing`;
  }
  root.innerHTML = `
    <header class="topbar">
      <div class="where"><span class="place">${esc(p.name)}</span><span class="time-chip t-${shownTime}">${esc(timeById(shownTime).name)}</span>${special ? '<span class="time-chip special">New Year month</span>' : ""}</div>
      <div class="tools">${unread.length ? `<button class="letter-btn" data-act="letter" aria-label="A letter">✉<i></i></button>` : ""}<button class="icon-btn gear" data-go="settings" aria-label="Settings">⚙</button></div>
    </header>
    <div class="scene-wrap" id="home-scene">${sceneSvg(sceneFor(S, place, real))}</div>
    <section class="home-panel">
      <div class="gchips">${garmentChips(S, place, shownTime)}</div>
      ${cta}
      <p class="sub">${sub}</p>
    </section>`;
  const sing = $("[data-act=sing]", root);
  if (sing) sing.onclick = () => show("take", { ctx: St.nextTake(S, place) });
  const pick = $("[data-act=pick]", root);
  if (pick) pick.onclick = () => openPicker();
  $$("[data-go]", root).forEach((b) => (b.onclick = () => show(b.dataset.go)));
  $$(".gchip", root).forEach((b) => (b.onclick = () => openGarment(b.dataset.zone)));
  const lb = $("[data-act=letter]", root);
  if (lb) lb.onclick = () => app.screens.places.openLetter(unread[0]);
  if (!nt && time && !app.props.noAutoPick) setTimeout(() => app.screen === "home" && openPicker(), 350);
  if (!app.canSave && !warnedSave) { warnedSave = true; setTimeout(() => toast("This browser won’t remember your progress."), 600); }
  setTimeout(() => homeTips(root, nt, unread), 450);
}

/* the home's one-time tips: the first step, the cushion on a later day, the first letter */
function homeTips(root, nt, unread) {
  if (app.screen !== "home" || document.querySelector("#sheet-root:not([hidden])")) return;
  const S = app.S, scene = $("#home-scene", root);
  if (!scene) return;
  const at = (zone, step) => { const pt = stepPoint(zone, step); return { x: pt.x / 400, y: (pt.y / 500) * scene.getBoundingClientRect().height }; };
  const glow = app.props.glow;
  if (glow && St.takesAt(S, S.here) === 1) {
    const left = STEPS - glow.step, name = garmentName(St.currentTime(S, S.here) || "morning", glow.zone).toLowerCase();
    const p = at(glow.zone, glow.step);
    if (tip("step", scene, { text: `That’s one step. ${left === 11 ? "Eleven" : left} more and the ${name} is done.`, at: "below", x: p.x, y: p.y + 24 })) return;
  }
  const lb = $("[data-act=letter]", root);
  if (lb && unread.length && tip("letter", lb, { at: "below", x: 0.3 })) return;
  const cushion = St.cushionFor(S, S.here, app.real());
  if (cushion && S.journal.length > 0) {
    const p = at(cushion.zone, cushion.step);
    tip("cushion", scene, { at: "below", x: p.x, y: p.y + 20 });
  }
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
    <p class="muted">${first ? "The first one is also the tutorial: every step you sing, the judge learns a new face." : except ? "The one you’re wearing keeps its steps and waits for you." : `${timeById(time).name} · ${timeById(time).weather}. The colours come with the garment.`}</p>
    <div class="pick-row">${left.map((z) => `<button class="pick" data-zone="${z.id}">
      ${wardrobeThumbSvg({ zone: z.id, ...St.garmentSpec(S, place, time, z.id), steps: STEPS })}
      <b>${esc(garmentName(time, z.id))}</b><span>${z.name} · ${St.progress(S, place, time, z.id)} / ${STEPS}</span></button>`).join("")}</div>`, { onClose: () => {} });
  $$(".pick", el).forEach((b) => (b.onclick = () => {
    St.chooseZone(S, place, b.dataset.zone);
    app.save();
    closeSheet(true);
    show("home", { noAutoPick: true });
  }));
  if (tipText) setTimeout(() => tip("garment", el.querySelector("h3"), { text: tipText, at: "above" }), 380);
}

/* The Garment sheet: one garment's twelve steps at a glance, and the way to wear another one mid-way
   (game-flow board, decision D). During the tutorial the first garment is worn to the end. */
const PATTERN_NAME = Object.fromEntries(PATTERNS.map((x) => [x.id, x.name]));
const FUR = { short: "short fur", mid: "mid fur", long: "long fur" };
export function openGarment(zone, time = St.currentTime(app.S, app.S.here) || "night") {
  const S = app.S, place = S.here;
  const g = St.garmentSpec(S, place, time, zone), steps = St.stepsOf(S, place, time, zone);
  const n = steps.length, done = n >= STEPS, active = St.activeZone(S, place) === zone;
  const z = ZONES.find((x) => x.id === zone), name = garmentName(time, zone);
  const folds = steps.map((st, i) => (st?.tuft ? i + 1 : 0)).filter(Boolean);
  const others = ZONES.filter((x) => x.id !== zone && !St.garmentDone(S, place, time, x.id));
  const inTutorial = !St.tutorialDone(S);
  const grid = DRILLS.map((d, i) => {
    const k = i + 1, st = k <= n ? (folds.includes(k) ? "fold" : "done") : k === n + 1 && !done ? "next" : "todo";
    /* a step already sung can be sung again (the designer, 2026-11-14: "allow user to go back to the previous drills
       to redo them"); it never moves anything forward */
    return k <= n
      ? `<button class="gstep ${st}" data-step="${k}" aria-label="Sing step ${k}, ${esc(d.name)}, again"><b>${k} <i aria-hidden="true">↻</i></b><span>${esc(d.name)}</span></button>`
      : `<div class="gstep ${st}"><b>${k}</b><span>${esc(d.name)}</span></div>`;
  }).join("");
  let buttons = "", note = "";
  if (done) {
    note = "It’s in the Wardrobe now.";
    buttons = `<div class="row"><button class="btn primary" data-a="close">OK</button><button class="btn" data-a="wardrobe">Wardrobe</button></div>`;
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
    <div class="ghead">${wardrobeThumbSvg({ ...g, steps: done ? STEPS : g.steps })}<div><p class="eyebrow">${esc(timeById(time).name)} · ${esc(z.name.toLowerCase())}</p><h3>${esc(name)} · ${n} / ${STEPS}</h3><p class="muted small">${esc(PATTERN_NAME[g.look.pattern] || "")} on ${esc(g.look.palette)}, ${FUR[g.look.fur] || ""}.</p></div></div>
    <div class="gsteps">${grid}</div>
    ${n ? `<p class="muted small">Tap a step you’ve sung to sing it again.</p>` : ""}
    ${folds.length ? `<p class="muted small">${folds.length === 1 ? `Step ${folds[0]} has a fold: one note got away there.` : `Steps ${folds.join(", ")} have folds: a note got away there.`} It’s part of the ${esc(name.toLowerCase())} now.</p>` : ""}
    ${note ? `<p class="muted small">${esc(note)}</p>` : ""}
    ${buttons}`);
  const on = (a, fn) => { const b = el.querySelector(`[data-a=${a}]`); if (b) b.onclick = fn; };
  on("close", () => closeSheet());
  on("wardrobe", () => { closeSheet(true); if (app.screen !== "wardrobe") show("wardrobe"); });
  on("sing", () => { closeSheet(true); show("take", { ctx: St.nextTake(S, place) }); });
  on("other", () => { closeSheet(true); openPicker({ except: zone }); });
  on("wear", () => { St.chooseZone(S, place, zone); app.save(); closeSheet(true); show("home", { noAutoPick: true }); });
  el.querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => { closeSheet(true); askRedo(place, time, zone, Number(b.dataset.step)); }));
}

/* Singing an earlier step again: the new take replaces that step (its shape and its folds) once it is sung;
   a silent take keeps the old one. It counts as practice, never as progress. */
function askRedo(place, time, zone, step) {
  const d = DRILLS[step - 1], name = garmentName(time, zone);
  const el = sheet(`
    <h3>Sing step ${step} again?</h3>
    <p class="muted">${esc(name)} · ${esc(d.name)}. What you sing now takes the place of this step, folds and all. Nothing moves forward or back.</p>
    <div class="row"><button class="btn primary" data-a="go">Sing it again</button><button class="btn" data-a="no">Not now</button></div>`);
  el.querySelector("[data-a=go]").onclick = () => {
    closeSheet(true);
    show("take", { ctx: { place, time, zone, step, drill: drillForStep(step), seed: `${place}.${time}.${zone}` }, retake: true, outcome: null });
  };
  el.querySelector("[data-a=no]").onclick = () => { closeSheet(true); openGarment(zone, time); };
}

app.screens.home = { render: renderHome, openPicker, openGarment };
