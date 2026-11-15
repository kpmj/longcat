/* Longcat art module. Pure functions returning SVG strings; see docs/art-contract.md and docs/art-style.md.
   Since 2026-11-14 the game draws with the woodblock redraw in ./print/ (judge, cats, garments, places, scene, lane,
   cards). The files beside this one are the first art: ./print still borrows from them (palette tables, coat
   patterns, caption wrapping, the place ids), and the gallery shows them for comparison. */
export { sceneSvg, judgeBustSvg, nappingSvg, PLACE_UI } from "./print/scene.js";
export { stepPoint, ZONE_NAME, drawZone } from "./print/garments.js";
export { faceIconSvg } from "./print/judge.js";
export { laneCatSvg, segmentSvg } from "./print/lane.js";
export { yarnSwatchSvg, YARN_COLORS, YARN_TYPES } from "./print/yarn.js";
export { postcardSvg, letterSvg, placeThumbSvg, wardrobeThumbSvg, catKindSvg, guestSvg, wrapCaption } from "./print/cards.js";
export { ART_CSS } from "./css.js";

/* For a page that lays the scene out itself (the full-screen home, src/ui/home-art.js), so the UI does not reach into
   ./print/. sceneParts(o) -> { place, time, L, special, shelves, character, itemLift, ... }; L = the place's layers:
   back, seat, front, frame (paper edge + title), and since 2026-11-14 also
     L.title  the title block alone, in the scene's 400 x 500 (no paper edge)
     L.up     the colour at the top of the picture, to carry above it
     L.down   { fill, line, water, wave? }: the colour at the bottom, to carry below it; water = ripples fit there
   The judge with the fruit reaches from y = 51 - itemLift (the fruit's leaf) to y = 475 (the feet).
   loaf(x, y, dir, cat, mood, scale, zone, time): one small cat, for an icon. */
export { sceneParts } from "./print/scene.js";
export { loaf } from "./print/loaf.js";

/* additions beyond the contract (safe to ignore) */
export { FACES } from "./judge.js";
export { PLACE_IDS, PLACE_NAME } from "./places/index.js";
export { ONSEN_LOOKS, PATTERNS, KINDS, TIME_NAME } from "./palettes.js";
