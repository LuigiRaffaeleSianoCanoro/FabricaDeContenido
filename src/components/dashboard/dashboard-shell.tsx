"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Sparkles } from "lucide-react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import type { OrgWithRole } from "@/lib/auth/active-org";
import { cn } from "@/lib/utils";

export function DashboardShell({
  email,
  organizations,
  activeOrganizationId,
  isPlatformAdmin = false,
  children,
}: {
  email: string;
  organizations: OrgWithRole[];
  activeOrganizationId: string | null;
  isPlatformAdmin?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Backdrop (mobile only) — fades in sync with the sidebar slide. */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden
        onClick={() => setOpen(false)}
      />

      <AppSidebar
        email={email}
        organizations={organizations}
        activeOrganizationId={activeOrganizationId}
        isPlatformAdmin={isPlatformAdmin}
        open={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar with hamburger trigger */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="flex size-10 items-center justify-center rounded-lg border border-border/60 text-foreground/80 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Menu className="size-5" />
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-3.5 text-primary-foreground" />
            </span>
            <span className="font-bold tracking-tight">Fábrica</span>
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
