"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";

// Animated gradient background
function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      if (!ctx || !canvas) return;
      time += 0.005;

      // Create animated gradient
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width * (0.5 + Math.sin(time) * 0.3),
        canvas.height * (0.5 + Math.cos(time) * 0.3)
      );
      
      gradient.addColorStop(0, "#fff8f5");
      gradient.addColorStop(0.5, `rgba(255, ${Math.floor(115 + Math.sin(time) * 20)}, ${Math.floor(26 + Math.sin(time) * 10)}, 0.1)`);
      gradient.addColorStop(1, "#fffaf8");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating circles
      for (let i = 0; i < 3; i++) {
        const x = canvas.width * (0.3 + i * 0.2) + Math.sin(time + i) * 50;
        const y = canvas.height * (0.3 + i * 0.15) + Math.cos(time + i) * 30;
        const radius = 100 + Math.sin(time + i) * 20;
        
        const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        circleGradient.addColorStop(0, "rgba(255, 115, 26, 0.08)");
        circleGradient.addColorStop(1, "rgba(255, 115, 26, 0)");
        
        ctx.fillStyle = circleGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background lg:flex-row">
      <GradientBackground />
      <div className="noise-overlay pointer-events-none fixed inset-0" />

      {/* Left panel - branding (hidden on mobile) */}
      <div className="relative z-10 hidden flex-1 flex-col justify-between p-10 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="animate-pulse-glow flex size-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Fábrica de Contenido
          </span>
        </Link>

        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Automatiza tu{" "}
            <span className="gradient-text">contenido social</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Conecta tus proveedores de IA, programa publicaciones y escala tu
            presencia digital sin esfuerzo.
          </p>
          <div className="flex gap-3">
            {["IA", "Video", "Calendario", "Buffer"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Clerk + Neon + Prisma + Inngest
        </p>
      </div>

      {/* Right panel - auth form */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Fábrica de Contenido</span>
          </Link>
        </div>

        {/* Auth card centered */}
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="glass w-full max-w-sm animate-scale-in space-y-6 rounded-3xl p-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
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
                    "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium",
                  formFieldInput: "border-border focus:border-primary focus:ring-primary",
                },
              }}
            />

            <div className="space-y-3 pt-2 text-center text-sm">
              <p className="text-muted-foreground">
                {"No tienes cuenta? "}
                <Link
                  href="/sign-up"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
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
