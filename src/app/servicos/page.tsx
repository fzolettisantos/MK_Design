import type { Metadata } from "next";
import { ServiceCatalog } from "@/components/services/service-catalog";
import { SectionHeading } from "@/components/shared/section-heading";
import { serviceRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Instalação de TVs em paredes, painéis e móveis, instalação de suportes e solicitação de reparos. Escolha o serviço e agende com a MK Design.",
};

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([
    serviceRepository.list({ onlyActive: true }),
    serviceRepository.listCategories(),
  ]);

  return (
    <section aria-labelledby="servicos-title" className="container-mk flex flex-col gap-8 py-12 md:py-16">
      <SectionHeading as="h1" id="servicos-title" eyebrow="O QUE FAZEMOS" title="Serviços" />
      <p className="max-w-2xl text-lg text-text-secondary">
        Da instalação ao reparo, conte com a MK Design. Escolha um serviço para ver os detalhes. Valores sob orçamento,
        informados na confirmação do atendimento.
      </p>
      <ServiceCatalog services={services} categories={categories} />
    </section>
  );
}
