import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Video,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "IA Multi-proveedor",
    description: "OpenAI, Anthropic, Gemini. Cambia sin tocar código.",
  },
  {
    icon: Calendar,
    title: "Calendario Inteligente",
    description: "Programa y publica automáticamente vía Buffer.",
  },
  {
    icon: Video,
    title: "Video Generado",
    description: "Render con Remotion y GitHub Actions. Escala infinita.",
  },
  {
    icon: Zap,
    title: "Colas Inngest",
    description: "Trabajos durables con reintentos y observabilidad.",
  },
];

const benefits = [
  "Configura una vez, publica siempre",
  "Sin vendor lock-in de proveedores",
  "Escalable desde día uno",
  "Código abierto y extensible",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">
              Fábrica de Contenido
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Nuevo: Video render con Remotion
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Automatiza tu contenido social con IA
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Configura una vez. Genera hooks, crea videos y publica en todas tus
            redes. Sin estar pendiente, sin errores.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 px-6 text-base"
              )}
            >
              Comenzar ahora
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "px-6 text-base"
              )}
            >
              Ya tengo cuenta
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Todo lo que necesitas para escalar
              </h2>
              <p className="mt-3 text-muted-foreground">
                Arquitectura moderna, modular y lista para producción.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Listo para automatizar tu contenido?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Crea tu cuenta gratis y conecta tus proveedores de IA y redes
                sociales en minutos.
              </p>
              <div className="mt-8">
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gap-2 px-8 text-base"
                  )}
                >
                  Crear cuenta gratis
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex size-6 items-center justify-center rounded bg-primary">
              <Sparkles className="size-3 text-primary-foreground" />
            </div>
            Fábrica de Contenido
          </div>
          <p className="text-sm text-muted-foreground">
            Hecho con Next.js, Clerk, Neon y Inngest.
          </p>
        </div>
      </footer>
    </div>
  );
}
