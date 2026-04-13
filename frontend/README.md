# Frontend (Next.js / React)

This folder will hold the web application for browsing cars from the API.

## Planned setup

- Create the app here, for example:

  ```bash
  cd frontend
  npx create-next-app@latest . --typescript --eslint --app --src-dir=false
  ```

- Point the UI at the backend with an environment variable, for example:

  `NEXT_PUBLIC_API_URL=http://localhost:3000`

- Use `POST /auth/login` and send `Authorization: Bearer <token>` on `GET /cars` and `GET /cars/:id`.

See the [root README](../README.md) for how to run Docker, the API, and deploy.
