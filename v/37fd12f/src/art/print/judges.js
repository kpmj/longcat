/* Six judges in the woodblock style (the designer, 2026-11-14: "six different judges in total", all animated).
   The capybara is ./judge.js. The other five keep its seat, its body outline and its head box, so the hat, the scarf
   and the top still fit, and they make the same twenty faces from the same table (printPose). Each has its own thing
   on its head and its own small idle habit (a crest, whiskers, ear tufts, a leaf, round ears and a tail).
   Head space: origin at the centre of the head box, drawn at scene scale inside translate(200 182).
   Not in the game's calendar yet: sceneParts draws one when asked (o.judge). */
import { f, num, svgDoc } from "../util.js";
import { printPose, judgeFigure as capyFigure, faceIconSvg as capyIcon, rider, toHead } from "./judge.js";

const KEY = "#262122", WHITE = "#f8f2e2", MOUTH = "#7a3b33", TONGUE = "#c98078", TEAR = "#8fb8cc", CARD = "#f3ead6";
const LW = 2.7;
const ell = (cx, cy, rx, ry = rx) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
const k = (w = 1, c = KEY) => `stroke="${c}" stroke-width="${f(LW * w)}" stroke-linejoin="round" stroke-linecap="round"`;
const sh = (d, c, w = 1) => `<path d="${d}" fill="${c}" ${k(w)}/>`;
const fl = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ""}/>`;
const ln = (d, w = 1, c = KEY) => `<path d="${d}" fill="none" ${k(w, c)}/>`;
const both = m => `<g>${m}</g><g transform="scale(-1 1)">${m}</g>`;
const BODY = "M104 250C68 262 40 302 40 372V420C40 450 62 464 96 464H304C338 464 360 450 360 420V372C360 302 332 262 296 250Z";
const SHADE = "M296 250C332 262 360 302 360 372V420C360 450 338 464 304 464H272C330 440 344 360 296 250Z";
/* a part that twitches now and then when animated (the same class as the capybara's ears) */
const twitch = (m, o, delay, dur, origin = "") => (o.animate ? `<g class="lc-ear" style="animation-delay:${delay}s;animation-duration:${dur}s${origin ? `;transform-origin:${origin}` : ""}">${m}</g>` : m);

/* the small-eyed judges share one eye: a dot at rest (or a lidded half moon), arcs when shut or happy.
   E = { x, y, s (size), ink (line colour), rest: "dot" | "lid" } */
function dotEye(E) {
  return (side, m, look) => {
    const x = side * E.x, y = E.y, s = E.s, c = E.ink || KEY, [lx, ly] = look;
    if (m === "happy") return ln(`M${f(x - 8 * s)} ${f(y + 3 * s)}q${f(8 * s)} ${f(-9 * s)} ${f(16 * s)} 0`, 1.25, c);
    if (m === "shut") return ln(`M${f(x - 8 * s)} ${f(y - s)}q${f(8 * s)} ${f(6.5 * s)} ${f(16 * s)} 0`, 1.15, c);
    if (m === "wide") return sh(ell(x, y, 6.8 * s), WHITE, .8) + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2.4 * s)}" fill="${KEY}"/>`;
    if (m === "flat") return ln(`M${f(x - 9 * s)} ${f(y)}h${f(18 * s)}`, 1.2, c);
    const dot = (dx, dy) => `<circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="${f(4.6 * s)}" fill="${c}"/>`;
    if (m === "dot") return dot(lx * s, ly * s);
    if (m === "dotlid") return dot(lx * s, ly * s) + ln(`M${f(x - 9 * s)} ${f(y - 3 * s)}h${f(18 * s)}`, 1.1, c);
    if (E.rest === "lid") return `<path d="M${f(x - 6.5 * s)} ${f(y - s)}h${f(13 * s)}a${f(6.5 * s)} ${f(6 * s)} 0 0 1 ${f(-13 * s)} 0z" fill="${c}"/>` + ln(`M${f(x - 9.5 * s)} ${f(y - s)}h${f(19 * s)}`, 1.1, c);
    return dot(0, 0);
  };
}
/* the furry judges share the capybara's small mouth under the nose, moved to height y */
function smallMouth(mode, y) {
  const Y = v => f(y + v);
  if (mode === "smile") return ln(`M-14 ${Y(4)}Q-5 ${Y(11)} 0 ${Y(0)}Q5 ${Y(11)} 14 ${Y(4)}`, .95);
  if (mode === "open") return sh(`M-11 ${Y(5)}Q0 ${Y(22)} 11 ${Y(5)}Q4 ${Y(8)} 0 ${Y(1)}Q-4 ${Y(8)} -11 ${Y(5)}Z`, MOUTH, .8);
  if (mode === "wavy") return ln(`M-12 ${Y(8)}q4 -4.4 8 0t8 0t8 0`, .95);
  if (mode === "smirk") return ln(`M-11 ${Y(7)}Q-3 ${Y(8)} 0 ${Y(0)}Q4 ${Y(6)} 13 ${Y(-1)}`, .95);
  if (mode === "o") return sh(ell(0, y + 10, 5, 6.2), MOUTH, .8);
  if (mode === "yawn") return sh(ell(0, y + 12, 10, 13), MOUTH, .8) + fl(ell(0, y + 19, 6, 4), TONGUE);
  return ln(`M-11 ${Y(7)}Q-3 ${Y(8)} 0 ${Y(0)}Q3 ${Y(8)} 11 ${Y(7)}`, .95);
}

