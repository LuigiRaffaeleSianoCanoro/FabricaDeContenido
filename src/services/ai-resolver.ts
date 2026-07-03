import "server-only";

import type { AIProvider, AIProviderId } from "@/lib/ai";
import { createAIProvider } from "@/lib/ai";
import { getServerEnv } from "@/config/env.server";
import { getPlan, AGENT_CREDIT_COSTS, type CreditedAction } from "@/lib/billing/plans";
import { remainingAgentCredits } from "@/lib/billing/quota";
import { prisma } from "@/lib/db/prisma";

import {
  getActiveAiProviderForOrg,
  getFirstActiveAiKeyForOrg,
  mapProvider,
  touchApiKeyUsed,
} from "./api-keys";
import { getMonthlyUsage } from "./usage";

export type ResolvedAi = {
  ai: AIProvider;
  /** "byok" = tenant key (no credits); "platform" = our key (consumes credits). */
  source: "byok" | "platform";
  provider: AIProviderId;
  /** EncryptedApiKey id when source is "byok". */
  keyId?: string;
};

export class AiUnavailableError extends Error {
  readonly code: "no_key" | "no_credits";

  constructor(code: "no_key" | "no_credits", message: string) {
    super(message);
    this.name = "AiUnavailableError";
    this.code = code;
  }
}

export function isPlatformAiConfigured(): boolean {
  const env = getServerEnv();
  if (!env.PLATFORM_AI_API_KEY) return false;
  if ((env.PLATFORM_AI_PROVIDER ?? "openai") === "custom" && !env.PLATFORM_AI_BASE_URL) {
    return false;
  }
  return true;
}

function createPlatformAiProvider(): AIProvider {
  const env = getServerEnv();
  const providerId = env.PLATFORM_AI_PROVIDER ?? "openai";
  if (!env.PLATFORM_AI_API_KEY) {
    throw new AiUnavailableError(
      "no_key",
      "La IA de la plataforma no está configurada. Añadí tu propia API key en Ajustes o contactá soporte.",
    );
  }
  return createAIProvider(providerId, env.PLATFORM_AI_API_KEY, {
    baseUrl: env.PLATFORM_AI_BASE_URL,
    defaultModel: env.PLATFORM_AI_MODEL,
    displayName: "IA de la plataforma",
  });
}

/**
 * Resolves the AI provider for an org following the freemium/premium model:
 *
 * 1. BYOK first — if the org has any active tenant key, use it (never consumes credits).
 * 2. Platform AI — premium plans without a tenant key fall back to the platform key,
 *    provided they still have agent credits for `action`.
 *
 * Throws {@link AiUnavailableError} with a user-safe Spanish message otherwise.
 */
export async function resolveAiForOrg(
  organizationId: string,
  action: CreditedAction,
): Promise<ResolvedAi> {
  const keyInfo = await getFirstActiveAiKeyForOrg(organizationId);
  if (keyInfo) {
    const ai = await getActiveAiProviderForOrg(organizationId, keyInfo.provider);
    await touchApiKeyUsed(keyInfo.row.id);
    return {
      ai,
      source: "byok",
      provider: mapProvider(keyInfo.provider),
      keyId: keyInfo.row.id,
    };
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true, bonusCredits: true },
  });
  const plan = getPlan(org?.plan);

  if (!plan.platformAiIncluded || !isPlatformAiConfigured()) {
    throw new AiUnavailableError(
      "no_key",
      "No hay una API key de IA activa. Añadí tu propia key en Ajustes, o pasate a un plan premium para usar la IA de la plataforma.",
    );
  }

  const usage = await getMonthlyUsage(organizationId);
  const remaining = remainingAgentCredits(plan, usage, org?.bonusCredits ?? 0);
  if (remaining < AGENT_CREDIT_COSTS[action]) {
    throw new AiUnavailableError(
      "no_credits",
      `Te quedaste sin créditos de agente este mes (quedan ${remaining}). Añadí tu propia API key en Ajustes o ampliá tus créditos en Facturación.`,
    );
  }

  return {
    ai: createPlatformAiProvider(),
    source: "platform",
    provider: getServerEnv().PLATFORM_AI_PROVIDER ?? "openai",
  };
}
