# LUI-3 — Delegation map de ejecución (CTO / CMO / UXDesigner)

Fecha: 2026-06-22  
Contexto: convertir Fábrica en negocio vendible y escalable, con foco en activación y revenue inicial.

## 1) Workstreams con ownership claro

## CTO

### WS-CTO-1: Confiabilidad del pipeline core (generate -> render -> schedule/publish)
- **Objetivo:** subir confiabilidad del flujo E2E para sostener promesa de “autopiloto”.
- **Primer entregable:** tablero operativo v1 con tasa de éxito por etapa + runbook de incidentes.
- **Criterios de aceptación:**
  - Métrica visible diaria de éxito E2E por org.
  - Alertas para fallos críticos (render/publish).
  - MTTR documentado con responsables.
- **Dependencias:** acceso a logs/eventos Inngest, mapeo de estados Buffer, soporte de UX para surface de errores.

### WS-CTO-2: Monetización base (metering + limits + planes)
- **Objetivo:** habilitar cobro sostenible por capacidad de plataforma.
- **Primer entregable:** implementación de límites por plan (Starter/Pro/Agency) sobre `UsageRecord`.
- **Criterios de aceptación:**
  - Plan activo por org aplicado en runtime.
  - Bloqueo o aviso claro al superar cuota.
  - Reporte mensual por org para facturación.
- **Dependencias:** definición de pricing (CMO + CEO), UX de paywall y mensajes de límite.

### WS-CTO-3: Activación técnica (time-to-first-value)
- **Objetivo:** que un trial llegue a primer contenido programado en < 30 min.
- **Primer entregable:** checklist técnico de activación + validaciones preventivas en onboarding (keys/canales).
- **Criterios de aceptación:**
  - Detección explícita de setup incompleto.
  - Error states accionables (no silenciosos).
  - Reducción de tickets de onboarding técnico.
- **Dependencias:** UX onboarding, playbook de implementación de CMO/CS.

---

## CMO

### WS-CMO-1: Segmentación y oferta comercial inicial
- **Objetivo:** cerrar narrativa y oferta para vender a agencias boutique LATAM.
- **Primer entregable:** one-pager comercial (ICP, dolor, propuesta, pricing, objeciones).
- **Criterios de aceptación:**
  - Mensaje unificado web/demo/outbound.
  - Script de discovery y demo de 30 min.
  - 20 cuentas target priorizadas (ABM ligero).
- **Dependencias:** pricing final (CEO/CTO), evidencia de confiabilidad del producto.

### WS-CMO-2: Motor de demanda 0-90
- **Objetivo:** generar pipeline de oportunidades repetible.
- **Primer entregable:** plan de adquisición por canal (LinkedIn, comunidades, referidos, partners Buffer).
- **Criterios de aceptación:**
  - 10+ demos/mes agendadas.
  - Conversión demo->trial trazable por canal.
  - Cadencia de experimentos semanal con learning log.
- **Dependencias:** activos de producto (casos reales), soporte de diseño para landings/creatives.

### WS-CMO-3: Lifecycle de activación y retención temprana
- **Objetivo:** mejorar trial->paid y reducir churn temprano.
- **Primer entregable:** secuencia lifecycle (D0, D1, D3, D7, D14) por estado de activación.
- **Criterios de aceptación:**
  - Triggers automáticos por eventos (sincronizó Buffer, programó primer post, etc.).
  - Mejora de Activation D14 y Trial->Paid.
  - Biblioteca de mensajes por objeción frecuente.
- **Dependencias:** eventos de producto instrumentados por CTO.

---

## UXDesigner

### WS-UX-1: Onboarding de conversión (4 pasos sin fricción)
- **Objetivo:** reducir drop-offs en setup (IA, Buffer, agente).
- **Primer entregable:** rediseño v2 del onboarding con validaciones inline y “next best action”.
- **Criterios de aceptación:**
  - Completion rate onboarding >= 70% en cohorte trial.
  - Menor abandono en paso de Buffer.
  - Test de usabilidad con 5 usuarios del ICP.
- **Dependencias:** instrumentación de embudos (CTO), copy de objeciones (CMO).

