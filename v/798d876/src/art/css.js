/* Idle animations and small effects used by the markup. Everything sits inside prefers-reduced-motion: no-preference,
   so "reduce" turns all of it off; a second block also stops any running animation explicitly.
   Rules of the woodblock style: transforms and opacity only, never a filter; nothing gets shinier with progress.
   Home page (the designer, 2026-11-14): the judge blinks, twitches an ear, shakes its head now and then and yawns; cats twitch
   their ears, blink and stretch; steam rises, leaves fall, water drifts, yuzu bob, the lamp flickers, the sun and moon
   breathe and the stars twinkle. A class goes on a wrapper <g> that has no transform attribute of its own. */
export const ART_CSS = `@media (prefers-reduced-motion: no-preference) {
  .lc-breathe { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-breathe 4.6s ease-in-out infinite; }
  .lc-blink { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-blink 6s ease-in-out infinite; }
  .lc-tail { transform-box: fill-box; animation: lc-tail 3.4s ease-in-out infinite; }
  .lc-tail-l { transform-origin: 100% 100%; }
  .lc-tail-r { transform-origin: 0% 100%; }
  .lc-steam { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-steam 7s ease-in-out infinite; }
  .lc-steam:nth-of-type(2n) { animation-duration: 9s; animation-delay: -3s; }
  .lc-glow { animation: lc-glow 1.8s ease-in-out infinite; }
  .lc-ear { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-ear 7.5s ease-in-out infinite; }
  .lc-shake { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-shake 17s ease-in-out infinite; }
  .lc-yawn-head { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-yawn-head 23s ease-in-out infinite; }
  .lc-yawn-on { opacity: 0; animation: lc-yawn-on 23s linear infinite; }
  .lc-yawn-off { animation: lc-yawn-off 23s linear infinite; }
  .lc-stretch { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-stretch 19s ease-in-out infinite; }
  .lc-snooze { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-snooze 4.4s ease-in-out infinite; }
  .lc-sun { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-sun 6s ease-in-out infinite; }
  .lc-twinkle { animation: lc-twinkle 3.6s ease-in-out infinite; }
  .lc-twinkle:nth-of-type(3n) { animation-delay: -1.2s; animation-duration: 4.8s; }
  .lc-twinkle:nth-of-type(3n+1) { animation-delay: -2.5s; }
  .lc-leaf { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-leaf 15s linear infinite; }
  .lc-bob { transform-box: fill-box; transform-origin: 50% 80%; animation: lc-bob 4.2s ease-in-out infinite; }
  .lc-flicker { animation: lc-flicker 3.1s ease-in-out infinite; }
  .lc-drift { animation: lc-drift 12s linear infinite; }
}
@keyframes lc-breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.003, 1.008); } }
@keyframes lc-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.12); } }
@keyframes lc-tail { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
@keyframes lc-steam { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-7px) scale(1.06, 1.1); } }
@keyframes lc-glow { 0%, 100% { opacity: .75; } 50% { opacity: .35; } }
@keyframes lc-ear { 0%, 84%, 100% { transform: rotate(0deg); } 87% { transform: rotate(-16deg); } 90% { transform: rotate(7deg); } 93% { transform: rotate(-8deg); } 96% { transform: rotate(0deg); } }
@keyframes lc-shake { 0%, 70%, 82%, 100% { transform: rotate(0deg); } 73% { transform: rotate(-3.5deg); } 76% { transform: rotate(3.5deg); } 79% { transform: rotate(-2deg); } }
@keyframes lc-yawn-head { 0%, 38%, 50%, 100% { transform: translateY(0) rotate(0deg); } 41%, 46% { transform: translateY(-4px) rotate(-2.5deg); } }
@keyframes lc-yawn-on { 0%, 39.4% { opacity: 0; } 40%, 46.6% { opacity: 1; } 47.2%, 100% { opacity: 0; } }
@keyframes lc-yawn-off { 0%, 39.4% { opacity: 1; } 40%, 46.6% { opacity: 0; } 47.2%, 100% { opacity: 1; } }
@keyframes lc-stretch { 0%, 78%, 96%, 100% { transform: translate(0, 0) scale(1, 1); } 84% { transform: translate(calc(var(--lc-d, 1) * 6px), -2px) scale(1.08, .94); } 90% { transform: translate(calc(var(--lc-d, 1) * -1px), 0) scale(.97, 1.03); } }
@keyframes lc-snooze { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.02, 1.04); } }
@keyframes lc-sun { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@keyframes lc-twinkle { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
@keyframes lc-leaf { 0% { transform: translate(0, -30px) rotate(0deg); opacity: 0; } 6% { opacity: 1; } 30% { transform: translate(-22px, 130px) rotate(110deg); } 60% { transform: translate(14px, 280px) rotate(230deg); } 90% { opacity: 1; } 100% { transform: translate(-10px, 450px) rotate(360deg); opacity: 0; } }
@keyframes lc-bob { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-2px) rotate(4deg); } }
@keyframes lc-flicker { 0%, 100% { opacity: 1; } 22% { opacity: .78; } 40% { opacity: .95; } 63% { opacity: .7; } 81% { opacity: .92; } }
@keyframes lc-drift { from { transform: translateX(0); } to { transform: translateX(-24px); } }
@media (prefers-reduced-motion: reduce) {
  .lc-breathe, .lc-blink, .lc-tail, .lc-steam, .lc-glow, .lc-ear, .lc-shake, .lc-yawn-head, .lc-yawn-off, .lc-stretch, .lc-snooze, .lc-sun, .lc-twinkle, .lc-leaf, .lc-bob, .lc-flicker, .lc-drift { animation: none !important; }
  .lc-yawn-on { animation: none !important; opacity: 0; }
}`;
