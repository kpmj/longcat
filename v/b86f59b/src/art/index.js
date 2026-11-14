/* Longcat art module. Pure functions returning SVG strings; see longcat/docs/art-contract.md.
   Files: util (numbers, PRNG), palettes, cat (head, ears, tails, body, coat), guests (dachshund, otter, ferret, dragon),
   judge (the capybara and its faces), garments (the three paths), loaf (sleeping / waiting cats), places/* (twelve
   backdrops, New Year), scene, portrait (bust, face icon), lane (live lane cat, segment), cards, stamps, css. */
export { sceneSvg } from "./scene.js";
export { stepPoint } from "./garments.js";
export { judgeBustSvg, faceIconSvg } from "./portrait.js";
export { laneCatSvg, segmentSvg } from "./lane.js";
export { postcardSvg, letterSvg, placeThumbSvg, wardrobeThumbSvg, catKindSvg, guestSvg } from "./cards.js";
export { ART_CSS } from "./css.js";
export { PLACE_UI } from "./places/index.js";

/* additions beyond the contract (safe to ignore) */
export { wrapCaption } from "./cards.js";
export { FACES } from "./judge.js";
export { PLACE_IDS, PLACE_NAME } from "./places/index.js";
export { ZONE_NAME } from "./garments.js";
export { ONSEN_LOOKS, PATTERNS, KINDS, TIME_NAME } from "./palettes.js";
