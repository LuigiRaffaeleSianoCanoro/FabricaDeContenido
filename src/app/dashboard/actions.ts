"use server";

import { revalidatePath } from "next/cache";

import { getServerEnv } from "@/config/env.server";
import { assertOrgRole } from "@/lib/auth/rbac";
import { setActiveOrganizationCookie } from "@/lib/auth/active-org";
import { requireSession } from "@/lib/auth/require-session";
import { isPlatformAdminEmail } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { encryptSecret, fingerprintSecret } from "@/lib/encryption/cipher";
import { sendInngestEvent, isInngestUnavailableError } from "@/lib/inngest/send";
import { syncBufferChannels } from "@/lib/publishing/sync";
import { validateBufferApiKey } from "@/lib/publishing/validate-buffer-key";
import { writeAuditLog } from "@/services/audit-log";
import type { ApiKeyProvider, MemberRole, ContentStatus } from "@prisma/client";

export type SyncBufferActionState = {
  ok?: boolean;
  error?: string;
  synced?: number;
};

export type PipelineRunActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

function toFriendlyPipelineError(e: unknown): PipelineRunActionState {
  if (isInngestUnavailableError(e)) return { error: e.message };
  const msg = e instanceof Error ? e.message : String(e);
  if (/no tienes permiso/i.test(msg)) return { error: msg };
  if (/falta contentconfig|contentconfig/i.test(msg)) {
    return { error: "Completa el onboarding para crear una configuración de contenido." };
  }
  if (/inngest|event key|couldn't find an event key/i.test(msg)) {
    return {
      error:
        "La cola de trabajos (Inngest) no está configurada. Añade INNGEST_EVENT_KEY en Vercel o ejecuta la app con el servidor de desarrollo de Inngest en local.",
    };
  }
  if (/database_url|datasource|environment variable|prisma/i.test(msg)) {
    return {
      error:
        "No se pudo conectar con la base de datos. Verifica DATABASE_URL y ejecuta npm run db:push.",
    };
  }
  return { error: `No se pudo iniciar la generación. Detalle: ${msg}` };
}

function toFriendlySyncBufferError(e: unknown): SyncBufferActionState {
  const msg = e instanceof Error ? e.message : String(e);
  if (/no tienes permiso|no hay una api key de buffer/i.test(msg)) return { error: msg };
  if (/buffer api 401|unauthorized|forbidden|buffer graphql error/i.test(msg)) {
    return { error: "La API key de Buffer parece inválida o vencida. Revísala y vuelve a sincronizar." };
  }
  if (/database_url|datasource|environment variable/i.test(msg)) {
    return { error: "No se pudo sincronizar porque la base de datos no está bien configurada en el entorno." };
  }
  return { error: `No se pudo sincronizar Buffer. Detalle: ${msg}` };
}

export async function syncBufferChannelsAction(
  _: SyncBufferActionState,
  formData: FormData,
): Promise<SyncBufferActionState> {
  try {
    const { userId } = await requireSession();
    const organizationId = String(formData.get("organizationId") ?? "").trim();
    if (!organizationId) return { error: "Sin organización." };

    await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

    const result = await syncBufferChannels(organizationId);

    await writeAuditLog({
      organizationId,
      actorUserId: userId,
      action: "buffer.channels_synced",
      resourceType: "SocialAccount",
      metadata: { synced: result.synced },
    });

    revalidatePath("/dashboard/settings");
    return { ok: true, synced: result.synced };
  } catch (e) {
    return toFriendlySyncBufferError(e);
  }
}

export async function setActiveOrganization(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  if (!organizationId) throw new Error("Organización inválida");

  const m = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!m) throw new Error("No perteneces a esa organización");

  await setActiveOrganizationCookie(organizationId);
  revalidatePath("/dashboard");
}

export async function settingsAddApiKey(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const provider = String(formData.get("provider") ?? "OPENAI") as ApiKeyProvider;
  const key = String(formData.get("apiKey") ?? "").trim();
  if (!organizationId || !key) throw new Error("Faltan datos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);
  if (!["OPENAI", "ANTHROPIC", "GEMINI", "OPENROUTER", "BUFFER", "EDITFRAME"].includes(provider)) {
    throw new Error("Proveedor no soportado");
  }

  if (provider === "BUFFER") {
    const validation = await validateBufferApiKey(key);
    if (!validation.ok) throw new Error(validation.message);
  }

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
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  if (!organizationId || !id) throw new Error("Datos inválidos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  await prisma.encryptedApiKey.updateMany({
    where: { id, organizationId },
    data: { isActive: false, revokedAt: new Date() },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: "api_key.revoked",
    resourceType: "EncryptedApiKey",
    resourceId: id,
  });

  revalidatePath("/dashboard/settings");
}

