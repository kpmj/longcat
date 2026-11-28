/* How the train station's things move (2026-11-28, a proposal: the place is not in the calendar until the designer picks).
   Added to ART_CSS (art/css.js). Everything is inside prefers-reduced-motion: no-preference, so with less motion
   nothing moves; what shows only while it moves (a letter, the chime's ring, a puff) is hidden outside that too.
   A turning part (the signal's arm, the clock's hands, the chime's strip) holds a square round its pivot
   (station.js), so the middle of its own box is the pivot: fill-box, 50% 50%. Lengths are in the units of the
   group the class is on: a prop is drawn in its picture's px and scaled down to about a fifth. */
export const STATION_CSS = `
.lc-letter, .lc-ring, .lc-lid-steam, .lc-toy-puff, .lc-car-flash { opacity: 0; }
@media (prefers-reduced-motion: no-preference) {
  /* the carriage (乙): it rocks on its springs and its windows light up for a moment */
  [data-tap="carriage"].lc-tapped .lc-rock { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-rock 1.1s ease-in-out; }
  [data-tap="carriage"].lc-tapped .lc-car-flash { animation: lc-car-flash 1.3s ease-out both; }
  /* the train: it chugs, a quick bob and shake, while the effects layer blows its big puff */
  [data-tap="train"].lc-tapped .lc-chug { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-chug 1.3s ease-in-out; }
  /* the signal's arm drops and lifts again */
  .lc-arm, .lc-hand-h, .lc-hand-m { transform-box: fill-box; transform-origin: 50% 50%; }
  [data-tap="signal"].lc-tapped .lc-arm { animation: lc-arm 1.6s ease-in-out; }
  /* and it drops by itself just before the train pulls out, and lifts once it has gone (ui/home-fx.js) */
  .lc-arm { transition: transform .8s ease-in-out; }
  .lc-clear .lc-arm { transform: rotate(42deg); }
  /* the clock's hands spin round once, the long one a moment after the short one */
  [data-tap="clock"].lc-tapped .lc-hand-h { animation: lc-spin 1.25s cubic-bezier(.45, 0, .3, 1); }
  [data-tap="clock"].lc-tapped .lc-hand-m { animation: lc-spin 1.25s cubic-bezier(.45, 0, .3, 1) .08s; }
  /* the post box hops, squashing first, and a letter flies out of its slot */
  [data-tap="postbox"].lc-tapped .lc-st-hop { transform-box: fill-box; transform-origin: 50% 100%; animation: lc-st-hop .8s ease-out; }
  [data-tap="postbox"].lc-tapped .lc-letter { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-letter 1.4s ease-out .12s both; }
  /* the wind chime sways from its hook (lc-sway) and swings when pressed; its paper strip sways after the bell */
  [data-tap="chime"] .lc-sway { transform-origin: 50% 50%; }
  .lc-strip { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-strip 3.1s ease-in-out infinite; }
  [data-tap="chime"].lc-tapped .lc-strip { animation: lc-swing 1.4s ease-out .15s 1; }
  [data-tap="chime"].lc-tapped .lc-ring { animation: lc-ring 1.1s ease-out both; }
  /* on the judge's head: the ticket's punched dot jumps out, the ekiben's lid lifts and lets out steam, the toy
     locomotive puffs */
  [data-tap="ticket"].lc-tapped .lc-punch { transform-box: fill-box; transform-origin: 50% 50%; animation: lc-punch .9s ease-out both; }
  [data-tap="ekiben"].lc-tapped .lc-lid { transform-box: fill-box; transform-origin: 0% 100%; animation: lc-lid .9s ease-out; }
  [data-tap="ekiben"].lc-tapped .lc-lid-steam { animation: lc-puff-up 1s ease-out .15s both; }
  [data-tap="toyloco"].lc-tapped .lc-toy-puff { animation: lc-puff-up 1s ease-out both; }
}
@keyframes lc-chug { 0%, 100% { transform: translate(0, 0); } 8% { transform: translate(3px, -14px); } 16% { transform: translate(-2px, 0); } 26% { transform: translate(3px, -12px); } 34% { transform: translate(-2px, 0); } 44% { transform: translate(2px, -9px); } 52% { transform: translate(-1px, 0); } 62% { transform: translate(1px, -6px); } 70% { transform: translate(0, 0); } 80% { transform: translate(0, -3px); } }
@keyframes lc-arm { 0%, 100% { transform: rotate(0deg); } 24% { transform: rotate(44deg); } 30% { transform: rotate(38deg); } 34% { transform: rotate(42deg); } 62% { transform: rotate(42deg); } 84% { transform: rotate(-5deg); } 92% { transform: rotate(2deg); } }
@keyframes lc-rock { 0%, 100% { transform: translateY(0) rotate(0deg); } 18% { transform: translateY(-6px) rotate(-.6deg); } 40% { transform: translateY(2px) rotate(.4deg); } 62% { transform: translateY(-3px) rotate(-.2deg); } 80% { transform: translateY(1px); } }
@keyframes lc-car-flash { 0% { opacity: 0; } 15% { opacity: .9; } 55% { opacity: .7; } 100% { opacity: 0; } }
@keyframes lc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes lc-st-hop { 0%, 100% { transform: translateY(0) scale(1, 1); } 14% { transform: translateY(0) scale(1.06, .9); } 42% { transform: translateY(-80px) scale(.96, 1.05); } 70% { transform: translateY(0) scale(1.05, .94); } 84% { transform: translateY(-12px) scale(1, 1); } }
@keyframes lc-letter { 0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(.3); } 55% { opacity: 1; transform: translate(-16px, -64px) rotate(-28deg) scale(1); } 100% { opacity: 0; transform: translate(-22px, -104px) rotate(-46deg) scale(1); } }
@keyframes lc-strip { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes lc-ring { 0%, 100% { opacity: 0; } 12% { opacity: 1; } 40% { opacity: .2; } 55% { opacity: .9; } }
@keyframes lc-punch { 0% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 60% { transform: translate(10px, -16px) rotate(120deg); opacity: 1; } 100% { transform: translate(16px, -4px) rotate(220deg); opacity: 0; } }
@keyframes lc-lid { 0%, 100% { transform: translateY(0) rotate(0deg); } 30% { transform: translateY(-9px) rotate(-12deg); } 60% { transform: translateY(-6px) rotate(-8deg); } }
@keyframes lc-puff-up { 0% { opacity: 0; transform: translateY(4px); } 25% { opacity: 1; } 100% { opacity: 0; transform: translateY(-10px); } }`;
