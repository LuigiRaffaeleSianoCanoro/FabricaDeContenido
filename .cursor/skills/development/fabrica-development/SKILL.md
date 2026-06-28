---
name: fabrica-development
description: Flujo de desarrollo para Fabrica de Contenido — setup local, convenciones de código, Inngest, skills de producto, y checklist pre-PR.
---

# Desarrollo — Fabrica de Contenido

## Setup local

1. `cp .env.example .env` — configurar `DATABASE_URL`, `ENCRYPTION_MASTER_KEY` (64 hex), `NEXT_PUBLIC_APP_URL`
2. Postgres: `sudo docker compose -f docker/docker-compose.yml up -d`
3. `npm run db:push && npm run db:seed`
4. Clerk: omitir keys para dev DB-only; keys reales para `/dashboard`
5. `npm run dev` → verificar `curl -s http://localhost:3000/api/health`

## Arquitectura clave

| Módulo | Ruta | Notas |
|--------|------|-------|
| Auth | `src/lib/auth/` | Clerk session, RBAC, onboarding |
| AI | `src/lib/ai/` | Factory + providers BYOK |
| Inngest | `src/lib/inngest/` | Cola de jobs async |
| Publishing | `src/lib/publishing/` | Buffer sync/schedule |
| TTS | `src/lib/tts/` | edge-tts-universal |
| Video | `src/lib/video/` | GitHub Actions + Editframe |
| Skills producto | `src/skills/` | Registry + executor Zod |

## Convenciones

- TypeScript estricto; Zod para validación de inputs.
- Server-only para DB, env, cifrado, API keys.
- Server Actions para mutaciones del dashboard.
- Errores de dominio tipados (`src/lib/ai/errors.ts`, `src/lib/db/errors.ts`).
- Cambios mínimos; seguir estilo del archivo vecino.

## Inngest

- Endpoint: `/api/inngest`
- Funciones: `src/lib/inngest/functions.ts`
- Probar localmente con Inngest Dev Server si está configurado.

## Skills de producto (runtime)

No confundir con `.cursor/skills/`:
- Registry: `src/skills/registry.ts`
- Executor: `src/skills/executor.ts`
- Seed: `npm run db:seed`

## Checklist pre-PR

- [ ] `npm run lint` pasa
- [ ] `npm run build` pasa (env placeholders OK)
- [ ] Tests relevantes añadidos/actualizados (`npm test`)
- [ ] Sin secretos en código
- [ ] Issue Linear actualizado (estado + link PR)
- [ ] Rama: `cursor/<descripcion>-f5c8`

## Skills de comunidad útiles

- `vercel-react-best-practices` — performance React/Next
- `web-design-guidelines` — revisión UI/UX
- `deploy-to-vercel` — despliegue
- `prisma-client-api` / `prisma-cli` — base de datos
