# The WordPress Build
### Architecture, stack, data model, agent wiring, and the cutover runbook

The technical companion to **docs/ADMIN-INTERVIEW.md**. That document
interviews the organization. This one specifies what gets built once the
answers are in.

Everything transfers to WordPress. This is how.

---

## 0. Verify before you build

The research behind this document could not reach primary vendor sources (the
sandbox proxy blocked wordpress.com, developer.wordpress.org, and every hosting
vendor domain). Facts corroborated across multiple independent sources are
solid; the items below are single-source or version-sensitive and must be
proven on the actual target site before the architecture depends on them:

1. **Current plan pricing and tier boundaries.** Open wordpress.com/pricing
   and the Business plan feature page. Plan names have already churned once
   (Business was briefly branded "Creator").
2. **The blocked-plugin list** at wordpress.com/support/plugins/incompatible-plugins/,
   checked against the exact stack below. Managed hosts publish equivalent
   lists. Discovering a block after purchase is expensive.
3. **Application Passwords against wp-json on a WordPress.com site.** Forum
   reports suggest this is inconsistent on .com. If Basic auth with an
   application password fails, the agent path becomes OAuth2 through
   public-api.wordpress.com, which is materially more integration work.
4. **Server cron.** On Business, Settings → Cron. Confirm the accepted command
   syntax and prove a job fires on time without traffic.
5. **Outbound HTTP** from the site to an endpoint you control. If filtered, the
   architecture flips from push to pull.
6. **Whether plugin ZIP upload is available** on the tier in question, since
   custom code ships as a ZIP.

---

## 1. Platform decision

Four candidates, materially different:

| Variant | What it is | Rough cost | The catch |
|---|---|---|---|
| **WordPress.com Business** | Automattic-hosted, with SFTP, SSH, WP-CLI, phpMyAdmin, staging, **server cron**, GitHub deploys | ~$25/mo annual | Automattic is root. No multisite, no php.ini edits, a blocked-plugin list |
| WordPress.com Personal/Premium | Lower tiers; plugin *directory* installs reportedly opened in 2026 | ~$4–9/mo | **No SFTP, SSH, database, staging, cron, or backups.** Not viable for operations |
| Self-hosted on managed (WP Engine, Kinsta, Pressable) | Full code and database control on a managed container | ~$25–35/mo | Host's own disallowed-plugin list; you own updates |
| Self-hosted on shared (SiteGround, Bluehost) | Full freedom, cPanel, real crontab | ~$3/mo promo, ~$18+ renewal | CPU and process caps throttle an always-on ops workload; renewal shock |

**Recommendation: WordPress.com Business, or managed self-hosted.** The
deciding capability is **real server cron**, because the entire notification
architecture depends on jobs that fire on a clock. Business has it. Personal
and Premium do not, at any price.

**The identification trap.** Plugin visibility no longer proves Business tier.
Confirm by the presence of SFTP/SSH credentials and a Cron tab under Settings →
Hosting Configuration. Nothing else is reliable.

### The cron problem, stated plainly

WP-Cron is not cron. It has no clock and no daemon: WordPress checks for due
jobs on incoming page requests. On a low-traffic operations site a 9:00 job may
fire hours late or never. On a fully page-cached site it may never fire at all.
**Failures are silent** — no error, no log, no alert.

- **WordPress.com Business:** use the dashboard Cron feature, running a WP-CLI
  command on a real schedule. CLI execution also escapes web-request timeouts.
- **Self-hosted:** set `DISABLE_WP_CRON` **only after** a real crontab entry is
  configured and verified. Setting it first silently stops every scheduled job
  in the system.

Never build the foreclosure alert on unmodified WP-Cron.

---

## 2. The stack

Chosen so that every component exposes REST and/or webhooks, and the whole
operation is reachable by one agent through one permission model.

| Need | Choice | Cost | Why |
|---|---|---|---|
| Intake forms | **Gravity Forms** (nonprofit license, 3 sites) | ~$129/yr | Conditional logic, multi-page, save-and-continue, file upload, per-form entry permissions, webhooks and Twilio feeds |
| CRM | **FluentCRM Pro** | ~$129/yr | One contact per person, flat pricing regardless of list size, full REST |
| Approval queue + directory | **GravityView** | ~$199/yr | Entry approval workflow and per-view field visibility |
| Events + RSVP | **The Events Calendar + Event Tickets** | free | Retires the download-and-commit publishing ritual entirely |
| Donations | **Charitable** | ~$99/yr | Nonprofit-native, receipts, vendor independence from the CRM |
| Email sending | **FluentSMTP** + Postmark/Resend/SES | ~$60–180/yr | Deliverability is the whole point; SMTP plugin is free |
| SMS | **Twilio** via form feed + webhook | ~$120–200/yr | Two independent alert paths for urgent intake |
| Roles | **Members** | free | Build custom roles from zero capabilities |
| Custom data | **Pods** or ACF Pro | free / ~$49 | Custom post types and fields |
| Audit log | **Simple History** (or WP Activity Log) | free / ~$99 | Who did what, when |
| Security | **Wordfence** or Solid Security | free / ~$99 | WAF, login hardening, 2FA enforcement |
| Backups | **UpdraftPlus** + platform backups | free | Encrypted, off-platform copies |
| Automation | **Uncanny Automator** or self-hosted **n8n** | free–$250/yr | Retries, escalation, branching the platform cannot do |

