# The Agency Stack
### What to build clients on when you host it yourself, and where the money actually comes from

Two questions, answered in order: the revenue model (affiliate, reseller, and
the lines that dwarf both), and the technology stack to standardize on when you
are moving organizations off WordPress and onto infrastructure you own.

This is the agency-side companion to docs/CHURCH-OS.md (the product) and
docs/WORDPRESS-BUILD.md (what a WordPress build would have looked like).

---

## Part 1: Where the money actually is

Start here, because the intuition is usually wrong. Ranked by what a single
church install is actually worth to you per year:

| Rank | Line | Why it matters | Rough scale |
|---|---|---|---|
| 1 | **Managed service retainer** | Recurring, defensible, yours alone | $200–800/mo per org |
| 2 | **Hosting margin** | Marginal cost of one more container is near zero *if you own the metal* — see the assumption note below | ~100% margin owned, ~40–60% rented |
| 3 | **Build fee** | One-time, but funds the next install | $5k–25k |
| 4 | **Payment processing revenue share** | Scales with their donation volume, not their software budget | See below |
| 5 | **Reseller margin** | You bill, you set the price (20–40% typical) | $100–400/yr |
| 6 | **Affiliate commission** | They bill, you get a cut (5–20% typical) | $20–80/yr |

**The point of the table:** an affiliate commission on a $129/yr plugin is
about $25 a year. Fifteen of those is $375 — less than one month of a retainer.
Affiliate income is real but it is a rounding error next to hosting and
support. Build the business on rows 1–3 and treat rows 5–6 as free money that
arrives whether you chase it or not.

> **Assumption to confirm before quoting anyone.** This document was drafted
> against a hypothetical fleet of about twenty older Dell 1U servers. That
> hardware has never been confirmed as owned, powered, and racked. It changes
> the math materially, so settle it first:
>
> - **If the metal is genuinely yours and already running:** row 2 is close to
>   pure margin, and the per-install economics in Part 4 hold.
> - **If it is not yet acquired, or has no home with power and cooling:** price
>   the first several installs on rented infrastructure (a $20–60/mo VPS per
>   client, or one larger box running several) and treat the fleet as a later
>   margin upgrade rather than the foundation. The stack below runs identically
>   either way, which is the point of choosing it.
>
> Twenty 1U servers is roughly 3–5 kW under load: dedicated circuits, real
> cooling, loud fans, and on the order of $500–1,000/month in power alone
> before a single client is billed. Owned hardware is only cheap once those
> costs are actually being paid by someone.

**The one exception is payments.** Stripe's partner ecosystem shares revenue
based on the *payment volume* of businesses you refer, not on a subscription
fee. A church processing $200k a year in online giving is worth more to you
than its entire software stack, every year, forever. That is the single
highest-value program to get into, and it is application-based rather than a
grab-a-link affiliate signup.

### Two rules that keep this clean

**Rule 1: never sell a nonprofit something it can get free.** Verified 501(c)(3)
organizations get Google Workspace free through Google for Nonprofits (verified
via TechSoup, typically 2–14 business days), Microsoft nonprofit licensing, and
Azure credits. If you resell Workspace at a margin to a church that qualifies
for it free, you have taken money from a church, and it will surface eventually.
Use the nonprofit programs to make the client *cheap*, and make your money on
hosting and support. That is also the stronger business, because nobody can
undercut you on a thing you own.

**Rule 2: disclose the commercial relationships.** Standard agency practice.
One line in the proposal — "we earn referral revenue on X and Y, and here is
what we recommend and why" — costs nothing and removes the only thing that
could poison the relationship later.

---

## Part 2: The program list

Three different animals, and they need different setup:

- **Reseller** — you buy wholesale, bill the client, set your own margin, own
  the relationship. Best economics, most admin.
- **Affiliate/referral** — they bill the client, you get a percentage. Easiest,
  smallest.
- **Partner** — application-based, gives you benefits, support, and sometimes
  revenue share. Usually the most valuable of the three despite having no
  "link."

Verify current terms at signup; commission structures churn constantly.

### Infrastructure and domains

| Vendor | Type | Notes |
|---|---|---|
| **Your own fleet** | — | The best margin you will ever have. Everything below is overflow or things you should not self-host |
| Cloudflare (Registrar, DNS, Tunnel) | Partner | Registrar sells domains at cost, so no margin — but it makes *your* costs the lowest available, and Tunnel is how you expose the fleet safely |
| OpenSRS / Tucows, Enom, ResellerClub | **Reseller** | True domain reselling where you set retail price. Use one of these if you want domain margin |
| DigitalOcean, Vultr, Hetzner | Affiliate | Referral credits. Useful for overflow capacity and staging |
| WP Engine | **Reseller/agency** | ~12% recurring; a 2026 "Strategic" tier exists. Only relevant for clients who insist on staying on managed WordPress |
| Kinsta | **Reseller/agency** | Notable for *lifetime* recurring commission. Same caveat |

### Email, SMS, and communications

