import { SectionHeading } from "@/components/shared/section-heading";
import { howItWorks } from "@/content/home";

export function HowItWorks() {
  return (
    <section aria-labelledby="como-title" className="container-mk flex flex-col gap-10 py-16 md:py-24">
      <SectionHeading id="como-title" title={howItWorks.title} />
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {howItWorks.steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-3 border-t-4 border-brand-primary pt-4">
            <span className="font-heading text-3xl font-bold" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-xl">
              <span className="sr-only">Passo {i + 1}: </span>
              {s.title}
            </h3>
            <p className="text-text-secondary">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