/* what sits on each head (like the capybara's yuzu); hop lifts it for the "oops" face */
const ITEM = {
  leaf: `<g transform="translate(14 -92)">${sh("M-30 0Q-26 -16 0 -18Q26 -16 30 0Q20 10 4 9L0 2L-4 9Q-20 10 -30 0Z", "#6f9a6a")}${ln("M0 2V-14M-14 -2L-4 -10M14 -2L4 -10", .5)}</g>`,
  mikan: `<g transform="translate(24 -103)">${sh(ell(0, 0, 19), "#e9952a")}${fl("M-18 5A19 19 0 0 0 16.5 9.5A23 23 0 0 1 -18 5Z", "#cf761c", .55)}${sh("M2 -18q11 -15 25 -6q-12 11 -25 6z", "#5d8a63", .85)}<circle cy="-18.5" r="2.2" fill="${KEY}"/></g>`,
  acorn: `<g transform="translate(20 -100)">${sh("M-13 -2Q-13 22 0 26Q13 22 13 -2Z", "#c99a62")}${sh("M-16 -2Q-16 -16 0 -17Q16 -16 16 -2Z", "#7a5a3a")}${ln("M0 -17V-25", .8)}${ln("M-9 -8h4M-1 -10h4M7 -7h3M-5 -4h4M4 -3h4", .4)}</g>`,
  maple: `<g transform="translate(22 -98) scale(2.3)">${sh("M0 -9L2.4 -3.6L8 -6L5.6 -.4L10 3L3.6 4L0 10L-3.6 4L-10 3L-5.6 -.4L-8 -6L-2.4 -3.6Z", "#bf452d", .4)}</g>`,
  onigiri: `<g transform="translate(22 -106)">${sh("M0 -24Q7 -24 11 -16L25 9Q29 19 18 19H-18Q-29 19 -25 9L-11 -16Q-7 -24 0 -24Z", "#f8f4ea")}${sh("M-11 4H11V19H-11Z", "#2f3a33", .7)}${fl("M-3 -12a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0M4 -5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0M-8 -3a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0", "#cfc5ae")}</g>`,
};

/* Each judge: names, colours, `item`, and how to draw
   back(p, o)      behind the skull (ears, tufts), with their idle twitch and the "ear-flick" face
   skull(p, o)     the head and everything on it that never changes
   eye(side, mode, look, p)   one eye
   muzzle(mode, p) nose and mouth (bill, beak) making one of: split smile open wavy smirk o yawn
   brow / tear     where the generic raised brow and the tear go: [x, y] of the right eye
   body()          marks on the body;  under()  things behind the body (a tail) */
