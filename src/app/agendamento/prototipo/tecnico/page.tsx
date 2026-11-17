import type { Metadata } from "next";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { TechnicianProto } from "@/components/booking/prototype/technician-proto";

export const metadata: Metadata = { title: "Protótipo do painel do técnico", robots: { index: false, follow: false } };

export default function TechnicianProtoPage() {
  return (
    <>
      <PageHero id="tec-title" eyebrow="PROTÓTIPO" title="Painel do técnico" />
      <PageBody>
        <div className="container-mk max-w-3xl ml-0 md:mx-auto">
          <TechnicianProto />
        </div>
      </PageBody>
    </>
  );
}
