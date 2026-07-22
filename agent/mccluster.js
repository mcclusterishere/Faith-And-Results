#!/usr/bin/env node
/* McCluster OS: the operations engine that carries the founder's name.
   Runs on GitHub Actions (see .github/workflows/mccluster.yml), thinks
   with the Claude API, and acts ONLY by writing whitelisted data files in
   this repo. It has no email, no network sends beyond the Claude API call
   itself, and no access to code. Outreach it drafts sits in the pipeline
   until a human approves it in Admin > McCluster. The charter in
   data/mccluster/charter.json is its constitution; change behavior there. */
"use strict";
const fs = require("fs");

const MODEL = process.env.MCCLUSTER_MODEL || "claude-fable-5";
const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error("ANTHROPIC_API_KEY is not set"); process.exit(1); }

const read = (p, fb) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fb; } };
const charter = read("data/mccluster/charter.json", null);
if (!charter) { console.error("charter.json missing or invalid"); process.exit(1); }
const state = read("data/mccluster/state.json", { runs: 0, lastRun: "", lastBrief: "", seen: [] });
const prospects = read("data/mccluster/prospects.json", { prospects: [] });
const news = read("data/news.json", { items: [] });
const events = read("data/events.json", { events: [] });
const programs = read("data/programs.json", { programs: [] });
const partners = read("data/jobs-partners.json", { partners: [] });
const drafts = read("data/mccluster/event-drafts.json", { drafts: [] });

const today = new Date().toISOString().slice(0, 10);
const caps = charter.caps || {};

const slim = (o) => JSON.stringify(o).slice(0, 6000);
const prompt = `You are McCluster OS, the autonomous operations engine for Freedom, Inc.
(faithandresults.com), the faith-based economic development organization founded
around Rev. Carl McCluster's work in ${19} American cities.

Today is ${today}. This is run #${state.runs + 1}. Your charter:
${JSON.stringify(charter, null, 1)}

Current organizational state:
- Programs: ${programs.programs.map(p => p.name).join("; ")}
- Jobs partners: ${partners.partners.map(p => p.name).join("; ")}
- Events (latest 6): ${slim(events.events.slice(0, 6).map(e => ({ t: e.title, d: e.date })))}
- News items: ${slim(news.items.map(n => ({ t: n.title, d: n.date })))}
- Prospect pipeline (${prospects.prospects.length}): ${slim(prospects.prospects.map(p => ({ n: p.name, s: p.status })))}
- Previously considered (do not re-add): ${state.seen.slice(-80).join("; ") || "none"}
- Last brief: ${state.lastBrief ? state.lastBrief.slice(0, 800) : "none, this is the first run"}

Use web search (within your cap of ${caps.webSearchesPerRun || 10} searches) to find
REAL, verifiable opportunities aligned with the charter's focus areas. Prefer depth
over breadth: two well-researched prospects beat five thin ones. Verify every
organization actually exists; include only publicly listed contact channels.

Then output ONLY a JSON object (no markdown fence, no prose after it) shaped:
{
 "actions": [
  {"type":"add_prospect","prospect":{"id":"kebab-slug","name":"","orgType":"","city":"",
    "focusArea":"one of the charter focus areas","why":"2-3 sentences, specific and factual",
    "contactChannel":"public URL or listed email","score":1-10,
    "draftEmail":{"subject":"","body":"Respectful, concrete, signed 'Freedom, Inc. digital operations, on behalf of the Freedom, Inc. team'. Never sign as a person."},
    "status":"drafted"}},
  {"type":"add_news","item":{"date":"${today}","tag":"News","title":"","body":"Only verified public facts about Freedom, Inc.'s world; never invent outcomes."}},
  {"type":"add_event_draft","event":{"id":"","title":"","date":"YYYY-MM-DD","time":"","location":"","category":"","body":"","rsvp":true,"sponsor":false}}
 ],
 "brief": "The weekly operations brief in plain language: what you looked at, what you added and why, what needs a human decision this week, and what you plan next run. Address the team directly. No em dashes."
}
Respect the caps: max ${caps.newProspectsPerRun || 5} add_prospect, max ${caps.newsItemsPerRun || 2} add_news, max ${caps.eventDraftsPerRun || 3} add_event_draft. Empty actions array is acceptable when nothing genuinely qualifies; a quiet week is better than a padded one.`;

(async () => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: caps.webSearchesPerRun || 10 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) { console.error("API error:", data.error.message); process.exit(1); }
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) { console.error("No JSON in response"); process.exit(1); }
  let plan;
  try { plan = JSON.parse(text.slice(start, end + 1)); }
  catch (e) { console.error("Plan parse failed:", e.message); process.exit(1); }

  const applied = [];
  let nP = 0, nN = 0, nE = 0;
  for (const a of plan.actions || []) {
    if (a.type === "add_prospect" && a.prospect && a.prospect.name && a.prospect.draftEmail) {
      if (++nP > (caps.newProspectsPerRun || 5)) continue;
      const id = String(a.prospect.id || a.prospect.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (prospects.prospects.some(p => p.id === id) || state.seen.includes(id)) continue;
      prospects.prospects.unshift({ ...a.prospect, id, status: "drafted", addedAt: today, run: state.runs + 1 });
      state.seen.push(id);
      applied.push("prospect: " + a.prospect.name);
    } else if (a.type === "add_news" && a.item && a.item.title) {
      if (++nN > (caps.newsItemsPerRun || 2)) continue;
      news.items.unshift({ date: today, tag: "News", ...a.item });
      applied.push("news: " + a.item.title);
    } else if (a.type === "add_event_draft" && a.event && a.event.title && a.event.date) {
      if (++nE > (caps.eventDraftsPerRun || 3)) continue;
      drafts.drafts.unshift({ ...a.event, draftedAt: today, status: "draft" });
      applied.push("event draft: " + a.event.title);
    }
  }

  const brief = String(plan.brief || "No brief produced.").slice(0, 8000);
  const briefFile = `data/mccluster/briefs/${today}.md`;
  fs.writeFileSync(briefFile, `# McCluster OS brief, ${today} (run #${state.runs + 1})\n\n${brief}\n\n## Applied this run\n${applied.map(x => "- " + x).join("\n") || "- nothing (quiet week)"}\n`);
  const idx = read("data/mccluster/briefs/index.json", { briefs: [] });
  idx.briefs.unshift({ date: today, file: `${today}.md`, run: state.runs + 1 });
  fs.writeFileSync("data/mccluster/briefs/index.json", JSON.stringify(idx, null, 1));

  state.runs += 1;
  state.lastRun = new Date().toISOString();
  state.lastBrief = brief;
  fs.writeFileSync("data/mccluster/state.json", JSON.stringify(state, null, 1));
  fs.writeFileSync("data/mccluster/prospects.json", JSON.stringify(prospects, null, 1));
  fs.writeFileSync("data/mccluster/event-drafts.json", JSON.stringify(drafts, null, 1));
  fs.writeFileSync("data/news.json", JSON.stringify(news, null, 1));
  console.log(`Run #${state.runs} complete. Applied: ${applied.length ? applied.join(" | ") : "nothing"}`);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
