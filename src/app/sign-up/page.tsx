import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";

const benefits = [
  "Conecta múltiples proveedores de IA",
  "Genera video con Remotion",
  "Publica automáticamente en Buffer",
  "Sin compromisos, cancela cuando quieras",
];

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden flex-1 flex-col justify-between border-r border-border bg-muted/30 p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">
            Fábrica de Contenido
          </span>
        </Link>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">
              Empieza a automatizar tu contenido
            </h2>
            <p className="mt-2 text-muted-foreground">
              Crea tu cuenta y configura tu primer flujo en minutos.
            </p>
          </div>
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Clerk + Neon + Prisma + Inngest
        </p>
      </div>

      {/* Right panel - auth form */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Fábrica de Contenido</span>
          </Link>
        </div>

        {/* Auth card centered */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Crear cuenta
              </h1>
              <p className="text-sm text-muted-foreground">
                Regístrate para acceder al panel y onboarding
              </p>
            </div>

            <SignUp
              routing="hash"
              forceRedirectUrl="/dashboard"
              signInUrl="/login"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 bg-transparent p-0 w-full",
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                  footerActionLink: "text-primary hover:text-primary/80",
                },
              }}
            />

            <div className="space-y-3 pt-2 text-center text-sm">
              <p className="text-muted-foreground">
                {"Ya tienes cuenta? "}
                <Link
                  href="/login"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
