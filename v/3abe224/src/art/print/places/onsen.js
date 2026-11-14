/* The onsen in the woodblock portrait style (H, docs/art-style.md): a flat ground per time of day, the place in a
   round window, a stone lantern, the stone rim the judge sits on, blue wave scales over its feet, and the title.
   Returns the same layers as ../../places/a.js onsen ({ back, seat, front, wall }) plus `frame`, drawn last. */
import { f } from "../../util.js";
import { column, glyph } from "../lettering.js";

export const KEY = "#262122", PAPER = "#efe6d2", RED = "#bf452d";
const T = {
  morning: { ground: "#e3c98a", speck: "#f4e6bf", ink: KEY, sky: "#a9c2cf", skyLow: "#e9e1cc", disc: ["#c9553f", 46, 48, 9], mtn: "#7b93a8", water: "#5d8ba3", water2: "#eef1e6", stone: "#cfc7b6", stoneDk: "#aca391", lamp: "#e9dfbd", steam: PAPER, steamO: .85, time: "朝", glow: 0 },
  golden: { ground: "#dc8d5b", speck: "#efb88b", ink: KEY, sky: "#eaa863", skyLow: "#f6e2b6", disc: ["#fbf0c9", 78, 58, 11], mtn: "#a8644a", water: "#55809a", water2: "#f6e6c4", stone: "#d9c2a2", stoneDk: "#b49b7a", lamp: "#f6dc8c", steam: "#fbefd8", steamO: .8, time: "夕", glow: .32 },
  night: { ground: "#39404d", speck: "#4c5464", ink: PAPER, sky: "#1a2844", skyLow: "#3d5a80", disc: ["#f2e9cd", 76, 44, 8], mtn: "#22364e", water: "#2c4f6e", water2: "#9db7cf", stone: "#8e94a4", stoneDk: "#6c7282", lamp: "#f4d566", steam: "#c9d3e0", steamO: .5, time: "夜", glow: .5 },
};
const key = (w) => `stroke="${KEY}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`;

/* a little mica speckle, fixed (no randomness needed) */
const SPECK = Array.from({ length: 70 }, (_, i) => [((i * 97) % 380) + 10, ((i * 61 + (i % 7) * 23) % 450) + 12, .6 + (i % 3) * .35]);
/* the round window: the onsen in miniature, at the time of day */
function windowView(P, animate, cx = 60, cy = 62, r = 36) {
  const [dc, dx, dy, dr] = P.disc;
  const inner = `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${P.sky}"/><rect x="${cx - r}" y="${cy}" width="${2 * r}" height="${r}" fill="${P.skyLow}" opacity=".7"/>${P.glow > .4 ? [[40, 40], [58, 34], [88, 52], [34, 58]].map(([x, y]) => `<circle${animate ? ` class="lc-twinkle"` : ""} cx="${x}" cy="${y}" r="1.2" fill="#f2e9cd"/>`).join("") : ""}<circle${animate ? ` class="lc-sun"` : ""} cx="${dx}" cy="${dy}" r="${dr}" fill="${dc}"/>`
    + `<path d="M${cx - r} ${cy + 12}L${cx - 14} ${cy - 16}Q${cx - 6} ${cy - 24} ${cx + 2} ${cy - 16}L${cx + 12} ${cy - 6}Q${cx + 20} ${cy - 13} ${cx + 28} ${cy - 5}L${cx + r} ${cy + 8}V${cy + r}H${cx - r}Z" fill="${P.mtn}" ${key(1.2)}/>`
    + `<rect x="${cx - r - 4}" y="${cy + 4}" width="50" height="6" rx="3" fill="${PAPER}" opacity=".9"/><rect x="${cx - 2}" y="${cy + 10}" width="50" height="5" rx="2.5" fill="${PAPER}" opacity=".85"/>`
    + `<path d="M${cx - r} ${cy + 18}q10 -4 20 0t20 0t20 0t20 0V${cy + r}H${cx - r}Z" fill="${P.water}" ${key(1.1)}/>`
    + `<path d="M${cx - 20} ${cy + 14}c-4 -5 3 -8 0 -13M${cx + 14} ${cy + 15}c-4 -5 3 -8 0 -13" fill="none" stroke="${PAPER}" stroke-width="2" stroke-linecap="round" opacity=".9"/>`;
  /* no clipPath ids (many svgs share a page): a ring of ground colour hides whatever spills outside the circle */
  const R2 = r + 30, ring = `<path d="M${cx - R2} ${cy - R2}h${2 * R2}v${2 * R2}h${-2 * R2}ZM${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z" fill="${P.ground}" fill-rule="evenodd"/>`;
  return `${inner}${ring}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" ${key(2.2)}/><circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="${P.ink}" stroke-width=".9" opacity=".8"/>`;
}
/* overlapping wave scales, row by row so each row covers the one above */
function waves(P, animate, y0 = 474) {
  const r = 12;
  let s = `<rect x="0" y="${y0}" width="400" height="${500 - y0}" fill="${P.water}"/><g${animate ? ` class="lc-drift"` : ""}>`;
  for (let j = 0; j < 4; j++) for (let i = -1; i < 20; i++) {
    const x = i * 2 * r + (j % 2 ? r : 0), y = y0 + 6 + j * 7.5;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.water}" stroke="${P.water2}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="7.8" fill="none" stroke="${P.water2}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="3.8" fill="none" stroke="${P.water2}" stroke-width=".9"/>`;
  }
  return s + `</g><path d="M0 ${y0 - 6}H400" ${key(1.6)}/>`;
}
/* maple leaves: falling one after another when animated, three resting ones when still */
const LEAF = "M0 -9L2.4 -3.6L8 -6L5.6 -.4L10 3L3.6 4L0 10L-3.6 4L-10 3L-5.6 -.4L-8 -6L-2.4 -3.6Z";
const leaves = (animate) => [[112, 150, 20, 0], [300, 214, -40, 5.2], [262, 96, 60, 10.4], [150, 60, 10, 13]].map(([x, y, rot, d], i) => (animate
  ? `<g transform="translate(${x} 20)"><g class="lc-leaf" style="animation-delay:${-d}s;animation-duration:${15 + i * 2}s"><path d="${LEAF}" fill="${RED}" ${key(1.2)}/></g></g>`
  : i < 3 ? `<path transform="translate(${x} ${y}) rotate(${rot})" d="${LEAF}" fill="${RED}" ${key(1.2)}/>` : "")).join("");
