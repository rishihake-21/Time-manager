const CACHE_NAME = "ledger-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

// Install - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache when offline, otherwise network-first for API
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }
  
  // Skip Supabase API requests - always go to network for real-time data
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return offline response for API when network fails
        return new Response(
          JSON.stringify({ error: "Offline", cached: true }),
          { headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }
  
  // For static assets and navigation: cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache and update in background
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {
            // Ignore network errors for cached assets
          })
        );
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        return new Response("Offline", { status: 503 });
      });
    })
  );
});

// Handle push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "ledger-notification",
    data: data.data,
    actions: data.actions || [],
    requireInteraction: true,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.action === "open") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("/");
      })
    );
  }
});

// Background sync for offline writes (future enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-schedule") {
    event.waitUntil(syncSchedule());
  }
});

async function syncSchedule() {
  // Future: sync offline changes when back online
  console.log("Background sync triggered");
}