/* Idle animations and small effects used by the markup. Everything sits inside prefers-reduced-motion: no-preference,
   so "reduce" turns all of it off; a second block also stops any running animation explicitly.
   Rules of the woodblock style: transforms and opacity only, never a filter; nothing gets shinier with progress.
   Home page (the designer, 2026-11-14): the judge blinks, twitches an ear, shakes its head now and then and yawns; cats twitch
   their ears, blink and stretch; steam rises, leaves fall, water drifts, yuzu bob, the lamp flickers, the sun and moon
   breathe and the stars twinkle. A class goes on a wrapper <g> that has no transform attribute of its own. */
import { framesCss } from "./frames.js";
import { PICTURES } from "./pictures.js";
import { STATION_CSS } from "./print/places/station-css.js";

export const ART_CSS = `/* touch: the page adds lc-tapped to a [data-tap] element for a moment (see docs/art-style.md). A petted cat or judge
   shows its other face; the hearts are hidden until then */
.lc-face-pet, .lc-heart { opacity: 0; }
/* the jungle: a bird's notes show only while they rise; the judge's heart is red, and pink while the page has lc-pink
   on its root (the pink heart lies on the red one) */
.lc-note, .lc-held-b { opacity: 0; }
.lc-pink .lc-held-b { opacity: 1; }
.lc-tapped .lc-face { opacity: 0; }
.lc-tapped .lc-face-pet { opacity: 1; }
[data-tap] { cursor: pointer; -webkit-tap-highlight-color: transparent; }
/* the hat cat rides inside the judge's head group (lc-rider, print/judge.js), so it moves with the head. A pat on the
   judge is not a pat on that cat: it keeps its own face and hearts until it is patted itself */
.lc-tapped .lc-rider [data-tap]:not(.lc-tapped) .lc-face { opacity: 1; }
.lc-tapped .lc-rider [data-tap]:not(.lc-tapped) .lc-face-pet, .lc-tapped .lc-rider [data-tap]:not(.lc-tapped) .lc-heart { opacity: 0; animation: none; }
.lc-tapped .lc-rider [data-tap]:not(.lc-tapped) .lc-nuzzle { animation: none; }
/* the reset beat (docs/art-style.md): a runner is hidden except while it runs */
.lc-run-x, .lc-breeze { opacity: 0; }
/* a sparkle beside the step just sung shows only while it twinkles; with reduced motion nothing marks the step */
.lc-new-spark { transform-box: fill-box; transform-origin: 50% 50%; transform: scale(0); }
/* a shooting star shows only while it flies */
.lc-shoot { opacity: 0; }
/* the jungle's waterfall: its drops and its puff of spray show only while it is pressed */
.lc-drop, .lc-spray, .lc-surge { opacity: 0; }
/* a cat's yawning face waits unseen for its moment (lc-cat-yawn-show) */
.lc-face-yawn { opacity: 0; }
@media (prefers-reduced-motion: no-preference) {
  /* a cat patted (the designer's pick on the cat page, 2026-11-28): pressed flat first, then the nuzzle; its ears laid back and
     springing up; its tail swishing */
  .lc-tapped .lc-nuzzle { transform-box: fill-box; transform-origin: 50% 90%; animation: lc-nuzzle 1s ease-in-out 1; }
  .lc-tapped .lc-heart { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-heart 1.2s ease-out both; }
  .lc-tapped .lc-ear { animation: lc-ear-now .45s ease-in-out 0s 2 !important; }
  [data-tap="cat"].lc-tapped .lc-ear { animation: lc-ear-flat 1s ease-in-out 0s 1 !important; }
  [data-tap="cat"].lc-tapped .lc-tseg { animation: lc-tseg-swish .5s ease-in-out 3; animation-delay: calc(var(--lc-lag, 0s) * .4); }
  /* the capybara patted (the designer's pick on the capybara page, 2026-11-28): pressed flat, up, settling; its ears laid back
     outwards and springing up; the fruit on its head bouncing a moment after */
  .lc-tapped .lc-bobble { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-bobble 1s ease-in-out 1; }
  [data-tap="judge"].lc-tapped .lc-ear:not(.lc-rider .lc-ear) { animation: lc-jear-flat 1s ease-in-out 0s 1 !important; }
  [data-tap="judge"].lc-tapped .lc-hop { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-jitem .9s ease-in-out .12s 1 both; }
  .lc-tapped .lc-hop { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-hop .7s ease-out; }
  .lc-tapped .lc-dunk { animation: lc-dunk .8s ease-out; }
  /* the jungle's birds and its sitting monkey hop when they themselves are pressed (not when the picture behind
     them is), a bird's two notes rise, and the heart beats once */
  [data-tap|="bird"].lc-tapped .lc-peep, [data-tap="monkey"].lc-tapped .lc-peep { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-hop .7s ease-out; }
  [data-tap|="bird"].lc-tapped .lc-note { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-heart 1.2s ease-out both; }
  [data-tap="heart"].lc-tapped .lc-beat { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-beat .5s ease-out; }
  .lc-wave { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-wave 6s ease-in-out infinite; }
  .lc-tapped .lc-sway, .lc-sway.lc-tapped { animation: lc-swing 1.3s ease-out 0s 1 !important; }
  /* the jungle's waterfall: streaks run down the water, the foam breathes; pressed, the water rushes, drops jump
     from its foot and a puff of spray swells */
  .lc-fall { animation: lc-fall 1.6s linear infinite; }
  .lc-foam { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-foam 1.8s ease-in-out infinite alternate; }
  [data-tap="waterfall"].lc-tapped .lc-fall { animation-duration: .55s !important; }
  [data-tap="waterfall"].lc-tapped .lc-foam { animation-duration: .35s !important; }
  [data-tap="waterfall"].lc-tapped .lc-drop { animation: lc-drop .9s ease-out both; }
  [data-tap="waterfall"].lc-tapped .lc-spray { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-spray 1s ease-out both; }
  [data-tap="waterfall"].lc-tapped .lc-surge { animation: lc-surge .9s ease-in both; }
  .lc-tapped .lc-sun, .lc-sun.lc-tapped { animation: lc-sunpop .8s ease-out 0s 1 !important; }
  .lc-tapped .lc-flame { animation: lc-flare .7s ease-out 0s 1 !important; }
  .lc-tapped .lc-flicker { animation: lc-flash .8s ease-out 0s 1 !important; }
  .lc-breathe { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-breathe 4.6s ease-in-out infinite; }
  .lc-blink { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-blink 6s ease-in-out infinite; }
  /* the finer capybara (the designer's picks, 2026-11-28; tools/art/judge-motion.mjs): blinks on an uneven beat with a double
     and a slow blink, and glances to each side; each ear's flick bounces back and sometimes comes again; the head
     follows the breath a moment later; now and then the nostrils sniff */
  [data-tap="judge"] .lc-blink { animation: lc-jblink 10.3s linear infinite; }
  .lc-jlook { animation: lc-jlook 14.1s ease-in-out infinite; }
  [data-tap="judge"] .lc-ear:not(.lc-rider .lc-ear) { animation-name: lc-jear; }
  .lc-jbreath { animation: lc-jbreath 4.6s ease-in-out .35s infinite; }
  .lc-sniff { transform-box: view-box; animation: lc-sniff 11s ease-in-out infinite; }
  .lc-tail { transform-box: fill-box; animation: lc-tail 3.4s ease-in-out infinite; }
  .lc-tail-l { transform-origin: 100% 100%; }
  .lc-tail-r { transform-origin: 0% 100%; }
  /* the finer cat (the designer's picks on the cat page, 2026-11-28; tools/art/cats-motion.mjs): the tail in three pieces, each
     turning at its joint a little later and further than the one before (art/print/cat.js catTailChain); eyes
     that blink on an uneven beat, with a double and a slow blink, and glance to each side; a yawn now and then,
     each cat out of step */
  .lc-tseg { animation: lc-tseg 3.4s ease-in-out infinite; animation-delay: calc(var(--lc-lag, 0s) - var(--lc-ph, 0s)); }
  .lc-blink2 { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-blink2 9.7s linear infinite; }
  .lc-look { animation: lc-look 13.3s ease-in-out infinite; }
  .lc-awake { animation: lc-cat-yawn-hide 31s linear infinite; }
  .lc-face-yawn { animation: lc-cat-yawn-show 31s linear infinite; }
  .lc-yawn-tilt { animation: lc-cat-yawn-tilt 31s ease-in-out infinite; }
  .lc-steam { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-steam 7s ease-in-out infinite; }
  .lc-steam:nth-of-type(2n) { animation-duration: 9s; animation-delay: -3s; }
  .lc-glow { animation: lc-glow 1.8s ease-in-out infinite; }
  /* the step just sung: the cat hops once and three sparkles twinkle and go; nothing stays */
  .lc-new-hop { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-new-hop .75s ease-in-out .2s both; }
  .lc-new-spark { animation: lc-new-spark 2s ease-in-out both; }
  /* the garment just chosen (its card on the home page, Wear this one): its cat hops once and nothing stays on the
     picture (the designer, 2026-11-14). The page adds lc-picked to the pieces the art marks with data-zone */
  .lc-picked { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-new-hop .75s ease-in-out both; }
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
  /* the hot spring made again (2026-11-28): the shishi-odoshi's tube turns round its peg (its group is placed on the
     peg, so the origin is 0 0): it fills with its open end up, sinking a little, tips, pours and swings back with a
     clack; pressed, it tips at once. The stream through it shows only while it is down. A snow monkey pressed ducks
     under and blows bubbles; the lantern pressed in the morning lights up a moment */
  .lc-shishi { transform-box: view-box; transform-origin: 0 0; animation: lc-shishi 6s ease-in-out infinite; }
  .lc-shishi-water { transform-box: fill-box; transform-origin: 50% 0%; animation: lc-shishi-water 6s linear infinite; }
  [data-tap="shishi"].lc-tapped .lc-shishi { animation: lc-shishi-tip 1.1s ease-in-out 0s 1 !important; }
  [data-tap="shishi"].lc-tapped .lc-shishi-water { animation: lc-shishi-pour 1.1s linear 0s 1 !important; }
  [data-tap="onsen-monkey"].lc-tapped .lc-duck { animation: lc-duck .9s ease-in-out 1; }
  [data-tap="onsen-monkey"].lc-tapped .lc-bubbles { animation: lc-bubbles 1.2s ease-out .2s 1 both; }
  [data-tap="lamp"].lc-tapped .lc-lampflash { animation: lc-lampflash 1.2s ease-out 0s 1 both; }
  /* year-two places: the lighthouse lamp sweeps (its origin is set inline, at the lamp), a firework opens and fades,
     a shooting star crosses, the washing turns */
  .lc-sweep { animation: lc-sweep 9s ease-in-out infinite; }
  .lc-burst { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-burst 4.2s ease-out infinite; }
  .lc-shoot { animation: lc-shoot 12s linear infinite; }
  .lc-spin { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-spin 2.6s linear infinite; }
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
@keyframes lc-sweep { 0%, 100% { transform: rotate(-9deg); opacity: .6; } 50% { transform: rotate(14deg); opacity: 1; } }
@keyframes lc-burst { 0% { transform: scale(.08); opacity: 0; } 6% { opacity: 1; } 42% { transform: scale(1); opacity: 1; } 70%, 100% { transform: scale(1.1); opacity: 0; } }
@keyframes lc-shoot { 0%, 84% { transform: translate(0, 0); opacity: 0; } 86% { opacity: 1; } 93% { transform: translate(-170px, 75px); opacity: 0; } 100% { transform: translate(-170px, 75px); opacity: 0; } }
@keyframes lc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes lc-nuzzle { 0%, 100% { transform: none; } 12% { transform: translateY(1.5px) scale(1.06, .88); } 28% { transform: translateY(-1px) scale(.97, 1.05) rotate(-9deg); } 50% { transform: rotate(8deg); } 70% { transform: rotate(-4deg); } 86% { transform: rotate(2deg); } }
@keyframes lc-ear-flat { 0%, 100% { transform: rotate(0deg); } 15%, 55% { transform: rotate(-26deg); } 72% { transform: rotate(8deg); } 86% { transform: rotate(-3deg); } }
@keyframes lc-tseg { 0%, 100% { transform: rotate(calc(var(--lc-d, 1) * var(--lc-a, 6) * -.5deg)); } 50% { transform: rotate(calc(var(--lc-d, 1) * var(--lc-a, 6) * 1deg)); } }
@keyframes lc-tseg-swish { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(calc(var(--lc-d, 1) * var(--lc-a, 6) * 1.8deg)); } 70% { transform: rotate(calc(var(--lc-d, 1) * var(--lc-a, 6) * -1.2deg)); } }
@keyframes lc-blink2 { 0%, 16%, 19.5%, 51%, 54%, 54.8%, 57.8%, 82%, 92%, 100% { transform: scaleY(1); } 17.6%, 52.5%, 56.3% { transform: scaleY(.12); } 85%, 89% { transform: scaleY(.16); } }
@keyframes lc-look { 0%, 30%, 52%, 72%, 90%, 100% { transform: translate(0, 0); } 34%, 48% { transform: translate(-1.8px, .3px); } 76%, 86% { transform: translate(1.8px, -.4px); } }
@keyframes lc-cat-yawn-hide { 0%, 87.9% { opacity: 1; } 88%, 94.4% { opacity: 0; } 94.5%, 100% { opacity: 1; } }
@keyframes lc-cat-yawn-show { 0%, 87.9% { opacity: 0; } 88%, 94.4% { opacity: 1; } 94.5%, 100% { opacity: 0; } }
@keyframes lc-cat-yawn-tilt { 0%, 86% { transform: rotate(0deg); } 89% { transform: rotate(-7deg) translateY(-1px); } 93.5% { transform: rotate(-7deg) translateY(-1px); } 96% { transform: rotate(1.5deg); } 98%, 100% { transform: rotate(0deg); } }
@keyframes lc-heart { 0% { transform: translate(0, 6px) scale(.4); opacity: 0; } 20% { opacity: 1; transform: translate(0, 0) scale(1); } 100% { transform: translate(var(--lc-x, 0px), -30px) scale(1.1); opacity: 0; } }
@keyframes lc-ear-now { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(-18deg); } 70% { transform: rotate(8deg); } }
@keyframes lc-bobble { 0%, 100% { transform: none; } 12% { transform: translateY(3px) scale(1.06, .9); } 30% { transform: translateY(-3px) scale(.97, 1.05); } 50% { transform: scale(1.02, .98); } 70% { transform: scale(.99, 1.01); } }
@keyframes lc-jblink { 0%, 18.8%, 21%, 54%, 56%, 56.8%, 58.8%, 84%, 92%, 100% { transform: scaleY(1); } 20%, 55.2%, 57.8% { transform: scaleY(.15); } 87%, 89.5% { transform: scaleY(.3); } }
@keyframes lc-jlook { 0%, 30%, 48%, 66%, 86%, 100% { transform: translate(0, 0); } 34%, 44% { transform: translate(-4px, .5px); } 70%, 82% { transform: translate(4px, -1px); } }
@keyframes lc-jear { 0%, 82%, 100% { transform: rotate(0deg); } 84.5% { transform: rotate(calc(var(--lc-d, -1) * 18deg)); } 87% { transform: rotate(calc(var(--lc-d, -1) * -6deg)); } 89% { transform: rotate(calc(var(--lc-d, -1) * 2deg)); } 91% { transform: rotate(0deg); } 93.5% { transform: rotate(calc(var(--lc-d, -1) * 10deg)); } 95.5% { transform: rotate(calc(var(--lc-d, -1) * -2deg)); } 97% { transform: rotate(0deg); } }
@keyframes lc-jear-flat { 0%, 100% { transform: rotate(0deg); } 12%, 50% { transform: rotate(calc(var(--lc-d, -1) * 28deg)); } 68% { transform: rotate(calc(var(--lc-d, -1) * -9deg)); } 84% { transform: rotate(calc(var(--lc-d, -1) * 3deg)); } }
@keyframes lc-jitem { 0%, 100% { transform: translateY(0) rotate(0deg); } 20% { transform: translateY(2px) rotate(4deg); } 45% { transform: translateY(-11px) rotate(-12deg); } 70% { transform: translateY(0) rotate(6deg); } 85% { transform: translateY(-1px) rotate(-3deg); } }
@keyframes lc-jbreath { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes lc-sniff { 0%, 60%, 66%, 100% { transform: scale(1, 1); } 61.5% { transform: scale(1.28, .82); } 63% { transform: scale(.95, 1.06); } 64.5% { transform: scale(1.22, .86); } }
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
@keyframes lc-breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.006, 1.016); } }
@keyframes lc-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.12); } }
@keyframes lc-tail { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }
@keyframes lc-steam { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-7px) scale(1.06, 1.1); } }
/* the small hop of a cat whose step was just sung. Its own name: lc-hop is the fruit on the judge's head, and a second
   lc-hop here once replaced that hop with this small one, so the fruit seemed to stop hopping */
@keyframes lc-new-hop { 0%, 100% { transform: none; } 16% { transform: translateY(1px) scale(1.03, .95); } 44% { transform: translateY(-9px) scale(.98, 1.03); } 70% { transform: translateY(0) scale(1.03, .96); } 84% { transform: translateY(-1.5px); } }
@keyframes lc-new-spark { 0% { transform: scale(0) rotate(-30deg); } 20% { transform: scale(1.15) rotate(0deg); } 42% { transform: scale(.7); } 64% { transform: scale(1); } 100% { transform: scale(0) rotate(30deg); } }
@keyframes lc-glow { 0%, 100% { opacity: .75; } 50% { opacity: .35; } }
@keyframes lc-ear { 0%, 84%, 100% { transform: rotate(0deg); } 87% { transform: rotate(-16deg); } 90% { transform: rotate(7deg); } 93% { transform: rotate(-8deg); } 96% { transform: rotate(0deg); } }
@keyframes lc-shake { 0%, 70%, 82%, 100% { transform: rotate(0deg); } 73% { transform: rotate(-3.5deg); } 76% { transform: rotate(3.5deg); } 79% { transform: rotate(-2deg); } }
@keyframes lc-yawn-head { 0%, 34%, 52%, 100% { transform: translateY(0) rotate(0deg); } 37% { transform: translateY(2.5px) rotate(1deg); } 41%, 46% { transform: translateY(-5px) rotate(-3.5deg); } 48% { transform: rotate(1.6deg); } 49.2% { transform: rotate(-1.2deg); } 50.4% { transform: rotate(.6deg); } }
@keyframes lc-yawn-on { 0%, 38.4% { opacity: 0; } 39%, 46.6% { opacity: 1; } 47.2%, 100% { opacity: 0; } }
@keyframes lc-yawn-off { 0%, 38.4% { opacity: 1; } 39%, 46.6% { opacity: 0; } 47.2%, 100% { opacity: 1; } }
@keyframes lc-stretch { 0%, 78%, 96%, 100% { transform: translate(0, 0) scale(1, 1); } 84% { transform: translate(calc(var(--lc-d, 1) * 6px), -2px) scale(1.08, .94); } 90% { transform: translate(calc(var(--lc-d, 1) * -1px), 0) scale(.97, 1.03); } }
@keyframes lc-snooze { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.02, 1.04); } }
@keyframes lc-sun { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@keyframes lc-fall { 0% { transform: translate(0, 0); opacity: 0; } 12% { opacity: .85; } 85% { opacity: .85; } 100% { transform: translate(0, 300px); opacity: 0; } }
@keyframes lc-foam { 0% { transform: scale(.85); } 100% { transform: scale(1.1); } }
@keyframes lc-drop { 0% { transform: translate(0, 0); opacity: 0; } 15% { opacity: 1; } 45% { transform: translate(calc(var(--lc-x) * .6), var(--lc-y)); opacity: 1; } 100% { transform: translate(var(--lc-x), 34px); opacity: 0; } }
@keyframes lc-surge { 0% { transform: translate(0, 0); opacity: 0; } 12% { opacity: .9; } 80% { opacity: .7; } 100% { transform: translate(0, 300px); opacity: 0; } }
@keyframes lc-spray { 0% { transform: scale(.4); opacity: 0; } 25% { opacity: .8; } 100% { transform: scale(1.6, 2); opacity: 0; } }
@keyframes lc-twinkle { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
@keyframes lc-leaf { 0% { transform: translate(0, -30px) rotate(0deg); opacity: 0; } 6% { opacity: 1; } 30% { transform: translate(-22px, 130px) rotate(110deg); } 60% { transform: translate(14px, 280px) rotate(230deg); } 90% { opacity: 1; } 100% { transform: translate(-10px, 450px) rotate(360deg); opacity: 0; } }
@keyframes lc-bob { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-2px) rotate(4deg); } }
@keyframes lc-flicker { 0%, 100% { opacity: 1; } 22% { opacity: .78; } 40% { opacity: .95; } 63% { opacity: .7; } 81% { opacity: .92; } }
@keyframes lc-drift { from { transform: translateX(0); } to { transform: translateX(-24px); } }
@keyframes lc-beat { 0%, 100% { transform: scale(1); } 35% { transform: scale(1.22); } 65% { transform: scale(.95); } }
@keyframes lc-wave { 0%, 68%, 100% { transform: rotate(0deg); } 74% { transform: rotate(-14deg); } 80% { transform: rotate(10deg); } 86% { transform: rotate(-10deg); } 92% { transform: rotate(6deg); } }
@keyframes lc-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes lc-rain { from { transform: translate(0, 0); } to { transform: translate(-15px, 40px); } }
@keyframes lc-snow { from { transform: translate(0, 0); } to { transform: translate(-40px, 120px); } }
@keyframes lc-spark { 0% { transform: translate(0, 0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(var(--lc-x, 6px), -64px); opacity: 0; } }
@keyframes lc-flame { 0%, 100% { transform: scale(1, 1) rotate(-2deg); } 35% { transform: scale(.92, 1.12) rotate(3deg); } 70% { transform: scale(1.06, .94) rotate(-1deg); } }
@keyframes lc-scroll { from { transform: translateX(0); } to { transform: translateX(var(--lc-w, -200px)); } }
@keyframes lc-ride { from { transform: translate(0, 0); } to { transform: translate(var(--lc-x, 200px), var(--lc-y, 34px)); } }
@keyframes lc-float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(var(--lc-x, 6px), var(--lc-y, -3px)); } }
@keyframes lc-shishi { 0% { transform: rotate(18deg); } 60% { transform: rotate(11deg); } 64% { transform: rotate(-26deg); } 72% { transform: rotate(-24deg); } 77% { transform: rotate(21deg); } 81% { transform: rotate(15deg); } 85%, 100% { transform: rotate(18deg); } }
@keyframes lc-shishi-water { 0%, 62% { opacity: 0; transform: scaleY(.2); } 65%, 73% { opacity: 1; transform: scaleY(1); } 76%, 100% { opacity: 0; transform: scaleY(1); } }
@keyframes lc-shishi-tip { 0% { transform: rotate(18deg); } 13% { transform: rotate(-26deg); } 42% { transform: rotate(-24deg); } 56% { transform: rotate(21deg); } 68% { transform: rotate(15deg); } 80%, 100% { transform: rotate(18deg); } }
@keyframes lc-shishi-pour { 0%, 8% { opacity: 0; transform: scaleY(.2); } 14%, 42% { opacity: 1; transform: scaleY(1); } 50%, 100% { opacity: 0; transform: scaleY(1); } }
@keyframes lc-duck { 0%, 100% { transform: translateY(0); } 18% { transform: translateY(8px); } 40% { transform: translateY(8px); } 68% { transform: translateY(-2px); } 84% { transform: translateY(1px); } }
@keyframes lc-bubbles { 0% { opacity: 0; transform: translateY(2px); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(-12px); } }
@keyframes lc-lampflash { 0% { opacity: 0; } 15% { opacity: 1; } 55% { opacity: .85; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .lc-jlook, .lc-jbreath, .lc-sniff, .lc-tseg, .lc-blink2, .lc-look, .lc-awake, .lc-face-yawn, .lc-yawn-tilt, .lc-breathe, .lc-blink, .lc-tail, .lc-steam, .lc-glow, .lc-ear, .lc-shake, .lc-yawn-head, .lc-yawn-off, .lc-stretch, .lc-snooze, .lc-sun, .lc-twinkle, .lc-leaf, .lc-bob, .lc-flicker, .lc-drift, .lc-sway, .lc-rain, .lc-snow, .lc-flame, .lc-scroll, .lc-ride, .lc-float, .lc-spark, .lc-sweep, .lc-burst, .lc-shoot, .lc-spin, .lc-wave, .lc-fall, .lc-foam, .lc-shishi, .lc-shishi-water { animation: none !important; }
  [data-tap|="bird"].lc-tapped .lc-note { opacity: 1; }
  .lc-yawn-on { animation: none !important; opacity: 0; }
  .lc-tapped .lc-heart { opacity: 1; }
  .lc-leave { opacity: 0; }
}`
  /* a generated animal that moves inside itself: its frames (art/frames.js) */
  + framesCss({ "bird-1": PICTURES.jungle["bird-1-frames"] })
  /* the effects layer (art/fx.js) on Home: while it runs it draws these itself, so the picture's own are put away:
     the sitting monkey (its tail bends there), the waterfall's drops and spray, the falling leaves */
  + `
.lc-fx-tail .lc-fx-sit { opacity: 0; }
.lc-fx-on .lc-drop, .lc-fx-on .lc-spray, .lc-fx-on .lc-surge, .lc-fx-on .lc-leaf { display: none; }`
  /* the train station, a proposal (2026-11-28) */
  + STATION_CSS;
