// Buffer's official public API is now GraphQL (https://api.buffer.com) using a
// per-user API key (Bearer). OAuth for third parties is not yet available, so we
// use BYOK: each org stores its own Buffer API key (EncryptedApiKey provider=BUFFER).

export type BufferOrganization = { id: string; name: string };

export type BufferAccount = {
  id: string;
  email?: string;
  name?: string;
  organizations: BufferOrganization[];
};

export type BufferChannel = {
  id: string;
  name: string;
  service: string;
  avatar?: string;
};

export type BufferAsset =
  | { image: { url: string } }
  | { video: { url: string; thumbnailUrl?: string } };

export type CreateBufferPostParams = {
  channelId: string;
  text: string;
  /** When set, schedule the post at this exact time (ISO 8601 in the mutation). */
  scheduledAt?: Date;
  /** Publish immediately instead of queuing/scheduling. */
  publishNow?: boolean;
  assets?: BufferAsset[];
};

export type BufferPostResult = {
  id: string;
  raw: unknown;
};

export type BufferPostStatus = {
  id: string;
  status: string;
};

export interface BufferPublishingProvider {
  readonly providerId: "buffer";
  getAccount(apiKey: string): Promise<BufferAccount>;
  listChannels(apiKey: string, organizationId: string): Promise<BufferChannel[]>;
  createPost(apiKey: string, params: CreateBufferPostParams): Promise<BufferPostResult>;
  getPost(apiKey: string, postId: string): Promise<BufferPostStatus>;
}
