import "server-only";

import { flattenError, z } from "zod";

const hex32Bytes = z
  .string()
  .length(64, "ENCRYPTION_MASTER_KEY must be 64 hex chars (32 bytes)")
  .regex(/^[0-9a-fA-F]+$/, "ENCRYPTION_MASTER_KEY must be hexadecimal");

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  /** Optional for DB-only / public-route dev; required for auth flows. */
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  /** Required to verify `/api/webhooks/clerk` (user sync). */
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().url(),

  ENCRYPTION_MASTER_KEY: hex32Bytes,

  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  GITHUB_REPO_OWNER: z.string().optional(),
  GITHUB_REPO_NAME: z.string().optional(),
  GITHUB_PAT: z.string().optional(),

  VIDEO_WEBHOOK_SECRET: z.string().optional(),

  ADMIN_EMAILS: z.string().optional(),

  /** Optional platform-level Pexels key for free stock images on slideshows. */
  PEXELS_API_KEY: z.string().optional(),

  /** Platform AI key for premium plans ("agent usage"). Never a tenant key. */
  PLATFORM_AI_PROVIDER: z
    .enum([
      "openai",
      "anthropic",
      "gemini",
      "openrouter",
      "minimax",
      "groq",
      "mistral",
      "deepseek",
      "xai",
      "together",
      "custom",
    ])
    .optional(),
  PLATFORM_AI_API_KEY: z.string().optional(),
  /** Required when PLATFORM_AI_PROVIDER=custom (OpenAI-compatible endpoint). */
  PLATFORM_AI_BASE_URL: z.string().url().optional(),
  PLATFORM_AI_MODEL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | null = null;

/** Validated env for server-only code paths (API routes, server actions, workers). */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = flattenError(parsed.error).fieldErrors;
    throw new Error(`Invalid environment variables: ${JSON.stringify(fields)}`);
  }
  cached = parsed.data;
  return parsed.data;
}
