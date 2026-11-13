import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";
import { EmphasizedText } from "@/components/shared/emphasized-text";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { hero, ticker } from "@/content/home";
import { HeroBlueprint } from "./hero-blueprint";
import { HeroMarquee } from "./hero-marquee";
import { MotionToggle } from "./motion-toggle";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Letreiro fino sob o menu (decorativo; o conteúdo está nas demais seções). */
function Ticker() {
  const items = [...ticker, ...ticker, ...ticker, ...ticker];
  return (
    <div aria-hidden="true" className="mx-auto mt-3 max-w-[60rem] overflow-hidden rounded-lg bg-brand-ink/10 py-1.5">
      <div className="mk-marquee flex w-max text-sm font-semibold uppercase tracking-wide" style={{ "--mk-marquee-time": "40s" } as React.CSSProperties}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {items.map((t, i) => (
              <span key={`${k}-${i}`} className="flex items-center whitespace-nowrap">
                {t}
                <span className="mx-5">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      data-motion-root
      className="relative overflow-hidden bg-brand-primary pt-[5.25rem] text-brand-ink md:pt-24"
    >
      <HeroBlueprint />
      <div className="container-mk relative">
        <Ticker />
      </div>
      <div className="container-mk relative flex flex-col items-center gap-5 pt-8 text-center md:pt-10">
        <p className="mk-rise text-sm font-semibold uppercase tracking-widest" style={d(0)}>
          {hero.eyebrow}
        </p>
        <h1
          id="hero-title"
          className="mk-rise max-w-4xl text-[clamp(2.5rem,1.3rem+5vw,5rem)] leading-[1.02] tracking-[-0.035em]"
          style={d(80)}
        >
          <EmphasizedText text={hero.title} emphasis={hero.titleEmphasis} />
        </h1>
        <p className="mk-rise max-w-2xl text-lg text-brand-ink/85" style={d(200)}>
          {hero.text}
        </p>
        <div className="mk-rise flex flex-col items-center gap-3 sm:flex-row" style={d(320)}>
          <Button asChild variant="dark">
            <Link href={routes.booking}>
              {hero.primaryCta}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <WhatsAppCTA variant="outline" className="hover:bg-brand-ink/10">
            {hero.secondaryCta}
          </WhatsAppCTA>
        </div>
        <div className="mk-rise flex flex-col items-center sm:flex-row sm:gap-2" style={d(420)}>
          <p className="text-sm text-brand-ink/80">{hero.microcopy}</p>
          <MotionToggle />
        </div>
      </div>
      <div className="mk-rise relative mt-2 pb-16 md:mt-4 md:pb-24" style={d(520)}>
        <HeroMarquee />
      </div>
    </section>
  );
}
