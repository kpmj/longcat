/* The drill editor (dev tools, the designer 2026-11-14): move the twelve steps of a time of day, put another drill in a
   step, or change a drill's notes and speed, and hear it before saving. Everything is kept in this browser's save
   (S.dev.drillEdits) and laid over the built-in tables by content.js applyDrillEdits. "Copy the changes" gives
   text to paste into the chat, so a change that plays well can be made the built-in one. */
import { app, show, sheet, closeSheet, esc, $, $$, toast } from "./app.js";
import { TIMES, TIME_IDS, STEPS, DRILL, LADDERS, timeById, sylFor, builtInDrills, applyDrillEdits, cleanClimb, cleanDrillEdits, drillEditCount, DRILL_LIMITS } from "../content.js";
import { planTake, FLAVOURS, CLIMB_DEFAULT } from "../drill/drills.js";
import { audioContext, now, demoNote, prepareDemo } from "../audio/synth.js";
import { noteName } from "../audio/pitch.js";

const BUILT = builtInDrills();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const core = (d) => (d ? { name: d.name, rel: d.rel, dur: d.dur, climb: cleanClimb(d.climb) } : null);
const secs = (x) => `${(Math.round(x * 10) / 10).toFixed(1)} s`;

/* ---------- the edits ---------- */
const edits = () => cleanDrillEdits(app.S.dev.drillEdits);
/* Keep only what differs from the built-in tables, apply it and save. */
function commit(e) {
  for (const t of TIME_IDS) if (e.ladders[t] && same(e.ladders[t], BUILT.ladders[t])) delete e.ladders[t];
  for (const id of Object.keys(e.drills)) if (BUILT.drills[id] && same(core(e.drills[id]), core(BUILT.drills[id]))) delete e.drills[id];
  const applied = applyDrillEdits(e);
  app.S.dev.drillEdits = drillEditCount(applied) ? applied : null;
  app.save();
}
/* what a step looks like next to the built-in ladder */
function tagOf(time, i) {
  const id = LADDERS[time][i];
  if (!BUILT.drills[id]) return "new";
  if (!same(core(DRILL[id]), core(BUILT.drills[id]))) return "edited";
  return BUILT.ladders[time][i] !== id ? "moved" : "";
}

/* ---------- measuring and hearing ---------- */
const planOf = (drill, time) => planTake({ step: 1, time, zone: "scarf", range: app.S.settings.range, nudge: app.S.settings.nudge, seed: `editor.${time}.scarf`, drill: { id: "draft", ...drill } });
const relOf = (drill) => drill.rel;

let sounding = [], soundT = 0, soundBtn = null;
function hush() {
  sounding.forEach((n) => n.stop());
  sounding = [];
  clearTimeout(soundT);
  if (soundBtn) soundBtn.textContent = "▶ Hear it";
  soundBtn = null;
}
/* every round, as a singer with this phone's range would get it; press again to stop */
async function hear(drill, time, btn) {
  const was = soundBtn === btn;
  hush();
  if (was || !audioContext()) return;
  const plan = planOf(drill, time), syl = sylFor("scarf", time);
  soundBtn = btn;
  btn.textContent = "■ Stop";
  /* the recorded voice is fetched note by note: wait for the whole phrase, so a preview is one voice, not two */
  const kind = await prepareDemo(app.S.dev.demoVoice, syl, plan.notes.map((n) => n.midi));
  if (soundBtn !== btn) return; // stopped, or another preview started, while the notes were loading
  const t0 = now() + 0.1;
  sounding = plan.notes.map((n) => demoNote(kind, t0 + n.s, n.midi, n.e - n.s, syl));
  soundT = setTimeout(hush, (plan.total + 0.4) * 1000);
}
const climbText = (c) => `climbs by ${c.by}, ${c.most} up at most${c.back ? "" : ", no way back"}`;

