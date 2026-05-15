import Link from "next/link";
import {
  Rocket,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  ArrowRight,
} from "lucide-react";

import { requireSession } from "@/lib/auth/require-session";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Onboarding",
    description: "Conecta proveedor de IA, Buffer y preferencias.",
    href: "/dashboard/onboarding",
    icon: Rocket,
  },
  {
    title: "Trabajos",
    description: "Monitorea ejecuciones Inngest y reintentos.",
    href: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    title: "Calendario",
    description: "Programa y visualiza publicaciones.",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Contenido",
    description: "Genera y gestiona tu contenido con IA.",
    href: "/dashboard/content",
    icon: FileText,
  },
];

export default async function DashboardHomePage() {
  const { user } = await requireSession();
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const name = email.split("@")[0];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {/* Welcome section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {name}
        </h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control. Aquí puedes gestionar tu contenido,
          ver trabajos y configurar integraciones.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold">0</div>
            <p className="text-xs text-muted-foreground">
              Contenidos generados
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold">0</div>
            <p className="text-xs text-muted-foreground">Trabajos activos</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold">0</div>
            <p className="text-xs text-muted-foreground">Programados</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="text-2xl font-semibold">0</div>
            <p className="text-xs text-muted-foreground">Publicados</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Acciones rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Card
              key={action.href}
              className="group transition-colors hover:border-primary/50"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <action.icon className="size-5" />
                  </div>
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={action.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-1.5 group-hover:border-primary/50"
                  )}
                >
                  Ir
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting started */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Completa tu configuración
          </CardTitle>
          <CardDescription>
            Para empezar a generar contenido, necesitas completar el onboarding
            y conectar tus proveedores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/onboarding"
            className={cn(buttonVariants(), "gap-2")}
          >
            <Rocket className="size-4" />
            Comenzar onboarding
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
