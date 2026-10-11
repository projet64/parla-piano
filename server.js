// Parla piano — petit serveur : fichiers statiques + sauvegarde de la progression
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "200kb" }));

const PORT = process.env.PORT || 3000;
// Code d'accès optionnel : si APP_KEY est défini, l'API exige l'en-tête x-app-key
const APP_KEY = process.env.APP_KEY || "";

let pool = null;
const memory = {}; // repli si pas de base (dev local)

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.log("Pas de DATABASE_URL : progression gardée en mémoire (dev).");
    return;
  }
  const { Pool } = require("pg");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // réseau privé Railway (.railway.internal) : pas de SSL ; accès public : SSL
    ssl: (process.env.PGSSL === "off" || /\.railway\.internal/.test(process.env.DATABASE_URL))
      ? false : { rejectUnauthorized: false },
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      profile TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  console.log("Base PostgreSQL prête.");
}

function checkKey(req, res, next) {
  if (APP_KEY && req.get("x-app-key") !== APP_KEY) {
    return res.status(401).json({ error: "Code d'accès incorrect." });
  }
  next();
}

// Fusion : on garde le plus grand compteur de chaque phrase
function merge(a = {}, b = {}) {
  const said = { ...(a.said || {}) };
  for (const [k, v] of Object.entries(b.said || {})) said[k] = Math.max(said[k] || 0, v || 0);
  const scenes = { ...(a.scenes || {}) };
  for (const [k, v] of Object.entries(b.scenes || {})) scenes[k] = Math.max(scenes[k] || 0, v || 0);
  return { said, scenes };
}

async function load(profile) {
  if (!pool) return memory[profile] || {};
  const r = await pool.query("SELECT data FROM progress WHERE profile=$1", [profile]);
  return r.rows[0] ? r.rows[0].data : {};
}
async function save(profile, data) {
  if (!pool) { memory[profile] = data; return; }
  await pool.query(
    `INSERT INTO progress(profile, data, updated_at) VALUES ($1,$2,now())
     ON CONFLICT (profile) DO UPDATE SET data=$2, updated_at=now()`,
    [profile, data]
  );
}

const PROFILE = "jerome";

app.get("/api/health", (req, res) => res.json({ ok: true, db: !!pool }));

app.get("/api/progress", checkKey, async (req, res) => {
  try { res.json(await load(PROFILE)); }
  catch (e) { console.error(e); res.status(500).json({ error: "Lecture impossible." }); }
});

app.post("/api/progress", checkKey, async (req, res) => {
  try {
    const merged = merge(await load(PROFILE), req.body || {});
    await save(PROFILE, merged);
    res.json(merged);
  } catch (e) { console.error(e); res.status(500).json({ error: "Sauvegarde impossible." }); }
});

app.use(express.static(path.join(__dirname, "public"), {
  setHeaders(res, file) {
    if (file.endsWith("sw.js") || file.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
  },
}));

initDb()
  .catch((e) => { pool = null; console.error("Base indisponible, repli mémoire :", e.message); })
  .finally(() => app.listen(PORT, () => console.log(`Parla piano sur le port ${PORT}`)));
