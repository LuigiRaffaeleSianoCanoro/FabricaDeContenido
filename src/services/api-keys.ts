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

const AI_PROVIDERS: ApiKeyProvider[] = ["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER"];

export async function getFirstActiveAiKeyForOrg(organizationId: string) {
  for (const provider of AI_PROVIDERS) {
    const row = await prisma.encryptedApiKey.findFirst({
      where: { organizationId, provider, isActive: true, revokedAt: null },
    });
    if (row) return { row, provider };
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
