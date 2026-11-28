/* Longcat's own small effects layer (2026-11-27). the designer asked ChatGPT how to make the animation finer and chose to try
   its proposal C (an effects layer with particles and mesh deformation) as I adjusted it: our own few hundred lines
   instead of PixiJS, so the game keeps "no dependencies"; drawn like the prints (flat shapes, the key line, the
   palette; no glow). On the trial page (tools/art/motion.mjs, picks of 2026-11-28) the designer kept all four: the waterfall's
   spray, leaves that turn over, the sitting monkey's tail bent as a mesh, and paper for a good take.

   One canvas over a picture, in that picture's own px (`width`; `k` scales them to the canvas). Everything that moves
   is an effect: { step(dt, t), draw(ctx, t), done }. The loop runs only while there is an effect, at most `fps`
   times a second, and never while the page is hidden. A canvas taken out of the page (Home drawn again, another
   screen) stops its loop and lets go of its listeners at the next frame. Nobody makes one when the player asks for
   less motion (prefers-reduced-motion): the pictures then stand as they are. */
export const INK = "#262122";
export const PALETTE = { red: "#bf452d", yuzu: "#ebb229", indigo: "#33517a", green: "#5d8a63", cream: "#f6efe0", teal: "#3f8fa6" };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = list => list[Math.floor(Math.random() * list.length)];
const ease = t => 1 - Math.pow(1 - t, 3);

