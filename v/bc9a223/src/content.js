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
   words (2026-11-24): a step, a skip (a third), a wide skip (a fourth), a leap (a fifth), a big leap (an octave).
   The notes further down about how the ladders were dealt use the names of that day ("Arpeggio down", "Five-note
   scale"). rel = semitones above the drill's root (the
   lowest note is placed in the singer's range, so a rel may be negative); dur = the seconds a note gets, the gap
   before the next note included (drills.js gapOf), the same at every time of day.
   What a drill is sung on is not here: the sound belongs to the cat (SOUNDS below).
   How many times a drill is sung is not here either: the time of day decides (drills.js TIME_RULE, the designer
   2026-11-25): once in the morning, three rounds at golden hour, about a minute of rounds at night. From
   2026-11-14 to then a drill carried its own `climb`, and only steps 10 to 12 of a ladder had one. */
export const DRILL = {
  long: { name: "One long note", rel: [0], dur: 3.4 },
  long2: { name: "The same note twice", rel: [0, 0], dur: 1.5 },
  hold4: { name: "A longer note", rel: [0], dur: 3.5 },
  hold5: { name: "The longest note", rel: [0], dur: 5.0 },
  two: { name: "One step up", rel: [0, 2], dur: 1.5 },
  twodown: { name: "One step down", rel: [2, 0], dur: 1.5 },
  nbup: { name: "Step up and back", rel: [0, 2, 0], dur: 1.0 },
  nbdown: { name: "Step down and back", rel: [0, -2, 0], dur: 1.0 },
  doremi: { name: "Three steps up", rel: [0, 2, 4], dur: 1.0 },
  down3: { name: "Three steps down", rel: [4, 2, 0], dur: 1.0 },
  arc: { name: "Up three and back", rel: [0, 2, 4, 2, 0], dur: 0.95 },
  fiveup: { name: "Five steps up", rel: [0, 2, 4, 5, 7], dur: 0.95 },
  fivedown: { name: "Five steps down", rel: [7, 5, 4, 2, 0], dur: 0.95 },
  five: { name: "Up five and back", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.56 },
  fast5: { name: "Quick five", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.5 },
  scaleup: { name: "Eight steps up", rel: [0, 2, 4, 5, 7, 9, 11, 12], dur: 0.7 },
  scaledown: { name: "Eight steps down", rel: [12, 11, 9, 7, 5, 4, 2, 0], dur: 0.7 },
  third: { name: "Skip up", rel: [0, 4], dur: 1.5 },
  thirdback: { name: "Skip up and back", rel: [0, 4, 0], dur: 1.0 },
  arp: { name: "Two skips up", rel: [0, 4, 7], dur: 1.0 },
  arpdown: { name: "Two skips down", rel: [7, 4, 0], dur: 1.4 },
  arpud: { name: "Two skips up and back", rel: [0, 4, 7, 4, 0], dur: 0.95 },
  fifth: { name: "Leap up", rel: [0, 7], dur: 1.5 },
  skips: { name: "Zigzag", rel: [0, 4, 2, 5, 4], dur: 0.95 },
  octave: { name: "Big leap up", rel: [0, 12], dur: 1.6 },
  octdown: { name: "Big leap down", rel: [12, 0], dur: 1.6 },
  arp8: { name: "Skips to the top and back", rel: [0, 4, 7, 12, 7, 4, 0], dur: 0.8 },
  penta: { name: "Steps, a skip, and back", rel: [0, 2, 4, 7, 4, 2, 0], dur: 0.68 },
  /* added when the ladders were dealt again (2026-11-15), so that no two ladders share a drill */
  fourthback: { name: "Wide skip and back", rel: [0, 5, 0], dur: 1.4 },
  fifthoct: { name: "Two leaps up", rel: [0, 7, 12], dur: 1.4 },
  fourdown: { name: "Four steps down", rel: [5, 4, 2, 0], dur: 1.15 },
  nbboth: { name: "A step each way", rel: [0, 2, 0, -2, 0], dur: 0.95 },
  fifthdown: { name: "Leap down", rel: [7, 0], dur: 1.8 },
  minor5: { name: "The darker five", rel: [0, 2, 3, 5, 7, 5, 3, 2, 0], dur: 0.7 },
  /* the designer's own example of a drill sung in rounds (2026-11-14: do re mi fa so fa mi re do, the next round from re);
     it was the last step of every garment until 2026-11-25 and is a night drill now. */
  climb5: { name: "Climbing five", rel: [0, 2, 4, 5, 7, 5, 4, 2, 0], dur: 0.7 },
  /* added on 2026-11-25, when the night ladder became twelve long drills */
  fiveskip: { name: "Five up, two skips home", rel: [0, 2, 4, 5, 7, 4, 0], dur: 0.8 },
};
/* What the card of a drill says (the designer, 2026-11-24, after Vocalista's intro card): a goal in a few words and one line
   of how, about the body and the breath as much as the notes. Kept apart from DRILL so a drill edited in the dev
   tools keeps its card; a drill made there has none. DRAFT: written by the agent, to be read by the designer or by someone
   who teaches singing before the web test (docs/later.md). The names above say what the singer does ("Step down
   and back"), not what a musician calls it ("Neighbour down"); the sound is the cat's, so it is not in the name. */
export const DRILL_CARD = {
  long: ["Find the note and stay.", "Breathe in low, start gently, and let the sound run to the end without pushing."],
  long2: ["Land on it twice.", "Take a small breath in between, and start the second note exactly where the first one was."],
  two: ["Move without sliding.", "Hear the second note in your head before you go, then step onto it."],
  nbup: ["Come home to the same note.", "Go up one step and return. The last note should match the first."],
  nbdown: ["Dip and come home.", "Let the lower note sit lightly, then return to where you began."],
  doremi: ["Even steps.", "Give every note the same length and the same loudness. No rush to the top."],
  down3: ["Come down without sagging.", "Keep the breath moving as you go down, so the last note doesn’t sink."],
  arc: ["One smooth curve.", "Sing it on one breath, up and back, like drawing a small hill."],
  third: ["Jump over a note.", "Think of the note in between, then leave it out and land cleanly."],
  thirdback: ["Jump and return.", "Keep your jaw and shoulders loose. The last note should match the first."],
  fiveup: ["Climb five without pushing.", "Stay as light on the fifth note as on the first. Breathe in every rest."],
  climb5: ["Keep it easy all the way up.", "The same hill each round, one step higher. If it gets tight, sing softer, not harder."],
  arp: ["Skip, skip, land.", "Three notes far apart: keep your mouth the same shape and let the pitch do the moving."],
  arpdown: ["Come down in two skips.", "Start a little softer than you think, and keep the low note from dropping away."],
  arpud: ["Up and back on one breath.", "Don’t stop at the top. Turn round and come home the way you came."],
  fourthback: ["A wider jump, the same ease.", "Hear the top note first. Go there, come back, and match the note you left."],
  skips: ["Keep your place while it turns.", "It goes up, back a little, and up again. Go through it in your head before you sing."],
  fifth: ["A clean leap.", "Don’t reach up with your chin. Look straight ahead and let the breath carry it."],
  fast5: ["Light and quick.", "A small sound and small movements. Quick notes need less air, not more."],
  fifthoct: ["Leap, then leap again.", "Save room for the top note: start softly, so the last one needs no push."],
  scaleup: ["All eight on one breath.", "Breathe in low before you start and spend the air evenly, a little for every note."],
  octave: ["The same note, high up.", "The top is the bottom note’s twin. Go lighter as you go up, never louder."],
  arp8: ["The whole height in one go.", "Four notes up and the same way down. Let the top one be the lightest."],
  twodown: ["Settle onto the lower note.", "Slow and soft. Let the second note rest; don’t press it down."],
  hold4: ["A long note, steady.", "Breathe in through your nose, start quietly, and keep the sound the same from start to end."],
  fourdown: ["Walk down calmly.", "Each note a little lower, none of them heavier. Keep the air flowing to the last one."],
  nbboth: ["Stay centred.", "Up a step, home, down a step, home. Home should sound the same all three times."],
  fivedown: ["A long way down, smoothly.", "Begin gently at the top, so there is air left for the bottom."],
  hold5: ["Longer still, without shaking.", "Use less air than you think. A quiet steady note beats a loud wobbly one."],
  fifthdown: ["Drop and land softly.", "Don’t let the low note fall back into your throat. Keep it as light as the high one."],
  penta: ["A wide curve on one breath.", "Two steps, one skip to the top, and home the same way. No hurry at the top."],
  minor5: ["Hear the third note sit lower.", "It is the five-note hill with a sadder third step. Listen for it before you sing."],
  octdown: ["From the top to its twin below.", "Start light. Let the low note be quiet rather than pushed."],
  scaledown: ["Eight even steps home.", "Spend the air slowly. The last three notes are where it likes to sag."],
  five: ["A steady hill.", "Up five steps and down again on one breath, every note the same length."],
  fiveskip: ["Walk up, skip home.", "Five even steps to the top, then two skips down. Land the last note as gently as you left it."],
};
export const drillCard = (id) => { const c = DRILL_CARD[id]; return c ? { goal: c[0], how: c[1] } : null; };
/* drills that no longer exist, for saves and drill-editor edits made before they went: the made-up melodies of
   step 12 became the climbing five */
const DRILL_ALIAS = { free: "climb5", free5: "climb5" };
for (const [id, d] of Object.entries(DRILL)) d.id = id;

/* One ladder of twelve steps per time of day, the same in every place. DEALT AGAIN ON 2026-11-25 under the rule of
   the three times (drills.js TIME_RULE; the designer: mornings short "for building the foundation", afternoons three times
   as long, climbing up or down, nights as long as the exercise in the Vocalista recording):
   - morning: twelve short shapes of one to three notes, sung once, 8 to 9 seconds a take. Held notes, one step,
     three steps, a skip, two skips, a leap.
   - golden hour: twelve phrases of three to nine notes, three rounds each, 25 to 29 seconds. A phrase that ends
     lower than it starts (Four steps down, Five steps down, Two skips down) goes a step lower each round; the
     others a step higher.
   - night: twelve drills of 52 to 58 seconds: five to ten rounds up and back. Long notes, the five-note hill of
     the recording, its darker sister, the eight steps, the big leaps, and the quick five last.
   A step is harder than the one before by its shape (wider, more notes, quicker), no longer by its length: within
   a time of day every take is about as long as the next. No drill is in two ladders. The order is the agent's,
   DRAFT, like the note lengths; docs/later.md lists what to read.
   A place added later needs nothing here: it uses these ladders. Should a place ever get ladders of its own, the
   rule still holds by itself, since the rounds come from the time of day; only `dur` has to be chosen so the take
   lands in the band (drills.js says how long a phrase that is).

   The deal before this one, of 2026-11-15 (the designer: "把現有的 drill review 過一次 … 重新 assign 所有的 drills"), on the same plan as
   before. What the review found and what changed:
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
  morning: ["long", "long2", "two", "twodown", "nbup", "nbdown", "doremi", "down3", "third", "thirdback", "arp", "fifth"],
  golden: ["arc", "fourdown", "fiveup", "fivedown", "nbboth", "arpud", "arpdown", "fourthback", "skips", "fifthoct", "penta", "five"],
  night: ["hold4", "fifthdown", "climb5", "hold5", "minor5", "fiveskip", "scaleup", "scaledown", "octave", "octdown", "arp8", "fast5"],
};
export const ladderFor = (timeId) => (LADDERS[timeId] || LADDERS.golden).map((id) => DRILL[id]);
export const drillAt = (timeId, step) => ladderFor(timeId)[Math.max(1, Math.min(STEPS, step)) - 1];

/* The drill editor (dev tools, the designer 2026-11-14): the designer moves and edits drills on the phone. The edits live in the
   save (S.dev.drillEdits) and are laid over the tables above when the game starts and after every change, so
   everything that reads DRILL / LADDERS sees them. Shape: { ladders: { morning: [twelve ids] }, drills: { id:
   { name, rel, dur } } }. Nothing here is graded differently. A `climb` saved by an older editor is dropped: the
   time of day decides the rounds now. */
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
  for (const t of TIME_IDS) {
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

/* Places open one after another, never by the calendar (the designer, 2026-11-23: "remove the time based mechanics for good.
   And just change the location to be unlocked once the user finishes"; of the board's ways the designer chose "when the
   morning is finished", 2026-11-24): the next place opens when the three garments of OPEN_AFTER are on at the place
   before it. New players always start at place 1. Until then a place opened on the 1st of each month from
   CALENDAR_LAUNCH, which state.js reads once more, to keep open what a save already had open.
   The calendar keeps one thing, and it is never in the way: a visit. In January the New Year's guests come to see
   the judge (it used to be a whole place, the one that opened in January, where guests wrapped instead of cats).
   While they are here any of them may sing any garment at any place, and the pictures are dressed for the New
   Year; a player who does nothing about it loses nothing. How a visit works is DRAFT (docs/later.md). */
export const OPEN_AFTER = "morning";
export const CALENDAR_LAUNCH = { year: 2026, month: 11 };
export const VISIT_MONTHS = { 1: "newyear" };
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
    night: { [zA]: { type: "wide", a: g0, b: g1, c: light }, [zB]: { type: "star", a: turn ? g2 : g1, b: light }, [zC]: { type: "diamond", a: g1, b: soft, c: accent } },
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
