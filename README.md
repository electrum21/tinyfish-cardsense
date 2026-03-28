# TinyFish Credit Intelligence

A deployment-ready full-stack app for turning TinyFish scrape output into a polished Singapore credit-card intelligence dashboard.

The project is split into:

- `apps/web`: Next.js App Router frontend designed for Vercel
- `apps/api`: Express + TypeScript backend designed for Render
- `supabase/schema.sql`: normalized tables, views, and policies

## What the app does

- imports TinyFish async result payloads into Supabase
- stores bank cashback cards, signup promos, merchant cashback offers, and restaurant deals
- shows a Vercel-ready frontend with executive summary metrics and curated sections
- exposes a Render-friendly API for ingestion, insight summaries, and AI recommendations
- includes placeholders for TinyFish, OpenAI, and Supabase environment variables

## Recommended deployment setup

### 1. Supabase

1. Create a new Supabase project.
2. Run [`supabase/schema.sql`](C:\Users\aweso\OneDrive\Documents\Playground\supabase\schema.sql).
3. Copy values into `.env` from `.env.example`.

### 2. Backend on Render

1. Create a new Web Service on Render pointing at `apps/api`.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Add the backend environment variables from `.env.example`.
5. Optional: use [`render.yaml`](C:\Users\aweso\OneDrive\Documents\Playground\render.yaml) as a starting point.

### 3. Frontend on Vercel

1. Import this repo into Vercel.
2. Set the root directory to `apps/web`.
3. Add the public frontend variables plus Supabase anon credentials.
4. Set `NEXT_PUBLIC_API_BASE_URL` to your Render service URL.

## Importing TinyFish data

The backend exposes:

- `POST /api/ingest/tinyfish`

Send the full TinyFish JSON payload as the request body and include:

- Header: `x-ingest-secret: <INGEST_SHARED_SECRET>`

Example:

```bash
curl -X POST https://your-render-service.onrender.com/api/ingest/tinyfish \
  -H "Content-Type: application/json" \
  -H "x-ingest-secret: your-secret" \
  --data @tinyfish_async_results_20260328_124339.json
```

## Environment split

### Frontend on Vercel

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend on Render

- `API_PORT`
- `CORS_ORIGIN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `INGEST_SHARED_SECRET`
- `TINYFISH_API_KEY`
- `TINYFISH_BASE_URL`
- `TINYFISH_WEBHOOK_SECRET`

## Notes

- The implementation is modeled on the TinyFish output you shared.
- The PDF text extractor available in this environment was limited, so the product framing is inferred from the provided scrape categories and data model.
- The codebase is ready to install and run on a machine with Node.js 20+.
