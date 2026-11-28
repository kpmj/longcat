/* The train station, 驛之里 (2026-11-28, the designer: "I want it to be a train station where it's the steam train. clicking
   the train it will have the train sound and the steam would move ... japanese traditional train station will be
   ideal. and please also create 3-4 objects that are reasonable in this theme"). A PROPOSAL: it is not in PLACES
   (content.js) or the calendar. Where it goes in the order is the designer's call; it is meant to be the place after the
   jungle. The calendar's "train" (Train carriage) is another idea and is left alone.

   Built like the jungle (./jungle.js): a tall background for Home, the things laid on it as their own pieces, each
   its own thing to press, and what the effects layer moves (art/fx.js, ui/home-fx.js).
   - the designer's picks on the first board (picks/set-station): GPT's signal, clock and wind chime (art/img/station/,
     art/pictures.js), no post box (HIDDEN keeps it), a ticket on the judge's head, the title 驛之里.
   - THE TRAIN, made twice again. the designer found the first a toy (「火車在左上方感覺很像玩具」); of the big engine cut by the
     screen's edge: "the demo doesn't quite fit it ... make sure the train is not being blocked by the capybara ...
     make sure the train fit into the background. the current demo looks pretty detatched", and chose two ideas to
     see: 甲 the engine's front, chimney and front wheels in the open beside the judge, its back cut by the left
     edge; 乙 the engine on the left and a carriage on the right, standing at the platform behind the bench.
     So the train is now part of the scenery: a background made for it (ACROSS in ./station-draw.js; GPT's
     `back-train`): we sit on the near platform, the rails run right behind the bench, the station building stands
     across the tracks with its eave just above the train's roof, and the train stands on those rails at that
     building's scale. It is drawn in the tall picture's own units, inside the tall picture (`tall` below), so it
     stands on the painted rails on every phone. What shows of it is always clear of the judge: the front in 甲,
     the front and the carriage's windows in 乙; only its middle goes behind the judge.
   - the designer's picks on the train's board (picks/set-station-train2): 甲, GPT's background across the tracks and GPT's
     tank engine, the train coming and going with its sounds. the designer's first pick of background (GPT's wooden station
     house) put the building on our side of the tracks, where a train could not stand in front of it; it is in git
     history (before 6d0f01d), with Claude's three first ideas.
   - What answers a tap, each its own data-tap with a hit area round it (a tap on nothing does nothing): the engine
     (it chugs, its whistle blows and a big puff of steam comes out; at rest steam rises from its chimney all the
     time); the carriage (乙: it rocks on its springs, its windows light up for a moment, a door chime); the signal
     (its arm drops and lifts; it also drops by itself just before the train pulls out); the clock (its hands spin
     round once); the wind chime (it swings and rings, its paper strip after it); the sun or moon.
   - The train may pull out and come in again (the designer's 丁 of the round before; `run`, TIMETABLE).
   - The sounds are files from the audio engine (tools/audio/pieces/station_taps.py; audio/ambient.js).
   - The seat is a wooden platform bench, with no back.
   Where the things are: only where Home shows the picture and no button, title block or judge covers it
   (tools/art/ui-zones.json; tests/station.test.mjs). In the print's 400 x 500 the free places, on both measured
   phones and with the tallest hat, are: beside the head on the left x 18..112, y 22..235; on the right under the
   title x 288..382, y 137..235; low beside the body x 18..74 and 326..382, y 247..478. */
import { makePlace, floorBand, tint, VIEW, pen, KEY } from "./kit.js";
import { PICTURES, picture } from "../../pictures.js";
import * as D from "./station-draw.js";

/* the pieces that are pictures and the objects left out (the designer's picks), the pictures */
export const PICKED = { background: true, engine: true, signal: true, clock: true, chime: true };
export const HIDDEN = { postbox: true };
export const PICS = PICTURES.station || {};
/* the designer's picks on the train's board (picks/set-station-train2): 甲 ("front"), GPT's background and engine, the train
   coming and going, with its sounds. 乙 ("whole", with a carriage) stays here, drawn by Claude's carriage */
export const LAYOUT = "front", ITEM = "ticket", NAME = "驛之里";
export const OBJECTS = ["signal", "clock", "postbox", "chime"];

