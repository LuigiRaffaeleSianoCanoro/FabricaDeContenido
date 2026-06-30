import "server-only";

import type { ScheduledPostStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getBufferAccessTokenForOrg } from "@/services/api-keys";

import { createBufferProvider } from "./providers/buffer";

/** Maps Buffer GraphQL post.status to our ScheduledPostStatus. */
export function mapBufferPostStatus(bufferStatus: string): ScheduledPostStatus | null {
  const s = bufferStatus.toLowerCase();
  if (/sent|published|posted|success|live/.test(s)) return "PUBLISHED";
  if (/fail|error|reject|cancel/.test(s)) return "FAILED";
  if (/publish|processing|in.?progress|sending/.test(s)) return "PUBLISHING";
  if (/schedul|pending|queue|draft|buffered/.test(s)) return "SCHEDULED";
  return null;
}

async function maybeMarkContentPublished(generatedContentId: string): Promise<void> {
  const remaining = await prisma.scheduledPost.count({
    where: {
      generatedContentId,
      status: { notIn: ["PUBLISHED", "CANCELLED"] },
    },
  });
  if (remaining === 0) {
    await prisma.generatedContent.updateMany({
      where: { id: generatedContentId, status: { in: ["SCHEDULED", "APPROVED"] } },
      data: { status: "PUBLISHED" },
    });
  }
}

export type ReconcileBufferResult = { checked: number; updated: number };

/** Polls Buffer for pending ScheduledPosts and syncs local status (M3 / D10). */
export async function reconcilePendingBufferPosts(limit = 100): Promise<ReconcileBufferResult> {
  const pending = await prisma.scheduledPost.findMany({
    where: {
      status: { in: ["SCHEDULED", "PUBLISHING"] },
      bufferUpdateId: { not: null },
    },
    take: limit,
    orderBy: { scheduledFor: "asc" },
  });

  if (pending.length === 0) {
    return { checked: 0, updated: 0 };
  }

  const byOrg = new Map<string, typeof pending>();
  for (const post of pending) {
    const list = byOrg.get(post.organizationId) ?? [];
    list.push(post);
    byOrg.set(post.organizationId, list);
  }

  const provider = createBufferProvider();
  let updated = 0;

  for (const [organizationId, posts] of byOrg) {
    const tokenRow = await getBufferAccessTokenForOrg(organizationId);
    if (!tokenRow) continue;

    for (const post of posts) {
      if (!post.bufferUpdateId) continue;
      try {
        const remote = await provider.getPost(tokenRow.token, post.bufferUpdateId);
        const mapped = mapBufferPostStatus(remote.status);
        if (!mapped || mapped === post.status) continue;

        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: mapped },
        });
        updated += 1;

        if (mapped === "PUBLISHED") {
          await maybeMarkContentPublished(post.generatedContentId);
        }
      } catch {
        // Skip individual post failures; next cron tick retries.
      }
    }
  }

  return { checked: pending.length, updated };
}
