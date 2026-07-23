/* Ask McCluster: the site's resident concierge. Two brains, both free.

   1. The curated brain (always first): intents and retrieval over the
      repo's own data files. Instant, offline, costs nothing, and can
      only say what the site knows. Even with smart mode on, anything
      the curated brain is sure about never reaches the model.
   2. Smart mode (optional, per visitor): a small open-source model
      loaded INTO THE BROWSER over WebGPU via web-llm. It only ever
      sees what the curated brain could not answer: general questions
      and loose follow-ups. Its output passes a persona guard; if the
      model breaks character, the visitor never sees it.

   Boot with McConcierge.init(DATA) once the app's data files load. */
"use strict";

window.McConcierge = (function () {
  var DATA = null;
  var corpus = [];
  var llm = null;          // web-llm engine once smart mode is on
  var llmLoading = false;
  var history = [];        // [{role, content}] for smart mode context

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------------- knowledge ---------------- */
  var FACTS = [
    { t: "Freedom, Inc. mission", body: "FREEDOM (Faith Restoration Empowerment & Economic Development Outreach Ministries) develops and leads a network of faith, public, private and non-profit organizations that initiate and nurture economic renewal in housing, economic development, education and sustainability, across nineteen American cities.", route: "#/about" },
    { t: "Rev. Carl McCluster", body: "Rev. Carl McCluster is Senior Pastor of Shiloh Baptist Church in Bridgeport, Connecticut, founder of the Faith Community Development Corporation, and Managing Director of FREEDOM. Under his leadership Shiloh became the first African-American church in Connecticut to become energy self-sufficient through solar.", route: "#/about" },
    { t: "Contact", body: "Call (203) 549-8703 or email info@faithandresults.com. Every door is open: partnership, training, the newsletter, and giving.", route: "#/connect" },
    { t: "MLK Corridors Initiative", body: "At least 955 American streets across 41 states carry Dr. King's name. The Corridors Initiative organizes them as economic corridors. Connecticut named corridors in Norwalk, Middletown and New Britain, launched January 18, 2019 at Spear Park in Middletown. Any organization anywhere can apply to bring the corridor to its city.", route: "#/corridor" },
    { t: "The record", body: "More than 100,000 families served through Homes Saved By Faith. Consulting for the FDIC, HUD, and the Federal Home Loan Banks of Atlanta, Boston and San Francisco. Trainer for NeighborWorks America in eleven cities.", route: "#/about" },
    { t: "Install the app", body: "This site installs to your phone's home screen and works offline. On iPhone: Share, then Add to Home Screen. On Android: use the install prompt.", route: "#/home" }
  ];

  function buildCorpus() {
    corpus = [];
    FACTS.forEach(function (f) { corpus.push(f); });
    (DATA.programs || []).forEach(function (p) {
      corpus.push({ t: p.name, body: p.tag + ". " + p.body, route: p.screen || "#/program/" + p.id });
    });
    (DATA.trainings || []).forEach(function (t) {
      corpus.push({ t: t.name + " (apply now)", body: "For: " + t.audience + ". " + t.body, route: "#/apply/" + t.id });
    });
    (DATA.events || []).forEach(function (ev) {
      corpus.push({ t: "Event: " + ev.title, body: (ev.date || "") + " at " + (ev.location || "") + ". " + (ev.body || ""), route: "#/events" });
    });
    Object.keys(DATA.cityStories || {}).forEach(function (c) {
      corpus.push({ t: c, body: String(DATA.cityStories[c]).replace(/<[^>]+>/g, ""), route: "#/cities" });
    });
  }

  var STOP = { the: 1, and: 1, for: 1, you: 1, your: 1, what: 1, who: 1, how: 1, can: 1, does: 1, with: 1, about: 1, that: 1, this: 1, are: 1, have: 1, get: 1, its: 1, was: 1, will: 1, they: 1, them: 1, from: 1, into: 1, our: 1, all: 1, any: 1, one: 1, out: 1, has: 1, more: 1, when: 1, where: 1, why: 1, whats: 1 };
  function tokens(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter(function (w) { return w.length > 2 && !STOP[w]; });
  }
  function retrieve(q, n) {
    var qt = tokens(q);
    return corpus.map(function (c) {
      var hay = (c.t + " " + c.body).toLowerCase();
      var score = 0;
      qt.forEach(function (w) {
        if (hay.indexOf(w) !== -1) score += (c.t.toLowerCase().indexOf(w) !== -1 ? 3 : 1);
      });
      return { c: c, score: score };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, n || 3).map(function (x) { var c = Object.assign({}, x.c); c._score = x.score; return c; });
  }

  /* ---------------- built-in answers ---------------- */
  function link(route, label) {
    return '<a href="' + route + '" data-go>' + esc(label) + " →</a>";
  }
  function nextEvent() {
    var now = new Date().toISOString().slice(0, 10);
    var f = (DATA.events || []).filter(function (e) { return e.date >= now; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); })[0];
    return f ? "Next up: " + esc(f.title) + " on " + esc(f.date) + (f.location ? " at " + esc(f.location) : "") + ". " : "";
  }

  var INTENTS = [
    { re: /foreclos|behind on|missed payment|losing (my |our )?home|sale date|eviction/i,
      a: function () { return "Please don't wait. Call <a href=\"tel:+12035498703\"><b>(203) 549-8703</b></a> right now, and start the confidential intake here: " + link("#/apply/foreclosure-help", "Foreclosure help") + ". Homes Saved By Faith has walked more than 100,000 families through this."; } },
    { re: /job|work(force)?|employ|trade|apprentice|hire|career/i,
      a: function () { return "The CFJC Workforce Readiness Program is a four-week apprenticeship timed to real employers' hiring, including Hartford HealthCare pathways. " + link("#/apply/workforce-readiness", "Apply for training") + " or browse everything at " + link("#/trainings", "Trainings"); } },
    { re: /buy(ing)? a (house|home)|homebuyer|first.?time|own a home|down payment|mortgage/i,
      a: function () { return "Homebuyer education and counseling takes you from first conversation to keys, with credit prep on the way. " + link("#/apply/homebuyer-education", "Start your path home"); } },
    { re: /credit|budget|financial (literacy|education|freedom)|money class/i,
      a: function () { return "The Financial Empowerment Series covers credit, budgeting, banking and the path to ownership, taught with FDIC and HUD certified counselors. " + link("#/apply/financial-empowerment", "Apply here"); } },
    { re: /event|calendar|conference|rsvp|summit|gathering/i,
      a: function () { return nextEvent() + "The full calendar, past and future, lives here: " + link("#/events", "Events"); } },
    { re: /donat|give|giving|sponsor|contribute/i,
      a: function () { return "Thank you. Every gift builds capacity in a community. " + link("#/connect", "Give or sponsor") + " and for conference sponsorships, check " + link("#/events", "Events"); } },
    { re: /corridor|\bmlk\b|martin luther king/i,
      a: function () { return "The MLK Corridors Initiative turns streets named for Dr. King into engines of local economy. Connecticut went first: Norwalk, Middletown, New Britain. Your city can be next. " + link("#/corridor", "See the initiative"); } },
    { re: /mccluster|pastor|reverend|founder|who (runs|leads|started)/i,
      a: function () { return "Rev. Carl McCluster: Senior Pastor of Shiloh Baptist Church in Bridgeport, founder of the Faith CDC, Managing Director of FREEDOM, and the reason Shiloh runs on solar. " + link("#/about", "Meet the leadership"); } },
    { re: /city|cities|where (are|do) you|locations|near me/i,
      a: function () { return "Nineteen American cities, from Bridgeport to Oakland, each with its own story. " + link("#/cities", "Open the map"); } },
    { re: /contact|phone|email|call you|reach (you|someone)|talk to (a|some)/i,
      a: function () { return "Call <a href=\"tel:+12035498703\"><b>(203) 549-8703</b></a> or email <a href=\"mailto:info@faithandresults.com\">info@faithandresults.com</a>. " + link("#/connect", "All the doors"); } },
    { re: /solar|energy|sustainab|green|net.?zero|tiny home/i,
      a: function () { return "Yes. FREEDOM helped Shiloh Baptist become the first African-American church in Connecticut fully powered by solar, then took the playbook national with the CT Green Bank, Energize CT, and Posigen. Next up: Net Zero Communities. " + link("#/program/congregational-sustainability", "The sustainability work"); } },
    { re: /church|congregation|partner|volunteer|capacity|cdc\b/i,
      a: function () { return "If you hold a community's trust or its budget, FREEDOM builds with you. Capacity building for congregations and organizations starts here: " + link("#/apply/capacity-building", "Apply as an organization"); } },
    { re: /install|home screen|offline|app\b/i,
      a: function () { return "This site is an app. iPhone: Share, then Add to Home Screen. Android: accept the install prompt. It works offline once installed."; } },
    { re: /^(hi|hey|hello|yo|good (morning|afternoon|evening))\b/i,
      a: function () { return "Welcome. I'm McCluster, this house's concierge. Ask me about trainings, events, foreclosure help, the MLK Corridors, or anything Freedom, Inc. does."; } },
    { re: /thank/i, a: function () { return "Anytime. That's what this house is for."; } }
  ];

  /* things the house does not trade in: answered in character, never by the model */
  var OFFLIMITS = /\b(weed|marijuana|cannabis|drugs?|cocaine|heroin|meth|fentanyl|vapes?|cigarettes?|alcohol|liquor|beer|guns?|firearms?|ammo|weapons?|gambling|casino|bets?|betting|lottery|escorts?|porn)\b/i;
  function offlimitsAnswer() {
    return "That's not something this house offers. What we do have is real help: " +
      link("#/trainings", "job training") + ", " + link("#/apply/homebuyer-education", "a path to a home") +
      ", and if things are tight right now, " + link("#/apply/foreclosure-help", "help, fast") +
      ". A person always answers at <a href=\"tel:+12035498703\"><b>(203) 549-8703</b></a>.";
  }

  function retrievalAnswer(hit) {
    return "Here's what I know: <b>" + esc(hit.t) + ".</b> " +
      esc(hit.body.slice(0, 260)) + (hit.body.length > 260 ? "…" : "") + " " +
      link(hit.route, "More");
  }

  /* everything the curated brain is SURE about; null means let smart mode try */
  function curatedAnswer(q) {
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].re.test(q)) return INTENTS[i].a();
    }
    if (OFFLIMITS.test(q)) return offlimitsAnswer();
    var hits = retrieve(q, 2);
    if (hits.length && hits[0]._score >= 4) return retrievalAnswer(hits[0]);
    return null;
  }

  /* the polite landing when nobody is sure */
  function handoffAnswer(q) {
    var hits = retrieve(q, 2);
    if (hits.length && hits[0]._score > 1) return retrievalAnswer(hits[0]);
    return "I may not have that one yet. A person will: call <a href=\"tel:+12035498703\"><b>(203) 549-8703</b></a> or email <a href=\"mailto:info@faithandresults.com\">info@faithandresults.com</a>.";
  }

  function builtinAnswer(q) {
    return curatedAnswer(q) || handoffAnswer(q);
  }

  /* ---------------- smart mode (in-browser LLM) ---------------- */
  function smartAvailable() { return !!navigator.gpu; }

  function enableSmart(onProgress) {
    if (llm || llmLoading) return Promise.resolve(llm);
    llmLoading = true;
    return import("https://esm.run/@mlc-ai/web-llm").then(function (webllm) {
      return webllm.CreateMLCEngine("Qwen2.5-1.5B-Instruct-q4f16_1-MLC", {
        initProgressCallback: function (p) { if (onProgress) onProgress(p.text || "", p.progress || 0); }
      });
    }).then(function (engine) {
      llm = engine;
      llmLoading = false;
      return engine;
    }).catch(function (e) {
      llmLoading = false;
      throw e;
    });
  }

  /* the persona guard: if the model says any of this, the visitor never sees it */
  var BREAKS = /not (affiliated|associated|authorized)|can'?t speak (for|on behalf)|on behalf of any|as an ai\b|language model|i'?m an ai|artificial intelligence|my training data|qwen|alibaba|openai|anthropic|chatgpt|sorry,? but i can'?t assist/i;

  var PERSONA =
    "You are McCluster, the resident digital concierge of Freedom, Inc. (faithandresults.com), " +
    "a faith-based economic development organization led by Rev. Carl McCluster from Shiloh Baptist " +
    "Church in Bridgeport, Connecticut. You are part of Freedom, Inc. That is permanent. House rules, never broken:\n" +
    "1. Never say you are unaffiliated with Freedom, Inc. and never disclaim speaking for it. You speak for the house.\n" +
    "2. Never mention being an AI, a model, software, or your training. If asked what you are: you're McCluster, the house concierge.\n" +
    "3. Facts about Freedom, Inc. come ONLY from the CONTEXT block. If a fact is missing, say the team will know and give (203) 549-8703.\n" +
    "4. Asked for anything the organization does not offer (substances, weapons, gambling, anything unlawful): decline in one warm sentence, then pivot to what the house does offer: job training, housing help, foreclosure relief, events.\n" +
    "5. Under 100 words. Plain, warm, direct. No lists unless asked, no markdown, no em dashes.";

  /* a worked example of staying in character under pressure, because small
     models learn from the transcript more than from the rules */
  var FEWSHOT = [
    { role: "user", content: "Can you sell me weed?" },
    { role: "assistant", content: "No, that's not what this house does. What I can offer is real help: job training, a path to buying a home, and fast help if you're behind on the mortgage. Want any of those?" },
    { role: "user", content: "Why not?" },
    { role: "assistant", content: "Because Freedom, Inc. is a faith-based economic development organization: we build jobs, homes, and stronger communities. That's our lane. If money is tight, the Financial Empowerment Series or the jobs pipeline may genuinely help. Want me to point you there?" }
  ];

  function smartAnswer(q, onToken) {
    var ctx = retrieve(q, 4).map(function (c) { return c.t + ": " + c.body; }).join("\n");
    var messages = [{ role: "system", content: PERSONA + "\n\nCONTEXT:\n" + ctx }]
      .concat(FEWSHOT, history.slice(-6), [{ role: "user", content: q }]);
    return llm.chat.completions.create({ messages: messages, stream: true, max_tokens: 220 }).then(function (stream) {
      var full = "";
      var broke = false;
      function pump(it) {
        return it.next().then(function (r) {
          if (r.done || broke) return full;
          var d = (r.value.choices && r.value.choices[0] && r.value.choices[0].delta.content) || "";
          if (d) {
            full += d;
            if (BREAKS.test(full)) {
              broke = true;
              try { if (llm.interruptGenerate) llm.interruptGenerate(); } catch (e) { /* best effort */ }
              return full;
            }
            onToken(full);
          }
          return pump(it);
        });
      }
      return pump(stream[Symbol.asyncIterator]());
    });
  }

  /* ---------------- public API ---------------- */
  return {
    init: function (data) { DATA = data; buildCorpus(); },
    ready: function () { return !!DATA; },
    smartAvailable: smartAvailable,
    smartOn: function () { return !!llm; },
    enableSmart: enableSmart,
    ask: function (q, onToken) {
      history.push({ role: "user", content: q });
      if (history.length > 12) history = history.slice(-12);

      /* the curated brain answers everything it is sure about, smart or not */
      var curated = curatedAnswer(q);
      if (curated) {
        history.push({ role: "assistant", content: curated.replace(/<[^>]+>/g, "") });
        return Promise.resolve({ html: curated, smart: false });
      }

      if (llm) {
        return smartAnswer(q, onToken).then(function (full) {
          if (!full.trim() || BREAKS.test(full)) {
            /* the model broke character; the visitor gets the house instead */
            var fb = handoffAnswer(q);
            history.push({ role: "assistant", content: fb.replace(/<[^>]+>/g, "") });
            return { html: fb, smart: false };
          }
          history.push({ role: "assistant", content: full });
          return { html: esc(full).replace(/\n/g, "<br>"), smart: true };
        }).catch(function () {
          var a = handoffAnswer(q);
          history.push({ role: "assistant", content: a.replace(/<[^>]+>/g, "") });
          return { html: a, smart: false };
        });
      }

      var a = handoffAnswer(q);
      history.push({ role: "assistant", content: a.replace(/<[^>]+>/g, "") });
      return Promise.resolve({ html: a, smart: false });
    }
  };
})();
