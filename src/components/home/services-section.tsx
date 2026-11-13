import Link from "next/link";
import { ArrowRight, Hammer, Tv, Wrench } from "lucide-react";
import { Button, Card, CardDescription, CardTitle } from "@/components/ui";
import { SectionHeading } from "@/components/shared/section-heading";
import { services } from "@/content/home";

const icons = { tv: Tv, support: Hammer, repair: Wrench } as const;

export function ServicesSection() {
  return (
    <section aria-labelledby="servicos-title" className="py-12 md:py-20">
      <div className="container-mk flex flex-col gap-10">
        <SectionHeading id="servicos-title" eyebrow={services.eyebrow} title={services.title} className="max-w-3xl" />
        <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
          {services.cards.map((c) => {
            const Icon = icons[c.icon];
            return (
              <li key={c.title}>
                <Card className="relative flex h-full flex-col gap-4 border-brand-ink bg-brand-ink p-7 text-surface">
                  <span className="grid size-14 place-items-center rounded-2xl bg-brand-primary text-brand-ink">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-2xl">{c.title}</CardTitle>
                  <CardDescription className="text-base text-surface/80">{c.text}</CardDescription>
                  <Button asChild size="sm" className="mt-auto self-start">
                    <Link href={c.href} className="after:absolute after:inset-0">
                      {c.cta}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
