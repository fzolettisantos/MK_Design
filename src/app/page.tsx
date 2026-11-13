import { Alert } from "@/components/ui";
import { Benefits } from "@/components/home/benefits";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Payments } from "@/components/home/payments";
import { ServicesSection } from "@/components/home/services-section";
import { isDemoMode } from "@/config/business";

export default function HomePage() {
  return (
    <>
      {isDemoMode && (
        <div className="container-mk pt-4">
          <Alert title="Modo demonstrativo">
            Agenda e pedidos ainda não estão conectados a um banco de dados. Nenhuma disponibilidade real é exibida.
          </Alert>
        </div>
      )}
      <Hero />
      <ServicesSection />
      <HowItWorks />
      <Benefits />
      <Payments />
      <FaqSection />
      <FinalCta />
    </>
  );
}