export async function requestPipelineRun(
  _: PipelineRunActionState,
  formData: FormData,
): Promise<PipelineRunActionState> {
  try {
    const { userId } = await requireSession();
    const organizationId = String(formData.get("organizationId") ?? "").trim();
    if (!organizationId) return { error: "Sin organización." };

    await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

    const cfg = await prisma.contentConfig.findFirst({
      where: { organizationId, isDefault: true },
      orderBy: { updatedAt: "desc" },
    });
    if (!cfg) {
      return { error: "Completa el onboarding para crear una configuración de contenido." };
    }

    await sendInngestEvent({
      name: "content/pipeline.requested",
      data: { organizationId, contentConfigId: cfg.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/content");
    return {
      ok: true,
      message: "Generación iniciada. Revisa Trabajos o Contenido en unos segundos.",
    };
  } catch (e) {
    return toFriendlyPipelineError(e);
  }
}

export async function approveGeneratedContent(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  if (!organizationId || !id) throw new Error("Datos inválidos");

  const gc = await prisma.generatedContent.findFirst({
    where: { id, organizationId },
  });
  if (!gc) throw new Error("Contenido no encontrado");
  if (gc.status !== "PENDING_APPROVAL") {
    throw new Error("Solo se puede aprobar contenido pendiente de revisión.");
  }

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  const cfg = await prisma.contentConfig.findFirst({
    where: { organizationId, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });

  const approved: ContentStatus = "APPROVED";
  await prisma.generatedContent.update({
    where: { id, organizationId },
    data: { status: approved, approvedAt: new Date(), approvedBy: userId },
  });

  if (cfg?.autoPost && !cfg.requireApproval) {
    await sendInngestEvent({
      name: "content/publish.requested",
      data: { organizationId, generatedContentId: id },
    });
  }

  revalidatePath("/dashboard/content");
}

export async function publishGeneratedContent(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const publishNow = formData.get("publishNow") === "true";
  if (!organizationId || !id) throw new Error("Datos inválidos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  const gc = await prisma.generatedContent.findFirst({
    where: { id, organizationId },
    select: { id: true, status: true },
  });
  if (!gc) throw new Error("Contenido no encontrado");
  if (gc.status === "SCHEDULED" || gc.status === "PUBLISHED") {
    throw new Error("Este contenido ya fue publicado o agendado.");
  }
  if (gc.status !== "APPROVED") {
    throw new Error("Solo se puede publicar contenido aprobado.");
  }

  const channels = await prisma.socialAccount.count({
    where: { organizationId, platform: "buffer", isActive: true },
  });
  if (channels === 0) {
    throw new Error(
      "No hay canales de Buffer sincronizados. Conectá Buffer y sincronizá tus canales en Ajustes.",
    );
  }

  await sendInngestEvent({
    name: "content/publish.requested",
    data: { organizationId, generatedContentId: id, publishNow },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: userId,
    action: publishNow ? "content.publish_now" : "content.schedule",
    resourceType: "GeneratedContent",
    resourceId: id,
  });

  revalidatePath("/dashboard/content");
}

export async function rejectGeneratedContent(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  if (!organizationId || !id) throw new Error("Datos inválidos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  await prisma.generatedContent.updateMany({
    where: { id, organizationId },
    data: { status: "DRAFT", approvedAt: null, approvedBy: null },
  });

  revalidatePath("/dashboard/content");
}

const inviteRoles: MemberRole[] = ["VIEWER", "MEMBER", "ADMIN"];

export async function inviteMemberAction(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "MEMBER") as MemberRole;

  if (!organizationId || !email.includes("@")) throw new Error("Email inválido");
  if (!inviteRoles.includes(role)) throw new Error("Rol inválido");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  const target = await prisma.userProfile.findUnique({ where: { email } });
  if (!target) {
    throw new Error("El usuario debe existir en la app (Perfil) antes de invitarlo.");
  }

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: { organizationId, userId: target.id },
    },
    create: { organizationId, userId: target.id, role },
    update: { role },
  });

  revalidatePath("/dashboard/settings");
}

export async function markJobDeadLetter(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim();
  if (!organizationId || !jobId) throw new Error("Datos inválidos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  await prisma.contentJob.updateMany({
    where: { id: jobId, organizationId },
    data: { status: "DEAD_LETTER", errorMessage: "Marked dead-letter by operator", failedAt: new Date() },
  });

  revalidatePath("/dashboard/jobs");
}

export async function retryJobAction(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  if (!organizationId) throw new Error("Sin organización");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

  const cfg = await prisma.contentConfig.findFirst({
    where: { organizationId, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!cfg) throw new Error("Falta ContentConfig");

  await sendInngestEvent({
    name: "content/pipeline.requested",
    data: { organizationId, contentConfigId: cfg.id },
  });

  revalidatePath("/dashboard/jobs");
}

export async function adminRetryWebhookEvent(formData: FormData) {
  const { user } = await requireSession();
  const email = user.emailAddresses[0]?.emailAddress;
  if (!isPlatformAdminEmail(email)) throw new Error("No autorizado");

  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!eventId) throw new Error("eventId requerido");

  await prisma.webhookEvent.updateMany({
    where: { id: eventId, status: "FAILED" },
    data: { attempts: 0, status: "PENDING", lastError: null },
  });

  revalidatePath("/dashboard/admin");
}
