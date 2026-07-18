/* Freedom, Inc. — service worker.
   App shell is cached on install so the app opens instantly and works
   offline; news stays network-first so nothing stale is ever shown when
   a connection exists. Bump VERSION on any shell change to roll everyone
   forward on their next visit. */
"use strict";

var VERSION = "freedom-app-v1";

var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2",
  "./assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2",
  "./assets/fonts/bitter-latin-800-normal.woff2",
  "./assets/fonts/bitter-latin-900-normal.woff2",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/freedom-inc.vcf",
  "./data/news.json"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* News: network first, cached copy only when the network is gone. */
  if (url.pathname.indexOf("/data/news.json") !== -1) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  /* Navigations: serve the cached shell, refresh it in the background. */
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then(function (hit) {
        var net = fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put("./index.html", copy); });
          return res;
        }).catch(function () { return hit; });
        return hit || net;
      })
    );
    return;
  }

  /* Everything else same-origin: cache first, fill the cache as we go. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
