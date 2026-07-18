# Faith and Results — the Freedom, Inc. app

The new faithandresults.com, rebuilt as an installable mobile app: Freedom, Inc.'s
credentials (FDIC · HUD · Federal Home Loan Bank · NeighborWorks America) on the front
door, five big tabs on the bottom, the seventeen cities as a tappable constellation,
and four ways to say yes — installable to any phone's home screen, working offline.

**Elder-first by design:** body type is Atkinson Hyperlegible (the Braille Institute's
low-vision typeface, self-hosted), headlines are Bitter 800–900, 20px base, AAA contrast,
tap targets 48px and up — no fine print exists anywhere in the app.

## The app

- **Five tabs** — Home, The Work, Cities, News, Connect — plus a Leadership detail screen.
- **Installable** — Android/desktop get a one-tap install prompt; iPhone gets Share →
  Add to Home Screen instructions. Opens full screen with its own icon.
- **Works offline** — a service worker caches the whole shell; news stays network-first
  so nothing stale is shown when a connection exists.
- **Deep-linkable** — every screen and every city has a URL (`#/cities`, `#/city/bridgeport-ct`),
  so any view can be texted to a partner.
- **Self-expiring news** — anything older than 18 months hides itself automatically.

## Files

- `index.html` — the entire app (shell, five screens, router, constellation)
- `manifest.webmanifest` / `sw.js` — install metadata and the offline service worker
- `assets/icons/` — home-screen icons (any + maskable + Apple touch)
- `assets/freedom-inc.vcf` — the "Save our contact card" download
- `data/news.json` — the news feed (edit this file to publish news)
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
