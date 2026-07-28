# The Administrator Interview
### The operational audit of Freedom, Inc. / Faith CDC, and the map for automating everything that can be automated
### Destination: WordPress

This is the instrument for interviewing the final administrator. It was built
from two full audits: one of the existing platform (every screen, form, data
file, agent, and doc in this repo) and one of WordPress as the destination
(plan constraints, plugin ecosystem, flow mapping, migration path, and the
security of putting this particular data in this particular place).

The organization is transferring everything to WordPress. That decision is
taken. This document interviews for it.

**The goal, said once:** every action a person takes by hand today becomes a
flow where AI does the work, the administrator taps Approve inside WordPress,
and the right people get notified. Nothing external ever sends without a human
tap. Money never moves by AI. That rule never bends, and on WordPress it stops
being an honor system and becomes an enforced permission.

The technical companion to this document is **docs/WORDPRESS-BUILD.md**: the
stack, the data model, the admin experience, the agent rewiring, the cutover
runbook, and the path to the church's own box. Read this one before the
interview. Read that one before the build.

---

## Part 0: The four things to know before you walk in

**1. Today, nobody is notified of anything.** The current app runs in demo
mode: every application, RSVP, and profile lives only in the browser that
submitted it. A family with a foreclosure sale date scheduled generates zero
alerts. This is the single most urgent problem in the organization and it has
nothing to do with WordPress. It gets fixed in week one of the migration, not
at the end.

**2. "WordPress Business" is ambiguous, and getting it wrong wastes the
project.** It could mean the WordPress.com Business plan, or self-hosted
WordPress on business hosting. They have different constraints. Worse: on
WordPress.com, seeing a Plugins menu no longer proves you are on Business,
because plugin installs reportedly opened to lower tiers in 2026. **Confirm the
tier by capability, not by menu.** Domain 0 below is the ten minutes that
resolves this, and it comes first.

**3. WordPress roles are a UI filter, not a confidentiality boundary.** This is
the finding that changes what the organization should collect at all. Any
WordPress role that can install a plugin, run an export, or reach a backup can
read every row in the database regardless of what their dashboard shows. So the
promise "pastoral care notes are visible only to the tightest tier" cannot be
made true on WordPress. Part 6 is the honest conversation that follows from
this, and it must happen in the room before any sensitive data is migrated.

**4. The approval gates already exist, in the right shape, on the wrong
mechanism.** Forward-to-partner, approve-and-send, email-applicant: all are
one-tap today, all are mailto links that leave no record and send from someone's
personal mail client. WordPress replaces the mechanism and keeps the shape.

---

## Part 1: How to run the session

**Who is in the room.** The final administrator. Rev. McCluster for the
partner, governance, and pastoral sections — those answers are his. The
treasurer or bookkeeper for finance, even by phone. Whoever holds the WordPress
and domain logins, for Domain 0.

**Length.** Three sessions of about two hours, or one long day with breaks.
Suggested split: Session 1 = WordPress environment, systems, intake, jobs.
Session 2 = corridors, events, communications, giving. Session 3 = people and
care, partners, governance, privacy, artifact handover.

**Record it,** with permission. The transcript becomes the source for the
automation: the exact phrases they use, the exceptions they mention in passing,
the names they drop. Transcription is already in the Church OS plan for exactly
this.

**The two-column rule.** For every operation: capture *what happens* (steps,
people, tools, timing) and *what breaks* (the exception, the workaround, the
thing they do at 11pm). The second column is where the automation value is.

**Artifacts beat answers.** When an answer references a document, a
spreadsheet, a template, or a list, ask for the thing itself, on the spot, into
one collection folder. An interview that produces twenty artifacts beats one
that produces forty answers.

**Close every domain with the same three questions.**
- What eats the most hours here every month?
- What has actually gone wrong here before?
- If you were gone for a month, who could do this, and what would they need?

---

## Part 2: Domain 0 — Which WordPress, exactly (do this first, it takes ten minutes)

Everything downstream depends on this. Do not accept a plan name as an answer.
Have them open the site's dashboard while you sit there.

**Ask them to look, and report what they see:**
- [ ] Open the site admin. Is the URL `something.wordpress.com` or a hosting
      control panel like cPanel / WP Engine / Kinsta / SiteGround?
