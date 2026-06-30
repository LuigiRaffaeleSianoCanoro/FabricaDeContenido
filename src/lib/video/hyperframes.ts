import "server-only";

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type HyperframesRenderInput = {
  html: string;
  fps: number;
  quality?: "draft" | "standard" | "high";
  timeoutMs?: number;
};

export type HyperframesRenderResult = {
  buffer: Buffer;
  contentType: string;
};

/** Returns true when FFmpeg is available (minimum requirement for HyperFrames render). */
export function isHyperframesRenderConfigured(): boolean {
  return Boolean(process.env.HYPERFRAMES_RENDER_ENABLED !== "false");
}

/**
 * Renders a HyperFrames HTML composition to MP4 using the local CLI.
 * Requires Node 22+, FFmpeg, and Chrome (installed/managed by HyperFrames).
 */
export async function renderSlideshowWithHyperframes(
  input: HyperframesRenderInput,
): Promise<HyperframesRenderResult> {
  const dir = await mkdtemp(path.join(tmpdir(), "fabrica-slideshow-"));
  const htmlPath = path.join(dir, "index.html");
  const outPath = path.join(dir, "output.mp4");

  await writeFile(htmlPath, input.html, "utf8");

  try {
    const quality = input.quality ?? "standard";
    const timeout = input.timeoutMs ?? 15 * 60 * 1000;

    await execFileAsync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "hyperframes",
        "render",
        dir,
        "-o",
        outPath,
        "-f",
        String(input.fps),
        "-q",
        quality,
      ],
      {
        timeout,
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, CI: "1" },
      },
    );

    const buffer = await readFile(outPath);
    return { buffer, contentType: "video/mp4" };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
