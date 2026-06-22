"use server";

import { revalidatePath } from "next/cache";

import { assertOrgRole } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";
import { inngest } from "@/lib/inngest/client";
import { computeNextScheduledAt } from "@/lib/publishing/schedule";
import { writeAuditLog } from "@/services/audit-log";

function parseSchedule(raw: string): string[] {
  return raw
    .split(/[,\n;\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d{1,2}:\d{2}$/.test(s));
}

export type AutomationActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

function toFriendlyAutomationError(e: unknown): AutomationActionState {
  const msg = e instanceof Error ? e.message : String(e);
  if (/no tienes permiso/i.test(msg)) return { error: msg };
  if (/database_url|datasource|environment variable/i.test(msg)) {
    return { error: "No se pudo guardar porque la base de datos no está bien configurada en el entorno." };
  }
  return { error: `No se pudo guardar la automatización. Detalle: ${msg}` };
}

export async function saveAutomationSettings(
  _: AutomationActionState,
  formData: FormData,
): Promise<AutomationActionState> {
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
      return { error: "Completa el onboarding para crear una configuración por defecto." };
    }

    const prompt = String(formData.get("prompt") ?? "").trim();
    const postingSchedule = parseSchedule(String(formData.get("schedule") ?? ""));
    const timezone = String(formData.get("timezone") ?? "").trim() || null;
    const imageSource = String(formData.get("imageSource") ?? "none").trim();
    const voiceName = String(formData.get("voiceName") ?? "").trim() || null;
    const voiceover = formData.has("voiceover");
    const autoPost = formData.has("autoPost");
    const requireApproval = formData.has("requireApproval");
    const isAutopilotActive = formData.has("isAutopilotActive");
    const slideCount = Math.max(2, Math.min(10, Number(formData.get("slideCount") ?? cfg.slideCount)));
    const aspectRatio = String(formData.get("aspectRatio") ?? cfg.aspectRatio).trim();

    if (isAutopilotActive && postingSchedule.length === 0) {
      return { error: "Ingresa al menos un horario válido (por ejemplo: 09:00, 18:30)." };
    }

    const nextRunAt = isAutopilotActive
      ? computeNextScheduledAt(postingSchedule, new Date())
      : null;

    await prisma.contentConfig.update({
      where: { id: cfg.id },
      data: {
        prompt: prompt || null,
        postingSchedule,
        timezone,
        imageSource,
        voiceName,
        voiceover,
        autoPost,
        requireApproval,
        isAutopilotActive,
        slideCount,
        aspectRatio,
        nextRunAt,
      },
    });

    await writeAuditLog({
      organizationId,
      actorUserId: userId,
      action: "automation.updated",
      resourceType: "ContentConfig",
      resourceId: cfg.id,
      metadata: { isAutopilotActive, schedule: postingSchedule.length },
    });

    revalidatePath("/dashboard/automation");
    return { ok: true, message: "Automatización guardada." };
  } catch (e) {
    return toFriendlyAutomationError(e);
  }
}

export async function runAutopilotNow(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  if (!organizationId) throw new Error("Sin organización");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  const cfg = await prisma.contentConfig.findFirst({
    where: { organizationId, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!cfg) throw new Error("Falta configuración por defecto (onboarding).");

  await inngest.send({
    name: "content/slideshow.requested",
    data: { organizationId, contentConfigId: cfg.id },
  });

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/automation");
}