- [ ] **The tier tell (WordPress.com only):** go to Settings → Hosting
      Configuration. **Are there SFTP/SSH credentials? Is there a Cron tab?**
      Those two exist on Business and above only. If they are absent, this is
      Personal or Premium no matter what the invoice says, and the plan needs
      upgrading before anything else happens.
- [ ] Is there a **Staging** option? (Business and above.)
- [ ] Is there **phpMyAdmin / database access**? (Business and above.)
- [ ] Under Plugins, can they **upload a plugin ZIP** (not just install from the
      directory)? Custom code ships as a ZIP, so this matters.
- [ ] What is the **exact renewal price and date**, and who pays it?
- [ ] Who owns the WordPress.com account or hosting account — the church, Rev.
      McCluster personally, a former volunteer, an agency?
- [ ] How many WordPress sites exist in total? (faithandresults.com,
      faithcdc.org, a Shiloh church site, anything else?)
- [ ] Is the **old** faithandresults.com WordPress still live, and is this new
      Business site a separate install or the same one?
- [ ] Who else has admin logins today, and are any of them former staff or
      volunteers who should be removed?
- [ ] Is two-factor authentication on for every admin account?

**Then verify these three things technically, before designing anything.** The
research behind this document could not fetch primary sources (the proxy
blocked wordpress.com and vendor domains), so these rest on search results and
must be proven on the actual site:
- [ ] Does an authenticated REST write work from outside? Create an Application
      Password and POST a draft post from another machine. **The AI agents
      depend on this.** If it fails on WordPress.com, the agent auth path
      becomes OAuth2 through public-api.wordpress.com, which is materially more
      work.
- [ ] Does the server cron feature actually run a scheduled job on time? (On
      Business, Settings → Cron. WP-Cron alone fires on page visits and will
      silently skip jobs on a low-traffic site — never build the foreclosure
      alert on it.)
- [ ] Can the site make **outbound** HTTP calls? Test a request from the site to
      an endpoint you control. If outbound is filtered, the architecture flips to
      pull-based.

**Also check** the required plugin list against the platform's blocked-plugin
list *before* committing (WordPress.com publishes one; managed hosts publish
their own). Discovering a blocked plugin after purchase is a bad day.

---

## Part 3: The interview, domain by domain

Eleven domains. Each gives you what we already know (so you never ask what the
repo can answer), the questions, and the artifacts to collect.

---

### Domain 1: Systems, credentials, and the old site

**We know:** The original faithandresults.com was WordPress; its media library
was already scraped into this repo and a content export was ingested. The
current app is a static site on GitHub Pages. The phone everywhere is
(203) 549-8703. Email is info@faithandresults.com.

**Ask:**
- [ ] Where is faithandresults.com **registered**, and where is DNS managed?
      Who holds those logins? (Registrar and DNS can be different companies.)
- [ ] Where is the old WordPress **hosted**, what does it cost, who gets the
      bill, and are the admin credentials still known?
- [ ] **Where does info@faithandresults.com actually live?** If mailboxes ride
      on the old web host, moving the site can kill the organization's only
      inbox. This must be established before any DNS change.
- [ ] What are the current MX, SPF, DKIM, and DMARC records? Has email ever
      gone to spam in bulk?
- [ ] The phone: landline, Google Voice, someone's cell forwarding? Who
      answers, who has voicemail access?
- [ ] Name every subscription the organization pays for: giving app, Zoom,
      Canva, Mailchimp or Constant Contact, QuickBooks, anything.
- [ ] Which **spreadsheets** are the real operational databases? Ask by
      function: applicants, donors, conference contacts, clergy networks,
      corridor contacts.
- [ ] Does the old site still receive traffic or form submissions? Is
      faithcdc.org separate, and whose is it?
- [ ] Has the `ANTHROPIC_API_KEY` secret ever been set on the GitHub repo? Have
      the McCluster OS or corridor-research agents ever actually run?
- [ ] What is in the physical filing cabinet, and what should be scanned first?
- [ ] If the administrator's laptop died today, what would be unrecoverable?
- [ ] Budget and placement for the Shiloh box eventually (about $3-4k plus UPS
      and backup drive): where would it sit, with power and internet?

**Collect:**
- [ ] Registrar, DNS, hosting, and WordPress account details (secured handover,
      never into the repo)
