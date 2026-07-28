# The Administrator Interview
### The operational audit of Freedom, Inc. / Faith CDC, and the map for automating everything that can be automated

This is the instrument for interviewing the final administrator. It was built
from a full audit of the platform: every screen, every form, every data file,
every agent, and every doc in this repo. Walk out of this interview with the
answers and the artifacts below, and every automatable operation in this
organization can be automated, with a human approval gate on everything that
leaves the house.

**The goal, said once:** every action an individual takes today becomes a flow
where AI does the work, the admin taps Approve in the panel, and the right
people get notified. Nothing external ever sends without a human tap. Money
never moves by AI. That is the standing rule and it never bends.

---

## Part 0: What the audit already found (read before the interview)

Ground truth from the platform, so you interview from knowledge, not guesses:

1. **Today, nobody is notified of anything.** The app is in demo mode: every
   application, RSVP, and profile lives only in the localStorage of the browser
   that submitted it. A family with a foreclosure sale date scheduled generates
   zero alerts. `notifyEmail` is set to info@faithandresults.com but no code
   ever sends to it. The webhook that would fan out to email, SMS, and CRM is
   built and tested, but its URL is empty. This is the single most urgent thing
   the interview must resolve: the go-live decision (Supabase project + webhook)
   that takes the platform from browser-only to real.
2. **The admin panel is verified working end to end.** Passcode gate, all seven
   panes (Dashboard, Applications, Events, People, Research, McCluster,
   Automations), full data round trip from public form to admin review, stage
   changes, partner forwarding, CSV exports, event drafting, blast links. Two
   minor issues found in the audit are already fixed. The panel is the approval
   surface everything below plugs into.
3. **The approval gates already exist as one-tap mailto links.** Forward to
   partner, approve and send a prospect, email an applicant. The pattern is
   right; the mailto is the weakness (no record, no delivery, personal mail
   client). The build replaces mailto with tracked sends behind the same taps.
4. **Two AI agents already exist** (the McCluster OS weekly engine and the
   corridor researcher, both GitHub Actions calling the Anthropic API), with
   human gates codified in a charter. Whether their `ANTHROPIC_API_KEY` secret
   has ever been set, and whether they have ever run, is an interview question.
5. **The whole relationship graph lives in one man's head and address book.**
   The repo names exactly two living contacts: Rev. Carl McCluster and Deborah
   Lee at Hartford HealthCare. Everything else (FDIC, HUD, FHLB, Freddie Mac,
   NeighborWorks, the state agencies, the clergy coalitions, the 19-city
   anchors) has no named person on file. The supervised export of that address
   book is the single most valuable artifact this interview can produce.

---

## Part 1: How to run the session

**Who is in the room.** The final administrator. Rev. McCluster for the
partner, governance, and pastoral sections if at all possible (those answers
are his). The treasurer or bookkeeper for the finance section, even by phone.

**Length.** Plan three sessions of about two hours, or one long day with
breaks. Suggested split: Session 1 = systems, intake, jobs. Session 2 =
corridors, events, communications, giving. Session 3 = people and care,
partners, governance, privacy, artifact handover.

**Record it.** Ask permission, then record audio of the whole thing. The
transcription becomes training data for the automation: the exact phrases they
use, the exceptions they mention in passing, the names they drop. Whisper
transcription is already in the Church OS roster for precisely this.

**The two-column rule.** For every operation they describe, capture two
things: *what happens* (steps, people, tools, timing) and *what breaks* (the
exception, the workaround, the thing they do at 11pm). The second column is
where the automation value lives.

**Artifacts beat answers.** Whenever an answer references a document, a
spreadsheet, a template, or a list: ask for the thing itself, on the spot, into
a single collection folder. The checklist for every domain is below. An
interview that produces twenty artifacts beats one that produces forty answers.

**Close every domain with the same three questions.**
- What eats the most hours in this area every month?
- What has actually gone wrong here before?
- If you were gone for a month, who could do this, and what would they need?

