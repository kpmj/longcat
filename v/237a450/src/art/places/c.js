/* Places 9-12: back of the bus, art museum, rainy rooftop, ski lift. Same shape as places/a.js. */
import { f } from "../util.js";
import { tone, SKY, celestial, puff, glow, windowPane, mix, lit, rain, snow, WARM } from "./common.js";

export function bus(time, R, animate) {
  const t = c => tone(c, time), night = lit(time);
  const wall = t("#e7e3d8"), frame = t("#b9b4a8"), pole = t("#e0b04a");
  const S = SKY[time];
  const road = `<rect x="20" y="40" width="360" height="160" fill="${S.top}"/>${celestial(time, R, { x: 320, y: 70, stars: 4, starH: 50, sky: S.top, mx: 90 })}
    <path d="M20 130 H380 V200 H20z" fill="${t("#b9c4a8")}"/><g fill="${t("#9fb090")}"><circle cx="60" cy="128" r="16"/><circle cx="96" cy="124" r="12"/><circle cx="330" cy="126" r="15"/></g>
    <path d="M150 200 L196 130 H204 L250 200z" fill="${t("#8f8a84")}"/><path d="M200 140 v8 M200 160 v12 M200 184 v14" stroke="${night ? "#d9d0a0" : "#f6efe2"}" stroke-width="2.4"/>
    ${night ? `${glow(186, 160, 14, .5, "#fbe7b0")}${glow(214, 160, 14, .5, "#fbe7b0")}<circle cx="186" cy="160" r="3" fill="#fbe7b0"/><circle cx="214" cy="160" r="3" fill="#fbe7b0"/>` : `<rect x="186" y="150" width="28" height="16" rx="4" fill="${t("#7fa3b8")}"/>`}`;
  const ads = [[24, "#e9a0a8"], [104, "#a9c7d8"], [184, "#f4d08a"], [264, "#b9d3b0"], [344, "#c9b4d8"]].map(([x, c]) => `<rect x="${x}" y="8" width="70" height="20" rx="3" fill="${t(c)}"/><rect x="${x + 8}" y="14" width="${30 + (x % 3) * 6}" height="3" rx="1.5" fill="${t("#ffffff")}" opacity=".8"/><rect x="${x + 8}" y="20" width="22" height="3" rx="1.5" fill="${t("#ffffff")}" opacity=".6"/>`).join("");
  const back = `<rect width="400" height="500" fill="${wall}"/><rect width="400" height="34" fill="${t("#d8d3c6")}"/>${ads}
    <rect x="14" y="36" width="372" height="170" rx="18" fill="${frame}"/><svg x="20" y="42" width="360" height="158" viewBox="20 42 360 158">${road}</svg><rect x="20" y="42" width="360" height="158" rx="14" fill="none" stroke="${frame}" stroke-width="6"/>
    <rect y="440" width="400" height="60" fill="${t("#9a958c")}"/><g stroke="${t("#8a857c")}" stroke-width="2">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 46 + 8} 452 l18 40"/>`).join("")}</g>
    <path d="M18 0 V470 M382 0 V470" stroke="${pole}" stroke-width="8" stroke-linecap="round"/><g transform="translate(382 262)"><rect x="-9" y="-12" width="18" height="24" rx="4" fill="${t("#f6efe2")}"/><circle r="5.5" fill="#d9574a"/></g>`;
  const fabric = t("#93b3bf"), fabricDk = t("#7d9eab");
  const dots = Array.from({ length: 26 }, (_, i) => `<circle cx="${10 + (i % 13) * 30 + (Math.floor(i / 13) % 2) * 15}" cy="${232 + Math.floor(i / 13) * 34}" r="3" fill="${t("#e0b04a")}" opacity=".7"/>`).join("");
  const seat = `<rect x="0" y="212" width="400" height="250" fill="${fabric}"/>${dots}<rect x="0" y="206" width="400" height="10" rx="4" fill="${fabricDk}"/><rect x="0" y="452" width="400" height="30" rx="6" fill="${fabricDk}"/><path d="M18 212 V470 M382 212 V470" stroke="${pole}" stroke-width="8"/>`;
  return { back, seat, front: "", wall };
}

