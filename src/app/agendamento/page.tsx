import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { isDemoMode } from "@/config/business";
import { serviceRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Agendar serviço",
  description: "Escolha o serviço, informe os detalhes e solicite seu atendimento com a MK Design.",
};

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ servico?: string }> }) {
  const [{ servico }, services, categories] = await Promise.all([
    searchParams,
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
        <div className="container-mk max-w-3xl ml-0 md:mx-auto">
          <BookingWizard services={services} categories={categories} initialSlug={servico} demo={isDemoMode} />
        </div>
      </PageBody>
    </>
  );
}