---

## Part 2: The interview, domain by domain

Eleven domains. Each gives you: what we already know (so you never ask what the
repo can answer), the questions, and the artifacts to collect. The automation
flows each domain becomes are in Part 3.

---

### Domain 1: Systems inventory and credentials (start here, it is concrete)

**We know:** The new site is a static PWA on GitHub Pages, auto-deployed from
main. The old WordPress site at faithandresults.com is still live somewhere,
with its media already migrated into this repo. The phone number everywhere is
(203) 549-8703. The admin runs in demo mode. Backend and cutover paths are
fully documented in docs/BACKEND.md but not executed.

**Ask:**
- [ ] Where is faithandresults.com registered and hosted? What does it cost
      monthly, who gets the bills, and who holds the registrar and hosting
      logins? Is faithcdc.org separate, and whose is it?
- [ ] Where does info@faithandresults.com actually live (Google Workspace, the
      web host, GoDaddy mail)? Who has the password, who checks it daily, and
      how many unread messages are in it right now?
- [ ] Would DNS cutover break the email? (If mail hosting rides on the old web
      host, it might. Establish this before any cutover date.)
- [ ] The phone: what is behind (203) 549-8703? Landline, Google Voice,
      someone's cell forwarding? Who answers it, and is there voicemail access?
- [ ] Name every subscription and login the org pays for or uses: giving app,
      Zoom, Canva, Constant Contact or Mailchimp, QuickBooks, anything.
- [ ] Which spreadsheets are the real operational databases today? Ask by
      function: applicants, donors, conference contacts, clergy networks,
      corridor contacts.
- [ ] Has the ANTHROPIC_API_KEY secret ever been set on the GitHub repo? Have
      the McCluster OS or corridor-research agents ever actually run?
- [ ] Who is comfortable with the git-commit publish flow today? Which
      publishing steps must become one-tap for the operation to survive?
- [ ] What is in the physical filing cabinet? What should be scanned first?
- [ ] If the admin's laptop died today, what would be unrecoverable?
- [ ] Budget and placement reality for the Shiloh box (about $3-4k plus UPS and
      backup drive): where would it physically sit, with power and internet?

**Collect:**
- [ ] Registrar, DNS, and hosting details for both domains (secured handover,
      never into the repo)
- [ ] The complete list of paid subscriptions with monthly costs
- [ ] Every operational spreadsheet, as files
- [ ] Phone system details for (203) 549-8703
- [ ] A full WordPress export if any content was never migrated
- [ ] Priority contents of the filing cabinet, scanned or listed

---

### Domain 2: Intake and applications (their daily bread)

**We know:** Six intake types: Workforce Readiness (4-week cohorts, trade
interests, partner pathways), Homebuyer Education (journey stage), Foreclosure
Prevention (flagged urgent, situation ranges from "current but worried" to
"sale date scheduled"), Financial Empowerment (topic), the MLK corridor city
intake (9 org-level questions), and Capacity Building for organizations. Every
form: name, email, phone, city, org, notes, consent checkbox, FR- reference
ID. Admin can approve or decline with a note. The confirmation screen promises
review "usually within a few business days." Nothing notifies anyone today.

**Ask:**
- [ ] Who opens admin.html today, on what device, how often? Weekends?
- [ ] Walk me through the last foreclosure case with a sale date scheduled:
      who touched it, in what order, within how many hours, and what exactly
      did they send or say?
- [ ] Are you a HUD-certified counseling agency, or do you refer out? To which
      agency and which named counselor? Warm handoff or just a phone number?
- [ ] What does "approve" actually mean per intake type? Enrolled in a cohort?
      Scheduled for counseling? What literally happens after the button?
- [ ] Workforce cohorts: how are the 4-week cohorts scheduled against employer
      hiring calendars, who sets start dates, and what is the pre-screening
      checklist (mock interviews, life skills, background check)?
