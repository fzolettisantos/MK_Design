import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { StickyUnder } from "@/components/shared/sticky-under";
import { faq } from "@/content/home";
import { faqLd, JsonLd } from "@/lib/seo/json-ld";
import { HowItWorks } from "@/components/home/how-it-works";
import { Payments } from "@/components/home/payments";
import { ServicesSection } from "@/components/home/services-section";

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqLd(faq.items)} />
      <StickyUnder>
        <Hero />
      </StickyUnder>
      <ServicesSection />
      <HowItWorks />
      <Payments />
      <FaqSection />
      <FinalCta />
    </>
  );
}
