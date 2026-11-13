import { ChevronDown } from "lucide-react";

interface Item {
  q: string;
  a: string;
}

/** Acordeão com <details>/<summary> nativos: teclado, leitor de tela e sem JS. */
export function FAQAccordion({ items }: { items: readonly Item[] }) {
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="px-5 pb-5 text-text-secondary">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
