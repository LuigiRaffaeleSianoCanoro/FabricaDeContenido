"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center">
        <h1 className="text-xl font-bold tracking-tight">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No pudimos cargar esta página. Suele deberse a la conexión con la base de datos o a una
          configuración pendiente. Reintenta en unos segundos.
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
            href="/"
            className="rounded-xl border border-border/60 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