const steam = (x, y, s, P, animate) => `<g${animate ? ` class="lc-steam"` : ""} transform="translate(${x} ${y}) scale(${s})"><path d="M0 0c-10 -10 8 -17 0 -27c-8 -9 7 -15 1 -24M12 -3c-7 -8 6 -13 0 -21" fill="none" stroke="${P.steam}" stroke-width="${f(3.4 / s)}" stroke-linecap="round" opacity="${P.steamO}"/></g>`;
const floatYuzu = (x, y, r, animate) => `<g transform="translate(${x} ${y})"${animate ? ` data-tap="dunk"` : ""}><g class="lc-dunk"><g${animate ? ` class="lc-bob" style="animation-delay:${-(x % 7) / 2}s"` : ""}><circle r="${r}" fill="#ebb229" ${key(1.4)}/><path d="M1 ${-r}q${f(r * .8)} ${f(-r * .8)} ${f(r * 1.5)} ${f(-r * .2)}q${f(-r * .8)} ${f(r * .6)} ${f(-r * 1.5)} ${f(r * .2)}z" fill="#5d8a63" ${key(1.1)}/></g></g></g>`;

/* the title: the place in three big characters, the series name small beside it, the time in a red seal, a small 貓 seal */
export function title(time, name = "湯之里") {
  const P = T[time] || T.morning, n = [...name].length, step = 31, end = 30 + n * step;
  return column(name, 364, 30, 28, step, P.ink) + column("長貓十二景", 337, 36, 10.5, 12.5, P.ink)
    + `<rect x="351" y="${end + 4}" width="26" height="26" fill="${RED}"/>${glyph(P.time, 364, end + 7.5, 18, PAPER)}`
    + `<rect x="328" y="104" width="18" height="18" fill="none" stroke="${RED}" stroke-width="1.7"/>${glyph("貓", 337, 107, 12, RED)}`;
}

