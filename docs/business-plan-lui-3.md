# LUI-3 — Plan de negocio (Fábrica de Contenido)

Fecha: 2026-06-22  
Owner: CTO direct report (heartbeat LUI-3)

## 1) Qué negocio puede ser este producto

Este repositorio ya implementa el núcleo de un **SaaS B2B de “autopiloto de contenido social en video”**:

- Onboarding guiado para crear workspace y configurar stack BYOK (IA + Buffer + opcional Editframe).
- Generación de guiones/hooks con skills de IA (`hook-generator`, `slideshow-planner`).
- Producción de assets (imágenes Pexels/OpenAI + voz Edge TTS + render de slideshow).
- Publicación y programación multicanal vía Buffer.
- Orquestación recurrente con Inngest (`autopilotTick` cada 15 min).

### Oportunidad concreta

Convertir “Fábrica” en el **sistema operativo de contenido recurrente** para equipos pequeños que hoy dependen de freelancers/agencias para mantener publicaciones constantes.

Tesis: el valor no es “otro generador de copies”, sino **pasar de brief a contenido publicado de forma autónoma** con control editorial.

---

## 2) Propuesta de valor

**Propuesta principal**  
“Configuras una vez (marca, tono, redes y horarios), y Fábrica genera, aprueba y publica contenido social recurrente en piloto automático.”

**Valor tangible por rol cliente**

- Dueño/CMO pyme: reduce tiempo operativo semanal de contenido.
- Social media manager: aumenta volumen y constancia sin crecer equipo.
- Agencia boutique: gestiona más cuentas con la misma capacidad.

**Pruebas de valor ya presentes en producto**

- Autopiloto + programación real (no solo drafting).
- BYOK cifrado (reduce costo variable y preocupación por uso de modelos).
- Flujo end-to-end visible en Dashboard (Studio, Jobs, Content, Calendar).

---

## 3) ICP y personas

## ICP primario (primer foco comercial)

**Agencias boutique y estudios de social media en LATAM**  

- 5-30 clientes activos.
- Equipo operativo pequeño (1-5 creadores/social media).
- Publican en varias redes y ya usan Buffer o están dispuestos a usarlo.
- Dolor principal: throughput y consistencia de publicación.

## ICP secundario

**Pymes B2C/B2B con marketing interno lean**

- 1-3 personas en marketing.
- Necesitan presencia constante, no producción audiovisual premium.

## Personas clave

1. **“Sofi” (Social Media Lead en agencia)**: quiere escalar volumen sin perder control.
2. **“Diego” (Founder de pyme)**: busca delegar contenido sin contratar equipo completo.
3. **“Ana” (Operaciones/Owner)**: necesita predictibilidad, reporting y menor costo por post publicado.

---

## 4) Posicionamiento y diferenciación

## Posicionamiento recomendado

**“Autopiloto de contenido social BYOK para equipos lean que necesitan publicar de forma constante.”**

## Diferenciadores reales del repo (hoy)

1. **BYOK multi-proveedor** (OpenAI/Anthropic/Gemini/OpenRouter) cifrado por org.
2. **Pipeline operativo completo** (plan → render → schedule/publish), no solo generación de texto.
3. **Autopilot recurrente** ya implementado con cron y configuración por workspace.
4. **Arquitectura multi-tenant** preparada para roles, auditoría y escalado.

## Diferenciadores aún no cerrados (para prometer con cuidado)

- Billing/cuotas productizadas.
- Estado de publicación reconciliado fin a fin en Buffer.
- UX de invitaciones/colaboración más madura.

---

## 5) Oferta y pricing inicial (v1 comercial)

Nota: el esquema `Plan` ya contempla `FREE / STARTER / PRO / ENTERPRISE`.  
Recomendación: lanzar con 3 planes pagos + trial controlado (evitar free abierto en etapa temprana).

## Paquetes propuestos

### Starter — USD 39/mes por workspace
- 1 workspace, 1 miembro.
- Hasta 300 contenidos/mes (draft + scheduled + published).
- 1 configuración de autopiloto.
- Integración Buffer + BYOK obligatorio.

### Pro — USD 99/mes por workspace
- Hasta 5 miembros.
- Hasta 1,500 contenidos/mes.
- Varias configuraciones de contenido + prioridad de jobs.
- Soporte estándar (SLA 48h hábiles).

### Agency — USD 249/mes por workspace
- Hasta 15 miembros.
- Hasta 6,000 contenidos/mes.
- Controles operativos avanzados (aprobación, auditoría extendida, soporte prioritario).

### Add-ons (desde día 90+)
- Extra de volumen (bloques de contenidos).
- Setup/implementación asistida para agencias.

