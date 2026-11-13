import { SectionHeading } from "@/components/shared/section-heading";
import { howItWorks } from "@/content/home";

export function HowItWorks() {
  return (
    <section aria-labelledby="como-title" className="bg-surface-muted py-16 md:py-24">
      <div className="container-mk flex flex-col gap-10">
        <SectionHeading id="como-title" title={howItWorks.title} className="max-w-3xl" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {howItWorks.steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-4 rounded-card bg-surface p-6">
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full bg-brand-primary font-heading text-xl font-bold text-brand-ink"
              >
                {i + 1}
              </span>
              <h3 className="text-xl">
                <span className="sr-only">Passo {i + 1}: </span>
                {s.title}
              </h3>
              <p className="text-text-secondary">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
