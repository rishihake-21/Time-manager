# Ledger — Timetable Planner

College and personal schedule in one app: weekly recurring blocks, per-day
overrides (so personal work can slot into normal college hours just for one
day), day/week/month views, real-time sync via Supabase, and installable on
a phone home screen.

## How the data model works

- **`recurring_blocks`** — your normal weekly pattern. Each row is one class
  or personal block: category (`college`/`personal`), day of week, start/end
  time, location, notes.
- **`date_exceptions`** — changes for one specific date only:
  - `type = 'cancel'` removes one recurring block on that date.
  - `type = 'add'` inserts an ad-hoc block on that date (e.g. "dentist
    appointment" dropped into what's normally a lecture slot).

The app merges these two tables at read time, so "today's schedule" is
always computed fresh — nothing gets duplicated across weeks.

## 1. Set up Supabase

1. Create a free project at supabase.com.
2. Open the SQL editor and run everything in `sql/schema.sql`. This creates
   the two tables, turns on row-level security (each user only ever sees
   their own rows), and enables real-time.
3. In **Project Settings → API**, copy the **Project URL** and **anon public
   key**.
4. In **Authentication → Providers**, email/password is on by default. If
   you don't want the "confirm your email" step while testing, turn off
   "Confirm email" under Authentication → Settings.

## 2. Run locally

```bash
npm install
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Open http://localhost:3000, create an account, and start adding blocks.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. Add the two environment variables from `.env.local` in the Vercel
   project settings (Settings → Environment Variables).
4. Deploy. Vercel gives you HTTPS automatically, which real-time and PWA
   install both require.

## 4. Add it to your phone's home screen

- **Android (Chrome):** open the site, tap the menu (⋮), tap **Add to Home
  screen** / **Install app**.
- **iPhone (Safari):** open the site, tap the Share icon, tap **Add to Home
  Screen**.

It'll open full-screen like a native app, no browser bar.

## Notes on the current build

- The two included accent colors (blue for college, ochre for personal) are
  set in `tailwind.config.js` under `college` / `personal` — change the hex
  values there if you want different colors.
- Icons in `public/icons/` are simple placeholders generated for this build;
  swap them for your own 192×192 / 512×512 PNGs whenever you like — the
  manifest already points at those filenames.
- The week starts on Monday by default (`lib/dateUtils.js`, `weekStartsOn`
  parameter) — pass `0` anywhere it's used if you want Sunday-start weeks.
- If you'd rather not deal with confirmation emails at all during
  development, disable "Confirm email" in Supabase Auth settings (step 1.4
  above); re-enable it before sharing the link with anyone else.
