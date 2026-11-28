/* The hot spring made again (2026-11-28; the designer: 「像是火車站一樣可以重新設計溫泉嗎 可以直接在這邊做」), built like the
   jungle (./jungle.js) so it can take a generated background and generated things, chosen piece by piece on the board
   (tools/art/onsen-board.mjs, tools/art/sets/onsen-new.json). Until the designer has picked, the game's hot spring is still
   ./onsen.js; this module is only drawn by the board.

   - The scenery: a tall picture (400 x 711) for each time of day, or, without one, a plain drawing of sky, hills,
     mist and the pool's far edge.
   - The things, in the free places Home leaves (tools/art/ui-zones.json): the sun or moon; a stone lantern, which
     glows from dusk and flares when pressed; a wooden bath bucket, which hops; a snow monkey soaking, which ducks
     under; a shishi-odoshi, whose tube fills, tips with a clack and rises again, and tips at once when pressed. Each
     a generated picture or a drawing (`pics`), on small piles of stones drawn here (ARRANGE, LAYOUTS).
   - In front of the judge, as on the old hot spring: the pool's water with its ripples, two yuzu floating (pressed,
     they dunk) and wisps of steam (`band`, drawn on Home too: frontOnTall).
   - On Home the effects layer adds steam rising beside the judge and leaves coming down (`motion`, ui/home-fx.js).
   - The judge's head: the yuzu, or one of the new ideas (print/items.js: a towel, an onsen egg, a tiny bucket). */
import { makePlace, mist, tint, mix, VIEW, pen } from "./kit.js";
import { picture, PICTURES } from "../../pictures.js";

const INK = "#262122", YUZU = "#ebb229";
const live = on => on("x") !== "";

/* WHERE THINGS ARE, in the print's 400 x 500. A thing stands by its feet (x y); the shishi-odoshi by the middle of
   its base stone; the monkey by the middle of its water line. `piles`: stones to stand on, from the edge (x0, x1, top
   y). Besides the strips beside the head, Home leaves free the sides low beside the body and the two ends of the rim
   (x 16 to 70 and 330 to 384), as for the jungle's log */
export const ARRANGE = {
  /* 甲 lantern on the left, the shishi-odoshi on the right, the bucket on the left end of the rim, the monkey in the
     water on the right */
  edges: { sun: [62, 46, 36, 36], piles: [[-6, 66, 334], [334, 406, 304]], lantern: [32, 334], shishi: [368, 304], bucket: [44, 447], monkey: [364, 474] },
  /* 乙 the same, the other way round */
  flip: { sun: [62, 46, 36, 36], piles: [[-6, 66, 304], [334, 406, 334]], lantern: [368, 334], shishi: [32, 304], bucket: [356, 447], monkey: [36, 474] },
  /* night of 丙: the lantern lit up on the left, the bucket put away, the monkey dozing on the right */
  night: { sun: [62, 46, 36, 36], piles: [[-6, 66, 334], [334, 406, 304]], lantern: [32, 334], shishi: [368, 304], bucket: null, monkey: [364, 474] },
  /* 丙 on GPT's snowy mountain spring, the designer's picks (2026-11-28). After the designer's notes the same day (「燈籠和竹筒需要再重新擺放
     位置 他現在的位子和背景不搭」, then "the lamp and the bamboo should stay where they are. swapping location feels very
     weird ... the lamp looks like floating above the ground, bamboo is also not on a ground"): no stones of our own,
     the same places all day, and each thing standing on the picture's own snowy rocks, so they are placed in the
     tall picture's units (`onPicture`, measured on the picture: the flat top of the big rock low on the left, the
     rock at the foot of the shelter's posts on the right) and keep to those rocks on every phone; the monkey in the
     water in front, on the right. The shishi-odoshi stood on the right, at [366, 506] in the tall picture's units,
     until the designer, 2026-11-28: "Can we remove the bamboo thing from the hot spring location? Main reason is i feel it's too
     crowded but I like it a lot. So please use it in the future location". It
     is taken out of the hot spring and kept, drawing, pictures (PICKED.pics.shishi), tap and sound, for a place to
     come (docs/later.md, "For later") */
  snow: { sun: [62, 46, 36, 36], piles: [], onPicture: ["lantern"], lantern: [46, 567], shishi: null, bucket: null, monkey: [364, 476] },
};
/* 甲 and 乙 the same all day; 丙 turns with the day; `snow`: the snowy spring's own rocks, the same all day */
export const LAYOUTS = { edges: { all: "edges" }, flip: { all: "flip" }, day: { morning: "edges", golden: "flip", night: "night" }, snow: { all: "snow" } };
const arrangementOf = (layout, time) => ARRANGE[(LAYOUTS[layout] || {})[time] || (LAYOUTS[layout] || {}).all || "edges"];
/* the boxes things are drawn in (the board lays other versions in the same boxes) */
/* the monkey a quarter bigger since the designer's picks (「猴子跟capybara比有點太小」), then the lantern, the shishi-odoshi and the
   monkey bigger again (the designer, the same day: "make the objects bigger since they look extremely small next to the
   capybara") */
