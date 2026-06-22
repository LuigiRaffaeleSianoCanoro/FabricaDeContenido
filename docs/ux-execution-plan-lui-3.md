# LUI-3 — UX execution plan para mejorar conversión de onboarding y flujo editorial

Fecha: 2026-06-22  
Owner: UXDesigner (direct report LUI-3)  
Producto: Fábrica de Contenido (Next.js 16, onboarding BYOK, Studio, Content, Calendar, Automation)

---

## 0) Objetivo UX de 90 días

Reducir la fricción entre **registro** y **valor visible** del producto, priorizando:

1. llegar a primer contenido programado lo antes posible (TTFSP),
2. aumentar la tasa de finalización de onboarding técnico (IA + Buffer + agente),
3. convertir más contenido generado en contenido programado/publicado sin retrabajo.

Definición de éxito UX al día 90:

- Completion onboarding >= 70% en trials.
- Activation D14 (trial con >=1 `ScheduledPost`) >= 40%.
- Task success “aprobar + programar” >= 85% en tests moderados.

---

## 1) Journey map de onboarding actual (flujo asumido + fricciones)

### 1.1 Flujo actual implementado (según rutas y acciones del repo)

1. Usuario llega a `/dashboard/onboarding` (wizard 4 pasos).
2. Paso 1: crea workspace (`onboardingCreateOrg`).
3. Paso 2: guarda key IA (`onboardingSaveAiKey`).
4. Paso 3: guarda key Buffer (+ opcional Editframe) (`onboardingSaveBuffer`).
5. Paso 4: define configuración base del agente (`onboardingSaveContentConfig`) y entra a `/dashboard`.
6. En dashboard, usa “Próximos pasos”: Studio, Ajustes (sync Buffer), Automatización y Contenido.
7. Flujo editorial típico:
   - generar en Studio o por pipeline/autopiloto,
   - revisar en `/dashboard/content` (`PENDING_APPROVAL` -> `APPROVED`),
   - publicar ahora o programar (`publishGeneratedContent`),
   - revisar agenda en `/dashboard/calendar`.

### 1.2 Fricciones principales por etapa

| Etapa | Fricción observada | Impacto en conversión | Evidencia en producto |
|---|---|---|---|
| Onboarding paso IA | Requiere BYOK y entendimiento de billing externo desde el inicio. | Alto abandono temprano técnico/comercial. | Paso 2 depende de key válida para avanzar en valor real. |
| Onboarding paso Buffer | Usuario guarda key pero no queda claramente “canales listos”; necesita ir luego a Ajustes para sync. | Falsa sensación de “completé onboarding”, pero falla publicación. | `publishGeneratedContent` bloquea si `channels === 0`. |
| Salida de onboarding | Dashboard mezcla “Generar hooks” (legacy texto) con promesa principal de video/autopiloto. | Diluye camino principal y retrasa primer valor percibido. | CTA de hooks en `/dashboard` y flujo principal real en Studio/Automation. |
| Flujo aprobación -> programación | Estados existen (`PENDING_APPROVAL`, `APPROVED`, `SCHEDULED`, `PUBLISHED`) pero falta feedback de “qué falta” cuando no hay canales synced. | Bloqueo operativo post-generación. | Error server action al publicar sin canales; recovery fuera del contexto inmediato. |
| Calendario/estado final | Estado `ScheduledPost` no siempre reconciliado a `PUBLISHED` end-to-end (riesgo de confianza). | Menor credibilidad del autopiloto y dudas de ROI. | Gap documentado en plan de producto (reconciliación pendiente). |
| Automation | Concepto fuerte, pero activación requiere múltiples decisiones (horarios UTC, prompt, toggles) sin guía de “mínimo viable”. | Retraso en activar autopiloto real. | Formulario completo sin modo “quick start” por default recomendado. |

### 1.3 Momentos críticos (“make or break”)

- **Momento A:** primer paso técnico (key IA). Si falla o confunde, cae el trial.
- **Momento B:** intento de publicar por primera vez sin canales Buffer sincronizados.
- **Momento C:** activar autopiloto sin entender implicancias de `requireApproval` vs `autoPost`.

---

## 2) Principios UX objetivo para este producto

1. **Time-to-first-scheduled-post por encima de completitud perfecta.**  
   Diseñar para que el usuario programe algo útil rápido, aunque luego profundice settings.

2. **No dead-ends operativos.**  
   Toda pantalla crítica debe responder: “qué pasó”, “qué falta”, “qué hago ahora”.

3. **Progresive disclosure técnico (BYOK sin sobrecargar).**  
   Mantener seguridad/compliance, pero dividir complejidad en pasos con validación inmediata.

4. **Estado editorial explícito y accionable.**  
   Cada estado de contenido debe tener CTA único y claro hacia el siguiente estado.

