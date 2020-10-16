{
  'use strict';
  const CACHE_NAME = 'v1';
  const CACHE_LIST = [
    './',
    './index.html',
  ];
  self.addEventListener('install', e => {
    e.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(CACHE_LIST);
      })
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
