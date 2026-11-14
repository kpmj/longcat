/* Idle animations and small effects used by the markup. Everything sits inside prefers-reduced-motion: no-preference,
   so "reduce" turns all of it off; a second block also stops any running animation explicitly.
   Rules of the woodblock style: transforms and opacity only, never a filter; nothing gets shinier with progress.
   Home page (the designer, 2026-11-14): the judge blinks, twitches an ear, shakes its head now and then and yawns; cats twitch
   their ears, blink and stretch; steam rises, leaves fall, water drifts, yuzu bob, the lamp flickers, the sun and moon
   breathe and the stars twinkle. A class goes on a wrapper <g> that has no transform attribute of its own. */
export const ART_CSS = `/* touch: the page adds lc-tapped to a [data-tap] element for a moment (see docs/art-style.md). A petted cat or judge
   shows its other face; the hearts are hidden until then */
.lc-face-pet, .lc-heart { opacity: 0; }
.lc-tapped .lc-face { opacity: 0; }
.lc-tapped .lc-face-pet { opacity: 1; }
[data-tap] { cursor: pointer; -webkit-tap-highlight-color: transparent; }
/* the reset beat (docs/art-style.md): a runner is hidden except while it runs */
.lc-run-x, .lc-breeze { opacity: 0; }
/* a sparkle beside the step just sung shows only while it twinkles; with reduced motion only the rim is there */
.lc-new-spark { transform-box: fill-box; transform-origin: 50% 50%; transform: scale(0); }
.lc-new-rim { transition: opacity .5s ease-out; }
.lc-rim-off .lc-new-rim { opacity: 0; }
@media (prefers-reduced-motion: no-preference) {
  .lc-tapped .lc-nuzzle { transform-box: fill-box; transform-origin: 50% 90%; animation: lc-nuzzle .55s ease-in-out 2; }
  .lc-tapped .lc-heart { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-heart 1.2s ease-out both; }
  .lc-tapped .lc-ear { animation: lc-ear-now .45s ease-in-out 0s 2 !important; }
  .lc-tapped .lc-bobble { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-bobble .5s ease-out; }
  .lc-tapped .lc-hop { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-hop .7s ease-out; }
  .lc-tapped .lc-dunk { animation: lc-dunk .8s ease-out; }
  .lc-tapped .lc-sway { animation: lc-swing 1.3s ease-out 0s 1 !important; }
  .lc-tapped .lc-sun { animation: lc-sunpop .8s ease-out 0s 1 !important; }
  .lc-tapped .lc-flame { animation: lc-flare .7s ease-out 0s 1 !important; }
  .lc-tapped .lc-flicker { animation: lc-flash .8s ease-out 0s 1 !important; }
  .lc-breathe { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-breathe 4.6s ease-in-out infinite; }
  .lc-blink { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-blink 6s ease-in-out infinite; }
  .lc-tail { transform-box: fill-box; animation: lc-tail 3.4s ease-in-out infinite; }
  .lc-tail-l { transform-origin: 100% 100%; }
  .lc-tail-r { transform-origin: 0% 100%; }
  .lc-steam { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-steam 7s ease-in-out infinite; }
  .lc-steam:nth-of-type(2n) { animation-duration: 9s; animation-delay: -3s; }
  .lc-glow { animation: lc-glow 1.8s ease-in-out infinite; }
  /* the step just sung: the cat hops once and three sparkles twinkle and go; its thin rim fades at the next touch */
  .lc-hop { animation: lc-hop .6s cubic-bezier(.3, 0, .3, 1) .2s both; }
  .lc-new-spark { animation: lc-new-spark 2s ease-in-out both; }
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
  .lc-sway { transform-box: fill-box; transform-origin: 50% 0%; animation: lc-sway 5s ease-in-out infinite; }
  .lc-rain { animation: lc-rain .9s linear infinite; }
  .lc-snow { animation: lc-snow 9s linear infinite; }
  .lc-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-flame 1.1s ease-in-out infinite; }
  .lc-scroll { animation: lc-scroll 7s linear infinite; }
  .lc-ride { animation: lc-ride 16s linear infinite; }
  .lc-float { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-float 6s ease-in-out infinite; }
  .lc-spark { animation: lc-spark 2.8s ease-out infinite; }
  .lc-leave { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-leave .4s ease-in both; }
  .lc-run-x { animation: lc-run-x 1s linear both; }
  .lc-run-y { animation: lc-run-y 1s ease-in both; }
  .lc-scurry { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-scurry .2s ease-in-out 5 both; animation-delay: inherit; }
  .lc-arrive { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-arrive .45s ease-out both; }
  .lc-plop { animation: lc-plop .7s ease-out .3s both; }
  .lc-shiver { animation: lc-shiver .5s linear .9s 2; }
  .lc-breeze { animation: lc-breeze 1.7s ease-in-out .2s both; }
  .lc-tummy { animation: lc-tummy .5s ease-out 1.5s both; }
}
@keyframes lc-nuzzle { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(-9deg) translateY(-1px); } 70% { transform: rotate(8deg); } }
@keyframes lc-heart { 0% { transform: translate(0, 6px) scale(.4); opacity: 0; } 20% { opacity: 1; transform: translate(0, 0) scale(1); } 100% { transform: translate(var(--lc-x, 0px), -30px) scale(1.1); opacity: 0; } }
@keyframes lc-ear-now { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(-18deg); } 70% { transform: rotate(8deg); } }
@keyframes lc-bobble { 0%, 100% { transform: scale(1, 1); } 30% { transform: scale(1.04, .94); } 60% { transform: scale(.98, 1.03); } }
@keyframes lc-hop { 0%, 100% { transform: translateY(0) rotate(0deg); } 35% { transform: translateY(-16px) rotate(-10deg); } 70% { transform: translateY(0) rotate(4deg); } 85% { transform: translateY(-4px); } }
@keyframes lc-dunk { 0%, 100% { transform: translateY(0); } 30% { transform: translateY(7px); } 60% { transform: translateY(-3px); } }
@keyframes lc-swing { 0%, 100% { transform: rotate(0deg); } 20% { transform: rotate(-16deg); } 45% { transform: rotate(12deg); } 70% { transform: rotate(-6deg); } }
@keyframes lc-sunpop { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.35); } }
@keyframes lc-flare { 0%, 100% { transform: scale(1, 1); } 40% { transform: scale(1.5, 1.7); } }
@keyframes lc-flash { 0%, 100% { opacity: 1; } 20% { opacity: .3; } 40% { opacity: 1; } 60% { opacity: .5; } }
@keyframes lc-leave { 0% { opacity: 1; transform: scale(1, 1); } 40% { opacity: 1; transform: scale(1.04, .9); } 100% { opacity: 0; transform: scale(.9, .8); } }
@keyframes lc-run-x { 0% { transform: translateX(0); opacity: 0; } 8% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(var(--lc-dx, 100px)); opacity: 0; } }
@keyframes lc-run-y { 0% { transform: translateY(0); } 38% { transform: translateY(calc(var(--lc-dy, 0px) * .25 - 34px)); } 100% { transform: translateY(var(--lc-dy, 0px)); } }
@keyframes lc-scurry { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }
@keyframes lc-arrive { 0% { opacity: 0; transform: scale(.6, .5); } 60% { opacity: 1; transform: scale(1.08, .92); } 100% { opacity: 1; transform: scale(1, 1); } }
@keyframes lc-plop { 0% { transform: translateY(-26px); } 55% { transform: translateY(0); } 72% { transform: translateY(-7px); } 100% { transform: translateY(0); } }
@keyframes lc-shiver { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-2.5px); } 40% { transform: translateX(2.5px); } 60% { transform: translateX(-2px); } 80% { transform: translateX(2px); } }
@keyframes lc-breeze { 0% { transform: translateX(-120px); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(460px); opacity: 0; } }
@keyframes lc-tummy { 0% { transform: translateY(46px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes lc-breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.003, 1.008); } }
@keyframes lc-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.12); } }
@keyframes lc-tail { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
@keyframes lc-steam { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-7px) scale(1.06, 1.1); } }
@keyframes lc-hop { 0%, 100% { transform: translateY(0); } 38% { transform: translateY(-7px); } 68% { transform: translateY(1.2px); } }
@keyframes lc-new-spark { 0% { transform: scale(0) rotate(-30deg); } 20% { transform: scale(1.15) rotate(0deg); } 42% { transform: scale(.7); } 64% { transform: scale(1); } 100% { transform: scale(0) rotate(30deg); } }
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
@keyframes lc-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes lc-rain { from { transform: translate(0, 0); } to { transform: translate(-15px, 40px); } }
@keyframes lc-snow { from { transform: translate(0, 0); } to { transform: translate(-40px, 120px); } }
@keyframes lc-spark { 0% { transform: translate(0, 0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(var(--lc-x, 6px), -64px); opacity: 0; } }
@keyframes lc-flame { 0%, 100% { transform: scale(1, 1) rotate(-2deg); } 35% { transform: scale(.92, 1.12) rotate(3deg); } 70% { transform: scale(1.06, .94) rotate(-1deg); } }
@keyframes lc-scroll { from { transform: translateX(0); } to { transform: translateX(var(--lc-w, -200px)); } }
@keyframes lc-ride { from { transform: translate(0, 0); } to { transform: translate(var(--lc-x, 200px), var(--lc-y, 34px)); } }
@keyframes lc-float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(var(--lc-x, 6px), var(--lc-y, -3px)); } }
@media (prefers-reduced-motion: reduce) {
  .lc-breathe, .lc-blink, .lc-tail, .lc-steam, .lc-glow, .lc-ear, .lc-shake, .lc-yawn-head, .lc-yawn-off, .lc-stretch, .lc-snooze, .lc-sun, .lc-twinkle, .lc-leaf, .lc-bob, .lc-flicker, .lc-drift, .lc-sway, .lc-rain, .lc-snow, .lc-flame, .lc-scroll, .lc-ride, .lc-float, .lc-spark { animation: none !important; }
  .lc-yawn-on { animation: none !important; opacity: 0; }
  .lc-tapped .lc-heart { opacity: 1; }
  .lc-leave { opacity: 0; }
}`;