- [ ] What paper or PDF forms still exist, who hands them in, who re-keys them?
- [ ] Which of the six intakes gets real volume? Actual monthly counts per
      type. Which have never received one application?
- [ ] What is the real response-time standard, and how often is it missed?
- [ ] What intake happens today with NO form in the app: walk-ins after Sunday
      service, phone intakes? Who writes those down and where?
- [ ] What do funders (HUD, FDIC, FHLB, NeighborWorks) require you to report
      about served clients? What fields is the current form missing (income,
      household size, HUD 9902 demographics)?
- [ ] Who may decline an application, and has a decline ever been reversed?

**Collect:**
- [ ] The current tracking spreadsheet or notebook for applicants
- [ ] Paper and PDF intake forms, especially anything HUD 9902 related
- [ ] The actual replies sent to the last 5 approved and 5 declined applicants
      (these become the email templates)
- [ ] The last completed cohort calendar and class schedule
- [ ] The foreclosure counseling checklist or script, plus the referral list
- [ ] Any client report submitted to a funder
- [ ] Everyone who applied in the last 12 months, any channel (seeds the DB)

---

### Domain 3: Jobs pipeline and employer partners

**We know:** jobs-partners.json holds Hartford HealthCare (Deborah Lee,
deborah.lee@hhchealth.org, head of hiring), Faith CDC as job-fair host, and
unnamed "collaborating agencies" entries (municipal housing authorities,
Bridgeport Landing Development, Corves Development). Every partner program is
a pathway option on the workforce application. The admin's one-click "Forward
to partner" builds the referral email. Pipeline: Submitted, Forwarded,
Interview, Placed, with a 7-day staleness flag. Every trackingLink field is
empty. Precedent: the 2022 HHC / St. Vincent's Opportunity Fair.

**Ask:**
- [ ] Is Deborah Lee still the right HHC contact, and is the email current?
      Who is the backup? Does HHC prefer a portal or ATS over email referrals?
- [ ] Has any partner ever issued a tracking link crediting the Collaborative?
      Who at each partner could?
- [ ] Named human contacts for every unnamed partner entry: which housing
      authority, who at Bridgeport Landing, who at Corves? Paper agreements or
      pure relationship?
- [ ] How do you find out someone got hired? What share of forwarded
      candidates do you never hear about again?
- [ ] Who runs placements day to day, and how many hours a week does the
      referral and follow-up work take?
- [ ] The 2022 fair, logistically: who booked the venue, who staffed sign-in,
      how were candidates registered, and does that sign-in data still exist?
- [ ] The 125 graduates/year capacity: actual throughput last year, and where
      is the graduate roster kept?
- [ ] Which employers contribute anything (sponsorship, per-placement, in-kind)?
- [ ] How do the clergy coalitions feed candidates in, and who are the named
      coordinators?
- [ ] What breaks most often between application and placement?

**Collect:**
- [ ] Any MOU or partnership letter for HHC and every other employer
- [ ] Real referral emails sent to Deborah Lee (the format partners answer)
- [ ] The 2022 fair sign-in sheets and any later fair's
- [ ] Graduate rosters and any DOL apprenticeship paperwork
- [ ] The Collaborative's full agency list
- [ ] Any placement outcomes report
- [ ] Clergy coalition coordinator contacts

---

### Domain 4: MLK Corridors pipeline

**We know:** Five stages: Received, Research, Outreach, Proposal, Funded. The
corridor-research agent (GitHub Actions, manual dispatch) produces a dossier:
street condition, officials, funding landscape, draft outreach letter. The
Connecticut precedent is documented: Norwalk, Middletown, New Britain named;
program outline to CT DECD; Jan 18, 2019 Spear Park launch; Black Ministers
Alliance of New Britain organizing. The app generates a draft funding proposal
from the applicant's own answers. All outreach is human-reviewed by design.

**Ask:**
- [ ] Who owns Corridors operationally besides Rev. McCluster? Is the Black
      Ministers Alliance still the engine, and who is the living point of
      contact?
