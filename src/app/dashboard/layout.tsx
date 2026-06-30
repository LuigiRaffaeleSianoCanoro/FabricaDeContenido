import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Database } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ServiceHealthBanner } from "@/components/dashboard/service-health-banner";
import { isPlatformAdminEmail } from "@/lib/auth/admin";
import {
  getActiveOrganizationForUser,
  listUserOrganizations,
  type OrgWithRole,
} from "@/lib/auth/active-org";
import { getOnboardingStatus } from "@/lib/auth/onboarding-status";
import { checkDatabase, classifyDbError } from "@/lib/db/health";

export const dynamic = "force-dynamic";

function DbConfigScreen({ kind, error }: { kind: string; error: string }) {
  const hint =
    kind === "config"
      ? "Falta o es inválida la variable DATABASE_URL en tu entorno."
      : kind === "unreachable"
        ? "No se pudo conectar al servidor de base de datos. Verifica DATABASE_URL (host, puerto, SSL)."
        : kind === "schema"
          ? "La base de datos conecta pero le faltan tablas. Aplica el esquema con npm run db:push."
          : "Ocurrió un error al consultar la base de datos.";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="glass w-full max-w-lg rounded-3xl p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Database className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Configuración de base de datos pendiente</h1>
            <p className="text-sm text-muted-foreground">{hint}</p>
          </div>
        </div>

        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            1. Define <code className="text-foreground">DATABASE_URL</code> (Neon/Postgres con
            <code className="mx-1 text-foreground">sslmode=require</code>) en tu hosting.
          </li>
          <li>
            2. Aplica el esquema: <code className="text-foreground">npm run db:push</code> apuntando a esa
            base, y opcionalmente <code className="text-foreground">npm run db:seed</code>.
          </li>
          <li>
            3. Verifica el estado en{" "}
            <a href="/api/health" className="text-primary underline" target="_blank" rel="noreferrer">
              /api/health
            </a>
            .
          </li>
        </ol>

        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-muted-foreground/70">Detalle técnico</summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-card/60 p-3 text-xs text-muted-foreground">
            {error}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  const health = await checkDatabase();
  if (!health.ok) {
    return <DbConfigScreen kind={health.kind} error={health.error} />;
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  let orgs: OrgWithRole[] = [];
  let active: { id: string } | null = null;
  let complete = false;
  try {
    orgs = await listUserOrganizations(user.id);
    active = await getActiveOrganizationForUser(user.id);
    complete = (await getOnboardingStatus(user.id)).complete;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return <DbConfigScreen kind={classifyDbError(message)} error={message} />;
  }

  // While onboarding is incomplete, hide the sidebar/tabs and let the guided
  // full-screen onboarding flow take over (other routes redirect to it).
  if (!complete) {
    return <>{children}</>;
  }

  return (
    <DashboardShell
      email={email}
      organizations={orgs}
      activeOrganizationId={active?.id ?? null}
      isPlatformAdmin={isPlatformAdminEmail(email)}
    >
      <div className="px-6 pt-6 lg:px-8 lg:pt-8">
        <ServiceHealthBanner />
      </div>
      {children}
    </DashboardShell>
  );
}
