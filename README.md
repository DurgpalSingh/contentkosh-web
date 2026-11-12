# ContentKosh — Web (Next.js)

Frontend application for ContentKosh built with Next.js (app-router).

## Quick start

1. Install dependencies:

```bash
cd contentkosh-web
npm install
```

2. Configure environment variables:

- Create `.env.local` (or set env vars in your hosting environment).
- Important variables used by the app:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

3. Run the app in development:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Build & production

- Build: `npm run build`
- Start production server (after build): `npm run start`

## Code generation

- The project includes a codegen script that fetches the backend OpenAPI JSON and generates typed API clients into `lib/api`:

```bash
npm run generate-api
```

This expects the backend to be running and serving `http://localhost:8080/swagger.json` by default — update the URL in the script if needed.

## Scripts

- `npm run dev` — start Next.js in development (Turbopack)
- `npm run build` — production build
- `npm run start` — start the built app
- `npm run lint` — run ESLint
- `npm run generate-api` — generate typed API client from backend OpenAPI

## Environment variables

- `NEXT_PUBLIC_API_URL` — base URL for backend API (example: `http://localhost:8080`)

Put env vars in `.env.local` for local development. In production, set environment variables via your hosting provider.

## Project structure (high level)

- `app/` — Next.js app routes and pages
- `components/` — shared UI components
- `lib/` — helper libraries; generated API clients live in `lib/api`
- `services/` — client-side services (e.g., permission helpers)
- `styles/` — global styles and Tailwind config

## Notes for developers

- Many places read `process.env.NEXT_PUBLIC_API_URL`; point it at your local backend during development.
- The web app expects the backend Swagger/OpenAPI to be reachable for code generation and some developer flows.

## Deploying

The app is designed to deploy on Vercel but can run on any Node.js host supporting Next.js. On Vercel, configure `NEXT_PUBLIC_API_URL` in project settings.

## Troubleshooting

- If pages fail to fetch data, confirm `NEXT_PUBLIC_API_URL` and that the backend is running and CORS allows requests from the web origin.

## Contributing

- Create a branch using `feature/` or `fix/` prefixes and open a PR from that branch.
- Run the following checks locally before submitting a PR:

```bash
npm install
npm run lint || true
```

- Include a clear description, testing steps, and screenshots if applicable in your PR.

## Development (local)

Typical local development flow:

1. Start the backend API (see `contentkosh-backend/README.md` for backend setup).
2. Ensure `.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:8080` (or point to your backend).
3. Install dependencies and start the app:

```bash
npm install
npm run dev
```

4. If you need generated API types, generate them while the backend is running:

```bash
npm run generate-api
```

5. Build for production:

```bash
npm run build
npm run start
```

If you'd like separate `CONTRIBUTING.md` or `DEVELOPMENT.md` files created in the repo, I can add them — otherwise these sections live in this README.
