# Infrastructure Decisions
### Where it runs, how it gets backed up, and what happens when it falls over

Research-backed decisions for hosting the Church OS platform and client sites.
Companion to docs/AGENCY-STACK.md (the stack and the business model).

Three decisions, settled:

1. **Rent, don't rack.** The owned R610 fleet loses on economics before it ever
   loses on policy.
2. **Back up at Tier 2** — continuous write-ahead-log archiving to object
   storage. About $10/month for everything, one-minute RPO.
3. **Make the urgent alert independent of all of it.** Don't buy high
   availability for the foreclosure path; buy independence.

---

## 1. The hosting decision

### The dorm option is closed

It fails on physics before it fails on policy, and the physics cannot be
waived:

| Constraint | Reality |
|---|---|
| Power | 15 R610s draw ~2.25 kW idle, ~4.1 kW typical, ~5.25 kW peak. A dorm circuit budget is 1.4–1.9 kW. That is 34A typical against a 15–20A circuit |
| Heat | 14,000–18,000 BTU/hr into a room designed to shed roughly 2,000–2,700 |
| Noise | ~70 dBA, continuous, where someone sleeps |
| Network | Residence networks NAT everything and filter inbound 80/443 — the two ports required. No path to change it |
| Policy | Campus AUPs ban servers outright *and* separately ban hosting "for other people or groups." Nonprofit status does not exempt commercial-style hosting |
| Tenure | Housing contracts end. A client platform would have a scheduled hard outage every May |

Fifteen MAC addresses on one residential jack is also the loudest possible
signal to a network access control platform. The realistic downside is a
quarantined port and a housing conduct charge, with client sites hanging off
that same connection.

### The fleet loses on economics anyway

This is the finding that actually settles it, independent of siting:

- 15 R610s burn roughly **36,000 kWh/year** — about **$6,500 in power plus
  $2,200 in cooling**, call it **$9,000/year**
- That delivers **less compute than a single rented dedicated server at about
  €42/month**
- Colocating the fleet honestly runs **$15,000–36,000/year**, mostly power,
  because at 2009-era performance-per-watt *power is the bill*

The hardware is not free. It is a $9,000/year subscription on a platform that
went end-of-support in 2016 with no firmware path.

**Colo reference pricing**, if the question comes up again: quarter cabinet
(~10U) $250–450/mo; half cabinet (~20U) $400–1,000/mo; full cabinet (42U)
$900–2,500/mo at 3–5 kW. Most facilities quote individual-case-basis rather
than publishing rates.

### The decision

**Rent for anything a client depends on.** Three to six instances, managed
Postgres, object storage, and a transactional mail provider lands at
**$80–400/month** — $1,000–5,000/year against $9,000/year in electricity
alone. You also get routable IPs, symmetric uplink, snapshots, and an SLA you
can pass through to the nonprofits, which matters because you are accountable
to them and a dorm room cannot make you accountable.

**Keep two or three R610s as a lab.** That is ~450W, fits a normal circuit, and
running real enterprise hardware is genuinely the best way to learn clustering,
storage, and networking. Just do not put a client on it.

---

## 2. Backup

**Build Tier 2 now.** Tier 1 alone is not defensible for giving records with
tax implications — a 24-hour recovery point means a bad night loses a day of
gifts that donors will claim on their returns.

| Tier | What it is | RPO | RTO | Cost/mo |
|---|---|---|---|---|
| 0 | Whole-VM snapshots | ~24h, crash-consistent only | 30–90 min | $0–7 |
| **2** | **WAL archiving + PITR** | **~1 min** | **1–2 hrs** | **$8–20** |
| 3 | Cloud streaming replica | seconds | 5–15 min | +$12–25 per cluster |

### The build

- **pgBackRest** to a Backblaze B2 bucket, AES-256 client-side encryption,
  weekly full plus nightly block-level incremental, `archive_mode=on`,
  `archive_timeout=60`, `archive-async=y`. Multi-repo so it writes to a local
  repo (fast restores) *and* B2 (site loss).
- **restic** to a separate bucket for uploads, compose files, environment
  material, TLS certs, and the n8n encryption key. Object Lock at 14 days.
- **Nightly `pg_dump` per tenant** into the restic repo. Cheap, and it buys the
  per-tenant and cross-version restore path that pgBackRest structurally cannot
  provide.
- **Dead-man's-switch monitoring** on every job, weekly automated
  restore-to-scratch with row-count assertions, quarterly timed drill on a
  clean host.

**Cost, whole fleet, ~1TB:** Backblaze B2 at $6.95/TB, API calls free since May
2026, and 3TB/month of free egress that covers restore drills. **Call it
$10/month.**

### Two things people get wrong

**A replica is not a backup.** It will replicate your `DROP TABLE` in
milliseconds. Backups run underneath every failover option.

**WAL archiving is per-cluster, not per-database.** You cannot point-in-time
restore one tenant without restoring the whole cluster to a scratch instance
and dumping that tenant out. If you intend to promise per-tenant restores, run
one Postgres cluster per tenant.

---

## 3. Failover

Three different products, routinely conflated:

| | Question it answers | Cost/mo | Time to service |
|---|---|---|---|
| **Backup** | Can I get the data back? | ~$10 | Hours to a day |
| **Warm standby** | How fast can a *person* restore service? | ~$25 | 15–30 min |
| **High availability** | Can we survive with *nobody awake*? | $100+ and 20–60 hrs to build | Seconds |

**For a single-site self-hosted stack the likeliest outage is not "Postgres
crashed," it is "the power or the internet went out."** Money spent on
in-building HA buys almost nothing. Money spent on a second *site* buys almost
everything.

### The architecture: two tiers, not one

**The urgent intake path gets independence, not HA.** Route the foreclosure
form to an always-up edge endpoint — a Cloudflare Worker on the free plan, or a
small separate VPS — that assigns a reference, persists the submission somewhere
that is *not* your Postgres, and fires the SMS to the counselor. It syncs into
the platform when the platform is up.

That flow then survives your database being down, your host being down, your
whole site being down. This is the correct answer for the one flow where a
missed alert has a real human cost, and it is cheaper than any HA setup.

**Everything else gets warm standby, if a client's contract justifies it.** A
Hetzner CX33 at about €8.49/month running a streaming replica over WireGuard,
promoted manually in 5–15 minutes. At this scale a rehearsed manual promotion
is safer than an automatic failover nobody has ever tested.

### Split brain — read this twice

Two nodes both believing they are primary, both accepting writes, on diverged
timelines. **There is no merge operation and no tool that reconciles two
diverged Postgres timelines.** You pick a survivor and discard the other side's
committed transactions.

In an automation stack it is worse than data loss, because n8n does not just
store rows — it takes actions in the world. Split brain means duplicate SMS to
counselors and duplicate emails to families in crisis.

This is the specific reason not to reach for automatic failover here. Manual
promotion with a human confirming the primary is dead cannot split-brain.

---

## 4. What this costs, all in

| Line | Monthly |
|---|---|
| Rented compute, 3–6 instances | $80–400 |
| Backup (B2, ~1TB, Tier 2) | ~$10 |
| Edge endpoint for urgent intake | $0 (Cloudflare free tier) |
| Warm standby, per client who needs it | +$12–25 |
| **Baseline before per-client extras** | **~$90–410** |

Against $9,000/year in electricity for a fleet that would deliver less. The
rented path is cheaper, faster, more reliable, and comes with an SLA you can
pass through to the churches.
