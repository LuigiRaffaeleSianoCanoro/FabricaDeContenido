"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ClerkAuthFallback } from "@/components/auth/clerk-auth-fallback";
import { AuroraBackdrop } from "@/components/landing/aurora-backdrop";
import { isClerkConfigured } from "@/lib/auth/clerk-config";

const clerkAppearance = {
  variables: {
    colorPrimary: "#f97316",
    colorBackground: "transparent",
    colorText: "#f5f3f0",
    colorTextSecondary: "rgba(245,243,240,0.6)",
    colorInputText: "#f5f3f0",
    colorInputBackground: "rgba(255,255,255,0.06)",
    colorNeutral: "#ffffff",
    borderRadius: "0.85rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full border-0 bg-transparent shadow-none",
    card: "w-full gap-5 border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    footer: "bg-transparent shadow-none",
    footerAction: "justify-center",
    socialButtonsBlockButton:
      "rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10",
    socialButtonsBlockButtonText: "text-white/90",
    dividerLine: "bg-white/10",
    dividerText: "text-white/40",
    formFieldLabel: "text-white/80",
    formFieldInput:
      "rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/40",
    formButtonPrimary:
      "rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90",
    footerActionText: "text-white/60",
    footerActionLink: "text-primary font-medium hover:text-primary/80",
    identityPreviewText: "text-white/80",
    formResendCodeLink: "text-primary",
    otpCodeFieldInput: "border-white/15 bg-white/5 text-white",
  },
} as const;

type SignUpClientProps = {
  configurationError?: boolean;
};

export function SignUpClient({ configurationError = false }: SignUpClientProps) {
  const clerkEnabled = isClerkConfigured();

  return (
    <div className="relative isolate flex min-h-[100svh] w-full flex-col overflow-x-hidden bg-[#08060e] text-white">
      <AuroraBackdrop />

      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between px-6 lg:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="size-5 text-primary-foreground" fill="currentColor">
              <path d="M4 19V9l6-4v4l6-4v4l4-2.67V19H4z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">Fábrica</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-white/10 bg-[#0c0912]/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Creá tu cuenta</h1>
              <p className="mt-2 text-sm text-white/60">Empezá a automatizar tu contenido</p>
            </div>

            {clerkEnabled ? (
              <SignUp
                routing="hash"
                forceRedirectUrl="/dashboard"
                signInUrl="/login"
                appearance={clerkAppearance}
              />
            ) : (
              <ClerkAuthFallback mode="sign-up" configurationError={configurationError} />
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <p className="text-white/60">
              {"¿Ya tenés cuenta? "}
              <Link
                href="/login"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/45 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