export const SIZE = { lantern: [60, 90], shishi: [84, 68], bucket: [34, 30], monkey: [68, 58] };
const boxOf = (id, [x, y]) => { const [w, h] = SIZE[id]; return id === "monkey" ? [x - w / 2, y - h * .72, w, h] : id === "shishi" ? [x - w / 2, y - h, w, h] : [x - w / 2, y - h, w, h]; };

/* ---------- the things as drawings (Claude's versions) ---------- */
const STONE = { morning: "#cfc7b6", golden: "#d9c2a2", night: "#8e94a4" };
const lanternArt = (q, time) => {
  const s = STONE[time] || STONE.morning, lit = time !== "morning";
  return `<g transform="translate(0 0) scale(.9)"><g fill="${s}" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"><path d="M-14 0h28v-8h-28Z"/><path d="M-6 -8h12v-20h-12Z"/><path d="M-15 -28h30v-26h-30Z"/><path d="M-27 -54Q0 -80 27 -54Z"/><circle cy="-74" r="4.6"/></g><rect x="-7" y="-48" width="14" height="13" fill="${lit ? "#f4d566" : "#e9dfbd"}" stroke="${INK}" stroke-width="1.2"/><path d="M-22 -58q10 -6 22 -5" fill="none" stroke="#7fa06a" stroke-width="3" stroke-linecap="round"/></g>`;
};
const bucketArt = () => `<path d="M-15 -26H15L12 0H-12Z" fill="#e2c79a" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="0" cy="-26" rx="15" ry="4.5" fill="#cfae7c" stroke="${INK}" stroke-width="1.4"/><path d="M-14.4 -19H14.4M-12.8 -7H12.8" stroke="#4a3a2a" stroke-width="2.2"/><path d="M6 -30Q15 -34 18 -24V-14Q16 -10 13 -12Z" fill="#f6f1e4" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M13 -26h4" stroke="#33517a" stroke-width="1.6"/>`;
const monkeyArt = (time) => {
  const water = time === "night" ? "#2c4f6e" : time === "golden" ? "#7fa5b0" : "#9cc3cf";
  return `<path d="M-19 4Q-20 -12 0 -13Q20 -12 19 4Z" fill="#8f8478" stroke="${INK}" stroke-width="1.6"/><circle cy="-21" r="12.5" fill="#8f8478" stroke="${INK}" stroke-width="1.6"/><path d="M-8.5 -24Q-9 -14 0 -12.5Q9 -14 8.5 -24Q4 -28 0 -25Q-4 -28 -8.5 -24Z" fill="#e79b8f"/><path d="M-6 -21q2.5 2 5 0M1 -21q2.5 2 5 0" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/><path d="M-2 -16q2 1.4 4 0" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/><path d="M-10 -32Q0 -38 10 -32L9 -29H-9Z" fill="#f6f1e4" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M-22 0H22V9H-22Z" fill="${water}"/><path d="M-22 0q5.5 -3 11 0t11 0t11 0t11 0" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
};
/* the shishi-odoshi: the stand (posts, peg, pipe, stone) and the tube, which turns round the peg. Drawn with its pipe
   coming from the left (`from`) and pouring on the left of the peg (`spout`), where the tube's open end is. `water`:
   the stream that falls through, from the tube's open end at rest down to the stone (x, y0, y1, width), seen only
   while the tube is tipped. Like GPT's stand, its pipe comes in over the posts from the far side */
const SHISHI = { peg: [2, -30], from: "right", spout: "left", water: [-21, -38.5, -9, 2.4], stream: "#cfe3ea" };
const shishiStandArt = (time) => `<path d="M-30 0Q-28 -9 -10 -10Q14 -10 30 -4V0Z" fill="${STONE[time] || STONE.morning}" stroke="${INK}" stroke-width="1.6"/><path d="M-2 -6V-36M6 -6V-36" stroke="${INK}" stroke-width="6.4" stroke-linecap="round"/><path d="M-2 -6V-36M6 -6V-36" stroke="#9cbf6c" stroke-width="3.6" stroke-linecap="round"/><path d="M-22 -46H40" stroke="${INK}" stroke-width="5.2" stroke-linecap="round"/><path d="M-22 -46H40" stroke="#9cbf6c" stroke-width="2.8" stroke-linecap="round"/><path d="M10 -48.5V-43.5" stroke="${INK}" stroke-width="1.2"/><path d="M-21 -45V-38" stroke="#cfe3ea" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`;
const shishiTubeArt = () => `<path d="M-27 -5L27 -5Q31 0 27 5L-27 5L-22 -5Z" fill="#9cbf6c" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 -5V5" stroke="#6f9150" stroke-width="2"/><circle r="1.8" fill="${INK}"/>`;
/* how the tube rests (its open end up, filling) when nothing moves it: a still shows it so */
const REST = 18;

/* The shishi-odoshi in its own units, its feet at 0 0: the stand, the stream and the tube on the peg. A picture
   version is { stand, tube, content: [x0 y0 x1 y1] of the stand picture's drawing (px), peg: [x y] on the stand
   picture, hole: [x y] on the tube picture, size: the tube to the stand, from: "left" | "right" (the side its pipe
   comes in from), spout: "left" | "right" (the side of the peg it pours on), water: [x y0 y1 w] on the stand
   picture, stream: its colour }; the tube picture's open end is on its left, as the drawing's is, and it is turned
   to the spout. The stand is drawn SIZE.shishi[1] tall */
function shishiOf(P, time) {
  if (!P) return { stand: shishiStandArt(time), tube: shishiTubeArt(), ...SHISHI };
  const [x0, y0, x1, y1] = P.content, k = SIZE.shishi[1] / (y1 - y0), cx = (x0 + x1) / 2, tk = k * P.size;
  const at = ([x, y]) => [(x - cx) * k, (y - y1) * k];
  return {
    stand: picture(P.stand, -cx * k, -y1 * k, P.stand.w * k, P.stand.h * k),
    tube: picture(P.tube, -P.hole[0] * tk, -P.hole[1] * tk, P.tube.w * tk, P.tube.h * tk),
    peg: at(P.peg), from: P.from, spout: P.spout, water: [...at([P.water[0], P.water[1]]), at([0, P.water[2]])[1], P.water[3] * k], stream: P.stream,
  };
}
/* it is turned so its pipe comes in from the nearer edge of the picture */
const shishiFlip = (x, S) => (x > 200) !== (S.from === "right");
/* where the tipped tube's water lands, in the print (the effects layer splashes there) */
export const shishiSplash = ([x, y], pic, time = "morning") => { const S = shishiOf(pic && pic.stand ? pic : null, time); return [x + (shishiFlip(x, S) ? -1 : 1) * S.water[0], y + S.water[2]]; };

/* one thing, a picture or a drawing, in its moving and pressable groups */
function thing(id, at, time, on, pic) {
  const [bx, by, bw, bh] = boxOf(id, at), [x, y] = at;
  const tapOf = (kind, m) => (live(on) ? `<g data-tap="${kind}">${m}</g>` : m);
  if (id === "lantern") {
    /* lit from dusk, its light flickering and flaring when pressed; in the morning unlit, and pressed it lights up a
       moment */
    const glow = time !== "morning" ? `<g${on("lc-flicker")}><circle cx="${x}" cy="${by + bh * .36}" r="${time === "night" ? 34 : 24}" fill="#f4d566" opacity="${time === "night" ? .32 : .2}"/></g>`
      : live(on) ? `<g${on("lc-lampflash")} opacity="0"><circle cx="${x}" cy="${by + bh * .36}" r="22" fill="#f4d566" opacity=".3"/></g>` : "";
    const art = pic ? picture(pic, bx, by, bw, bh, "xMidYMax meet") : `<g transform="translate(${x} ${y})">${lanternArt(null, time)}</g>`;
    return tapOf("lamp", `<circle cx="${x}" cy="${by + bh / 2}" r="${Math.max(bw, bh) / 2 + 4}" fill="${INK}" fill-opacity="0"/>${glow}${art}`);
  }
  if (id === "bucket") {
    const art = pic ? picture(pic, bx, by, bw, bh, "xMidYMax meet") : `<g transform="translate(${x} ${y})">${bucketArt()}</g>`;
    return tapOf("bucket", `<circle cx="${x}" cy="${by + bh / 2}" r="${bw / 2 + 6}" fill="${INK}" fill-opacity="0"/><g${on("lc-hop")}>${art}</g>`);
  }
  if (id === "monkey") {
    const art = pic ? picture(pic, bx, by, bw, bh, "xMidYMid meet") : `<g transform="translate(${x} ${y})">${monkeyArt(time)}</g>`;
    /* pressed, it ducks under and comes up, and three bubbles rise where it went under */
    const bubbles = live(on) ? `<g${on("lc-bubbles")} opacity="0">${[[-7, -3, 2.2], [1, -6, 2.8], [8, -2, 1.8]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#eef1e6" stroke="${INK}" stroke-width=".8"/>`).join("")}</g>` : "";
    return tapOf("onsen-monkey", `<circle cx="${x}" cy="${by + bh / 2}" r="${bw / 2 + 4}" fill="${INK}" fill-opacity="0"/><g${on("lc-duck")}><g${on("lc-bob", "animation-duration:5.2s")}>${art}</g></g>${bubbles}`);
  }
  if (id === "shishi") {
    /* the tube fills, tips, pours and swings back with a clack (lc-shishi), and tips at once when pressed; the
       stream through it shows only while it is down (lc-shishi-water) */
    const S = shishiOf(pic && pic.stand && pic.tube ? pic : null, time), flip = shishiFlip(x, S);
    const [wx, w0, w1, ww] = S.water;
    const water = live(on) ? `<rect${on("lc-shishi-water")} x="${(wx - ww / 2).toFixed(2)}" y="${w0.toFixed(2)}" width="${ww.toFixed(2)}" height="${(w1 - w0).toFixed(2)}" rx="${(ww / 2).toFixed(2)}" fill="${S.stream}" opacity="0"/>` : "";
    const tube = `<g transform="translate(${S.peg[0].toFixed(2)} ${S.peg[1].toFixed(2)})${S.spout === "right" ? " scale(-1 1)" : ""}"><g${on("lc-shishi")} transform="rotate(${REST})">${S.tube}</g></g>`;
    return tapOf("shishi", `<circle cx="${x}" cy="${y - bh / 2}" r="${bw / 2 + 2}" fill="${INK}" fill-opacity="0"/><g transform="translate(${x} ${y})${flip ? " scale(-1 1)" : ""}">${S.stand}${water}${tube}</g>`);
  }
  return "";
}

/* a small pile of flat stones from the edge, for a thing to stand on, outlined in the key line like the things */
const pile = (x0, x1, top, time) => {
  const q = pen(INK), s = STONE[time] || STONE.morning, dk = mix(s, "#000000", .18), w = x1 - x0, mid = (x0 + x1) / 2;
  return q.p(`M${x0 - 4} ${top + 44}Q${x0} ${top + 22} ${mid - w * .1} ${top + 18}Q${x1} ${top + 22} ${x1 + 4} ${top + 44}Z`, dk, 1.6)
    + q.p(`M${x0} ${top + 22}Q${x0 + 2} ${top + 4} ${mid} ${top}Q${x1 - 2} ${top + 4} ${x1} ${top + 22}Z`, s, 1.6)
    + q.l(`M${x0 + w * .15} ${top + 7}q${w * .2} -3 ${w * .4} -1.5`, .9, .6);
};

function parts(V, q, time, on, o) {
  const A = arrangementOf(o.layout, time), pics = o.pics || {};
  const [sx, sy, sw, sh] = A.sun, night = time === "night";
  const disc = night ? `<circle cx="${sx + sw / 2}" cy="${sy + sh / 2}" r="${sw * .38}" fill="${V.disc[0]}"/>` : `<circle cx="${sx + sw / 2}" cy="${sy + sh / 2}" r="${sw * .45}" fill="${V.disc[0]}"/>`;
  const sun = live(on) ? `<g data-tap="window"><g${on("lc-sun")}>${disc}</g></g>` : disc;
  const out = [{ id: "sun", box: A.sun, svg: sun }];
  /* each pile is its thing's (the one standing on it), and goes with it */
  A.piles.forEach(([a, b, t], i) => {
    const owner = ["lantern", "shishi"].find(id => A[id] && A[id][0] >= a && A[id][0] <= b);
    if (owner && (!A[owner] || pics[owner] === false)) return;
    out.push({ id: `pile-${owner || i}`, box: [a, t, b - a, 44], svg: pile(a, b, t, time) });
  });
  for (const id of ["lantern", "shishi", "bucket", "monkey"]) {
    if (!A[id] || pics[id] === false) continue;
    /* the bucket on the rim and the monkey in the water are in front of the rim's stones and the judge's feet; what
       stands on the picture's own ground is in the picture's units (`picture`) */
    out.push({ id, box: boxOf(id, A[id]), front: id === "bucket" || id === "monkey", picture: (A.onPicture || []).includes(id), svg: thing(id, A[id], time, on, pics[id] || null) });
  }
  return out;
}

const TALL = [400, 711];
/* the pool in front of the judge: its water and the deeper colour under it */
const poolOf = time => { const water = time === "night" ? "#2c4f6e" : time === "golden" ? "#55809a" : "#5d8ba3"; return { water, dk: mix(water, "#000000", .2) }; };
/* without a picture: a plain drawing of the place (the board's Claude version is its own tall drawing) */
function plainView(V, q, time) {
  const d = V.d;
  return q.p("M-10 292Q60 236 130 258Q200 214 270 252Q330 228 410 262V360H-10Z", d[3], 1.4, .9) + mist(V, 40, 262, 180, 13)
    + q.p("M-10 352Q100 328 200 340Q300 328 410 350V500H-10Z", tint("#9cc3cf", time), 1.5) + mist(V, 160, 330, 170, 12);
}

export function hotspringPlace(o = {}) {
  const opts = { layout: "day", pics: {}, back: null, item: "yuzu", ...o };
  /* `lift`: the picture drawn that much higher, with what stands on it (the designer, 2026-11-28: "move everything up a bit
     like the background and all stuff in the hot spring"), so its rocks, the lantern and the shishi-odoshi come up
     beside the judge's body instead of at its feet; the pool in front covers what that opens at the bottom */
  const lift = opts.lift || 0;
  const onPicture = (V, q, time, on) => { const m = parts(V, q, time, on, opts).filter(p => p.picture).map(p => p.svg).join(""); return m && lift ? `<g transform="translate(0 ${-lift})">${m}</g>` : m; };
  return makePlace({
    name: "湯之里", grounds: { morning: "#e3c98a", golden: "#dc8d5b", night: "#39404d" }, crop: "0 60 330 330", stampCrop: "0 60 300 355", bandY: 474,
    tones: { a: "#cfc7b6", b: "#aca391", l: "#7fa06a" }, floor: ["#5d8ba3", "#eef1e6"], ownColours: true,
    judge: { item: opts.item },
    /* (the tall picture is drawn into the print from its top at the same scale, so what stands on it in its units
       stands there in the print too) */
    view(V, q, time, on) {
      const back = opts.back && opts.back[time];
      return back ? picture(back, 0, -lift, 400, 711, "xMidYMin slice") + onPicture(V, q, time, on) : plainView(V, q, time);
    },
    things: (V, q, time, on) => parts(V, q, time, on, opts).filter(p => !p.front && !p.picture).map(p => p.svg).join(""),
    /* (the board lays these itself: frontThings false) */
    frontThings: opts.frontThings === false ? null : (V, q, time, on) => parts(V, q, time, on, opts).filter(p => p.front).map(p => p.svg).join(""),
    tall: opts.back ? (V, q, time, on) => ({ box: `0 0 ${TALL[0]} ${TALL[1]}`, inner: opts.back[time] ? `<rect width="${TALL[0]}" height="${TALL[1]}" fill="${poolOf(time).dk}"/>` + picture(opts.back[time], 0, -lift, TALL[0], TALL[1], "xMidYMid slice") + onPicture(V, q, time, on) : "" }) : null,
    /* the stones of the rim the judge sits on, its feet in the water */
    seat: (c, q) => `<g fill="${c.a}" stroke="${INK}" stroke-width="1.6">${[[14, 452, 30, 20], [384, 456, 30, 18], [62, 462, 34, 16], [338, 464, 34, 15]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join("")}</g>`,
    /* the pool in front: water, ripples, two yuzu that dunk when pressed, wisps of steam */
    band: (c, y0, q, time, on) => {
      const { water, dk } = poolOf(time), wave = time === "night" ? "#9db7cf" : "#eef1e6";
      const w = `M0 ${y0 - 1}q25 -8 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0`;
      const yuzu = (x, y, r) => `<g transform="translate(${x} ${y})"${live(on) ? ` data-tap="dunk"` : ""}><g${on("lc-dunk")}><g${on("lc-bob", `animation-delay:${-(x % 7) / 2}s`)}><circle r="${r}" fill="${YUZU}" stroke="${INK}" stroke-width="1.4"/><path d="M1 ${-r}q${r * .8} ${-r * .8} ${r * 1.5} ${-r * .2}q${-r * .8} ${r * .6} ${-r * 1.5} ${r * .2}z" fill="#5d8a63" stroke="${INK}" stroke-width="1.1"/></g></g></g>`;
      const steam = (x, y, s) => `<g${on("lc-steam")} transform="translate(${x} ${y}) scale(${s})"><path d="M0 0c-10 -10 8 -17 0 -27c-8 -9 7 -15 1 -24M12 -3c-7 -8 6 -13 0 -21" fill="none" stroke="#eef1e6" stroke-width="${(3.4 / s).toFixed(2)}" stroke-linecap="round" opacity="${time === "night" ? .4 : .85}"/></g>`;
      return `<path d="${w}V500H0Z" fill="${water}"/><rect y="488" width="400" height="12" fill="${dk}"/><path d="${w}" fill="none" stroke="${INK}" stroke-width="1.6"/>`
        + `<g${on("lc-float", "--lc-x:10px;--lc-y:0px;animation-duration:5s")}><path d="M8 484q12.5 -6 25 0t25 0t25 0M150 488q12.5 -6 25 0t25 0t25 0M270 483q12.5 -6 25 0t25 0t25 0t25 0" fill="none" stroke="${wave}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/></g>`
        + yuzu(96, 487, 8) + yuzu(306, 490, 7) + steam(60, 470, .8) + steam(352, 466, .8);
    },
    /* on Home the pool stays in front of the judge over the tall picture, and its deep colour goes on to the bottom */
    frontOnTall: true, water: true, down: time => ({ fill: poolOf(time).dk }),
    /* what the effects layer moves on Home: steam rising from the pool beside the judge (the print's units), leaves
       coming down the strips beside its head (the tall picture's; `leafColours`, or none), drops off the
       shishi-odoshi's stone when it is pressed, and snow coming down from the sky (`snow`, down to the pool's
       edge in the print's units, behind the judge) */
    motion: opts.back ? time => {
      const A = arrangementOf(opts.layout, time);
      return {
        tall: TALL,
        steam: { sources: [[44, 466], [112, 474], [288, 474], [356, 466]], pale: time === "night" ? "#c3d1df" : time === "golden" ? "#fbefdc" : "#f8f7f2" },
        leaves: opts.leafColours === null ? null : { strips: [[18, 100], [300, 384]], from: 90, to: 560, greens: (opts.leafColours || ["#2f5a45", "#4b7d5c", "#79a574", "#b1cb98"]).map(c => tint(c, time)) },
        snow: opts.snow ? { to: 470, night: time === "night" } : null,
        shishi: A.shishi && (opts.pics || {}).shishi !== false ? { at: ((tall, [x, y]) => [x, y - (tall ? lift : 0)])((A.onPicture || []).includes("shishi"), shishiSplash(A.shishi, (opts.pics || {}).shishi, time)), tall: (A.onPicture || []).includes("shishi") } : null,
      };
    } : null,
  });
}
/* the things one by one, with their boxes, for the board and the tests; `animate`: moving and pressable, as Home has them */
const onOf = animate => (animate ? (name, style = "") => ` class="${name}"${style ? ` style="${style}"` : ""}` : () => "");
export const hotspringParts = (time = "morning", o = {}, animate = false) => parts(VIEW[time], pen(VIEW[time].line), time, onOf(animate), { layout: "day", pics: {}, ...o });

