import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Bot,
  CalendarClock,
  ClipboardList,
  KeyRound,
  Link2,
  Play,
  Share2,
  ShieldCheck,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";

import { ShaderBackground } from "@/components/landing/shader-background";
import { Reveal } from "@/components/landing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: ClipboardList,
    title: "Respondé el cuestionario",
    body: "Contanos tu marca, tu tono, tu audiencia y las redes donde querés crecer. Sin configuraciones técnicas.",
  },
  {
    icon: Wand2,
    title: "Armamos tus skills",
    body: "Con tus respuestas generamos los skills del agente: guiones, imágenes y voz en off listos para tu estilo.",
  },
  {
    icon: Link2,
    title: "Conectá tu Buffer",
    body: "Te damos las instrucciones para vincular tu cuenta de Buffer y sincronizar todos tus canales en un clic.",
  },
  {
    icon: Bot,
    title: "Nosotros somos el trigger",
    body: "Activás el autopiloto y tu agente crea y agenda videos promocionales de forma recurrente, solo.",
  },
];

const features = [
  {
    icon: KeyRound,
    title: "Tu propia API key",
    body: "Trae la IA que quieras —OpenAI, Anthropic, Gemini u OpenRouter—. Tus claves se guardan cifradas (AES-256).",
  },
  {
    icon: Video,
    title: "Video con hyperframes",
    body: "Slideshows animados con HyperFrames (open source): generá el guion aquí y renderizá localmente o en el servidor, sin API key de video.",
  },
  {
    icon: AudioLines,
    title: "Voz en off gratuita",
    body: "Locución automática por slide con voces naturales, sincronizada a la duración real de cada escena.",
  },
  {
    icon: CalendarClock,
    title: "Agenda inteligente",
    body: "Definí horarios y frecuencia una vez. El cron del autopiloto publica en cada slot sin repetir.",
  },
  {
    icon: Share2,
    title: "Multi-red vía Buffer",
    body: "Publicá en todas tus redes conectando una sola cuenta de Buffer. Sincronización de canales incluida.",
  },
  {
    icon: ShieldCheck,
    title: "Privado por diseño",
    body: "Multi-tenant, claves cifradas por workspace y auditoría. Tu contenido y tus secretos son solo tuyos.",
  },
];

const channels = [
  "Instagram",
  "TikTok",
  "YouTube",
  "LinkedIn",
  "Facebook",
  "X",
  "Threads",
  "Pinterest",
];

