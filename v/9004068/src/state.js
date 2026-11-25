/* The save, and everything derived from it. Pure functions over a plain object; the browser layer persists it.
   The save is only "things that happened" (design doc section 8): takes, garments with each step's shape, the
   judge's learned faces, the singing days, each month's postcards, the treats earned and spent and the cats
   brought home. Nothing in it ever goes down (treats are earned minus spent, and both only grow). */
import {
  STEPS, ZONE_IDS, TIME_IDS, TIMES, PLACES, PLACE_IDS, OPEN_AFTER, CALENDAR_LAUNCH, VISIT_MONTHS, VISITORS,
  TUTORIAL_FACES, MIX_LINE, placeById, timeById, garmentLook, garmentName, kindFor, yarnFor,
  TREATS, FREE_CATS, SHOP_CATS, SHOP_ANIMALS, isAnimal, priceOf, catCoat, knitOf, knitGarment,
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
    settings: { range: null, nudge: 0, sound: true, music: true, letterNotify: false },
    faces: 0,
    journal: [],
    takes: [],
    months: {},
    letters: [],
    opened: [],                      // places the calendar had opened before 2026-11-24: they stay open
    visit: visitId(dateKey(real)),   // who is visiting now ("newyear-2027"), or null; see keepVisit
    tips: [],                        // one-time tips already shown
    said: [],                        // syllables the cat has already said once on its own
    heard: [],                       // drills the player has met (ids): their card does not come up by itself again; see heardDrill
    marks: { album: 0, wardrobe: 0 }, // how much the album and wardrobe held when last opened (the dock's dots)
    cats: [...FREE_CATS],            // the singers that are the player's for good: cat kinds and animal ids
    catNames: {},                    // the names the player gave them
    treats: { earned: 0, spent: 0, day: null, n: 0 }, // n = the takes that earned treats on `day`
    dev: { dayOffset: 0, voice: "mic", panel: false, shortBody: "snap", demoVoice: "rec", recVoice: true, drillEdits: null, homeMusic: "box", micMode: "speaker" },
  };
}