- [ ] A fresh full backup of the old site: content export, files and database,
      and a crawl of the public pages
- [ ] The complete subscription list with monthly costs
- [ ] Every operational spreadsheet, as files
- [ ] Google Search Console access, or its top-pages and top-queries export,
      for the redirect map
- [ ] Priority filing-cabinet contents, scanned or listed

---

### Domain 2: Intake and applications

**We know:** Six intake types: Workforce Readiness (4-week cohorts, trade
interests, partner pathways), Homebuyer Education (journey stage), Foreclosure
Prevention (urgent; situation ranges from "current but worried" to "sale date
scheduled"), Financial Empowerment (topic), MLK corridor city intake (9
org-level questions), Capacity Building. Every form captures name, email,
phone, city, org, notes, consent, and issues an FR- reference. Admin can
approve or decline with a note. The confirmation promises review "usually
within a few business days."

**Ask:**
- [ ] Who opens the admin today, on what device, how often? Weekends?
- [ ] Walk me through the last foreclosure case with a sale date scheduled: who
      touched it, in what order, within how many hours, and what did they send?
- [ ] Are you a HUD-certified counseling agency, or do you refer out? To which
      agency, which named counselor, warm handoff or phone number?
- [ ] **Who is the named person, with a mobile number, who should be texted
      within minutes when a foreclosure intake arrives?** Who is the backup?
- [ ] What does "approve" actually mean per intake type? Enrolled in a cohort?
      Scheduled for counseling? What literally happens after the button?
- [ ] Workforce cohorts: how are they scheduled against employer hiring
      calendars, who sets start dates, what is the pre-screening checklist?
- [ ] What paper or PDF forms still exist, who hands them in, who re-keys them?
- [ ] Which of the six intakes gets real volume? Monthly counts per type. Which
      have never received one?
- [ ] What is the real response-time standard, and how often is it missed?
- [ ] What intake happens with **no form** today: walk-ins after service, phone
      intakes? Who writes those down, where?
- [ ] What do funders (HUD, FDIC, FHLB, NeighborWorks) require you to report
      about clients served? What is the current form missing (income, household
      size, HUD 9902 demographics)?
- [ ] Who may decline an application, and has a decline ever been reversed?

**Collect:**
- [ ] The current applicant tracking spreadsheet or notebook
- [ ] Paper and PDF intake forms, especially anything HUD 9902 related
- [ ] The actual replies sent to the last 5 approved and 5 declined applicants
      (these become the email templates)
- [ ] The last completed cohort calendar
- [ ] The foreclosure counseling checklist or script, and the referral list
- [ ] Any client report submitted to a funder
- [ ] Everyone who applied in the last 12 months, any channel

---

### Domain 3: Jobs pipeline and employer partners

**We know:** The partner registry holds Hartford HealthCare (Deborah Lee,
deborah.lee@hhchealth.org, head of hiring), Faith CDC as job-fair host, and
unnamed "collaborating agencies" (municipal housing authorities, Bridgeport
Landing Development, Corves Development). Pipeline: Submitted, Forwarded,
Interview, Placed, with a 7-day staleness flag. Every tracking-link field is
empty. Precedent: the 2022 HHC / St. Vincent's Opportunity Fair.

**Ask:**
- [ ] Is Deborah Lee still the right contact, and is that email current? Who is
      the backup? Does HHC prefer a portal or ATS over email referrals?
- [ ] Has any partner ever issued a **tracking link** crediting the
      Collaborative? Who at each partner could?
- [ ] Named human contacts for every unnamed partner: which housing authority,
      who at Bridgeport Landing, who at Corves? Paper agreements or
      relationship?
- [ ] How do you find out someone got hired? What share of forwarded candidates
      do you never hear about again?
- [ ] Who runs placements day to day, and how many hours a week does it take?
- [ ] The 2022 fair, logistically: who booked the venue, who staffed sign-in,
      how were candidates registered, does that data still exist?
- [ ] The 125 graduates/year capacity: actual throughput last year, and where
      is the graduate roster?
- [ ] Which employers contribute anything (sponsorship, per-placement,
      in-kind)?
- [ ] How do the clergy coalitions feed candidates in, and who are the named
      coordinators?
- [ ] What breaks most often between application and placement?