/* ---------- the hot spring the game draws: the designer's picks on the board (2026-11-28) ----------
   丙 雪山溫泉 by GPT for each time of day; layout 丙, turning with the day, on the picture's own rocks (`snow`);
   GPT's stone lantern, shishi-odoshi and snow monkey; no bucket; the steam; an onsen egg on the judge's head; no
   falling leaves in the snow. Since later that day no shishi-odoshi here (kept for a place to come, see `snow` in
   ARRANGE above), and snow falling, a little (the designer, the same day: "can you add snow particles in the spring location falling from the sky. Not too much of them").
   The shishi-odoshi's numbers below stay for that place. The shishi-odoshi's numbers are measured on GPT's 512 px pictures and scaled to the
   320 px ones in the game: the stand's drawing, its peg, the tube's hole, where the pipe's water falls (its pipe comes
   in from the left over the posts and pours on their right) */
const ON = PICTURES.onsen, k320 = 320 / 512, at320 = a => a.map(v => v * k320);
export const PICKED = {
  layout: "snow", item: "egg", leafColours: null, lift: 60, snow: true,
  back: { morning: ON.back, golden: ON["back-golden"], night: ON["back-night"] },
  pics: {
    lantern: ON.lantern, monkey: ON.monkey, bucket: false,
    shishi: { stand: ON["shishi-stand"], tube: ON["shishi-tube"], content: at320([15, 15, 496, 473]), peg: at320([234, 178]), hole: at320([254.5, 66]), size: .75, from: "left", spout: "right", water: at320([403, 116, 400, 19]), stream: "#a8b8c5" },
  },
};
export const hotspring = hotspringPlace(PICKED);
