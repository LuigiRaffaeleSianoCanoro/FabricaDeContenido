import Link from "next/link";

import { requestPipelineRun } from "@/app/dashboard/actions";
import { requireSession } from "@/lib/auth/require-session";
import { getActiveOrganizationForUser } from "@/lib/auth/active-org";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const { user } = await requireSession();
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const org = await getActiveOrganizationForUser(user.id);

  if (!org) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Hola {email}. Tu org activa: <strong>{org.name}</strong>
        </p>
      </div>

      <Card className="border-2 border-[#FF4D00]/30 bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle>Pipeline de contenido</CardTitle>
          <CardDescription>
            Dispara Inngest: genera ganchos con el skill `hook-generator` y persiste borradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={requestPipelineRun} className="flex flex-wrap items-center gap-4">
            <input type="hidden" name="organizationId" value={org.id} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="includeVideo" className="rounded" />
              Incluir dispatch de video (si GitHub está configurado)
            </label>
            <Button type="submit" className="bg-[#FF4D00] hover:bg-[#FF6A1A]">
              Generar ahora
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
            <CardDescription>Claves, Buffer y preferencias.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/onboarding"
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
            >
              Continuar
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trabajos</CardTitle>
            <CardDescription>Estado Inngest y skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/jobs"
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
            >
              Ver trabajos
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
