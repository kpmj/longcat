/* Game content: every id, name and line the game uses, in English (the designer, 2026-11-12). Ids match docs/art-contract.md.
   Source: docs/design/longcat-judge-proposals.md (version 12) plus the designer's fourth reply (2026-11-12).
   Anything marked DRAFT is placeholder copy written for the demo, not yet approved by the designer. */

export const STEPS = 12;

export const ZONES = [
  { id: "scarf", name: "Scarf", where: "neck", aim: "Agility", how: "quick notes, from low to high" },
  { id: "top", name: "Top", where: "chest to belly", aim: "Breath", how: "few notes, held long" },
  { id: "bottom", name: "Hat", where: "head", aim: "Range", how: "wide skips and leaps, to the edges of your voice" },
];
export const ZONE_IDS = ZONES.map((z) => z.id);

/* Each time of day has its fur and its weather. `flavour` and `how` are from when a time of day had one ladder
   of drills for all three garments (until 2026-11-25); now each garment has a ladder for each time of day (ZONES:
   aim, how; LADDERS, LADDER_HOW), and no screen shows these two any more. */
export const TIMES = [
  { id: "morning", name: "Morning", fur: "short", weather: "Cool, the mist hasn't lifted", flavour: "Land", how: "short shapes, sung once: landing each note" },
  { id: "golden", name: "Golden hour", fur: "mid", weather: "Warm, the sun low and slanting", flavour: "Move", how: "phrases in three rounds, a step higher or lower each time" },
  { id: "night", name: "Night", fur: "long", weather: "Cold, the steam hangs in the air", flavour: "Carry", how: "about a minute of rounds, up and back; quiet is fine" },
];
export const TIME_IDS = TIMES.map((t) => t.id);

/* Garment names per time and zone (design doc section 1). Every place uses the same nine names for now. */
/* A garment's size is its knit weight, and that comes from the cat that sings it (the designer, 2026-11-22: "I really can't
   tell the size of the scarf … let's have the different cat type to define the size of the scarf"; until then it
   followed the time of day, and Dress up had a row to pick which time's garment to show). The art still calls the
   weight `fur`: short is thin, mid is medium, long is thick. A cat's weight goes with its shape: the bushy and the
   stocky ones knit thick, the sleek ones thin (my assignment, at the designer's word: "assign based on … whatever makes
   sense"). A charm does not change it. */
export const KNITS = [{ id: "short", name: "Thin" }, { id: "mid", name: "Medium" }, { id: "long", name: "Thick" }];
const KNIT_OF = {
  point: "short", big: "short",              // pointy ears and a long tail; big ears and a thin tail: sleek
  small: "mid", curl: "mid", round: "mid",   // small ears and a stub tail; curled ears; round ears: middling
  tuft: "long", fold: "long",                // tufted ears and a bushy tail; folded ears and a short thick tail: plush
  ferret: "short", dachshund: "mid", otter: "long", dragon: "long",
};
export const knitOf = (id) => KNIT_OF[String(id || "").split("+")[0]] || "mid";
export const knitName = (id) => KNITS.find((k) => k.id === knitOf(id)).name;
/* what a garment is called at each weight: "Thin scarf", "Vest", "Wool hat" */
export const GARMENT_NAMES = {
  short: { scarf: "Thin scarf", top: "Light top", bottom: "Light cap" },
  mid: { scarf: "Scarf", top: "Vest", bottom: "Cap" },
  long: { scarf: "Thick scarf", top: "Sweater", bottom: "Wool hat" },
};
/* a garment by its weight, for where the singer is known (state.js garmentTitle) */
export const knitGarment = (knit, zoneId) => (GARMENT_NAMES[knit] || GARMENT_NAMES.mid)[zoneId];

export const PATTERNS = [
  { id: "plain", name: "Plain" }, { id: "twotone", name: "Two-tone" }, { id: "bands3", name: "Three rings" },
  { id: "pale3", name: "Three pale rings" }, { id: "rosettes", name: "Rosettes" }, { id: "stripes5", name: "Five fine stripes" },
  { id: "spots", name: "Spots" }, { id: "bold", name: "One bold band" }, { id: "tabby", name: "Tabby" },
  { id: "pin", name: "Pinstripes" }, { id: "rosebold", name: "Rosettes and a band" }, { id: "freckles", name: "Freckles" },
];
export const PALETTE_NAMES = { grey: "grey", ginger: "ginger", cream: "cream" };

/* The cats. Until 2026-11-14 the kind was a free setting per body part. Now the cats are cast, not chosen (the designer,
   2026-11-14: "每個月有三個不同的貓種 … 玩家沒辦法選哪隻貓是哪個部位 我們可以自己決定 貓的部分沒有解鎖或選擇自由"):
   every month has its own three, one per garment, set in KIND_CAST below. What the player chooses is the coat
   (state.js, coats).
   A cat is a shape (ears and a tail) and maybe a charm by one ear (the designer, the same day: "多畫幾個貓種 也不一定用貓種
   分辨 也可以放一些裝飾品在貓的頭上來創造出不同的貓"). Its id is "shape" or "shape+charm", the `kind` the art takes. */
export const CAT_KINDS = [
  { id: "point", name: "Pointy ears · long tail", short: "Pointy", note: "a long tail curled at the tip" },
  { id: "big", name: "Big ears · thin tail", short: "Big ears", note: "ears set wide" },
  { id: "tuft", name: "Tufted ears · bushy tail", short: "Tufted", note: "a tuft on each ear tip" },
  { id: "small", name: "Small ears · stub tail", short: "Small", note: "the tail is a ball" },
  { id: "fold", name: "Folded ears · short thick tail", short: "Folded", note: "the ear tips fold forward" },
  { id: "curl", name: "Curled ears · rolled tail", short: "Curled", note: "the ears arc back, the tail rolls over" },
  { id: "round", name: "Round ears · ringed tail", short: "Round", note: "two rings near the tail's tip" },
];
export const CAT_CHARMS = [
  { id: "camellia", name: "a camellia" }, { id: "plum", name: "a plum blossom" }, { id: "leaf", name: "a leaf" },
  { id: "bow", name: "a bow" }, { id: "bell", name: "a bell" }, { id: "berry", name: "red berries" },
  /* the jungle's cats wear these (2026-11-23); no other cat does */
  { id: "hibiscus", name: "a hibiscus" }, { id: "feather", name: "a feather" }, { id: "banana", name: "a banana" },
];
/* a cat in words: { shape: "Folded", charm: "a bow" | "" } */
export function catWords(kind) {
  const [shape, charm] = String(kind || "").split("+");
  return { shape: (CAT_KINDS.find((k) => k.id === shape) || CAT_KINDS[0]).short, charm: (CAT_CHARMS.find((c) => c.id === charm) || { name: "" }).name };
}

export const GUESTS = {
  dachshund: { name: "Dachshund", mark: "floppy ears" },
  otter: { name: "Otter", mark: "a flat tail" },
  ferret: { name: "Ferret", mark: "a mask across the face" },
  dragon: { name: "Long dragon", mark: "only at New Year" },
};

