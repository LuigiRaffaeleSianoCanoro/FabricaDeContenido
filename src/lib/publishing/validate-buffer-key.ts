import "server-only";

import { createBufferProvider } from "@/lib/publishing/providers/buffer";

export type BufferKeyErrorKind = "auth" | "network" | "schema" | "unknown";

export type BufferKeyValidationResult =
  | { ok: true; accountEmail?: string; accountName?: string }
  | { ok: false; kind: BufferKeyErrorKind; message: string };

function classifyBufferError(message: string): BufferKeyErrorKind {
  if (/401|403|unauthorized|forbidden|invalid.*key|authentication|graphql error.*auth/i.test(message)) {
    return "auth";
  }
  if (/fetch|network|timeout|ECONNREFUSED|ENOTFOUND|probe timeout/i.test(message)) {
    return "network";
  }
  if (/graphql error|empty response|buffer api 4/i.test(message)) {
    return "schema";
  }
  return "unknown";
}

const AUTH_MESSAGE =
  "La API key de Buffer no es válida o expiró. Generá una nueva en el dashboard de Buffer.";
const NETWORK_MESSAGE =
  "No se pudo contactar a Buffer. Verificá tu conexión e intentá de nuevo.";

/** Validates a Buffer API key before persisting (M3 / PSI-99). */
export async function validateBufferApiKey(apiKey: string): Promise<BufferKeyValidationResult> {
  const trimmed = apiKey.trim();
  if (trimmed.length < 8) {
    return { ok: false, kind: "auth", message: AUTH_MESSAGE };
  }

  try {
    const provider = createBufferProvider();
    const account = await provider.getAccount(trimmed);
    return {
      ok: true,
      accountEmail: account.email,
      accountName: account.name,
    };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const kind = classifyBufferError(raw);
    const message =
      kind === "auth" ? AUTH_MESSAGE : kind === "network" ? NETWORK_MESSAGE : `Buffer: ${raw}`;
    return { ok: false, kind, message };
  }
}