export function onsen(time, R, animate) {
  const P = T[time] || T.morning;
  const specks = `<g fill="${P.speck}" opacity=".8">${SPECK.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${f(r)}"/>`).join("")}</g>`;
  const lantern = (P.glow ? `<g${animate ? ` class="lc-flicker"` : ""}><circle cx="358" cy="312" r="46" fill="${P.lamp}" opacity="${P.glow}"/></g>` : "")
    + `<g fill="${P.stone}" ${key(2)}><path d="M340 446h36v16h-36Z"/><path d="M350 330h16v116h-16Z"/><path d="M340 296h36v34h-36Z"/><path d="M322 298L338 275H378L394 298Z"/><circle cx="358" cy="268" r="5"/></g><rect x="350" y="304" width="16" height="18" fill="${P.lamp}" ${key(1.4)}/>`;
  const tap = (kind, m) => (animate ? `<g data-tap="${kind}">${m}</g>` : m);
  const back = `<rect width="400" height="500" fill="${P.ground}"/>${specks}${tap("window", windowView(P, animate))}${tap("lamp", lantern)}${leaves(animate)}<ellipse cx="200" cy="466" rx="178" ry="12" fill="${KEY}" opacity=".16"/>`
    + steam(26, 250, 1.1, P, animate) + steam(300, 232, 1, P, animate);
  /* the stone rim the judge sits on; the feet go in the water in front of it */
  const seat = `<g fill="${P.stone}" ${key(1.8)}>${[[18, 446, 30, 17], [384, 448, 30, 16], [64, 456, 34, 14], [336, 458, 34, 13], [132, 462, 40, 12], [268, 462, 40, 12]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join("")}</g><g fill="none" stroke="${P.stoneDk}" stroke-width="2" stroke-linecap="round">${[[18, 446, 30], [384, 448, 30], [64, 456, 34]].map(([x, y, rx]) => `<path d="M${x - rx * .5} ${y + 6}q${rx * .5} 5 ${rx} 0"/>`).join("")}</g>`;
  const front = waves(P, animate) + floatYuzu(84, 486, 8, animate) + floatYuzu(318, 489, 7, animate) + steam(40, 470, .8, P, animate) + steam(372, 466, .8, P, animate);
  const frame = `<path d="M0 0H400V500H0ZM8 8V492H392V8Z" fill="${PAPER}" fill-rule="evenodd"/><rect x="8" y="8" width="384" height="484" fill="none" ${key(1.6)}/>${title(time)}`;
  return { back, seat, front, frame, wall: P.ground, ink: P.ink };
}

/* ---------- G: the indigo landscape, for postcards ----------
   The whole landscape in one ink, indigo, at five strengths; the characters keep their colours. One warm accent per
   time: a red sun in the morning, an ochre horizon at golden hour, lamplight at night. The printer's soft wipe
   (bokashi) is done as flat steps of colour, which is what the old prints look like close up. */
const IND = ["#1d3150", "#33517a", "#5d7ea3", "#93abc4", "#c6d3dc", "#dde5e8"];
const G = {
  morning: { sky: [IND[2], IND[3], IND[4], PAPER], disc: ["#c9553f", 86, 156, 26], far: IND[3], near: IND[3], nearTop: IND[1], mist: PAPER, rock: IND[4], rockDk: IND[2], stone: IND[5], floor: IND[4], lamp: PAPER, water: IND[3], waterDk: IND[1], wave: PAPER, bamboo: IND[3], leaf: IND[1], time: "朝", glow: 0, ink: KEY },
  golden: { sky: [IND[2], IND[4], "#f1dcae", "#e4b06c"], disc: ["#f8eecd", 306, 150, 34], far: IND[3], near: IND[3], nearTop: IND[1], mist: "#f6ead0", rock: IND[4], rockDk: IND[2], stone: IND[5], floor: IND[4], lamp: "#f2d27a", water: IND[3], waterDk: IND[1], wave: "#f6ead0", bamboo: IND[3], leaf: IND[1], time: "夕", glow: .3, ink: KEY },
  night: { sky: ["#0e1a30", "#15243e", IND[0], IND[1]], disc: ["#f2ecd6", 306, 80, 22], far: IND[1], near: "#172a46", nearTop: "#0e1a30", mist: IND[3], rock: "#2c4566", rockDk: "#0e1a30", stone: "#4c6a90", floor: "#243b5a", lamp: "#f4d566", water: IND[1], waterDk: "#0c182c", wave: IND[3], bamboo: "#28466b", leaf: "#132744", time: "夜", glow: .5, ink: KEY },
};
const ikey = (w) => `stroke="${IND[0]}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`;
const mist = (x, y, w, h, c, o) => `<g fill="${c}" opacity="${o}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/><rect x="${f(x + w * .28)}" y="${f(y + h * .62)}" width="${f(w * .9)}" height="${h}" rx="${h / 2}"/></g>`;
export function onsenLandscape(time) {
  const P = G[time] || G.morning, night = time === "night";
  const [dc, dx, dy, dr] = P.disc;
  const sky = P.sky.map((c, i) => `<rect y="${i * 62}" width="400" height="${i === 3 ? 500 : 62}" fill="${c}"/>`).join("");
  const stars = night ? [[60, 52, 1.8], [128, 34, 1.4], [196, 62, 1.2], [250, 38, 1.6], [34, 130, 1.2], [150, 98, 1.1], [226, 104, 1.3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2ecd6"/>`).join("") : "";
  const farD = "M-10 250L60 192Q90 172 120 190L172 150Q202 126 234 152L300 198Q340 178 410 216";
  const nearD = "M-10 300Q90 226 196 268Q292 216 410 274";
  const stalk = (x, y0, w) => {
    let s = `<path d="M${x - w / 2} ${y0}h${w}V440h${-w}Z" fill="${P.bamboo}" ${ikey(1.5)}/>`;
    for (let y = y0 + 34; y < 400; y += 50) s += `<path d="M${x - w / 2} ${y}h${w}" fill="none" ${ikey(1.6)}/>`;
    return s;
  };
  const leaf = (x, y, rot, s = 1) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0Q13 -9 30 -2Q15 8 0 0Z" fill="${P.leaf}" ${ikey(.9 / s)}/>`;
  const rock = d => `<path d="${d}" fill="${P.rock}"/><path d="${d}" fill="${P.rockDk}" opacity=".45" transform="translate(0 40)"/><path d="${d}" fill="none" ${ikey(1.9)}/>`;
  const back = sky + stars + `<circle cx="${dx}" cy="${dy}" r="${dr}" fill="${dc}"/>`
    + `<path d="${farD}V340H-10Z" fill="${P.far}" opacity=".85"/><path d="${farD}" fill="none" ${ikey(1.3)} opacity=".75"/>`
    + mist(-30, 214, 170, 15, P.mist, night ? .45 : .95) + mist(214, 228, 150, 13, P.mist, night ? .45 : .95)
    + `<path d="${nearD}V440H-10Z" fill="${P.near}"/><path d="${nearD}V290H-10Z" fill="${P.nearTop}" opacity=".55"/><path d="${nearD}" fill="none" ${ikey(1.5)}/>`
    + mist(96, 286, 190, 14, P.mist, night ? .4 : .9)
    + `<path d="M-10 438Q200 424 410 438V500H-10Z" fill="${P.floor}"/>`
    + stalk(20, 110, 12) + stalk(44, 70, 13) + stalk(66, 150, 10) + leaf(44, 90, -28) + leaf(46, 108, 18, .9) + leaf(66, 170, -12, .8) + leaf(22, 130, -30, .8)
    + rock("M-10 500V356Q8 318 50 320Q94 324 102 372V500Z") + rock("M298 500V306Q304 268 350 268Q398 268 410 306V500Z")
    + `<g transform="translate(40 318)">${P.glow ? `<circle cy="-32" r="42" fill="${P.lamp}" opacity="${P.glow}"/>` : ""}<g fill="${P.stone}" ${ikey(1.6)}><path d="M-8 -18h16v22h-16Z"/><path d="M-14 -46h28v28h-28Z"/><path d="M-26 -46Q0 -72 26 -46Z"/><circle cy="-66" r="4.5"/></g><rect x="-7" y="-39" width="14" height="14" fill="${P.lamp}" ${ikey(1.2)}/></g>`;
  const seat = `<g fill="${P.stone}" ${ikey(1.6)}>${[[14, 452, 30, 20], [384, 456, 30, 18], [62, 462, 34, 16], [338, 464, 34, 15]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join("")}</g>`;
  const wave = "M0 473q25 -8 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0";
  const front = `<path d="${wave}V500H0Z" fill="${P.water}"/><rect y="488" width="400" height="12" fill="${P.waterDk}"/><path d="${wave}" fill="none" ${ikey(1.6)}/>`
    + `<path d="M8 484q12.5 -6 25 0t25 0t25 0M150 488q12.5 -6 25 0t25 0t25 0M270 483q12.5 -6 25 0t25 0t25 0t25 0" fill="none" stroke="${P.wave}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`
    + floatYuzu(84, 487, 8) + floatYuzu(318, 490, 7);
  /* the title block: the place reversed out of an indigo strip, the time and the series name in small boxes, a red seal */
  const titleG = `<rect x="352" y="24" width="30" height="92" fill="${IND[0]}" stroke="${PAPER}" stroke-width="1.2"/>${column("湯之里", 367, 30, 21, 27, PAPER)}`
    + `<rect x="328" y="24" width="20" height="24" fill="${PAPER}" ${ikey(1.2)}/>${glyph(P.time, 338, 28, 14, IND[0])}`
    + `<rect x="328" y="52" width="20" height="64" fill="${PAPER}" ${ikey(1.2)}/>${column("長貓十二景", 338, 56, 10, 11.5, IND[0])}`
    + `<rect x="357.5" y="122" width="19" height="19" fill="${PAPER}" stroke="${RED}" stroke-width="1.8"/>${glyph("貓", 367, 125, 12.5, RED)}`;
  const frame = `<path d="M0 0H400V500H0ZM10 10V490H390V10Z" fill="${PAPER}" fill-rule="evenodd"/><rect x="10" y="10" width="380" height="480" fill="none" ${ikey(1.5)}/>${titleG}`;
  return { back, seat, front, frame, wall: P.sky[0], ink: P.ink };
}
