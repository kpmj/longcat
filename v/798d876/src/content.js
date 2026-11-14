/* Game content: every id, name and line the game uses, in English (the designer, 2026-11-12). Ids match docs/art-contract.md.
   Source: docs/design/longcat-judge-proposals.md (version 12) plus the designer's fourth reply (2026-11-12).
   Anything marked DRAFT is placeholder copy written for the demo, not yet approved by the designer. */

export const STEPS = 12;

export const ZONES = [
  { id: "scarf", name: "Scarf", where: "neck" },
  { id: "top", name: "Top", where: "chest to belly" },
  { id: "bottom", name: "Hat", where: "head" },
];
export const ZONE_IDS = ZONES.map((z) => z.id);

/* Each time of day has its fur, its weather and its singing flavour (design doc section 6). */
export const TIMES = [
  { id: "morning", name: "Morning", fur: "short", weather: "Cool, the mist hasn't lifted", flavour: "Warm-up", how: "a little slower, closer to the middle of your range, shorter notes" },
  { id: "golden", name: "Golden hour", fur: "mid", weather: "Warm, the sun low and slanting", flavour: "Standard", how: "the twelve drills as they are" },
  { id: "night", name: "Night", fur: "long", weather: "Cold, time for something thicker", flavour: "Long and soft", how: "longer notes, slower, quiet is fine" },
];
export const TIME_IDS = TIMES.map((t) => t.id);

/* Garment names per time and zone (design doc section 1). Every place uses the same nine names for now. */
export const GARMENT_NAMES = {
  morning: { scarf: "Thin scarf", top: "Light top", bottom: "Light cap" },
  golden: { scarf: "Scarf", top: "Vest", bottom: "Cap" },
  night: { scarf: "Thick scarf", top: "Sweater", bottom: "Wool hat" },
};

export const PATTERNS = [
  { id: "plain", name: "Plain" }, { id: "twotone", name: "Two-tone" }, { id: "bands3", name: "Three rings" },
  { id: "pale3", name: "Three pale rings" }, { id: "rosettes", name: "Rosettes" }, { id: "stripes5", name: "Five fine stripes" },
  { id: "spots", name: "Spots" }, { id: "bold", name: "One bold band" }, { id: "tabby", name: "Tabby" },
  { id: "pin", name: "Pinstripes" }, { id: "rosebold", name: "Rosettes and a band" }, { id: "freckles", name: "Freckles" },
];
export const PALETTE_NAMES = { grey: "grey", ginger: "ginger", cream: "cream" };

/* The four cat kinds: a setting per body part, free, never progress (decided 2026-11-11). */
export const CAT_KINDS = [
  { id: "point", name: "Pointy ears · long tail", short: "Pointy", note: "a long tail curled at the tip" },
  { id: "big", name: "Big ears · thin tail", short: "Big ears", note: "ears set wide" },
  { id: "tuft", name: "Tufted ears · bushy tail", short: "Tufted", note: "a tuft on each ear tip" },
  { id: "small", name: "Small ears · stub tail", short: "Small", note: "the tail is a ball" },
];

export const GUESTS = {
  dachshund: { name: "Dachshund", mark: "floppy ears" },
  otter: { name: "Otter", mark: "a flat tail" },
  ferret: { name: "Ferret", mark: "a mask across the face" },
  dragon: { name: "Long dragon", mark: "only at New Year" },
};

/* The twelve drills. Every garment is these twelve, in this order (design doc section 2).
   rel = semitones above the drill's root; dur = seconds per note in the standard (golden) flavour.
   Lifted in spirit from the meme-games ladder; rewritten for this game. */
export const DRILLS = [
  { id: "long", name: "Long note", syl: "ah", rel: [0], dur: 2.4 },
  { id: "two", name: "Two notes", syl: "mm", rel: [0, 2], dur: 1.0 },
  { id: "doremi", name: "Do–Re–Mi", syl: "nay", rel: [0, 2, 4], dur: 1.0 },
  { id: "down3", name: "Three down", syl: "noo", rel: [4, 2, 0], dur: 1.0 },
  { id: "arp", name: "Arpeggio", syl: "oo", rel: [0, 4, 7], dur: 0.9 },
  { id: "five", name: "Five-note scale", syl: "mm", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.75 },
  { id: "skips", name: "Skips", syl: "yah", rel: [0, 4, 2, 5, 4], dur: 0.9 },
  { id: "octave", name: "Octave", syl: "wee", rel: [0, 12], dur: 1.2 },
  { id: "scale", name: "Scale", syl: "la", rel: [0, 2, 4, 5, 7, 9, 11, 12], dur: 0.7 },
  { id: "fast5", name: "Fast five", syl: "mm", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.55 },
  { id: "arp8", name: "Arpeggio + octave", syl: "oo", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.8 },
  { id: "free", name: "Free melody", syl: "la", free: true, dur: 0.8 },
];

