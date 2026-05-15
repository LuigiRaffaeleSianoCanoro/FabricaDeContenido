import { NextResponse } from "next/server";

import { z } from "zod";

const bodySchema = z.object({
  jobId: z.string(),
  status: z.enum(["completed", "failed"]),
  outputUrl: z.string().url().optional(),
  error: z.string().optional(),
});

/**
 * Invoked by the GitHub Actions render workflow when a video finishes.
 * TODO: verify shared secret header; update `VideoRender` + enqueue Buffer publish.
 */
export async function POST(req: Request) {
  const json: unknown = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.info("video-complete webhook", parsed.data);

  return NextResponse.json({ ok: true });
}
