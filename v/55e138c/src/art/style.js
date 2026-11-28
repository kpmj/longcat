/* Which capybara is drawn. the designer chose a new one on 2026-11-27 (GPT's design, picked on the art page: standing, slimmer,
   arms at its sides, pointed ears; docs/art-generation.md), and on 2026-11-28 asked for it in the build: it is the
   game's own. The first capybara is kept, to compare:
   - in the game: ?judge=old in the address (?judge=new goes back); the choice is kept on this device
     (localStorage), nothing else is;
   - in tools and tests: LONGCAT_JUDGE=old.
   It is read once, when the art loads, because the garments' rows and areas are worked out from the body then. */
function fromPage() {
  try {
    const q = new URLSearchParams((globalThis.location && globalThis.location.search) || "");
    if (q.has("judge")) { const v = q.get("judge"); try { globalThis.localStorage.setItem("lc-judge", v); } catch { /* private window */ } return v; }
    return globalThis.localStorage ? globalThis.localStorage.getItem("lc-judge") : null;
  } catch { return null; }
}
const fromEnv = () => (typeof process !== "undefined" && process.env && process.env.LONGCAT_JUDGE) || null;
export const JUDGE_STYLE = (fromEnv() || fromPage()) === "old" ? "old" : "new";
export const NEW_JUDGE = JUDGE_STYLE === "new";
/* The new capybara's arms and the top (the designer, 2026-11-27: "make sure the bottom cloth is not going to block its hands
   or arms. Or give me options to cover them"). Three ways, shown on a page for the designer to pick:
   "under" the top sits lower, below the paws; "over" the arms lie on the garments; "covered" the top wraps over
   them, as in the first fitting. the designer picked "under" on 2026-11-28. LONGCAT_ARMS chooses another for tools. */
const ARMS_ALL = ["under", "over", "covered"];
const armsEnv = (typeof process !== "undefined" && process.env && process.env.LONGCAT_ARMS) || "";
export const ARMS = NEW_JUDGE ? (ARMS_ALL.includes(armsEnv) ? armsEnv : "under") : "covered";
