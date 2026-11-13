import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Chat, Payments, TvArticulated, TvCeiling, TvPedestal, TvRepair, TvWall } from "./line-art";

interface Card {
  art: ComponentType;
  label: string;
  tone: "ink" | "white";
  rotate: number;
  y: number;
}

/**
 * Cartões inclinados que passam continuamente, com ilustrações em traço dos contextos do site
 * (instalação, suportes, conserto, agendamento, WhatsApp, pagamento). Legendas = textos já existentes.
 * Totalmente decorativo (aria-hidden); o conteúdo real está nas seções seguintes.
 */
const cards: Card[] = [
  { art: TvWall, label: "Instalação na parede", tone: "ink", rotate: -7, y: 52 },
  { art: TvArticulated, label: "Suporte articulado", tone: "white", rotate: 5, y: 8 },
  { art: TvRepair, label: "Conserto de TVs", tone: "ink", rotate: -4, y: 40 },
  { art: Calendar, label: "Agende pelo site", tone: "white", rotate: 8, y: 0 },
  { art: TvCeiling, label: "Suporte de teto", tone: "ink", rotate: -6, y: 36 },
  { art: Chat, label: "Atendimento via WhatsApp", tone: "white", rotate: 4, y: 12 },
  { art: TvPedestal, label: "Suporte pedestal", tone: "ink", rotate: -9, y: 56 },
  { art: Payments, label: "Pix, débito e crédito", tone: "white", rotate: 6, y: 20 },
];

function Tile({ c }: { c: Card }) {
  const Art = c.art;
  const ink = c.tone === "ink";
  return (
    <div
      className={cn(
        "mr-6 flex h-72 w-56 shrink-0 flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 shadow-md md:h-80 md:w-64",
        ink ? "bg-brand-ink text-surface" : "bg-surface text-brand-ink",
      )}
      style={
        {
          transform: `translateY(${c.y}px) rotate(${c.rotate}deg)`,
          "--art-accent": ink ? "var(--mk-brand-primary)" : "var(--mk-brand-ink)",
          "--art-bg": ink ? "var(--mk-brand-ink)" : "var(--mk-surface)",
        } as React.CSSProperties
      }
    >
      <div className="relative mt-2">
        {!ink && <span className="absolute left-1/2 top-1/2 size-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary" />}
        <div className="relative">
          <Art />
        </div>
      </div>
      <p className="font-heading text-xl font-bold leading-tight md:text-2xl">{c.label}</p>
    </div>
  );
}

export function HeroMarquee() {
  return (
    <div aria-hidden="true" className="mk-marquee-hover overflow-hidden pb-4 pt-6">
      <div className="mk-marquee flex w-max" style={{ "--mk-marquee-time": "55s" } as React.CSSProperties}>
        {[...cards, ...cards].map((c, i) => (
          <Tile key={i} c={c} />
        ))}
      </div>
    </div>
  );
}
