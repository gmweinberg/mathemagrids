
"use strict";

const CACHE_NAME = "mathemagrid-v1";

const FILES = [
  "./mathemagrid.html",
  "./manifest.json"
];

// Cache the application files during installation.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES);
    })
  );

  self.skipWaiting();
});

// Remove old caches when a new version activates.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});

// Serve cached files when offline.
// Check the network first so updates are picked up.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only intercept requests from this application.
  if (url.origin !== self.location.origin ||
      !url.pathname.startsWith(
        new URL("./", self.registration.scope).pathname
      )) return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  );
});

