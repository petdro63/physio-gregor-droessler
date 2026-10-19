// Only a public, data-free offline page is cached. Never cache API, media, or app HTML.
const CACHE = 'physio-offline-0.1.9-dev';
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(c => c.add('/offline.html'))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => { if(event.request.mode === 'navigate') event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html'))); });
