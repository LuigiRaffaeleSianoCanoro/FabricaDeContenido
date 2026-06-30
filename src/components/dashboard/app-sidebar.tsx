"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Film,
  Repeat,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { X } from "lucide-react";

import { OrgSwitcher } from "@/components/dashboard/org-switcher";
import { publicEnv } from "@/config/public-env";
import type { OrgWithRole } from "@/lib/auth/active-org";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/studio", label: "Studio", icon: Film },
  { href: "/dashboard/automation", label: "Automatización", icon: Repeat },
  { href: "/dashboard/jobs", label: "Trabajos", icon: Briefcase },
  { href: "/dashboard/calendar", label: "Calendario", icon: Calendar },
  { href: "/dashboard/content", label: "Contenido", icon: FileText },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
] as const;

const adminNavItem = {
  href: "/dashboard/admin",
  label: "Admin",
  icon: Shield,
} as const;

export function AppSidebar({
  email,
  organizations,
  activeOrganizationId,
  isPlatformAdmin = false,
  open = false,
  onClose,
}: {
  email: string;
  organizations: OrgWithRole[];
  activeOrganizationId: string | null;
  isPlatformAdmin?: boolean;
  /** Controls the slide-in drawer on mobile. Ignored on `lg+` (always shown). */
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const navItems = isPlatformAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <aside
      className={cn(
        "glass-dark fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 max-w-[85vw] shrink-0 flex-col overflow-hidden transition-transform duration-300 ease-out",
        "lg:static lg:z-auto lg:h-full lg:w-64 lg:max-w-none lg:translate-x-0 lg:transition-none",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Glow effect */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-40 rounded-full bg-primary/20 blur-3xl" />

      {/* Logo */}
      <div className="relative z-10 flex h-16 items-center gap-3 px-5">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="animate-pulse-glow flex size-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-sidebar-foreground">
            Fábrica
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="ml-auto flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative z-10 border-b border-sidebar-border/40 px-3 py-2">
        <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
          Workspace
        </p>
        <OrgSwitcher organizations={organizations} activeOrganizationId={activeOrganizationId} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              {isActive && (
                <div className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "size-4.5 shrink-0 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="size-4 text-primary opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="relative z-10 border-t border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 px-3 py-2.5">
          {publicEnv.clerkPublishableKey ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9 ring-2 ring-primary/20",
                },
              }}
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold uppercase text-primary ring-2 ring-primary/20">
              {email.charAt(0) || "?"}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {email.split("@")[0]}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