export function museum(time, R, animate) {
  const t = c => tone(c, time), night = lit(time);
  const wall = t("#f0ece4"), floor = t("#d8c3a2"), frame = t("#8b6a4a");
  const spot = (x, y2) => `<path d="M${x - 6} 18 L${x - 44} ${y2} H${x + 44} L${x + 6} 18z" fill="${night ? "#fbe7b0" : "#ffffff"}" opacity="${night ? .18 : .22}"/><rect x="${x - 7}" y="10" width="14" height="12" rx="3" fill="${t("#5a5550")}"/>`;
  const paintL = `<g transform="translate(10 52)"><rect width="78" height="96" fill="${frame}"/><rect x="6" y="6" width="66" height="84" fill="${t("#cfdcc6")}"/><path d="M6 60 q16 -18 30 -6 q14 -14 36 4 V90 H6z" fill="${t("#9db38f")}"/><circle cx="52" cy="26" r="8" fill="${t("#f0b45a")}"/></g>`;
  const paintR = `<g transform="translate(312 46)"><rect width="80" height="104" fill="${frame}"/><rect x="6" y="6" width="68" height="92" fill="${t("#f3e6d0")}"/><rect x="14" y="16" width="26" height="30" fill="${t("#d9574a")}" opacity=".8"/><circle cx="54" cy="58" r="14" fill="${t("#5f7a99")}" opacity=".8"/><rect x="18" y="66" width="20" height="22" fill="${t("#e0b04a")}" opacity=".8"/></g>`;
  const plaque = `<g transform="translate(366 300)"><rect x="-22" y="-12" width="44" height="26" rx="2" fill="${t("#fbf8f2")}" stroke="${t("#d9ccb0")}"/><path d="M-16 -4 h26 M-16 2 h32 M-16 8 h20" stroke="${t("#a59c8a")}" stroke-width="2"/></g>`;
  const stanchion = x => `<g transform="translate(${x} 0)"><rect x="-3" y="404" width="6" height="62" fill="${t("#9a8a6a")}"/><circle cy="402" r="6" fill="${t("#9a8a6a")}"/><ellipse cy="468" rx="12" ry="4" fill="${t("#9a8a6a")}"/></g>`;
  const back = `<rect width="400" height="500" fill="${wall}"/><rect y="0" width="400" height="10" fill="${t("#e2ddd2")}"/><path d="M0 30 H400" stroke="${t("#d9d2c2")}" stroke-width="2"/>
    ${spot(50, 160)}${spot(352, 160)}${spot(200, 120)}${paintL}${paintR}${plaque}<rect y="440" width="400" height="60" fill="${floor}"/><g stroke="${t("#c8b290")}" stroke-width="1.2">${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${450 + i * 9} H400"/>`).join("")}</g>
    <path d="M12 412 Q60 440 100 420 M300 420 Q340 440 388 412" stroke="${t("#a8434e")}" stroke-width="4" fill="none"/>${stanchion(12)}${stanchion(388)}`;
  const wood = t("#a8835a"), woodDk = t("#8b6a4a");
  const seat = `<rect x="26" y="450" width="348" height="16" rx="4" fill="${wood}"/><rect x="26" y="463" width="348" height="5" fill="${woodDk}"/><rect x="44" y="466" width="12" height="30" fill="${woodDk}"/><rect x="344" y="466" width="12" height="30" fill="${woodDk}"/>`;
  return { back, seat, front: "", wall };
}

