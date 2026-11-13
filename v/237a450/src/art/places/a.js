/* Places 1-4: onsen, the judge's living room, the night market, the train carriage.
   Each place(time, R, animate) returns { back, seat, front }: back and seat are drawn behind the judge, front over
   its feet. A seat never covers the lap, the belly or the neck: it sits behind the body or below the lap. */
import { f } from "../util.js";
import { tone, SKY, celestial, puff, glow, windowPane, mix, lit, WARM } from "./common.js";

const ONSEN = {
  morning: { sky: "#f3e6d6", hill1: "#dccdb9", hill2: "#c4b6a0", bamboo: "#a8b5a0", joint: "#95a28d", rock1: "#bfae96", rock2: "#d2c5b0", water: "#a7c9d2", ripple: "#eef7f9", steam: 1.35, lantern: .35 },
  golden: { sky: "#f6cf8f", hill1: "#e3b67f", hill2: "#cf9c6a", bamboo: "#a39a6c", joint: "#8c8256", rock1: "#bfa47e", rock2: "#d6bc94", water: "#a9b8ad", ripple: "#fff0cc", steam: .8, lantern: .6 },
  night: { sky: "#2d394d", hill1: "#3a4759", hill2: "#4a5a6b", bamboo: "#5c7064", joint: "#4b5d52", rock1: "#655f55", rock2: "#776f63", water: "#3e6b85", ripple: "#a6d4e6", steam: .7, lantern: 1 },
};
const yuzuBob = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f0a032"/><circle cx="${f(x - r * .3)}" cy="${f(y - r * .3)}" r="${f(r * .28)}" fill="#f8c86e" opacity=".8"/><path d="M${x + 1} ${y - r} q5 -5 9 -1 q-5 3 -9 1z" fill="#5c7d4b"/>`;

export function onsen(time, R, animate) {
  const P = ONSEN[time], st = o => Math.min(.9, o * P.steam);
  const back = `<rect width="400" height="500" fill="${P.sky}"/>${celestial(time, R, { x: 336, y: time === "golden" ? 70 : 84, sky: P.sky, mx: 66 })}
    <path d="M0 180 q62 -70 123 -30 q51 -60 113 -20 q41 -50 92 -10 q31 -30 72 -5 V260 H0z" fill="${P.hill1}"/>
    <path d="M0 230 q82 -40 154 -10 q72 -40 144 -5 q51 -25 102 0 V290 H0z" fill="${P.hill2}"/>
    <g stroke="${P.bamboo}" stroke-width="5" stroke-linecap="round" opacity=".75"><path d="M24 118 V300"/><path d="M40 104 V300"/><path d="M360 128 V300"/><path d="M376 112 V300"/></g>
    <g stroke="${P.joint}" stroke-width="2.5" opacity=".6"><path d="M18 160 h28 M18 250 h28 M354 170 h28 M354 256 h28"/></g>
    <path d="M0 350 q41 -40 92 -10 q31 -20 51 10 V500 H0z" fill="${P.rock1}"/>
    <path d="M400 330 q-51 -36 -103 -2 q-31 -14 -47 12 V500 H400z" fill="${P.rock1}"/>
    <path d="M10 400 q62 -36 154 -22 q92 -12 185 22 V500 H10z" fill="${P.rock2}"/>
    <g transform="translate(22 300)">${time === "night" ? glow(0, 6, 30, .22) : ""}<rect x="-12" y="-6" width="24" height="26" rx="3" fill="${mix(P.rock1, "#7d705f", .4)}"/><path d="M-18 -6 h36 l-6 -12 h-24z" fill="${mix(P.rock1, "#6d604f", .45)}"/><rect x="-5" y="2" width="10" height="9" rx="1.5" fill="#f6c24a" opacity="${P.lantern}"/><rect x="-6" y="20" width="12" height="6" rx="1" fill="${mix(P.rock1, "#6d604f", .45)}"/></g>
    <g transform="translate(378 352)"><rect x="-16" y="-14" width="32" height="24" rx="4" fill="${mix("#b68a5e", P.sky, .2)}"/><path d="M-16 -8 h32 M-16 0 h32" stroke="#8b6540" stroke-width="1.5"/><path d="M-12 -14 q12 -14 24 0" stroke="#8b6540" stroke-width="2.5" fill="none"/></g>
    ${puff(70, 230, 48, 26, st(.45), animate)}${puff(330, 190, 54, 30, st(.4), animate)}${puff(112, 130, 40, 22, st(.32), animate)}${puff(308, 80, 46, 24, st(.3), animate)}${puff(200, 34, 60, 22, st(.22), animate)}`;
  /* the seat: the stone rim the judge sits on, its feet in the water */
  const seat = `<g fill="${P.rock2}" stroke="${mix(P.rock1, "#000000", .12)}" stroke-width="1.2">${[[16, 440, 26, 18], [376, 436, 30, 20], [60, 452, 34, 16], [340, 452, 34, 16], [130, 458, 40, 14], [270, 458, 40, 14], [200, 460, 44, 13]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join("")}</g>`;
  const front = `<rect x="0" y="462" width="400" height="38" fill="${P.water}"/><path d="M0 462 q50 -4 100 0 t100 0 t100 0 t100 0" fill="none" stroke="${P.ripple}" stroke-width="2" opacity=".7"/>
    <g stroke="${P.ripple}" stroke-width="2" stroke-linecap="round" opacity=".8" fill="none"><path d="M30 478 q10 -3 20 0 q10 3 20 0"/><path d="M256 486 q10 -3 20 0 q10 3 20 0"/><path d="M144 492 q10 -3 20 0 q10 3 20 0"/></g>
    ${yuzuBob(72, 482, 7)}${yuzuBob(312, 478, 6)}${yuzuBob(344, 492, 5)}
    ${puff(60, 462, 36, 14, st(.3), animate)}${puff(340, 456, 40, 15, st(.26), animate)}`;
  return { back, seat, front, wall: P.sky };
}