## Principio de pricing

Cobrar por **capacidad operativa y confiabilidad de autopiloto** (orquestación), no por tokens IA (BYOK).

---

## 6) GTM por fases

## Fase 0-90 días (objetivo: validación comercial con tracción real)

### 0-30 días — “Producto vendible”

Objetivo: cerrar los blockers para vender sin fricción.

- Endurecer flujo crítico: onboarding -> primera publicación programada.
- Instrumentar métricas de activación y publicación.
- Definir pricing, narrativa y página comercial enfocada en agencias.
- Crear playbook de implementación de 45 minutos.

Entregables:
- `Activation Scoreboard` interno.
- Landing y messaging orientados a “publicaciones recurrentes”.
- Primeros 10 diseños de outreach y demo script.

### 31-60 días — “Primeros clientes pagos”

Objetivo: 5-10 cuentas pagas (design partners).

- Founder-led sales outbound (agencias boutique LATAM).
- Onboarding asistido para primeras cuentas.
- Cerrar feedback loop semanal producto-mercado.

Entregables:
- 10-15 demos, 5+ trials activos, 3+ pagos.
- 3 estudios de caso cortos con métricas de “tiempo ahorrado” y “posts/semana”.

### 61-90 días — “Motor repetible”

Objetivo: repetir adquisición/activación con menor costo.

- Canal de adquisición principal (LinkedIn + comunidades + partners Buffer).
- Flujo de trial con nudges de activación (lifecycle).
- Primer dashboard de unit economics (MRR, churn logo, activación, payback simple).

Meta sugerida a día 90:
- 15-25 workspaces pagos.
- Activación D14 >= 40% (trial que logra 1 contenido programado).
- Churn mensual logo < 8% (en cohorte temprana).

## Siguiente etapa (90-180 días)

- Expandir a “segmento agencias” con features operativas (colaboración, permisos, multi-cliente).
- Introducir billing/limits robustos y mayor observabilidad.
- Escalar adquisición hacia un mix de inbound + afiliados/partners.

---

## 7) Métrica norte y KPIs por función

## North Star Metric (NSM)

**Publicaciones útiles programadas por workspace por semana (PUPS).**

Razón: mide valor real entregado (no solo generación de drafts).

## KPIs por función

### Producto
- Activation D7: % de nuevos workspaces con 1 contenido programado.
- Time-to-first-scheduled-post (TTFSP).
- % de contenido aprobado que termina scheduled/published.

### Ingeniería / CTO
- Éxito pipeline end-to-end (`content/slideshow.requested` -> `scheduledPost` creado).
- Tasa de fallos por etapa (IA, render, publish).
- MTTR de incidentes críticos.

### Marketing / CMO
- SQLs/mes (agencias y pymes).
- CAC por canal.
- % demos que inician trial.

### Ventas / Revenue
- Trial -> Paid conversion.
- MRR neto nuevo mensual.
- Ticket promedio por plan.

### UX / Diseño
- Completion rate por paso onboarding.
- Drop-off por step (Workspace, IA, Buffer, Agente).
- Task success rate en aprobación/publicación.

### Customer Success / Operaciones
- NPS/CSAT de onboarding.
- Churn de logos y motivos de baja.
- % cuentas activas con autopiloto habilitado.

---

## 8) Riesgos y mitigaciones

1. **Dependencia de BYOK (fricción inicial alta)**  
   Mitigación: onboarding guiado más simple, validación de keys en tiempo real, setup asistido para cuentas clave.

2. **Promesa de “autopiloto” sin confiabilidad suficiente**  
   Mitigación: priorizar observabilidad y reconciliación de estados (especialmente publicación final).

3. **Limitación de canal de publicación (Buffer-only)**  
   Mitigación: posicionar claramente “Buffer-first”; priorizar conectores según demanda real de ICP.

4. **Falta de billing/limits puede bloquear monetización**  
   Mitigación: implementar metering sobre `UsageRecord` + gating por plan en sprint dedicado (0-45 días).

5. **Riesgo de churn por calidad variable del contenido IA**  
   Mitigación: plantillas de briefing por vertical, mejor loop de aprobación y versionado de prompts/skills.

---

## 9) Decisiones ejecutivas inmediatas (próximos 14 días)

1. Confirmar ICP primario: **agencias boutique LATAM** (sí/no).
2. Aprobar packaging/pricing inicial (Starter/Pro/Agency).
3. Priorizar roadmap comercial:  
   a) confiabilidad pipeline + métricas,  
   b) billing básico,  
   c) onboarding de conversión.
4. Definir target del heartbeat siguiente: **primeras 5 cuentas en trial asistido**.