**Collect:**
- [ ] Any MOU or partnership letter, per employer
- [ ] Real referral emails sent to Deborah Lee (the format partners answer)
- [ ] The 2022 fair sign-in sheets and any later fair's
- [ ] Graduate rosters and any apprenticeship compliance paperwork
- [ ] The Collaborative's full agency list
- [ ] Any placement outcomes report
- [ ] Clergy coalition coordinator contacts

---

### Domain 4: MLK Corridors pipeline

**We know:** Five stages: Received, Research, Outreach, Proposal, Funded. A
research agent produces a dossier (street condition, officials, funding
landscape, draft outreach letter). The Connecticut precedent is documented:
Norwalk, Middletown, New Britain named; program outline to CT DECD; Jan 18,
2019 Spear Park launch; Black Ministers Alliance of New Britain organizing. The
app generates a draft funding proposal from the applicant's answers.

**Ask:**
- [ ] Who owns Corridors operationally besides Rev. McCluster? Is the Black
      Ministers Alliance still the engine, and who is the living contact?
- [ ] What happened after the 2019 DECD submission? Was funding received, how
      much, and where is the paper trail?
- [ ] Norwalk, Middletown, New Britain today: current municipal and clergy
      contacts, last conversation, active or dormant?
- [ ] Has anyone outside Connecticut ever applied? Which pipeline stages have
      never actually run?
- [ ] Who may sign a letter to a mayor's office? Must it be Rev. McCluster
      personally? Where is the letterhead file?
- [ ] Is there a past proposal (the DECD outline) to use as the gold-standard
      template for AI-generated proposals?
- [ ] How long may a city sit in Research before it is a no? What disqualifies
      a city?
- [ ] When a corridor gets funded, who administers the money? Any fee or
      consulting arrangement?
- [ ] What is the applicant organization expected to do during Research and
      Outreach?

**Collect:**
- [ ] The original DECD program outline (the master document)
- [ ] The New Britain co-signed letter
- [ ] Letterhead, and any outreach letter actually sent to a city
- [ ] Current contacts for the three CT corridor communities
- [ ] Any corridor funding proposal, award, or decline letter
- [ ] Outcome numbers and press per corridor
- [ ] The 2019 Spear Park launch materials

---

### Domain 5: Events, RSVPs, and the FCDC conference

**We know:** One calendar; future events rise, past self-archive. The flagship
is the FCDC Annual Meeting and Conference (current date is a placeholder;
sponsor RSVPs are promised a package that nothing actually sends). Publishing
an event today requires downloading a file and committing it to GitHub — a
chore that disappears entirely on WordPress.

**Ask:**
- [ ] Does a **sponsorship package** document exist? Get the latest: levels,
      prices, benefits. Who wrote it?
- [ ] Who sold 2023 sponsorships, to whom, at what amounts, invoiced and paid
      how? Into which entity's account?
- [ ] Which entity legally runs the conference, and where does revenue land?
- [ ] Real 2023 attendance and registration method. Does the attendee list
      exist?
- [ ] Who owns the venue relationship, and what is the real next date?
- [ ] What do you use for blasts today, and has bcc ever failed on a big list?
- [ ] How do elders without smartphones register? Who transcribes it, where
      does it go?
- [ ] Whose phone sends the texts, and would a dedicated org number be
      accepted?
- [ ] Which events recur annually beyond the conference, and who leads each?
- [ ] Can the administrator alone publish to the public calendar, or does Rev.
      McCluster confirm dates first?

**Collect:**
- [ ] The sponsorship package PDF with pricing
- [ ] The 2023 program book, agenda, sponsor list
- [ ] Sponsor invoices and payment records
- [ ] Attendee lists from the last conference and two summits
- [ ] Any event-tool account exports
- [ ] Venue contract or booking correspondence
- [ ] A photo of the paper sign-up sheets used at Shiloh

---

### Domain 6: Communications

**We know:** Everything funnels to one inbox and the phone. The newsletter
signup is a mailto link with no list behind it. News and a curated press list
live in data files. The organization does real press work — the monopole fight
drew sustained coverage. Agent drafts sign as "Freedom, Inc. digital
operations," never as a person.

**Ask:**
- [ ] Does a newsletter exist in any form? Last edition, tool, list size?
- [ ] How many contacts exist across all lists, in what containers?
- [ ] Who may speak as Freedom, Inc. in writing? What can go out without Rev.
      McCluster's personal review?
