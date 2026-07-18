# Faith and Results — the Freedom, Inc. app

The new faithandresults.com, rebuilt as an installable mobile app: Freedom, Inc.'s
credentials (FDIC · HUD · Federal Home Loan Bank · NeighborWorks America) on the front
door, five big tabs on the bottom, the seventeen cities as a tappable constellation,
and four ways to say yes — installable to any phone's home screen, working offline.

**Elder-first by design:** body type is Atkinson Hyperlegible (the Braille Institute's
low-vision typeface, self-hosted), headlines are Bitter 800–900, 20px base, AAA contrast,
tap targets 48px and up — no fine print exists anywhere in the app.

## The app

- **Five tabs** — Home, Programs, Trainings, Cities, Connect — plus Leadership, News,
  program/training detail, application, and profile screens.
- **Every program** from the original faithandresults.com, under its pillar — from
  Homes Saved By Faith (100K+ served) to the MLK Corridors Initiative to Saving
  America's Soul — each with partners, records, and ways in. All data-driven
  (`data/programs.json`).
- **Trainings that take applications** — five trainings with tailored questions;
  people build a profile once and every application pre-fills. Statuses (received /
  approved / declined) show in their profile.
- **An admin backend** (`admin.html`) — dashboard, application review with
  approve/decline + notes, people directory, CSV exports, automations panel.
- **Automations to other providers** — every application, profile, and status change
  can POST to a webhook (Zapier / Make / n8n → Mailchimp, Sheets, CRMs, Slack, SMS).
  See `docs/BACKEND.md`.
- **Demo mode by default, real database when ready** — flip `data/config.json` to
  Supabase for real storage and real admin login (`docs/supabase-setup.sql`).
- **Installable + offline** — one-tap install on Android/desktop, Share → Add to Home
  Screen on iPhone; the whole shell works without a connection.
- **Deep-linkable** — every screen has a URL (`#/training/foreclosure-help`,
  `#/city/bridgeport-ct`), so any view can be texted to a partner.
- **Self-expiring news** — anything older than 18 months hides itself automatically.

## Files

- `index.html` — the app (shell, screens, router, forms, constellation)
- `admin.html` — the admin backend (review, exports, automations)
- `js/store.js` — the shared data layer (demo / Supabase / webhook adapters)
- `data/config.json` — backend mode, webhook URL, admin passcode
- `data/programs.json` / `data/trainings.json` — the catalog (edit → app re-renders)
- `data/news.json` — the news feed (edit this file to publish news)
- `docs/BACKEND.md` / `docs/supabase-setup.sql` — go-live guide for storage + automations
- `manifest.webmanifest` / `sw.js` — install metadata and the offline service worker
- `assets/icons/` — home-screen icons (any + maskable + Apple touch)
- `assets/freedom-inc.vcf` — the "Save our contact card" download
- `deck.html` / `Freedom-Inc-Pitch-Deck.pdf` — the 10-slide pitch, web and printable
- `assets/fonts/` — self-hosted type (84 KB total, no CDN dependency)
- `.github/workflows/fetch-assets.yml` — pulls the old site's images into `assets/scraped/`
  (run from the Actions tab; GitHub's runners have the network this needs)

## Go live

1. **Settings → Pages** → Deploy from branch → `main` / root → Save.
   Live at `https://mcclusterishere.github.io/faith-and-results/` in ~2 minutes.
2. Open that link on a phone → **Add to Home Screen** → it's an app.
3. When the client signs: point `faithandresults.com` at Pages (custom domain + DNS),
   and their old hosting bill ends. (HTTPS is required for install + offline — Pages
   provides it automatically.)

## Still needed from the client

- Hosting/domain access for the cutover
- Impact numbers per pillar (people trained, homes saved, dollars moved)
- Leadership photos and each city's project story (every city's sheet has a slot waiting)
