# Running the site — the one-page guide

Everything on the site is data. Edit a file, commit, push to `main` — the site
redeploys itself in about a minute. No code changes needed for any of this.

| I want to… | Edit this | Notes |
| --- | --- | --- |
| Add or change an **event** | `data/events.json` | Future events rise to the top and past ones archive themselves. Add `"link"` for a watch-the-recording button. Or draft in **Admin → Events** and download the merged file. |
| Add or change a **program** | `data/programs.json` | Grouped by pillar. `"stat"` renders as a gold chip; `"screen"` points a card at a custom screen. |
| Add or change a **training** (and its application questions) | `data/trainings.json` | `questions` become form fields: `select` (needs `options`), `text`, or `long`. |
| Add a **jobs partner / employer** | `data/jobs-partners.json` | Each program listed becomes an option in the workforce application; `contactEmail` powers Admin's one-click Forward. |
| Post **news** | `data/news.json` | Anything older than 18 months hides itself. |
| Change **backend mode / webhook / admin passcode** | `data/config.json` | See `docs/BACKEND.md` for going live with Supabase + automations. |
| Add **photos or PDFs** | `assets/media/` | The whole WordPress library is already there; reference files by path. |
| Run **corridor research** on an applicant's city | Actions → "MLK corridor research" | Needs the `ANTHROPIC_API_KEY` secret; dossiers appear in **Admin → Research**. |
| Review **applications / RSVPs / people** | `/admin.html` | Demo passcode is in `data/config.json`. |

**The one rule:** keep JSON valid — a missing comma stops that file from loading.
Check any edit at jsonlint.com if unsure, or edit through the Admin panel where possible.
