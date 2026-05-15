import { getServerEnv } from "@/config/env.server";
import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db/prisma";
import { createBufferProvider } from "@/lib/publishing/providers/buffer";
import { dispatchVideoRenderWorkflow, isGitHubRenderConfigured } from "@/lib/video/github-actions";
import {
  getActiveAiProviderForOrg,
  getBufferAccessTokenForOrg,
  getFirstActiveAiKeyForOrg,
  touchApiKeyUsed,
} from "@/services/api-keys";
import { getSkill } from "@/skills/registry";

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
    const data = event.data as {
      organizationId: string;
      contentConfigId?: string;
    };
    const { organizationId } = data;

    const cfg = await step.run("load-config", async () => {
      if (data.contentConfigId) {
        const c = await prisma.contentConfig.findFirst({
          where: { id: data.contentConfigId, organizationId },
        });
        if (c) return c;
      }
      return prisma.contentConfig.findFirst({
        where: { organizationId, isDefault: true },
        orderBy: { updatedAt: "desc" },
      });
    });

    if (!cfg) {
      throw new Error("ContentConfig not found for organization");
    }

    const job = await step.run("create-job", () =>
      prisma.contentJob.create({
        data: {
          organizationId,
          configId: cfg.id,
          status: "RUNNING",
          type: "CONTENT_GENERATION",
          startedAt: new Date(),
          input: { contentConfigId: cfg.id },
        },
      }),
    );

    try {
      const keyInfo = await step.run("resolve-ai-key", () => getFirstActiveAiKeyForOrg(organizationId));
      if (!keyInfo) {
        throw new Error("No active AI API key configured for this organization");
      }

      const skill = getSkill("hook-generator");
      if (!skill) {
        throw new Error("hook-generator skill not registered");
      }

      const topic = cfg.topics[0] ?? cfg.tone ?? "tu producto";
      const platform = cfg.platforms[0] ?? "instagram";

      const outputUnknown = await step.run("run-hook-generator", async () => {
        const ai = await getActiveAiProviderForOrg(organizationId, keyInfo.provider);
        await touchApiKeyUsed(keyInfo.row.id);
        const out = await skill.execute(
          { topic, platform, count: Math.min(5, cfg.postsPerDay || 3) },
          {
            organizationId,
            jobId: job.id,
            ai,
            log: async () => {},
          },
        );
        return out as { hooks: string[] };
      });

      const hooks = outputUnknown.hooks ?? [];

      await step.run("record-skill-execution", () =>
        prisma.skillExecution.create({
          data: {
            jobId: job.id,
            skillId: "hook-generator",
            input: { topic, platform },
            output: { hooks },
            completedAt: new Date(),
          },
        }),
      );

      const firstGcId = await step.run("persist-generated-content", async () => {
        let firstId: string | null = null;
        for (const hook of hooks) {
          const status = cfg.requireApproval ? "PENDING_APPROVAL" : "APPROVED";
          const row = await prisma.generatedContent.create({
            data: {
              jobId: job.id,
              organizationId,
              type: "POST",
              platform,
              body: hook,
              hashtags: [],
              status,
            },
          });
          if (!firstId) firstId = row.id;
        }
        return firstId;
      });

      await step.run("maybe-dispatch-video", async () => {
        if (!isGitHubRenderConfigured() || !firstGcId) return { skipped: true as const };
        const vr = await prisma.videoRender.create({
          data: {
            jobId: job.id,
            organizationId,
            status: "QUEUED",
            compositionId: "Main",
            aspectRatio: "9:16",
            props: { text: hooks[0] ?? "" },
          },
        });
        await prisma.generatedContent.update({
          where: { id: firstGcId },
          data: { videoRenderId: vr.id },
        });
        const env = getServerEnv();
        const webhookUrl = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/webhooks/video-complete`;
        await dispatchVideoRenderWorkflow({
          jobId: job.id,
          compositionId: "Main",
          props: { text: hooks[0] ?? "" },
          webhookUrl,
        });
        return { dispatched: true as const };
      });

      await step.run("finalize-job", () =>
        prisma.contentJob.update({
          where: { id: job.id },
          data: {
            status: "SUCCEEDED",
            completedAt: new Date(),
            progress: 1,
            output: { hooksCreated: hooks.length },
          },
        }),
      );

      if (cfg.autoPost && !cfg.requireApproval && hooks.length > 0) {
        await step.run("enqueue-auto-publish", async () => {
          const pending = await prisma.generatedContent.findMany({
            where: { jobId: job.id, organizationId, status: "APPROVED" },
          });
          for (const row of pending) {
            await inngest.send({
              name: "content/publish.requested",
              data: { organizationId, generatedContentId: row.id },
            });
          }
        });
      }

      return { ok: true, organizationId, jobId: job.id, hooks: hooks.length };
    } catch (err) {
      await step.run("mark-job-failed", () =>
        prisma.contentJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            errorMessage: err instanceof Error ? err.message : String(err),
          },
        }),
      );
      throw err;
    }
  },
);

export const publishToBuffer = inngest.createFunction(
  {
    id: "fabrica-publish-buffer",
    name: "Publish to Buffer",
    triggers: [{ event: "content/publish.requested" }],
  },
  async ({ event, step }) => {
    const { organizationId, generatedContentId } = event.data as {
      organizationId: string;
      generatedContentId: string;
    };

    const gc = await step.run("load-content", () =>
      prisma.generatedContent.findFirst({
        where: { id: generatedContentId, organizationId },
      }),
    );
    if (!gc) {
      throw new Error("GeneratedContent not found");
    }

    const tokenRow = await step.run("resolve-buffer-token", () => getBufferAccessTokenForOrg(organizationId));
    if (!tokenRow) {
      throw new Error("No Buffer token configured");
    }

    const profiles = await step.run("buffer-profiles", () =>
      prisma.socialAccount.findMany({
        where: { organizationId, platform: "buffer", isActive: true },
      }),
    );
    const profileIds = profiles.map((p) => p.bufferId).filter((id): id is string => Boolean(id && id.length));
    if (profileIds.length === 0) {
      throw new Error("No Buffer profile IDs on SocialAccount rows");
    }

    const provider = createBufferProvider();
    const mediaUrls = [...gc.mediaUrls, ...(gc.videoUrl ? [gc.videoUrl] : [])].filter(Boolean);

    const result = await step.run("buffer-publish", async () => {
      await touchApiKeyUsed(tokenRow.keyId);
      return provider.schedulePost(
        {
          text: gc.body,
          profileIds,
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          mediaUrls,
        },
        tokenRow.token,
      );
    });

    await step.run("record-scheduled-post", () =>
      prisma.scheduledPost.create({
        data: {
          generatedContentId: gc.id,
          organizationId,
          bufferProfileId: profileIds[0],
          bufferUpdateId: result.id,
          scheduledFor: new Date(Date.now() + 60 * 60 * 1000),
          status: "SCHEDULED",
        },
      }),
    );

    await step.run("update-content-status", () =>
      prisma.generatedContent.update({
        where: { id: gc.id },
        data: { status: "SCHEDULED" },
      }),
    );

    return { ok: true, bufferUpdateId: result.id };
  },
);

export const inngestFunctions = [healthCheck, contentPipelineV1, publishToBuffer];
