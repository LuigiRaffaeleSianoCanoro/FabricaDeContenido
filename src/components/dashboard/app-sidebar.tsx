import Link from "next/link";

import { OrgSwitcher } from "@/components/dashboard/org-switcher";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { OrgWithRole } from "@/lib/auth/active-org";

const items = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/onboarding", label: "Onboarding" },
  { href: "/dashboard/content", label: "Contenido" },
  { href: "/dashboard/calendar", label: "Calendario" },
  { href: "/dashboard/jobs", label: "Trabajos" },
  { href: "/dashboard/settings", label: "Ajustes" },
  { href: "/dashboard/admin", label: "Admin" },
];

export function AppSidebar(props: {
  email: string;
  organizations: OrgWithRole[];
  activeOrganizationId: string | null;
}) {
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 text-sm font-semibold dark:border-zinc-800">
        Fábrica
      </div>
      <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Workspace</p>
        <OrgSwitcher organizations={props.organizations} activeOrganizationId={props.activeOrganizationId} />
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-zinc-200 p-3 text-xs text-zinc-500 truncate dark:border-zinc-800">
        {props.email}
      </div>
    </aside>
  );
}