/* The drills (drill-ladder board, proposal 丙, the designer 2026-11-14). The names say what the singer does, in plain
   words (2026-11-24): a step, half a step, a skip (a third), a wide skip (a fourth), a leap (a fifth), a long leap
   (a sixth), a big leap (an octave); "dark" or "darker" is the lowered third step. The notes further down about
   how the ladders were dealt in 2026-11-15 use the names of that day ("Arpeggio down", "Five-note scale").
   rel = semitones above the drill's root (the lowest note is placed in the singer's range, so a rel may be
   negative); dur = the seconds a note gets, the gap before the next note included (drills.js gapOf).
   What a drill is sung on is not here: the sound belongs to the cat (SOUNDS below).
   How many times a drill is sung is not here either: the step decides (drills.js STEP_RULE, the designer 2026-11-25):
   once in steps 1 to 4, three sets in steps 5 to 8, five in steps 9 to 12. From 2026-11-14 to then a drill carried
   its own `climb`, and only steps 10 to 12 of a ladder had one.
   The drills stand here in the order of their ladders (LADDERS below): nine ladders of twelve, 108 drills, each in
   one step of one ladder. */
export const DRILL = {
  /* the scarf, morning */
  doremi: { name: "Three steps up", rel: [0, 2, 4], dur: 0.8 },
  fourup: { name: "Four steps up", rel: [0, 2, 4, 5], dur: 0.7 },
  fiveup: { name: "Five steps up", rel: [0, 2, 4, 5, 7], dur: 0.6 },
  sixup: { name: "Six steps up", rel: [0, 2, 4, 5, 7, 9], dur: 0.56 },
  then5: { name: "Three up, then five up", rel: [0, 2, 4, 0, 2, 4, 5, 7], dur: 0.6 },
  scaleup: { name: "Eight steps up", rel: [0, 2, 4, 5, 7, 9, 11, 12], dur: 0.6 },
  stairs: { name: "Threes up the stairs", rel: [0, 2, 4, 2, 4, 5, 4, 5, 7], dur: 0.58 },
  eighthome: { name: "Eight up, one big leap home", rel: [0, 2, 4, 5, 7, 9, 11, 12, 0], dur: 0.57 },
  climb5: { name: "Climbing five", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.62 },
  twice: { name: "Every step twice", rel: [0, 0, 2, 2, 4, 4, 5, 5, 7, 7], dur: 0.55 },
  nextfive: { name: "Five up, then five from the next step", rel: [0, 2, 4, 5, 7, 2, 4, 5, 7, 9], dur: 0.55 },
  sixskips: { name: "Six up, and skips home", rel: [0, 2, 4, 5, 7, 9, 7, 4, 0], dur: 0.6 },
  /* the scarf, golden hour */
  arc: { name: "Up three and back", rel: [0, 2, 4, 2, 0], dur: 0.6 },
  turn: { name: "One step, then three", rel: [0, 2, 0, 2, 4], dur: 0.6 },
  skips: { name: "Zigzag", rel: [0, 4, 2, 5, 4], dur: 0.6 },
  zigup: { name: "Zigzag up", rel: [0, 4, 2, 5, 4, 7], dur: 0.56 },
  arc4: { name: "Up four and back", rel: [0, 2, 4, 5, 4, 2, 0], dur: 0.6 },
  penta: { name: "Steps, a skip, and back", rel: [0, 2, 4, 7, 4, 2, 0], dur: 0.62 },
  fiveskip: { name: "Five up, two skips home", rel: [0, 2, 4, 5, 7, 4, 0], dur: 0.62 },
  gaps: { name: "Steps and skips to the top", rel: [0, 2, 4, 7, 9, 12], dur: 0.64 },
  arp8: { name: "Skips to the top and back", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.66 },
  zigtop: { name: "Zigzag all the way up", rel: [0, 4, 2, 5, 4, 7, 5, 9, 7, 12], dur: 0.55 },
  gapsback: { name: "Over the gaps and back", rel: [0, 2, 4, 7, 9, 7, 4, 2, 0], dur: 0.62 },
  fivetop: { name: "Five up, on to the top, skips home", rel: [0, 2, 4, 5, 7, 12, 7, 4, 0], dur: 0.6 },
  /* the scarf, night */
  dark3: { name: "Three dark steps up", rel: [0, 2, 3], dur: 0.8 },
  darkarc: { name: "Up three and back, darker", rel: [0, 2, 3, 2, 0], dur: 0.6 },
  dark5: { name: "Five dark steps up", rel: [0, 2, 3, 5, 7], dur: 0.6 },
  darkzig: { name: "The darker zigzag", rel: [0, 3, 2, 5, 3], dur: 0.6 },
  dark4: { name: "Up four and back, darker", rel: [0, 2, 3, 5, 3, 2, 0], dur: 0.6 },
  darkskip: { name: "Five dark steps, two skips home", rel: [0, 2, 3, 5, 7, 3, 0], dur: 0.62 },
  dark8: { name: "Eight dark steps up", rel: [0, 2, 3, 5, 7, 8, 10, 12], dur: 0.6 },
  darkgaps: { name: "Dark steps and skips to the top", rel: [0, 3, 5, 7, 10, 12], dur: 0.64 },
  minor5: { name: "The darker five", rel: [0, 2, 3, 5, 7, 5, 3, 2, 0], dur: 0.62 },
  darkarp8: { name: "Dark skips to the top and back", rel: [0, 3, 7, 12, 7, 3, 0], dur: 0.66 },
  darkstairs: { name: "Dark threes up the stairs", rel: [0, 2, 3, 2, 3, 5, 3, 5, 7], dur: 0.6 },
  darkgapsback: { name: "Over the dark gaps and back", rel: [0, 3, 5, 7, 10, 7, 5, 3, 0], dur: 0.62 },
  /* the top, morning */
  long: { name: "One long note", rel: [0], dur: 3.2 },
  two: { name: "One step up", rel: [0, 2], dur: 1.7 },
  nbup: { name: "Step up and back", rel: [0, 2, 0], dur: 1.15 },
  nbdown: { name: "Step down and back", rel: [0, -2, 0], dur: 1.15 },
  hold4: { name: "A longer note", rel: [0], dur: 4.2 },
  stay2: { name: "Step up, stay, step home", rel: [0, 2, 2, 0], dur: 1.2 },
  nbup2: { name: "Step up and back, twice", rel: [0, 2, 0, 2, 0], dur: 1 },
  nbdown2: { name: "Step down and back, twice", rel: [0, -2, 0, -2, 0], dur: 1 },
  hold5: { name: "The longest note", rel: [0], dur: 5 },
  nbboth: { name: "A step each way", rel: [0, 2, 0, -2, 0], dur: 0.98 },
  up3hold: { name: "Three long steps up", rel: [0, 2, 4], dur: 1.9 },
  valley: { name: "Down three and back up", rel: [4, 2, 0, 2, 4], dur: 1 },
  /* the top, golden hour */
  long2: { name: "The same note twice", rel: [0, 0], dur: 1.7 },
  third: { name: "Skip up", rel: [0, 4], dur: 1.7 },
  thirddown: { name: "Skip down", rel: [4, 0], dur: 1.7 },
  thirdback: { name: "Skip up and back", rel: [0, 4, 0], dur: 1.15 },
  same3: { name: "The same note three times", rel: [0, 0, 0], dur: 1.8 },
  dipskip: { name: "Skip down and back", rel: [0, -3, 0], dur: 1.4 },
  walkhome: { name: "Skip up, walk home", rel: [0, 4, 2, 0], dur: 1.2 },
  skiphome: { name: "Three up, skip home", rel: [0, 2, 4, 0], dur: 1.2 },
  skipstay: { name: "Skip up, stay, and home", rel: [0, 4, 4, 0], dur: 1.3 },
  skipboth: { name: "A skip each way", rel: [0, 4, 0, -3, 0], dur: 1 },
  thirdback2: { name: "Skip up and back, twice", rel: [0, 4, 0, 4, 0], dur: 1 },
  leanover: { name: "Skip up, half a step more, and home", rel: [0, 4, 5, 4, 0], dur: 1 },
  /* the top, night */
  twodown: { name: "One step down", rel: [2, 0], dur: 1.7 },
  halfdown: { name: "Half a step down", rel: [1, 0], dur: 1.7 },
  halfback: { name: "Half a step down and back", rel: [0, -1, 0], dur: 1.15 },
  down3: { name: "Three steps down", rel: [4, 2, 0], dur: 1.15 },
  darkdown: { name: "Dark skip down", rel: [3, 0], dur: 2 },
  darkdown3: { name: "Three dark steps down", rel: [3, 2, 0], dur: 1.4 },
  fourdown: { name: "Four steps down", rel: [5, 4, 2, 0], dur: 1.2 },
  darkback: { name: "Dark skip up and back", rel: [0, 3, 0], dur: 1.8 },
  darkfour: { name: "Four dark steps down", rel: [5, 3, 2, 0], dur: 1.3 },
  darkfive: { name: "Five dark steps down", rel: [7, 5, 3, 2, 0], dur: 1 },
  halfboth: { name: "Half a step each way", rel: [0, 1, 0, -1, 0], dur: 1 },
  hold6: { name: "The longest note of all", rel: [0], dur: 5.8 },
  /* the hat, morning */
  fourth: { name: "Wide skip up", rel: [0, 5], dur: 1.5 },
  fifth: { name: "Leap up", rel: [0, 7], dur: 1.5 },
  arp: { name: "Two skips up", rel: [0, 4, 7], dur: 1.1 },
  sixth: { name: "Long leap up", rel: [0, 9], dur: 1.5 },
  fifthoct: { name: "Two leaps up", rel: [0, 7, 12], dur: 1.3 },
  octave: { name: "Big leap up", rel: [0, 12], dur: 2 },
  arp4: { name: "Skips all the way up", rel: [0, 4, 7, 12], dur: 0.9 },
  steptop: { name: "Five steps up, then on to the top", rel: [0, 2, 4, 5, 7, 12], dur: 0.66 },
  octstay: { name: "Big leap up, and stay", rel: [0, 12, 12], dur: 1.4 },
  oct2: { name: "Big leap up, twice", rel: [0, 12, 0, 12], dur: 1.2 },
  fourwide: { name: "Wide skip, step, wide skip", rel: [0, 5, 7, 12], dur: 1.2 },
  topagain: { name: "To the top, dip, and the top again", rel: [0, 7, 12, 7, 12], dur: 1 },
  /* the hat, golden hour */
  fourthback: { name: "Wide skip and back", rel: [0, 5, 0], dur: 1.1 },
  fifthback: { name: "Leap and back", rel: [0, 7, 0], dur: 1.1 },
  arpud: { name: "Two skips up and back", rel: [0, 4, 7, 4, 0], dur: 0.6 },
  sixback: { name: "Long leap and back", rel: [0, 9, 0], dur: 1.1 },
  octback: { name: "Big leap and back", rel: [0, 12, 0], dur: 1.3 },
  wider2: { name: "A skip, then a leap", rel: [0, 4, 0, 7, 0], dur: 0.9 },
  leapsback: { name: "Two leaps up and back", rel: [0, 7, 12, 7, 0], dur: 0.9 },
  wider3: { name: "Wider every time", rel: [0, 5, 0, 7, 0, 12, 0], dur: 0.62 },
  leapbig: { name: "A leap, then a big leap", rel: [0, 7, 0, 12, 0], dur: 1 },
  octback2: { name: "Big leap and back, twice", rel: [0, 12, 0, 12, 0], dur: 1 },
  bothways: { name: "A leap up, a wide skip down", rel: [0, 7, 0, -5, 0], dur: 1 },
  topskips: { name: "Big leap up, skips home", rel: [0, 12, 7, 4, 0], dur: 1 },
  /* the hat, night */
  fourthdown: { name: "Wide skip down", rel: [5, 0], dur: 1.5 },
  fifthdown: { name: "Leap down", rel: [7, 0], dur: 1.5 },
  arpdown: { name: "Two skips down", rel: [7, 4, 0], dur: 1.1 },
  darkarpdown: { name: "Two dark skips down", rel: [7, 3, 0], dur: 1.1 },
  octdown: { name: "Big leap down", rel: [12, 0], dur: 2 },
  arp4down: { name: "Skips all the way down", rel: [12, 7, 4, 0], dur: 0.9 },
  fivedown: { name: "Five steps down", rel: [7, 5, 4, 2, 0], dur: 0.9 },
  leapsdown: { name: "Two leaps down", rel: [12, 7, 0], dur: 1.3 },
  scaledown: { name: "Eight steps down", rel: [12, 11, 9, 7, 5, 4, 2, 0], dur: 0.66 },
  darkarp4down: { name: "Dark skips all the way down", rel: [12, 7, 3, 0], dur: 1.3 },
  octdownstay: { name: "Big leap down, and stay", rel: [12, 0, 0], dur: 1.4 },
  darkscaledown: { name: "Eight dark steps down", rel: [12, 10, 8, 7, 5, 3, 2, 0], dur: 0.66 },
};
/* What the card of a drill says (the designer, 2026-11-24, after Vocalista's intro card): a goal in a few words and one line
   of how, about the body and the breath as much as the notes. Kept apart from DRILL so a drill edited in the dev
   tools keeps its card; a drill made there has none. DRAFT: written by the agent, to be read by the designer or by someone
   who teaches singing before the web test (docs/later.md). The names above say what the singer does ("Step down
   and back"), not what a musician calls it ("Neighbour down"); the sound is the cat's, so it is not in the name. */
