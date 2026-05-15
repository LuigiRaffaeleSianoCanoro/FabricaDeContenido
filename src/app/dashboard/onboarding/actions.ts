"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerEnv } from "@/config/env.server";
import { assertOrgRole } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";
import { encryptSecret, fingerprintSecret } from "@/lib/encryption/cipher";
import { slugify } from "@/lib/utils/slugify";
import { writeAuditLog } from "@/services/audit-log";
import type { ApiKeyProvider } from "@prisma/client";

export type OnboardingActionState = {
  error?: string;
  ok?: boolean;
  organizationId?: string;
};

async function ensureProfile(userId: string, email: string, name: string | null) {
  await prisma.userProfile.upsert({
    where: { id: userId },
    create: { id: userId, email, fullName: name },
    update: { email, ...(name ? { fullName: name } : {}) },
  });
}

function displayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}): string | null {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return user.username ?? null;
}

export async function onboardingCreateOrg(
  _: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const { userId, user } = await requireSession();
  const name = String(formData.get("orgName") ?? "").trim();
  if (name.length < 2) return { error: "Nombre de organización muy corto." };

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  await ensureProfile(userId, email, displayName(user));

  const base = slugify(name);
  let slug = base;
  let n = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      ownerId: userId,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  await writeAuditLog({
    organizationId: org.id,
    actorUserId: userId,
    action: "org.created",
    resourceType: "Organization",
    resourceId: org.id,
    metadata: { slug },
  });

  revalidatePath("/dashboard/onboarding");
  return { ok: true, organizationId: org.id };
}

export async function onboardingSaveAiKey(
  _: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const provider = String(formData.get("provider") ?? "OPENAI") as ApiKeyProvider;
  const key = String(formData.get("apiKey") ?? "").trim();
  if (!organizationId || !key) return { error: "Faltan datos." };

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);
  if (!["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER"].includes(provider)) {
    return { error: "Proveedor no válido." };
  }

  const env = getServerEnv();
  const enc = encryptSecret(key, env.ENCRYPTION_MASTER_KEY);
  const fp = fingerprintSecret(key);

  await prisma.encryptedApiKey.upsert({
    where: {
      organizationId_provider: { organizationId, provider },
    },
    create: {
      organizationId,
      provider,
      label: `${provider} key`,
      encryptedPayload: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      keyFingerprint: fp,
    },
    update: {
      encryptedPayload: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      keyFingerprint: fp,
      isActive: true,
      revokedAt: null,
      lastRotatedAt: new Date(),
    },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "api_key.upsert",
    resourceType: "EncryptedApiKey",
    metadata: { provider },
  });

  revalidatePath("/dashboard/onboarding");
  return { ok: true };
}

export async function onboardingSaveBuffer(
  _: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const token = String(formData.get("bufferToken") ?? "").trim();
  const profileId = String(formData.get("bufferProfileId") ?? "").trim();
  if (!organizationId) return { error: "Organización no válida." };

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  if (token) {
    const env = getServerEnv();
    const enc = encryptSecret(token, env.ENCRYPTION_MASTER_KEY);
    const fp = fingerprintSecret(token);

    await prisma.encryptedApiKey.upsert({
      where: {
        organizationId_provider: { organizationId, provider: "BUFFER" },
      },
      create: {
        organizationId,
        provider: "BUFFER",
        label: "Buffer",
        encryptedPayload: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        keyFingerprint: fp,
      },
      update: {
        encryptedPayload: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        keyFingerprint: fp,
        isActive: true,
        revokedAt: null,
        lastRotatedAt: new Date(),
      },
    });

    await writeAuditLog({
      organizationId,
      actorUserId: userId,
      action: "api_key.upsert",
      resourceType: "EncryptedApiKey",
      metadata: { provider: "BUFFER" },
    });
  }

  if (profileId) {
    await prisma.socialAccount.upsert({
      where: {
        organizationId_platform_handle: {
          organizationId,
          platform: "buffer",
          handle: profileId,
        },
      },
      create: {
        organizationId,
        platform: "buffer",
        handle: profileId,
        bufferId: profileId,
        displayName: "Buffer profile",
      },
      update: { bufferId: profileId, isActive: true },
    });
  }

  revalidatePath("/dashboard/onboarding");
  return { ok: true };
}

export async function onboardingSaveContentConfig(
  _: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const tone = String(formData.get("tone") ?? "profesional pero cercano").trim();
  const audience = String(formData.get("audience") ?? "Creadores y marcas en LATAM").trim();
  const topicsRaw = String(formData.get("topics") ?? "producto, cultura, lanzamientos");
  const platformsRaw = String(formData.get("platforms") ?? "instagram, linkedin");
  const autoPost = formData.has("autoPost");
  const requireApproval = formData.has("requireApproval");

  if (!organizationId) return { error: "Organización no válida." };
  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  const topics = topicsRaw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const platforms = platformsRaw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.contentConfig.updateMany({
    where: { organizationId, isDefault: true },
    data: { isDefault: false },
  });

  await prisma.contentConfig.create({
    data: {
      organizationId,
      name: "Default",
      isDefault: true,
      tone,
      targetAudience: audience,
      topics,
      platforms,
      contentTypes: ["POST"],
      postsPerDay: 1,
      autoPost,
      requireApproval,
    },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "content_config.created",
    resourceType: "ContentConfig",
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
