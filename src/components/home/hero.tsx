import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, MessageCircle } from "lucide-react";
import { ArcLine } from "@/components/shared/arc-line";
import { ChevronBadge } from "@/components/shared/chevron-badge";
import { CurveDivider } from "@/components/shared/curve-divider";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { hero } from "@/content/home";

/** Atalhos de confiança — só fatos já definidos no guia (agendamento, WhatsApp, pagamento). */
const chips = [
  { icon: CalendarDays, label: "Agende pelo site" },
  { icon: MessageCircle, label: "Atendimento via WhatsApp" },
  { icon: CreditCard, label: "Pix, débito e crédito" },
] as const;

function Title() {
  const hasAccent = hero.title.startsWith(hero.titleAccent);
  return (
    <h1 id="hero-title" className="mk-rise text-surface" style={{ "--d": "80ms" } as React.CSSProperties}>
      {hasAccent ? (
        <>
          <span className="text-brand-primary">{hero.titleAccent}</span>
          {hero.title.slice(hero.titleAccent.length)}
        </>
      ) : (
        hero.title
      )}
    </h1>
  );
}

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function Hero() {
  return (
    <>
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-brand-ink text-surface">
        <div className="container-mk relative grid items-center gap-10 pb-10 pt-10 md:grid-cols-[1.05fr_1fr] md:pb-16 md:pt-16">
          <div className="flex flex-col gap-6">
            <p className="mk-rise flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-surface/75" style={d(0)}>
              <span aria-hidden="true" className="h-1 w-8 rounded-full bg-brand-primary" />
              {hero.eyebrow}
            </p>
            <Title />
            <div className="mk-rise flex items-start gap-4 text-surface/85" style={d(220)}>
              <ChevronBadge className="text-brand-primary" />
              <p className="max-w-md text-lg">{hero.text}</p>
            </div>
            <div className="mk-rise flex flex-col gap-3 sm:flex-row" style={d(340)}>
              <Button asChild>
                <Link href={routes.booking}>
                  {hero.primaryCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <WhatsAppCTA variant="outlineLight">{hero.secondaryCta}</WhatsAppCTA>
            </div>
            <ul className="mk-rise flex flex-wrap gap-2" style={d(460)}>
              {chips.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-brand-primary px-4 text-sm font-semibold"
                >
                  <Icon className="size-5 text-brand-primary" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mk-rise text-sm text-surface/75" style={d(560)}>
              {hero.microcopy}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl md:max-w-none">
            {/* Formas decorativas atrás da foto (nunca atrás de texto) */}
            <div
              aria-hidden="true"
              className="mk-float absolute -right-6 -top-6 size-40 rounded-full bg-brand-primary md:-right-10 md:-top-10 md:size-56"
            />
            <ArcLine animate className="absolute -bottom-6 -left-6 size-40 rotate-180 text-brand-primary md:-bottom-10 md:-left-10 md:size-56" />
            <div className="mk-photo-in relative aspect-[4/3] overflow-hidden rounded-modal md:aspect-[4/5]">
              <Image
                src="/images/banners/hero-tv.webp"
                alt="TV de tela grande instalada em painel de madeira, com prateleira e iluminação de LED"
                width={770}
                height={941}
                priority
                sizes="(min-width: 768px) 45vw, 100vw"
                className="mk-zoom size-full object-cover object-[50%_35%] md:object-center"
              />
              {/* Brilho quente pulsando, evocando a luz de LED da cena */}
              <div
                aria-hidden="true"
                className="mk-glow pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgb(228_240_0/0.35),transparent_70%)]"
              />
            </div>
          </div>
        </div>
      </section>
      <CurveDivider from="ink" to="surface" />
    </>
  );
}
