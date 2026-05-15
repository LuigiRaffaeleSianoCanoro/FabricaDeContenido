import { inngest } from "./client";

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
    await step.run("log-request", async () => ({
      organizationId: (event.data as { organizationId?: string }).organizationId,
    }));
    // TODO: load org AI key, run skills, persist GeneratedContent, enqueue publish/video steps
    return { ok: true };
  },
);

export const inngestFunctions = [healthCheck, contentPipelineV1];
