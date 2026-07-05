// Offline cache for the Georgian alphabet PWA.
//
// Strategy:
//   - App shell (HTML / CSS / JS / manifest + navigations): NETWORK-FIRST, so a
//     new deploy shows up on the next online load. Falls back to cache offline.
//   - Immutable assets (audio/*, icons/*): CACHE-FIRST, since content never
//     changes per URL — keeps the app fast and fully offline once played.
const CACHE = "georgian-alphabet-v3";
const SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/app.js",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isImmutable(url) {
  return url.pathname.includes("/audio/") || url.pathname.includes("/icons/");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Immutable, same-origin assets → cache-first.
  if (sameOrigin && isImmutable(url)) {
    e.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return resp;
        })
      )
    );
    return;
  }

  // App shell + navigations + everything else → network-first.
  e.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && resp.ok && sameOrigin) {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return resp;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
