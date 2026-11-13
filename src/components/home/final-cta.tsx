import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { finalCta, hero } from "@/content/home";

/**
 * Seção final com foto de fundo (sem topo arredondado). Degradês: topo → preto (emenda com o FAQ),
 * esquerda → preto (legibilidade do texto) e base → preto (o rodapé branco sobe e cobre a base).
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative overflow-hidden bg-brand-ink pb-64 pt-24 text-surface md:pb-72 md:pt-32"
    >
      <Image
        src="/images/banners/hero-tv.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[50%_30%]"
        aria-hidden="true"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-brand-ink via-brand-ink/70 to-brand-ink/15" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-brand-ink to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-brand-ink to-transparent" />

      <div className="container-mk relative grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-6">
          <SectionHeading
            tone="dark"
            id="cta-title"
            title={finalCta.title}
            emphasis={finalCta.emphasis}
            className="[&_h2]:text-[clamp(2.25rem,1.4rem+3.6vw,4.25rem)] [&_h2]:leading-[1.02] [&_h2]:tracking-[-0.03em]"
          />
          <p className="max-w-md text-lg text-surface/90">{finalCta.text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:pt-3 [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap">
          <Button asChild>
            <Link href={routes.booking}>
              {finalCta.button}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <WhatsAppCTA variant="outlineLight">{hero.secondaryCta}</WhatsAppCTA>
        </div>
      </div>
    </section>
  );
}
