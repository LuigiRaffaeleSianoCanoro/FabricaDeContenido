"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen animated WebGL background.
 *
 * Renders an aurora / mesh-gradient built from fractal Brownian motion with
 * domain warping in an orange-amber-magenta palette over a near-black base.
 * Reacts subtly to the pointer and honours `prefers-reduced-motion`.
 */
export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
      uniform vec2 u_pointer;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                            -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m; m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float total = 0.0;
        float amp = 0.55;
        for (int i = 0; i < 5; i++) {
          total += snoise(p) * amp;
          p *= 2.02;
          amp *= 0.5;
        }
        return total;
      }

      // Random hash for film grain.
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = st;
        p.x *= aspect;

        float t = u_time * 0.06;

        // Pointer influence (parallax-like drift toward the cursor).
        vec2 ptr = u_pointer;
        ptr.x *= aspect;
        vec2 toPtr = (ptr - p) * 0.12;

        // Domain warping: distort the sample coordinates with two fbm fields.
        vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
        vec2 r = vec2(
          fbm(p + 1.7 * q + vec2(1.7, 9.2) + 0.15 * t + toPtr),
          fbm(p + 1.7 * q + vec2(8.3, 2.8) - 0.12 * t + toPtr)
        );
        float f = fbm(p + 1.8 * r);

        // Dark premium palette: near-black base with vivid orange/amber streaks.
        vec3 base   = vec3(0.035, 0.020, 0.050);
        vec3 ember  = vec3(0.40, 0.07, 0.16);
        vec3 orange = vec3(1.00, 0.38, 0.06);
        vec3 amber  = vec3(1.00, 0.66, 0.22);

        // Keep most of the field dark; only the high band lights up.
        float v = clamp(f * 0.5 + 0.5, 0.0, 1.0);
        vec3 color = base;
        color = mix(color, ember, smoothstep(0.55, 0.78, v));
        color = mix(color, orange, smoothstep(0.74, 0.92, v));
        color = mix(color, amber, smoothstep(0.88, 1.02, v) * (0.6 + 0.4 * length(r)));

        // Thin glowing filaments along the warp gradient.
        float fil = smoothstep(0.70, 1.05, length(q) + 0.35 * f);
        color += orange * fil * 0.45;

        // Soft pulsing highlight tied to the pointer.
        float glow = smoothstep(0.42, 0.0, length(p - ptr));
        color += amber * glow * (0.16 + 0.06 * sin(u_time * 0.8));

        // Vignette keeps edges grounded.
        float vig = smoothstep(1.3, 0.2, length(st - 0.5));
        color *= 0.55 + 0.45 * vig;

        // Subtle animated film grain.
        float grain = hash(gl_FragCoord.xy + fract(u_time)) - 0.5;
        color += grain * 0.025;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const pointerLocation = gl.getUniformLocation(program, "u_pointer");

    const pointer = { x: 0.5, y: 0.55 };
    const target = { x: 0.5, y: 0.55 };

    function onPointerMove(e: PointerEvent) {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    }

    function resize() {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    let animationId = 0;
    const startTime = performance.now();

    function render(now: number) {
      if (!gl || !canvas) return;
      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;
      const time = reduceMotion ? 8 : (now - startTime) * 0.001;
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduceMotion) animationId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    if (reduceMotion) {
      render(startTime);
    } else {
      animationId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
