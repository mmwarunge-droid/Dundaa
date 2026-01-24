const CACHE_NAME = "dundaa-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/manifest.json",
  "/images/deejay.jpg",
  "/images/event1.jpg",
  "/audio/mix1.mp3",
  "/audio/mix2.mp3",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(
      (res) =>
        res ||
        fetch(e.request).then((fetchRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, fetchRes.clone());
            return fetchRes;
          });
        })
    )
  );
});
