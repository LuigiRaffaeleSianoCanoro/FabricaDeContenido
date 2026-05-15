import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fafafa] text-neutral-950">
      {/* Fluorescent fields */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 15% 0%, rgba(255, 77, 0, 0.35) 0%, transparent 55%), radial-gradient(ellipse 90% 60% at 100% 20%, rgba(255, 120, 0, 0.28) 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255, 59, 0, 0.15) 0%, transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] rotate-12 animate-pulse rounded-[2.5rem] border-4 border-[#FF4D00] bg-white/80 shadow-[0_0_60px_rgba(255,77,0,0.45)] motion-reduce:animate-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-32 h-[280px] w-[200px] -rotate-6 rounded-3xl border-4 border-neutral-950 bg-[#FF4D00] shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <span className="text-sm font-black uppercase tracking-[0.35em] text-neutral-950">
          Fábrica
        </span>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="#producto"
            className="hidden px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#FF4D00] sm:inline"
          >
            Producto
          </Link>
          <Link
            href="#precios"
            className="hidden px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#FF4D00] sm:inline"
          >
            Precios
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "border-2 border-neutral-950 font-bold")}>
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants(),
              "border-2 border-neutral-950 bg-[#FF4D00] font-black uppercase tracking-wide text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-[#FF6A1A]",
            )}
          >
            Empezar
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-32 pt-4">
        {/* Hero — single-screen punch */}
        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-950 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF4D00] shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              Autónomo · IA multi-proveedor · Buffer
            </p>
            <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight text-neutral-950 sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              Una caja.
              <br />
              <span className="text-[#FF4D00] drop-shadow-[0_0_24px_rgba(255,77,0,0.5)]">
                Todo el feed.
              </span>
            </h1>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-neutral-600">
              Pipeline de contenido, voz, video y calendario—sin encajar en un solo proveedor de IA.
              Diseño que se siente como abrir un drop: naranja eléctrico, blanco puro, contraste total.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-14 min-w-[200px] border-2 border-neutral-950 bg-[#FF4D00] px-10 text-base font-black uppercase tracking-wide text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-[#FF6A1A]",
                )}
              >
                Crear cuenta
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-14 min-w-[200px] border-2 border-neutral-950 bg-white font-black uppercase tracking-wide shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                )}
              >
                Ir al panel
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-[2rem] border-4 border-neutral-950 bg-white p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-2xl border-4 border-neutral-950 bg-[#FF4D00]" />
              <p className="text-xs font-black uppercase tracking-widest text-[#FF4D00]">Preview</p>
              <p className="mt-4 font-mono text-sm text-neutral-500">{'// pipeline.status'}</p>
              <ul className="mt-6 space-y-4 font-black uppercase tracking-tight text-neutral-950">
                <li className="flex items-center justify-between border-b-2 border-neutral-200 pb-3">
                  <span>Hooks</span>
                  <span className="text-[#FF4D00]">Generando</span>
                </li>
                <li className="flex items-center justify-between border-b-2 border-neutral-200 pb-3">
                  <span>Video</span>
                  <span className="text-neutral-400">GH Actions</span>
                </li>
                <li className="flex items-center justify-between pb-1">
                  <span>Buffer</span>
                  <span className="text-neutral-400">Cola</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="producto" className="scroll-mt-24">
          <h2 className="max-w-2xl text-3xl font-black uppercase tracking-tight text-neutral-950 md:text-4xl">
            Todo en una sola página de producto.
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-600">
            Neon + Prisma, Clerk, Inngest, skills modulares, R2 y render opcional—ensamblado para escalar sin
            vendor lock-in en IA.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "Skills",
                d: "Hook generator hoy; registra más skills con Zod y trazas en BD.",
              },
              {
                t: "Calendario",
                d: "Programación Buffer y estados de publicación en un grid limpio.",
              },
              {
                t: "Video",
                d: "Disparo GitHub Actions y webhook de completado para cerrar el loop.",
              },
            ].map((f) => (
              <div
                key={f.t}
                className="rounded-2xl border-2 border-neutral-950 bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition hover:-translate-y-0.5"
              >
                <h3 className="text-lg font-black uppercase text-[#FF4D00]">{f.t}</h3>
                <p className="mt-3 text-sm font-medium text-neutral-600">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="precios"
          className="scroll-mt-24 rounded-[2rem] border-4 border-neutral-950 bg-[#FF4D00] p-10 text-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] md:p-14"
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/90">Precios</p>
              <h2 className="mt-4 text-4xl font-black uppercase leading-t-none tracking-tight md:text-5xl">
                Empieza free.
                <br />
                Escala cuando quieras.
              </h2>
              <p className="mt-6 max-w-md text-base font-medium text-white/90">
                Planes de producto en camino. Mientras tanto: mismo pipeline, mismos colores, sin ruido.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-14 border-2 border-neutral-950 bg-white font-black uppercase tracking-wide text-neutral-950 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-neutral-100",
                )}
              >
                Reservar acceso
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-14 border-2 border-white bg-transparent font-black uppercase tracking-wide text-white hover:bg-white/10",
                )}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t-4 border-neutral-950 bg-neutral-950 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FF4D00]">
            Fábrica de Contenido
          </p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Link href="/login" className="hover:text-[#FF4D00]">
              Login
            </Link>
            <Link href="/dashboard" className="hover:text-[#FF4D00]">
              Panel
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
