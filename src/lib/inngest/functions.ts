import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import {
  dispatchVideoRenderWorkflow,
  isGitHubRenderConfigured,
} from "@/lib/video/github-actions";
import { executeSkill } from "@/skills/executor";
import {
  getActiveAiProviderForOrg,
  getFirstActiveAiKeyForOrg,
  getBufferAccessTokenForOrg,
  touchApiKeyUsed,
} from "@/services/api-keys";
import { writeAuditLog } from "@/services/audit-log";
import { createBufferProvider } from "@/lib/publishing/providers/buffer";

export type PipelineEventData = {
  organizationId: string;
  topic?: string;
  platform?: string;
  includeVideo?: boolean;
};

export type PublishEventData = {
  organizationId: string;
  generatedContentId: string;
};

/**
 * Placeholder durable function — replace with real orchestration (content → TTS → video → Buffer).
 */
export const healthCheck = inngest.createFunction(
  {
    id: "fabrica-health-ping",
    name: "Health ping",
    triggers: [{ event: "app/health.ping" }],
  },
  async ({ step }) => {
    const ok = await step.run("check", () => ({ status: "ok" as const }));
    return ok;
  },
);

export const contentPipelineV1 = inngest.createFunction(
  {
    id: "fabrica-content-pipeline-v1",
    name: "Content pipeline v1",
    triggers: [{ event: "content/pipeline.requested" }],
  },
  async ({ event, step }) => {
    const data = event.data as PipelineEventData;
    const organizationId = data.organizationId;
    if (!organizationId) {
      throw new Error("organizationId required");
    }

    const jobId = await step.run("create-job", async () => {
      const job = await prisma.contentJob.create({
        data: {
          organizationId,
          type: "CONTENT_GENERATION",
          status: "RUNNING",
          startedAt: new Date(),
          input: {
            topic: data.topic,
            platform: data.platform,
            includeVideo: data.includeVideo,
          },
        },
      });
      return job.id;
    });

    await step.run("run-pipeline", async () => {
      try {
        const firstKey = await getFirstActiveAiKeyForOrg(organizationId);
        if (!firstKey) {
          throw new Error("No hay clave de IA activa. Completa onboarding o Ajustes.");
        }

        const ai = await getActiveAiProviderForOrg(organizationId, firstKey.provider);
        await touchApiKeyUsed(firstKey.row.id);

        const config = await prisma.contentConfig.findFirst({
          where: { organizationId, isDefault: true },
        });
        if (!config) {
          throw new Error("No hay ContentConfig. Completa onboarding.");
        }

        const topic = data.topic ?? config.topics[0] ?? "tu marca";
        const platform = (data.platform ?? config.platforms[0] ?? "instagram").toLowerCase();

        const hooksResult = (await executeSkill(
          "hook-generator",
          { topic, platform, count: 3 },
          {
            organizationId,
            jobId,
            ai,
            log: async () => {},
          },
        )) as { hooks: string[] };

        const hooks = hooksResult.hooks ?? [];
        const status = config.requireApproval ? "PENDING_APPROVAL" : "DRAFT";

        for (const body of hooks) {
          await prisma.generatedContent.create({
            data: {
              jobId,
              organizationId,
              type: "POST",
              platform,
              body,
              status,
            },
          });
        }

        if (data.includeVideo && isGitHubRenderConfigured()) {
          const vr = await prisma.videoRender.create({
            data: {
              jobId,
              organizationId,
              compositionId: "main-composition",
              aspectRatio: "9:16",
              status: "QUEUED",
            },
          });
          const first = await prisma.generatedContent.findFirst({
            where: { jobId },
            orderBy: { createdAt: "asc" },
          });
          if (first) {
            await prisma.generatedContent.update({
              where: { id: first.id },
              data: { videoRenderId: vr.id },
            });
          }
          const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
          await dispatchVideoRenderWorkflow({
            jobId,
            compositionId: "main-composition",
            props: { heading: topic, platform },
            webhookUrl: `${base.replace(/\/$/, "")}/api/webhooks/video-complete`,
          });
        }

        if (!config.requireApproval && config.autoPost) {
          const buf = await getBufferAccessTokenForOrg(organizationId);
          if (buf) {
            const created = await prisma.generatedContent.findMany({ where: { jobId } });
            for (const c of created) {
              await inngest.send({
                name: "content/publish.requested",
                data: { organizationId, generatedContentId: c.id },
              });
            }
          }
        }

        await prisma.contentJob.update({
          where: { id: jobId },
          data: {
            status: "SUCCEEDED",
            completedAt: new Date(),
            output: { hooksGenerated: hooks.length },
          },
        });

        await writeAuditLog({
          organizationId,
          action: "pipeline.succeeded",
          resourceType: "ContentJob",
          resourceId: jobId,
          metadata: { hooks: hooks.length },
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Pipeline failed";
        await prisma.contentJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            errorMessage: msg,
          },
        });
        throw err;
      }
    });

    return { ok: true };
  },
);

export const publishToBuffer = inngest.createFunction(
  {
    id: "fabrica-publish-buffer",
    name: "Publish to Buffer",
    triggers: [{ event: "content/publish.requested" }],
  },
  async ({ event, step }) => {
    const { organizationId, generatedContentId } = event.data as PublishEventData;
    if (!organizationId || !generatedContentId) {
      throw new Error("organizationId and generatedContentId required");
    }

    await step.run("buffer-schedule", async () => {
      const buf = await getBufferAccessTokenForOrg(organizationId);
      if (!buf) {
        throw new Error("Buffer no configurado");
      }

      const content = await prisma.generatedContent.findUnique({
        where: { id: generatedContentId },
      });
      if (!content) {
        throw new Error("Contenido no encontrado");
      }

      const profiles = await prisma.socialAccount.findMany({
        where: {
          organizationId,
          isActive: true,
          bufferId: { not: null },
        },
      });
      const profileIds = profiles.map((p) => p.bufferId!).filter(Boolean);
      if (profileIds.length === 0) {
        throw new Error("No hay Buffer profile IDs (SocialAccount.bufferId)");
      }

      const publisher = createBufferProvider();
      const scheduledFor = new Date(Date.now() + 60 * 60 * 1000);
      const update = await publisher.schedulePost(
        {
          text: [content.title, content.body, ...(content.hashtags ?? [])].filter(Boolean).join("\n\n"),
          profileIds,
          scheduledAt: scheduledFor,
          mediaUrls: content.mediaUrls?.length ? content.mediaUrls : content.videoUrl ? [content.videoUrl] : undefined,
        },
        buf.token,
      );

      await touchApiKeyUsed(buf.keyId);

      await prisma.scheduledPost.create({
        data: {
          generatedContentId,
          organizationId,
          bufferUpdateId: update.id,
          scheduledFor,
          status: "SCHEDULED",
        },
      });

      await prisma.generatedContent.update({
        where: { id: generatedContentId },
        data: { status: "SCHEDULED" },
      });

      await writeAuditLog({
        organizationId,
        action: "buffer.scheduled",
        resourceType: "GeneratedContent",
        resourceId: generatedContentId,
        metadata: { bufferUpdateId: update.id },
      });
    });

    return { ok: true };
  },
);

export const inngestFunctions = [healthCheck, contentPipelineV1, publishToBuffer];
