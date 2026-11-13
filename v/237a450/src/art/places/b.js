/* Places 5-8: beach, library, camping, cinema. Same shape as places/a.js. */
import { f } from "../util.js";
import { tone, SKY, celestial, puff, glow, windowPane, mix, lit, WARM } from "./common.js";

export function beach(time, R, animate) {
  const t = c => tone(c, time), night = lit(time);
  const sky = { morning: "#dfeaee", golden: "#f6cf8f", night: "#2a3549" }[time];
  const sea = { morning: "#a9cfd9", golden: "#cdbb98", night: "#3e5f7a" }[time], foam = night ? "#a6c3d4" : "#fbf7ef";
  const sand = t("#efe0c2"), sandDk = t("#e0cca6"), wood = t("#c9a172"), woodDk = t("#9b7550");
  const shine = time === "night" ? `<path d="M318 214 h28 M322 226 h20 M326 240 h12 M320 256 h16" stroke="#f6ecd8" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>` : time === "golden" ? `<path d="M316 214 h40 M310 230 h52 M320 248 h30" stroke="#fff3c9" stroke-width="3" stroke-linecap="round" opacity=".6"/>` : "";
  const umbrella = `<path d="M60 112 L50 470" stroke="${t("#8b6540")}" stroke-width="3.5"/><path d="M0 116 Q60 50 128 112 Q110 104 96 116 Q80 104 64 114 Q48 104 32 116 Q16 104 0 116z" fill="${t("#e58e7e")}"/><path d="M42 112 Q56 62 64 60 Q72 62 86 112" fill="${t("#f6efe2")}" opacity=".9"/><circle cx="62" cy="58" r="3" fill="${t("#8b6540")}"/>`;
  const gull = (x, y, s) => `<path d="M${x - 9 * s} ${y} q${4.5 * s} ${-6 * s} ${9 * s} 0 q${4.5 * s} ${-6 * s} ${9 * s} 0" stroke="${night ? "#c9d3dd" : t("#6f6a6a")}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const back = `<rect width="400" height="500" fill="${sky}"/>${celestial(time, R, { x: 330, y: time === "golden" ? 150 : 70, sky, mx: 300 })}
    <rect y="206" width="400" height="98" fill="${sea}"/>${shine}<path d="M0 206 H400" stroke="${mix(sea, "#ffffff", .3)}" stroke-width="1.5"/>
    <g stroke="${mix(sea, "#ffffff", .45)}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"><path d="M20 236 q8 -4 16 0 q8 4 16 0"/><path d="M110 262 q8 -4 16 0 q8 4 16 0"/><path d="M300 280 q8 -4 16 0 q8 4 16 0"/></g>
    <rect y="300" width="400" height="200" fill="${sand}"/><path d="M0 302 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="${foam}" stroke-width="5" stroke-linecap="round"/>
    <g fill="${sandDk}">${Array.from({ length: 14 }, () => `<circle cx="${f(R() * 400)}" cy="${f(330 + R() * 160)}" r="1.4"/>`).join("")}</g>
    ${gull(250, 60, 1)}${gull(282, 80, .75)}${umbrella}<path d="M368 120 V470" stroke="${t("#9b7550")}" stroke-width="6" stroke-linecap="round"/><path d="M371 122 l22 7 l-22 7z" fill="${t("#e58e7e")}"/>
    <g transform="translate(372 462)"><path d="M-12 -14 h24 l-3 18 h-18z" fill="${t("#7fb2c4")}"/><path d="M-10 -14 q10 -12 20 0" stroke="${t("#5f8fa0")}" stroke-width="1.6" fill="none"/><path d="M16 4 L24 -26" stroke="${t("#e0b04a")}" stroke-width="2.4"/></g>`;
  /* an upright beach chair: a wooden frame and striped canvas behind the judge, short legs below the lap */
  const stripes = Array.from({ length: 8 }, (_, i) => `<rect x="${52 + i * 38}" y="196" width="19" height="260" fill="${t("#7fb2c4")}"/>`).join("");
  const seat = `<rect x="46" y="190" width="308" height="268" rx="16" fill="${t("#f6efe2")}"/>${stripes}<rect x="38" y="186" width="324" height="10" rx="5" fill="${wood}"/>
    <rect x="8" y="350" width="44" height="12" rx="5" fill="${wood}"/><rect x="348" y="350" width="44" height="12" rx="5" fill="${wood}"/><path d="M22 362 V480 M378 362 V480" stroke="${woodDk}" stroke-width="7" stroke-linecap="round"/>
    <path d="M90 460 L80 494 M310 460 L320 494" stroke="${woodDk}" stroke-width="7" stroke-linecap="round"/><rect x="40" y="452" width="320" height="12" rx="5" fill="${wood}"/>`;
  return { back, seat, front: "", wall: sky };
}