const INK = KEY, F = D.FRAMES, A_ = D.ACROSS;
const live = on => on("x") !== "";
const n = v => +(+v).toFixed(2);
/* WHERE THE THINGS ARE. A box is [x, y, width] in the print, its height from its frame; `flip` turns it to face the
   other way. The train is in the tall picture's units: `face` 1 looks right, -1 left; `front` is the x of its
   buffer beam; `height` from its wheels (on the near rail, ACROSS.rails[1]) to its chimney's top, so its roof is
   just under the building's eave. `far` things stand across the tracks, in the tall picture, behind the train */
const ARRANGE = {
  /* 甲: the engine faces right, its front just left of the judge's body (x 74 in the tall picture: the body's edge
     is at 74 on the designer's phone and 82 on the long one), its back off the left edge; on the right the empty track, the
     signal on our platform, the clock and the sun under the title */
  front: {
    sun: [296, 168, 30], clock: [332, 146, 50, true], post: ["right", 136], chime: [84, 42, 18], beam: ["left", 42],
    postbox: [26, 372, 36], signal: [322, 346, 60],
    train: { face: 1, front: 74, height: 139 },
  },
  /* 乙: the engine faces left, its buffer just off the left edge (so its chimney is in the open and the carriage's
     windows reach the right side), a carriage coupled behind it on the right; the signal
     stands across the tracks with its arm above the carriage's roof; the sun moves up to the left */
  whole: {
    sun: [24, 34, 30], clock: [332, 146, 50, true], post: ["right", 136], chime: [84, 42, 18], beam: ["left", 42],
    postbox: [26, 372, 36], signal: { far: [330, 290, 50] },
    train: { face: -1, front: -16, height: 139, carriage: .9 },
  },
};
export const LAYOUTS = { front: { all: "front" }, whole: { all: "whole" } };
const arrangementOf = (layout, time) => ARRANGE[(LAYOUTS[layout] || {})[time] || (LAYOUTS[layout] || {}).all || "front"];
/* a box [x, y, w(, flip)] with its frame's height, and the transform that puts the frame's px in it */
const boxOf = (id, [x, y, w]) => [x, y, w, n(w * F[id][1] / F[id][0])];
const place = (id, [x, y, w, flip]) => { const k = w / F[id][0]; return flip ? `translate(${n(x + w)} ${y}) scale(${n(-k)} ${n(k)})` : `translate(${x} ${y}) scale(${n(k)})`; };
/* a part of a picture: the box [x, y, w, h] of its px, cut with a nested svg (it clips to itself) */
const cut = (pic, [x, y, w, h]) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden">${picture(pic, 0, 0, pic.w, pic.h)}</svg>`;
/* a turning part's group holds this square round its pivot, so its own box's middle is the pivot (fill-box 50% 50%) */
const PIN = `<path d="M-600 -600H600V600H-600Z" fill="none"/>`;
const hit = (id, pad = 0) => `<rect x="${-pad}" y="${-pad}" width="${F[id][0] + 2 * pad}" height="${F[id][1] + 2 * pad}" fill="${INK}" fill-opacity="0"/>`;
/* a picture's colours moved to the light of golden hour and night, as the backgrounds are painted (GPT's engine and
   carriage are one picture for all three times); a drawing is already in its time's colours */
const LIGHT = { golden: ".92 .1 0 0 .05  .03 .82 .02 0 .03  0 .04 .7 0 .02  0 0 0 1 0", night: ".5 .04 .04 0 .02  .03 .56 .06 0 .04  .05 .1 .78 0 .1  0 0 0 1 0" };
const lightDefs = time => (LIGHT[time] ? `<filter id="lc-station-${time}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${LIGHT[time]}"/></filter>` : "");
const lit = (time, inner) => (LIGHT[time] ? `<g filter="url(#lc-station-${time})">${inner}</g>` : inner);

/* the train in the tall picture: the engine's version (a version with no picture is Claude's), its scale, where it
   is, and the carriage behind it in 乙 */
