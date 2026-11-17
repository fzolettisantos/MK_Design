/* Service worker do painel do técnico: só recebe avisos (push) e abre o painel ao tocar. Não guarda nada em cache. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = { body: event.data ? event.data.text() : "" }; }
  event.waitUntil(
    self.registration.showNotification(d.title || "MK Design", {
      body: d.body || "",
      icon: "/images/icons/icon-192.png",
      badge: "/images/icons/icon-192.png",
      tag: d.tag || "mk-pedido",
      renotify: true,
      data: { url: d.url || "/admin" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes("/admin") && "focus" in c) { if ("navigate" in c) c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    }),
  );
});
