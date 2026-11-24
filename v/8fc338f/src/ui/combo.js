/* Combo tiers for the singing screen (the designer, 2026-11-13: "5 streak shows some stars, 15 streaks is rainbow").
   A combo is notes on the note in a row, across takes, for as long as the app is open. Each tier keeps what
   the tiers below it show. The chimes sit above 1000 Hz, outside the pitch tracker's range, so the microphone
   never mistakes them for the singer. Pure, so tests can check it. */

export const COMBO_TIERS = [
  { at: 5, name: "stars", chime: [1319, 1568] },
  { at: 10, name: "music", chime: [1319, 1568, 1760] },
  { at: 15, name: "rainbow", chime: [1319, 1568, 1760, 2093] },
  { at: 25, name: "confetti", chime: [1568, 1760, 2093, 2637] },
];

export function comboTier(n) {
  let tier = 0;
  COMBO_TIERS.forEach((t, i) => { if (n >= t.at) tier = i + 1; });
  return tier;
}

/* The old drill's rule: on the note adds one, close keeps the run without adding, off ends it. */
export const nextCombo = (n, level) => (level === "good" ? n + 1 : level === "mid" ? n : 0);
