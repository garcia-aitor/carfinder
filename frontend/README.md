# Carfinder frontend (Next.js)

Catalog UI for browsing cars scraped from CarSensor through the NestJS API.

## Features

- JWT login (`admin` / `admin123` after backend seed)
- Car catalog page with filters, sorting, and pagination
- Car details page with gallery and specs
- Responsive desktop/mobile layout
- Frontend dictionary layer for JP-origin normalization in UI labels
- Dark + gold design tokens inspired by the reference catalog style

## Environment

Copy environment file and set the backend URL:

```bash
cp .env.example .env.local
```

Default value:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Run locally

From this `frontend/` directory:

```bash
npm install
npm run dev
```

App runs on [http://localhost:3001](http://localhost:3001) if `3000` is already used by backend.  
To force a port:

```bash
npm run dev -- --port 3001
```

## Build and lint

```bash
npm run lint
npm run build
```

## Routes

- `/login` - sign in
- `/cars` - catalog
- `/cars/[id]` - car detail

## Deployment notes

- Deploy this folder as a standalone app (`frontend/` as root directory).
- Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- Ensure backend CORS allows your frontend domain.
