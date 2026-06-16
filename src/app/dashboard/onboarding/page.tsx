import { redirect } from "next/navigation";
import Link from "next/link";

import { AuroraBackdrop } from "@/components/landing/aurora-backdrop";
import { DashboardSignOut } from "@/components/dashboard/dashboard-sign-out";
import { getOnboardingStatus } from "@/lib/auth/onboarding-status";
import { requireSession } from "@/lib/auth/require-session";

import { OnboardingWizard } from "./onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await requireSession();
  const status = await getOnboardingStatus(userId);

  if (status.complete) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate flex min-h-[100svh] w-full flex-col overflow-x-hidden bg-[#08060e] text-white">
      <AuroraBackdrop />

      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between px-6 lg:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="size-5 text-primary-foreground" fill="currentColor">
              <path d="M4 19V9l6-4v4l6-4v4l4-2.67V19H4z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">Fábrica</span>
        </Link>
        <DashboardSignOut />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="mb-7 max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            Configuración guiada
          </span>
          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Pongamos tu <span className="gradient-text-animated">fábrica</span> en marcha
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Te guiamos en cada paso. En minutos tu agente crea y publica contenido solo.
          </p>
        </div>

        <OnboardingWizard initialStep={status.step} initialOrgId={status.organizationId} />
      </main>
    </div>
  );
}