- [ ] What happened after the 2019 DECD submission? Was funding received, how
      much, and where is the paper trail?
- [ ] Norwalk, Middletown, New Britain today: current municipal and clergy
      contacts, and when did Freedom, Inc. last speak to each? Active or
      dormant?
- [ ] Has anyone outside Connecticut ever submitted the corridor intake? Which
      pipeline stages have never actually run?
- [ ] Who may sign a letter to a mayor's office? Must it be Rev. McCluster
      personally? Where is the letterhead file?
- [ ] Is there a past proposal (the DECD outline) to use as the gold-standard
      template for AI-generated proposals?
- [ ] How long may a city sit in Research before it is a no? What disqualifies
      a city?
- [ ] Who has GitHub access to run the research workflow today?
- [ ] When a corridor gets funded, who administers the money? Any fee or
      consulting arrangement for Freedom, Inc.?
- [ ] What is the applicant org expected to do during Research and Outreach?

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

**We know:** One calendar file, future events rise, past self-archive. The
flagship is the FCDC Annual Meeting and Conference (current entry is an
explicit sample date; sponsor RSVPs promised "the package is on its way" but
nothing sends it). Rosters with email and text blast links exist in admin.
Publishing an event requires downloading events.json and committing to GitHub.
McCluster OS can draft events but may not publish them as confirmed.

**Ask:**
- [ ] Does a sponsorship package document exist? Get the latest: levels,
      prices, benefits. Who wrote it?
- [ ] Who sold 2023 sponsorships, to whom, at what amounts, and how were they
      invoiced and paid? Into which entity's account?
- [ ] Which entity legally runs the conference, and where does the revenue land?
- [ ] Real 2023 attendance, registration method, and does the attendee list
      exist anywhere?
- [ ] Who owns the venue relationship, and what is the real 2026 date?
- [ ] What do you actually use for blasts today, and has bcc ever failed on a
      big list?
- [ ] How do elders without smartphones register, who transcribes it, and
      where does it go?
- [ ] Whose personal phone sends the texts, and would a dedicated org number
      be accepted?
- [ ] Which events recur annually beyond the conference, and who leads each?
- [ ] Can the admin alone publish to the public calendar, or does Rev.
      McCluster confirm dates first?

**Collect:**
- [ ] The sponsorship package PDF with pricing
- [ ] The 2023 program book, agenda, and sponsor list
- [ ] Sponsor invoices and payment records
- [ ] Attendee and registration lists from the last conference and two summits
- [ ] Any event-tool account exports (Eventbrite, Constant Contact)
- [ ] Venue contract or booking correspondence
- [ ] A photo of the paper sign-up sheets used at Shiloh

---

### Domain 6: Communications (email, SMS, newsletter, press)

**We know:** Everything funnels to info@faithandresults.com and the phone. The
newsletter signup is a mailto link with no list behind it in the repo. News
lives in data/news.json with a curated press list. McCluster OS drafts up to
two news items per run and a Monday brief. The org does real press work (the
monopole fight got sustained coverage). Agent drafts sign as "Freedom, Inc.
digital operations," never as a person.

**Ask:**
- [ ] Does a newsletter exist in any form today? Last edition, tool, list size?
- [ ] How many contacts exist across all lists, and in what containers?
- [ ] Who is allowed to speak as Freedom, Inc. in writing? What categories can
      go out without Rev. McCluster's personal review?
- [ ] The monopole fight: who wrote the releases, who are the go-to reporters
      by name and outlet, and are the releases on file?
- [ ] Whose cell has been used for text blasts? Appetite for a dedicated
      texting number with real opt-out compliance?
- [ ] Voice rules: what makes a draft feel wrong to this audience? (The repo
      already bans em dashes and requires elder-readable formatting.)
- [ ] Who manages the Shiloh Facebook page? Coordinate or stay separate?
- [ ] Should McCluster OS news items keep publishing autonomously, or do you
      want a human gate on public news too?
