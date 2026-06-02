import "server-only";

import { prisma } from "@/lib/db/prisma";
import { getBufferAccessTokenForOrg, touchApiKeyUsed } from "@/services/api-keys";

import { createBufferProvider } from "./providers/buffer";

export type SyncChannelsResult = {
  organizationId: string;
  bufferOrganizationId: string | null;
  synced: number;
};

/**
 * Pulls the Buffer channels (formerly "profiles") for the org's Buffer API key and
 * upserts them as SocialAccount rows (platform="buffer", bufferId=channelId).
 * Channels no longer present are marked inactive.
 */
export async function syncBufferChannels(organizationId: string): Promise<SyncChannelsResult> {
  const tokenRow = await getBufferAccessTokenForOrg(organizationId);
  if (!tokenRow) {
    throw new Error("No hay una API key de Buffer configurada para esta organización.");
  }

  const provider = createBufferProvider();
  const account = await provider.getAccount(tokenRow.token);
  await touchApiKeyUsed(tokenRow.keyId);

  const bufferOrg = account.organizations[0];
  if (!bufferOrg) {
    return { organizationId, bufferOrganizationId: null, synced: 0 };
  }

  const channels = await provider.listChannels(tokenRow.token, bufferOrg.id);
  const seenIds = new Set<string>();

  for (const channel of channels) {
    seenIds.add(channel.id);
    await prisma.socialAccount.upsert({
      where: {
        organizationId_platform_handle: {
          organizationId,
          platform: "buffer",
          handle: channel.id,
        },
      },
      create: {
        organizationId,
        platform: "buffer",
        handle: channel.id,
        bufferId: channel.id,
        displayName: channel.name,
        avatarUrl: channel.avatar,
        isActive: true,
        metadata: { service: channel.service, bufferOrganizationId: bufferOrg.id },
      },
      update: {
        bufferId: channel.id,
        displayName: channel.name,
        avatarUrl: channel.avatar,
        isActive: true,
        metadata: { service: channel.service, bufferOrganizationId: bufferOrg.id },
      },
    });
  }

  // Deactivate channels that are no longer returned by Buffer.
  const existing = await prisma.socialAccount.findMany({
    where: { organizationId, platform: "buffer", isActive: true },
    select: { id: true, bufferId: true },
  });
  for (const row of existing) {
    if (row.bufferId && !seenIds.has(row.bufferId)) {
      await prisma.socialAccount.update({
        where: { id: row.id },
        data: { isActive: false },
      });
    }
  }

  return { organizationId, bufferOrganizationId: bufferOrg.id, synced: channels.length };
}
