# The backend — from demo to live in one config file

Everything the app and admin store or send flows through `js/store.js`, and one file
decides where it goes: **`data/config.json`**.

```json
{
  "mode": "demo",
  "supabaseUrl": "",
  "supabaseAnonKey": "",
  "webhookUrl": "",
  "notifyEmail": "info@faithandresults.com",
  "adminPasscode": "freedom2026"
}
```

| Setting | What it does |
| --- | --- |
| `mode: "demo"` | Zero setup. Applications and profiles live in the browser's localStorage. Submissions made on a device appear in **that device's** admin — perfect for demos, useless for production. |
| `mode: "supabase"` | Real database, real admin login. Applications/profiles insert from the app; admins sign in with email + password to read and review them. |
| `webhookUrl` | **Automations.** Fires in *any* mode: every application, profile save, and status change POSTs JSON to this URL. |
| `adminPasscode` | Demo mode's courtesy lock for `admin.html`. It is client-side and **not security** — anyone determined can bypass it. Real access control comes with Supabase mode. |

---

## Automations to other providers (works today, any mode)

Set `webhookUrl` to a catcher from **Zapier** (Webhooks by Zapier → Catch Hook),
**Make.com** (Custom webhook), or **n8n** (Webhook node). Each event arrives as:

```json
{
  "source": "faithandresults-app",
  "type": "application | profile | application-update | test",
  "sentAt": "2026-07-18T15:00:00.000Z",
  "data": { "id": "FR-…", "name": "…", "email": "…", "trainingName": "…", "answers": { } }
}
```

From the Zap/scenario, fan out anywhere:

- **Email** — notify `notifyEmail` on every application (Gmail/Outlook step)
- **Google Sheets** — append a row per application (a free CRM on day one)
- **Mailchimp / Constant Contact** — subscribe "Stay close" profiles to the newsletter
- **Slack / SMS** — ping the team the moment an **urgent foreclosure intake** arrives
  (filter on `data.training = "foreclosure-help"`)
- **Any CRM** — HubSpot, Salesforce, Airtable: map the same fields

Test it from **Admin → Automations → Send a test event**.

---

## Going live with Supabase (free tier is fine)

1. Create a project at supabase.com → note the **Project URL** and **anon public key**.
2. In the Supabase **SQL Editor**, run everything in [`supabase-setup.sql`](supabase-setup.sql)
   — it creates the `applications` and `profiles` tables and the row-level-security
   policies (anyone may *insert*; only signed-in admins may *read/update*).
3. In **Authentication → Users**, add the admin user(s) — email + password.
4. Edit `data/config.json`:

   ```json
   { "mode": "supabase", "supabaseUrl": "https://YOURPROJECT.supabase.co", "supabaseAnonKey": "eyJ…", "webhookUrl": "…" }
   ```

5. Commit and push. `admin.html` now asks for the Supabase email + password, and
   every device's submissions land in one real database.

The anon key is designed to be public — safety comes from the RLS policies, which is
why step 2 is not optional.

---

## Content management (no code needed)

The catalog is data, not markup. Edit these and push — the app re-renders itself:

- `data/programs.json` — every program, grouped by pillar
- `data/trainings.json` — every training and its application questions
- `data/news.json` — news & events (entries older than 18 months self-hide)

## Alternative: forms-only backend

No database wanted? Leave `mode: "demo"` and set `webhookUrl` to a Formspree/Basin
endpoint — every application still emails the team and demo mode keeps the in-app
experience working.
