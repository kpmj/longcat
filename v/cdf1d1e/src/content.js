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

/* The drills. Since 2026-11-28 a handful of shapes, the same everywhere (the designer, 2026-11-28: "drill is still too hard to do ... the goal of the drill is not to memorize how the scale goes or
   how complicated it's. Let's reduce the variables of the scale transition and keep the main ones like do mi so do
   so mi do, do re mi fa do fa mi re do, do mi so do do do so so mi do, do mi so do so mi do mi so do so mi do etc";
   on the board that followed, docs/design/longcat-drills-simple.md, the designer chose 甲 one list everywhere and a: the
   step keeps its length, and a shape too long for it is sung in fewer sets). The shapes (`shape`, which also
   names the drill's card, DRILL_CARD below):
     long       do——                                     the top's first four steps, a little longer each step
     arc        do re mi re do                           (mine: the first four steps hold five notes or so)
     arpud      do mi so mi do                           (mine, the short arpud of arp8)
     climb5     do re mi fa so fa mi re do               the designer's (written "do re mi fa do fa mi re do"; read with so)
     arp8       do mi so do so mi do                     the designer's
     arptop     do mi so do do do so so mi do            the designer's (read as: the top do three times, so twice)
     arp8twice  do mi so do so mi do mi so do so mi do   the designer's (arp8 twice without a stop)
   Each step is a drill of its own here (`scarf1` ... `bottom12`, the hat's id being "bottom") so that it has its own
   note length: in a group of four steps each one is a little quicker, the top's held note a little longer. The
   garment says how a shape is sung: the scarf quick (0.55 to 0.7 s a note), the top long (0.9 s or more, its
   first four steps one held note), the hat like the scarf with its sets going to the edge of the range
   (drills.js wayOf). `sets`: fewer sets than the step's rule, where the shape is too long for its seconds (the
   double arpeggio in four, the top's long climbs in three or four). All worked out with planTake and takeSeconds
   on five ranges (docs/design/longcat-drills-simple/build.mjs, and the deal script in docs/later.md); the
   numbers are mine, DRAFT. Plain names as since 2026-11-24 (a step, a skip = a third, a leap = a fifth, the
   top = the octave above).
   rel = semitones above the drill's root (the lowest note is placed in the singer's range); dur = the seconds a
   note gets, the gap before the next note included (drills.js gapOf). What a drill is sung on is not here: the
   sound belongs to the cat (SOUNDS below). How many sets: the step's (drills.js STEP_RULE), unless `sets` says
   fewer.
   Until 2026-11-28 there were nine ladders of twelve different drills, 108 in all, one ladder for each garment at
   each time of day (git history; their board is docs/design/longcat-drill-ladder.md). */
