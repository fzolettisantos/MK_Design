import { ChevronDown } from "lucide-react";

interface Item {
  q: string;
  a: string;
}

/** Acordeão com <details>/<summary> nativos: teclado, leitor de tela e sem JS. */
export function FAQAccordion({ items }: { items: readonly Item[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.q} className="group rounded-card bg-surface open:shadow-sm">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-primary transition-transform duration-200 group-open:rotate-180">
              <ChevronDown className="size-5" aria-hidden="true" />
            </span>
          </summary>
          <p className="px-6 pb-6 text-text-secondary">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
