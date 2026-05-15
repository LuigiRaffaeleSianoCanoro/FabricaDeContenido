import "server-only";

import type { AIProviderId } from "@/lib/ai";
import { createAIProvider } from "@/lib/ai";
import { getServerEnv } from "@/config/env.server";
import { decryptSecret } from "@/lib/encryption/cipher";
import { prisma } from "@/lib/db/prisma";
import type { ApiKeyProvider } from "@prisma/client";

function mapProvider(p: ApiKeyProvider): AIProviderId {
  switch (p) {
    case "OPENAI":
      return "openai";
    case "ANTHROPIC":
      return "anthropic";
    case "GEMINI":
      return "gemini";
    case "OPENROUTER":
      return "openrouter";
    default:
      throw new Error(`Provider ${p} is not mapped to an AI adapter`);
  }
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

  return createAIProvider(mapProvider(provider), secret);
}

export async function touchApiKeyUsed(id: string) {
  await prisma.encryptedApiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}
