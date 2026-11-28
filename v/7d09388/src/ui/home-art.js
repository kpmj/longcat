/* The home picture, filling the whole phone (full-screen home board, 2026-11-14, the designer chose 丁).

   A STAND-IN until the picture is redrawn tall: the scene is still the 400 x 500 print (art/print/scene.js). Here
   its layers are used without the paper frame, the judge is placed between the top row and the tray, the colour at
   the top of the picture is carried up to the top of the screen and the colour at its bottom down to the bottom,
   and the print's title block is set under the top row. When src/art grows a real tall composition, this file is
   what it replaces; the rest of the home screen only needs `homeArt` (the picture and where the judge is in it).

   The art session added what this needs to every place's layers (L.title, L.up, L.down; 2026-11-14) and exports
   sceneParts and loaf from art/index.js. Until that is committed, this reads the two print modules directly and
   falls back to working the same things out from the layers, so it runs on either. */
import { sceneParts } from "../art/print/scene.js";
import { catHead } from "../art/print/cat.js";
import { headFor, palFor } from "../art/print/guests.js";
import { lookOf, animalId, kindId } from "../art/palettes.js";

import { NEW_JUDGE } from "../art/style.js";

/* the judge with the fruit on a bare head, in the print's own 400 x 500 (the new capybara's head is taller) */
const JUDGE_TOP = NEW_JUDGE ? 35 : 51, JUDGE_FEET = 475;
const MARGIN = 22; // clear space above the fruit and under the feet, at the least
/* The judge on Home is smaller than in the print (the designer, 2026-11-28: 「我在想把水豚縮小10% 這樣背景就比較大 看起來也不會
   那麼擠」, after seeing that the judge hides most of a background). The judge, its garments and its cats are drawn
   at HOME_JUDGE of the print round STAND, where its feet are on the seat: they stand where they stood, the seat,
   the place's things and the scenery keep their size, and the room beside and above the head grows. Only Home:
   postcards, the Wardrobe and the singing screen keep the print as it is (wrapping by hand works in its units). */
export const HOME_JUDGE = 0.9;
const STAND = [200, NEW_JUDGE ? 461 : 473];
export const smaller = (inner) => `<g transform="translate(${STAND[0]} ${STAND[1]}) scale(${HOME_JUDGE}) translate(${-STAND[0]} ${-STAND[1]})">${inner}</g>`;

/* Where the judge goes. W, H: the screen in px; top: where the top row ends; bottom: where the tray begins;
   lift: how far the hat has raised the fruit. Everything inside the picture is in units of a 400-wide viewBox. */
export function homeLayout(W, H, top, bottom, lift = 0) {
  const u = 400 / Math.max(1, W), VH = Math.max(300, H * u);
  const T = top * u, B = Math.max(T + 200, bottom * u);
  const tall = JUDGE_FEET - (JUDGE_TOP - lift);
  const s = Math.max(0.5, Math.min(1.1, (B - T - 2 * MARGIN) / tall));
  const feet = (T + B) / 2 + (tall * s) / 2;
  const D = feet - JUDGE_FEET;
  return {
    VH, s, D, T,
    /* a point of the print (a place's things) in screen px */
    toPx: (x, y) => ({ x: (200 + (x - 200) * s) / u, y: (JUDGE_FEET + (y - JUDGE_FEET) * s + D) / u }),
    /* a point of the judge or its garments (stepPoint), which Home draws smaller round its feet */
    judgePx: (x, y) => { const X = STAND[0] + (x - STAND[0]) * HOME_JUDGE, Y = STAND[1] + (y - STAND[1]) * HOME_JUDGE; return { x: (200 + (X - 200) * s) / u, y: (JUDGE_FEET + (Y - JUDGE_FEET) * s + D) / u }; },
  };
}

const mix = (hex, to, a) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - a) + parseInt(to.slice(i, i + 2), 16) * a).toString(16).padStart(2, "0")).join("");
const HEX = /fill="(#[0-9a-fA-F]{6})"/;
const isHex = (c) => typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c);

/* o: what state.js homeScene gives sceneSvg; W, H, top, bottom as in homeLayout. Returns the picture and the
   layout it was drawn with. */
