# Karma Cluster

The autonomous operations agent for Freedom, Inc. Its job is continuity: the
operation Rev. Carl McCluster built keeps researching, prospecting, drafting,
and reporting whether or not anyone is watching it that week.

## The architecture, honestly

An API key can never live inside a public website; anyone could open dev tools
and take it. So the brain does not run in the browser. It runs where the
secrets live:

| Part | What it is |
| --- | --- |
| **Brain** | Claude (Fable 5) called by `agent/karma.js` |
| **Heartbeat** | GitHub Actions, every Monday 12:00 UTC + on demand (`karma-cluster.yml`) |
| **Body** | This repo. The agent acts only by writing whitelisted data files |
| **Memory** | `data/karma/` (state, pipeline, briefs) plus the site's data files |
| **Senses** | Web search (capped per run) and the repo's own records |
| **Cockpit** | Admin → Karma: pipeline, briefs, and every approval |

## The autonomy line

The charter (`data/karma/charter.json`) is its constitution. On its own it may
research, score prospects, draft outreach, draft events, post verified news,
and write its weekly brief. It may never send anything to anyone, publish an
event as confirmed, sign anything, spend anything, or touch code. That is
structural, not a promise: the workflow has no email capability at all, and
the script writes only to `data/karma/` and `data/news.json`.

Outreach flow: the agent drafts → the pipeline shows it in **Admin → Karma**
with the rationale and score → a human taps **Approve and send** (a pre-filled
email) → done. The machine does the thinking; the send stays human. That
one-tap gate is what protects the organization's name, which is the asset
everything else depends on.

The drafts are signed "Freedom, Inc. digital operations, on behalf of the
Freedom, Inc. team". The agent never writes as Rev. McCluster or any person.

## Switching it on

1. Add the `ANTHROPIC_API_KEY` repo secret (Settings → Secrets and variables →
   Actions). The same key powers the corridor research agent.
2. That's it. It runs Mondays. To run now: Actions → "Karma Cluster" →
   Run workflow.

Each run commits its work to `main`, which redeploys the site, so the brief
and pipeline appear in Admin minutes after a run.

## Tuning it

- **Behavior**: edit the charter's `focus`, `caps`, or `mission` and commit.
- **Cadence**: edit the cron in `karma-cluster.yml` (weekly is a good floor;
  daily is fine, just multiply the cost).
- **Model**: set the `KARMA_MODEL` env in the workflow to pin a model.

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
