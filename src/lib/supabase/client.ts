import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/config/public-env";

export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
