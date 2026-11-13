import Link from "next/link";
import { ArrowRight, Tv } from "lucide-react";
import { Button } from "@/components/ui";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";
import { SectionHeading } from "@/components/shared/section-heading";
import { routes } from "@/config/routes";
import { hero } from "@/content/home";

/**
 * Painel visual provisório inspirado na moldura aberta do logo.
 * TODO: substituir por fotografia real de TV sendo instalada (guia §11) quando disponível.
 */
function FrameArt() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[4/3] w-full max-w-md">
      <span className="absolute left-0 top-0 h-3/4 w-3/4 border-l-[14px] border-t-[14px] border-brand-primary" />
      <span className="absolute bottom-0 right-0 h-3/4 w-3/4 border-b-[14px] border-r-[14px] border-brand-primary" />
      <div className="absolute inset-[12%] grid place-items-center rounded-card bg-brand-ink">
        <Tv className="size-20 text-brand-primary" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="container-mk grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
      <div className="flex flex-col gap-6">
        <SectionHeading as="h1" id="hero-title" eyebrow={hero.eyebrow} title={hero.title} />
        <p className="max-w-xl text-lg text-text-secondary">{hero.text}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={routes.booking}>
              {hero.primaryCta}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <WhatsAppCTA>{hero.secondaryCta}</WhatsAppCTA>
        </div>
        <p className="text-sm text-text-secondary">{hero.microcopy}</p>
      </div>
      <FrameArt />
    </section>
  );
}
