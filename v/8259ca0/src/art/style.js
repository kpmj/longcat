/* Which capybara is drawn. the designer chose a new one on 2026-11-27 (GPT's design, picked on the art page: standing, slimmer,
   arms at its sides, pointed ears; docs/art-generation.md). While the garments are being refitted to it, it is
   drawn only when asked for, and the first capybara stays the game's own:
   - in the game: open it once with ?judge=new in the address (?judge=old goes back); the choice is kept on this
     device (localStorage), nothing else is;
   - in tools and tests: LONGCAT_JUDGE=new.
   It is read once, when the art loads, because the garments' rows and areas are worked out from the body then. */
function fromPage() {
  try {
    const q = new URLSearchParams((globalThis.location && globalThis.location.search) || "");
    if (q.has("judge")) { const v = q.get("judge"); try { globalThis.localStorage.setItem("lc-judge", v); } catch { /* private window */ } return v; }
    return globalThis.localStorage ? globalThis.localStorage.getItem("lc-judge") : null;
  } catch { return null; }
}
const fromEnv = () => (typeof process !== "undefined" && process.env && process.env.LONGCAT_JUDGE) || null;
export const JUDGE_STYLE = (fromEnv() || fromPage()) === "new" ? "new" : "old";
export const NEW_JUDGE = JUDGE_STYLE === "new";
