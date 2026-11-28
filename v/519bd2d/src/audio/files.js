/* Sound files made by the audio engine (rendered from sampled instruments, not made in the page): fetch, decode,
   keep. What each file is and what was measured on it is in files/manifest.js, which the engine's export step
   writes; nothing here is edited by hand. The files are the game's own, fetched from beside this module like the
   recorded voice: no request leaves for anywhere else.

   No imports from the rest of the game, so synth.js and ambient.js can both use it without a circle. */
import { FILES } from "./files/manifest.js";

const cache = new Map(); // id -> { buf, lead, info } once loaded, or { promise } while loading

export const fileInfo = (id) => FILES[id] || null;
/* the loaded file, or null if it is not here yet */
export const fileReady = (id) => { const e = cache.get(id); return e && e.buf ? e : null; };

/* A long tune also has its first half-minute in a file of its own (its `head`, written by the export step from
   the whole file's own frames): `{ head: true }` loads that one, which a phone decodes in a moment. */
export function loadFile(ctx, id, { head = false } = {}) {
  const whole = FILES[id], info = head ? whole && whole.head && { ...whole, ...whole.head } : whole;
  if (!ctx || !info) return Promise.reject(new Error(`no sound file "${id}"${head ? " (its head)" : ""}`));
  const key = head ? `${id}#head` : id;
  const e = cache.get(key);
  if (e) return e.buf ? Promise.resolve(e) : e.promise;
  const promise = fetch(new URL(`./files/${info.path}`, import.meta.url))
    .then((r) => { if (!r.ok) throw new Error(`sound file ${id}: ${r.status}`); return r.arrayBuffer(); })
    .then((a) => new Promise((ok, no) => { const p = ctx.decodeAudioData(a, ok, no); if (p && p.catch) p.catch(no); }))
    .then((buf) => {
      /* compressed audio can begin with some silent milliseconds, different in each browser. A sound is started
         from where it really begins, found here as recorded.js does. A loop does not need it: its file carries the
         loop's own end before the loop and its own start after it, so wherever the loop's two points fall, the
         sound is the same one loop apart (docs/audio/playbook.md, Part 5). */
      let lead = 0;
      if (info.kind !== "loop") {
        const d = buf.getChannelData(0);
        let i = 0;
        while (i < d.length && Math.abs(d[i]) < 0.004) i++;
        lead = Math.max(0, i / buf.sampleRate - 0.003);
      }
      const done = { buf, lead, info };
      cache.set(key, done);
      return done;
    })
    .catch((err) => { cache.delete(key); throw err; });
  cache.set(key, { promise });
  return promise;
}

/* Let a decoded file go. A long tune is tens of megabytes once decoded, and Home has one for each time of day:
   only the one that is playing is kept. (Fetched again from the browser's own cache if it is wanted later.) */
export function dropFile(id, { head = false } = {}) { const key = head ? `${id}#head` : id, e = cache.get(key); if (e && e.buf) cache.delete(key); }

/* Several files before they are needed. Resolves true when all are here, false if one is missing, fails, or they
   take longer than `ms`: the caller then plays what it played before, never half and half. */
export function loadFiles(ctx, ids, ms = 6000) {
  if (!ctx || !ids.every((id) => FILES[id])) return Promise.resolve(false);
  const all = Promise.all(ids.map((id) => loadFile(ctx, id))).then(() => true, () => false);
  return Promise.race([all, new Promise((r) => setTimeout(() => r(false), ms))]);
}