export const DRILL = {
  /* the scarf */
  scarf1: { name: "Up three and back", shape: "arc", rel: [0, 2, 4, 2, 0], dur: 0.67 },
  scarf2: { name: "Two skips up and back", shape: "arpud", rel: [0, 4, 7, 4, 0], dur: 0.63 },
  scarf3: { name: "Up three and back", shape: "arc", rel: [0, 2, 4, 2, 0], dur: 0.59 },
  scarf4: { name: "Two skips up and back", shape: "arpud", rel: [0, 4, 7, 4, 0], dur: 0.55 },
  scarf5: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.64 },
  scarf6: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.66 },
  scarf7: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.58 },
  scarf8: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.57 },
  scarf9: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.7 },
  scarf10: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.69 },
  scarf11: { name: "Skips to the top, three on top", shape: "arptop", rel: [0, 4, 7, 12, 12, 12, 7, 7, 4, 0], dur: 0.55 },
  scarf12: { name: "Skips to the top and back, twice", shape: "arp8twice", rel: [0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 7, 4, 0], dur: 0.55, sets: 4 },
  /* the top */
  top1: { name: "One long note", shape: "long", rel: [0], dur: 2.27 },
  top2: { name: "One long note", shape: "long", rel: [0], dur: 2.83 },
  top3: { name: "One long note", shape: "long", rel: [0], dur: 3.15 },
  top4: { name: "One long note", shape: "long", rel: [0], dur: 3.64 },
  top5: { name: "Up three and back", shape: "arc", rel: [0, 2, 4, 2, 0], dur: 1.06 },
  top6: { name: "Two skips up and back", shape: "arpud", rel: [0, 4, 7, 4, 0], dur: 1.01 },
  top7: { name: "Up three and back", shape: "arc", rel: [0, 2, 4, 2, 0], dur: 0.95 },
  top8: { name: "Two skips up and back", shape: "arpud", rel: [0, 4, 7, 4, 0], dur: 0.9 },
  top9: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.97, sets: 3 },
  top10: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 1.04, sets: 4 },
  top11: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.92, sets: 3 },
  top12: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.99, sets: 4 }, // not quicker: the rest between sets would pass 4.6 s
  /* the hat */
  bottom1: { name: "Up three and back", shape: "arc", rel: [0, 2, 4, 2, 0], dur: 0.67 },
  bottom2: { name: "Two skips up and back", shape: "arpud", rel: [0, 4, 7, 4, 0], dur: 0.63 },
  bottom3: { name: "Up three and back", shape: "arc", rel: [0, 2, 4, 2, 0], dur: 0.59 },
  bottom4: { name: "Two skips up and back", shape: "arpud", rel: [0, 4, 7, 4, 0], dur: 0.55 },
  bottom5: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.64 },
  bottom6: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.66 },
  bottom7: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.58 },
  bottom8: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.57 },
  bottom9: { name: "Climbing five", shape: "climb5", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.7 },
  bottom10: { name: "Skips to the top and back", shape: "arp8", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.69 },
  bottom11: { name: "Skips to the top, three on top", shape: "arptop", rel: [0, 4, 7, 12, 12, 12, 7, 7, 4, 0], dur: 0.55 },
  bottom12: { name: "Skips to the top and back, twice", shape: "arp8twice", rel: [0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 7, 4, 0], dur: 0.55, sets: 4 },
};
/* What the card of a drill says (the designer, 2026-11-24, after Vocalista's intro card): a goal in a few words and one line
   of how, about the body and the breath as much as the notes. Kept apart from DRILL so a drill edited in the dev
   tools keeps its card; a drill made there has none. Keyed by the drill's shape (`drillKey`). DRAFT: written by the agent, to be read by the designer or by someone
   who teaches singing before the web test (docs/later.md). The names above say what the singer does ("Step down
   and back"), not what a musician calls it ("Neighbour down"); the sound is the cat's, so it is not in the name. */
export const DRILL_CARD = {
  long: ["Find the note and stay.", "Breathe in low, start gently, and let the sound run to the end without pushing."],
  arc: ["One smooth curve.", "Sing it on one breath, up and back, like drawing a small hill."],
  arpud: ["Up and back on one breath.", "Don’t stop at the top. Turn round and come home the way you came."],
  climb5: ["Keep it easy all the way up.", "The same hill each round, one step higher. If it gets tight, sing softer, not harder."],
  arp8: ["The whole height in one go.", "Four notes up and the same way down. Let the top one be the lightest."],
  arptop: ["Land on the top and stay a moment.", "Sing the high note three times, lightly, without pushing. Then come home the way you went up."],
  arp8twice: ["Twice to the top without a stop.", "The same arch two times on one breath. Keep the second one as light as the first."],
};
/* the drill's card and whether it has been met go by its shape: a shape met once is met (2026-11-28) */
export const drillKey = (d) => (d && (d.shape || d.id)) || null;
export const drillCard = (id) => { const c = DRILL_CARD[id]; return c ? { goal: c[0], how: c[1] } : null; };
for (const [id, d] of Object.entries(DRILL)) d.id = id;

/* One ladder of twelve steps per garment, the same at every time of day and in every place (the designer's 甲 on the
   simpler-drills board, 2026-11-28). The keys stay "time.zone", nine of them, for the drill editor and the seeds
   ("place.time.zone"); the three times of day of a garment have the same twelve drills.
   The garment says what the drills are for (the designer, 2026-11-25: "drills designed for hat is to increase your range,
   for top is to increase your breath support, so more sustained notes, for scarf is to increase agility, so
   having notes go from low to high in a quick tempo"); the step says how long a take is (drills.js STEP_RULE).
   Steps 1 to 4 the two short shapes, 5 to 8 the designer's two middle ones, 9 to 12 those again and then the two long ones;
   the top: four held notes, the short shapes slowly, then the middle ones slowly.
   From 2026-11-25 to 2026-11-28 each time of day had other drills (the designer: 「不同練習」), 108 in all; taken back by the
   board's 甲. */
