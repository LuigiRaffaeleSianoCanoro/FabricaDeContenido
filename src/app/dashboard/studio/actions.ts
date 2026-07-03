"use server";

import { revalidatePath } from "next/cache";

import { userMessageForAiError } from "@/lib/ai/errors";
import { revalidateDashboardHome } from "@/lib/dashboard/revalidate";
import { assertOrgRole } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/require-session";
import { sendInngestEvent } from "@/lib/inngest/send";
import { AiUnavailableError, resolveAiForOrg } from "@/services/ai-resolver";
import { checkTextQuota, checkVideoQuota, recordGenerationUsage } from "@/services/usage";
import { buildSlideshowHtml } from "@/lib/video/editframe-composition";
import { buildSlideshowRenderGuide } from "@/lib/video/render-guide";
import { getSkill } from "@/skills/registry";
import { SlideshowPlanSchema, type SlideshowPlan } from "@/skills/slideshow-planner/skill";

export type StudioPlanState = {
  error?: string;
  ok?: boolean;
  plan?: SlideshowPlan;
  renderGuide?: string;
  compositionHtml?: string;
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

  const quota = await checkTextQuota(organizationId);
  if (!quota.allowed) {
    return { error: quota.reason, ...passthrough };
  }

  const skill = getSkill("slideshow-planner");
  if (!skill) return { error: "Skill slideshow-planner no registrado.", ...passthrough };

  try {
    const resolved = await resolveAiForOrg(organizationId, "text");
    const planUnknown = await skill.execute(
      { prompt, platform, slideCount },
      { organizationId, jobId: "preview", ai: resolved.ai, log: async () => {} },
    );
    const plan = SlideshowPlanSchema.parse(planUnknown);
    await recordGenerationUsage({
      organizationId,
      action: "text",
      source: resolved.source,
      metadata: { surface: "studio_preview" },
    });
    const composition = buildSlideshowHtml(plan, { aspectRatio });
    const renderGuide = buildSlideshowRenderGuide(composition, { title: plan.title });
    return {
      ok: true,
      plan,
      renderGuide,
      compositionHtml: composition.html,
      ...passthrough,
    };
  } catch (err) {
    if (err instanceof AiUnavailableError) {
      return { error: err.message, ...passthrough };
    }
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

  const quota = await checkVideoQuota(organizationId);
  if (!quota.allowed) {
    throw new Error(quota.reason);
  }

  await sendInngestEvent({
    name: "content/slideshow.requested",
    data: { organizationId, prompt, platform, slideCount, aspectRatio, imageSource, voiceover, voiceName },
  });

  revalidatePath("/dashboard/studio");
  revalidatePath("/dashboard/jobs");
  revalidateDashboardHome();
}
