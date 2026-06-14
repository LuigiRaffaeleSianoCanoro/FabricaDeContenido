# Plan de producto — Fábrica de Contenido (self-serve)

> Objetivo: convertir esta base en un **producto final self-serve** donde **cualquier persona**
> pueda registrarse, conectar **su propia API key de IA** y **su cuenta de Buffer**, describir con
> un **prompt** qué quiere, y obtener **slideshows animados** para redes sociales que se **publican
> de forma agendada**. Una vez configurado, el sistema **genera y publica contenido de forma
> recurrente y automática** usando el agente de IA y la cuenta de Buffer del propio usuario.

> **Motor de video: Editframe** (cloud render, BYOK, composición HTML `ef-*`).
> **Publicación: Buffer API GraphQL con API key (BYOK)** — OAuth de terceros aún no existe.

---

## 0. Camino a producto terminado (resumen ejecutivo)

> Visión en una frase: **una persona contesta un cuestionario, le armamos los skills del
> agente, le damos las instrucciones para vincular Buffer, y nosotros somos el trigger
> que crea y publica videos promocionales en sus redes, en autopiloto.**

El **núcleo técnico ya está implementado** (Fases 1–4: prompt → guion → imágenes → voz →
render → publicación → cron de autopiloto). Lo que falta para considerarlo **producto
terminado self-serve** son milestones de **producto, confianza y pulido**, no de motor.

### Estado del rediseño (UI moderna + shaders/animaciones)
- ✅ **Landing** (`/`): rediseño completo — fondo WebGL (aurora/plasma reactivo al puntero),
  blobs aurora, grid animado, grano, secciones "Cómo funciona / Características / Autopiloto",
  reveals al hacer scroll, mock de producto flotante. Respeta `prefers-reduced-motion`.
- ✅ **Onboarding**: barra de progreso animada en el cuestionario.
- ⏳ **Dashboard**: pendiente unificar la estética (glass + acentos animados) en panel,
  studio, automatización, calendario.

### Milestones restantes (ordenados por impacto)

| Milestone | Qué entrega | Estado |
|-----------|-------------|--------|
| **M1 — Cuestionario único** | Un solo flujo "contestá y listo": un prompt maestro + 4–5 preguntas derivan `topics/tone/audience/platforms/postsPerDay` (G7). | Parcial |
| **M2 — Auto-armado de skills** | Tras el cuestionario, generar/activar automáticamente los skills del agente (guion, imágenes, voz) con defaults sensatos. | Pendiente |
| **M3 — Conectar Buffer guiado** | Instrucciones paso a paso + validación de la API key + sync de canales con feedback de éxito/error. | Parcial (sync existe) |
| **M4 — Trigger robusto** | Autopiloto con timezone real, idempotencia por `(config, slot)`, reintentos/backoff y DLQ. | Parcial (cron existe) |
| **M5 — Negocio** | Planes, cuotas (`UsageRecord` + ratelimit) y billing (Stripe) (G8). | Pendiente |
| **M6 — Endurecimiento** | Validación de webhooks, rate limiting, borrado por org, auditoría, cumplimiento (Fase 7). | Pendiente |
| **M7 — Observabilidad** | Métricas de pipeline, estado por job, alertas y panel de salud. | Pendiente |
| **M8 — Rediseño del dashboard** | Llevar la estética del landing a todo el panel. | Pendiente |

**Definición de "terminado"**: un usuario nuevo puede, sin ayuda, registrarse → contestar el
cuestionario → pegar su API key de IA → vincular Buffer siguiendo instrucciones → activar el
autopiloto → recibir videos publicados de forma recurrente, con límites de plan claros y la
plataforma observable y endurecida para producción.

---

## 1. Visión del producto

1. **Se registra** (Clerk).
2. **Trae sus llaves** (BYOK): IA, **Editframe** y **Buffer**.
3. **Promptea** qué quiere.
4. **Obtiene slideshows animados** (texto + imágenes + voz) renderizados en Editframe.
5. **Agenda/publica** en sus redes vía Buffer.
6. **Automatiza**: define la frecuencia una vez y el sistema crea + publica solo, recurrentemente.

---

## 2. Estado actual

- **App**: Next.js 16, TS estricto, Tailwind 4, shadcn. **Auth**: Clerk. **DB**: Prisma + Postgres.
- **BYOK**: AES-256-GCM; `EncryptedApiKey` por org. **IA**: 4 proveedores. **TTS**: Edge.
  **Orquestación**: Inngest. **Skills**: Zod.
- **Dashboard**: panel, onboarding, studio, automatización, contenido, calendario, jobs, settings, admin.

### Fase 1 — IMPLEMENTADA (núcleo de slideshow con Editframe)
Skill `slideshow-planner`; `buildSlideshowHtml()`; render Editframe (BYOK); pipeline
`slideshowPipelineV1`; BYOK `EDITFRAME`; Studio.

### Fase 2 — IMPLEMENTADA (voz + imágenes)
Voz Edge TTS por slide con duración real; imágenes IA (OpenAI) o Pexels; `ContentConfig` +
`voiceover`/`voiceName`; controles en Studio.