export function homeArt(o, W, H, top, bottom) {
  const p = sceneParts(o), P = p.L;
  const L = homeLayout(W, H, top, bottom, Number(p.itemLift) || 0);
  /* the colour to carry up and the one to carry down: the art's own word for them, or read off the layers */
  const sky = isHex(P.up) ? P.up : (String(P.back).match(/<rect[^>]*fill="(#[0-9a-fA-F]{6})"/) || [])[1] || P.wall || "#f6efe0";
  const down = P.down && isHex(P.down.fill) ? P.down : { fill: (String(P.front || "").match(HEX) || [])[1] || P.wall || sky, water: p.place === "onsen" };
  const ripple = isHex(down.wave) ? down.wave : mix(down.fill, "#ffffff", 0.35);
  /* the print's frame is the paper edge, its border, then the title block: only the title block is kept */
  const frame = String(P.frame || "");
  const title = typeof P.title === "string" ? P.title : /^<path[^>]*evenodd"\/><rect[^>]*fill="none"[^>]*\/>/.test(frame) ? frame.replace(/^<path[^>]*\/><rect[^>]*\/>/, "") : "";
  const x0 = 200 - 200 * L.s, y0 = L.D + JUDGE_FEET - JUDGE_FEET * L.s, below = y0 + 496 * L.s;
  /* ripples only where the bottom of the picture is water */
  const waves = !down.water ? "" : [0, 1, 2, 3, 4, 5].map((k) => `<path d="M${-20 + (k % 2) * 30} ${(below + 22 + k * 32).toFixed(1)}q20 -8 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" fill="none" stroke="${ripple}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`).join("");
  /* A place whose scenery is one tall picture (P.tall, art/print/places/kit.js): the picture fills the phone from the
     top, and over it, where the print would be, come the place's things, then the seat and the judge. The picture
     and the things are one group to press, as the print's landscape is: a tap on it swings what hangs and wakes
     the sun; a bird or a monkey answers for itself. Nothing of the print's own sky or ground is drawn. */
  const print = (inner) => `<svg x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(400 * L.s).toFixed(1)}" height="${(500 * L.s).toFixed(1)}" viewBox="0 0 400 500">${inner}</svg>`;
  if (P.tall && P.tall.inner) {
    const scenery = `<svg x="0" y="0" width="400" height="${L.VH.toFixed(1)}" viewBox="${P.tall.box}" preserveAspectRatio="xMidYMin slice">${P.tall.inner}</svg>${print(P.things || "")}`;
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${L.VH.toFixed(1)}" preserveAspectRatio="xMidYMin slice">
<rect width="400" height="${L.VH.toFixed(1)}" fill="${sky}"/>
${/data-tap/.test(String(P.back)) ? `<g data-tap="swing">${scenery}</g>` : scenery}
${print(`${p.special}${P.seat}${p.shelves}${smaller(p.character)}`)}
${title ? `<g transform="translate(4 ${(L.T - 16).toFixed(1)})">${title}</g>` : ""}
</svg>`, layout: L };
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${L.VH.toFixed(1)}" preserveAspectRatio="xMidYMin slice">
<rect width="400" height="${L.VH.toFixed(1)}" fill="${sky}"/>
${y0 > 70 ? `<rect width="400" height="${(y0 - 62 * L.s).toFixed(1)}" fill="${mix(sky, "#2a1420", 0.13)}"/>` : ""}
<rect y="${(below - 20).toFixed(1)}" width="400" height="${Math.max(0, L.VH - below + 20).toFixed(1)}" fill="${down.fill}"/>${waves}
<svg x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(400 * L.s).toFixed(1)}" height="${(500 * L.s).toFixed(1)}" viewBox="0 0 400 500">${P.back}${p.special}${P.seat}${p.shelves}${smaller(p.character)}${P.front}</svg>
${title ? `<g transform="translate(4 ${(L.T - 16).toFixed(1)})">${title}</g>` : ""}
</svg>`;
  return { svg, layout: L };
}

/* The cat of a garment, small: it stands for the garment's name in the progress row. g: state.js garmentSpec.
   Only the face (the designer, 2026-11-14: "instead of showing the whole cat we can just show their face. It's cleaner and
   it's not touching the progress bar"): the whole loaf's tail reached over the ticks beside it. The same head the
   loaf has, in the cat's own coat and ears; the box holds the widest ears and the whiskers, so nothing spills. */
export const CAT_ICON_BOX = "-26 -34.5 52 51"; // measured: the four ear kinds reach from y = -33.5 to 15.5, whiskers to x = 25
const GUEST_ICON_BOX = "-29 -54 71 75"; // a guest's head can be much taller (the rabbit's ears)
export function catIconSvg(g, zone, time) {
  const look = lookOf(g.look, zone, time), animal = animalId(g.animal), kind = kindId(g.kind), pal = palFor(animal, look);
  const head = animal === "cat" ? catHead(0, 0, 1, "normal", 1, pal, kind) : headFor(animal, kind, 0, 0, 1, "normal", 1, pal);
  return `<svg class="cat-ico" viewBox="${animal === "cat" ? CAT_ICON_BOX : GUEST_ICON_BOX}" aria-hidden="true">${head}</svg>`;
}
