/* Idle animations used by the markup. Everything sits inside prefers-reduced-motion: no-preference, so
   "reduce" turns all of it off; a second block also stops any running animation explicitly. */
export const ART_CSS = `@media (prefers-reduced-motion: no-preference) {
  .lc-breathe { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-breathe 4.6s ease-in-out infinite; }
  .lc-blink { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-blink 6s ease-in-out infinite; }
  .lc-tail { transform-box: fill-box; animation: lc-tail 3.4s ease-in-out infinite; }
  .lc-tail-l { transform-origin: 100% 100%; }
  .lc-tail-r { transform-origin: 0% 100%; }
  .lc-steam { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-steam 7s ease-in-out infinite; }
  .lc-steam:nth-of-type(2n) { animation-duration: 9s; animation-delay: -3s; }
  .lc-glow { animation: lc-glow 1.8s ease-in-out infinite; }
}
@keyframes lc-breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.003, 1.008); } }
@keyframes lc-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.12); } }
@keyframes lc-tail { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
@keyframes lc-steam { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-7px) scale(1.06, 1.1); } }
@keyframes lc-glow { 0%, 100% { opacity: .75; } 50% { opacity: .35; } }
@media (prefers-reduced-motion: reduce) {
  .lc-breathe, .lc-blink, .lc-tail, .lc-steam, .lc-glow { animation: none !important; }
}`;
