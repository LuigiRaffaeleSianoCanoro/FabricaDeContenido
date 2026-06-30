"use client";

import { useActionState } from "react";

import { type PipelineRunActionState, requestPipelineRun } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

const initialState: PipelineRunActionState = {};

type Props = {
  organizationId: string;
};

export function GenerateHooksForm({ organizationId }: Props) {
  const [state, action, pending] = useActionState(requestPipelineRun, initialState);

  return (
    <div className="space-y-3">
      <form action={action} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="organizationId" value={organizationId} />
        <Button
          type="submit"
          disabled={pending}
          className="orange-glow bg-primary font-semibold text-primary-foreground"
        >
          {pending ? "Iniciando…" : "Generar hooks"}
        </Button>
      </form>
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          {state.message}
        </p>
      )}
    </div>
  );
}