- [ ] The monopole fight: who wrote the releases, who are the go-to reporters
      by name and outlet, are the releases on file?
- [ ] Whose cell has been used for text blasts? Appetite for a dedicated
      texting number with real opt-out compliance?
- [ ] Voice rules: what makes a draft feel wrong to this audience?
- [ ] Who manages the Shiloh Facebook page? Coordinate or stay separate?
- [ ] Should agent-drafted news publish autonomously, or with a human gate?
- [ ] What needs to go out in Spanish?

**Collect:**
- [ ] Mailbox inventory for info@ (provider, folders, canned responses)
- [ ] Every list export available, any format
- [ ] The last three newsletters or bulletin inserts
- [ ] Press releases and the reporter contact list
- [ ] Reusable templates living in drafts folders or Word docs
- [ ] Brand assets: logos, letterhead, photo library

---

### Domain 7: Giving and finance

**We know:** Giving on the site is a mailto link. No processor, no donation
page, no receipts. The doctrine is already written: AI tracks, reconciles,
flags, and drafts, but never moves money; humans approve every transaction;
full audit logging; receipts carry tax consequences. Entities: Freedom, Inc.,
Faith CDC, Shiloh Baptist Church, and a Louisiana affiliate.

**Ask (with the treasurer present):**
- [ ] What happens today when someone wants to give? Check to whom? Or is there
      a platform (Givelify, Tithe.ly, PayPal, Cash App) not on the site?
- [ ] Which entity receives which money? Are all 501(c)(3) in good standing,
      and under which EINs are receipts issued?
- [ ] Who is treasurer or bookkeeper per entity, on what software, and who
      reconciles the accounts?
- [ ] Authorized signers per account, and the threshold for board approval?
- [ ] Are the books audited or reviewed? Last 990 per entity?
- [ ] How are year-end donation receipts produced today?
- [ ] Active grants: funder, amount, restrictions, deadlines, who writes the
      financial reports?
- [ ] How did 2023 sponsorship money get invoiced, collected, recorded?
- [ ] Shiloh's Sunday counting protocol: who counts, who deposits, who records?
- [ ] What financial task eats the most hours, and what has gone wrong before?

**Note for the room:** card processing runs roughly 2.9% + $0.30. On $100k of
annual online giving that is about $2,900 — an order of magnitude more than the
entire software stack. Applying for Stripe's nonprofit rate is the single
highest-value negotiation in this project.

**Collect:**
- [ ] Chart of accounts and a recent P&L per entity
- [ ] Donor list and giving history from wherever it lives
- [ ] A sample year-end statement and acknowledgment letter as actually sent
- [ ] 990s and determination letters per entity
- [ ] Active grant agreements with reporting deadlines
- [ ] The Sunday counting and deposit procedure
- [ ] Bank account inventory: institution, purpose, signers (descriptive only)

---

### Domain 8: People, membership, and pastoral care

