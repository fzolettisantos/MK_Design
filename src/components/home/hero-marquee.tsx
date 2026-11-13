import { CreditCard, Hammer, Tv, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type Card =
  | { kind: "photo"; size: string; pos: string; rotate: number; y: number }
  | { kind: "service"; tone: "ink" | "white"; icon: "tv" | "support" | "repair" | "pay"; label: string; rotate: number; y: number };

const PHOTO = "/images/banners/hero-tv.webp";

/**
 * Cartões inclinados que passam continuamente. Fotos = recortes da foto do banner (via CSS);
 * serviços = só categorias já existentes no catálogo. Totalmente decorativo (aria-hidden).
 */
const cards: Card[] = [
  { kind: "photo", size: "185%", pos: "38% 32%", rotate: -7, y: 56 },
  { kind: "service", tone: "ink", icon: "tv", label: "Instalação de TVs", rotate: 5, y: 8 },
  { kind: "photo", size: "330%", pos: "6% 82%", rotate: -4, y: 44 },
  { kind: "service", tone: "white", icon: "support", label: "Suportes para TV", rotate: 8, y: 0 },
  { kind: "photo", size: "300%", pos: "12% 4%", rotate: -6, y: 40 },
  { kind: "service", tone: "ink", icon: "repair", label: "Conserto de TVs", rotate: 4, y: 12 },
  { kind: "photo", size: "270%", pos: "40% 40%", rotate: -9, y: 60 },
  { kind: "service", tone: "white", icon: "pay", label: "Pix, débito e crédito", rotate: 6, y: 20 },
];

const icons = { tv: Tv, support: Hammer, repair: Wrench, pay: CreditCard } as const;

function Tile({ c }: { c: Card }) {
  const base = "mr-6 h-72 w-56 shrink-0 overflow-hidden rounded-[1.75rem] md:h-80 md:w-64";
  const style = { transform: `translateY(${c.y}px) rotate(${c.rotate}deg)` };
  if (c.kind === "photo") {
    return (
      <div
        className={cn(base, "bg-brand-ink bg-no-repeat shadow-md")}
        style={{ ...style, backgroundImage: `url(${PHOTO})`, backgroundSize: c.size, backgroundPosition: c.pos }}
      />
    );
  }
  const Icon = icons[c.icon];
  const ink = c.tone === "ink";
  return (
    <div
      className={cn(base, "flex flex-col justify-between p-6 shadow-md", ink ? "bg-brand-ink text-surface" : "bg-surface text-brand-ink")}
      style={style}
    >
      <span className={cn("grid size-14 place-items-center rounded-2xl", ink ? "bg-brand-primary text-brand-ink" : "bg-brand-ink text-brand-primary")}>
        <Icon className="size-7" />
      </span>
      <p className="font-heading text-2xl font-semibold leading-tight">{c.label}</p>
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
