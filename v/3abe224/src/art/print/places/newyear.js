/* The New Year special month in the woodblock style: a string of paper diamonds, two red lanterns and a plum-blossom
   diamond. Fixed decoration, never earned. Everything hangs between the round window (left) and the title (right),
   so it covers neither. Animated: the lanterns sway a little. */
import { f } from "../../util.js";

const KEY = "#262122", RED = "#bf452d", GOLD = "#ebb229", PAPER = "#efe6d2";
const k = (w) => `stroke="${KEY}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const blossom = (x, y, r = 4.2) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${f(Math.sin(a * Math.PI / 180) * r)}" cy="${f(-Math.cos(a * Math.PI / 180) * r)}" r="${f(r * .78)}" fill="${GOLD}" ${k(.9)}/>`).join("")}<circle r="${f(r * .55)}" fill="${RED}"/></g>`;
export function newYear(time, R, animate) {
  const lantern = (x, y, s, d) => `<g transform="translate(${x} ${y}) scale(${s})"><g${animate ? ` class="lc-sway" style="animation-delay:${-d}s"` : ""}><path d="M0 -30V-15" fill="none" ${k(1.6)}/>${time === "night" ? `<circle cy="6" r="27" fill="${GOLD}" opacity=".22"/>` : ""}<ellipse cy="6" rx="15" ry="18" fill="${RED}" ${k(2)}/><path d="M-7 -10q-5 16 0 32M7 -10q5 16 0 32M0 -12V24" fill="none" ${k(1)} opacity=".55"/><rect x="-8" y="-15" width="16" height="5" fill="${GOLD}" ${k(1.5)}/><rect x="-8" y="22" width="16" height="5" fill="${GOLD}" ${k(1.5)}/><path d="M-3 27v10M0 27v12M3 27v10" fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round"/></g></g>`;
  const knots = Array.from({ length: 7 }, (_, i) => { const x = 128 + i * 24, y = 16 + Math.sin((i + .5) / 7 * Math.PI) * 9; return `<path d="M${f(x)} ${f(y)}l-5 7l5 7l5 -7z" fill="${i % 2 ? GOLD : RED}" ${k(1.3)}/>`; }).join("");
  const spring = `<g transform="translate(200 40)"><rect x="-12" y="-12" width="24" height="24" transform="rotate(45)" fill="${RED}" ${k(2)}/><rect x="-8.500" y="-8.500" width="17" height="17" transform="rotate(45)" fill="none" stroke="${GOLD}" stroke-width="1.2"/>${blossom(0, 0)}</g>`;
  return `<path d="M112 12Q200 34 300 12" fill="none" ${k(1.4)}/>${knots}${lantern(118, 44, .8, 0)}${lantern(296, 44, .8, 1.6)}${spring}`;
}
