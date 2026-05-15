"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Rocket,
  Briefcase,
  Calendar,
  FileText,
  Settings,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Rocket },
  { href: "/dashboard/jobs", label: "Trabajos", icon: Briefcase },
  { href: "/dashboard/calendar", label: "Calendario", icon: Calendar },
  { href: "/dashboard/content", label: "Contenido", icon: FileText },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
  { href: "/dashboard/admin", label: "Admin", icon: Shield },
];

export function AppSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="glass-dark relative flex h-full w-64 shrink-0 flex-col overflow-hidden">
      {/* Glow effect */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-40 rounded-full bg-primary/20 blur-3xl" />
      
      {/* Logo */}
      <div className="relative z-10 flex h-16 items-center gap-3 px-5">
        <div className="animate-pulse-glow flex size-9 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="size-4 text-primary-foreground" />
        </div>
        <span className="font-bold tracking-tight text-sidebar-foreground">
          Fábrica
        </span>
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
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9 ring-2 ring-primary/20",
              },
            }}
          />
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
