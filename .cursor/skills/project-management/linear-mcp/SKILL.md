---
name: linear-mcp
description: Gestiona issues, proyectos y ciclos en Linear vía MCP. Usar cuando el usuario pida crear/actualizar tickets, consultar backlog, sincronizar PRs con Linear, o gestionar el proyecto Fabrica.
---

# Linear MCP — Fabrica de Contenido

Gestión de proyecto con el servidor **Linear MCP** integrado en Cursor.

## Workspace

| Campo | Valor |
|-------|-------|
| Equipo | PsicoConecta (`PSI`) |
| Proyecto producto | Fabrica de Contenido — Producto |
| Proyecto GTM | Fabrica GTM — Agencias LATAM |
| Estados | Backlog, Todo, In Progress, Done |

## Herramientas MCP principales

### Issues
- `list_issues` — filtrar por team, state, assignee, project, label, query
- `get_issue` — detalle + gitBranchName + relaciones (`includeRelations: true`)
- `save_issue` — crear (sin `id`) o actualizar; requiere `team` al crear
- `save_comment` — comentar progreso en un issue

### Proyectos y planificación
- `list_projects` / `get_project`
- `list_cycles` — sprints del equipo
- `list_milestones` — hitos de un proyecto
- `save_status_update` — updates de salud del proyecto

### Referencia
- `list_issue_statuses` — estados del workflow
- `list_issue_labels` / `create_issue_label`
- `search_documentation` — docs de Linear

## Flujos comunes

### Iniciar trabajo en un issue
1. `get_issue` con el identificador (ej. `PSI-42`)
2. `save_issue` con `id` y `state: "In Progress"`
3. Crear rama alineada con `gitBranchName` si existe

### Cerrar trabajo
1. Verificar lint/build/tests
2. Crear o actualizar PR; enlazar en issue (`links: [{url, title}]`)
3. `save_issue` con `state: "Done"`
4. `save_comment` con resumen de cambios

### Triage de backlog
1. `list_issues` con `team: "PsicoConecta"`, `state: "Backlog"`
2. Priorizar con `priority` (1=Urgent … 4=Low)
3. Asignar labels y mover a Todo

## Reglas

- Buscar issues existentes antes de crear duplicados (`list_issues` con `query`).
- Usar relaciones nativas (`blockedBy`, `blocks`) en lugar de solo texto.
- Comentarios en Markdown; menciones con `@displayName`.
- No archivar ni cancelar issues sin confirmación del usuario.
