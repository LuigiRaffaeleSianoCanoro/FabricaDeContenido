# Deploying on Vercel

## Fixing `MIDDLEWARE_INVOCATION_FAILED`

Clerk middleware runs on every matched request. If Clerk env vars are missing or empty, the edge bundle can throw and Vercel returns **500 / MIDDLEWARE_INVOCATION_FAILED**.

### Required (Production + Preview)

Add these in **Vercel → Project → Settings → Environment Variables** (apply to Production, Preview, and Development as needed):

| Name | Notes |
|------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → **API Keys** |
| `CLERK_SECRET_KEY` | Clerk Dashboard → **API Keys** |
| `DATABASE_URL` | Neon (or Postgres) connection string |
| `NEXT_PUBLIC_APP_URL` | Exact site URL, e.g. `https://your-app.vercel.app` |
| `ENCRYPTION_MASTER_KEY` | 64 hex chars (32 bytes). Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Recommended

| Name | Notes |
|------|--------|
| `CLERK_WEBHOOK_SECRET` | For `/api/webhooks/clerk` user sync |
| `VIDEO_WEBHOOK_SECRET` | For `x-fabrica-webhook-secret` on `/api/webhooks/video-complete` |
| `INNGEST_EVENT_KEY` | For `inngest.send()` from server actions |
| `ADMIN_EMAILS` | Comma-separated emails allowed on `/dashboard/admin` |

### After changes

Redeploy (or push a commit). In **Clerk → Paths / URLs**, allow your Vercel preview and production domains as authorized redirect origins.

## Database schema (applied automatically on deploy)

A common failure is logging in and seeing **"Configuración de base de datos pendiente"** with
`The table public.OrganizationMember does not exist`. That means the database connects but the
**schema was never applied** (the tables don't exist yet).

This repo now applies the schema automatically on Vercel. Vercel runs the **`vercel-build`**
script, which does:

```
prisma generate && prisma db push --skip-generate && prisma db seed && next build
```

So every deploy syncs the Prisma schema to `DATABASE_URL` and seeds the default skills
(idempotent `upsert`s). Just make sure `DATABASE_URL` is set in Vercel and **redeploy** — the
tables are created during the build.

### If the build's `db push` fails (Neon pooler)

`prisma db push` runs DDL and works best over a **direct** (non-pooled) connection. If your
`DATABASE_URL` host contains `-pooler`, the push may fail. Use the **direct** Neon connection
string (without `-pooler`) for `DATABASE_URL`, or apply the schema once manually:

```bash
# from a machine with the repo, using the EXACT production connection string
DATABASE_URL="postgres://...neon-direct..." npx prisma db push
DATABASE_URL="postgres://...neon-direct..." npm run db:seed   # optional
```

### Verifying

Open `/api/health`. With the schema applied you should see:

```json
{ "ok": true, "db": { "ok": true }, "schema": { "ok": true }, "env": { ... } }
```

If `schema.ok` is `false` (e.g. `relation "OrganizationMember" does not exist`), the tables are
still missing — redeploy so `vercel-build` runs, or apply the schema manually as above.

> Other hosts (Render, Railway, etc.): set the build command to `npm run vercel-build` so the
> schema is applied on deploy, or run `npm run db:push` once against your production database.
