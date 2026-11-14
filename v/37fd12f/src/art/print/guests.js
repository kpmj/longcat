/* The special-month guests in the woodblock style: dachshund (floppy ears), otter (flat tail), ferret (face mask),
   dragon (New Year). Same frame as the cat's head and the same tail anchor, so they ride the same paths.
   Same doors as ../guests.js: headFor and tailFor; cats go to ./cat.js. */
import { f } from "../util.js";
import { animalId } from "../palettes.js";
import { COATS, KEY, LWC, catHead, catTail, catTailTucked } from "./cat.js";

/* the guests' own colours, in the print's muted range; the dragon is seal red with a yuzu-yellow mane */
export const GUEST_PAL = {
  dachshund: { fur: "#5f4638", furDk: "#433027", stripe: "#2f221c", belly: "#c99a62", ink: KEY, nose: KEY, inner: "#b98656" },
  otter: { fur: "#b59a7c", furDk: "#94795c", stripe: "#75604a", belly: "#ead9bd", ink: KEY, nose: KEY, inner: "#d9c3a4" },
  ferret: { fur: "#e6d9bd", furDk: "#cbb994", stripe: "#8a7866", belly: "#f6eeda", ink: KEY, nose: "#a7605a", inner: "#dcb8a4", mask: "#7a6a58" },
  dragon: { fur: "#bf452d", furDk: "#96301f", stripe: "#7c2a22", belly: "#f1dfb8", ink: KEY, nose: KEY, inner: "#ebb229", mane: "#ebb229", horn: "#f1dfb8" },
  /* year two (2026-11-14): fox, red panda, rabbit and the carp streamer of May */
  fox: { fur: "#d98a3a", furDk: "#b86a26", stripe: "#7c4a22", belly: "#f6eedd", ink: KEY, nose: KEY, inner: "#3a2a22" },
  redpanda: { fur: "#b8562c", furDk: "#8f3f1e", stripe: "#e9c9a0", belly: "#3a2a22", ink: KEY, nose: KEY, inner: "#f6eedd" },
  rabbit: { fur: "#ece5d5", furDk: "#cfc5ae", stripe: "#b3a78c", belly: "#f8f4ea", ink: KEY, nose: "#a7605a", inner: "#dcb8a4" },
  carp: { fur: "#bf452d", furDk: "#96301f", stripe: "#f1dfb8", belly: "#f1dfb8", ink: KEY, nose: KEY, inner: "#f8f2e2" },
};
export const palFor = (animal, look) => (animalId(animal) === "cat" ? COATS[look && look.palette] || COATS.ginger : GUEST_PAL[animalId(animal)]);
const key = (w) => `stroke="${KEY}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`;
const ln = (d, w) => `<path d="${d}" fill="none" ${key(w)}/>`;
const pipe = (d, c, w, lw = LWC * .9) => `<path d="${d}" fill="none" stroke="${KEY}" stroke-width="${f(w + 2 * lw)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;

const both = m => `<g>${m}</g><g transform="scale(-1 1)">${m}</g>`;
/* a pair of ears that twitch out of step when animated */
const pair = (m, anim) => (anim == null ? both(m) : `<g class="lc-ear" style="animation-delay:${f(-anim)}s">${m}</g><g transform="scale(-1 1)"><g class="lc-ear" style="animation-delay:${f(-anim - 3.4)}s;animation-duration:9s">${m}</g></g>`);

function eyes(mood, y = -4) {
  const e = x => mood === "sleep" ? ln(`M${x - 4} ${y - 1}q4 4 8 0`, LWC * .8)
    : mood === "smug" || mood === "listen" ? ln(`M${x - 4} ${y + 1}q4 -5 8 0`, LWC * .8)
      : mood === "squint" ? ln(`M${x - 4} ${y}h8`, LWC * .9)
        : mood === "wide" ? `<circle cx="${x}" cy="${y}" r="4.4" fill="#f8f2e2" ${key(LWC * .55)}/><circle cx="${x}" cy="${y}" r="2" fill="${KEY}"/>`
          : `<circle cx="${x}" cy="${y}" r="2.5" fill="${KEY}"/>`;
  return e(-7) + e(7);
}
const mouth = (mood, y = 9) => (mood === "sing" || mood === "wide" ? `<ellipse cy="${y + 2}" rx="3" ry="3.8" fill="#7a3b33" ${key(LWC * .45)}/>`
  : mood === "squint" ? ln(`M-3.6 ${y + 1}h7.2`, LWC * .6) : ln(`M-4.4 ${y}q2.2 3 4.4 0q2.2 3 4.4 0`, LWC * .6));

export function critterHead(animal, x, y, dir, mood, sc = 1, pal, kind = "point", anim = null) {
  const a = animalId(animal);
  if (a === "cat") return catHead(x, y, dir, mood, sc, pal || COATS.ginger, kind, anim);
  pal = pal && pal.fur ? { ...GUEST_PAL[a], ...pal } : GUEST_PAL[a];
  const lw = LWC;
  let back = "", front = "", nose, my = 9, top = "", own = null;
  if (a === "dachshund") {
    front = `<ellipse cx="1" cy="7" rx="12" ry="8" fill="${pal.belly}"/><circle cx="-7" cy="-12" r="2.2" fill="${pal.belly}"/><circle cx="7" cy="-12" r="2.2" fill="${pal.belly}"/>`;
    nose = `<ellipse cx="1" cy="3.5" rx="3.8" ry="2.7" fill="${KEY}"/>`;
    /* the floppy ears hang over the sides of the head, so they go on top */
    const ear = `<path d="M-16 -15Q-30 -12 -27 6Q-25 14 -18 9Q-15 -2 -10 -12Z" fill="${pal.furDk}" ${key(lw)}/>`;
    top = anim == null ? `${ear}<g transform="scale(-1 1)">${ear}</g>` : `<g class="lc-ear" style="animation-delay:${f(-anim)}s;transform-origin:70% 0%">${ear}</g><g transform="scale(-1 1)"><g class="lc-ear" style="animation-delay:${f(-anim - 3)}s;transform-origin:70% 0%">${ear}</g></g>`;
  } else if (a === "otter") {
    back = `<circle cx="-16" cy="-14" r="4.6" fill="${pal.furDk}" ${key(lw)}/><circle cx="16" cy="-14" r="4.6" fill="${pal.furDk}" ${key(lw)}/>`;
    front = `<ellipse cy="6" rx="13" ry="8" fill="${pal.belly}"/><path d="M-13 5l-11 -1.6M-13 8l-10.4 2M13 5l11 -1.6M13 8l10.4 2" ${key(lw * .38)} opacity=".75"/>`;
    nose = `<path d="M-4.4 1.6h8.8l-4.4 4.8z" fill="${KEY}"/>`;
  } else if (a === "ferret") {
    back = `<circle cx="-15" cy="-15" r="5.6" fill="${pal.fur}" ${key(lw)}/><circle cx="15" cy="-15" r="5.6" fill="${pal.fur}" ${key(lw)}/><circle cx="-15" cy="-15" r="2.4" fill="${pal.inner}"/><circle cx="15" cy="-15" r="2.4" fill="${pal.inner}"/>`;
    front = `<path d="M-18.5 -6q18.500 -10 37 0q-18.500 11 -37 0z" fill="${pal.mask}"/><ellipse cy="7" rx="9" ry="6.4" fill="${pal.belly}"/>`;
    nose = `<path d="M-3 3h6l-3 3.4z" fill="${pal.nose}"/>`;
  } else if (a === "fox") {
    back = pair(`<path d="M-19 -6L-23 -34Q-22 -37 -19 -35L-3 -16Z" fill="${pal.fur}" ${key(lw)}/><path d="M-21.5 -26L-23 -34Q-22 -37 -19 -35L-15 -30Z" fill="${pal.inner}"/>`, anim);
    front = `<path d="M-19.5 3Q-10 1 0 11Q10 1 19.5 3Q16 20 0 20Q-16 20 -19.5 3Z" fill="${pal.belly}"/>`;
    nose = `<path d="M-3 5.5h6l-3 3.6z" fill="${KEY}"/>`;
    my = 11;
  } else if (a === "redpanda") {
    back = pair(`<circle cx="-16" cy="-15" r="7.5" fill="${pal.inner}" ${key(lw)}/><circle cx="-16" cy="-15" r="3.4" fill="${pal.fur}"/>`, anim);
    front = `<ellipse cy="8" rx="10" ry="7.5" fill="${pal.inner}"/>${both(`<ellipse cx="-13" cy="5" rx="5" ry="6.5" fill="${pal.inner}"/><ellipse cx="-8" cy="-11" rx="3.4" ry="2.4" fill="${pal.inner}"/>`)}`;
    nose = `<path d="M-3 4h6l-3 3.6z" fill="${KEY}"/>`;
    my = 10;
  } else if (a === "rabbit") {
    /* one ear up, one flopped over */
    const ear = (rot, x) => `<g transform="rotate(${rot})"><ellipse cx="${x}" cy="-35" rx="6.5" ry="19" fill="${pal.fur}" ${key(lw)}/><ellipse cx="${x}" cy="-34" rx="2.6" ry="13" fill="${pal.inner}"/></g>`;
    back = anim == null ? ear(-10, -9) + ear(34, 6) : `<g class="lc-ear" style="animation-delay:${f(-anim)}s">${ear(-10, -9)}</g><g class="lc-ear" style="animation-delay:${f(-anim - 3.4)}s;animation-duration:9s">${ear(34, 6)}</g>`;
    front = `<path d="M-13 6l-11 -1.6M-13 9l-10.4 2M13 6l11 -1.6M13 9l10.4 2" ${key(lw * .38)} opacity=".7"/>`;
    nose = `<path d="M-2.4 3.4h4.8l-2.4 3z" fill="${pal.nose}"/>`;
    my = 8;
  } else if (a === "carp") {
    /* the carp streamer is seen from the side: a pale collar, one big round eye, an open ring of a mouth */
    front = `<path d="M-20 0A20 20 0 0 0 4 19.6Q-6 6 -2 -19.9A20 20 0 0 0 -20 0Z" fill="${pal.belly}"/>`;
    const eye = mood === "sleep" ? ln("M0 -5q6 6 12 0", LWC * .8) : mood === "smug" || mood === "listen" ? ln("M0 -2q6 -7 12 0", LWC * .8) : mood === "squint" ? ln("M0 -4h12", LWC * .9)
      : `<circle cx="6" cy="-4" r="8.5" fill="${pal.inner}" ${key(lw * .7)}/><circle cx="6" cy="-4" r="${mood === "wide" ? 2.6 : 4}" fill="${KEY}"/>`;
    const sings = mood === "sing" || mood === "wide";
    own = { face: eye, mouth: `<ellipse cx="18" cy="6" rx="${sings ? 6 : 5}" ry="${sings ? 8.5 : 7}" fill="${pal.inner}" ${key(lw * .8)}/>${sings ? `<ellipse cx="18.5" cy="6" rx="2.8" ry="5" fill="#7a3b33"/>` : ""}` };
    nose = "";
  } else {
    /* dragon: a ring of mane, two horns, a wide pale snout and a long moustache */
    const spikes = Array.from({ length: 11 }, (_, i) => {
      const t = Math.PI * (.95 + i * .11), p = (r, d) => `${f(Math.cos(t + d) * r)} ${f(Math.sin(t + d) * r)}`;
      return `M${p(18, -.14)}L${p(28, 0)}L${p(18, .14)}Z`;
    }).join("");
    back = `<path d="${spikes}" fill="${pal.mane}" ${key(lw * .8)}/><path d="M-9 -16q-5 -9 -4 -18M-11 -27l-6 -2M9 -16q5 -9 4 -18M11 -27l6 -2" fill="none" stroke="${KEY}" stroke-width="${f(3.2 + lw * 1.4)}" stroke-linecap="round"/><path d="M-9 -16q-5 -9 -4 -18M-11 -27l-6 -2M9 -16q5 -9 4 -18M11 -27l6 -2" fill="none" stroke="${pal.horn}" stroke-width="3" stroke-linecap="round"/>`;
    front = `<ellipse cy="7" rx="14" ry="8.4" fill="${pal.belly}"/><path d="M-9 8q-12 0 -18 9M9 8q12 0 18 9" fill="none" stroke="${pal.mane}" stroke-width="2.2" stroke-linecap="round"/>`;
    nose = `<circle cx="-4" cy="3.5" r="1.6" fill="${KEY}"/><circle cx="4" cy="3.5" r="1.6" fill="${KEY}"/>`;
    my = 10;
  }
  const s = Math.round((sc || 1) * 100) / 100 || .01;
  const eyesM = own ? own.face : eyes(mood);
  const face = anim != null && (mood === "normal" || mood === "wide") ? `<g class="lc-blink" style="animation-delay:${f(-anim * 1.7)}s">${eyesM}</g>` : eyesM;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(dir * s * 100) / 100 || .01} ${s})">${back}<circle r="20" fill="${pal.fur}"/>${front}<circle r="20" fill="none" ${key(lw)}/>${face}${nose}${own ? own.mouth : mouth(mood, my)}${top}</g>`;
}