### Fase 3 — IMPLEMENTADA (publicación Buffer GraphQL, BYOK)
Provider GraphQL (`getAccount`/`listChannels`/`createPost` con video + `dueAt`); sync de canales →
`SocialAccount`; agenda real desde `postingSchedule`; `publishToBuffer` por canal; UI de sync.

### Fase 4 — IMPLEMENTADA (autopiloto recurrente)
- **Cron Inngest** `autopilotTick` (`*/15 * * * *`): busca `ContentConfig` con `isAutopilotActive`
  cuyo `nextRunAt` vence, dispara `content/slideshow.requested` por config y **avanza `nextRunAt`**
  al siguiente slot (nunca dispara el mismo slot dos veces).
- **Datos**: `ContentConfig` + `isAutopilotActive`, `timezone`, `nextRunAt`, `lastRunAt`
  (+ índice `[isAutopilotActive, nextRunAt]`).
- **Página `dashboard/automation`**: prompt maestro, horarios, zona horaria, imágenes/voz/formato,
  aprobación, **auto-publicar**, toggle de autopiloto y **"Ejecutar ahora"**; muestra próxima/última
  ejecución.
- Con `autoPost` + sin aprobación, el render encadena `publishToBuffer` automáticamente
  → **fábrica de contenido completa de extremo a extremo**.

### Auditoría / fixes de UX
- **Login/Sign-up**: se eliminó el "doble rectángulo" (tarjeta de Clerk dentro de la nuestra)
  ocultando el header de Clerk y haciendo transparente su `cardBox`/`card`.
- **Error boundaries** (`app/error.tsx`, `app/global-error.tsx`, `app/dashboard/error.tsx`):
  pantallas amigables con "Reintentar" en vez del crash genérico "A server error occurred".
- **Perf**: consultas de organización deduplicadas con `cache()` de React (1 query por request).

---

## 3. Brechas restantes vs. la visión

| # | Brecha | Estado |
|---|--------|--------|
| G1 | Render real de slideshow | **Resuelto** (Editframe) |
| G2 | prompt → guion | **Resuelto** |
| G3 | Imágenes | **Resuelto** (OpenAI/Pexels) |
| G4 | Voz en off | **Resuelto** (Edge TTS) |
| G5 | Automatización recurrente | **Resuelto** (cron autopiloto, Fase 4) |
| G6 | Buffer + video | **Resuelto** (GraphQL BYOK) |
| G10 | Sync de canales Buffer | **Resuelto** |
| G7 | Onboarding "por prompt" | Parcial (Studio + Automation ya promptean) |
| G8 | Billing/planes y cuotas | Pendiente (Fase 6) |
| G9 | Preview animado en vivo (`@editframe/elements`) | Parcial (preview de guion) |

---

## 4. Roadmap restante

### Fase 5 — Onboarding "por prompt" pleno (G7)
Derivar `topics/tone/audience/platforms/postsPerDay` desde un solo prompt maestro.

### Fase 6 — Negocio: planes, cuotas, observabilidad (G8)
Stripe + enum `Plan`; cuotas con `UsageRecord` + `@upstash/ratelimit`; métricas.

### Fase 7 — Endurecimiento para producción
Rate limiting, validación de webhooks, reintentos/backoff, DLQ, borrado por org, cumplimiento.

### Pulidos transversales
- Timezone real en la agenda (hoy UTC; `timezone` ya se guarda).
- Preview animado en vivo con `@editframe/elements`.
- Selección de canales por contenido; música de fondo; subtítulos quemados.
- Idempotencia reforzada con `ContentJob.idempotencyKey` por `(config, slot)`.

---

## 5. Cambios de datos (Prisma) aplicados

- Fase 1 — `ApiKeyProvider` + `EDITFRAME`; `ContentConfig` + `prompt`, `slideCount`, `aspectRatio`, `imageSource`.
- Fase 2 — `ContentConfig` + `voiceover`, `voiceName`.
- Fase 3 — sin cambios de esquema (reutiliza `SocialAccount`).
- Fase 4 — `ContentConfig` + `isAutopilotActive`, `timezone`, `nextRunAt`, `lastRunAt` + índice.

> El repo usa `prisma db push` (schema-first). **Tras cada pull, ejecutar `npm run db:push`** para
> que la base de datos tenga las columnas nuevas (de lo contrario el dashboard falla al consultar).
> Luego `npm run db:seed`.

---

## 6. Flujo "fábrica automática" (cómo queda)

1. Onboarding → llaves (IA + Editframe + Buffer) → sincronizar canales.
2. En **Automatización**: prompt maestro + horarios + imágenes/voz + `autoPost` + activar autopiloto.
3. El **cron** dispara la generación en cada horario → slideshow (imágenes + voz) → render Editframe
   → MP4 en R2 → (si `autoPost`) publicación por canal en Buffer agendada.
4. El usuario no vuelve a intervenir salvo para aprobar (si `requireApproval`) o ajustar.

---

## 7. Requisitos de despliegue

- Variables: ver `.env.example`. **R2 obligatorio** para hostear MP4/imágenes/audio (Buffer y
  Editframe necesitan URLs públicas).
- **Inngest** debe estar conectado para que el cron del autopiloto se ejecute en producción
  (endpoint `/api/inngest`).
- Cada org añade sus llaves (IA + Editframe + Buffer) y sincroniza canales.
