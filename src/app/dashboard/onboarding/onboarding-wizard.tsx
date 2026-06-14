/* eslint-disable react-hooks/set-state-in-effect -- step sync after server actions return */
"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  type OnboardingActionState,
  onboardingCreateOrg,
  onboardingSaveAiKey,
  onboardingSaveBuffer,
  onboardingSaveContentConfig,
} from "./actions";

type Props = {
  initialStep: number;
  initialOrgId: string | null;
};

const initial: OnboardingActionState = {};

export function OnboardingWizard({ initialStep, initialOrgId }: Props) {
  const [step, setStep] = useState(initialStep);
  const [orgId, setOrgId] = useState<string | null>(initialOrgId);

  const [s1, a1] = useActionState(onboardingCreateOrg, initial);
  const [s2, a2] = useActionState(onboardingSaveAiKey, initial);
  const [s3, a3] = useActionState(onboardingSaveBuffer, initial);
  const [s4, a4] = useActionState(onboardingSaveContentConfig, initial);

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

  return (
    <div className="glass animate-scale-in rounded-2xl p-6">
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Paso {step} de 4 · Organización, IA, Buffer opcional, preferencias
      </p>

      {step === 1 && (
        <form action={a1} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nombre del workspace</Label>
            <Input id="orgName" name="orgName" required placeholder="Mi marca" className="bg-background/50" />
          </div>
          {s1.error && <p className="text-sm text-destructive">{s1.error}</p>}
          <Button type="submit" className="orange-glow bg-primary">
            Continuar
          </Button>
        </form>
      )}

      {step === 2 && effectiveOrgId && (
        <form action={a2} className="space-y-4">
          <input type="hidden" name="organizationId" value={effectiveOrgId} />
          <div className="space-y-2">
            <Label htmlFor="provider">Proveedor IA</Label>
            <select
              id="provider"
              name="provider"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
              defaultValue="OPENAI"
            >
              <option value="OPENAI">OpenAI</option>
              <option value="ANTHROPIC">Anthropic</option>
              <option value="GEMINI">Gemini</option>
              <option value="OPENROUTER">OpenRouter</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API key</Label>
            <Input id="apiKey" name="apiKey" type="password" required autoComplete="off" className="bg-background/50" />
          </div>
          {s2.error && <p className="text-sm text-destructive">{s2.error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button type="submit" className="bg-primary">
              Continuar
            </Button>
          </div>
        </form>
      )}

      {step === 3 && effectiveOrgId && (
        <form action={a3} className="space-y-4">
          <input type="hidden" name="organizationId" value={effectiveOrgId} />
          <div className="space-y-2">
            <Label htmlFor="bufferToken">Buffer API key (opcional)</Label>
            <Input id="bufferToken" name="bufferToken" type="password" autoComplete="off" placeholder="Buffer → Settings → API" className="bg-background/50" />
            <p className="text-xs text-muted-foreground">
              Tras guardar, sincroniza tus canales desde Ajustes → Canales de Buffer.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bufferProfileId">Buffer channel ID (opcional)</Label>
            <Input id="bufferProfileId" name="bufferProfileId" placeholder="opcional, o sincroniza luego" className="bg-background/50" />
          </div>
          {s3.error && <p className="text-sm text-destructive">{s3.error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button type="submit" className="bg-primary">
              Guardar y continuar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep(4)}>
              Omitir
            </Button>
          </div>
        </form>
      )}

      {step === 4 && effectiveOrgId && (
        <form action={a4} className="space-y-4">
          <input type="hidden" name="organizationId" value={effectiveOrgId} />
          <div className="space-y-2">
            <Label htmlFor="tone">Tono</Label>
            <Input id="tone" name="tone" defaultValue="profesional pero cercano" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience">Audiencia</Label>
            <Input id="audience" name="audience" defaultValue="Creadores y marcas en LATAM" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topics">Temas (coma)</Label>
            <Input id="topics" name="topics" defaultValue="producto, cultura, lanzamientos" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platforms">Plataformas</Label>
            <Input id="platforms" name="platforms" defaultValue="instagram, linkedin" className="bg-background/50" />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="requireApproval" defaultChecked className="rounded" />
              Requiere aprobación
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="autoPost" className="rounded" />
              Auto-publicar (Buffer)
            </label>
          </div>
          {s4.error && <p className="text-sm text-destructive">{s4.error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Atrás
            </Button>
            <Button type="submit" className="bg-primary">
              Finalizar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