### WS-UX-2: Flujo editorial (aprobar -> publicar -> calendario)
- **Objetivo:** convertir contenido generado en publicaciones efectivas con mínima fricción.
- **Primer entregable:** flujo unificado de revisión/publicación con estado claro.
- **Criterios de aceptación:**
  - Task success rate >= 85% en “aprobar y programar”.
  - Claridad visual de estados (`PENDING_APPROVAL`, `APPROVED`, `SCHEDULED`, `PUBLISHED`).
  - Menos retrabajo por errores de operación.
- **Dependencias:** reconciliación técnica de estados (CTO), mensajes y tono comercial (CMO).

### WS-UX-3: Surface de valor para agencias
- **Objetivo:** que una agencia vea ROI operativo en el producto en 1 sesión.
- **Primer entregable:** dashboard de valor (tiempo ahorrado, piezas programadas, tasa de publicación).
- **Criterios de aceptación:**
  - Métricas visibles por workspace sin export manual.
  - 3 cuentas piloto confirman utilidad para operación.
- **Dependencias:** KPIs instrumentados por CTO, narrativa de valor de CMO.

---

## 2) Secuencia de ejecución recomendada (90 días)

1. **Sprint 1-2 (semanas 1-4):** WS-CTO-1 + WS-UX-1 + WS-CMO-1.  
2. **Sprint 3-4 (semanas 5-8):** WS-CTO-2 + WS-CMO-2 + WS-UX-2.  
3. **Sprint 5-6 (semanas 9-12):** WS-CTO-3 + WS-CMO-3 + WS-UX-3.

Regla operativa: ningún push comercial masivo sin que WS-CTO-1 esté en “verde”.

---

## 3) Agentes recomendados a contratar

## A) Agents para capacidad de planificación (0-30 días)

1. **Agent de Market Intelligence (Planning)**
   - Misión: sizing y priorización ICP por vertical/país.
   - Output: top 3 segmentos con TAM/SAM operativo y lista de 100 cuentas target.

2. **Agent de Pricing & Packaging (Planning)**
   - Misión: validar sensibilidad de precio y estructura de planes.
   - Output: propuesta final de tiers + guardrails de descuentos + política de trial.

3. **Agent de GTM Ops (Planning)**
   - Misión: diseñar funnel y sistema de medición comercial.
   - Output: dashboard semanal de pipeline (lead->demo->trial->paid) con definiciones unificadas.

4. **Agent de Customer Research (Planning)**
   - Misión: entrevistas cualitativas con ICP (dolor, objeciones, valor percibido).
   - Output: 10 entrevistas sintetizadas en decisiones de producto/mensaje.

## B) Agents para capacidad de ejecución (30-180 días)

1. **Agent Full-Stack Product (Execution)**
   - Foco: onboarding, paywalls, instrumentación y mejoras de activación.
   - Ownership: WS-CTO-2 y WS-CTO-3.

2. **Agent Integrations & Reliability (Execution)**
   - Foco: Inngest, Buffer sync/publish, observabilidad, reintentos y runbooks.
   - Ownership: WS-CTO-1.

3. **Agent Growth Lifecycle (Execution)**
   - Foco: journeys de trial, nudges por eventos y optimización de conversión.
   - Ownership: WS-CMO-3.

4. **Agent Content/GTM (Execution)**
   - Foco: outbound, demos, casos de uso y assets de venta.
   - Ownership: WS-CMO-1 y WS-CMO-2.

5. **Agent Product Design (Execution)**
   - Foco: UX de onboarding, flujo editorial y dashboard de valor.
   - Ownership: WS-UX-1, WS-UX-2, WS-UX-3.

---

## 4) Cadencia de gobernanza recomendada

- **Weekly exec review (45 min):** CEO + CTO + CMO + UXD con scorecard único.
- **Métricas obligatorias por semana:**
  - Demos agendadas
  - Trials activos
  - Activation D14
  - Workspaces pagos nuevos
  - Éxito E2E de pipeline
  - Churn temprano

Salida esperada por reunión: 3 decisiones, 3 owners, 3 fechas.
