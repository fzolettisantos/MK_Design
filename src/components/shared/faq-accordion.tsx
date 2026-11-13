import { Plus } from "lucide-react";

interface Item {
  q: string;
  a: string;
}

/**
 * Acordeão em duas colunas para fundo escuro, com <details>/<summary> nativos (teclado, leitor de tela, sem JS).
 * `items-start` evita que o cartão vizinho estique quando um abre.
 */
export function FAQAccordion({ items }: { items: readonly Item[] }) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      {items.map((item) => (
        <details key={item.q} className="group rounded-[1.75rem] bg-surface/10">
          <summary className="flex min-h-[5.5rem] cursor-pointer list-none items-center justify-between gap-4 rounded-[1.75rem] px-6 py-4 text-lg leading-snug marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-primary text-brand-ink"
            >
              <Plus className="size-5 transition-transform duration-200 group-open:rotate-45" />
            </span>
          </summary>
          <p className="px-6 pb-6 text-surface/85">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
