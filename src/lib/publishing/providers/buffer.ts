import type {
  PublishNowParams,
  PublishedUpdate,
  PublishingProvider,
  SchedulePostParams,
} from "../types";

const BUFFER_API = "https://api.bufferapp.com/1";

async function bufferFetch(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<unknown> {
  const url = new URL(`${BUFFER_API}${path}`);
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url.toString(), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`Buffer API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export class BufferPublishingProvider implements PublishingProvider {
  readonly providerId = "buffer";

  async schedulePost(
    params: SchedulePostParams,
    accessToken: string,
  ): Promise<PublishedUpdate> {
    const body: Record<string, unknown> = {
      text: params.text,
      profile_ids: params.profileIds,
      scheduled_at: Math.floor(params.scheduledAt.getTime() / 1000),
    };
    if (params.mediaUrls?.length) {
      body.media = { photo: params.mediaUrls[0] };
    }
    const data = (await bufferFetch("/updates/create.json", accessToken, {
      method: "POST",
      body: JSON.stringify(body),
    })) as { success: boolean; id?: string; message?: string };

    if (!data.success || !data.id) {
      throw new Error(data.message ?? "Buffer schedule failed");
    }

    return { id: data.id, provider: "buffer", raw: data };
  }

  async publishPost(
    params: PublishNowParams,
    accessToken: string,
  ): Promise<PublishedUpdate> {
    const body: Record<string, unknown> = {
      text: params.text,
      profile_ids: params.profileIds,
      now: true,
    };
    if (params.mediaUrls?.length) {
      body.media = { photo: params.mediaUrls[0] };
    }
    const data = (await bufferFetch("/updates/create.json", accessToken, {
      method: "POST",
      body: JSON.stringify(body),
    })) as { success: boolean; id?: string; message?: string };

    if (!data.success || !data.id) {
      throw new Error(data.message ?? "Buffer publish failed");
    }

    return { id: data.id, provider: "buffer", raw: data };
  }
}

export function createBufferProvider(): PublishingProvider {
  return new BufferPublishingProvider();
}