export function livingroom(time, R, animate) {
  const t = c => tone(c, time), on = lit(time);
  const wall = t("#efe1c6"), wains = t("#e4d0a9"), rail = t("#d6bf95"), floor = t("#d8c09a"), chair = t("#9fb8ab"), chairDk = t("#86a294"), wood = t("#b08a62");
  const win = windowPane(14, 34, 92, 110, time, t("#c8ab80"), time === "night" ? `<circle cx="80" cy="62" r="9" fill="#f6ecd8"/><circle cx="76" cy="59" r="8" fill="${SKY.night.top}"/>` : time === "golden" ? `<circle cx="40" cy="120" r="14" fill="#fff3c9" opacity=".9"/>` : `<circle cx="70" cy="70" r="12" fill="#f8ddb0" opacity=".9"/>`, { cross: true, bar: 3 });
  const curtains = `<path d="M8 28 h22 q-6 50 4 124 h-26z M112 28 h-22 q6 50 -4 124 h26z" fill="${t("#d9a99a")}"/><rect x="4" y="24" width="112" height="6" rx="3" fill="${wood}"/>`;
  const clock = `<g transform="translate(346 40)"><path d="M-22 0 L0 -18 L22 0z" fill="${t("#8b6540")}"/><rect x="-18" y="0" width="36" height="40" rx="3" fill="${t("#b08a62")}"/><circle cy="18" r="11" fill="${t("#fdf6e8")}"/><path d="M0 18 v-7 M0 18 l5 3" stroke="${t("#4a3222")}" stroke-width="1.6" stroke-linecap="round"/><rect x="-5" y="-9" width="10" height="7" rx="1" fill="${t("#6b4a33")}"/><path d="M-6 40 v26 M6 40 v20" stroke="${t("#8b6540")}" stroke-width="1.4"/><path d="M-9 66 h6 l-3 8z M3 60 h6 l-3 8z" fill="${t("#8b6540")}"/></g>`;
  const picture = `<g transform="translate(150 16)"><rect width="56" height="40" rx="2" fill="${t("#fdf6e8")}" stroke="${wood}" stroke-width="3"/><path d="M4 34 q12 -16 22 -6 q10 -12 26 4 V36 H4z" fill="${t("#a9c0a0")}"/><circle cx="40" cy="12" r="5" fill="${t("#f0a032")}"/></g>`;
  const lamp = `<g transform="translate(22 0)">${on ? glow(0, 252, 46, .28) + glow(0, 252, 22, .35) : ""}<path d="M0 268 V470" stroke="${t("#6b4a33")}" stroke-width="3"/><path d="M-16 268 L-10 236 H10 L16 268z" fill="${on ? "#f8dfa2" : t("#e8d3a6")}" stroke="${t("#c9a77a")}" stroke-width="1.2"/><ellipse cy="472" rx="12" ry="4" fill="${t("#6b4a33")}"/></g>`;
  const back = `<rect width="400" height="500" fill="${wall}"/><g stroke="${mix(wall, "#c9b48c", .5)}" stroke-width="1" opacity=".5">${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 32 + 8} 0 V300"/>`).join("")}</g>
    <rect y="300" width="400" height="150" fill="${wains}"/><rect y="296" width="400" height="8" fill="${rail}"/><rect y="444" width="400" height="56" fill="${floor}"/>
    ${curtains}${win}${picture}${clock}<ellipse cx="200" cy="486" rx="190" ry="18" fill="${t("#c9a59a")}" opacity=".8"/>${lamp}`;
  const cup = `<g transform="translate(380 326)"><ellipse cy="6" rx="14" ry="3.5" fill="${t("#fdf6e8")}" stroke="${t("#c9bba6")}"/><path d="M-8 -6 h16 l-2 11 h-12z" fill="${t("#fdf6e8")}" stroke="${t("#c9bba6")}"/><path d="M8 -3 q6 1 3 6" stroke="${t("#c9bba6")}" stroke-width="1.6" fill="none"/>${on ? "" : `<path d="M-2 -10 q3 -4 0 -8 M3 -11 q3 -4 0 -8" stroke="#ffffff" stroke-width="1.4" fill="none" opacity=".7"/>`}</g>`;
  const seat = `<path d="M36 470 V230 Q36 168 110 168 H290 Q364 168 364 230 V470z" fill="${chair}"/><g fill="${chairDk}">${[[86, 210], [200, 196], [314, 210]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join("")}</g>
    <rect x="22" y="452" width="356" height="30" rx="10" fill="${chairDk}"/><rect x="4" y="318" width="54" height="152" rx="22" fill="${chair}" stroke="${chairDk}" stroke-width="2"/><rect x="342" y="318" width="54" height="152" rx="22" fill="${chair}" stroke="${chairDk}" stroke-width="2"/>
    <rect x="30" y="480" width="10" height="14" rx="2" fill="${wood}"/><rect x="360" y="480" width="10" height="14" rx="2" fill="${wood}"/>${cup}`;
  return { back, seat, front: "", wall };
}

