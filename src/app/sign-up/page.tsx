"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";

const benefits = [
  "Conecta múltiples proveedores de IA",
  "Genera video con Remotion",
  "Publica automáticamente en Buffer",
  "Sin compromisos, cancela cuando quieras",
];

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

      const gradient = ctx.createLinearGradient(
        canvas.width * (0.5 + Math.cos(time) * 0.3),
        0,
        canvas.width * (0.5 + Math.sin(time) * 0.3),
        canvas.height
      );
      
      gradient.addColorStop(0, "#fffaf8");
      gradient.addColorStop(0.5, `rgba(255, ${Math.floor(115 + Math.cos(time) * 20)}, ${Math.floor(26 + Math.cos(time) * 10)}, 0.08)`);
      gradient.addColorStop(1, "#fff8f5");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating shapes
      for (let i = 0; i < 4; i++) {
        const x = canvas.width * (0.2 + i * 0.2) + Math.sin(time * 0.8 + i) * 40;
        const y = canvas.height * (0.25 + i * 0.15) + Math.cos(time * 0.6 + i) * 25;
        const radius = 80 + Math.sin(time + i * 0.5) * 15;
        
        const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        circleGradient.addColorStop(0, "rgba(255, 115, 26, 0.06)");
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

export default function SignUpPage() {
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

        <div className="max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight">
              Empieza a{" "}
              <span className="gradient-text">automatizar</span>{" "}
              tu contenido
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Crea tu cuenta y configura tu primer flujo en minutos.
            </p>
          </div>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li
                key={benefit}
                className="animate-slide-in-left flex items-center gap-3 text-muted-foreground"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="size-4 text-primary" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
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
                Crear cuenta
              </h1>
              <p className="text-sm text-muted-foreground">
                Regístrate para acceder al panel
              </p>
            </div>

            <SignUp
              routing="hash"
              forceRedirectUrl="/dashboard"
              signInUrl="/login"
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
                {"Ya tienes cuenta? "}
                <Link
                  href="/login"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Iniciar sesión
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
