// Minimal service worker for Businessplan24.
//
// Strategies:
//   /assets/* — cache-first, immutable (filenames are hashed by Vite)
//   /fonts/*  — cache-first
//   /locales/* — stale-while-revalidate
//   /api/*    — network-only, never cached
//   everything else — network-first fallback to cache
//
// Bump CACHE_VERSION to force eviction of old caches on the next activation.

const CACHE_VERSION = 'bp24-v1';
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const LOCALE_CACHE = `${CACHE_VERSION}-locales`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Never cache API or analytics beacons
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first for hashed assets + fonts
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/fonts/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          if (hit) return hit;
          return fetch(req).then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Stale-while-revalidate for locales (text bundles we may want to refresh)
  if (url.pathname.startsWith('/locales/')) {
    event.respondWith(
      caches.open(LOCALE_CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const fetched = fetch(req)
            .then((res) => {
              if (res.ok) cache.put(req, res.clone());
              return res;
            })
            .catch(() => hit);
          return hit || fetched;
        })
      )
    );
    return;
  }

  // Navigation / HTML: network-first, fall back to cached shell
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
    );
    return;
  }
});
