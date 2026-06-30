"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerEnv } from "@/config/env.server";
import { setActiveOrganizationCookie } from "@/lib/auth/active-org";
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

/**
 * Converts an unexpected server-action error into a friendly inline message so
 * the onboarding wizard can show the real reason instead of crashing into the
 * generic dashboard error boundary. The most common production cause is a
 * malformed `ENCRYPTION_MASTER_KEY` (must be 64 hex chars / 32 bytes).
 */
function toFriendlyError(e: unknown): OnboardingActionState {
  const msg = e instanceof Error ? e.message : String(e);
  if (/encryption_master_key|master key/i.test(msg)) {
    return {
      error:
        "La clave de cifrado ENCRYPTION_MASTER_KEY no es válida: debe tener 64 caracteres hexadecimales (32 bytes). Regenerala (node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\") y configurala en tu hosting, luego volvé a desplegar.",
    };
  }
  if (/no tienes permiso/i.test(msg)) {
    return { error: msg };
  }
  return { error: `No se pudo guardar. Detalle: ${msg}` };
}

/**
 * Returns a friendly error state when `ENCRYPTION_MASTER_KEY` is missing or not
 * exactly 64 hex chars, so steps that encrypt a secret fail gracefully with a
 * clear message instead of throwing into the error boundary.
 */
function encryptionKeyError(): OnboardingActionState | null {
  const k = process.env.ENCRYPTION_MASTER_KEY ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(k)) {
    return toFriendlyError(new Error("Invalid master key"));
  }
  return null;
}

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

  await setActiveOrganizationCookie(org.id);

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

  if (!["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER"].includes(provider)) {
    return { error: "Proveedor no válido." };
  }

  try {
    await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

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
  } catch (e) {
    return toFriendlyError(e);
  }

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
  const editframeKey = String(formData.get("editframeKey") ?? "").trim();
  if (!organizationId) return { error: "Organización no válida." };
  if (!token) return { error: "Pegá tu API key de Buffer para continuar." };

  const keyErr = encryptionKeyError();
  if (keyErr) return keyErr;

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  if (editframeKey) {
    const env = getServerEnv();
    const enc = encryptSecret(editframeKey, env.ENCRYPTION_MASTER_KEY);
    const fp = fingerprintSecret(editframeKey);

    await prisma.encryptedApiKey.upsert({
      where: {
        organizationId_provider: { organizationId, provider: "EDITFRAME" },
      },
      create: {
        organizationId,
        provider: "EDITFRAME",
        label: "Editframe",
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
      metadata: { provider: "EDITFRAME" },
    });
  }

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

  const existing = await prisma.contentConfig.findFirst({
    where: { organizationId, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    await prisma.contentConfig.update({
      where: { id: existing.id },
      data: {
        tone,
        targetAudience: audience,
        topics,
        platforms,
        autoPost,
        requireApproval,
      },
    });

    await writeAuditLog({
      organizationId,
      actorUserId: userId,
      action: "content_config.updated",
      resourceType: "ContentConfig",
      resourceId: existing.id,
    });
  } else {
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
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
