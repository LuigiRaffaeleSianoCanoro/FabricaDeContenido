"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: 32,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Algo salió mal</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "rgba(250,250,250,0.7)" }}>
            Ocurrió un error inesperado. Reintenta en unos segundos.
          </p>
          {error.digest && (
            <p style={{ marginTop: 12, fontSize: 12, color: "rgba(250,250,250,0.5)" }}>
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              borderRadius: 12,
              border: "none",
              background: "#f97316",
              color: "#0a0a0a",
              fontWeight: 600,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
