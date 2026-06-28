---
name: fabrica-testing
description: Estrategia y convenciones de testing para Fabrica de Contenido — Vitest unit/integration, Playwright E2E, mocks de Prisma/Clerk.
paths:
  - "tests/**"
  - "**/*.{test,spec}.{ts,tsx}"
  - "vitest.config.ts"
  - "playwright.config.ts"
---

# Testing — Fabrica de Contenido

## Estructura

```
tests/
  unit/           # Lógica pura, utils, validadores
  integration/    # Services + Prisma
  e2e/            # Playwright — flujos de usuario
  fixtures/       # Factories y datos de prueba
  e2e/pages/      # Page Objects
```

## Prioridades de cobertura

1. **Crítico**: `src/lib/encryption/`, `src/services/api-keys.ts`, validadores Zod
2. **Alto**: `src/skills/executor.ts`, `src/lib/publishing/`, `src/lib/ai/`
3. **Medio**: server actions del dashboard, API routes (`/api/health`, webhooks)
4. **E2E**: onboarding, studio, publicación (requiere Clerk test + servicios)

## Vitest — unit

```typescript
import { describe, it, expect, vi } from "vitest";

describe("slugify", () => {
  it("normalizes accents", () => {
    expect(slugify("Café")).toBe("cafe");
  });
});
```

- Mock Prisma: `vi.mock("@/lib/db/prisma")` con implementación mínima.
- Mock env: `vi.stubEnv("ENCRYPTION_MASTER_KEY", "a".repeat(64))`.
- Co-locate tests opcional: `foo.test.ts` junto a `foo.ts` para módulos pequeños.

## Vitest — integration

- Usar `DATABASE_URL` de test (DB separada o schema `test`).
- `beforeEach`: limpiar tablas relevantes o usar transacciones.
- No mockear Prisma — probar queries reales.

## Playwright — E2E

- Base URL: `http://localhost:3000`
- Auth: usar Clerk testing tokens o bypass documentado.
- Selectores: `data-testid="dashboard-sidebar"` (añadir al crear UI testeable).
- Page Objects en `tests/e2e/pages/`.

## Qué NO testear

- Implementación interna de React (estado privado, orden de hooks).
- Componentes shadcn base sin lógica (`src/components/ui/`).
- Snapshots frágiles de HTML completo.

## Comandos

```bash
npm test                 # vitest run
npm run test:watch       # modo watch
npm run test:coverage    # cobertura v8
npm run test:e2e         # playwright (requiere app corriendo)
npm run test:e2e:ui      # playwright UI mode
```

## Skills de referencia

- `.agents/skills/vitest/` — guía Vitest (antfu)
- `.agents/skills/playwright-best-practices/` — E2E (currents-dev)