| Vendor | Type | Notes |
|---|---|---|
| Amazon SES | — | No affiliate. Cheapest transactional email by a wide margin. Often the right answer anyway |
| Postmark, SendGrid, Mailgun | Partner/affiliate | Better deliverability tooling and support than SES; each has a partner program |
| **Google Workspace** | Reseller | **Free for verified nonprofits.** Do not resell to a qualifying 501(c)(3) |
| **Microsoft 365** | CSP reseller | **Nonprofit grants available.** Same caveat |
| Twilio | Partner | SMS and voice. Partner program for agencies and ISVs |
| Mailchimp, ActiveCampaign, Klaviyo | Partner/affiliate | Recurring commission on subscriptions; relevant only if you are not self-hosting the CRM |

### Payments and giving

| Vendor | Type | Notes |
|---|---|---|
| **Stripe Partner Ecosystem** | **Partner** | **The big one.** Revenue share on referred businesses' payment volume. Application-based. Also: get every client on Stripe's nonprofit rate |
| Givebutter, Donorbox, Zeffy | Partner/affiliate | Nonprofit-native giving. Zeffy is fee-free to the org (monetizes donor tips) — worth knowing even though it pays you nothing |
| PayPal Giving Fund | — | No commission, but many donors expect it |

### Business software

| Vendor | Type | Notes |
|---|---|---|
| HubSpot Solutions Partner | **Partner** | One of the strongest agency programs in software; meaningful recurring share |
| QuickBooks / Intuit ProAdvisor | **Reseller** | Wholesale billing with margin on client subscriptions. Directly relevant given every church needs bookkeeping |
| Vercel, Netlify | Partner | Only if you host client frontends there instead of on your fleet |

### Where there is nothing to earn

Anthropic, OpenAI, and Google do not run public affiliate programs for API
access. Open-source infrastructure (PostgreSQL, Directus, Payload, n8n, Coolify,
Caddy) pays nothing by definition — which is the point, since it is also what
makes your hosting margin possible.

### Operational note

Fifteen partner accounts is its own overhead. Keep one register: program, login
location, account owner, commission terms, payout method, and renewal date.
Treat it like any other asset inventory, because unclaimed commissions and
lapsed partner tiers are the normal failure mode.

---

## Part 3: The stack

The requirements this has to satisfy, all at once:

1. Runs on your own hardware, and later on one small box inside a church
2. Non-technical staff manage the day-to-day content and approvals
3. You build and maintain it across many installs
4. **Real security boundaries**, because a role that only hides menus is what
   made WordPress unsuitable for pastoral care notes
5. AI agents need clean API access to read and write
6. Nothing proprietary to escape from later

### Layer 0 — Infrastructure (owned fleet, or rented until there is one)

| Component | Choice | Why |
|---|---|---|
| Virtualization | **Proxmox** | Runs on commodity or older enterprise hardware, mature, free |
| Deploy layer | **Coolify** | Explicitly built for agencies running dozens of client sites, isolates each in Docker, 290+ one-click services, preview deployments. Dokploy is the lighter alternative if you prefer Swarm and a leaner UI |
| TLS + routing | **Caddy** or Traefik | Automatic certificates, no manual renewal |
| Public access | **Cloudflare Tunnel** | No open inbound ports, no static IP. Same mechanism the church box will use |
| Backups | **restic** or borg | Encrypted client-side, so what you store is ciphertext |
| Monitoring | **Uptime Kuma** + Netdata or Grafana | Know before the client does |

### Layer 1 — Data

**PostgreSQL, with Row-Level Security.**

This is the most important architectural decision in the document. In WordPress,
a role controls what the dashboard renders; anyone who can install a plugin or
pull a backup reads everything. In Postgres, RLS is enforced by the database
itself — a policy on the care-notes table means the query returns nothing for an
unauthorized user, no matter what application code asks. That is an actual
confidentiality boundary, and it is what makes the pastoral-care and
foreclosure-detail modules possible at all.

**Optional:** self-hosted **Supabase** bundles Postgres, auth, storage,
realtime, and an admin UI in one Docker stack. Convenient, and the existing
project already has schema written against it. Plain Postgres plus your own auth
is the lighter, more portable choice.

### Layer 2 — Backend and admin (what the client touches)

| Choice | Best when |
|---|---|
| **Directus** | Database-first. Sits on top of an existing Postgres schema, instant REST and GraphQL, extremely granular role permissions, polished admin UI |
| **Payload CMS** | Code-first. TypeScript schema definitions, Next.js native, excellent admin UI, versioned with your repo |

Either works. **Directus** if you want the data model to live in the database
and be inspectable in SQL; **Payload** if you want it in version control
alongside the app.

**Then build a simplified dashboard on top.** The same principle from the
WordPress work applies: the pastor should never see the raw CMS. One landing
page — urgent items, things needing approval, this week's numbers — with the
full admin reserved for you and one designated webmaster.

### Layer 3 — Frontend

**Next.js** for the public site and the installable app. It preserves what has
already been built: the PWA install, offline capability, the app-store path, and
the design system. **Astro** is the alternative if a given client's site is
content-only and needs no app behavior.

