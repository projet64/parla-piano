/* Parla piano — logique de l'appli */

/* ---------- stockage local + synchro serveur ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
let progress = store.get("pp_progress", { said: {}, scenes: {} });
// reprise de l'ancien format éventuel
if (!progress.said) progress = { said: {}, scenes: {} };

const syncEl = document.getElementById("sync");
function setSync(state, label) { syncEl.className = "sync " + state; syncEl.textContent = "● " + label; }

function headers() {
  const h = { "Content-Type": "application/json" };
  const key = store.get("pp_key", "");
  if (key) h["x-app-key"] = key;
  return h;
}
function mergeInto(remote) {
  for (const [k, v] of Object.entries(remote.said || {})) progress.said[k] = Math.max(progress.said[k] || 0, v);
  for (const [k, v] of Object.entries(remote.scenes || {})) progress.scenes[k] = Math.max(progress.scenes[k] || 0, v);
  store.set("pp_progress", progress);
}
let syncTimer = null;
async function pushProgress() {
  try {
    const r = await fetch("/api/progress", { method: "POST", headers: headers(), body: JSON.stringify(progress) });
    if (!r.ok) throw new Error(r.status);
    mergeInto(await r.json());
    setSync("on", "synchro");
  } catch (e) { setSync("off", "hors ligne"); }
}
function saveProgress() {
  store.set("pp_progress", progress);
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushProgress, 800);
}
async function pullProgress() {
  try {
    const r = await fetch("/api/progress", { headers: headers() });
    if (!r.ok) throw new Error(r.status);
    mergeInto(await r.json());
    setSync("on", "synchro");
    render(); renderFoot();
    pushProgress();
  } catch (e) { setSync("off", "hors ligne"); }
}
window.addEventListener("online", pushProgress);

/* ---------- voix (synthèse) ---------- */
let itVoice = null;
function pickVoice() {
  if (!("speechSynthesis" in window)) return;
  const vs = speechSynthesis.getVoices();
  itVoice = vs.find(v => /^it[-_]IT/i.test(v.lang) && /alice|federica|luca|google/i.test(v.name))
         || vs.find(v => /^it/i.test(v.lang)) || null;
  document.getElementById("voicewarn").hidden = !!itVoice || vs.length === 0;
}
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, slow) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/…/g, ""));
  u.lang = "it-IT"; if (itVoice) u.voice = itVoice;
  u.rate = slow ? 0.62 : 0.92;
  speechSynthesis.speak(u);
}

/* ---------- micro (reconnaissance vocale, si dispo) ---------- */
const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9' ]/g, " ").replace(/'/g, " ").split(/\s+/).filter(Boolean);
}
// part des mots attendus retrouvés dans ce qui a été entendu
function score(expected, heard) {
  const e = norm(expected), h = norm(heard);
  if (!e.length) return 0;
  const pool = [...h]; let hit = 0;
  for (const w of e) { const i = pool.indexOf(w); if (i >= 0) { hit++; pool.splice(i, 1); } }
  return hit / e.length;
}
function listen(onResult, onEnd) {
  const r = new Recog();
  r.lang = "it-IT"; r.interimResults = false; r.maxAlternatives = 3;
  r.onresult = ev => {
    const alts = [...ev.results[0]].map(a => a.transcript);
    onResult(alts);
  };
  r.onerror = ev => onResult(null, ev.error);
  r.onend = onEnd;
  try { r.start(); } catch (e) { onResult(null, "start"); onEnd(); }
  return r;
}

/* ---------- pillola ---------- */
const dayIdx = Math.floor(Date.now() / 86400000) % PILLOLE.length;
let pIdx = dayIdx;
function showPill() {
  const p = PILLOLE[pIdx];
  document.getElementById("p-it").textContent = p.it;
  document.getElementById("p-ph").textContent = "« " + p.ph + " »";
  document.getElementById("p-fr").textContent = p.fr;
  document.getElementById("p-rule").innerHTML = p.rule;
}
document.getElementById("p-play").onclick = () => speak(PILLOLE[pIdx].it, false);
document.getElementById("p-slow").onclick = () => speak(PILLOLE[pIdx].it, true);
document.getElementById("p-next").onclick = () => { pIdx = (pIdx + 1) % PILLOLE.length; showPill(); };
showPill();