function trainOf(o, A) {
  const at = A.train, ev = o.engine !== "claude" && o.trainPics && o.trainPics[o.engine] ? o.engine : "claude", T = D.TRAINS[ev];
  const rail = A_.rails[1], k = at.height / (T.wheels - T.chimney[1]), y = rail - T.wheels * k;
  /* a frame px x -> the tall picture's x */
  const X = px => n(at.face > 0 ? at.front - (T.front - px) * k : at.front + (T.front - px) * k);
  const engine = { v: ev, T, k, y: n(y), x0: Math.min(X(T.front), X(T.back)), x1: Math.max(X(T.front), X(T.back)), X, pic: ev === "claude" ? null : o.trainPics[ev],
    chimney: [X(T.chimney[0]), n(y + T.chimney[1] * k)], cylinder: [X(T.cylinder[0]), n(y + T.cylinder[1] * k)], front: X(T.front), size: n(T.width * k / 14) };
  let carriage = null;
  if (at.carriage) {
    const cv = o.carriage !== "claude" && o.carPics && o.carPics[o.carriage] ? o.carriage : "claude", C = D.CARRIAGES[cv];
    const kc = at.height * at.carriage / (C.wheels - C.top), start = at.face > 0 ? engine.x0 - 1 - (C.back - C.front) * kc : engine.x1 + 1;
    carriage = { v: cv, C, k: kc, x: n(start - C.front * kc), y: n(rail - C.wheels * kc), x0: n(start), x1: n(start + (C.back - C.front) * kc), pic: cv === "claude" ? null : o.carPics[cv] };
  }
  return { engine, carriage, x0: Math.min(engine.x0, carriage ? carriage.x0 : 1e9), x1: Math.max(engine.x1, carriage ? carriage.x1 : -1e9) };
}
/* the train's markup, in the tall picture: lc-train-run is the group the effects layer moves along the rails when it
   pulls out and comes in (ui/home-fx.js); it has no transform of its own, so a still shows the train standing */
