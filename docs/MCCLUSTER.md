# McCluster OS

The operating system of the operation, named for the man who built it. Version 1, codename "Shiloh". Its job is continuity: the
operation Rev. Carl McCluster built keeps researching, prospecting, drafting,
and reporting whether or not anyone is watching it that week.

## The architecture, honestly

An API key can never live inside a public website; anyone could open dev tools
and take it. So the brain does not run in the browser. It runs where the
secrets live:

| Part | What it is |
| --- | --- |
| **Brain** | Claude (Fable 5) called by `agent/mccluster.js` |
| **Heartbeat** | GitHub Actions, every Monday 12:00 UTC + on demand (`mccluster.yml`) |
| **Body** | This repo. The agent acts only by writing whitelisted data files |
| **Memory** | `data/mccluster/` (state, pipeline, briefs) plus the site's data files |
| **Senses** | Web search (capped per run) and the repo's own records |
| **Cockpit** | Admin → McCluster: pipeline, briefs, and every approval |

## The autonomy line

The charter (`data/mccluster/charter.json`) is its constitution. On its own it may
research, score prospects, draft outreach, draft events, post verified news,
and write its weekly brief. It may never send anything to anyone, publish an
event as confirmed, sign anything, spend anything, or touch code. That is
structural, not a promise: the workflow has no email capability at all, and
the script writes only to `data/mccluster/` and `data/news.json`.

Outreach flow: the agent drafts → the pipeline shows it in **Admin → McCluster**
with the rationale and score → a human taps **Approve and send** (a pre-filled
email) → done. The machine does the thinking; the send stays human. That
one-tap gate is what protects the organization's name, which is the asset
everything else depends on.

The drafts are signed "Freedom, Inc. digital operations, on behalf of the
Freedom, Inc. team". The agent never writes as Rev. McCluster or any person.

## The agent roster

McCluster OS is a platform, not one agent. Each resident runs on the cheapest
brain that does its job well:

| Agent | Brain | Cost | Job |
| --- | --- | --- | --- |
| The operations engine (`agent/mccluster.js`) | Fable 5 | ~$1/run, weekly | Research, prospecting, drafting, the brief |
| The corridor researcher (`corridor-research.yml`) | Claude + web search | ~$0.10-0.50/dossier | Per-city MLK corridor dossiers |
| Ask McCluster, the site concierge (`js/concierge.js`) | Retrieval over repo data | $0, always | Answers visitors from the site's own records, instantly, offline |
| Ask McCluster smart mode | Qwen 2.5 1.5B in the visitor's browser (WebGPU) | $0, always | Conversational answers with repo data as grounding, plus general knowledge; runs entirely on the visitor's device |

The concierge is grounded by construction: organization facts come from the
same data files that render the site, so it cannot drift from the record.
Smart mode downloads once (~1GB) to the visitor's device and never touches a
server. New agents slot in the same way: pick the job, pick the cheapest brain
that clears it, keep sends and commitments human-gated.

## Switching it on

1. Add the `ANTHROPIC_API_KEY` repo secret (Settings → Secrets and variables →
   Actions). The same key powers the corridor research agent.
2. That's it. It runs Mondays. To run now: Actions → "McCluster OS" →
   Run workflow.

Each run commits its work to `main`, which redeploys the site, so the brief
and pipeline appear in Admin minutes after a run.

## Tuning it

- **Behavior**: edit the charter's `focus`, `caps`, or `mission` and commit.
- **Cadence**: edit the cron in `mccluster.yml` (weekly is a good floor;
  daily is fine, just multiply the cost).
- **Model**: set the `MCCLUSTER_MODEL` env in the workflow to pin a model.

## Cost

One run: a Fable 5 call plus up to 10 web searches, roughly $0.50 to $2.
Weekly, that is under $10 a month. Daily, under $60.

## What immortality means here

Intake, tracking, statuses, events, news freshness, research, prospecting,
drafting, and reporting run without anyone. The judgment moments (send /
publish / commit / spend) arrive as one-tap decisions with the reasoning
attached, so whoever holds the phone that week can be anyone the family
trusts. The operation no longer depends on any one person's attention,
including its founder's.
