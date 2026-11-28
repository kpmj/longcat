/* Pictures that are files, not drawings. Almost everything in this game is drawn by code; a few pieces are pictures
   that were made outside it and chosen for it (the jungle's scenery, its birds, monkeys and sun: generated with an
   image model and picked piece by piece on 2026-11-27). They live in ./img/ and are named here.

   A place draws one with `picture()`, as an <image> in the print's own units. The address is worked out from this
   module's own, so it holds wherever the game is served from. A picture loads only when something shows it.
   Two things follow from their being files:
   - a postcard drawn to a canvas cannot load them from inside its SVG, so ui/album.js puts them in as data first;
   - a still made outside the browser (a board, a test) carries only the address, and shows the picture only where
     that address can be read. */
const at = name => new URL(`./img/${name}`, import.meta.url).href;
const of = (name, w, h) => ({ href: at(name), w, h });

export const PICTURES = {
  jungle: {
    /* the scenery: since 2026-11-28 the waterfall (the designer's pick of three ideas, GPT 甲 瀑布, after 「背景沒有什麼特色」),
       painted again at golden hour and at night from the morning picture, each with something of its own (rays
       through the leaves; glowing mushrooms and stars). The first scenery, two trunks and hills, is in git history */
    back: of("jungle/back.jpg", 800, 1422),
    "back-golden": of("jungle/back-golden.jpg", 800, 1422),
    "back-night": of("jungle/back-night.jpg", 800, 1422),
    sun: of("jungle/sun.png", 176, 175),
    "bird-1": of("jungle/bird-1.png", 240, 222),
    /* the red bird's frames (2026-11-28, the designer's pick on the finer-animation page): eight poses GPT drew from bird-1
       in one sheet, lined up on its feet and side by side, each `cell` wide; `pad` is how far a cell reaches past
       bird-1's own box on each side (left top right bottom, in its px), so frame 1 sits exactly where bird-1 does */
    "bird-1-frames": { ...of("jungle/bird-1-frames.png", 1952, 242), frames: 8, cell: [244, 242], pad: [2, 18, 2, 2] },
    "bird-2": of("jungle/bird-2.png", 215, 240),
    "bird-3": of("jungle/bird-3.png", 240, 207),
    "monkey-sit": of("jungle/monkey-sit.png", 166, 288),
    "monkey-hang": of("jungle/monkey-hang.png", 155, 304),
  },
  /* the hot spring made again (the designer's picks on the board, 2026-11-28): GPT's snowy mountain spring (丙 雪山溫泉) for
     each time of day, its stone lantern, its snow monkey, and the shishi-odoshi as two pictures, the stand (its painted
     stream under the tube cut out; the stream is code) and the tube that turns on the peg */
  onsen: {
    back: of("onsen/back.jpg", 800, 1422),
    "back-golden": of("onsen/back-golden.jpg", 800, 1422),
    "back-night": of("onsen/back-night.jpg", 800, 1422),
    lantern: of("onsen/lantern.png", 214, 320),
    monkey: of("onsen/monkey.png", 320, 256),
    "shishi-stand": of("onsen/shishi-stand.png", 320, 306),
    "shishi-tube": of("onsen/shishi-tube.png", 320, 86),
  },
};

/* the picture in a box of the drawing: x y w h, and how it sits in the box (SVG's preserveAspectRatio) */
export const picture = (pic, x, y, w, h, fit = "xMidYMid meet") => `<image href="${pic.href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${fit}"/>`;
