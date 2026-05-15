import Link from "next/link";

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

export default async function DashboardHomePage() {
  const { user } = await requireSession();
  const email = user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Hola {email}. Esta es la base del producto: orquestación, skills y proveedores
          están cableados para extender.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
            <CardDescription>
              Conecta proveedor de IA, Buffer y preferencias.
            </CardDescription>
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
            <CardDescription>Monitorea ejecuciones Inngest y reintentos.</CardDescription>
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
