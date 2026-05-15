import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getServerEnv } from "@/config/env.server";

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

function r2Client(): S3Client {
  const env = getServerEnv();
  if (
    !env.R2_ACCOUNT_ID ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY ||
    !env.R2_BUCKET_NAME
  ) {
    throw new Error("Cloudflare R2 is not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadPublicAsset(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<{ key: string; publicUrl?: string }> {
  const env = getServerEnv();
  const client = r2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const publicBase = env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return {
    key,
    publicUrl: publicBase ? `${publicBase}/${key}` : undefined,
  };
}
