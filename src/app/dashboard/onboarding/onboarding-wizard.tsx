/* eslint-disable react-hooks/set-state-in-effect -- advance wizard steps after server actions return */
"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Paso {step} de 4 · Organización, claves, Buffer opcional y preferencias.
        </p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>1. Organización</CardTitle>
            <CardDescription>Crea tu workspace. Serás owner.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={a1} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre</Label>
                <Input id="orgName" name="orgName" required placeholder="Mi marca" />
              </div>
              {s1.error && <p className="text-sm text-red-600">{s1.error}</p>}
              <Button type="submit" className="w-full sm:w-auto">
                Continuar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && effectiveOrgId && (
        <Card>
          <CardHeader>
            <CardTitle>2. Clave de IA</CardTitle>
            <CardDescription>
              Se cifra en servidor · nunca se muestra de nuevo en claro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={a2} className="space-y-4">
              <input type="hidden" name="organizationId" value={effectiveOrgId} />
              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor</Label>
                <select
                  id="provider"
                  name="provider"
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
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
                <Input id="apiKey" name="apiKey" type="password" required autoComplete="off" />
              </div>
              {s2.error && <p className="text-sm text-red-600">{s2.error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 3 && effectiveOrgId && (
        <Card>
          <CardHeader>
            <CardTitle>3. Buffer (opcional)</CardTitle>
            <CardDescription>Token de acceso y un profile id de Buffer para publicar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={a3} className="space-y-4">
              <input type="hidden" name="organizationId" value={effectiveOrgId} />
              <div className="space-y-2">
                <Label htmlFor="bufferToken">Access token</Label>
                <Input id="bufferToken" name="bufferToken" type="password" autoComplete="off" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bufferProfileId">Profile ID (Buffer)</Label>
                <Input id="bufferProfileId" name="bufferProfileId" placeholder="5f7c..." />
              </div>
              {s3.error && <p className="text-sm text-red-600">{s3.error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Atrás
                </Button>
                <Button type="submit">Guardar y continuar</Button>
                <Button type="button" variant="ghost" onClick={() => setStep(4)}>
                  Omitir
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 4 && effectiveOrgId && (
        <Card>
          <CardHeader>
            <CardTitle>4. Preferencias de contenido</CardTitle>
            <CardDescription>Tono, audiencia y temas semilla para el pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={a4} className="space-y-4">
              <input type="hidden" name="organizationId" value={effectiveOrgId} />
              <div className="space-y-2">
                <Label htmlFor="tone">Tono</Label>
                <Input id="tone" name="tone" defaultValue="profesional pero cercano" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audiencia</Label>
                <Input id="audience" name="audience" defaultValue="Creadores y marcas en LATAM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topics">Temas (separados por coma)</Label>
                <Input id="topics" name="topics" defaultValue="producto, cultura, lanzamientos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platforms">Plataformas</Label>
                <Input id="platforms" name="platforms" defaultValue="instagram, linkedin" />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="requireApproval" defaultChecked className="rounded" />
                  Requiere aprobación humana
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="autoPost" className="rounded" />
                  Auto-publicar tras aprobar (si hay Buffer)
                </label>
              </div>
              {s4.error && <p className="text-sm text-red-600">{s4.error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  Atrás
                </Button>
                <Button type="submit">Finalizar e ir al panel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
