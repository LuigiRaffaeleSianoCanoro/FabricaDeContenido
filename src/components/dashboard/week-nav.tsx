import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Prev / Today / Next links for the weekly calendar, driven by a `?week=` offset. */
export function WeekNav({ weekOffset }: { weekOffset: number }) {
  const link = (offset: number) =>
    offset === 0 ? "/dashboard/calendar" : `/dashboard/calendar?week=${offset}`;

  const itemClass =
    "flex size-9 items-center justify-center rounded-lg border border-border/60 text-foreground/70 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="flex items-center gap-1.5">
      <Link href={link(weekOffset - 1)} aria-label="Semana anterior" className={itemClass}>
        <ChevronLeft className="size-4" />
      </Link>
      <Link
        href={link(0)}
        aria-current={weekOffset === 0 ? "page" : undefined}
        className="flex h-9 items-center rounded-lg border border-border/60 px-3 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary aria-[current=page]:border-primary aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
      >
        Hoy
      </Link>
      <Link href={link(weekOffset + 1)} aria-label="Semana siguiente" className={itemClass}>
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