**Totals:** lean ~$850–1,000/yr; recommended ~$1,450–1,650/yr; fully loaded
~$2,000–2,300/yr. **Payment processing is excluded and dominates everything
else** at ~2.9% + $0.30 per card gift.

**Build the agent layer first, not last.** A small custom plugin
(`freedom-core`) registering the operations an agent may perform, each with its
own permission callback, plus a dedicated `ai_agent` WordPress user whose role
can read intakes and write drafts and notes, and **cannot** approve, publish,
read care notes, manage users, or export donors.

---

## 3. The data model

**Four object kinds, one rule each.**

1. **A form entry is a receipt, never a record.** It is immutable proof of what
   someone typed and when, retained per policy. Nothing in the operation ever
   reads an entry to answer a question. Its ID is stamped on the object it
   created.
2. **A custom post type is the operational object** — the thing with a
   lifecycle, a stage, an owner, and a history. `fr_case` (all six intakes in
   one queue, differentiated by taxonomy), `fr_person`, `fr_household`,
   `fr_org` (employers, congregations, sponsors, funders — one row, many roles),
   `fr_referral`, `fr_rsvp`, `fr_sponsorship`, `fr_cohort`, `fr_document`,
   `fr_approval`, `fr_agent_run`. Events use The Events Calendar's type; news
   and pages stay core. CPTs win over custom tables because they bring the
   admin UI, capabilities, revisions, search, and REST for free.
3. **A CRM contact is the communications projection of a person** — lists,
   tags, consent state, campaign history. Not the source of truth for identity,
   and it holds no case detail. Linked one-to-one with `fr_person`.
4. **A WP user is a login, nothing more.** Staff and the agent have one;
   applicants, donors, RSVPs, and subscribers do not.

**How one person stays one record.** Every inbound channel — six intake forms,
RSVP, newsletter, the Connect doors, donation checkout, and staff-entered phone
and paper intakes — passes through a single identity resolver before anything
else happens. It normalizes email to lowercase and phone to E.164 and matches
on either. Name-plus-city similarity **never** auto-matches; it files a merge
proposal for a human to confirm side by side.

**Custom tables need a primary key** or platform backups may silently skip
them. Modeling operations data as CPTs avoids the question entirely.

---

## 4. The admin experience

**Design goal, stated plainly: the pastor never sees WordPress.**

wp-admin out of the box is a publishing tool. This organization needs a
decision surface. Close the gap with one custom menu and aggressive
subtraction.

**One landing page: Freedom → Today.** Set as the login redirect for every role
except the webmaster, so the default dashboard is never seen. Three bands, in
this order, nothing else:

1. **URGENT — act now** (red). Foreclosure alerts, anything past its SLA,
   sponsor RSVPs, press inquiries. One card each, claim button first.
2. **NEEDS YOUR YES.** Approval cards. Never more than three buttons, always
   the same three words: **Approve and send** / **Edit, then send** / **Not
   yet**. Each card shows the exact text that will go out, who it goes to, and
   one line of why.
3. **THIS WEEK.** New intakes, RSVPs, gifts, stale pipeline, dossiers landed.
   Counts that click through, not tables.

**Subtract everything else.** Hide Posts, Media, Comments, Appearance, Plugins,
Users, Tools, Settings, and every plugin's own menu from all roles except a
single webmaster role. Do it in versioned code, not just a UI plugin, so it
survives a plugin lapse. Strip the welcome panel, dashboard widgets, screen
options, and the help tab.

**Pane-by-pane migration from the current admin panel:**

| Today | On WordPress |
|---|---|
| Dashboard tiles | Dashboard widget + a daily cron that **emails** the digest |
| Applications list | Entries screen or `fr_case` list table with custom columns |
| Approve/decline + note | Meta box that fires the applicant's decision email |
| Pipeline stages | A `stage` taxonomy per intake, with the 7-day aging rule as a cron nag |
| Forward to partner | Same one-tap button, tracked send instead of mailto |
| Events + RSVP rosters | The Events Calendar + Event Tickets. **The download-and-commit ritual disappears** |
| Email-all / Text-all | CRM segments and Twilio, with real opt-out handling |
| McCluster pane | `fr_agent_run` and draft queues, native |
| Automations pane | Plugin settings + the automation layer |

