import "server-only";

import { revalidatePath } from "next/cache";

/** Invalidate dashboard home so "Próximos pasos" reflects the latest org state. */
export function revalidateDashboardHome() {
  revalidatePath("/dashboard");
}