- [ ] What needs to go out in Spanish?

**Collect:**
- [ ] Mailbox inventory for info@ (provider, folders, canned responses in use)
- [ ] Every list export available, any format
- [ ] The last three newsletters or bulletin inserts
- [ ] Press releases and the reporter contact list
- [ ] Reusable templates living in drafts folders or Word docs
- [ ] Brand assets: logos, letterhead, photo library beyond the repo

---

### Domain 7: Giving and finance

**We know:** Giving on the site is a mailto link. No processor, no donation
page, no giving table in the schema. The doctrine is already written: AI
tracks, reconciles, flags, and drafts, but never moves money; humans approve
every transaction; full audit logging; receipts carry tax consequences.
Entities in play: Freedom, Inc., Faith CDC, Shiloh Baptist Church, and the
Louisiana affiliate Vision Financial Services.

**Ask (with the treasurer present):**
- [ ] What happens today when someone wants to give? Check to whom? Or is
      there a platform (Givelify, Tithe.ly, PayPal, Cash App) not on this site?
- [ ] Which entity receives which money? Are all entities 501(c)(3) in good
      standing, and under which EINs are receipts issued?
- [ ] Who is the treasurer or bookkeeper for each entity, on what software,
      and who reconciles the bank accounts?
- [ ] Authorized signers per account, and the threshold for board approval?
- [ ] Are the books audited or reviewed? Last 990 filed for each entity?
- [ ] How are year-end donation receipts produced today?
- [ ] Active grants: funder, amount, restrictions, reporting deadlines, and
      who writes the financial reports?
- [ ] How did 2023 sponsorship money get invoiced, collected, recorded?
- [ ] Shiloh's Sunday counting protocol: who counts, who deposits, who
      records? (Church OS must mirror it exactly.)
- [ ] What financial task eats the most hours, and what has gone wrong before?

**Collect:**
- [ ] Chart of accounts and a recent P&L per entity
- [ ] Donor list and giving history from wherever it lives
- [ ] A sample year-end statement and acknowledgment letter as actually sent
- [ ] 990s and determination letters per entity
- [ ] Active grant agreements with reporting deadlines
- [ ] The written (or described) Sunday counting and deposit procedure
- [ ] Bank account inventory: institution, purpose, signers (descriptive only)

---

### Domain 8: People, membership, and pastoral care

**We know:** The app has device-local profiles feeding applications. Church OS
plans the full member CRM: directory with tiered roles, attendance,
engagement ("these twelve families have not been seen in a month"), pastoral
care on the tightest access tier, volunteers, sermons. The pitch admits
today's reality: a spreadsheet, a giving app, a mailing list, a filing
cabinet, and the pastor's memory.

**Ask:**
- [ ] Where is the Shiloh membership roll right now, in what format, how many
      active members and families, and when was it last cleaned?
- [ ] Who may see the full membership list? Who must NOT see giving amounts?
      Who must NOT see care notes? Name actual people first, then derive roles.
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
- [ ] Sign-in sheets, pew cards, visitor cards in current use
- [ ] The deacon and ministry assignment list
- [ ] Volunteer rosters and phone-tree lists
- [ ] The clerk's records templates (new members, baptisms, funerals)

---

### Domain 9: Partners, collaboratives, and program leads

**We know:** Four collaboratives (NFLC, CFLC, CT Faith Jobs, Faith CDC) and a
deep institutional partner list per program (FDIC, HUD, FHLB x3, Freddie Mac,
NeighborWorks, state agencies, HHC, and city partners across 19 cities). The
repo names two living contacts total. This domain is the continuity risk
McCluster OS exists to close.