**We know:** The current app has device-local profiles. Church OS plans the
full member CRM: directory with tiered roles, attendance, engagement ("these
twelve families have not been seen in a month"), pastoral care on the tightest
tier, volunteers. **Read Part 6 of this document before this conversation** —
the pastoral-care question has a hard answer and it changes what you ask for.

**Ask:**
- [ ] Where is the Shiloh membership roll right now, in what format, how many
      active members and families, when was it last cleaned?
- [ ] Who may see the full membership list? Who must **not** see giving
      amounts? Who must **not** see care notes? Name actual people first, then
      derive roles.
- [ ] Is attendance counted at all today? Would the congregation accept
      check-in if framed as caring?
- [ ] Tell me about the last member who fell through the cracks. What signal
      was missed?
- [ ] How does the pastor keep care notes now, and what would make him trust a
      system with them?
- [ ] Households or individuals? Who maintains baptisms, weddings, funerals?
- [ ] Which ministries most need volunteer scheduling, and who runs each phone
      tree?
- [ ] How many members have no email? What share would a text reach versus a
      call?
- [ ] What is the church clerk's role, and does membership tie to convention
      reporting?
- [ ] Consent: what would members need to hear, from whom, before this feels
      like care and not surveillance?

**Collect:**
- [ ] The membership roll in whatever format exists
- [ ] Any church-management software export or account inventory
- [ ] Sign-in sheets, pew cards, visitor cards in use
- [ ] The deacon and ministry assignment list
- [ ] Volunteer rosters and phone-tree lists
- [ ] The clerk's records templates

---

### Domain 9: Partners, collaboratives, and program leads

**We know:** Four collaboratives (NFLC, CFLC, CT Faith Jobs, Faith CDC) and a
deep institutional partner list (FDIC, HUD, FHLB, Freddie Mac, NeighborWorks,
state agencies, HHC, and city partners across 19 cities). The repo names
exactly two living contacts. This domain is the continuity risk the whole
project exists to close.

**Ask (Rev. McCluster's section):**
- [ ] Pillar by pillar: who besides you can run each program today? Name, role,
      phone, email. If the answer is nobody, say so plainly.
- [ ] Each collaborative: who is on it now, how often does it meet, who
      convenes it, where are the member list and minutes?
- [ ] Current named contacts at FDIC, HUD, FHLB, Freddie Mac, NeighborWorks, CT
      DECD, CT Dept of Banking, CT Green Bank, HHC. Which are stale?
- [ ] Which partnerships have paper (MOU, affiliate agreement) versus pure
      relationship?
- [ ] How does a NeighborWorks engagement come in, what is the fee structure,
      and who else could deliver that training?
- [ ] For each of the 19 cities: the living anchor contact, active versus
      historical.
- [ ] **Where does your address book live, and can we do a supervised export of
      the organizational contacts?** This is the most valuable artifact in the
      entire engagement.
- [ ] Who is the successor-designate for the key relationships, and have any
      partners met them?
- [ ] Which single relationship, if it lapsed, would hurt most? When did you
      last speak?

**Collect:**
- [ ] The supervised address-book export (organizational contacts only)
- [ ] Collaborative member lists and minutes
- [ ] All MOUs and affiliate agreements on file
- [ ] NeighborWorks correspondence and past institute schedules
- [ ] The 19-city anchor list, even handwritten in the room
- [ ] Any org chart or board roster for both entities

---

### Domain 10: Governance, approvals, and continuity

**We know:** The agent charter already codifies the pattern: agents may
research, score, and draft; humans must approve anything external, any event
confirmation, any commitment or signature, anything involving money. The
current admin gate is a shared passcode with no per-person identity. On
WordPress, every one of those rules becomes an enforced capability instead of a
promise.

**Ask:**
- [ ] Build the **approval matrix** live (Part 5): for each action type, who
      can approve, who must be told, what needs a board vote?
- [ ] Officers and directors of Freedom, Inc. and Faith CDC right now? State
      filings current? Who files them?
- [ ] Who is the designated administrator after the current one, and what do
      they already know how to do?
- [ ] Where do credentials live: WordPress, GitHub, registrar, DNS, email
      admin, any keys? Password manager or envelope in a drawer?
- [ ] Which decisions has Rev. McCluster said only he can make, in his own
      words? Which is he genuinely willing to delegate to one-tap approval?
- [ ] The emergency protocol if he is unreachable for a month: who approves the
      pipeline?
- [ ] Insurance (D&O, liability, cyber) per entity, and registered agents?
- [ ] Has the board formally blessed the AI-agent operation? Does it need to
      for the money-adjacent phases?

**Collect:**
- [ ] Bylaws, incorporation certificates, officer lists for both entities
- [ ] The credential inventory (secured, never into the repo)
- [ ] A year of board minutes for both entities
- [ ] Any delegation-of-authority or check-signing policy
- [ ] The succession plan or letter of wishes, however informal
- [ ] Insurance declarations pages

---

### Domain 11: Privacy, consent, and security

**We know:** Consent is structural on every form today. The Church OS doctrine
is local-first, consent-first, tiered access, encryption, audited access. **The
WordPress research produced a hard finding here that Part 6 covers in full.**
Bring it into this conversation deliberately.

**Ask:**
- [ ] Has anyone ever asked to be removed or deleted, and what did you do?
- [ ] What confidentiality rules bind the counseling work (HUD housing
      counseling standards require electronic client files be kept
      confidential; state requirements; partner agreements)? Any privacy notice
      in use?
- [ ] Who has known the admin passcode, and which devices hold real applicant
      data in their browsers right now?
- [ ] Did the people you text ever agree to receive texts? Any complaints?
- [ ] **Does "your data never leaves the building" bind now, or at Church OS
      launch?** The organization has said it publicly. WordPress in the cloud
      is the interim; the box is the destination. Get their words on the record.
- [ ] The tiers, concretely: who may see foreclosure details, giving amounts,
      care notes, everything? Names first, roles second.
- [ ] Are minors ever in the data (youth mentoring), and what parental consent
      exists?
- [ ] Walk me through the nightmare scenario for this congregation, so the
      controls match the real stakes.

**Collect:**
- [ ] Any privacy notice, confidentiality agreement, or intake disclosure in use
- [ ] The device list that has used the current admin panel
- [ ] Partner data-handling requirements (HHC, HUD, state)
- [ ] Consent language on paper forms if different from the app's
- [ ] Existing opt-out and do-not-contact notes, wherever kept

---

## Part 4: What every answer becomes

Every flow has one shape, and on WordPress each stage has a real mechanism:

**Trigger → AI does the work → Approval inside WordPress → Execution →
Notification.**

The flows, in build order. Full mechanism detail is in WORDPRESS-BUILD.md.

1. **Urgent foreclosure alert.** Form submission fires an instant SMS to the
   named counselor *and* a webhook to the automation layer that escalates to a
   second number if nobody acknowledges within fifteen minutes. Two independent
   paths, because one is not enough when the deadline is a foreclosure sale.
   Internal alerts need no approval. *This ships first.*
2. **Applicant acknowledgment and decision emails.** Instant receipt with the
   reference number on every submission. Approve or Decline drafts the
   personalized decision email; one tap releases it.
3. **Partner referral.** Approval matches the pathway to the named partner
   contact and drafts the referral. The administrator's Forward tap sends a
   *tracked* email, auto-advances the stage, logs the send, and chases silence
   after N days.
4. **Corridor pipeline.** Application triggers the research agent
   automatically; the dossier lands as a draft; the administrator advances to
   Outreach; the letter to city hall sends only on explicit approval.
5. **Sponsor pipeline.** A sponsor RSVP sends the package immediately (it was
   already promised on screen) and pings the conference lead, because that is
   revenue. The level pitch and invoice are drafted for approval.
6. **RSVP confirmations and reminders.** Confirmation with calendar
   attachment, SMS reminders day-before and day-of, headcount briefs.
7. **Newsletter.** A real signup form with consent recorded, AI drafts each
   edition from news and events, the administrator edits and approves.
8. **Giving.** Payment lands, AI records it, drafts the receipt with tax
   language, flags anomalies; the treasurer approves in batch. The AI never
   touches money.
9. **Care intelligence.** *Deferred by design — see Part 6.*
10. **The weekly brief, delivered.** It arrives as an email or text instead of
    waiting for someone to log in. Nobody logs into a dashboard that has never
    notified them of anything.

---

## Part 5: The approval matrix (fill this in live, in the room)

The most important artifact of the governance session. On WordPress each row
becomes an actual capability, so this table is a specification, not a policy
document.

| Action | AI drafts? | Who approves | Who is told | Board vote? |
|---|---|---|---|---|
| Acknowledgment email to applicant | Yes | Pre-approved template | Admin digest | No |
| Decision email (approve/decline) | Yes | Admin | Pillar lead | No |
| Referral to employer partner | Yes | Admin (Forward tap) | Partner, applicant | No |
| Urgent foreclosure internal alert | Yes | None (internal) | Counselor + backup | No |
| Letter to a city official | Yes | __________ | __________ | ______ |
| Publish an event as confirmed | Yes | __________ | __________ | ______ |
| Publish a news item | Yes | __________ | __________ | ______ |
| Send the newsletter | Yes | __________ | __________ | ______ |
| Text blast to a roster | Yes | __________ | __________ | ______ |
| Sponsorship package send | Yes | Pre-approved | Conference lead | No |
| Sponsorship invoice | Yes | __________ | Treasurer | ______ |
| Donation receipt | Yes | Treasurer (batch) | __________ | No |
| Spend under $500 | No | __________ | __________ | ______ |
| Spend over $5,000 | No | __________ | __________ | ______ |
| Sign an MOU | No | __________ | __________ | ______ |
| Anything in Rev. McCluster's name | Yes | Him alone | __________ | ______ |

Rules that never bend: the AI never moves money, never signs, never publishes
an event as confirmed, never sends anything external without its category's
approval, and never speaks as a person. On WordPress the agent's account
literally lacks the capability to publish or approve, so these stop depending
on the agent behaving.

---

## Part 6: The hard conversation (have this before migrating any sensitive data)

The security research returned a finding that must reach the administrator
plainly, because it changes what the organization should collect.

**In WordPress, a role controls what the dashboard displays. It does not
control what the database contains or who can reach it.** Anyone who can
install a plugin, run an export, or download a backup can read every row —
regardless of what their screen shows. Installing one plugin dumps the
database.

That means the sentence *"pastoral care notes are visible only to the tightest
tier"* cannot be made true on WordPress. The organization has already promised
publicly that its members' data stays private and eventually never leaves the
building. Putting crisis notes in a cloud WordPress database makes that promise
false on day one.

Two data classes are affected:

**Pastoral care notes** — hospitalizations, bereavements, mental-health
crises, addiction, marital collapse. The most damaging record a church holds,
and a church generally has no regulatory shield forcing discipline. The
recommendation is direct: **do not build this module on cloud WordPress.**
Leave care notes where they are (paper, or an encrypted file on a
church-owned laptop) until the on-premises box exists with encryption at rest
and real row-level security. Building a WordPress version you intend to throw
away is worse than waiting, because it will not get thrown away.

**Foreclosure case detail** — sale dates, arrears, lender, income. These are
financial-distress records on counseled clients, and sale dates are precisely
the targeting list used for equity-stripping and rescue scams against an
elderly congregation. The recommendation is to **split the record**: WordPress
collects the intake ticket only (name, phone, email, best time to call,
consent, and a single non-detailed urgency flag), then alerts the counselor and
does not retain the detail. WordPress becomes the doorbell, not the filing
cabinet. The counselor takes the financial detail by phone into whatever
confidential case system the counseling work already uses.

**What to ask in the room:**
- [ ] Given that, do you want pastoral care in this system at all right now, or
      should it wait for the box?
- [ ] Are you comfortable with foreclosure intake capturing only contact and
      urgency, with the case detail handled off-platform?
- [ ] Who has the authority to make this call — the administrator, Rev.
      McCluster, or the board?

Everything else — applications, jobs, corridors, events, giving, membership
contact data, communications — is appropriate for WordPress with the controls
in the build document.

---

## Part 7: What this costs (bring real numbers to the room)

Roughly, per year, verified against current vendor pricing during the research
(and worth confirming live before purchase):

- **Lean but fully functional: about $850–1,000/yr.** Platform, forms, CRM,
  donations, email sending, SMS, with the rest on free tiers.
- **Recommended: about $1,450–1,650/yr.** Adds the directory and approval-queue
  layer, security, and better transactional email deliverability.
- **Fully loaded: about $2,000–2,300/yr.**

**Excluded and much larger:** payment processing at roughly 2.9% + $0.30 per
card gift. On $100k of online giving that is about $2,900 a year — more than
the entire software stack. Nonprofit processing rates are the highest-value
thing to negotiate.

Set this against what they pay today across the scattered subscriptions
inventoried in Domain 1. That comparison is the budget conversation.

---

## Part 8: Walking out

You are done when you can answer yes to all seven:

- [ ] **Which WordPress is confirmed by capability** — SFTP/SSH and cron
      verified present, not inferred from a plan name or a plugins menu.
- [ ] **The three technical unknowns are tested:** authenticated REST write
      from outside, a scheduled job that actually runs on time, and outbound
      HTTP from the site.
- [ ] The approval matrix is filled in, in their words, with named people.
- [ ] **The foreclosure alert has a named recipient with a mobile number**, and
      a named backup.
- [ ] The sensitive-data decision from Part 6 is made and recorded, by whoever
      has the authority to make it.
- [ ] The artifact folder holds the templates, lists, exports, and the address
      book, each with an owner.
- [ ] Every pillar, program, and collaborative has a named living contact, or
      an honest "nobody," written down.

Then the build starts, and it starts where it should: with the family whose
sale date is scheduled, who tonight generates no alert at all, and who next
month will generate one within minutes.
