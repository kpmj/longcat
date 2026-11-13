/* Special-month guests: dachshund (floppy ears), otter (flat tail), ferret (face mask), dragon (New Year).
   Same frame as the cat head (radius 20) and the same tail anchor, so they ride the same three paths. */
import { f } from "./util.js";
import { GUEST_PAL, COATS, animalId } from "./palettes.js";
import { catHead, catTail, catTailTucked } from "./cat.js";

function guestEyes(mood, pal, y = -4) {
  if (mood === "sleep") return `<path d="M-11 ${y - 1} q4 4 8 0 M3 ${y - 1} q4 4 8 0" stroke="${pal.ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (mood === "smug" || mood === "listen") return `<path d="M-11 ${y + 1} q4 -5 8 0 M3 ${y + 1} q4 -5 8 0" stroke="${pal.ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if (mood === "squint") return `<path d="M-11 ${y} h8 M3 ${y} h8" stroke="${pal.ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (mood === "wide") return `<circle cx="-7" cy="${y}" r="4.4" fill="#fff" stroke="${pal.ink}" stroke-width="1.4"/><circle cx="7" cy="${y}" r="4.4" fill="#fff" stroke="${pal.ink}" stroke-width="1.4"/><circle cx="-6.2" cy="${y + .4}" r="2" fill="${pal.ink}"/><circle cx="7.8" cy="${y + .4}" r="2" fill="${pal.ink}"/>`;
  return `<circle cx="-7" cy="${y}" r="2.4" fill="${pal.ink}"/><circle cx="7" cy="${y}" r="2.4" fill="${pal.ink}"/>`;
}
function guestMouth(mood, pal, y = 9) {
  if (mood === "sing" || mood === "wide") return `<ellipse cy="${y + 2}" rx="3.4" ry="4.2" fill="#7a3a3a"/>`;
  if (mood === "squint") return `<path d="M-4 ${y + 1} h8" stroke="${pal.ink}" stroke-width="1.8" stroke-linecap="round"/>`;
  return `<path d="M-5 ${y} q2.5 3.5 5 0 q2.5 3.5 5 0" stroke="${pal.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
}

/* a guest's head at (x, y), facing dir. cats go to catHead */
export function critterHead(animal, x, y, dir, mood, sc = 1, pal, kind = "point") {
  const a = animalId(animal);
  pal = pal || GUEST_PAL[a] || COATS.ginger;
  if (a === "cat") return catHead(x, y, dir, mood, sc, pal, kind);
  let back = "", front = "", nose, mouthY = 9;
  if (a === "dachshund") {
    front = `<ellipse cx="-7" cy="-3.5" rx="5.6" ry="5" fill="${pal.belly}"/><ellipse cx="7" cy="-3.5" rx="5.6" ry="5" fill="${pal.belly}"/><ellipse cx="1" cy="7" rx="12" ry="8" fill="${pal.belly}"/><circle cx="-7" cy="-12" r="2.2" fill="${pal.belly}" opacity=".9"/><circle cx="7" cy="-12" r="2.2" fill="${pal.belly}" opacity=".9"/>`;
    back = "";
    nose = `<ellipse cx="2" cy="3.5" rx="3.8" ry="2.7" fill="${pal.ink}"/>`;
    /* the floppy ears hang over the sides of the head, so they go on top */
    front += `__EARS__`;
  } else if (a === "otter") {
    back = `<circle cx="-16" cy="-14" r="4.5" fill="${pal.furDk}"/><circle cx="16" cy="-14" r="4.5" fill="${pal.furDk}"/>`;
    front = `<ellipse cy="6" rx="13" ry="8" fill="${pal.belly}"/><path d="M-12 5 h-12 M-12 8 l-12 3 M12 5 h12 M12 8 l12 3" stroke="${pal.ink}" stroke-width="1.1" opacity=".5" stroke-linecap="round"/>`;
    nose = `<path d="M-4.5 1.5 h9 l-4.5 5z" fill="${pal.ink}"/>`;
  } else if (a === "ferret") {
    back = `<circle cx="-15" cy="-15" r="5.5" fill="${pal.fur}"/><circle cx="15" cy="-15" r="5.5" fill="${pal.fur}"/><circle cx="-15" cy="-15" r="2.5" fill="${pal.inner}"/><circle cx="15" cy="-15" r="2.5" fill="${pal.inner}"/>`;
    front = `<path d="M-18 -6 q18 -10 36 0 q-18 11 -36 0z" fill="${pal.mask}" opacity=".85"/><ellipse cy="7" rx="9" ry="6.5" fill="${pal.belly}"/>`;
    nose = `<path d="M-3 3 h6 l-3 3.5z" fill="${pal.nose}"/>`;
  } else {
    /* dragon: a ring of mane, two soft horns, a wide snout and a long moustache */
    const spikes = Array.from({ length: 11 }, (_, i) => {
      const t = Math.PI * (.95 + i * .11), r0 = 18, r1 = 28;
      const p = (r, d) => `${f(Math.cos(t + d) * r)} ${f(Math.sin(t + d) * r)}`;
      return `M${p(r0, -.13)} L${p(r1, 0)} L${p(r0, .13)}`;
    }).join(" ");
    back = `<path d="${spikes}" fill="${pal.mane}"/><path d="M-9 -16 q-5 -9 -4 -18 M-11 -27 l-6 -2 M9 -16 q5 -9 4 -18 M11 -27 l6 -2" stroke="${pal.horn}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    front = `<ellipse cy="7" rx="14" ry="8.5" fill="${pal.belly}"/><path d="M-9 8 q-12 0 -18 9 M9 8 q12 0 18 9" stroke="${pal.mane}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    nose = `<circle cx="-4" cy="3.5" r="1.6" fill="${pal.ink}"/><circle cx="4" cy="3.5" r="1.6" fill="${pal.ink}"/>`;
    mouthY = 10;
  }
  const ears = a === "dachshund" ? `<path d="M-16 -15 Q-30 -12 -27 6 Q-25 14 -18 9 Q-15 -2 -10 -12Z M16 -15 Q30 -12 27 6 Q25 14 18 9 Q15 -2 10 -12Z" fill="${pal.furDk}"/>` : "";
  front = front.replace("__EARS__", "");
  const s = Math.round((sc || 1) * 100) / 100 || .01;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(dir * s * 100) / 100 || .01} ${s})">${back}<circle r="20" fill="${pal.fur}"/>${front}${guestEyes(mood, pal)}${nose}${guestMouth(mood, pal, mouthY)}${ears}</g>`;
}

