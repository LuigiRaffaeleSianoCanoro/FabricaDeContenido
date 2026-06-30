# Auditoría competitiva — Fábrica de Contenido

> Fecha: 2026-06-29  
> Owner: Producto / GTM  
> Linear: [PSI-186](https://linear.app/psicoconecta/issue/PSI-186) (Epic Research), [PSI-187](https://linear.app/psicoconecta/issue/PSI-187) (R1)

## Resumen ejecutivo

**Fábrica de Contenido** compite en el segmento de **autopiloto de contenido social en video** para equipos lean, con foco en agencias boutique LATAM que ya usan **Buffer**.

El competidor real en 2026 no es un generador de copies ni un scheduler aislado, sino el **pipeline completo** (brief → assets → render → publish → recurring). Genviral lo articula explícitamente: *"Your real competitor in 2026 isn't a person. It's a pipeline."*

**Ventaja de Fabrica hoy:** motor E2E implementado (Fases 1–4) + BYOK multi-proveedor + Buffer GraphQL nativo + autopilot Inngest + arquitectura multi-tenant agencia.

**Debilidades vs mercado:** fricción de setup (3 API keys), observabilidad incompleta, sin billing, UX agencia (multi-workspace, channel picker) parcial.

**Posicionamiento recomendado:**

> *"Tu Buffer, potenciado: autopiloto de slideshows con tus propias API keys. Configurás una vez, publicás todos los días."*

**ICP primario:** agencias boutique LATAM, 5–30 clientes, equipo 1–5 personas, usuarios Buffer.

---

## Matriz comparativa — 8 competidores × 14 capacidades

Leyenda: **Full** = nativo y maduro | **Partial** = existe con limitaciones | **None** = no ofrecido | **N/A** = no aplica al modelo

| Capacidad | Fabrica | Genviral | Postcrest | ReelFarm | Blotato | Postrillo | Buffer | OpusClip | SocialPilot |
|-----------|---------|----------|-----------|----------|---------|-----------|--------|----------|-------------|
| 1. Slideshow automation | **Full** | Full | Full | Full | Partial | Partial | None | N/A | None |
| 2. Video render pipeline | **Full** (Editframe BYOK) | Full | Full | Full | Partial | Partial | None | Full (clip) | None |
| 3. AI text generation | **Full** (BYOK) | Full (bundled) | Full (bundled) | Full (bundled) | Full (bundled) | Full (bundled) | Partial | Partial | Partial |
| 4. AI image generation | **Full** (OpenAI/Pexels) | Full | Full | Partial | Full | Full | None | Partial | None |
| 5. Voiceover / TTS | **Full** (Edge TTS) | Full | Full | Partial | Partial | Partial | None | Partial | None |
| 6. Multi-platform publish | **Full** (vía Buffer) | Full (nativo) | Full | Partial (TikTok-first) | Full | Full | Full | Full | Full |
| 7. Buffer integration | **Full** (GraphQL BYOK) | None | Partial | None | Partial | Partial | N/A | Partial | Full |
| 8. BYOK / own API keys | **Full** | None | None | None | None | None | N/A | None | None |
| 9. Autopilot / recurring | **Full** (cron 15min) | Full | Full | Full | Partial | Full (RSS) | Partial | Partial | Partial |
| 10. Agency multi-client | **Partial** (schema OK, UI limitada) | Full | Partial | Full (teams) | Full (20 accts) | Full | Partial | Full | **Full** |
| 11. Approval workflow | **Full** | Full | Partial | None | Partial | Full | Partial | Partial | Full |
| 12. Analytics / reporting | **Partial** | Full | Full | Full | Partial | Full | Full | Full | **Full** |
| 13. Partner API / agent skills | **None** (roadmap Q4) | **Full** | Partial | **Full** (Skill.md) | Partial | Partial | Full (API) | Partial | Partial |
| 14. Pricing (entry) | TBD ($39 propuesto) | $29/mo | ~$80+/mo stack | $19/mo | $29/mo | ~$30/mo | $25/mo | ~$29/mo | $20/mo |

### Fuentes

- Genviral: https://www.genviral.io/ | https://docs.genviral.io/api-reference/introduction
- Postcrest: https://postcrest.com/
- ReelFarm: https://reel.farm/
- Blotato: https://www.blotato.com/blog/buffer-alternatives
- Postrillo: https://www.postrillo.com/
- Buffer: https://buffer.com/
- OpusClip: https://www.opus.pro/business/agencies
- SocialPilot: https://www.socialpilot.co/
- Fabrica (interno): `docs/PRODUCT_PLAN.md`, auditoría código jun 2026

---

## Análisis por categoría competitiva

### Tier 1 — Amenaza directa (pipeline all-in-one)

**Genviral ($29/mo)** — Competidor más cercano. Ofrece slideshow cloner, studio AI (30+ modelos), calendario unificado, analytics, Partner API, cuentas hosteadas en dispositivos US. Gana en fricción cero y API para agentes. Pierde vs Fabrica en BYOK, Buffer-native y agencias que no quieren migrar cuentas.

**Postcrest (~$80+/mo stack)** — Reemplaza Canva + Buffer + ChatGPT + Midjourney. UX unificada para faceless channels. Gana en simplicidad percibida. Pierde en costo acumulado, sin BYOK, sin profundidad Buffer.

### Tier 2 — Amenaza media (formato o ICP overlap)

**ReelFarm ($19/mo)** — Especialista TikTok slideshow + auto-publish nativo + API/Skill.md. Gana en precio y TikTok-first. Pierde en multicanal Buffer, BYOK, agencias multicliente fuera de TikTok.

**Blotato ($29/mo)** — 20 cuentas flat + AI ilimitado. Compite en ICP agencia por pricing. Gana en flat-rate y volumen de cuentas. Pierde en pipeline video profundo y orquestación autopilot.

### Tier 3 — Complementarios o distinto caso de uso

**Buffer ($25/mo)** — Partner, no enemigo. Fabrica es capa de generación + autopilot encima. AI Assistant de Buffer es superficial vs pipeline completo.

**OpusClip** — Repurpose long-form → shorts. Input = video existente, no brief → slideshow. Caso de uso distinto.

**SocialPilot / Later / Hootsuite** — Scheduling + reporting agencias. Sin generación AI nativa profunda. Complementarios o sustitutos parciales de Buffer.

**Postrillo** — AI manager + RSS automation. Menos enfoque video/slideshow. SMB generalista.

---

## Win / Loss analysis

### Cuándo ganamos

| Escenario | Por qué Fabrica gana | Counter-message |
|-----------|---------------------|-----------------|
| Agencia ya en Buffer | No migrar stack; GraphQL BYOK nativo | "Seguí usando Buffer — nosotros generamos y publicamos" |
| Control costos IA | BYOK = tokens a costo del cliente | "Pagás OpenAI directo, nosotros cobramos orquestación" |
| Multicanal (IG, LI, FB, X) | Buffer sync + publish por canal | "ReelFarm es TikTok-only; nosotros van donde Buffer va" |
| Aprobación editorial | Workflow approve → publish | "Autopiloto con control — no black box" |
| Compliance / data residency | Keys cifradas AES-256-GCM por org | "Tus keys, tu cuenta, nosotros no accedemos a tus redes" |
| Extensibilidad futura | Skills registry (Zod + executor) | "Agente configurable por cliente, no template genérico" |

### Cuándo perdemos

| Escenario | Por qué perdemos | Respuesta / acción |
|-----------|-----------------|-------------------|
| Creator solo quiere TikTok ya | ReelFarm/Genviral publish nativo, $19 | **Defer** TikTok-native Q4+; hoy: export + manual |
| Zero-setup demandado | Genviral cuentas hosteadas, 1 click | Mejorar wizard M3; no competir en hosted accounts corto plazo |
| Precio ultra-bajo | ReelFarm $19 vs Fabrica $39 propuesto | Enfatizar valor agencia + Buffer + BYOK; trial asistido |
| API para agentes hoy | Genviral Partner API + ReelFarm Skill.md | **Build Q4** — PSI-191 R5 |
| Analytics unificados | Genviral/Postcrest analytics in-app | **Partner** Buffer analytics; build básico post-D10 |
| All-in-one sin integraciones | Postcrest reemplaza 4 tools | Messaging: "para quien ya tiene Buffer" |

### Objeciones de venta y respuestas

| Objeción | Respuesta |
|----------|-----------|
| "Genviral hace todo por $29" | "Genviral incluye modelos y cuentas — pagás dos veces cuando escalás. Con BYOK controlás costos y mantenés Buffer." |
| "Setup con 3 API keys es mucho" | "45 min asistidos una vez. Después autopiloto. Wizard M3 reduce fricción." |
| "¿Publica solo a TikTok?" | "Publicamos a todos tus canales Buffer: IG, LinkedIn, Facebook, X." |
| "¿Cómo sé que publicó?" | "Reconciliación Buffer en roadmap (PSI-166) — hoy verificás en Buffer directamente." |

---

## Auditoría interna — estado del producto (jun 2026)

| Área | Estado | % |
|------|--------|---|
| Motor pipeline (Fases 1–4) | Implementado | 100% |
| UX self-serve / dead-ends | Parcial (D1–D4 ✅) | 60% |
| Observabilidad (M7) | Stub | 20% |
| Billing (M5) | Schema only | 0% |
| Multi-workspace agencia | Base técnica, sin UI | 30% |
| Tests E2E | Health only | 10% |

### Páginas

| Ruta | Estado | Gap principal |
|------|--------|---------------|
| `/` | ✅ | Messaging agencia, link pricing |
| `/dashboard/*` | ✅/⚠️ | Métricas Buffer (D10), timezone (D15) |
| `/dashboard/content` | ⚠️ | Detalle + player (D14), channel picker (D9) |
| `/pricing` | ❌ | PSI-178 |

### Gap → Linear mapping (priorizado post-auditoría)

| Prioridad | Gap | Issue Linear |
|-----------|-----|--------------|
| **P0** | Health checks Inngest/R2/Buffer | PSI-100, PSI-165 |
| **P0** | Feedback Inngest down | PSI-161 |
| **P0** | Idempotency autopilot | PSI-101 |
| **P0** | Buffer status reconciliation | PSI-166 |
| **P0** | Buffer key validation | PSI-99, PSI-153 |
| **P1** | Multi-workspace MVP | PSI-121 |
| **P1** | Channel picker | PSI-168 |
| **P1** | Content detail + video | PSI-164 |
| **P1** | Timezone real | PSI-154 |
| **P1** | RBAC UI | PSI-167 |
| **P2** | Stripe billing | PSI-157 |
| **P2** | Usage metering | PSI-158 |
| **P2** | Single-brief onboarding | PSI-152, PSI-155 |
| **P2** | E2E activation test | PSI-192 |
| **Q4** | Partner API / MCP | PSI-191 |

---

## Estrategia de mercado — cómo ganar

### No competir (corto plazo)

- Cuentas hosteadas / dispositivos US (Genviral)
- Modelos AI bundled (Postcrest, Genviral)
- TikTok-native auto-publish (ReelFarm)
- Repurpose long-form (OpusClip)

### Sí competir (moat)

1. **Buffer-native depth** — wizard, validation, channel picker, status sync
2. **BYOK trust** — cifrado, audit log, pricing por orquestación
3. **Multi-workspace agencia** — 1 login, N clientes (PSI-151)
4. **Skills extensibles** — agente por cliente (M2)
5. **Partner API Q4** — paridad Genviral/ReelFarm (PSI-191)

### Pricing propuesto

| Plan | Precio | Target |
|------|--------|--------|
| Starter | $39/mo | Pyme lean — 1 workspace, 300 contenidos/mes |
| Pro | $99/mo | Agencia pequeña — 5 miembros, 1.500/mes |
| Agency | $249/mo | Agencia boutique — 15 miembros, 6.000/mes, multi-workspace |

Principio: cobrar por **orquestación y confiabilidad**, no por tokens.

### GTM 90 días — metas

- 20 trials calificados
- 8–12 workspaces pagos
- Activation D14 ≥ 40%
- NSM PUPS ≥ 6 (publicaciones únicas programadas/semana)

---

## Posicionamiento GTM — pain / promise / proof

| Persona | Pain | Promise | Proof (cuando listo) |
|---------|------|---------|---------------------|
| Sofi (Social Lead agencia) | Throughput limitado | 3x posts/semana sin contratar | Case study PUPS |
| Diego (Founder pyme) | Contenido inconsistente | Autopiloto con aprobación opcional | Demo 45 min → primer post |
| Ana (Ops) | Costos IA impredecibles | BYOK = control total | Pricing fijo orquestación |

### Counter-claims vs competidores

1. **vs Genviral:** "No reemplazamos tu stack — potenciamos Buffer que ya pagás."
2. **vs ReelFarm:** "Multicanal desde día 1, no solo TikTok."
3. **vs Blotato:** "Pipeline video completo con voz e imágenes, no solo copies."

---

## Próximos pasos

1. Completar Sprint 1 "Producto confiable" (PSI-100 → PSI-166)
2. Cerrar R2–R4 en Linear (PSI-188, PSI-189) para alinear GTM
3. Actualizar `docs/PRODUCT_PLAN.md` vía R3 (PSI-190)
4. Publicar `/pricing` alineado a PSI-178 post-M5-T1

---

## Referencias

- [`docs/PRODUCT_PLAN.md`](PRODUCT_PLAN.md)
- [`docs/business-plan-lui-3.md`](business-plan-lui-3.md)
- Linear Epic: [PSI-186](https://linear.app/psicoconecta/issue/PSI-186)