export function critterTail(animal, x, y, dir, w = 8, pal, kind = "point", tucked = false) {
  const a = animalId(animal);
  if (a === "cat") return tucked ? catTailTucked(kind, x, y, dir, w, pal || COATS.ginger) : catTail(kind, x, y, dir, w, pal || COATS.ginger);
  pal = pal && pal.fur ? { ...GUEST_PAL[a], ...pal } : GUEST_PAL[a];
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  if (a === "otter") return pipe(`M${P(4, 0)}Q${P(-14, -1)} ${P(-30, 5)}`, pal.fur, w * 1.5) + `<path d="M${P(-10, 1.5)}q${f(-9 * dir)} 1.5 ${f(-18 * dir)} 3.5" stroke="${pal.furDk}" stroke-width="${f(w * .4)}" fill="none" stroke-linecap="round"/>`;
  if (a === "dachshund") return tucked ? pipe(`M${P(0, 0)}Q${P(-8, 9)} ${P(10, 9)}`, pal.fur, w * .8)
    : pipe(`M${P(0, 0)}Q${P(-7, -3)} ${P(-10, -17)}`, pal.fur, w * .85) + `<circle cx="${f(x - 10 * dir)}" cy="${f(y - 17.5)}" r="${f(w * .42)}" fill="${pal.belly}"/>`;
  if (a === "ferret") return tucked ? pipe(`M${P(0, 0)}Q${P(-8, 10)} ${P(8, 10)}T${P(26, 7)}`, pal.fur, w * 1.1)
    : pipe(`M${P(0, 0)}Q${P(-16, 0)} ${P(-20, -12)}Q${P(-22, -22)} ${P(-14, -24)}`, pal.fur, w * 1.1) + `<path d="M${P(-20.5, -14)}Q${P(-21.5, -21.5)} ${P(-14, -24)}" stroke="${pal.mask}" stroke-width="${f(w * 1.1)}" fill="none" stroke-linecap="round"/>`;
  /* fox: a brush with a pale tip. red panda: a thick tail with pale rings. rabbit: a ball. carp: a forked fin */
  if (a === "fox") {
    const k = w / 9;
    return tucked ? pipe(`M${P(0, 0)}Q${P(-9 * k, 11 * k)} ${P(9 * k, 11 * k)}T${P(26 * k, 8 * k)}`, pal.fur, w * 1.3) + `<circle cx="${f(x + 28 * k * dir)}" cy="${f(y + 7.5 * k)}" r="${f(w * .62)}" fill="${pal.belly}" ${key(LWC * .8)}/>`
      : pipe(`M${P(0, 0)}q${f(-22 * k * dir)} ${f(-2 * k)} ${f(-24 * k * dir)} ${f(-22 * k)}q${f(-1 * k * dir)} ${f(-12 * k)} ${f(8 * k * dir)} ${f(-16 * k)}`, pal.fur, w * 1.45) + `<circle cx="${f(x - 16 * k * dir)}" cy="${f(y - 39 * k)}" r="${f(w * .9)}" fill="${pal.belly}" ${key(LWC * .9)}/>`;
  }
  if (a === "redpanda") {
    const k = w / 9, d = tucked ? `M${P(0, 0)}Q${P(-9 * k, 11 * k)} ${P(9 * k, 11 * k)}T${P(28 * k, 8 * k)}` : `M${P(0, 0)}Q${P(-24 * k, 2 * k)} ${P(-30 * k, -18 * k)}`;
    return pipe(d, pal.fur, w * 1.5) + `<path d="${d}" fill="none" stroke="${pal.stripe}" stroke-width="${f(w * 1.5)}" stroke-dasharray="${f(3.4 * k)} ${f(7 * k)}" stroke-dashoffset="${f(-6 * k)}"/>`;
  }
  if (a === "rabbit") return `<circle cx="${f(x - 4 * dir)}" cy="${f(y - (tucked ? 0 : 4))}" r="${f(w * .9)}" fill="${pal.belly}" ${key(LWC * .9)}/>`;
  if (a === "carp") {
    const k = w / 9;
    return `<path d="M${P(4 * k, -8 * k)}L${P(-26 * k, -22 * k)}L${P(-16 * k, -2 * k)}L${P(-28 * k, 16 * k)}L${P(4 * k, 8 * k)}Z" fill="${pal.fur}" ${key(LWC * .9)}/><path d="M${P(-2 * k, -5 * k)}L${P(-18 * k, -14 * k)}M${P(-2 * k, 5 * k)}L${P(-20 * k, 10 * k)}" fill="none" ${key(LWC * .4)}/>`;
  }
  /* dragon: a long tail ending in a flame-shaped tuft */
  if (tucked) return pipe(`M${P(0, 0)}Q${P(-10, 10)} ${P(10, 10)}T${P(30, 6)}`, pal.fur, w * .75) + `<path d="M${P(30, 6)}q${f(6 * dir)} -6 ${f(12 * dir)} -1q${f(-5 * dir)} 2 ${f(-12 * dir)} 4z" fill="${pal.mane}" ${key(LWC * .7)}/>`;
  return pipe(`M${P(0, 0)}Q${P(-18, 0)} ${P(-20, -14)}Q${P(-22, -26)} ${P(-12, -27)}`, pal.fur, w * .75)
    + `<path d="M${P(-12, -27)}q${f(3 * dir)} -9 ${f(-4 * dir)} -13q${f(4 * dir)} 6 ${f(-6 * dir)} 7q${f(-1 * dir)} -6 ${f(-6 * dir)} -6q${f(1 * dir)} 7 ${f(6 * dir)} 11z" fill="${pal.mane}" ${key(LWC * .7)}/>`;
}
export const headFor = (animal, kind, x, y, dir, mood, sc, pal, anim) => critterHead(animal, x, y, dir, mood, sc, pal, kind, anim);
export const tailFor = (animal, kind, x, y, dir, w, pal, tucked) => critterTail(animal, x, y, dir, w, pal, kind, tucked);