export function nightmarket(time, R, animate) {
  const t = c => tone(c, time), on = time !== "morning";
  const sky = time === "night" ? "#2b3448" : time === "golden" ? "#f3c98e" : "#e9e1d6";
  const bld = t("#d8c8b6"), bld2 = t("#cdb9a4"), red = t("#d97a68"), white = t("#f5ece0"), pole = t("#8a7a68");
  const bulbs = Array.from({ length: 11 }, (_, i) => { const x = 10 + i * 38, y = 30 + Math.sin(i * 1.1) * 4 + (i % 2) * 10; return [x, y]; });
  const wire = `<path d="M0 26 ${bulbs.map(([x, y]) => `L${x} ${f(y)}`).join(" ")} L400 30" stroke="${t("#6b5a48")}" stroke-width="1.2" fill="none"/>`;
  const lights = bulbs.map(([x, y], i) => `${on ? glow(x, y + 6, 10, time === "night" ? .35 : .2) : ""}<circle cx="${x}" cy="${f(y + 5)}" r="4.2" fill="${on ? ["#f8d27a", "#f4a98a", "#f8d27a", "#bfe0d0"][i % 4] : t("#e8e0d2")}" stroke="${t("#8a7a68")}" stroke-width=".8"/>`).join("");
  /* vertical shop signs with pictograms (a steaming bowl, a skewer), no words */
  const bowl = `<path d="M-9 30 h18 q-1 10 -9 10 q-8 0 -9 -10z" fill="${white}"/><path d="M-4 26 q-2 -3 0 -6 M0 26 q-2 -3 0 -6 M4 26 q-2 -3 0 -6" stroke="${white}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  const skewer = `<path d="M0 12 V54" stroke="${white}" stroke-width="1.6"/><circle cy="20" r="5" fill="${white}"/><circle cy="31" r="5" fill="${white}"/><circle cy="42" r="5" fill="${white}"/>`;
  const sign = (x, y, pic, c) => `<g transform="translate(${x} ${y})"><rect x="-13" y="0" width="26" height="62" rx="3" fill="${c}"/>${on && time === "night" ? glow(0, 31, 30, .18, c) : ""}${pic}</g>`;
  const awning = (x, w) => `<path d="M${x} 236 h${w} l-6 26 h-${w - 12}z" fill="${white}"/>${Array.from({ length: Math.floor(w / 16) }, (_, i) => `<path d="M${x + i * 16 + 2} 236 h8 l-.6 26 h-8z" fill="${red}"/>`).join("")}<path d="M${x + 6} 262 ${Array.from({ length: Math.floor((w - 12) / 12) }, () => "q3 6 6 0 q3 6 6 0").join(" ")}" fill="${white}" stroke="${red}" stroke-width="1"/>`;
  const balloons = [[352, 150, "#e9a0a8"], [374, 140, "#a9c7d8"], [364, 124, "#f4d08a"]].map(([x, y, c]) => `<path d="M${x} ${y + 14} Q${x - 4} ${y + 40} 366 236" stroke="${pole}" stroke-width="1" fill="none"/><ellipse cx="${x}" cy="${y}" rx="11" ry="13" fill="${tone(c, time === "night" ? "golden" : time)}"/>`).join("");
  const pot = `<g transform="translate(36 300)"><rect x="-22" y="-14" width="44" height="22" rx="4" fill="${t("#9aa3a8")}"/><rect x="-25" y="-17" width="50" height="5" rx="2" fill="${t("#80898e")}"/>${puff(-6, -32, 16, 10, .55, animate)}${puff(8, -48, 12, 8, .4, animate)}</g>`;
  const back = `<rect width="400" height="500" fill="${sky}"/>${time === "night" ? celestial("night", R, { x: 200, y: 70, stars: 5, starH: 90, sky }) : ""}
    <rect x="0" y="70" width="104" height="240" fill="${bld}"/><rect x="296" y="60" width="104" height="250" fill="${bld2}"/>
    <g fill="${on ? (time === "night" ? "#f3d9a0" : "#f6e4bd") : t("#e9e2d6")}" opacity="${time === "night" ? .75 : .8}">${[[12, 90], [52, 90], [12, 134], [52, 134], [308, 84], [348, 84], [308, 128], [348, 128]].map(([x, y]) => `<rect x="${x}" y="${y}" width="28" height="24" rx="2"/>`).join("")}</g>
    ${sign(88, 96, skewer, t("#c96a58"))}${sign(312, 168, bowl, t("#5d8a8a"))}
    ${wire}${lights}${awning(0, 108)}${awning(292, 108)}
    <rect x="0" y="268" width="96" height="190" fill="${t("#b7a58c")}"/><rect x="304" y="268" width="96" height="190" fill="${t("#b7a58c")}"/>
    ${time === "morning" ? `<g stroke="${t("#a39380")}" stroke-width="2" opacity=".7">${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${280 + i * 9} H96 M304 ${280 + i * 9} H400"/>`).join("")}</g>` : ""}
    ${pot}${balloons}<rect y="440" width="400" height="60" fill="${t("#b9b3aa")}"/><ellipse cx="80" cy="486" rx="26" ry="6" fill="${t("#a29b92")}"/>`;
  const stoolRed = t("#d9574a"), stoolDk = t("#b4432f");
  const stool = `<path d="M132 456 L118 500 M268 456 L282 500 M160 458 L156 500 M240 458 L244 500" stroke="${stoolRed}" stroke-width="7" stroke-linecap="round"/><rect x="124" y="452" width="152" height="12" rx="5" fill="${stoolDk}"/>`;
  const spare = `<g transform="translate(376 470)"><rect x="-22" y="-12" width="44" height="9" rx="4" fill="${stoolDk}"/><path d="M-17 -4 l-5 30 M17 -4 l5 30" stroke="${stoolRed}" stroke-width="5" stroke-linecap="round"/></g>`;
  return { back, seat: stool + spare, front: "", wall: sky };
}

