import type { Metadata } from "next";
import { ServiceCatalog } from "@/components/services/service-catalog";
import { PageBody, PageHero } from "@/components/shared/page-hero";
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
    <>
      <PageHero id="servicos-title" eyebrow="O QUE FAZEMOS" title="Serviços">
        <p className="max-w-2xl text-lg text-surface/85">
          Da instalação ao reparo, conte com a MK Design. Escolha um serviço para ver os detalhes. Valores sob
          orçamento, informados na confirmação do atendimento.
        </p>
      </PageHero>
      <PageBody>
        <div className="container-mk">
          <ServiceCatalog services={services} categories={categories} />
        </div>
      </PageBody>
    </>
  );
}
