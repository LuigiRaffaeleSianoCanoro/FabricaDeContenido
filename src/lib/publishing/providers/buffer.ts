import type {
  BufferAccount,
  BufferChannel,
  BufferPostResult,
  BufferPublishingProvider,
  CreateBufferPostParams,
} from "../types";

const BUFFER_GRAPHQL = "https://api.buffer.com";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function bufferGraphQL<T>(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(BUFFER_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, ...(variables ? { variables } : {}) }),
  });

  if (!res.ok) {
    throw new Error(`Buffer API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Buffer GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Buffer GraphQL: empty response");
  }
  return json.data;
}

export class BufferGraphQLProvider implements BufferPublishingProvider {
  readonly providerId = "buffer" as const;

  async getAccount(apiKey: string): Promise<BufferAccount> {
    const data = await bufferGraphQL<{
      account: {
        id: string;
        email?: string;
        name?: string;
        organizations?: { id: string; name: string }[];
      };
    }>(
      apiKey,
      `query { account { id email name organizations { id name } } }`,
    );
    return {
      id: data.account.id,
      email: data.account.email,
      name: data.account.name,
      organizations: data.account.organizations ?? [],
    };
  }

  async listChannels(apiKey: string, organizationId: string): Promise<BufferChannel[]> {
    const data = await bufferGraphQL<{
      channels: { id: string; name: string; service: string; avatar?: string }[];
    }>(
      apiKey,
      `query Channels($organizationId: String!) {
        channels(input: { organizationId: $organizationId }) {
          id
          name
          service
          avatar
        }
      }`,
      { organizationId },
    );
    return data.channels ?? [];
  }

  async createPost(apiKey: string, params: CreateBufferPostParams): Promise<BufferPostResult> {
    const input: Record<string, unknown> = {
      channelId: params.channelId,
      text: params.text,
      schedulingType: "automatic",
      mode: params.publishNow ? "now" : "addToQueue",
      assets: params.assets ?? [],
    };
    if (params.scheduledAt && !params.publishNow) {
      input.dueAt = params.scheduledAt.toISOString();
    }

    const data = await bufferGraphQL<{
      createPost: {
        __typename: string;
        post?: { id: string };
        message?: string;
      };
    }>(
      apiKey,
      `mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          __typename
          ... on PostActionSuccess { post { id text status } }
          ... on MutationError { message }
        }
      }`,
      { input },
    );

    const result = data.createPost;
    if (!result.post?.id) {
      throw new Error(result.message ?? "Buffer createPost failed");
    }
    return { id: result.post.id, raw: result };
  }

  async getPost(apiKey: string, postId: string): Promise<{ id: string; status: string }> {
    const data = await bufferGraphQL<{
      post: { id: string; status: string };
    }>(
      apiKey,
      `query Post($input: PostInput!) {
        post(input: $input) {
          id
          status
        }
      }`,
      { input: { id: postId } },
    );
    return data.post;
  }
}

export function createBufferProvider(): BufferPublishingProvider {
  return new BufferGraphQLProvider();
}
