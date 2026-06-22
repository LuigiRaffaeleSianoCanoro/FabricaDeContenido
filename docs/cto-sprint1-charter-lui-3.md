# LUI-3 — CTO Sprint 1 Technical Execution Charter (4 semanas)

Fecha: 2026-06-22  
Owner: CTO direct report (delegación CEO)  
Alcance: **WS-CTO-1** (confiabilidad E2E) + mínimo de **WS-CTO-3** necesario para conversión trial->paid.

---

## 1) Sprint objective and non-goals

### Objetivo del sprint (4 semanas)
Dejar en estado vendible el flujo crítico de este repo:

`/dashboard/onboarding` -> generación (`content/slideshow.requested`) -> aprobación/publicación (`publishGeneratedContent`) -> `ScheduledPost`,

con visibilidad operativa diaria por organización y reducción de fricción técnica para lograr primer contenido programado dentro de ventana comercial.

### Non-goals explícitos (fuera de Sprint 1)
- Implementar billing/Stripe o limits por plan completos (WS-CTO-2).
- Expandir conectores más allá de Buffer (se mantiene **Buffer-first**).
- Rediseño visual completo del dashboard (solo mejoras funcionales de activación).
- Reconciliación final `SCHEDULED -> PUBLISHED` por webhook/poller Buffer full (solo baseline de confiabilidad y gap visible).

---

## 2) Work breakdown (weekly milestones)

### Semana 1 — Baseline técnico y taxonomía de fallos
- Definir scorecard operativo v1 con fuentes reales del repo:
  - `ContentJob` (status/errorMessage/inngestRunId),
  - `GeneratedContent.status`,
  - `ScheduledPost.status`,
  - `AuditLog.action` (`buffer.channels_synced`, `content.schedule`, etc.).
- Estandarizar códigos de error para onboarding/publicación en server actions:
  - `src/app/dashboard/onboarding/actions.ts`
  - `src/app/dashboard/actions.ts`
- Crear runbook v1 de incidentes P1/P2 para fallos en:
  - `slideshowPipelineV1`,
  - `publishToBuffer`,
  - prerrequisito de canales Buffer.

**Milestone S1:** tablero interno (aunque sea en `/dashboard/admin` + query operativa) mostrando tasa E2E y top 5 errores por última semana.

### Semana 2 — Instrumentación WS-CTO-1 en pipeline core
- Instrumentar etapas de pipeline en `src/lib/inngest/functions.ts` con métricas por etapa:
  - requested -> planned -> rendered -> scheduled/published.
- Agregar trazabilidad por `organizationId`, `jobId`, `generatedContentId` en eventos/logs de operación.
- Introducir alerta operativa diaria (revisión automática + owner asignado) para:
  - fallos de render,
  - fallos de publish,
  - crecimiento de `FAILED` y `DEAD_LETTER`.

**Milestone S2:** confiabilidad por etapa visible diariamente + responsable de guardia definido.

### Semana 3 — Mínimo WS-CTO-3 para conversión
- Endurecer activación técnica para reducir “onboarding completo pero no publica”:
  - pre-check explícito de canales Buffer antes de publicar/programar,
  - errores accionables no silenciosos en onboarding/setup.
- Definir y emitir eventos de activación comercial:
  - `onboarding_step_3b_channels_synced`,
  - `first_content_scheduled`,
  - `autopilot_activated`.
- Handshake con UX para que cada error tenga CTA de recuperación en contexto (Ajustes/Sync).

**Milestone S3:** ruta asistida a primer contenido programado en <=30 min mediana.

### Semana 4 — Endurecimiento operativo + readiness de conversión
- Ejecutar validación con cohorte de trials asistidos (design partners) usando scorecard semanal único CTO/CMO/UX.
- Cerrar runbook v2 con MTTR real y playbooks de reintento/dead-letter.
- Congelar checklist “Go-to-market reliability green” para habilitar escala comercial.

**Milestone S4:** señal de “green for controlled scale” basada en umbrales de aceptación (sección 3).

---

## 3) Acceptance criteria with measurable thresholds

