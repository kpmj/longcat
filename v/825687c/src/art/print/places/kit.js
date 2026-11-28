/* The shared way a woodblock place is built (docs/art-style.md). A place supplies one picture of itself, `view`,
   drawn in the indigo ramp, plus its seat and its floor band. From those the kit makes:
   - scene(time): the H portrait scene: flat ground, the view in a round window, the seat, the band, the title
   - landscape(time): the G postcard landscape: stepped sky, the view full size, the seat and band in indigo, the title strip
   - stamp: the view in a 44 x 52 stamp
   Nothing here uses ids, gradients or filters. */
import { f, inset } from "../../util.js";
import { column, glyph } from "../lettering.js";

export const KEY = "#262122", PAPER = "#efe6d2", RED = "#bf452d";
export const IND = ["#1d3150", "#33517a", "#5d7ea3", "#93abc4", "#c6d3dc", "#dde5e8"];
/* Golden hour has its own ink (the designer, 2026-11-14: "到傍晚再用藍色感覺看起來不太像是傍晚 需要比較暖色系的背景"). The whole
   landscape is printed in dusk rose instead of indigo: plum in the shadows, dusty pink and peach in the light, under
   a sky that steps from vermilion down to cream. Rose, not orange, so the brown judge still stands clear of it. */
export const DUSK = ["#3e2a3c", "#6b4459", "#9c6670", "#c99688", "#e9c6a8", "#f6e3c9"];
export const DUSK_SKY = ["#d27a58", "#e8a468", "#f3ca8c", "#f8e6c0"];
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
/* a designed (morning) colour moved to the light of the time of day */
export const tint = (c, time) => (time === "golden" ? mix(c, "#e59a55", .2) : time === "night" ? mix(c, "#262d3f", .5) : c);

/* the indigo palette of a view, per time: d[0] darkest .. d[5] lightest, the stepped sky, the disc in it, the one warm accent */
export const VIEW = {
  morning: { d: IND, sky: [IND[2], IND[3], IND[4], PAPER], disc: ["#c9553f", 86, 150, 26], mist: PAPER, mistO: .95, warm: PAPER, glow: 0, paper: PAPER, line: IND[0], lit: false, time: "朝" },
  golden: { d: DUSK, sky: DUSK_SKY, disc: ["#fdf3cf", 306, 146, 34], mist: "#f8e9cf", mistO: .9, warm: "#f6d77c", glow: .3, paper: "#f6ead0", line: DUSK[0], lit: true, time: "夕" },
  night: { d: ["#0c182c", "#132744", "#1d3150", "#2c4566", "#4c6a90", "#6f8bb0"], sky: ["#0e1a30", "#15243e", IND[0], IND[1]], disc: ["#f2ecd6", 306, 84, 22], mist: IND[3], mistO: .4, warm: "#f4d566", glow: .5, paper: "#c9d3e0", line: "#0c182c", lit: true, time: "夜" },
};
const STARS = [[60, 52, 1.8], [128, 34, 1.4], [196, 62, 1.2], [250, 38, 1.6], [34, 130, 1.2], [150, 98, 1.1], [226, 104, 1.3], [372, 150, 1.2]];