export const DRILL_CARD = {
  /* the scarf, morning */
  doremi: ["Even steps.", "Give every note the same length and the same loudness. No rush to the top."],
  fourup: ["Four even steps.", "Walk up without leaning on any of them. The last note is as easy as the first."],
  fiveup: ["Climb five without pushing.", "Stay as light on the fifth note as on the first."],
  sixup: ["One step past the five.", "Keep the sound small and quick. Let the breath, not the jaw, do the climbing."],
  then5: ["A short run, then a longer one.", "Three up, start again, and go on to five. Don’t breathe in the middle."],
  scaleup: ["All eight on one breath.", "Breathe in low before you start and spend the air evenly, a little for every note."],
  stairs: ["Three steps at a time.", "Up three, begin again one step higher, and again. Keep every note the same size."],
  eighthome: ["Run up, drop home.", "Eight quick steps, then let go and land on the note you started from."],
  climb5: ["Keep it easy all the way up.", "The same hill each round, one step higher. If it gets tight, sing softer, not harder."],
  twice: ["Two taps on every step.", "Touch each note twice, lightly, like knocking. Keep the beat exactly even."],
  nextfive: ["Five up, and five up again.", "The second run starts one step higher. Hear its first note before you get there."],
  sixskips: ["Six up, the quick way home.", "Walk up six steps, then come down in skips. Keep the way down as light as the way up."],
  /* the scarf, golden hour */
  arc: ["One smooth curve.", "Sing it on one breath, up and back, like drawing a small hill."],
  turn: ["A small turn before the run.", "Step up, come back, then go up three. The turn is as quick as the rest."],
  skips: ["Keep your place while it turns.", "It goes up, back a little, and up again. Go through it in your head before you sing."],
  zigup: ["Zigzag, and keep climbing.", "Skip up, step back, skip up again. Each pair lands one step higher."],
  arc4: ["A slightly bigger hill.", "Four steps up and back on one breath. Turn at the top without stopping."],
  penta: ["A wide curve on one breath.", "Two steps, one skip to the top, and home the same way. No hurry at the top."],
  fiveskip: ["Walk up, skip home.", "Five even steps to the top, then two skips down. Land the last note as gently as you left it."],
  gaps: ["Up to the top, over two gaps.", "Steps with two skips in them. Hear where the gaps are before you sing."],
  arp8: ["The whole height in one go.", "Four notes up and the same way down. Let the top one be the lightest."],
  zigtop: ["Zigzag all the way to the top.", "Small sound, loose jaw. Think of the line climbing, not of each turn."],
  gapsback: ["Over the gaps, there and back.", "The same notes home as on the way up. Keep the turn at the top smooth."],
  fivetop: ["Run, reach the top, skip home.", "Five steps, one wide skip to the top, then down in skips. Lighter as you go higher."],
  /* the scarf, night */
  dark3: ["Three steps, the last one closer.", "The third note sits nearer than you expect. Hear it before you sing it."],
  darkarc: ["A small dark hill.", "Up three and back, with the closer third step. Keep it quiet and even."],
  dark5: ["Five steps in the darker colour.", "Only the third step is different. Let it sit low, and walk on."],
  darkzig: ["The zigzag, darker.", "Skip up, step back, skip up. The skips are a little narrower here."],
  dark4: ["A dark hill, four steps high.", "Up four and back on one breath. The same notes home."],
  darkskip: ["Walk up, skip home, darker.", "Five steps up, then two skips down. Land the last note gently."],
  dark8: ["All eight, the darker way.", "Three of the eight sit lower than you expect. Listen once, then spend the air evenly."],
  darkgaps: ["To the top, over the dark gaps.", "Six notes with gaps between. Hear the gaps first, and stay light at the top."],
  minor5: ["Hear the third note sit lower.", "It is the five-note hill with a sadder third step. Listen for it before you sing."],
  darkarp8: ["The whole height, darker.", "Four notes up and the same way down. The second note is the one that sits low."],
  darkstairs: ["Three dark steps at a time.", "Up three, begin again one step higher, and again. Keep it quiet and quick."],
  darkgapsback: ["Over the dark gaps and back.", "Up to the top and home the same way. Don’t rush the turn."],
  /* the top, morning */
  long: ["Find the note and stay.", "Breathe in low, start gently, and let the sound run to the end without pushing."],
  two: ["Move without sliding.", "Hear the second note in your head before you go, then step onto it."],
  nbup: ["Come home to the same note.", "Go up one step and return. The last note should match the first."],
  nbdown: ["Dip and come home.", "Let the lower note sit lightly, then return to where you began."],
  hold4: ["A long note, steady.", "Breathe in through your nose, start quietly, and keep the sound the same from start to end."],
  stay2: ["Go up, rest there, come home.", "Sing the upper note twice, the same both times, before you step back down."],
  nbup2: ["Up and home, twice, on one breath.", "Don’t breathe in the middle. Home sounds the same all three times."],
  nbdown2: ["Dip and home, twice, on one breath.", "Let the lower note sit lightly. Spend the air evenly to the last note."],
  hold5: ["Longer still, without shaking.", "Use less air than you think. A quiet steady note beats a loud wobbly one."],
  nbboth: ["Stay centred.", "Up a step, home, down a step, home. Home should sound the same all three times."],
  up3hold: ["Three long notes, each one higher.", "Hold each one to the end of its bar. Keep the breath flowing as you step up."],
  valley: ["Down and back up on one breath.", "Start at the top, walk down three and return. The last note matches the first."],
  /* the top, golden hour */
  long2: ["Land on it twice.", "Take a small breath in between, and start the second note exactly where the first one was."],
  third: ["Jump over a note.", "Think of the note in between, then leave it out and land cleanly."],
  thirddown: ["Come down over a note.", "Think of the note in between, leave it out, and land softly on the lower one."],
  thirdback: ["Jump and return.", "Keep your jaw and shoulders loose. The last note should match the first."],
  same3: ["Three long notes, all the same.", "A small breath between each. Start every one exactly where the last one was."],
  dipskip: ["Skip down and come home.", "Keep the breath moving on the lower note, so the way back is easy."],
  walkhome: ["Skip up, walk home.", "One skip up, then two slow steps down. All on one breath."],
  skiphome: ["Three slow steps, one skip home.", "Three slow steps, then one skip back down. Land where you began."],
  skipstay: ["Skip up and stay a while.", "Sing the upper note twice before you come home. Use less air than you think."],
  skipboth: ["A skip each way, home between.", "Up a skip, home, down a skip, home. Home sounds the same every time."],
  thirdback2: ["The same skip twice, one breath.", "Skip up and back, and again. Keep enough air for the second time."],
  leanover: ["A skip, and a little further.", "From the top of the skip go half a step higher, come back, and skip home."],
  /* the top, night */
  twodown: ["Settle onto the lower note.", "Slow and soft. Let the second note rest; don’t press it down."],
  halfdown: ["The smallest step down.", "The two notes are next-door neighbours. Let the second one settle; don’t slide."],
  halfback: ["Lean down and come back.", "Half a step under and home again. The last note matches the first."],
  down3: ["Come down without sagging.", "Keep the breath moving as you go down, so the last note doesn’t sink."],
  darkdown: ["A dark skip down, slowly.", "Two long notes. Keep the breath flowing so the lower one doesn’t sink."],
  darkdown3: ["Three dark steps down.", "The first step is only half, the second a whole one. Let each note rest."],
  fourdown: ["Walk down calmly.", "Each note a little lower, none of them heavier. Keep the air flowing to the last one."],
  darkback: ["A dark skip up and home.", "Long notes. Go up a little less far than a bright skip, and return."],
  darkfour: ["Walk down four, darker.", "Slow and soft. Each note a little lower, none of them heavier."],
  darkfive: ["Five dark steps down, one breath.", "Begin gently at the top, so there is air left for the bottom."],
  halfboth: ["Half a step each way.", "Up a little, home, down a little, home. Home sounds the same all three times."],
  hold6: ["One breath, as long as it goes.", "Quiet and steady. Use as little air as you can and let it run to the end."],
  /* the hat, morning */
  fourth: ["A wide skip up.", "Hear the top note first, then go straight there without sliding."],
  fifth: ["A clean leap.", "Don’t reach up with your chin. Look straight ahead and let the breath carry it."],
  arp: ["Skip, skip, land.", "Three notes far apart: keep your mouth the same shape and let the pitch do the moving."],
  sixth: ["A long leap up.", "One step further than the leap. Keep your chin level and let the breath carry it."],
  fifthoct: ["Leap, then leap again.", "Save room for the top note: start softly, so the last one needs no push."],
  octave: ["The same note, high up.", "The top is the bottom note’s twin. Go lighter as you go up, never louder."],
  arp4: ["Skips all the way to the top.", "Four notes far apart. Go lighter on each one; the top is the lightest."],
  steptop: ["Walk up five, then reach the top.", "The last note is a wide skip away. Think it first; don’t push for it."],
  octstay: ["Leap to the top and stay.", "Land on the high note and sing it again. Keep it as easy the second time."],
  oct2: ["The big leap, twice.", "Up, home, and up again. Lighter as you go up, never louder."],
  fourwide: ["Four wide notes to the top.", "A wide skip, a step, a wide skip. Keep your mouth the same shape all the way."],
  topagain: ["Touch the top twice.", "Two leaps up, dip, and back to the top. The second time is as light as the first."],
  /* the hat, golden hour */
  fourthback: ["A wider jump, the same ease.", "Hear the top note first. Go there, come back, and match the note you left."],
  fifthback: ["Leap up and come home.", "Don’t reach with your chin. The last note matches the first."],
  arpud: ["Up and back on one breath.", "Don’t stop at the top. Turn round and come home the way you came."],
  sixback: ["A long leap and back.", "Go up lightly and return. Home is exactly where you left it."],
  octback: ["To the top and home.", "The top is the bottom note’s twin. Touch it lightly and come back."],
  wider2: ["A skip, then a leap.", "Home between them. The second jump is wider; start it the same easy way."],
  leapsback: ["Two leaps up, two leaps home.", "Stay light at the top, and keep the low note from dropping away."],
  wider3: ["Wider every time.", "A wide skip, a leap, a big leap, home between each. Never louder as it gets wider."],
  leapbig: ["A leap, then the big leap.", "Home in between. Hear the top note before each jump."],
  octback2: ["The big leap and back, twice.", "Save air for the second one. Both tops should sound the same."],
  bothways: ["Up a leap, down a wide skip.", "Home is in the middle. Keep it the same each time you pass through it."],
  topskips: ["Leap to the top, skip home.", "One big leap, then down in three skips. Start the top softly."],
  /* the hat, night */
  fourthdown: ["A wide skip down.", "Start softly and land softly. Keep the lower note light, not pressed."],
  fifthdown: ["Drop and land softly.", "Don’t let the low note fall back into your throat. Keep it as light as the high one."],
  arpdown: ["Come down in two skips.", "Start a little softer than you think, and keep the low note from dropping away."],
  darkarpdown: ["Two dark skips down.", "The middle note sits a little lower than in the bright one. Listen for it."],
  octdown: ["From the top to its twin below.", "Start light. Let the low note be quiet rather than pushed."],
  arp4down: ["Skips all the way down.", "Start light at the top. Each note lower, none of them heavier."],
  fivedown: ["A long way down, smoothly.", "Begin gently at the top, so there is air left for the bottom."],
  leapsdown: ["Two leaps down.", "From the top to the bottom in two jumps. Keep the breath moving through both."],
  scaledown: ["Eight even steps home.", "Spend the air slowly. The last three notes are where it likes to sag."],
  darkarp4down: ["Dark skips all the way down.", "Four notes far apart. Let the low one be quiet rather than pushed."],
  octdownstay: ["Drop to the bottom and stay.", "Land on the low note and sing it again, quietly, without pressing."],
  darkscaledown: ["Eight dark steps home.", "Spend the air slowly. Three of the steps sit lower than you expect."],
};
export const drillCard = (id) => { const c = DRILL_CARD[id]; return c ? { goal: c[0], how: c[1] } : null; };
/* drills that no longer exist, for saves and drill-editor edits made before they went: the made-up melodies of
   step 12 became the climbing five, and so did the two other drills that had its notes ("Up five and back" and
   "Quick five", until 2026-11-25) */
