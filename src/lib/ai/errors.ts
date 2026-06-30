import type { AIProviderId } from "./types";

/**
 * Coarse classification of why an AI request failed. Each code maps to a single,
 * actionable, user-facing message (see {@link userMessageForAiError}). Keep this
 * provider-agnostic so OpenAI/Anthropic/Gemini/OpenRouter all funnel into the
 * same UX.
 */
export type AiErrorCode =
  | "auth" // 401 — bad / missing API key
  | "permission" // 403 — key valid but not allowed for this resource
  | "not_found" // 404 — usually a retired/unavailable model
  | "rate_limit" // 429 — too many requests
  | "quota" // 402 — out of credit / billing
  | "invalid_request" // other 4xx — malformed request
  | "server" // 5xx — provider outage
  | "network" // fetch failed (DNS, timeout, offline)
  | "bad_response" // provider returned non-JSON / schema mismatch
  | "unknown";

const PROVIDER_LABELS: Record<AIProviderId, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
  minimax: "MiniMax",
};

export function providerLabel(provider: AIProviderId): string {
  return PROVIDER_LABELS[provider] ?? provider;
}

export function aiErrorCodeFromStatus(status: number): AiErrorCode {
  if (status === 401) return "auth";
  if (status === 403) return "permission";
  if (status === 404) return "not_found";
  if (status === 402) return "quota";
  if (status === 429) return "rate_limit";
  if (status >= 400 && status < 500) return "invalid_request";
  if (status >= 500) return "server";
  return "unknown";
}

/**
 * Builds the localized (Spanish), user-friendly message for an error code.
 * Never includes raw provider payloads, status codes or request ids — those are
 * kept in {@link AiProviderError.detail} for server-side logging only.
 */
function buildUserMessage(
  code: AiErrorCode,
  provider: AIProviderId,
  model?: string,
): string {
  const name = providerLabel(provider);
  switch (code) {
    case "auth":
      return `Tu API key de ${name} no es válida o ha expirado. Revísala en Ajustes › Claves de API.`;
    case "permission":
      return `Tu cuenta de ${name} no tiene permiso para esta operación${
        model ? ` con el modelo ${model}` : ""
      }. Revisa tu plan o tus claves en Ajustes.`;
    case "not_found":
      return `El modelo de IA${
        model ? ` (${model})` : ""
      } ya no está disponible en ${name}. Puede que haya sido retirado o que tu plan no lo incluya; actualiza la app o prueba con otro proveedor de IA en Ajustes.`;
    case "rate_limit":
      return `Has alcanzado el límite de solicitudes de ${name}. Espera unos segundos e inténtalo de nuevo.`;
    case "quota":
      return `Tu cuenta de ${name} no tiene crédito suficiente. Revisa tu facturación con el proveedor.`;
    case "invalid_request":
      return `${name} rechazó la solicitud. Ajusta tu prompt e inténtalo de nuevo.`;
    case "server":
      return `${name} está teniendo problemas temporales. Inténtalo de nuevo en unos minutos.`;
    case "network":
      return `No se pudo conectar con ${name}. Revisa tu conexión e inténtalo de nuevo.`;
    case "bad_response":
      return `La IA (${name}) devolvió una respuesta inesperada. Inténtalo de nuevo.`;
    default:
      return `Ocurrió un error inesperado al contactar con ${name}. Inténtalo de nuevo.`;
  }
}

/**
 * Normalized error thrown by every AI provider. Its `message` is already a
 * clean, localized, user-safe string so existing surfaces (server action state,
 * job/skill `errorMessage`) improve automatically. Raw provider output lives in
 * `detail` and must only be logged server-side.
 */
export class AiProviderError extends Error {
  readonly provider: AIProviderId;
  readonly providerName: string;
  readonly code: AiErrorCode;
  readonly status?: number;
  readonly model?: string;
  /** Raw provider payload — for server logs only, never shown to users. */
  readonly detail?: string;

  constructor(opts: {
    provider: AIProviderId;
    code: AiErrorCode;
    status?: number;
    model?: string;
    detail?: string;
    cause?: unknown;
  }) {
    super(buildUserMessage(opts.code, opts.provider, opts.model), {
      cause: opts.cause,
    });
    this.name = "AiProviderError";
    this.provider = opts.provider;
    this.providerName = providerLabel(opts.provider);
    this.code = opts.code;
    this.status = opts.status;
    this.model = opts.model;
    this.detail = opts.detail;
  }
}

/**
 * Maps a failed HTTP response into a structured {@link AiProviderError}.
 * Consumes the response body (as text) so callers should not read it again.
 */
export async function aiErrorFromResponse(
  provider: AIProviderId,
  res: Response,
  model?: string,
): Promise<AiProviderError> {
  const detail = await res.text().catch(() => "");
  return new AiProviderError({
    provider,
    code: aiErrorCodeFromStatus(res.status),
    status: res.status,
    model,
    detail,
  });
}

/**
 * Returns a user-safe message for any thrown value. {@link AiProviderError}
 * messages are already friendly; anything else falls back to a generic string
 * so raw stack traces / internal details never reach the UI.
 */
export function userMessageForAiError(
  err: unknown,
  fallback = "No se pudo completar la operación. Inténtalo de nuevo.",
): string {
  if (err instanceof AiProviderError) return err.message;
  return fallback;
}
