import { FAQAccordion } from "@/components/shared/faq-accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { faq } from "@/content/home";

export function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className="mk-stack bg-brand-ink py-16 text-surface md:py-28">
      <div className="container-mk flex flex-col gap-12 md:gap-16">
        <SectionHeading
          align="center"
          tone="dark"
          id="faq-title"
          eyebrow="FAQ"
          title={faq.title}
          emphasis={faq.emphasis}
          className="[&_h2]:text-[clamp(2.25rem,1.4rem+3.2vw,4rem)] [&_h2]:leading-[1.02] [&_h2]:tracking-[-0.03em]"
        />
        <FAQAccordion items={faq.items} />
      </div>
    </section>
  );
}
