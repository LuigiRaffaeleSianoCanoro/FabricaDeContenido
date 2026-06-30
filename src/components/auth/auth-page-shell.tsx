import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { AuroraBackdrop } from "@/components/landing/aurora-backdrop";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  alternateAuthText: string;
  alternateAuthHref: string;
  alternateAuthLabel: string;
};

export function AuthPageShell({
  title,
  subtitle,
  children,
  alternateAuthText,
  alternateAuthHref,
  alternateAuthLabel,
}: AuthPageShellProps) {
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
        <div className="w-full min-w-0 max-w-sm">
          <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0c0912]/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            </div>

            <div className="clerk-auth-shell min-w-0 w-full">{children}</div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 px-2 pb-6 text-sm sm:pb-8">
            <p className="text-center text-white/60">
              {alternateAuthText}{" "}
              <Link
                href={alternateAuthHref}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {alternateAuthLabel}
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-white/45 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