export function migrate(o, real = new Date()) {
  const base = freshSave(real);
  if (!o || typeof o !== "object" || o.v !== VERSION) return base;
  const S = { ...base, ...o };
  S.settings = { ...base.settings, ...(o.settings || {}) };
  /* 2026-11-14: cat kinds are cast per month (content.js kindFor), no longer a setting; an old choice is dropped */
  delete S.settings.kinds;
  S.dev = { ...base.dev, ...(o.dev || {}) };
  /* 2026-11-24: places open by singing, not by the date. What the calendar had opened in this save stays open */
  S.opened = Array.isArray(o.opened) ? o.opened.filter((id) => PLACE_IDS.includes(id)) : PLACE_IDS.filter((id, i) => i > 0 && calendarKey(i) <= todayKey(S, real));
  /* and a place the player has been to is never shut again, however it was opened (the dev panel's date, say) */
  for (const id of PLACE_IDS.slice(1)) if (!S.opened.includes(id) && (S.here === id || S.letters.includes(id) || takesAt(S, id) > 0)) S.opened.push(id);
  keepVisit(S, real);
  /* 2026-11-14: the recorded voice became the demo voice. A save from before it existed holds whichever synthesised
     voice was picked last; it moves to the recorded one once, and the Dev panel can still choose another. */
  if (!o.dev || !o.dev.recVoice) { S.dev.demoVoice = "rec"; S.dev.recVoice = true; }
  for (const k of ["journal", "takes", "letters"]) if (!Array.isArray(S[k])) S[k] = [];
  if (!S.months || typeof S.months !== "object") S.months = {};
  /* 2026-11-14: coats (swapped fur) became yarn (a swapped sleeve); an old month's coat swaps are dropped */
  for (const m of Object.values(S.months)) if (m && typeof m === "object") delete m.coats;
  if (!PLACE_IDS.includes(S.here)) S.here = "onsen";
  if (!Array.isArray(S.tips)) S.tips = [];
  if (!Array.isArray(S.said)) S.said = [];
  /* 2026-11-24: the drills the player has met. A save from before has met the drill of every step it has sung */
  if (!Array.isArray(o.heard)) {
    S.heard = [];
    for (const place of Object.keys(S.months)) for (const t of TIME_IDS) for (const z of ZONE_IDS)
      for (let k = 1; k <= Math.min(STEPS, progress(S, place, t, z)); k++) hearDrill(S, drillForStep(k, t).id);
  } else S.heard = o.heard.filter((id) => typeof id === "string");
  /* 2026-11-15: treats and cats of one's own. A save from before starts with the four free cats and no treats */
  S.cats = [...new Set([...FREE_CATS, ...(Array.isArray(o.cats) ? o.cats.filter((id) => typeof id === "string") : [])])];
  S.catNames = o.catNames && typeof o.catNames === "object" ? { ...o.catNames } : {};
  S.treats = { ...base.treats, ...(o.treats && typeof o.treats === "object" ? o.treats : {}) };
  for (const k of ["earned", "spent", "n"]) S.treats[k] = Math.max(0, Math.floor(Number(S.treats[k]) || 0));
  /* 2026-11-15: the album's dot counts postcards only; a mark that also counted the faces would hide new cards */
  if (S.marks && S.marks.album > allCards(S).length) S.marks = { ...S.marks, album: allCards(S).length };
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

/* ---------- places: the next one opens when the morning before it is finished ---------- */
/* the old rule, a new place on the 1st of each month: read by migrate only */
function calendarKey(index) {
  const m0 = CALENDAR_LAUNCH.month - 1 + index;
  return `${CALENDAR_LAUNCH.year + Math.floor(m0 / 12)}-${pad((m0 % 12) + 1)}-01`;
}
export function openedPlaces(S) {
  const kept = Array.isArray(S.opened) ? S.opened : [];
  return PLACE_IDS.filter((id, i) => i === 0 || kept.includes(id) || timeDone(S, PLACE_IDS[i - 1], OPEN_AFTER));
}
/* the next place to open, the place whose morning opens it, and how many steps of that morning are left */
export function nextOpening(S) {
  const open = openedPlaces(S), i = PLACE_IDS.findIndex((id) => !open.includes(id));
  if (i < 0) return null;
  const after = PLACE_IDS[i - 1];
  return { place: PLACE_IDS[i], after, left: ZONE_IDS.reduce((n, z) => n + STEPS - Math.min(STEPS, progress(S, after, OPEN_AFTER, z)), 0) };
}
/* an open place with something left to sing, other than `but` */
export const placeWaiting = (S, but = null) => openedPlaces(S).find((p) => p !== but && !monthDone(S, p)) || null;

/* ---------- a visit: the one thing the calendar still does ----------
   The save says who is visiting ("newyear-2027": which visit, and the year, so that its letter comes again the next
   year). It is set from the date when the game is opened and whenever Home is drawn (keepVisit), so that everything
   that draws a singer can ask the save and not the clock. */
export const visitOn = (key) => VISIT_MONTHS[Number(String(key || "").slice(5, 7))] || false;
function visitId(key) { const v = visitOn(key); return v ? `${v}-${key.slice(0, 4)}` : null; }
export function keepVisit(S, real) { S.visit = visitId(todayKey(S, real)); return S.visit; }
export const visiting = (S) => (S.visit ? String(S.visit).split("-")[0] : false);
/* the guests who may sing any garment anywhere while they are here */
export const visitors = (S) => VISITORS[visiting(S)] || [];
export const isVisitLetter = (id) => !PLACE_IDS.includes(id);

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

export function goTo(S, place) {
  if (!openedPlaces(S).includes(place)) return false;
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

/* ---------- the drills the player has met ----------
   A drill is met once a take of it reaches the count. A drill not met yet shows its card first (take-screen.js).
   It was made on 2026-11-24 so that the demo would play by itself only the first time, the take giving the first
   note alone after that; the designer played it and asked for the whole phrase back on every take the same day ("the player
   doesn't know what notes to sing next"), so the list now decides the card and nothing about the demo. */
export const heardDrill = (S, id) => Array.isArray(S.heard) && S.heard.includes(id);
export function hearDrill(S, id) {
  if (!Array.isArray(S.heard)) S.heard = [];
  if (id && !S.heard.includes(id)) S.heard.push(id);
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
  const out = { counted: true, step: list.length, learned, garmentDone: false, timeDone: null, monthDone: false, treats: earnTreats(S, real) };
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
  return { counted: true, step: ctx.step, retake: true, treats: earnTreats(S, real) };
}

/* ---------- treats and cats (the designer, 2026-11-14 and 15; content.js has the rules in words) ----------
   Treats: every finished take that heard a voice earns the same, whatever the grade and whether it is a new step or
   one sung again, for the first TREATS.perDay takes of a day; after that singing goes on and earns nothing, so
   nobody sings their voice sore for them. No streaks: a day missed costs nothing. */
export const treatsOf = (S) => Math.max(0, (S.treats?.earned || 0) - (S.treats?.spent || 0));
export function earnTreats(S, real = new Date()) {
  const t = S.treats || (S.treats = { earned: 0, spent: 0, day: null, n: 0 }), today = todayKey(S, real);
  if (t.day !== today) { t.day = today; t.n = 0; }
  if (t.n >= TREATS.perDay) return { got: 0, left: 0, total: treatsOf(S) };
  t.n++;
  t.earned += TREATS.take;
  /* first = this take is the one that made a cat affordable: the result sheet shows the way to the shop once */
  const total = treatsOf(S);
  return { got: TREATS.take, left: TREATS.perDay - t.n, total, first: total >= TREATS.cat && total - TREATS.take < TREATS.cat };
}
export const ownsCat = (S, id) => (S.cats || []).includes(id);
/* the cats that live at a place: its cast of three, by zone */
export const catsHere = (place) => ZONE_IDS.map((z) => kindFor(place, z));
/* what can be brought home from here: the place's own cats and the shelf, without the ones already at home */
export function shelfAt(S, place) {
  const free = (id) => !ownsCat(S, id);
  return { here: catsHere(place).filter(free), cats: SHOP_CATS.filter(free), animals: SHOP_ANIMALS.filter(free) };
}
export function canBuy(S, id, place = S.here) {
  const s = shelfAt(S, place);
  return [...s.here, ...s.cats, ...s.animals].includes(id) && treatsOf(S) >= priceOf(id);
}
export function buyCat(S, id, place = S.here) {
  if (!canBuy(S, id, place)) return false;
  S.treats.spent += priceOf(id);
  S.cats.push(id);
  return true;
}
export const catName = (S, id) => (S.catNames && typeof S.catNames[id] === "string" ? S.catNames[id] : "");
export function nameCat(S, id, name) {
  if (!ownsCat(S, id)) return false;
  const n = String(name || "").replace(/\s+/g, " ").trim().slice(0, 14);
  if (!S.catNames || typeof S.catNames !== "object") S.catNames = {};
  if (n) S.catNames[id] = n; else delete S.catNames[id];
  return true;
}
/* Who sings a garment. A place has three singers, one per zone, the same at every time of day: its own three cats
   until the player puts in one of theirs ("玩家選，每月有貓來玩") or a guest who is visiting. Stored per place as
   cast[zone] = id, only for the zones the player changed. A singer who may no longer sing here (a guest who has
   gone home) falls back to the place's own. */
const homeSinger = (place, time, zone) => kindFor(place, zone);
/* the place's own three, by zone */
export const homeCast = (place, time) => Object.fromEntries(ZONE_IDS.map((z) => [z, homeSinger(place, time, z)]));
const maySing = (S, place, id) => ownsCat(S, id) || catsHere(place).includes(id) || visitors(S).includes(id);
export function castAt(S, place, time) {
  const stored = peek(S, place).cast || {}, out = {}, used = new Set();
  for (const z of ZONE_IDS) { const id = stored[z]; if (id && maySing(S, place, id) && !used.has(id)) { out[z] = id; used.add(id); } }
  for (const z of ZONE_IDS) if (!out[z]) { const id = homeSinger(place, time, z); out[z] = id; used.add(id); }
  return out;
}
export const singerAt = (S, place, time, zone) => castAt(S, place, time)[zone];
/* put a singer on a zone. If it was singing another zone, the two change places. False when it may not sing here */
export function setSinger(S, place, time, zone, id) {
  if (!ZONE_IDS.includes(zone) || !maySing(S, place, id)) return false;
  const now = castAt(S, place, time), m = monthOf(S, place);
  if (!m.cast || typeof m.cast !== "object") m.cast = {};
  const from = ZONE_IDS.find((z) => now[z] === id);
  if (from === zone) return true;
  if (from) m.cast[from] = now[zone];
  m.cast[zone] = id;
  return true;
}
/* a singer as the art takes it. A cat's coat is its own; an animal has one look (the art's GUEST_PAL). `fur` only
   sets how thick the knitting is, and it is the singer's own (content.js knitOf; until 2026-11-22 the time of day's) */
function singerLook(place, time, zone, id) {
  const base = { ...garmentLook(place, time, zone), fur: knitOf(id) };
  return isAnimal(id) ? { animal: id, kind: "point", look: base } : { animal: "cat", kind: id, look: { ...base, ...catCoat(id) } };
}
/* a garment by name, with the size its singer gives it: "Thick scarf", "Light top" */
export const garmentTitle = (S, place, time, zone) => knitGarment(knitOf(singerAt(S, place, time, zone)), zone);

/* ---------- what the art draws ---------- */
export function garmentSpec(S, place, time, zone, extra = {}) {
  const steps = stepsOf(S, place, time, zone);
  const n = Math.min(STEPS, steps.length);
  const shapes = Array.from({ length: STEPS }, (_, i) => (i < n ? steps[i]?.shape || null : null));
  const tufts = Array.from({ length: STEPS }, (_, i) => (i < n ? !!steps[i]?.tuft : false));
  const folds = Array.from({ length: STEPS }, (_, i) => (i < n && Array.isArray(steps[i]?.folds) ? steps[i].folds : null));
  const singer = singerAt(S, place, time, zone), yarn = yarnOf(S, place, time, zone), who = singerLook(place, time, zone, singer);
  /* `fur` is the knit weight of the sleeve. With no sleeve it would be the cat's fur, which stays short all day */
  if (!yarn) who.look = { ...who.look, fur: "short" };
  return { zone, ...who, singer, yarn, steps: n, shapes, tufts, folds, wrap: wrapOf(S, place, time, zone), ...extra };
}

/* ---------- a wrap laid by hand (the designer, 2026-11-15) ----------
   While a garment is being sung, and when its twelfth step is done, the game wraps it round the judge itself. After
   that the player may wrap it again by hand: a few strokes drawn on the judge, each one a turn of the garment
   ("可以先圍一圈再圍斜斜的"). The strokes are kept per garment in the month, as lists of [x, y] in the picture's own
   400 x 500; a garment with none is wrapped the game's way, and taking the strokes away goes back to that ("馬上圍成
   原本系統圍好的"). Where a garment may be drawn (the hat on the head, and so on) and how long it may be is the
   art's to say (art wrapArea) and the wrap screen's to keep (ui/wrap.js); here a wrap only has to be well formed. */
export const WRAP_MAX = { strokes: 12, points: 120 };
function cleanWrap(w) {
  if (!Array.isArray(w)) return null;
  const out = [];
  for (const s of w.slice(0, WRAP_MAX.strokes)) {
    if (!Array.isArray(s)) continue;
    const pts = [];
    for (const p of s.slice(0, WRAP_MAX.points)) {
      if (!Array.isArray(p) || typeof p[0] !== "number" || typeof p[1] !== "number" || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
      pts.push([Math.round(Math.max(0, Math.min(400, p[0])) * 10) / 10, Math.round(Math.max(0, Math.min(500, p[1])) * 10) / 10]);
    }
    if (pts.length >= 2) out.push(pts);
  }
  return out.length ? out : null;
}
/* a finished garment's own wrap, or null for the game's */
export function wrapOf(S, place, time, zone) {
  const w = peek(S, place).wraps?.[gkey(time, zone)];
  return w && garmentDone(S, place, time, zone) ? cleanWrap(w) : null;
}
/* keep a wrap for a finished garment; nothing (or nothing drawable) puts the game's wrap back. False when the
   garment is not finished */
export function setWrap(S, place, time, zone, strokes) {
  if (!TIME_IDS.includes(time) || !ZONE_IDS.includes(zone) || !garmentDone(S, place, time, zone)) return false;
  const m = monthOf(S, place), w = cleanWrap(strokes);
  if (!m.wraps || typeof m.wraps !== "object") m.wraps = {};
  if (w) m.wraps[gkey(time, zone)] = w; else delete m.wraps[gkey(time, zone)];
  return true;
}
/* this month's finished garments, the ones that can be wrapped by hand: [{ time, zone }], newest time first */
export function wrappable(S, place) {
  return [...TIME_IDS].reverse().flatMap((t) => ZONE_IDS.filter((z) => garmentDone(S, place, t, z)).map((z) => ({ time: t, zone: z })));
}

/* ---------- yarn (the designer, 2026-11-14) ----------
   A garment is a cat in a knitted sleeve. The cat keeps its own coat (content.js garmentLook); the sleeve's yarn is
   what the player collects and moves about. Every garment of a month has its own designed yarn (content.js yarnFor).
   Finishing a garment collects its yarn ("織完那一件，就收到那一件的毛線"); a collected yarn can then go on any
   garment of that month, as often as you like, and come off again ("收到的毛線可以換到當月任何一件上"). How thick
   the knitting is stays with the time of day. Yarn belongs to its month (place): the next month's box starts empty.
   Stored per month as yarns[garment] = the garment the yarn is borrowed from; a garment in its own yarn is not stored.
   A garment can also go without any yarn (the designer, 2026-11-15: "cat can choose no yarn at all too"): stored as NO_YARN,
   always allowed, nothing to collect. Then it is the cat itself with no sleeve, in its own coat and its own short fur.
   This replaces the coats of earlier the same day, which worked the same way on the cats' fur: with the sleeve, the
   fur is the cat's and stays put. Old saves' `coats` are dropped (migrate). */
export const yarnKey = (time, zone) => gkey(time, zone);
export const NO_YARN = "none";
const yarnParts = (key) => { const [t, z] = String(key).split("."); return TIME_IDS.includes(t) && ZONE_IDS.includes(z) ? { time: t, zone: z } : null; };
/* the yarn a key stands for at this place: the designed yarn of the garment it comes from */
export const yarnAt = (place, key) => { const src = yarnParts(key); return src ? yarnFor(place, src.time, src.zone) : null; };
/* the yarns collected at this place, in the order the garments are listed: [{ key, time, zone, yarn }] */
export function collectedYarns(S, place) {
  return TIME_IDS.flatMap((t) => ZONE_IDS.filter((z) => garmentDone(S, place, t, z)).map((z) => ({ key: gkey(t, z), time: t, zone: z, yarn: yarnFor(place, t, z) })));
}
/* which yarn a garment is in, as a key: its own unless it borrowed one that is (still) collected */
export function yarnKeyOf(S, place, time, zone) {
  const own = gkey(time, zone), k = peek(S, place).yarns?.[own], src = k && k !== own ? yarnParts(k) : null;
  if (k === NO_YARN) return NO_YARN;
  return src && garmentDone(S, place, src.time, src.zone) ? k : own;
}
export const yarnOf = (S, place, time, zone) => yarnAt(place, yarnKeyOf(S, place, time, zone));
/* put a collected yarn on a garment (key = null or its own key: back to its own; NO_YARN: none at all). False when
   it is not collected */
export function setYarn(S, place, time, zone, key) {
  const own = gkey(time, zone), m = monthOf(S, place);
  if (!m.yarns || typeof m.yarns !== "object") m.yarns = {};
  if (!key || key === own) { delete m.yarns[own]; return true; }
  if (key === NO_YARN) { m.yarns[own] = NO_YARN; return true; }
  if (!collectedYarns(S, place).some((c) => c.key === key)) return false;
  m.yarns[own] = key;
  return true;
}

/* No cats stay asleep in baskets any more (2026-11-15): a place has three singers, and the three that finish a time
   of day are the three that sing the next. They still nap in a basket during the reset beat (ui/beat.js builds
   that basket itself). Kept so that callers need not change. */
export function basketsFor() { return []; }

export function homeScene(S, place = S.here, real, extra = {}) {
  const cur = currentTime(S, place) || "night";
  const garments = ZONE_IDS.map((z) => garmentSpec(S, place, cur, z));
  return {
    /* no baskets of sleeping cats here: with them the home page was too full (the designer, 2026-11-14). The cats still run to
       their basket in the reset beat (ui/beat.js), which asks basketsFor itself; after that they are out of sight */
    place, time: cur, face: extra.face || "neutral", garments, baskets: [],
    /* no daily cushion on the next step any more: a red block with a number on the judge read as a puzzle, and the
       bottom row already says which step is next (the designer, 2026-11-14: "把它完全拿掉"). The art can still draw one. */
    cushion: null, special: visiting(S), animate: true, seed: takesAt(S, place),
    landscape: true, // the place's full landscape, as on the postcards (the designer, 2026-11-14)
    ...extra,
  };
}

/* ---------- postcards ---------- */
export function cardCaption(place, bg, set, cats = null) {
  const p = placeById(place);
  const names = ZONE_IDS.map((z, i) => {
    const n = cats ? knitGarment(knitOf(cats[z]), z) : garmentName(set[z], z);
    return i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1);
  }).join(", ");
  const same = ZONE_IDS.every((z) => set[z] === bg);
  return `The judge ${p.at}. ${timeById(bg).name}. ${names}. ${same ? p.lines[bg] : MIX_LINE}`;
}
function newCard(S, place, kind, bg, set, real) {
  const m = monthOf(S, place);
  const card = {
    id: `${place}-${kind}-${m.cards.length + 1}-${Date.now().toString(36)}`, kind, place, bg, set: { ...set },
    /* a postcard keeps the singers and the yarns as they were when it was taken, whatever is changed afterwards */
    cats: Object.fromEntries(ZONE_IDS.map((z) => [z, singerAt(S, place, set[z], z)])),
    yarns: Object.fromEntries(ZONE_IDS.map((z) => [z, yarnKeyOf(S, place, set[z], z)])),
    /* and the way each garment was wrapped (null = the game's way) */
    wraps: Object.fromEntries(ZONE_IDS.map((z) => [z, wrapOf(S, place, set[z], z)])),
    caption: cardCaption(place, bg, set, Object.fromEntries(ZONE_IDS.map((z) => [z, singerAt(S, place, set[z], z)]))), date: todayKey(S, real),
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
/* What a mixed postcard can be made of at a place: for each garment the times of day whose one is finished, and the
   skies reached. `any` says there is something to mix: every garment has a finished one, and more than one picture
   is possible. */
export function mixable(S, place) {
  const zones = {};
  for (const z of ZONE_IDS) zones[z] = TIME_IDS.filter((t) => garmentDone(S, place, t, z));
  const skies = reachedTimes(S, place);
  const n = ZONE_IDS.reduce((k, z) => k * zones[z].length, 1) * skies.length;
  return { zones, skies, any: n > 1 };
}
/* What the Wardrobe's Dress up page opens on: of each garment the newest finished one, or the one of the time of day
   being knitted while none is finished; under the newest sky reached. So the judge is dressed as soon as there is
   something to wear, and the first morning shows what Home shows. */
export function dressStart(S, place) {
  const mx = mixable(S, place), cur = currentTime(S, place) || TIME_IDS[TIME_IDS.length - 1], set = {};
  for (const z of ZONE_IDS) set[z] = mx.zones[z].length ? mx.zones[z][mx.zones[z].length - 1] : cur;
  return { bg: mx.skies[mx.skies.length - 1], set };
}
export function addMixCard(S, place, set, bg, real) {
  if (!reachedTimes(S, place).includes(bg)) return null;
  if (!ZONE_IDS.every((z) => garmentDone(S, place, set[z], z))) return null;
  return newCard(S, place, "mix", bg, set, real);
}
export function cardScene(S, card, extra = {}) {
  const garments = ZONE_IDS.map((z) => {
    const g = garmentSpec(S, card.place, card.set[z], z);
    /* a card from before cats could be chosen (it has `kinds`, or nothing) shows the place's own cat in the coat
       it wore at that time of day, as it did then; an older card still has no yarns and shows each garment's own */
    const who = card.cats?.[z]
      ? singerLook(card.place, card.set[z], z, card.cats[z])
      : { animal: "cat", kind: card.kinds?.[z] || kindFor(card.place, z), look: garmentLook(card.place, card.set[z], z) };
    const bare = card.yarns?.[z] === NO_YARN;
    if (bare) who.look = { ...who.look, fur: "short" };
    /* a card from before garments could be wrapped by hand has no `wraps`: it shows the game's wrap, as it did */
    return { ...g, ...who, yarn: bare ? null : yarnAt(card.place, card.yarns?.[z]) || yarnFor(card.place, card.set[z], z), wrap: card.wraps ? cleanWrap(card.wraps[z]) : null };
  });
  return { place: card.place, time: card.bg, face: "neutral", garments, baskets: [], cushion: null, special: visitOn(card.date), animate: false, seed: 7, ...extra };
}
/* What the album and the wardrobe hold, for the dock's "something new" dots. The album is its postcards: the
   judge's faces are no longer kept there (the designer, 2026-11-15: an Easter egg, not a list). */
export function drawerCounts(S) {
  return {
    album: allCards(S).length,
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
/* a letter per open place, and one for the visit while it lasts */
export const unreadLetters = (S) => [...openedPlaces(S), ...(S.visit ? [S.visit] : [])].filter((p) => !S.letters.includes(p));
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
/* Start a place again (the designer, 2026-11-24: "a cheat to reset all progress in the current location"). Everything the
   place holds goes: its garments, the garment chosen, who sings, the yarns, the wraps, the beats seen and its
   postcards. Everything else stays: the other places, the cats, the treats, the faces learned, the days sung and
   the log of takes. Every place open now stays open, also one that this place's morning had opened. */
export function devResetPlace(S, place = S.here) {
  if (!PLACE_IDS.includes(place)) return false;
  const open = openedPlaces(S);
  delete S.months[place];
  S.opened = PLACE_IDS.filter((id, i) => i > 0 && open.includes(id));
  /* the dock's dots count what the album and wardrobe hold: bring the marks down with them */
  const c = drawerCounts(S);
  S.marks = { ...(S.marks || {}), album: Math.min(S.marks?.album || 0, c.album), wardrobe: Math.min(S.marks?.wardrobe || 0, c.wardrobe) };
  return true;
}

export { TIMES, PLACES };