const DRILL_ALIAS = { free: "climb5", free5: "climb5", five: "climb5", fast5: "climb5" };
for (const [id, d] of Object.entries(DRILL)) d.id = id;

/* One ladder of twelve steps per GARMENT AND TIME OF DAY, nine in all, the same in every place.
   The garment says what the drills are for (the designer, 2026-11-25, in the evening: "drills designed for hat is to
   increase your range, for top is to increase your breath support, so more sustained notes, for scarf is to
   increase agility, so having notes go from low to high in a quick tempo"). The step says how long a take is
   (drills.js STEP_RULE): steps 1 to 4 once, 5 to 8 three sets, 9 to 12 five sets. The time of day says which
   twelve drills (the designer, later that evening, asked whether a garment should sing the same twelve at all three times:
   different drills, in Chinese). Until then the three garments' ladders were the same at every time of day,
   36 drills in all.
   What each time of day gives a garment is in LADDER_HOW below, and it is the agent's own, DRAFT:
   - scarf, agility: morning straight runs going up; golden hour zigzags and skips; night the quick shapes with the
     lowered third step.
   - top, breath: morning one long note and a step either side of it; golden hour long notes across a skip; night
     long notes coming down, half steps, and the longest note of all at the end.
   - hat, range: morning leaps up, and its sets climb to the top of the singer's range; golden hour leaps up and
     back; night leaps down, and its sets go down to the bottom of the range (drills.js wayOf).
   No drill is in two ladders, and no two drills have the same notes, except the top's four held notes of four
   lengths and "Three long steps up", which is the scarf's "Three steps up" at less than half the speed. Which shape
   went where, the order and the note lengths are the agent's, DRAFT; docs/later.md lists what to read. A place
   added later needs nothing here: it uses these ladders.
   A ladder's key is "time.zone", the end of a take's seed ("place.time.zone").

   Before this: one ladder per time of day. From 2026-11-14 the last three steps climbed; for some hours of
   2026-11-25 the time of day decided the length instead (morning once, golden hour three rounds, night a minute).
   The notes below are from the deal of 2026-11-15 and use the names of that day. */