const SPEC = {
  shoebill: {
    zh: "鯨頭鸛", en: "Shoebill", item: "leaf", col: { fur: "#8693a0", dk: "#66727e", belly: "#c3cbd1", foot: "#5a6570", paw: "#66727e" },
    ownBrow: true, tear: [50, -30, 8],
    back(p, o) {
      const crest = sh("M-8 -84q4 -16 14 -20q-2 12 4 20Z", this.col.dk, .7);
      return (p.flick ? `<g transform="rotate(-26 0 -84)">${crest}</g>` + ln("M-30 -100q-8 6 -6 16M-40 -92q-6 5 -4 12", .6) : twitch(crest, o, -3, 8.5));
    },
    skull() { return sh("M-78 -20C-80 -62 -52 -84 0 -84C52 -84 80 -62 78 -20C76 30 50 62 0 64C-50 62 -76 30 -78 -20Z", this.col.fur) + fl("M56 -70C74 -56 79 -38 78 -20C76 24 58 52 30 60C62 30 70 -20 56 -70Z", this.col.dk, .35); },
    eye(side, m, look, p) {
      const x = side * 50, y = -30, [lx, ly] = look;
      if (m === "happy") return ln(`M${x - 9} ${y + 3}q9 -10 18 0`, 1.25);
      if (m === "shut") return ln(`M${x - 9} ${y - 1}q9 7 18 0`, 1.15);
      if (m === "flat") return ln(`M${x - 11} ${y}h22`, 1.2);
      const raised = p.brow === "both" || (p.brow === "one" && side > 0) || m === "wide";
      const ring = sh(ell(x, y, m === "wide" ? 12 : 10.5), "#e6d68a", .7) + `<circle cx="${f(x + (m === "lid" ? 0 : lx))}" cy="${f(y + (m === "lid" ? 0 : ly))}" r="${m === "wide" ? 3 : 3.8}" fill="${KEY}"/>`;
      if (m === "dotlid") return ring + fl(`M${x - 11} ${y - 12}h22v9h-22Z`, this.col.fur) + ln(`M${x - 12} ${y - 3}h24`, 1.2);
      /* the glare: a heavy brow that slopes down to the bill; it lifts when a brow is raised */
      return ring + (m === "dot" ? "" : raised ? ln(`M${x - 12} ${y - 19}q12 -6 24 0`, 1.2) : ln(`M${x - 14 * side} ${y - 7}L${x + 14 * side} ${y - 16}`, 1.4));
    },
    muzzle(mode, p) {
      const n = p.nostril, upper = sh("M-47 -4C-52 40 -32 76 0 80C32 76 52 40 47 -4C30 -18 -30 -18 -47 -4Z", "#d6c59c");
      const marks = fl("M-10 66Q0 86 10 66Q0 74 -10 66Z", "#8f7c55") + ln("M0 -12V66", .6) + fl(ell(-9, 2, 2.6 * n, 5 * n), KEY) + fl(ell(9, 2, 2.6 * n, 5 * n), KEY);
      const sides = ln("M-44 16Q-30 52 -6 66M44 16Q30 52 6 66", .7);
      /* an open bill: the lower half drops below the upper one, dark inside */
      const lower = d => sh(`M-40 30C-42 ${f(54 + d * .6)} -22 ${f(78 + d)} 0 ${f(80 + d)}C22 ${f(78 + d)} 42 ${f(54 + d * .6)} 40 30Z`, "#c9b88e") + fl(`M-33 40C-34 ${f(52 + d * .6)} -18 ${f(70 + d)} 0 ${f(72 + d)}C18 ${f(70 + d)} 34 ${f(52 + d * .6)} 33 40Z`, MOUTH);
      if (mode === "open") return lower(22) + upper + marks + sides;
      if (mode === "yawn") return lower(46) + `<g transform="translate(0 -5)">${upper}${marks}${sides}</g>`;
      if (mode === "o") return lower(11) + upper + marks + sides;
      if (mode === "wavy") return upper + marks + ln("M-32 46q4 -5 8 0t8 0t8 0t8 0M4 46q4 -5 8 0t8 0t8 0", .7);
      if (mode === "smile") return upper + marks + sides + ln("M-49 0q-10 -3 -11 -13M49 0q10 -3 11 -13", .9);
      if (mode === "smirk") return upper + marks + sides + ln("M49 0q10 -3 11 -13", .9);
      return upper + marks + sides;
    },
    body() { return sh("M40 372C40 320 56 286 84 264Q70 340 96 440Q60 438 40 420Z", this.col.dk, .8) + sh("M360 372C360 320 344 286 316 264Q330 340 304 440Q340 438 360 420Z", this.col.dk, .8); },
  },
  seal: {
    zh: "海豹", en: "Seal", item: "mikan", col: { fur: "#c5cace", dk: "#9aa3aa", belly: "#eef0ee", foot: "#9aa3aa", paw: "#9aa3aa" },
    brow: [46, -26, 3], tear: [46, -26, 6],
    back() { return ""; },
    skull(p, o) {
      const dots = [[-52, -62], [-30, -70], [40, -66], [60, -50], [-66, -40], [20, -76]].map(([x, y]) => fl(ell(x, y, 5, 3.6), this.col.dk)).join("");
      /* whiskers: three a side; they twitch now and then, and all lift on the "ear-flick" face */
      const wh = ln("M-38 26l-32 -8M-38 31l-33 0M-38 36l-31 8", .35);
      const L = p.flick ? `<g transform="rotate(-12 -38 31)">${wh}</g>` + ln("M-86 6q-8 6 -6 16M-94 14q-6 5 -4 12", .6) : twitch(wh, o, -2, 6.5, "100% 50%");
      const R = `<g transform="scale(-1 1)">${twitch(wh, o, -4.6, 8, "100% 50%")}</g>`;
      return sh(ell(0, -4, 88, 82), this.col.fur) + fl("M60 -62C80 -46 88 -24 88 -4C88 34 62 66 26 76C64 50 78 -6 60 -62Z", this.col.dk, .3) + dots + L + R
        + `<g fill="${KEY}"><circle cx="-56" cy="-46" r="1.8"/><circle cx="-48" cy="-49" r="1.8"/><circle cx="48" cy="-49" r="1.8"/><circle cx="56" cy="-46" r="1.8"/></g>`;
    },
    eye: dotEye({ x: 46, y: -26, s: 1.63 }),
    muzzle(mode, p) {
      const n = p.nostril, pads = sh(ell(-17, 30, 21, 17), "#eef0ee", .7) + sh(ell(17, 30, 21, 17), "#eef0ee", .7)
        + `<path d="M${f(-9 * n)} 12h${f(18 * n)}l${f(-9 * n)} ${f(10 * n)}z" fill="${KEY}"/>` + ln(`M0 ${f(12 + 10 * n)}V32`, .7)
        + `<g fill="${KEY}">${[[-26, 26], [-18, 32], [-24, 38], [26, 26], [18, 32], [24, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5"/>`).join("")}</g>`;
      const m = mode === "smile" ? ln("M-14 46q14 12 28 0", .95) : mode === "open" ? sh("M-11 42Q0 64 11 42Z", MOUTH, .8) : mode === "wavy" ? ln("M-12 52q4 -4.4 8 0t8 0t8 0", .95)
        : mode === "smirk" ? ln("M-8 49q10 5 22 -5", .95) : mode === "o" ? sh(ell(0, 52, 5, 6.2), MOUTH, .8) : mode === "yawn" ? sh(ell(0, 54, 12, 16), MOUTH, .8) + fl(ell(0, 62, 7, 5), TONGUE) : ln("M-7 49q7 4 14 0", .8);
      return m + pads;
    },
    body() {
      const spots = [[80, 300], [110, 330], [300, 310], [322, 350], [70, 380], [330, 400]].map(([x, y]) => fl(ell(x, y, 9, 6), this.col.dk)).join("");
      return spots + sh("M70 370Q40 400 62 432Q88 424 96 392Z", this.col.dk, .8) + sh("M330 370Q360 400 338 432Q312 424 304 392Z", this.col.dk, .8);
    },
  },
  owl: {
    zh: "貓頭鷹", en: "Owl", item: "acorn", col: { fur: "#a8845c", dk: "#7c5f3e", belly: "#e3d2b0", foot: "#c99a3a", paw: "#7c5f3e" },
    brow: [40, -50, 0], tear: [40, 4, 0],
    back(p, o) {
      const tuft = sh("M-80 -52L-70 -104L-40 -74Z", this.col.dk);
      const L = p.flick ? `<g transform="rotate(-20 -60 -62)">${tuft}</g>` + ln("M-98 -98q-8 6 -6 16M-106 -90q-6 5 -4 12", .6) : twitch(tuft, o, -2, 7.5);
      return L + `<g transform="scale(-1 1)">${twitch(tuft, o, -5.6, 9.5)}</g>`;
    },
    skull() {
      const disc = x => sh(ell(x, -22, 34), "#e9dcc0", .7);
      return sh("M-84 -20C-86 -60 -60 -84 0 -84C60 -84 86 -60 84 -20C82 40 54 72 0 74C-54 72 -82 40 -84 -20Z", this.col.fur) + fl("M60 -72C80 -56 85 -38 84 -20C82 34 60 64 28 72C66 40 76 -16 60 -72Z", this.col.dk, .35)
        + disc(-40) + disc(40) + ln("M-30 -62Q0 -44 30 -62", 1) + ln("M-20 44q6 6 12 0M8 44q6 6 12 0M-6 56q6 6 12 0", .5);
    },
    /* big round eyes in pale discs, half shut at rest: a judge who has seen every audition */
    eye(side, m, look) {
      const x = side * 40, y = -22, [lx, ly] = look;
      if (m === "happy") return ln(`M${x - 13} ${y + 5}q13 -14 26 0`, 1.25);
      if (m === "shut") return ln(`M${x - 13} ${y - 2}q13 11 26 0`, 1.15);
      if (m === "flat") return ln(`M${x - 16} ${y}h32`, 1.2);
      const iris = (r, pr, dx = 0, dy = 0) => sh(ell(x, y, r), "#e6c35a", .7) + `<circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="${pr}" fill="${KEY}"/>`;
      const lid = fl(`M${x - 17} ${y}a17 17 0 0 1 34 0Z`, "#cdb48a") + ln(`M${x - 18} ${y}h36`, 1.1);
      if (m === "wide") return iris(18, 4.5);
      if (m === "dot") return iris(15, 6, lx * 1.6, ly * 1.6);
      if (m === "dotlid") return iris(15, 6, lx * 1.6, 3 + ly) + lid;
      return iris(15, 6, 0, 3) + lid;
    },
    muzzle(mode, p) {
      const n = p.nostril, beak = d => sh(d, "#d9a441", .8), nos = `<g fill="${KEY}"><circle cx="-3" cy="2" r="${f(1.1 * n)}"/><circle cx="3" cy="2" r="${f(1.1 * n)}"/></g>`;
      const shut = beak("M-9 -2L9 -2L0 20Z") + nos;
      const gape = (w, d) => sh(`M${-w} 6L${w} 6L0 ${d}Z`, MOUTH, .8) + beak(`M-${w + 1} -2L${w + 1} -2L0 13Z`) + nos;
      if (mode === "open") return gape(9, 32);
      if (mode === "yawn") return gape(13, 48);
      if (mode === "o") return gape(6, 24);
      if (mode === "smile") return shut + ln("M-14 24q14 11 28 0", .9);
      if (mode === "smirk") return shut + ln("M-6 27q10 5 20 -5", .9);
      if (mode === "wavy") return shut + ln("M-12 28q4 -4.4 8 0t8 0t8 0", .9);
      return shut;
    },
    body() {
      let s = "";
      for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - (r % 2); i++) { const x = 122 + i * 31 + (r % 2) * 15.5, y = 322 + r * 26; s += `<path d="M${x - 13} ${y}q13 16 26 0" fill="none" stroke="${this.col.dk}" stroke-width="2.2" stroke-linecap="round"/>`; }
      return s + sh("M40 372C40 322 54 290 80 268Q72 350 100 436Q60 436 40 420Z", this.col.dk, .8) + sh("M360 372C360 322 346 290 320 268Q328 350 300 436Q340 436 360 420Z", this.col.dk, .8);
    },
  },
  salamander: {
    zh: "大山椒魚", en: "Giant salamander", item: "maple", col: { fur: "#7a6f60", dk: "#5a5145", belly: "#b3a48c", foot: "#5a5145", paw: "#5a5145" },
    brow: [66, -42, -3], tear: [66, -42, -2], itemTwitch: true,
    back() { return ""; },
    skull(p) {
      const speck = [[-70, -30], [-40, -56], [-10, -40], [30, -58], [62, -34], [84, -6], [-88, -4], [0, -66], [50, -10], [-52, -8]].map(([x, y], i) => fl(ell(x, y, 5 + (i % 3) * 2, 3.5 + (i % 2) * 1.5), this.col.dk)).join("");
      return sh("M-104 4C-108 -44 -70 -78 0 -78C70 -78 108 -44 104 4C100 48 60 66 0 66C-60 66 -100 48 -104 4Z", this.col.fur) + speck
        + fl("M-96 22Q0 44 96 22Q88 56 0 62Q-88 56 -96 22Z", this.col.belly, .55) + (p.flick ? ln("M-112 -40q-8 6 -6 16M-120 -32q-6 5 -4 12", .6) : "");
    },
    eye: dotEye({ x: 66, y: -42, s: .9 }),
    /* one very wide mouth; the yawn is the whole face */
    muzzle(mode, p) {
      const n = p.nostril, nos = fl(ell(-8, -8, 2 * n, 1.4 * n), KEY) + fl(ell(8, -8, 2 * n, 1.4 * n), KEY);
      const m = mode === "smile" ? ln("M-84 14Q0 44 84 14", 1) : mode === "open" ? sh("M-78 18Q0 28 78 18Q0 58 -78 18Z", MOUTH, .9)
        : mode === "yawn" ? sh("M-86 12Q0 2 86 12Q74 62 0 64Q-74 62 -86 12Z", MOUTH, .9) + fl(ell(0, 50, 34, 10), TONGUE)
          : mode === "wavy" ? ln("M-80 24q10 -8 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0", 1)
            : mode === "smirk" ? ln("M-88 22Q0 32 66 20Q84 16 92 4", 1) : mode === "o" ? ln("M-88 20Q-40 27 -10 26M10 26Q40 27 88 20", 1) + sh(ell(0, 26, 7, 8), MOUTH, .8) : ln("M-88 20Q0 30 88 20", 1);
      return m + nos;
    },
    body() {
      const speck = [[80, 300], [120, 280], [300, 296], [326, 340], [66, 360], [336, 400], [90, 420]].map(([x, y], i) => fl(ell(x, y, 8 + (i % 2) * 3, 5), this.col.dk)).join("");
      const hand = (x, d) => `<g transform="translate(${x} 400) scale(${d} 1)">${sh("M0 0q-18 4 -22 22l8 -2l-2 10l8 -6l2 10l6 -10q6 -10 0 -24Z", this.col.dk, .8)}</g>`;
      return speck + hand(92, 1) + hand(308, -1);
    },
  },
  /* the sixth: a tanuki. Dark patches round the eyes with the eyes cut out of them in the paper's colour, cheek
     tufts, round ears, a rice ball on its head and a tail that shows beside the seat */
  tanuki: {
    zh: "狸貓", en: "Tanuki", item: "onigiri", col: { fur: "#a89072", dk: "#6f5a47", belly: "#e6d6b8", foot: "#4a3b30", paw: "#4a3b30", mask: "#4a3b30" },
    brow: [48, -30, 6], tear: [48, -26, 6],
    back(p, o) {
      const ear = sh(ell(-62, -74, 20), this.col.dk) + fl(ell(-62, -72, 10), "#c79c84");
      const L = p.flick ? `<g transform="rotate(-24 -62 -56)">${ear}</g>` + ln("M-96 -96q-8 6 -6 16M-104 -88q-6 5 -4 12", .6) : twitch(ear, o, -2, 7.5);
      return L + `<g transform="scale(-1 1)">${twitch(ear, o, -5.6, 9.5)}</g>`;
    },
    skull() {
      const head = "M-84 -16C-86 -60 -56 -86 0 -86C56 -86 86 -60 84 -16C84 2 90 18 100 30L80 34L90 52L64 52C48 70 24 78 0 78C-24 78 -48 70 -64 52L-90 52L-80 34L-100 30C-90 18 -84 2 -84 -16Z";
      return sh(head, this.col.fur) + fl("M58 -72C78 -56 84 -34 84 -16C84 2 90 18 100 30L80 34L90 52L64 52C54 64 42 71 28 75C62 44 74 -14 58 -72Z", this.col.dk, .35)
        + both(fl("M-76 -34C-72 -56 -42 -60 -26 -42C-16 -26 -28 -4 -52 0C-74 2 -84 -14 -76 -34Z", this.col.mask))
        + fl(ell(0, 28, 36, 27), this.col.belly) + fl("M-8 -86Q0 -52 8 -86Z", this.col.dk, .6);
    },
    eye: dotEye({ x: 50, y: -26, s: 1.15, ink: "#f3ead6", rest: "lid" }),
    muzzle(mode, p) {
      const n = p.nostril;
      return `<path d="${ell(0, 10, 9 * n, 6.5 * n)}" fill="${KEY}"/>` + ln("M0 16V26", .85) + `<g fill="${this.col.dk}">${[[26, 24], [34, 32], [24, 37]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/><circle cx="${-x}" cy="${y}" r="1.7"/>`).join("")}</g>` + smallMouth(mode, 26);
    },
    body() {
      const arm = "M40 372C40 322 54 290 82 266Q74 340 104 430Q60 436 40 420Z";
      return sh(arm, this.col.mask, .8) + `<g transform="translate(400 0) scale(-1 1)">${sh(arm, this.col.mask, .8)}</g>`;
    },
    /* the tail lies beside the seat and flicks its tip when animated */
    under(o) {
      const tail = sh("M330 440C372 446 400 420 392 386C388 368 370 364 362 378C372 384 372 402 356 410C344 416 332 420 330 440Z", this.col.dk) + fl("M392 386C388 368 370 364 362 378C372 380 378 388 378 398C386 398 392 392 392 386Z", this.col.mask);
      return o.animate ? `<g class="lc-tail lc-tail-l">${tail}</g>` : tail;
    },
  },
};