/* drawing helpers bound to a line colour: p outlined path, f flat path, l line, s coloured line, r rect, c circle, e ellipse */
export function pen(line) {
  const st = (w) => `stroke="${line}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`;
  const op = o => (o == null ? "" : ` opacity="${o}"`);
  return {
    p: (d, fill, w = 1.6, o) => `<path d="${d}" fill="${fill}" ${st(w)}${op(o)}/>`,
    f: (d, fill, o) => `<path d="${d}" fill="${fill}"${op(o)}/>`,
    l: (d, w = 1.6, o) => `<path d="${d}" fill="none" ${st(w)}${op(o)}/>`,
    s: (d, color, w = 1.6, o) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"${op(o)}/>`,
    r: (x, y, w, h, fill, lw = 1.6, rx = 0) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${rx ? ` rx="${rx}"` : ""} fill="${fill}"${lw ? " " + st(lw) : ""}/>`,
    c: (cx, cy, r, fill, lw = 1.6, o) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}"${lw ? " " + st(lw) : ""}${op(o)}/>`,
    e: (cx, cy, rx, ry, fill, lw = 1.6, o) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${lw ? " " + st(lw) : ""}${op(o)}/>`,
  };
}
/* a band of mist with rounded ends, stepped like the ones in old prints */
export const mist = (V, x, y, w, h) => `<g fill="${V.mist}" opacity="${V.mistO}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/><rect x="${f(x + w * .28)}" y="${f(y + h * .62)}" width="${f(w * .9)}" height="${h}" rx="${h / 2}"/></g>`;
/* the floor band over the judge's feet: a fill, a pattern on it, a line along the top */
export const floorBand = (y0, fill, line, pattern = "") => `<rect x="0" y="${y0}" width="400" height="${500 - y0}" fill="${fill}"/>${pattern}<path d="M0 ${y0}H400" stroke="${line}" stroke-width="1.6"/>`;
const SPECK = Array.from({ length: 70 }, (_, i) => [((i * 97) % 380) + 10, ((i * 61 + (i % 7) * 23) % 450) + 12, .6 + (i % 3) * .35]);
/* animated (the round window on the home page): the sun or moon breathes and the stars twinkle */
/* taps: the sun or moon is a thing to press of its own (the landscape; the designer, 2026-11-28: a tap on nothing does
   nothing, so the sky is not one) */
const sky = (V, animate, taps = false) => V.sky.map((c, i) => `<rect y="${i * 62}" width="400" height="${i === 3 ? 500 : 62}" fill="${c}"/>`).join("")
  + (V === VIEW.night ? STARS.map(([x, y, r]) => `<circle${animate ? ` class="lc-twinkle"` : ""} cx="${x}" cy="${y}" r="${animate ? r * 2.4 : r}" fill="#f2ecd6"/>`).join("") : "")
  + `<circle${animate ? ` class="lc-sun"` : ""}${animate && taps ? ` data-tap="window"` : ""} cx="${V.disc[1]}" cy="${V.disc[2]}" r="${V.disc[3]}" fill="${V.disc[0]}"/>`;

/* the H title: the place in big characters on the ground, the series name beside it, the time in a red seal, a small 貓 seal */
export function titleH(time, name, ink) {
  const n = [...name].length, step = 31, end = 30 + n * step;
  return column(name, 364, 30, 28, step, ink) + column("長貓十二景", 337, 36, 10.5, 12.5, ink)
    + `<rect x="351" y="${end + 4}" width="26" height="26" fill="${RED}"/>${glyph(VIEW[time].time, 364, end + 7.5, 18, PAPER)}`
    + `<rect x="328" y="104" width="18" height="18" fill="none" stroke="${RED}" stroke-width="1.7"/>${glyph("貓", 337, 107, 12, RED)}`;
}
/* the G title block: the place reversed out of an indigo strip, time and series name in small boxes, a red seal */
export function titleG(time, name) {
  const n = [...name].length, h = 12 + n * 27, k = `stroke="${IND[0]}" stroke-width="1.2"`;
  return `<rect x="352" y="24" width="30" height="${h}" fill="${IND[0]}" stroke="${PAPER}" stroke-width="1.2"/>${column(name, 367, 30, 21, 27, PAPER)}`
    + `<rect x="328" y="24" width="20" height="24" fill="${PAPER}" ${k}/>${glyph(VIEW[time].time, 338, 28, 14, IND[0])}`
    + `<rect x="328" y="52" width="20" height="64" fill="${PAPER}" ${k}/>${column("長貓十二景", 338, 56, 10, 11.5, IND[0])}`
    + `<rect x="357.5" y="${30 + h}" width="19" height="19" fill="${PAPER}" stroke="${RED}" stroke-width="1.8"/>${glyph("貓", 367, 33 + h, 12.5, RED)}`;
}
const paperEdge = (m, line) => `<path d="M0 0H400V500H0ZM${m} ${m}V${500 - m}H${400 - m}V${m}Z" fill="${PAPER}" fill-rule="evenodd"/><rect x="${m}" y="${m}" width="${400 - 2 * m}" height="${500 - 2 * m}" fill="none" stroke="${line}" stroke-width="1.6"/>`;

/* spec: { name, grounds: { morning, golden, night }, crop (square viewBox of the view for the window), bandY,
     view(V, q, time, animate), seat(c, q, time), band(c, y0, q, time, on), fx(c, q, time, on) -> { back, front } (optional),
     tones: { a, b, l } (the seat's own colours, morning), ownColours (optional: keep them on the landscape too),
     judge: { item, hold } (optional: what the judge has on its head and in its paw here, see print/judge.js),
     floor: [fill, pattern colour] (the band's own colours, morning) } */
export function makePlace(spec) {
  /* `on(name, style)` gives a class only when the picture is animated; a view uses it on its own moving things */
  const onOf = animate => (name, style = "") => (animate ? ` class="${name}"${style ? ` style="${style}"` : ""}` : "");
  /* spec.things: what stands in the view and is not scenery (animals, what is pressed, and the branch each one sits
     on), drawn over the view. Kept apart so the same things can be laid over another background (the landscape
     hands them back as `things`); a place without any draws exactly as before */
  const thingsOf = (time, animate) => (spec.things ? spec.things(VIEW[time], pen(VIEW[time].line), time, onOf(animate)) : "");
  /* taps (the landscape): each hanging thing of the view (lc-sway: a lantern, a pendulum, a strap) is a thing to press
     of its own and swings when pressed, and so is the sun or moon. Nothing else of the view answers a tap: the designer,
     2026-11-28, of the whole picture swinging at any tap: "I rather not have any effect if clicking on nothing" */
  const onTap = animate => (name, style = "") => onOf(animate)(name, style) + (animate && name === "lc-sway" ? ` data-tap="swing"` : "");
  const full = (time, animate, taps = false) => sky(VIEW[time], animate, taps) + spec.view(VIEW[time], pen(VIEW[time].line), time, (taps ? onTap : onOf)(animate)) + thingsOf(time, animate);
  const bandY = spec.bandY || 474;
  function scene(time, R, animate) {
    const ground = spec.grounds[time], night = time === "night", ink = night ? PAPER : KEY, q = pen(KEY);
    const c = { a: tint(spec.tones.a, time), b: tint(spec.tones.b, time), l: tint(spec.tones.l, time), k: KEY, warm: VIEW[time].warm, glow: VIEW[time].glow, lit: VIEW[time].lit, paper: PAPER };
    const cx = 60, cy = 62, r = 36;
    const specks = `<g fill="${mix(ground, "#ffffff", night ? .12 : .35)}" opacity=".8">${SPECK.map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${f(s)}"/>`).join("")}</g>`;
    const win = inset(cx - r, cy - r, 2 * r, 2 * r, spec.crop || "40 40 320 320", full(time, animate))
      + `<path d="M${cx - r - 1} ${cy - r - 1}h${2 * r + 2}v${2 * r + 2}h${-2 * r - 2}ZM${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z" fill="${ground}" fill-rule="evenodd"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${KEY}" stroke-width="2.2"/><circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="${ink}" stroke-width=".9" opacity=".8"/>`;
    /* the place's own moving things (rain, snow, lanterns, a campfire ...): `on(name, style)` gives the class only when
       animated, so a still picture shows the same things at rest. Clipped to the picture so a loop never shows outside it */
    const on = onOf(animate);
    const fx = spec.fx ? spec.fx(c, q, time, on) : {};
    /* animated: the window and the place's things answer a tap (the sun pops, hanging things swing, the fire flares) */
    const tap = (kind, m) => (animate ? `<g data-tap="${kind}">${m}</g>` : m);
    const back = `<rect width="400" height="500" fill="${ground}"/>${specks}${tap("window", win)}${fx.back ? tap("swing", inset(0, 0, 400, 500, "0 0 400 500", fx.back)) : ""}`;
    const seat = spec.seat(c, q, time, animate) + `<ellipse cx="200" cy="${bandY - 6}" rx="178" ry="11" fill="${KEY}" opacity=".14"/>`;
    const front = spec.band({ fill: tint(spec.floor[0], time), mark: tint(spec.floor[1], time), k: KEY, paper: PAPER }, bandY, q, time, on) + (fx.front ? tap("fire", fx.front) : "");
    const title = titleH(time, spec.name, ink);
    return { back, seat, front, frame: paperEdge(8, KEY) + title, title, up: ground, down: { fill: tint(spec.floor[0], time), line: KEY, water: !!spec.water }, wall: ground, ink, judge: spec.judge || null };
  }
  /* the landscape is still on postcards and thumbs; on the home page and in the wardrobe it is drawn with `animate`:
     the view's own things move, the place's fx are added where the view has no such thing already (spec.fxOnView),
     and what can be pressed is a thing itself: a hanging thing swings, the sun or moon pops. Until 2026-11-28 the
     whole landscape was one thing to press ("swing"), so a tap on empty sky swung everything that hangs; the designer: "I
     rather not have any effect if clicking on nothing" */
  function landscape(time, animate = false) {
    const V = VIEW[time], q = pen(V.line), on = onOf(animate);
    /* spec.ownColours: the seat and the floor band keep the place's own colours here too, not the landscape's ink */
    const own = !!spec.ownColours, floor = own ? tint(spec.floor[0], time) : V.d[3];
    const c = { a: own ? tint(spec.tones.a, time) : V.d[3], b: own ? tint(spec.tones.b, time) : V.d[2], l: own ? tint(spec.tones.l, time) : V.d[4], k: V.line, warm: V.warm, glow: V.glow, lit: V.lit, paper: V.paper };
    const fx = animate && spec.fx && spec.fxOnView ? spec.fx(c, q, time, on) : {};
    const view = full(time, animate, true) + (fx.back ? inset(0, 0, 400, 500, "0 0 400 500", fx.back) : "");
    return { back: view, seat: spec.seat(c, q, time, false), front: spec.band({ fill: floor, mark: own ? tint(spec.floor[1], time) : V.d[1], k: V.line, paper: V.paper }, bandY, q, time, on) + (fx.front ? `<g data-tap="fire">${fx.front}</g>` : ""),
      things: thingsOf(time, animate),
      /* spec.tall: a place whose scenery is one tall picture gives it whole for Home ({ box, inner }), which then
         fills the phone with it and lays the things, the seat and the judge over it (ui/home-art.js) */
      tall: spec.tall ? spec.tall(V, q, time, on) : null,
      frame: paperEdge(10, IND[0]) + titleG(time, spec.name), title: titleG(time, spec.name), up: V.sky[0], down: { fill: floor, line: V.line, water: !!spec.water }, wall: V.sky[0], ink: KEY, judge: spec.judge || null };
  }
  const stamp = () => inset(0, 0, 44, 52, spec.stampCrop || "50 30 300 355", full("morning"));
  return { scene, landscape, stamp, name: spec.name };
}
