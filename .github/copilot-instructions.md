# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Next.js monorepo using the `/src/app` directory for all application routes and logic.
- Backend API routes are colocated under `src/app/api/`, following Next.js API conventions.
- Prisma is used for database access, with schema and migrations in `/prisma`.
- The project is deployed on Vercel and uses Vercel-specific config files.

## Key Architectural Patterns
- **API routes**: All backend endpoints are in `src/app/api/`. Each resource (e.g., `attendants`, `orders`, `products`) has its own folder, with RESTful subroutes (e.g., `src/app/api/attendants/[id]/route.ts`).
- **Prisma ORM**: Use `src/lib/prisma.ts` to access the database. Schema is defined in `prisma/schema.prisma`. Migrations are tracked in `prisma/migrations/`.
- **App routes**: Frontend pages are in `src/app/`, using the new Next.js app directory structure. Each major section (admin, attendants, products, etc.) has its own folder and layout.
- **Shared logic**: Utilities and shared code are in `src/lib/`.

## Developer Workflows
- **Start dev server**: Use `pnpm dev` (preferred), or `npm run dev`.
- **Database migrations**: Use Prisma CLI (`npx prisma migrate dev`).
- **Seeding**: Run `pnpm tsx scripts/seed.ts` to seed the database.
- **Linting**: Run `pnpm lint` (ESLint with Next.js and TypeScript plugins).
- **Type checking**: Run `pnpm tsc`.

## Project Conventions
- **ID handling**: Attendant and other resource IDs may be string (UUID/CUID) or numeric. See `NUMERIC_IDS` in API route handlers for details.
- **Error handling**: API routes return JSON with error messages and appropriate HTTP status codes. Prisma errors are mapped to 404 or 500 as needed.
- **File structure**: Prefer colocating related files (API, UI, styles) by feature/folder.
- **No global state management**: State is managed locally in components or via API calls.

## Integration Points
- **Prisma**: All DB access via `src/lib/prisma.ts`.
- **Vercel**: Deployment config in `vercel.json`.
- **ESLint**: Config in `eslint.config.mjs`.
- **PostCSS**: Config in `postcss.config.mjs`.

## Examples
- See `src/app/api/attendants/[id]/route.ts` for a typical RESTful API handler (GET, PATCH, DELETE).
- See `src/app/admin/` and `src/app/attendants/` for page and layout structure.

## Do/Don't
- **Do**: Follow Next.js and Prisma conventions. Keep API and UI logic separated. Use TypeScript everywhere.
- **Don't**: Add global state libraries, or change ID types without checking all usages.

---
For more, see `README.md` and `prisma/schema.prisma`.
