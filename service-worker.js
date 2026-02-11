/* service-worker.js — Enigma Wellbeing
   Purpose: offline caching + update cleanly when you change files
*/

const CACHE_NAME = "enigma-wellbeing-cache-v7"; // 👈 bump this number to force updates
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.png",

  // Pages (add/remove if your repo differs)
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

// Install: cache core assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch strategy:
// - HTML: network-first (so pages update)
// - CSS/JS/Images: stale-while-revalidate (fast, but updates in background)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // If navigating to a page (HTML), prefer fresh network
  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html") ||
    url.pathname.endsWith(".html");

  if (isHTML) {
    event.respondWith(networkFirst(req));
    return;
  }

  // For static assets
  const isStatic =
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".json");

  if (isStatic) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Default fallback
  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    // Cache a copy
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback to cached home if a page is missing
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

  // Return cached immediately if available; otherwise wait for network
  return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
}
