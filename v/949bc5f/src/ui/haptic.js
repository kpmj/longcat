/* A small tap you can feel, where the browser can make one. `navigator.vibrate` works on Android. An iPhone's
   browser has no way to do it from a script: Safari only taps when the player's own tap lands on a switch control,
   and what wants a tap here (a turn laid in the middle of a drag) is not a tap. So on an iPhone nothing happens
   until the game is an app; what the eye gets instead is the caller's business. */
export function buzz(ms = 12) {
  try { if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms); } catch { /* not allowed here */ }
}
