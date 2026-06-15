export type DbErrorKind = "unreachable" | "schema" | "config" | "unknown";

/**
 * Maps a raw Prisma/Postgres error message to a coarse cause. Kept free of
 * `server-only`/Prisma imports so it can be reused and unit-tested anywhere.
 *
 * In particular, a missing table such as `OrganizationMember` (Prisma `P2021`)
 * is classified as a `schema` problem so the user is told to run
 * `npm run db:push`.
 */
export function classifyDbError(message: string): DbErrorKind {
  const m = message.toLowerCase();
  if (m.includes("environment variable") || m.includes("datasource") || m.includes("database_url")) {
    return "config";
  }
  if (
    m.includes("can't reach") ||
    m.includes("connection") ||
    m.includes("econnrefused") ||
    m.includes("timeout") ||
    m.includes("getaddrinfo")
  ) {
    return "unreachable";
  }
  if (
    m.includes("does not exist") ||
    m.includes("relation") ||
    m.includes("column") ||
    m.includes("p2021") ||
    m.includes("p2022")
  ) {
    return "schema";
  }
  return "unknown";
}
