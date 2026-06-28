<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single-package Next.js 16 app (`npm`). Standard commands are in `package.json` and `README.md`.

### Local Postgres (Cloud VM)

Docker is not preinstalled. To run Postgres locally:

1. Start the daemon if needed: `sudo dockerd > /tmp/dockerd.log 2>&1 &` (use `sudo docker` for compose commands).
2. `sudo docker compose -f docker/docker-compose.yml up -d` (Postgres on `localhost:5432`, user/password/db: `postgres`/`postgres`/`fabrica`).
3. Copy `.env.example` → `.env`, set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fabrica`, generate `ENCRYPTION_MASTER_KEY` (64 hex), and `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
4. `npm run db:push` (or `npm run db:migrate`) and `npm run db:seed`.

### Clerk keys

- **Invalid or placeholder Clerk keys** (`pk_test_xxx`) cause middleware/runtime errors on every route. Omit `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` entirely for DB-only / public-route dev; `/api/health` and `/` work without Clerk.
- **Real Clerk test keys** are required for sign-in, `/dashboard`, and full UI flows.

### Running the app

- Dev server: `npm run dev` (port 3000). Use a tmux session for long-running processes.
- Quick sanity check: `curl -s http://localhost:3000/api/health` → `ok: true` and `db.ok: true`.
- Lint / build: `npm run lint`, `npm run build` (needs required env vars in `.env`; placeholders are fine for build per README).
- Tests: `npm test` (Vitest unit/integration), `npm run test:e2e` (Playwright). Ver `tests/README.md` y `.cursor/README.md`.

### Optional services

Inngest, R2, and tenant BYOK keys (Editframe, Buffer, OpenAI) are only needed for slideshow render / publish E2E; see `README.md` and `.env.example`.

### Agent skills & rules

- **Rules**: `.cursor/rules/` — convenciones modulares (Next.js, Prisma, testing, Linear, seguridad).
- **Skills del proyecto**: `.cursor/skills/` — Linear MCP, desarrollo, testing.
- **Skills de comunidad**: `.agents/skills/` — vitest, playwright, prisma, vercel-react-best-practices (instalados vía `npx skills add`).
- **Documentación**: `.cursor/README.md`
