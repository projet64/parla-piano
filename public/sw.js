// Service worker : l'appli marche hors-ligne (train, avion, zone blanche)
const CACHE = "parla-piano-v1";
const ASSETS = ["/", "/index.html", "/styles.css", "/data.js", "/app.js", "/manifest.webmanifest",
  "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return; // la synchro passe toujours par le réseau
  // réseau d'abord (pour recevoir les mises à jour), cache en secours
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && (url.origin === location.origin || url.host.includes("fonts.g"))) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("/index.html")))
  );
});
