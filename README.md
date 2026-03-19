# NHRA Content Intelligence Autoresearch

A Next.js prototype for an NHRA operator website that continuously learns what content is working, tracks public competitor patterns, and recommends what to post next.

## What is included

- `src/app/dashboard/page.tsx` for the race-week operator dashboard
- `src/app/login/page.tsx` for Firebase email/password auth
- `src/app/api/auth/session/route.ts` for secure app sessions
- `src/app/api/ingest/meta/route.ts` for live-or-fallback Meta-owned ingestion
- `src/app/api/ingest/youtube/route.ts` for live-or-fallback YouTube ingestion
- `src/app/api/ingest/event/route.ts` for live-or-fallback NHRA event context
- `src/app/api/competitors/route.ts` for competitor digest output
- `src/app/api/recommendations/route.ts` for a consolidated JSON feed
- `src/lib/scoring/recommendations.ts` for recency-weighted scoring and next-best recommendations
- `src/lib/tags/content-taxonomy.ts` for the shared motorsports taxonomy
- `src/lib/live-data.ts` for connector aggregation and fallback handling
- `src/lib/auth/` and `src/lib/firebase/` for multi-user auth and Firestore-backed connector ownership

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/dashboard`.

## Enable Firebase auth

Copy `.env.example` to `.env.local` and fill in both the client and admin Firebase values:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Then enable Email/Password sign-in in your Firebase project and visit `http://localhost:3000/login`.

## Enable live connectors

- `META_ACCESS_TOKEN`
- `META_INSTAGRAM_BUSINESS_ACCOUNT_ID` or `META_FACEBOOK_PAGE_ID`
- `YOUTUBE_API_KEY`
- `YOUTUBE_CHANNEL_ID`
- `NHRA_EVENT_FEED_URL`

Connectors are now stored per signed-in user in Firestore. If a connector is not configured for that user, the app falls back to env values or sample data and shows that status in the dashboard.

## Product direction

This first version is intentionally human-in-the-loop:

- Score what is working now
- Watch competitor timing and packaging
- Recommend what NHRA should post next
- Keep an experiment log of winners and losers

This version now supports:

- Firebase email/password auth
- one personal workspace per user
- one per-user connector profile stored in Firestore
- dashboard-only access for signed-in users

The next step after this is workspace sharing and scheduled ingestion so multiple team members can collaborate inside the same connector workspace.
