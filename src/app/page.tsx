import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-semibold tracking-tight">Fábrica de Contenido</span>
        <div className="flex gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Entrar
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Panel
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-24">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Autónomo · multi-proveedor · Buffer
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Configura una vez. Publica en redes con IA, video y calendario.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Base pensada para escalar: Supabase + Prisma, colas Inngest, skills
            modulares, render de video vía GitHub Actions y R2, sin acoplar
            proveedores.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Empezar
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full sm:w-auto",
              )}
            >
              Ir al panel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
