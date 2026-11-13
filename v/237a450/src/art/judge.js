/* The judge: a seated capybara with a yuzu on its head. The body never changes; only the face does.
   Head space: the head's centre is (0 0), the head is a 104 x 84 rounded box. In the scene the head sits at
   figure (0 -44) and the figure is drawn at translate(200 270) scale(2). */
import { f } from "./util.js";
import { K } from "./palettes.js";

export const FACES = ["neutral", "chew", "chew-orange", "yawn", "look-down", "ear-flick", "brow", "slow-blink", "nostrils",
  "head-tilt", "smirk", "slow-clap", "tear", "nod", "score10", "applause", "content-sleep", "pleased", "hmm", "oops"];

export function pose(face) {
  const p = { eyes: "open", pupil: null, lid: false, brow: false, nostril: 1, mouth: "flat", chew: false, flick: false, tilt: false,
    nod: false, down: false, paws: null, tear: false, zz: false,
    blush: false, sparkle: false, sweat: false, brows: false };
  switch (face) {
    case "chew": p.chew = true; break;
    case "chew-orange": p.chew = true; p.pupil = [[2, -2.4], [-.6, -2.8]]; break;
    case "yawn": p.eyes = "shut"; p.mouth = "yawn"; break;
    case "look-down": p.pupil = [[.6, 2.2], [-.6, 2.2]]; p.lid = true; p.down = true; p.brow = true; break;
    case "ear-flick": p.flick = true; break;
    case "brow": p.brow = true; break;
    case "slow-blink": p.eyes = "shut"; break;
    case "nostrils": p.nostril = 1.55; break;
    case "head-tilt": p.tilt = true; break;
    case "smirk": p.mouth = "smirk"; p.eyes = "smirk"; break;
    case "slow-clap": p.paws = "clap"; break;
    case "tear": p.tear = true; break;
    case "nod": p.nod = true; p.eyes = "half"; p.mouth = "smile"; p.ticks = true; break;
    case "score10": p.paws = "card"; break;
    case "applause": p.paws = "applause"; p.mouth = "smile"; break;
    /* the three faces for a note, made to be told apart at a glance (2026-11-13):
       on the note = happy arched eyes, open smile, sparkles; close = one brow up, eyes aside, wavy mouth;
       off = wide eyes, both brows up, a small "o", a sweat drop */
    case "pleased": p.eyes = "happy"; p.mouth = "grin"; p.blush = true; p.sparkle = true; break;
    case "hmm": p.brow = true; p.pupil = [[2.2, -1.4], [2.2, -1.4]]; p.mouth = "wavy"; p.tilt = true; break;
    case "oops": p.eyes = "wide"; p.mouth = "o"; p.sweat = true; p.brows = true; break;
    case "content-sleep": p.eyes = "shut"; p.mouth = "smile"; p.nod = true; p.zz = true; break;
  }
  return p;
}

const ear = (x, flick) => `<g transform="translate(${x} -42)${flick ? " rotate(-30)" : ""}"><ellipse rx="11" ry="12" fill="${K.furDk}"/><ellipse cy="1" rx="5.5" ry="7" fill="${K.muzzle}" opacity=".75"/></g>`;
function eye(side, p) {
  const em = p.eyes === "smirk" ? (side === 1 ? "half" : "open") : p.eyes;
  let inner;
  if (em === "shut") inner = `<path d="M-5 0 q5 3.6 10 0" stroke="${K.ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  else if (em === "happy") inner = `<path d="M-6.5 2 q6.5 -8.5 13 0" stroke="${K.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if (em === "wide") inner = `<circle r="6.2" fill="#fffdf6" stroke="${K.ink}" stroke-width="1.2"/><circle r="2.5" fill="${K.ink}"/>`;
  else if (em === "half") inner = `<path d="M-5 -.5 q5 3 10 0" stroke="${K.ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  else {
    const o = p.pupil ? p.pupil[side === -1 ? 0 : 1] : [0, 0];
    inner = `<circle cx="${o[0]}" cy="${o[1]}" r="3.4" fill="${K.ink}"/><circle cx="${f(o[0] - 1.2)}" cy="${f(o[1] - 1.2)}" r="1" fill="#fff" opacity=".85"/>${p.lid ? `<path d="M-5.5 -2.6 q5.5 -2.4 11 0" stroke="${K.furDk}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : ""}`;
  }
  return `<g transform="translate(${side * 32} -14)">${inner}</g>`;
}
const yuzu = `<g transform="translate(14 -54)"><circle r="12" fill="${K.orange}"/><circle cx="-3.5" cy="-3.5" r="3" fill="${K.orangeLt}" opacity=".8"/><circle cy="-11" r="1.6" fill="${K.furDk}"/><path d="M2 -11 q7 -7 13 -2 q-7 5 -13 2z" fill="${K.leaf}"/></g>`;