const LADDER_OF = { scarf: [...Array(12)].map((_, i) => `scarf${i + 1}`), top: [...Array(12)].map((_, i) => `top${i + 1}`), bottom: [...Array(12)].map((_, i) => `bottom${i + 1}`) };
export const LADDERS = Object.fromEntries(["morning", "golden", "night"].flatMap((t) => ["scarf", "top", "bottom"].map((z) => [`${t}.${z}`, [...LADDER_OF[z]]])));
export const LADDER_KEYS = Object.keys(LADDERS);
export const ladderKey = (zoneId, timeId) => { const k = `${timeId}.${zoneId}`; return LADDERS[k] ? k : LADDERS[`golden.${zoneId}`] ? `golden.${zoneId}` : "golden.scarf"; };
/* what a garment's drills are, for the garment's sheet: "Morning: the same few shapes, quick." DRAFT */
export const LADDER_HOW = Object.fromEntries(["morning", "golden", "night"].flatMap((t) => [
  [`${t}.scarf`, "a few shapes, sung quick"],
  [`${t}.top`, "one long note, then the same shapes slowly"],
  [`${t}.bottom`, "the same shapes, each set going up to the top of your voice"],
]));
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
  const out = { name, rel, dur };
  if (typeof d.shape === "string" && /^[a-z0-9_]{1,24}$/.test(d.shape)) out.shape = d.shape;
  if (Number.isInteger(d.sets) && d.sets >= 1 && d.sets <= 5) out.sets = d.sets;
  return out;
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
  /* a ladder that names a drill that is gone (the 108 drills of before 2026-11-28) is dropped whole */
  for (const t of LADDER_KEYS) {
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
    lines: { morning: "The birds were up first. It let them sing.", golden: "It's wearing an acorn. Nobody asked why.", night: "The jungle is loud at night. It is not." },
    letter: ["The jungle birds invite the judge to sit on their log.", "They say there's an acorn in it for the judge."] },
  /* The train station, 驛之里 (the designer, 2026-11-28: "Replace the judges living room with the station"; the place is in
     art/print/places/station.js, its picks in docs/later.md). It takes the living room's month, and the living
     room's slot in DEAL_ORDER, so its three cats, their coats and the garments' looks are the ones the living room
     had and no other place moves. Every word below is DRAFT, written by the art session to go with it. */
  { id: "station", name: "Train station", at: "at the train station", seat: "a platform bench", hit: "the conductor's bell", miss: "a sigh of steam",
    lines: { morning: "The first train is in. It isn't getting on.", golden: "It has a ticket. It hasn't asked where to.", night: "The last train left. It kept the bench." },
    letter: ["The station master invites the judge to wait on the platform.", "The bench by the tracks is kept for it. No ticket needed."] },
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
/* the judge's living room, out of the calendar since 2026-11-28 (the station took its month). Kept with its drawing
   (art/print/places/all.js), its sounds and its yarns, should it come back */
export const LIVINGROOM = { id: "livingroom", name: "The judge's living room", at: "in its own living room", seat: "the armchair", hit: "a teacup touching its saucer", miss: "the cuckoo clock",
  lines: { morning: "It woke up in the armchair. It did not get up.", golden: "It went nowhere this month. This is home.", night: "Half the lights are off. The other half is cat." },
  letter: ["The armchair writes: “You haven't sat in me for ages.”", "This month the judge stays home."] };
/* The order the coats and the cats were dealt in: the first year's twelve, then places added later. A place added in
   the middle of the calendar (the jungle) is dealt last, so it does not move the cats or the coats of the others.
   A place that takes another's month takes its slot (the station, the living room's, 2026-11-28). */
const DEAL_ORDER = ["onsen", "station", "nightmarket", "train", "beach", "library", "camping", "cinema", "bus", "museum", "rooftop", "skilift", "jungle"];
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
  ["small+camellia", "fold+berry", "curl+bow"],   // station (the living room's until 2026-11-28)
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
  /* the station took the living room's month, and for now its yarns (DRAFT: they read on the brown wood and the grey
     roof behind the judge) */
  station: yarnBox(["wine", "forest", "plum"], "milk", "rose", "lilac", 1),
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
