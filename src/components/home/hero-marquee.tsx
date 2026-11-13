import Image from "next/image";
import { cn } from "@/lib/utils";

interface Card {
  image: string;
  label: string;
  tone: "ink" | "white";
  rotate: number;
  y: number;
}

/**
 * Cartões inclinados que passam continuamente, com ilustrações dos contextos do site
 * (instalação, suportes, conserto, agendamento, WhatsApp, pagamento). Legendas = textos já existentes.
 * Totalmente decorativo (aria-hidden); o conteúdo real está nas seções seguintes.
 * Alterna técnico em ação / ícone, e cartão escuro / claro.
 */
const cards: Card[] = [
  { image: "instalacao-parede", label: "Instalação na parede", tone: "ink", rotate: -7, y: 48 },
  { image: "agenda", label: "Agende pelo site", tone: "white", rotate: 5, y: 8 },
  { image: "conserto", label: "Conserto de TVs", tone: "ink", rotate: -4, y: 36 },
  { image: "pagamento", label: "Pix, débito e crédito", tone: "white", rotate: 8, y: 0 },
  { image: "whatsapp", label: "Atendimento via WhatsApp", tone: "ink", rotate: -6, y: 32 },
  { image: "suporte-articulado", label: "Suporte articulado", tone: "white", rotate: 4, y: 14 },
];

function Tile({ c }: { c: Card }) {
  const ink = c.tone === "ink";
  return (
    <div
      className={cn(
        "mr-6 flex w-60 shrink-0 flex-col gap-3 rounded-[1.75rem] p-3 shadow-md md:w-72",
        ink ? "bg-brand-ink text-surface" : "bg-surface text-brand-ink",
      )}
      style={{ transform: `translateY(${c.y}px) rotate(${c.rotate}deg)` }}
    >
      <Image
        src={`/images/illustrations/${c.image}.webp`}
        alt=""
        width={720}
        height={540}
        sizes="288px"
        className="aspect-[4/3] w-full rounded-[1.25rem] bg-surface object-cover"
      />
      <p className="px-2 pb-2 font-heading text-xl font-bold leading-tight md:text-2xl">{c.label}</p>
    </div>
  );
}

export function HeroMarquee() {
  // Uma "metade" precisa ser mais larga que telas grandes; o keyframe desloca -50% (uma metade).
  const half = [...cards, ...cards];
  return (
    <div aria-hidden="true" className="mk-marquee-hover overflow-hidden pb-20 pt-6">
      <div className="mk-marquee flex w-max" style={{ "--mk-marquee-time": "70s" } as React.CSSProperties}>
        {[...half, ...half].map((c, i) => (
          <Tile key={i} c={c} />
        ))}
      </div>
    </div>
  );
}
