"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">No se pudo cargar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hubo un error al cargar esta sección. Si acabas de actualizar el proyecto, asegúrate de
          haber aplicado el esquema de la base de datos (<code>npm run db:push</code>) y de que
          <code className="mx-1">DATABASE_URL</code> sea válido.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-muted-foreground/60">ref: {error.digest}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-border/60 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40"
          >
            Ir al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
