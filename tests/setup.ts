/**
 * Global Vitest setup — env mínimo para tests unitarios.
 * Integration tests pueden sobreescribir DATABASE_URL en su propio setup.
 */
// Vitest already sets NODE_ENV to "test"; avoid assigning read-only env in strict TS.
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.ENCRYPTION_MASTER_KEY ??=
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/fabrica_test";
