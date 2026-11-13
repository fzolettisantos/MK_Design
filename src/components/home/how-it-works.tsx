import { SectionHeading } from "@/components/shared/section-heading";
import { howItWorks } from "@/content/home";
import { ProcessTimeline } from "./process-timeline";

/**
 * Seção reta (sem topo arredondado). `relative` mantém a seção acima do hero fixo (StickyUnder).
 */
export function HowItWorks() {
  return (
    <section aria-labelledby="como-title" className="relative bg-surface-muted py-16 md:py-28">
      <div className="container-mk grid gap-12 md:grid-cols-2 md:gap-16">
        <SectionHeading
          id="como-title"
          eyebrow="Como funciona"
          title={howItWorks.title}
          emphasis={howItWorks.emphasis}
          className="self-start [&_h2]:text-[clamp(2.25rem,1.4rem+3.2vw,4rem)] [&_h2]:leading-[1.02] [&_h2]:tracking-[-0.03em]"
        />
        <ProcessTimeline steps={howItWorks.steps} />
      </div>
    </section>
  );
}
