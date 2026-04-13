# Carfinder Scraper Worker

Distributed CarSensor scraper with:

- Dynamic page discovery from the `最後` pagination link.
- Hourly scheduler (`SCRAPE_CRON`) that creates run snapshots.
- BullMQ queue with one job per page.
- Worker processing with retries and exponential backoff.
- PostgreSQL persistence via Prisma with idempotent upserts.

## Prerequisites

- Node.js 20+
- Docker + Docker Compose

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start infrastructure:

```bash
docker compose up -d
```

3. Configure environment:

```bash
cp .env.example .env
```

4. Prepare database schema:

```bash
npm run db:setup
```

5. Run scheduler + workers:

```bash
npm run start
```

## Useful scripts

- `npm run prisma:generate` - Generate Prisma client.
- `npm run prisma:push` - Push Prisma schema to database.
- `npm run db:setup` - Generate and push schema.
- `npm run start` - Start Nest app with scheduler and worker.
- `npm run start:workers` - Start app with worker concurrency set to 50.

## Environment variables

See `.env.example` for all values.
# CarSensor One-Page Scraper (NestJS)

Minimal NestJS worker that scrapes one CarSensor listing page:

- Target URL: `https://www.carsensor.net/usedcar/index1.html?SORT=19`
- Input: pure HTML page
- Output: parsed car objects printed as JSON

## Run

```bash
npm install
npm run start
```

## What It Extracts

- `id`
- `brand`
- `fullTitle`
- `model` (simple split from title)
- `year`
- `mileageKm`
- `priceYen`
- `engineCc`
- `sellerName`
- `listingUrl`
- `mainPhotoUrl`
- `photoUrls`
- `raw` (raw source values)

## Notes

- KISS approach: one page, one run, no DB, no cron.
- Price is normalized from values like `480` (displayed as `万円`) into `4,800,000`.
- If the page does not expose image URLs in static HTML, photo fields may be `null` or empty.