| Métrica | Definición operativa (repo) | Umbral Sprint 1 (fin semana 4) |
|---|---|---|
| Éxito E2E pipeline | % de `content/slideshow.requested` que terminan en `ScheduledPost` creado en <=30 min | **>= 85%** (rolling 7 días, cohorte trials activas) |
| Fallo en publish | `% ScheduledPost.status=FAILED` sobre total posts intentados | **<= 10%** |
| Fallo en render | `% ContentJob(type=VIDEO_RENDER,status=FAILED)` sobre jobs VIDEO_RENDER | **<= 12%** |
| Errores accionables | % de fallos de onboarding/publicación con mensaje + siguiente acción explícita | **100%** (sin errores silenciosos) |
| TTFSP (activación técnica) | Mediana tiempo desde `onboarding_step_1_completed` a `first_content_scheduled` | **<= 30 min** (trials asistidos) |
| Sync previo a publicar | % de intentos de publicar con `SocialAccount(buffer,isActive=true)` existente | **>= 95%** |
| MTTR incidentes críticos | Tiempo medio de recuperación para incidentes P1 de pipeline | **<= 4 horas** |

**Regla de release comercial:** no escalar adquisición outbound masivo si éxito E2E <80% o MTTR >8h en la última semana.

---

## 4) Dependencies/handshake points with CMO and UX

| Momento | Dependencia | Owner externo | Handshake esperado |
|---|---|---|---|
| W1 D3 | Claims comerciales permitidos de “autopiloto” según confiabilidad real | CMO | Lista de claims permitidos/no permitidos conectada al estado técnico actual |
| W1 D5 | Copy y jerarquía de errores en onboarding (BYOK, Buffer sync, publish bloqueado) | UX + CMO | Texto final y CTA por error code, aprobado para implementar |
| W2 D4 | Definición de eventos para lifecycle D0-D14 | CMO | Taxonomía final de eventos de activación consumible por GTM |
| W3 D2 | Validación UX de recovery paths en `/dashboard/onboarding`, `/dashboard/content`, `/dashboard/settings` | UX | Sign-off de rutas de recuperación sin dead-end |
| Semanal (Jueves) | Scorecard único | CTO + CMO + UX | Revisión de 6 métricas: step completion, TTFSP, Activation D14 proxy, approve->schedule, publish success real, trial->paid |

**SLA inter-áreas:** dependencia crítica retrasada >7 días => congelar iniciativas de expansión de demanda y priorizar activación/confiabilidad.

---

## 5) Risks + mitigation

1. **Riesgo: Inngest no conectado/estable en entornos trial y percepción de “no pasa nada”.**  
   Mitigación: health checks operativos diarios + alerta por backlog `PENDING/RUNNING` anómalo + runbook con owner de respuesta.

2. **Riesgo: onboarding declara “completo” sin canales Buffer listos.**  
   Mitigación: gate explícito de sync en camino de publicación y errores con CTA directo a `syncBufferChannelsAction`.

3. **Riesgo: dependencia fuerte de BYOK (keys inválidas/sin crédito) afecta activación.**  
   Mitigación: clasificación de error técnico por tipo (inválida, permisos, crédito) y guía de resolución en contexto.

4. **Riesgo: claim comercial supera realidad técnica (`SCHEDULED` vs `PUBLISHED`).**  
   Mitigación: alinear claim con scorecard real y exponer gap de reconciliación como limitación controlada hasta sprint posterior.

5. **Riesgo: falta de foco por mezclar WS-CTO-1 con backlog amplio de producto.**  
   Mitigación: scope lock Sprint 1 en 3 outcomes: confiabilidad E2E, activación técnica mínima, runbook+escalación.

---

## 6) Escalation protocol and decision log template

### Protocolo de escalación
- **Sev 1 (impacto revenue inmediato):** éxito E2E <70% por 24h, o publish fallido >25% por 24h.  
  - Escalar en <30 min: CTO direct report -> CTO -> CEO (si afecta promesa comercial activa).  
  - Acción: freeze de nuevos trials no asistidos hasta estabilizar.

- **Sev 2 (degrada conversión):** TTFSP >45 min mediana por 3 días, o drop-off onboarding técnico >40%.  
  - Escalar en <4h: CTO direct report -> CTO + UX + CMO.  
  - Acción: re-priorizar sprint backlog en favor de activación.

- **Sev 3 (operativo controlado):** errores aislados sin impacto de cohorte.  
  - Gestión en daily engineering + revisión semanal de tendencias.

### Decision log template (usar en weekly exec review)

```md
## LUI-3 Sprint 1 Decision Log

- Fecha:
- Decision ID:
- Contexto (métrica / incidente):
- Opciones evaluadas:
  1)
  2)
  3)
- Decisión tomada:
- Owner:
- Fecha efectiva:
- Impacto esperado (métrica objetivo):
- Riesgo residual aceptado:
- Revisión programada (fecha):
```
