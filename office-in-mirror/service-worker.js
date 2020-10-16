{
  'use strict';
  const cacheName = 'v1';
  const urlsToCache = [
    '/office-in-mirror/',
    '/office-in-mirror/index.html',
  ];
  self.addEventListener('install', e => {
    e.waitUntil(
      caches.open(cacheName).then(cache => {
        return cache.addAll(urlsToCache);
      });
    );
  });
  self.addEventListener('fetch', e => {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  });
}