export function library(time, R, animate) {
  const t = c => tone(c, time), night = lit(time);
  const wall = t("#ece3d2"), shelf = t("#c9ad88"), shelfDk = t("#b39673");
  const BOOKS = ["#b5654a", "#6b8a6a", "#c99a4e", "#5f7a99", "#a07090", "#d6b48a", "#7b6a9a"];
  const books = (x0, x1, y, h) => {
    let out = "", x = x0;
    while (x < x1 - 6) { const w = 6 + Math.floor(R() * 6), hh = h - Math.floor(R() * 10); out += `<rect x="${x}" y="${y + h - hh}" width="${w}" height="${hh}" fill="${t(mix(BOOKS[Math.floor(R() * BOOKS.length)], "#efe6d6", .42))}"/>`; x += w + 1; }
    if (R() > .4) out += `<rect x="${x0 + 4}" y="${y + h - 7}" width="${Math.min(30, x1 - x0 - 8)}" height="7" fill="${t("#c9b28a")}" transform="rotate(-3 ${x0} ${y + h})"/>`;
    return out;
  };
  const case_ = (x0, x1) => `<rect x="${x0}" y="0" width="${x1 - x0}" height="452" fill="${shelfDk}"/><rect x="${x0 + 5}" y="0" width="${x1 - x0 - 10}" height="446" fill="${t("#d9c6a8")}"/>${[20, 96, 172, 248, 324, 400].map(y => books(x0 + 6, x1 - 6, y, 58) + `<rect x="${x0}" y="${y + 58}" width="${x1 - x0}" height="8" fill="${shelf}"/>`).join("")}`;
  const arch = `<path d="M128 240 V90 Q128 14 200 14 Q272 14 272 90 V240z" fill="${t("#c8ab80")}"/>` + `<g>${windowPane(136, 22, 128, 216, time, t("#c8ab80"), time === "night" ? `<circle cx="236" cy="56" r="9" fill="#f6ecd8"/><circle cx="232" cy="53" r="8" fill="${SKY.night.top}"/>` : "", { rx: 60, cross: true, bar: 3, stroke: 1 })}</g><path d="M136 238 V90 Q136 22 200 22 Q264 22 264 90 V238" fill="none" stroke="${t("#c8ab80")}" stroke-width="6"/>`;
  const lamp = `<g transform="translate(346 252)">${night ? glow(0, 2, 34, .3) : ""}<path d="M0 6 V20" stroke="${t("#c9a96e")}" stroke-width="2"/><rect x="-7" y="18" width="14" height="4" rx="1.5" fill="${t("#c9a96e")}"/><path d="M-15 6 Q0 -10 15 6z" fill="${t("#4f7a5a")}"/>${night ? `<ellipse cy="6" rx="13" ry="2.4" fill="#fbe7b0"/>` : ""}</g>`;
  const back = `<rect width="400" height="500" fill="${wall}"/>${arch}${case_(0, 98)}${case_(302, 400)}${lamp}<rect y="446" width="400" height="54" fill="${t("#b89870")}"/><ellipse cx="200" cy="482" rx="180" ry="16" fill="${t("#a0574a")}" opacity=".55"/>
    <g transform="translate(26 474) rotate(-8)"><rect x="-14" y="-6" width="28" height="9" rx="1" fill="${t("#5f7a99")}"/><rect x="-12" y="-4" width="24" height="2" fill="${t("#f6efe2")}"/></g>`;
  const leather = t("#a9b88f"), leatherDk = t("#91a079");
  const seat = `<path d="M38 468 V226 Q38 176 92 176 H308 Q362 176 362 226 V468z" fill="${leather}"/><g fill="${leatherDk}">${[[90, 206], [150, 196], [250, 196], [310, 206]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join("")}</g>
    <rect x="24" y="452" width="352" height="28" rx="10" fill="${leatherDk}"/><rect x="6" y="326" width="52" height="146" rx="20" fill="${leather}" stroke="${leatherDk}" stroke-width="2"/><rect x="342" y="326" width="52" height="146" rx="20" fill="${leather}" stroke="${leatherDk}" stroke-width="2"/>
    <rect x="30" y="480" width="9" height="14" fill="${shelfDk}"/><rect x="361" y="480" width="9" height="14" fill="${shelfDk}"/>`;
  return { back, seat, front: "", wall };
}

