# Church OS: the Shiloh flagship, and the appliance after it

The plan for turning a church building into the machine that runs the church,
and then turning that machine into a product other churches can install. Shiloh
Baptist Church is the front runner. Everything here is built to be powerful and
to be trusted, because a tool churches do not trust never gets installed twice.

This is not a new project. It is the Faith CDC / FREEDOM app you are already
running, plus a local brain in the building, plus the back-office modules a
church actually runs on. The member profiles, applications, RSVPs, event
tracking, admin review, and the McCluster concierge already exist. Church OS is
that, grown up.

---

## The one line

One box in the church building, owned by the church, that keeps the records,
runs the back office, and assists the pastor. The data never leaves the
building.

That last sentence is the whole pitch. Say it first, every time.

---

## The hardware

### Flagship box (Shiloh)

Start on **Tier 0** and prove the pipeline before spending real money:

- **NVIDIA DGX Spark (GB10, ~128GB unified memory), ~$3-4k.** Runs a 70B-class
  model plus several small helpers at once. Sits in an office, sips power, no
  data-center noise. This is enough to run the entire Shiloh operation and to
  demonstrate the product.

When Shiloh outgrows it, or when you want one box that owns a true frontier
model:

- **Mac Studio M3 Ultra, 512GB unified memory, ~$9-10k.** Holds a big
  mixture-of-experts model (DeepSeek, Kimi K2, or a large Qwen3 MoE) at 4-bit
  plus every helper model at once. ~200W, silent, desk-sized. This is the
  single most sensible "own the frontier model in one quiet box" machine right
  now.

### The install-kit box (other churches)

The repeatable appliance is almost certainly the **DGX Spark** or its successor:
one standard box, one setup process, one support relationship. A small church
does not need the 512GB Mac. Size the box to the congregation.

### What every install also needs

- A UPS (battery) so a power blip never corrupts the database.
- A second drive or a small NAS for **encrypted local backups**. A church that
  loses its member and giving records is a catastrophe. Backups are not
  optional.
- A **Cloudflare Tunnel** or **Tailscale** connection so the church website can
  reach the box without exposing the building's network or needing a static IP.

---

## The two tiers: your fleet and their box

There are two different machines in this business and they are easy to confuse.
Keeping them separate is what makes the whole thing work.

### Tier A: the central fleet (yours)

This is your infrastructure, in one place, that you run and manage. A rack of
older enterprise servers is a genuinely good fit here. A fleet of twenty Dell
PowerEdge R610s, for example, gives you roughly 240 CPU cores and one to four
terabytes of aggregate RAM: plenty for everything a datacenter does, as long as
you do not ask it to be the frontier-model brain.

What the fleet runs:

- **The management plane** for every church install: provisioning, updates,
  monitoring, health checks, license and support tracking.
- **The encrypted off-site backups** for all of them. Each church's box holds
  its own data locally; the fleet holds the encrypted backup so a stolen or
  dead box never means a lost congregation.
- **The hosted option.** Not every church will want or afford its own box. A
  church too small for hardware can run as a tenant on your fleet instead, same
  software, their data isolated.
- **Dev, staging, and the website hosting** for faithandresults.com and the
  church sites.
- **The small models on CPU:** routing, classification, embeddings for search,
  and Whisper transcription. These tolerate CPU and DDR3 fine. See the honest
  limits below.

What the fleet is NOT: it is not where a big frontier model runs. Old Xeons on
DDR3 have low memory bandwidth (~32 GB/s per socket versus ~800 GB/s on a Mac
M3 Ultra), no GPUs, and the boxes are joined only by ethernet. Sharding one
giant model across many nodes needs an interconnect like NVLink; over ethernet
the token-by-token network round-trips make it unusably slow. Aggregate RAM
across nodes does not equal usable capacity for a single large model. For the
heavy reasoning model, add **one modern inference node** (a DGX Spark, or a Mac
Studio 512GB for a true frontier model) and let the fleet be everything around
it. The router sends cheap requests to the small models on the fleet and the
hard ones to that node.

Reality checks on a fleet like this: twenty R610s draw roughly 3 to 5
kilowatts, which is dedicated circuits, real cooling, loud 1U fans, and a power
bill around $500 to $1000 a month. And the hardware is fifteen years old and
out of warranty, so plan for drive and PSU failures and keep spares. It is
excellent value for compute you already own; it is not free to run.

### Tier B: the per-church appliance (theirs)

One small modern box that lives in the church building, sized to the
congregation. This is the product. You never ship a rack to a church. The
appliance holds that church's data locally, runs its back office, and phones
home to your fleet only for backups and updates over the encrypted tunnel.

The rule of thumb: **their data lives on their box; your fleet holds the
encrypted copy and runs the business.** A church's records never sit unencrypted
on your infrastructure, which keeps the "your data never leaves the building"
promise true even though you hold the backups.

---

## The software stack

Bottom to top:

1. **Inference server.** vLLM or SGLang on the NVIDIA boxes; llama.cpp or MLX on
   the Mac. Serves the models over an OpenAI-compatible API.
