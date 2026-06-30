"use client";

import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { fabricaClerkAppearance } from "@/components/auth/clerk-appearance";
import { isClerkConfigured } from "@/lib/auth/clerk-config";

type LoginClientProps = {
  configurationError?: boolean;
};

export function LoginClient({ configurationError = false }: LoginClientProps) {
  const clerkEnabled = isClerkConfigured();

  return (
    <AuthPageShell
      title="Bienvenido de vuelta"
      subtitle="Accedé a tu panel de control"
      alternateAuthText="¿No tenés cuenta?"
      alternateAuthHref="/sign-up"
      alternateAuthLabel="Crear cuenta"
    >
      {clerkEnabled ? (
        <SignIn
          routing="hash"
          forceRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={fabricaClerkAppearance}
        />
      ) : (
        <ClerkAuthFallback mode="sign-in" configurationError={configurationError} />
      )}
    </AuthPageShell>
  );
}
