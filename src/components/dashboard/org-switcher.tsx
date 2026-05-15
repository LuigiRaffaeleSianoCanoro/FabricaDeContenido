"use client";

import { setActiveOrganization } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import type { OrgWithRole } from "@/lib/auth/active-org";

export function OrgSwitcher(props: {
  organizations: OrgWithRole[];
  activeOrganizationId: string | null;
}) {
  if (props.organizations.length <= 1) return null;

  return (
    <form action={setActiveOrganization} className="flex items-center gap-1.5 px-3 py-2">
      <select
        name="organizationId"
        defaultValue={props.activeOrganizationId ?? props.organizations[0]?.organizationId ?? ""}
        className="min-w-0 flex-1 rounded-lg border border-sidebar-border/50 bg-sidebar-accent/40 px-2 py-1.5 text-xs text-sidebar-foreground outline-none focus:ring-2 focus:ring-primary/40"
      >
        {props.organizations.map((o) => (
          <option key={o.organizationId} value={o.organizationId}>
            {o.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="secondary" className="h-8 shrink-0 px-2 text-xs">
        OK
      </Button>
    </form>
  );
}
