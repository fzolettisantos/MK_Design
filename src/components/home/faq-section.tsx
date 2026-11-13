import { FAQAccordion } from "@/components/shared/faq-accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { faq } from "@/content/home";

export function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className="mk-stack bg-surface-muted py-16 md:py-24">
      <div className="container-mk grid gap-10 lg:grid-cols-[1fr_2fr]">
        <SectionHeading id="faq-title" title={faq.title} emphasis={faq.emphasis} />
        <FAQAccordion items={faq.items} />
      </div>
    </section>
  );
}