/* a small picture of the shape: one bar per note, higher = higher */
function shapeSvg(drill, time) {
  const rel = relOf(drill, time), lo = Math.min(...rel), span = Math.max(...rel) - lo || 1;
  const W = 60, H = 26, w = W / rel.length;
  const bars = rel.map((r, k) => {
    const y = rel.length === 1 || Math.max(...rel) === lo ? H / 2 - 2 : 2 + (1 - (r - lo) / span) * (H - 8);
    return `<rect x="${(k * w + 0.8).toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1.5, w - 1.6).toFixed(1)}" height="4" rx="2"/>`;
  }).join("");
  return `<svg class="de-shape" viewBox="0 0 ${W} ${H}" aria-hidden="true">${bars}</svg>`;
}
const notesText = (d) => d.rel.join(" ");
const roundsText = (p) => (p.reps.length > 1 ? ` · ${p.reps.length} rounds` : "");

/* ---------- the page ---------- */
function render(root, props = {}) {
  const S = app.S;
  const time = TIME_IDS.includes(props.time) ? props.time : "morning";
  const T = timeById(time), ladder = LADDERS[time].map((id) => DRILL[id]);
  const plans = ladder.map((d) => planOf(d, time));
  const e = edits(), n = drillEditCount(e);
  root.innerHTML = `
    <header class="topbar"><div class="where"><button class="icon-btn" data-a="back" aria-label="Back to Settings">‹</button><span class="place">Drill editor</span></div></header>
    <section class="dedit">
      <div class="segs three" role="tablist">${TIMES.map((t) => `<button role="tab" aria-selected="${t.id === time}" class="${t.id === time ? "on" : ""}" data-time="${t.id}">${esc(t.name)}${e.ladders[t.id] ? " •" : ""}</button>`).join("")}</div>
      <p class="muted small"><b>${esc(T.flavour)}</b>: ${esc(T.how)}. ▲ ▼ move a step; tap a step to change it. All twelve: ${secs(plans.reduce((a, p) => a + p.total, 0))} of notes.</p>
      <ol class="de-list">${ladder.map((d, i) => {
        const tag = tagOf(time, i);
        return `<li class="de-row${tag ? " changed" : ""}">
          <button class="de-main" data-step="${i}"><b class="de-n">${i + 1}</b>${shapeSvg(d, time)}<span class="de-txt"><b>${esc(d.name)}</b><small>${esc(notesText(d))}${d.climb ? " ↑" : ""}${roundsText(plans[i])} · ${secs(plans[i].total)}${tag ? ` · <i>${tag}</i>` : ""}</small></span></button>
          <span class="de-move"><button data-up="${i}" aria-label="Move step ${i + 1} up" ${i ? "" : "disabled"}>▲</button><button data-down="${i}" aria-label="Move step ${i + 1} down" ${i < STEPS - 1 ? "" : "disabled"}>▼</button></span></li>`;
      }).join("")}</ol>
      <div class="grid2">
        <button class="btn small" data-a="copy" ${n ? "" : "disabled"}>Copy the changes</button>
        <button class="btn small" data-a="paste">Paste changes</button>
        <button class="btn small" data-a="order" ${e.ladders[time] ? "" : "disabled"}>Built-in order for ${esc(T.name)}</button>
        <button class="btn small danger-line" data-a="undo" ${n ? "" : "disabled"}>Undo every change</button>
      </div>
      <p class="muted small">${n ? `${n} change${n === 1 ? "" : "s"} on this phone.` : "Nothing changed: these are the built-in drills."} Changes stay in this browser, and Start over keeps them. Progress counts steps, so a step already sung stays sung when its drill changes.</p>
    </section>`;
  const again = (p = { time }) => { const top = root.scrollTop; render(root, p); root.scrollTop = top; };
  $("[data-a=back]", root).onclick = () => show("settings");
  $$("[data-time]", root).forEach((b) => (b.onclick = () => again({ time: b.dataset.time })));
  const move = (i, j) => {
    const ed = edits(), l = [...LADDERS[time]];
    [l[i], l[j]] = [l[j], l[i]];
    ed.ladders[time] = l;
    commit(ed);
    again();
  };
  $$("[data-up]", root).forEach((b) => (b.onclick = () => move(+b.dataset.up, +b.dataset.up - 1)));
  $$("[data-down]", root).forEach((b) => (b.onclick = () => move(+b.dataset.down, +b.dataset.down + 1)));
  $$("[data-step]", root).forEach((b) => (b.onclick = () => openStep(time, +b.dataset.step, again)));
  $("[data-a=order]", root).onclick = () => { const ed = edits(); delete ed.ladders[time]; commit(ed); again(); toast(`${T.name} is in the built-in order.`); };
  $("[data-a=undo]", root).onclick = () => confirmUndo(again);
  $("[data-a=copy]", root).onclick = () => copyChanges();
  $("[data-a=paste]", root).onclick = () => pasteChanges(again);
}

