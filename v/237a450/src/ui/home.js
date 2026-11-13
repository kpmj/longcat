/* Home: the judge where it is now, wearing what has been sung, the cushion on the next step, the baskets of
   earlier cats; one button to sing. Nothing here counts streaks or shows a score. */
import { app, show, sheet, closeSheet, esc, $, $$ } from "./app.js";
import * as St from "../state.js";
import { sceneSvg, wardrobeThumbSvg } from "../art/index.js";
import { placeById, timeById, ZONES, STEPS, garmentName } from "../content.js";

function garmentChips(S, place, time) {
  return ZONES.map((z) => {
    const n = St.progress(S, place, time, z.id), active = St.activeZone(S, place) === z.id;
    const label = n >= STEPS ? "done" : n > 0 || active ? `${n} / ${STEPS}` : "not yet";
    return `<div class="gchip${active ? " on" : ""}${n >= STEPS ? " done" : ""}"><b>${esc(garmentName(time, z.id))}</b><span>${z.name} · ${label}</span><i style="--p:${Math.round((n / STEPS) * 100)}%"></i></div>`;
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
    cta = `<button class="btn primary big" data-go="wardrobe">All nine are on · go to the wardrobe</button>`;
    sub = nx ? `The next place opens on ${St.monthLabel(nx.date)}. Older months are always open too.` : "Every place is open.";
  } else if (!nt) {
    cta = `<button class="btn primary big" data-act="pick">Pick a garment</button>`;
    sub = `${timeById(time).name}: three garments. You choose which goes on first.`;
  } else {
    cta = `<button class="btn primary big" data-act="sing">Sing the next step · ${esc(nt.drill.name)}</button>`;
    sub = `Wearing the ${esc(garmentName(time, nt.zone).toLowerCase())}, step ${nt.step} of ${STEPS}. ${timeById(time).flavour} singing.`;
  }
  const days = S.journal.length;
  root.innerHTML = `
    <header class="topbar">
      <div class="where"><span class="place">${esc(p.name)}</span><span class="time-chip t-${shownTime}">${esc(timeById(shownTime).name)}</span>${special ? '<span class="time-chip special">New Year month</span>' : ""}</div>
      ${unread.length ? `<button class="letter-btn" data-act="letter" aria-label="A letter">✉<i></i></button>` : ""}
    </header>
    <div class="scene-wrap" id="home-scene">${sceneSvg(sceneFor(S, place, real))}</div>
    <section class="home-panel">
      <div class="gchips">${garmentChips(S, place, shownTime)}</div>
      ${cta}
      <p class="sub">${sub}</p>
      <p class="journal">Sung on ${days} day${days === 1 ? "" : "s"} · ${St.garmentsDone(S, place)} / 9 garments here</p>
    </section>`;
  const sing = $("[data-act=sing]", root);
  if (sing) sing.onclick = () => show("take", { ctx: St.nextTake(S, place) });
  const pick = $("[data-act=pick]", root);
  if (pick) pick.onclick = () => openPicker();
  const go = $("[data-go]", root);
  if (go) go.onclick = () => show(go.dataset.go);
  const lb = $("[data-act=letter]", root);
  if (lb) lb.onclick = () => app.screens.places.openLetter(unread[0]);
  if (!nt && time && !app.props.noAutoPick) setTimeout(() => app.screen === "home" && openPicker(), 350);
}

/* Which garment next: the player chooses (decided 2026-11-11). Colours come with the garment. */
export function openPicker({ after = null } = {}) {
  const S = app.S, place = S.here, time = St.currentTime(S, place);
  if (!time) return;
  const left = ZONES.filter((z) => !St.garmentDone(S, place, time, z.id));
  const first = !St.tutorialDone(S) && S.faces === 0;
  const fresh = ZONES.every((z) => St.progress(S, place, time, z.id) === 0);
  const el = sheet(`
    <h3>${after ? esc(after) + "<br>" : ""}${fresh ? "Which one first?" : "Which one next?"}</h3>
    <p class="muted">${first ? "The first one is also the tutorial: every step you sing, the judge learns a new face." : `${timeById(time).name} · ${timeById(time).weather}. The colours come with the garment.`}</p>
    <div class="pick-row">${left.map((z) => `<button class="pick" data-zone="${z.id}">
      ${wardrobeThumbSvg({ zone: z.id, ...St.garmentSpec(S, place, time, z.id), steps: STEPS })}
      <b>${esc(garmentName(time, z.id))}</b><span>${z.name} · ${St.progress(S, place, time, z.id)} / ${STEPS}</span></button>`).join("")}</div>`, { onClose: () => {} });
  $$(".pick", el).forEach((b) => (b.onclick = () => {
    St.chooseZone(S, place, b.dataset.zone);
    app.save();
    closeSheet(true);
    show("home", { noAutoPick: true });
  }));
}

app.screens.home = { render: renderHome, openPicker };