**Retire admin.html.** Its gate is a client-side passcode in a public file that
the docs themselves label "not security," it has no roles and no audit trail,
and it reviews foreclosure data. WordPress supplies hardened login,
capabilities, and an audit log the day you install it, closing two of the
thirteen confirmed build gaps with no code.

---

## 5. The role model

Build **custom roles from zero capabilities**. Do not clone Editor or Author —
both carry capabilities that leak content site-wide. Delete or disable the
stock Author, Contributor, and Editor roles so nobody is assigned one by
accident.

| Tier | Role | Sees |
|---|---|---|
| 1 | `congregant` | Only their own profile, application status, RSVPs. `read` only |
| 2 | `volunteer_coordinator` | Rosters for their assigned events; name and email only |
| 3 | `intake_clerk` | That an inquiry arrived, plus contact, to route it. No financial fields |
| 4 | `housing_counselor` | Full case detail for **their assigned** clients only |
| 5 | `program_lead` | Their pillar's cases and partners |
| 6 | `treasurer` | Giving and finance; no care notes |
| 7 | `fr_webmaster` | Everything, including plugins and exports |

**The constraint that breaks naive designs:** form plugins have per-*form*
entry permissions but **no per-field permissions**. You cannot show a clerk the
name and hide the sale date on the same form. Sensitive fields must live on a
separate form the clerk has no capability for, or not in WordPress at all. This
is the most common way church WordPress role tiering silently fails.

**And the boundary that governs all of it:** these tiers control what the
dashboard renders, not what the database contains. Tier 7 — and anyone who can
install a plugin, export, or reach a backup — reads everything regardless.
Design data placement accordingly.

---

## 6. Sensitive data placement

The full reasoning is in ADMIN-INTERVIEW.md Part 6. The engineering
consequences:

**Pastoral care notes: not in cloud WordPress.** Not in a CPT, not behind a
restricted role, not "temporarily." Defer the module until the on-premises box
exists with encryption at rest and real row-level security. If something better
than paper is needed sooner, use a single-purpose encrypted tool the church
holds the key to.

**Foreclosure detail: split the record.** WordPress collects the intake ticket
only — name, phone, email, best time to call, consent, and one non-detailed
urgency flag. No sale date, no dollar amounts, no lender, no account numbers.
Configure the form to alert the counselor and **not retain** the detail.
WordPress is the doorbell; the counselor's confidential case system is the
filing cabinet. Note that HUD housing-counseling rules require electronic
client files be kept confidential.

**Controls for everything else:** enforce 2FA on every staff account,
least-privilege plugin choices, a WAF, staged updates, encrypted off-platform
backups, retention and deletion policy, consent capture on every channel, and
TCPA-compliant SMS opt-in with working opt-out.

---

## 7. The agents

**They stay on GitHub Actions.** Only their write path changes.

The reasoning is already correct in the existing architecture docs: the API key
cannot live in the browser, so the brain runs where the secrets live. Moving
them into WordPress would put an API key in the options table of a hosted
platform, run long web-search calls against PHP execution limits, and depend on
traffic-triggered cron. Actions gives a real scheduler, real secret storage,
and real logs.

**What changes:** instead of writing JSON files and committing them, the agents
read via `GET /wp-json/wp/v2/...` and write via authenticated POST.

**The write path:**
- Create a dedicated user `mccluster-os`, display name "Freedom, Inc. digital
  operations" — matching the charter rule that it never signs as a person.
- Give it a **custom role**, not Editor or Author: edit capabilities on the
  agent-writable types, with **publish capabilities removed**, so every create
  lands as draft or pending.
- Authenticate with an Application Password over HTTPS.
- Create with `{"status":"draft"}` and a stable slug so re-runs update rather
  than duplicate.

**This is the significant upgrade:** the charter's honor-system rule *"the
agent may not publish an event as confirmed"* becomes a capability the agent
does not possess. Structurally enforced beats promised.

**Adding a second provider.** A Gemini agent joins as another Actions workflow
writing into the same draft queue through the same permission model. The
administrator never needs to know which brain drafted what. Both fail into the
same queue, so a provider outage degrades throughput, not correctness.

---

## 8. What happens to the current app

**Installability survives. Whole-app offline does not.**

A PWA plugin restores the manifest, icons, standalone display, and the
add-to-home-screen prompt on both platforms. A visitor cannot tell the
difference at install time.

**What is lost, concretely:**
- Today the service worker precaches the entire catalog, so all 16 programs, 6
  intakes, 11 events, and 19 city stories are browsable with no signal. A
  conventional WordPress site can cache only pages already visited, plus an
  offline fallback. A first-time offline visitor gets nothing.
