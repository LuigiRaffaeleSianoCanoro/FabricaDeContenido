"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Intense WebGL Shader with flowing orange plasma effect
function PlasmaShader() {
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
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        vec2 pos = st * 3.0;
        
        // Multiple layers of flowing noise
        float n1 = snoise(pos + u_time * 0.15);
        float n2 = snoise(pos * 2.0 - u_time * 0.1);
        float n3 = snoise(pos * 0.5 + vec2(u_time * 0.08, -u_time * 0.05));
        
        // Combine noise layers
        float noise = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
        noise = noise * 0.5 + 0.5;
        
        // Flowing wave patterns
        float wave1 = sin(st.x * 8.0 + st.y * 4.0 + u_time * 0.8 + noise * 3.0) * 0.5 + 0.5;
        float wave2 = sin(st.y * 6.0 - st.x * 3.0 + u_time * 0.6 + noise * 2.0) * 0.5 + 0.5;
        float wave3 = sin((st.x + st.y) * 5.0 + u_time * 1.0) * 0.5 + 0.5;
        
        // Fluorescent orange palette - more intense
        vec3 orange1 = vec3(1.0, 0.35, 0.0);    // Deep fluorescent orange
        vec3 orange2 = vec3(1.0, 0.55, 0.1);    // Bright orange
        vec3 orange3 = vec3(1.0, 0.7, 0.3);     // Light orange
        vec3 white = vec3(1.0, 0.98, 0.95);     // Warm white
        vec3 cream = vec3(1.0, 0.95, 0.88);     // Cream
        
        // Create dynamic color mixing
        vec3 color = mix(cream, orange3, wave1 * 0.4);
        color = mix(color, orange2, wave2 * 0.35 * noise);
        color = mix(color, orange1, wave3 * 0.2 * (1.0 - noise));
        color = mix(color, white, (1.0 - noise) * 0.3);
        
        // Add pulsing bright spots
        float pulse = sin(u_time * 2.0) * 0.5 + 0.5;
        float spot = smoothstep(0.7, 1.0, noise) * pulse;
        color = mix(color, orange1, spot * 0.4);
        
        // Radial gradient from center
        float dist = length(st - vec2(0.5));
        color = mix(color, orange2, smoothstep(0.8, 0.0, dist) * 0.15);
        
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

// Animated Factory Worker SVG
function AnimatedFactoryWorker() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute size-40 animate-pulse rounded-full bg-primary/20 blur-3xl sm:size-56 md:size-72" />
      
      {/* Rotating ring */}
      <div className="absolute size-36 animate-[spin_8s_linear_infinite] rounded-full border-2 border-dashed border-primary/40 sm:size-48 md:size-64" />
      
      {/* Inner rotating ring opposite direction */}
      <div className="absolute size-28 animate-[spin_6s_linear_infinite_reverse] rounded-full border border-primary/30 sm:size-40 md:size-52" />
      
      {/* Main icon container */}
      <div className="relative z-10 flex size-24 items-center justify-center rounded-3xl bg-primary shadow-2xl sm:size-32 md:size-40">
        <svg
          viewBox="0 0 64 64"
          className="size-14 animate-[bounce_2s_ease-in-out_infinite] text-primary-foreground sm:size-20 md:size-24"
          fill="currentColor"
        >
          {/* Factory building */}
          <path d="M8 56V28l12-8v8l12-8v8l12-8v36H8z" opacity="0.9" />
          {/* Smokestacks */}
          <rect x="12" y="20" width="4" height="12" rx="1" />
          <rect x="24" y="16" width="4" height="16" rx="1" />
          <rect x="36" y="12" width="4" height="20" rx="1" />
          {/* Smoke puffs - animated via CSS */}
          <circle cx="14" cy="14" r="3" className="animate-[float_2s_ease-in-out_infinite]" opacity="0.6" />
          <circle cx="26" cy="10" r="4" className="animate-[float_2.5s_ease-in-out_infinite_0.3s]" opacity="0.5" />
          <circle cx="38" cy="6" r="3" className="animate-[float_2s_ease-in-out_infinite_0.6s]" opacity="0.7" />
          {/* Worker silhouette */}
          <circle cx="52" cy="38" r="5" />
          <path d="M48 44h8v12h-8z" rx="1" />
          {/* Gear/cog */}
          <g className="origin-center animate-[spin_4s_linear_infinite]" style={{ transformOrigin: "52px 52px" }}>
            <circle cx="52" cy="52" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="52" cy="52" r="2" />
            <path d="M52 44v4M52 56v4M44 52h4M56 52h4M46.3 46.3l2.8 2.8M54.9 54.9l2.8 2.8M46.3 57.7l2.8-2.8M54.9 49.1l2.8-2.8" stroke="currentColor" strokeWidth="2" />
          </g>
        </svg>
      </div>
      
      {/* Floating particles */}
      <div className="absolute -top-4 left-0 size-3 animate-[float_3s_ease-in-out_infinite] rounded-full bg-primary/60" />
      <div className="absolute -right-2 top-8 size-2 animate-[float_2.5s_ease-in-out_infinite_0.5s] rounded-full bg-primary/50" />
      <div className="absolute -bottom-2 right-4 size-4 animate-[float_3.5s_ease-in-out_infinite_1s] rounded-full bg-primary/40" />
      <div className="absolute -left-4 bottom-8 size-2 animate-[float_2s_ease-in-out_infinite_0.8s] rounded-full bg-primary/70" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <PlasmaShader />
      
      {/* Noise overlay for texture */}
      <div className="noise-overlay pointer-events-none fixed inset-0" />

      {/* Minimal Header */}
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between px-6 lg:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/90 shadow-lg transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="size-5 text-primary-foreground" fill="currentColor">
              <path d="M4 19V9l6-4v4l6-4v4l4-2.67V19H4z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground/90">
            Fábrica
          </span>
        </Link>
        
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "font-medium text-foreground/70 hover:text-foreground"
          )}
        >
          Entrar
        </Link>
      </header>

      {/* Main Content - Centered, minimal */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 lg:flex-row lg:gap-20 lg:px-12">
        
        {/* Left: Animated Logo */}
        <div className="order-2 lg:order-1">
          <AnimatedFactoryWorker />
        </div>

        {/* Right: Minimal Copy */}
        <div className="order-1 flex max-w-lg flex-col items-center text-center lg:order-2 lg:items-start lg:text-left">
          
          {/* Problem Statement */}
          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-foreground/80">{"?Cansado de "}</span>
            <span className="gradient-text">generar contenido</span>
            <span className="text-foreground/80">?</span>
          </h1>

          {/* CTA */}
          <p className="mt-6 text-lg font-medium text-foreground/60 sm:text-xl lg:mt-8">
            Registrate y sacate este problema de encima.
          </p>

          {/* CTA Button */}
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              "orange-glow mt-8 gap-3 rounded-2xl bg-primary px-10 py-7 text-lg font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/90 lg:mt-10"
            )}
          >
            Empezar ahora
            <ArrowRight className="size-5" />
          </Link>

          {/* Subtle trust indicator */}
          <p className="mt-6 font-mono text-xs tracking-wider text-foreground/40">
            Sin tarjeta de credito requerida
          </p>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 flex h-12 shrink-0 items-center justify-center px-6">
        <p className="font-mono text-xs tracking-widest text-foreground/30">
          HECHO CON IA
        </p>
      </footer>
    </div>
  );
}