/*
   What the review of 2026-11-15 found and what changed then:
   - the same drill came up in two ladders (Three down, Up and back, Five down, Arpeggio down, Five-note scale) and
     the nine notes of the five-note scale were sung in six of the thirty-six steps. Now every ladder has its own
     eleven drills; only step 12, the climbing five, is shared (the designer's choice of 2026-11-14). "five" is still in the
     list above for the drill editor, in no ladder.
   - in each ladder the take of step 10 was longer than that of step 11. Now the three climbing steps grow: about
     24, 35, 51 seconds in the morning, 10, 22, 44 at golden hour, 14, 29, 58 at night (for a range of an octave and
     a half; a narrow range climbs less). Since 2026-11-24 the rest between rounds is longer, the next first note
     being given on a beat with two or three beats to react (drills.js): about 29, 35, 55; 13, 24, 47; 15, 29, 58.
   - golden hour put an easy step (Five down) after two harder ones and went from scales straight to the octave.
     Now: the arpeggio three ways, a fourth, skips, a fifth, the fast five, fifth then octave, the scale, and then
     the octave on its own before the arpeggio that has it inside.
   - night borrowed five of its steps. Now it is its own: holds and falling lines, each a little longer, a minor
     five as its one long phrase, the octave down before the scale down.
   Morning only swapped steps 10 and 11. */
