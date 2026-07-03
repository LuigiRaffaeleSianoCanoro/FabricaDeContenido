"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { requestPlanUpgrade, type UpgradeActionState } from "./actions";

const initial: UpgradeActionState = {};

export function UpgradeForm({
  organizationId,
  targetPlan,
  label,
}: {
  organizationId: string;
  targetPlan: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(requestPlanUpgrade, initial);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="targetPlan" value={targetPlan} />
      <Button type="submit" disabled={pending} className="w-full bg-primary">
        {pending ? <Loader2 className="size-4 animate-spin" /> : label}
      </Button>
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
          {state.message}
        </p>
      )}
    </form>
  );
}