export function rooftop(time, R, animate) {
  const t = c => tone(c, time), night = lit(time);
  const sky = { morning: "#d6dde2", golden: "#e9cfa8", night: "#27324a" }[time];
  const city = t("#bcc6cc"), city2 = t("#a9b5bc"), tile = t("#6f7f8c"), tileDk = t("#5b6a76"), parapet = t("#c5bcae");
  const blds = [[0, 150, 60], [56, 120, 44], [96, 170, 70], [262, 140, 50], [308, 110, 46], [350, 160, 50]];
  const windows = blds.map(([x, y, w]) => Array.from({ length: 6 }, (_, i) => { const lit_ = night ? R() > .45 : R() > .85; return `<rect x="${x + 6 + (i % 3) * (w / 3 - 2)}" y="${y + 10 + Math.floor(i / 3) * 22}" width="${w / 3 - 8}" height="10" fill="${lit_ ? (night ? "#f3d9a0" : t("#e9e2d2")) : city2}" opacity=".9"/>`; }).join("")).join("");
  const eaves = `<path d="M0 0 H400 V40 Q300 52 200 46 Q100 52 0 40z" fill="${tile}"/><g stroke="${tileDk}" stroke-width="2">${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 21 + 4} 0 V${44 - Math.abs(i - 9.5) * .5}"/>`).join("")}</g><g fill="${t("#9ab2c4")}" opacity=".8">${[30, 92, 160, 248, 318, 376].map((x, i) => `<ellipse cx="${x}" cy="${52 + (i % 3) * 14}" rx="1.8" ry="3"/>`).join("")}</g>`;
  const tank = `<g transform="translate(40 190)"><rect x="-26" y="-34" width="52" height="40" rx="6" fill="${t("#c4ccd2")}"/><path d="M-26 -22 h52 M-26 -10 h52" stroke="${t("#a9b5bc")}" stroke-width="2"/><path d="M-20 6 l-4 56 M20 6 l4 56 M-22 34 h44" stroke="${t("#8a959c")}" stroke-width="3"/></g>`;
  const antenna = `<path d="M352 100 V200 M338 118 h28 M342 134 h20" stroke="${t("#7d878e")}" stroke-width="2.4"/>`;
  const pigeon = `<g transform="translate(372 300)"><ellipse cx="0" cy="-8" rx="11" ry="7.5" fill="${t("#8d94a3")}"/><circle cx="9" cy="-15" r="5" fill="${t("#6f7686")}"/><path d="M13.5 -15 l5 1.6 -5 1.6z" fill="#e9a23b"/><circle cx="10.5" cy="-16.2" r="1.1" fill="#ffffff"/><path d="M-3 -1 v3 M3 -1 v3" stroke="#e9a23b" stroke-width="1.6"/></g>`;
  const plant = `<g transform="translate(24 470)"><path d="M-12 -18 h24 l-3 18 h-18z" fill="${t("#c4825a")}"/><path d="M0 -18 q-12 -16 -4 -30 M0 -18 q4 -20 14 -26 M0 -18 q-4 -12 -14 -14" stroke="${t("#6b8a6a")}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
  const back = `<rect width="400" height="500" fill="${sky}"/>${time === "golden" ? `<circle cx="300" cy="120" r="40" fill="#fff0cc" opacity=".45"/>` : ""}
    ${blds.map(([x, y, w], i) => `<rect x="${x}" y="${y}" width="${w}" height="${320 - y}" fill="${i % 2 ? city : city2}"/>`).join("")}${windows}${antenna}
    ${rain(R, 70, night ? "#8fa4c0" : "#8a9fb0", .55, [0, 40, 400, 400])}
    <rect y="296" width="400" height="34" fill="${parapet}"/><rect y="292" width="400" height="6" fill="${t("#d6cebf")}"/>${tank}${pigeon}
    <rect y="330" width="400" height="170" fill="${t("#b7b3ab")}"/><g fill="${t("#a5b6c4")}" opacity=".7"><ellipse cx="70" cy="486" rx="40" ry="6"/><ellipse cx="320" cy="478" rx="34" ry="5"/></g>
    <g stroke="${t("#d8e2ea")}" stroke-width="1.2" fill="none" opacity=".8"><ellipse cx="60" cy="486" rx="8" ry="2"/><ellipse cx="330" cy="478" rx="6" ry="1.6"/></g>${plant}${eaves}`;
  const wood = t("#c8a172"), woodDk = t("#9b7550");
  const seat = `<rect x="70" y="446" width="260" height="54" fill="${wood}"/><g stroke="${woodDk}" stroke-width="2.5"><path d="M70 464 H330 M70 482 H330 M70 446 V500 M330 446 V500 M76 450 L324 496"/></g>`;
  return { back, seat, front: "", wall: sky };
}

