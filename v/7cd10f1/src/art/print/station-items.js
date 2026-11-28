/* Three ideas for what the judge wears on its head at the train station (2026-11-28, the designer: "give me a few ideas about
   what stuff will be on judge's head"), drawn in code like the jungle's acorn: they sit where the yuzu sits, as
   tall, and hop when pressed (print/judge.js). the designer picks one on the station's board; the others go.
   - ticket: an old card ticket (切符), pale green with a red band, punched, tucked upright into the fur at a tilt;
     pressed, the punch's small paper dot jumps out.
   - ekiben: a station lunch box (駅弁), a wooden box tied with a red cord in a bow, chopsticks on its lid;
     pressed, its lid lifts and a little steam shows.
   - toyloco: a toy steam locomotive, red and black, facing right; pressed, a small puff comes from its chimney.
   h = the helpers of print/judge.js ({ sh, fl, ln, f, Y }): Y is where the yuzu sits in head space. Each function
   is (hop, lift) like the yuzu's: hop raises it (a still that shows it mid-hop), lift is how far the hat has
   raised it. Its own small moving part shows only while it moves (opacity 0 until ART_CSS, station-css.js, animates it),
   so a still (a postcard) has none of it. */
export function stationItems({ sh, fl, ln, f, Y }) {
  const at = (hop, lift) => `translate(24 ${f(Y - hop - lift)})`;
  const ticks = (hop, w) => (hop ? ln(`M${-w} -4q-4 8 -1 16M${w} -4q4 8 1 16`, .7) : "");
  function ticket(hop, lift = 0) {
    return `<g transform="${at(hop, lift)}"><g transform="rotate(-10)">${sh("M-15 -20H15V18H-15Z", "#cfe0c4", .9)}${fl("M-15 -8H15V2H-15Z", "#bf452d")}${ln("M-15 -8H15M-15 2H15", .45)}${ln("M-9 -15h12M-9 9h18M-9 13h10", .4)}<circle cx="9" cy="-14" r="3" fill="#7d6a4a"/><g class="lc-punch"><circle cx="9" cy="-14" r="2.6" fill="#cfe0c4" stroke="#262122" stroke-width="1.600"/></g></g>${ticks(hop, 24)}</g>`;
  }
  function ekiben(hop, lift = 0) {
    const steam = `<g class="lc-lid-steam" opacity="0">${ln("M-6 -24q-3 -4 0 -8t0 -8M4 -24q-3 -4 0 -8t0 -8", .5)}</g>`;
    return `<g transform="${at(hop, lift)}">${sh("M-19 -4H19V17Q19 19 17 19H-17Q-19 19 -19 17Z", "#c99a62", .9)}${ln("M-19 4H19", .4)}${fl("M-19 -4H19V-1H-19Z", "#a87a45")}${steam}<g class="lc-lid">${sh("M-21 -14H21V-4H-21Z", "#8a5f3c", .9)}${fl("M-3 -14H3V19H-3Z", "#bf452d", 1)}${ln("M-3 -14V-4M3 -14V-4", .35)}${sh("M-1 -14Q-11 -22 -12 -15Q-11 -9 -1 -12Z", "#bf452d", .55)}${sh("M1 -14Q11 -22 12 -15Q11 -9 1 -12Z", "#bf452d", .55)}${sh("M-3 -16H3V-10H-3Z", "#d9583f", .5)}${sh("M-20 -17L20 -21L20 -19L-20 -15Z", "#e8d3a6", .5)}</g>${fl("M-3 -1H3V19H-3Z", "#bf452d", 1)}${ticks(hop, 26)}</g>`;
  }
  function toyloco(hop, lift = 0) {
    const puff = `<g class="lc-toy-puff" opacity="0"><circle cx="14" cy="-34" r="5" fill="#f6efe0" stroke="#262122" stroke-width="2"/><circle cx="7" cy="-40" r="4" fill="#f6efe0" stroke="#262122" stroke-width="2"/></g>`;
    return `<g transform="${at(hop, lift)}">${puff}${sh("M-20 -14H-6V6H-20Z", "#bf452d", .9)}${sh("M-23 -18H-3V-13H-23Z", "#2f2c33", .8)}${fl("M-17 -10H-10V-4H-17Z", "#f3ead6")}${sh("M-7 -6Q-7 -10 -3 -10H16Q20 -10 20 -4V6H-7Z", "#2f2c33", .9)}${sh("M10 -10L11 -24H17L18 -10Z", "#2f2c33", .8)}${sh("M8 -26H20V-22H8Z", "#bf452d", .6)}${sh("M-22 5H23V9H-22Z", "#bf452d", .7)}${[-14, 0, 14].map(x => sh(`M${x - 6} 13a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z`, "#bf452d", .7)).join("")}${ln("M-14 13H14", .5)}${ticks(hop, 28)}</g>`;
  }
  return { ticket, ekiben, toyloco };
}