/* The judge: the twelve faces it learns in the first garment (design doc section 2). */
export const TUTORIAL_FACES = [
  { id: "ear-flick", name: "Ear flick" }, { id: "brow", name: "One eyebrow up" }, { id: "slow-blink", name: "Slow blink" },
  { id: "nostrils", name: "Flared nostrils" }, { id: "head-tilt", name: "Head tilt" }, { id: "smirk", name: "Smirk" },
  { id: "slow-clap", name: "Slow clap" }, { id: "tear", name: "A single tear" }, { id: "nod", name: "Nod" },
  { id: "score10", name: "Holds up a 10" }, { id: "applause", name: "Wild applause" }, { id: "content-sleep", name: "Dozes off, content" },
];
/* What the judge does at the end of every note: three faces, one per level (the designer, 2026-11-13). The learned
   faces above are for the end of a take in which every note landed. */
export const NOTE_FACE = { good: "pleased", mid: "hmm", off: "oops" };
export const NOTE_WORD = { good: "On the note", mid: "Close", off: "Off the note" };
export const NOTE_GLYPH = { good: "✓", mid: "~", off: "?" };

/* Months. Places open on the 1st of each calendar month from LAUNCH; new players always start at place 1.
   January is the New Year special month: guests instead of cats (design doc section 7). */
export const LAUNCH = { year: 2026, month: 11 };
export const SPECIAL_MONTHS = { 1: "newyear" };
export const GUEST_BY_ZONE = { scarf: "ferret", top: "otter", bottom: "dachshund" };
export const NEWYEAR_NIGHT_SCARF = "dragon";

/* lines: one postcard sentence per time. The design doc gave one line per place; the other two are DRAFT.
   letter: the two-line invitation that arrives on the 1st (DRAFT except the doc's example format). */