export const LADDERS = {
  "morning.scarf": ["doremi", "fourup", "fiveup", "sixup", "then5", "scaleup", "stairs", "eighthome", "climb5", "twice", "nextfive", "sixskips"],
  "golden.scarf": ["arc", "turn", "skips", "zigup", "arc4", "penta", "fiveskip", "gaps", "arp8", "zigtop", "gapsback", "fivetop"],
  "night.scarf": ["dark3", "darkarc", "dark5", "darkzig", "dark4", "darkskip", "dark8", "darkgaps", "minor5", "darkarp8", "darkstairs", "darkgapsback"],
  "morning.top": ["long", "two", "nbup", "nbdown", "hold4", "stay2", "nbup2", "nbdown2", "hold5", "nbboth", "up3hold", "valley"],
  "golden.top": ["long2", "third", "thirddown", "thirdback", "same3", "dipskip", "walkhome", "skiphome", "skipstay", "skipboth", "thirdback2", "leanover"],
  "night.top": ["twodown", "halfdown", "halfback", "down3", "darkdown", "darkdown3", "fourdown", "darkback", "darkfour", "darkfive", "halfboth", "hold6"],
  "morning.bottom": ["fourth", "fifth", "arp", "sixth", "fifthoct", "octave", "arp4", "steptop", "octstay", "oct2", "fourwide", "topagain"],
  "golden.bottom": ["fourthback", "fifthback", "arpud", "sixback", "octback", "wider2", "leapsback", "wider3", "leapbig", "octback2", "bothways", "topskips"],
  "night.bottom": ["fourthdown", "fifthdown", "arpdown", "darkarpdown", "octdown", "arp4down", "fivedown", "leapsdown", "scaledown", "darkarp4down", "octdownstay", "darkscaledown"],
};
export const LADDER_KEYS = Object.keys(LADDERS);
export const ladderKey = (zoneId, timeId) => { const k = `${timeId}.${zoneId}`; return LADDERS[k] ? k : LADDERS[`golden.${zoneId}`] ? `golden.${zoneId}` : "golden.scarf"; };
/* what a time of day gives a garment's drills, for the garment's sheet: "Morning: straight runs, going up." DRAFT */
export const LADDER_HOW = {
  "morning.scarf": "straight runs, going up",
  "golden.scarf": "zigzags and skips",
  "night.scarf": "the quick shapes in a darker colour",
  "morning.top": "one long note, and a step either side of it",
  "golden.top": "long notes across a skip",
  "night.top": "long notes coming down, and half steps",
  "morning.bottom": "leaps up, to the top of your voice",
  "golden.bottom": "leaps up and back",
  "night.bottom": "leaps down, to the bottom of your voice",
};
export const ladderFor = (zoneId, timeId) => LADDERS[ladderKey(zoneId, timeId)].map((id) => DRILL[id]);
export const drillAt = (zoneId, timeId, step) => ladderFor(zoneId, timeId)[Math.max(1, Math.min(STEPS, step)) - 1];

