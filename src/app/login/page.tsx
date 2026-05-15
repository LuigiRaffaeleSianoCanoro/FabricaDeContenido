import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function LoginPage() {
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
        <div className="space-y-4">
          <blockquote className="max-w-md text-lg text-muted-foreground">
            &ldquo;Automatiza la creación y publicación de contenido en tus
            redes sociales con inteligencia artificial.&rdquo;
          </blockquote>
          <p className="text-sm text-muted-foreground">
            Multi-proveedor IA &middot; Video &middot; Calendario
          </p>
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
                Iniciar sesión
              </h1>
              <p className="text-sm text-muted-foreground">
                Accede a tu panel de control
              </p>
            </div>

            <SignIn
              routing="hash"
              forceRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
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
                {"No tienes cuenta? "}
                <Link
                  href="/sign-up"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Crear cuenta
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
