import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollProgressSection } from "@/components/shared/scroll-progress-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { finalCta, hero } from "@/content/home";

/**
 * Seção final com foto de fundo e borda superior reta. Ao entrar na tela (`--p` de 0 a 1):
 * o conteúdo desce de baixo da borda até a posição final (e ganha opacidade) e a foto faz parallax
 * (sobe devagar e reduz o zoom). Degradês: esquerda → preto (legibilidade) e base → preto (rodapé sobe).
 */
export function FinalCta() {
  return (
    <ScrollProgressSection
      aria-labelledby="cta-title"
      className="relative overflow-hidden bg-brand-ink pb-64 pt-24 text-surface [--p:1] md:pb-72 md:pt-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-24 bottom-0 will-change-transform"
        style={{ transform: "translateY(calc((1 - var(--p)) * -56px)) scale(calc(1 + (1 - var(--p)) * 0.12))" }}
      >
        <Image
          src="/images/banners/hero-tv.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-brand-ink via-brand-ink/70 to-brand-ink/15" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-brand-ink to-transparent" />

      <div
        className="container-mk relative grid items-start gap-10 will-change-transform md:grid-cols-[minmax(0,1fr)_auto]"
        style={{
          transform: "translateY(calc((1 - var(--p)) * -90px))",
          opacity: "calc(0.15 + var(--p) * 0.85)",
        }}
      >
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
    </ScrollProgressSection>
  );
}
