# Carfinder (monorepo)

NestJS API with CarSensor scraping, Prisma, BullMQ, and JWT. Frontend will live under `frontend/`.

## Repository layout

```
carfinder/
  docker-compose.yml   # PostgreSQL + Redis (run from repo root)
  README.md            # this file
  backend/             # Nest app, Prisma, package.json
  frontend/            # Next.js / React (placeholder; see frontend/README.md)
```

## Prerequisites

- Node.js 20+
- Docker and Docker Compose

## Quick start

### 1. Infrastructure environment (from repository root)

```bash
cp .env.example .env
# Edit .env with strong values for POSTGRES_PASSWORD and REDIS_PASSWORD
```

### 2. Infrastructure (from repository root)

```bash
docker compose up -d
```

### 3. Backend environment

```bash
cd backend
cp .env.example .env
# Keep credentials aligned with root .env and set a strong JWT_SECRET
```

### 4. Database schema and seed (optional)

```bash
cd backend
npm run db:setup
npm run prisma:seed
```

### 5. Run the API (scheduler + workers + HTTP)

```bash
cd backend
npm install
npm run start
```

Default HTTP port is `3000` unless you set `APP_PORT` in `backend/.env`.

### 6. Frontend (when added)

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to your API base URL (e.g. `http://localhost:3000`).

## API (summary)

- `POST /auth/login` — body: `{ "username", "password" }` (seed user: `admin` / `admin123` after `prisma:seed`)
- `GET /auth/me` — Bearer JWT
- `GET /cars` — Bearer JWT; query filters, sort, pagination
- `GET /cars/:id` — Bearer JWT

## Deploy notes

- **Backend (Railway, Render, Fly, etc.):** set the service **root directory** to `backend`.
- **Frontend (Vercel, Netlify, etc.):** set **root directory** to `frontend`.
- Keep `JWT_SECRET` and database URLs in the provider’s secret/env UI, not in git.

## More detail

See [backend/README.md](backend/README.md) for scraper behavior, scripts, and environment variables.
