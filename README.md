# WONESE Healthcare Staff Portal

A full-stack healthcare staff management portal with support for multiple agencies, provider CRUD, document uploads, agency dashboards, and global search filters.

## Deployment

### Frontend on Vercel

1. Create the Vercel project with `frontend` as the root directory.
2. Keep `frontend/vercel.json` so Vercel proxies `/api/*` to Render and client-side routes like `/providers` rewrite to `index.html`.
3. If you ever want to override the API target manually, you can still set `VITE_API_BASE_URL`.

### Backend on Render

1. Create a Render web service with `backend` as the root directory, or use `render.yaml`.
2. Set `DATABASE_URL` to your real database connection string in Render.
3. Set `CORS_ORIGIN` to your Vercel frontend URL, for example `https://your-frontend.vercel.app`, if you also want the backend reachable directly from browsers.
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`

## Local Setup

1. Install dependencies:
   - `cd "f:\WEB PORTAL\\backend" && npm install`
   - `cd "f:\WEB PORTAL\\frontend" && npm install`

2. Configure database:
   - Update `backend/.env` with your database connection details (copy from `backend/.env.example`).
   - Update `frontend/.env` with `VITE_API_BASE_URL=http://localhost:4000/api` only if you want to override the local default.

3. Run Prisma migrations and seed data:
   - `cd "f:\WEB PORTAL\\backend"`
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init` (creates tables in your configured database)
   - `npm run prisma:seed` (seeds the six agencies)

4. Start the backend and frontend:
   - `cd "f:\WEB PORTAL\\backend" && npm run dev`
   - `cd "f:\WEB PORTAL\\frontend" && npm run dev`

5. Open the frontend:
   - `http://localhost:5173`

## Features

- Multi-agency provider management
- Provider add/edit/delete
- Provider status with active/inactive indicator
- Provider location, license, and documents
- Global search and filters by name, agency, skill, city, and zip
- File upload handling for provider documents

## Notes

- Uploads are stored in `backend/uploads`.
- API base URL is configured in `frontend/src/services/api.ts`.
- In production, Vercel proxies `/api/*` to `https://web-portal-a2hf.onrender.com/api/*`.
- `VITE_API_BASE_URL` is optional now and mainly useful for overrides.
