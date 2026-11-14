/* The save, and everything derived from it. Pure functions over a plain object; the browser layer persists it.
   The save is only "things that happened" (design doc section 8): takes, garments with each step's shape, the
   judge's learned faces, the singing days, and each month's postcards. Nothing in it ever goes down. */
import {
  STEPS, ZONE_IDS, TIME_IDS, TIMES, PLACES, PLACE_IDS, LAUNCH, SPECIAL_MONTHS, GUEST_BY_ZONE, NEWYEAR_NIGHT_SCARF,
  TUTORIAL_FACES, MIX_LINE, placeById, timeById, garmentLook, garmentName,
} from "./content.js";
import { drillForStep } from "./drill/drills.js";

export const SAVE_KEY = "longcat-save-v1";
export const VERSION = 1;
const MAX_TAKES = 4000;

/* ---------- dates (local calendar days, as YYYY-MM-DD) ---------- */
const pad = (n) => String(n).padStart(2, "0");
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function parseDay(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
export function nowFor(S, real = new Date()) {
  const d = new Date(real.getTime());
  d.setDate(d.getDate() + (S?.dev?.dayOffset || 0));
  return d;
}
export const todayKey = (S, real) => dateKey(nowFor(S, real));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function monthLabel(key) {
  const d = parseDay(key);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/* ---------- the save ---------- */
export function freshSave(real = new Date()) {
  return {
    v: VERSION,
    created: dateKey(real),
    here: "onsen",
    onboarded: false,
    settings: { range: null, nudge: 0, kinds: { scarf: "point", top: "point", bottom: "point" }, sound: true, music: true, letterNotify: false },
    faces: 0,
    journal: [],
    takes: [],
    months: {},
    letters: [],
    tips: [],                        // one-time tips already shown
    said: [],                        // syllables the cat has already said once on its own
    marks: { album: 0, wardrobe: 0 }, // how much the album and wardrobe held when last opened (the dock's dots)
    dev: { dayOffset: 0, voice: "mic", panel: false, shortBody: "snap", demoVoice: "cat", drillEdits: null },
  };
}

export function migrate(o, real = new Date()) {
  const base = freshSave(real);
  if (!o || typeof o !== "object" || o.v !== VERSION) return base;
  const S = { ...base, ...o };
  S.settings = { ...base.settings, ...(o.settings || {}) };
  S.settings.kinds = { ...base.settings.kinds, ...(o.settings?.kinds || {}) };
  S.dev = { ...base.dev, ...(o.dev || {}) };
  for (const k of ["journal", "takes", "letters"]) if (!Array.isArray(S[k])) S[k] = [];
  if (!S.months || typeof S.months !== "object") S.months = {};
  if (!PLACE_IDS.includes(S.here)) S.here = "onsen";
  if (!Array.isArray(S.tips)) S.tips = [];
  if (!Array.isArray(S.said)) S.said = [];
  /* a save from before the dots: everything in it counts as seen */
  if (!o.marks || typeof o.marks !== "object") S.marks = drawerCounts(S);
  return S;
}

export function loadSave(storage, real = new Date()) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    return migrate(raw ? JSON.parse(raw) : null, real);
  } catch {
    return freshSave(real);
  }
}
export function writeSave(storage, S) {
  try { storage?.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch { return false; }
}

/* ---------- calendar: a new place on the 1st of each month ---------- */
export function placeOpenKey(index) {
  const m0 = LAUNCH.month - 1 + index;
  return `${LAUNCH.year + Math.floor(m0 / 12)}-${pad((m0 % 12) + 1)}-01`;
}
export function specialFor(placeId) {
  const i = PLACE_IDS.indexOf(placeId);
  if (i < 0) return false;
  const month = Number(placeOpenKey(i).slice(5, 7));
  return SPECIAL_MONTHS[month] || false;
}
export function openedPlaces(S, real) {
  const today = todayKey(S, real);
  return PLACE_IDS.filter((id, i) => i === 0 || placeOpenKey(i) <= today);
}
export function nextOpening(S, real) {
  const today = todayKey(S, real);
  const i = PLACE_IDS.findIndex((id, k) => k > 0 && placeOpenKey(k) > today);
  return i < 0 ? null : { place: PLACE_IDS[i], date: placeOpenKey(i) };
}
export function animalFor(placeId, time, zone) {
  if (specialFor(placeId) !== "newyear") return "cat";
  if (time === "night" && zone === "scarf") return NEWYEAR_NIGHT_SCARF;
  return GUEST_BY_ZONE[zone];
}

/* ---------- one month (one place) ---------- */
export function monthOf(S, place) {
  if (!S.months[place]) S.months[place] = { active: {}, g: {}, cards: [], seen: {}, first: null };
  return S.months[place];
}
const peek = (S, place) => S.months[place] || { active: {}, g: {}, cards: [], seen: {}, first: null };
const gkey = (time, zone) => `${time}.${zone}`;

export const stepsOf = (S, place, time, zone) => peek(S, place).g[gkey(time, zone)] || [];
export const progress = (S, place, time, zone) => stepsOf(S, place, time, zone).length;
export const garmentDone = (S, place, time, zone) => progress(S, place, time, zone) >= STEPS;
export const timeDone = (S, place, time) => ZONE_IDS.every((z) => garmentDone(S, place, time, z));
export const currentTime = (S, place) => TIME_IDS.find((t) => !timeDone(S, place, t)) || null;
export const monthDone = (S, place) => currentTime(S, place) === null;
export const garmentsDone = (S, place) => TIME_IDS.reduce((n, t) => n + ZONE_IDS.filter((z) => garmentDone(S, place, t, z)).length, 0);
export const takesAt = (S, place) => TIME_IDS.reduce((n, t) => n + ZONE_IDS.reduce((m, z) => m + progress(S, place, t, z), 0), 0);
export const reachedTimes = (S, place) => {
  const cur = currentTime(S, place);
  return cur ? TIME_IDS.slice(0, TIME_IDS.indexOf(cur) + 1) : [...TIME_IDS];
};

export function activeZone(S, place) {
  const t = currentTime(S, place);
  if (!t) return null;
  const z = peek(S, place).active[t];
  return z && !garmentDone(S, place, t, z) ? z : null;
}
export const needsPick = (S, place) => currentTime(S, place) !== null && activeZone(S, place) === null;

export function chooseZone(S, place, zone) {
  const t = currentTime(S, place);
  if (!t || !ZONE_IDS.includes(zone) || garmentDone(S, place, t, zone)) return false;
  monthOf(S, place).active[t] = zone;
  return true;
}

/* The judge learns one face per step of the first garment (the tutorial), so faces = steps sung, up to 12. */
export const tutorialDone = (S) => S.faces >= STEPS;
export const latestFace = (S) => (S.faces > 0 ? TUTORIAL_FACES[Math.min(S.faces, STEPS) - 1].id : "neutral");
export const canTravel = (S) => tutorialDone(S);

export function goTo(S, place, real) {
  if (!openedPlaces(S, real).includes(place)) return false;
  if (place !== "onsen" && !canTravel(S)) return false;
  S.here = place;
  return true;
}

/* The next take: where, which garment, which step, which drill. */
export function nextTake(S, place = S.here) {
  const time = currentTime(S, place), zone = activeZone(S, place);
  if (!time || !zone) return null;
  const step = progress(S, place, time, zone) + 1;
  return { place, time, zone, step, drill: drillForStep(step, time), seed: `${place}.${time}.${zone}` };
}

/* ---------- recording ---------- */
function logTake(S, ctx, grade, retake, real) {
  S.takes.push({
    date: todayKey(S, real), at: nowFor(S, real).toISOString(), place: ctx.place, time: ctx.time, zone: ctx.zone,
    step: ctx.step, drill: drillForStep(ctx.step, ctx.time).id, retake, counted: !!grade.counted, voiced: grade.voicedRatio ?? null,
  });
  if (S.takes.length > MAX_TAKES) S.takes.splice(0, S.takes.length - MAX_TAKES);
}
/* folds = where along the take each off note sat (0 to 1); tuft = "this step has a fold", also what older saves have */
const stepRecord = (grade, S, real) => {
  const folds = Array.isArray(grade.folds) ? grade.folds.slice(0, 12) : grade.tuft ? [0.5] : [];
  return { shape: grade.shape || null, tuft: folds.length > 0, folds, voiced: grade.voicedRatio ?? null, at: todayKey(S, real) };
};

/* Every completed take that heard a voice grows the garment one step, whatever the grade. */
export function recordTake(S, ctx, grade, real = new Date()) {
  logTake(S, ctx, grade, false, real);
  if (!grade.counted) return { counted: false };
  const m = monthOf(S, ctx.place);
  const k = gkey(ctx.time, ctx.zone);
  const list = m.g[k] || (m.g[k] = []);
  if (list.length >= STEPS || list.length !== ctx.step - 1) return { counted: false, stale: true };
  list.push(stepRecord(grade, S, real));
  if (!m.first) m.first = todayKey(S, real);
  const today = todayKey(S, real);
  if (!S.journal.includes(today)) { S.journal.push(today); S.journal.sort(); }
  S.here = ctx.place;
  let learned = null;
  if (S.faces < STEPS) { S.faces++; learned = TUTORIAL_FACES[S.faces - 1]; }
  const out = { counted: true, step: list.length, learned, garmentDone: false, timeDone: null, monthDone: false };
  if (list.length >= STEPS) {
    out.garmentDone = true;
    if (m.active[ctx.time] === ctx.zone) m.active[ctx.time] = null;
    if (timeDone(S, ctx.place, ctx.time)) {
      out.timeDone = ctx.time;
      out.monthDone = monthDone(S, ctx.place);
    }
  }
  return out;
}

/* 重唱這一步: only right after the step, replaces its shape, never advances, never costs anything. */
export function retakeStep(S, ctx, grade, real = new Date()) {
  logTake(S, ctx, grade, true, real);
  if (!grade.counted) return { counted: false };
  const list = stepsOf(S, ctx.place, ctx.time, ctx.zone);
  if (!list[ctx.step - 1]) return { counted: false, stale: true };
  list[ctx.step - 1] = stepRecord(grade, S, real);
  return { counted: true, step: ctx.step, retake: true };
}

/* ---------- what the art draws ---------- */
export function garmentSpec(S, place, time, zone, extra = {}) {
  const steps = stepsOf(S, place, time, zone);
  const n = Math.min(STEPS, steps.length);
  const shapes = Array.from({ length: STEPS }, (_, i) => (i < n ? steps[i]?.shape || null : null));
  const tufts = Array.from({ length: STEPS }, (_, i) => (i < n ? !!steps[i]?.tuft : false));
  const folds = Array.from({ length: STEPS }, (_, i) => (i < n && Array.isArray(steps[i]?.folds) ? steps[i].folds : null));
  const animal = animalFor(place, time, zone);
  return { zone, look: garmentLook(place, time, zone), animal, kind: S.settings.kinds[zone] || "point", steps: n, shapes, tufts, folds, ...extra };
}

export function basketsFor(S, place) {
  const cur = currentTime(S, place);
  const upto = cur ? TIME_IDS.indexOf(cur) : TIME_IDS.length - 1; // month done: the night set stays on the judge
  return TIME_IDS.slice(0, upto).map((t) => ({
    time: t,
    cats: ZONE_IDS.map((z) => ({ zone: z, look: garmentLook(place, t, z), kind: S.settings.kinds[z], animal: animalFor(place, t, z) })),
  }));
}

/* The daily cushion: on the next step, every day nothing has been sung yet. Derived, never stored. */
export function cushionFor(S, place, real) {
  if (S.journal.includes(todayKey(S, real))) return null;
  const nt = nextTake(S, place);
  return nt ? { zone: nt.zone, step: nt.step, label: nt.step } : null;
}

export function homeScene(S, place = S.here, real, extra = {}) {
  const cur = currentTime(S, place) || "night";
  const garments = ZONE_IDS.map((z) => garmentSpec(S, place, cur, z));
  return {
    /* no baskets of sleeping cats here: with them the home page was too full (the designer, 2026-11-14). The cats still run to
       their basket in the reset beat (ui/beat.js), which asks basketsFor itself; after that they are out of sight */
    place, time: cur, face: extra.face || "neutral", garments, baskets: [],
    cushion: cushionFor(S, place, real), special: specialFor(place), animate: true, seed: takesAt(S, place),
    landscape: true, // the place's full landscape, as on the postcards (the designer, 2026-11-14)
    ...extra,
  };
}

/* ---------- postcards ---------- */
export function cardCaption(place, bg, set) {
  const p = placeById(place);
  const names = ZONE_IDS.map((z, i) => {
    const n = garmentName(set[z], z);
    return i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1);
  }).join(", ");
  const same = ZONE_IDS.every((z) => set[z] === bg);
  return `The judge ${p.at}. ${timeById(bg).name}. ${names}. ${same ? p.lines[bg] : MIX_LINE}`;
}
function newCard(S, place, kind, bg, set, real) {
  const m = monthOf(S, place);
  const card = {
    id: `${place}-${kind}-${m.cards.length + 1}-${Date.now().toString(36)}`, kind, place, bg, set: { ...set },
    kinds: { ...S.settings.kinds }, caption: cardCaption(place, bg, set), date: todayKey(S, real),
  };
  m.cards.push(card);
  return card;
}
export function ensureTimeCards(S, place, real) {
  const made = [];
  for (const t of TIME_IDS) {
    if (!timeDone(S, place, t)) continue;
    const m = monthOf(S, place);
    if (!m.cards.some((c) => c.kind === "time" && c.bg === t)) made.push(newCard(S, place, "time", t, { scarf: t, top: t, bottom: t }, real));
  }
  return made;
}
export function addMixCard(S, place, set, bg, real) {
  if (!reachedTimes(S, place).includes(bg)) return null;
  if (!ZONE_IDS.every((z) => garmentDone(S, place, set[z], z))) return null;
  return newCard(S, place, "mix", bg, set, real);
}
export function cardScene(S, card, extra = {}) {
  const garments = ZONE_IDS.map((z) => {
    const g = garmentSpec(S, card.place, card.set[z], z);
    return { ...g, kind: card.kinds?.[z] || g.kind };
  });
  return { place: card.place, time: card.bg, face: "neutral", garments, baskets: [], cushion: null, special: specialFor(card.place), animate: false, seed: 7, ...extra };
}
/* What the album and the wardrobe hold, for the dock's "something new" dots. */
export function drawerCounts(S) {
  return {
    album: allCards(S).length + Math.min(S.faces || 0, STEPS),
    wardrobe: PLACE_IDS.reduce((n, p) => n + garmentsDone(S, p), 0),
  };
}
export const newIn = (S, drawer) => drawerCounts(S)[drawer] > (S.marks?.[drawer] || 0);
export function markSeen(S, drawer) { S.marks = { ...(S.marks || {}), [drawer]: drawerCounts(S)[drawer] }; }

