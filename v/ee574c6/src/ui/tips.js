/* One-time tips (game-flow board, section 3): a small dark bubble pointing at the thing it talks about. Each one
   shows once, the first time that thing comes up; a tap anywhere (or a few seconds, while singing) puts it away.
   Settings → Show the tips again clears the list. No tutorial slides, no help page. */
import { app } from "./app.js";
import * as St from "../state.js";

export const TIPS = {
  listen: "Listen: the cat sings it once. Then it’s your turn.",
  line: "Start when the note reaches this line.",
  voice: "Your voice moves the cat. Keep its head on the bar.",
  step: null, // written when shown: "That’s one step. Eleven more and the scarf is done."
  fold: "A fold marks a note that got away. Sing the step again to smooth it, or keep it.",
  cushion: "The judge put a cushion on your next step.",
  garment: null, // "The scarf is in the Wardrobe now. Other places are open too."
  letter: "A letter came. Reading it doesn’t move you.",
};

let cur = null;

export function hideTip() {
  if (!cur) return;
  clearTimeout(cur.timer);
  document.removeEventListener("pointerdown", cur.away, true);
  cur.el.remove();
  cur = null;
}

/* Show tip `id` next to `anchor` once. at: "above" | "below"; x: where along the anchor the arrow points (0–1). */
export function tip(id, anchor, { text = TIPS[id], at = "above", x = 0.5, y = null, ms = 0 } = {}) {
  const S = app.S;
  if (!anchor || !text || St.tipSeen(S, id)) return false;
  hideTip();
  St.seeTip(S, id);
  app.save();
  const el = document.createElement("div");
  el.className = `tip ${at}`;
  el.setAttribute("role", "status");
  el.textContent = text;
  document.body.appendChild(el);
  const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const px = r.left + r.width * x;
  const left = Math.max(10, Math.min(window.innerWidth - w - 10, px - w / 2));
  const top = y != null ? r.top + y : at === "above" ? r.top - h - 12 : r.bottom + 12;
  el.style.left = `${left}px`;
  el.style.top = `${Math.max(8, top)}px`;
  el.style.setProperty("--ax", `${Math.max(16, Math.min(w - 16, px - left))}px`);
  const away = () => hideTip();
  cur = { el, away, timer: ms ? setTimeout(hideTip, ms) : 0 };
  setTimeout(() => cur?.el === el && document.addEventListener("pointerdown", away, true), 50);
  return true;
}

export function resetTips() { app.S.tips = []; app.save(); }
