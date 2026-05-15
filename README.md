# Fabrica de Contenido

Base de producto tipo **SaaS multi-tenant** para generar y publicar contenido social con IA, video (Remotion + GitHub Actions), TTS gratuito (Microsoft Edge), y publicación vía **Buffer**. Está pensada para **Vercel + Clerk + Neon** (o cualquier Postgres), con colas **Inngest** y **Prisma**.

## Arquitectura (resumen)

- **App web**: Next.js 16 (App Router), TypeScript estricto, Tailwind 4, componentes **shadcn** (Base UI).
- **Auth**: **Clerk** (`ClerkProvider`, middleware en `src/middleware.ts`, `/login` y `/sign-up` con `<SignIn>` / `<SignUp>`).
- **DB**: **PostgreSQL** vía **Prisma**; `DATABASE_URL` apunta a **Neon** (recomendado) u otro host.
- **Orquestación**: **Inngest** (`src/lib/inngest/`, endpoint `POST/GET/PUT /api/inngest`). Interfaz genérica de cola en `src/lib/queue/types.ts` para un futuro adaptador BullMQ.
- **IA**: fábrica y adaptadores en `src/lib/ai/`. Las claves las aporta cada tenant; se guardan cifradas.
- **TTS**: `edge-tts-universal` en `src/lib/tts/` (sin API key).
- **Publicación**: Buffer en `src/lib/publishing/providers/buffer.ts`.
- **Video**: GitHub Actions (`src/lib/video/github-actions.ts`) + `.github/workflows/render-video.yml`; activos en **R2** (`src/lib/storage/r2.ts`).
- **Skills**: registro + ejecutor con Zod + `SkillExecution` (`src/skills/`).
- **Seguridad**: `ENCRYPTION_MASTER_KEY` (AES-256-GCM); validación de env (`src/config/env.server.ts`).
- **Sync usuarios**: webhook Clerk → `/api/webhooks/clerk` opcional (`CLERK_WEBHOOK_SECRET`) para rellenar `UserProfile`.

```mermaid
flowchart LR
  subgraph web [Next.js]
    UI[Dashboard]
    API[API routes]
  end
  subgraph data [Data]
    Clerk[(Clerk Auth)]
    PG[(Postgres/Prisma)]
  end
  UI --> Clerk
  API --> PG
  API --> Inngest[Inngest]
  Inngest --> Skills[Skills]
  Skills --> AI[AI providers]
  Skills --> TTS[TTS]
  Inngest --> Vid[GitHub Actions]
  Vid --> R2[R2]
  Inngest --> Buffer[Buffer API]
```

## Requisitos

- Node.js 22+.
- Cuenta **Clerk** (API keys) y proyecto **Neon** (o Postgres compatible).
- Opcional: Inngest, Upstash, Cloudflare R2, GitHub PAT para render.

## Configuración local

1. Copia [.env.example](.env.example) → `.env` (o `.env.local`).
2. **Neon**: crea base y pega `DATABASE_URL` (SSL).
3. **Clerk**: crea aplicación → API Keys → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. En el dashboard de Clerk configura URLs permitidas (dev: `http://localhost:3000`).
4. Postgres local opcional: `docker compose -f docker/docker-compose.yml up -d`
5. Esquema:

   ```bash
   npx prisma migrate dev --name init
   ```

   o `npm run db:push`

6. Semilla skills:

   ```bash
   npm run db:seed
   ```

7. **Webhook (opcional)**: en Clerk → Webhooks → endpoint `https://TU_DOMINIO/api/webhooks/clerk` → eventos `user.*` → copia `CLERK_WEBHOOK_SECRET` a `.env`.

8. Arranque:

   ```bash
   npm install
   npm run dev
   ```

   Rutas: `/`, `/login`, `/sign-up`, `/dashboard` (protegido).

## Variables de entorno

Ver [.env.example](.env.example). Obligatorias para el servidor:

- `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_APP_URL`, `ENCRYPTION_MASTER_KEY` (64 hex).

Opcionales: `CLERK_WEBHOOK_SECRET`, Inngest, Upstash, R2, GitHub.

**Build / CI**: define las obligatorias (placeholders no productivos están bien).

## Docker (app)

```bash
docker build -f docker/Dockerfile \
  --build-arg DATABASE_URL=postgresql://... \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... \
  --build-arg CLERK_SECRET_KEY=sk_... \
  --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  --build-arg ENCRYPTION_MASTER_KEY=... \
  -t fabrica .
docker run -p 3000:3000 --env-file .env fabrica
```

## Inngest

- `/api/inngest`
- Funciones de ejemplo: `fabrica-health-ping`, `fabrica-content-pipeline-v1` en `src/lib/inngest/functions.ts`.

## TODOs de producción (prioridad alta)

- **Perfiles**: asegurar webhook Clerk o sync al primer acceso a dashboard.
- **Organizaciones**: flujo Clerk Organizations o tablas `Organization` + `OrganizationMember`.
- **RBAC**: roles y guards en rutas admin.
- **Claves**: UI para `EncryptedApiKey` solo server-side.
- **Buffer OAuth** y resto del plan de producto.

## Escalado futuro

- Particionar usage/audit; BullMQ; Remotion Lambda; read replicas / Accelerate.

## Licencia

Privado — uso interno del repositorio.
