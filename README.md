# Faith and Results — the Freedom, Inc. rebuild

The new faithandresults.com: Freedom, Inc.'s credentials (FDIC · HUD · Federal Home Loan
Bank · NeighborWorks America) on the front door, four pillars, the collaboratives in plain
English, fifteen cities on one screen, and four ways to say yes.

**Elder-first by design:** body type is Atkinson Hyperlegible (the Braille Institute's
low-vision typeface, self-hosted), headlines are Bitter 800–900, 20px base, AAA contrast —
no fine print exists anywhere on the site.

## Files

- `index.html` — the site (one page, six sections, cities grid is interactive)
- `deck.html` / `Freedom-Inc-Pitch-Deck.pdf` — the 10-slide pitch, web and printable
- `assets/fonts/` — self-hosted type (84 KB total, no CDN dependency)
- `.github/workflows/fetch-assets.yml` — pulls the old site's images into `assets/scraped/`
  (run from the Actions tab; GitHub's runners have the network this needs)

## Go live

1. **Settings → Pages** → Deploy from branch → `main` / root → Save.
   Live at `https://mcclusterishere.github.io/faith-and-results/` in ~2 minutes.
2. **Actions → "Fetch assets from faithandresults.com" → Run workflow** — if their server
   admits GitHub's runners, the real logos and photos land in `assets/scraped/` for the
   next design pass.
3. When the client signs: point `faithandresults.com` at Pages (custom domain + DNS),
   and their old hosting bill ends.

## Still needed from the client

- Hosting/domain access for the cutover
- Impact numbers per pillar (people trained, homes saved, dollars moved)
- Leadership photos and each city's project story (the cities grid has a slot waiting)
