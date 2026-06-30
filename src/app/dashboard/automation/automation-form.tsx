"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_VOICE, EDGE_VOICES } from "@/lib/tts/voices";
import { formatScheduleForDisplay } from "@/lib/publishing/schedule";

import {
  type AutomationActionState,
  saveAutomationSettings,
} from "./actions";

type AutomationInitialValues = {
  prompt: string;
  postingSchedule: unknown;
  timezone: string;
  imageSource: string;
  slideCount: number;
  aspectRatio: string;
  voiceName: string | null;
  voiceover: boolean;
  requireApproval: boolean;
  autoPost: boolean;
  isAutopilotActive: boolean;
};

type Props = {
  organizationId: string;
  initial: AutomationInitialValues;
};

const initialState: AutomationActionState = {};

export function AutomationForm({ organizationId, initial }: Props) {
  const [state, action, pending] = useActionState(saveAutomationSettings, initialState);

  return (
    <form action={action} className="glass animate-scale-in space-y-4 rounded-2xl p-6">
      <input type="hidden" name="organizationId" value={organizationId} />

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt maestro</Label>
        <textarea
          id="prompt"
          name="prompt"
          rows={4}
          defaultValue={initial.prompt}
          placeholder="Describe el contenido recurrente que quieres generar automáticamente."
          className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Si lo dejas vacío, se usarán tus temas (`topics`) de la configuración.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="schedule">Horarios (UTC, coma)</Label>
          <Input
            id="schedule"
            name="schedule"
            defaultValue={formatScheduleForDisplay(initial.postingSchedule)}
            placeholder="09:00, 18:30"
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona horaria (referencia)</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={initial.timezone}
            placeholder="America/Bogota"
            className="bg-background/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="imageSource">Imágenes</Label>
          <select
            id="imageSource"
            name="imageSource"
            defaultValue={initial.imageSource}
            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
          >
            <option value="none">Gradientes</option>
            <option value="pexels">Stock Pexels</option>
            <option value="ai">IA (OpenAI)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="slideCount">Slides</Label>
          <Input
            id="slideCount"
            name="slideCount"
            type="number"
            min={2}
            max={10}
            defaultValue={initial.slideCount}
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aspectRatio">Formato</Label>
          <select
            id="aspectRatio"
            name="aspectRatio"
            defaultValue={initial.aspectRatio}
            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
          >
            <option value="9:16">9:16</option>
            <option value="4:5">4:5</option>
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="voiceName">Voz (Edge TTS)</Label>
        <select
          id="voiceName"
          name="voiceName"
          defaultValue={initial.voiceName ?? DEFAULT_VOICE}
          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
        >
          {EDGE_VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="voiceover" defaultChecked={initial.voiceover} className="rounded" />
          Voz en off
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="requireApproval"
            defaultChecked={initial.requireApproval}
            className="rounded"
          />
          Requiere aprobación
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="autoPost" defaultChecked={initial.autoPost} className="rounded" />
          Auto-publicar (Buffer)
        </label>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="isAutopilotActive"
            defaultChecked={initial.isAutopilotActive}
            className="rounded"
          />
          Activar autopiloto (genera contenido en cada horario, automáticamente)
        </label>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && state.message && <p className="text-sm text-primary">{state.message}</p>}

      <Button type="submit" disabled={pending} className="orange-glow bg-primary">
        {pending ? "Guardando..." : "Guardar automatización"}
      </Button>
    </form>
  );
}