/* ---------- onglets ---------- */
let sceneKey = store.get("pp_scene", "ristorante");
if (!SCENES[sceneKey]) sceneKey = Object.keys(SCENES)[0];
function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";
  for (const [k, s] of Object.entries(SCENES)) {
    const b = el("button", "scene-tab", esc(s.label));
    b.setAttribute("aria-current", k === sceneKey ? "true" : "false");
    b.onclick = () => { sceneKey = k; store.set("pp_scene", k); resetScene(); renderTabs(); };
    tabs.appendChild(b);
  }
  for (const label of SOON) {
    const b = el("button", "scene-tab", `${esc(label)} <small>bientôt</small>`);
    b.disabled = true; tabs.appendChild(b);
  }
}

/* ---------- scène ---------- */
const thread = document.getElementById("thread");
const sceneEl = document.getElementById("scene");
const hidefr = document.getElementById("hidefr");
hidefr.checked = store.get("pp_hidefr", false);
sceneEl.classList.toggle("hide-fr", hidefr.checked);
hidefr.onchange = () => { sceneEl.classList.toggle("hide-fr", hidefr.checked); store.set("pp_hidefr", hidefr.checked); };

let step = 0, history = [], pending = null, heard = null, recog = null;

function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function scene() { return SCENES[sceneKey]; }
function resetScene() { step = 0; history = []; pending = null; heard = null; render(); }

function bubble(who, l) {
  const box = el("div", "line " + (who === "w" ? "waiter" : "me"));
  box.appendChild(el("div", "who", who === "w" ? esc(scene().who) : "Toi"));
  const b = el("div", "bubble");
  b.appendChild(el("div", "it", esc(l.it)));
  b.appendChild(el("div", "ph", esc(l.ph)));
  b.appendChild(el("div", "fr", esc(l.fr)));
  const acts = el("div", "acts");
  const a1 = el("button", "ear", "▶ Écouter"); a1.onclick = () => speak(l.it, false);
  const a2 = el("button", "ear", "Lentement"); a2.onclick = () => speak(l.it, true);
  acts.append(a1, a2); b.appendChild(acts);
  box.appendChild(b);
  if (who === "me" && progress.said[l.it]) box.appendChild(el("div", "stamp", "DETTO"));
  return box;
}

function render() {
  const S = scene(), L = S.lines;
  document.getElementById("scene-place").textContent = S.place;
  document.getElementById("scene-title").textContent = S.title;
  thread.innerHTML = "";
  document.getElementById("bar").style.width = (step / L.length * 100) + "%";
  history.forEach(h => { thread.appendChild(bubble("w", L[h.s].w)); thread.appendChild(bubble("me", h.o)); });
  if (step >= L.length) return renderEnd();
  const cur = L[step];
  thread.appendChild(bubble("w", cur.w));
  if (cur.tip) thread.appendChild(el("div", "tip", cur.tip));
  if (pending) return renderRepeat(pending);
  const opts = el("div", "opts");
  opts.appendChild(el("div", "eyebrow", "Que réponds-tu ?"));
  opts.appendChild(directMic(cur));
  if (heard && heard.direct) {
    opts.appendChild(el("div", "heard ko", heard.err
      ? micErrorText(heard.err)
      : `J'ai entendu : <i>« ${esc(heard.text)} »</i>. Ça ne ressemble à aucune réponse : touche-en une pour l'écouter.`));
  }
  cur.opts.forEach(o => {
    const b = el("button", "opt");
    b.innerHTML = `<span class="it">${esc(o.it)}</span><span class="say" aria-hidden="true">▶</span><span class="ph">${esc(o.ph)}</span><span class="fr">${esc(o.fr)}</span>`;
    b.onclick = () => { pending = o; heard = null; speak(o.it, false); render(); scrollEnd(); };
    opts.appendChild(b);
  });
  thread.appendChild(opts);
}