/* a guest's tail from (x, y), growing away from dir */
export function critterTail(animal, x, y, dir, w = 8, pal, kind = "point", tucked = false) {
  const a = animalId(animal);
  pal = pal || GUEST_PAL[a] || COATS.ginger;
  if (a === "cat") return tucked ? catTailTucked(kind, x, y, dir, w, pal) : catTail(kind, x, y, dir, w, pal);
  const P = (dx, dy) => `${f(x + dx * dir)} ${f(y + dy)}`;
  if (a === "otter") {
    /* flat and broad, lying back along the ground whatever the mood */
    return `<path d="M${P(4, 0)} Q${P(-14, -1)} ${P(-30, 5)}" stroke="${pal.fur}" stroke-width="${f(w * 1.6)}" fill="none" stroke-linecap="round"/><path d="M${P(-10, 1.5)} q${f(-9 * dir)} 1.5 ${f(-18 * dir)} 3.5" stroke="${pal.furDk}" stroke-width="${f(w * .45)}" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }
  if (a === "dachshund") {
    if (tucked) return `<path d="M${P(0, 0)} Q${P(-8, 9)} ${P(10, 9)}" stroke="${pal.fur}" stroke-width="${f(w * .9)}" fill="none" stroke-linecap="round"/>`;
    return `<path d="M${P(0, 0)} Q${P(-7, -3)} ${P(-10, -17)}" stroke="${pal.fur}" stroke-width="${f(w * .95)}" fill="none" stroke-linecap="round"/><circle cx="${f(x - 10 * dir)}" cy="${f(y - 17)}" r="${f(w * .5)}" fill="${pal.belly}"/>`;
  }
  if (a === "ferret") {
    if (tucked) return catTailTucked("tuft", x, y, dir, w * .9, pal);
    return `<path d="M${P(0, 0)} Q${P(-16, 0)} ${P(-20, -12)} Q${P(-22, -22)} ${P(-14, -24)}" stroke="${pal.fur}" stroke-width="${f(w * 1.2)}" fill="none" stroke-linecap="round"/><path d="M${P(-19, -10)} Q${P(-21, -21)} ${P(-14, -24)}" stroke="${pal.mask || pal.stripe}" stroke-width="${f(w * 1.1)}" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  /* dragon: a long tail ending in a soft flame-shaped tuft */
  if (tucked) return `<path d="M${P(0, 0)} Q${P(-10, 10)} ${P(10, 10)} T${P(30, 6)}" stroke="${pal.fur}" stroke-width="${f(w * .8)}" fill="none" stroke-linecap="round"/><path d="M${P(30, 6)} q${f(6 * dir)} -6 ${f(12 * dir)} -1 q${f(-5 * dir)} 2 ${f(-12 * dir)} 4z" fill="${pal.mane}"/>`;
  return `<path d="M${P(0, 0)} Q${P(-18, 0)} ${P(-20, -14)} Q${P(-22, -26)} ${P(-12, -27)}" stroke="${pal.fur}" stroke-width="${f(w * .8)}" fill="none" stroke-linecap="round"/><path d="M${P(-12, -27)} q${f(3 * dir)} -9 ${f(-4 * dir)} -13 q${f(4 * dir)} 6 ${f(-6 * dir)} 7 q${f(-1 * dir)} -6 ${f(-6 * dir)} -6 q${f(1 * dir)} 7 ${f(6 * dir)} 11z" fill="${pal.mane}"/>`;
}

/* any animal's head and tail through one door */
export const headFor = (animal, kind, x, y, dir, mood, sc, pal) => critterHead(animal, x, y, dir, mood, sc, pal, kind);
export const tailFor = (animal, kind, x, y, dir, w, pal, tucked) => critterTail(animal, x, y, dir, w, pal, kind, tucked);
