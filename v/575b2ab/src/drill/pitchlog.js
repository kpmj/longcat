/* The last take's pitch numbers, for debugging on a real phone (play-test, 2026-11-14: lines jumped on the lane
   and the screen recordings had no voice in them, so what the tracker read had to be guessed).

   Only numbers are kept: per frame the time, the tracker's pitch and confidence, the loudness, and whether the
   frame was dropped as the game's own sound. No audio is recorded and nothing leaves the device; the Dev panel
   copies the text so the player can paste it into a chat themselves. Kept in this browser until the next take. */

const KEY = "longcat-lasttake-v1";
let last = null;

const r = (x, d) => (x == null || !Number.isFinite(x) ? "" : String(Math.round(x * 10 ** d) / 10 ** d));

/* raw: [[t, midi | null, conf, rms, dropped]] in time order; plan: the take's plan; extra: anything small */
export function keepTake({ raw, plan, grade, latency, extra = {} }) {
  const head = {
    when: new Date().toISOString(),
    drill: plan.drill?.name, step: plan.step, time: plan.time, syl: plan.syl ?? plan.drill?.syl,
    beat: r(plan.beat, 3), latency: r(latency, 3),
    notes: plan.notes.map((n) => [n.midi, r(n.s, 2), r(n.e, 2)]),
    verdicts: (grade?.notes || []).map((x) => (x ? `${x.verdict}${x.cents != null ? ` ${Math.round(x.cents)}c` : ""}` : "-")),
    ...extra,
  };
  const lines = raw.map(([t, m, c, rms, d]) => `${r(t, 3)},${r(m, 2)},${r(c, 2)},${r(rms, 4)}${d ? ",self" : ""}`);
  last = `LONGCAT TAKE ${JSON.stringify(head)}\nt,midi,conf,rms\n${lines.join("\n")}\n`;
  try { localStorage.setItem(KEY, last); } catch { /* full or blocked: memory only */ }
}

export function lastTakeText() {
  if (last) return last;
  try { return localStorage.getItem(KEY); } catch { return null; }
}
