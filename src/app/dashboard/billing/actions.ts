"use server";

import { revalidatePath } from "next/cache";

import { assertOrgRole } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/require-session";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/services/audit-log";

export type UpgradeActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

/**
 * Registers an upgrade request for the active org. Checkout (Stripe) is not
 * wired yet, so the request is audited and fulfilled manually by the platform
 * admin from /dashboard/admin. This keeps a clean seam for automatic checkout.
 */
export async function requestPlanUpgrade(
  _: UpgradeActionState,
  formData: FormData,
): Promise<UpgradeActionState> {
  try {
    const { userId, user } = await requireSession();
    const organizationId = String(formData.get("organizationId") ?? "").trim();
    const targetPlan = String(formData.get("targetPlan") ?? "").trim() as PlanId;

    if (!organizationId) return { error: "Sin organización." };
    if (!(targetPlan in PLANS)) return { error: "Plan no válido." };

    await assertOrgRole(userId, organizationId, ["OWNER", "ADMIN"]);

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, name: true },
    });
    if (!org) return { error: "Organización no encontrada." };
    if (org.plan === targetPlan) {
      return { error: "Ya estás en ese plan." };
    }

    await writeAuditLog({
      organizationId,
      actorUserId: userId,
      action: "billing.upgrade_requested",
      resourceType: "Organization",
      resourceId: organizationId,
      metadata: {
        fromPlan: org.plan,
        targetPlan,
        requesterEmail: user.emailAddresses[0]?.emailAddress ?? null,
      },
    });

    revalidatePath("/dashboard/billing");
    return {
      ok: true,
      message: `Solicitud registrada: ${PLANS[targetPlan].label}. Te contactamos para activar el plan (el checkout automático llega pronto).`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/no tienes permiso/i.test(msg)) return { error: msg };
    return { error: `No se pudo registrar la solicitud. Detalle: ${msg}` };
  }
}
