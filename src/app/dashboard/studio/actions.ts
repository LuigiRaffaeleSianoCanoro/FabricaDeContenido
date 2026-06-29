"use server";

import { revalidatePath } from "next/cache";

import { userMessageForAiError } from "@/lib/ai/errors";
import { assertOrgRole } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/require-session";
import { sendInngestEvent } from "@/lib/inngest/send";
import { getActiveAiProviderForOrg, getFirstActiveAiKeyForOrg, touchApiKeyUsed } from "@/services/api-keys";
import { getSkill } from "@/skills/registry";
import { SlideshowPlanSchema, type SlideshowPlan } from "@/skills/slideshow-planner/skill";

export type StudioPlanState = {
  error?: string;
  ok?: boolean;
  plan?: SlideshowPlan;
  prompt?: string;
  platform?: string;
  slideCount?: number;
  aspectRatio?: string;
  imageSource?: string;
  voiceover?: boolean;
  voiceName?: string;
};

export async function generateSlideshowPlan(
  _: StudioPlanState,
  formData: FormData,
): Promise<StudioPlanState> {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const platform = String(formData.get("platform") ?? "instagram").trim();
  const slideCount = Number(formData.get("slideCount") ?? 5);
  const aspectRatio = String(formData.get("aspectRatio") ?? "9:16").trim();
  const imageSource = String(formData.get("imageSource") ?? "none").trim();
  const voiceover = formData.has("voiceover");
  const voiceName = String(formData.get("voiceName") ?? "").trim();

  const passthrough = { prompt, platform, slideCount, aspectRatio, imageSource, voiceover, voiceName };

  if (!organizationId) return { error: "Organización no válida." };
  if (prompt.length < 3) return { error: "Escribe un prompt más descriptivo.", ...passthrough };

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  const keyInfo = await getFirstActiveAiKeyForOrg(organizationId);
  if (!keyInfo) {
    return { error: "No hay una API key de IA activa. Añádela en Ajustes.", ...passthrough };
  }

  const skill = getSkill("slideshow-planner");
  if (!skill) return { error: "Skill slideshow-planner no registrado.", ...passthrough };

  try {
    const ai = await getActiveAiProviderForOrg(organizationId, keyInfo.provider);
    await touchApiKeyUsed(keyInfo.row.id);
    const planUnknown = await skill.execute(
      { prompt, platform, slideCount },
      { organizationId, jobId: "preview", ai, log: async () => {} },
    );
    const plan = SlideshowPlanSchema.parse(planUnknown);
    return { ok: true, plan, ...passthrough };
  } catch (err) {
    console.error("[studio] generateSlideshowPlan failed", err);
    return {
      error: userMessageForAiError(err, "No se pudo generar el guion. Inténtalo de nuevo."),
      ...passthrough,
    };
  }
}

export async function requestSlideshowRender(formData: FormData) {
  const { userId } = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const platform = String(formData.get("platform") ?? "instagram").trim();
  const slideCount = Number(formData.get("slideCount") ?? 5);
  const aspectRatio = String(formData.get("aspectRatio") ?? "9:16").trim();
  const imageSource = String(formData.get("imageSource") ?? "none").trim();
  const voiceover = formData.get("voiceover") === "true";
  const voiceName = String(formData.get("voiceName") ?? "").trim() || undefined;

  if (!organizationId || prompt.length < 3) throw new Error("Datos inválidos");

  await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  await sendInngestEvent({
    name: "content/slideshow.requested",
    data: { organizationId, prompt, platform, slideCount, aspectRatio, imageSource, voiceover, voiceName },
  });

  revalidatePath("/dashboard/studio");
  revalidatePath("/dashboard/jobs");
}
