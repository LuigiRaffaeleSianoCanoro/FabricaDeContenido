---
name: to-linear-issues
description: Descompone planes, specs o PRDs en issues de Linear como vertical slices (tracer bullets). Usar cuando el usuario quiera convertir un plan en tickets, crear issues de implementación, o dividir trabajo.
---

# To Linear Issues

Descompone un plan en issues **independientes** de Linear usando **vertical slices** (tracer bullets): un camino estrecho que cruza la superficie de integración real para ser demostrable o verificable por sí solo.

Referencias: [Tracer Bullets](https://www.aihero.dev/tracer-bullets), *The Pragmatic Programmer*.

## Contexto Fabrica

- **Equipo**: PsicoConecta (`PSI`)
- **Proyectos**: *Fabrica de Contenido — Producto* (eng), *Fabrica GTM — Agencias LATAM* (comercial)
- Docs de producto: `docs/PRODUCT_PLAN.md`, `ROADMAP_TASK_BREAKDOWN.md`

## Proceso

### 1. Recopilar contexto

Usar lo que ya está en la conversación. Si hay referencia Linear (`PSI-123`, URL), `get_issue` con `includeRelations: true`.

### 2. Explorar código (opcional)

Revisar el codebase para que títulos y descripciones usen el lenguaje del dominio (skills, jobs, Buffer, Inngest, etc.).

### 3. Borrador de vertical slices

Cada slice es un camino **vertical** (modelo + API + UI + verificación), no una capa horizontal.

- Entregable estrecho pero **completo** para su alcance.
- Preferir muchos slices finos sobre pocos gruesos.

### 4. Validar con el usuario

Lista numerada con por slice:
- **Título**
- **Labels** (opcional)
- **Blocked by** (índices de borrador)
- **User stories** cubiertas

Preguntar: ¿granularidad correcta? ¿dependencias OK? ¿fusionar o dividir?

### 5. Publicar en Linear

Por cada slice aprobado: `save_issue` sin `id`, `team: "PsicoConecta"`.

- Publicar en orden de dependencias (blockers primero).
- Después de crear blockers, actualizar dependientes con `blockedBy` / `blocks`.
- No cerrar issues padre sin pedido explícito.

### Plantilla de descripción

```markdown
## Parent
Referencia al epic/padre si aplica.

## What to build
Descripción end-to-end del slice vertical. Sin rutas de archivo que envejezcan rápido.

## Acceptance criteria
- [ ] Criterio 1
- [ ] Criterio 2

## Blocked by
- PSI-XX o "None - can start immediately"

## References
Enlaces a docs, ADRs, o recursos externos.
```
