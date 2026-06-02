"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

// Plasma Shader Background
function PlasmaBackground() {
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
        
        float n1 = snoise(pos + u_time * 0.12);
        float n2 = snoise(pos * 2.0 - u_time * 0.08);
        float noise = (n1 + n2 * 0.5) / 1.5;
        noise = noise * 0.5 + 0.5;
        
        float wave = sin(st.x * 6.0 + st.y * 3.0 + u_time * 0.5 + noise * 2.0) * 0.5 + 0.5;
        
        vec3 orange = vec3(1.0, 0.45, 0.1);
        vec3 cream = vec3(1.0, 0.96, 0.9);
        
        vec3 color = mix(cream, orange, wave * 0.25 * noise);
        
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

export default function LoginPage() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <PlasmaBackground />
      <div className="noise-overlay pointer-events-none fixed inset-0" />

      {/* Header */}
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between px-6 lg:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/90 shadow-lg transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="size-5 text-primary-foreground" fill="currentColor">
              <path d="M4 19V9l6-4v4l6-4v4l4-2.67V19H4z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground/90">
            Fabrica
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Glass card */}
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Bienvenido de vuelta
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
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
                  cardBox: "w-full shadow-none border-0 bg-transparent rounded-none",
                  card: "shadow-none border-0 bg-transparent p-0 w-full gap-6",
                  header: "hidden",
                  footer: "bg-transparent shadow-none",
                  footerAction: "justify-center",
                  socialButtonsBlockButton:
                    "rounded-xl border-border/50 bg-background/50",
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl",
                  footerActionLink: "text-primary hover:text-primary/80 font-medium",
                  formFieldInput: "rounded-xl border-border/50 bg-background/50",
                },
              }}
            />
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <p className="text-foreground/60">
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
              className="inline-flex items-center gap-2 text-foreground/50 transition-colors hover:text-foreground"
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
