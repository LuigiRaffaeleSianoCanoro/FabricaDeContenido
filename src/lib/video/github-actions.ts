import { getServerEnv } from "@/config/env.server";

export type DispatchVideoRenderPayload = {
  jobId: string;
  compositionId: string;
  props: Record<string, unknown>;
  /** Absolute URL for the GitHub Actions runner to POST when render completes */
  webhookUrl: string;
};

export function isGitHubRenderConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_PAT &&
      process.env.GITHUB_REPO_OWNER &&
      process.env.GITHUB_REPO_NAME,
  );
}

export async function dispatchVideoRenderWorkflow(
  payload: DispatchVideoRenderPayload,
): Promise<void> {
  const env = getServerEnv();
  if (!env.GITHUB_PAT || !env.GITHUB_REPO_OWNER || !env.GITHUB_REPO_NAME) {
    throw new Error("GitHub Actions dispatch is not configured");
  }

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        event_type: "render-video",
        client_payload: {
          jobId: payload.jobId,
          composition: payload.compositionId,
          props: JSON.stringify(payload.props),
          webhookUrl: payload.webhookUrl,
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub dispatch failed ${res.status}: ${await res.text()}`);
  }
}
