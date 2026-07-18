/* Freedom, Inc. — the data layer.
   One API for the app (index.html) and the admin backend (admin.html),
   three ways to run it, chosen in data/config.json:

     mode "demo"      Everything lives in this browser's localStorage.
                      Zero setup — submissions made on this device appear
                      in this device's admin. Perfect for client demos.
     mode "supabase"  Real database + real admin login. Applications and
                      profiles insert via the anon key; reading them in
                      admin requires signing in (RLS policies in
                      docs/supabase-setup.sql enforce this).
     webhookUrl       Fires in ANY mode: every submission POSTs to the
                      URL — point it at Zapier / Make / n8n and fan out
                      to Mailchimp, Sheets, CRMs, anywhere.

   See docs/BACKEND.md for the full setup guide. */
"use strict";

window.FreedomStore = (function () {
  var config = null;
  var LS = {
    profile: "freedom.profile",
    apps: "freedom.applications",
    profiles: "freedom.profiles",
    mine: "freedom.myApplications",
    rsvps: "freedom.rsvps",
    localEvents: "freedom.localEvents",
    session: "freedom.adminSession"
  };

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function uid() {
    return "FR-" + Date.now().toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function init() {
    if (config) return Promise.resolve(config);
    return fetch("data/config.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (c) { config = c; return c; })
      .catch(function () { config = { mode: "demo" }; return config; });
  }

  /* ---------------- supabase REST helpers ---------------- */
  function sb(path, opts) {
    opts = opts || {};
    var headers = {
      "apikey": config.supabaseAnonKey,
      "Authorization": "Bearer " + (opts.token || config.supabaseAnonKey),
      "Content-Type": "application/json"
    };
    if (opts.prefer) headers["Prefer"] = opts.prefer;
    return fetch(config.supabaseUrl + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error("Backend error " + r.status + ": " + t); });
      return r.status === 204 ? null : r.json();
    });
  }
  function adminToken() {
    var s = read(LS.session, null);
    return s && s.access_token;
  }

  /* ---------------- automations: outbound webhook ---------------- */
  function fireWebhook(type, data) {
    if (!config.webhookUrl) return Promise.resolve(false);
    return fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "faithandresults-app", type: type, sentAt: new Date().toISOString(), data: data })
    }).then(function () { return true; }).catch(function () { return false; });
  }

  /* ---------------- profile (this device's person) ---------------- */
  function getProfile() { return read(LS.profile, null); }

  function saveProfile(p) {
    p.updatedAt = new Date().toISOString();
    write(LS.profile, p);
    var roster = read(LS.profiles, []);
    var i = roster.findIndex(function (x) { return x.email === p.email; });
    if (i >= 0) roster[i] = p; else roster.push(p);
    write(LS.profiles, roster);

    var pushes = [fireWebhook("profile", p)];
    if (config.mode === "supabase" && config.supabaseUrl) {
      pushes.push(sb("/rest/v1/profiles?on_conflict=email", {
        method: "POST", body: p, prefer: "resolution=merge-duplicates"
      }).catch(function () { /* profile still saved locally */ }));
    }
    return Promise.all(pushes).then(function () { return p; });
  }

  /* ---------------- applications ---------------- */
  function submitApplication(app) {
    app.id = uid();
    app.status = "received";
    app.submittedAt = new Date().toISOString();

    var apps = read(LS.apps, []);
    apps.unshift(app);
    write(LS.apps, apps);
    var mine = read(LS.mine, []);
    mine.unshift(app.id);
    write(LS.mine, mine);

    var pushes = [fireWebhook("application", app)];
    if (config.mode === "supabase" && config.supabaseUrl) {
      pushes.push(sb("/rest/v1/applications", { method: "POST", body: app }));
    }
    return Promise.all(pushes).then(function () { return app; });
  }

  function myApplications() {
    var mine = read(LS.mine, []);
    return read(LS.apps, []).filter(function (a) { return mine.indexOf(a.id) !== -1; });
  }

  /* ---------------- events + RSVPs ---------------- */
  function submitRsvp(r) {
    r.id = uid();
    r.submittedAt = new Date().toISOString();
    var all = read(LS.rsvps, []);
    all.unshift(r);
    write(LS.rsvps, all);
    var pushes = [fireWebhook("rsvp", r)];
    if (config.mode === "supabase" && config.supabaseUrl) {
      pushes.push(sb("/rest/v1/rsvps", { method: "POST", body: r }));
    }
    return Promise.all(pushes).then(function () { return r; });
  }
  function listRsvps() {
    if (config.mode === "supabase" && config.supabaseUrl) {
      return sb("/rest/v1/rsvps?select=*&order=submittedAt.desc", { token: adminToken() });
    }
    return Promise.resolve(read(LS.rsvps, []));
  }
  /* Admin-drafted events live locally until published into data/events.json. */
  function getLocalEvents() { return read(LS.localEvents, []); }
  function saveLocalEvents(list) { write(LS.localEvents, list); }

  /* ---------------- admin ---------------- */
  function adminSignIn(email, password) {
    if (config.mode !== "supabase") {
      return Promise.resolve({ demo: true });
    }
    return fetch(config.supabaseUrl + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "apikey": config.supabaseAnonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) {
      if (!r.ok) throw new Error("Sign-in failed — check email and password.");
      return r.json();
    }).then(function (s) { write(LS.session, s); return s; });
  }
  function adminSignOut() { localStorage.removeItem(LS.session); }

  function listApplications() {
    if (config.mode === "supabase" && config.supabaseUrl) {
      return sb("/rest/v1/applications?select=*&order=submittedAt.desc", { token: adminToken() });
    }
    return Promise.resolve(read(LS.apps, []));
  }
  function listProfiles() {
    if (config.mode === "supabase" && config.supabaseUrl) {
      return sb("/rest/v1/profiles?select=*&order=updatedAt.desc", { token: adminToken() });
    }
    return Promise.resolve(read(LS.profiles, []));
  }
  function updateApplication(id, patch) {
    patch.reviewedAt = new Date().toISOString();
    var apps = read(LS.apps, []);
    var i = apps.findIndex(function (a) { return a.id === id; });
    if (i >= 0) { Object.assign(apps[i], patch); write(LS.apps, apps); }
    var pushes = [fireWebhook("application-update", Object.assign({ id: id }, patch))];
    if (config.mode === "supabase" && config.supabaseUrl) {
      pushes.push(sb("/rest/v1/applications?id=eq." + encodeURIComponent(id), {
        method: "PATCH", body: patch, token: adminToken()
      }));
    }
    return Promise.all(pushes).then(function () { return i >= 0 ? apps[i] : patch; });
  }

  /* ---------------- CSV export ---------------- */
  function toCsv(rows) {
    if (!rows.length) return "";
    var cols = [];
    rows.forEach(function (r) {
      Object.keys(r).forEach(function (k) { if (cols.indexOf(k) === -1) cols.push(k); });
    });
    function cell(v) {
      if (v === null || v === undefined) return "";
      var s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return [cols.map(cell).join(",")].concat(rows.map(function (r) {
      return cols.map(function (c) { return cell(r[c]); }).join(",");
    })).join("\r\n");
  }
  function downloadCsv(rows, filename) {
    var blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return {
    init: init,
    getConfig: function () { return config; },
    getProfile: getProfile,
    saveProfile: saveProfile,
    submitApplication: submitApplication,
    myApplications: myApplications,
    submitRsvp: submitRsvp,
    listRsvps: listRsvps,
    getLocalEvents: getLocalEvents,
    saveLocalEvents: saveLocalEvents,
    adminSignIn: adminSignIn,
    adminSignOut: adminSignOut,
    isAdminSignedIn: function () { return config.mode !== "supabase" || !!adminToken(); },
    listApplications: listApplications,
    listProfiles: listProfiles,
    updateApplication: updateApplication,
    fireWebhook: fireWebhook,
    downloadCsv: downloadCsv
  };
})();
