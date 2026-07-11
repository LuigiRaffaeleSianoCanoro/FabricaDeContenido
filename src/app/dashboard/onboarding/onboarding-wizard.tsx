/* eslint-disable react-hooks/set-state-in-effect -- step sync after server actions return */
"use client";

import { useActionState, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ExternalLink,
  KeyRound,
  Link2,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  type OnboardingActionState,
  onboardingCreateOrg,
  onboardingSaveAiKey,
  onboardingSaveBuffer,
  onboardingSaveContentConfig,
} from "./actions";
import {
  AI_PROVIDER_GUIDES,
  AI_PROVIDER_ORDER,
  BUFFER_GUIDE,
  type KeyGuide,
} from "./guides";

type Props = {
  initialStep: number;
  initialOrgId: string | null;
  /** True when the org's plan includes the platform AI (BYOK is optional). */
  platformAiAvailable?: boolean;
};

const initial: OnboardingActionState = {};

const STEPS = [
  { id: 1, label: "Workspace", icon: Sparkles },
  { id: 2, label: "IA", icon: KeyRound },
  { id: 3, label: "Buffer", icon: Link2 },
  { id: 4, label: "Agente", icon: Bot },
];

const inputClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-primary/60 focus:bg-white/10";

const fieldLabel = "mb-1.5 block text-sm font-medium text-white/80";