function micErrorText(err) {
  if (err === "not-allowed" || err === "service-not-allowed")
    return "Le micro est refusé. Autorise-le pour ce site (Réglages › Safari › Micro, ou l'icône du cadenas dans la barre d'adresse).";
  return "Je n'ai rien entendu. Parle juste après le bip, assez près du téléphone.";
}
function micUnavailable() {
  return el("div", "heard ko", "Le micro n'est pas disponible ici. Sur iPhone et iPad, ouvre l'appli dans Safari (pas depuis l'icône de l'écran d'accueil) et active Siri / Dictée dans les Réglages.");
}
// Bouton principal : on répond à voix haute, l'appli devine quelle réponse c'était
function directMic(cur) {
  if (!Recog) return micUnavailable();
  const m = el("button", "btn mic big", recog ? "J'écoute… parle maintenant" : "🎤 Réponds directement à voix haute");
  if (recog) m.classList.add("listening");
  m.onclick = () => {
    if (recog) { recog.stop(); return; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    let found = null;
    recog = listen((alts, err) => {
      if (!alts) { heard = { direct: true, err: err || true }; return; }
      let best = { o: null, s: 0, text: alts[0] };
      for (const a of alts) for (const o of cur.opts) {
        const s = score(o.it, a); if (s > best.s) best = { o, s, text: a };
      }
      if (best.o && best.s >= 0.6) { found = best.o; heard = { text: best.text, ok: true }; }
      else heard = { direct: true, text: best.text };
    }, () => {
      recog = null;
      if (found) { pending = found; render(); scrollEnd(); setTimeout(() => validate(found), 1100); }
      else render();
    });
    render();
  };
  return m;
}

function validate(o) {
  progress.said[o.it] = (progress.said[o.it] || 0) + 1;
  saveProgress();
  history.push({ s: step, o }); step++; pending = null; heard = null;
  if (step >= scene().lines.length) {
    progress.scenes[sceneKey] = (progress.scenes[sceneKey] || 0) + 1;
    saveProgress();
  }
  render();
  const L = scene().lines;
  setTimeout(() => { if (step < L.length) speak(L[step].w.it, false); }, 350);
  scrollEnd();
}

function renderRepeat(o) {
  const r = el("div", "repeat");
  r.appendChild(el("div", "eyebrow", "À toi, à voix haute"));
  r.appendChild(el("div", "it", esc(o.it)));
  r.appendChild(el("div", "note", esc(o.ph)));
  if (heard) {
    const cls = heard.ok ? "heard ok" : "heard ko";
    const msg = heard.err
      ? micErrorText(heard.err)
      : heard.ok
        ? `Bravo, compris ! J'ai entendu : <i>« ${esc(heard.text)} »</i>`
        : `Presque. J'ai entendu : <i>« ${esc(heard.text)} »</i>. Réécoute lentement et retente.`;
    r.appendChild(el("div", cls, msg));
  }
  const row = el("div", "row");
  const l1 = el("button", "btn ghost", "▶ Réécouter"); l1.onclick = () => speak(o.it, false);
  const l2 = el("button", "btn ghost", "Lentement"); l2.onclick = () => speak(o.it, true);
  row.append(l1, l2);
  if (Recog) {
    const m = el("button", "btn mic", recog ? "J'écoute…" : "🎤 Parle");
    if (recog) m.classList.add("listening");
    m.onclick = () => {
      if (recog) { recog.stop(); return; }
      speechSynthesis && speechSynthesis.cancel();
      recog = listen((alts, err) => {
        if (!alts) { heard = { err: err || true, ok: false }; return; }
        let best = { text: alts[0], s: 0 };
        for (const a of alts) { const s = score(o.it, a); if (s > best.s) best = { text: a, s }; }
        heard = { text: best.text, ok: best.s >= 0.7 };
      }, () => {
        recog = null; render();
        if (heard && heard.ok) setTimeout(() => validate(o), 900);
      });
      render();
    };
    row.appendChild(m);
  } else {
    r.appendChild(micUnavailable());
  }
  const ok = el("button", "btn primary", "Je l'ai dit ✓"); ok.onclick = () => validate(o);
  const back = el("button", "btn ghost", "Autre réponse"); back.onclick = () => { pending = null; heard = null; render(); };
  row.append(ok, back);
  r.appendChild(row);
  thread.appendChild(r);
}

function renderEnd() {
  const n = Object.keys(progress.said).length;
  const e = el("div", "end");
  e.appendChild(el("h2", null, esc(scene().endTitle || "Bravo!")));
  e.appendChild(el("p", "note", `Scène terminée. ${n} phrase${n > 1 ? "s" : ""} déjà dite${n > 1 ? "s" : ""} à voix haute. Rejoue en choisissant d'autres réponses, ou coche « Italien seul » pour corser.`));
  const b = el("button", "btn primary", "Rejouer la scène");
  b.onclick = () => { resetScene(); window.scrollTo({ top: sceneEl.offsetTop - 10, behavior: "smooth" }); };
  e.appendChild(b);
  thread.appendChild(e);
  renderFoot();
}
function renderFoot() {
  const n = Object.keys(progress.said).length;
  document.getElementById("foot").textContent =
    `${n} phrase${n > 1 ? "s" : ""} dite${n > 1 ? "s" : ""} à voix haute jusqu'ici. Les tampons « detto » te suivent sur tous tes appareils.`;
}
function scrollEnd() { const last = thread.lastElementChild; if (last) last.scrollIntoView({ behavior: "smooth", block: "nearest" }); }

renderTabs(); render(); renderFoot();
setSync("off", "…");
pullProgress();

/* ---------- hors-ligne ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
