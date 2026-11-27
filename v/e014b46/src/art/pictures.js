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
    back: of("jungle/back.jpg", 800, 1422),
    /* the same scenery painted again at golden hour and at night, from the morning picture (the designer's picks, GPT 甲) */
    "back-golden": of("jungle/back-golden.jpg", 800, 1422),
    "back-night": of("jungle/back-night.jpg", 800, 1422),
    sun: of("jungle/sun.png", 176, 175),
    "bird-1": of("jungle/bird-1.png", 240, 222),
    "bird-2": of("jungle/bird-2.png", 215, 240),
    "bird-3": of("jungle/bird-3.png", 240, 207),
    "monkey-sit": of("jungle/monkey-sit.png", 166, 288),
    "monkey-hang": of("jungle/monkey-hang.png", 155, 304),
  },
};

/* the picture in a box of the drawing: x y w h, and how it sits in the box (SVG's preserveAspectRatio) */
export const picture = (pic, x, y, w, h, fit = "xMidYMid meet") => `<image href="${pic.href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${fit}"/>`;
