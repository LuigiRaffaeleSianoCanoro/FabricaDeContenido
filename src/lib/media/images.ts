import "server-only";

import type { AspectRatio } from "@/lib/video/editframe-composition";

export type ImageSourceKind = "none" | "ai" | "pexels";

function orientationFor(aspect: AspectRatio): "portrait" | "landscape" | "square" {
  if (aspect === "16:9") return "landscape";
  if (aspect === "1:1") return "square";
  return "portrait";
}

function openAiSizeFor(aspect: AspectRatio): "1024x1024" | "1024x1536" | "1536x1024" {
  if (aspect === "16:9") return "1536x1024";
  if (aspect === "1:1") return "1024x1024";
  return "1024x1536";
}

export type GeneratedImage = {
  buffer: Buffer;
  contentType: string;
};

/**
 * Generates an image from a prompt using the org's OpenAI key (gpt-image-1).
 * Returns the raw bytes (caller uploads to storage).
 */
export async function generateImageWithOpenAI(
  apiKey: string,
  prompt: string,
  aspect: AspectRatio,
): Promise<GeneratedImage | null> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: openAiSizeFor(aspect),
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI images error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) return null;
  return { buffer: Buffer.from(b64, "base64"), contentType: "image/png" };
}

type PexelsPhoto = {
  src?: { large2x?: string; large?: string; portrait?: string; landscape?: string };
};

/**
 * Searches Pexels for a stock photo URL matching the query and aspect ratio.
 * Returns a remote URL (usable directly as an Editframe image src).
 */
export async function searchPexelsImageUrl(
  apiKey: string,
  query: string,
  aspect: AspectRatio,
): Promise<string | null> {
  const orientation = orientationFor(aspect);
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", orientation);

  const res = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) {
    throw new Error(`Pexels error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { photos?: PexelsPhoto[] };
  const photo = data.photos?.[0]?.src;
  if (!photo) return null;
  if (orientation === "portrait") return photo.portrait ?? photo.large2x ?? photo.large ?? null;
  if (orientation === "landscape") return photo.landscape ?? photo.large2x ?? photo.large ?? null;
  return photo.large2x ?? photo.large ?? null;
}
