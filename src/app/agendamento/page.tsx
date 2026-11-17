import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { serviceRepository } from "@/lib/repositories";
import { isSchedulingConfigured } from "@/lib/scheduling/service";

export const metadata: Metadata = {
  title: "Agendar serviço",
  description: "Escolha o serviço, o dia e a hora e solicite seu atendimento com a MK Design.",
  alternates: { canonical: "/agendamento" },
};

/** Página estática: os horários são buscados no servidor quando o cliente chega ao calendário (sempre atuais). */
export default async function BookingPage() {
  const [services, categories] = await Promise.all([serviceRepository.list({ onlyActive: true }), serviceRepository.listCategories()]);
  return (
    <>
      <PageHero id="agendar-title" eyebrow="AGENDAMENTO" title="Agendar serviço">
        <p className="max-w-2xl text-lg text-surface/85">Escolha o serviço, o dia e a hora. A equipe confirma pelo WhatsApp.</p>
      </PageHero>
      <PageBody>
        <div className="container-mk min-h-[50rem] max-w-3xl ml-0 md:mx-auto">
          <BookingFlow services={services} categories={categories} real={isSchedulingConfigured()} />
        </div>
      </PageBody>
    </>
  );
}
