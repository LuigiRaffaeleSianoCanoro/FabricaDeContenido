"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Sparkles,
  Calendar,
  Video,
  Zap,
  ArrowRight,
  Play,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { icon: Sparkles, label: "IA Multi-proveedor" },
  { icon: Calendar, label: "Calendario Inteligente" },
  { icon: Video, label: "Video Generado" },
  { icon: Zap, label: "Colas Inngest" },
];

// WebGL Shader Component
function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      
      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        
        // Create animated gradient waves
        float wave1 = sin(st.x * 3.0 + u_time * 0.5) * 0.5 + 0.5;
        float wave2 = cos(st.y * 2.5 + u_time * 0.3) * 0.5 + 0.5;
        float wave3 = sin((st.x + st.y) * 2.0 + u_time * 0.4) * 0.5 + 0.5;
        
        // Nike orange colors
        vec3 orange1 = vec3(1.0, 0.45, 0.1);
        vec3 orange2 = vec3(1.0, 0.55, 0.2);
        vec3 white = vec3(1.0, 0.98, 0.96);
        
        // Mix colors based on waves
        vec3 color = mix(white, orange1, wave1 * 0.15);
        color = mix(color, orange2, wave2 * 0.1);
        color = mix(color, white, wave3 * 0.08);
        
        // Add subtle vignette
        float vignette = 1.0 - distance(st, vec2(0.5)) * 0.3;
        color *= vignette;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    let animationId: number;
    const startTime = Date.now();

    function resize() {
      if (!canvas || !gl) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function render() {
      if (!gl || !canvas) return;
      const time = (Date.now() - startTime) * 0.001;
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// Animated Logo
function AnimatedLogo() {
  return (
    <div className="relative">
      <div className="animate-pulse-glow flex size-12 items-center justify-center rounded-2xl bg-primary">
        <Sparkles className="size-6 text-primary-foreground" />
      </div>
      <div className="absolute -inset-1 -z-10 rounded-2xl bg-primary/20 blur-xl" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background">
      <ShaderBackground />
      
      {/* Noise overlay */}
      <div className="noise-overlay pointer-events-none fixed inset-0" />

      {/* Header */}
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <AnimatedLogo />
          <span className="text-lg font-bold tracking-tight">
            Fábrica de Contenido
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-foreground/80 hover:text-foreground"
            )}
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "sm" }),
              "animate-pulse-glow gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            )}
          >
            Empezar gratis
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </header>

      {/* Main Content - Single viewport, no scroll */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 lg:flex-row lg:gap-16 lg:px-10">
        {/* Left side - Hero text */}
        <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
          {/* Status badge */}
          <div className="animate-slide-in-left mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Nuevo: Video render con Remotion
          </div>

          {/* Headline */}
          <h1 className="animate-scale-in text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Automatiza tu{" "}
            <span className="gradient-text">contenido social</span>{" "}
            con IA
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-md text-pretty text-lg text-muted-foreground">
            Configura una vez. Genera hooks, crea videos y publica en todas tus
            redes. Sin estar pendiente.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "orange-glow gap-2 bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
              )}
            >
              <Play className="size-4" />
              Comenzar ahora
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-primary/30 px-8 text-base hover:bg-primary/10"
              )}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Right side - Feature cards */}
        <div className="mt-10 grid grid-cols-2 gap-3 lg:mt-0 lg:gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="glass animate-float group flex flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:scale-105 hover:bg-primary/10 lg:p-6"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground lg:size-12">
                <feature.icon className="size-5 lg:size-6" />
              </div>
              <span className="text-center text-xs font-medium lg:text-sm">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="relative z-10 flex h-14 shrink-0 items-center justify-center gap-6 border-t border-border/50 px-6 text-sm text-muted-foreground">
        <span>Next.js</span>
        <span className="size-1 rounded-full bg-primary" />
        <span>Clerk</span>
        <span className="size-1 rounded-full bg-primary" />
        <span>Neon</span>
        <span className="size-1 rounded-full bg-primary" />
        <span>Inngest</span>
      </footer>
    </div>
  );
}
