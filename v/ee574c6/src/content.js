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

/* Each time of day has its fur, its weather and its own ladder of drills (flavour = the ladder's name). */
export const TIMES = [
  { id: "morning", name: "Morning", fur: "short", weather: "Cool, the mist hasn't lifted", flavour: "Land", how: "short, slow notes close together: landing each one" },
  { id: "golden", name: "Golden hour", fur: "mid", weather: "Warm, the sun low and slanting", flavour: "Move", how: "scales and leaps, up to an octave" },
  { id: "night", name: "Night", fur: "long", weather: "Cold, time for something thicker", flavour: "Carry", how: "long notes and long, slow phrases; quiet is fine" },
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

/* The drills (drill-ladder board, proposal 丙, the designer 2026-11-14). rel = semitones above the drill's root (the
   lowest note is placed in the singer's range, so a rel may be negative); dur = seconds per note at golden hour.
   What a drill is sung on is not here: the sound belongs to the cat (SOUNDS below). */
export const DRILL = {
  long: { name: "Long note", rel: [0], dur: 2.4 },
  long2: { name: "Same note twice", rel: [0, 0], dur: 1.6 },
  hold4: { name: "Long hold", rel: [0], dur: 4.0 },
  hold5: { name: "Longer hold", rel: [0], dur: 5.0 },
  two: { name: "Two notes", rel: [0, 2], dur: 1.0 },
  twodown: { name: "Two down", rel: [2, 0], dur: 1.4 },
  nbup: { name: "Neighbour up", rel: [0, 2, 0], dur: 1.0 },
  nbdown: { name: "Neighbour down", rel: [0, -2, 0], dur: 1.0 },
  doremi: { name: "Do–Re–Mi", rel: [0, 2, 4], dur: 1.0 },
  down3: { name: "Three down", rel: [4, 2, 0], dur: 1.0 },
  arc: { name: "Up and back", rel: [0, 2, 4, 2, 0], dur: 0.9 },
  fiveup: { name: "Five up", rel: [0, 2, 4, 5, 7], dur: 0.85 },
  fivedown: { name: "Five down", rel: [7, 5, 4, 2, 0], dur: 0.85 },
  five: { name: "Five-note scale", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.75 },
  fast5: { name: "Fast five", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.55 },
  scaleup: { name: "Scale", rel: [0, 2, 4, 5, 7, 9, 11, 12], dur: 0.7 },
  scaledown: { name: "Scale down", rel: [12, 11, 9, 7, 5, 4, 2, 0], dur: 0.7 },
  third: { name: "Third", rel: [0, 4], dur: 1.0 },
  thirdback: { name: "Third and back", rel: [0, 4, 0], dur: 1.0 },
  arp: { name: "Arpeggio", rel: [0, 4, 7], dur: 0.9 },
  arpdown: { name: "Arpeggio down", rel: [7, 4, 0], dur: 0.9 },
  arpud: { name: "Arpeggio and back", rel: [0, 4, 7, 4, 0], dur: 0.85 },
  fifth: { name: "Fifth", rel: [0, 7], dur: 1.1 },
  skips: { name: "Skips", rel: [0, 4, 2, 5, 4], dur: 0.9 },
  octave: { name: "Octave", rel: [0, 12], dur: 1.2 },
  octdown: { name: "Octave down", rel: [12, 0], dur: 1.2 },
  arp8: { name: "Arpeggio + octave", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.8 },
  penta: { name: "Pentatonic arc", rel: [0, 2, 4, 7, 4, 2, 0], dur: 0.85 },
  free5: { name: "Short melody", free: { notes: 5, top: 2 }, dur: 0.9 },
  free: { name: "Free melody", free: { notes: 8, top: 7 }, dur: 0.8 },
};
for (const [id, d] of Object.entries(DRILL)) d.id = id;

/* One ladder of twelve steps per time of day: a month runs Land, then Move, then Carry. Each ladder climbs by
   length and by a rough difficulty index (docs/design/longcat-drill-ladder.md); the last step is a small melody. */
export const LADDERS = {
  morning: ["long", "long2", "two", "nbup", "nbdown", "doremi", "down3", "arc", "third", "fiveup", "thirdback", "free5"],
  golden: ["arp", "arpdown", "fivedown", "arpud", "skips", "fifth", "five", "fast5", "scaleup", "arp8", "octave", "free"],
  night: ["twodown", "hold4", "down3", "arc", "fivedown", "arpdown", "hold5", "penta", "five", "scaledown", "octdown", "free"],
};
export const ladderFor = (timeId) => (LADDERS[timeId] || LADDERS.golden).map((id) => DRILL[id]);
export const drillAt = (timeId, step) => ladderFor(timeId)[Math.max(1, Math.min(STEPS, step)) - 1];

/* The drill editor (dev tools, the designer 2026-11-14): the designer moves and edits drills on the phone. The edits live in the
   save (S.dev.drillEdits) and are laid over the tables above when the game starts and after every change, so
   everything that reads DRILL / LADDERS sees them. Shape: { ladders: { morning: [twelve ids] }, drills: { id:
   { name, rel, dur } | { name, free: { notes, top }, dur } } }. Nothing here is graded differently. */
const clone = (o) => JSON.parse(JSON.stringify(o));
const BUILT_IN = { drills: clone(DRILL), ladders: clone(LADDERS) };
export const builtInDrills = () => clone(BUILT_IN);
export const DRILL_LIMITS = { notes: 16, low: -12, high: 24, span: 19, durMin: 0.3, durMax: 8 };

/* One drill from untrusted input (a save, or text pasted into the editor); null when it cannot be sung. */
export function cleanDrill(d) {
  if (!d || typeof d !== "object") return null;
  const L = DRILL_LIMITS, dur = Number(d.dur);
  if (!(dur >= L.durMin && dur <= L.durMax)) return null;
  const name = String(d.name ?? "").trim().slice(0, 40) || "Drill";
  if (d.free) {
    const notes = Math.round(Number(d.free.notes)), top = Math.round(Number(d.free.top));
    if (!(notes >= 2 && notes <= 12 && top >= 1 && top <= 7)) return null;
    return { name, free: { notes, top }, dur };
  }
  if (!Array.isArray(d.rel) || !d.rel.length || d.rel.length > L.notes) return null;
  const rel = d.rel.map(Number);
  if (rel.some((r) => !Number.isInteger(r) || r < L.low || r > L.high)) return null;
  if (Math.max(...rel) - Math.min(...rel) > L.span) return null;
  return { name, rel, dur };
}
/* The whole set of edits, cleaned: anything that does not fit is dropped, never half applied. */
export function cleanDrillEdits(e) {
  const out = { ladders: {}, drills: {} };
  if (!e || typeof e !== "object") return out;
  for (const [id, d] of Object.entries(e.drills || {})) {
    const c = /^[a-z0-9_]{1,24}$/.test(id) ? cleanDrill(d) : null;
    if (c) out.drills[id] = c;
  }
  const known = (id) => typeof id === "string" && (id in out.drills || id in BUILT_IN.drills);
  for (const t of TIME_IDS) {
    const l = e.ladders?.[t];
    if (Array.isArray(l) && l.length === STEPS && l.every(known)) out.ladders[t] = [...l];
  }
  return out;
}
export const drillEditCount = (e) => Object.keys(e?.ladders || {}).length + Object.keys(e?.drills || {}).length;
/* Lay the edits over the built-in tables (null = back to the built-in ones). Returns what was applied. */
export function applyDrillEdits(e) {
  const c = cleanDrillEdits(e), base = clone(BUILT_IN);
  for (const k of Object.keys(DRILL)) delete DRILL[k];
  Object.assign(DRILL, base.drills, clone(c.drills));
  for (const [id, d] of Object.entries(DRILL)) d.id = id;
  for (const t of TIME_IDS) LADDERS[t] = c.ladders[t] || base.ladders[t];
  return c;
}

/* Each cat has its own sound, the same shapes sung three ways. A mouth is what the lane cat's face shows:
   mm (closed), oo (small and round), ee (wide), ah (open), ay (half open). The game listens to pitch only, so
   it cannot tell which sound was sung; the sound is a suggestion, never graded. */
export const SOUNDS = {
  scarf: { cat: "Hum cat", syl: { morning: "mm", golden: "mm", night: "mm" } },
  top: { cat: "Oo cat", syl: { morning: "oo", golden: "noo", night: "oo" } },
  bottom: { cat: "Ah cat", syl: { morning: "ah", golden: "yah", night: "ah" } },
};
export const MOUTH = { mm: "mm", oo: "oo", noo: "oo", woo: "oo", ee: "ee", wee: "ee", ah: "ah", yah: "ah", nah: "ah", la: "ah", nay: "ay" };
export const sylFor = (zoneId, timeId) => (SOUNDS[zoneId] || SOUNDS.bottom).syl[timeId] || "ah";

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
