# Daily Housekeeping Reports

Mobile-first PWA for daily housekeeping report submission and manager dashboards. Built with Next.js 14, Tailwind CSS, Supabase, and shadcn/ui.

## Features

- **Staff form** (public, no login) — touch-friendly mobile UI with offline queue + sync
- **Manager dashboard** (magic link auth) — 8 analytics tabs with lazy-loaded charts
- **PWA** — installable, works offline for form submission
- **GMT+4 timezone** — all time calculations use `Asia/Dubai`

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Supabase Setup

1. Create a new Supabase project.
2. Open **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_initial.sql
   ```
3. Enable **Email** auth under Authentication → Providers.
4. Under Authentication → URL Configuration, set:
   - **Site URL**: your production URL (e.g. `https://your-app.vercel.app`)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and your production callback URL
5. Copy your project URL and anon key from **Settings → API**.

## Local Development

1. Clone and install:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
3. Fill in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) for the staff form.
6. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) — you'll be redirected to login. Use a manager email to receive a magic link.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the same environment variables from `.env.local`.
4. Deploy.
5. Update Supabase **Site URL** and **Redirect URLs** with your Vercel domain.

## Build

```bash
npm run build
npm run start
```

## Project Structure

```
app/
  page.tsx              # Staff report form (public)
  dashboard/page.tsx    # Manager dashboard (auth required)
  login/page.tsx        # Magic link login
components/
  form/                 # Report form + offline banner
  dashboard/            # 8 dashboard tab components
  layout/               # Header, bottom nav, install prompt
lib/
  supabase.ts           # Browser Supabase client
  offline-queue.ts      # localStorage offline sync
  timezone.ts           # GMT+4 helpers
supabase/migrations/    # Database schema + seed data
public/manifest.json    # PWA manifest
```

## Database Schema

| Table    | Purpose                          |
|----------|----------------------------------|
| `staff`  | Staff members with LTR codes     |
| `stores` | Store codes and names            |
| `reports`| Daily housekeeping submissions   |

RLS policies:
- **Public**: read staff/stores, insert reports
- **Authenticated**: read all reports

## Mobile / PWA Notes

- Minimum 44px touch targets on all interactive elements
- 16px base font to prevent iOS input zoom
- Bottom tab navigation on mobile (Form / Dashboard)
- Offline form saves to `localStorage` and syncs when back online
- "Add to Home Screen" prompt appears after the 2nd visit

## License

Private — internal use.