export function train(time, R, animate) {
  const t = c => tone(c, time), on = lit(time);
  const wall = t("#e6e0d2"), panel = t("#cfc6b2"), frame = t("#b9b0a0"), moq = t("#86a3b4"), moqDk = t("#6f8c9e"), cloth = t("#f6f2ea");
  const land = (x0, w) => {
    if (time === "night") return `<g fill="#f6d79a" opacity=".85">${Array.from({ length: 5 }, () => `<rect x="${f(x0 + 6 + R() * (w - 16))}" y="${f(170 + R() * 30)}" width="3" height="3"/>`).join("")}</g><path d="M${x0} 200 h${w}" stroke="#4b5b73" stroke-width="10"/>`;
    const c1 = time === "golden" ? "#d9b27a" : "#c8d3b5", c2 = time === "golden" ? "#c49a62" : "#b2c2a0";
    return `<path d="M${x0} 170 q${w / 4} -16 ${w / 2} -4 t${w / 2} 0 V230 H${x0}z" fill="${c1}"/><rect x="${x0}" y="196" width="${w}" height="40" fill="${c2}"/><path d="M${x0 + w * .7} 150 V200 M${x0 + w * .7 - 8} 156 h16" stroke="${mix(c2, "#5a5040", .4)}" stroke-width="2"/>`;
  };
  const reflection = on ? `<g opacity=".16" fill="#f6ecd8"><rect x="34" y="110" width="74" height="62" rx="20"/><circle cx="76" cy="98" r="8"/></g>` : "";
  const back = `<rect width="400" height="500" fill="${wall}"/><rect y="0" width="400" height="16" fill="${t("#d8d1c2")}"/>
    <g stroke="${t("#a59c8a")}" stroke-width="3"><path d="M0 18 H400 M0 30 H400"/></g><path d="M20 30 v-12 M120 30 v-12 M280 30 v-12 M380 30 v-12" stroke="${t("#a59c8a")}" stroke-width="2"/>
    <rect x="300" y="4" width="54" height="14" rx="3" fill="${t("#c98a6a")}"/>
    ${windowPane(12, 52, 120, 168, time, frame, land(12, 120) + reflection, { bars: false, rx: 14, stroke: 7 })}
    ${windowPane(268, 52, 120, 168, time, frame, land(268, 120), { bars: false, rx: 14, stroke: 7 })}
    ${time === "morning" ? `<rect x="268" y="52" width="120" height="58" rx="10" fill="${t("#e9dcc0")}"/><path d="M268 110 h120" stroke="${frame}" stroke-width="3"/>` : ""}
    <rect y="250" width="400" height="200" fill="${panel}"/><rect y="246" width="400" height="6" fill="${frame}"/><rect y="446" width="400" height="54" fill="${t("#9a9284")}"/>
    <g fill="${t("#8c8476")}" opacity=".5">${Array.from({ length: 8 }, (_, i) => `<circle cx="${i * 52 + 20}" cy="478" r="2"/>`).join("")}</g>`;
  const seat = `<path d="M44 470 V214 Q44 186 74 186 H326 Q356 186 356 214 V470z" fill="${moq}"/><path d="M60 186 h80 v26 h-80z M260 186 h80 v26 h-80z" fill="${cloth}" opacity=".95"/>
    <g stroke="${moqDk}" stroke-width="1" opacity=".5">${Array.from({ length: 9 }, (_, i) => `<path d="M${54 + i * 36} 220 V460"/>`).join("")}</g>
    <rect x="30" y="452" width="340" height="24" rx="8" fill="${moqDk}"/><rect x="8" y="330" width="40" height="18" rx="8" fill="${t("#9a9284")}"/><rect x="18" y="346" width="12" height="100" fill="${t("#8c8476")}"/>`;
  return { back, seat, front: "", wall };
}
