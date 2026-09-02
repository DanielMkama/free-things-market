# The Free Things Market

**Nothing for sale. Everything to give.**

A functional MVP for a digital generosity platform. People offer things, skills,
time, knowledge and connections, ask for what they need, connect, complete an
act of generosity, and keep it moving with **Give Forward**.

The product loop:

```
GIVE → CONNECT → RECEIVE → GIVE FORWARD
```

North-star metric: **completed acts of generosity** — not signups, not money.

---

## Stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS 4** — editorial design system in `app/globals.css`
- **Supabase** — Postgres (all persistent data), Auth (email/password), Storage
  (avatars + post images). Accessed with `@supabase/supabase-js` /
  `@supabase/ssr`.
- **Resend** for transactional email (optional — logs to console without a key)

Row Level Security is enabled on every table with a full policy set
(`supabase/schema.sql`). Server reads run as the logged-in user (or `anon`);
multi-party writes (connections, generosity acts, chain links) and the admin
dashboard use the service-role client with app-level ownership checks.

## Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query →** paste all of `supabase/schema.sql` and run it.
   This creates the tables, the `handle_new_user` trigger, the `impact_stats`
   view, the `user_generosity` / `link_act_to_chain` functions, all RLS
   policies, and the `avatars` / `post-images` storage buckets.
3. **Authentication → Sign In / Providers → Email →** turn **off**
   "Confirm email" (the app logs users in immediately after signup).
4. **Project Settings → API →** copy the values into `.env.local` (see below).

## Run it

```bash
npm install
cp .env.example .env.local     # then fill in the Supabase keys
npm run seed                    # optional: realistic demo data
npm run dev                     # http://localhost:3000
```

### Demo logins (after `npm run seed`)

| Role   | Email                       | Password     |
| ------ | --------------------------- | ------------ |
| Admin  | `admin@freethings.market`   | `admin12345` |
| Member | `daniel@example.com` … `sam@example.com` | `password123` |

## Environment variables

| Var                             | Purpose                                             |
| ------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser-safe)                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Server only** — admin client + `scripts/*`       |
| `NEXT_PUBLIC_SITE_URL`          | Base URL for emails & Open Graph                   |
| `RESEND_API_KEY`                | Send real email; blank ⇒ email prints to console  |
| `MAIL_FROM`                     | From address for transactional email              |

## What works

Public: landing (with **live** impact stats), give board + filters, need board +
filters, offer/request detail pages with simple matching, public profiles,
community impact page, generosity-chain pages, about, community guidelines,
physical-market page. Every offer/request/profile has a shareable URL and Open
Graph tags.

Authenticated: Supabase email/password auth, 4-step onboarding, create offers &
requests, request a connection, accept/decline, mark an interaction complete →
**generosity act**, the **Give Forward** prompt and commitment, complete a Give
Forward → extends a **generosity chain**, personal dashboard, profile settings,
**avatar upload** (Supabase Storage).

Admin (`/admin`): user / offer / request / connection / generosity metrics,
offers-by-category, moderation queue for reports, hide / remove content, suspend
users, and a button to run Give Forward reminders.

Email (console in dev): connection request, connection accepted, "did it
happen?", Give Forward reminder, Give Forward completed.

## Scripts

| Command             | Does                                                     |
| ------------------- | ------------------------------------------------------- |
| `npm run seed`      | Delete the demo auth users (cascades) and rebuild demo data |
| `npm run reminders` | Send due Give Forward reminders, expire past-due ones (cron-friendly) |
| `npm run build`     | Production build                                         |

## Project shape

```
supabase/schema.sql   Postgres schema + triggers + view + RPCs + RLS + storage
middleware.ts          Supabase session refresh (@supabase/ssr)
lib/supabase/server.ts cookie-bound client (RSC / actions) — runs as the user
lib/supabase/admin.ts  service-role client — RLS-bypassing, server only
lib/auth.ts            getCurrentUser / requireUser* on top of Supabase Auth
lib/models.ts          row → typed object mappers
lib/queries.ts         read queries (boards, detail, profile, connections)
lib/stats.ts           impact_stats view + user_generosity RPC
lib/chains.ts          generosity-chain reads + link_act_to_chain RPC
lib/actions/           server actions (auth, posts, connections, moderation, storage)
lib/mailer.ts          Resend / console email
scripts/seed.mjs       demo data (service-role + Auth Admin API)
scripts/reminders.mjs  Give Forward reminder job
```

## Deploying to Vercel

- Set the six env vars above in the Vercel project (`SUPABASE_SERVICE_ROLE_KEY`
  as a plain, non-`NEXT_PUBLIC_` variable).
- Supabase → Authentication → URL Configuration: set **Site URL** and add the
  deploy domain to **Redirect URLs**.
- The storage buckets and RLS policies come from `supabase/schema.sql` — run it
  against the production project once.
- `npm run seed` is for demos only; it deletes the seeded auth users.

## Notes

- `events` + `event_participants` exist so physical-market "event mode" can be
  layered on later without a migration.
- Matching is deliberately simple (category / type / location / keyword overlap)
  — no AI, per the brief.
