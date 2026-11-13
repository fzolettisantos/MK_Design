import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Você está em">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-text-secondary">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-4" aria-hidden="true" />}
            {it.href ? (
              <Link href={it.href} className="flex min-h-11 items-center underline underline-offset-2 hover:text-brand-ink">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-brand-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
