"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory, ServiceCategoryId } from "@/types";
import { ServiceCard } from "./service-card";

type Filter = ServiceCategoryId | "todos";

/** Filtro por categoria (ServiceCategoryFilter) + grade de cards. Botões com aria-pressed; contagem anunciada. */
export function ServiceCatalog({ services, categories }: { services: Service[]; categories: ServiceCategory[] }) {
  const [filter, setFilter] = React.useState<Filter>("todos");
  const names = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const visible = filter === "todos" ? services : services.filter((s) => s.categoryId === filter);
  const options: { id: Filter; label: string }[] = [
    { id: "todos", label: "Todos" },
    ...categories.map((c) => ({ id: c.id as Filter, label: c.name })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Filtrar serviços por categoria" className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={filter === o.id}
            onClick={() => setFilter(o.id)}
            className={cn(
              "min-h-11 rounded-button border px-4 font-semibold transition-colors duration-150",
              filter === o.id
                ? "border-brand-ink bg-brand-ink text-surface"
                : "border-border bg-surface hover:bg-surface-muted",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p role="status" className="text-sm text-text-secondary">
        {visible.length} {visible.length === 1 ? "serviço encontrado" : "serviços encontrados"}
      </p>
      {visible.length === 0 ? (
        <p className="rounded-card border border-border bg-surface-muted p-6">
          Nenhum serviço disponível nesta categoria no momento.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visible.map((s) => (
            <li key={s.id}>
              <ServiceCard service={s} categoryName={names[s.categoryId] ?? ""} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
