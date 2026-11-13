import Link from "next/link";
import { ArrowRight, Hammer, Tv, Wrench } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui";
import { SectionHeading } from "@/components/shared/section-heading";
import { services } from "@/content/home";

const icons = { tv: Tv, support: Hammer, repair: Wrench } as const;

export function ServicesSection() {
  return (
    <section aria-labelledby="servicos-title" className="bg-surface-muted py-16 md:py-24">
      <div className="container-mk flex flex-col gap-10">
        <SectionHeading id="servicos-title" eyebrow={services.eyebrow} title={services.title} />
        <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
          {services.cards.map((c) => {
            const Icon = icons[c.icon];
            return (
              <li key={c.title}>
                <Card className="flex h-full flex-col gap-4">
                  <span className="grid size-12 place-items-center rounded-card bg-brand-ink text-brand-primary">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <CardTitle>{c.title}</CardTitle>
                  <CardDescription className="text-base">{c.text}</CardDescription>
                  <Link
                    href={c.href}
                    className="mt-auto flex min-h-11 items-center gap-2 font-semibold underline decoration-brand-primary decoration-4 underline-offset-4 hover:decoration-brand-primary-hover"
                  >
                    {c.cta}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
