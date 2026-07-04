import "server-only";

import type { AIProviderId } from "@/lib/ai";
import { createAIProvider } from "@/lib/ai";
import { getServerEnv } from "@/config/env.server";
import { decryptSecret } from "@/lib/encryption/cipher";
import { prisma } from "@/lib/db/prisma";
import type { ApiKeyProvider } from "@prisma/client";

export function mapProvider(p: ApiKeyProvider): AIProviderId {
  switch (p) {
    case "OPENAI":
      return "openai";
    case "ANTHROPIC":
      return "anthropic";
    case "GEMINI":
      return "gemini";
    case "OPENROUTER":
      return "openrouter";
    case "MINIMAX":
      return "minimax";
    case "GROQ":
      return "groq";
    case "MISTRAL":
      return "mistral";
    case "DEEPSEEK":
      return "deepseek";
    case "XAI":
      return "xai";
    case "TOGETHER":
      return "together";
    case "CUSTOM":
      return "custom";
    default:
      throw new Error(`Provider ${p} is not mapped to an AI adapter`);
  }
}

type ApiKeyMetadata = { baseUrl?: string; model?: string };

function parseKeyMetadata(metadata: unknown): ApiKeyMetadata {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const m = metadata as Record<string, unknown>;
    return {
      baseUrl: typeof m.baseUrl === "string" && m.baseUrl.length > 0 ? m.baseUrl : undefined,
      model: typeof m.model === "string" && m.model.length > 0 ? m.model : undefined,
    };
  }
  return {};
}

export async function getActiveAiProviderForOrg(
  organizationId: string,
  provider: ApiKeyProvider,
) {
  const row = await prisma.encryptedApiKey.findFirst({
    where: { organizationId, provider, isActive: true, revokedAt: null },
  });
  if (!row) {
    throw new Error(`No active API key for ${provider}`);
  }

  const env = getServerEnv();
  const secret = decryptSecret(
    {
      ciphertext: row.encryptedPayload,
      iv: row.iv,
      authTag: row.authTag,
    },
    env.ENCRYPTION_MASTER_KEY,
  );

  const meta = parseKeyMetadata(row.metadata);
  return createAIProvider(mapProvider(provider), secret, {
    baseUrl: meta.baseUrl,
    defaultModel: meta.model,
    displayName: row.label ?? undefined,
  });
}

export async function touchApiKeyUsed(id: string) {
  await prisma.encryptedApiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}

export const AI_KEY_PROVIDERS: ApiKeyProvider[] = [
  "OPENAI",
  "ANTHROPIC",
  "GEMINI",
  "OPENROUTER",
  "MINIMAX",
  "GROQ",
  "MISTRAL",
  "DEEPSEEK",
  "XAI",
  "TOGETHER",
  "CUSTOM",
];

const AI_PROVIDERS = AI_KEY_PROVIDERS;

export async function getFirstActiveAiKeyForOrg(organizationId: string) {
  const rows = await prisma.encryptedApiKey.findMany({
    where: {
      organizationId,
      provider: { in: AI_PROVIDERS },
      isActive: true,
      revokedAt: null,
    },
  });
  for (const provider of AI_PROVIDERS) {
    const row = rows.find((r) => r.provider === provider);
    if (!row) continue;
    // Legacy CUSTOM keys saved before base URLs existed can't generate content.
    if (provider === "CUSTOM" && !parseKeyMetadata(row.metadata).baseUrl) continue;
    return { row, provider };
  }
  return null;
}

export async function getBufferAccessTokenForOrg(organizationId: string) {
  const row = await prisma.encryptedApiKey.findFirst({
    where: { organizationId, provider: "BUFFER", isActive: true, revokedAt: null },
  });
  if (!row) return null;
  const env = getServerEnv();
  const secret = decryptSecret(
    {
      ciphertext: row.encryptedPayload,
      iv: row.iv,
      authTag: row.authTag,
    },
    env.ENCRYPTION_MASTER_KEY,
  );
  return { token: secret, keyId: row.id };
}

export async function getEditframeApiKeyForOrg(organizationId: string) {
  const row = await prisma.encryptedApiKey.findFirst({
    where: { organizationId, provider: "EDITFRAME", isActive: true, revokedAt: null },
  });
  if (!row) return null;
  const env = getServerEnv();
  const secret = decryptSecret(
    {
      ciphertext: row.encryptedPayload,
      iv: row.iv,
      authTag: row.authTag,
    },
    env.ENCRYPTION_MASTER_KEY,
  );
  return { token: secret, keyId: row.id };
}

/** Returns the decrypted raw secret for a given provider (e.g. OPENAI for image generation). */
export async function getRawApiKeyForOrg(
  organizationId: string,
  provider: ApiKeyProvider,
) {
  const row = await prisma.encryptedApiKey.findFirst({
    where: { organizationId, provider, isActive: true, revokedAt: null },
  });
  if (!row) return null;
  const env = getServerEnv();
  const secret = decryptSecret(
    {
      ciphertext: row.encryptedPayload,
      iv: row.iv,
      authTag: row.authTag,
    },
    env.ENCRYPTION_MASTER_KEY,
  );
  return { token: secret, keyId: row.id };
}
