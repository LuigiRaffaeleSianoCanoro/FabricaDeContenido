import "server-only";

import { Client, createRender, downloadRender, getRenderInfo } from "@editframe/api";

export type EditframeRenderInput = {
  apiKey: string;
  html: string;
  width: number;
  height: number;
  fps: number;
  durationMs: number;
  metadata?: Record<string, string>;
};

export type EditframeRenderResult = {
  renderId: string;
  buffer: Buffer;
  contentType: string;
};

export type EditframeRenderStatus =
  | "complete"
  | "failed"
  | "pending"
  | "rendering"
  | "created"
  | string;

const TERMINAL_OK = "complete";
const TERMINAL_FAIL = "failed";

function client(apiKey: string): Client {
  return new Client(apiKey);
}

/**
 * Submits a render job to Editframe's cloud using the org's own API key (BYOK).
 * Returns the render id; poll with {@link getEditframeRenderStatus}.
 */
export async function startEditframeRender(input: EditframeRenderInput): Promise<string> {
  const c = client(input.apiKey);
  const render = await createRender(c, {
    html: input.html,
    width: input.width,
    height: input.height,
    fps: input.fps,
    duration_ms: input.durationMs,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  });

  if (render.status === TERMINAL_FAIL) {
    throw new Error(render.error?.message ?? "Editframe render failed on creation");
  }
  return render.id;
}

/** Returns the current status of a render (for durable polling in a queue). */
export async function getEditframeRenderStatus(
  apiKey: string,
  renderId: string,
): Promise<{ status: EditframeRenderStatus; error?: string }> {
  const c = client(apiKey);
  const info = await getRenderInfo(c, renderId);
  return { status: info.status, error: info.error?.message };
}

/**
 * Polls Editframe for render status until it completes or fails.
 * Throws on failure. Returns when status is "complete".
 */
export async function waitForEditframeRender(
  apiKey: string,
  renderId: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<void> {
  const intervalMs = opts.intervalMs ?? 5000;
  const timeoutMs = opts.timeoutMs ?? 10 * 60 * 1000;
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const { status, error } = await getEditframeRenderStatus(apiKey, renderId);
    if (status === TERMINAL_OK) return;
    if (status === TERMINAL_FAIL) {
      throw new Error(error ?? "Editframe render failed");
    }
    if (Date.now() > deadline) {
      throw new Error(`Editframe render timed out after ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/** Downloads the rendered MP4 bytes for a completed render. */
export async function downloadEditframeRender(
  apiKey: string,
  renderId: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const c = client(apiKey);
  const res = await downloadRender(c, renderId);
  if (!res.ok) {
    throw new Error(`Editframe download failed (${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: res.headers.get("content-type") ?? "video/mp4",
  };
}

/** Convenience: start, wait, and download in one call. */
export async function renderSlideshowWithEditframe(
  input: EditframeRenderInput,
  pollOpts?: { intervalMs?: number; timeoutMs?: number },
): Promise<EditframeRenderResult> {
  const renderId = await startEditframeRender(input);
  await waitForEditframeRender(input.apiKey, renderId, pollOpts);
  const { buffer, contentType } = await downloadEditframeRender(input.apiKey, renderId);
  return { renderId, buffer, contentType };
}