export const lessMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function makeFx(canvas, { width = 393, height = 682, fps = 60, onIdle = null } = {}) {
  const ctx = canvas.getContext("2d");
  const effects = new Set();
  let speed = 1, raf = 0, last = 0, drawn = 0, clock = 0, k = 1, dpr = 1, gone = false;
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(3, window.devicePixelRatio || 1); k = r.width / width || 1;
    canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
  };
  const wipe = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); };
  const destroy = () => { gone = true; effects.clear(); cancelAnimationFrame(raf); raf = 0; document.removeEventListener("visibilitychange", wake); window.removeEventListener("resize", refit); };
  const frame = now => {
    raf = 0;
    if (!canvas.isConnected) return destroy();
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) * speed; last = now; clock += dt;
    for (const e of [...effects]) { e.step(dt, clock); if (e.done) effects.delete(e); }
    if (now - drawn >= 1000 / fps - 4 || !effects.size) {
      drawn = now; wipe();
      ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
      for (const e of effects) e.draw(ctx, clock);
    }
    if (effects.size) { if (!document.hidden) raf = requestAnimationFrame(frame); }
    else if (onIdle) onIdle();
  };
  function wake() { if (!gone && !raf && effects.size && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function refit() { if (!canvas.isConnected) return destroy(); fit(); wake(); }
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("resize", refit);
  fit();
  return {
    add(e) { effects.add(e); wake(); return e; },
    remove(e) { if (e) effects.delete(e); if (!effects.size) wipe(); },
    clear() { effects.clear(); wipe(); },
    set speed(v) { speed = v; }, get speed() { return speed; },
    fit, destroy,
  };
}

/* ---------- particles: small flat things that fly, fall and fade ---------- */
function particles() {
  const list = [];
  return {
    list,
    step(dt) {
      for (const p of list) {
        p.age += dt;
        p.vy += (p.g || 0) * dt;
        if (p.drag) { p.vx *= Math.exp(-p.drag * dt); p.vy *= Math.exp(-p.drag * dt); }
        if (p.fall && p.vy > p.fall) p.vy += (p.fall - p.vy) * Math.min(1, 6 * dt);
        p.x += p.vx * dt + (p.wob ? Math.sin(p.age * p.wobW + p.ph) * p.wob * dt : 0);
        p.y += p.vy * dt;
        p.rot += (p.spin || 0) * dt; p.flip += (p.flipW || 0) * dt;
      }
      for (let i = list.length - 1; i >= 0; i--) if (list[i].age >= list[i].life) list.splice(i, 1);
    },
  };
}
const alphaOf = p => { const f = p.age / p.life; return f < (p.fadeIn || 0) ? f / p.fadeIn : f > 1 - (p.fadeOut || 0.3) ? Math.max(0, (1 - f) / (p.fadeOut || 0.3)) : 1; };

/* WATER: drops off the waterfall and a little spray at its foot, all the time; `splash()` when the water is pressed.
   at(x, y) turns the picture's own units into phone px; falls = { left, right, top, foot } in those units */
export function waterSpray({ at, falls, pale = "#f6fafc", rate = 12, scale = 1 }) {
  const P = particles(); let due = 0;
  const drop = (x, y, vx, vy, r) => P.list.push({ x, y, vx, vy, g: 230, r, age: 0, life: rnd(.55, .9), fadeOut: .35, kind: "drop" });
  const puff = (x, y, r) => P.list.push({ x, y, vx: rnd(-8, 4), vy: rnd(-16, -8), r, grow: rnd(1.6, 2.4), age: 0, life: rnd(.9, 1.4), fadeIn: .15, fadeOut: .6, kind: "puff" });
  const foot = () => { const x = rnd(falls.left - 4, falls.right - 6); return at(x, falls.foot - rnd(4, 10)); };
  return {
    step(dt) {
      due += dt * rate;
      while (due >= 1) { due -= 1; const p = foot(); drop(p.x, p.y, rnd(-34, 8) * scale, rnd(-78, -38) * scale, rnd(1.1, 2.2) * scale); if (Math.random() < .18) puff(p.x, p.y + 2, rnd(4, 7) * scale); }
      P.step(dt);
    },
    draw(ctx) { drawWater(ctx, P.list, pale); },
    splash() {
      /* the water throws drops out of its left side, where it shows on every phone, and the foot bursts */
      for (let i = 0; i < 26; i++) { const y = rnd(falls.top + 50, falls.foot - 20), p = at(falls.left + rnd(-2, 3), y); drop(p.x, p.y, rnd(-95, -35) * scale, rnd(-70, 10) * scale, rnd(1.3, 2.6) * scale); }
      for (let i = 0; i < 22; i++) { const p = foot(); drop(p.x, p.y, rnd(-70, 20) * scale, rnd(-150, -80) * scale, rnd(1.4, 2.8) * scale); }
      for (let i = 0; i < 5; i++) { const p = foot(); puff(p.x, p.y, rnd(7, 11) * scale); }
    },
  };
}
function drawWater(ctx, list, pale) {
  for (const p of list) {
    const a = alphaOf(p); if (a <= 0) continue;
    ctx.globalAlpha = a;
    if (p.kind === "puff") {
      const r = p.r * (1 + (p.grow - 1) * ease(p.age / p.life));
      ctx.globalAlpha = a * .55; ctx.fillStyle = pale;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 1.5, r, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = pale; ctx.strokeStyle = INK; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/* STEAM off the hot spring's pool beside the judge (2026-11-28): soft flat puffs that rise, widen, sway slowly and
   thin out, a few at a time; already rising when the layer starts. sources: [[x, y], ...] in phone px; rate: puffs a
   second in all */
export function steamWisps({ sources, pale = "#f8f7f2", rate = 2.2, scale = 1 }) {
  const P = particles(); let due = 0;
  const spawn = () => { const [x, y] = pick(sources); P.list.push({ x: x + rnd(-8, 8) * scale, y, vx: rnd(-3, 3) * scale, vy: rnd(-16, -10) * scale, wob: rnd(5, 9) * scale, wobW: rnd(.6, 1.1), ph: rnd(0, 6.3), r: rnd(6, 10) * scale, grow: rnd(2.2, 3), age: 0, life: rnd(3.4, 5), fadeIn: .25, fadeOut: .55 }); };
  const step = dt => { due += dt * rate; while (due >= 1) { due -= 1; spawn(); } P.step(dt); };
  for (let t = 0; t < 4; t += .1) step(.1);
  return {
    step,
    draw(ctx) {
      ctx.fillStyle = pale;
      for (const p of P.list) {
        const a = alphaOf(p); if (a <= 0) continue;
        const r = p.r * (1 + (p.grow - 1) * ease(p.age / p.life));
        ctx.globalAlpha = a * .42; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 1.15, r * .8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = a * .3; ctx.beginPath(); ctx.ellipse(p.x + r * .45, p.y - r * .55, r * .7, r * .55, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* LEAVES that come down the two strips beside the judge's head, one at a time: each sways, tilts with its sway and
   turns over (its underside a darker green) as a real leaf does. strips: [[x0, x1], ...] in phone px; from: y to
   start at; to: y to be gone by */
export function fallingLeaves({ strips, from, to, greens, every = [2.6, 4.6], scale = 1 }) {
  const P = particles(); let due = .4, side = 0;
  let LEAF = null; // made when first drawn (a page has Path2D, the tests do not)
  const spawn = () => {
    const [x0, x1] = strips[side++ % strips.length];
    P.list.push({ x: rnd(x0, x1), y: from, vx: 0, vy: rnd(20, 27) * scale, wob: rnd(26, 40) * scale, wobW: rnd(1.1, 1.6), ph: rnd(0, 6.3), rot: rnd(-.6, .6), spin: 0, flip: rnd(0, 6.3), flipW: rnd(1.8, 3.2), s: rnd(.85, 1.15) * scale, age: 0, life: 99, fadeIn: 0, colour: Math.random() < .5 ? 2 : 3 });
  };
  return {
    step(dt) {
      due -= dt; if (due <= 0) { spawn(); due = rnd(every[0], every[1]); }
      P.step(dt);
      for (const p of P.list) if (p.y > to) p.age = p.life;
    },
    /* a press at x y (the canvas's px): the nearest leaf within reach that has not been pressed falls three and a
       half times as fast, swaying less and turning over quicker; a leaf answers once (the designer, 2026-11-28). True when
       one did */
    hit(x, y, reach = 20 * scale) {
      let best = null, d0 = reach;
      for (const p of P.list) {
        if (p.tapped) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < d0 && p.y > from + 8) { d0 = d; best = p; }
      }
      if (!best) return false;
      best.tapped = true; best.vy *= 3.5; best.wob *= .5; best.flipW *= 1.8;
      return true;
    },
    /* where the leaves are now (for the tests) */
    get positions() { return P.list.map(p => ({ x: p.x, y: p.y, vy: p.vy, tapped: !!p.tapped })); },
    draw(ctx) {
      LEAF = LEAF || new Path2D("M0 0Q5 -7 15 -5Q21 -2 23 0Q20 4 14 5Q5 6 0 0Z");
      for (const p of P.list) {
        const tilt = Math.cos(p.age * p.wobW + p.ph) * .7, turn = Math.cos(p.flip);
        const fade = Math.min(1, (to - p.y) / 40, (p.y - from + 12) / 24);
        if (fade <= 0) continue;
        ctx.save(); ctx.globalAlpha = Math.max(0, fade);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot + tilt); ctx.scale(p.s, p.s * (Math.abs(turn) < .12 ? .12 * Math.sign(turn || 1) : turn)); ctx.translate(-11.5, 0);
        ctx.fillStyle = greens[turn < 0 ? 1 : p.colour]; ctx.strokeStyle = INK; ctx.lineWidth = 1 / p.s;
        ctx.fill(LEAF); ctx.stroke(LEAF);
        ctx.beginPath(); ctx.moveTo(2, 0); ctx.quadraticCurveTo(11, -1.5, 21, 0); ctx.lineWidth = .6 / p.s; ctx.stroke();
        ctx.restore();
      }
    },
  };
}

/* A GOOD TAKE: a handful of paper pieces thrown up from the judge's head (slips, stars, dots, in the palette with
   the key line) that flutter down turning over, and one thin ring. One shot; done when the last piece is gone */
export function paperBurst({ x, y, scale = 1, count = 44 }) {
  const P = particles(), colours = [PALETTE.red, PALETTE.yuzu, PALETTE.indigo, PALETTE.green, PALETTE.cream, PALETTE.teal];
  for (let i = 0; i < count; i++) {
    const ang = rnd(-Math.PI * .92, -Math.PI * .08), v = rnd(170, 330) * scale;
    P.list.push({ x: x + rnd(-8, 8), y: y + rnd(-4, 6), vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, g: 420 * scale, drag: .9, fall: rnd(50, 80) * scale, wob: rnd(20, 50) * scale, wobW: rnd(3, 6), ph: rnd(0, 6.3), rot: rnd(0, 6.3), spin: rnd(-5, 5), flip: rnd(0, 6.3), flipW: rnd(6, 12), age: 0, life: rnd(2.1, 3.1), fadeOut: .22, shape: pick(["slip", "slip", "star", "dot", "tri"]), c: pick(colours), s: rnd(.85, 1.25) * scale });
  }
  let ring = 0;
  return {
    done: false,
    step(dt) { ring += dt; P.step(dt); if (!P.list.length) this.done = true; },
    draw(ctx) {
      if (ring < .55) { const f = ring / .55; ctx.globalAlpha = 1 - f; ctx.strokeStyle = PALETTE.red; ctx.lineWidth = 2.2 * scale * (1 - f * .6); ctx.beginPath(); ctx.arc(x, y, (14 + 70 * ease(f)) * scale, 0, Math.PI * 2); ctx.stroke(); }
      for (const p of P.list) {
        const a = alphaOf(p); if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.s * Math.cos(p.flip), p.s);
        ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = .9 / p.s; ctx.beginPath();
        if (p.shape === "slip") ctx.rect(-2, -4.2, 4, 8.4);
        else if (p.shape === "dot") ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
        else if (p.shape === "tri") { ctx.moveTo(0, -4); ctx.lineTo(3.8, 3); ctx.lineTo(-3.8, 3); ctx.closePath(); }
        else for (let j = 0; j < 10; j++) { const r = j % 2 ? 2.1 : 5, t = -Math.PI / 2 + j * Math.PI / 5; ctx[j ? "lineTo" : "moveTo"](Math.cos(t) * r, Math.sin(t) * r); }
        if (p.shape === "star") ctx.closePath();
        ctx.fill(); ctx.stroke(); ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* A PUFF: a few small things thrown up from x y that fall and fade in under a second: dots of yarn fluff with the key
   line, and `stars` small four-point stars. For a note that lands (the yarn's colours, stars) and for one that gets
   away (grey fluff, slower, no stars) on the singing screen. One shot */
export function puff({ x, y, colours, count = 9, stars = 0, speed = 1, spread = .9, scale = 1, life = [.55, .85] }) {
  const P = particles();
  for (let i = 0; i < count + stars; i++) {
    const ang = -Math.PI / 2 + rnd(-spread, spread), v = rnd(70, 150) * speed * scale;
    P.list.push({ x: x + rnd(-6, 6) * scale, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, g: 320 * scale, drag: 1.2, age: 0, life: rnd(life[0], life[1]), fadeOut: .4, r: rnd(1.6, 3) * scale, c: pick(colours), star: i >= count, rot: rnd(0, 6.3), spin: rnd(-6, 6) });
  }
  return {
    done: false,
    step(dt) { P.step(dt); if (!P.list.length) this.done = true; },
    draw(ctx) {
      for (const p of P.list) {
        const a = alphaOf(p); if (a <= 0) continue;
        ctx.globalAlpha = a; ctx.strokeStyle = INK; ctx.lineWidth = .9 * scale;
        if (p.star) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = PALETTE.yuzu; star4(ctx, 4.6 * scale); ctx.fill(); ctx.stroke(); ctx.restore(); }
        else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    },
  };
}
const star4 = (ctx, r) => { ctx.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? r * .3 : r, t = -Math.PI / 2 + j * Math.PI / 4; ctx[j ? "lineTo" : "moveTo"](Math.cos(t) * rr, Math.sin(t) * rr); } ctx.closePath(); };
const noteShape = (ctx, s) => { ctx.beginPath(); ctx.ellipse(-2.6 * s, 0, 3.2 * s, 2.5 * s, -.35, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(.4 * s, 0); ctx.lineTo(.4 * s, -11 * s); ctx.quadraticCurveTo(4.5 * s, -10 * s, 6 * s, -5.5 * s); ctx.stroke(); };

/* A RUN OF GOOD NOTES (the singing screen's combo, in the print's way instead of the bright CSS one): in the box
   x y w h, stars that pop up and fade one after another (tier 1 and up), notes in ink that rise and sway (2 and up),
   and paper that falls turning over (4 and up). `tier` can change while it runs; `end()` fades it out */
export function comboSky({ box, tier = 1, scale = 1 }) {
  const { x, y, w, h } = box, P = particles(), spots = [];
  let level = tier, ending = 0, noteDue = 0, paperDue = 0;
  for (let i = 0; i < 7; i++) spots.push({ x: x + rnd(.04, .96) * w, y: y + rnd(.04, .7) * h, ph: rnd(0, 1), per: rnd(1.3, 2.1), s: rnd(.7, 1.15) * scale });
  return {
    done: false,
    set tier(v) { level = v; if (v > 0) ending = 0; },
    end() { ending = ending || .001; },
    step(dt) {
      if (ending) { ending += dt; if (ending > .6) this.done = true; }
      noteDue -= dt; paperDue -= dt;
      if (level >= 2 && noteDue <= 0 && !ending) { noteDue = rnd(.5, .9); P.list.push({ kind: "note", x: x + rnd(.08, .92) * w, y: y + h + 10, vx: 0, vy: -rnd(38, 55) * scale, wob: 18 * scale, wobW: rnd(2, 3), ph: rnd(0, 6), age: 0, life: rnd(2.6, 3.4), fadeIn: .1, fadeOut: .3, s: rnd(.9, 1.2) * scale, rot: 0 }); }
      if (level >= 4 && paperDue <= 0 && !ending) { paperDue = rnd(.12, .22); P.list.push({ kind: "paper", x: x + rnd(0, 1) * w, y: y - 8, vx: 0, vy: rnd(50, 80) * scale, wob: rnd(20, 40) * scale, wobW: rnd(3, 5), ph: rnd(0, 6), rot: rnd(0, 6), spin: rnd(-3, 3), flip: rnd(0, 6), flipW: rnd(5, 9), age: 0, life: h / (60 * scale) + 1, fadeOut: .15, c: pick([PALETTE.red, PALETTE.yuzu, PALETTE.indigo, PALETTE.green, PALETTE.cream]), s: rnd(.8, 1.1) * scale }); }
      P.step(dt);
    },
    draw(ctx, t) {
      const fade = ending ? Math.max(0, 1 - ending / .6) : 1;
      ctx.strokeStyle = INK; ctx.lineWidth = 1.1 * scale;
      if (level >= 1) for (const sp of spots) {
        const k = ((t / sp.per + sp.ph) % 1), pop = k < .5 ? Math.sin(k / .5 * Math.PI) : 0;
        if (pop <= 0) continue;
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(sp.x, sp.y); ctx.scale(pop * sp.s, pop * sp.s); ctx.fillStyle = PALETTE.yuzu; star4(ctx, 9); ctx.lineWidth = 1.2 / Math.max(.3, pop * sp.s); ctx.fill(); ctx.stroke(); ctx.restore();
      }
      for (const p of P.list) {
        const a = alphaOf(p) * fade; if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y);
        if (p.kind === "note") { ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1.5 * p.s; noteShape(ctx, p.s * 1.3); }
        else { ctx.rotate(p.rot); ctx.scale(p.s * Math.cos(p.flip), p.s); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = .9 / p.s; ctx.beginPath(); ctx.rect(-2.2, -4.4, 4.4, 8.8); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* The paper burst on a canvas of its own over the whole page (class lc-fx-burst, styles.css), at x y in the page's
   px; the canvas goes when the last piece is down. For a good take (take-screen.js) and the sun or moon pressed
   when its time of day is all done (ui/home.js). Nothing with less motion */
export function burstOver(x, y) {
  if (lessMotion() || typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.className = "lc-fx-burst";
  c.setAttribute("aria-hidden", "true");
  document.body.append(c);
  const fx = makeFx(c, { width: innerWidth, height: innerHeight, onIdle: () => c.remove() });
  return fx.add(paperBurst({ x, y }));
}

/* A PICTURE WHOSE TAIL BENDS (mesh deformation). A generated picture is one still image; here its tail is cut into
   a strip of triangles along the tail's middle line and each triangle drawn where the bent tail puts it, so the tail
   swings like a rope while the rest of the picture stays as it is. img: the picture; box: where it is drawn, in
   phone px ({ x, y, w, h }, the picture fitted inside as SVG's xMidYMid meet); cut: the picture's row below which
   only the tail is; line: the tail's middle line in the picture's px, from where it leaves the body to its tip;
   half: half its width with the key line. hop() jumps it as the game's hop does, and the tail swings after */
export function bendingTail({ img, box, cut, line, half, swing = .48, period = 2.6 }) {
  const iw = img.naturalWidth, ih = img.naturalHeight, s = Math.min(box.w / iw, box.h / ih);
  const ox = box.x + (box.w - iw * s) / 2, oy = box.y + (box.h - ih * s) / 2;
  /* the middle line again in even steps, with its length along the way */
  const pts = resample(line, 16), lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = lens[lens.length - 1];
  const normals = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; return [-dy / n, dx / n]; });
  let hopAt = -9, t = 0;
  const bend = (u, time) => {
    /* how far a point u (0 at the body, 1 at the tip) turns: a slow swing that runs down the tail, and after a hop a
       quick wag that dies away */
    const idle = swing * u * Math.sin(time * Math.PI * 2 / period - u * 2.2);
    const since = time - hopAt, kick = since >= 0 && since < 2.4 ? .95 * u * Math.exp(-since / .55) * Math.sin(since * 10 - u * 1.6) : 0;
    return idle + kick;
  };
  const hopY = time => {
    /* the game's lc-hop: up 16 at 35 %, down at 70 %, a small bounce at 85 %, over .7 s (y in the print's units) */
    const f = (time - hopAt) / .7; if (f < 0 || f > 1) return [0, 0];
    const key = [[0, 0, 0], [.35, -16, -10], [.7, 0, 4], [.85, -4, 2], [1, 0, 0]];
    for (let i = 1; i < key.length; i++) if (f <= key[i][0]) { const [f0, y0, r0] = key[i - 1], [f1, y1, r1] = key[i], g = (f - f0) / (f1 - f0), e = g < .5 ? 2 * g * g : 1 - Math.pow(-2 * g + 2, 2) / 2; return [y0 + (y1 - y0) * e, r0 + (r1 - r0) * e]; }
    return [0, 0];
  };
  return {
    hop() { hopAt = t; },
    step(dt, time) { t = time; },
    draw(ctx, time) {
      const [dy, rot] = hopY(time);
      ctx.save();
      /* the hop turns round the feet, as transform-origin 50% 100% does in the game */
      const fx = ox + iw * s / 2, fy = oy + ih * s;
      ctx.translate(fx, fy + dy * (box.unit || 1)); ctx.rotate(rot * Math.PI / 180); ctx.translate(-fx, -fy);
      ctx.translate(ox, oy); ctx.scale(s, s);
      /* the body: the picture above the cut, as it is */
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, iw, cut + .6); ctx.clip(); ctx.drawImage(img, 0, 0); ctx.restore();
      /* the tail: each step of the middle line turned by the bend at its place, joined end to end */
      const q = [pts[0]], ang = [0];
      for (let i = 1; i < pts.length; i++) {
        const a = bend(lens[i] / L, time), dx = pts[i][0] - pts[i - 1][0], dy2 = pts[i][1] - pts[i - 1][1], c = Math.cos(a), sn = Math.sin(a);
        q.push([q[i - 1][0] + dx * c - dy2 * sn, q[i - 1][1] + dx * sn + dy2 * c]); ang.push(a);
      }
      const side = (p, n, a, sign) => { const c = Math.cos(a), sn = Math.sin(a), nx = n[0] * c - n[1] * sn, ny = n[0] * sn + n[1] * c; return [p[0] + sign * half * nx, p[1] + sign * half * ny]; };
      for (let i = 0; i < pts.length - 1; i++) {
        const sA0 = side(pts[i], normals[i], 0, 1), sB0 = side(pts[i], normals[i], 0, -1), sA1 = side(pts[i + 1], normals[i + 1], 0, 1), sB1 = side(pts[i + 1], normals[i + 1], 0, -1);
        const dA0 = side(q[i], normals[i], ang[i], 1), dB0 = side(q[i], normals[i], ang[i], -1), dA1 = side(q[i + 1], normals[i + 1], ang[i + 1], 1), dB1 = side(q[i + 1], normals[i + 1], ang[i + 1], -1);
        triangle(ctx, img, sA0, sB0, sA1, dA0, dB0, dA1);
        triangle(ctx, img, sB0, sB1, sA1, dB0, dB1, dA1);
      }
      ctx.restore();
    },
  };
}
function resample(line, n) {
  const segs = []; let total = 0;
  for (let i = 1; i < line.length; i++) { const l = Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]); segs.push(l); total += l; }
  const out = [];
  for (let k = 0; k <= n; k++) {
    let d = total * k / n, i = 0;
    while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const f = segs[i] ? Math.min(1, d / segs[i]) : 0;
    out.push([line[i][0] + (line[i + 1][0] - line[i][0]) * f, line[i][1] + (line[i + 1][1] - line[i][1]) * f]);
  }
  return out;
}
/* one triangle of a picture (s0 s1 s2, in its px) drawn at d0 d1 d2: clipped to the target triangle, grown by half a
   px so neighbours leave no hairline between them, and the picture moved there by the one affine map that fits */
function triangle(ctx, img, s0, s1, s2, d0, d1, d2) {
  const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
  const grow = p => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * .9, p[1] + dy / l * .9]; };
  const [g0, g1, g2] = [grow(d0), grow(d1), grow(d2)];
  const det = (s1[0] - s0[0]) * (s2[1] - s0[1]) - (s2[0] - s0[0]) * (s1[1] - s0[1]);
  if (Math.abs(det) < 1e-6) return;
  const a = ((d1[0] - d0[0]) * (s2[1] - s0[1]) - (d2[0] - d0[0]) * (s1[1] - s0[1])) / det;
  const b = ((d2[0] - d0[0]) * (s1[0] - s0[0]) - (d1[0] - d0[0]) * (s2[0] - s0[0])) / det;
  const c = ((d1[1] - d0[1]) * (s2[1] - s0[1]) - (d2[1] - d0[1]) * (s1[1] - s0[1])) / det;
  const d = ((d2[1] - d0[1]) * (s1[0] - s0[0]) - (d1[1] - d0[1]) * (s2[0] - s0[0])) / det;
  const e = d0[0] - a * s0[0] - b * s0[1], f = d0[1] - c * s0[0] - d * s0[1];
  ctx.save();
  ctx.beginPath(); ctx.moveTo(g0[0], g0[1]); ctx.lineTo(g1[0], g1[1]); ctx.lineTo(g2[0], g2[1]); ctx.closePath(); ctx.clip();
  ctx.transform(a, c, b, d, e, f); ctx.drawImage(img, 0, 0);
  ctx.restore();
}
