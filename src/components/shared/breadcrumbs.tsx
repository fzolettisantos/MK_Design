import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  items: { label: string; href?: string }[];
  /** "dark" para fundos brand-ink. */
  tone?: "light" | "dark";
}

export function Breadcrumbs({ items, tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <nav aria-label="Você está em">
      <ol className={cn("flex flex-wrap items-center gap-1 text-sm", dark ? "text-surface/75" : "text-text-secondary")}>
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-4" aria-hidden="true" />}
            {it.href ? (
              <Link
                href={it.href}
                className={cn(
                  "flex min-h-11 items-center underline underline-offset-2",
                  dark ? "hover:text-surface" : "hover:text-brand-ink",
                )}
              >
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className={cn("font-semibold", dark ? "text-surface" : "text-brand-ink")}>
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