- Instant screen transitions become server round-trips.
- Offline form submission stops working unless a background-sync queue is
  built.
- **The hash deep links** (`#/training/foreclosure-help`, `#/city/bridgeport-ct`)
  that the README calls out as textable to partners will silently land people on
  the homepage — hash fragments never reach the server, so they cannot be
  redirected server-side. **Ship a small client-side shim** that reads the hash
  on the homepage and forwards to the right page. Without it, every link ever
  texted to a partner breaks.
- The Play Store package needs the assets file served at the apex domain and a
  real signing fingerprint (currently a placeholder). Confirm the host will
  serve that path before promising a store listing.

---

## 9. Cutover runbook

**Phase 0 — Discovery.** Answer Domain 1 in writing before touching anything:
registrar, DNS, current host, old WordPress credentials, where the mailbox
lives, and current MX/SPF/DKIM/DMARC.

**Phase 1 — Backups.** Three independent copies of the live old site before
anything else: a content export, a full files-and-database backup, and a crawl
of the public site. Store off-host, in two places. Confirm the export opens.

**Phase 2 — URL inventory.** Crawl the old site and pull Search Console's top
pages, queries, and linking domains for the last 16 months. Build the redirect
map from it.

**Phase 3 — Prove the platform on a trial.** Before committing money, test the
five things in section 0: plugin availability, authenticated REST write from
outside, scheduled job execution, outbound HTTP, and ZIP upload.

**Phase 4 — Build on a temporary URL** with search engines discouraged and a
gate in front. Set timezone, permalinks (`/%postname%/`), and language before
importing.

**Phase 5 — Import.** Bring in the old WordPress content and media. Preserving
the original upload paths means existing image URLs keep working with no
redirect. Verify a sample of media URLs return 200.

**Phase 6 — Build the theme and `freedom-core` plugin** on staging: the design
tokens and self-hosted fonts, 20px root, 48px minimum tap targets, dark mode;
the CPTs and taxonomies; then import the repo's structured content using
existing IDs as slugs so the import is idempotent.

**Phase 7 — Wire notifications for real.** This is the most urgent item in the
entire project and it is independent of WordPress. Transactional email behind
an SMTP plugin, instant acknowledgment with the reference number on every
submission, internal notification on every intake, and the two-path urgent
foreclosure alert.

**Phase 8 — Email deliverability, before any DNS change.** Establish where
mailbox mail lives. If it rides on the old web host, migrate mailboxes first or
confirm MX is independent. Then add SPF, DKIM, and DMARC at `p=none` with a
reporting address.

**Phase 9 — Freeze and prep.** Stop edits on the old site, take a final export,
and lower DNS TTL to 300 seconds at least 24–48 hours ahead. Pick a window with
no event in it — check the calendar and the conference date.

**Phase 10 — Cut over.** Add the domain to the new host first so TLS
pre-issues, then change A/AAAA and CNAME. **Do not touch MX or the mail TXT
records in the same change.** Confirm both apex and www resolve with a valid
certificate.

**Phase 11 — Go public.** Turn off search-engine discouragement, remove the
gate, set canonical URLs, and make the structured-data and social-image URLs
absolute on the real domain.

**Phase 12 — Redirects and the hash shim.** Deploy the redirect map from Phase
2 and the client-side hash shim from section 8. Monitor 404s daily for two
weeks.

**Phase 13 — Verify and retire.** Test every form end to end, confirm
notifications arrive, confirm the agents can write, then keep the old host
running for a verification period before cancelling. Keep the GitHub Pages
deployment as a staging or archive reference rather than deleting it.

---

## 10. The on-premises endgame

WordPress on the church's own box is the natural end state, and this is the
strongest argument for choosing WordPress over a proprietary site builder:
**there is no format to escape.** It is PHP, MySQL, and a folder of files.

The path:
1. Run the stack in containers on the box, with uploads and database on an
   encrypted volume. (The box is arm64; official images are multi-arch, so this
   is no longer the obstacle it once was.)
2. Migrate with the same tools used to get in: a full-site migration plugin for
   a one-shot move, or CLI export plus file sync for a repeatable one. **Practice
   the restore on the central fleet first**, from a real backup.
3. Expose it with a Cloudflare Tunnel or Tailscale — no open inbound ports, no
   static IP.
4. Automate encrypted backups to the fleet, encrypted client-side so the fleet
   holds ciphertext only. This is what makes "their data lives on their box,
   your fleet holds the encrypted copy" literally true rather than a slogan.
5. Repoint the concierge at the local gateway, keeping the in-browser model as
   the offline fallback.
6. Move the agents from Actions to timers on the box.
7. **Only then** start the member CRM and pastoral care phases, because
   everything after that assumes the box is real.

Keep the integration surface portable — REST, cron, CPTs — so this migration is
a hosting change, not a rewrite.