/* the head in head space. o.animate adds the blink class to open eyes */
export function judgeHead(face, o = {}) {
  const p = typeof face === "object" && face ? face : pose(face);
  const open = p.eyes === "open" || p.eyes === "smirk";
  const eyes = `<g${o.animate && open ? ` class="lc-blink"` : ""}>${eye(-1, p)}${eye(1, p)}</g>`;
  const mouth = p.mouth === "yawn" ? `<ellipse cy="25" rx="9" ry="8.5" fill="#5a2e2a"/><ellipse cy="30.5" rx="5" ry="3" fill="#d98a8a"/>`
    : p.mouth === "smirk" ? `<path d="M-8 24 q8 3 16 -5" stroke="${K.ink}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`
    : p.mouth === "grin" ? `<path d="M-10 20.5 q10 12 20 0z" fill="#5a2e2a" stroke="${K.ink}" stroke-width="1.6" stroke-linejoin="round"/><path d="M-5 26 q5 3.4 10 0" stroke="#d98a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : p.mouth === "wavy" ? `<path d="M-9 24 q3 -3.4 6 0 t6 0 t6 0" stroke="${K.ink}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`
    : p.mouth === "o" ? `<ellipse cy="25" rx="4.6" ry="5.4" fill="#5a2e2a"/>`
    : p.mouth === "smile" ? `<path d="M-8 22 q8 6 16 0" stroke="${K.ink}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`
    : `<path d="M-7 23.5 q7 2 14 0" stroke="${K.ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const brow = p.brow ? `<path d="M25 -30 q7 -5 14 0" stroke="${K.brown}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : "";
  const browL = p.brows ? `<path d="M-39 -31 q7 -5 14 0" stroke="${K.brown}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M25 -31 q7 -5 14 0" stroke="${K.brown}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : "";
  const blush = p.blush ? `<ellipse cx="-42" cy="0" rx="7" ry="4.4" fill="#f08f86" opacity=".55"/><ellipse cx="42" cy="0" rx="7" ry="4.4" fill="#f08f86" opacity=".55"/>` : "";
  const sweat = p.sweat ? `<path d="M45 -37 q-5.5 7.5 0 12.5 q5.5 -5 0 -12.5z" fill="${K.tear}" stroke="#fffdf6" stroke-width=".8"/>` : "";
  const star = (x, y, r) => `<path d="M${x} ${y - r} l${r * .3} ${r * .7} l${r * .7} ${r * .3} l${-r * .7} ${r * .3} l${-r * .3} ${r * .7} l${-r * .3} ${-r * .7} l${-r * .7} ${-r * .3} l${r * .7} ${-r * .3}z" fill="#f4b93c" stroke="#fffdf6" stroke-width=".8"/>`;
  const sparkle = p.sparkle ? star(-64, -30, 8) + star(66, -22, 6) + star(58, -46, 4.5) : "";
  const tear = p.tear ? `<path d="M-33 -1 q-4.5 6 0 10.5 q4.5 -4.5 0 -10.5z" fill="${K.tear}"/>` : "";
  const nostrils = `<g${p.nostril !== 1 ? ` transform="scale(${p.nostril} ${p.nostril})"` : ""}><ellipse cx="-7" cy="1.5" rx="3" ry="1.8" fill="${K.nostril}"/><ellipse cx="7" cy="1.5" rx="3" ry="1.8" fill="${K.nostril}"/></g>`;
  const muzzle = `<g${p.chew ? ` transform="translate(2 1.5) rotate(3)"` : ""}><rect x="-36" y="-4" width="72" height="40" rx="20" fill="${K.muzzle}"/><g transform="translate(0 4)"><path d="M-16 -2 Q0 -9 16 -2 Q16 8 0 9.5 Q-16 8 -16 -2Z" fill="${K.brown}"/>${nostrils}</g><g fill="${K.furDk}" opacity=".55"><circle cx="-25" cy="15" r="1.3"/><circle cx="-21" cy="22" r="1.3"/><circle cx="-28" cy="23" r="1.3"/><circle cx="25" cy="15" r="1.3"/><circle cx="21" cy="22" r="1.3"/><circle cx="28" cy="23" r="1.3"/></g>${mouth}${p.chew ? `<path d="M30 20 q4 2 3 6" stroke="${K.furDk}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>` : ""}</g>`;
  const tf = p.tilt ? "rotate(-9 0 34)" : p.nod ? "translate(0 6)" : p.down ? "translate(0 5)" : "";
  const ticks = p.ticks ? `<path d="M60 -30 v12 M56 -22 l4 4 l4 -4 M-60 -30 v12 M-64 -22 l4 4 l4 -4" stroke="${K.mute}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>` : "";
  return `<g${tf ? ` transform="${tf}"` : ""}>${ear(-38, p.flick)}${ear(38, false)}<rect x="-52" y="-42" width="104" height="84" rx="30" fill="${K.fur}"/>${yuzu}${eyes}${brow}${browL}${blush}${muzzle}${tear}${sweat}</g>${ticks}${sparkle}`;
}
export const zzMarkup = (x, y, ink = K.mute, size = 13) => `<text x="${f(x)}" y="${f(y)}" font-family="Nunito, Helvetica Neue, Arial, PingFang TC, sans-serif" font-weight="700" font-size="${f(size)}" fill="${ink}">z</text><text x="${f(x + size * .75)}" y="${f(y - size * .9)}" font-family="Nunito, Helvetica Neue, Arial, PingFang TC, sans-serif" font-weight="700" font-size="${f(size * .77)}" fill="${ink}">z</text>`;

