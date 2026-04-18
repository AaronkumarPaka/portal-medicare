# WONESE Healthcare Staff Portal

A full-stack healthcare staff management portal with support for multiple agencies, provider CRUD, document uploads, agency dashboards, and global search filters.

## Setup

1. Install dependencies:
   - `cd "f:\WEB PORTAL\\backend" && npm install`
   - `cd "f:\WEB PORTAL\\frontend" && npm install`

2. Configure database:
   - Use your existing Oracle SQL+ database instance.
   - Update `backend/.env` with your Oracle connection details (copy from `backend/.env.example`).
   - Example: `DATABASE_URL="oracle://username:password@localhost:1521/DBNAME"`

3. Run Prisma migrations and seed data:
   - `cd "f:\WEB PORTAL\\backend"`
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init` (creates tables in Oracle)
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
- Database: Oracle SQL+ (Prisma ORM handles schema generation and migrations).
- Ensure your Oracle instance is running and accessible before starting the backend.