function trainMarkup(o, A, time, on) {
  const t = trainOf(o, A), e = t.engine, night = time === "night", warm = VIEW.night.warm;
  const tap = (id, inner) => (live(on) ? `<g data-tap="${id}">${inner}</g>` : inner);
  const glow = boxes => (night ? boxes.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${warm}" opacity=".9"/>`).join("") : "");
  const [fw, fh] = e.T.frame;
  const eArt = e.pic ? lit(time, picture(e.pic, 0, 0, fw, fh)) : D.drawTrain(time);
  const flip = A.train.face > 0 ? `translate(${n(e.X(0))} ${e.y}) scale(${n(e.k)})` : `translate(${n(e.X(0))} ${e.y}) scale(${n(-e.k)} ${n(e.k)})`;
  const engine = `<g transform="${flip}">${tap("train", `<rect width="${fw}" height="${fh}" fill="${INK}" fill-opacity="0"/><g${on("lc-chug")}>${eArt}${glow(e.T.lit)}</g>`)}</g>`;
  let carriage = "";
  if (t.carriage) {
    const c = t.carriage, [cw, ch] = c.C.frame, cArt = c.pic ? lit(time, picture(c.pic, 0, 0, cw, ch)) : D.drawCarriage(time);
    const flash = live(on) ? `<g class="lc-car-flash">${c.C.windows.map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${warm}"/>`).join("")}</g>` : "";
    carriage = `<g transform="translate(${c.x} ${c.y}) scale(${n(c.k)})">${tap("carriage", `<rect width="${cw}" height="${ch}" fill="${INK}" fill-opacity="0"/><g${on("lc-rock")}>${cArt}${glow(c.C.windows)}${flash}</g>`)}</g>`;
  }
  /* a flat shadow on the ballast under it, so it stands on the track */
  const shadow = `<rect x="${n(t.x0 + 4)}" y="${A_.rails[1] - 3}" width="${n(t.x1 - t.x0 - 8)}" height="7" rx="3" fill="${INK}" opacity=".22"/>`;
  return `<g class="lc-train-run">${shadow}${carriage}${engine}</g>`;
}

function parts(V, q, time, on, o) {
  const A = arrangementOf(o.layout, time), pic = id => (o.picked[id] && o.pics[id] ? o.pics[id] : null), shown = id => !o.hidden[id];
  const tap = (id, inner) => (live(on) ? `<g data-tap="${id}">${inner}</g>` : inner);
  const wood = tint("#7d5638", time), woodDk = tint("#5b4030", time);
  /* the sun where Home shows it; by night the moon (a thing of its own to press, as at every place) */
  const [sx, sy, sw] = A.sun, night = time === "night";
  const disc = `<g${on("lc-sun")}>${night ? `<circle cx="${sx + sw / 2}" cy="${sy + sw / 2}" r="${sw * .4}" fill="${V.disc[0]}"/>` + q.c(sx + sw * .62, sy + sw * .4, sw * .3, V.sky[0], 0) : q.c(sx + sw / 2, sy + sw / 2, sw * .45, time === "golden" ? "#f6c25e" : "#c9553f", 1.4)}</g>`;
  /* a post at the edge for the clock, a beam from the edge for the chime */
  const post = (side, y) => q.r(side === "left" ? 4 : 384, y, 14, 460 - y, wood, 1.6) + q.r(side === "left" ? 2 : 382, y - 6, 18, 8, woodDk, 1.4);
  const beam = (side, y) => q.p(side === "left" ? `M-10 ${y - 8}H${A.chime[0] + 20}V${y}H-10Z` : `M410 ${y - 8}H${A.chime[0] - 4}V${y}H410Z`, wood, 1.5);
  /* what each thing hangs from comes with it, behind it */
  const SUPPORT = { clock: () => post(...A.post), chime: () => beam(...A.beam) };
  /* THE SIGNAL: the arm turns down and back up round its pivot (lc-arm) */
  const signal = box => {
    const P = pic("signal"), [ax, ay] = D.POINTS.signal.pivot, c = D.POINTS.signal.cut;
    const still = P ? cut(P, [0, 0, c, P.h]) + cut(P, [c, 0, P.w - c, 90]) + cut(P, [c, 140, P.w - c, P.h - 140]) : D.drawSignal(time);
    const arm = P ? cut(P, [c, 90, P.w - c, 50]) : D.drawSignalArm(time);
    /* by night its lamp is lit, in both versions */
    const lamp = night ? `<circle cx="48" cy="109" r="17" fill="${V.warm}" opacity=".95"/>` : "";
    return `<g transform="${place("signal", box)}">${tap("signal", `${hit("signal", 12)}${still}${lamp}<g transform="translate(${ax} ${ay})"><g${on("lc-arm")}>${PIN}<g transform="translate(${-ax} ${-ay})">${arm}</g></g></g>${D.signalBolt(time)}`)}</g>`;
  };
  /* THE CLOCK: the hands spin round once (lc-hand-h, lc-hand-m); GPT's own hands are under a disc of its face */
  const clock = () => {
    const P = pic("clock"), [cx, cy] = D.POINTS.clock.middle, flip = !!A.clock[3];
    const art = P ? picture(P, 0, 0, P.w, P.h) + D.clockCover() : D.drawClock(time);
    /* a clock turned to face the other way keeps its hands going clockwise */
    const hands = `<g transform="translate(${cx} ${cy})${flip ? " scale(-1 1)" : ""}">${D.clockHands([on("lc-hand-h"), on("lc-hand-m")])}</g>`;
    return `<g transform="${place("clock", A.clock)}">${tap("clock", `${hit("clock", 10)}${art}${hands}`)}</g>`;
  };
  /* THE POST BOX: it hops (lc-st-hop) and a letter flies out of its slot (lc-letter) */
  const postbox = () => {
    const P = pic("postbox"), [lx, ly] = D.POINTS.postbox.slot;
    const art = P ? picture(P, 0, 0, P.w, P.h) : D.drawPostbox(time);
    const flying = live(on) ? `<g transform="translate(${lx} ${ly}) scale(3.4)"><g class="lc-letter">${D.letter()}</g></g>` : "";
    return `<g transform="${place("postbox", A.postbox)}">${tap("postbox", `${hit("postbox", 14)}<g${on("lc-st-hop")}>${art}</g>${flying}`)}</g>`;
  };
  /* THE WIND CHIME: it sways all the time and swings when pressed (lc-sway, as every hanging thing does), its paper
     strip swings after the bell (lc-strip), and two small lines ring out beside the bell (lc-ring) */
  const chime = () => {
    const P = pic("chime"), [hx, hy] = D.POINTS.chime.hook, s = D.POINTS.chime.strip;
    const bell = P ? cut(P, [0, 0, P.w, s]) : D.drawChime(time), strip = P ? cut(P, [0, s, P.w, P.h - s]) : D.drawChimeStrip(time);
    const ring = live(on) ? `<g class="lc-ring">${q.l("M8 120Q-6 150 8 180M-12 110Q-32 150 -12 190M164 120Q178 150 164 180M184 110Q204 150 184 190", 7)}</g>` : "";
    const inner = `<path d="M${hx - 1000} ${hy - 1000}h2000v2000h-2000Z" fill="none"/>${bell}<g transform="translate(${hx} ${s})"><g${on("lc-strip")}>${PIN}<g transform="translate(${-hx} ${-s})">${strip}</g></g></g>${ring}`;
    return `<g transform="${place("chime", A.chime)}">${tap("chime", `${hit("chime", 16)}<g${on("lc-sway", "animation-duration:4.2s")}>${inner}</g>`)}</g>`;
  };
  const DRAW = { signal: () => (A.signal.far ? "" : signal(A.signal)), clock, postbox, chime };
  return [
    { id: "sun", box: [sx, sy, sw, sw], svg: tap("window", disc) },
    ...OBJECTS.map(id => ({ id, box: id === "signal" && A.signal.far ? null : boxOf(id, A[id]), far: id === "signal" && A.signal.far ? A.signal.far : null, svg: shown(id) ? (SUPPORT[id] ? SUPPORT[id]() : "") + DRAW[id]() : "" })),
    /* the signal across the tracks (乙), drawn in the tall picture behind the train: here for the art tools */
    ...(A.signal.far ? [{ id: "signal-far", tall: true, svg: shown("signal") ? signal(A.signal.far) : "" }] : []),
  ];
}

/* THE TRAIN'S TIMETABLE (丁, DRAFT: my numbers, waiting for the designer's feel): it stands `stand` seconds; `clear` seconds
   before it goes the signal's arm drops; it pulls out over `depart` seconds the way it faces, speeding up, passes
   behind the judge and leaves the screen; the platform is empty for `away` seconds; it comes in from the other side
   over `arrive` seconds, slowing down, and stops where it stood. Home starts it standing, part way into its stand */
export const TIMETABLE = { stand: 40, clear: 2.5, depart: 8, away: 6, arrive: 6, start: 12 };
/* what the effects layer moves on Home, in the tall picture's units (`space`; ui/home-fx.js): the train's steam
   from the chimney and the cylinders (`train`: the hot spring's `steam` is another effect), and the run: how far the train must go to be gone (out) and where it comes in from
   (back) */
function motionOf(time, o) {
  if (o.hidden.train) return null;
  const A = arrangementOf(o.layout, time), t = trainOf(o, A), e = t.engine, face = A.train.face;
  return {
    tall: D.TALL,
    train: { space: "tall", chimney: e.chimney, cylinder: e.cylinder, dir: .4, size: e.size, night: time === "night" },
    run: o.run === false ? null : { out: face > 0 ? n(430 - t.x0) : n(-30 - t.x1), back: face > 0 ? n(-30 - t.x1) : n(430 - t.x0), ...TIMETABLE },
  };
}
/* what of the train shows, in the tall picture's units, for the tests and the board: the engine's front and
   chimney, the carriage's windows */
export const stationTrain = (time = "morning", opts = {}) => { const o = optionsOf(opts), t = trainOf(o, arrangementOf(o.layout, time)); return { ...t, face: arrangementOf(o.layout, time).train.face }; };

/* the scenery: GPT's picture at this time of day (the designer's pick), or Claude's drawing of the same */
const sceneryOf = (o, time, fit) => { const P = o.picked.background && o.backPics && o.backPics[time]; return P ? picture(P, 0, 0, D.TALL[0], D.TALL[1], fit) : D.BACKS.across(time); };
/* the tall picture: the scenery, what stands across the tracks, and the train (the house background has none) */
function tallOf(o, V, q, time, on, fit) {
  const A = arrangementOf(o.layout, time), far = parts(V, q, time, on, o).filter(p => p.tall).map(p => p.svg);
  return lightDefs(time) + sceneryOf(o, time, fit) + far.join("") + trainMarkup(o, A, time, on);
}

/* the tall picture in its pieces, for the art tools (tools/art/station.mjs lays them together as the options change) */
export const stationTall = (time = "morning", opts = {}) => {
  const o = optionsOf(opts), V = VIEW[time], q = pen(V.line), on = opts.animate ? (name, style = "") => ` class="${name}"${style ? ` style="${style}"` : ""}` : () => "", A = arrangementOf(o.layout, time);
  return { defs: lightDefs(time), scenery: sceneryOf(o, time, "xMidYMid slice"), far: parts(V, q, time, on, o).filter(p => p.tall).map(p => p.svg).join(""), train: trainMarkup(o, A, time, on) };
};

/* the game's own pictures as the defaults (the art tools give others, and an empty `picked` for Claude's drawings) */
const BACK_PICS = { morning: PICS.back, golden: PICS["back-golden"], night: PICS["back-night"] };
const optionsOf = (opts = {}) => {
  const o = { picked: PICKED, hidden: HIDDEN, pics: PICS, layout: LAYOUT, item: ITEM, name: NAME, carriage: "claude", carPics: null, run: true, ...opts };
  if (!("backPics" in opts)) o.backPics = o.picked.background ? BACK_PICS : null;
  if (!("trainPics" in opts)) o.trainPics = o.picked.engine && PICS.engine ? { gpt: PICS.engine } : null;
  if (!("engine" in opts)) o.engine = o.trainPics ? "gpt" : "claude";
  return o;
};
export function buildStation(opts = {}) {
  const o = optionsOf(opts);
  return makePlace({
    name: o.name, grounds: { morning: "#cdd5d6", golden: "#dc9a62", night: "#2c3442" }, crop: "0 260 300 300", stampCrop: "0 200 300 355", bandY: 480,
    tones: { a: "#9a7048", b: "#6b4f34", l: "#c09a6a" }, floor: ["#b9b4aa", "#8f8a80"], ownColours: true,
    judge: { item: o.item },
    view: (V, q, time, on) => `<svg x="0" y="0" width="400" height="${D.TALL[1]}" viewBox="0 0 ${D.TALL[0]} ${D.TALL[1]}">${tallOf(o, V, q, time, on, "xMidYMin slice")}</svg>`,
    things: (V, q, time, on) => parts(V, q, time, on, o).filter(p => !p.tall).map(p => p.svg).join(""),
    tall: (V, q, time, on) => ({ box: `0 0 ${D.TALL[0]} ${D.TALL[1]}`, inner: tallOf(o, V, q, time, on, "xMidYMid slice") }),
    motion: time => motionOf(time, o),
    /* a wooden platform bench behind the judge's feet, with no back (a back's rails would cross the train behind it):
       the seat plank on two pairs of legs, a rail between them low down */
    seat: (c, q) => q.r(30, 452, 12, 22, c.b, 1.6) + q.r(358, 452, 12, 22, c.b, 1.6) + q.r(30, 462, 340, 6, c.b, 1.4, 2)
      + q.r(14, 438, 372, 16, c.l, 2, 4) + q.l("M18 446H382", 1, .35) + q.s("M40 444h50M150 445h60M260 444h56", c.b, 1.2, .6),
    band: (c, y0, q) => floorBand(y0, c.fill, c.k, q.l(Array.from({ length: 9 }, (_, i) => `M${i * 48 + 12} ${y0}V500`).join(""), 1, .45)),
  });
}
export const station = buildStation();
/* the pieces one by one, for the art tools and the tests: id, box (in the print's 400 x 500), svg */
export const stationParts = (time = "morning", opts = {}) => parts(VIEW[time], pen(VIEW[time].line), time, opts.animate ? (name, style = "") => ` class="${name}"${style ? ` style="${style}"` : ""}` : () => "", optionsOf(opts));
export const stationMotion = (time = "morning", opts = {}) => motionOf(time, optionsOf(opts));
