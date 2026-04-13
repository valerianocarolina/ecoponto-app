self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !ACTIVE_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.origin === API_ORIGIN) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    const destination = request.destination;
    if (
      destination === "style" ||
      destination === "script" ||
      destination === "image" ||
      destination === "font"
    ) {
      event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    }
  }
});

const APP_VERSION = "ecoponto-v1";
const SHELL_CACHE = `${APP_VERSION}-shell`;
const API_CACHE = `${APP_VERSION}-api`;
const STATIC_CACHE = `${APP_VERSION}-static`;
const ACTIVE_CACHES = [SHELL_CACHE, API_CACHE, STATIC_CACHE];
const API_ORIGIN = "https://ecoponto-api-08ow.onrender.com";

const APP_SHELL = [
  "/",
  "/login",
  "/cadastro",
  "/login/cliente",
  "/cadastro/cliente",
  "/mapa",
  "/favoritos",
  "/offline.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/default-point.jpg",
];

async function handleNavigation(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/offline.html");
  }
}

async function networkFirst(request, cacheName) {
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error("Network unavailable");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;

  throw new Error("Request failed");
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "EcoPonto", message: event.data.text() };
  }

  const title = payload.title || "EcoPonto";
  const options = {
    body: payload.message || "Novo ponto de coleta disponível.",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: payload.url || "/mapa" },
    tag: payload.pointId || "ecoponto-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/mapa";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
