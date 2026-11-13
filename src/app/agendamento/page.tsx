import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingClient } from "@/components/booking/booking-client";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { isDemoMode } from "@/config/business";
import { serviceRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Agendar serviço",
  description: "Escolha o serviço, informe os detalhes e solicite seu atendimento com a MK Design.",
  alternates: { canonical: "/agendamento" },
};

export default async function BookingPage() {
  const [services, categories] = await Promise.all([
    serviceRepository.list({ onlyActive: true }),
    serviceRepository.listCategories(),
  ]);
  return (
    <>
      <PageHero id="agendar-title" eyebrow="AGENDAMENTO" title="Agendar serviço">
        <p className="max-w-2xl text-lg text-surface/85">
          Escolha o serviço, informe os detalhes e selecione a data. A equipe confirma a disponibilidade.
        </p>
      </PageHero>
      <PageBody>
        <div className="container-mk min-h-[60rem] max-w-3xl ml-0 md:mx-auto">
          <Suspense fallback={<p className="text-text-secondary">Carregando formulário…</p>}>
            <BookingClient services={services} categories={categories} demo={isDemoMode} />
          </Suspense>
        </div>
      </PageBody>
    </>
  );
}
