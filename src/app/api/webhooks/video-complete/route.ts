import { NextResponse } from "next/server";

import { inngest } from "@/lib/inngest/client";
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
 * Header `x-fabrica-webhook-secret` must match `VIDEO_WEBHOOK_SECRET` when that env is set.
 */
export async function POST(req: Request) {
  const configured = process.env.VIDEO_WEBHOOK_SECRET;
  if (configured) {
    const hdr = req.headers.get("x-fabrica-webhook-secret");
    if (hdr !== configured) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const json: unknown = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { jobId, status, outputUrl, error } = parsed.data;

  const vr = await prisma.videoRender.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });

  if (!vr) {
    return NextResponse.json({ error: "VideoRender not found" }, { status: 404 });
  }

  if (status === "completed") {
    await prisma.videoRender.update({
      where: { id: vr.id },
      data: {
        status: "SUCCEEDED",
        outputUrl: outputUrl ?? null,
        errorMessage: null,
      },
    });

    await prisma.generatedContent.updateMany({
      where: { jobId, videoRenderId: vr.id },
      data: {
        ...(outputUrl ? { videoUrl: outputUrl } : {}),
      },
    });

    const orgId = vr.organizationId;
    const config = await prisma.contentConfig.findFirst({
      where: { organizationId: orgId, isDefault: true },
    });

    if (config?.autoPost && !config.requireApproval) {
      const ready = await prisma.generatedContent.findMany({
        where: {
          jobId,
          videoRenderId: vr.id,
          status: { in: ["DRAFT", "APPROVED", "PENDING_APPROVAL"] },
        },
      });
      for (const g of ready) {
        await inngest.send({
          name: "content/publish.requested",
          data: { organizationId: orgId, generatedContentId: g.id },
        });
      }
    }
  } else {
    await prisma.videoRender.update({
      where: { id: vr.id },
      data: {
        status: "FAILED",
        errorMessage: error ?? "Render failed",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
