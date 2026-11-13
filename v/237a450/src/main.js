/* Boot: load the save, register the screens, open the right one. */
import { app, boot, show, $ } from "./ui/app.js";
import "./ui/home.js";
import "./ui/take-screen.js";
import "./ui/beat.js";
import "./ui/wardrobe.js";
import "./ui/album.js";
import "./ui/places.js";
import "./ui/settings.js";
import "./ui/onboarding.js";
import { runFrames, running } from "./ui/take-screen.js";
import { rangeFrame } from "./ui/onboarding.js";
import { openDev } from "./ui/settings.js";
import { ART_CSS } from "./art/index.js";
import * as St from "./state.js";

const style = document.createElement("style");
style.textContent = ART_CSS;
document.head.appendChild(style);

boot();
if (app.S.dev.panel) {
  const b = document.createElement("button");
  b.className = "dev-fab";
  b.textContent = "Dev";
  b.setAttribute("aria-label", "Dev tools");
  b.onclick = () => openDev();
  document.body.appendChild(b);
}
show(app.S.onboarded ? "home" : "onboard");

/* Test hook for the browser pane, where animation frames are throttled. */
window.LC = {
  get S() { return app.S; },
  get screen() { return app.screen; },
  get take() { return running(); },
  St,
  show,
  run: (seconds, fps) => runFrames(seconds, fps),
  range: (seconds, fps = 60) => { for (let i = 0; i < seconds * fps; i++) rangeFrame(1 / fps); },
  voice: (v) => { app.S.dev.voice = v; app.save(); },
  click: (sel) => { const el = $(sel); if (el) el.click(); return !!el; },
};
