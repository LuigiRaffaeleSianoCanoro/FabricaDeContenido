import { getServerEnv } from "@/config/env.server";
import { revalidateDashboardHome } from "@/lib/dashboard/revalidate";
import { inngest } from "@/lib/inngest/client";
import { buildAutopilotIdempotencyKey } from "@/lib/inngest/idempotency";
import { sendInngestEvent } from "@/lib/inngest/send";
import { prisma } from "@/lib/db/prisma";
import { createBufferProvider } from "@/lib/publishing/providers/buffer";
import { reconcilePendingBufferPosts } from "@/lib/publishing/reconcile-buffer";
import { computeNextScheduledAt, resolveAutopilotSlotStart } from "@/lib/publishing/schedule";
import type { BufferAsset } from "@/lib/publishing/types";
import { dispatchVideoRenderWorkflow, isGitHubRenderConfigured } from "@/lib/video/github-actions";
import { buildSlideshowHtml, resolveDimensions } from "@/lib/video/editframe-composition";
import { isHyperframesRenderConfigured, renderSlideshowWithHyperframes } from "@/lib/video/hyperframes";
import { buildSlideshowRenderGuide } from "@/lib/video/render-guide";
import { generateImageWithOpenAI, searchPexelsImageUrl } from "@/lib/media/images";
import { synthesizeVoice, DEFAULT_VOICE } from "@/lib/tts/synthesize";
import { isR2Configured, uploadPublicAsset } from "@/lib/storage/r2";
import { getBufferAccessTokenForOrg, getRawApiKeyForOrg, touchApiKeyUsed } from "@/services/api-keys";
import { resolveAiForOrg } from "@/services/ai-resolver";
import {
  USAGE_METRICS,
  checkTextQuota,
  checkVideoQuota,
  recordGenerationUsage,
  recordUsage,
} from "@/services/usage";
import { getSkill } from "@/skills/registry";
import { SlideshowPlanSchema } from "@/skills/slideshow-planner/skill";

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
      const quota = await step.run("check-text-quota", () => checkTextQuota(organizationId));
      if (!quota.allowed) {
        throw new Error(quota.reason ?? "Límite mensual del plan alcanzado.");
      }

      const skill = getSkill("hook-generator");
      if (!skill) {
        throw new Error("hook-generator skill not registered");
      }

      const topic = cfg.topics[0] ?? cfg.tone ?? "tu producto";
      const platform = cfg.platforms[0] ?? "instagram";

      const generation = await step.run("run-hook-generator", async () => {
        const resolved = await resolveAiForOrg(organizationId, "text");
        const out = await skill.execute(
          { topic, platform, count: Math.min(5, cfg.postsPerDay || 3) },
          {
            organizationId,
            jobId: job.id,
            ai: resolved.ai,
            log: async () => {},
          },
        );
        return { out: out as { hooks: string[] }, source: resolved.source };
      });

      const hooks = generation.out.hooks ?? [];

      await step.run("record-usage", () =>
        recordGenerationUsage({
          organizationId,
          action: "text",
          source: generation.source,
          metadata: { jobId: job.id, skill: "hook-generator" },
        }),
      );

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

      await step.run("revalidate-dashboard-after-content", () => {
        revalidateDashboardHome();
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

      await step.run("revalidate-dashboard-after-job", () => {
        revalidateDashboardHome();
      });

      if (cfg.autoPost && !cfg.requireApproval && hooks.length > 0) {
        await step.run("enqueue-auto-publish", async () => {
          const pending = await prisma.generatedContent.findMany({
            where: { jobId: job.id, organizationId, status: "APPROVED" },
          });
          for (const row of pending) {
            await sendInngestEvent({
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
      publishNow?: boolean;
    };
    const publishNow = (event.data as { publishNow?: boolean }).publishNow ?? false;

    const gc = await step.run("load-content", () =>
      prisma.generatedContent.findFirst({
        where: { id: generatedContentId, organizationId },
      }),
    );
    if (!gc) {
      throw new Error("GeneratedContent not found");
    }
    if (gc.status === "SCHEDULED" || gc.status === "PUBLISHED") {
      return { ok: true, skipped: true, reason: "already_published" };
    }
    if (gc.status !== "APPROVED") {
      throw new Error(`Content must be APPROVED to publish (current: ${gc.status})`);
    }

    const tokenRow = await step.run("resolve-buffer-token", () => getBufferAccessTokenForOrg(organizationId));
    if (!tokenRow) {
      throw new Error("No Buffer API key configured");
    }

    const channels = await step.run("buffer-channels", () =>
      prisma.socialAccount.findMany({
        where: { organizationId, platform: "buffer", isActive: true },
      }),
    );
    const channelIds = channels
      .map((c) => c.bufferId)
      .filter((id): id is string => Boolean(id && id.length));
    if (channelIds.length === 0) {
      throw new Error("No Buffer channels synced. Connect Buffer and sync channels in Settings.");
    }

    const cfg = await step.run("load-schedule-config", () =>
      prisma.contentConfig.findFirst({
        where: { organizationId, isDefault: true },
        orderBy: { updatedAt: "desc" },
        select: { postingSchedule: true },
      }),
    );

    const scheduledAt = publishNow
      ? new Date()
      : computeNextScheduledAt(cfg?.postingSchedule ?? [], new Date());

    const assets: BufferAsset[] = gc.videoUrl
      ? [{ video: { url: gc.videoUrl, ...(gc.thumbnailUrl ? { thumbnailUrl: gc.thumbnailUrl } : {}) } }]
      : gc.mediaUrls.length > 0
        ? [{ image: { url: gc.mediaUrls[0] } }]
        : [];

    const provider = createBufferProvider();

    const results = await step.run("buffer-create-posts", async () => {
      await touchApiKeyUsed(tokenRow.keyId);
      const out: { channelId: string; postId: string }[] = [];
      for (const channelId of channelIds) {
        const post = await provider.createPost(tokenRow.token, {
          channelId,
          text: gc.body,
          scheduledAt,
          publishNow,
          assets,
        });
        out.push({ channelId, postId: post.id });
      }
      return out;
    });

    await step.run("record-scheduled-posts", async () => {
      for (const r of results) {
        await prisma.scheduledPost.create({
          data: {
            generatedContentId: gc.id,
            organizationId,
            bufferProfileId: r.channelId,
            bufferUpdateId: r.postId,
            scheduledFor: scheduledAt,
            status: publishNow ? "PUBLISHING" : "SCHEDULED",
          },
        });
      }
    });

    await step.run("update-content-status", () =>
      prisma.generatedContent.update({
        where: { id: gc.id },
        data: { status: publishNow ? "PUBLISHED" : "SCHEDULED" },
      }),
    );

    await step.run("record-usage", () =>
      recordUsage({
        organizationId,
        metric: USAGE_METRICS.publish,
        quantity: results.length,
        metadata: { generatedContentId: gc.id, publishNow },
      }),
    );

    return { ok: true, posts: results.length, scheduledAt: scheduledAt.toISOString() };
  },
);

export const slideshowPipelineV1 = inngest.createFunction(
  {
    id: "fabrica-slideshow-pipeline-v1",
    name: "Slideshow pipeline v1 (HyperFrames)",
    triggers: [{ event: "content/slideshow.requested" }],
  },
  async ({ event, step }) => {
    const data = event.data as {
      organizationId: string;
      contentConfigId?: string;
      prompt?: string;
      platform?: string;
      slideCount?: number;
      aspectRatio?: string;
      imageSource?: string;
      voiceover?: boolean;
      voiceName?: string;
      idempotencyKey?: string;
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

    const prompt = (data.prompt ?? cfg?.prompt ?? cfg?.topics.join(", ") ?? "").trim();
    if (!prompt) {
      throw new Error("No prompt provided and no ContentConfig prompt/topics to fall back to");
    }
    const platform = data.platform ?? cfg?.platforms[0] ?? "instagram";
    const slideCount = data.slideCount ?? cfg?.slideCount ?? 5;
    const aspectRatio = data.aspectRatio ?? cfg?.aspectRatio ?? "9:16";
    const imageSource = data.imageSource ?? cfg?.imageSource ?? "none";
    const voiceover = data.voiceover ?? cfg?.voiceover ?? false;
    const voiceName = data.voiceName ?? cfg?.voiceName ?? DEFAULT_VOICE;

    const idempotencyKey = data.idempotencyKey?.trim() || undefined;

    const existingJob = idempotencyKey
      ? await step.run("check-idempotency", () =>
          prisma.contentJob.findUnique({ where: { idempotencyKey } }),
        )
      : null;

    if (existingJob) {
      return { ok: true, skipped: true, jobId: existingJob.id, reason: "idempotent" };
    }

    const job = await step.run("create-job", () =>
      prisma.contentJob.create({
        data: {
          organizationId,
          configId: cfg?.id,
          status: "RUNNING",
          type: "VIDEO_RENDER",
          startedAt: new Date(),
          input: { prompt, platform, slideCount, aspectRatio, imageSource, voiceover },
          ...(idempotencyKey ? { idempotencyKey } : {}),
        },
      }),
    );

    try {
      const quota = await step.run("check-video-quota", () => checkVideoQuota(organizationId));
      if (!quota.allowed) {
        throw new Error(quota.reason ?? "Límite mensual del plan alcanzado.");
      }

      const skill = getSkill("slideshow-planner");
      if (!skill) {
        throw new Error("slideshow-planner skill not registered");
      }

      const planning = await step.run("run-slideshow-planner", async () => {
        const resolved = await resolveAiForOrg(organizationId, "video");
        const out = await skill.execute(
          {
            prompt,
            platform,
            tone: cfg?.tone ?? "profesional pero cercano",
            targetAudience: cfg?.targetAudience ?? "audiencia general",
            slideCount,
          },
          { organizationId, jobId: job.id, ai: resolved.ai, log: async () => {} },
        );
        return { out, source: resolved.source };
      });

      const plan = SlideshowPlanSchema.parse(planning.out);
      const aiSource = planning.source;

      await step.run("record-skill-execution", () =>
        prisma.skillExecution.create({
          data: {
            jobId: job.id,
            skillId: "slideshow-planner",
            input: { prompt, platform, slideCount },
            output: plan,
            completedAt: new Date(),
          },
        }),
      );

      const requireApproval = cfg?.requireApproval ?? true;
      const gc = await step.run("persist-generated-content", () =>
        prisma.generatedContent.create({
          data: {
            jobId: job.id,
            organizationId,
            type: "REEL",
            platform,
            title: plan.title,
            body: plan.caption || plan.title,
            hashtags: plan.hashtags,
            status: requireApproval ? "PENDING_APPROVAL" : "APPROVED",
          },
        }),
      );

      await step.run("revalidate-dashboard-after-content", () => {
        revalidateDashboardHome();
      });

      const ratio = resolveDimensions(aspectRatio).ratio;

      // --- Source background images (optional) ---
      const imageUrls = await step.run("source-images", async (): Promise<(string | null)[]> => {
        if (imageSource === "pexels") {
          const key = getServerEnv().PEXELS_API_KEY;
          if (!key) return [];
          const out: (string | null)[] = [];
          for (const s of plan.slides) {
            try {
              out.push(await searchPexelsImageUrl(key, s.imagePrompt || s.heading, ratio));
            } catch {
              out.push(null);
            }
          }
          return out;
        }
        if (imageSource === "ai") {
          if (!isR2Configured()) return [];
          const openai = await getRawApiKeyForOrg(organizationId, "OPENAI");
          if (!openai) return [];
          const out: (string | null)[] = [];
          let idx = 0;
          for (const s of plan.slides) {
            try {
              const img = await generateImageWithOpenAI(openai.token, s.imagePrompt || s.heading, ratio);
              if (img) {
                const { publicUrl } = await uploadPublicAsset(
                  `slideshows/${organizationId}/${job.id}-img-${idx}.png`,
                  img.buffer,
                  img.contentType,
                );
                out.push(publicUrl ?? null);
              } else {
                out.push(null);
              }
            } catch {
              out.push(null);
            }
            idx += 1;
          }
          return out;
        }
        return [];
      });

      // --- Synthesize per-slide voiceover (optional, requires R2) ---
      let slideAudioUrls: (string | null)[] = [];
      if (voiceover && isR2Configured()) {
        const voiceData = await step.run("synthesize-voice", async () => {
          const urls: (string | null)[] = [];
          const durations: number[] = [];
          let idx = 0;
          for (const s of plan.slides) {
            const text = s.voiceover || s.body || s.heading;
            try {
              const clip = await synthesizeVoice(text, voiceName);
              const { publicUrl } = await uploadPublicAsset(
                `slideshows/${organizationId}/${job.id}-audio-${idx}.mp3`,
                clip.audio,
                clip.mimeType,
              );
              urls.push(publicUrl ?? null);
              durations.push(clip.durationMs);
            } catch {
              urls.push(null);
              durations.push(0);
            }
            idx += 1;
          }
          return { urls, durations };
        });
        slideAudioUrls = voiceData.urls;
        plan.slides.forEach((s, i) => {
          const d = voiceData.durations[i];
          if (d && d > 0) {
            s.durationMs = Math.max(2500, Math.min(15000, d + 700));
          }
        });
      }

      const cleanImageUrls = imageUrls.filter((u): u is string => Boolean(u));
      if (cleanImageUrls.length > 0) {
        await step.run("save-media-urls", () =>
          prisma.generatedContent.update({
            where: { id: gc.id },
            data: { mediaUrls: cleanImageUrls },
          }),
        );
      }

      const composition = buildSlideshowHtml(plan, {
        aspectRatio,
        fallbackImageUrls: imageUrls,
        slideAudioUrls,
      });

      const renderGuide = buildSlideshowRenderGuide(composition, { title: plan.title });

      const compositionHtmlUrl = await step.run("store-composition-html", async () => {
        if (!isR2Configured()) return null;
        const { publicUrl } = await uploadPublicAsset(
          `slideshows/${organizationId}/${job.id}-composition.html`,
          Buffer.from(composition.html, "utf8"),
          "text/html; charset=utf-8",
        );
        return publicUrl ?? null;
      });

      const videoRender = await step.run("create-video-render", () =>
        prisma.videoRender.create({
          data: {
            jobId: job.id,
            organizationId,
            status: "RENDERING",
            compositionId: "Slideshow",
            aspectRatio,
            durationSeconds: Math.round(composition.durationMs / 1000),
            props: {
              title: plan.title,
              slides: plan.slides.length,
              imageSource,
              voiceover,
              renderGuide,
              compositionHtmlUrl,
              renderEngine: "hyperframes",
            },
          },
        }),
      );
      await step.run("link-render-to-content", () =>
        prisma.generatedContent.update({
          where: { id: gc.id },
          data: { videoRenderId: videoRender.id },
        }),
      );

      const outputUrl = await step.run("render-with-hyperframes", async () => {
        if (!isHyperframesRenderConfigured()) {
          throw new Error(
            "Render local deshabilitado. Descargá index.html y seguí las instrucciones de HyperFrames en el job.",
          );
        }

        const { buffer, contentType } = await renderSlideshowWithHyperframes({
          html: composition.html,
          fps: composition.fps,
        });

        if (isR2Configured()) {
          const { publicUrl } = await uploadPublicAsset(
            `slideshows/${organizationId}/${videoRender.id}.mp4`,
            buffer,
            contentType,
          );
          return publicUrl ?? null;
        }
        return null;
      });

      await step.run("finalize-render", () =>
        prisma.videoRender.update({
          where: { id: videoRender.id },
          data: {
            status: "SUCCEEDED",
            outputUrl,
            assetUrls: { compositionHtmlUrl, renderEngine: "hyperframes" },
          },
        }),
      );
      if (outputUrl) {
        await step.run("set-content-video-url", () =>
          prisma.generatedContent.update({
            where: { id: gc.id },
            data: { videoUrl: outputUrl, thumbnailUrl: outputUrl },
          }),
        );
      }

      await step.run("finalize-job", () =>
        prisma.contentJob.update({
          where: { id: job.id },
          data: {
            status: "SUCCEEDED",
            completedAt: new Date(),
            progress: 1,
            output: { title: plan.title, slides: plan.slides.length, outputUrl, renderGuide },
          },
        }),
      );

      await step.run("record-usage", () =>
        recordGenerationUsage({
          organizationId,
          action: "video",
          source: aiSource,
          metadata: { jobId: job.id, skill: "slideshow-planner" },
        }),
      );

      await step.run("revalidate-dashboard-after-job", () => {
        revalidateDashboardHome();
      });

      if (cfg?.autoPost && !requireApproval && outputUrl) {
        await step.run("enqueue-auto-publish", () =>
          sendInngestEvent({
            name: "content/publish.requested",
            data: { organizationId, generatedContentId: gc.id },
          }),
        );
      }

      return { ok: true, jobId: job.id, outputUrl, compositionHtmlUrl };
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

/**
 * Recurring autopilot: every 15 minutes, finds ContentConfigs with autopilot enabled whose
 * next run is due, dispatches a slideshow generation for each, and advances nextRunAt to the
 * following scheduled slot (so a slot is never dispatched twice).
 */
export const autopilotTick = inngest.createFunction(
  {
    id: "fabrica-autopilot-tick",
    name: "Autopilot tick",
    triggers: [{ cron: "*/15 * * * *" }],
  },
  async ({ step }) => {
    const now = new Date();

    const due = await step.run("find-due-configs", () =>
      prisma.contentConfig.findMany({
        where: {
          isAutopilotActive: true,
          OR: [{ nextRunAt: null }, { nextRunAt: { lte: now } }],
        },
        take: 50,
      }),
    );

    let dispatched = 0;
    let skipped = 0;
    let quotaSkipped = 0;
    for (const cfg of due) {
      const result = await step.run(`dispatch-${cfg.id}`, async () => {
        const nextRunAt = cfg.nextRunAt ? new Date(cfg.nextRunAt) : null;
        const slotStart = resolveAutopilotSlotStart(nextRunAt, cfg.postingSchedule, now);
        const idempotencyKey = buildAutopilotIdempotencyKey(cfg.id, slotStart);

        const existing = await prisma.contentJob.findUnique({ where: { idempotencyKey } });
        const next = computeNextScheduledAt(cfg.postingSchedule, now);

        await prisma.contentConfig.update({
          where: { id: cfg.id },
          data: { nextRunAt: next, lastRunAt: now },
        });

        if (existing) {
          return { skipped: true as const, reason: "idempotent" as const };
        }

        // Plan quota gate: skip the slot silently instead of queuing a job that would fail.
        const quota = await checkVideoQuota(cfg.organizationId);
        if (!quota.allowed) {
          return { skipped: true as const, reason: "quota" as const };
        }

        await sendInngestEvent({
          name: "content/slideshow.requested",
          data: {
            organizationId: cfg.organizationId,
            contentConfigId: cfg.id,
            idempotencyKey,
          },
        });
        return { skipped: false as const };
      });
      if (result.skipped) {
        if (result.reason === "quota") quotaSkipped += 1;
        else skipped += 1;
      } else {
        dispatched += 1;
      }
    }

    return { dispatched, skipped, quotaSkipped, at: now.toISOString() };
  },
);

export const reconcileBufferPosts = inngest.createFunction(
  {
    id: "fabrica-reconcile-buffer-posts",
    name: "Reconcile Buffer post status",
    triggers: [{ cron: "0 * * * *" }],
  },
  async ({ step }) => {
    const result = await step.run("reconcile", () => reconcilePendingBufferPosts(100));
    return result;
  },
);

export const inngestFunctions = [
  healthCheck,
  contentPipelineV1,
  publishToBuffer,
  slideshowPipelineV1,
  autopilotTick,
  reconcileBufferPosts,
];
