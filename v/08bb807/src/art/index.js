/* Longcat art module. Pure functions returning SVG strings; see longcat/docs/art-contract.md and docs/art-style.md.
   Since 2026-11-14 the game draws with the woodblock redraw in ./print/ (judge, cats, garments, places, scene, lane,
   cards). The files beside this one are the first art: ./print still borrows from them (palette tables, coat
   patterns, caption wrapping, the place ids), and the gallery shows them for comparison. */
export { sceneSvg, judgeBustSvg, nappingSvg, PLACE_UI } from "./print/scene.js";
export { stepPoint, ZONE_NAME, drawZone } from "./print/garments.js";
export { faceIconSvg } from "./print/judge.js";
export { laneCatSvg, segmentSvg } from "./print/lane.js";
export { postcardSvg, letterSvg, placeThumbSvg, wardrobeThumbSvg, catKindSvg, guestSvg, wrapCaption } from "./print/cards.js";
export { ART_CSS } from "./css.js";

/* additions beyond the contract (safe to ignore) */
export { FACES } from "./judge.js";
export { PLACE_IDS, PLACE_NAME } from "./places/index.js";
export { ONSEN_LOOKS, PATTERNS, KINDS, TIME_NAME } from "./palettes.js";
