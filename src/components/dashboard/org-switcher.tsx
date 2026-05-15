"use client";

import { setActiveOrganization } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import type { OrgWithRole } from "@/lib/auth/active-org";

export function OrgSwitcher(props: {
  organizations: OrgWithRole[];
  activeOrganizationId: string | null;
}) {
  if (props.organizations.length <= 1) {
    return props.organizations[0] ? (
      <p className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {props.organizations[0].name}
      </p>
    ) : null;
  }

  return (
    <form action={setActiveOrganization} className="flex gap-1">
      <select
        name="organizationId"
        defaultValue={props.activeOrganizationId ?? props.organizations[0]?.organizationId}
        className="max-w-[140px] flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-950"
      >
        {props.organizations.map((o) => (
          <option key={o.organizationId} value={o.organizationId}>
            {o.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="secondary" className="h-8 px-2 text-xs">
        OK
      </Button>
    </form>
  );
}