5. **Confianza del autopiloto > estética.**  
   La UX debe visibilizar salud del pipeline, no ocultar incertidumbre de ejecución.

6. **Narrativa unificada de valor para agencias.**  
   Toda UX debe reforzar throughput, consistencia y ahorro operativo (no “juguete IA”).

---

## 3) Cambios UX priorizados por horizonte

## 0-30 días (activar conversión base)

### P0.1 — Onboarding v2 con validación y salida guiada
- Agregar validación inline de keys con estados: “válida”, “inválida”, “sin crédito”, “permiso insuficiente”.
- En paso Buffer, incluir **subpaso visible** “Sincronizar canales ahora” (no dejarlo solo en Ajustes).
- Al finalizar onboarding, enviar a un **Activation Checklist modal** con 3 acciones en orden: crear slideshow, aprobar/programar, activar autopiloto.
- Resultado esperado: menor abandono paso IA/Buffer y menor error de primera publicación.

### P0.2 — “Happy path” único video/autopiloto en dashboard
- Bajar jerarquía del bloque “Generar hooks rápidos” y priorizar CTA principal: “Crear primer slideshow”.
- Cambiar copy de “Próximos pasos” a verbos secuenciales con tiempo estimado (ej. “2 min”, “5 min”).
- Mostrar “bloqueadores activos” (sin canales, sin Editframe, sin R2) con CTA contextual.

### P0.3 — Microcopy de estados editoriales
- En `/dashboard/content`, añadir mensaje contextual por estado:
  - `PENDING_APPROVAL`: “Aprobá para habilitar programación”.
  - `APPROVED` + sin canales: “Sincronizá Buffer para publicar”.
  - `SCHEDULED`: “Ver en calendario”.
- Añadir toasts de éxito/error consistentes en aprobar/programar/publicar.

## 31-60 días (optimizar rendimiento del flujo editorial)

### P1.1 — Cola editorial unificada
- Reorganizar `Contenido` en vistas por etapa: Pendiente, Aprobado, Programado, Publicado.
- Acciones masivas para aprobar/rechazar/programar lote (agencias necesitan throughput).
- Preview corto de video/asset en lista para reducir idas y vueltas.

### P1.2 — Publicación asistida y prevención de errores
- Antes de `Programar/Publicar`, pre-check UX (canales, key Buffer activa, ventana horaria) y bloqueo preventivo.
- Recomendación automática de horario si `postingSchedule` vacío.
- Enlace directo al remedio correcto (Ajustes o Automation) desde el mismo ítem.

### P1.3 — Automation quick-start para agencias
- Plantillas “modo agencia”: frecuencia, formato y defaults recomendados por vertical.
- “Activar autopiloto en 1 clic” usando configuración mínima segura (`requireApproval` activo por defecto).

## 61-90 días (escalar confianza y valor visible)

### P2.1 — Dashboard de valor operacional
- Surface principal con:
  - piezas programadas/publicadas por semana,
  - tiempo estimado ahorrado,
  - tasa de aprobación y tasa de publicación.
- Comparativa semana actual vs anterior para reforzar ROI.

### P2.2 — Estado de publicación confiable
- Timeline por contenido: generado -> aprobado -> scheduled -> publicado/fallido.
- Indicadores de reconciliación con Buffer para evitar “falso publicado”.

### P2.3 — UX multi-workspace para agencias
- Mejorar cambios de organización y contexto activo (evitar acciones en workspace equivocado).
- Alertas de autopiloto/errores por workspace con priorización operativa.

---

## 4) Plan de medición (funnel + task success)

## 4.1 Funnel principal (trial -> valor)

Definición de embudo recomendado:

1. `signup_completed`
2. `onboarding_step_1_completed` (workspace)
3. `onboarding_step_2_completed` (IA key)
4. `onboarding_step_3_completed` (Buffer key)
5. `onboarding_step_3b_channels_synced`
6. `onboarding_step_4_completed` (config agente)
7. `first_content_generated`
8. `first_content_approved`
9. `first_content_scheduled` (North activation event)
10. `autopilot_activated`

KPIs de funnel:

- Step completion por paso y drop-off entre pasos.
- TTFSP (Time-To-First-Scheduled-Post): mediana y P75.
- Activation D7 y D14: % workspaces nuevos con >=1 `ScheduledPost`.
- Trial -> Paid (cohorte con/ sin autopiloto activo).

## 4.2 Métricas de éxito de tareas (task success metrics)

Tareas críticas y métricas:

- **Tarea 1:** conectar IA + Buffer + sync canales  
  - task success rate, time on task, error rate.
- **Tarea 2:** aprobar y programar contenido  
  - success rate >= 85%, reintentos por tarea, tiempo promedio.
