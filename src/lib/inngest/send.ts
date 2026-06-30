import "server-only";

import { inngest } from "@/lib/inngest/client";

export class InngestUnavailableError extends Error {
  readonly code = "INNGEST_UNAVAILABLE" as const;

  constructor(message: string) {
    super(message);
    this.name = "InngestUnavailableError";
  }
}

const INNGEST_SETUP_HINT =
  "Configurá INNGEST_EVENT_KEY y conectá el worker en /api/inngest. En local: npx inngest-cli dev.";

/** User-facing message for server actions and UI banners. */
export function inngestUnavailableMessage(): string {
  return `El servicio de colas (Inngest) no está disponible. ${INNGEST_SETUP_HINT}`;
}

export function isInngestUnavailableError(e: unknown): e is InngestUnavailableError {
  return e instanceof InngestUnavailableError;
}

type InngestSendArg = Parameters<typeof inngest.send>[0];

/**
 * Wraps inngest.send with preflight and actionable errors when the queue is down
 * or misconfigured (dead-end D5).
 */
export async function sendInngestEvent(payload: InngestSendArg): Promise<void> {
  const hasEventKey = Boolean(process.env.INNGEST_EVENT_KEY?.trim());
  if (!hasEventKey && process.env.NODE_ENV === "production") {
    throw new InngestUnavailableError(inngestUnavailableMessage());
  }

  try {
    await inngest.send(payload);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new InngestUnavailableError(
      `${inngestUnavailableMessage()} Detalle: ${detail}`,
    );
  }
}
