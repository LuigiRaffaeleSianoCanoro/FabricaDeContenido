"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** When true, periodically refresh server data (e.g. slideshow job still running). */
  enabled: boolean;
  /** Poll interval in milliseconds. */
  intervalMs?: number;
  /** Stop polling after this many attempts. */
  maxAttempts?: number;
};

/**
 * Refreshes the dashboard RSC payload while background jobs may still be
 * updating org state (e.g. slideshow generation creating GeneratedContent).
 */
export function DashboardPollRefresh({
  enabled,
  intervalMs = 5000,
  maxAttempts = 24,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, maxAttempts, router]);

  return null;
}