- **Tarea 3:** activar autopiloto funcional  
  - success rate (config guardada + `isAutopilotActive=true` + `nextRunAt` definido).

Métricas de calidad operativa UX:

- % de intents de publicación bloqueados por prerequisitos faltantes.
- % de contenidos `APPROVED` que llegan a `SCHEDULED/PUBLISHED` en 24h.
- Ratio de uso de CTA principal (Studio/Checklist) vs CTA secundario (hooks).

## 4.3 Instrumentación requerida (gap actual)

- Estandarizar eventos de producto en server actions y/o capa de tracking (además de AuditLog).
- Añadir `event_name`, `organization_id`, `user_role`, `step`, `error_code`, `time_to_complete`.
- Dashboard semanal único UX/CTO/CMO con definiciones compartidas.

---

## 5) Plan de investigación de usabilidad

## 5.1 Participantes

- 12 participantes totales (3 rondas de 4):
  - 8 perfiles agencia boutique LATAM (ICP primario),
  - 4 perfiles pyme con marketing lean (ICP secundario).
- Mezcla de experiencia:
  - 50% familiarizados con Buffer,
  - 50% no expertos técnicos.

## 5.2 Metodología y cadencia

- Ronda 1 (semana 2-3): baseline flujo actual.
- Ronda 2 (semana 6-7): validar mejoras 0-30 y parte 31-60.
- Ronda 3 (semana 10-11): validar dashboard de valor + confianza autopiloto.
- Formato: test moderado remoto (45 min) + encuesta breve post-task.

## 5.3 Tareas de prueba

1. Completar onboarding y dejar canales listos para publicar.
2. Generar 1 slideshow en Studio.
3. Aprobar y programar 1 contenido para mañana.
4. Activar autopiloto con horario definido.
5. Verificar en calendario qué se publicará esta semana.

## 5.4 Criterios de éxito por investigación

- >= 80% completan onboarding + sync sin ayuda.
- >= 85% completan aprobar+programar sin error bloqueante.
- <= 5 min para primera programación en usuarios nuevos guiados.
- SUS >= 75 en flujo onboarding/editorial.
- >= 70% declaran “entiendo qué está automatizado y qué requiere mi intervención”.

---

## 6) Dependencias explícitas con CTO y CMO

## 6.1 Dependencias con CTO

1. **Instrumentación de eventos y scorecard**  
   Necesario para medir drop-off por paso y TTFSP con trazabilidad por organización.

2. **Validación técnica de keys y canales en tiempo real**  
   Endpoints/acciones para validar credenciales y estado de sincronización sin fricción.

3. **Reconciliación de estado Buffer (`SCHEDULED` -> `PUBLISHED`)**  
   Sin esto no hay confianza UX ni métricas de valor confiables.

4. **Superficie de salud de pipeline (Inngest/render/publish)**  
   UX necesita exponer errores accionables, no fallas silenciosas.

5. **Guardrails de límites/planes**  
   UX de paywall y límites depende de reglas runtime claras (WS-CTO-2).

## 6.2 Dependencias con CMO

1. **Narrativa y copy de objeciones BYOK/Buffer**  
   Textos de onboarding, tooltip y lifecycle deben responder objeciones reales del ICP.

2. **Definición de claims permitidos de autopiloto**  
   UX no debe prometer “publicado” si la reconciliación técnica aún es parcial.

3. **Segmentación por vertical para plantillas quick-start**  
   Inputs de mensajes y casos de uso para presets en Automation/Studio.

4. **Lifecycle D0-D14 por estado de activación**  
   Emails/in-app nudges coordinados con hitos del funnel UX.

## 6.3 Acuerdos de operación UX-CTO-CMO

- Weekly review único con 6 métricas: step completion, TTFSP, activation D14, approve->schedule rate, publish success real, trial->paid.
- Cada sprint define: 3 hipótesis UX, 3 cambios implementados, 3 aprendizajes validados/refutados.

---

## 7) Riesgos UX más probables y mitigaciones

- **Riesgo:** fricción BYOK no baja lo suficiente.  
  **Mitigación:** validaciones inline + setup asistido para design partners + copy anti-objeciones.

- **Riesgo:** usuario “termina onboarding” pero no logra publicar.  
  **Mitigación:** convertir sync de canales en requisito visible antes de declarar setup completo.

- **Riesgo:** desalineación marketing-producto (“autopiloto total” vs realidad operativa).  
  **Mitigación:** claims graduados por nivel de configuración y estado de confiabilidad técnica.

- **Riesgo:** mejoras UX sin instrumentación no muestran impacto.  
  **Mitigación:** bloquear releases UX críticos sin eventos mínimos acordados con CTO.