const paw = (x, y, rot = 0) => `<g transform="translate(${f(x)} ${f(y)})${rot ? ` rotate(${rot})` : ""}"><ellipse rx="12" ry="8.5" fill="${K.fur}" stroke="${K.furDk}" stroke-width=".8"/><path d="M-6 -7 v5 M0 -8 v5 M6 -7 v5" stroke="${K.furDk}" stroke-width="1.6" stroke-linecap="round"/></g>`;
const card10 = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) rotate(7) scale(${s})"><rect x="-20" y="-56" width="40" height="50" rx="4" fill="${K.card}" stroke="${K.woodDk}" stroke-width="2"/><text y="-22" text-anchor="middle" font-family="Nunito, Helvetica Neue, Arial, PingFang TC, sans-serif" font-weight="700" font-size="24" fill="${K.brown}">10</text></g>`;
const motion = (x, y, dir) => `<path d="M${f(x + 16 * dir)} ${f(y - 10)} q${f(6 * dir)} 10 0 20 M${f(x + 22 * dir)} ${f(y - 14)} q${f(8 * dir)} 14 0 28" stroke="${K.mute}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`;

/* paws in figure space (head centre at (0 -44)); never over the mouth */
export function pawsFigure(p) {
  if (p.paws === "clap") return paw(-13, 6, -12) + paw(13, 6, 12) + motion(0, 2, 1) + motion(0, 2, -1);
  if (p.paws === "applause") return paw(-64, -26, -20) + paw(64, -26, 20) + motion(-64, -26, -1) + motion(64, -26, 1);
  if (p.paws === "card") return card10(64, -32) + paw(64, -30);
  return "";
}
/* paws in head space, for the face icon */
export function pawsIcon(p) {
  if (p.paws === "clap") return paw(-13, 52, -12) + paw(13, 52, 12) + motion(0, 50, 1) + motion(0, 50, -1);
  if (p.paws === "applause") return paw(-50, 36, -20) + paw(50, 36, 20) + `<path d="M-50 16 v-8 M-60 20 l-5 -6 M-40 20 l5 -6 M50 16 v-8 M40 20 l-5 -6 M60 20 l5 -6" stroke="${K.mute}" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>`;
  if (p.paws === "card") return card10(54, 20, .8) + paw(54, 22);
  return "";
}

/* the seated judge in scene space (400 x 500). returns the layers so garments can sit between body and paws */
export function judgeFigure(face, o = {}) {
  const p = pose(face);
  const body = `<g transform="translate(200 270) scale(2)"><path d="M-80 54 V10 Q-80 -28 -40 -28 H40 Q80 -28 80 10 V54 Q80 76 58 76 H-58 Q-80 76 -80 54Z" fill="${K.fur}"/><ellipse cy="16" rx="34" ry="30" fill="${K.muzzle}" opacity=".5"/></g>`;
  const lap = `<rect x="43" y="404" width="314" height="56" rx="28" fill="${K.fur}" stroke="${K.furDk}" stroke-width="1.5"/><path d="M200 414 v38" stroke="${K.furDk}" stroke-width="2" stroke-linecap="round" opacity=".45"/>`;
  const feet = [150, 250].map(x => `<g transform="translate(${x} 462)"><ellipse rx="25" ry="10" fill="${K.furDk}"/><path d="M-9 -2 v6 M0 -3 v7 M9 -2 v6" stroke="${K.fur}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></g>`).join("");
  const head = `<g transform="translate(200 182) scale(2)">${judgeHead(p, o)}${p.zz ? zzMarkup(54, -36, o.ink || K.mute) : ""}</g>`;
  const paws = p.paws ? `<g transform="translate(200 270) scale(2)">${pawsFigure(p)}</g>` : "";
  return { body, lap, feet, head, paws };
}
