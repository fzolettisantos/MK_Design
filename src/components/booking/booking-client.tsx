"use client";

import { useSearchParams } from "next/navigation";
import type { Service, ServiceCategory } from "@/types";
import { BookingWizard } from "./booking-wizard";

/** Lê `?servico=` no navegador, para a página poder ser estática (resposta imediata da CDN). */
export function BookingClient({ services, categories, demo }: { services: Service[]; categories: ServiceCategory[]; demo: boolean }) {
  const initialSlug = useSearchParams().get("servico") ?? undefined;
  return <BookingWizard key={initialSlug ?? "none"} services={services} categories={categories} initialSlug={initialSlug} demo={demo} />;
}
