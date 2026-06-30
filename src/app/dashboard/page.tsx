import Link from "next/link";
import {
  Film,
  Repeat,
  Calendar,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";

import { GenerateHooksForm } from "@/components/dashboard/generate-hooks-form";
import { NextSteps } from "@/components/dashboard/next-steps";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { requireOnboardingComplete } from "@/lib/auth/onboarding-status";
import { requireSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/db/prisma";

const quickActions = [
  {
    title: "Studio",
    description: "Generá un slideshow con IA.",
    href: "/dashboard/studio",
    icon: Film,
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    title: "Automatización",
    description: "Configurá el autopiloto.",
    href: "/dashboard/automation",
    icon: Repeat,
    color: "from-orange-400/20 to-orange-500/10",
  },
  {
    title: "Contenido",
    description: "Revisá y aprobá tu contenido.",
    href: "/dashboard/content",
    icon: FileText,
    color: "from-orange-600/20 to-orange-500/10",
  },
  {
    title: "Calendario",
    description: "Mirá tus publicaciones programadas.",
    href: "/dashboard/calendar",
    icon: Calendar,
    color: "from-orange-500/20 to-orange-400/10",
  },
];

export default async function DashboardHomePage() {
  const { user, userId } = await requireSession();
  await requireOnboardingComplete();
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const name = email.split("@")[0];

  const org = await getActiveOrganizationForUser(userId);
  if (!org) {
    redirect("/dashboard/onboarding");
  }

  const [
    contentCount,
    activeJobs,
    scheduledCount,
    publishedCount,
    channelCount,
    pendingApproval,
    defaultConfig,
  ] = await Promise.all([
    prisma.generatedContent.count({ where: { organizationId: org.id } }),
    prisma.contentJob.count({
      where: {
        organizationId: org.id,
        status: { in: ["PENDING", "QUEUED", "RUNNING"] },
      },
    }),
    prisma.scheduledPost.count({
      where: { organizationId: org.id, status: "SCHEDULED" },
    }),
    prisma.scheduledPost.count({
      where: { organizationId: org.id, status: "PUBLISHED" },
    }),
    prisma.socialAccount.count({
      where: { organizationId: org.id, platform: "buffer", isActive: true },
    }),
    prisma.generatedContent.count({
      where: { organizationId: org.id, status: "PENDING_APPROVAL" },
    }),
    prisma.contentConfig.findFirst({
      where: { organizationId: org.id, isDefault: true },
      select: { isAutopilotActive: true },
    }),
  ]);

  const stats = [
    { label: "Contenidos", value: String(contentCount), icon: Sparkles },
    { label: "Trabajos activos", value: String(activeJobs), icon: Zap },
    { label: "Programados", value: String(scheduledCount), icon: Calendar },
    { label: "Publicados", value: String(publishedCount), icon: TrendingUp },
  ];

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-40 -top-40 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-60 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Panel de control</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Beta
          </span>
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Hola, <span className="gradient-text">{name}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Workspace: <span className="font-medium text-foreground">{org.name}</span>
        </p>
      </div>

      <div className="relative z-10 mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="glass group animate-scale-in rounded-2xl p-4 transition-all hover:scale-[1.02] hover:bg-primary/5"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <stat.icon className="size-5" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mb-8">
        <div className="glass gradient-border overflow-hidden rounded-2xl p-5">
          <h3 className="mb-3 font-semibold">Generar hooks rápidos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Genera ideas de texto con IA según tu configuración. Para videos, usá el Studio.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <GenerateHooksForm organizationId={org.id} />
            <Link
              href="/dashboard/studio"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Ir al Studio →
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <h2 className="mb-4 text-lg font-semibold">Acciones rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className="glass group animate-slide-in-left overflow-hidden rounded-2xl p-5 transition-all hover:scale-[1.02] hover:bg-primary/5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <action.icon className="size-6" />
                </div>
                <ArrowRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <div className="relative z-10 mt-4">
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <NextSteps
          channelsSynced={channelCount > 0}
          hasContent={contentCount > 0}
          autopilotActive={Boolean(defaultConfig?.isAutopilotActive)}
          pendingApproval={pendingApproval}
        />
      </div>
    </div>
  );
}
