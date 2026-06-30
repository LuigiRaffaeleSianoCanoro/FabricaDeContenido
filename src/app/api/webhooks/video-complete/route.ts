import { NextResponse } from "next/server";

import { sendInngestEvent } from "@/lib/inngest/send";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const bodySchema = z.object({
  jobId: z.string(),
  status: z.enum(["completed", "failed"]),
  outputUrl: z.string().url().optional(),
  error: z.string().optional(),
});

/**
 * Invoked by the GitHub Actions render workflow when a video finishes.
 */
export async function POST(req: Request) {
  const secret = process.env.VIDEO_WEBHOOK_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }
  } else {
    const header = req.headers.get("x-fabrica-webhook-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const json: unknown = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { jobId, status, outputUrl, error } = parsed.data;

  const render = await prisma.videoRender.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: {
      generatedContent: true,
      job: { include: { organization: { include: { contentConfigs: { where: { isDefault: true }, take: 1 } } } } },
    },
  });

  if (!render) {
    return NextResponse.json({ error: "VideoRender not found" }, { status: 404 });
  }

  if (status === "failed") {
    await prisma.videoRender.update({
      where: { id: render.id },
      data: {
        status: "FAILED",
        errorMessage: error ?? "Render failed",
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (!outputUrl) {
    return NextResponse.json({ error: "outputUrl required when completed" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.videoRender.update({
      where: { id: render.id },
      data: {
        status: "SUCCEEDED",
        outputUrl,
      },
    }),
    prisma.generatedContent.updateMany({
      where: { videoRenderId: render.id },
      data: { videoUrl: outputUrl },
    }),
  ]);

  const cfg = render.job.organization.contentConfigs[0];
  if (cfg?.autoPost && !cfg.requireApproval) {
    for (const gc of render.generatedContent) {
      if (gc.status !== "APPROVED") continue;
      await sendInngestEvent({
        name: "content/publish.requested",
        data: { organizationId: render.organizationId, generatedContentId: gc.id },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