export function camping(time, R, animate) {
  const t = c => tone(c, time), night = lit(time);
  const sky = { morning: "#e6ebe0", golden: "#f3cd94", night: "#26314a" }[time];
  const far = t("#c7d2c0"), mid = t("#a9b99f"), pine = t("#8fa38a"), pineDk = t("#7a8f76"), ground = t("#cdbf9c");
  const tree = (x, y, s) => `<path d="M${x} ${y - 90 * s} L${x - 26 * s} ${y - 40 * s} H${x - 14 * s} L${x - 34 * s} ${y} H${x + 34 * s} L${x + 14 * s} ${y - 40 * s} H${x + 26 * s}z" fill="${pine}"/><rect x="${x - 4 * s}" y="${y}" width="${8 * s}" height="${16 * s}" fill="${pineDk}"/>`;
  const fireOn = time !== "morning";
  const fire = `<g transform="translate(378 462)">${fireOn ? glow(0, -8, night ? 46 : 30, night ? .32 : .2, "#f6a54a") : ""}<path d="M-18 6 l36 -8 M-18 -2 l36 8" stroke="${t("#7a5a3a")}" stroke-width="5" stroke-linecap="round"/>${fireOn ? `<path d="M-8 0 q-6 -12 2 -22 q2 8 6 6 q2 -10 8 -16 q4 14 0 22 q6 -2 6 -8 q6 12 -4 18z" fill="#f0a032"/><path d="M-2 0 q-2 -8 3 -12 q2 6 5 4 q0 6 -3 8z" fill="#f8d27a"/>` : `<path d="M-4 -4 q-2 -10 4 -16 M4 -6 q2 -8 -2 -14" stroke="${t("#c9c4bc")}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`}</g>`;
  const tent = `<g transform="translate(34 300)"><path d="M-40 4 L10 -64 L60 4z" fill="${t("#d9925a")}"/><path d="M10 -64 L10 4 L24 4z" fill="${t("#b8692f")}"/><path d="M10 -64 L-4 4" stroke="${t("#b8692f")}" stroke-width="1.5"/>${night ? `<path d="M10 -40 L4 4 H16z" fill="#f6c870" opacity=".55"/>` : ""}</g>`;
  const lantern = `<g transform="translate(372 104)"><path d="M0 -24 V-8" stroke="${pineDk}" stroke-width="1.5"/>${night ? glow(0, 4, 26, .28) : ""}<rect x="-7" y="-8" width="14" height="18" rx="3" fill="${night ? "#f8d27a" : t("#e8dcc0")}" stroke="${t("#6b5a48")}" stroke-width="1.5"/><path d="M-9 -8 h18 M-9 10 h18" stroke="${t("#6b5a48")}" stroke-width="2"/></g>`;
  const mist = time === "morning" ? puff(60, 250, 90, 20, .5, animate) + puff(330, 230, 100, 22, .45, animate) : "";
  const back = `<rect width="400" height="500" fill="${sky}"/>${celestial(time, R, { x: 300, y: time === "golden" ? 120 : 64, sky, mx: 320, stars: 14 })}
    <path d="M0 210 L60 150 L110 190 L170 130 L240 196 L300 150 L360 190 L400 170 V300 H0z" fill="${far}"/>${time === "night" ? "" : `<path d="M162 138 L170 130 L178 138 L172 140z M292 158 L300 150 L308 158 L302 160z" fill="#ffffff" opacity=".8"/>`}
    <rect y="270" width="400" height="230" fill="${mid}"/>${tree(28, 250, 1.2)}${tree(380, 236, 1.3)}${tree(96, 262, .7)}${tree(318, 262, .7)}
    <path d="M372 92 q-20 -6 -40 2" stroke="${pineDk}" stroke-width="3" fill="none"/>${lantern}${mist}
    <rect y="420" width="400" height="80" fill="${ground}"/>${tent}${fire}<g fill="${t("#a8987a")}"><ellipse cx="20" cy="486" rx="10" ry="4"/><ellipse cx="330" cy="492" rx="8" ry="3"/></g>`;
  const canvas = t("#7f9a78"), frame = t("#6f6a62");
  const seat = `<rect x="56" y="200" width="288" height="256" rx="8" fill="${canvas}"/><path d="M50 196 V460 M350 196 V460" stroke="${frame}" stroke-width="6" stroke-linecap="round"/>
    <rect x="16" y="352" width="46" height="9" rx="4" fill="${frame}"/><rect x="338" y="352" width="46" height="9" rx="4" fill="${frame}"/><path d="M28 361 L44 470 M372 361 L356 470" stroke="${frame}" stroke-width="4"/>
    <circle cx="358" cy="348" r="7" fill="none" stroke="${frame}" stroke-width="2.5"/><path d="M110 458 L290 498 M290 458 L110 498" stroke="${frame}" stroke-width="6" stroke-linecap="round"/><rect x="60" y="452" width="280" height="10" rx="4" fill="${canvas}"/>`;
  return { back, seat, front: "", wall: sky };
}