export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden bg-[#08060e] text-white">
      {/* Always-on vivid animated aurora (visible even without WebGL) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="aurora-base absolute inset-0" />
        <div className="absolute right-[-12rem] top-1/4 size-[40rem] animate-blob rounded-full bg-amber-500/25 blur-[140px] [animation-delay:-6s]" />
        <div className="absolute bottom-[-16rem] left-1/2 size-[42rem] animate-blob rounded-full bg-orange-600/25 blur-[150px] [animation-delay:-10s]" />
        <div className="absolute -bottom-10 right-0 size-[34rem] animate-blob rounded-full bg-rose-600/20 blur-[140px]" />
      </div>

      {/* WebGL shader on top of the CSS fallback. Opaque when WebGL is
          available; transparent (revealing the aurora) when it is not. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <ShaderBackground className="h-full w-full" />
      </div>

      {/* Glows that read over the dark shader, plus grid, grain and scrims */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute right-[-12rem] top-1/4 size-[40rem] animate-blob rounded-full bg-amber-500/20 blur-[150px] [animation-delay:-6s]" />
        <div className="absolute bottom-[-16rem] left-1/2 size-[42rem] animate-blob rounded-full bg-orange-600/20 blur-[150px] [animation-delay:-10s]" />
        <div className="grid-backdrop absolute inset-0" />
        <div className="noise-overlay absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08060e]/70 via-[#08060e]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08060e]/40 via-transparent to-[#08060e]/80" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="mx-auto mt-4 flex w-[min(72rem,92%)] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="size-5 text-primary-foreground" fill="currentColor">
                <path d="M4 19V9l6-4v4l6-4v4l4-2.67V19H4z" />
              </svg>
            </span>
            <span className="text-base font-bold tracking-tight">Fábrica</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-white">
              Cómo funciona
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Características
            </a>
            <a href="#autopiloto" className="transition-colors hover:text-white">
              Autopiloto
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
              )}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "shimmer relative overflow-hidden rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
              )}
            >
              Empezar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto grid w-[min(72rem,92%)] grid-cols-1 items-center gap-12 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <Reveal from="left">
            <div className="flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
                <Sparkles className="size-3.5 text-primary" />
                Tu fábrica de contenido en autopiloto
              </span>

              <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
                Videos que se{" "}
                <span className="gradient-text-animated">publican solos</span>
                , con tu propia IA.
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-lg text-white/65">
                Respondé un cuestionario, conectá tu cuenta de Buffer y dejá que tu
                agente cree y agende videos promocionales para tus redes —de forma
                recurrente y automática.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "shimmer group relative overflow-hidden rounded-2xl bg-primary px-8 py-6 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105"
                  )}
                >
                  Empezar gratis
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#como-funciona"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-2xl border-white/20 bg-white/5 px-7 py-6 text-base font-semibold text-white backdrop-blur hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Play className="size-4" />
                  Ver cómo funciona
                </a>
              </div>

              <p className="mt-6 font-mono text-xs tracking-wider text-white/40">
                Sin tarjeta de crédito · Trae tu propia API key · Cancelás cuando quieras
              </p>
            </div>
          </Reveal>

          <Reveal from="right" delay={120}>
            <HeroPreview />
          </Reveal>
        </section>

        {/* Channels marquee */}
        <section className="relative border-y border-white/10 bg-white/[0.03] py-6 backdrop-blur-sm">
          <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Publicá en todas tus redes
          </p>
          <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...channels, ...channels].map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="mx-8 text-lg font-semibold tracking-tight text-white/55"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="mx-auto w-[min(72rem,92%)] py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              De cero a piloto automático en{" "}
              <span className="gradient-text-animated">4 pasos</span>
            </h2>
            <p className="mt-4 text-lg text-white/60">
              La página es simple a propósito: vos respondés, nosotros armamos el
              agente y disparamos el contenido.
            </p>
          </Reveal>

          <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal as="li" from="up" delay={i * 110} key={step.title}>
                <div className="glass-panel group relative h-full overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1.5">
                  <span className="absolute right-5 top-4 font-mono text-5xl font-bold text-white/5 transition-colors group-hover:text-primary/20">
                    0{i + 1}
                  </span>
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    <step.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-[min(72rem,92%)] py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Todo lo que necesita tu{" "}
              <span className="gradient-text-animated">agente de contenido</span>
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Una plataforma BYOK: vos ponés las llaves, nosotros la orquestación.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal from="scale" delay={(i % 3) * 90} key={feature.title}>
                <div className="glass-panel group h-full rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-amber-400/10 text-primary ring-1 ring-white/10 transition-transform group-hover:scale-110">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Autopilot CTA */}
        <section id="autopiloto" className="mx-auto w-[min(72rem,92%)] py-20">
          <Reveal from="scale">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary/25 via-white/5 to-transparent p-10 text-center backdrop-blur-xl sm:p-16">
              <div className="pointer-events-none absolute left-1/2 top-0 size-[28rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent,oklch(0.75_0.2_50/0.35),transparent)] blur-2xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/85">
                  <Bot className="size-3.5 text-primary" />
                  Encendé el autopiloto
                </span>
                <h2 className="mx-auto mt-6 max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                  Configurá una vez. Publicá para siempre.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/65">
                  Tu marca produciendo videos promocionales todos los días, sin que
                  vuelvas a tocar nada.
                </p>
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "shimmer group relative mt-9 inline-flex overflow-hidden rounded-2xl bg-primary px-9 py-6 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105"
                  )}
                >
                  Crear mi fábrica
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="mx-auto w-[min(72rem,92%)] border-t border-white/10 py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <svg viewBox="0 0 24 24" className="size-4 text-primary-foreground" fill="currentColor">
                  <path d="M4 19V9l6-4v4l6-4v4l4-2.67V19H4z" />
                </svg>
              </span>
              <span className="font-mono text-xs tracking-widest text-white/50">
                FÁBRICA DE CONTENIDO
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <Link href="/login" className="transition-colors hover:text-white">
                Iniciar sesión
              </Link>
              <Link href="/sign-up" className="transition-colors hover:text-white">
                Crear cuenta
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/** Floating product mock shown in the hero. */
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-bob">
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-primary/30 blur-3xl" />
      <div className="glass-panel rounded-[1.75rem] p-5 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-rose-400/70" />
            <span className="size-3 rounded-full bg-amber-400/70" />
            <span className="size-3 rounded-full bg-emerald-400/70" />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Autopiloto activo
          </span>
        </div>

        {/* Video preview */}
        <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/40 via-rose-500/20 to-amber-400/30">
          <div className="absolute inset-0 grid-backdrop opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
              <Play className="size-6 translate-x-0.5" fill="currentColor" />
            </span>
          </div>
          <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] text-white/80 backdrop-blur">
            slideshow_promo.mp4
          </span>
          <span className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur">
            9:16 · 0:18
          </span>
        </div>

        {/* Schedule rows */}
        <div className="mt-4 space-y-2.5">
          {[
            { label: "Hoy · 09:00", net: "Instagram", tone: "bg-rose-400/70" },
            { label: "Hoy · 14:30", net: "TikTok", tone: "bg-sky-400/70" },
            { label: "Mañana · 11:00", net: "LinkedIn", tone: "bg-amber-400/70" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("size-2 rounded-full", row.tone)} />
                <span className="text-sm text-white/80">{row.net}</span>
              </div>
              <span className="font-mono text-xs text-white/45">{row.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/15 px-3 py-2.5 ring-1 ring-primary/25">
          <span className="text-sm font-medium text-white/85">Próxima generación</span>
          <span className="font-mono text-xs text-primary">en 12 min</span>
        </div>
      </div>
    </div>
  );
}
