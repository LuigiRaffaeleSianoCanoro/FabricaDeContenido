import "server-only";

import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

import { getServerEnv } from "@/config/env.server";
import { isR2Configured } from "@/lib/storage/r2";

import type { ServiceHealth, ServicesHealthSnapshot } from "./types";

const PROBE_TIMEOUT_MS = 5_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("probe timeout")), ms);
    }),
  ]);
}

/** Inngest event key must be present for cloud/async pipelines in production. */
export async function checkInngestHealth(): Promise<ServiceHealth> {
  const configured = Boolean(process.env.INNGEST_EVENT_KEY?.trim());
  if (!configured) {
    if (process.env.NODE_ENV === "development") {
      return {
        ok: true,
        configured: false,
      };
    }
    return {
      ok: false,
      configured: false,
      error: "INNGEST_EVENT_KEY missing — async pipelines will not run",
    };
  }
  return { ok: true, configured: true };
}

/** R2 is required for video/voiceover public URLs; probe bucket when configured. */
export async function checkR2Health(): Promise<ServiceHealth> {
  if (!isR2Configured()) {
    return {
      ok: false,
      configured: false,
      error: "R2 env vars missing (R2_ACCOUNT_ID, keys, bucket)",
    };
  }

  try {
    const env = getServerEnv();
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
    await withTimeout(
      client.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET_NAME! })),
      PROBE_TIMEOUT_MS,
    );
    return { ok: true, configured: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, configured: true, error };
  }
}

/** Platform-level reachability of Buffer GraphQL (org keys validated separately). */
export async function checkBufferApiHealth(): Promise<ServiceHealth> {
  try {
    const res = await withTimeout(
      fetch("https://api.buffer.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ __typename }" }),
      }),
      PROBE_TIMEOUT_MS,
    );
    if (res.status >= 500) {
      return {
        ok: false,
        configured: true,
        error: `Buffer API returned HTTP ${res.status}`,
      };
    }
    return { ok: true, configured: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, configured: true, error };
  }
}

/** Optional platform Pexels key for stock images. */
export async function checkPexelsHealth(): Promise<ServiceHealth> {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) {
    return { ok: true, configured: false };
  }

  try {
    const res = await withTimeout(
      fetch("https://api.pexels.com/v1/search?query=test&per_page=1", {
        headers: { Authorization: key },
      }),
      PROBE_TIMEOUT_MS,
    );
    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        configured: true,
        error: "PEXELS_API_KEY rejected by Pexels API",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        configured: true,
        error: `Pexels API returned HTTP ${res.status}`,
      };
    }
    return { ok: true, configured: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, configured: true, error };
  }
}

export async function checkAllServicesHealth(): Promise<ServicesHealthSnapshot> {
  const [inngest, r2, buffer, pexels] = await Promise.all([
    checkInngestHealth(),
    checkR2Health(),
    checkBufferApiHealth(),
    checkPexelsHealth(),
  ]);
  return { inngest, r2, buffer, pexels };
}

/** True when a dependency should fail the overall /api/health ok flag. */
export function isCriticalServiceFailure(service: ServiceHealth, name: keyof ServicesHealthSnapshot): boolean {
  if (service.ok) return false;
  if (name === "pexels") return false;
  if (name === "r2" && process.env.NODE_ENV === "development") return false;
  return true;
}
