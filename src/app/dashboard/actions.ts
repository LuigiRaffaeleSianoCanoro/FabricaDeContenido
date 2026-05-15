"use server";

import { revalidatePath } from "next/cache";

import { getServerEnv } from "@/config/env.server";
import { assertOrgRole } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/require-session";
import { setActiveOrganizationCookie } from "@/lib/auth/active-org";
import { prisma } from "@/lib/db/prisma";
import { encryptSecret, fingerprintSecret } from "@/lib/encryption/cipher";
import { writeAuditLog } from "@/services/audit-log";
import type { ApiKeyProvider } from "@prisma/client";

import { inngest } from "@/lib/inngest/client";

export async function settingsAddApiKey(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const provider = String(formData.get("provider") ?? "") as ApiKeyProvider;
  const key = String(formData.get("apiKey") ?? "").trim();
  if (!organizationId || !key) throw new Error("Datos incompletos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  const allowed: ApiKeyProvider[] = ["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER", "BUFFER", "CUSTOM"];
  if (!allowed.includes(provider)) throw new Error("Proveedor no válido");

  const env = getServerEnv();
  const enc = encryptSecret(key, env.ENCRYPTION_MASTER_KEY);
  const fp = fingerprintSecret(key);

  await prisma.encryptedApiKey.upsert({
    where: { organizationId_provider: { organizationId, provider } },
    create: {
      organizationId,
      provider,
      label: `${provider}`,
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

  revalidatePath("/dashboard/settings");
}

export async function settingsRevokeApiKey(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const keyId = String(formData.get("keyId") ?? "");
  if (!organizationId || !keyId) throw new Error("Datos incompletos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  const row = await prisma.encryptedApiKey.findFirst({
    where: { id: keyId, organizationId },
  });
  if (!row) throw new Error("Clave no encontrada");

  await prisma.encryptedApiKey.update({
    where: { id: keyId },
    data: { isActive: false, revokedAt: new Date() },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "api_key.revoked",
    resourceType: "EncryptedApiKey",
    resourceId: keyId,
  });

  revalidatePath("/dashboard/settings");
}

export async function requestPipelineRun(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const includeVideo = String(formData.get("includeVideo") ?? "") === "on";
  if (!organizationId) throw new Error("Sin organización");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  await inngest.send({
    name: "content/pipeline.requested",
    data: { organizationId, includeVideo },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "pipeline.requested",
    resourceType: "Organization",
    resourceId: organizationId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/jobs");
}

export async function approveGeneratedContent(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const id = String(formData.get("contentId") ?? "");
  const scheduleBuffer = String(formData.get("scheduleBuffer") ?? "") === "on";
  if (!organizationId || !id) throw new Error("Datos incompletos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  const existing = await prisma.generatedContent.findFirst({
    where: { id, organizationId },
  });
  if (!existing) throw new Error("Contenido no encontrado");

  if (existing.status === "APPROVED" && scheduleBuffer) {
    await inngest.send({
      name: "content/publish.requested",
      data: { organizationId, generatedContentId: id },
    });
    revalidatePath("/dashboard/content");
    return;
  }

  await prisma.generatedContent.update({
    where: { id, organizationId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: userId,
    },
  });

  if (scheduleBuffer) {
    await inngest.send({
      name: "content/publish.requested",
      data: { organizationId, generatedContentId: id },
    });
  }

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "content.approved",
    resourceType: "GeneratedContent",
    resourceId: id,
  });

  revalidatePath("/dashboard/content");
}

export async function rejectGeneratedContent(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const id = String(formData.get("contentId") ?? "");
  if (!organizationId || !id) throw new Error("Datos incompletos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  await prisma.generatedContent.update({
    where: { id, organizationId },
    data: { status: "DRAFT", approvedAt: null, approvedBy: null },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "content.rejected",
    resourceType: "GeneratedContent",
    resourceId: id,
  });

  revalidatePath("/dashboard/content");
}

export async function setActiveOrganization(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  if (!organizationId) throw new Error("Organización no válida");

  const m = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!m) throw new Error("No perteneces a esta organización");

  await setActiveOrganizationCookie(organizationId);
  revalidatePath("/dashboard");
}

export async function inviteMemberAction(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "MEMBER") as "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

  if (!organizationId || !email) throw new Error("Email requerido");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  const target = await prisma.userProfile.findUnique({ where: { email } });
  if (!target) {
    throw new Error("Usuario no registrado aún (debe existir UserProfile / Clerk sync).");
  }

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: { organizationId, userId: target.id },
    },
    create: { organizationId, userId: target.id, role },
    update: { role },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "member.invited",
    resourceType: "OrganizationMember",
    resourceId: target.id,
    metadata: { email, role },
  });

  revalidatePath("/dashboard/settings");
}

export async function markJobDeadLetter(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId || !organizationId) throw new Error("Datos incompletos");
  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  await prisma.contentJob.update({
    where: { id: jobId, organizationId },
    data: { status: "DEAD_LETTER" },
  });
  revalidatePath("/dashboard/jobs");
}

export async function retryJobAction(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId || !organizationId) throw new Error("Datos incompletos");
  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  await prisma.contentJob.update({
    where: { id: jobId, organizationId },
    data: {
      status: "PENDING",
      errorMessage: null,
      failedAt: null,
      retryCount: { increment: 1 },
    },
  });
  revalidatePath("/dashboard/jobs");
}

export async function adminRetryWebhookEvent(formData: FormData) {
  const { userId, user } = await requireSession();
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const { isPlatformAdminEmail } = await import("@/lib/auth/admin");
  if (!isPlatformAdminEmail(email)) throw new Error("No autorizado");

  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) throw new Error("Evento no válido");

  const ev = await prisma.webhookEvent.findUnique({
    where: { id: eventId },
    include: { endpoint: true },
  });
  if (!ev) throw new Error("Evento no encontrado");

  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: { status: "PENDING", attempts: 0, lastError: null },
  });

  await writeAuditLog({
    organizationId: ev.endpoint.organizationId,
    actorUserId: userId,
    action: "admin.webhook_retry",
    resourceType: "WebhookEvent",
    resourceId: eventId,
  });

  revalidatePath("/dashboard/admin");
}