export function skilift(time, R, animate) {
  const t = c => tone(c, time), night = lit(time);
  const sky = { morning: "#e3ecf2", golden: "#f3d3a4", night: "#26314a" }[time];
  const snowC = night ? "#c9d6e6" : "#ffffff", shade = t("#c9d8e6"), pine = t("#7e9a8e");
  const mtn = `<path d="M0 230 L70 120 L120 170 L190 80 L260 170 L320 110 L400 200 V320 H0z" fill="${shade}"/><path d="M70 120 L52 148 L66 142 L80 150 L92 136z M190 80 L168 112 L184 104 L198 114 L212 102z M320 110 L304 132 L318 128 L330 134z" fill="${snowC}"/>`;
  const tree = (x, y, s) => `<path d="M${x} ${y - 70 * s} L${x - 22 * s} ${y - 30 * s} H${x - 12 * s} L${x - 28 * s} ${y} H${x + 28 * s} L${x + 12 * s} ${y - 30 * s} H${x + 22 * s}z" fill="${pine}"/><path d="M${x} ${y - 70 * s} L${x - 10 * s} ${y - 52 * s} H${x + 10 * s}z M${x - 16 * s} ${y - 30 * s} h${32 * s} l-3 4 h${-26 * s}z" fill="${snowC}"/>`;
  const back = `<rect width="400" height="500" fill="${sky}"/>${celestial(time, R, { x: 330, y: time === "golden" ? 130 : 80, sky, mx: 80, stars: 12 })}${mtn}
    <rect y="300" width="400" height="200" fill="${snowC}"/><path d="M0 320 q100 -20 200 0 t200 0 V500 H0z" fill="${t("#eef3f7")}"/>
    ${tree(30, 300, 1.1)}${tree(372, 296, 1.2)}${tree(90, 312, .6)}${tree(320, 314, .6)}
    <path d="M0 2 L400 10" stroke="${t("#4a5a6b")}" stroke-width="2.4"/>${snow(R, 40, night ? .7 : .9, [0, 0, 400, 460])}`;
  /* the cabin: a roof above the yuzu, two posts at the sides, a bench and a floor. No bar across the lap */
  const red = t("#d9574a"), redDk = t("#b4432f"), metal = t("#7d878e");
  const bell = `<g transform="translate(254 14)"><path d="M-6 4 q0 -10 6 -10 q6 0 6 10z" fill="${t("#e0b04a")}"/><circle cy="5" r="1.6" fill="${t("#9b7550")}"/></g>`;
  const seat = `<path d="M200 0 V12" stroke="${metal}" stroke-width="5"/>${bell}<path d="M8 30 Q200 4 392 30 L384 40 Q200 16 16 40z" fill="${red}"/><path d="M16 40 Q200 16 384 40" stroke="${redDk}" stroke-width="3" fill="none"/>
    <rect x="14" y="36" width="16" height="444" rx="4" fill="${red}"/><rect x="370" y="36" width="16" height="444" rx="4" fill="${red}"/>
    <rect x="30" y="200" width="340" height="258" rx="10" fill="${t("#cfd8e0")}" opacity=".9"/><rect x="24" y="450" width="352" height="20" rx="6" fill="${t("#8a6a52")}"/><rect x="10" y="474" width="380" height="14" rx="4" fill="${redDk}"/>`;
  return { back, seat, front: "", wall: sky };
}
