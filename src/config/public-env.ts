/** Client-safe env reads (Next inlines NEXT_PUBLIC_* at build time). */
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
} as const;