export const PLACES = [
  { id: "onsen", name: "Hot spring", at: "at the hot spring", seat: "the stone rim, feet in the water", hit: "a water drop, plink", miss: "a plop",
    lines: { morning: "The mist hasn't lifted. It's already soaking.", golden: "It didn't say the water was too hot. It soaked.", night: "It didn't say the water was too hot. It fell asleep." },
    letter: ["The hot-spring monkeys invite the judge to soak its feet.", "They say the stone rim is warm."] },
  { id: "livingroom", name: "The judge's living room", at: "in its own living room", seat: "the armchair", hit: "a teacup touching its saucer", miss: "the cuckoo clock",
    lines: { morning: "It woke up in the armchair. It did not get up.", golden: "It went nowhere this month. This is home.", night: "Half the lights are off. The other half is cat." },
    letter: ["The armchair writes: “You haven't sat in me for ages.”", "This month the judge stays home."] },
  { id: "nightmarket", name: "Night market", at: "at the night market", seat: "a red plastic stool", hit: "a spatula on the wok", miss: "a balloon going down",
    lines: { morning: "The stalls aren't open yet. It sat down first.", golden: "It ordered one. It didn't eat it. It watched it.", night: "The stalls have packed up. It's still sitting." },
    letter: ["The egg-cake auntie invites the judge to the night market.", "She's keeping a red stool for it."] },
  { id: "train", name: "Train carriage", at: "on the train", seat: "the window seat", hit: "a ding", miss: "the whistle",
    lines: { morning: "First train. The window seat is its seat.", golden: "It watched the window the whole way. The window showed itself.", night: "Its stop came. It stayed on." },
    letter: ["The conductor invites the judge on a slow train.", "The window seat is saved for it."] },
  { id: "beach", name: "Beach", at: "at the beach", seat: "an upright beach chair", hit: "a small wave", miss: "a seagull laughing",
    lines: { morning: "The waves are small. So is it.", golden: "It didn't go in. Its job is watching the sea.", night: "The tide went out. It didn't." },
    letter: ["A hermit crab invites the judge to the beach.", "The chair has a straight back. No lying down."] },
  { id: "library", name: "Library", at: "at the library", seat: "an armchair by the window", hit: "a page turning", miss: "a long shhh",
    lines: { morning: "The library just opened. It was first in.", golden: "It borrowed a book. It hasn't opened it.", night: "The closing music is playing. It's still on page one." },
    letter: ["The librarian invites the judge to the seat by the window.", "Quiet, please. Singing excepted."] },
  { id: "camping", name: "Campsite", at: "at the campsite", seat: "a folding chair", hit: "the fire crackling", miss: "a mosquito",
    lines: { morning: "Mist outside the tent. It woke up first.", golden: "Before sunset it moved the chair a little closer.", night: "It stares at the fire. The fire stares back." },
    letter: ["A squirrel invites the judge camping.", "It says it will bring a folding chair."] },
  { id: "cinema", name: "Cinema", at: "at the cinema", seat: "a red velvet seat", hit: "one piece of popcorn", miss: "someone's phone ringing",
    lines: { morning: "The first showing. Just the judge.", golden: "The trailers are long. It is patient.", night: "It didn't watch the credits. It is the credits." },
    letter: ["The usher invites the judge to a film.", "Middle row, middle seat."] },
  { id: "bus", name: "Back of the bus", at: "on the back seat of the bus", seat: "the middle of the back row", hit: "the stop bell", miss: "brakes squealing",
    lines: { morning: "The early bus. Back row.", golden: "It missed its stop. It doesn't mind.", night: "The last bus. The driver glanced at it in the mirror." },
    letter: ["The bus driver invites the judge to ride to the end of the line.", "The middle of the back row is saved for it."] },
  { id: "museum", name: "Art museum", at: "at the art museum", seat: "a gallery bench", hit: "a camera shutter", miss: "the guard coughing",
    lines: { morning: "Not open yet. The guard nodded to it.", golden: "Someone thought it was an exhibit. It didn't deny it.", night: "The museum closed. It stayed with the paintings." },
    letter: ["The museum guard invites the judge to sit in the gallery.", "The bench is long. That's fine."] },
  { id: "rooftop", name: "Rainy rooftop", at: "on the rainy rooftop", seat: "a crate under the eaves", hit: "a raindrop", miss: "a pigeon cooing",
    lines: { morning: "Still raining. It's in no hurry.", golden: "It counts raindrops. It forgot halfway.", night: "The rain stopped. It didn't notice." },
    letter: ["The rooftop pigeons invite the judge in out of the rain.", "The crate is dry."] },
  { id: "skilift", name: "Snowy cable car", at: "in the snowy cable car", seat: "a cable car cabin with no bar", hit: "a bell", miss: "snow sliding off a branch",
    lines: { morning: "The first cabin up. Frost on the window.", golden: "The sun is low on the summit. It sits up straight.", night: "It went up. It came down. It said nothing." },
    letter: ["The snowman at the station invites the judge up the mountain.", "No bar across the cabin. Nothing in the way of the view."] },
];
export const PLACE_IDS = PLACES.map((p) => p.id);
export const placeById = (id) => PLACES.find((p) => p.id === id) || PLACES[0];
export const timeById = (id) => TIMES.find((t) => t.id === id) || TIMES[0];
export const zoneById = (id) => ZONES.find((z) => z.id === id) || ZONES[0];

export const NEWYEAR_LETTER = ["Happy New Year. A dachshund, an otter and a ferret are coming to visit the judge.", "This month the guests do the wrapping. At night, a long dragon too."];
export const MIX_LINE = "It says this doesn't match. It didn't take it off.";

/* The nine looks of a place: fur follows the time; each pattern is used once; each colour once per time and
   once per zone (a Latin square). Onsen is the design doc's table; other places rotate it (DRAFT). */
const ONSEN_LOOKS = {
  morning: { scarf: ["plain", "cream"], top: ["pin", "ginger"], bottom: ["freckles", "grey"] },
  golden: { scarf: ["bands3", "ginger"], top: ["rosettes", "grey"], bottom: ["spots", "cream"] },
  night: { scarf: ["bold", "grey"], top: ["tabby", "cream"], bottom: ["twotone", "ginger"] },
};
const PATTERN_IDS = PATTERNS.map((p) => p.id);
const PALETTE_ROT = ["grey", "ginger", "cream"];

export function garmentLook(placeId, timeId, zoneId) {
  const fur = timeById(timeId).fur;
  if (placeId === "onsen") {
    const [pattern, palette] = ONSEN_LOOKS[timeId][zoneId];
    return { fur, pattern, palette };
  }
  const p = Math.max(0, PLACE_IDS.indexOf(placeId));
  const ti = TIME_IDS.indexOf(timeId), zi = ZONE_IDS.indexOf(zoneId);
  const pattern = PATTERN_IDS[(p * 5 + ti * 3 + zi * 4) % PATTERN_IDS.length];
  const palette = PALETTE_ROT[(p + ti + zi * 2) % 3];
  return { fur, pattern, palette };
}

export function garmentName(timeId, zoneId) {
  return GARMENT_NAMES[timeId][zoneId];
}
