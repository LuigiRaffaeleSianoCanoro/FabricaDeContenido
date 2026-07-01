import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { checkAllServicesHealth } from "@/lib/health/services";
import { inngestUnavailableMessage } from "@/lib/inngest/send";

/**
 * Deployment-level service warnings (Inngest queue, R2 storage) are only
 * actionable by the platform operator, so we keep this banner out of the way
 * for regular tenant users and render it for platform admins only.
 */
export async function ServiceHealthBanner({
  isPlatformAdmin,
}: {
  isPlatformAdmin: boolean;
}) {
  if (!isPlatformAdmin) return null;

  const services = await checkAllServicesHealth();

  const issues: { title: string; detail: string; href?: string }[] = [];

  if (!services.inngest.ok) {
    issues.push({
      title: "Cola de trabajos no disponible",
      detail: inngestUnavailableMessage(),
      href: "https://www.inngest.com/docs/sdk/serve#local-development",
    });
  }

  if (!services.r2.ok && services.r2.configured) {
    issues.push({
      title: "Almacenamiento R2 con error",
      detail: services.r2.error,
    });
  }

  if (!services.r2.ok && !services.r2.configured && process.env.NODE_ENV === "production") {
    issues.push({
      title: "R2 no configurado",
      detail: services.r2.error,
    });
  }

  if (!issues.length) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <div className="space-y-2 text-sm">
          {issues.map((issue) => (
            <div key={issue.title}>
              <p className="font-medium text-amber-100">{issue.title}</p>
              <p className="text-muted-foreground">{issue.detail}</p>
              {issue.href ? (
                <Link
                  href={issue.href}
                  className="text-primary underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver documentación
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
