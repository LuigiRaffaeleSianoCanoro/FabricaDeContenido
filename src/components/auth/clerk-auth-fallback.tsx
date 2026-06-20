"use client";

import { AlertTriangle } from "lucide-react";

type ClerkAuthFallbackProps = {
  mode: "sign-in" | "sign-up";
  configurationError?: boolean;
};

/**
 * Shown when Clerk is not configured so `/login` and `/sign-up` render without
 * crashing (SignIn/SignUp require ClerkProvider).
 */
export function ClerkAuthFallback({ mode, configurationError }: ClerkAuthFallbackProps) {
  const title = mode === "sign-in" ? "Inicio de sesión no disponible" : "Registro no disponible";

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-left">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-semibold text-amber-100">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {configurationError
              ? "La autenticación no está configurada en este entorno. Configurá NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY y CLERK_SECRET_KEY en las variables de entorno."
              : "Clerk no está configurado. Agregá las claves de Clerk en .env para habilitar el acceso al panel."}
          </p>
          <p className="mt-3 font-mono text-xs text-white/45">
            Ver README.md → Configuración local → Clerk
          </p>
        </div>
      </div>
    </div>
  );
}