**Ask (Rev. McCluster's section):**
- [ ] Pillar by pillar: who besides you can run each program today? Name,
      role, phone, email. If the answer is nobody, say so plainly.
- [ ] Each collaborative: who is on it now, how often does it actually meet,
      who convenes it, where are the member list and minutes?
- [ ] Current named contacts at FDIC, HUD, FHLB, Freddie Mac, NeighborWorks,
      CT DECD, CT Dept of Banking, CT Green Bank, HHC. Which are stale?
- [ ] Which partnerships have paper (MOU, affiliate agreement) versus pure
      relationship?
- [ ] How does a NeighborWorks engagement come in, what is the fee structure,
      and who else could deliver that training?
- [ ] For each of the 19 cities: the living anchor contact, and active versus
      historical.
- [ ] Where does your address book live, and can we do a supervised export of
      the organizational contacts? (This is the most valuable artifact in the
      entire engagement.)
- [ ] Who is the successor-designate for the key relationships, and have any
      partners met them yet?
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

**We know:** The McCluster OS charter already codifies the pattern: agents may
research, score, and draft; humans must approve anything external, any event
confirmation, any commitment or signature, anything involving money. The admin
gate today is a shared passcode with no per-person identity. The stated goal:
"whoever holds the phone that week can be anyone the family trusts."

**Ask:**
- [ ] Build the approval matrix live (the table in Part 4): for each action
      type, who can approve, who must be told, what needs a board vote?
- [ ] Officers and directors of Freedom, Inc. and Faith CDC right now? State
      filings current? Who files them?
- [ ] Who is the designated administrator after the current one, and what do
      they already know how to do?
- [ ] Where do credentials live right now: GitHub, registrar, DNS, email
      admin, any keys? Password manager or envelope in a drawer?
- [ ] Which decisions has Rev. McCluster said only he can make, in his own
      words? Which is he genuinely willing to delegate to one-tap approval?
- [ ] The emergency protocol if he is unreachable for a month: who approves
      the pipeline?
- [ ] Insurance (D&O, liability) per entity, and the registered agents?
- [ ] Has the board formally blessed the AI-agent operation? Does it need to
      for the money-adjacent phases?

**Collect:**
- [ ] Bylaws, incorporation certificates, officer lists for both entities
- [ ] The credential inventory (collected securely, never into the repo)
- [ ] A year of board minutes for both entities
- [ ] Any delegation-of-authority or check-signing policy
- [ ] The succession plan or letter of wishes, however informal
- [ ] Insurance declarations pages

---

### Domain 11: Privacy, consent, and security (close with this)

**We know:** Consent is structural on every form. The Church OS doctrine:
local-first, consent-first, tiered access, encryption, audited access. Current
gaps are real: PII in localStorage, a passcode committed to a public repo,
blast tools that expose full rosters in mailto links, foreclosure data that is
financial-distress information, an elder population, and SMS consent rules.

**Ask:**
- [ ] Has anyone ever asked to be removed or deleted, and what did you do?
- [ ] What confidentiality rules bind the counseling work (HUD standards,
      state requirements, partner agreements)? Any privacy notice in use?
- [ ] Who has known the admin passcode, and which devices hold real applicant
      data in their browsers right now?
- [ ] Did the people you text ever agree to receive texts? Any complaints?
- [ ] Does "data never leaves the building" bind now, or at Church OS launch?
      (Supabase cloud is the bridge; the on-prem box is the destination.)
- [ ] The tiers, concretely: who may see foreclosure details, giving amounts,
      care notes, everything? Names first, roles second.
- [ ] Are minors ever in the data (youth mentoring), and what parental consent
      exists?
- [ ] Walk me through the nightmare scenario for this congregation, so the
      controls match the real stakes.

**Collect:**
- [ ] Any privacy notice, confidentiality agreement, or intake disclosure in
      use
- [ ] The device list that has used admin.html
- [ ] Partner data-handling requirements (HHC, HUD, state)
- [ ] Consent language on paper forms if different from the app's
- [ ] Existing opt-out and do-not-contact notes, wherever kept

---

## Part 3: What every answer becomes (the automation blueprint)

Every flow follows one shape. Memorize it, because it is the answer to "what
will the AI do with this":

**Trigger → AI does the work → Approval in the admin panel → Execution →
Notification.**

The high-value flows, in build order:

1. **Urgent foreclosure alert.** Application arrives with a late stage or sale
   date → AI classifies severity, alerts the on-duty counselor by SMS within
   minutes (internal alerts need no approval), sends the applicant an
   acknowledgment with the hotline number → counselor approves any outbound
   advice. *Days cost homes here. This flow ships first.*
2. **Applicant acknowledgment and decision emails.** Every submission gets an
   instant receipt with its FR- reference. Approve or Decline drafts the
   personalized decision email from the reviewer's note → one tap releases it.
3. **Partner referral.** Workforce approval → AI matches the pathway, composes
   the referral to the named partner contact → admin's Forward tap releases a
   tracked send, stage auto-advances, silence gets nudged after N days, and
   partner replies are parsed into proposed stage changes.
4. **Corridor auto-pipeline.** Corridor application → research agent
   dispatches itself with the applicant's city → dossier lands → admin
   advances to Outreach → AI letters go out only on explicit approval →
   proposal assembles from the DECD gold standard.
5. **Sponsor pipeline.** Sponsor RSVP → package sends immediately (it was
   already promised in-app) → conference lead gets pinged (this is revenue) →
   AI drafts the level pitch and invoice for approval.
6. **RSVP confirmations and reminders.** Confirmation with calendar attachment
   on RSVP, SMS reminders day-before and day-of, headcount briefs to the
   organizer.
7. **Newsletter.** Real signup form → ESP audience with consent recorded → AI
   drafts each edition from the news, events, and briefs → admin edits and
   approves → send, with an archive.
8. **Giving.** Payment lands on the chosen platform → AI records, drafts the
   receipt with tax language, flags anomalies → treasurer approves in batch →
   year-end statements generate themselves. The AI never touches the money.
9. **Care intelligence (Church OS phase).** Attendance recorded → "not seen in
   N weeks" list drafts privately to the pastor alone → he decides who to
   reach and how. This list never automates outward.
10. **The Monday brief, delivered.** The McCluster OS brief arrives as an
    email or text instead of waiting for someone to open the admin.

---

## Part 4: The approval matrix (fill this in live, in the room)

The single most important artifact of the governance session. Categories the
agents already respect: anything external, anything confirmed public, anything
committed or signed, anything money.

| Action | AI drafts? | Who approves | Who is told | Board vote? |
|---|---|---|---|---|
| Acknowledgment email to applicant | Yes | Pre-approved template | Admin digest | No |
| Decision email (approve/decline) | Yes | Admin | Pillar lead | No |
| Referral to employer partner | Yes | Admin (Forward tap) | Partner, applicant | No |
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

Rules that never bend, already codified in the charter and the Church OS
doctrine: the AI never moves money, never signs, never publishes an event as
confirmed, never sends anything external without its category's approval, and
never speaks as a person.

---

## Part 5: The endpoint map

What exists today: the outbound webhook contract (built, unconfigured), the
Supabase schema (written, undeployed), the GitHub Actions agents (built,
secret status unknown), the Pages deploy pipeline (live), and mailto/sms
patterns standing in for real sends.

What the build needs, in priority order. Each is an interview decision (which
provider, which account, who pays):

| # | Endpoint | What it unlocks | Candidates |
|---|---|---|---|
| 1 | Production database + auth | Submissions leave the browser; real admin accounts; audit trail | Supabase (SQL already written) |
| 2 | Automation hub (webhook receiver) | The catcher that branches every event; urgent-intake filter; auto-dispatch of corridor research | n8n, Make, Zapier, or an Edge Function |
| 3 | Transactional email | Every acknowledgment, decision, referral, confirmation, package | Resend, Postmark, SES |
| 4 | SMS | Urgent alerts, event reminders, roster texts with opt-out (A2P 10DLC registration for a US nonprofit) | Twilio, Telnyx |
| 5 | Internal alerting | Instant pings: urgent intake, sponsor RSVP, agent run needs a decision | Slack webhook, ntfy, Pushover |
| 6 | ESP / newsletter | The real "Stay close" list with consent | Mailchimp, Constant Contact, Resend Audiences |
| 7 | Giving / payments | The Give door becomes a checkout with automatic receipts | Stripe, Givebutter, Tithe.ly, Zeffy |
| 8 | Accounting | Draft journal entries, receipts, year-end statements | QuickBooks Online, Aplos |
| 9 | Calendar | Auto-updating ICS feed; bookable counseling slots | Google Calendar API, Cal.com |
| 10 | E-signature | MOUs, sponsorship contracts, consent forms | DocuSign, Dropbox Sign, SignWell |
| 11 | GitHub API (PR publish gate) | Agents publish via pull request; merge = approval | GitHub App / fine-grained PAT |
| 12 | PDF generation | Persisted branded proposals and referral packets | Puppeteer in an Action, pdf-lib |
| 13 | CRM of record | One person, one record, full history | Sheets day one; HubSpot/Salesforce NP later |
| 14 | Civic data lookup | Structured officials data for corridor research | Google Civic Info, Cicero, OpenStates |
| 15 | Voice / hotline | Ring groups, voicemail transcription into intake, after-hours urgent routing | Twilio Voice, Google Voice NP, OpenPhone |
| 16 | Referral tracking links | Placements attributable to the Collaborative | Dub.co, Short.io, UTM conventions |

---

## Part 6: The agent roster (Gemini and Anthropic, working the same queue)

The architecture is a **gateway**: one endpoint, a router that reads each job
and dispatches to the right provider. Both agents write into the same approval
queue in the admin panel; the admin never needs to know or care which brain
drafted what. The split by strength and by cost:

**Anthropic (Claude) agents, already in place, extend them:**
- The McCluster OS weekly engine: partnership prospecting, news, the Monday
  brief (built)
- The corridor researcher: dossiers with web search (built)
- New: the drafting desk. Decision emails, referral letters, proposals,
  newsletter editions, board packets. The jobs where judgment and voice
  carry the most weight.

**Gemini agents, new lane:**
- High-volume, low-cost triage: classify every inbound event, route it, score
  urgency (the free tier absorbs this traffic)
- Vision: read the paper forms, sign-in sheets, giving envelopes, and filing
  cabinet scans the interview will surrender
- Long-context digestion: transcribed interviews, board minutes, grant
  agreements, the WordPress archive

**Structural rules regardless of provider:** every agent writes drafts into
the same persisted approval queue; every send goes through the same gated
send path; every action logs who (or what) did it and who approved it; keys
live in repo secrets or the box's vault, never client-side; and if one
provider is down, the router fails over to the other, because the queue
outlives any vendor.

The 13 build gaps the audit confirmed (no approval-queue persistence, no
roles, no SMS, no email send, no payments, no audit log, no provider router,
no inbound webhook surface, no reliable outbound webhook, no scheduler beyond
one cron, no secrets pattern, no Church OS data model, no agent observability)
are the engineering backlog. The interview's answers set their order.

---

## Part 7: Walking out

You are done when you can answer yes to all five:

- [ ] The approval matrix is filled in, in their words, with named people.
- [ ] The go-live decision is made: database on, webhook set, and the urgent
      foreclosure alert has a named recipient with a phone number.
- [ ] The artifact folder holds the templates, lists, and the address-book
      export, and every artifact has an owner and a scan date.
- [ ] Every pillar, program, and collaborative has a named living contact, or
      an honest "nobody," written down.
- [ ] The administrator can describe, in one sentence each, what the AI will
      do, what they will approve, and what will never happen without them.

Then the build session starts, and it starts with flow #1: the family with a
sale date scheduled, who tonight would generate zero alerts, and next month
never will again.
