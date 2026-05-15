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
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
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
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="size-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight text-sidebar-foreground">
          Fábrica
        </span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <UserButton
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
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