/* One-time tips. */
export const tipSeen = (S, id) => S.tips.includes(id);
export function seeTip(S, id) { if (!S.tips.includes(id)) S.tips.push(id); }

export const allCards = (S) => PLACE_IDS.flatMap((p) => peek(S, p).cards || []);

/* The reset beat plays once per finished time. */
export const beatPending = (S, place) => TIME_IDS.find((t) => timeDone(S, place, t) && !peek(S, place).seen[t]) || null;
export function markBeatSeen(S, place, time) { monthOf(S, place).seen[time] = true; }

/* ---------- letters ---------- */
export const unreadLetters = (S, real) => openedPlaces(S, real).filter((p) => !S.letters.includes(p));
export function readLetter(S, place) { if (!S.letters.includes(place)) S.letters.push(place); }

/* ---------- dev cheats (the dev panel only) ---------- */
export function devFillGarment(S, place, real, { tufts = false } = {}) {
  const nt = nextTake(S, place);
  if (!nt) return null;
  let out = null;
  for (let s = nt.step; s <= STEPS; s++) {
    out = recordTake(S, { ...nt, step: s }, devGrade(tufts && s % 4 === 2), real);
  }
  return out;
}
export function devGrade(tuft = false) {
  return { counted: true, tuft, folds: tuft ? [0.3, 0.7] : [], voicedRatio: 0.9, shape: Array.from({ length: 12 }, (_, i) => Math.round(Math.sin(i * 1.7) * 30) / 100) };
}
export function devAdvanceToNextMonth(S, real = new Date()) {
  const d = nowFor(S, real);
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1, 12);
  const days = Math.round((next - new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)) / 86400000);
  S.dev.dayOffset += Math.max(1, days);
}

export { TIMES, PLACES };
