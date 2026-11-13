import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmphasizedText } from "@/components/shared/emphasized-text";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { finalCta, services } from "@/content/home";

/**
 * Diagramação em duas colunas: cabeçalho (título grande + texto de apoio), cartões com imagem
 * arredondada e colunas escalonadas. Os textos vêm de `content/home.ts`.
 */
export function ServicesSection() {
  return (
    <section aria-labelledby="servicos-title" className="mk-stack bg-surface py-16 md:py-24">
      <div className="container-mk">
        <div className="grid items-start gap-6 md:grid-cols-2 md:gap-16">
          <SectionHeading
            id="servicos-title"
            eyebrow={services.eyebrow}
            title={services.title}
            emphasis={services.emphasis}
            className="[&_h2]:text-[clamp(2.25rem,1.4rem+3.2vw,4rem)] [&_h2]:leading-[1.02] [&_h2]:tracking-[-0.03em]"
          />
          <p className="max-w-xl text-lg text-brand-ink/85 md:pt-8">{services.intro}</p>
        </div>

        <ul className="mt-12 grid gap-x-10 gap-y-14 md:mt-20 md:grid-cols-2 md:pb-24">
          {services.cards.map((c) => (
            <li key={c.title} className="group relative flex flex-col gap-5 md:even:translate-y-24">
              <div className="overflow-hidden rounded-[1.5rem]">
                <Image
                  src={c.image}
                  alt={c.imageAlt}
                  width={770}
                  height={592}
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="aspect-[13/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-[1.05] tracking-[-0.02em]">
                <EmphasizedText text={c.title} emphasis={c.emphasis} />
              </h3>
              <p className="max-w-md text-brand-ink/85">{c.text}</p>
              <Link
                href={c.href}
                className="flex min-h-11 items-center gap-2 self-start font-semibold underline decoration-brand-primary decoration-4 underline-offset-4 after:absolute after:inset-0"
              >
                {c.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li className="flex flex-col justify-between gap-8 rounded-[1.5rem] bg-brand-primary p-8 text-brand-ink md:min-h-[22rem] md:translate-y-24">
            <div className="flex flex-col gap-3">
              <h3 className="text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-[1.05] tracking-[-0.02em]">
                <EmphasizedText text={finalCta.title} emphasis={finalCta.emphasis} />
              </h3>
              <p className="max-w-sm">{finalCta.text}</p>
            </div>
            <Button asChild variant="dark" className="self-start">
              <Link href={routes.booking}>
                {finalCta.button}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </li>
        </ul>
      </div>
    </section>
  );
}