2. **The gateway and router.** A proxy (LiteLLM or a small custom router) that
   presents ONE endpoint to everything above it and decides which model handles
   each request. This is how the models switch off for different jobs. Routing
   rules live here, so you change behavior without touching the app or the
   sites.
3. **The database.** PostgreSQL, on the box, encrypted at rest. The single
   source of truth for members, giving, events, and care.
4. **The RAG index.** An embedding model keeps every church record and document
   searchable, so the AI answers from the actual data instead of guessing.
5. **The app layer.** The Faith CDC / FREEDOM app, extended with the church
   modules below. Same design system, same voice.
6. **The websites.** faithandresults.com and any church's own site call the
   gateway exactly like they would call any AI API. The concierge is already
   structured for this: it falls back to a browser model today, and pointing it
   at the box is a small change, with the browser model staying as the
   automatic fallback when the box is offline.

---

## The model roster (how they switch off)

The router reads each request and dispatches it:

| Job | Model | Why |
|---|---|---|
| Routing, quick Q&A, form-fill, classification | Small fast model (Qwen3-8B class) | Instant, always loaded, handles the high-volume easy stuff |
| Reasoning, drafting, analysis | Large MoE (DeepSeek R1 / Kimi K2) | The hard jobs: newsletters, giving-trend analysis, meeting summaries |
| Documents, scans, photos, paper forms | Vision model (Qwen-VL) | The older members still hand in paper |
| Search over church records | Embedding model (bge / nomic) | Always on, powers RAG so answers cite real data |
| Sermon and meeting transcription | Whisper | Turns audio into searchable text |

On the 128GB Spark you keep the small models hot and swap the big one in as
needed. On the 512GB Mac you hold everything at once. The app never knows or
cares which model answered; it talks to the gateway.

---

## The modules

What a church runs on. Bold means it already exists in the repo in some form.

- **Member directory and CRM** (extend the existing profile system)
- **Attendance and engagement**
- **Giving and finance**
- **Communications, email and text** (the admin blast tools already exist)
- **Pastoral care** (the most sensitive module; see below)
- **Events and calendar** (already built, never-stale)
- **Sermon and media**
- **Volunteer scheduling**

The AI layer sits across all of them: ask questions in plain language, draft
communications, summarize, and surface things a busy pastor would miss, like
"these twelve families have not been seen in a month," so he can reach out.

---

## The three things that make or break it

These are not brakes. Each is what kills a product like this, and each has a
clean answer. Build it this way from day one.

### 1. Member data is the most sensitive thing a church holds

Attendance, giving, and above all pastoral-care notes. The architecture answers
this before it is a problem:

- **Local-first.** The data lives on the church's box, in the church's building.
  It never leaves. This is the trust story and it is literally true.
- **Consent-first.** Members know what is collected and why. Framing is *caring
  for people*, not *watching them*.
- **Tiered access.** Pastoral-care notes get the tightest controls, visible only
  to the roles that should see them. Not every staff login sees everything.
- **Encryption at rest**, encrypted backups, and physical security of the box.

Get this right and privacy becomes your biggest asset instead of your biggest
liability.

### 2. The AI never moves money

It can track giving, reconcile, flag anomalies, and draft the treasurer's
report. It cannot move money or approve a transaction. Every financial action
is logged, a human approves it, and segregation of duties is preserved. Churches
get audited and giving records carry tax consequences (donation receipts), so
build for auditability from the first commit. The AI is the best bookkeeper's
assistant alive, not a signer on the account.

### 3. It assists the pastor, it does not replace him

The product gives the pastor his week back so he can do the ministry, and keeps
him and his staff in charge. Everything member-facing or money-facing is
human-in-the-loop. Same capability, better framing, and it is what actually
sells: pastors buy tools that amplify them.

---

## The path

1. **Prove it at Shiloh.** Run the real operation on the box for a season.
   Members, giving, events, communications, care follow-ups, the website.
2. **Capture the case study.** The testimonial from Rev. McCluster and the
   numbers (hours saved, families re-engaged, dollars tracked) are the sales
   asset.
3. **Package the appliance.** Standard box, a setup process, a support
   relationship, a per-church license or support fee. Recurring revenue.
4. **Install into other churches.** Faith CDC's existing network of
   congregations is the warm market. This is where it becomes a business, and
   it sits perfectly inside the FREEDOM / McCluster OS mission.

---

## Rollout phases (engineering)

- **Phase 1: the brain and the pipe.** Stand up the box, the inference server,
  the gateway with routing, and point the existing website concierge at it with
  browser-model fallback. Nothing member-facing yet. Proves the plumbing.
- **Phase 2: the member CRM.** Extend the profile system into a real directory
  with roles and tiered access. This is the foundation every other module sits
  on.
- **Phase 3: giving and finance**, with human-in-the-loop and full audit logging
  from the start.
- **Phase 4: pastoral care and engagement**, the "who have we not seen"
  intelligence, on the tightest access controls.
- **Phase 5: package and replicate.** Turn the Shiloh install into the kit.

Each phase is shippable on its own and earns the next.