export function cinema(time, R, animate) {
  const room = { morning: "#6a5866", golden: "#5e4a42", night: "#2f2636" }[time];
  const t = c => mix(c, room, time === "night" ? .55 : .35);
  const red = t("#c8505a"), redDk = t("#9c3b4a");
  const beamCol = { morning: "#fff6e0", golden: "#ffd9a0", night: "#d8e4ff" }[time];
  const beam = `<path d="M368 34 L0 160 L0 300 Z" fill="${beamCol}" opacity="${time === "night" ? .12 : .1}"/><rect x="352" y="22" width="26" height="20" rx="3" fill="${mix(room, "#000000", .3)}"/><circle cx="366" cy="32" r="5" fill="${beamCol}" opacity=".9"/>
    <g fill="${beamCol}" opacity=".5">${Array.from({ length: 10 }, () => { const u = R(); return `<circle cx="${f(368 - u * 340)}" cy="${f(34 + u * 140 + (R() - .5) * 60 * u)}" r="${f(.6 + R() * .8)}"/>`; }).join("")}</g>`;
  const exit = `<g transform="translate(36 40)"><rect x="-22" y="-12" width="44" height="24" rx="3" fill="#5fae7a" opacity=".9"/><circle cx="-6" cy="-5" r="2.6" fill="#f2fbf4"/><path d="M-6 -2 l2 7 l-5 6 M-4 1 l6 3 M-3 5 l6 5 M-6 0 l-6 2" stroke="#f2fbf4" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M8 -6 h8 v12 h-8" stroke="#f2fbf4" stroke-width="1.6" fill="none"/></g>`;
  const rowSeats = (y, s) => Array.from({ length: 9 }, (_, i) => `<path d="M${f(i * 46 - 10)} ${y} v${f(-30 * s)} q0 ${f(-10 * s)} ${f(10 * s)} ${f(-10 * s)} h${f(22 * s)} q${f(10 * s)} 0 ${f(10 * s)} ${f(10 * s)} v${f(30 * s)}z" fill="${t("#a8434e")}"/>`).join("");
  const sconces = [70, 330].map(x => `${glow(x, 120, 30, time === "night" ? .12 : .2, "#f6c870")}<path d="M${x - 9} 112 h18 l-4 14 h-10z" fill="${t("#d9b98a")}"/>`).join("");
  const back = `<rect width="400" height="500" fill="${room}"/><g stroke="${mix(room, "#000000", .15)}" stroke-width="10" opacity=".5">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 48 + 12} 0 V300"/>`).join("")}</g>
    ${sconces}${beam}${exit}<rect y="290" width="400" height="210" fill="${mix(room, "#000000", .2)}"/>${rowSeats(330, .9)}<rect y="330" width="400" height="12" fill="${mix(room, "#000000", .3)}"/>
    <rect y="446" width="400" height="54" fill="${t("#6a3a44")}"/><g fill="${t("#fdf3c8")}">${[[30, 486], [52, 494], [340, 490], [372, 482], [250, 496]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2"/>`).join("")}</g>`;
  const popcorn = `<g transform="translate(378 322)"><path d="M-12 -14 h24 l-3 26 h-18z" fill="#f6efe2"/><path d="M-8 -14 v26 M0 -14 v26 M8 -14 v26" stroke="#d9574a" stroke-width="3"/><g fill="#fdf3c8">${[[-8, -18], [-2, -21], [4, -19], [9, -16], [-11, -14], [1, -15]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join("")}</g></g>`;
  const seat = `<path d="M40 470 V220 Q40 176 96 176 H304 Q360 176 360 220 V470z" fill="${red}"/><path d="M40 220 Q40 176 96 176 H304 Q360 176 360 220" fill="none" stroke="${redDk}" stroke-width="5"/>
    <g stroke="${redDk}" stroke-width="1.2" opacity=".5">${Array.from({ length: 7 }, (_, i) => `<path d="M${76 + i * 42} 190 V460"/>`).join("")}</g>
    <rect x="24" y="452" width="352" height="28" rx="8" fill="${redDk}"/><rect x="6" y="338" width="50" height="14" rx="6" fill="${t("#4a3a42")}"/><rect x="344" y="338" width="50" height="14" rx="6" fill="${t("#4a3a42")}"/><rect x="14" y="352" width="34" height="120" fill="${t("#3c2f36")}"/><rect x="352" y="352" width="34" height="120" fill="${t("#3c2f36")}"/>${popcorn}`;
  return { back, seat, front: "", wall: room };
}
