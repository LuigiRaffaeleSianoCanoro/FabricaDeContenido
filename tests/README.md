# Tests — Fabrica de Contenido

## Estructura

| Carpeta | Herramienta | Propósito |
|---------|-------------|-----------|
| `unit/` | Vitest | Lógica pura, utils, validadores |
| `integration/` | Vitest + Prisma | Services con DB de test |
| `e2e/` | Playwright | Flujos de usuario end-to-end |
| `fixtures/` | — | Factories y datos compartidos |

## Comandos

```bash
npm test              # vitest run (unit + integration)
npm run test:watch    # modo watch
npm run test:coverage # reporte de cobertura
npm run test:e2e      # playwright (arranca dev server si no hay CI)
```

## Setup

### Unit / integration
- Env de test en `tests/setup.ts`
- DB de integration: crear `fabrica_test` o usar `DATABASE_URL` apuntando a schema de test

### E2E
- Requiere app corriendo o deja que Playwright la arranque (`playwright.config.ts`)
- Clerk test keys para flujos autenticados (pendiente)

## Convenciones

Ver `.cursor/rules/testing-standards.mdc` y skill `.cursor/skills/testing/fabrica-testing/`.
