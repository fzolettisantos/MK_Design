import type { Metadata } from "next";
import { connection } from "next/server";
import { ProtoBooking } from "@/components/booking/prototype/proto-booking";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { serviceRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "Protótipo de agendamento", robots: { index: false, follow: false } };

export default async function ProtoPage({ searchParams }: { searchParams: Promise<{ convite?: string }> }) {
  await connection(); // renderiza por requisição: "agora" real (as datas dependem do dia)
  const nowIso = new Date().toISOString();
  const { convite } = await searchParams;
  const [services, categories] = await Promise.all([serviceRepository.list({ onlyActive: true }), serviceRepository.listCategories()]);
  return (
    <>
      <PageHero id="proto-title" eyebrow="PROTÓTIPO" title="Agendar serviço" />
      <PageBody>
        <div className="container-mk min-h-[50rem] max-w-3xl ml-0 md:mx-auto">
          <ProtoBooking services={services} categories={categories} nowIso={nowIso} invite={Boolean(convite)} key={convite ?? "x"} />
        </div>
      </PageBody>
    </>
  );
}