export function OnboardingWizard({ initialStep, initialOrgId, platformAiAvailable = false }: Props) {
  const [step, setStep] = useState(initialStep);
  const [orgId, setOrgId] = useState<string | null>(initialOrgId);
  const [provider, setProvider] = useState<string>("OPENAI");

  const [s1, a1, p1] = useActionState(onboardingCreateOrg, initial);
  const [s2, a2, p2] = useActionState(onboardingSaveAiKey, initial);
  const [s3, a3, p3] = useActionState(onboardingSaveBuffer, initial);
  const [s4, a4, p4] = useActionState(onboardingSaveContentConfig, initial);

  const effectiveOrgId = orgId ?? s1.organizationId ?? initialOrgId;

  useEffect(() => {
    if (s1.ok && s1.organizationId) {
      setOrgId(s1.organizationId);
      setStep(2);
    }
  }, [s1.ok, s1.organizationId]);

  useEffect(() => {
    if (s2.ok) setStep(3);
  }, [s2.ok]);

  useEffect(() => {
    if (s3.ok) setStep(4);
  }, [s3.ok]);

  const guide = AI_PROVIDER_GUIDES[provider] ?? AI_PROVIDER_GUIDES.OPENAI;
  const pct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="relative mx-1 mb-3 flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/10" />
          <div
            className="absolute left-0 right-0 top-1/2 h-0.5 origin-left -translate-y-1/2 bg-primary transition-transform duration-500 ease-out-strong"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div
                key={s.id}
                className={cn(
                  "relative z-10 flex size-9 items-center justify-center rounded-full border transition duration-300",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-[#120a16] text-primary shadow-lg shadow-primary/30"
                      : "border-white/15 bg-[#120a16] text-white/40",
                )}
              >
                {done ? <Check className="size-4" /> : <s.icon className="size-4" />}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-0.5 text-[11px] font-medium">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={cn(
                "w-9 text-center",
                step >= s.id ? "text-white/80" : "text-white/35",
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0c0912]/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
        {step === 1 && (
          <StepShell
            icon={Sparkles}
            title="Creá tu workspace"
            subtitle="Es el espacio de tu marca. Después conectás tu IA y Buffer."
          >
            <form action={a1} className="space-y-4">
              <div>
                <label htmlFor="orgName" className={fieldLabel}>
                  Nombre del workspace
                </label>
                <input
                  id="orgName"
                  name="orgName"
                  required
                  placeholder="Mi marca"
                  className={inputClass}
                />
              </div>
              <ErrorText error={s1.error} />
              <PrimaryButton pending={p1}>
                Continuar
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </form>
          </StepShell>
        )}

        {step === 2 && effectiveOrgId && (
          <StepShell
            icon={KeyRound}
            title="Conectá tu IA"
            subtitle="Elegí tu proveedor y traé tu propia API key. Se guarda cifrada (AES-256)."
          >
            {platformAiAvailable && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <p className="text-sm text-white/80">
                  Tu plan incluye la <strong>IA de la plataforma</strong>: podés saltar este paso y
                  generar contenido con nuestros créditos, sin traer tu key.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                  Usar IA de la plataforma
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AI_PROVIDER_ORDER.map((id) => {
                const g = AI_PROVIDER_GUIDES[id];
                const selected = provider === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setProvider(id)}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/15 text-white"
                        : "border-white/12 bg-white/5 text-white/65 hover:border-white/25 hover:text-white",
                    )}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>

            <GuidePanel guide={guide} />

            <form action={a2} className="mt-5 space-y-4">
              <input type="hidden" name="organizationId" value={effectiveOrgId} />
              <input type="hidden" name="provider" value={provider} />
              {provider === "CUSTOM" && (
                <>
                  <div>
                    <label htmlFor="customLabel" className={fieldLabel}>
                      Nombre del servicio
                    </label>
                    <input
                      id="customLabel"
                      name="customLabel"
                      required
                      placeholder="Cerebras, Fireworks, mi proxy…"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="customBaseUrl" className={fieldLabel}>
                      URL base (compatible con OpenAI)
                    </label>
                    <input
                      id="customBaseUrl"
                      name="customBaseUrl"
                      required
                      type="url"
                      placeholder="https://api.miproveedor.com/v1"
                      className={cn(inputClass, "font-mono")}
                    />
                  </div>
                  <div>
                    <label htmlFor="customModel" className={fieldLabel}>
                      Modelo por defecto <span className="font-normal text-white/40">(opcional)</span>
                    </label>
                    <input
                      id="customModel"
                      name="customModel"
                      placeholder="llama-3.3-70b"
                      className={cn(inputClass, "font-mono")}
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="apiKey" className={fieldLabel}>
                  API key{provider === "CUSTOM" ? "" : ` de ${guide.label}`}
                </label>
                <input
                  id="apiKey"
                  name="apiKey"
                  type="password"
                  required
                  autoComplete="off"
                  placeholder={guide.keyPrefix ? `${guide.keyPrefix}…` : "Pegá tu API key"}
                  className={cn(inputClass, "font-mono")}
                />
              </div>
              <ErrorText error={s2.error} />
              <div className="flex gap-2">
                <BackButton onClick={() => setStep(1)} />
                <PrimaryButton pending={p2}>
                  Continuar
                  <ArrowRight className="size-4" />
                </PrimaryButton>
              </div>
            </form>
          </StepShell>
        )}

        {step === 3 && effectiveOrgId && (
          <StepShell
            icon={Link2}
            title="Conectá Buffer"
            subtitle="Publicamos por vos en tus redes a través de Buffer. Es obligatorio para automatizar."
          >
            <GuidePanel guide={BUFFER_GUIDE} />

            <form action={a3} className="mt-5 space-y-4">
              <input type="hidden" name="organizationId" value={effectiveOrgId} />
              <div>
                <label htmlFor="bufferToken" className={fieldLabel}>
                  API key de Buffer
                </label>
                <input
                  id="bufferToken"
                  name="bufferToken"
                  type="password"
                  required
                  autoComplete="off"
                  placeholder="Pegá tu API key de Buffer"
                  className={cn(inputClass, "font-mono")}
                />
              </div>
              <ErrorText error={s3.error} />
              <div className="flex gap-2">
                <BackButton onClick={() => setStep(2)} />
                <PrimaryButton pending={p3}>
                  Continuar
                  <ArrowRight className="size-4" />
                </PrimaryButton>
              </div>
            </form>
          </StepShell>
        )}

        {step === 4 && effectiveOrgId && (
          <StepShell
            icon={Wand2}
            title="Armá tu agente"
            subtitle="Con esto definimos los skills: tono, audiencia y temas de tu contenido."
          >
            <form action={a4} className="space-y-4">
              <input type="hidden" name="organizationId" value={effectiveOrgId} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="tone" className={fieldLabel}>
                    Tono
                  </label>
                  <input id="tone" name="tone" defaultValue="profesional pero cercano" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="audience" className={fieldLabel}>
                    Audiencia
                  </label>
                  <input id="audience" name="audience" defaultValue="Creadores y marcas en LATAM" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="topics" className={fieldLabel}>
                    Temas (separados por coma)
                  </label>
                  <input id="topics" name="topics" defaultValue="producto, cultura, lanzamientos" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="platforms" className={fieldLabel}>
                    Plataformas
                  </label>
                  <input id="platforms" name="platforms" defaultValue="instagram, linkedin" className={inputClass} />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" name="requireApproval" defaultChecked className="size-4 accent-[oklch(0.7_0.2_45)]" />
                  Requiere aprobación
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" name="autoPost" className="size-4 accent-[oklch(0.7_0.2_45)]" />
                  Auto-publicar en Buffer
                </label>
              </div>
              <ErrorText error={s4.error} />
              <div className="flex gap-2">
                <BackButton onClick={() => setStep(3)} />
                <PrimaryButton pending={p4}>
                  Finalizar y entrar
                  <ArrowRight className="size-4" />
                </PrimaryButton>
              </div>
            </form>
          </StepShell>
        )}
      </div>
    </div>
  );
}

function StepShell({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-scale-in">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function GuidePanel({ guide }: { guide: KeyGuide }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
          Cómo conseguir tu key
        </span>
        {guide.id !== "CUSTOM" && (
          <a
            href={guide.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/25"
          >
            {guide.urlLabel}
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <ol className="space-y-2">
        {guide.steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-white/75">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
              {i + 1}
            </span>
            <span className="leading-snug">{s}</span>
          </li>
        ))}
      </ol>
      {guide.note && (
        <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50">{guide.note}</p>
      )}
    </div>
  );
}

function PrimaryButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white/80 transition hover:bg-white/10"
    >
      <ArrowLeft className="size-4" />
      Atrás
    </button>
  );
}

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-rose-300">
      {error}
    </p>
  );
}
