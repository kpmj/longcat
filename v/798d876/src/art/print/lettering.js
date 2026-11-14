/* Title lettering for the woodblock prints, drawn from outlined glyphs (./glyphs.js), never from a font. */
import { f } from "../util.js";
import { GLYPHS } from "./glyphs.js";

/* one character centred on cx, its em box starting at top, size px high */
export function glyph(ch, cx, top, size, fill) {
  const G = GLYPHS[ch];
  if (!G) return "";
  const s = size / 1000;
  return `<path d="${G.d}" transform="translate(${f(cx - G.w * s / 2)} ${f(top + size * .88)}) scale(${s})" fill="${fill}"/>`;
}
/* a column of characters, top to bottom; step = distance between em tops */
export const column = (text, cx, top, size, step, fill) => [...String(text || "")].map((ch, i) => glyph(ch, cx, top + i * step, size, fill)).join("");
