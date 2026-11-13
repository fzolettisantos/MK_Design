"use client";

import * as React from "react";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import type { Service, ServiceCategory } from "@/types";
import { ServiceCatalog, type Filter } from "./service-catalog";

/**
 * Cabeçalho + filtro + grade. O filtro vive aqui porque o fundo do cabeçalho muda com a categoria
 * selecionada (usa `heroImage` da categoria; sem imagem, fica o preto liso).
 */
export function ServicesExplorer({ services, categories }: { services: Service[]; categories: ServiceCategory[] }) {
  const [filter, setFilter] = React.useState<Filter>("todos");
  const image = categories.find((c) => c.id === filter)?.heroImage;

  return (
    <>
      <PageHero id="servicos-title" eyebrow="O QUE FAZEMOS" title="Serviços" image={image}>
        <p className="max-w-2xl text-lg text-surface/85">
          Da instalação ao reparo, conte com a MK Design. Escolha um serviço para ver os detalhes. Valores sob
          orçamento, informados na confirmação do atendimento.
        </p>
      </PageHero>
      <PageBody>
        <div className="container-mk">
          <ServiceCatalog services={services} categories={categories} filter={filter} onFilterChange={setFilter} />
        </div>
      </PageBody>
    </>
  );
}
