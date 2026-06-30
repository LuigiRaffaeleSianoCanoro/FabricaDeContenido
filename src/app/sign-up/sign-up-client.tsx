"use client";

import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { fabricaClerkAppearance } from "@/components/auth/clerk-appearance";
import { isClerkConfigured } from "@/lib/auth/clerk-config";

type SignUpClientProps = {
  configurationError?: boolean;
};

export function SignUpClient({ configurationError = false }: SignUpClientProps) {
  const clerkEnabled = isClerkConfigured();

  return (
    <AuthPageShell
      title="Creá tu cuenta"
      subtitle="Empezá a automatizar tu contenido"
      alternateAuthText="¿Ya tenés cuenta?"
      alternateAuthHref="/login"
      alternateAuthLabel="Iniciar sesión"
    >
      {clerkEnabled ? (
        <SignUp
          routing="hash"
          forceRedirectUrl="/dashboard"
          signInUrl="/login"
          appearance={fabricaClerkAppearance}
        />
      ) : (
        <ClerkAuthFallback mode="sign-up" configurationError={configurationError} />
      )}
    </AuthPageShell>
  );
}
