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
