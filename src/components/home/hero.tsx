import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArcLine } from "@/components/shared/arc-line";
import { ChevronBadge } from "@/components/shared/chevron-badge";
import { CurveDivider } from "@/components/shared/curve-divider";
import { TvArt } from "@/components/shared/tv-art";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { hero } from "@/content/home";

function Title() {
  const [accent, ...rest] = hero.title.startsWith(hero.titleAccent)
    ? [hero.titleAccent, hero.title.slice(hero.titleAccent.length)]
    : ["", hero.title];
  return (
    <h1 id="hero-title" className="text-surface">
      {accent && <span className="text-brand-primary">{accent}</span>}
      {rest.join("")}
    </h1>
  );
}

export function Hero() {
  return (
    <>
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-brand-ink text-surface">
        <div className="container-mk relative grid items-center gap-10 pb-10 pt-12 md:grid-cols-2 md:pb-16 md:pt-20">
          <div className="flex flex-col gap-6">
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-surface/75">
              <span aria-hidden="true" className="h-1 w-8 rounded-full bg-brand-primary" />
              {hero.eyebrow}
            </p>
            <Title />
            <div className="flex items-start gap-4 text-surface/85">
              <ChevronBadge className="text-brand-primary" />
              <p className="max-w-md text-lg">{hero.text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href={routes.booking}>
                  {hero.primaryCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <WhatsAppCTA variant="outlineLight">{hero.secondaryCta}</WhatsAppCTA>
            </div>
            <p className="text-sm text-surface/75">{hero.microcopy}</p>
          </div>

          {/* Ilustração provisória; trocar por foto real de instalação */}
          <div aria-hidden="true" className="relative mx-auto aspect-[5/4] w-full max-w-xl">
            <ArcLine className="absolute -left-4 -top-4 size-2/3 text-brand-primary/70" />
            <div className="absolute -right-[8%] top-0 aspect-square h-full rounded-full bg-brand-primary" />
            <TvArt className="relative size-full -rotate-3 drop-shadow-[0_24px_32px_rgb(0_0_0/0.45)]" />
          </div>
        </div>
      </section>
      <CurveDivider from="ink" to="surface" />
    </>
  );
}
