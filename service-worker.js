const CACHE_NAME = "enigma-wellbeing-cache-v15";

const CORE_ASSETS = [
  "/EnigmaWellbeing-/",
  "/EnigmaWellbeing-/index.html",
  "/EnigmaWellbeing-/style.css",
  "/EnigmaWellbeing-/app.js",
  "/EnigmaWellbeing-/manifest.json",
  "/EnigmaWellbeing-/service-worker.js",

  "/EnigmaWellbeing-/icon.png",
  "/EnigmaWellbeing-/icon-192.png",
  "/EnigmaWellbeing-/icon-512.png",

  "/EnigmaWellbeing-/breathe.html",
  "/EnigmaWellbeing-/overwhelmed.html",
  "/EnigmaWellbeing-/checkin.html",
  "/EnigmaWellbeing-/journal.html",
  "/EnigmaWellbeing-/word.html",
  "/EnigmaWellbeing-/quotes.html",
  "/EnigmaWellbeing-/yoga.html",
  "/EnigmaWellbeing-/music.html",
  "/EnigmaWellbeing-/books.html",
  "/EnigmaWellbeing-/distraction.html",
  "/EnigmaWellbeing-/resources.html",
  "/EnigmaWellbeing-/help.html",
  "/EnigmaWellbeing-/settings.html",
  "/EnigmaWellbeing-/progress.html"
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
  const isHTML =
    req.mode === "navigate" ||
    accept.includes("text/html") ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/EnigmaWellbeing-/" ||
    url.pathname.endsWith("/index.html");

  if (isHTML) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return cache.match("/EnigmaWellbeing-/index.html");
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
