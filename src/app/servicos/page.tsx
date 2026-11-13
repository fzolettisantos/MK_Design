import type { Metadata } from "next";
import { ServicesExplorer } from "@/components/services/services-explorer";
import { serviceRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Instalação de TVs em paredes, painéis e móveis, instalação de suportes e solicitação de reparos. Escolha o serviço e agende com a MK Design.",
  alternates: { canonical: "/servicos" },
};

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([
    serviceRepository.list({ onlyActive: true }),
    serviceRepository.listCategories(),
  ]);
  return <ServicesExplorer services={services} categories={categories} />;
}
