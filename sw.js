/* Service worker: lets the app open without internet.
   Strategy: try the network first (so updates show up right away), and fall back to the saved copy when offline. */
"use strict";

const CACHE = "levelup-hq-v2";
const SHELL = [
  "./", "index.html", "css/styles.css", "favicon.svg", "manifest.webmanifest",
  "js/templates.js", "js/state.js", "js/utils.js", "js/storage.js", "js/game.js",
  "js/views/header.js", "js/views/journey.js", "js/views/deans.js", "js/views/money.js", "js/views/planner.js",
  "js/journeyedit.js", "js/receipts.js", "js/modals.js", "js/events.js", "js/app.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if(!sameOrigin && !isFont) return;

  e.respondWith(
    // "no-cache" makes the browser ask the server if the file changed, so updates show up right away
    fetch(sameOrigin ? req.url : req, sameOrigin ? {cache: "no-cache"} : undefined).then(res => {
      if(res && (res.ok || res.type === "opaque")){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(req, {ignoreSearch: true}).then(hit =>
        hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error()))
    )
  );
});