export const JUDGE_IDS = ["capybara", "shoebill", "seal", "owl", "salamander", "tanuki"];
export const JUDGE_NAME = { capybara: { zh: "水豚", en: "Capybara" }, ...Object.fromEntries(Object.entries(SPEC).map(([id, S]) => [id, { zh: S.zh, en: S.en }])) };
export const judgeId = id => (JUDGE_IDS.includes(id) ? id : "capybara");

const zz = (x, y, s) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${ln("M0 0h5l-5 6h5M8.5 -9h3.6l-3.6 4.4h3.6", .7 / s)}</g>`;
/* the head in head space at scene scale. Animated, it behaves like the capybara's: it blinks, shakes now and then,
   yawns, shows a pleased face while patted, and the thing on its head hops when tapped */
function head(S, face, o = {}) {
  const p = typeof face === "object" && face ? face : printPose(face);
  const resting = p.l === "lid" && p.r === "lid";
  const idle = !!o.animate && resting && p.mouth === "split" && !p.chew && !p.tilt && !p.dy && !p.paws && !p.flick && !p.tear && p.nostril === 1 && !p.brow;
  const eyes = (l, r, look) => S.eye(-1, l, look, p) + S.eye(1, r, look, p);
  const open = `<g${o.animate && resting ? ` class="lc-blink"` : ""}>${eyes(p.l, p.r, p.look)}</g>`;
  const chew = m => (p.chew ? `<g transform="translate(3 2) rotate(3)">${m}</g>` + ln("M60 34q6 3 5 10", .6) : m);
  const faces = idle
    ? `<g class="lc-face"><g class="lc-yawn-off">${S.muzzle("split", p)}${open}</g><g class="lc-yawn-on">${S.muzzle("yawn", p)}${eyes("shut", "shut", [0, 0])}</g></g><g class="lc-face-pet">${S.muzzle("smile", p)}${eyes("happy", "happy", [0, 0])}</g>`
    : chew(S.muzzle(p.mouth, p)) + open;
  const [bx, by, br] = S.brow || [0, 0, 0];
  const brow = S.ownBrow ? "" : p.brow === "one" ? ln(`M${bx - 9} ${by - 15 - br}q9 -6 19 -2`) : p.brow === "both" ? ln(`M${-bx - 10} ${by - 14 - br}q9 -6 19 -1M${bx - 9} ${by - 15 - br}q10 -5 19 1`) : "";
  const [tx, ty, tr] = S.tear;
  const tear = p.tear ? sh(`M${-tx - 6} ${ty + 12 + tr}q-6 8 0 14q6 -6 0 -14z`, TEAR, .6) : "";
  const it = hop => `<g${hop ? ` transform="translate(0 ${-hop})"` : ""}>${ITEM[S.item]}${hop ? ln("M-8 -84q-4 8 -1 16M52 -84q4 8 1 16", .7) : ""}</g>`;
  const item0 = S.itemTwitch && !p.hop ? twitch(it(0), o, -4, 11) : it(p.hop);
  const item = o.animate && !p.hop ? `<g data-tap="yuzu"><g class="lc-hop">${o.react === "plop" ? `<g class="lc-plop">${item0}</g>` : item0}</g></g>` : item0;
  const head0 = S.back(p, o) + S.skull(p, o) + faces + item + brow + tear + rider(o.onHead);
  const head1 = idle ? `<g class="lc-shake"><g class="lc-yawn-head">${head0}</g></g>` : head0;
  const head2 = o.animate ? `<g class="lc-bobble">${head1}</g>` : head1;
  const tf = [p.tilt ? `rotate(${p.tilt} 0 68)` : "", p.dy ? `translate(0 ${p.dy})` : ""].filter(Boolean).join(" ");
  const ticks = p.ticks ? ln("M104 -40v20M98 -28l6 6l6 -6M-104 -40v20M-110 -28l6 6l6 -6", .7) : "";
  return `<g${tf ? ` transform="${tf}"` : ""}>${head2}</g>${ticks}${p.zz && !o.noZz ? zz(98, -74, 2.1) : ""}`;
}
/* paws (wing tips for the birds), the score card and motion ticks at scene scale */
function pawsOf(S, p, cx, cy, w = 128) {
  const paw = (x, y, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">${sh(ell(0, 0, 22, 15), S.col.paw)}${ln("M-9 -11v8M0 -13v9M9 -11v8", .6)}</g>`;
  const motion = (x, y, d) => ln(`M${x + 30 * d} ${y - 18}q${12 * d} 18 0 36M${x + 42 * d} ${y - 26}q${15 * d} 26 0 52`, .7);
  if (p.paws === "clap") return paw(cx - 26, cy, -12) + paw(cx + 26, cy, 12) + motion(cx, cy - 6, 1) + motion(cx, cy - 6, -1);
  if (p.paws === "applause") return paw(cx - w, cy - 64, -20) + paw(cx + w, cy - 64, 20) + motion(cx - w, cy - 64, -1) + motion(cx + w, cy - 64, 1);
  if (p.paws === "card") return `<g transform="translate(${cx + w * .8} ${cy - 60}) rotate(7)">${sh("M-38 -110h76v96h-76Z", CARD)}<text y="-46" text-anchor="middle" font-family="Nunito, Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="46" fill="${KEY}">10</text></g>` + paw(cx + w * .8, cy - 56);
  if (p.paws === "tummy") return `<g class="lc-tummy">${paw(cx - 36, cy + 102, 18)}${paw(cx + 36, cy + 102, -18)}</g>`;
  return "";
}