### Layer 4 — Automation

**n8n, self-hosted.** This is the workhorse that replaces Zapier or Make: it
catches every event, branches on it, retries, escalates when nobody
acknowledges, and fans out to email, SMS, and the CRM. Self-hosted means no
per-task fees as volume grows, and it runs on the fleet you already own.

### Layer 5 — AI

**LiteLLM as the gateway.** One OpenAI-compatible endpoint in front of
everything, with routing rules deciding which model handles which job — the
cheap fast model for classification and triage, the strong model for drafting
and judgment, a vision model for scanned paper. Providers become configuration
rather than code, so adding Gemini alongside Claude, or swapping in a local
model when the inference box lands, changes one config file.

### Layer 6 — What you should NOT self-host

Being honest about this saves months:

- **Outbound email.** Deliverability is brutal, IP reputation takes months to
  build, and a church's urgent notifications landing in spam is a failure with
  real consequences. Use SES or Postmark.
- **Payments.** Never. Compliance scope alone rules it out.
- **SMS.** Carrier registration and compliance make this a vendor problem.
- **Authoritative DNS.** Cloudflare does it better and free.

Everything else on this list is genuinely better owned.

---

## Part 4: The economics per install

Rough shape, per church, per year:

**Your marginal cost, two scenarios:**

- *Owned fleet, already powered:* one more container is close to zero. The only
  real cost is the software you correctly chose not to self-host —
  transactional email, SMS usage, and any paid CMS tier. Call it $25–50/month,
  most of it usage-based.
- *Rented infrastructure:* add $20–60/month per client for a VPS, or amortize
  one larger box across several. Call it $50–110/month all in.

Quote from the second number until the first one is verifiably true. Margin
improves when the fleet lands; a quote built on hardware that does not exist yet
does not survive contact with the first invoice.

**Their alternative:** the scattered subscriptions inventoried during the
interview, plus whatever they were paying for WordPress hosting, plus the hours
staff spend doing by hand what the automation does.

### The price

**Church OS, Full Operations: $400/month. Setup and migration: $400.**

Year one is $5,200 against roughly $700 in hard costs, so about **86% gross
margin**. It holds up against the market because the product replaces four to
six tools at once:

| What it replaces | Their price |
|---|---|
| Church management (Breeze / Tithely) | $67–119/mo |
| Church management (Planning Center, mid-size) | ~$200/mo |
| Managed nonprofit website hosting | $100–300/mo |
| Email marketing platform | $30–50/mo |
| Form and intake tooling | $15–30/mo |
| AI operations layer | nothing comparable exists |

### Three rules that protect the price

**1. The first invoice sets the ceiling for the whole network.** These
organizations talk to each other. Never quote a low price — quote the real
price and show the discount as a line item:

> Church OS — Full Operations — $400/mo
> Setup & migration — $400 *(founding partner rate)*
> Mobile app, iOS + Android — $1,200 value, included as founding partner
> 12-month initial term

Customer five then sees $400 as the price, with a story about why the first one
was different. This costs nothing and is the single highest-leverage line in
the document.

**2. A low install fee requires a minimum term.** $400 prices roughly two hours
against a job that runs twenty to sixty, and the interview alone is three
sessions. The recurring fee closes that gap in about two months, so the
strategy is sound — but only if the client stays. Use a 12-month initial term,
or make the annual plan the default. And invest early in making install
repeatable (container template, data importer, DNS runbook, training deck),
because that is what turns the install fee from a loss leader into margin.

**3. Annual discounts run 15–17%, not 40%.** "Pay for ten months, get twelve"
is the standard. A steeper discount tells the buyer the monthly price was never
real.

### Passed through, never absorbed

- Payment processing fees (~2.9% + $0.30 per card gift)
- SMS usage above an included bundle
- Apple Developer account, $99/year, recurring for as long as the app lives
- Custom development beyond the standard build

### The mobile app decision, before there are five of them

- **One app, many churches** (user picks their congregation): one Apple
  account, one review cycle, one update pipeline forever.
- **One app per church** (branded individually): a much stronger pitch, but N
  listings, N review cycles, N rejection risks, and N updates every time a
  mobile OS or store policy changes.

For a product meant to replicate across a network, this compounds fast and is
far cheaper to decide now than after several listings exist.

The margin is structural rather than clever: the stack is open source, hosting
is commodity, and the only recurring costs are the three or four services that
genuinely should be somebody else's problem.

---

## Part 5: Portability, which is the whole point

Every choice above is deliberately boring and self-hostable: Postgres, Docker,
Node, standard REST. There is no proprietary format to escape and no vendor who
can raise the price of the core.

That means the same stack runs three ways without a rewrite:

1. **On your fleet**, multi-tenant, one container per client
2. **On a single box inside a church**, when the "data never leaves the
   building" promise has to become literal
3. **On a cloud VPS**, if a client insists or as failover

The migration between them is a database dump, a file sync, and a DNS change.
That portability is what lets you promise a church its own sovereignty later
without rebuilding anything, and it is the strongest argument for owning the
stack rather than renting one.
