# Carfinder backend (NestJS)

API, scraper worker, Prisma, and BullMQ. Run all commands from this directory (`backend/`).

## Prerequisites

- Node.js 20+
- PostgreSQL and Redis (e.g. via `docker compose up -d` from the **repository root**)

## Quick start

```bash
# From repo root: configure and start Postgres + Redis
cd ..
cp .env.example .env
# Edit .env with strong values for POSTGRES_PASSWORD and REDIS_PASSWORD
docker compose up -d
cd backend

npm install
cp .env.example .env
# Keep DATABASE_URL/REDIS_URL credentials aligned with ../.env and set JWT_SECRET
npm run db:setup
npm run prisma:seed
npm run start
```

## Useful scripts

- `npm run prisma:generate` — Generate Prisma client
- `npm run prisma:push` — Push schema to the database
- `npm run prisma:seed` — Seed admin user (`admin` / `admin123`)
- `npm run db:setup` — `prisma:generate` + `prisma:push`
- `npm run start` — Nest app (scheduler, workers, HTTP, Bull Board)
- `npm run start:workers` — Same with `WORKER_CONCURRENCY=50`

## Scraper behavior

Distributed CarSensor scraper with:

- Dynamic page discovery from the `最後` pagination link
- Hourly scheduler (`SCRAPE_CRON`) that creates run snapshots
- BullMQ queue with one job per page
- Worker processing with retries and exponential backoff
- PostgreSQL persistence via Prisma with idempotent upserts

### Target listing

- `https://www.carsensor.net/usedcar/index1.html?SORT=19`

### Extracted fields (per car)

- `id`, `brand`, `fullTitle`, `model`, `year`, `mileageKm`, `priceYen`, `engineCc`, `sellerName`, `listingUrl`, `mainPhotoUrl`, `photoUrls`, `raw`

### Notes

- KISS parsing; price normalized from values like `480` (万円) into yen.
- If the page does not expose image URLs in static HTML, photo fields may be `null` or empty.

## Environment variables

See `.env.example` in this folder.
