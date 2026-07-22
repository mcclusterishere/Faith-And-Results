/* Freedom, Inc. — service worker.
   App shell is cached on install so the app opens instantly and works
   offline; news stays network-first so nothing stale is ever shown when
   a connection exists. Bump VERSION on any shell change to roll everyone
   forward on their next visit. */
"use strict";

var VERSION = "freedom-app-v20";

var SHELL = [
  "./",
  "./index.html",
  "./admin.html",
  "./deck.html",
  "./js/store.js",
  "./js/concierge.js",
  "./manifest.webmanifest",
  "./assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2",
  "./assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2",
  "./assets/fonts/space-grotesk-latin-var.woff2",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/freedom-inc.vcf",
  "./assets/scraped/freedom-logo-300px.png",
  "./assets/scraped/mccluster.jpg",
  "./assets/scraped/callion.jpg",
  "./assets/scraped/fdic.jpg",
  "./assets/scraped/freddiemac.jpg",
  "./assets/scraped/fanniemae.jpg",
  "./assets/scraped/neighborworks-america-logo.jpg",
  "./assets/scraped/wellsfargo.jpg",
  "./assets/scraped/chase-logo.jpg",
  "./assets/scraped/bankofamerica.jpg",
  "./assets/scraped/citibank-logo.jpg",
  "./assets/scraped/fhlatl.jpg",
  "./assets/scraped/fhl-bank-sf-logo.jpg",
  "./assets/scraped/greenbank.jpg",
  "./assets/scraped/homefree.jpg",
  "./assets/scraped/energize-ct-logo.jpg",
  "./assets/scraped/faithcdc.jpg",
  "./assets/scraped/urbandev.jpg",
  "./assets/scraped/housing.jpg",
  "./assets/media/events-summits-bg.jpg",
  "./assets/media/vision-left.jpg",
  "./assets/media/education-training-slider.jpg",
  "./assets/media/freedom-main-slide.jpg",
  "./assets/media/mlk-corridor-header-e1558703350169.jpg",
  "./assets/media/summits-bg.jpg",
  "./assets/media/1024x1024-1-1.jpg",
  "./assets/media/1200x0-e1643493066507.jpg",
  "./assets/media/mission-bg-2.jpg",
  "./assets/media/vision-mobile.jpg",
  "./assets/media/freedom-slider-1.jpg",
  "./assets/media/sustainability-bg.jpg",
  "./assets/media/IMG_20190516_162315-e1559237250402.jpg",
  "./data/visuals.json",
  "./data/news.json",
  "./data/programs.json",
  "./data/trainings.json",
  "./data/events.json",
  "./data/jobs-partners.json",
  "./data/config.json"
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

  /* Data files: network first, cached copy only when the network is gone —
     program edits and config flips publish immediately. */
  if (url.pathname.indexOf("/data/") !== -1) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  /* Navigations: serve the cached copy of THAT page (admin.html must never
     get the app shell), refresh in the background, fall back to the app
     shell only when offline with nothing cached. */
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
          return res;
        }).catch(function () { return hit || caches.match("./index.html"); });
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