/* ---------- one step ---------- */
function openStep(time, i, again) {
  const T = timeById(time), id = LADDERS[time][i], d = DRILL[id], fl = FLAVOURS[time] || FLAVOURS.golden;
  const builtIn = !!BUILT.drills[id], changed = builtIn && !same(core(d), core(BUILT.drills[id]));
  const cl = { ...CLIMB_DEFAULT, ...(d.climb || {}) };
  const used = TIME_IDS.flatMap((t) => LADDERS[t].map((x, k) => (x === id && !(t === time && k === i) ? `${timeById(t).name} step ${k + 1}` : null)).filter(Boolean));
  const all = Object.values(DRILL).sort((a, b) => a.name.localeCompare(b.name));
  const el = sheet(`
    <h3>Step ${i + 1} · ${esc(T.name)}</h3>
    <label class="de-f"><span>Drill in this step</span><select data-f="pick">${all.map((x) => `<option value="${x.id}" ${x.id === id ? "selected" : ""}>${esc(x.name)}${BUILT.drills[x.id] ? "" : " ★"} (${esc(x.rel.join(" "))})</option>`).join("")}</select></label>
    <h4>The drill itself${builtIn ? "" : " · your own"}</h4>
    <label class="de-f"><span>Name</span><input data-f="name" maxlength="40" value="${esc(d.name)}" autocomplete="off"></label>
    <label class="de-f"><span>Notes</span><input data-f="rel" value="${esc(d.rel.join(" "))}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
         <p class="muted small">Semitones from the first note, with spaces. 0 2 4 is do–re–mi; 0 -2 0 dips below. Up to ${DRILL_LIMITS.notes} notes.</p>
    <label class="de-f"><span>Seconds per note (at golden hour)</span><input data-f="dur" type="number" inputmode="decimal" step="0.05" min="${DRILL_LIMITS.durMin}" max="${DRILL_LIMITS.durMax}" value="${d.dur}"></label>
    <h4>Rounds</h4>
    <label class="toggle"><input type="checkbox" data-f="climb" ${d.climb ? "checked" : ""}><span>Climb: sing it again higher each round, up to the top of the singer’s range</span></label>
    <div class="de-climb" ${d.climb ? "" : "hidden"}>
      <div class="grid2"><label class="de-f"><span>Higher each round by</span><select data-f="by">${[[1, "a semitone"], [2, "a whole tone"], [3, "3 semitones"], [4, "4 semitones"]].map(([v, t]) => `<option value="${v}" ${v === cl.by ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <label class="de-f"><span>Rounds up, at most</span><input data-f="most" type="number" inputmode="numeric" min="1" max="${DRILL_LIMITS.climbMost}" value="${cl.most}"></label></div>
      <label class="toggle"><input type="checkbox" data-f="back" ${cl.back ? "checked" : ""}><span>Then come back down the same way</span></label>
      <p class="muted small">How far it climbs depends on the singer: a small range may leave no room, and then it is sung once. With fewer rounds than there is room for, it starts higher so the last one still reaches the top. The cat gives each new first note in the rest between rounds.</p>
    </div>
    <p class="de-info small" id="de-info" role="status"></p>
    ${used.length ? `<p class="muted small">Also in ${esc(used.join(", "))}. Save changes it there too; “Save as a new drill” changes only this step.</p>` : ""}
    <div class="row"><button class="btn" data-a="hear">▶ Hear it</button><button class="btn primary" data-a="save">Save</button></div>
    <div class="row"><button class="btn small" data-a="new">Save as a new drill</button>${changed ? `<button class="btn small" data-a="orig">Built-in version</button>` : ""}</div>`, { tall: true, onClose: hush });
  const f = (k) => $(`[data-f=${k}]`, el);
  /* what the fields say now: { drill } or { error } */
  const draft = () => {
    const L = DRILL_LIMITS, dur = Number(f("dur").value), name = f("name").value.trim();
    if (!name) return { error: "Give it a name." };
    if (!(dur >= L.durMin && dur <= L.durMax)) return { error: `Seconds per note: between ${L.durMin} and ${L.durMax}.` };
    const parts = f("rel").value.trim().split(/[\s,]+/).filter(Boolean);
    if (!parts.length || parts.some((p) => !/^[-−]?\d+$/.test(p))) return { error: "Notes: whole numbers with spaces, like 0 2 4." };
    const rel = parts.map((p) => Number(p.replace("−", "-")));
    if (rel.length > L.notes) return { error: `Up to ${L.notes} notes.` };
    if (rel.some((r) => r < L.low || r > L.high)) return { error: `Each note between ${L.low} and ${L.high}.` };
    if (Math.max(...rel) - Math.min(...rel) > L.span) return { error: `Lowest to highest is more than ${L.span} semitones.` };
    if (!f("climb").checked) return { drill: { name, rel, dur } };
    const climb = cleanClimb({ by: f("by").value, most: f("most").value, back: f("back").checked });
    return climb ? { drill: { name, rel, dur, climb } } : { error: `Rounds up: 1 to ${L.climbMost}.` };
  };
  const info = () => {
    const r = draft(), box = $("#de-info", el);
    box.classList.toggle("bad", !!r.error);
    if (r.error) return void (box.textContent = r.error);
    const p = planOf(r.drill, time), rel = relOf(r.drill, time), span = Math.max(...rel) - Math.min(...rel);
    const up = Math.max(...p.reps.map((x) => x.shift)) / (r.drill.climb?.by || 1);
    const rounds = !r.drill.climb ? "" : p.reps.length > 1 ? ` · on this phone’s range: ${p.reps.length} rounds (${up} up${r.drill.climb.back ? `, ${up} back` : ""}), top note ${noteName(Math.max(...p.notes.map((n) => n.midi)))}` : " · on this phone’s range there is no room to climb: sung once";
    box.textContent = `${T.name}: ${secs(r.drill.dur / fl.speed)} a note, ${secs(p.demoTotal)}${p.reps.length > 1 ? ` a round, ${secs(p.total)} in all` : " in all"} · ${rel.length} note${rel.length === 1 ? "" : "s"}, ${span} semitone${span === 1 ? "" : "s"} wide${span > 12 ? " (wider than an octave: may not fit a small range)" : ""}${rounds}`;
  };
  $$("input, select:not([data-f=pick])", el).forEach((x) => (x.oninput = info));
  if (f("climb")) f("climb").onchange = () => { $(".de-climb", el).hidden = !f("climb").checked; info(); };
  info();
  const ok = () => { const r = draft(); if (r.error) { toast(r.error); return null; } return r.drill; };
  const reopen = () => { again(); openStep(time, i, again); };
  f("pick").onchange = (ev) => {
    const ed = edits(), l = [...LADDERS[time]];
    l[i] = ev.target.value;
    ed.ladders[time] = l;
    commit(ed);
    reopen();
  };
  $("[data-a=hear]", el).onclick = (ev) => { const dr = ok(); if (dr) hear(dr, time, ev.currentTarget); };
  $("[data-a=save]", el).onclick = () => {
    const dr = ok();
    if (!dr) return;
    const ed = edits();
    ed.drills[id] = dr;
    commit(ed);
    closeSheet();
    again();
    toast(`Saved “${dr.name}”.`);
  };
  $("[data-a=new]", el).onclick = () => {
    const dr = ok();
    if (!dr) return;
    const ed = edits(), l = [...LADDERS[time]];
    let k = 1;
    while (DRILL[`my${k}`]) k++;
    if (dr.name === d.name) dr.name = `${dr.name} ${k + 1}`.slice(0, 40);
    ed.drills[`my${k}`] = dr;
    l[i] = `my${k}`;
    ed.ladders[time] = l;
    commit(ed);
    closeSheet();
    again();
    toast(`New drill “${dr.name}” in step ${i + 1}.`);
  };
  const orig = $("[data-a=orig]", el);
  if (orig) orig.onclick = () => { const ed = edits(); delete ed.drills[id]; commit(ed); reopen(); toast("Back to the built-in version."); };
}

/* ---------- all the changes at once ---------- */
function confirmUndo(again) {
  const el = sheet(`<h3>Undo every change?</h3><p class="muted">All three times of day go back to the built-in drills, and drills you made are removed. Progress is not touched.</p>
    <div class="row"><button class="btn danger" data-a="yes">Undo every change</button><button class="btn" data-a="no">Keep them</button></div>`);
  $("[data-a=yes]", el).onclick = () => { commit({ ladders: {}, drills: {} }); closeSheet(); again(); toast("Back to the built-in drills."); };
  $("[data-a=no]", el).onclick = () => closeSheet();
}

function changesText() {
  const e = edits();
  const lines = ["Longcat drill changes"];
  for (const t of TIME_IDS) if (e.ladders[t]) lines.push(`${timeById(t).name}: ${e.ladders[t].map((id, k) => `${k + 1} ${DRILL[id].name}`).join(", ")}`);
  for (const [id, d] of Object.entries(e.drills)) lines.push(`${BUILT.drills[id] ? "Edited" : "New"} drill ${id}: ${d.name} · ${notesText(d)} · ${d.dur} s a note${d.climb ? ` · ${climbText(d.climb)}` : " · no climb"}`);
  lines.push(JSON.stringify(e));
  return lines.join("\n");
}
async function copyChanges() {
  const text = changesText();
  try { await navigator.clipboard.writeText(text); toast("Copied. Paste it into the chat."); }
  catch {
    const el = sheet(`<h3>Copy the changes</h3><p class="muted small">Select all of it and copy.</p><textarea class="pitchlog" readonly></textarea><button class="btn" data-a="done">Done</button>`);
    const ta = $("textarea", el);
    ta.value = text; ta.focus(); ta.select();
    $("[data-a=done]", el).onclick = () => closeSheet();
  }
}
function pasteChanges(again) {
  const el = sheet(`<h3>Paste changes</h3><p class="muted small">Paste text made by “Copy the changes”. It replaces the changes on this phone.</p>
    <textarea class="pitchlog" placeholder="Longcat drill changes …"></textarea>
    <div class="row"><button class="btn primary" data-a="apply">Use these</button><button class="btn" data-a="no">Cancel</button></div>`);
  $("[data-a=no]", el).onclick = () => closeSheet();
  $("[data-a=apply]", el).onclick = () => {
    const text = $("textarea", el).value, a = text.indexOf("{"), b = text.lastIndexOf("}");
    let e = null;
    try { e = cleanDrillEdits(JSON.parse(text.slice(a, b + 1))); } catch {}
    const n = drillEditCount(e);
    if (!n) return toast("No drill changes found in that text.");
    commit(e);
    closeSheet();
    again();
    toast(`${n} change${n === 1 ? "" : "s"} in use.`);
  };
}

app.screens.drills = { render, fullscreen: true, leave: hush };