/* the seated judge in scene space (400 x 500): the same layers as ./judge.js judgeFigure, for any of the six */
export function judgeFigureOf(id, face, o = {}) {
  const j = judgeId(id);
  if (j === "capybara") return capyFigure(face, o);
  const S = SPEC[j], c = S.col, p = printPose(face);
  if (o.paws === "tummy") p.paws = "tummy";
  const body = fl(BODY, c.fur) + fl(ell(200, 386, 88, 64), c.belly, .75) + S.body() + fl(SHADE, c.dk, .3) + ln(BODY);
  const lap = ln("M64 424Q128 404 194 414M206 414Q272 404 336 424", .6);
  const feet = (S.under ? S.under(o) : "") + [146, 254].map(x => `<g transform="translate(${x} 462)">${sh(ell(0, 0, 29, 11.5), c.foot)}${ln("M-9 -3.5v7M0 -4.5v8M9 -3.5v7", .6)}</g>`).join("");
  const headM = `<g transform="translate(200 182)">${head(S, p, { ...o, onHead: toHead(o.onHead) })}</g>`;
  const tap = m => (o.animate ? `<g data-tap="judge" data-group="judge">${m}</g>` : m);
  return { body: tap(body), lap, feet, head: tap(headM), paws: pawsOf(S, p, 200, 270) };
}
/* the head making one face, like faceIconSvg, for any of the six. The salamander's head is wider, so the frame is too */
export function judgeFaceSvg(id, face, opts = {}) {
  const j = judgeId(id);
  if (j === "capybara") return capyIcon(face, opts);
  const S = SPEC[j], size = Math.max(8, num(opts && opts.size, 96)), p = printPose(face);
  const paws = p.paws ? pawsOf(S, p, 0, p.paws === "clap" ? 118 : 150, 92) : "";
  return svgDoc("-74 -76 148 148", `<g transform="scale(.5)">${head(S, p, { animate: !!(opts && opts.animate) })}${paws}</g>`, ` width="${f(size)}" height="${f(size)}"`);
}
