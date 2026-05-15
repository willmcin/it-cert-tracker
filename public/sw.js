const CACHE = 'cert-tracker-v1';

self.addEventListener('install', (event) => {
  // cache the main shell pages immediately
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/resources', '/weak-topics'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // immutable Next.js static assets — cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached ?? fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // everything else — network-first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
