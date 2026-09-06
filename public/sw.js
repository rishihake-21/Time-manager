// Minimal service worker: enables "Add to Home Screen" installability.
// No request interception or caching.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});