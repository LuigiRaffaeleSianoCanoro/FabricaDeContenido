# Re-plan de herramientas y estructura Freemium / Premium

> Fecha: 2026-07-03 · Estado: **implementado** (ver secciones marcadas)
> Complementa `docs/PRODUCT_PLAN.md` (M5 — Negocio) y `docs/business-plan-lui-3.md`.

---

## 1. Review ejecutivo del proyecto (jul 2026)

El motor end-to-end existe y funciona: prompt → guion (skill IA) → imágenes (Pexels/OpenAI) →
voz (Edge TTS) → render (HyperFrames) → R2 → publicación/agenda (Buffer) → autopiloto (cron
Inngest). Lo que **no** existía antes de este cambio:

| Gap | Estado previo | Estado ahora |
|-----|---------------|--------------|
| Monetización (planes, cuotas, créditos) | Solo enum `Plan` y modelo `UsageRecord` sin uso | **Implementado**: catálogo de planes, cuotas mensuales, créditos de agente, página Facturación |
| BYOK "cualquier proveedor" | 5 providers fijos; `CUSTOM` era un dead-end (se guardaba pero no generaba) | **Implementado**: 10 providers + `CUSTOM` funcional (cualquier API OpenAI-compatible con base URL propia) |
| IA de plataforma (premium) | Inexistente — solo BYOK | **Implementado**: planes premium usan la key de la plataforma (env) y consumen créditos |
| Aprobar + autoPost | Aprobar no publicaba si `requireApproval` estaba activo | **Corregido**: aprobar encadena publicación si `autoPost` |
| Enforcement | Cero límites: todo org FREE tenía todo gratis e ilimitado | **Implementado** en server actions + pipelines Inngest + autopilot tick |

## 2. Re-plan de herramientas

Decisiones de stack revisadas una a una. Criterio: coste marginal cero en freemium (BYOK),
coste controlado por créditos en premium.

| Área | Herramienta | Decisión | Racional |
|------|-------------|----------|----------|
| IA texto (freemium) | **BYOK multi-proveedor** | **Mantener y ampliar**: OpenAI, Anthropic, Gemini, OpenRouter, MiniMax + **Groq, Mistral, DeepSeek, xAI, Together** + **CUSTOM** (cualquier endpoint OpenAI-compatible) | El coste variable es del usuario; ampliar cobertura elimina fricción de onboarding ("mi proveedor no está") |
| IA texto (premium) | **Key de plataforma** (`PLATFORM_AI_*` env) | **Nuevo** | Vendemos "agent usage": el usuario no trae key; consumimos nuestra key y descontamos créditos |
| TTS | edge-tts-universal | **Mantener** | Gratis, sin key, calidad suficiente para slideshows |
| Render video | HyperFrames (CLI local) | **Mantener como motor primario** | Sin API key ni coste por render; Editframe queda como integración BYOK opcional futura |
| Render legacy | GitHub Actions + Remotion | **Deprecar** (workflow es un scaffold con TODO; no renderiza) | Duplicaba el path de video sin terminar |
| Imágenes stock | Pexels (key plataforma) | **Mantener** | Gratis con key de plataforma |
| Imágenes IA | OpenAI `gpt-image-1` (BYOK) | **Mantener** | Coste del usuario en freemium |
| Publicación | Buffer GraphQL (BYOK API key) | **Mantener único provider v1** | OAuth de terceros de Buffer no existe; cubrir Meta/LinkedIn directo es post-v1 |
| Storage | Cloudflare R2 (plataforma) | **Mantener** | Necesario para URLs públicas de media |
| Colas | Inngest | **Mantener** | Cron + retries + steps duraderos ya en producción |
| Billing/pagos | **Stripe** | **Diferido** — seam listo (`Organization.plan`, acción de upgrade, admin plan switcher) | Sin claves de Stripe en el entorno; el cambio de plan es manual (admin / ventas) hasta integrar checkout |
| Rate limiting | @upstash/ratelimit | Diferido | Las cuotas mensuales son el primer control de abuso; ratelimit por request es M6 |

