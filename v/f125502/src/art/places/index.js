/* The twelve places, their three times of day, the New Year decoration and the UI colours beside each backdrop. */
import { rng, hash } from "../util.js";
import { onsen, livingroom, nightmarket, train } from "./a.js";
import { beach, library, camping, cinema } from "./b.js";
import { bus, museum, rooftop, skilift } from "./c.js";
import { tone, INK, SKY, celestial, woodOf } from "./common.js";

export const PLACE_IDS = ["onsen", "jungle", "station", "livingroom", "nightmarket", "train", "beach", "library", "camping", "cinema", "bus", "museum", "rooftop", "skilift"];
export const PLACE_NAME = { onsen: "Hot spring", jungle: "Jungle", station: "Train station", livingroom: "The judge's living room", nightmarket: "Night market", train: "Train carriage", beach: "Beach", library: "Library", camping: "Camping", cinema: "Cinema", bus: "Back of the bus", museum: "Art museum", rooftop: "Rainy rooftop", skilift: "Ski lift" };
export const placeId = p => (PLACE_IDS.includes(p) ? p : "onsen");

const generic = (time, R) => ({ back: `<rect width="400" height="500" fill="${tone("#e9e1d3", time)}"/>${celestial(time, R)}<rect y="440" width="400" height="60" fill="${tone("#d8ccb8", time)}"/>`, seat: "", front: "", wall: tone("#e9e1d3", time) });
const DRAW = { onsen, livingroom, nightmarket, train, beach, library, camping, cinema, bus, museum, rooftop, skilift };

export function placeLayers(place, time, seed = 0, animate = false) {
  const p = placeId(place), R = rng(hash(`${p}|${time}|${seed}`));
  const L = (DRAW[p] || generic)(time, R, animate);
  return { ...L, wood: woodOf(time), ink: INK[time] };
}

/* UI colours that sit beside each backdrop: bg = the backdrop's own dominant colour, ink = text on it,
   accent = a button colour of the place (lifted at night so it still reads on the dark) */
const ACCENT = { onsen: "#4f8a8b", jungle: "#4b7d5c", station: "#3f5f86", livingroom: "#b0644a", nightmarket: "#c24a3c", train: "#4f7390", beach: "#3a8aa3", library: "#6b7a3c", camping: "#b06a30", cinema: "#9c3b4a", bus: "#b8862a", museum: "#6f5fa6", rooftop: "#4e6f86", skilift: "#3d7bab" };
import { mix } from "./common.js";
export const PLACE_UI = Object.fromEntries(PLACE_IDS.map(p => [p, Object.fromEntries(["morning", "golden", "night"].map(t => {
  const L = placeLayers(p, t, 0, false);
  return [t, { bg: L.wall, ink: INK[t], accent: t === "night" ? mix(ACCENT[p], "#ffffff", .3) : ACCENT[p] }];
}))]));
