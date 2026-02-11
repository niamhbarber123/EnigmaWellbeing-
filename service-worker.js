/* service-worker.js — Enigma Wellbeing
   Amendments included:
   1) Cache-busting version you can bump to force updates.
   2) Network-first for HTML so your pages update properly.
   3) Stale-while-revalidate for CSS/JS/images for speed.
*/

const CACHE_NAME = "enigma-wellbeing-cache-v9"; // 👈 bump this each time you want to force refresh

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.png",

  "./breathe.html",
  "./overwhelmed.html",
  "./checkin.html",
  "./journal.html",
  "./word.html",
  "./quotes.html",
  "./yoga.html",
  "./music.html",
  "./books.html",
  "./distraction.html",
  "./resources.html",
  "./support.html",
  "./help.html",
  "./settings.html",
  "./progress.html"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html") || url.pathname.endsWith(".html");

  if (isHTML) {
    event.respondWith(networkFirst(req));
    return;
  }

  const isStatic =
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")  ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg")||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp")||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".json");

  event.respondWith(isStatic ? staleWhileRevalidate(req) : staleWhileRevalidate(req));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    const fallback = await cache.match("./index.html");
    return fallback || new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((fresh) => {
      cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
}
