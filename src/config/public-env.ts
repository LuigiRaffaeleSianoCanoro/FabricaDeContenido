/** Client-safe env reads (Next inlines NEXT_PUBLIC_* at build time). */
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;
