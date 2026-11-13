import { Benefits } from "@/components/home/benefits";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { StickyUnder } from "@/components/shared/sticky-under";
import { HowItWorks } from "@/components/home/how-it-works";
import { Payments } from "@/components/home/payments";
import { ServicesSection } from "@/components/home/services-section";

export default function HomePage() {
  return (
    <>
      <StickyUnder>
        <Hero />
      </StickyUnder>
      <ServicesSection />
      <HowItWorks />
      <Benefits />
      <Payments />
      <FaqSection />
      <FinalCta />
    </>
  );
}
