/* The New Year special month: red lanterns, a 春 diamond and a string of small knots. Fixed decoration, never earned. */
import { f } from "../util.js";
import { tone, glow } from "./common.js";

/* a five-petal plum blossom */
export const blossom = (x, y, petal, heart, r = 4.2) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${f(Math.sin(a * Math.PI / 180) * r)}" cy="${f(-Math.cos(a * Math.PI / 180) * r)}" r="${f(r * .78)}" fill="${petal}"/>`).join("")}<circle r="${f(r * .55)}" fill="${heart}"/></g>`;
export function newYear(time, R, animate) {
  const red = tone("#d9574a", time === "night" ? "golden" : time), dk = tone("#a8392c", time === "night" ? "golden" : time), gold = tone("#f0c35a", time === "night" ? "golden" : time);
  const lantern = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -26 V-14" stroke="${dk}" stroke-width="1.5"/>${time === "night" ? glow(0, 6, 28, .25) : ""}<ellipse cy="6" rx="17" ry="20" fill="${red}"/><path d="M-8 -12 q-6 18 0 36 M8 -12 q6 18 0 36 M0 -14 V26" stroke="${dk}" stroke-width="1" fill="none" opacity=".6"/><rect x="-9" y="-16" width="18" height="5" rx="1.5" fill="${gold}"/><rect x="-9" y="23" width="18" height="5" rx="1.5" fill="${gold}"/><path d="M-4 28 v12 M0 28 v14 M4 28 v12" stroke="${gold}" stroke-width="1.4"/></g>`;
  const knots = Array.from({ length: 9 }, (_, i) => { const x = 60 + i * 35, y = 14 + Math.sin(i / 8 * Math.PI) * 14; return `<path d="M${f(x)} ${f(y)} l-4 6 l4 6 l4 -6z" fill="${i % 2 ? gold : red}"/>`; }).join("");
  const spring = `<g transform="translate(200 26)"><rect x="-13" y="-13" width="26" height="26" transform="rotate(45)" fill="${red}" stroke="${gold}" stroke-width="1.5"/>${blossom(0, 0, gold, red)}</g>`;
  return `<path d="M40 8 Q200 44 360 8" stroke="${dk}" stroke-width="1.2" fill="none"/>${knots}${lantern(28, 40)}${lantern(372, 40)}${lantern(64, 58, .7)}${lantern(336, 58, .7)}${spring}`;
}
