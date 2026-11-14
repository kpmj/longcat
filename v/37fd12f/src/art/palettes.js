/* Colours and the fixed parameter tables. Colours are designed per garment and never mean a rank. */

/* the judge (a capybara) never changes colour or shape; only its face */
export const K = {
  fur: "#a67c52", furDk: "#8b6540", muzzle: "#c9a27a", ink: "#2e2018", brown: "#4a3222", nostril: "#6b4a33",
  mute: "#8a7a68", card: "#fffdf6", paper: "#fdf6e8", dim: "#d9ccb0", line: "#c9bba6",
  orange: "#f0a032", orangeLt: "#f8c86e", leaf: "#5c7d4b", tear: "#7cc0d8", pink: "#e9a0a8", pinkLt: "#f4b6c0",
  wood: "#b68a5e", woodDk: "#8b6540",
};

/* the three cat coats. a garment's palette is chosen with its pattern, one of each per time of day */
export const COATS = {
  grey:   { fur: "#9a9db0", furDk: "#7d8094", stripe: "#5f6276", belly: "#e3e5ee", ink: "#2f2a3a", nose: "#d98a98", inner: "#f0c6cc" },
  ginger: { fur: "#f0a845", furDk: "#d8862a", stripe: "#c9772a", belly: "#fbe3c0", ink: "#4a3222", nose: "#e07d8a", inner: "#f6c6b0" },
  cream:  { fur: "#f1dfb6", furDk: "#d9c38c", stripe: "#b9975a", belly: "#fff9ea", ink: "#4a3222", nose: "#e07d8a", inner: "#f6c6b0" },
};

/* special-month guests wear their own colours; only head and tail differ from a cat */
export const GUEST_PAL = {
  dachshund: { fur: "#4d3d36", furDk: "#3a2e29", stripe: "#2c2320", belly: "#d9a46a", ink: "#1e1614", nose: "#1e1614", inner: "#c98f55" },
  otter:     { fur: "#c4ab90", furDk: "#a68b70", stripe: "#86705a", belly: "#f1e4d0", ink: "#2e2018", nose: "#3a2a20", inner: "#e2cdb4" },
  ferret:    { fur: "#e8dcc4", furDk: "#cdbd9d", stripe: "#8a7866", belly: "#f7f1e4", ink: "#2e2018", nose: "#d98a98", inner: "#f0d6c6", mask: "#7a6a58" },
  dragon:    { fur: "#d9573f", furDk: "#b4432f", stripe: "#9c3626", belly: "#f6e2bf", ink: "#3a1d17", nose: "#3a1d17", inner: "#f3c27a", mane: "#f0b44c", horn: "#f6e2bf" },  fox:       { fur: "#d98a3a", furDk: "#b86a26", stripe: "#7c4a22", belly: "#f6eedd", ink: "#2e2018", nose: "#2e2018", inner: "#3a2a22" },
  redpanda:  { fur: "#b8562c", furDk: "#8f3f1e", stripe: "#e9c9a0", belly: "#3a2a22", ink: "#2e2018", nose: "#2e2018", inner: "#f6eedd" },
  rabbit:    { fur: "#ece5d5", furDk: "#cfc5ae", stripe: "#b3a78c", belly: "#f8f4ea", ink: "#2e2018", nose: "#a7605a", inner: "#dcb8a4" },
  carp:      { fur: "#bf452d", furDk: "#96301f", stripe: "#f1dfb8", belly: "#f1dfb8", ink: "#2e2018", nose: "#2e2018", inner: "#f8f2e2" },
};
/* year two (2026-11-14): fox, red panda, rabbit and the carp streamer are drawn (print/guests.js) but not in GUESTS yet,
   so no month uses them until the calendar says so */
export const ANIMALS = ["cat", "dachshund", "otter", "ferret", "dragon", "fox", "redpanda", "rabbit", "carp"];
export const GUESTS = ["dachshund", "otter", "ferret", "dragon"];

/* fur length follows the weather, not progress. w = body width in the 400x500 scene, fluff = extra tuft radius */
export const FUR = {
  short: { w: 20, fluff: 0, tuftR: .5 },
  mid:   { w: 22.5, fluff: 1.2, tuftR: .54 },
  long:  { w: 25, fluff: 3.2, tuftR: .58 },
};
export const PATTERNS = ["plain", "twotone", "bands3", "pale3", "rosettes", "stripes5", "spots", "bold", "tabby", "pin", "rosebold", "freckles"];
export const KINDS = ["point", "big", "tuft", "small"];
export const ZONE_IDS = ["scarf", "top", "bottom"];
export const TIME_IDS = ["morning", "golden", "night"];
export const TIME_NAME = { morning: "Morning", golden: "Golden hour", night: "Night" };
export const FUR_OF_TIME = { morning: "short", golden: "mid", night: "long" };

/* the onsen's nine garments: the default look when a garment arrives without one */
export const ONSEN_LOOKS = {
  morning: { scarf: { fur: "short", pattern: "plain", palette: "cream" }, top: { fur: "short", pattern: "pin", palette: "ginger" }, bottom: { fur: "short", pattern: "freckles", palette: "grey" } },
  golden:  { scarf: { fur: "mid", pattern: "bands3", palette: "ginger" }, top: { fur: "mid", pattern: "rosettes", palette: "grey" }, bottom: { fur: "mid", pattern: "spots", palette: "cream" } },
  night:   { scarf: { fur: "long", pattern: "bold", palette: "grey" }, top: { fur: "long", pattern: "tabby", palette: "cream" }, bottom: { fur: "long", pattern: "twotone", palette: "ginger" } },
};

/* safe lookups: unknown ids fall back to something sensible instead of throwing or printing undefined */
export const timeId = t => (TIME_IDS.includes(t) ? t : "morning");
export const zoneId = z => (ZONE_IDS.includes(z) ? z : null);
export const kindId = k => (KINDS.includes(k) ? k : "point");
export const animalId = a => (ANIMALS.includes(a) ? a : "cat");
export function lookOf(look, zone = "bottom", time = "morning") {
  const d = ONSEN_LOOKS[timeId(time)][zoneId(zone) || "bottom"];
  const l = look && typeof look === "object" ? look : {};
  return {
    fur: FUR[l.fur] ? l.fur : d.fur,
    pattern: PATTERNS.includes(l.pattern) ? l.pattern : (l.pattern == null ? d.pattern : "plain"),
    palette: COATS[l.palette] ? l.palette : d.palette,
  };
}
/* the colours a garment is drawn in: a cat's coat, or a guest's own colours */
export const palOf = (animal, look) => (animalId(animal) !== "cat" ? GUEST_PAL[animalId(animal)] : COATS[look && look.palette] || COATS.ginger);
