"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerEnv } from "@/config/env.server";

export async function sendMagicLink(email: string) {
  const env = getServerEnv();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const };
}
