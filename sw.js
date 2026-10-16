// TAKT service worker: app shell cache-first, question pack network-first.
const SHELL = "takt-shell-v13";
const DATA = "takt-data";
const SHELL_FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.addAll(SHELL_FILES);
    const d = await caches.open(DATA);
    for (const f of ["data/pack.json", "data/notes.json", "data/syllabus.json"]) {
      try { const res = await fetch(f, { cache: "no-store" }); if (res.ok) await d.put(new URL(f, self.registration.scope).pathname, res); } catch (_) {}
    }
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL && k !== DATA) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  if (url.pathname.includes("/data/")) {
    e.respondWith((async () => {
      const d = await caches.open(DATA);
      const key = url.pathname;
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 4000);
        const res = await fetch(e.request, { cache: "no-store", signal: ctl.signal });
        clearTimeout(t);
        if (res.ok) { await d.put(key, res.clone()); return res; }
        throw new Error("bad status");
      } catch (_) {
        const hit = await d.match(key) || (key.endsWith("pack.json") ? await d.match("data/pack.json") : null);
        return hit || new Response("{}", { headers: { "Content-Type": "application/json" } });
      }
    })());
    return;
  }

  // Network first (so updates show up right away when online), cache when offline.
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 3000);
      const res = await fetch(e.request, { cache: "no-store", signal: ctl.signal });
      clearTimeout(t);
      if (res.ok) { c.put(e.request.mode === "navigate" ? "index.html" : e.request, res.clone()); return res; }
      throw new Error("bad status");
    } catch (_) {
      const hit = await c.match(e.request, { ignoreSearch: true }) || (e.request.mode === "navigate" ? await c.match("index.html") : null);
      return hit || new Response("offline", { status: 503 });
    }
  })());
});