## 3. Estructura de planes

Catálogo en `src/lib/billing/plans.ts` (fuente de verdad única).
1 crédito de agente = 1 generación de texto con IA de plataforma; 1 video = 5 créditos.
El uso BYOK **no** consume créditos (solo cuenta contra la cuota mensual del plan).

| | **FREE** (Freemium BYOK) | **STARTER** | **PRO** (Premium Agente) | **ENTERPRISE** |
|---|---|---|---|---|
| Precio | $0 | $19/mes | $49/mes | Custom |
| IA | Solo BYOK (cualquier proveedor) | Solo BYOK | **IA de plataforma incluida** + BYOK opcional | IA de plataforma + BYOK |
| Créditos de agente/mes | 0 | 0 | 500 | 5000 |
| Generaciones de texto/mes | 40 | 300 | 1500 | Ilimitado |
| Videos (slideshows)/mes | 15 | 60 | 300 | Ilimitado |
| Miembros | 2 | 3 | 10 | Ilimitado |
| Autopiloto | Sí | Sí | Sí | Sí |
| Publicación Buffer | Sí (BYOK Buffer) | Sí | Sí | Sí |

Notas de diseño:

- **Freemium = BYOK obligatorio.** El paso IA del onboarding exige key propia en FREE/STARTER.
  En PRO/ENTERPRISE el paso es opcional (pueden usar la IA de la plataforma directamente).
- **Créditos**: `UsageRecord` con métrica `agent_credits`; el saldo mensual = créditos del plan
  + `Organization.bonusCredits` (top-ups otorgables por admin) − consumidos en el mes.
- **Cuotas**: ventana de mes calendario UTC, agregada sobre `UsageRecord`
  (`text_generation`, `video_render`). Al agotar cuota: acciones bloqueadas con mensaje claro
  y CTA a `/dashboard/billing`; el autopiloto salta el slot sin castigar (no consume el slot).
- **Cambio de plan**: hoy manual — el usuario pide upgrade desde Facturación (queda auditado)
  y el admin de plataforma lo aplica en `/dashboard/admin`. El seam de Stripe entra aquí después.

## 4. Superficies implementadas

| Superficie | Ruta |
|-----------|------|
| Catálogo de planes + costes de créditos | `src/lib/billing/plans.ts` |
| Lógica pura de cuotas/créditos | `src/lib/billing/quota.ts` |
| Servicio de uso (Prisma) | `src/services/usage.ts` |
| Resolver de IA (BYOK → plataforma) | `src/services/ai-resolver.ts` |
| Adaptador OpenAI-compatible genérico | `src/lib/ai/providers/openai-compatible.ts` |
| Página Facturación | `src/app/dashboard/billing/` |
| Admin: cambiar plan / otorgar créditos | `src/app/dashboard/admin/` |
| Enforcement | `src/app/dashboard/actions.ts`, `studio/actions.ts`, `automation/actions.ts`, `src/lib/inngest/functions.ts` |

## 5. Variables de entorno nuevas

```bash
# IA de plataforma (planes premium — "agent usage")
PLATFORM_AI_PROVIDER="openai"        # openai|anthropic|gemini|openrouter|minimax|groq|mistral|deepseek|xai|together|custom
PLATFORM_AI_API_KEY=""               # key de la plataforma (nunca del tenant)
PLATFORM_AI_BASE_URL=""              # requerido solo si provider=custom
PLATFORM_AI_MODEL=""                 # opcional: override del modelo por defecto
```

## 6. Siguientes pasos (no incluidos aquí)

1. **Stripe Checkout + customer portal** — conectar `requestPlanUpgrade` al checkout real.
2. **Top-ups self-serve** de créditos (hoy: `bonusCredits` vía admin).
3. Rate limiting por request (Upstash) y alertas de consumo (80% de cuota).
4. Retirar definitivamente el path GitHub Actions/Remotion.
