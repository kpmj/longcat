/* Shared backdrop pieces. Rule: the background is two steps lighter (or, at night, two steps quieter) than the
   characters, so the judge and the cats always read first. Lamps light up at night because it is night, not as a reward. */
import { f } from "../util.js";

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => "#" + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };

/* one designed colour, moved to the light of the time of day */
export const tone = (c, time) => (time === "golden" ? mix(c, "#f2b46a", .26) : time === "night" ? mix(c, "#26314a", .7) : c);
export const SKY = {
  morning: { top: "#ecdccb", low: "#f6ede1", haze: "#fbf4ea", sun: "#f8ddb0" },
  golden: { top: "#f6cf8f", low: "#fbe2b4", haze: "#fff0cc", sun: "#fff3c9" },
  night: { top: "#2a3549", low: "#3a4a62", haze: "#4b5b73", sun: "#f6ecd8" },
};
export const INK = { morning: "#4a3222", golden: "#4a3222", night: "#f6ecd8" };
export const lit = time => time === "night";
export const WARM = "#f6c870";

export const skyRect = (time, x = 0, y = 0, w = 400, h = 500) => {
  const S = SKY[time];
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S.top}"/><rect x="${x}" y="${f(y + h * .55)}" width="${w}" height="${f(h * .45)}" fill="${S.low}" opacity=".7"/>`;
};
/* sun in the morning (pale, high on one side), golden (low and warm with a haze), moon and stars at night */
export function celestial(time, R, o = {}) {
  const x = o.x == null ? 330 : o.x, y = o.y == null ? 70 : o.y;
  if (time === "night") {
    const stars = Array.from({ length: o.stars == null ? 9 : o.stars }, () => `<circle cx="${f(10 + R() * 380)}" cy="${f(10 + R() * (o.starH || 130))}" r="${f(.7 + R() * .8)}"/>`).join("");
    return `<g fill="#f6ecd8" opacity=".75">${stars}</g><circle cx="${x}" cy="${y}" r="17" fill="#f6ecd8"/><circle cx="${x - 8}" cy="${y - 5}" r="15" fill="${o.sky || SKY.night.top}"/>`;
  }
  if (time === "golden") return `<circle cx="${x}" cy="${y + 20}" r="52" fill="${SKY.golden.haze}" opacity=".35"/><circle cx="${x}" cy="${y + 20}" r="24" fill="${SKY.golden.sun}" opacity=".95"/>`;
  return `<circle cx="${o.mx == null ? 70 : o.mx}" cy="${y - 4}" r="22" fill="${SKY.morning.sun}" opacity=".85"/>`;
}
export const puff = (x, y, rx, ry, o, animate, color = "#ffffff") => `<ellipse${animate ? ` class="lc-steam"` : ""} cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${color}" opacity="${f(o * 100) / 100}"/>`;
export const glow = (x, y, r, o = .25, c = WARM) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" opacity="${o}"/>`;
/* rain and snow, seeded */
export function rain(R, n, color, o = .5, area = [0, 0, 400, 500]) {
  let d = "";
  for (let i = 0; i < n; i++) { const x = area[0] + R() * area[2], y = area[1] + R() * area[3]; d += `M${f(x)} ${f(y)} l-4 12 `; }
  return `<path d="${d}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" opacity="${o}"/>`;
}
export function snow(R, n, o = .85, area = [0, 0, 400, 500]) {
  return `<g fill="#ffffff" opacity="${o}">${Array.from({ length: n }, () => `<circle cx="${f(area[0] + R() * area[2])}" cy="${f(area[1] + R() * area[3])}" r="${f(1 + R() * 1.6)}"/>`).join("")}</g>`;
}
/* a window that shows the time of day. inner = extra scenery inside, already in scene coordinates */
export function windowPane(x, y, w, h, time, frame, inner = "", o = {}) {
  const S = SKY[time];
  const bars = o.bars === false ? "" : `<path d="M${f(x + w / 2)} ${y} V${y + h}${o.cross ? ` M${x} ${f(y + h / 2)} H${x + w}` : ""}" stroke="${frame}" stroke-width="${o.bar || 4}"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${S.top}"/><rect x="${x}" y="${f(y + h * .6)}" width="${w}" height="${f(h * .4)}" fill="${S.low}" opacity=".8"/>${inner}${bars}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${frame}" stroke-width="${o.stroke || 5}" rx="${o.rx || 2}"/>`;
}
/* a far hill line across the scene */
export const hills = (y, amp, color, seed = 0) => {
  let d = `M0 ${y}`;
  for (let x = 0; x < 400; x += 50) d += ` q25 ${f(-amp * (1 + ((x + seed) % 3) * .25))} 50 0`;
  return `<path d="${d} V500 H0z" fill="${color}"/>`;
};
/* the wood of planks and baskets, by time */
export const woodOf = time => (time === "night" ? ["#7a6650", "#5b4a39", "#a39478"] : time === "golden" ? ["#c4955f", "#94693f", "#f1dcb7"] : ["#c8a172", "#9b7550", "#f1e6cd"]);
