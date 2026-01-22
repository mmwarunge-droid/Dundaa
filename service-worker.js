self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("dundaa-cache").then(cache =>
            cache.addAll([
                "/",
                "/index.html",
                "/styles.css",
                "/main.js"
            ])
        )
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