/* The drill editor (dev tools, the designer 2026-11-14): the designer moves and edits drills on the phone. The edits live in the
   save (S.dev.drillEdits) and are laid over the tables above when the game starts and after every change, so
   everything that reads DRILL / LADDERS sees them. Shape: { ladders: { "morning.scarf": [twelve ids] }, drills:
   { id: { name, rel, dur } } }. Nothing here is graded differently. A `climb` saved by an older editor is dropped
   (the step decides the sets), and so is a ladder saved under a garment or a time of day alone, from before there
   were nine. */
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
  const now = (id) => (typeof id === "string" && !(id in out.drills) && DRILL_ALIAS[id]) || id; // a drill that was removed
  for (const t of LADDER_KEYS) {
    const l = e.ladders?.[t];
    if (Array.isArray(l) && l.length === STEPS && l.map(now).every(known)) out.ladders[t] = l.map(now);
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
  for (const t of LADDER_KEYS) LADDERS[t] = c.ladders[t] || base.ladders[t];
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

/* Places open one after another, never by the calendar (the designer, 2026-11-23: "remove the time based mechanics for good.
   And just change the location to be unlocked once the user finishes"; of the board's ways the designer chose "when the
   morning is finished", 2026-11-24): the next place opens when the three garments of OPEN_AFTER are on at the place
   before it. New players always start at place 1. Until then a place opened on the 1st of each month from
   CALENDAR_LAUNCH, which state.js reads once more, to keep open what a save already had open.
   The calendar keeps one thing, and it is never in the way: a visit. In January the New Year's guests come to see
   the judge (it used to be a whole place, the one that opened in January, where guests wrapped instead of cats).
   While they are here any of them may sing any garment at any place, and the pictures are dressed for the New
   Year; a player who does nothing about it loses nothing. How a visit works is DRAFT (docs/later.md).
   SWITCHED OFF (the designer, 2026-11-27: "remove new year visit for now"): VISIT_MONTHS is empty, so no month brings a
   visit: no letter, no row in Places, no lanterns, no guests in "Who sings", and the dragon is nowhere. Everything
   that makes a visit is still here and in state.js; `{ 1: "newyear" }` brings January's back, and the tests still
   run the whole visit with that value. */
export const OPEN_AFTER = "morning";
export const CALENDAR_LAUNCH = { year: 2026, month: 11 };
export const VISIT_MONTHS = {};
export const VISITORS = { newyear: ["dachshund", "otter", "ferret", "dragon"] };

/* lines: one postcard sentence per time. The design doc gave one line per place; the other two are DRAFT.
   letter: the two-line invitation that arrives when the place opens (DRAFT except the doc's example format). */
export const PLACES = [
  { id: "onsen", name: "Hot spring", at: "at the hot spring", seat: "the stone rim, feet in the water", hit: "a water drop, plink", miss: "a plop",
    lines: { morning: "The mist hasn't lifted. It's already soaking.", golden: "It didn't say the water was too hot. It soaked.", night: "It didn't say the water was too hot. It fell asleep." },
    letter: ["The hot-spring monkeys invite the judge to soak its feet.", "They say the stone rim is warm."] },
  /* The jungle (the designer, 2026-11-23: "create the next location as jungle"; where the idea came from is in docs/later.md).
     It is the second place, so the others open a month later than they did. The brief: birds in a tree that sing a
     short tune when pressed, cats that meow differently here, an acorn on the capybara's head that makes a sound,
     trees and monkeys that can be pressed, and a capybara with hands that holds a heart, which turns from red to
     pink and back. Every word below is DRAFT, written by the art session to go with it. */
  { id: "jungle", name: "Jungle", at: "in the jungle", seat: "a mossy log", hit: "a bird's chirp", miss: "a monkey's hoot",
    lines: { morning: "The birds were up first. It let them sing.", golden: "It's holding a heart. Nobody asked why.", night: "The jungle is loud at night. It is not." },
    letter: ["The jungle birds invite the judge to sit on their log.", "They say there's an acorn in it for the judge."] },
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
/* The order the coats and the cats were dealt in: the first year's twelve, then places added later. A place added in
   the middle of the calendar (the jungle) is dealt last, so it does not move the cats or the coats of the others. */
const DEAL_ORDER = ["onsen", "livingroom", "nightmarket", "train", "beach", "library", "camping", "cinema", "bus", "museum", "rooftop", "skilift", "jungle"];
const dealOf = (placeId) => Math.max(0, DEAL_ORDER.indexOf(placeId));
export const placeById = (id) => PLACES.find((p) => p.id === id) || PLACES[0];
export const timeById = (id) => TIMES.find((t) => t.id === id) || TIMES[0];
export const zoneById = (id) => ZONES.find((z) => z.id === id) || ZONES[0];

/* the visit's letter (DRAFT) */
export const NEWYEAR_LETTER = ["Happy New Year. A dachshund, an otter, a ferret and a long dragon have come to see the judge.", "All January any of them will sing a garment for you. Ask them in Dress up."];
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
  const p = dealOf(placeId);
  const ti = TIME_IDS.indexOf(timeId), zi = ZONE_IDS.indexOf(zoneId);
  const pattern = PATTERN_IDS[(p * 5 + ti * 3 + zi * 4) % PATTERN_IDS.length];
  const palette = PALETTE_ROT[(p + ti + zi * 2) % 3];
  return { fur, pattern, palette };
}

/* Each place's three cats, in the order of DEAL_ORDER: [scarf, top, hat]. Thirty-six different cats in a year: no cat
   comes twice, the three of a month have three different shapes and never the same charm, and the shapes run on from
   month to month so each of the seven comes round about five times. The first month keeps the three shapes the game
   began with, one of them plain. */
const KIND_CAST = [
  ["point", "big+bell", "tuft+leaf"],             // onsen
  ["small+camellia", "fold+berry", "curl+bow"],   // livingroom
  ["round+plum", "point+leaf", "big+camellia"],   // nightmarket
  ["tuft+berry", "small+bow", "fold+plum"],       // train
  ["curl", "round+bell", "point+berry"],          // beach
  ["big+bow", "tuft+plum", "small"],              // library
  ["fold+bell", "curl+leaf", "round+camellia"],   // camping
  ["point+plum", "big", "tuft+bell"],             // cinema
  ["small+leaf", "fold+camellia", "curl+berry"],  // bus
  ["round+bow", "point+bell", "big+leaf"],        // museum
  ["tuft+camellia", "small+berry", "fold+bow"],   // rooftop
  ["curl+plum", "round+leaf", "point+camellia"],  // skilift
  /* the jungle (2026-11-23): every cat of the forty-nine was already somewhere, so its three wear charms of their own */
  ["tuft+hibiscus", "point+feather", "round+banana"],
];
export function kindFor(placeId, zoneId) {
  const cast = KIND_CAST[dealOf(placeId) % KIND_CAST.length];
  return cast[Math.max(0, ["scarf", "top", "bottom"].indexOf(zoneId))];
}

/* ---------- treats, and the cats a player owns (the designer, 2026-11-14 and 15) ----------
   Board: docs/design/longcat-yarn-shop-animals.md (the rules) and longcat-shop-screens.md (the screens, layout 甲).
   - Treats are the game's coin ("遊戲幣則是必須得做 drill 來獲得"): the same number for every finished take,
     whatever the grade, a step sung again too, for the first few takes of a day. Never bought with money.
   - A singer is a cat (its id is its kind, "fold+bow") or another long animal (its id is the animal, "otter").
     A cat has one coat of its own, for good ("每隻貓固定一種").
   - The player starts with four cats ("一開始只給四隻免費的貓") and keeps every one brought home ("永久擁有").
   - The three cats of KIND_CAST live at their place: they sing there without being owned, and can be kept for
     treats. The thirty-six of them are a year's cats; the thirteen kinds no place has are the four free ones and
     the shop's shelf, so no cat is in two of these lists.
   - Other long animals are on the shelf too ("甲：長的都可以"). Only the three the art has checked in a sleeve. */
export const TREATS = { take: 10, perDay: 12, cat: 400, animal: 1200 };
export const FREE_CATS = ["tuft", "fold", "round", "point+bow"];
export const SHOP_CATS = ["big+plum", "curl+bell", "small+bell", "fold+leaf", "round+berry", "tuft+bow", "curl+camellia", "big+berry", "small+plum"];
export const SHOP_ANIMALS = ["otter", "dachshund", "ferret"];
/* the coats of the thirteen cats no place has: [pattern, palette] */
const OWN_COATS = {
  tuft: ["plain", "cream"], fold: ["tabby", "grey"], round: ["spots", "ginger"], "point+bow": ["pin", "grey"],
  "big+plum": ["freckles", "cream"], "curl+bell": ["pale3", "cream"], "small+bell": ["plain", "ginger"], "fold+leaf": ["bold", "cream"],
  "round+berry": ["tabby", "grey"], "tuft+bow": ["twotone", "grey"], "curl+camellia": ["stripes5", "ginger"], "big+berry": ["bands3", "ginger"], "small+plum": ["spots", "grey"],
};
export const isAnimal = (id) => Object.prototype.hasOwnProperty.call(GUESTS, id);
export const priceOf = (id) => (isAnimal(id) ? TREATS.animal : TREATS.cat);
/* a cat's own coat, { pattern, palette }: a place's cat keeps the coat it wore there in the morning */
export function catCoat(kind) {
  const own = OWN_COATS[kind];
  if (own) return { pattern: own[0], palette: own[1] };
  for (let p = 0; p < KIND_CAST.length; p++) {
    const j = KIND_CAST[p].indexOf(kind);
    if (j >= 0) { const l = garmentLook(DEAL_ORDER[p % DEAL_ORDER.length], "morning", ["scarf", "top", "bottom"][j]); return { pattern: l.pattern, palette: l.palette }; }
  }
  return { pattern: "plain", palette: "ginger" };
}
/* a singer in words, when it has no name of its own: "Folded, bow" or "Otter" */
export function singerWords(id) {
  if (isAnimal(id)) return GUESTS[id].name;
  const w = catWords(id);
  return w.charm ? `${w.shape}, ${w.charm.replace(/^an? /, "")}` : w.shape;
}
/* one line about it: "Grey. Folded ears, a bow." or "A flat tail." */
export function singerNote(id) {
  if (isAnimal(id)) return `${GUESTS[id].mark.charAt(0).toUpperCase()}${GUESTS[id].mark.slice(1)}.`;
  const p = PALETTE_NAMES[catCoat(id).palette] || "ginger";
  return `${p.charAt(0).toUpperCase()}${p.slice(1)}.`;
}

/* ---------- yarn (the designer, 2026-11-14) ----------
   A garment is a cat in a knitted sleeve, and the sleeve's yarn belongs to the place and the time of day: "每個地點
   的早晨，都是基本的三個顏色，我們系統自己選，搭配那個地點的顏色色調。從第二個時間開始，傍晚和晚上，玩家可以解鎖有
   特色的毛線，像是格子、條紋等等，搭配適合的顏色（也是由系統選擇）". So every place has nine yarns, one per garment:
   three plain ones in the morning, three patterns in two colours at golden hour, three more at night.
   A yarn is { type, a, b, c }: a pattern id (YARN_PATTERNS) and colour ids (YARN_COLOR_NAMES; the art knows the
   colours, src/art/print/yarn.js). a = the ground, b = the second colour, c = a thin third line.
   Rules for choosing them (docs/design/longcat-sleeve-test.md, section 六): a plain yarn or a pattern's main colour
   is one of the place's three strong colours, which must hold on the hat under the fruit and beside a grey, ginger
   or cream cat. Yellows and milk are second colours only.
   DRAFT: the onsen's nine are my proposal on that board, not yet answered by the designer; the other eleven places are a
   first pass made by the same rules. */
export const YARN_PATTERNS = [
  { id: "plain", name: "Plain" }, { id: "stripe", name: "Fine stripes" }, { id: "wide", name: "Wide stripes" }, { id: "check", name: "Gingham" },
  { id: "dots", name: "Dots" }, { id: "zigzag", name: "Zigzag" }, { id: "diamond", name: "Argyle" }, { id: "star", name: "Stars" },
  { id: "fairisle", name: "Fair Isle" }, { id: "snowflake", name: "Snowflake" }, { id: "nordic", name: "Nordic" },
];
export const YARN_COLOR_NAMES = {
  vermilion: "vermilion", indigo: "indigo", moss: "moss", yuzu: "yuzu", milk: "milk", sky: "sky", plum: "plum", teal: "teal", rose: "rose",
  wine: "wine", forest: "forest", navy: "navy", sea: "sea", coral: "coral", lilac: "lilac", mint: "mint", slate: "slate", lantern: "lantern",
};
/* a place's box from its three strong colours, a light one, an accent and a soft one. `turn` moves the yarns round
   the three garments so that neighbouring months do not put the same pattern on the same garment */
function yarnBox([g0, g1, g2], light, accent, soft, turn = 0) {
  const [zA, zB, zC] = [0, 1, 2].map((i) => ["scarf", "bottom", "top"][(i + turn) % 3]);
  return {
    morning: { [zA]: { type: "plain", a: g0 }, [zB]: { type: "plain", a: g1 }, [zC]: { type: "plain", a: g2 } },
    golden: { [zA]: { type: "stripe", a: g0, b: light }, [zB]: { type: turn % 2 ? "zigzag" : "dots", a: g2, b: accent }, [zC]: { type: "check", a: light, b: g1 } },
    /* the night's three are GPT's designs, picked by the designer on 2026-11-27 (docs/art-generation.md): the place's second
       colour as the ground, cream motifs, the first colour as the red accent. Wide stripes, stars and argyle before */
    night: { [zA]: { type: "snowflake", a: g1, b: light, c: g0 }, [zB]: { type: "fairisle", a: turn ? g2 : g1, b: light, c: g0 }, [zC]: { type: "nordic", a: g1, b: light, c: g0 } },
  };
}
const YARN_BOX = {
  onsen: yarnBox(["vermilion", "indigo", "moss"], "milk", "yuzu", "sky", 0),
  jungle: yarnBox(["coral", "navy", "plum"], "milk", "yuzu", "rose", 1), // no green: the leaves behind are green
  livingroom: yarnBox(["wine", "forest", "plum"], "milk", "rose", "lilac", 1),
  nightmarket: yarnBox(["vermilion", "navy", "teal"], "milk", "lantern", "sky", 2),
  train: yarnBox(["forest", "wine", "navy"], "milk", "yuzu", "mint", 0),
  beach: yarnBox(["sea", "coral", "navy"], "milk", "yuzu", "sky", 1),
  library: yarnBox(["plum", "forest", "wine"], "milk", "lantern", "lilac", 2),
  camping: yarnBox(["vermilion", "forest", "navy"], "milk", "yuzu", "mint", 0),
  cinema: yarnBox(["navy", "plum", "teal"], "milk", "lantern", "lilac", 1),
  bus: yarnBox(["coral", "moss", "plum"], "milk", "yuzu", "rose", 2),
  museum: yarnBox(["slate", "wine", "moss"], "milk", "lantern", "lilac", 0),
  rooftop: yarnBox(["teal", "plum", "coral"], "milk", "yuzu", "sky", 1),
  skilift: yarnBox(["indigo", "forest", "vermilion"], "milk", "yuzu", "sky", 2),
};
/* the yarn a garment is knitted in: its own, designed for that place, time and garment */
export function yarnFor(placeId, timeId, zoneId) {
  const box = YARN_BOX[placeId] || YARN_BOX.onsen, row = box[timeId] || box.morning;
  return { ...(row[zoneId] || row.scarf) };
}
/* "Plain vermilion", "Fine stripes, vermilion and milk" */
export function yarnName(y) {
  const p = YARN_PATTERNS.find((x) => x.id === (y && y.type)) || YARN_PATTERNS[0], a = YARN_COLOR_NAMES[y && y.a] || "wool";
  return p.id === "plain" || !y.b ? `${p.name} ${a}` : `${p.name}, ${a} and ${YARN_COLOR_NAMES[y.b] || "wool"}`;
}

/* A garment by its plain name: "Scarf", "Top", "Hat". The time of day no longer says how big it is, so it no longer
   names it; where the singer is known, state.js garmentTitle gives the name with its size. */
export function garmentName(timeId, zoneId) {
  return (ZONES.find((z) => z.id === zoneId) || ZONES[0]).name;
}
