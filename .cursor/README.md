# Agent Skills & Rules — Fabrica de Contenido

Estructura de trabajo para agentes de desarrollo (Cursor Cloud, IDE local, y futuros agentes compatibles con el estándar [Agent Skills](https://cursor.com/docs/skills)).

## Layout

```
.cursor/
  README.md                          # Este archivo
  rules/                             # Reglas modulares (.mdc)
    fabrica-project.mdc              # Contexto global (always apply)
    nextjs-development.mdc           # Patrones Next.js 16
    prisma-database.mdc              # Prisma / PostgreSQL
    testing-standards.mdc            # Vitest + Playwright
    linear-workflow.mdc              # Gestión Linear (PSI)
    security.mdc                     # Cifrado, auth, secretos
  skills/                            # Skills específicos del proyecto
    project-management/
      linear-mcp/SKILL.md            # Linear MCP workflow
      to-linear-issues/SKILL.md      # Descomponer planes en issues
    development/
      fabrica-development/SKILL.md   # Setup, arquitectura, checklist PR
    testing/
      fabrica-testing/SKILL.md       # Convenciones de tests del repo

.agents/skills/                      # Skills de comunidad (skills CLI)
  vitest/                            # antfu/skills (25k+ installs)
  playwright-best-practices/         # currents-dev (55k+ installs)
  prisma-client-api/                 # prisma/skills
  prisma-cli/
  vercel-react-best-practices/       # vercel-labs/agent-skills
  web-design-guidelines/
  deploy-to-vercel/

tests/                               # Suite de pruebas
  unit/
  integration/
  e2e/
  fixtures/
```

## Skills instalados (comunidad)

Instalados con `npx skills add <owner/repo@skill> --agent cursor -y --copy`:

| Skill | Fuente | Installs | Uso |
|-------|--------|----------|-----|
| vitest | antfu/skills | 25k+ | Unit/integration tests |
| playwright-best-practices | currents-dev | 55k+ | E2E patterns |
| prisma-client-api | prisma/skills | 12k+ | Queries y API del cliente |
| prisma-cli | prisma/skills | 11k+ | Migraciones y CLI |
| vercel-react-best-practices | vercel-labs | — | Performance React/Next |
| web-design-guidelines | vercel-labs | — | Revisión UI/a11y |
| deploy-to-vercel | vercel-labs | — | Despliegue |

## Uso en Cursor

### Rules
Las reglas en `.cursor/rules/` se aplican automáticamente según `alwaysApply` y `globs`. Ver en **Settings → Rules**.

### Skills
- **Automático**: el agente elige skills por `description` y contexto.
- **Manual**: escribir `/linear-mcp`, `/fabrica-development`, `/vitest`, etc.
- **Scoped**: skills con `paths` solo aparecen al editar archivos coincidentes.

### Linear MCP
Conectar Linear en Cursor (MCP) para que skills de project-management usen `save_issue`, `list_issues`, etc.

## Mantenimiento

### Añadir skill de comunidad
```bash
npx skills search <tema>
npx skills add <owner/repo@skill> --agent cursor -y --copy
```

### Añadir skill del proyecto
Crear carpeta con `SKILL.md` y frontmatter (`name`, `description`) bajo `.cursor/skills/<categoria>/`.

### Añadir regla
Crear `.mdc` en `.cursor/rules/` con frontmatter YAML (`description`, `globs` o `alwaysApply`).

## Relación con AGENTS.md

`AGENTS.md` en la raíz contiene instrucciones para Cursor Cloud (Postgres, Clerk, comandos). Las rules/skills aquí extienden eso con convenciones de código, PM y testing.

## Relación con src/skills/

`src/skills/` son **skills de producto** ejecutados por Inngest en runtime (slideshow, hooks, etc.). **No** confundir con `.cursor/skills/` que guían al agente de desarrollo.
